---
layout: post
title:  "RocketMQ消息类型"
date:   2022-04-11 20:14:37 +0800
categories: notes mq rocketmq
tags: MQ RocketMQ 消息类型
excerpt: "RocketMQ消息类型"
---

## 普通消息

### &emsp;普通消息类型

+ 同步发送消息：Producer发出一条消息后，会在收到MQ返回的ACK之后才发下一条消息。该方式的消息可靠性最高，但消息发送效率太低。
+ 异步发送消息：Producer发出消息后无需等待MQ返回ACK，直接发送下一条消息。该方式的消息可靠性可以得到保障，消息发送效率也可以。
+ 单向发送消息：Producer仅负责发送消息，不等待、不处理MQ的ACK。该发送方式时MQ也不返回ACK。该方式的消息发送效率最高，但消息可靠性较差。

### &emsp;普通消息代码

#### &emsp;&emsp;创建项目

新建一个Maven项目，命名为rocketmq_type。

然后导入依赖，只需要一个rocketmq-client：

```xml
<!-- https://mvnrepository.com/artifact/org.apache.rocketmq/rocketmq-client -->
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
    <version>4.9.3</version>
</dependency>
```

注意依赖需要与RocketMQ安装版本一样。

开启`start mqnamesrv`，`mqbroker -n 127.0.0.1:9876`，然后启动控制台`mvn spring-boot:run`。

#### &emsp;&emsp;父生产者

新建一个父生产者作为生产者的父类：

```java
// Producer.java
package org.didnelpsun;

import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;

// 生产者父类
public class Producer {
    // NameServer地址，并指定默认值
    protected String nameServer = "127.0.0.1:9876";
    // 组名
    protected String group;

    // 如果是一个参数就指定group
    public Producer(String group) {
        this.group = group;
    }

    public Producer(String nameServer, String group) {
        this.nameServer = nameServer;
        this.group = group;
    }

    // 直接获取MQProducer静态实例
    public static DefaultMQProducer getDefaultMQProducer(String nameServer, String group) {
        DefaultMQProducer producer = new DefaultMQProducer(group);
        producer.setNamesrvAddr(nameServer);
        return producer;
    }

    public SendResult send(String topic, String tag, String message) throws Exception {
        return new SendResult();
    }
}
```

默认生产者会给新创建的Topic生成四个队列Queue，如果需要指定则通过`producer.setDefaultTopicQueueNums`。

#### &emsp;&emsp;同步消息生产者

在java下新建org.didnelpsun.normal作为普通消息软件包。

在normal下新建一个SyncProducer：

```java
// SyncProducer.java
package org.didnelpsun.normal;

import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;

// 同步生产者
public class SyncProducer extends Producer {

    public SyncProducer() {
        super("normal");
    }

    public SyncProducer(String nameServer, String group) {
        super(nameServer, group);
    }

    public SendResult send(String topic, String message) throws Exception {
        return send(topic, "", message);
    }

    public SendResult send(String topic, String tag, String message) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        return send(topic, tag, message, 2, 3000);
    }

    public SendResult send(String topic, String tag, String message, int retryTimesWhenSendFailed, int sendMsgTimeout) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group);
        // 设置当同步发送失败是重试发送的次数，默认为为2次
        producer.setRetryTimesWhenSendFailed(retryTimesWhenSendFailed);
        // 设置发送超时时限，默认为3s
        producer.setSendMsgTimeout(sendMsgTimeout);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 发送消息
        SendResult result = producer.send(msg);
        producer.shutdown();
        System.out.println("SyncProducer发送完成");
        return result;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(new SyncProducer().send("normalTopic", "sync", "SyncProducer"));
    }
}
```

```txt
SendResult [sendStatus=SEND_OK, msgId=7F000001D4D063947C6B385EB4460000, offsetMsgId=C0A85DD100002A9F0000000000000000, messageQueue=MessageQueue [topic=normalTopic, brokerName=Didnelpsun, queueId=1], queueOffset=0]
```

返回值被封装为SendResult类，有以下成员：

```java
// 其中SendStatus为一个枚举值：
// SEND_OK：发送成功
// FLUSH_DISK_TIMEOUT：刷盘超时。即持久化消息超时，只有刷盘策略为同步刷盘时才会出现
// FLUSH_SLAVE_TIMEOUT：Slave同步超时。只有Broker集群设置的Master-Slave的复制方式设置为同步复制时才会出现
// SLAVE_NOT_AVAILAVLE：无可用Slave。只有Broker集群设置的Master-Slave的复制方式设置为同步复制时才会出现
private SendStatus sendStatus;
// 由MessageId这个类生成，有两个部分：
// SocketAddress类型的address
// long类型的offset
// 是一个递增量
private String msgId;
// 发送消息给的消息队列：
// topic：主题
// brokerName：代理名
// 发送给的队列的ID
private MessageQueue messageQueue;
// 队列偏移量
private long queueOffset;
// 事务ID
private String transactionId;
// 消息偏移量
private String offsetMsgId;
private String regionId;
private boolean traceOn = true;
```

#### &emsp;&emsp;异步消息生产者

