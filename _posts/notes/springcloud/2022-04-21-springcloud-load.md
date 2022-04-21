---
layout: post
title: "负载调用"
date: 2022-04-21 13:20:48 +0800
categories: notes springcloud base
tags: SpringCloud 基础 负载 Ribbon
excerpt: "负载调用"
---

首先启动原来的eureka7001、eureka7002、order81、pay8001、pay8002搭建基本的集群环境。

这里主要就是Ribbon。

## 概念

### &emsp;简介

Spring Cloud Ribbon是基于Netflix Ribbon实现的一套客户端负载均衡的工具。

简单的说，Ribbon是Netflx发布的开源项目，主要功能是提供客户端的软件负载均衡算法和服务调用。Ribbon客户端组件提供一系列完善的配置项如连接超时，重试等。

简单的说，就是在配置文件中列出Load Balancer（简称LB）后面所有的机器，Ribbon会自动的帮助你基于某种规则（如简单轮询，随机连接等）去连接这些机器。我们很容易使用Ribbon实现自定义的负载均衡算法。

可以在[Ribbon的Github](https://github.com/Netflix/ribbon/wiki/Getting-Started)查看资料。

### &emsp;负载均衡

LB负载均衡（Load Balance）是将用户的请求平摊的分配到多个服务上，从而达到系统的HA（高可用）。常见的负载均衡有软件Nginx、LVS、硬件F5等。

+ 集中式LB：
  + 即在服务的消费方和提供方之间使用独立的LB设施（硬件或软件），由该设施负责把访问请求通过某种策略转发至服务的提供方。
  + Nginx是服务器负载均衡，客户端所有请求都会交给Nginx，然后由Nginx实现转发请求。即负载均衡是由服务端实现的。
+ 进程内LB：
  + 将LB逻辑集成到消费方，消费方从服务注册中心获如有哪些地址可用，然后自己再从这些地址中选择出一个合适的服务器。
  + Ribbon本地负载均衡，只是一个类库，继承在消费方进程，在调用微服务接口时候，会在注册中心上获取注册信息服务列表之后缓存到JVM本地，通过类库获取服务提供方地址，从而在本地实现RPC远程服务调用技术。

### &emsp;工作方式

Eureka的spring-cloud-starter-netflix-eureka-client已经默认整合了Ribbon。只要添加@LoadBalance注解就开始使用Ribbon进行负载均衡。

Ribbon在工作时分成两步：

1. 选择EurekaServer，优先选择在同一个区域内负载较少的server。
2. 根据用户指定的策略，在从server取到的服务注册列表中选择一个地址。

&emsp;

## IRule

### &emsp;规则实现

这个就是Ribbon负载均衡时的规则接口。具体实现有：

+ com.netflix.loadbalancer.RoundRobinRule：轮询。
+ com.netflix.loadbalancer.RandomRule：随机。
+ com.netflix.loadbalancer.RetryRule：先按照RoundRobinRule的策略获取服务，如果获取服务失败则在指定时间内会进行重试。
+ WeightedResponseTimeRule：对RoundRobinRule的扩展，响应速度越快的实例选择权重越大，越容易被选择。
+ BestAvailableRule：会先过滤掉由于多次访问故障而处于断路器跳闸状态的服务，然后选择一个并发量最小的服务。
+ AvailabilityFilteringRule：先过滤掉故障实例，再选择并发较小的实例。
+ ZoneAvoidanceRule：默认规则，复合判断server所在区域的性能和server的可用性选择服务器。

### &emsp;修改规则

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

&emsp;

## 轮询算法

### &emsp;源码

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
                    List<Server> reachableServers = lb.getReachableServers();
                    List<Server> allServers = lb.getAllServers();
                    int upCount = reachableServers.size();
                    int serverCount = allServers.size();
                    if (upCount != 0 && serverCount != 0) {
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

                    log.warn("No up servers available from load balancer: " + lb);
                    return null;
                }
                // 如果尝试超过十次就警告
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
