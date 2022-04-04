---
layout: post
title:  "RabbitMQ交换模式"
date:   2022-04-03 22:15:52 +0800
categories: notes mq rabbitmq
tags: MQ RabbitMQ 模式
excerpt: "RabbitMQ模式（下）"
---

## 交换机

### &emsp;相关概念

#### &emsp;&emsp;交换机定义

RabbitMQ消息传递模型的核心思想是生产者生产的消息从不会直接发送到队列。实际上，通常生产者甚至都不知道这些消息传递传递到了哪些队列中，生产者只负责生产而不关心传输。

相反，生产者只能将消息发送到交换机，交换机工作的内容非常简单，一方面它接收来自生产者的消息，另一方面将它们推入队列。交换机必须确切知道如何处理收到的消息。是应该把这些消息放到特定队列还是说把他们到许多队列中还是说应该丢弃它们。这就由交换机的类型来决定。

#### &emsp;&emsp;交换机类型

直接direct路由模式、主题topic主题发布模式、标题headers头模式（基本上不使用了）、扇出fanout发布订阅模式。

之前没有设置交换机，只传入一个空串，这就是无名类型的交换机，使用默认交换。

#### &emsp;&emsp;运行模式

通过交换机能实现其他三种模式：发布订阅模式、路由模式、主题模式。

### &emsp;临时队列

即没有持久化的队列，打开RabbitMQ控制台查看Queues时查看队列，如果Features不显示D则表示临时队列。

每当我们连接到RabbitMQ时，我们都需要一个全新的空队列，为此我们可以创建一个具有随机名称的队列，或者能让服务器为我们选择一个随机队列名称那就更好了。其次一旦我们断开了消费者的连接，队列将被自动删除。

不指定队列名称来创建临时队列的方式：`String queueName = channel.queueDeclare().getQueue()`，名字为随机字符串。此时队列的Features显示AD自动删除和Exd自动命名。

### &emsp;绑定

即交换机与队列之间的对应关系，告诉我们该交换机与哪个队列具有绑定关系，交换机的消息可以派发给哪个队列。

通过RoutingKey绑定路由确定每个路由的处理方式。

&emsp;

## 发布订阅模式

### &emsp;发布订阅特点

即Fanout扇出形式的交换机。将接收到的所有消息广播到其已知的所有队列中。与之前不使用交换机的发布订阅模式不同的时，所有消费者只能对消息进行统一的操作，而交换机下的发布订阅模式能根据不同的路由对消费者进行差别处理。

这里定义两个消费者对同一个消息进行不同的处理，以及一个生产者发送同样的消息。

定义一个publish_subscribe模块，添加utils依赖。并在Property中添加一个常量`public static final String EXCHANGE = "exchange";`。

### &emsp;订阅者代码

订阅者也称为消费者。

交换机在生产者和消费者里都可以声明，所以我在消费者里声明交换机：

```java
// Subscriber.java
package org.didnelpsun;

import com.rabbitmq.client.BuiltinExchangeType;
import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

public class Subscriber {
    public String exchangeName;

    public Subscriber(String exchangeName) {
        this.exchangeName = exchangeName;
    }

    public void subscribe() throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 声明一个扇出类型交换机
        channel.exchangeDeclare(exchangeName, BuiltinExchangeType.FANOUT);
        // 声明一个临时队列
        String queue = channel.queueDeclare().getQueue();
        // 绑定信道与队列
        // 参数为队列名，交换机名，routingKey
        // routingKey是为了找到对应关系的队列，但是此时是广播交换机所以不需要专门找特定的队列，所以可以乱写，路由模式则需要
        channel.queueBind(queue, exchangeName, "");
        System.out.println("等待接收消息...");
        // 消费消息
        channel.basicConsume(queue, true, (consumerTag, message) -> System.out.println("消息" + consumerTag + "接收成功：" + new String(message.getBody(), StandardCharsets.UTF_8)), (consumerTag) -> System.out.println("消息" + consumerTag + "接收失败"));
    }
}
```

