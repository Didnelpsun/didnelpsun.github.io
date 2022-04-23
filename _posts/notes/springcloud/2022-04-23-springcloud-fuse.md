---
layout: post
title: "熔断降级"
date: 2022-04-21 13:20:48 +0800
categories: notes springcloud base
tags: SpringCloud 基础 熔断 降级 Hystrix
excerpt: "熔断降级"
---

## 概念

### &emsp;服务雪崩

分布式系统面临的问题：复杂分布式体系结构中的应用程序有数十个依赖关系，每个依赖关系在某些时候将不可避免地失败。

服务雪崩：多个微服务之间调用的时候，假设微服务A调用微服务B和微服务C，微服务B和微服务C又调用其它的微服务，这就是所谓的“扇出”。如果扇出的链路上某个微服务的调用响应的间过长或不可用，对微服务A的调用就会占用越来越多的系统资源，从而导致系统崩溃，所谓的“雪崩效应”。

对于高流量的应用来说，单一的后端依赖可能会导致所有服务器上的所有资源都在几秒钟内饱和。比失败更糟糕的是，这些应用程序还可能导致服务之间的延迟增加，备份队列，线程和其他系统资源紧张，导致整个系统发生更多的级联故障。这些都表示需要对故障和延迟进行隔离和管理，以便单个依赖关系的失败，不能取消整个应用程序或系统。

通常当你发现一个模块下的某个实例失败后，这时候这个模块依然还会接收流量，然后这个有问题的模块还调用了其他的模块，这样就会发生级联故障，或者叫雪崩。所以为了解决这个问题就需要服务降级。

### &emsp;Hystrix

