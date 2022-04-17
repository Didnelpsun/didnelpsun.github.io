---
layout: post
title: "基础使用"
date: 2022-04-14 21:11:00 +0800
categories: notes springcloud base
tags: SpringCloud 基础
excerpt: "基础使用"
---

## 基础概念

### &emsp;版本关系

SpringCloud就是提供一整个服务。具体说明可以查看[SpringCloud的Github官网](https://github.com/spring-cloud)，也可以查看[Spring的官网](https://spring.io/projects/spring-cloud)。这里可以看出来原来的SpringCloud是字母版本，从A到H，最后从2020年开始就改为了数字版本，最新的2021.0.x即3.x.x对应SpringBoot的2.6版本，必须按照依赖关系，否则会报错。

### &emsp;组件

+ 服务注册与发现：Eureka（停止更新）、ZooKeeper（基础）、Nacos（推荐）、Consul（不推荐）。
+ 服务负载与调用：Ribbon（保持维护）、LoadBalancer（开发中）
+ 远程服务调用：Feign（停止更新）、OpenFeign（推荐）。
+ 服务熔断与降级：Hystrix（停止更新）、Sentinel（国内使用）、Resilience4j（国外使用）。
+ 服务网关：Zuul（停止更新）、Gateway（推荐）。
+ 服务分布式配置：Config（不推荐）、Nacos（推荐）、Apolo。
+ 服务总线：Bus（不推荐）、Nacos（推荐）。

&emsp;

## 构建代码

首先新建一个订单支付模块。这些模块都会放在一个父工程中。

新建一个Maven的springcloud工程，使用Maven构建一个普通Maven项目，然后把src删掉。

可以在IDEA中使用文件过滤File Type过滤掉一些系统文件，如.idea。

添加父文件依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.didnelpsun</groupId>
    <artifactId>springcloud</artifactId>
    <version>1.0-SNAPSHOT</version>
    <!--打包方式为pom-->
    <packaging>pom</packaging>

    <!--统一管理版本号-->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.version>2.6.6</spring.version>
        <springcloud.version>3.1.1</springcloud.version>
        <mysql.version>8.0.28</mysql.version>
        <druid.version>1.2.9</druid.version>
        <lombok.version>1.18.22</lombok.version>
        <mybatis.version>2.2.2</mybatis.version>
    </properties>

    <!--子模块继承后锁定依赖版本-->
    <!--只锁定版本号，不引入依赖，所以子类要使用依赖还是需要显式引入依赖-->
    <!--如果需要覆盖，则自己在对应pom.xml指定-->
    <dependencyManagement>
        <dependencies>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-context -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-context</artifactId>
                <version>${springcloud.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
                <version>${spring.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
                <version>${mysql.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
            <dependency>
                <groupId>com.alibaba</groupId>
                <artifactId>druid</artifactId>
                <version>${druid.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
                <scope>provided</scope>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.mybatis.spring.boot/mybatis-spring-boot-starter -->
            <dependency>
                <groupId>org.mybatis.spring.boot</groupId>
                <artifactId>mybatis-spring-boot-starter</artifactId>
                <version>${mybatis.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

创建Spring Initliazr创建子模块pay，依赖选择Spring Boot DevTools、Lombok、Spring Configuration Processor、Spring Web、MyBatis Framework。

此时父pom文件下的packaging标签上会出现：

```xml
<modules>
    <module>pay</module>
</modules>
```

表示加入模块依赖。

如果此时发现无法在项目根目录下创建pay模块，就随便在一个子目录下创建pay模块然后重新移动到根目录下。