```java
// AsyncProducer.java
package org.didnelpsun.normal;

import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

// 异步生产者
public class AsyncProducer extends Producer {
    // 异步等待确认的睡眠时间
    private int sleep;

    public AsyncProducer() {
        super("normal");
        this.sleep = 5;
    }

    public AsyncProducer(String nameServer, String group) {
        super(nameServer, group);
        this.sleep = 5;
    }

    public AsyncProducer(String nameServer, String group, int sleep) {
        super(nameServer, group);
        this.sleep = sleep;
    }

    public SendResult send(String topic, String message) throws MQClientException, RemotingException, InterruptedException {
        return send(topic, "", message);
    }

    public SendResult send(String topic, String tag, String message) throws RemotingException, InterruptedException, MQClientException {
        // 默认不异步重发
        return send(topic, tag, message, 0);
    }

    public SendResult send(String topic, String tag, String message, int retryTimesWhenSendAsyncFailed) throws MQClientException, RemotingException, InterruptedException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group);
        // 设置异步发送失败后进行重试发送的次数
        producer.setRetryTimesWhenSendAsyncFailed(retryTimesWhenSendAsyncFailed);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 发送消息，需要传入一个异步回调函数
        final SendResult[] result = new SendResult[]{null};
        producer.send(msg, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                result[0] = sendResult;
            }

            @Override
            public void onException(Throwable throwable) {
                throwable.printStackTrace();
            }
        });
        // 必须休眠等待发送结果，否则会直接关闭
        TimeUnit.SECONDS.sleep(this.sleep);
        producer.shutdown();
        System.out.println("AsyncProducer发送完成");
        return result[0];
    }

    public static void main(String[] args) throws RemotingException, InterruptedException, MQClientException {
        System.out.println(new AsyncProducer().send("normalTopic", "async", "AsyncProducer"));
    }
}
```

```txt
SendResult [sendStatus=SEND_OK, msgId=7F000001C14463947C6B386FD3620000, offsetMsgId=C0A85DD100002A9F00000000000000BC, messageQueue=MessageQueue [topic=normalTopic, brokerName=Didnelpsun, queueId=0], queueOffset=0]
```

#### &emsp;&emsp;单向消息生产者

```java
// OnewayProducer.java
package org.didnelpsun.normal;

import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;

// 单向生产者
public class OnewayProducer extends Producer {

    public OnewayProducer() {
        super("normal");
    }

    public OnewayProducer(String nameServer, String group) {
        super(nameServer, group);
    }

    public SendResult send(String topic, String message) throws Exception {
        return send(topic, "", message);
    }

    // 由于不会收到回复和确认，所以只需要发消息而不用重发
    public SendResult send(String topic, String tag, String message) throws MQClientException, RemotingException, InterruptedException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 发送消息
        producer.sendOneway(msg);
        producer.shutdown();
        System.out.println("OnewayProducer发送完成");
        return null;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(new OnewayProducer().send("normalTopic", "oneway", "OnewayProducer"));
    }
}
```

#### &emsp;&emsp;父消费者

新建一个consumer包，然后定义Consumer：

```java
// Consumer.java
package org.didnelpsun.consumer;

import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;

// 消费者父类
public class Consumer {
    // NameServer地址，并指定默认值
    protected String nameServer = "127.0.0.1:9876";
    // 组名
    protected String group;
    // 消费方式，默认为从第一个开始消费
    protected ConsumeFromWhere type = ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET;
    // 主题
    protected String topic;
    // 标签，默认为*表示全部
    protected String tag = "*";
    // 消费模式，默认为集群模式
    protected MessageModel mode = MessageModel.CLUSTERING;

    public Consumer(String group, String topic) {
        this.group = group;
        this.topic = topic;
    }

    public Consumer(String group, String topic, String tag) {
        this.group = group;
        this.topic = topic;
        this.tag = tag;
    }

    public Consumer(String group, ConsumeFromWhere type, String topic) {
        this.group = group;
        this.type = type;
        this.topic = topic;
    }

    public Consumer(String nameServer, String group, String topic, String tag) {
        this.nameServer = nameServer;
        this.group = group;
        this.topic = topic;
        this.tag = tag;
    }

    public Consumer(String group, ConsumeFromWhere type, String topic, String tag) {
        this.group = group;
        this.type = type;
        this.topic = topic;
        this.tag = tag;
    }

    public Consumer(String group, String topic, String tag, MessageModel mode) {
        this.group = group;
        this.topic = topic;
        this.tag = tag;
        this.mode = mode;
    }

    public Consumer(String nameServer, String group, ConsumeFromWhere type, String topic, String tag, MessageModel mode) {
        this.nameServer = nameServer;
        this.group = group;
        this.type = type;
        this.topic = topic;
        this.tag = tag;
        this.mode = mode;
    }

    // 获取推式消费者实例
    public static DefaultMQPushConsumer getDefaultMQPushConsumer(String nameServer, String group, ConsumeFromWhere type, String topic, String tag, MessageModel mode) throws MQClientException {
        // 定义一个push的Consumer
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(group);
        consumer.setNamesrvAddr(nameServer);
        consumer.setConsumeFromWhere(type);
        consumer.subscribe(topic, tag);
        consumer.setMessageModel(mode);
        return consumer;
    }

    public void receive() throws Exception {
    }
}
```

#### &emsp;&emsp;普通消费者

先建立一个推式类：

