---
layout: post
title: "消息总线"
date: 2022-04-27 18:06:12 +0800
categories: notes springcloud base
tags: SpringCloud 基础 消息总线 Bus
excerpt: "消息总线"
---

之前的全体配置还是需要进行手动发送POST请求，对于大量的微服务则需要大量的POST手动请求，是否可以使用广播对更新消息进行通知？需要更大范围的自动刷新方式，即通过总线。

通过总线需要通知其他部件进行更新，所以就需要使用消息进行通知，所以这里使用RabbitMQ。

## 概念

Bus配合Config实现配置动态刷新，Bus只支持两种消息代理：RabbitMQ和Kafka。能管理和传播分布式系统间的消息，就像一个分布式执行器，可用于广播状态更改、事件推送等，也可以当作微服务间的通信通道。

在微服务架构的系统中，通常会使用轻量级的消息代理来构建一个共用的消息主题，并让系统中所有微服务实例都连接上来。由于该主题中产生的消息会被所有实例监听和消费，所以称它为消息总线。在总线上的各个实例，都可以方便地广播一些需要让其他连接在该主题上的实例都知道的消息。

ConfigClient实例都监听MQ中同一个Topic（默认是springCloudBus）。当一个服务刷新数据的时候，它会把这个信息放入到Topic中，同一Topic的服务就能得到通知，然后去更新自身的配置。

&emsp;

## 全局广播

### &emsp;设计思想

1. 利用消息总线触发一个客户端/bus/refresh，而刷新所有客户端的配置。（一个客户端发送消息）
2. 利用消息总线触发一个服务端ConfigServer的/bus/refresh端点，而刷新所有客户端的配置。（中心发布消息）

显然第二种架构更合理，因为：

1. 打破了微服务的职责单一性，因为微服务本身是业务模块，它本不应该承担配置刷新的职责。
2. 破坏了微服务各节点的对等性。
3. 有一定的局限性。例如，微服务在迁移时，它的网络地址常常会发生变化，此时如果想要做到自动刷新，那就会增加更多修改。

### &emsp;配置

#### &emsp;&emsp;服务端

为配置中心服务端config3344添加消息总线支持：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

修改YAML：

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
  # RabbitMQ相关配置
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

management:
  endpoints:
    web:
      exposure:
        include: "*"
```

#### &emsp;&emsp;客户端

首先修改client3355，添加依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

修改YAML，添加RabbitMQ相关配置：

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
  # RabbitMQ相关配置
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

management:
  endpoints:
    web:
      exposure:
        include: "*"
```

复制client3355为client3366模块，修改YAML的port为3366，重命名主启动类。

启动RabbitMQ，然后启动config3344、client3355、client3366。

访问<http://localhost:3355/info>，<http://localhost:3366/info>查看config3344上的info数据，然后在Github上修改文件的info数据，更新，通过<http://localhost:3344/application-test.yaml>查看3344的数据，然后以POST方式更新config3344：`curl -X POST http://localhost:3344/actuator/busrefresh`（控制台应该是不会返回任何值的），再次访问就发现改变了。

此时在RabbitMQ控制台中查看Exchanges就能看到springCloudBus的主题交换机，这个就是默认生成的。

&emsp;

## 定点通知

假如只想通知client3366不想通知client3355，即通过<http://{配置中心主机}:{配置中心端口号}/actuator/busrefresh/{服务名:端口}>来进行发送。其中服务名为YAML文件的spring.application.name指定的名称，必须是小写。

/busrefresh请求不再发送到具体的服务实例上，而是发给config server通过destination参数类指定需要更新配置的服务或实例。

重新更改Github上面的数据并更新，然后发送`curl -X POST http://localhost:3344/actuator/busrefresh/client:3366`进行通知，此时client3366就发生变化，client3355则没有变化。

如果想通知多个，则发送目的地可以使用通配符表示。
