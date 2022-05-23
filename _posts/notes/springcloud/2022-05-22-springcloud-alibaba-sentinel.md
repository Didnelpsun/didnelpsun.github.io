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

注意8080端口不要被占用，8080被占用可以用参数--server.port=8888。直接在下载地址运行`java -jar sentinel-dashboard-1.8.4.jar`进行启动。直接在<http://localhost:8080>访问，初始用户和密码为sentinel。

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
        <!--sentinel持久化操作-->
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

然后运行。访问<http://localhost:8080/#/dashboard>结果发现什么都没有，这是因为Sentinel使用懒加载，必须访问一次才能监控到对应的路由。