```java
// PushConsumer.java
package org.didnelpsun.consumer;

import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;
import org.apache.rocketmq.common.message.MessageExt;
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;

// 拉式消费者
public class PushConsumer extends Consumer {

    public PushConsumer(String topic) {
        super("push", topic);
    }

    public PushConsumer(String group, String topic) {
        super(group, topic);
    }

    public PushConsumer(String group, String topic, String tag) {
        super(group, topic, tag);
    }

    public PushConsumer(String group, ConsumeFromWhere consumeType, String topic) {
        super(group, consumeType, topic);
    }

    public PushConsumer(String nameServer, String group, String topic, String tag) {
        super(nameServer, group, topic, tag);
    }

    public PushConsumer(String group, ConsumeFromWhere consumeType, String topic, String tag) {
        super(group, consumeType, topic, tag);
    }

    public PushConsumer(String group, String topic, String tag, MessageModel mode) {
        super(group, topic, tag, mode);
    }

    public PushConsumer(String nameServer, String group, ConsumeFromWhere consumeType, String topic, String tag, MessageModel mode) {
        super(nameServer, group, consumeType, topic, tag, mode);
    }

    @Override
    public void receive() throws MQClientException {
        // 定义一个push的Consumer
        DefaultMQPushConsumer consumer = Consumer.getDefaultMQPushConsumer( this.nameServer, this.group, this.type, this.topic, this.tag, this.mode);
        // 注册监听器
        // MessageListenerConcurrently为监听订阅消息
        // 返回值为当前消费者状态
        consumer.registerMessageListener((MessageListenerConcurrently) (list, consumeConcurrentlyContext) -> {
            for (MessageExt msg : list) {
                System.out.println("PushConsumer:" + msg);
            }
            // 返回状态为成功
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
        });
        // 开启消费者
        consumer.start();
        System.out.println("PushConsumer等待消息...");
    }
}
```

然后调用这个消费者：

```java
// NormalConsumerRun.java
package org.didnelpsun.consumer;

import org.apache.rocketmq.client.exception.MQClientException;

public class NormalConsumerRun {
    public static void main(String[] args) throws MQClientException {
        new PushConsumer("normalTopic").receive();
    }
}
```

```txt
PushConsumer等待消息...
PushConsumer:MessageExt [brokerName=Didnelpsun, queueId=2, storeSize=192, queueOffset=0, sysFlag=0, bornTimestamp=1649692770231, bornHost=/192.168.93.209:55860, storeTimestamp=1649692770241, storeHost=/192.168.93.209:10911, msgId=C0A85DD100002A9F000000000000017A, commitLogOffset=378, bodyCRC=1014914661, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='normalTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=1, CONSUME_START_TIME=1649735204114, UNIQ_KEY=7F000001914C63947C6B38A57FB70000, CLUSTER=DefaultCluster, TAGS=oneway}, body=[79, 110, 101, 119, 97, 121, 80, 114, 111, 100, 117, 99, 101, 114], transactionId='null'}]
PushConsumer:MessageExt [brokerName=Didnelpsun, queueId=0, storeSize=190, queueOffset=0, sysFlag=0, bornTimestamp=1649689252707, bornHost=/192.168.93.209:63904, storeTimestamp=1649689252716, storeHost=/192.168.93.209:10911, msgId=C0A85DD100002A9F00000000000000BC, commitLogOffset=188, bodyCRC=405032095, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='normalTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=1, CONSUME_START_TIME=1649735204114, UNIQ_KEY=7F000001C14463947C6B386FD3620000, CLUSTER=DefaultCluster, TAGS=async}, body=[65, 115, 121, 110, 99, 80, 114, 111, 100, 117, 99, 101, 114], transactionId='null'}]
PushConsumer:MessageExt [brokerName=Didnelpsun, queueId=1, storeSize=188, queueOffset=0, sysFlag=0, bornTimestamp=1649688130631, bornHost=/192.168.93.209:57971, storeTimestamp=1649688130656, storeHost=/192.168.93.209:10911, msgId=C0A85DD100002A9F0000000000000000, commitLogOffset=0, bodyCRC=347037604, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='normalTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=1, CONSUME_START_TIME=1649735204114, UNIQ_KEY=7F000001D4D063947C6B385EB4460000, CLUSTER=DefaultCluster, TAGS=sync}, body=[83, 121, 110, 99, 80, 114, 111, 100, 117, 99, 101, 114], transactionId='null'}]
```

&emsp;

## 顺序消息

### &emsp;顺序消息定义

指严格按照消息的发送顺序进行消费的消息FIFO。

默认情况下生产者会把消息以Round Robin轮询方式发送到不同的Queue分区队列；而消费消息时会从多个Queue上拉取消息，这种情况下的发送和消费是不能保证顺序的。如果将消息仅发送到同一个Queue中，消费时也只从这个Queue上拉取消息，就严格保证了消息的顺序性。

### &emsp;有序性分类

#### &emsp;&emsp;有序定义

根据有序范围的不同，RocketMQ可以严格地保证两种消息的有序性：分区有序与全局有序。

+ 如果有多个Queue参与，其仅可保证在该Queue分区队列上的消息顺序，则称为分区有序。
+ 当发送和消费参与的Queue只有一个时所保证的有序是整个Topic中消息的顺序，称为全局有序。

#### &emsp;&emsp;指定队列方法

在创建Topic时指定Queue的数量，有三种指定方式：