然后申明两个订阅者测试，代码一样：

```java
// SubscriberRun1.java
package org.didnelpsun;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.EXCHANGE;

public class SubscriberRun1 {
    public static void main(String[] args) throws IOException, TimeoutException {
        new Subscriber(EXCHANGE).subscribe();
    }
}
```

运行两个订阅者等待消息。

### &emsp;发布者代码

发布者代码基本上跟之前的生产者代码一样：

```java
// Publisher.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.EXCHANGE;

public class Publisher {
    public void send(String exchangeName) throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
//        channel.exchangeDeclare(exchangeName, "fanout");
        // 循环输入
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()) {
            String message = scanner.next();
            // fanout模式不需要指定队列名，只需要指定交换机名
            channel.basicPublish(exchangeName, "", null, message.getBytes(StandardCharsets.UTF_8));
            System.out.println("发送成功：" + message);
        }
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Publisher().send(EXCHANGE);
    }
}
```

运行发布者，发现两个订阅者都能接收到。如果是多个队列，不使用交换机的工作队列方式是轮训的方式接收不同的消息，如果要达成广播的形式让多个消费者使用同一个队列，这本质不是广播；而使用交换机的发布订阅模式是广播的形式所有队列全部收到同样的消息。

&emsp;

## 路由模式

对于工作队列模式，所有接收了指定队列的消费者都会接收到该消息。如果想不同的消费者收到不同的消息，必须使用不同的队列来进行轮训。而如果我们想使用同一个生产者统一发送，使用更灵活的方式让不同的消费者接收不同的信息，则可以使用路由模式，让一个生产者拥有多个队列。

定义一个route模块，添加utils依赖。

### &emsp;路由特点

即Direct路由模式的交换机。

+ 使用RoutingKey和交换机名共同来进行绑定处理。
+ 同一个交换机的同一个RoutingKey的不同队列使用同一个消息。（类似广播）
+ 同一个队列也可以绑定多个不同的RoutingKey。不同RoutingKey的不同队列使用不同消息。（多重绑定）
+ 这样就能让广播和单播共同实现。
+ 上面的扇出类型的交换机就只用交换机来广播不同的队列而不关心RoutingKey。

### &emsp;消费者代码

一个信道可以有多个队列，一个队列可以有多个RoutingKey，一个交换机可以有多个RoutingKey。

```java
// Consumer.java
package org.didnelpsun;

import com.rabbitmq.client.BuiltinExchangeType;
import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.concurrent.TimeoutException;

public class Consumer {
    // 交换机名
    public String exchangeName;
    // RoutingKey，为一个字符串集合
    public ArrayList<String> routingKeys;

    public Consumer(String exchangeName, ArrayList<String> routingKeys) {
        this.exchangeName = exchangeName;
        this.routingKeys = routingKeys;
    }

    public Consumer(String exchangeName, String routingKey){
        this.exchangeName = exchangeName;
        this.routingKeys = new ArrayList<>();
        this.routingKeys.add(routingKey);
    }

    // 添加RoutingKey
    public boolean addKey(String routingKey){
        return this.routingKeys.add(routingKey);
    }

    // 移除RoutingKey
    public boolean removeKey(String routingKey){
        return this.routingKeys.remove(routingKey);
    }

    public void receive() throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 声明一个路由类型交换机
        channel.exchangeDeclare(exchangeName, BuiltinExchangeType.DIRECT);
        // 声明一个临时队列
        String queue = channel.queueDeclare().getQueue();
        // 绑定信道、队列、RoutingKey
        // 参数为队列名，交换机名，RoutingKey
        for(String routingKey : routingKeys){
            channel.queueBind(queue, exchangeName, routingKey);
        }
        System.out.println("等待接收消息...");
        // 消费消息
        channel.basicConsume(queue, true, (consumerTag, message) -> System.out.println("消息" + consumerTag + "接收成功：" + new String(message.getBody(), StandardCharsets.UTF_8)), (consumerTag) -> System.out.println("消息" + consumerTag + "接收失败"));
    }
}
```

