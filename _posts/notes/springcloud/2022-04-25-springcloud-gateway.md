---
layout: post
title: "服务网关"
date: 2022-04-25 11:39:00 +0800
categories: notes springcloud base
tags: SpringCloud 基础 服务网关 Zuul GateWay
excerpt: "服务网关"
---

## 概念

### &emsp;网关概念

不同的微服务一般会有不同的网络地址，客户端在访问这些微服务时必须记住几十甚至几百个地址，这对于客户端方来说太复杂也难以维护。

如果让客户端直接与各个微服务通讯，可能会有很多问题：

1. 客户端会请求多个不同的服务，需要维护不同的请求地址，增加开发难度。
2. 在某些场景下存在跨域请求的问题。
3. 加大身份认证的难度，每个微服务需要独立认证。

网关位于微服务和反向代理之间，外部请求都会先经过微服务网关，客户端只需要与网关交互，只知道一个网关地址即可。

API网关是一个服务器，是系统对外的唯一入口。API网关封装了系统内部架构，为每个客户端提供一个定制的API。API网关方式的核心要点是，所有的客户端和消费端都通过统一的网关接入微服务，在网关层处理所有的非业务功能.通常，网关也是提供REST/HTTP的访问API。服务端通过API-GW注册和管理服务。

[参考](https://blog.csdn.net/qq_39759664/article/details/122223306)。

### &emsp;Gateway特点

[Zuul说明](https://github.com/Netflix/zuul/wiki)。

[Gateway文档](https://cloud.spring.io/spring-cloud-static/spring-cloud-gateway/2.2.1.RELEASE/reference/html)。

Cloud全家桶中有个很重要的组件就是网关，在1.x版本中都是采用的Zuul网关。但在2.x版本中，zuul的升级一直跳票，SpringCloud最后自己研发了一个网关替代Zuul,那就是SpringCloud Gateway。Gateway是原Zuul1.x版的替代。

SpringCloud Gateway是Spring Cloud的一个全新项目，基于Spring 5.0+Spring Boot 2.0和Project Reactor等技术开发的网关，它旨在为微服务架构提供一种简单有效的统一的API路由管理方式。

Gateway基于异步非阻塞模式，所以性能高。而Zuul使用传统阻塞性模式。

SpringCloud Gateway作为Spring Cloud生态系统中的网关，目标是替代Zuul，在Spring Cloud 2.O以上版本中，没有对新版本的Zuul 2.0以上最新高性能版本进行集成，仍然还是使用的Zuul 1.x非Reactor模式的老版本。而为了提升网关的性能，SpringCloud Gateway是基于WebFlux框架实现的，而WebFlux框架底层则使用了高性能的Reactor模式通信框架Netty。

Spring Cloud Gateway的目标提供统一的路由方式且基于Filter键的方式提供了网关基本的功能，例如安全、监控/指标、限流、反向代理、鉴权、熔断、日志监控。

+ 基于Spring Framework 5、Project Reactor和Spring Boot 2.0进行构建。
+ 动态路由：能够匹配任何请求属性。
+ 可以对路由指定Predicate（断言）和Filter（过滤器）。
+ 集成Hystrix的断路器功能。
+ 集成Spring Cloud服务发现功能。
+ 易于编写的Predicate（断言）和Filter（过滤器）。
+ 请求限流功能。
+ 支持路径重写。

### &emsp;核心概念

+ 路由Route：是构建网关的基本模块，它由ID，目标URI，一系列的断言和过滤器组成，如果断言为true则匹配该路由。
+ 断言Predicate：参考Java8的java.util.function.Predicate，开发人员可以匹配HTTP请求中的所有内容（例如请求头或请求参数），如果请求与断言相匹配则进行路路由。
+ 过滤Filter：指的是Spring框架中GatewayFilter的实例，使用过滤器，可以在请求被路由前或者之后对请求进行修改。

### &emsp;工作流程

客户端向Spring Cloud Gateway发出请求。然后在Gateway Handler Mapping中使用路由和断言找到与请求相匹配的路由，将其发送到GatewayWeb Handler。

Handler再通过指定的过滤器来将请求发送到我们实际的服务执行业务逻辑，然后返回。

过滤器可能会在发送代理请求之前pre或之后post执行业务逻辑。Filter在pre类型的过滤器可以做参数校验、权限校验、流量监控、日志输出、协议转换等；在post类型的过滤器中可以做响应内容、响应头的修改，日志的输出，流量监控。

&emsp;

## 创建

新建一个gateway9527模块。

### &emsp;配置依赖

添加依赖，注意不要添加web依赖，否则会报错：

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

    <artifactId>gateway9527</artifactId>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
    </dependencies>

</project>
```

### &emsp;配置路由映射

#### &emsp;&emsp;YAML

```yaml
server:
  port: 9527

spring:
  application:
    name: gateway
  cloud:
    gateway:
      # 配置网关
      routes:
        # 路由ID，没有规则但要求唯一，建议配合服务名
        - id: pay8001
          uri: http://localhost:8001
          # 断言，即具体的路由匹配
          predicates:
            - Path=/pay/**
        - id: order81
          uri: http://localhost:81
          predicates:
            - Path=/order/**

eureka:
  instance:
    instance-id: order81
    prefer-ip-address: true
  client:
    service-url:
      register-with-eureka: true
      fetch-registry: true
      defaultZone: http://localhost:7001/eureka

management:
  endpoints:
    web:
      exposure:
        include: "*"
```

#### &emsp;&emsp;RouteLocator

YAML配置的其他内容不变，把网关配置gateway下的内容注释掉。

新建一个config.GatewayConfig：

```java
// GatewayConfig.java
package org.didnelpsun.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder routeLocatorBuilder) {
        RouteLocatorBuilder.Builder routes = routeLocatorBuilder.routes();
        routes.route("pay8001", f -> f.path("/pay/**").uri("http://localhost:8001/pay")).build();
        routes.route("order81", f -> f.path("/order/**").uri("http://localhost:81/order")).build();
        return routes.build();
    }
}
```

### &emsp;添加启动类

不需要业务层，所以直接编写启动类org.didnelpsun.Gateway9527Application：

```java
// Gateway9527Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})
@EnableEurekaClient
public class Gateway9527Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Gateway9527Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

启动eureka7001、pay8001、order81、gateway9527，此时访问<http://localhost:9527/pay/1>也能像访问<http://localhost:8001/pay/1>一样，同理<http://localhost:9527/order/1>也能像访问<http://localhost:81/order/1>一样。此时网关9527就把原来的服务localhost:8001和localshot:81给掩盖了。此时网关就起到了反向代理的作用，在服务器的一端对服务进行代理分发，让客户端请求不直接通过微服务而通过网关的路由派发给微服务，这就不用暴露真实端口。

&emsp;

## 高级

### &emsp;动态路由

此时如果设置配置规则，都是写死的9527映射8001，Eureka默认使用Ribbon实现负载均衡，所以可以配置为<http://Pay/pay>来避免直接指定为8001提供服务而导致无法负载均衡。即使用微服务名实现动态路由。

默认情况下Gateway会根据注册中心注册的服务列表，以注册中心上微服务名为路径创建动态路由进行转发，从而实现动态路由的功能。