1. 在代码中创建Producer时，可以指定其自动创建的Topic的Queue数量。
2. 在RocketMQ可视化控制台中手动创建Topic时指定Queue数量。
3. 使用nqadmin命令手动创建Topic时指定Queue数量。

#### &emsp;&emsp;队列选择

对于分区有序，如何实现Queue的选择？在定义Producer时我们可以指定消息队列选择器，而这个选择器是我们自己实现了MessageQueueSelector接口定义的。

在定义选择器的选择算法时，一般需要使用选择key。这个选择ey可以是消息key也可以是其它数据。但无论谁做选择key，都不能重复，都是唯一的。

一般性的选择算法是，让选择key（或其hash值）与该Topic所包含的Queue的数量取模，其结果即为选择出的Queue的QueueId。

取模算法存在一个问题：不同选择xey与Queue数量取模结果可能会是相同的，即不同选择key的消息可能会出现在相同的Queue，即同一个Consuemr可能会消费到不同选择key的消息。这个问题如何解决？一般性的作法是，从消息中获取到选择key，对其进行判断。若是当前Consumer需要消费的消息，则直接消费，否则，什么也不做。这种做法要求选择key要能够随着消息一起被Consumer获取到。此时使用消息key作为选择key是比较好的做法。

以上做法会不会出现如下新的问题呢？不属于那个Consumer的消息被拉取走了，那么应该消费该消息的Consumer是否还能再消费该消息呢？同一个Queue中的消息不可能被同一个Group中的不同Consumer同时消费。所以，消费现一个Quene的不同选择cey的消息的Consumer一定属于不同的Group。而不同的Group中的Consumerf间的消费是相互隔离的，互不影响的。

### &emsp;顺序消息代码

#### &emsp;&emsp;生产者改造

给父生产者多添加一个设置重发的生产者静态方法：

```java
// 由于同步发送和异步发送不兼容，且两个重复发送次数都是int类型，所以一起设置，只有对应的类型对应的参数才会有用
public static DefaultMQProducer getDefaultMQProducer(String nameServer, String group, int retryTimesWhenFailed, int sendMsgTimeout) {
    DefaultMQProducer producer = getDefaultMQProducer(nameServer, group);
    // 设置当发送失败是重试发送的次数，默认为为2次
    producer.setRetryTimesWhenSendFailed(retryTimesWhenFailed);
    producer.setRetryTimesWhenSendAsyncFailed(retryTimesWhenFailed);
    // 设置发送超时时限，默认为3s
    producer.setSendMsgTimeout(sendMsgTimeout);
    return producer;
}
```

对原来的生产者代码进行改造：

```java
// SyncProducer.java
package org.didnelpsun.normal;

import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;

// 同步生产者
public class SyncProducer extends Producer {

    public SyncProducer() {
        super("normal");
    }

    public SyncProducer(String nameServer, String group) {
        super(nameServer, group);
    }

    public SendResult send(String topic, String message) throws Exception {
        return send(topic, "", message);
    }

    public SendResult send(String topic, String tag, String message) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        return send(topic, tag, message, 2, 3000);
    }

    public SendResult send(String topic, String tag, String message, int retryTimesWhenSendFailed, int sendMsgTimeout) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group, retryTimesWhenSendFailed, sendMsgTimeout);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 发送消息
        SendResult result = producer.send(msg);
        producer.shutdown();
        System.out.println("SyncProducer发送完成");
        return result;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(new SyncProducer().send("normalTopic", "sync", "SyncProducer"));
    }
}
```

```java
// AsyncProducer.java
package org.didnelpsun.normal;

import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

// 异步生产者
public class AsyncProducer extends Producer {
    // 异步等待确认的睡眠时间
    private int sleep;

    public AsyncProducer() {
        super("normal");
        this.sleep = 5;
    }

    public AsyncProducer(String nameServer, String group) {
        super(nameServer, group);
        this.sleep = 5;
    }

    public AsyncProducer(String nameServer, String group, int sleep) {
        super(nameServer, group);
        this.sleep = sleep;
    }

    public SendResult send(String topic, String message) throws MQClientException, RemotingException, InterruptedException {
        return send(topic, "", message);
    }

    public SendResult send(String topic, String tag, String message) throws RemotingException, InterruptedException, MQClientException {
        // 默认不异步重发
        return send(topic, tag, message, 2, 3000);
    }

    public SendResult send(String topic, String tag, String message, int retryTimesWhenSendAsyncFailed, int sendMsgTimeout) throws MQClientException, RemotingException, InterruptedException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group, retryTimesWhenSendAsyncFailed, sendMsgTimeout);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 发送消息，需要传入一个异步回调函数
        final SendResult[] result = new SendResult[]{null};
        producer.send(msg, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                result[0] = sendResult;
            }

            @Override
            public void onException(Throwable throwable) {
                throwable.printStackTrace();
            }
        });
        // 必须休眠等待发送结果，否则会直接关闭
        TimeUnit.SECONDS.sleep(this.sleep);
        producer.shutdown();
        System.out.println("AsyncProducer发送完成");
        return result[0];
    }

    public static void main(String[] args) throws RemotingException, InterruptedException, MQClientException {
        System.out.println(new AsyncProducer().send("normalTopic", "async", "AsyncProducer"));
    }
}
```

#### &emsp;&emsp;顺序消息生产者

