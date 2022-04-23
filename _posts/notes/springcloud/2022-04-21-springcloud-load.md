---
layout: post
title: "负载调用"
date: 2022-04-21 13:20:48 +0800
categories: notes springcloud base
tags: SpringCloud 基础 负载 Ribbon Feign OpenFeign
excerpt: "负载调用"
---

首先启动原来的eureka7001、eureka7002、order81、pay8001、pay8002搭建基本的集群环境。

## 概念

### &emsp;负载均衡

LB负载均衡（Load Balance）是将用户的请求平摊的分配到多个服务上，从而达到系统的HA（高可用）。常见的负载均衡有软件Nginx、LVS、硬件F5等。

+ 集中式LB：
  + 即在服务的消费方和提供方之间使用独立的LB设施（硬件或软件），由该设施负责把访问请求通过某种策略转发至服务的提供方。
  + Nginx是服务器负载均衡，客户端所有请求都会交给Nginx，然后由Nginx实现转发请求。即负载均衡是由服务端实现的。
+ 进程内LB：
  + 将LB逻辑集成到消费方，消费方从服务注册中心获如有哪些地址可用，然后自己再从这些地址中选择出一个合适的服务器。
  + Ribbon本地负载均衡，只是一个类库，继承在消费方进程，在调用微服务接口时候，会在注册中心上获取注册信息服务列表之后缓存到JVM本地，通过类库获取服务提供方地址，从而在本地实现RPC远程服务调用技术。

### &emsp;Ribbon

#### &emsp;&emsp;概念

Spring Cloud Ribbon是基于Netflix Ribbon实现的一套客户端负载均衡的工具。

简单的说，Ribbon是Netflx发布的开源项目，主要功能是提供客户端的软件负载均衡算法和服务调用。Ribbon客户端组件提供一系列完善的配置项如连接超时，重试等。

简单的说，就是在配置文件中列出Load Balancer（简称LB）后面所有的机器，Ribbon会自动的帮助你基于某种规则（如简单轮询，随机连接等）去连接这些机器。我们很容易使用Ribbon实现自定义的负载均衡算法。