新建两个测试文件，一个RoutingKey为1，一个RoutingKey为2：

```java
// ConsumerRun1.java
package org.didnelpsun;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.EXCHANGE;

public class ConsumerRun1 {
    public static void main(String[] args) throws IOException, TimeoutException {
        new Consumer(EXCHANGE, "1").receive();
    }
}
```

运行。如果报错channel error; protocol method: #method<channel.close>(reply-code=406, reply-text=PRECONDITION_FAILED - inequivalent arg 'type' for exchange 'exchange' in vhost '/': received 'direct' but current is 'fanout', class-id=40, method-id=10)，就在控制台把原来的交换机删掉。

### &emsp;生产者代码

基本上跟原来的生产者代码类似，只是加入了RoutingKey：

```java
// Producer.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.EXCHANGE;

public class Producer {
    public void send(String exchangeName, ArrayList<String> routingKeys) throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 循环输入
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()) {
            String message = scanner.next();
            for(String routingKey : routingKeys){
                channel.basicPublish(exchangeName, routingKey, null, message.getBytes(StandardCharsets.UTF_8));
                System.out.println("发送给：" + routingKey  + "成功：" + message);
            }
        }
    }

    public void send(String exchangeName, String routingKey) throws IOException, TimeoutException {
        ArrayList<String> routingKeys = new ArrayList<>();
        routingKeys.add(routingKey);
        send(exchangeName, routingKeys);
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Producer().send(EXCHANGE, "1");
    }
}
```

此时输入字符串只会在RoutingKey为1的队列中显示接收到，2是接收不到的。修改成：

```java
ArrayList<String> keys = new ArrayList<>();
keys.add("1");
keys.add("2");
new Producer().send(EXCHANGE, keys);
```

就可以两个都接收到。

&emsp;

## 主题模式

### &emsp;主题特点

Topic路由模式对发布订阅模式进行了拓展，但是路由模式本身也有局限，灵活性较差，不支持多个条件，只能一个个的完整的RoutingKey绑定。主题模式和路由模式的区别仅在于主题模式可以匹配，其他都是一样的。

#### &emsp;&emsp;主题命名规范

发送到类型是Topic交换机的消息的RoutingKey不能随意写，必须满足一定的要求，它必须是一个单词列表。以点号分隔开。这些单词可以是任意单词，比如说org.didnelpsun.service这种类型的。当然这个单词列表最多不能超过255个字节。

#### &emsp;&emsp;主题名匹配

类似于正则匹配，但是一般的匹配的是字母，这里匹配的是以点好分割的单词：

+ \*星号可以代替一个单词。如\*.didnelpsun.\*匹配中间是didnelpsun的三个单词组成的主题名。
+ #井号可以替代零个或多个单词。如didnelpsun.#匹配的是最开头为didnelpsun的主题名，后面有多少个单词都无所谓。

Topic模式跟其他前面两种模式有联系：

+ 当一个队列绑定键是#，那么这个队列将接收所有数据，就是fanout。
+ 如果队列绑定键当中没有#和*出现，那么该队列绑定类型就是direct。

定义一个topic模块，添加utils依赖。

### &emsp;接收者代码

基本上代码一样，改变交换机类型：

