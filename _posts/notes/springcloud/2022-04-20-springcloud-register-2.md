---
layout: post
title: "注册发现（下）"
date: 2022-04-20 20:06:10 +0800
categories: notes springcloud base
tags: SpringCloud 基础 注册 Zookeeper Consul
excerpt: "注册发现（下）"
---

## ZooKeeper

根据[ZooKeeper集群]({% post_url /notes/zookeeper/2022-03-25-zookeeper-colony %})搭建ZooKeeper集群环境。

如果是按照原来的配置是4个ZooKeeper服务，其中有一个观察者。

### &emsp;ZooKeeper注册支付模块

创建一个新的pay8003模块直接复制pay8002，它不再由Eureka提供注册，而是由ZooKeeper提供。添加模块到父项目中。

#### &emsp;&emsp;ZooKeeper支付模块配置XML

将版本在父pom.xml中定义：

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
        <module>pay8002</module>
        <module>pay8003</module>
        <module>order81</module>
        <module>eureka7001</module>
        <module>eureka7002</module>
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
        <cloud.version>2021.0.1</cloud.version>
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
            <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-actuator -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-actuator</artifactId>
                <version>${spring.boot.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-dependencies -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${cloud.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-context -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-context</artifactId>
                <version>${spring.cloud.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-zookeeper-discovery -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
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

修改pom.xml并引入ZooKeeper依赖，把原来新加的依赖删掉：

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

    <artifactId>pay8003</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
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
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
        </dependency>
    </dependencies>

</project>
```

这里的spring-cloud-dependencies必须添加version，否则会找不到依赖。

#### &emsp;&emsp;ZooKeeper支付模块配置YAML

然后配置YAML：

```yaml
server:
  port: 8003

spring:
  application:
    name: pay
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/data
    username: root
    password: root
  # 配置ZooKeeper
  cloud:
    zookeeper:
      # 当前集群的端口是2181-2184
      connect-string: localhost:2181

mybatis:
  # 定义实体类所在的包
  type-aliases-package: org.didnelpsun.entity
  mapper-locations: classpath:mapper/*.xml
```

#### &emsp;&emsp;ZooKeeper支付模块主启动类

继续使用@EnableDiscoveryClient注解：

```java
// Pay8003Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class Pay8003Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Pay8003Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

其他基本上都是一样的。使用`zkCli -server 127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183,127.0.0.1:2184`启动集群控制台。

#### &emsp;&emsp;ZooKeeper支付模块启动

直接启动这个模块。可以将其他所有模块全部停止。

然后在控制台中使用`ls /`，发现返回[services, zookeeper]，继续`ls /services`，返回了\[pay\]，继续`ls /services/pay`，返回fc51ff1b-099c-4ec1-8b07-d842f5ec740e，这个就是pay服务实例的流水号。

执行`get /services/pay/fc51ff1b-099c-4ec1-8b07-d842f5ec740e`：

```txt
{
 "name": "pay",
 "id": "fc51ff1b-099c-4ec1-8b07-d842f5ec740e",
 "address": "Didnelpsun",
 "port": 8003,
 "sslPort": null,
 "payload": {
  "@class": "org.springframework.cloud.zookeeper.discovery.ZookeeperInstance",
  "id": "pay",
  "name": "pay",
  "metadata": {
   "instance_status": "UP"
  }
 },
 "registrationTimeUTC": 1650466370198,
 "serviceType": "DYNAMIC",
 "uriSpec": {
  "parts": [{
   "value": "scheme",
   "variable": true
  }, {
   "value": "://",
   "variable": false
  }, {
   "value": "address",
   "variable": true
  }, {
   "value": ":",
   "variable": false
  }, {
   "value": "port",
   "variable": true
  }]
 }
}
```

默认这个节点是临时节点，在心跳时间过后会自动删除，默认是五个心跳时间。如果重新启动会更换一个新流水号。

### &emsp;ZooKeeper注册订单模块

复制order81为order82。并把order82加入父工程子模块中。

#### &emsp;&emsp;ZooKeeper订单模块配置XML

直接修改pom.xml：

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

    <artifactId>order82</artifactId>

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
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
        </dependency>
    </dependencies>

</project>
```

#### &emsp;&emsp;ZooKeeper订单模块配置YAML

然后修改YAML，换一个远程请求端口：

```yaml
server:
  # 客户端默认会访问80的端口
  port: 82

spring:
  application:
    name: order
  cloud:
    zookeeper:
      connect-string: localhost:2181

remote:
  url: http://localhost
  port: 8003
```

#### &emsp;&emsp;ZooKeeper订单模块主启动类

```java
// Order82Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class Order82Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Order82Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### &emsp;&emsp;ZooKeeper订单模块启动

启动。如果控制台报错：

```txt
Invalid config event received: {
    server.2=127.0.0.1:2002:3002:participant, 
    server.1=127.0.0.1:2001:3001:participant, 
    server.4=127.0.0.1:2004:3004:observer, 
    server.3=127.0.0.1:2003:3003:participant, version=0
}
```

执行`ls /services`，发现多了order，继续`ls /services/order`，发现`ls /services/order/7af31ba6-d0d2-49be-b4cc-62cc24126293`，执行`get /services/order/7af31ba6-d0d2-49be-b4cc-62cc24126293`：

```txt
{
 "name": "order",
 "id": "7af31ba6-d0d2-49be-b4cc-62cc24126293",
 "address": "Didnelpsun",
 "port": 82,
 "sslPort": null,
 "payload": {
  "@class": "org.springframework.cloud.zookeeper.discovery.ZookeeperInstance",
  "id": "order",
  "name": "order",
  "metadata": {
   "instance_status": "UP"
  }
 },
 "registrationTimeUTC": 1650509259852,
 "serviceType": "DYNAMIC",
 "uriSpec": {
  "parts": [{
   "value": "scheme",
   "variable": true
  }, {
   "value": "://",
   "variable": false
  }, {
   "value": "address",
   "variable": true
  }, {
   "value": ":",
   "variable": false
  }, {
   "value": "port",
   "variable": true
  }]
 }
}
```

如果执行<http://localhost:82/order>会报错：

```txt
Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is java.lang.IllegalStateException: No instances available for PAY] with root cause
```

因为Eureka的服务名是转为大写的，到ZooKeeper中却依然是小写服务名，所以原本的URL就不能用了，我们需要在控制层OrderController中修改地址，改为小写：

```java
@PostConstruct
public void setBaseUrl() {
    // this.baseUrl = this.url + ":" + this.port + "/pay";
    this.baseUrl = "http://pay/pay";
}
```

此时就是正常的。（<http://pay/pay>需要通过服务进行解析，直接访问是访问不到的）

如果想使用集群，则在connect-string后面加集群路径，以逗号分隔。

&emsp;

## Consul

### &emsp;Consul使用

可以查看[SpringCloud关于Consul中文教程](https://springcloud.cc/spring-cloud-consul.html)进行具体操作。

#### &emsp;&emsp;Consul概念

[Consul官网](https://www.consul.io/)可以看出，Consul是一套开源的分布式服务发现和配置管理系统，由HashiCorp公司用Go语言开发。提供了微服务系统中的服务治理、配置中心、控制总线等功能。这些功能中的每一个都可以根据需要单独使用，也可以一起使用以构建全方位的服务网格，总之Consul提供了一种完整的服务网格解决方案。

+ 服务发现：提供HTTP和DNS两种发现方式。
+ 健康监测：支持多种方式，HTTP、TCP、Docker、Shell脚本定制化。
+ KV存储：Key-Value的存储方式。
+ 多数据中心：Consul支持多数据中心。
+ 可视化Web界面。

#### &emsp;&emsp;Consul安装配置

到[Consul下载](https://www.consul.io/downloads)选择版本进行下载，Windows的386即32位，AMD64即64位。下载的是ZIP文件。加压后为一个exe文件，将这个文件移动到指定目录，可以将这个路径添加到环境变量中。

执行`consul --version`查看是否安装完成。

执行`consul agent -dev`启动，默认地址<http://localhost:8500>有一个前端界面。

### &emsp;Consul注册支付模块

首先复制pay8003为pay8004模块，然后配置这个模块到父工程中。

#### &emsp;&emsp;Consul支付模块配置XML

重新组织父pom.xml文件：

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
        <module>pay8002</module>
        <module>pay8003</module>
        <module>pay8004</module>
        <module>order81</module>
        <module>order82</module>
        <module>eureka7001</module>
        <module>eureka7002</module>
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
        <spring.cloud.dependencies.version>2021.0.1</spring.cloud.dependencies.version>
        <spring.cloud.eureka.version>${spring.cloud.version}</spring.cloud.eureka.version>
        <spring.cloud.zookeeper.version>${spring.cloud.version}</spring.cloud.zookeeper.version>
        <spring.cloud.consul.version>3.1.0</spring.cloud.consul.version>
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
            <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-actuator -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-actuator</artifactId>
                <version>${spring.boot.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-dependencies -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring.cloud.dependencies.version}</version>
                <type>pom</type>
                <scope>provided</scope>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-context -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-context</artifactId>
                <version>${spring.cloud.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-client -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
                <version>${spring.cloud.eureka.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-netflix-eureka-server -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
                <version>${spring.cloud.eureka.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-zookeeper-discovery -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
                <version>${spring.cloud.zookeeper.version}</version>
            </dependency>
            <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-consul-discovery -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-consul-discovery</artifactId>
                <version>${spring.cloud.consul.version}</version>
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

然后运行Maven，查看报错更改对应的子模块中的配置。

配置pay8004模块的pom.xml：

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

    <artifactId>pay8004</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
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
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring.cloud.dependencies.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-consul-discovery</artifactId>
            <version>${spring.cloud.consul.version}</version>
        </dependency>
    </dependencies>

</project>
```

#### &emsp;&emsp;Consul支付模块配置YAML

接着配置YAML：

```yaml
server:
  port: 8004

spring:
  application:
    name: pay
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/data
    username: root
    password: root
  # 配置Consul
  cloud:
    consul:
      host: localhost
      port: 8500
      # 注册到Consul中
      discovery:
        hostname: localhost
        service-name: ${spring.application.name}

mybatis:
  # 定义实体类所在的包
  type-aliases-package: org.didnelpsun.entity
  mapper-locations: classpath:mapper/*.xml

```

#### &emsp;&emsp;Consul支付模块主启动类

不变：

```java
// Pay8004Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class Pay8004Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Pay8004Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

启动。此时访问<http://localhost:8500/ui/dc1/services>，发现多了个pay，但是这里有个红叉，需要在YAML中在service-name同级配置`discovery.heartbeat:enabled: true`。

如果需要悬浮在服务名pay上显示IP地址，则在YAML中在service-name同级配置`prefer-ip-address: true`。

### &emsp;Consul注册订单模块

复制pay82模块为pay83模块。

#### &emsp;&emsp;Consul订单模块配置XML

直接修改pom.xml：

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

    <artifactId>order83</artifactId>

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
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring.cloud.dependencies.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-consul-discovery</artifactId>
            <version>${spring.cloud.consul.version}</version>
        </dependency>
    </dependencies>

</project>
```

#### &emsp;&emsp;Consul订单模块配置YAML

配置YAML：

```yaml
server:
  # 客户端默认会访问80的端口
  port: 83

spring:
  application:
    name: order
  cloud:
    consul:
      host: localhost
      port: 8500
      # 注册到Consul中
      discovery:
        hostname: localhost
        service-name: ${spring.application.name}
        heartbeat:
          enabled: true

remote:
  url: http://localhost
  port: 8004
```

#### &emsp;&emsp;Consul订单模块主启动类

```java
// Order83Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class Order83Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Order83Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

启动。访问<http://localhost:83/order/2>测试。

&emsp;

## 注册中心对比

组件名|语言|CAP|服务健康检对外暴露接口
:----:|:--:|:-:|:--------------------:
Eureka|Java|AP|可配支持|HTTP
Zookeeper|Java|CP|支持|客户端
Consul|Go|CP|支持|HTTP/DNS