可以在[Ribbon的Github](https://github.com/Netflix/ribbon/wiki/Getting-Started)查看资料。

#### &emsp;&emsp;工作方式

Eureka的spring-cloud-starter-netflix-eureka-client已经默认整合了Ribbon。只要添加@LoadBalance注解就开始使用Ribbon进行负载均衡。

Ribbon在工作时分成两步：

1. 选择EurekaServer，优先选择在同一个区域内负载较少的server。
2. 根据用户指定的策略，在从server取到的服务注册列表中选择一个地址。

### &emsp;Feign

Feign是一个声明式WebService客户端。使用Feign能让编写Web Service客户端更加简单。

它的使用方法是定义一个服务接口然后在上面添加注解。Feign也支持可拔插式的编码器和解码器。Spring Cloud对Feign进行了封装，使其支持了Spring MVC标准注解和HttpMessageConverters。Feign可以后Eureka和Ribbon组合使用以支持负载均衡。

前面在使用Ribbon+RestTemplate时，利用RestTemplate对http请求的封装处理，形成了一套模版化的调用方法。但是在实际开发中，由于对服务依赖的调用可能不止一处，往往一个接口会被多处调用，所以通常都会针对每个微服务自行封装一些客户端类来包装这些依赖服务的调用。

所以，Feign在此基础上做了进一步封装，由他来帮助我们定义和实现依赖服务接口的定义。在Feign的实现下，我们只需创建一个接口并使用注解的方式来配置它（以前是Dao接口上面标注Mapper注解，现在是一个微服务接口上面标注一个Feign注解即可），即可完成对服务提供方的接口绑定，简化了使用Spring Cloud Ribbon时，自动封装服务调用客户端的开发量，其他服务调用者可以一起调用这些暴露出的接口不用重新定义，使用动态代理实现具体逻辑。

Feign集成了Ribbon，利用Ribbon维护了Payment的服务列表信息，并且通过轮询实现了客户端的负载均衡。而与Ribbon不同的是，通过Feign只需要定义服务绑定接口且以声明式的方法，优雅而简单的实现了服务调用

### &emsp;OpenFeign

[OpenFeign官网](https://spring.io/projects/spring-cloud-openfeign)。

&emsp;|Feign|OpenFeign
:----:|:---:|:-------:
定义|Feign是Spring Cloud组件中的一个轻量级RESTful的HTTP服务客户端，Feign内置了Ribbon，用来做客户端负载均衡，去调用服务注册中心的服务。Feign的使用方式是使用Feign的注解定义接口，调用这个接口，就可以调用服务注册中心的服务|OpenFeign是Spring Cloud在Feign的基础上支持了SpringMVC的注解，如@RequesMapping等等。OpenFeign的@FeignClient可以解析SpringMVC的@RequestMapping注解下的接口，并通过动态代理的方式产生实现类，实现类中做负载均衡并调用其他服务
依赖|spring-cloud-starter-feign|spring-cloud-starter-openfeign

### &emsp;CAS

实现服务调用时必然存在多线程共同争抢服务的情况，为了解决原子性底层往往使用CAS实现。

#### &emsp;&emsp;定义

CAS的全称为Compare-And-Swap，它是一条CPU并发原语。它的功能是判断内存某个位置的值是否为预期值，如果是则更改为新的值，这个过程是原子的。
。

Java的原子性整形的设置通过`AtomicInteger.compareAndSet`来实现，其底层调用了unsafe的compareAndSwap方法。其中第一个值为期望值expect，第二个更新值update。由于多线程中会有多个对同一资源进行操作，`x.compareAndSet(expect, update)`首先进入主物理内存对x进行取值xvalue并返回给线程的工作内存，即变量x的副本拷贝，然后在工作内存中将这个值update值改到x的副本拷贝中，接着需要将副本写回物理内存中，此时会将期望值expect与原本的值xvalue进行对比，如果xvalue=expect就代表这个值没有被其他进程修改过，可以安心地将update覆盖到x上，然后返回true，如果不相等则表示这个值被其他进程修改了，就不会覆盖update，返回false。

实现原理就是乐观锁概念，也是许多乐观锁实现的底层实现，保证了原子性。

轻量级锁就是自旋锁，重量级锁的线程需要全部挂起，线程由用户态转为内核态。

#### &emsp;&emsp;底层实现

UnSafe.class源码在Java自带的lib的rt.jar/sun/misc中。

是CAS的核心类，由于Java方法无法直接访问底层系统，需要通过本地（native）方法来访问，Unsafe相当于一个后门，基于该类可以直接操作特定内存的数据。其内部方法操作可以像C的指针一样直接操作内存，因为Java中CAS操作的执行依赖于Unsafe类的方法。其底层空间是向内存直接申请的，脱离了JVM。

注意Unsafe类中的所有方法都是native修饰的，也就是说Unsafe类中的方法都直接调用操作系统底层资源执行相应任务。

CAS并发原语体现在JAVA语言中就是sun.misc.Unsafe类中的各个方法。调用UnSafe类中的CAS方法，JVM会帮我们实现出CAS汇编指令。这是一种完全依赖于硬件的功能，通过它实现了原子操作。再次强调，由于CAS是一种系统原语，原语属于操作系统用语范畴，是由若干条指令组成的，用于完成某个功能的一个过程，并且原语的执行必须是连续的，在执行过程中不允许被中断，也就是说CAS是一条CPU的原子指令，不会造成所谓的数据不一致问题。

&emsp;

## Ribbon

### &emsp;规则实现

这个就是Ribbon负载均衡时的规则接口。具体实现有：

+ com.netflix.loadbalancer.RoundRobinRule：轮询。
+ com.netflix.loadbalancer.RandomRule：随机。
+ com.netflix.loadbalancer.RetryRule：先按照RoundRobinRule的策略获取服务，如果获取服务失败则在指定时间内会进行重试。
+ WeightedResponseTimeRule：对RoundRobinRule的扩展，响应速度越快的实例选择权重越大，越容易被选择。
+ BestAvailableRule：会先过滤掉由于多次访问故障而处于断路器跳闸状态的服务，然后选择一个并发量最小的服务。
+ AvailabilityFilteringRule：先过滤掉故障实例，再选择并发较小的实例。
+ ZoneAvoidanceRule：默认规则，复合判断server所在区域的性能和server的可用性选择服务器。

### &emsp;规则设置

如果想修改Eureka默认的负载均衡规则需要对order进行重新配置。

复制order81包为order84包。停止order81运行。将order84加入父项目子模块。

#### &emsp;&emsp;添加配置

在父项目规定版本，在子项目引入依赖。之前我们就能使用Ribbon，证明之前的依赖spring-cloud-starter-netflix-eureka-client已经给我们引入了Ribbon。所以此时我们再次引入Ribbon依赖套件spring-cloud-starter-netflix-ribbon肯定会冲突，访问会报错：java.lang.IllegalStateException: No instances available for PAY。所以这个配置十分重要，否则会冲突：

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

    <artifactId>order84</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-netflix-ribbon</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-archaius</artifactId>
        </dependency>
        <dependency>
            <groupId>com.netflix.ribbon</groupId>
            <artifactId>ribbon-loadbalancer</artifactId>
        </dependency>
    </dependencies>

</project>
```

YAML文件中只将端口从81改为84。

#### &emsp;&emsp;建立规则

官方文档明确给出了<span style="color:red">警告：</span>这个自定义规则配置类不能放在@ComponentScan所扫描的当前包下以及子包下，否则我们自定义的这个配置类就会被所有的Ribbon客户端所共享，达不到特殊化定制的目的了。

我们点开主类的@SpringBootApplication注解，发现里面包含了@ComponentScan注解，即主启动类会默认扫描java下org.didnelpsun的所有文件以及子包中的文件。

所以我们将原来的所有代码文件从org.didnelpsun下移动到一个新建的软件包order中，然后新建一个org.didnelpsun.rule包用来包含负载均衡策略。

在rule下新建一个CustomizeRole，主要类名和方法名应该不一样，否则Bean实例会重名：

```java
// CustomizeRole.java
package org.didnelpsun.rule;

import com.netflix.loadbalancer.IRule;
import com.netflix.loadbalancer.RandomRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CustomizeRole {
    @Bean
    public IRule customRole(){
        // 定义随机规则
        return new RandomRule();
    }
}
```

#### &emsp;&emsp;修改主类

修改主类，添加注解@RibbonClient，name指定配置规则的服务名（无所谓大小写），configuration指定配置规则的配置类：

```java
// Order84Application.java
package org.didnelpsun.order;

import org.didnelpsun.rule.CustomizeRole;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.ribbon.RibbonClient;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, DataSourceTransactionManagerAutoConfiguration.class, org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})
@EnableEurekaClient
@EnableDiscoveryClient
@RibbonClient(name = "PAY", configuration = CustomizeRole.class)
public class Order84Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Order84Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

