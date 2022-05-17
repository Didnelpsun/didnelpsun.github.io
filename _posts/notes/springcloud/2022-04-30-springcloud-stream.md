---
layout: post
title: "消息驱动"
date: 2022-04-30 23:14:36 +0800
categories: notes springcloud base
tags: SpringCloud 基础 消息驱动 Stream
excerpt: "消息驱动"
---

## 概念

### &emsp;定义

即对消息中间件进行兼容，数据库使用RabbitMQ，而大数据分析时使用Kafka，此时就需要消息驱动来适配MQ之间的差异，从而不用关心MQ的细节，统一消息编程模型。

官方定义Spring Cloud Stream是一个构建消息驱动微服务的框架。

应用程序通过inputs消费者或者outputs生产者来与Spring Cloud Stream中binder对象交互。通过我们配置来binding（绑定），而Spring Cloud Stream的binder绑定器对象负责与消息中间件交互。所以，我们只需要搞清楚如何与Spring Cloud Stream交互就可以方便使用消息驱动的方式。

通过使用Spring Integration来连接消息代理中间件以实现消息事件驱动。

Spring Cloud Stream为一些供应商的消息中间件产品提供了个性化的自动化配置实现，引用了发布/订阅、消费组、分区的三个核心概念。目前仅支持RabbitMQ、Kafka。

