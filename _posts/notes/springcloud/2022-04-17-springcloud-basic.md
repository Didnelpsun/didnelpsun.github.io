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

## 父工程

这些模块都会放在一个父工程中。

### &emsp;创建项目

新建一个Maven的springcloud工程，使用Maven构建一个普通Maven项目，然后把src删掉。

可以在IDEA中使用文件过滤File Type过滤掉一些系统文件，如.idea。

### &emsp;添加依赖

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
            <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-dependencies -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.version}</version>
                <type>pom</type>
                <scope>provided</scope>
            </dependency>
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

&emsp;

## 通用模块

使用Maven创建通用模块common。其他业务模块使用都要引用common模块。

### &emsp;common依赖

由于其他业务模块全部需要使用common，所以这里的pom.xml可以直接配置所有模块都要用到的依赖，此时配置了就相当于引用了，不同于dependencyManagement标签，其他业务模块在引用common之后就不用写common模块引用过的依赖，且此时的pom.xml就不用写version：

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

    <artifactId>common</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <type>pom</type>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>
    </dependencies>

</project>
```

此时父pom文件下的packaging标签上会出现：

```xml
<modules>
    <module>common</module>
</modules>
```

表示加入模块依赖。

### &emsp;实体类定义

我们会将实体类定义在通用模块common中，让其他业务模块可以共同使用，避免多个模块定义了不同的实体。

#### &emsp;&emsp;Code实体类

即对传输响应时的状态码，由于已经有对应的规范，所以我们可以定义一个枚举类型进行规范，避免状态码混乱，在common模块的utils下新建一个Code类：

```java
// Code.java
package org.didnelpsun.util;

// 状态码
public enum Code {
    SUCCESS(200),
    NO_CONTENT(204),
    BAD_REQUEST(400),
    UNAUTHORIZED(401),
    FORBIDDEN(403),
    NOT_FOUND(404),
    NO_RESPONSE(444),
    SERVER_ERROR(500);

    private final int id;

    Code(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }
}
```

#### &emsp;&emsp;Result实体类

前后端传输时为了简单直接传输一个整体的Result类，以后前后端传输直接使用这个类的实例，其中定义了状态码、消息、返回值，所以在common模块的entity下新建一个Result：

```java
// Result.java
package org.didnelpsun.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.didnelpsun.util.Code;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<data> {
    private Code code;
    private String message;
    private data data;

    public Result(Code code, String message){
        this.code = code;
        this.message = message;
    }
}
```

其中Result的泛型就是其data数据的泛型，使用lombok就不需要写Setter/Getter。

&emsp;

## 支付模块

新建一个订单支付模块。利用Maven创建子模块pay。（注意不要使用Spring Initliazr，因为Spring Initliazr会让pay继承SpringBoot官方父项目，而项目只能有一个parent，从而我们不能控制pay模块的版本号）

### &emsp;pay配置

#### &emsp;&emsp;pay的XML配置

首先需要引用common模块依赖，然后引入其他独有的依赖：

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

    <artifactId>pay</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>

</project>
```

#### &emsp;&emsp;pay的yaml配置

在pay模块的resources下添加配置application.yaml：

```yaml
server:
  port: 8001

spring:
  application:
    name: pay
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/data
    username: root
    password: root

mybatis:
  # 定义实体类所在的包
  type-aliases-package: org.didnelpsun.entity
  mapper-locations: classpath:mapper/*.xml
```

### &emsp;Pay实体类

由于我们需要使用到pay实体类，所以创建pay表。

```sql
CREATE TABLE `pay` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `serial` VARCHAR(200) DEFAULT '',
    PRIMARY KEY(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8
```

在common模块的entity软件包下创建实体类Pay：

```java
// Pay.java
package org.didnelpsun.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Pay implements Serializable {
    private long id;
    private String serial;
}
```

### &emsp;pay代码

从持久层、业务层、控制层的逻辑来编写。在java文件夹下编写org.didnelpsun软件包，在下面编写业务代码。

#### &emsp;&emsp;pay持久层

首先新建一个dao软件包，添加一个Pay的持久层接口，定义CRUD操作：

```java
// IPayDao.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.Pay;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IPayDao {
    Pay select(Long id);
    List<Pay> selects();
    int insert(Pay pay);
    int update(Pay pay);
    int delete(Long id);
}
```