运行。如果想使用别的轮询算法只需要在配置类中返回对应类即可。

### &emsp;轮询算法源码

默认轮询算法：rest接口第几次请求数%服务器集群总数量=实际调用服务器位置下标。每次服务重启动后rest接口计数从1开始。

所有负载均衡算法实现IRule接口：

```java
package com.netflix.loadbalancer;

public interface IRule {
    Server choose(Object var1);

    void setLoadBalancer(ILoadBalancer var1);

    ILoadBalancer getLoadBalancer();
}
```

AbstractLoadBalancerRule实现了IRule接口：

```java
package com.netflix.loadbalancer;

import com.netflix.client.IClientConfigAware;

public abstract class AbstractLoadBalancerRule implements IRule, IClientConfigAware {
    private ILoadBalancer lb;

    public AbstractLoadBalancerRule() {
    }

    public void setLoadBalancer(ILoadBalancer lb) {
        this.lb = lb;
    }

    public ILoadBalancer getLoadBalancer() {
        return this.lb;
    }
}
```

RoundRobinRule继承了这个类：

```java
package com.netflix.loadbalancer;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RoundRobinRule extends AbstractLoadBalancerRule {
    // 计数器为原子整形类，这是对整形类原子性的封装，用于多线程
    private AtomicInteger nextServerCyclicCounter;
    private static final boolean AVAILABLE_ONLY_SERVERS = true;
    private static final boolean ALL_SERVERS = false;
    private static Logger log = LoggerFactory.getLogger(RoundRobinRule.class);

    public RoundRobinRule() {
        // 默认初始值为0开始计数
        this.nextServerCyclicCounter = new AtomicInteger(0);
    }

    public RoundRobinRule(ILoadBalancer lb) {
        this();
        this.setLoadBalancer(lb);
    }

    // 选择一个负载均衡算法
    public Server choose(ILoadBalancer lb, Object key) {
        // 如果没有负载均衡算法就报错
        if (lb == null) {
            log.warn("no load balancer");
            return null;
        } else {
            // 初始化默认选择服务器为null
            Server server = null;
            // 初始化计数值，代表尝试选择负载均衡算法的次数
            int count = 0;

            while(true) {
                if (server == null && count++ < 10) {
                    // 获取存活的服务器，即状态为up
                    List<Server> reachableServers = lb.getReachableServers();
                    List<Server> allServers = lb.getAllServers();
                    // 存活服务数量
                    int upCount = reachableServers.size();
                    // 服务总数量
                    int serverCount = allServers.size();
                    if (upCount != 0 && serverCount != 0) {
                        // 增加serverCount坐标并获取该坐标的服务
                        int nextServerIndex = this.incrementAndGetModulo(serverCount);
                        server = (Server)allServers.get(nextServerIndex);
                        if (server == null) {
                            Thread.yield();
                        } else {
                            if (server.isAlive() && server.isReadyToServe()) {
                                return server;
                            }

                            server = null;
                        }
                        continue;
                    }
                    // 没有可用服务器就报异常
                    log.warn("No up servers available from load balancer: " + lb);
                    return null;
                }
                // 如果尝试超过十次就警告并退出
                if (count >= 10) {
                    log.warn("No available alive servers after 10 tries from load balancer: " + lb);
                }

                return server;
            }
        }
    }

    private int incrementAndGetModulo(int modulo) {
        int current;
        int next;
        // 利用取模获取当前选定的服务的坐标，并查看比较是否一致
        // 使用CAS和自旋锁
        do {
            current = this.nextServerCyclicCounter.get();
            next = (current + 1) % modulo;
        } while(!this.nextServerCyclicCounter.compareAndSet(current, next));

        return next;
    }

    public Server choose(Object key) {
        return this.choose(this.getLoadBalancer(), key);
    }
}
```

