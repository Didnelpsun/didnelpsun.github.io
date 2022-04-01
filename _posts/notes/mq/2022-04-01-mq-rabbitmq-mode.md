---
layout: post
title:  "RabbitMQ模式"
date:   2022-04-01 15:12:42 +0800
categories: notes mq rabbitmq
tags: MQ RabbitMQ 模式
excerpt: "RabbitMQ模式"
---

接下来会介绍之前讲到的六种模式。首先利用IDEA建立一个空项目rabbitmq_mode。

## 简单模式

### &emsp;配置

新建一个hello_world的Maven模块，然后添加对应依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.didnelpsun</groupId>
    <artifactId>hello_world</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

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
    </dependencies>

</project>
```

定义一个静态的配置信息类：

```java
// Property.java
package org.didnelpsun.util;

public class Property {
    public static final String host = "127.0.0.1";
    public static final int port = 5672;
    public static final String username = "guest";
    public static final String password = "guest";
    // 队列名称
    public static final String QUEUE_NAME = "hello-world";
}
```

### &emsp;生产者

新建一个生产者：

```java
// Producer.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.didnelpsun.util.Property;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.util.Property.QUEUE_NAME;

public class Producer {

    public void send() throws IOException, TimeoutException {
        send(QUEUE_NAME);
    }

    // 发送消息
    public void send(String message) throws IOException, TimeoutException {
        // 创建连接工厂
        ConnectionFactory connectionFactory = new ConnectionFactory();
        // 设置参数
        connectionFactory.setHost(Property.host);
        connectionFactory.setUsername(Property.username);
        connectionFactory.setPassword(Property.password);
        // 建立连接
        Connection connection = connectionFactory.newConnection();
        // 创建信道
        Channel channel = connection.createChannel();
        // 生成队列，有五个参数
        // 第一个队列名字
        // 第二个是否持久化，true保存消息到磁盘，false只在内存中保存消息
        // 第三个是否需要排他，该队列是否只供一个消费者消费，true为排他，false共享
        // 第四个表示是否自动删除，最后一个消费者断开连接后是否自动删除该队列
        // 第五个是队列参数，如延迟等
        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        // 发布消息
        // 第一个参数为交换机名
        // 第二个参数为路由Key，可以直接写队列名
        // 第三个参数为附加参数
        // 第四个参数为消息体
        channel.basicPublish("", QUEUE_NAME, null, message.getBytes());
        System.out.println("消息发送成功");
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Producer().send();
    }
}
```

注意此时的queueDeclare的第三个参数不能设置true，由于ActiveMQ中消费者也可以是生产者，所以这个队列只能生产者一个人占用，消费者无法使用，必须设为false。

### &emsp;消费者

新建一个消费者：

```java
// Consumer.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.didnelpsun.util.Property;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.util.Property.QUEUE_NAME;

public class Consumer {

    public void receive() throws IOException, TimeoutException {
        // 创建连接工厂
        ConnectionFactory connectionFactory = new ConnectionFactory();
        // 设置参数
        connectionFactory.setHost(Property.host);
        connectionFactory.setUsername(Property.username);
        connectionFactory.setPassword(Property.password);
        // 建立连接
        Connection connection = connectionFactory.newConnection();
        // 创建信道
        Channel channel = connection.createChannel();
        // 消费消息，有四个参数
        // 第一个参数为队列名
        // 第二个参数为消费成功后是否自动确认
        // 第三个参数为成功消费的回调函数实现
        // 第四个参数为失败消费的回调函数实现
        channel.basicConsume(QUEUE_NAME, true, (consumerTag, message) -> {
            System.out.println("成功接受：" + new String(message.getBody(), StandardCharsets.UTF_8));
        }, (consumerTag) -> {
            System.out.println("消费中断：" + new String(consumerTag.getBytes(StandardCharsets.UTF_8)));
        });
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Consumer().receive();
    }
}
```

运行消费者就能得到生产者的消息。

&emsp;

## 工作模式

工作队列，又称任务队列的主要思想是避免立即执行资源密集型任务，而不得不等待它完成。相反我们安排任务在之后执行。我们把任务封装为消息并将其发送到队列。在后台运行的工作让程将弹出任务并最终执行作业。当有多个工作线程时，这些工作线程将一起处理这些任务。即原来是队列直接发送到消费者，现在队列发送给多个工作线程进行并发处理。

新建一个work_queue模块，直接将pom.xml的依赖粘贴过去。直接复制Property.java。

### &emsp;轮训分发

一个消息只能被处理一次，不可以被处理多次。所以工作队列避免把一个消息发送给多个线程，使用了轮训分发机制，即一个个轮流发送给工作线程。

所以我们使用一个生产者和两个工作线程。

#### &emsp;&emsp;抽取工具类

由于消费者和生产者都需要一个信道和连接，所以为了避免代码重复我们将创建信道的过程抽取到util作为工具类：

```java
// RabbitUtil.java
package org.didnelpsun.util;

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
}
```

#### &emsp;&emsp;工作队列

然后复制消费者的代码修改成工作队列，由于是多个工作队列，为了区分添加一个id属性：

```java
// Worker.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import org.didnelpsun.util.RabbitUtil;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.util.Property.QUEUE_NAME;

