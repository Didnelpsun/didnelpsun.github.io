---
layout: post
title: "Eureka"
date: 2022-04-19 15:09:47 +0800
categories: notes springcloud base
tags: SpringCloud 基础 Eureka
excerpt: "Eureka"
---

服务注册中心包括Eureka、Zookeeper、Consul、Nacos四个部分。

从原来的最基础的例子可以看出pay和order模块都调用common模块，order模块引用pay模块的服务。在传统的RPC远程调用框架中，管理每个服务与服务之间依赖关系比较复杂，管理比较复杂，所以需要使用服务治理，管理服务于服务之间依赖关系，可以实现服务调用、负载均衡、容错等，实现服务发现与注册。

## Eureka

### &emsp;Eureka概念

Eureka采用了CS的没计架构，Eureka Sever作为服务注册功能的服务器，它是服务注册中心。而系统中的其他微服务，使用Eureka的客户端连接到Eureka Server并维持心跳连接。这样系统的维护人员就可以通过Eureka Server来监控系统中各个微服务是否正常运行。

在服务注册与发现中，有一个注册中心。当服务器启动的时候，会把当前自己服务器的信息比如服务地址通讯地址等以别名方式注册到注册中心上。另一方（消费者服务提供者），以该别名的方式去注册中心上获取到实际的服务通讯地址，然后再实现本地RPC调用RPC远程调用框架核心设计思想：在于注册中心，因为使用注册中心管理每个服务与服务之间的一个依赖关系（服务治理概念）。在任何RPC远程框架中，都会有一个注册中心（存放服务地址相关信息，如接口地址）。

+ Eureka Server提供服务注册服务：各个微服务节点通过配置启动后，会在EurekaServer中进行注册，这样Eureka Server中的服务注册表中将会存储所有可用服务节点的信息，服务节点的信息可以在界面中直观看到。
+ Eureka Client通过注册中心进行访问：是一个Java客户端，用于简化Eureka Server的交互，客户端同时也具备一个内置的、使用轮询（round-robin）负载算法的负载均衡器。在应用启动后，将会向Eureka Server发送心跳（默认周期为30秒）。如果Eureka Server在多个心跳周期内没有接收到某个节点的心跳,EurekaServer将会从服务注册表中把这个服务节点移除（默认90秒）。

### &emsp;Eureka单机

#### &emsp;&emsp;Eureka单机注册中心

首先需要新建一个Eureka注册中心，从而其他模块的服务能注册到这个注册中心中。

首先创建一个eureka的Maven模块。

首先添加server依赖，配置一个eureka.version版本号，再添加：

父工程：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-server -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
    <version>${eureka.version}</version>
</dependency>
```

eureka子工程：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

添加YAML配置文件：

```yaml
server:
  port: 7001

eureka:
  instance:
    # Eureka掇务端的实例名称
    hostname: localhost
  client:
    # false表示不向注册中心注册自己
    register-with-eureka: false
    # false表示白己端就是注册中心，我的职责就是维护服务实例，并不需要去检索服务
    fetch-registry: false
    service-url:
      # 设置与Eureka server交互的地址查询服务和注册服务都需要依赖这个地址
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

由于Eureka注册中心只提供注册服务，没有具体的业务，所以不需要三层架构，只需要一个主类：

```java
// EurekaApplication.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
// 开启Eureka服务，表示当前进程为Eureka服务注册中心
@EnableEurekaServer
public class EurekaApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }
}
```

运行。

如果警告：LoadBalancer is currently working with the default cache. While this cache implementation is useful for development and tests, it's recommended to use Caffeine cache in production.You can switch to using Caffeine cache, by adding it and org.springframework.cache.caffeine.CaffeineCacheManager to the classpath.，则参照<https://blog.csdn.net/JGMa_TiMo/article/details/121971430>解决，也可以不用管。