[Spring Cloud Stream中文指导手册](https://m.wang1314.com/doc/webapp/topic/20971999.html)。

### &emsp;设计思想

标准MQ流程：

+ 生产者/消费者之间靠消息媒介Message传递信息内容。
+ 消息必须走特定的路径即消息通道MessageChannel。
+ 消息通道MessageChannel的子接口SubscribableChannel负责订阅，由MessageHandler消息处理器进行处理所订阅消息。

这些中间件的差异性导致我们实际项目开发给我们造成了一定的困扰，我们如果用了两个消息队列的其中一种，后面的业务需求，我想往另外一种消息队列进行迁移，这时候无疑就是一个灾难性的，一大堆东西都要重新推倒重新做，因为它跟我们的系统耦合了，这时候Spring Cloud Stream给我们提供了一种解耦合的方式。

通过定义绑定器Binder作为中间层，完美地实现了应用程序与消息中间件细节之间的隔离。通过向应用程序暴露统一的Channel通道，使得应用程序不需要再考虑各种不同的消息中间件实现。

### &emsp;基本流程

+ Binder：消息组件的连接中间件，屏蔽差异。
+ Channel：通道，是队列Queue的一种抽象，在消息通讯系统中就是实现存储和转发的媒介，是队列Queue的一种抽象，在消息通讯系统中就是实现存储和转发的媒介，通过Channel对队列进行配置。
+ Source和Sink：简单的可理解为参照对象是Spring Cloud Stream自身，从Stream发布消息就是输出，接受消息就是输入。

&emsp;

[官方案例](https://github.com/spring-cloud/spring-cloud-stream-samples)。

可以使用注解（被废弃）也可以使用函数式。

## 注解式

### &emsp;生产者

新建一个Maven的provider8801作为生产者进行消息发送。

#### &emsp;&emsp;生产者配置

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

    <artifactId>provider8801</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
        </dependency>
    </dependencies>

</project>
```

```yaml
server:
  port: 8801

spring:
  application:
    name: provider
  cloud:
    # 配置Stream
    stream:
      # 服务整合
      bindings:
        # 为输出通道名称
        output:
          # 使用的交换机或交换机的名称
          destination: defaultExchange
          # 消息类型
          contentType: application/json
          # 绑定消息中间件具体配置
          binder: defaultRabbit
      # 配置绑定的RabbitMQ服务器
      binders:
        # 定义的名称，用于Binding整合
        defaultRabbit:
          # 消息组件类型
          type: rabbit
          # 消息组件配置环境
          environment:
            spring:
              rabbitmq:
                host: localhost
                port: 5672
                username: guest
                password: guest

eureka:
  instance:
    instance-id: provider8801
    prefer-ip-address: true
  client:
    # true表示向注册中心注册自己，因为这是业务模块
    register-with-eureka: true
    # 是否从EurekaServer抓取已有的注册信息，默认为true。单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
    fetch-registry: true
    service-url:
      defaultZone: http://localhost:7001/eureka/
```

#### &emsp;&emsp;生产者业务层

新建一个service软件包，然后新建一个接口：

```java
// IMessageProvider.java
package org.didnelpsun.service;

public interface IMessageProvider {
    String send(String text);
}
```

然后在下面新建一个impl包含实现类，通过send方法发送：

```java
// MessageProviderImpl.java
package org.didnelpsun.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.service.IMessageProvider;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Source;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.MessageChannel;

import javax.annotation.Resource;

// EnableBinding将channel和exchange绑定到一起
// Source类即定义消息推送的管道，即通过Source类将输入的不同种类的消息全部转换为源消息
@EnableBinding(Source.class)
@Slf4j
public class MessageProviderImpl implements IMessageProvider {
    @Resource
    // 消息发送管道
    private MessageChannel output;

    @Override
    public String send(String text) {
        // 发送消息
        output.send(MessageBuilder.withPayload(text).build());
        log.info("send:" + text);
        return text;
    }
}
```

#### &emsp;&emsp;控制层

新建一个controller软件包，然后新建：

```java
// MessageProviderController.java
package org.didnelpsun.controller;

import org.didnelpsun.service.IMessageProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
public class MessageProviderController {
    @Resource
    private IMessageProvider messageProvider;

    @GetMapping("/send/{text}")
    public String send(@PathVariable String text) {
        return messageProvider.send(text);
    }
}
```

#### &emsp;&emsp;主启动类

然后新建一个主启动类：

```java
// Provider8801Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})
@EnableEurekaClient
public class Provider8801Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Provider8801Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

启动RabbitMQ：`rabbitmq-server`、eureka7001和provider8001，然后访问<http://localhost:8801/send/test>，此时就会显示test。

### &emsp;消费者

新建一个consumer8901作为生产者进行消息接受者。

#### &emsp;&emsp;消费者配置

XML依赖是一样的，所以可以直接复制provider8801的依赖。

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

    <artifactId>consumer8901</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
        </dependency>
    </dependencies>

</project>
```

YAML主要的区别在于bindings的输入通道名，这里是input：

```yaml
server:
  port: 8901

spring:
  application:
    name: consumer
  cloud:
    # 配置Stream
    stream:
      # 服务整合
      bindings:
        # 为输入通道名称
        input:
          # 使用的交换机或交换机的名称
          destination: defaultExchange
          # 消息类型
          contentType: application/json
          # 绑定消息中间件具体配置
          binder: defaultRabbit
      # 配置绑定的RabbitMQ服务器
      binders:
        # 定义的名称，用于Binding整合
        defaultRabbit:
          # 消息组件类型
          type: rabbit
          # 消息组件配置环境
          environment:
            spring:
              rabbitmq:
                host: localhost
                port: 5672
                username: guest
                password: guest

eureka:
  instance:
    instance-id: consumer8901
    prefer-ip-address: true
  client:
    # true表示向注册中心注册自己，因为这是业务模块
    register-with-eureka: true
    # 是否从EurekaServer抓取已有的注册信息，默认为true。单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
    fetch-registry: true
    service-url:
      defaultZone: http://localhost:7001/eureka/
```

#### &emsp;&emsp;消费者业务层

由于是消费者，所以只有业务层，编写业务层，新建org.didnelpsun.service.MessageConsumer，这里类似监听器：

```java
// MessageConsumer.java
package org.didnelpsun.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.messaging.Message;

// 将channel和exchange绑定在一起
// 通过Sink类将源消息转换类型为不同种类的消息，这里是RabbitMQ类型消息
@EnableBinding(Sink.class)
@Slf4j
public class MessageConsumer {
    @Value("${server.port}")
    private String port;


    // 监听队列，用于消费者队列的消息接收
    // Sink.INPUT为常量，表示接收输入
    @StreamListener(Sink.INPUT)
    public void receive(Message<String> message) {
        log.info("receive " + this.port + ":" + message.getPayload());
    }
}
```

主类：

```java
// Consumer8901Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})
@EnableEurekaClient
public class Consumer8901Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Consumer8901Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

启动consumer8901，然后访问<http://localhost:8801/send/test>进行消息生产，消费者打印receive 8901:test表示消费成功，此时RabbitMQ的控制台流量图显示黄色和紫色两条线发生波动，其中黄色表示Publish生产，紫色表示Consumer ack消费确认。

&emsp;

## 分组

复制consumer8901为consumer8902。主要是XML配置模块名称、YAML修改端口号和实例名称、主类修改名称和代码。启动consumer8902。

### &emsp;重复消费

此时发送消息，访问<http://localhost:8801/send/test>，两个消费者都能收到，所以导致重复消费问题。这是因为不同的组可以重复消费，如果将这两个消费者都放在一个组，则彼此之间是竞争关系，所以能解决重复消费的问题。此时点击RabbitMQ控制台的Exchanges选项，点击defaultExchange交换机，然后就发现Bindings下绑定了两个组，两个组名都是随机给与的流水号，默认每一个模块都给一个不同的组。

直接在YAML配置文件的bindings.input.group:组名，就能指定当前模块消息绑定的组名。如配置为testGroup组，再次访问<http://localhost:8801/send/test>，此时就不会消费者同时都消费消息了。

### &emsp;持久化

只有对Stream进行分组，消息才能持久化，即消费者重启后还能收到错过的消息，如果没有分组，则消费者宕机的时候发送的消息都会丢失。

<!-- &emsp;

## 函数式

## 生产者

新建一个Maven的provider8801作为生产者进行消息发送。

### &emsp;配置

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

    <artifactId>provider8801</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.didnelpsun</groupId>
            <artifactId>common</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
        </dependency>
    </dependencies>

</project>
```

#### &emsp;&emsp;YAML配置

```yaml
server:
  port: 8801

spring:
  application:
    name: provider
  # 配置RabbitMQ
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
  cloud:
    stream:
      # 自定义通道名称
      # 输出通道名称，即该服务器是发送消息的
      # 应该以通道名-out/in-序号表示
      # out表示这是个消息发送者
      name: msg-out-0
      # 服务整合处理器
      bindings:
        ${spring.cloud.stream.name}:
          # 使用的交换机或交换机的名称
          destination: defaultExchange
          # 消息类型
          contentType: application/json

eureka:
  instance:
    instance-id: provider8801
    prefer-ip-address: true
  client:
    # true表示向注册中心注册自己，因为这是业务模块
    register-with-eureka: true
    # 是否从EurekaServer抓取已有的注册信息，默认为true。单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
    fetch-registry: true
    service-url:
      defaultZone: http://localhost:7001/eureka/
```

### &emsp;业务层

新建一个service软件包，然后新建一个接口：

```java
// IMessageProvider.java
package org.didnelpsun.service;

public interface IMessageProvider {
    String send();
}
```

然后在下面新建一个impl包含实现类，通过StreamBridge进行业务场景触发：

```java
// MessageProviderImpl.java
package org.didnelpsun.service.impl;

import org.didnelpsun.service.IMessageProvider;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class MessageProviderImpl implements IMessageProvider {
    @Resource
    private StreamBridge streamBridge;
    // 引入交换机名
    @Value("${spring.cloud.name}")
    private String exchangeName;

    public MessageProviderImpl(StreamBridge streamBridge) {
        this.streamBridge = streamBridge;
    }

    @Override
    public String send() {
        // 生成一个消息流水号并发送
        String serial = UUID.randomUUID().toString();
        // 发送消息，第一个为通道名称，第二个为发送消息内容
        streamBridge.send(exchangeName, MessageBuilder.withBody(serial.getBytes(StandardCharsets.UTF_8)).build());
        return serial;
    }
}
```

### &emsp;控制层

新建一个controller软件包，然后新建：

```java
// MessageProviderController.java
package org.didnelpsun.controller;

import org.didnelpsun.service.impl.MessageProviderImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
public class MessageProviderController {
    @Resource
    private MessageProviderImpl messageProvider;

    @GetMapping("/send")
    public String send() {
        return messageProvider.send();
    }
}
```

### &emsp;主启动类

然后新建一个主启动类：

```java
// Provider8801Application.java
package org.didnelpsun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration.class})
@EnableEurekaClient
public class Provider8801Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(Provider8801Application.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

启动eureka7001和provider8001，然后访问<http://localhost:8801/send/test>，此时就会显示test。

## 消费者

新建一个consumer8802作为生产者进行消息接受者。

XML依赖是一样的，所以可以直接复制provider8801的依赖。

编写业务层，新建org.didnelpsun.service.MessageConsumer，这里类似监听器：

上述代码的方法名，即Consumer的bean实例名channel8002需要是YAML配置中的通道名rabbit-in-0，应用程序启动后会自动接收生产者发送的消息。

启动consumer8002，然后访问<http://localhost:8801/send/test>，

复制consumer8802为consumer8803。 -->
