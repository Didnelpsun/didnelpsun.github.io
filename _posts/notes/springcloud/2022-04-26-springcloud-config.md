---
layout: post
title: "分布式配置"
date: 2022-04-26 21:37:58 +0800
categories: notes springcloud base
tags: SpringCloud 基础 配置 Config
excerpt: "分布式配置"
---

## 概念

对于一个微服务就会有一个pom.xml，而多个微服务就会产生大量的pom.xml；不同的情况需要不同的环境，至少需要开发DEV、生产PROD、测试TEST三种环境（还可能需要SIT系统集成测试、UAT用户验收测试）；此时就需要一个专门的配置中心管理这些配置。

SpringCloud Config为微服务架构中的微服务提供集中化的外部配置支持，配置服务器为各个不同微服务应用的所有环境提供了一个中心化的外部配置。

+ 集中管理配置文件。
+ 不同环境不同配置，动态化的配置更新，分环境部署比如dev/test/prod/beta/release。
+ 运行期间动态调整配置，不再需要在每个服务部署的机器上编写配置文件，服务会向配置中心统一拉取配置自己的信息。
+ 当配置发生变动时，服务不需要重启即可感知到配置的变化并应用新的配置。
+ 将配置信息以REST接口的形式暴露。

&emsp;

## 服务端

这里使用Github，首先在Github上面新建一个仓库，并克隆到本地，由于实例项目文件本身就会上传到github的仓库SpringCloud，所以这里就不用新建仓库。

新建模块config3344，这就是SpringCloud项目文件的配置中心模块。停止其他所有服务。

### &emsp;配置

XML添加一个config-server配置，不需要注册到Eureka，只需要一个依赖：

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

    <artifactId>config3344</artifactId>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-config-server</artifactId>
        </dependency>
    </dependencies>

</project>
```

```yaml
server:
  port: 3344

spring:
  application:
    name: config
  # 配置Git
  cloud:
    config:
      server:
        git:
          uri: https://github.com/Didnelpsun/SpringCloud.git
          # 搜索目录
          # 即在https://github.com/Didnelpsun/SpringCloud.git的目录的config3344包下找文件
          search-paths:
            - config3344
      # 读取分支
      label: main
```

添加主启动类：

```java
// Config3344Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@SpringBootApplication
@EnableConfigServer
public class Config3344Application {
    public static void main(String[] args) {
        SpringApplication.run(Config3344Application.class, args);
    }
}
```

启动访问<http://localhost:3344/main/pom.xml>，返回{"name":"main","profiles":["pom.xml"],"label":null,"version":"d45d1fce73369aafcd5b6881610744993ce5688d","state":null,"propertySources":[]}，读取的是JSON字符串文件信息，看不到具体内容。

### &emsp;读取配置规则

官方对于文件名和路径有固定的要求，其他位置的文件访问不到（也就是必须放在一级目录下，可以使用properties文件）：

+ /{label}/{application}-{profile}.yaml：<http://localhost:3344/main/config3344-dev.yaml>。
+ /{application}-{profile}.yaml：<http://localhost:3344/config3344-dev.yaml>。默认读取YAML文件中label配置的分支。
+ /{application}/{profile}/{label}：<http://localhost:3344/config3344/dev/main>。

如访问resources文件夹下的application.yaml就访问不到，将application.yaml移动到config3344包下上传文件，访问<http://localhost:3344/main/application.yaml>也能访问到了：{"name":"main","profiles":\["application.yaml"\],"label":null,"version":"f2455554ee604dfe154a0fd9682c2de13619fe55","state":null,"propertySources":\[{"name":"https://github.com/Didnelpsun/SpringCloud.git/file:C:\\Users\\DIDNEL~1\\AppData\\Local\\Temp\\config-repo-606187255158038058\\config3344\\application.yaml","source":{"server.port":3344,"spring.application.name":"config","spring.cloud.config.server.git.uri":"https://github.com/Didnelpsun/SpringCloud.git","spring.cloud.config.server.git.search-paths\[0\]":"config3344","spring.cloud.config.label":"main"}}\]}。

此时访问的是JSON串，因为我们的文件名不符合读取配置规则，只有添加-的才能访问的到，即按照上面两种方式才能直接访问内容，重命名为application-test.yaml再次上传，访问<http://localhost:3344/main/application-test.yaml>就可以查看内容了。

<span style="color:orange">注意：</span>Config默认分支为Master，而Github默认分支为Main。所以<http://localhost:3344/master/application-test.yaml>访问不到。

&emsp;

## 客户端

新建模块client3355，添加到父项目中。

### &emsp;依赖

在原有XML依赖中添加：

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

    <artifactId>client3355</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bootstrap</artifactId>
        </dependency>
    </dependencies>

</project>
```

### &emsp;bootstrap

这里不再是application.yaml而是一个bootstrap.yaml。

要将Client模块下的application.yaml文件改为bootstrap.yaml，这是很关键的，因为bootstrap.yaml是比application.yaml先加载的。applicaiton.yaml是用户级的资源配置项，bootstrap.yaml是系统级的，优先级更加高。Spring Cloud会创建一个Bootstrap Context，作为Spring应用的Application Context的父上下文。初始化的时候，Bootstrap Context负责从外部源加载配置属性并解析配置。这两个上下文共享一个从外部获取的Environment。

Bootstrap属性有高优先级，默认情况下，它们不会被本地配置覆盖。Bootstrap Context和Application Context有着不同的约定，所以新增了一个bootstrap.yaml文件，保证Bootstrap Context和Application Context配置的分离。

```yaml
server:
  port: 3355

spring:
  application:
    name: client
  cloud:
    config:
      # 分支名称
      label: main
      # 配置文件名称
      name: application
      # 后缀名称
      profile: test
      # URI地址
      uri: http://localhost:3344
      # 所以最后会读取localhost:3344上的main分支上的application-test.yaml文件
```

### &emsp;访问配置

添加软件包org.didnelpsun，然后在下面添加控制类controller.ClientController读取config3344的配置文件：

```java
// ClientController.java
package org.didnelpsun.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ClientController {
    @Value("${test.info}")
    private String info;

    @GetMapping("/info")
    public String getInfo(){
        return this.info;
    }
}
```

重写服务端config3344的application.yaml并上传：

```yaml
test:
  info:
    test
```

添加主类Client3355Application：

```java
// Client3355Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Client3355Application {
    public static void main(String[] args) {
        SpringApplication.run(Client3355Application.class, args);
    }
}
```

运行，访问<http://localhost:3355/info>返回test，代表访问成功。

### &emsp;动态刷新

每次更新服务端的YAML文件，客户端不会立刻更新获取的值，即服务端更新后客户端数据不能同步，客户端必须重启才能获取到最新的数据，那么重启是比较麻烦的，且无法知道服务端数据更新时间，所以如何动态刷新客户端数据？

首先添加spring-boot-starter-actuator依赖，然后修改YAML，暴露监控端口：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

在业务类控制层上添加@RefreshScope注解。重新启动。

如果此时更新服务端的文件，则client3355如果不重启还是不能获取最新的数据，这是因为需要发送POST请求（不能是GET请求）刷新client3355激活更新<http://localhost:3355/actuator/busrefresh>避免了重启3355。
