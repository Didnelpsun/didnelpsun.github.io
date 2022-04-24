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

主要是针对Hystrix。

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

这个方案能处理服务端的请求拥塞导致超时和服务端程序异常问题。

服务端提供服务要保证自身提供服务时间不能太长，否则客户端会一直等待，所以要设置自身调用超时时间的峰值，峰值内可以正常运行，超过时间需要有兜底的服务降级方法处理，即超过指定时间还没有响应服务端将备用的返回值传给客户端。

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
        return new Result<>(Code.SERVER_ERROR, "The server cannot provide services, please try again later", new ArrayList<>() {
        });
    }

    public Result<Pay> handlerPay(Long id) {
        return new Result<>(Code.SERVER_ERROR, "The server cannot provide services, please try again later", new Pay(id, ""));
    }

    public Result<Integer> handlerInt(Pay pay) {
        return new Result<>(Code.SERVER_ERROR, "The server cannot provide services, please try again later", 0);
    }

    public Result<Integer> handlerInt(Long id) {
        return new Result<>(Code.SERVER_ERROR, "The server cannot provide services, please try again later", 0);
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
    "message": "The server cannot provide services, please try again later",
    "data": []
}
```

如果服务端方法内部报错或抛出异常，其也会跳到handler方法中。

#### &emsp;&emsp;客户端限时、异常或服务端宕机

这个方案能处理客户端的响应限时导致超时、客户端程序异常问题以及服务端宕机问题。

如果客户端设置响应时间小于服务端响应时间，则服务端还没有响应，客户端就已经报错了，这时就需要设置客户端自身调用超时时间的峰值，峰值内可以正常运行，超过了需要有兜底的服务降级方法处理。

首先在YAML文件中开启Hystrix服务：`feign.hystrix.enabled:true`，并设置超时时间：

```yaml
feign:
  client:
    config:
      default:
        readTimeout: 3000
        connectTimeout: 3000
  hystrix:
    enabled: true

hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 3000
```

开启Hystrix服务的注解会让Feign将使用断路器包装所有方法，也就是将@FeignClient标记的那个service接口IPayService下所有的方法进行了Hystrix包装（类似于在这些方法上加了一个@HystrixCommand），这些方法会给Feign客户端应用一个默认的超时时间为1s，所以客户端的service方法也有一个1s的超时时间，客户端service运行1s就会报异常，controller立马进入备用方法，客户端controller的3秒超时时间设置就没有效果了。即配置文件这里的timeoutInMilliseconds并不是覆盖注解中的设置，而是与ribbon超时时间和feign超时时间设置三者取最低值。所以必须还设置default的timeoutInMilliseconds修改Hystrix设置的默认时间。

也可以使用[配置类](https://blog.csdn.net/qq_38173650/article/details/120008186)开启Hystrix服务。

客户端由于主要的判断在控制层，所以Hystrix服务降级也放在控制层，由于我的客户端的控制层方法的参数和返回值与服务端的业务层方法的参数和返回值是一样的，所以可以直接复制过来：

```java
// OrderController.java
package org.didnelpsun.controller;

import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixProperty;
import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import org.didnelpsun.service.IPayService;
import org.didnelpsun.util.Code;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/order")
@Slf4j
public class OrderController {
    private static final String timeout = "3000";
    @Resource
    private IPayService payService;
    @Resource
    private DiscoveryClient discoveryClient;