新建一个order软件包，然后建立同步和异步的顺序消息生产者：

```java
// OrderedSyncProducer.java
package org.didnelpsun.order;

import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;

// 同步顺序消息生产者
public class OrderedSyncProducer extends Producer {
    public OrderedSyncProducer() {
        super("ordered");
    }

    public OrderedSyncProducer(String group) {
        super(group);
    }

    public OrderedSyncProducer(String nameServer, String group) {
        super(nameServer, group);
    }

    public SendResult send(String topic, String tag, String message, long orderId) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        return send(topic, tag, message, orderId, 2, 3000);
    }

    // 需要多传入一个选择id
    public SendResult send(String topic, String tag, String message, long orderId, int retryTimesWhenSendFailed, int sendMsgTimeout) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group, retryTimesWhenSendFailed, sendMsgTimeout);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 将orderId作为消息key
        msg.setKeys(String.valueOf(orderId));
        // 发送消息，传入一个消息选择器
        // select为选择算法，有三个参数
        // list为消息队列的集合
        // message为消息
        // o为参数，即后面的orderId
        // 这里使用模运算来选择队列MessageQueue
        SendResult result = producer.send(msg, (list, message1, o) -> {
            // 获取设置的消息key
            String id = msg.getKeys();
//            Long id = (Long) o;
            int index = Integer.parseInt(id) % list.size();
            return list.get(index);
        }, orderId);
        producer.shutdown();
        System.out.println("OrderedSyncProducer发送完成");
        return result;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(new OrderedSyncProducer().send("orderedTopic", "sync", "OrderedSyncProducer", 0));
    }
}
```

```java
// OrderedSyncProducer.java
package org.didnelpsun.order;

import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

// 异步顺序消息生产者
public class OrderedAsyncProducer extends Producer {
    // 异步等待确认的睡眠时间
    private int sleep;

    public OrderedAsyncProducer() {
        super("ordered");
        this.sleep = 5;
    }

    public OrderedAsyncProducer(String group) {
        super(group);
        this.sleep = 5;
    }

    public OrderedAsyncProducer(String nameServer, String group) {
        super(nameServer, group);
        this.sleep = 5;
    }

    public OrderedAsyncProducer(String nameServer, String group, int sleep) {
        super(nameServer, group);
        this.sleep = sleep;
    }

    public SendResult send(String topic, String tag, String message, long orderId) throws MQClientException, RemotingException, InterruptedException {
        return send(topic, tag, message, orderId, 2, 3000);
    }

    // 需要多传入一个选择id
    public SendResult send(String topic, String tag, String message, long orderId, int retryTimesWhenSendAsyncFailed, int sendMsgTimeout) throws MQClientException, RemotingException, InterruptedException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group, retryTimesWhenSendAsyncFailed, sendMsgTimeout);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 将orderId作为消息key
        msg.setKeys(String.valueOf(orderId));
        // 发送消息，传入一个消息选择器
        // select为选择算法，有三个参数
        // list为消息队列的集合
        // message为消息
        // o为参数，即后面的orderId
        // 这里使用模运算来选择队列MessageQueue
        final SendResult[] result = new SendResult[]{null};
        producer.send(msg, (list, message1, o) -> {
            // 获取设置的消息key
            String id = msg.getKeys();
//            Long id = (Long) o;
            int index = Integer.parseInt(id) % list.size();
            return list.get(index);
        }, orderId, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                result[0] = sendResult;
            }

            @Override
            public void onException(Throwable throwable) {
                throwable.printStackTrace();
            }
        });
        // 必须休眠等待发送结果，否则会直接关闭
        TimeUnit.SECONDS.sleep(this.sleep);
        producer.shutdown();
        System.out.println("OrderedAsyncProducer发送完成");
        return result[0];
    }

    public static void main(String[] args) throws RemotingException, InterruptedException, MQClientException {
        System.out.println(new OrderedAsyncProducer().send("orderedTopic", "async", "OrderedAsyncProducer", 0));
    }
}
```

#### &emsp;&emsp;顺序消息消费者

为了方便区分各个消费者，可以生成Consumer的toString方法，然后在PushConsumer的receive方法最后打印`System.out.println("PushConsumer等待消息:" + consumer);`。

编写一个测试消费者类：

```java
// OrderedConsumerRun.java
package org.didnelpsun.consumer;

import org.apache.rocketmq.client.exception.MQClientException;

public class OrderedConsumerRun {
    public static void main(String[] args) throws MQClientException {
        new PushConsumer("orderedTopic").receive();
    }
}
```