可以使用XML也可以使用注解，XML适合复杂SQL语句且利于整合，所以这里都是使用XML文件。之前YAML配置文件中指定了mapper-locations的位置，所以在resources下新建mapper文件夹，并新建PayMapper.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="org.didnelpsun.dao.IPayDao">
    <!--这里type必须明确指定全限定类名-->
    <resultMap id="PayResult" type="org.didnelpsun.entity.Pay">
        <id column="id" property="id" jdbcType="BIGINT"/>
        <result column="serial" property="serial" jdbcType="VARCHAR"/>
    </resultMap>
    <select id="select" parameterType="Long" resultMap="PayResult">
        select *
        from pay
        where id = #{id}
    </select>
    <select id="selects" resultMap="PayResult">
        select *
        from pay
    </select>
    <!--yaml中指定了type-aliases-package所以parameterType、resultType不用写全限定类名，会自动在指定路径下查找-->
    <insert id="insert" parameterType="Pay" useGeneratedKeys="true" keyProperty="id">
        insert into pay(serial)
        values (#{serial})
    </insert>
    <update id="update" parameterType="Pay">
        update pay
        set serial=#{serial}
        where id = #{id}
    </update>
    <delete id="delete" parameterType="Pay">
        delete
        from pay
        where id = #{id}
    </delete>
</mapper>
```

#### &emsp;&emsp;pay业务层

首先新建一个service软件包，然后定义一个业务层接口：

```java
// IPayService.java
package org.didnelpsun.service;

import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;

import java.util.List;

public interface IPayService {
    Result<Pay> select(Long id);
    Result<List<Pay>> selects();
    Result<Integer> insert(Pay pay);
    Result<Integer> update(Pay pay);
    Result<Integer> delete(Long id);
}
```

注意此时都会返回封装好的Result实体类。

在service下新建一个impl来放置实现类：

```java
// PayServiceImpl.java
package org.didnelpsun.service.impl;

import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.dao.IPayDao;
import org.didnelpsun.service.IPayService;
import org.springframework.stereotype.Service;
import org.didnelpsun.util.Code;

import javax.annotation.Resource;
import java.util.List;

@Service
@Slf4j
public class PayServiceImpl implements IPayService {
    @Resource
    private IPayDao payDao;

    @Override
    public Result<Pay> select(Long id) {
        Pay result = payDao.select(id);
        log.info("查询结果:" + result);
        if (result != null) {
            return new Result<>(Code.SUCCESS, "success", result);
        } else {
            return new Result<>(Code.NO_CONTENT, "no content", null);
        }
    }

    @Override
    public Result<List<Pay>> selects() {
        List<Pay> result = payDao.selects();
        log.info("查询结果:" + result);
        if (result.size() > 0) {
            return new Result<>(Code.SUCCESS, "success", result);
        } else {
            return new Result<>(Code.NO_CONTENT, "no content", result);
        }
    }

    @Override
    public Result<Integer> insert(Pay pay) {
        int result = payDao.insert(pay);
        log.info("添加结果:" + result);
        if (result > 0) {
            return new Result<>(Code.SUCCESS, "success", result);
        } else {
            return new Result<>(Code.NO_RESPONSE, "insert fail", result);
        }
    }

    @Override
    public Result<Integer> update(Pay pay) {
        int result = payDao.update(pay);
        log.info("更新结果:" + result);
        if (result > 0) {
            return new Result<>(Code.SUCCESS, "success", result);
        } else {
            return new Result<>(Code.NO_RESPONSE, "update fail", result);
        }
    }

    @Override
    public Result<Integer> delete(Long id) {
        Integer result = payDao.delete(id);
        log.info("删除结果:" + result);
        if (result > 0) {
            return new Result<>(Code.SUCCESS, "success", result);
        } else {
            return new Result<>(Code.NO_RESPONSE, "delete fail", result);
        }
    }
}
```

#### &emsp;&emsp;pay控制层

控制层基本上代码较少：

```java
package org.didnelpsun.controller;

import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import org.didnelpsun.service.IPayService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@Slf4j
@RestController()
@RequestMapping("/pay")
public class PayController {
    @Resource
    private IPayService payService;

    @GetMapping("/{id}")
    public Result<Pay> select(@PathVariable Long id) {
        return payService.select(id);
    }

    @GetMapping()
    public Result<List<Pay>> selects() {
        log.info("查询开始");
        return payService.selects();
    }

    @PostMapping()
    public Result<Integer> insert(Pay pay) {
        return payService.insert(pay);
    }

    @PutMapping()
    public Result<Integer> update(Pay pay) {
        return payService.update(pay);
    }

    @DeleteMapping("/{id}")
    public Result<Integer> delete(@PathVariable long id) {
        return payService.delete(id);
    }
}
```

#### &emsp;&emsp;pay主类

创建主类：

```java
// PayApplication.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PayApplication {
    public static void main(String[] args) {
        SpringApplication.run(PayApplication.class, args);
    }
}
```

运行后就可以对路径进行访问。

&emsp;

## 订单模块

同样利用Maven创建子模块order。

### &emsp;order配置

#### &emsp;&emsp;order的XML配置

同理需要引用配置，但是注意的是，这里order需要引用哪些依赖？order是客户端，客户端只能访问对应的页面，请求对应的数据，所以它是不能操作数据的，所以order模块不会直接调用SQL语句操作数据库，而是会调用pay模块。所以order模块只有控制层，而没有业务层和持久层。

由于只有控制层，所以order模块必须通过HTTP来调用pay模块的方法，这里就需要使用到RestTemplate。

RestTemplate提供了多种便捷访问远程HTTP服务的方法，是一种简单便捷的访问Restful服务模板类，是Spring提供的用于访问Rest服务的客户端模板工具集。

使用RestTemplate访问Restful接口非常的简单，只有三个参数：url、requlestMap、ResponseBean.class，这三个参数分别代表REST请求地址、请求参数、HTTP响应转换被转换成的对象类型。