### &emsp;算法实现

启动eureka7001、eureka7002、pay8001、pay8002。编写order84。

由于我们需要自己实现，所以不需要Spring给我们准备的默认负载均衡实现，去掉ApplicationContextConfig的getRestTemplate上的@LoadBalanced注解。

#### &emsp;&emsp;规则

然后写负载均衡规则实现类，在org.didnelpsun.order下新建一个loadbalancer的包，让主启动类能扫描到，首先新建一个LoadBalancer的接口，只有一个获取实例的方法：

```java
// LoadBalancer.java
package org.didnelpsun.order.loadbalancer;

import org.springframework.cloud.client.ServiceInstance;

import java.util.List;

public interface LoadBalancer {
    // 获取对应服务实例的方法
    ServiceInstance getInstance(List<ServiceInstance> serviceInstanceList);
}
```

然后继承这个接口并实现方法，参考RoundRobinRule源码：

```java
package org.didnelpsun.order.loadbalancer;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class LoadBalancerImpl implements LoadBalancer {
    private final AtomicInteger atomicInteger = new AtomicInteger(0);

    // 自旋锁获取next值，即第几次访问的次数
    public final int getAndIncrement() {
        int current;
        int next;
        // 如果一直取不到当前值就一直取
        do {
            current = this.atomicInteger.get();
            next = current >= Integer.MAX_VALUE ? 0 : current + 1;
        } while (!this.atomicInteger.compareAndSet(current, next));
        return next;
    }

    @Override
    public ServiceInstance getInstance(List<ServiceInstance> serviceInstanceList) {
        // 获取服务实例的下标
        int index = getAndIncrement() % serviceInstanceList.size();
        return serviceInstanceList.get(index);
    }
}
```