```txt
PushConsumer等待消息:ClientConfig [namesrvAddr=127.0.0.1:9876, clientIP=192.168.208.209, instanceName=51468#346808471781700, clientCallbackExecutorThreads=8, pollNameServerInterval=30000, heartbeatBrokerInterval=30000, persistConsumerOffsetInterval=5000, pullTimeDelayMillsWhenException=1000, unitMode=false, unitName=null, vipChannelEnabled=false, useTLS=false, language=JAVA, namespace=null, mqClientApiTimeout=3000]
PushConsumer:MessageExt [brokerName=Didnelpsun, queueId=0, storeSize=205, queueOffset=0, sysFlag=0, bornTimestamp=1649754593209, bornHost=/192.168.208.209:49359, storeTimestamp=1649754593233, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F000000000000023A, commitLogOffset=570, bodyCRC=180236180, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='orderedTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=1, KEYS=0, CONSUME_START_TIME=1649754607689, UNIQ_KEY=7F000001DE9C63947C6B3C54D7B90000, CLUSTER=DefaultCluster, TAGS=async}, body=[79, 114, 100, 101, 114, 101, 100, 65, 115, 121, 110, 99, 80, 114, 111, 100, 117, 99, 101, 114], transactionId='null'}]
PushConsumer:MessageExt [brokerName=Didnelpsun, queueId=0, storeSize=203, queueOffset=1, sysFlag=0, bornTimestamp=1649754623505, bornHost=/192.168.208.209:49398, storeTimestamp=1649754623512, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F0000000000000307, commitLogOffset=775, bodyCRC=1547882344, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='orderedTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=2, KEYS=0, CONSUME_START_TIME=1649754623527, UNIQ_KEY=7F000001DD3C63947C6B3C554E100000, CLUSTER=DefaultCluster, TAGS=sync}, body=[79, 114, 100, 101, 114, 101, 100, 83, 121, 110, 99, 80, 114, 111, 100, 117, 99, 101, 114], transactionId='null'}]
```

## 延时消息

### &emsp;延迟消息定义

当消息写入到Broker后，在指定的时长后才可被消费处理的消息，称为延时消息。

采用RocketMQ的延时消息可以实现定时任务的功能，而无需使用定时器。典型的应用场景是，电商交易中超时未支付关闭订单的场景，12306平台订票超时未支付取消订票的场景。

### &emsp;延迟等级

延时消息的延迟时长不支寺随意时长的延迟，是通过特定的延迟等级来指定的。延时等级定义在RocketMQ服务端的Messagestoreconfig类中的`messageDelayLevel`变量：`1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h;`，即若指定的延时等级为3则表示延迟时长为10s。

如果需要自定义的延时等级，可以通过在Broker加载的配置中新增如下配置（例如下面增加了1天这个等级1d）。配置文件在RocketMQ安装目录下的broker.conf目录中：

```conf
messageDelayLeve1 = 1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h 1d
```

### &emsp;延迟实现原理

Producer将消息发送到Broker后，Broker会首先将消息写入到commitlog文件，然后需要将其分发到相应的consumequeue。不过，在分发之前，系统会先判断消息中是否带有延时等级。若没有，则直接正常分发；若有则需要经历一个复杂的过程：

+ 修改消息的Topic为SCHEDULE_TOPIC_XXX。
+ 根据延时等级的需要，在consumequeue目录中SCHEDULE_TOPIC_XXX主题下创建出相应的queueId目录与consumequeue文件（如果没有这些目录与文件的话）。
+ 修改消息索引单元内容。索引单元中的Message Tag HashCode部分原本存放的是消息的Tag的Hash值。现修改为消息的投递时间。投递时间是指该消息被重新修改为原Topic后再次被写入到commitlog中的时间。投递时间=消息存储时间＋延时等级时间。消息存储时间指的是消息被发送到Broker时的时间戳。
+ 将消息索引写入到SCHEDULE_TOPIC_XXX主题下相应的consumequeue中。

投递延时消息：Broker内部有一个延迟消息服务类，其会消费SCHEDULE _TOPIC_XXXX中的消息，即按照每条消息的投递时间，特延时消息投递到目标Topic中。不过，在投递之前会从commitlog中将原来写入的消息再次读出，并将其原来的延时等级设置为0，即原消息变为了一条不延迟的普通消息。然后再次将消息投递到目标Topic中。

将消息重新写入commitlog：延迟消息服务类将延迟消息再次发送给了commitlog，并再次形成新的消息索引条目，分发到相应Queue。

### &emsp;延迟消息代码

#### &emsp;&emsp;延迟消息消费者

由于需要输出时间，所以修改原来的PushConsumer添加一个时间打印：

```java
// PushConsumer.java
package org.didnelpsun.consumer;

import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;
import org.apache.rocketmq.common.message.MessageExt;
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;

import java.text.SimpleDateFormat;
import java.util.Date;

// 拉式消费者
public class PushConsumer extends Consumer {

    public PushConsumer(String topic) {
        super("push", topic);
    }

    public PushConsumer(String group, String topic) {
        super(group, topic);
    }

    public PushConsumer(String group, String topic, String tag) {
        super(group, topic, tag);
    }

    public PushConsumer(String group, ConsumeFromWhere consumeType, String topic) {
        super(group, consumeType, topic);
    }

    public PushConsumer(String nameServer, String group, String topic, String tag) {
        super(nameServer, group, topic, tag);
    }

    public PushConsumer(String group, ConsumeFromWhere consumeType, String topic, String tag) {
        super(group, consumeType, topic, tag);
    }

    public PushConsumer(String group, String topic, String tag, MessageModel mode) {
        super(group, topic, tag, mode);
    }

    public PushConsumer(String nameServer, String group, ConsumeFromWhere consumeType, String topic, String tag, MessageModel mode) {
        super(nameServer, group, consumeType, topic, tag, mode);
    }

    @Override
    public void receive() throws MQClientException {
        // 定义一个push的Consumer
        DefaultMQPushConsumer consumer = Consumer.getDefaultMQPushConsumer( this.nameServer, this.group, this.type, this.topic, this.tag, this.mode);
        // 注册监听器
        // MessageListenerConcurrently为监听订阅消息
        // 返回值为当前消费者状态
        consumer.registerMessageListener((MessageListenerConcurrently) (list, consumeConcurrentlyContext) -> {
            for (MessageExt msg : list) {
                System.out.print(new SimpleDateFormat("mm:ss").format(new Date()));
                System.out.println("->PushConsumer:" + msg);
            }
            // 返回状态为成功
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
        });
        // 开启消费者
        consumer.start();
        System.out.println("PushConsumer等待消息:" + consumer);
    }
}
```