```java
// Consumer.java
package org.didnelpsun;

import com.rabbitmq.client.BuiltinExchangeType;
import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.concurrent.TimeoutException;

public class Consumer {
    // 交换机名
    public String exchangeName;
    // RoutingKey，为一个字符串集合
    public ArrayList<String> routingKeys;

    public Consumer(String exchangeName, ArrayList<String> routingKeys) {
        this.exchangeName = exchangeName;
        this.routingKeys = routingKeys;
    }

    public Consumer(String exchangeName, String routingKey) {
        this.exchangeName = exchangeName;
        this.routingKeys = new ArrayList<>();
        this.routingKeys.add(routingKey);
    }

    // 添加RoutingKey
    public boolean addKey(String routingKey) {
        return this.routingKeys.add(routingKey);
    }

    // 移除RoutingKey
    public boolean removeKey(String routingKey) {
        return this.routingKeys.remove(routingKey);
    }

    public void receive() throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 声明一个主题类型交换机
        channel.exchangeDeclare(exchangeName, BuiltinExchangeType.TOPIC);
        // 声明一个临时队列
        String queue = channel.queueDeclare().getQueue();
        // 绑定信道、队列、RoutingKey
        // 参数为队列名，交换机名，RoutingKey
        StringBuilder key = new StringBuilder();
        for (String routingKey : routingKeys) {
            channel.queueBind(queue, exchangeName, routingKey);
            key.append(routingKey).append(",");
        }
        // 删除最后一个逗号
        key.deleteCharAt(key.length() - 1);
        System.out.println("等待接受消息，路由模式为" + key + "...");
        // 消费消息
        channel.basicConsume(queue, true, (consumerTag, message) -> System.out.println("消息" + consumerTag + "接受成功：" + new String(message.getBody(), StandardCharsets.UTF_8)), (consumerTag) -> System.out.println("消息" + consumerTag + "接受失败"));
    }
}
```

定义两个测试文件：

```java
// ConsumerRun1.java
package org.didnelpsun;

import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.EXCHANGE;

public class ConsumerRun1 {
    public static void main(String[] args) throws IOException, TimeoutException {
        ArrayList<String> keys = new ArrayList<>();
        keys.add("*.didnelpsun.*");
        keys.add("*.*.didnelpsun.*");
        new Consumer(EXCHANGE, keys).receive();
    }
}
```

```java
// ConsumerRun2.java
package org.didnelpsun;

import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.EXCHANGE;

public class ConsumerRun2 {
    public static void main(String[] args) throws IOException, TimeoutException {
        ArrayList<String> keys = new ArrayList<>();
        keys.add("didnelpsun.#");
        keys.add("#.didnelpsun");
        new Consumer(EXCHANGE, keys).receive();
    }
}
```

运行前把原来的交换机删掉：

```txt
等待接受消息，路由模式为*.didnelpsun.*,*.*.didnelpsun.*...

等待接受消息，路由模式为didnelpsun.#,#.didnelpsun...
```

### &emsp;发送者代码

基本上代码也一样：

```java
// Producer.java
package org.didnelpsun;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.concurrent.TimeoutException;

import static org.didnelpsun.Property.EXCHANGE;

public class Producer {
    // 循环输入
    // 先输入主题，后输入消息
    public void send(String exchangeName) throws IOException, TimeoutException {
        Channel channel = RabbitUtil.getChannel();
        // 循环输入
        Scanner scanner = new Scanner(System.in);
        System.out.println("主题：");
        while (scanner.hasNext()) {
            String topic = scanner.next();
            System.out.println("消息：");
            String message = scanner.next();
            channel.basicPublish(exchangeName, topic, null, message.getBytes(StandardCharsets.UTF_8));
            System.out.println("发送给：" + topic  + "成功：" + message);
            System.out.println("主题：");
        }
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        new Producer().send(EXCHANGE);
    }
}
```

运行：

```java
主题：
a.didnelpsun.c
消息：
test1
发送给：a.didnelpsun.c成功：test1
主题：
c.c.didnelpsun
消息：
test2
发送给：c.c.didnelpsun成功：test2
```

会发现两个消费者各有一个test。

[RabbitMQ模式：MQ/rabbitmq_mode](https://github.com/Didnelpsun/MQ/tree/main/rabbitmq_mode)。