#### &emsp;&emsp;配置控制层

由于之前在config中直接在RestTempalte实例上添加了负载均衡，所以此时我们自定义就要在控制层中在RestTempalte实例上添加自定义负载均衡，实现方式是让RestTemplate请求所获取实例的URI：

```java
// OrderController.java
package org.didnelpsun.order.controller;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import org.didnelpsun.order.loadbalancer.LoadBalancer;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/order")
@Configuration
@ConfigurationProperties(prefix = "remote")
@Data
@Slf4j
public class OrderController {
    private String baseUrl;
    private String serviceId = "pay";
    @Resource
    private RestTemplate restTemplate;
    @Resource
    private DiscoveryClient discoveryClient;
    @Resource
    private LoadBalancer loadBalancer;

    public String getBaseUrl() {
        return getBaseUrl(this.serviceId);
    }

    public String getBaseUrl(String ServiceId) {
        List<ServiceInstance> instances = discoveryClient.getInstances(ServiceId);
        if (instances == null || instances.size() == 0)
            return null;
        ServiceInstance serviceInstance = loadBalancer.getInstance(instances);
        return serviceInstance.getUri() + "/" + this.serviceId;
    }

    @GetMapping()
    public Result<?> selects() {
        return restTemplate.getForObject(this.getBaseUrl(), Result.class);
    }

    @GetMapping("/{id}")
    public Result<?> select(@PathVariable Long id) {
        return restTemplate.getForObject(this.getBaseUrl() + "/" + id, Result.class);
    }

    @PostMapping()
    public Result<?> insert(Pay pay) {
        return restTemplate.postForObject(this.getBaseUrl(), pay, Result.class);
    }

    // 最近在使用spring的RestTemplate的时候,调用他的delete方法发现没有返回值
    // 所以使用exchange来代替,就能得到调用后的返回值

    @PutMapping()
    public ResponseEntity<Result> update(Pay pay) {
        return restTemplate.exchange(this.getBaseUrl(), HttpMethod.PUT, new HttpEntity<>(pay, new HttpHeaders()), Result.class);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Result> delete(@PathVariable Long id) {
        return restTemplate.exchange(this.getBaseUrl() + "/" + id, HttpMethod.DELETE, null, Result.class);
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
}
```

最后将主类的@RibbonClient注解删掉。运行发现请求的端口会交替出现。

&emsp;

## OpenFeign

### &emsp;使用

使用方式即微服务调用接口+@FeignClient。

OpenFeign用来消费端，即order模块。所以跟Ribbon一样保持其他服务运行，将order84停止，然后复制order81为order85模块。将order85加入父项目中。

#### &emsp;&emsp;配置XML

向XML中添加OpenFeign依赖：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-openfeign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>${spring.cloud.openfeign.version}</version>
</dependency>
```

#### &emsp;&emsp;业务层

需要在业务逻辑接口上添加@FeignClient配置调用服务提供者pay的服务。所以需要新建一个service.IPayService接口，添加注解并实例化注入，可以直接将pay模块的接口IPayService中的方法复制到这里面：

```java
// IPayService.java
package org.didnelpsun.service;