```java
// DelayConsumerRun.java
package org.didnelpsun.consumer;

import org.apache.rocketmq.client.exception.MQClientException;

public class DelayConsumerRun {
    public static void main(String[] args) throws MQClientException {
        new PushConsumer("delayTopic").receive();
    }
}
```

运行：

```txt
PushConsumer等待消息:ClientConfig [namesrvAddr=127.0.0.1:9876, clientIP=192.168.208.209, instanceName=23472#353907936473000, clientCallbackExecutorThreads=8, pollNameServerInterval=30000, heartbeatBrokerInterval=30000, persistConsumerOffsetInterval=5000, pullTimeDelayMillsWhenException=1000, unitMode=false, unitName=null, vipChannelEnabled=false, useTLS=false, language=JAVA, namespace=null, mqClientApiTimeout=3000]
```

#### &emsp;&emsp;延迟消息生产者

新建一个delay软件包，添加生产者：

```java
// DelayProducer.java
package org.didnelpsun.delay;

import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;

// 延迟生产者
public class DelayProducer extends Producer {

    // 延迟等级，默认为5s
    private int level = 2;

    public DelayProducer() {
        super("delay");
    }

    public DelayProducer(int level) {
        super("delay");
        this.level = level;
    }

    public DelayProducer(String nameServer, String group) {
        super(nameServer, group);
    }

    public DelayProducer(String nameServer, String group, int level) {
        super(nameServer, group);
        this.level = level;
    }

    public SendResult send(String topic, String message) throws Exception {
        return send(topic, "", message);
    }

    // 延迟发送，所以不会是同步
    public SendResult send(String topic, String tag, String message) throws MQClientException, RemotingException, InterruptedException, MQBrokerException {
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group);
        // 开启生产者
        producer.start();
        // 生产消息
        Message msg = new Message(topic, tag, message.getBytes(StandardCharsets.UTF_8));
        // 设置延迟等级
        msg.setDelayTimeLevel(this.level);
        // 发送消息
        SendResult result = producer.send(msg);
        producer.shutdown();
        System.out.println("DelayProducer定时发送等级" + this.level + "->" + new SimpleDateFormat("mm:ss").format(new Date()));
        return result;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(new DelayProducer().send("delayTopic", "delay", "DelayProducer"));
    }
}
```

```txt
DelayProducer定时发送等级2->01:59
SendResult [sendStatus=SEND_OK, msgId=7F000001831463947C6B3CBB7B8E0000, offsetMsgId=C0A8D0D100002A9F00000000000003D2, messageQueue=MessageQueue [topic=delayTopic, brokerName=Didnelpsun, queueId=0], queueOffset=0]
```

然后等待五秒后消费者控制台打印：

```txt
PushConsumer等待消息:ClientConfig [namesrvAddr=127.0.0.1:9876, clientIP=192.168.208.209, instanceName=23472#353907936473000, clientCallbackExecutorThreads=8, pollNameServerInterval=30000, heartbeatBrokerInterval=30000, persistConsumerOffsetInterval=5000, pullTimeDelayMillsWhenException=1000, unitMode=false, unitName=null, vipChannelEnabled=false, useTLS=false, language=JAVA, namespace=null, mqClientApiTimeout=3000]
02:26->PushConsumer:MessageExt [brokerName=Didnelpsun, queueId=0, storeSize=240, queueOffset=0, sysFlag=0, bornTimestamp=1649761319822, bornHost=/192.168.208.209:57789, storeTimestamp=1649761324931, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F00000000000004CB, commitLogOffset=1227, bodyCRC=1902791803, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='delayTopic', flag=0, properties={MIN_OFFSET=0, REAL_TOPIC=delayTopic, MAX_OFFSET=1, CONSUME_START_TIME=1649761346989, UNIQ_KEY=7F000001831463947C6B3CBB7B8E0000, CLUSTER=DefaultCluster, DELAY=2, WAIT=true, TAGS=delay, REAL_QID=0}, body=[68, 101, 108, 97, 121, 80, 114, 111, 100, 117, 99, 101, 114], transactionId='null'}]
```

## 事务消息

即用原子性保证可靠性。由于消费服务器和业务服务器在不同的服务器上，所以需要分布式事务。

### &emsp;具体事务

#### &emsp;&emsp;事务场景

1. 工行系统发送一个给B增款1万元的同步消息M给Broker。
2. 消息被Broker成功接收后，向工行系统发送成功ACK。
3. 工行系统收到成功ACK后从用户A中扣款1万元。
4. 建行系统从Broker中获取到消息M。
5. 建行系统消费消息M，即向用户B中增加1万元。

#### &emsp;&emsp;实现过程

