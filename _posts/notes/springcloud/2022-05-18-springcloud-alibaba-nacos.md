---
layout: post
title: "服务注册与配置"
date: 2022-05-18 01:35:17 +0800
categories: notes springcloud alibaba
tags: SpringCloud Alibaba Nacos 注册 配置
excerpt: "服务注册与配置中心"
---

## 基础

### &emsp;SpringCloud Alibaba

由于SpringCloud原始部件进入维护模式，Spring Cloud Netflix将不再开发新的组件。我们都知道Spring Cloud版本迭代算是比较快的，因而出现了很多重大issue都还来不及修补就又推另一个Release了。进入维护模式意思就是目前一直以后一段时间Spring Cloud Netflix提供的服务和功能就这么多了，不在开发新的组件和功能了。以后将以维护和Merge分支，Full Request为主。新组件功能将以其他替代平代替的方式实现，Alibaba重新对SpringCloud进行包装整合。

[官方文档](https://github.com/alibaba/spring-cloud-alibaba/blob/master/README-zh.md)，[SpringCloud官网](https://spring.io/projects/spring-cloud-alibaba#foverview)。

其中Nacos、Sentinel、Seata为核心。

### &emsp;Nacos

Nacos即用于动态服务发现、配置管理和服务管理平台，即Eureka服务注册+Config服务配置+Bus消息总线。

+ 服务（Service）：服务是指一个或一组软件功能（例如特定信息的检索或一组操作的执行），其目的是不同的客户端可以为不同的目的重用（例如通过跨进程的网络调用）。Nacos 支持主流的服务生态，如 Kubernetes Service、gRPC|Dubbo RPC Service 或者 Spring Cloud RESTful Service。

服务注册中心（Service Registry）：服务注册中心，它是服务，其实例及元数据的数据库。服务实例在启动时注册到服务注册表，并在关闭时注销。服务和路由器的客户端查询服务注册表以查找服务的可用实例。服务注册中心可能会调用服务实例的健康检查 API 来验证它是否能够处理请求。

服务元数据（Service Metadata）：服务元数据是指包括服务端点（endpoints）、服务标签、服务版本号、服务实例权重、路由规则、安全策略等描述服务的数据。

服务提供方（Service Provider）：是指提供可复用和可调用服务的应用方。

服务消费方（Service Consumer）：是指会发起对某个服务调用的应用方。

配置（Configuration）：在系统开发过程中通常会将一些需要变更的参数、变量等从代码中分离出来独立管理，以独立的配置文件的形式存在。目的是让静态的系统工件或者交付物（如 WAR，JAR 包等）更好地和实际的物理运行环境进行适配。配置管理一般包含在系统部署的过程中，由系统管理员或者运维人员完成这个步骤。配置变更是调整系统运行时的行为的有效手段之一。

配置管理（Configuration Management）：在数据中心中，系统中所有配置的编辑、存储、分发、变更管理、历史版本管理、变更审计等所有与配置相关的活动统称为配置管理。

名字服务（Naming Service）：提供分布式系统中所有对象（Object）、实体（Entity）的“名字”到关联的元数据之间的映射管理服务，例如 ServiceName -> Endpoints Info, Distributed Lock Name -> Lock Owner/Status Info, DNS Domain Name -> IP List, 服务发现和 DNS 就是名字服务的2大场景。

配置服务（Configuration Service）：在服务或者应用运行过程中，提供动态配置或者元数据以及配置管理的服务提供者。

### &emsp;安装配置

到[Nacos的Github官网](https://github.com/alibaba/nacos)进行下载安装，选择zip安装包，下载后解压到安装目录，可以将安装目录/bin路径添加到环境变量中，然后使用单机模式运行`startup -m standalone`。

然后访问<http://localhost:8848/nacos>，默认账号密码都是nacos。

&emsp;

## 注册中心

我们可以直接新建一个简易的不带持久层和业务层的模块pay9001。

### &emsp;服务者

首先导入相关依赖，先在父pom中添加对应的依赖，需要两个Nacos相关依赖，然后nacos需要一个snakeyaml依赖，注意SpringBoot版本不能太高，因为Nacos更新没有SpringBoot那么快：

#### &emsp;&emsp;服务者配置

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

    <artifactId>pay9001</artifactId>

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
    </dependencies>

</project>
```

添加application.yaml：

```yaml
server:
  port: 9001

spring:
  application:
    name: pay
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848

management:
  endpoints:
    web:
      exposure:
        include: '*'
```

#### &emsp;&emsp;服务者代码

新建控制层org.didnelpsun.controller.PayController：

```java
// PayController.java
package org.didnelpsun.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class PayController {
    @Value("${server.port}")
    private String port;

    @GetMapping("/pay/{id}")
    public String getPay(@PathVariable Integer id){
        log.info(this.port + ":" + id);
        return this.port + ":" + id;
    }
}
```

org.didnelpsun.Pay9001Application：

```java
// Pay9001Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(exclude = {GsonAutoConfiguration.class, DataSourceAutoConfiguration.class})
@EnableDiscoveryClient
public class Pay9001Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Pay9001Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

启动pay9001，然后到<http://localhost:8848/nacos>查看，点击服务管理的服务列表，就会出现一个pay的服务名，默认分组为DEFAULT_GRUOP。

然后同理新建一个pay9002，直接复制，只改变端口等，运行后就发现服务名为pay的实例数变成了两个。

### &emsp;消费者

基本上类似，直接复制pay9001变为order91。

#### &emsp;&emsp;消费者配置

由于Nacos没有整合负载均衡，所以需要添加一个负载均衡依赖，不然不能通过服务名访问服务，且必须版本匹配Nacos版本：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-loadbalancer -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-loadbalancer</artifactId>
    <version>3.0.5</version>
</dependency>
```

修改YAML：

```yaml
server:
  port: 91

spring:
  application:
    name: order
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848

# 访问的微服务名称或地址
service-url:
  nacos-user-service: http://pay

management:
  endpoints:
    web:
      exposure:
        include: '*'
```

#### &emsp;&emsp;消费者代码

新建config软件包，并添加配置的RestTemplate，也可以直接从order81复制config过来：

```java
// ApplicationContextConfig.java
package org.didnelpsun.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ApplicationContextConfig {
    @LoadBalanced
    @Bean
    public RestTemplate getRestTemplate() {
        return new RestTemplate();
    }
}
```

修改控制层：

```java
// OrderController.java
package org.didnelpsun.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Resource;

@RestController
@Slf4j
public class OrderController {
    @Value("${service-url.nacos-user-service}")
    private String url;

    @Resource
    private RestTemplate restTemplate;

    @GetMapping("/order/{id}")
    public String getOrder(@PathVariable Integer id){
        return restTemplate.getForObject(url + "/pay/" + id, String.class);
    }
}
```

修改主类文件：

```java
// Order91Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(exclude = {GsonAutoConfiguration.class, DataSourceAutoConfiguration.class})
@EnableDiscoveryClient
public class Order91Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Order91Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

运行order91，在Nacos控制台中出现了order服务。访问<http://localhost:91/order/2>就能得到2，并且端口交替显示。

### &emsp;对比

&emsp;|Nacos|Eureka|Consul|CoreDNS|ZooKeeper
:----:|:---:|:----:|:----:|:-----:|:-------:
一致性协议|CP+AP|AP|CP||CP
健康检查|TCP/HTTP/MySQL/Client Beat|Client Beat|TCP/HTTP/gRPC/Cmd||Client Beat
负载均衡|权重/DSL/metadata/CMDB|Ribbon|Fabio|RR||
雪崩保护|支持|支持|不支持|不支持|不支持
自动注销实例|支持|支持|不支持|不支持|支持
访问协议|HTTP/DNS/UDP|HTTP|HTTP/DNS|DNS|TCP
监听支持|支持|支持|支持|不支持|支持
多数据中心|支持|支持|支持|不支持|不支持
跨注册中心|支持|不支持|支持|不支持|不支持
SpringCloud集成|支持|支持|支持|不支持|不支持
Dubbo集成|支持|不支持|不支持|不支持|支持
K8s集成|支持|不支持|支持|支持|不支持

&emsp;

## 配置中心

### &emsp;基础配置

#### &emsp;&emsp;相关配置

新建client3377模块并加入父项目中。然后添加依赖：

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

    <artifactId>client3377</artifactId>

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
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bootstrap</artifactId>
        </dependency>
    </dependencies>

</project>
```

Nacos同springcloud-config一样，在项目初始化时，要保证先从配置中心进行配置拉取，拉取配置之后，才能保证项目的正常启动。SpringBoot中配置文件的加载是存在优先级顺序的，bootstrap优先级高于application，所以需要两个YAML文件。

bootstrap.yaml：

```yaml
# Nacos配置
server:
  port: 3377

spring:
  application:
    name: client
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
      # 分布式配置
      config:
        server-addr: localhost:8848
        # 配置文件格式与类型
        file-extension: yaml
```

application.yaml：

```yaml
spring:
  profiles:
    # 表示当前为开发环境
    active: dev
```

#### &emsp;&emsp;配置代码

org.didnelpsun.Client3377Application：

```java
// Client3377Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class Client3377Application {
    public static void main(String[] args) {
        SpringApplication.run(Client3377Application.class, args);
    }
}
```

controller.ClientController，对配置中心的配置文件进行访问：

```java
// ClientController.java
package org.didnelpsun.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
// 开启Nacos的动态刷新功能
@RefreshScope
public class ClientController {
    @Value("${config.info}")
    private String info;

    @GetMapping("/config/info")
    public String getInfo(){
        return info;
    }
}
```

#### &emsp;&emsp;匹配规则

从此可以知道client3377会根据YAML配置在Nacos中查找对应的配置文件，跟之前的Config组件一样，Nacos会找什么名字的配置文件？

查看[官网](https://nacos.io/zh-cn/docs/quick-start-spring-cloud.html
)解释，Nacos中的dataid的组成格式及与SpringBoot配置文件中的匹配规则：\${prefix}-\${spring.profiles.active}.\${file-extension}，其中为：

+ prefix默认为spring.application.name的值，也可以通过配置项spring.cloud.nacos.config.prefix来配置。
+ spring.profiles.active即为当前环境对应的profile，详情可以参考Spring Boot文档。注意：当spring.profiles.active为空时，对应的连接符-也将不存在，dataId的拼接格式变成\${prefix}.\${file-extension}。
+ file-exetension 为配置内容的数据格式，可以通过配置项spring.cloud.nacos.config.file-extension来配置。目前只支持properties和yaml类型。

所以按照YAML配置文件中的配置格式，在Nacos控制台中点击配置管理，配置列表，点击右侧的加号新建配置文件，配置文件名应该是client-dev.yaml。然后Group就是默认值DEFAULT_GROUP，选择配置格式为YAML，最后配置内容为：

```yaml
config: 
  info: test
```

最后发布到配置列表中。这样我们的程序就可以直接从Nacos读取公共配置文件，不需要在其他地方如Github读取文件了。

运行client3377后访问<http://localhost:3377/config/info>就会返回Nacos中配置的info值test。

此时在Nacos上直接修改YAML文件，此时修改会直接刷新到访问中。

### &emsp;分类配置

#### &emsp;&emsp;配置相关配置
