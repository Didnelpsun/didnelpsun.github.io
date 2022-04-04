---
layout: post
title:  "RabbitMQ高级队列"
date:   2022-04-04 22:03:11 +0800
categories: notes mq rabbitmq
tags: MQ RabbitMQ 队列
excerpt: "RabbitMQ高级应用与队列"
---

## 死信队列

之前已经讲述过死信队列就是无法被消费的信息所构成的队列。

### &emsp;死信队列概念

#### &emsp;&emsp;应用场景

为了保证消息数据不丢失，使用死信队列；当消息消费发生异常时，将消息投入死信队列中；还有信息消费超时时，使用死信队列。

#### &emsp;&emsp;死信来源

+ 消息TTL过期。
+ 队列达到最大长度，队列满了，无法再添加数据到MQ中。
+ 消息被拒绝，basic.reject或basic.nack，并且requeue=false不放回队列中。

### &emsp;死信队列代码

首先新建一个rabbitmq_queue的Maven项目，删掉src目录，新建一个utils模块，把原来[RabbitMQ模式：MQ/rabbitmq_mode](https://github.com/Didnelpsun/MQ/tree/main/rabbitmq_mode)的utils模块的两个文件粘过来。并修改一下：

```java
// Property.java
package org.didnelpsun;

public class Property {
    public static final String host = "127.0.0.1";
    public static final int port = 5672;
    public static final String username = "guest";
    public static final String password = "guest";
}
```

```java
// RabbitUtil.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class RabbitUtil {
    public static Channel getChannel() throws IOException, TimeoutException {
        // 创建连接工厂
        ConnectionFactory connectionFactory = new ConnectionFactory();
        // 设置参数
        connectionFactory.setHost(Property.host);
        connectionFactory.setUsername(Property.username);
        connectionFactory.setPassword(Property.password);
        // 建立连接
        Connection connection = connectionFactory.newConnection();
        // 创建信道
        return connection.createChannel();
    }

    // 简化打印方法
    public static void p(Object object) {
        System.out.println(object);
    }
}
```

新建一个dead_queue的Maven模块，并在父项目引入依赖：

```xml
<dependencies>
    <!--RabbitMQ客户端-->
    <!-- https://mvnrepository.com/artifact/com.rabbitmq/amqp-client -->
    <dependency>
        <groupId>com.rabbitmq</groupId>
        <artifactId>amqp-client</artifactId>
        <version>5.14.2</version>
    </dependency>
    <!--操作文件流-->
    <!-- https://mvnrepository.com/artifact/commons-io/commons-io -->
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.11.0</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/org.slf4j/slf4j-simple -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-nop</artifactId>
        <version>1.7.36</version>
        <scope>compile</scope>
    </dependency>
    <dependency>
        <groupId>org.didnelpsun</groupId>
        <artifactId>utils</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
</dependencies>
```

#### &emsp;&emsp;死信执行流程

首先确定死信队列执行流程。

首先确定一个生产者Producer生产消息，然后连接一个路由模式的名为normal_exchange的交换机，RoutingKey为normal_send给普通队列normal_queue，再由队列发送给消费者Consumer；如果死信条件满足，则将消息发送给路由模式的名为dead_exchange的交换机，RoutingKey为dead_send给死信队列dead_queue，再由队列发送给死信处理者Processor。

#### &emsp;&emsp;死信正常消费者

&emsp;

## 延迟队列

&emsp;

## 高级发布确认

&emsp;

## 幂等性

&emsp;

## 优先级队列

&emsp;

## 惰性队列

&emsp;