import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Service
// 找ServiceId为pay的微服务
@FeignClient("PAY")
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

OpenFeign首先会根据pay来去寻找微服务实例，然后通过路径进行调用微服务。

注意此时@RequestMapping不能@FeignClient放在同一个接口，否则会报错： @RequestMapping annotation not allowed on @FeignClient interfaces。我这里使用静态成员prefix添加。

注意@PathVariable注解配置参数时必须明确带有value值指定变量名和路径参数名的对应关系，不能使用默认关系，否则会取不到路径参数报错：PathVariable annotation was empty on param 0。

#### &emsp;&emsp;修改控制层

此时控制层直接调用本模块配置的服务层接口：

```java
// OrderController.java
package org.didnelpsun.controller;

import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import org.didnelpsun.service.IPayService;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/order")
@Slf4j
public class OrderController {
    @Resource
    private IPayService payService;
    @Resource
    private DiscoveryClient discoveryClient;

    @GetMapping()
    public Result<?> selects() {
        return payService.selects();
    }

    @GetMapping("/{id}")
    public Result<?> select(@PathVariable Long id) {
        return payService.select(id);
    }

    @PostMapping()
    public Result<?> insert(Pay pay) {
        return payService.insert(pay);
    }

    // 最近在使用spring的RestTemplate的时候,调用他的delete方法发现没有返回值
    // 所以使用exchange来代替,就能得到调用后的返回值

    @PutMapping()
    public Result<Integer> update(Pay pay) {
        return payService.update(pay);
    }

    @DeleteMapping("/{id}")
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
}
```

#### &emsp;&emsp;配置YAML

对于YAML文件，将端口改为85。

<span style="color:yellow">提示：</span>可以将register-with-eureka设为false表示不注册进入Eureka，因为这个order85只是个消费者，不提供服务。其实所有order模块都不用注册进入，但是之前为了统一都注册进入了。此时默认还是注册。

由于通过微服务名调用服务，就不用明确指定主机名称和端口了。（其实之前order模块中只能通过pay微服务名访问时就不需要指定主机名和端口了）

```yaml
server:
  # 客户端默认会访问80的端口
  port: 85

spring:
  application:
    name: order

eureka:
  instance:
    instance-id: order
    prefer-ip-address: true
  # 自定义注册中心的主机名和端口的参数
  server:
    hostname:
      - localhost
      - test
    port:
      - 7001
      - 7002
  client:
    # true表示向注册中心注册自己，因为这是业务模块
    register-with-eureka: true
    # 是否从EurekaServer抓取已有的注册信息，默认为true。单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
    fetch-registry: true
    service-url:
      defaultZone: http://${eureka.server.hostname[0]}:${eureka.server.port[0]}/eureka/, http://${eureka.server.hostname[1]}:${eureka.server.port[1]}/eureka/

management:
  endpoints:
    web:
      exposure:
        include: "*"
```

由于不需要RestTemplate所以将config包删除。

修改主启动类名字，并在主类上添加@EnableFeignClients开启OpenFeign。

运行，测试<http://localhost:85/order/1>。此时发现端口会交替出现，所以OpenFeign已经自带了负载均衡（因为内置的Ribbon就自带了负载均衡）。

对比Ribbon+RestTemplate，OpenFeign更适应于编程习惯，控制层不需要调用一个奇怪的Template，只需要调用服务层的对应接口并将路径参数传入接口就可以获得暴露出来的服务方法。OpenFeign中的@FeignClient所指定的服务层接口本身不是具体的业务逻辑，而是将接口中定义的微服务名、路径、参数封装到一起作为服务，被控制层调用，再由@FeignClient进行转发和接收，底层还是HttpClient。

即order.controller->order.service->pay.controller->pay.service。

### &emsp;超时控制