解决思路是，让第1、2、3步具有原子性，要么全部成功，要么全部失败。即消息发送成功后，必须要保证扣款成功。如果扣款失败，则回滚发送成功的消息。而该思路即使用事务消息。这里要使用分布式事务。

1. 事务管理器TM向事务协调器TC发起指令，开启全局事务。
2. 工行系统发一个给B增款1万元的事务消息M给TC。
3. TC会向Broker发送半事务消息prepareHalf，将消息M预提交到Broker。此时的建行系统是看不到Broker中的消息M的。
4. Broker会将预提交执行结果Report给TC。
5. 如果预提交失败，则TC会向TM上报预提交失败的响应，全局事务结束；如果预提交成功，TC会调用工行系统的回调操作，去完成工行用户A的预扣款1万元的操作。
6. 工行系统会向TC发送预扣款执行结果，即本地事务的执行状态。
7. TC收到预扣款执行结果后，会将结果上报给TM。
8. TM会根据上报结果向TC发出不同的确认指令：
    + 若预扣款成功（本地事务状态为COMMIT_MESSAGE），则TM向TC发送Global Commit指令。
    + 若预扣款失败（本地事务状态为ROLLBACK_MESSAGE），则TM向TC发送Global Rollback指令。
    + 若现未知状态（本地事务状态为UNKNOW），则会触发工行系统的本地事务状态回查操作。回查操作会将回查结果，即COMMIT_MESSAGE或ROLLBACK_MESSAGE Report给TC。TC将结果上报给TM，TM会再向TC发送最终确认指令Global Commit或Global Rollback。
9. TC在接收到指令后会向Broker与工行系统发出确认指令：
    + TC接收的若是Global Commit指令，则向Broker与工行系统发送Branch Commit指令。此时Broker中的消息M才可被建行系统看到；此时的工行用户A中的扣款操作才真正被确认。
    + TC接收到的若是Global Rollback指令，则向Broker与工行系统发送Branch Rollback指令。此刻Broker中的消息M将被撤销；工行用户A的扣款操作将回滚。

### &emsp;事务基础

#### &emsp;&emsp;事务基本概念

+ 事务消息：RocketMQ提供了类似X/Open XA的分布式事务功能，通过事务消息能达到分布式事务的最终一致。XA是一种分布式事务解决方案，一种分布式事务处理模式。
+ 半事务消息：暂不能投递的消息，发送方已经成功地将消息发送到了Broker，但是Broker未收到最终确认指令，此时该消息玻标记成“暂不能投递”状态，即不能被消费者看到。处于该种状态下的消息即半事务消息。
+ 本地事务状态：Producer回调操作执行的结果为本地事务状态，其会发送给TC，而TC会再发送给TM。TM会根据TC发送来的本地事务状态来决定全局事务确认指令。
+ 消息回查：重新查询本地事务的执行状态。不是重新执行回调操作。可以在Broker加载配置文件中设置：
  + transactionTimeout=20，指定TM在20秒内应将最终确认状态发送给TC，否则引发消息回查。默认为60秒。
  + transactionCheckMax=5，指定最多回查5次，超过后将丢弃消息并记录错误日志。默认15次。
  + transactionCheckInterval=10，指定设置的多次消息回查的时间间隔为10秒。默认为60秒。

#### &emsp;&emsp;XA模式

XA（Unix Transaction）是一种分布式事务解决方案，一种分布式事务处理模式，是基于XA协议的。XA协议由Tuxedo（Transaction for Unix has been Extended for Distributed Operation），分布式操作扩展之后的Unix事务系统）首先提出的，并交给X/Open组织，作为资源管理器与事务管理器的接口标准。XA模式中有三个重要组件：

+ TC：Transaction Coordinator，事务协调者。维护全局和分支事务的状态，驱动全局事务提交或回滚。RocketMQ中Broker作为TC。
+ TM：Transaction Manager，事务管理器。定义全局事务的范围：开始全局事务、提交或回滚全局事务。它实际是全局事务的发起者。RocketMQ中Producer作为TM。
+ RM：Resource Manager，资源管理器。管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。RocketMQ中Broker与Producer作为RM。

XA模式是一个典型的2PC，其执行原理如下：

1. TM向TC发起指令，开启一个全局事务。
2. 根据业务要求，各个RM会逐个向TC注册分支事务，然后TC会逐个向RM发出预执行指令。
3. 各个RM在接收到指令后会在进行本地事务预执行。
4. RM将预执行结果Report给TC。当然，这个结果可能是成攻，也可能是失败。
5. TC在接收到各个RM的Report后会将汇总结果上报给TM，根据汇总结果TM会向TC发出确认指令。
    + 若所有结果都是成功响应，则向TC发送Global Commit指令。
    + 只要有结果是失败响应，则向TC发送Global Rollback指令。
6. TC在接收到指令后再次向RM发送确认指令。

#### &emsp;&emsp;事务注意项

+ 事务消息不支持延时消息。
+ 对于事务消息要做好幂等性检查，因为事务消息可能不止一次被消费（因为存在回滚后再提交的情况）。

### &emsp;事务消息代码

由于事务生产者需要线程池，所以不能使用原来的DefaultMQProducer了。

[RocketMQ消息类型：MQ/rocketmq_type](https://github.com/Didnelpsun/MQ/tree/main/rocketmq_type)。