[Hystrix的Github](https://github.com/Netflix/Hystrix/wiki/How-To-Use)。

Hystrix是一个用于处理分布式系统的延迟和容错的开源库，在分布式系统里，许多依赖不可避免的会调用失败，比如超时、异常等，Hystrix能够保证在一个依赖出问题的情况下，不会导致整体服务失败，避免级联故障，以提高分布式系统的弹性。其主要功能是服务降级、服务熔断、实时监控。

"断路器”本身是一种开关装置，当某个服务单元发生故障之后，通过断路器的故障监控（类似熔断保险丝)，向调用方返回一个符合预期的、可处理的备选响应（Fallack），而不是长时间的等待或者抛出调用方无法处理的异常，这样就保证了服务调用方的线程不会被长时间、不必要地占用，从而避免了故障在分布式系统中的蔓延，乃至雪崩。

### &emsp;处理方式

#### &emsp;&emsp;服务降级

即fallback。当服务器忙时不让客户端等待而向客户端返回一个符合预期的、可处理的备选响应（Fallack）。

+ 程序运行异常。
+ 超时。
+ 服务熔断触发服务降级。
+ 线程池/信号量打满。

#### &emsp;&emsp;服务熔断

即break。访问量达到最大服务访问后，直接拒绝访问，并调用服务降级的方法进行返回提示。首先服务降级、然后熔断、等待可用恢复调用链路。

#### &emsp;&emsp;服务限流

即flowlimit。即控制高并发操作，对请求进行排队有序进行，对于超过服务能力的请求进行服务熔断。

&emsp;

## 实现

### &emsp;构建

#### &emsp;&emsp;搭建服务端项目

由于服务熔断与降级是服务端的处理，所以停止pay8001和pay8002的运行。复制pay8001模块为pay8005。将pay8005加入父项目中。

对于依赖只需要在原有XML上添加：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-hystrix -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
    <version>${spring.cloud.hystrix.version}</version>
</dependency>
```

YAML只需要更改端口为8005，修改instance-id为pay8005。

修改主启动类名为Pay8005Application。

为了进行测试，将PayServiceImpl的selects方法下使用`TimeUnit.SECONDS.sleep(5);`睡眠并用try/catch包裹。

运行<http://localhost:8005/pay>进行访问，此时会等待5秒再返回消息。

#### &emsp;&emsp;并发测试

可以使用[Redis事务]({% post_url notes/redis/2022-03-20-redis-affair %})中模拟并发使用过的ab来模拟。这里也可以使用[JMeter](https://jmeter.apache.org/)，Windows选择Binaries的zip格式下载并解压。

将解压位置/bin目录添加到环境变量中，然后控制台输入`jmeter`运行。

如果想改为中文界面，可以修改bin目录下jmeter.properties文件，将#language=en解除注释并改为language=zh_CN。重启更新。

可以通过[JMeter中文网](http://www.jmeter.com.cn)查看具体操作。

点击测试计划并右键添加->线程（用户）->线程组。然后修改线程数为200，即并发线程数，循环次数为100，即一共200*100=20000个请求。然后点击线程组右键添加->取样器->HTTP请求。填入服务器名称localhost，端口8005，GET请求，路径为<http://localhost:8005/pay>。点击上面的绿色三角形进行启动。

此时我们不访问有延迟的路径，而访问正常路径<http://localhost:8005/pay/1>，会发现正常的请求也会卡住。因为Tomcat的默认工作线程被占满了，没用多余的线程来分解压力和处理。

#### &emsp;&emsp;搭建客户端项目

如果客户端报错也需要进行降级处理。停止order85服务，复制order85为order86，然后把order86添加到父项目中。

原有基础上添加依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```

YAML修改端口为86。此时已经设置了Feign的readTimeout和connectTimeout为3000表示请求响应最大为3秒。此时还需要设置spring.main.allow-bean-definition-overriding=true让oder86的Feign覆盖掉order85的Feign。

修改主类名为Order86Application。启动。

访问<http://localhost:86/order/1>没问题，访问<http://localhost:86/order>会报错，因为pay8005会延迟5秒返回响应，而order86只允许在3秒内接收到响应：\[IPayService#selects\] java.net.SocketTimeoutException: Read timed out。

#### &emsp;&emsp;解决方法

+ 超时导致服务器变慢（转圈）：超时不再等待，服务降级。
+ 服务端出错（宕机或程序运行出错）：服务降级。
+ 客户端出错（故障或要求客户端等待时间小于服务端提供服务时间）：自己处理降级。

### &emsp;服务降级

#### &emsp;&emsp;服务端超时或异常

服务端提供服务要保证提供服务时间不能太长，否则客户端会一直等待，所以要设置自身调用超时时间的峰值，峰值内可以正常运行，超过时间需要有兜底的服务降级方法处理。

使用@HystrixCommond在业务层指定兜底服务降级处理的方法：

```java
// PayServiceImpl.java
package org.didnelpsun.service.impl;

import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixProperty;
import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.dao.IPayDao;
import org.didnelpsun.service.IPayService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.didnelpsun.util.Code;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class PayServiceImpl implements IPayService {
    @Value("${server.port}")
    private String port;
    private static final String timeout = "3000";
    @Resource
    private IPayDao payDao;

    @Override
    // 指定降级方法并配置超时时间
    @HystrixCommand(fallbackMethod = "handlerPay", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = PayServiceImpl.timeout)})
    public Result<Pay> select(Long id) {
        Pay result = payDao.select(id);
        log.info("查询结果:" + result);
        if (result != null) {
            return new Result<>(Code.SUCCESS, "port:" + this.port + ":success", result);
        } else {
            return new Result<>(Code.NO_CONTENT, "port:" + this.port + ":no content", null);
        }
    }

    @Override
    @HystrixCommand(fallbackMethod = "handlerList", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = PayServiceImpl.timeout)})
    public Result<List<Pay>> selects() {
        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        List<Pay> result = payDao.selects();
        log.info("查询结果:" + result);
        if (result.size() > 0) {
            return new Result<>(Code.SUCCESS, "port:" + this.port + ":success", result);
        } else {
            return new Result<>(Code.NO_CONTENT, "port:" + this.port + ":no content", result);
        }
    }

    @Override
    @HystrixCommand(fallbackMethod = "handlerInt", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = PayServiceImpl.timeout)})
    public Result<Integer> insert(Pay pay) {
        int result = payDao.insert(pay);
        log.info("添加结果:" + result);
        if (result > 0) {
            return new Result<>(Code.SUCCESS, "port:" + this.port + ":success", result);
        } else {
            return new Result<>(Code.NO_RESPONSE, "port:" + this.port + ":insert fail", result);
        }
    }

    @Override
    @HystrixCommand(fallbackMethod = "handlerInt", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = PayServiceImpl.timeout)})
    public Result<Integer> update(Pay pay) {
        int result = payDao.update(pay);
        log.info("更新结果:" + result);
        if (result > 0) {
            return new Result<>(Code.SUCCESS, "port:" + this.port + ":success", result);
        } else {
            return new Result<>(Code.NO_RESPONSE, "port:" + this.port + ":update fail", result);
        }
    }

    @Override
    @HystrixCommand(fallbackMethod = "handlerInt", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = PayServiceImpl.timeout)})
    public Result<Integer> delete(Long id) {
        Integer result = payDao.delete(id);
        log.info("删除结果:" + result);
        if (result > 0) {
            return new Result<>(Code.SUCCESS, "port:" + this.port + ":success", result);
        } else {
            return new Result<>(Code.NO_RESPONSE, "port:" + this.port + ":delete fail", result);
        }
    }

    public Result<List<Pay>> handlerList() {
        return new Result<>(Code.SERVER_ERROR, "The server is wrong, please try again later", new ArrayList<>() {
        });
    }

    public Result<Pay> handlerPay(Long id) {
        return new Result<>(Code.SERVER_ERROR, "The server is wrong, please try again later", new Pay(id, ""));
    }

    public Result<Integer> handlerInt(Pay pay) {
        return new Result<>(Code.SERVER_ERROR, "The server is wrong, please try again later", 0);
    }

    public Result<Integer> handlerInt(Long id) {
        return new Result<>(Code.SERVER_ERROR, "The server is wrong, please try again later", 0);
    }
}
```

使用此注解设置降级服务时：

+ 降级服务返回值与原服务返回值保持一致。
+ 降级服务的参数与原服务参数保持一致。
+ fallbackMethod属性查找的是参数、返回值和原服务保持一致的降级方法（一般使用此属性设置降级方法）。
+ defaultFallback属性是查找返回值和原服务一致且参数为空的降级方法。

所以对于不同的参数和返回值的服务层函数要使用不同参数的服务降级方法，否则会报错：com.netflix.hystrix.contrib.javanica.exception.FallbackDefinitionException: fallback method wasn't found: handler([class java.lang.Long])。

然后在主启动类上添加@EnableHystrix注解开启Hystrix。启动pay8005。访问<http://localhost:8005/pay>。

由于我们设置的服务端超时时间为3秒，而方法中会睡眠五秒，所以超过3秒就会返回：

```txt
{
    "code": "SERVER_ERROR",
    "message": "The server is wrong, please try again later",
    "data": []
}
```

如果服务层方法内部报错，其也会跳到handler方法中。

#### &emsp;&emsp;客户端响应限制或异常

设置自身调用超时时间的峰值，峰值内可以正常运行，超过了需要有兜底的服务降级方法处理。

虽然客户端和服务端都可以进行服务降级，但是服务降级往往是为了客户端的体验，所以服务降级一般放在客户端。

首先在YAML文件中开启Hystrix服务：`feign.hystrix.enabled:true`。

主启动类添加@EnableHystrix注解开启Hystrix。

### &emsp;服务熔断

### &emsp;服务限流