客户端通过OpenFeign作为中间件调用服务端暴露在注册中心的服务时，可能出现允许的超时时间不一致情况，即客户端要求响应在1秒内完成，而服务端认为提供服务需要3秒，那么客户端这边就会报错超时Read timed out。此时就需要客户端和服务端进行超时的控制和约定。

可以在服务端的某个方法下使用`TimeUnit.SECONDS.sleep(3)`来故意暂停进程。OpenFeign底层Ribbon默认等待1秒。

此时需要在客户端的YAML中开启超时配置，单位为毫秒：

#### &emsp;&emsp;Ribbon设置

全局配置：

```yaml
ribbon:  
  ReadTimeout: 3000
  ConnectTimeout: 3000
```

指定服务配置：

```yaml
pay:
  ribbon:  
    ReadTimeout: 3000
    ConnectTimeout: 3000
```

#### &emsp;&emsp;Feign设置

全局配置：

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 3000
        readTimeout: 3000
```

指定服务配置：

```yaml
feign:
  client:
    config:
      pay:
        connectTimeout: 3000
        readTimeout: 3000
```

#### &emsp;&emsp;优先级

如果同时配置了Ribbon、Feign，那么 Feign 的配置将生效。Ribbon的配置要想生效必须满足微服务相互调用的时候通过注册中心，如果你是在本地通过@FeignClient注解的url参数进行服务相互调用的测试，此时Ribbon设置的超时时间将会失效，但是通过Feign设置的超时时间不会受到影响（仍然会生效）

### &emsp;日志

Feign提供了日志打印功能，我们可以通过配置来调整日志级别，从而了解Feign中Http请求的细节。说白了就是对Feign接口的调用情况进行监控和输出。

#### &emsp;&emsp;日志级别

+ NONE：默认的，不显示任何日志。
+ BASIC：仅记录请求方法、URL、响应状态码及执行时间。
+ HEADERS：除了BASIC中定义的信息之外，还有请求和响应的头信息。
+ FULL：除了HEADERS 中定义的信息之外，还有请求和响应的正文及元数据。

#### &emsp;&emsp;使用

新建一个config包，下面新建一个FeignConfig类，用来实例化日志配置：

```java
// FeignConfig.java
package org.didnelpsun.config;

import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {
    // 注意是Feign的Logger
    @Bean
    Logger.Level feignLoggerLevel(){
        return Logger.Level.FULL;
    }
}
```

也可以在YAML中直接配置：feign.client.config.default.loggerLevel: FULL，其中"default”可以换成FeignClient中配置的name属性，也可以直接用default。这个配置对应的是FeignClientProperties类中的config属性，该类为Feign自动配置类引入的配置项类。

最后需要在YAML中对监控类进行指定：

```yaml
logging:
  level:
    org.didnelpsun.service.IPayService: debug
```

重新启动。访问<http://localhost:85/order>，控制台会输出：

```txt
2022-04-23 11:35:58.795 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] ---> GET http://PAY/pay HTTP/1.1
2022-04-23 11:35:58.795 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] ---> END HTTP (0-byte body)
2022-04-23 11:35:59.062 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] <--- HTTP/1.1 200 (266ms)
2022-04-23 11:35:59.063 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] connection: keep-alive
2022-04-23 11:35:59.063 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] content-type: application/json
2022-04-23 11:35:59.063 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] date: Sat, 23 Apr 2022 03:35:59 GMT
2022-04-23 11:35:59.063 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] keep-alive: timeout=60
2022-04-23 11:35:59.063 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] transfer-encoding: chunked
2022-04-23 11:35:59.063 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] 
2022-04-23 11:35:59.070 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] {"code":"SUCCESS","message":"port:8002:success","data":[{"id":1,"serial":"test"},{"id":2,"serial":"test2"},{"id":3,"serial":"test3"}]}
2022-04-23 11:35:59.071 DEBUG 40096 --- [p-nio-85-exec-3] org.didnelpsun.service.IPayService       : [IPayService#selects] <--- END HTTP (134-byte body)
```