    @GetMapping()
    @HystrixCommand(fallbackMethod = "handlerList", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = OrderController.timeout)})
    public Result<List<Pay>> selects() {
        return payService.selects();
    }

    @GetMapping("/{id}")
    @HystrixCommand(fallbackMethod = "handlerPay", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = OrderController.timeout)})
    public Result<Pay> select(@PathVariable Long id) {
        return payService.select(id);
    }

    @PostMapping()
    @HystrixCommand(fallbackMethod = "handlerInt", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = OrderController.timeout)})
    public Result<Integer> insert(Pay pay) {
        return payService.insert(pay);
    }

    @PutMapping()
    @HystrixCommand(fallbackMethod = "handlerInt", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = OrderController.timeout)})
    public Result<Integer> update(Pay pay) {
        return payService.update(pay);
    }

    @DeleteMapping("/{id}")
    @HystrixCommand(fallbackMethod = "handlerInt", commandProperties = {@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = OrderController.timeout)})
    public Result<Integer> delete(@PathVariable Long id) {
        return payService.delete(id);
    }

    // 查看已经注入的微服务名称列表
    @GetMapping("/discovery")
    public List<String> discoveries() {
        return discoveryClient.getServices();
    }

    // 根据微服务名称即ID查找所有微服务实例
    @GetMapping("/discovery/{id}")
    public List<ServiceInstance> discovery(@PathVariable String id) {
        return discoveryClient.getInstances(id);
    }

    public Result<List<Pay>> handlerList() {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the time limit or program", new ArrayList<>() {
        });
    }

    public Result<Pay> handlerPay(Long id) {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the time limit or program", new Pay(id, ""));
    }

    public Result<Integer> handlerInt(Pay pay) {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the time limit or program", 0);
    }

    public Result<Integer> handlerInt(Long id) {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the time limit or program", 0);
    }
}
```

主启动类添加@EnableHystrix注解开启Hystrix。运行，访问<http://localhost:86/order/1>没问题，访问<http://localhost:86/order>不会报错：

```txt
{
    "code": "NO_CONTENT",
    "message": "The client cannot receive services, please check the time limit or program",
    "data": []
}
```

如果此时在控制层方法里面加上`int i=1/0`，访问路径时程序并不会抛出异常，而是直接执行兜底的handler方法。包括关闭pay8005服务业会跳转。

#### &emsp;&emsp;代码膨胀

此时每个方法都需要一个服务降级方法，代码量巨大。

此时可以在类上使用@DefaultProperties(defaultFallback="服务降级方法名")来指定默认的全局服务降级方法。如果需要更明确精准的服务降级方法就在方法上添加@HystrixCommand指定精确方法。但是注意：

+ 全局服务降级方法不能传参。
+ 且全局指定时不能携带参数，即不能指定超时时间，超时默认一秒。
+ 只能处理外部异常，不能处理本身程序错误的异常，如10/0。这种异常不能在控制层中处理，只能调用接口处理，可以使用下面的代码耦合的方法。

对于当前我们的代码指定默认服务降级方法没什么用，默认访问降级方法只针对不用传递参数，不用设置超时时间的方法。

#### &emsp;&emsp;代码耦合

由于控制层代码和服务降级代码在一起，耦合度高。

此时服务降级处理在客户端order86完成，只需要为Feign客户端定义的接口IPayService的fallback参数添加一个服务降级处理的实现类。在service中新建一个impl.PayFallbackService实现接口IPayService，统一为接口里的方法进行异常处理和服务降级：

```java
// PayFallbackService.java
package org.didnelpsun.service.impl;

import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import org.didnelpsun.service.IPayService;
import org.didnelpsun.util.Code;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PayFallbackService implements IPayService {
    @Override
    public Result<Pay> select(Long id) {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the program", new Pay(id, ""));
    }

    @Override
    public Result<List<Pay>> selects() {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the program", new ArrayList<>() {
        });
    }

    @Override
    public Result<Integer> insert(Pay pay) {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the program", 0);
    }

    @Override
    public Result<Integer> update(Pay pay) {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the program", 0);
    }

    @Override
    public Result<Integer> delete(Long id) {
        return new Result<>(Code.NO_CONTENT, "The client cannot receive services, please check the program", 0);
    }
}
```

在服务接口的@FeignClient中指定fallback服务降级类是哪个，当对应业务方法错误时OpenFeign会在指定类中找到同名实现方法对异常进行处理：

```java
// IPayService.java
package org.didnelpsun.service;

import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import org.didnelpsun.service.impl.PayFallbackService;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Service
// 找ServiceId为pay的微服务
@FeignClient(value = "PAY", fallback = PayFallbackService.class)
public interface IPayService {
    String prefix = "/pay";

    // 客户端可以调用到pay模块服务的接口清单
    // @RestMapping注解表示要调用这些接口方法时Feign所自动请求的地址
    // 方法为客户端定义的服务层接口所提供的服务，没有业务逻辑，只起到根据控制层传输的参数调用路径请求服务端服务的作用
    // 之前需要通过RestTemplate来调用服务端API，此时通过OpenFeign可以直接调用服务API，由OpenFeign负责将API与参数进行封装传输到服务端，再返回数据
    @GetMapping(prefix + "/{id}")
    Result<Pay> select(@PathVariable(value = "id") Long id);

    @GetMapping(prefix)
    Result<List<Pay>> selects();

    @PostMapping(prefix)
    Result<Integer> insert(Pay pay);

    @PutMapping(prefix)
    Result<Integer> update(Pay pay);

    @DeleteMapping(prefix + "/{id}")
    Result<Integer> delete(@PathVariable(value = "id") Long id);
}
```

YAML配置开启：

```yaml
feign:
  circuitbreaker:
    enabled: true