如果报错：Request execution error. endpoint=DefaultEndpoint{ serviceUrl='http://localhost:8761/eureka/}, exception=I/O error on GET request for "http://localhost:8761/eureka/apps/": Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect; nested exception is org.apache.http.conn.HttpHostConnectException: Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect stacktrace=org.springframework.web.client.ResourceAccessException: I/O error on GET request for "http://localhost:8761/eureka/apps/": Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect; nested exception is org.apache.http.conn.HttpHostConnectException: Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect，表示程序中指定的<http://localhost:7001/eureka>注册中心地址无效，而用了SpringCloud默认的注册中心地址<http://localhost:8761/eureka>。此时需要检查YAML关于Eureka的配置，特别是defaultZone这个部分，可能是这个属性识别不到，或没有对齐。

如果报错：Caused by: org.springframework.beans.BeanInstantiationException: Failed to instantiate \[org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter\]: Factory method 'requestMappingHandlerAdapter' threw exception; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'messageConverters' defined in class path resource \[org/springframework/boot/autoconfigure/http/HttpMessageConvertersAutoConfiguration.class\]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate \[org.springframework.boot.autoconfigure.http.HttpMessageConverters\]: Factory method 'messageConverters' threw exception; nested exception is org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'mappingJackson2HttpMessageConverter' defined in class path resource，表示缺乏JSON转换依赖，添加：

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>${jackson.version}</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-core</artifactId>
    <version>${jackson.version}</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-annotations</artifactId>
    <version>${jackson.version}</version>
</dependency>
```

需要在父项目规定版本，子项目直接引入不用写版本。

如果报错：Correct the classpath of your application so that it contains compatible versions of the classes org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration$StandardGsonBuilderCustomizer and com.google.gson.GsonBuilder，启动类添加(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})排除这个自动检查。

访问<http://localhost:7001/>（没有后面的eureka）查看注册中心。

如果启动后发现是404，查看spring-cloud-starter-netflix-eureka-server这个依赖是否正确导入、YAML是否配置成功、启动类是否添加@EnableEurekaServer注解。

#### &emsp;&emsp;注册单机支付模块

查看注册中心的Instances currently registered with Eureka显示No instances available表示还没有实例注入。

所以要将支付模块注册为客户端进入，作为提供者。之后需要将订单模块注册为客户端进入，作为消费者。

所以依赖需要添加Eureka客户端，首先在父pom中添加版本控制：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    <version>${eureka.version}</version>
</dependency>
```

然后在pay模块的pom中引用依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

修改YAML文件：

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

eureka:
  # 自定义注册中心的主机名和端口的参数
  server:
    hostname: localhost
    port: 7001
  client:
    # true表示向注册中心注册自己，因为这是业务模块
    register-with-eureka: true
    # 是否从EurekaServer抓取已有的注册信息，默认为true。单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
    fetch-registry: true
    service-url:
      defaultZone: http://${eureka.server.hostname}:${eureka.server.port}/eureka/
```

如果想将应用下线，即将register-with-eureka改为false。

<span style="color:orange">注意：</span>pay和order模块都必须指定spring.application.name即应用名，否则就无法注册到Eureka中，且名字是以中划线来分隔字母，注意不要使用下划线，否则会报错。

最后PayApplication上添加@EnableEurekaClient注解。

如果启动失败，使用try/catch包裹`SpringApplication.run(PayApplication.class, args);`查看是什么问题。

如果报错：Caused by: java.lang.NoSuchMethodError: 'com.google.gson.GsonBuilder com.google.gson.GsonBuilder.setLenient()'，启动类添加(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})排除这个自动检查。

如果报错：Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'eurekaAutoServiceRegistration' defined in class path resource \[org/springframework/cloud/netflix/eureka/EurekaClientAutoConfiguration.class]: Unsatisfied dependency expressed through method 'eurekaAutoServiceRegistration' parameter 1; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'eurekaServiceRegistry' defined in class path resource \[org/springframework/cloud/netflix/eureka/EurekaClientAutoConfiguration.class\]: Unexpected exception during bean creation; nested exception is java.lang.NoSuchMethodError: 'java.lang.reflect.Method org.springframework.util.ClassUtils.getInterfaceMethodIfPossible(java.lang.reflect.Method, java.lang.Class)'，先ctrl+shift+n查看全局，这个方法在哪，发现在spring-core中，所以引入依赖：

父pom.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.didnelpsun</groupId>
    <artifactId>springcloud</artifactId>
    <version>${project.version}</version>
    <modules>
        <module>common</module>
        <module>pay</module>
        <module>order</module>
        <module>eureka</module>
    </modules>
    <!--打包方式为pom-->
    <packaging>pom</packaging>

    <!--统一管理版本号-->
    <properties>
        <project.version>1.0-SNAPSHOT</project.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.version>5.3.19</spring.version>
        <spring.boot.version>2.6.6</spring.boot.version>
        <spring.cloud.version>3.1.1</spring.cloud.version>
        <mysql.version>8.0.28</mysql.version>
        <druid.version>1.2.9</druid.version>
        <lombok.version>1.18.22</lombok.version>
        <mybatis.version>2.2.2</mybatis.version>
        <eureka.version>3.1.1</eureka.version>
        <jackson.version>2.13.2</jackson.version>
    </properties>

    <!--子模块继承后锁定依赖版本-->
    <!--只锁定版本号，不引入依赖，所以子类要使用依赖还是需要显式引入依赖-->
    <!--如果需要覆盖，则自己在对应pom.xml指定-->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.didnelpsun</groupId>
                <artifactId>common</artifactId>
                <version>${project.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework/spring-core -->
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-core</artifactId>
                <version>${spring.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-dependencies -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>provided</scope>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-configuration-processor -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-configuration-processor</artifactId>
                <version>${spring.boot.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
                <version>${spring.boot.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-context -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-context</artifactId>
                <version>${spring.cloud.version}</version>
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
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-client -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
                <version>${eureka.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-server -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
                <version>${eureka.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind -->
            <dependency>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-databind</artifactId>
                <version>${jackson.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-core -->
            <dependency>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-core</artifactId>
                <version>${jackson.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-annotations -->
            <dependency>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-annotations</artifactId>
                <version>${jackson.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

pay的pom.xml：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
</dependency>
```

如果报错：org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'compositeCompatibilityVerifier' defined in class path resource \[org/springframework/cloud/configuration/CompatibilityVerifierAutoConfiguration.class\]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate \[org.springframework.cloud.configuration.CompositeCompatibilityVerifier\]: Factory method 'compositeCompatibilityVerifier' threw exception; nested exception is org.springframework.cloud.configuration.CompatibilityNotMetException，则证明版本有问题，需要调整。此时应该没有问题。

<span style="color:orange">注意：</span>如果此时发现Instances currently registered with Eureka还是空的，查看defaultZone后面的连接是否正确，必须是http协议，不能是https协议。

此时正常来看会有一个PAY服务注册成功。状态为UP。

#### &emsp;&emsp;注册单机订单模块

按照同样的过程将订单order模块也注册进入Eureka。

首先在order模块添加依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

修改YAML文件：

```yaml
server:
  # 客户端默认会访问80的端口
  port: 81

spring:
  application:
    name: order

remote:
  url: http://localhost
  port: 8001
  
eureka:
  # 自定义注册中心的主机名和端口的参数
  server:
    hostname: localhost
    port: 7001
  client:
    # true表示向注册中心注册自己，因为这是业务模块
    register-with-eureka: true
    # 是否从EurekaServer抓取已有的注册信息，默认为true。单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
    fetch-registry: true
    service-url:
      defaultZone: http://${eureka.server.hostname}:${eureka.server.port}/eureka/
```

在主启动类上添加@EnableEurekaClient注解并排除org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class。此时控制台又多出了一个ORDER应用。

### &emsp;Eureka集群

#### &emsp;&emsp;Eureka集群注册中心

实现方式就是相互注册，相互守望。由多个Eureka构成一个集群。

#### &emsp;&emsp;

### &emsp;Eureka配合actuator

### &emsp;Eureka服务发现

1. 先启动eureka主册中心。
2. 启动服务提供者pay支付服务。
3. 支付服务启动后会把自身信息，比如服务地址以别名方式注册进Eureka。
4. 消费者order服务在需要调用接口时，使用服务别名去注册中心获取实际的RPC远程调用地址。
5. 消费者获得调用地址后，底层实际是利用HttpClient技术实现远程调用。
6. 消费者获得服务地址后会缓存在本地JVM内存中，默认每间隔30秒更新一次服务调用地址。

服务发现：从注册中心上获取服务信息，实质是存key服务命取value调用地址。


### &emsp;Eureka自我保护机制

此时Eureka控制台会报错：EMERGENCY! EUREKA MAY BE INCORRECTLY CLAIMING INSTANCES ARE UP WHEN THEY'RE NOT. RENEWALS ARE LESSER THAN THRESHOLD AND HENCE THE INSTANCES ARE NOT BEING EXPIRED JUST TO BE SAFE.即Eureka可能会声明已经不存在的实例。刷新数小于阈值时，为了安全起见不会剔除过期实例。比如目前有10个微服务，只有8个有心跳反应时，（8/10=80%<85%）Eureka就会开启保护机制，过期的实例不会立马剔除。并且出这个紧急警告，在搭建Eureka Server时，比如我们搭建了2个Eureka Server，并且禁止自注册，Eureka Server自身算一个服务，那么其中任意一个Eureka，只能获得一个心跳，1/2=50%。那么也会出现这个警告。这种情况如果未禁止自注册的话是不会出现的，因为本机不会有什么网络问题，肯定是百分百。只有当我开启7台及以上的Eureka Server服务（关闭Eureka Server自注册）的时候，才不会出这个警告。那么当不想有这个红色警告是，本机自测可以关闭Eureka保护配置：`eureka.server.enable-self-preservation=false`。
