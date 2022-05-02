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

复制consumer8802为consumer8803。
