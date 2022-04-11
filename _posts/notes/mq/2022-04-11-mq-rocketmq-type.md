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

在java下新建org.didnelpsun.normal作为普通消息软件包。

默认生产者会给新创建的Topic生成四个队列Queue，如果需要指定则通过`producer.setDefaultTopicQueueNums`。

#### &emsp;&emsp;同步消息生产者

在normal下新建一个SyncProducer：

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

```txt
SendResult [sendStatus=SEND_OK, msgId=7F000001C14463947C6B386FD3620000, offsetMsgId=C0A85DD100002A9F00000000000000BC, messageQueue=MessageQueue [topic=normalTopic, brokerName=Didnelpsun, queueId=0], queueOffset=0]
```


## 顺序消息

## 延时消息

## 事务消息

[RocketMQ消息类型：MQ/rocketmq_type](https://github.com/Didnelpsun/MQ/tree/main/rocketmq_type)。
