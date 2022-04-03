---
layout: post
title:  "RabbitMQ简单模式"
date:   2022-04-01 15:12:42 +0800
categories: notes mq rabbitmq
tags: MQ RabbitMQ 模式
excerpt: "RabbitMQ模式（上）"
---

接下来会介绍之前讲到的六种模式。首先利用IDEA建立一个Maven项目rabbitmq_mode，然后把src删掉。

添加对应依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.didnelpsun</groupId>
    <artifactId>rabbitmq_mode</artifactId>
    <packaging>pom</packaging>
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

## 简单队列模式

即一对一模式。

### &emsp;配置

新建一个hello_world的Maven模块。

然后需要一个工具类，定义一个utils的Maven模块用来存放所有模块都要用到的工具，定义一个静态的配置信息类：

```java
// Property.java
package org.didnelpsun;

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

在hello_world模块新建一个生产者，并导入utils模块依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.didnelpsun</groupId>
        <artifactId>utils</artifactId>
        <version>1.0-SNAPSHOT</version>
        <scope>compile</scope>
    </dependency>
</dependencies>
```

```java
// Producer.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.didnelpsun.Property;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.QUEUE_NAME;

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

运行生产者。

注意此时的queueDeclare的第三个参数不能设置true，由于ActiveMQ中消费者也可以是生产者，所以这个队列只能生产者一个人占用，消费者无法使用，必须设为false。

### &emsp;消费者

新建一个消费者：

```java
// Consumer.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.didnelpsun.Property;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.QUEUE_NAME;

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

## 工作队列模式

工作队列，又称任务队列，即一对多模式，主要思想是避免立即执行资源密集型任务，而不得不等待它完成。相反我们安排任务在之后执行。我们把任务封装为消息并将其发送到队列。在后台运行的工作让程将弹出任务并最终执行作业。当有多个工作线程时，这些工作线程将一起处理这些任务。即原来是队列直接发送到消费者，现在队列发送给多个工作线程进行并发处理。

新建一个work_queue模块。

### &emsp;轮训分发

一个消息只能被处理一次，不可以被处理多次。所以工作队列避免把一个消息发送给多个线程，使用了轮训分发机制，即一个个轮流发送给工作线程。

所以我们使用一个生产者和两个工作线程。

#### &emsp;&emsp;抽取工具类