public class Worker {
    public int id;

    public Worker() {
        this.id = 0;
    }

    public Worker(int id) {
        this.id = id;
    }

    public void receive() throws IOException, TimeoutException {
        // 创建信道
        Channel channel = RabbitUtil.getChannel();
        System.out.println("工作队列" + this.id + "等待消息...");
        // 消费消息，有四个参数
        // 第一个参数为队列名
        // 第二个参数为消费成功后是否自动确认
        // 第三个参数为成功消费的回调函数实现
        // 第四个参数为失败消费的回调函数实现
        channel.basicConsume(QUEUE_NAME, true, (consumerTag, message) -> {
            System.out.println("工作队列" + this.id + "成功接受：" + new String(message.getBody(), StandardCharsets.UTF_8));
        }, (consumerTag) -> {
            System.out.println("工作队列" + this.id + "消费中断：" + new String(consumerTag.getBytes(StandardCharsets.UTF_8)));
        });
    }
}
```

然后编写三个运行测试文件，不同的只有Worker的id：

```java
// Work1Run.java
package org.didnelpsun.service;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class Work1Run {

    public static void main(String[] args) throws IOException, TimeoutException {
        new Worker(1).receive();
    }
}
```

分别启动测试。

#### &emsp;&emsp;轮询生产

直接将hello_world的Producer复制过来修改：

```java
// Producer.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import org.didnelpsun.util.RabbitUtil;

import java.io.IOException;
import java.util.Scanner;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.util.Property.QUEUE_NAME;

public class Producer {

    public void send() throws IOException, TimeoutException {
        send(QUEUE_NAME);
    }

