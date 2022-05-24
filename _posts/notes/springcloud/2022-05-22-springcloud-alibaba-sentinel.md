---
layout: post
title: "熔断限流"
date: 2022-05-22 17:58:41 +0800
categories: notes springcloud alibaba
tags: SpringCloud Alibaba Sentinel 熔断 限流
excerpt: "熔断限流"
---

## 基础

### &emsp;概念

包括后台监控程序以及前台监控平台。

Sentinel分为两个部分：

+ 核心库（Java客户端）不依赖任何框架/库，能够运行于所有Java运行时环境，同时对Dubbo/Spring Cloud等框架也有较好的支持。
+ 控制台（Dashboard）基于Spring Boot开发，打包后可以直接运行，不需要额外的Tomcat等应用容器。

### &emsp;安装

[Sentinel的Github官网](https://github.com/alibaba/Sentinel)。Sentinel是单独一个组件，可以独立出来，直接界面化的细粒度统一配置。在Github上下载对应的jar包。

注意8080端口不要被占用，8080被占用可以用参数--server.port=8888。直接在下载地址运行`java -jar sentinel-dashboard-1.8.4.jar`进行启动或`java -Dserver.port=8080 -Dcsp.sentinel.dashboard.server=localhost:8080 -Dproject.name=sentinel-dashboard -jar sentinel-dashboard-1.8.4.jar`。直接在<http://localhost:8080>访问，初始用户和密码为sentinel。

&emsp;

## 监控

首先启动单机版Nacos作为注册配置中心`startup -m standalone`。

### &emsp;配置

新建一个sentinel9002模块。

#### &emsp;&emsp;XML配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springcloud</artifactId>
        <groupId>org.didnelpsun</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>sentinel9002</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>2.4.13</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <type>pom</type>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <dependency>
            <groupId>org.yaml</groupId>
            <artifactId>snakeyaml</artifactId>
        </dependency>
        <!--sentinel持久化-->
        <dependency>
            <groupId>com.alibaba.csp</groupId>
            <artifactId>sentinel-datasource-nacos</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
    </dependencies>
</project>
```

由于Sentinel依赖问题，spring-cloud-starter-alibaba-sentinel与sentinel-datasource-nacos必须匹配，否则会报错：java.lang.NoClassDefFoundError: com/alibaba/csp/sentinel/util/SpiLoader。

#### &emsp;&emsp;YAML配置

添加一个application.yaml：

```yaml
server:
  port: 9002

spring:
  application:
    name: sentinel
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    sentinel:
      transport:
        # 配置Sentinel Dashboard前端控制台地址
        dashboard: localhost:8080
        # 监控服务端口，默认为8719，如果占用就依次加一扫描
        port: 8719

management:
  endpoints:
    web:
      exposure:
        include: '*'
```

### &emsp;代码

#### &emsp;&emsp;控制层

编写一个简单的控制层org.didnelpsun.controller.SentinelController：

```java
// SentinelController.java
package org.didnelpsun.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SentinelController {
    @GetMapping("/text/{text}")
    public String getText(@PathVariable String text) {
        return text;
    }
}
```

#### &emsp;&emsp;主类

```java
// Sentinel9002Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(exclude = {GsonAutoConfiguration.class, DataSourceAutoConfiguration.class})
@EnableDiscoveryClient
public class Sentinel9002Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Sentinel9002Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

然后运行。访问<http://localhost:8080/#/dashboard>结果发现什么都没有，这是因为Sentinel使用懒加载，必须访问一次才能监控到对应的路由。访问<http://localhost:9002/text/test>然后访问控制台就能看到左边多了个sentinel(1/1)，点击就能查看控制台中的监控情况。如果第二次重启程序，会看到sentinel(0/1)，必须再次访问才能变成(1/1)。

需要注意的是访问第一次才能将链路注册到Sentinel，此时控制台的实时监控是一片空白，第一次是监控不到具体数据的，第二次开始才能监控，且有一定时差。

&emsp;

## 流控

即可以对流量控制指定规则。有两种路径，第一种是在簇点链路对应资源名列表上点击流控进行添加，第二种在流控规则点击新增流控规则进行添加。

### &emsp;基本参数

QPS即Request per senconds，每秒请求数。

+ 资源名：唯一名称，默认请求路径。
+ 针对来源：Sentinel可以针对调用者进行限流，填写微服务名，默认default（不区分来源）。
+ 阈值类型/单机阈值：
  + QPS（每秒钟的请求数量）：当调用该API的QPS达到阈值的时候，进行限流。
  + 线程数：当调用该API的线程数达到阈值的时候，进行限流。
+ 是否集群：默认不需要集群。
+ 流控模式：
  + 直接：API达到限流条件时，直接限流。
  + 关联：当关联的资源达到阈值时，就限流自己。
  + 链路：只记录指定链路上的流量（指定资源从入口资源进来的流量，如果达到阈值，就进行限流，API级别的针对来源）。
+ 流控效果：
  + 快速失败：直接失败，抛异常。
  + 预热：根据codeFactor（冷加载因子，默认3）的值，从阈值/codeFactor，经过预热时长，才达到设置的QPS阈值。
  + 排队等待:匀速排队，让请求以匀速的速度通过，阈值类型必须设置为QPS，否则无效。

### &emsp;流控模式

#### &emsp;&emsp;直接模式

直接模式是系统默认的。

为/text/{text}路径新增流控规则，默认来源为default，阈值类型为QPS，单机阈值为1，此时高级选项是流控模式和流控效果，默认为直接和快速失败，即每秒只能请求一次，如果超过就限流报错。添加后访问<http://localhost:9002/text/test>，如果访问过快会报自带的错：Blocked by Sentinel (flow limiting)。

此时如果将阈值类型由QPS换为线程数，那么有什么区别呢？此时继续访问<http://localhost:9002/text/test>，访问过快没有限流，这是为什么？因为我们自己一个人访问那么就是一个线程不断的访问，线程数为1，所以不会限流。比如流控类似银行人流量控制，线程数控制类似控制人，每个人可以有多个业务，而QPS控制类似控制业务数，如果一个人有多个业务必须重新排队。此时还会看到如果是按线程数来流控，是没有流控效果的。如果要测试线程数控制可以在控制方法中添加`TimeUnit.MILLISECONDS.sleep(5000)`进行睡眠，这样第二次访问时如果第一个线程在睡眠程序会重新给一个新线程，从而触发限流。

#### &emsp;&emsp;关联模式

即与A关联的资源B访问达到阈值后就限流A。如买房子需要房票，当很多人要去买房子，直接模式限流人流量，而关联模式限流房票售出量，由于人们没有房票也就不能买房子，从而限制了流量。即入口关联出口，出口流量超过就限制入口。

重新修改控制层：

```java
// SentinelController.java
package org.didnelpsun.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SentinelController {
    @GetMapping("/text/{text}")
    public String getText(@PathVariable String text) {
        return testText(text);
    }

    // 加工输入的字符
    @GetMapping("/test/{text}")
    public String testText(@PathVariable String text) {
        return "test " + text;
    }
}
```

重新运行。并访问/test/{text}和/text/{text}。

此时新建流控规则，资源名为/test/{text}，阈值类型为QPS，单机阈值1，流控模式为关联，关联资源即要限制的资源为/text/{text}。

之前的限流规则导致<http://localhost:9002/text/test>会访问过多被限制，而此时访问<http://localhost:9002/test/test>多次是没有流控的，但是会关联流控/text/{text}。即直接模式是自己访问多了就限制自己，而关联模式则是别人访问多了就限制自己。

然后使用Postman进行测试，在MyWorkspace下选择Collections，选择HTTP Requests，然后New Collection，然后New Request新建请求，填上请求路径为<http://localhost:9002/test/test>，然后点击Collection右边的三个点，选择Run collection表示运行请求集合，默认RUN ORDER是勾选了我们新建的这个请求，右边是请求的参数，Iterations即请求线程数，Delay即延时，分别填写100，10，表示100次访问每次间隔0.01秒访问一次。

注意此时/test/{text}是没有流控的，如果/test/{text}超过阈值将控制/text/{text}的访问。

#### &emsp;&emsp;链路模式

链路是指调用路径，假如某一个服务方法有多个调用来源，如果我们只想限制来自于某一个来源的的调用路径，就可以通过链路来限流，这个调用路径就是链路。

比如在一个微服务中，两个接口都调用了同一个Service中的方法，并且该方法用SentinelResource（用于定义资源）注解标注了，然后对该注解标注的资源（方法）进行配置，则可以选择链路模式。

将其他规则全部删掉，或者重启程序那些链路规则就会消失。

请求通过控制层的路径，再根据调用链路（进行限流），到达业务层。所以我们需要编写业务层service.SentinelService，并使用到@SentinelResource注解用来标注资源名称：

```java
// SentinelService.java
package org.didnelpsun.service;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import org.springframework.stereotype.Service;

@Service
public class SentinelService {
    @SentinelResource("service")
    public String service(){
        return "service";
    }
}
```

让控制层调用业务层：

```java
// SentinelController.java
package org.didnelpsun.controller;

import org.didnelpsun.service.SentinelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
public class SentinelController {
    @Resource
    private SentinelService service;

    @GetMapping("/text/{text}")
    public String getText(@PathVariable String text) {
        return service.service() + "-text-" + text;
    }

    // 加工输入的字符
    @GetMapping("/test/{text}")
    public String testText(@PathVariable String text) {
        return service.service() + "-test-" + text;
    }
}
```

重新运行并访问。此时控制台就可以看到簇点链路中多了个service的资源。对这个service进行链路流控，阈值类型QPS，单机阈值1，流控模式为链路，入口资源即对通过哪个路由进入这个资源进行流控，如对入口资源/text/{text}进行流控，新增添加。

这里设置表示访问service这个资源的入口资源是/text/{text}时并且QPS超过1就会触发流控。但是此时如果我们访问/text/{text}会发现实际上是不会流控的，这是因为Sentinel的CommonFilter的web-context-unify参数默认为true，表示要将调用链路收敛，会导致链路流控效果无效。我们需要在application.properties将这个参数
spring.cloud.sentinel.web-context-unify设置成false才能取消链路收敛才会生效。重启并再次添加规则。

此时多次访问<http://localhost:9002/text/test>就会报错This application has no explicit mapping for /error, so you are seeing this as a fallback，打开程序控制台发现抛出异常Servlet.service() for servlet \[dispatcherServlet\] in context with path \[\] threw exception \[Request processing failed; nested exception is java.lang.reflect.UndeclaredThrowableException\] with root cause以及com.alibaba.csp.sentinel.slots.block.flow.FlowException: null。正常访问则又恢复正常。可以看出链路流控的效果跟前面两种不太一样。

### &emsp;流控效果

即程序当流控时流量过多如何处理过载问题。流控效果中只有默认的快速失败允许使用阈值类型为线程数，其他两种都只支持QPS。

#### &emsp;&emsp;快速失败

即默认的流控处理方式。直接抛出异常。源码在com.alibaba.csp.sentinel.slots.block.flow.controller.DefaultController。

#### &emsp;&emsp;预热

源码在com.alibaba.csp.sentinel.slots.block.flow.controller.WarmUpController。

Warm up方式，即预热/冷启动方式。当系统长期处于低水位的情况下，当流呈突然增加时，直接把系统拉升到高水位可能瞬间把系统压垮。通过“冷启动”，让通过的流是缓慢增加，在一定时间内逐渐增加到阈值上限，给冷系统一个预热的时间，避免冷系统被压垮。

如单机阈值为10，预热时长为5，则程序会控制流量在5秒中最开始从每秒10÷3=3（预设的冷加载因子）条请求上升到每秒10条请求。即第一秒中如果请求了5次，阈值为3，则后两次请求会报错，在第二秒中阈值为3+(10-3)÷4≈4，则请求了5次则只会报错一次，同理到了第五秒后阈值会变成10。

如秒杀系统在开启的瞬间，会有很多流量上来，很有可能把系统冲击宕机，预热方式就是把为了保护系统，可慢慢的把流量放进来，慢慢的把阀值增长到设置的阀值。

#### &emsp;&emsp;排队等待

源码在com.alibaba.csp.sentinel.slots.block.flow.controller.RateLimiterController。

排队即让请求以均匀的速度通过，使用漏桶算法，阈值类型必须设成QPS，否则无效。如资源名为/text/{text}，单机阈值设为1，流控模式为直接，流控效果为排队等待，超时时间为2000，表示/text/{text}每秒只容纳一条请求进来，超过就必须排队等待，等待超时时间为2秒，如果2秒过去这个请求还没有被处理就抛出异常。

这种方式主要用于处理间隔性突发的流量，例如消息队列。在某一秒有大量的请求到来，而接下来的九秒则处于空闲状态，我们希望系统能够在接下来的空闲期间逐渐处理这些请求，而不是在第一秒直接拒绝多余的请求。

&emsp;

## 降级

包括熔断和降级两个功能。

Sentinel熔断降级会在调用链路中某个资源出现不稳定状态时（例如调用超时或异常比例升高），对这个资源的调用进行限制，让请求快速失败，避免影响到其它的资源而导致级联错误。

当资源被降级后，在接下来的降级时间窗口之内，对该资源的调用都自动熔断（默认行为是抛出DegradeException），有打开状态、关闭状态、半开状态。

### &emsp;RT

RT（平均响应时间，秒级），平均响应时间超出阈值且在时间窗口内通过的请求>=5，两个条件同时满足后触发降级，窗口期过后关闭断路器。RT最大为4900（更大的需要通过-Dcsp.sentinel.statistic.max.rt=XXXX才能生效）

设置RT为200，即0.2秒内完成响应，时间窗口为1，即没有完成响应就抛出异常并熔断1秒不接收任何请求。可以通过`TimeUnit.MILLISECONDS.sleep(5000)`来控制完成响应时间。

### &emsp;异常比例

异常比例（秒级），当QPS>=5且每秒异常比例超过阀值时，触发降级。时间窗口结束后，关闭降级。

设置异常比例为0.2，即一秒中的请求必须有80%的正确率，时间窗口为1，即如果超过异常比例就熔断1秒。

可以通过`int i = 10/0;`来抛出异常，此时每个请求都会抛出异常，通过Jmeter并发测试后Sentinel会阻塞。如果停掉Jmeter，此时再访问一次则直接抛出异常显示百页，因为虽然这个异常是低于80%的错误率，但是不满足一秒五次请求以上，所以Sentinel不阻塞进行保护，而是直接抛出异常。

### &emsp;异常数

异常数（分钟级），当每分钟计算异常数分钟统计超过阈值时，触发降级；时间窗口结束后，关闭降级。

注意由于统计时间窗口是分钟级别的，若时间窗小于60s，则结束熔断状态后仍可能再进入熔断状态，所以时间窗最好大于60s。

&emsp;

## 热点

何为热点？热点即经常访问的数据。狠多时候我们希望统计某个热点数据中访问频次最高的TopKey数据，并对其访问进行限制。

比如商品ID为参数，统计一段时间内最常购买的商品ID并进行限制，用户ID为参数，针对一段时间内频繁访问的用户ID进行限制。

热点参数限流会统计传入参数中的热点参数，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，仅对包含热点参数的资源调用生效。

源码在com.alibaba.csp.sentinel.slots.block.BlockException。

### &emsp;热点代码

只需要添加对应的方法，以及使用@SentinelResource指定熔断处理方法。

```java
// 测试热点Key
@GetMapping("/hotkey/{key}")
// blockHandler指定处理Hotkey规则异常的处理方法
@SentinelResource(value = "hotkey", blockHandler = "dealHotkey")
public String getHotkey(@PathVariable String key){
    return key;
}

// 参数跟getHotkey应该是一样的，并加上一个异常
public String dealHotkey(String key, BlockException exception){
    exception.printStackTrace();
    return "deal-" + key;
}
```

重新允许。访问<http://localhost:9002/hotkey/key>可以得到hotkey。

### &emsp;热点配置

热点规则只支持QPS模式。点击Sentinel控制台的热点规则，新增一条。

资源名则填写@SentinelResource指定的hotkey，参数索引即对哪个索引值的参数进行热点规则配置，这里只有一个参数所以用0，阈值为1，统计时长为1s，即1秒只允许1个hotkey进入。

此时如果访问<http://localhost:9002/hotkey/key>多次，则会返回deal-key表示开始限流处理。

如果没有blockHandler指定热点处理方法，则会报错白页。

### &emsp;相关参数

即高级配置中的参数例外项。

&emsp;

## 系统