```

最后注释掉控制层中的所有Hystrix注解。运行order86，运行或关闭服务器pay8005，访问<http://localhost:86/order>：

```txt
{
    "code": "NO_CONTENT",
    "message": "The client cannot receive services, please check the program",
    "data": []
}
```

尝试在控制层写入`int i = 1/0`看看异常处理如何，运行后发现这个会显示java.lang.ArithmeticException: / by zero异常。

所以可以看出这个@FeignClient的fallback属性只对服务端异常有用，当网络不通时返回默认的配置数据。对客户端异常无效。而@HystrixCommond对客户端和服务端都有效。

当恢复Hystrix时，处理超时问题时Hystrix比OpenFeign优先级高，处理服务器宕机问题时OpenFeign比Hystrix优先级高。

### &emsp;服务熔断

#### &emsp;&emsp;概念

服务熔断会触发服务降级。就是控制服务流量触发服务降级。熔断机制是应对雪崩效应的一种微服务链路保护机制。当扇出链路的某个微服务出错不可用或者响应时间太长时，会进行服务的降级，进而熔断该节点微服务的调用，快速返回错误的响应信息。当检测到该节点微服务调用响应正常后，恢复调用链路。

在Spring Cloud框架里，熔断机制通过Hystrix实现。Hystrix会监控微服务间调用的状况，当失败的调用到一定阈值，缺省是5秒内20次调用失败，就会启动熔断机制。熔断机制的注解也是@HystrixCommand。

熔断过程：

1. 调用失败会触发降级，而降级会调用fallback方法。
2. 但无论如何降级的流程一定会先调用正常方法再调用fallback方法。
3. 假如单位时间内调用失败次数过多，也就是降级次数过多，则触发熔断。
4. 熔断以后就会跳过正常方法直接调用fallback方法。

链路状态（熔断类型）：

+ 熔断打开Open：请求不再进行调用当前服务，内部设置时钟一般为MTTR（平均故障处理时间），当打开时长达到所设时钟则进入半熔断状态。
+ 熔断关闭Closed：熔断关闭不会对服务进行熔断也不会响应。
+ 熔断半开Half Open：部分请求根据规则调用当前展务，如果请求成功且符合规则则认为当前服务恢复正常，关闭熔断。

恢复过程：

1. 此时链路为关闭Closed状态。
2. 检测到该节点微服务调用响应正常后，将链路转为半开Half Open状态。
3. 尝试接收请求流量，如果失败调用没有达到阈值，就不断增大流量。
4. 如果失败调用达到阈值重新熔断为Closed状态，如果一直成功则一直增大流量知道恢复为打开Open状态。

涉及到断路器的三个重要参数：时间窗、请求总数阀值、错误百分比阀值：

+ 快照时间窗：断路器确定是否打开需要统计一些请求和错误数据，而统计的时间范围就是快照时间窗，默认为最近的10秒。
+ 请求总数阀值:在快照时间窗内，必须满足请求总数阀值才有资格熔断。默认为20。意味着在10秒内，如果该hystrix命令的调用次数不足20次，即使所有的请求都超时或其他原因失败，断路器都不会打开。
+ 错误百分比阀值:当请求总数在快照时间窗内超过了阀值，比如发生了30次调用，如果在这30次调用中，有15次发生了超时异常，也就是超过50%的错误百分比，在默认设定50%阀值情况下，这时候就会将断路器打开。

#### &emsp;&emsp;实现

在pay8005的业务层中进行配置服务熔断：

```java
// 指定降级方法并配置超时时间
@HystrixCommand(fallbackMethod = "handlerPay", commandProperties = {
        // 超时时间
        @HystrixProperty(name = HystrixPropertiesManager.EXECUTION_ISOLATION_THREAD_TIMEOUT_IN_MILLISECONDS, value = PayServiceImpl.timeout),
        // 是否开启断路器
        @HystrixProperty(name = HystrixPropertiesManager.CIRCUIT_BREAKER_ENABLED, value = "true"),
        // 请求次数，即一个滚动窗口中打开断路器的最少请求数
        @HystrixProperty(name = HystrixPropertiesManager.CIRCUIT_BREAKER_REQUEST_VOLUME_THRESHOLD, value = "10"),
        // 时间窗，即熔断多长时间后开始尝试恢复
        @HystrixProperty(name = HystrixPropertiesManager.CIRCUIT_BREAKER_SLEEP_WINDOW_IN_MILLISECONDS, value = "10000"),
        // 错误百分比到达多少后熔断
        @HystrixProperty(name = HystrixPropertiesManager.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE, value = "60")})