    // 发送消息
    public void send(String message) throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 生成队列，有五个参数
        // 第一个队列名字
        // 第二个是否持久化，true保存消息到磁盘，false只在内存中保存消息
        // 第三个是否需要排他，该队列是否只供一个消费者消费，true为排他，false共享
        // 第四个表示是否自动删除，最后一个消费者断开连接后是否自动删除该队列
        // 第五个是队列参数，如延迟等
        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        // 控制台接受消息判断是否还要发送
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()){
            // 发布消息
            // 第一个参数为交换机名
            // 第二个参数为路由Key，可以直接写队列名
            // 第三个参数为附加参数
            // 第四个参数为消息体
            channel.basicPublish("", QUEUE_NAME, null, (message + scanner.next()).getBytes());
        }
        System.out.println("消息发送成功");
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Producer().send();
    }
}
```

然后启动生产者。此时就能发现发送的消息会轮换的发送给每个工作队列。

### &emsp;消息应答

#### &emsp;&emsp;应答概念

消费者完成一个任务可能需要一段时问，如果其中一个消费者处理一个长的任务并仅只完成了部分然后它挂掉了，会发生什么情况？RabbitMQ一旦向消费者传说了一条消息，便立即将该消息标记为删除。在这种情祝下，突然有个消费者挂掉了，我们将丢失正在处理的消息。由于消费者接受不到消息，所以我们在后面发送消息时它也一样接受不到，且我们不知道这点，会不停地向消费者发消息造成浪费。

为了保证消息在发送过程中不丢失，RabbitMQ引入消息应答机制，消费者在接收到消息并且处理该消息之后，告诉RabbitMQ它已经处理了，RabbitMQ可以把该消息删除了。

#### &emsp;&emsp;自动应答

消息发送后立即被认为已经传送成功，这种模式需要在高吞吐量和数据传输安全性方面做权衡，因为这种模式如果消息在接收到之前，消费者那边出现连接或者信道关闭，那么消息就丢失了，当然另一方面这种模式消费者那边可以传递过载的消息，没有对传递的消息数量进行限制，当然这样有可能使得消费者这边由于接收太多还来不及处理的消息，导致这些消息的积压，最终使得内存耗尽，最终这些消费者线程被操作系统杀死，所以这种模式仅适用在消费者高速接受且连接安全的情况下使用。

#### &emsp;&emsp;手动应答

可以批量应答且减少忘了堵塞。

+ Channel.basicAck：用于肯定确认。RabbitMQ已知道该消息并且成功的处理消息，可以将其丢弃。
+ Channel.basicNack：用于否定确认。不处理该消息了直接拒绝，可以将其丢弃了。
+ Channel.basicReject：用于否定确认。与Channel.basicNack相比少一个批量处理参数multiple。

跟计网的数据报滑动窗口确认机制的累计确认很像，批量应答表示当前以及之前的消息全部被收到了，非批量应答表示当前消息收到了，其余的不知道。从而批量应答一条确认就能确认多条消息，速度更快，而非批量应答要一条条确认，安全性更高。

#### &emsp;&emsp;消息重新入队

此时还会有问题，如果RabbitMQ将消息发送给消费者一直等待ACK确认，但是此时消费者一直不确认，那么这个消息会一直呆在RabbitMQ内存中，那如果大量未ACK消息出现这些消息会将RabbitMQ的内存消耗殆尽，所以RabbitMQ的等待ACK是有时限的。

如果消费者由于某些原因失去连接（其通道已关闭，连接已关闭或TCP连接丢失），导致消息未发送ACK确认，RabbitMQ将了解到消息未完全处理，并将对其重新排队。如果此时其他消费者可以处理，它将很快将其重新分发给另一个消费者。这样，即使某个消费者偶尔死亡，也可以确保不会丢失任何消息。

此时可能存在重复消费问题，即虽然我没有ACK但是我处理了，RabbitMQ不知道我处理又发送给其他消费者处理。

#### &emsp;&emsp;手动应答代码

默认采取自动应答，先在工具类中定义一个线程睡眠方法：

```java
public static void sleep(int second){
    try{
        Thread.sleep(1000L * second);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

如果需要手动应答需要修改工作队列或消费者：

```java
// Worker.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import org.didnelpsun.util.RabbitUtil;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.util.Property.QUEUE_NAME;

public class Worker {
    public int id;

    public Worker() {
        this.id = 0;
    }

    public Worker(int id) {
        this.id = id;
    }

    public void receive() throws IOException, TimeoutException {
        // 创建信道
        Channel channel = RabbitUtil.getChannel();
        System.out.println("工作队列" + this.id + "等待消息...");
        // 消费消息，有四个参数
        // 第一个参数为队列名
        // 第二个参数为消费成功后是否自动确认
        // 第三个参数为成功消费的回调函数实现
        // 第四个参数为失败消费的回调函数实现
        channel.basicConsume(QUEUE_NAME, true, (consumerTag, message) -> {
            System.out.println("工作队列" + this.id + "成功接受：" + new String(message.getBody(), StandardCharsets.UTF_8));
        }, (consumerTag) -> {
            System.out.println("工作队列" + this.id + "消费中断：" + new String(consumerTag.getBytes(StandardCharsets.UTF_8)));
        });
    }

    // 传输一个参数表示确认消息的发送时间，确认不会是立刻发送
    public void receive(int second) throws IOException, TimeoutException {
        // 创建信道
        Channel channel = RabbitUtil.getChannel();
        System.out.println("工作队列" + this.id + "等待消息...");
        // 消费消息，有四个参数
        // 第一个参数为队列名
        // 第二个参数为消费成功后是否自动确认
        // 第三个参数为成功消费的回调函数实现
        // 第四个参数为失败消费的回调函数实现
        channel.basicConsume(QUEUE_NAME, false, (consumerTag, message) -> {
            // 沉睡
            RabbitUtil.sleep(second);
            System.out.println("工作队列" + this.id + "成功接受：" + new String(message.getBody(), StandardCharsets.UTF_8));
            // 使用消息的传输tag进行应答，并不进行批量应答
            channel.basicAck(message.getEnvelope().getDeliveryTag(), false);
        }, (consumerTag) -> {
            System.out.println("工作队列" + this.id + "消费中断：" + new String(consumerTag.getBytes(StandardCharsets.UTF_8)));
        });
    }
}
```

### &emsp;持久化
