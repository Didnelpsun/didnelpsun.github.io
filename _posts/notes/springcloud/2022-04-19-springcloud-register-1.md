---
layout: post
title: "服务注册（上）"
date: 2022-04-19 15:09:47 +0800
categories: notes springcloud base
tags: SpringCloud 基础 Eureka 注册
excerpt: "服务注册（上）"
---

服务注册中心包括Eureka、Zookeeper、Consul、Nacos四个部分。

从原来的最基础的例子可以看出pay和order模块都调用common模块，order模块引用pay模块的服务。在传统的RPC远程调用框架中，管理每个服务与服务之间依赖关系比较复杂，管理比较复杂，所以需要使用服务治理，管理服务于服务之间依赖关系，可以实现服务调用、负载均衡、容错等，实现服务发现与注册。

这里主要讲Eureka。

## 概念

### &emsp;功能

Eureka采用了CS的没计架构，Eureka Sever作为服务注册功能的服务器，它是服务注册中心。而系统中的其他微服务，使用Eureka的客户端连接到Eureka Server并维持心跳连接。这样系统的维护人员就可以通过Eureka Server来监控系统中各个微服务是否正常运行。

在服务注册与发现中，有一个注册中心。当服务器启动的时候，会把当前自己服务器的信息比如服务地址通讯地址等以别名方式注册到注册中心上。另一方（消费者服务提供者），以该别名的方式去注册中心上获取到实际的服务通讯地址，然后再实现本地RPC调用RPC远程调用框架核心设计思想：在于注册中心，因为使用注册中心管理每个服务与服务之间的一个依赖关系（服务治理概念）。在任何RPC远程框架中，都会有一个注册中心（存放服务地址相关信息，如接口地址）。

+ Eureka Server提供服务注册服务：各个微服务节点通过配置启动后，会在EurekaServer中进行注册，这样Eureka Server中的服务注册表中将会存储所有可用服务节点的信息，服务节点的信息可以在界面中直观看到。
+ Eureka Client通过注册中心进行访问：是一个Java客户端，用于简化Eureka Server的交互，客户端同时也具备一个内置的、使用轮询（round-robin）负载算法的负载均衡器。在应用启动后，将会向Eureka Server发送心跳（默认周期为30秒）。如果Eureka Server在多个心跳周期内没有接收到某个节点的心跳,EurekaServer将会从服务注册表中把这个服务节点移除（默认90秒）。

### &emsp;运行流程

1. 先启动Eureka注册中心。
2. 启动服务提供者pay支付服务。
3. 支付服务启动后会把自身信息，比如服务地址以别名方式注册进Eureka。
4. 消费者order服务在需要调用接口时，使用服务别名去注册中心获取实际的RPC远程调用地址。
5. 消费者获得调用地址后，底层实际是利用HttpClient技术实现远程调用。
6. 消费者获得服务地址后会缓存在本地JVM内存中，默认每间隔30秒更新一次服务调用地址。

&emsp;

## 单机模式

### &emsp;单机注册中心

#### &emsp;&emsp;单机注册中心配置

首先需要新建一个Eureka注册中心，从而其他模块的服务能注册到这个注册中心中。

首先创建一个eureka7001的Maven模块。

首先添加server依赖，配置一个spring.cloud.version版本号，再添加：

父工程：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-server -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
    <version>${spring.cloud.version}</version>
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
    # Eureka服务端的实例名称
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