```

可以通过抛出异常告诉程序调用错误。当抛出异常到达峰值时会发生熔断，此时你请求即使是正确的程序也会认为是错误的。直到一定时间才会恢复。

开启或关闭条件：

+ 当满足一定的阀值的时候（默认10秒内超过20个请求次数）。
+ 当失败率达到一定的时候（默认10秒内超过50%的请求失败）。
+ 到达以上阀值，断路器将会开启。
+ 当开启的时候，所有请求都不会进行转发。
+ 一段时间之后（默认是5秒），这个时候断路器是半开状态，会让其中一个请求进行转发。如果成功，断路器会关闭，若失败，继续开启。

&emsp;

## 工作原理

[Hystrix工作原理](https://github.com/Netflix/Hystrix/wiki/How-it-Works)。

![[Hystrix工作流程][work]

1. 创建HystriCommand（用在依赖的服务返回单个操作结果的时候）或HystrixObserableCommand（用在依赖的服务返回多个操作结果的时候）对象。
2. 命令执行。其中HythiComand 实现了下面前两种执行方式；而HystiOosevableCommand实现了后两种执行方式：
   + `execute()`：同步执行，从依赖的服务返回一个单一的结果对象，或是在发生错误的时候抛出异常。
   + `queue()`：异步执行，直接返回一个Future对象，其中包含了服务执行结束时要返回的单一结果对象。
   + `obsever()`：返回Оbservable对象，它代表了操作的多个结果，它是一个Hot Observable。不论事件源是否有订阅者，都会在创建后对事件进行发布，所以对于Hot Obsevable的每一个订阅者都有可能是从事件源的中途开始的，并可能只是看到了整个操的局部过程。
   + `toObsevable()`：同样会返回Obsevable对象，也代表了操作的多个结果，但它返回的是一个Cold Obsevable。没有订阅者的时候并不会发布事件，而是进行等待，直到有订阅者之后才发布事件，所以对于Cold Observable的订阅者，它可以保证从一开始看到整个操作的全部过程。
3. 若当前命令的请求缓存功能是被启用的，并且该命令缓存命中，那么缓存的结果会立即以Observable对象的形式返回。
4. 检查断路器是否为打开状态。如果断路器是打开的，那么Hystrix不会执行命令，而是转接到fallback处理逻辑（第8步）；如果断路器是关闭的，检查是否有可用资源来执行命令（第5步）。
5. 检查线程池/请求队列/信号量是否占满。如果命令依赖服务的专有线程池和请求队列，或者信号量（不使用线程池的时候）已经被占满，那么Hystitx也不会执行命令，而是转接到fallback处理逻辑（第8步）。
6. Hystrix会根据我们编写的方法来决定采取什么样的方式去请求依赖服务。
   + `HystrixCommand.run()`：返回一个单一的结果，或者抛出异常。
   + `HystrixObservableCommand.construct()`：返回一个Observable对象来发射多个结果，或通过onError发送错误通知。
7. Hystrix会将"成功"、"失败"."拒绝"、"超时"等信息报告给断路嚣，而断路器会维护一组计数器来统计这些数据。断路器会使用这些统计数据来决定是否要将断路器打开，来对某个依赖服务的请求进行“熔断/短路"。
8. 当命令执行关败的时候，Hystrix会进入fallback尝试回退处理，我们通常也称该操作为“股务降级”。而能够引起服务降级处理的情况有下面几种：
   + 第4步，当前命令处于"断/愧炬洛状态，断路器是打开的时候。
   + 第5步，当前命令的线程迪、请求队列或者信号量被占满的时候。
   + 第6步，`HytixObsevableCommand.construct()`或`HystrixCommand.run()`抛出异常的时候。
9. 当Hystrix命令执行成功之后，它会将处理结果直接返回或是以Observable的形式返回。

如果我们没有为命令实现降级逻塌或者在降级处理遗塌中抛出了异常，Hystrix依然会返回一个Observable对象，但是它不会发射任何结果数据，而是通过onError方法通知命令立即中断请求、并通过onError方法将引起命令失败的异常发送给调用者。

&emsp;

## HystrixDashBoard

即Hystrix图形化监控界面。

除了隔离依赖服务的调用以外，Hystrix还提供了准实时的调用监控Hystrix Dashboard，Hystrix会持续地记录所有通过Hystrix发起的请求的执行信息，并以统计报表和图形的形式展示给用户，包括每秒执行多少请求多少成功，多少失败等。Netflix通过
hystrix-metrics-event-stream项目实现了对以上指标的监控。Spring Cloud也提供了Hystrix Dashboard的整合，对监控内容转化成可视化界面。

### &emsp;搭建

新建一个新Maven模块hystrix9001。将这个模块添加到父项目中，以及规定依赖版本。

记住依赖不能是最新的，否则会报错：Spring Boot \[2.6.6\] is not compatible with this Spring Cloud release train，Consider applying the following actions:- Change Spring Boot version to one of the following versions [2.2.x, 2.3.x] .：

添加主类org.didnelpsun.Hystrix9001Application：

如果微服务要被监控就一定要加上spring-boot-starter-actuator依赖。

然后启动，访问<http://localhost:9001/hystrix>。

[work]:
