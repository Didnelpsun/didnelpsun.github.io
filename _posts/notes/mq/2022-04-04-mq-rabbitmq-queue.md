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

#### &emsp;&emsp;死信队列应用场景

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

首先确定一个生产者Producer生产消息，然后连接一个路由模式的名为normal_exchange的交换机，RoutingKey为normal_route给普通队列normal_queue，再由队列发送给消费者Consumer；如果死信条件满足，则将消息发送给路由模式的名为dead_exchange的交换机，RoutingKey为dead_route给死信队列dead_queue，再由队列发送给死信处理者Processor。

在dead_queue模块中添加一个Property文件，作为这个模块自己依赖的常量：

```java
// Property.java
package org.didnelpsun;

public class Property {
    public static final String NORMAL_EXCHANGE = "normal_exchange";
    public static final String DEAD_EXCHANGE = "dead_exchange";
    public static final String NORMAL_QUEUE = "normal_queue";
    public static final String DEAD_QUEUE = "dead_queue";
    public static final String NORMAL_ROUTE = "normal_route";
    public static final String DEAD_ROUTE = "dead_route";
}
```

#### &emsp;&emsp;死信连接配置

我们是非持久化队列，所以在一开始就要绑定对应交换机、连接、队列，为了降低耦合，将建立连接和绑定关系的部分单独拿出来，消费者、生产者、处理者只做自己的简单逻辑而不关心连接问题。

首先需要绑定一个正常队列，然后需要绑定一个死信队列，并给指定队列交换机信息。死信条件满足后MQ会自动放到死信队列，不需要消费者自己编写处理逻辑。

```java
// Connection.java
package org.didnelpsun;

import com.rabbitmq.client.BuiltinExchangeType;
import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.RabbitUtil.*;
import static org.didnelpsun.Property.*;

public class Connection {
    // 普通交换机名称
    public String normalExchange;
    // 死信交换机名称
    public String deadExchange;
    // 普通队列名称
    public String normalQueue;
    // 死信队列名称
    public String deadQueue;
    // 普通发送RoutingKey
    public String normalRoute;
    // 死信队列RoutingKey
    public String deadRoute;

    public Connection() {
        this.normalExchange = NORMAL_EXCHANGE;
        this.deadExchange = DEAD_EXCHANGE;
        this.normalQueue = NORMAL_QUEUE;
        this.deadQueue = DEAD_QUEUE;
        this.normalRoute = NORMAL_ROUTE;
        this.deadRoute = DEAD_ROUTE;
    }

    public Connection(String normalExchange, String deadExchange, String normalQueue, String deadQueue, String normalRoute, String deadRoute) {
        this.normalExchange = normalExchange;
        this.deadExchange = deadExchange;
        this.normalQueue = normalQueue;
        this.deadQueue = deadQueue;
        this.normalRoute = normalRoute;
        this.deadRoute = deadRoute;
    }

    // 开始建立连接并绑定关系
    public void build() throws IOException, TimeoutException {
        // 获取信道
        Channel channel = getChannel();
        // 声明交换机
        channel.exchangeDeclare(this.normalExchange, BuiltinExchangeType.DIRECT);
        channel.exchangeDeclare(this.deadExchange, BuiltinExchangeType.DIRECT);
        // 声明普通队列
        // 但是普通队列需要在死信条件满足时将消息发送给死信交换机，所以就需要设置最后的Map参数
        Map<String, Object> arguments = new HashMap<>();
        // 设置消费异常时转发死信交换机的名称，key为固定值
        arguments.put("x-dead-letter-exchange", this.deadExchange);
        // 设置死信交换机发送死信给队列的路由RoutingKey
        arguments.put("x-dead-letter-routing-key", this.deadRoute);
        channel.queueDeclare(this.normalQueue, false, false, false, arguments);
        // 声明死信队列
        channel.queueDeclare(this.deadQueue, false, false, false, null);
        // 绑定交换机与队列
        channel.queueBind(normalQueue, normalExchange, normalRoute);
        channel.queueBind(deadQueue, deadExchange, deadRoute);
        p("连接建立");
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Connection().build();
    }
}
```

运行建立连接关系。其中控制台的Queues会显示一个normal_queue，其中Features会显示DLX死信交换机，DLK死信RoutingKey。如果没有显示就证明其中的设置有问题。

#### &emsp;&emsp;死信消费者与处理者

消费者和处理者代码基本上，差别只在队列名称，这里只需要获取正常队列然后消费队列上的消息：

```java
// Consumer.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.RabbitUtil.*;

public class Consumer {
    public String queueName;

    public Consumer(String normalQueue) {
        this.queueName = normalQueue;
    }

    // 正常接收消息
    public void receive() throws IOException, TimeoutException {
        // 获取信道
        Channel channel = getChannel();
        p("等待接收消息...");
        // 消费消息
        channel.basicConsume(this.queueName, true, (consumerTag, message) -> {
            p("消息" + consumerTag + "接收成功：" + new String(message.getBody(), StandardCharsets.UTF_8));
        },  consumerTag -> p("消息" + consumerTag + "接收失败"));
    }
}
```

新建一个死信消费者：

```java
// DeadConsumerRun.java
package org.didnelpsun;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.DEAD_QUEUE;

public class DeadConsumerRun {
    public static void main(String[] args) throws IOException, TimeoutException {
        new Consumer(DEAD_QUEUE).receive();
    }
}
```

运行。

#### &emsp;&emsp;TTL过期

TTL一般由生产者指定，所以每一条消息的TTL在生产者那里提供设置，TTL过期放到死信队列是MQ自动完成的，不需要消费者自己编写代码处理过期消息。

除此之外，生产者只需要发送消息给正常交换机和正常指定路由就可以了。

```java
// Producer.java
package org.didnelpsun;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.*;
import static org.didnelpsun.RabbitUtil.*;

public class Producer {
    // 普通交换机名称
    public String normalExchange;
    // 普通发送RoutingKey
    public String normalRoute;

    public Producer() {
        this.normalExchange = NORMAL_EXCHANGE;
        this.normalRoute = NORMAL_ROUTE;
    }

    public Producer(String normalExchange, String normalRoute) {
        this.normalExchange = normalExchange;
        this.normalRoute = normalRoute;
    }

    public void send() throws IOException, TimeoutException {
        Channel channel = getChannel();
        p("输入消息：");
        // 设置消息与TTL
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()) {
            String message = scanner.next();
            p("输入TTL：");
            int ttl = scanner.nextInt();
            // 设置过期时间参数，单位为毫秒
            AMQP.BasicProperties properties = new AMQP.BasicProperties().builder().expiration(String.valueOf(ttl)).build();
            channel.basicPublish(this.normalExchange, this.normalRoute, properties, message.getBytes(StandardCharsets.UTF_8));
            p("输入消息：");
        }
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Producer().send();
    }
}
```

运行。

normal_queue的Ready和Total先为1然后都为0，dead_queue始终为0，因为DeadConsumerRun将死信消费掉了。

#### &emsp;&emsp;队列达到最大长度

队列达到最大长度成为死信的配置依然在生产者代码中。指定最大长度后多出来的消息会被放入死信队列中。

直接对连接添加参数"x-max-length"：

```java
// Connection.java
package org.didnelpsun;

import com.rabbitmq.client.BuiltinExchangeType;
import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.RabbitUtil.*;
import static org.didnelpsun.Property.*;

public class Connection {
    // 普通交换机名称
    public String normalExchange;
    // 死信交换机名称
    public String deadExchange;
    // 普通队列名称
    public String normalQueue;
    // 死信队列名称
    public String deadQueue;
    // 普通发送RoutingKey
    public String normalRoute;
    // 死信队列RoutingKey
    public String deadRoute;
    // 最大长度限制，最大值为非零值
    public int maxLen;

    public Connection() {
        this.normalExchange = NORMAL_EXCHANGE;
        this.deadExchange = DEAD_EXCHANGE;
        this.normalQueue = NORMAL_QUEUE;
        this.deadQueue = DEAD_QUEUE;
        this.normalRoute = NORMAL_ROUTE;
        this.deadRoute = DEAD_ROUTE;
        this.maxLen = 0;
    }

    public Connection(int maxLen) {
        this.normalExchange = NORMAL_EXCHANGE;
        this.deadExchange = DEAD_EXCHANGE;
        this.normalQueue = NORMAL_QUEUE;
        this.deadQueue = DEAD_QUEUE;
        this.normalRoute = NORMAL_ROUTE;
        this.deadRoute = DEAD_ROUTE;
        this.maxLen = maxLen;
    }

    public Connection(String normalExchange, String deadExchange, String normalQueue, String deadQueue, String normalRoute, String deadRoute, int maxLen) {
        this.normalExchange = normalExchange;
        this.deadExchange = deadExchange;
        this.normalQueue = normalQueue;
        this.deadQueue = deadQueue;
        this.normalRoute = normalRoute;
        this.deadRoute = deadRoute;
        this.maxLen = maxLen;
    }

    // 开始建立连接并绑定关系
    public void build() throws IOException, TimeoutException {
        // 获取信道
        Channel channel = getChannel();
        // 声明交换机
        channel.exchangeDeclare(this.normalExchange, BuiltinExchangeType.DIRECT);
        channel.exchangeDeclare(this.deadExchange, BuiltinExchangeType.DIRECT);
        // 声明普通队列
        // 但是普通队列需要在死信条件满足时将消息发送给死信交换机，所以就需要设置最后的Map参数
        Map<String, Object> arguments = new HashMap<>();
        // 设置消费异常时转发死信交换机的名称，key为固定值
        arguments.put("x-dead-letter-exchange", this.deadExchange);
        // 设置死信交换机发送死信给队列的路由RoutingKey
        arguments.put("x-dead-letter-routing-key", this.deadRoute);
        // 设置队列最大值
        if (maxLen > 0) {
            arguments.put("x-max-length", this.maxLen);
        }
        channel.queueDeclare(this.normalQueue, false, false, false, arguments);
        // 声明死信队列
        channel.queueDeclare(this.deadQueue, false, false, false, null);
        // 绑定交换机与队列
        channel.queueBind(normalQueue, normalExchange, normalRoute);
        channel.queueBind(deadQueue, deadExchange, deadRoute);
        p("连接建立");
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Connection().build();
    }
}
```

此时控制台的队列的normal_queue会显示Lim，表示设置了队列中消息数量x-max-length参数。

#### &emsp;&emsp;消息被拒绝

调用`channel.basicReject(consumerTag)`来拒绝消息，需要手动应答，并定义一个接口来实现匿名内部类传递判断消息是否被拒绝的函数：

```java
// ICondition.java
package org.didnelpsun;

import com.rabbitmq.client.Delivery;

// 拒绝条件接口
public interface ICondition {
    boolean condition(String consumerTag, Delivery message);
}
```

```java
// Consumer.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.RabbitUtil.*;

public class Consumer {
    public String queueName;

    public Consumer(String normalQueue) {
        this.queueName = normalQueue;
    }

    // 正常接收消息
    // 传输一个拒绝条件函数参数用来判断什么时候拒绝这个消息
    public void receive(ICondition iCondition) throws IOException, TimeoutException {
        // 获取信道
        Channel channel = getChannel();
        p("等待接收消息...");
        // 消费消息
        // 这里由于需要拒绝消息，所以必须改为手动应答，否则都默认自动应答全部不会被拒绝
        channel.basicConsume(this.queueName, false, (consumerTag, message) -> {
            String msg = new String(message.getBody(), StandardCharsets.UTF_8);
            if(iCondition.condition(consumerTag, message)){
                p("消息" + consumerTag + "被拒绝：" + msg);
                // 有两个参数，一个是消息标志，一个是是否放回队列
                // 不放回消息就加入死信队列
                channel.basicReject(message.getEnvelope().getDeliveryTag(), false);
            }else{
                // 不进行批量应答
                channel.basicAck(message.getEnvelope().getDeliveryTag(), false);
                p("消息" + consumerTag + "接收成功：" + msg);
            }
        }, consumerTag -> p("消息" + consumerTag + "接收失败"));
    }
}
```

然后定义一个普通消费者，判断条件为消息长度大于10就拒绝：

```java
// NormalConsumerRun.java
package org.didnelpsun;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.DEAD_QUEUE;

public class NormalConsumerRun {
    public static void main(String[] args) throws IOException, TimeoutException {
        new Consumer(DEAD_QUEUE).receive((consumerTag, message) -> new String(message.getBody(), StandardCharsets.UTF_8).length() <= 10);
    }
}
```

修改死信处理者判断条件为全部接收：

```java
// DeadConsumerRun.java
package org.didnelpsun;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.DEAD_QUEUE;

public class DeadConsumerRun {
    public static void main(String[] args) throws IOException, TimeoutException {
        new Consumer(DEAD_QUEUE).receive((consumerTag, message) -> {
            return true;
        });
    }
}
```

&emsp;

## 延迟队列

### &emsp;延迟队列概念

#### &emsp;&emsp;延迟队列定义

延迟队列即死信队列的一种，是属于消息TTL过期的情况。在死信队列的TTL过期的情况下，有一个消费者和一个处理者共同消费消息，如果消费者超过TTL不消费消息则消息转发到处理者。对于处理者而言，这个消息就相当于延迟了一个TTL时间。

延迟队列就是存放需要在指定时间被处理的元素队列。

#### &emsp;&emsp;延迟队列应用场景

对于延迟时间发送的实现，可以使用定时器轮询机制不断查看数据进行延时发送，比如每天零点查看有哪些数据需要定时，但是对于大批量数据而言这种轮询机制效率十分低下，所以就需要延迟队列。

### &emsp;延迟队列代码

#### &emsp;&emsp;延迟执行流程

首先只需要一个生产者Producer和一个消费者Consumer。生产者Producer发送消息给普通发送的路由交换机normal_exchange。普通交换机使用delay_3的RoutingKey来绑定队列queue_3，表示这个队列的消息将延时3秒发送；使用delay_10的RoutingKey来绑定队列queue_10，表示这个队列的消息将延时10秒发送。queue_3和queue_10都通过send的RoutingKey绑定到延迟发送的路由交换机delay_exchange（死信交换机），延迟发送交换机再把消息延时发送给队列queue（实际上是一个死信队列）中，queue绑定发送消息给Consumer。

#### &emsp;&emsp;延迟连接配置

新建一个delay_queue模块，新建一个Property：

&emsp;

## 高级发布确认

&emsp;

## 幂等性

&emsp;

## 优先级队列

&emsp;

## 惰性队列

&emsp;