#### &emsp;&emsp;单机注册中心代码

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
public class Eureka7001Application {
    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }
}
```

运行。访问<http://localhost:7001/>（没有后面的eureka）查看注册中心。

#### &emsp;&emsp;单机注册中心报错

```txt
LoadBalancer is currently working with the default cache. While this cache implementation is useful for development and tests, it's recommended to use Caffeine cache in production.You can switch to using Caffeine cache, by adding it and org.springframework.cache.caffeine.CaffeineCacheManager to the classpath.
```

参照<https://blog.csdn.net/JGMa_TiMo/article/details/121971430>解决，也可以不用管。

```txt
Request execution error. endpoint=DefaultEndpoint{ serviceUrl='http://localhost:8761/eureka/}, exception=I/O error on GET request for "http://localhost:8761/eureka/apps/": Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect; nested exception is org.apache.http.conn.HttpHostConnectException: Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect stacktrace=org.springframework.web.client.ResourceAccessException: I/O error on GET request for "http://localhost:8761/eureka/apps/": Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect; nested exception is org.apache.http.conn.HttpHostConnectException: Connect to localhost:8761 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect
```

表示程序中指定的<http://localhost:7001/eureka>注册中心地址无效，而用了SpringCloud默认的注册中心地址<http://localhost:8761/eureka>。此时需要检查YAML关于Eureka的配置，特别是defaultZone这个部分，可能是这个属性识别不到，或没有对齐。

```txt
Caused by: org.springframework.beans.BeanInstantiationException: Failed to instantiate \[org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter\]: Factory method 'requestMappingHandlerAdapter' threw exception; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'messageConverters' defined in class path resource \[org/springframework/boot/autoconfigure/http/HttpMessageConvertersAutoConfiguration.class\]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate \[org.springframework.boot.autoconfigure.http.HttpMessageConverters\]: Factory method 'messageConverters' threw exception; nested exception is org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'mappingJackson2HttpMessageConverter' defined in class path resource
```

表示缺乏JSON转换依赖，添加：

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

```txt
Correct the classpath of your application so that it contains compatible versions of the classes org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration$StandardGsonBuilderCustomizer and com.google.gson.GsonBuilder
```

启动类添加(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})排除这个自动检查。

如果启动后发现是404，查看spring-cloud-starter-netflix-eureka-server这个依赖是否正确导入、YAML是否配置成功、启动类是否添加@EnableEurekaServer注解。

### &emsp;注册单机支付模块

查看注册中心的Instances currently registered with Eureka显示No instances available表示还没有实例注入。

#### &emsp;&emsp;单机支付模块配置

所以要将支付模块注册为客户端进入，作为提供者。之后需要将订单模块注册为客户端进入，作为消费者。

所以依赖需要添加Eureka客户端，首先在父pom中添加版本控制：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    <version>${spring.cloud.version}</version>
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

#### &emsp;&emsp;单机支付模块报错

```txt
Caused by: java.lang.NoSuchMethodError: 'com.google.gson.GsonBuilder com.google.gson.GsonBuilder.setLenient()'
```

启动类添加(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})排除这个自动检查。

```txt
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'eurekaAutoServiceRegistration' defined in class path resource \[org/springframework/cloud/netflix/eureka/EurekaClientAutoConfiguration.class]: Unsatisfied dependency expressed through method 'eurekaAutoServiceRegistration' parameter 1; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'eurekaServiceRegistry' defined in class path resource \[org/springframework/cloud/netflix/eureka/EurekaClientAutoConfiguration.class\]: Unexpected exception during bean creation; nested exception is java.lang.NoSuchMethodError: 'java.lang.reflect.Method org.springframework.util.ClassUtils.getInterfaceMethodIfPossible(java.lang.reflect.Method, java.lang.Class)'
```

先ctrl+shift+n查看全局，这个方法在哪，发现在spring-core中，所以引入依赖：

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
        <module>pay8001</module>
        <module>order81</module>
        <module>eureka7001</module>
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
                <version>${spring.cloud.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-server -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
                <version>${spring.cloud.version}</version>
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

```txt
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'compositeCompatibilityVerifier' defined in class path resource \[org/springframework/cloud/configuration/CompatibilityVerifierAutoConfiguration.class\]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate \[org.springframework.cloud.configuration.CompositeCompatibilityVerifier\]: Factory method 'compositeCompatibilityVerifier' threw exception; nested exception is org.springframework.cloud.configuration.CompatibilityNotMetException
```

证明版本有问题，需要调整。此时应该没有问题。

<span style="color:orange">注意：</span>如果此时发现Instances currently registered with Eureka还是空的，查看defaultZone后面的连接是否正确，必须是http协议，不能是https协议。

此时正常来看会有一个PAY服务注册成功。状态为UP。

### &emsp;注册单机订单模块

按照同样的过程将订单order81模块也注册进入Eureka。

首先在order81模块添加依赖：

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
    name: order81

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

在主启动类上添加@EnableEurekaClient注解并排除org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class。此时控制台又多出了一个ORDER81应用。

&emsp;

## 集群模式

### &emsp;集群注册中心

实现方式就是相互注册，相互守望。由多个Eureka构成一个集群。我们这里使用两个Eureka注册中心。

#### &emsp;&emsp;集群注册中心配置

所以我们需要首先在C:\Windows\System32\drivers\etc的hosts目录下添加127.0.0.1 test注册一个主机名为test的主机。

然后复制eureka7001为eureka7002，在父pom.xml中添加eureka7002模块。并在IDEA中添加这个模块。

然后修改YAML相互注册，且注意defaultZone的hostname要更改，即使test和localhost指向的是一个地址，否则无法识别是集群：

```yaml
server:
  port: 7001

eureka:
  instance:
    # Eureka服务端的实例名称
    hostname: localhost
  # 自定义集群的hostname和port
  cluster:
    hostname:
      - test
    port:
      - 7002
  client:
    # false表示不向注册中心注册自己
    register-with-eureka: false
    # false表示白己端就是注册中心，我的职责就是维护服务实例，并不需要去检索服务
    fetch-registry: false
    service-url:
      # 设置与Eureka server交互的地址查询服务和注册服务都需要依赖这个地址
      defaultZone: http://${eureka.cluster.hostname[0]}:${eureka.cluster.port[0]}/eureka/
```

```yaml
server:
  port: 7002

eureka:
  instance:
    # Eureka服务端的实例名称
    hostname: test
  # 自定义集群的hostname和port
  cluster:
    hostname:
      - localhost
    port:
      - 7001
  client:
    # false表示不向注册中心注册自己
    register-with-eureka: false
    # false表示白己端就是注册中心，我的职责就是维护服务实例，并不需要去检索服务
    fetch-registry: false
    service-url:
      # 设置与Eureka server交互的地址查询服务和注册服务都需要依赖这个地址
      # 如果绑定多台就在defaultZone后面用逗号隔开
      defaultZone: http://${eureka.cluster.hostname[0]}:${eureka.cluster.port[0]}/eureka/
```

#### &emsp;&emsp;集群注册中心代码

修改eureka7002的artifactId。并修改Eureka7002Application.java：

```java
// Eureka7002Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})
// 开启Eureka服务，表示当前进程为Eureka服务注册中心
@EnableEurekaServer
public class Eureka7002Application {
    public static void main(String[] args) {
        SpringApplication.run(Eureka7002Application.class, args);
    }
}
```

启动这两个服务。分别访问<http://localhost:7001/>和<http://test:7002/>。

发现DS Replicas下出现了内容，7001端口出现的是test，7002端口出现的是localhost。此时就代表集群成功。

### &emsp;注册集群支付模块

修改YAML，只需要改serivce-url：

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
```

启动支付模块。记住启动前需要先启动Eureka集群。发现两个端口都有PAY服务。

### &emsp;注册集群订单模块

同理直接复制YAML的eureka部分：

```yaml
server:
  # 客户端默认会访问80的端口
  port: 81

spring:
  application:
    name: order81

remote:
  url: http://localhost
  port: 8001

eureka:
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
```

启动订单模块。发现两个端口都有ORDER81服务。

### &emsp;添加集群支付模块

#### &emsp;&emsp;集群支付模块配置

现在只有一个pay8001模块，而实际生产时应该有多个支付模块提供服务，所以新建一个pay8002模块。直接复制pay8001。

修改子pom.xml的artifactId为pay8002，将pay8002加入父项目pom.xml模块中，修改application.yaml：

```yaml
server:
  port: 8002

spring:
  application:
    name: pay
```

<span style="color:orange">注意：</span>此时虽然端口变化了，但是spring.application.name不变，因为虽然内部服务有多个服务者提供，但是将服务暴露出来还是一个pay。

#### &emsp;&emsp;集群支付模块启动类

重命名主启动类：

```java
// Pay8002Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})
@EnableEurekaClient
public class Pay8002Application {
    public static void main(String[] args) {
        try{
            SpringApplication.run(Pay8002Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### &emsp;&emsp;集群支付模块服务层

由于之前都是在固定的一个服务器中提供服务，所以下面就需要更改，让不同的服务器根据不同端口服务，如果一台宕机另一台提供服务。

由于有多个服务器共同提供服务，所以可以使用端口来区分，在pay8001和pay8002业务层中更改：

```java
// PayServiceImpl.java
package org.didnelpsun.service.impl;

import org.didnelpsun.entity.Pay;
import org.didnelpsun.entity.Result;
import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.dao.IPayDao;
import org.didnelpsun.service.IPayService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.didnelpsun.util.Code;

import javax.annotation.Resource;
import java.util.List;

@Service
@Slf4j
public class PayServiceImpl implements IPayService {
    @Value("${server.port}")
    private String port;
    @Resource
    private IPayDao payDao;

    @Override
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
    public Result<List<Pay>> selects() {
        List<Pay> result = payDao.selects();
        log.info("查询结果:" + result);
        if (result.size() > 0) {
            return new Result<>(Code.SUCCESS, "port:" + this.port + ":success", result);
        } else {
            return new Result<>(Code.NO_CONTENT, "port:" + this.port + ":no content", result);
        }
    }

    @Override
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
    public Result<Integer> delete(Long id) {
        Integer result = payDao.delete(id);
        log.info("删除结果:" + result);
        if (result > 0) {
            return new Result<>(Code.SUCCESS, "port:" + this.port + ":success", result);
        } else {
            return new Result<>(Code.NO_RESPONSE, "port:" + this.port + ":delete fail", result);
        }
    }
}
```

启动pay8002。访问<http://localhost:7001/>和<http://test:7002/>，Instances currently registered with Eureka的PAY发现其Availability Zones变为2，表示有2个服务器提供服务。

此时单独访问<http://localhost:8001/pay/1>，返回消息为port:8001:success，<http://localhost:8002/pay/1>，返回消息为port:8002:success。

#### &emsp;&emsp;集群支付模块负载均衡

此时订单访问<http://localhost:81/order/1>，返回消息为port:8001:success，且不断刷新发现一直都是这个8001提供服务。这是为什么？因为order81模块的OrderController中写死了请求路径。所以此时请求路径就要写请求的微服务名称，这里是PAY：

```java
@PostConstruct
public void setBaseUrl() {
//        this.baseUrl = this.url + ":" + this.port + "/pay";
    this.baseUrl = "http://PAY/pay";
}
```

此时如果直接访问会报错：Servlet.service() for servlet \[dispatcherServlet\] in context with path [] threw exception [Request processing failed; nested exception is org.springframework.web.client.ResourceAccessException: I/O error on GET request for "http://PAY/pay/1": PAY; nested exception is java.net.UnknownHostException: PAY] with root cause，这是因为访问PAY微服务时下面会有两个服务器主机，此时程序不知道提供哪个服务器的服务给请求。

此时需要在配置RestTemplate的ApplicationContextConfig类的getRestTemplate方法上添加@LoadBalanced提供给RestTemplate负载均衡的能力。然后重启。

访问<http://localhost:81/order/1>：返回值message的端口会轮询发生变化，8001和8002端口交替出现。这是默认负载均衡组件Ribbon的默认负载均衡策略：轮询。

&emsp;

## Actuator

### &emsp;引入依赖

首先导入actuator依赖，在父pom.xml中定版本

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-actuator -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
    <version>${spring.boot.version}</version>
</dependency>
```

在eureka-client服务提供者中引用，即order和pay模块中引用：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### &emsp;主机名称修改

Eureka控制台的应用的Status现在显示的是主机名:服务吗:端口的形式，如我的是Didnelpsun:order81:81，那么怎么样将主机名称隐藏？

在pay和order的YAML中修改eureka.instance：

```yaml
eureka:
  instance:
    instance-id: pay8001
```

```yaml
eureka:
  instance:
    instance-id: pay8002
```

```yaml
eureka:
  instance:
    instance-id: order81
```

原来的Didnelpsun:pay:8002 , Didnelpsun:pay:8001和Didnelpsun:order:81变为pay8002 , pay8001和order81。

### &emsp;IP地址修改

当前如果将鼠标移动到Status的pay8001时不会浮现IP地址显示，这是因为我们没有配置。

同理直接配置YAML的`eureka.instance.prefer-ip-address: true`。

此时悬浮到字母上浏览器左下角会浮现IP信息。

### &emsp;暴露地址

直接点击Status下的order81等会跳转到对应的actuator/info，如<http://didnelpsun:81/actuator/info>，但是此时报错404。

因为actuator需要对info端点进行暴露设置。在YAML中配置：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

此时就没问题，会默认返回{}。

此外访问对应health可以查看当前服务状态，如<http://didnelpsun:8002/actuator/health>返回"status":"UP"}。

&emsp;

## 服务发现

### &emsp;服务发现定义

服务发现就是从注册中心上获取服务信息，实质是存key服务命取value调用地址。就是对于注册到Eureka中的微服务可以通过服务发现来获取该服务的信息。需要服务通过代码将自己的信息暴露出来。

### &emsp;代码实现

在控制层上实现服务发现，因为服务发现只提供服务信息，不需要业务操作和数据操作。

pay8001的控制层只需要注入一个DiscoveryClient并添加两个方法：

```java
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

@Slf4j
@RestController()
@RequestMapping("/pay")
public class PayController {
    @Resource
    private IPayService payService;
    // 注意这里有两个实现，有netflix和cloud的
    // 要从cloud包中导入，因为netflix的没用getServices方法也无法自动注入
    @Resource
    private DiscoveryClient discoveryClient;

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
    public Result<Integer> insert(@RequestBody Pay pay) {
        return payService.insert(pay);
    }

    @PutMapping()
    public Result<Integer> update(@RequestBody Pay pay) {
        return payService.update(pay);
    }

    @DeleteMapping("/{id}")
    public Result<Integer> delete(@PathVariable long id) {
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

然后在主启动类上添加@EnableDiscoveryClient注解开启服务发现（也可以不加）。

同理其他pay8002和order81也是这样配置，添加内容不变。

访问<http://localhost:81/order/discovery>返回：

```txt
[
    "pay",
    "order"
]
```

访问<http://localhost:8001/pay/discovery/pay>返回：

```txt
[
    {
        "scheme": "http",
        "host": "192.168.0.108",
        "port": 8002,
        "metadata": {
            "management.port": "8002"
        },
        "secure": false,
        "instanceId": "pay8002",
        "serviceId": "PAY",
        "uri": "http://192.168.0.108:8002",
        "instanceInfo": {
            "instanceId": "pay8002",
            "app": "PAY",
            "appGroupName": null,
            "ipAddr": "192.168.0.108",
            "sid": "na",
            "homePageUrl": "http://192.168.0.108:8002/",
            "statusPageUrl": "http://192.168.0.108:8002/actuator/info",
            "healthCheckUrl": "http://192.168.0.108:8002/actuator/health",
            "secureHealthCheckUrl": null,
            "vipAddress": "pay",
            "secureVipAddress": "pay",
            "countryId": 1,
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            },
            "hostName": "192.168.0.108",
            "status": "UP",
            "overriddenStatus": "UNKNOWN",
            "leaseInfo": {
                "renewalIntervalInSecs": 30,
                "durationInSecs": 90,
                "registrationTimestamp": 1650450460782,
                "lastRenewalTimestamp": 1650450460782,
                "evictionTimestamp": 0,
                "serviceUpTimestamp": 1650450460782
            },
            "isCoordinatingDiscoveryServer": false,
            "metadata": {
                "management.port": "8002"
            },
            "lastUpdatedTimestamp": 1650450460782,
            "lastDirtyTimestamp": 1650450460748,
            "actionType": "ADDED",
            "asgName": null
        }
    },
    {
        "scheme": "http",
        "host": "192.168.0.108",
        "port": 8001,
        "metadata": {
            "management.port": "8001"
        },
        "secure": false,
        "instanceId": "pay8001",
        "serviceId": "PAY",
        "uri": "http://192.168.0.108:8001",
        "instanceInfo": {
            "instanceId": "pay8001",
            "app": "PAY",
            "appGroupName": null,
            "ipAddr": "192.168.0.108",
            "sid": "na",
            "homePageUrl": "http://192.168.0.108:8001/",
            "statusPageUrl": "http://192.168.0.108:8001/actuator/info",
            "healthCheckUrl": "http://192.168.0.108:8001/actuator/health",
            "secureHealthCheckUrl": null,
            "vipAddress": "pay",
            "secureVipAddress": "pay",
            "countryId": 1,
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            },
            "hostName": "192.168.0.108",
            "status": "UP",
            "overriddenStatus": "UNKNOWN",
            "leaseInfo": {
                "renewalIntervalInSecs": 30,
                "durationInSecs": 90,
                "registrationTimestamp": 1650450448274,
                "lastRenewalTimestamp": 1650450448274,
                "evictionTimestamp": 0,
                "serviceUpTimestamp": 1650450448274
            },
            "isCoordinatingDiscoveryServer": false,
            "metadata": {
                "management.port": "8001"
            },
            "lastUpdatedTimestamp": 1650450448274,
            "lastDirtyTimestamp": 1650450448241,
            "actionType": "ADDED",
            "asgName": null
        }
    }
]
```

&emsp;

## 自我保护机制

### &emsp;概念

保护模式主要用于一组客户端和Eureka Server之间存在网络分区场景下的保护。一旦进入保护模式,
Eureka Server将会尝试保护其服务注册表中的信息，不再立刻删除服务注册表中的数据，也就是不会注销任何微服务。是为了防止因为网络问题虽然提供服务但是暂时连接不到而剔除服务。默认超过90秒删除服务实例。

我们可以看到Eureka控制台会报错：EMERGENCY! EUREKA MAY BE INCORRECTLY CLAIMING INSTANCES ARE UP WHEN THEY'RE NOT. RENEWALS ARE LESSER THAN THRESHOLD AND HENCE THE INSTANCES ARE NOT BEING EXPIRED JUST TO BE SAFE.

即Eureka可能会声明已经不存在的实例。刷新数小于阈值时，为了安全起见不会剔除过期实例。比如目前有10个微服务，只有8个有心跳反应时，（8/10=80%<85%）Eureka就会开启保护机制，过期的实例不会立马剔除。并且出这个紧急警告，在搭建Eureka Server时，比如我们搭建了2个Eureka Server，并且禁止自注册，Eureka Server自身算一个服务，那么其中任意一个Eureka，只能获得一个心跳，1/2=50%。那么也会出现这个警告。这种情况如果未禁止自注册的话是不会出现的，因为本机不会有什么网络问题，肯定是百分百。只有当我开启7台及以上的Eureka Server服务（关闭Eureka Server自注册）的时候，才不会出这个警告。

### &emsp;禁止保护

那么当不想有这个红色警告：

+ 可以在注册中心eureka7001、eureka7002通过`eureka.server.enable-self-preservation=false`关闭Eureka的保护配置，通过`eureka.server.eviction-interval-time-in-ms`设置剔除监听心跳时间，超过这个时间没监听到就下线。
+ 可以在服务提供者pay8001、pay8002通过`eureka.instance.lease-renewal-interval-in-seconds`设置Eureka客户端向服务端发送心跳的时间间隔，默认30秒，`eureka.instance.lease-expiration-duration-in-seconds`设置Eureka服务端收到最后一次心跳后等待时间上限，单位为秒，超时将剔除服务，默认90秒。