由于消费者和生产者都需要一个信道和连接，所以为了避免代码重复我们将创建信道的过程抽取到utils模块作为工具类：

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
    public static void sleep(int second){
        try{
            Thread.sleep(1000L * second);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

给work_queue模块添加utils模块依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.didnelpsun</groupId>
        <artifactId>utils</artifactId>
        <version>1.0-SNAPSHOT</version>
        <scope>compile</scope>
    </dependency>
</dependencies>
```

#### &emsp;&emsp;工作队列

然后复制消费者的代码修改成工作队列，由于是多个工作队列，为了区分添加一个id属性：

```java
// Worker.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import org.didnelpsun.RabbitUtil;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.QUEUE_NAME;

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
import com.rabbitmq.client.MessageProperties;
import org.didnelpsun.RabbitUtil;

import java.io.IOException;
import java.util.Scanner;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.QUEUE_NAME;

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
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);
        // 控制台接受消息判断是否还要发送
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()){
            // 发布消息
            // 第一个参数为交换机名
            // 第二个参数为路由Key，可以直接写队列名
            // 第三个参数为附加参数
            // 第四个参数为消息体
            channel.basicPublish("", QUEUE_NAME, MessageProperties.PERSISTENT_TEXT_PLAIN, (message + scanner.next()).getBytes());
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
import org.didnelpsun.RabbitUtil;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.QUEUE_NAME;

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

然后修改运行测试文件传入睡眠秒数，分别为1、15、30。此时运行后虽然队列3很慢但是还是会继续等待，如果队列3中断，则会立刻被知道，进行消息重新入队，之前发送给队列3没有确认的消息会立刻被转发给队列1队列2。

### &emsp;不公平分发

从上面消息应答可以看出，使用轮训分发都是公平分发所以存在消费者消费速度差的问题，消费能力强的消费者往往需要等待消费能力若的消费者，造成消费者空闲，所以往往需要不公平分发来让每个消费者都最大减少空闲时间。

本身消息的发送就是异步发送的，所以在任何时候，信道上肯定不止只有一个消息，另外来自消费者的手动确认本质上也是异步的。因此这里就存在一个未确认的消息缓冲区，因此希望开发人员能限制此缓冲区的大小，以避免缓冲区里面无限制的未确认消息问题。

此时可以对消费者代码设置`channel.basicQos(n);`指定信道容纳待处理消息数量即预取值：如果是不设置就是公平分发，无论是否确认都会公平分发；其他数值就是不公平分发，表示RabbitMQ不要同时给一个消费者推送多于n个消息，即一旦有n个消息还没有确认，则该消费者将阻塞掉，直到有消息确认。

如`channel.basicQos(1);`，此时查看控制台中Channels的Consumers的Perfetch count就是1，表示当RabbitMQ对生产者消息进行分发时只要发现该消费者超过一个消息没有确认就不会给你分发。

通常，增加预取值将提高向消费者传递消息的速度。虽然自动应答传输消息速率是最佳的，但是，在这种情况下已传递但尚未处理的消息的数量也会增加，从而增加了消费者的RAM消耗（随机存取存储器）应该小心使用具有无限预处理的自动确认模式或手动确认模式，消费者消费了大量的消息如果没有确认的话，会导致消费者连接节点的内存消耗变大，所以找到合适的预取值是一个反复试验的过程，不同的负载该值取值也不同。100到300范围内的值通常可提供最佳的吞吐量，并且不会给消费者带来太大的风险。预取值为1是最保守的。当然这将使吞吐量变得很低，特别是消费者连接延迟很严重的情况下，以及消费者连接等待时间较长的环境。

消费者宕机了，如果是手动确认，那么信道中等待处理的消息会重新入队，如果是自动确认，那么信道中等待的消息会丢失。

### &emsp;持久化

#### &emsp;&emsp;队列持久化

队列是消息的容器，持久化方式就是将queueDeclare声明队列时将第二个参数设为true，如果此时修改后运行报错就在控制台把原来的队列删掉。此时再看控制台中的队列，此时Features会有一个D表示已经持久化。

如果没有持久化那么一旦停止生产者进程控制台的Queues中就显示为空。

#### &emsp;&emsp;消息持久化

如果要保存消息，则需要对消息持久化。消息发布basicPublish的第三个参数是附加参数，对消息进行处理，需要写上一个消息属性，在其中设置持久化`channel.basicPublish("", QUEUE_NAME, MessageProperties.PERSISTENT_TEXT_PLAIN, (message + scanner.next()).getBytes());`。

将消息标记为持久化并不能完全保证不会丢失消息。尽管它告诉RabbitMQ将消息保存到磁盘，但是这里依然存在当消息刚准备存储在磁盘的时候但是还没有存储完的时间点会出现问题，消息还在缓存的一个间隔点。此时并没有真正写入磁盘。持久性保证并不强，简单人物队列模式只支持这种程度的持久化，如果要更强的持久化则需要使用发布确认模式。

&emsp;

## 发布确认模式

持久化要求生产者设置队列持久化和消息持久化，但是此时也不能完全保证宕机不会丢失，此时写入磁盘时宕机也会丢失，所以就需要发布确认模式，保存磁盘成功后返回一个确认，此时再删除消息，从而保证了持久化。发布确认模式规定必须队列和消息都持久化。

新建一个publish_confirm模块。

### &emsp;发布确认原理

生产者将信道设置成发布确认模式，一旦信道进入发布确认模式，所有在该信道上面发布的消息都将会被指派一个唯一的ID（从1开始），一旦消息被投递到所有匹配的队列之后，代理就会发送一个确认给生产者（包含消息的唯一ID），这就使得生产者知道消息己经正确到达目的队列了，如果消息和队列是可持久化的，那么确认消息会在将消息写入磁盘之后发出，代理回传给生产者的确认消息中delivery-tag域包含了确认消息的序列号。（此外代理也可以设置basicAck的multiple域，表示到这个序列号之前的所有消息都已经得到了处理）

发布确认模式最大的好处在于他是异步的，一旦发布一条消息，生产者应用程序就可以在等信道返回确认的同时继续发送下一条消息，当消息最终得到确认之后，生产者应用便可以通过回调方法来处理该确认消息，如果RabbitMQ因为自身内部错误导致消息丢失，就会发送一条nack消息，生产者应用程序同样可以在回调方法中处理该nack消息。

使用`channel.confirmSelect();`方法来使用发布确认模式。

### &emsp;单个发布确认模式

#### &emsp;&emsp;单个发布确认特点

这是一种简单的确认方式，是一种同步发布确认的方式，也就是发布一个消息之后只有它被发布确认，后续的消息才能继续发布，`waitForConfirmsOrDie(long)`这个方法只有在消息被确认的时候才返回，如果在指定时间范围内这个消息没有被确认那么它将抛出异常。

这种确认方式有一个最大的缺点就是发布速度特别的慢，因为如果没有发布确认的消息就会阻塞所有后续消息的发布，这种方式最多提供每秒不超过数百条发布消息的吞吐量。当然对于某些应用程序来说这可能已经足够了。

#### &emsp;&emsp;单个发布确认代码

```java
// Producer.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.*;

public class Producer {
    // 批量发信息的个数
    public static final int COUNT = 100;

    // 单个确认
    public void sendSingle() throws IOException, TimeoutException, InterruptedException {
        Channel channel = RabbitUtil.getChannel();
        // 生成队列
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);
        // 开启发布确认
        channel.confirmSelect();
        // 获取开始时间
        long start = System.currentTimeMillis();
        // 批量发送消息
        for (int i = 0; i < COUNT; i++) {
            channel.basicPublish("", QUEUE_NAME, null, (String.valueOf(i)).getBytes(StandardCharsets.UTF_8));
            // 马上发布确认
            if (channel.waitForConfirms()) {
                System.out.println("消息" + i + "发送成功！");
            }
        }
        // 获取结束时间
        System.out.println("执行"+ COUNT +"条命令单独确认需要" + (System.currentTimeMillis() - start) + "毫秒");
    }

    public static void main(String[] args) throws IOException, InterruptedException, TimeoutException {
        // 单个发布确认
        new Producer().sendSingle();
    }
}
```

可以得出大概76毫秒。

### &emsp;批量发布确认模式

#### &emsp;&emsp;批量发布确认特点

上面那种方式非常慢，与单个等待确认消息相比，先发布一批消息然后一起确认可以极大地提高吞吐量，当然这种方式的缺点就是当发生故障导致发布出现问题时，不知道是哪个消息出现问题了，我们必须将整个批处理保存在内存中，以记录重要的信息而后重新发布消息。当然这种方案仍然是同步的，也一样阻塞消息的发布。

#### &emsp;&emsp;批量发布确认代码

添加一个新的方法，由于发布确认方法只有确认部分代码不一样，所以使用匿名表达式将公共部分抽取出来，并将参数放到utils的Porperty中：

```java
// Property.java
package org.didnelpsun;

public class Property {
    public static final String host = "127.0.0.1";
    public static final int port = 5672;
    public static final String username = "guest";
    public static final String password = "guest";
    // 队列名称
    public static final String QUEUE_NAME = "hello-world";
    // 发信息总个数
    public static final int COUNT = 1000;
    // 批量消息数
    public static final int BATCH = 105;
}
```

```java
// Producer.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.*;

public class Producer {
    // 传入处理方法
    public void send(int count, IConfirm iConfirm) throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 生成队列
        channel.queueDeclare(String.valueOf(count), true, false, false, null);
        // 开启发布确认
        channel.confirmSelect();
        // 获取开始时间
        long start = System.currentTimeMillis();
        // 批量发送消息方法，参数为信道以及发送信息条数
        // 返回值为布尔值，true为发送成功，false为发送失败
        if(!iConfirm.confirm(channel)){
            System.out.println("发送消息失败");
        }
        // 获取结束时间
        System.out.println("执行"+ count +"条命令确认需要" + (System.currentTimeMillis() - start) + "毫秒");
    }

    // 单个确认
    public void sendSingle(int count) throws IOException, TimeoutException {
        this.send(count, (channel) -> {
            try {
                // 批量发送消息
                for (int i = 1; i <= count; i++) {
                    channel.basicPublish("", QUEUE_NAME, null, (String.valueOf(i)).getBytes(StandardCharsets.UTF_8));
                    // 马上发布确认
                    if (channel.waitForConfirms()) {
                        System.out.println("消息" + i + "发送成功！");
                    }
                    else
                    {
                        System.out.println("消息" + i + "发送失败！");
                        return false;
                    }
                }
                return true;
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
                return false;
            }
        });
    }

    // 批量确认
    // 两个参数，第一个参数是发送消息的条数，第二个参数为批量确认中每批的条数
    public void sendBatch(int count, int batch) throws IOException, TimeoutException {
        this.send(count, (channel) -> {
            try {
                // 批量发送消息
                for (int i = 1; i <= count; i++) {
                    channel.basicPublish("", QUEUE_NAME, null, (String.valueOf(i)).getBytes(StandardCharsets.UTF_8));
                    // 如果到每一批再确认，即当前次数模批容量为0
                    if (i%batch==0){
                        if (channel.waitForConfirms()) {
                            System.out.println("消息第" + i/batch + "批（" + (i-batch) + "-" + i + "）发送成功！");
                        }
                        else
                        {
                            System.out.println("消息第" + i/batch + "批（" + (i-batch) + "-" + i + "）发送失败！");
                            return false;
                        }
                    }
                    // 如果总数不能被批数整除，则最后几个不能被确认
                    // 需要判断count能否被batch整除，如果不能则最后一个还要继续确认一次
                    if (!(count%batch==0)&&i==count){
                        if (channel.waitForConfirms()) {
                            System.out.println("消息第" + (i/batch+1) + "批（" + (i-i%batch) + "-" + i + "）发送成功！");
                        }
                        else{
                            System.out.println("消息第" + (i/batch+1) + "批（" + (i-i%batch) + "-" + i + "）发送失败！");
                            return false;
                        }
                    }
                }
                return true;
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
                return false;
            }
        });
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        // 单个发布确认
        new Producer().sendSingle(COUNT);
        // 批量发布确认
        new Producer().sendBatch(COUNT, BATCH);
    }
}
```

可以将打印字符串部分删掉然后再运行，避免大量打印的时间开销对运行造成的影响，这样打印出来的就只有运行时间，可以看出批量确认速度会快很多：

```txt
执行1000条命令确认需要299毫秒
执行1000条命令确认需要37毫秒
```

### &emsp;异步发布确认模式

异步确认虽然编程逻辑比上两个要复杂，但是性价比最高，无论是可靠性还是效率都没得说，他是利用回调函数来达到消息可靠性传递的，这个中间件也是通过函数回调来保证是否投递成功。

#### &emsp;&emsp;异步发布确认原理

在信道中会使用一个Map，key为消息序号，value为消息内容，消息成功或失败可以根据消息序号来定位。

Broker收到一条消息就会进行确认收到，回调确认函数向生产者进行确认。同理如果没有收到就会回调未确认函数通知生产者。

所以生产者不用堵塞等待确认，只需要不断的发送消息就可以了，如果收到未确认通知则按照通知上的消息序号重发消息。

#### &emsp;&emsp;异步发布确认代码

需要一个监听器来监听消息情况：

```java
// 异步确认
public void sendAsync(int count) throws IOException, TimeoutException {
    this.send(count, (channel) -> {
        try {
            // 准备消息监听器，监听消息成功或失败
            // 第一个参数是对确认的回调处理，第二个参数是对未确认的回调处理
            channel.addConfirmListener(
                    (deliveryTag, multiple)->{
                        // System.out.println("消息" + deliveryTag + "发送成功！");
                    }, (deliveryTag, multiple) ->{
                        // System.out.println("消息" + deliveryTag + "发送失败！");
                    }
            );
            // 批量发送消息，只负责发消息
            for (int i = 1; i <= count; i++) {
                channel.basicPublish("", QUEUE_NAME, null, (String.valueOf(i)).getBytes(StandardCharsets.UTF_8));
            }
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    });
}
```

如果打印确认消息会发现消息序号是混乱的，且即使异步确认函数执行完成打印：执行1000条命令确认需要xx毫秒，后面还是会打印消息xxx发送成功，这是因为确认是异步的，所以会有监听器和发布消息两个线程共同独立执行，所以即使程序次数执行完成，异步的确认还没有完全收到：

```txt
消息625发送成功！
消息630发送成功！
执行1000条命令确认需要41毫秒
消息643发送成功！
消息644发送成功！
```

此时再把打印字符串给注释掉，同时执行三种方式的确认函数：

```txt
执行1000条命令确认需要330毫秒
执行1000条命令确认需要32毫秒
执行1000条命令确认需要21毫秒
```

异步确认函数的速度是最快的。

#### &emsp;&emsp;异步未确认消息处理

最好的解决的解决方案就是把未确认的消息放到一个基于内存的能被发布线程访问的队列，比如说用ConcurrentLinkedQueue这个队列在发布确认回调与发布线程之间进行消息的传递。

由于异步确认会在确认代码之后完成，所以用来记录未处理消息的容器不能在确认代码中设置，不然会在异步确认完成前销毁，可以在对象中定义一个，在发消息时将消息全部加入，在发送成功时从容器把对应消息删除，最后容器中留下来的就是发送失败的消息：

```java
// Producer.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentNavigableMap;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.*;

public class Producer {
    // 定义一个处理未确认消息的容器
    // 必须适用于高并发且线程安全有序
    public ConcurrentSkipListMap<Long, String> confirm;

    // 传入处理方法
    public void send(int count, IConfirm iConfirm) throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 生成队列
        channel.queueDeclare(String.valueOf(count), true, false, false, null);
        // 开启发布确认
        channel.confirmSelect();
        // 获取开始时间
        long start = System.currentTimeMillis();
        // 批量发送消息方法，参数为信道以及发送信息条数
        // 返回值为布尔值，true为发送成功，false为发送失败
        if (!iConfirm.confirm(channel)) {
            System.out.println("发送消息失败");
        }
        // 获取结束时间
        System.out.println("执行" + count + "条命令确认需要" + (System.currentTimeMillis() - start) + "毫秒");
    }

    // 单个确认
    public void sendSingle(int count) throws IOException, TimeoutException {
        this.send(count, (channel) -> {
            try {
                // 批量发送消息
                for (int i = 1; i <= count; i++) {
                    channel.basicPublish("", QUEUE_NAME, null, (String.valueOf(i)).getBytes(StandardCharsets.UTF_8));
                    // 马上发布确认
                    if (channel.waitForConfirms()) {
//                        System.out.println("消息" + i + "发送成功！");
                    } else {
//                        System.out.println("消息" + i + "发送失败！");
                        return false;
                    }
                }
                return true;
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
                return false;
            }
        });
    }

    // 批量确认
    // 两个参数，第一个参数是发送消息的条数，第二个参数为批量确认中每批的条数
    public void sendBatch(int count, int batch) throws IOException, TimeoutException {
        this.send(count, (channel) -> {
            try {
                // 批量发送消息
                for (int i = 1; i <= count; i++) {
                    channel.basicPublish("", QUEUE_NAME, null, (String.valueOf(i)).getBytes(StandardCharsets.UTF_8));
                    // 如果到每一批再确认，即当前次数模批容量为0
                    if (i % batch == 0) {
                        if (channel.waitForConfirms()) {
//                            System.out.println("消息第" + i/batch + "批（" + (i-batch) + "-" + i + "）发送成功！");
                        } else {
//                            System.out.println("消息第" + i/batch + "批（" + (i-batch) + "-" + i + "）发送失败！");
                            return false;
                        }
                    }
                    // 如果总数不能被批数整除，则最后几个不能被确认
                    // 需要判断count能否被batch整除，如果不能则最后一个还要继续确认一次
                    if (!(count % batch == 0) && i == count) {
                        if (channel.waitForConfirms()) {
//                            System.out.println("消息第" + (i/batch+1) + "批（" + (i-i%batch) + "-" + i + "）发送成功！");
                        } else {
//                            System.out.println("消息第" + (i/batch+1) + "批（" + (i-i%batch) + "-" + i + "）发送失败！");
                            return false;
                        }
                    }
                }
                return true;
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
                return false;
            }
        });
    }

    // 异步确认
    public void sendAsync(int count) throws IOException, TimeoutException {
        this.send(count, (channel) -> {
            try {
                // 准备消息监听器，监听消息成功或失败
                // 第一个参数是对确认的回调处理，第二个参数是对未确认的回调处理
                channel.addConfirmListener(
                        (deliveryTag, multiple) -> {
                            if (multiple) {
                                // 如果是批处理则获取一批
                                // headMap返回这个标记之前的所有
                                ConcurrentNavigableMap<Long, String> confirmed = confirm.headMap(deliveryTag);
                                // 清除
                                confirmed.clear();
                            } else {
                                // 如果是非批处理，则删除已经确认的单条消息
                                confirm.remove(deliveryTag);
                            }
//                            System.out.println("消息" + deliveryTag + "发送成功！");
                        }, (deliveryTag, multiple) -> {
//                            System.out.println("消息" + deliveryTag + "发送失败！");
                            System.out.println("消息" + confirm.get(deliveryTag) + "发送失败");
                        }
                );
                // 批量发送消息，只负责发消息
                for (int i = 1; i <= count; i++) {
                    // 把消息放入容器
                    // key为getNextPublishSeqNo获取下一个发布的序号，value即message
                    // 因为现在还没有发布信息所以下一个发布的序号就是当前循环的序号
                    confirm.put(channel.getNextPublishSeqNo(), String.valueOf(i));
                    channel.basicPublish("", QUEUE_NAME, null, (String.valueOf(i)).getBytes(StandardCharsets.UTF_8));
                }
                return true;
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        });
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        // 单个发布确认
        new Producer().sendSingle(COUNT);
        // 批量发布确认
        new Producer().sendBatch(COUNT, BATCH);
        // 异步发布确认
        new Producer().sendAsync(COUNT);
    }
}
```

### &emsp;发布确认模式对比

+ 单独发布消息：同步等待确认，简单，但吞吐量非常有限。
+ 批量发布消息：批量同步等待确认，简单，合理的吞吐量，一旦出现问题但很难推断出是那条消息出现了问题。
+ 异步发布消息：最佳性能和资源使用，在出现错误的情况下可以很好地控制，但是实现起来稍微难些。

[RabbitMQ模式：MQ/rabbitmq_mode](https://github.com/Didnelpsun/MQ/tree/main/rabbitmq_mode)。
