---
layout: post
title:  "RocketMQ消息处理"
date:   2022-04-13 14:43:24 +0800
categories: notes mq rocketmq
tags: MQ RocketMQ 消息处理
excerpt: "RocketMQ消息处理"
---

由于代码基本上可以复用，所以使用[RocketMQ消息类型：MQ/rocketmq_type](https://github.com/Didnelpsun/MQ/tree/main/rocketmq_type)的代码并重命名为rocketmq_process。

修改pom.xml中的artifactId。

## 批量消息

### &emsp;批量发送消息

#### &emsp;&emsp;发送限制

生产者进行消息发送时可以一次发送多条消息，这可以大大提升Producer的发送效率。不过需要注意以下几点：

+ 批量发送的消息必须具有相同的Topic。
+ 批量发送的消息必须具有相同的刷盘策略。
+ 批量发送的消息不能是延时消息与事务消息。

#### &emsp;&emsp;发送大小

默认情况下，一批发送的消息总大小不能超过4MB字节。如果想超出该值，有两种解决方案：

+ 将批量消息进行拆分，拆分为若干不大于4M的消息集合分多次批量发送。
+ 在Producer端与Broker端修改属性：
  + Producer端需要在发送之前设置Producer的maxMessageSize属性。
  + Broker端需要修改其加载的配置文件中的maxMessageSize属性。

#### &emsp;&emsp;发送结构

生产者通过send()方法发送的Message，并不是直接将Message序列化后发送到网络上的，而是通过这个Message生成了一个字符串发送出去的。这个字符串由四部分构成: Topic、消息Body、消息日志（占20字节），及用于描述消息的一堆属性key-value（如tag）。这些属性中包含例如生产者地址、生产时间、要发送的Queueld等。最终写入到Broker中消息单元中的数据都是来自于这些属性。

### &emsp;批量消费消息

#### &emsp;&emsp;消费大小

Consumer定义的的MessageListenerConcurrently监听接口的consumeMessage()方法的第一个参数为消息列表，但默认情况下每次只能消费一条消息。若要使其一次可以消费多条消息，则可以通过修改Consumer的consumeMessageBatchMaxSize属性来指定。不过，该值不能超过32。因为默认情况下消费者每次可以拉取的消息最多是32条（即默认拉取一次消费32次）。若要修改一次拉取的最大值，则可通过修改Consumer的pullBatchSize属性来指定。

#### &emsp;&emsp;消费限制

Consumer的pullBatchSize属性与consumeMessageBatchMaxSize属性需要均衡配置：

+ pullBatchSize值设置的越大，Consumer每拉取一次需要的时间就会越长，且在网络上传输出现问题的可能性就越高。若在拉取过程中若出现了问题，那么本批次所有消息都需要全部重新拉取。
+ consumeMessageBatchMaxSize值设置的越大，Consumer的消息并发消费能力越低，且这批被消费的消息具有相同的消费结果。因为consumeMessageBatchMaxSize指定的一批消息只会使用一个线程进行处理，且在处理过程中只要有一个消息处理异常，则这批消息需要全部重新再次消费处理。

### &emsp;批量消息代码

新建一个batch包，在下面编写代码。

#### &emsp;&emsp;消息列表分割器

发送时要限制最大的消息发送数量，即默认不能超过4M，多了的就需要进行分割：

```java
// MessageSplitter.java
package org.didnelpsun.batch;

import org.apache.rocketmq.common.message.Message;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

// 消息列表分割器
// 将所有要发送的数据传入消息分割器，如果其中有数据大小过大则分割这个数据
// 实现了迭代器
public class MessageSplitter implements Iterator<List<Message>> {
    // 极限大小值
    private int size = 4 * 1024 * 1024;
    // 消息列表
    private List<Message> messages;
    // 要进行批量发送消息的起始索引值
    private int index;

    public MessageSplitter(List<Message> messages) {
        this.messages = messages;
    }

    public MessageSplitter(List<Message> messages, int size) {
        this.messages = messages;
        this.size = size;
    }

    // 如何判断还有数据
    @Override
    public boolean hasNext() {
        return index < messages.size();
    }

    // 获取下一批数据进行遍历
    @Override
    public List<Message> next() {
        int nextIndex;
        // 计算当前要发送的一批数据的大小
        int totalSize = 0;
        for (nextIndex = index; nextIndex < messages.size(); nextIndex++) {
            // 获取到此轮的数据
            Message message = messages.get(nextIndex);
            // 获取主题数据的大小与消息主题的大小
            int tempSize = message.getTopic().length() + message.getBody().length;
            // 获取附加信息properties的大小
            // 将属性包装为一个Map类型
            for (Map.Entry<String, String> entry : message.getProperties().entrySet()) {
                tempSize += entry.getKey().length() + entry.getValue().length();
            }
            // 加上日志的20个字节
            tempSize += 20;
            // 假如当前消息本身就大于限制了，则只要包含这个消息就一定发不出去，则发送消息会被永远卡在这里
            if (tempSize > this.size) {
                // 如果前面还有消息则nextIndex - index != 0返回前面的消息跳到下面
                // 如果就只有这个消息，则直接返回这单个消息
                if (nextIndex - index == 0) {
                    System.out.println("消息[" + nextIndex + "]单个大于大小限制" + this.size + "B");
                    nextIndex++;
                }
                // 如果返回的单个消息超过最大限制，则需要其他函数对单个消息进行大小判断
            }
            // 计算当前数据大小加上之前的数据大小之和
            // 如果大于限制则表示不能再发送了，停止，否则添加并累计大小
            if (tempSize + totalSize > this.size) {
                break;
            } else {
                totalSize += tempSize;
            }
        }
        // 根据index截取list
        // 因为如果大于限制就退出循环，所以nextIndex的数据不应该被包含，并且下一次发送应该从nextIndex重新开始
        List<Message> list = messages.subList(index, nextIndex);
        this.index = nextIndex;
        return list;
    }

    @Override
    public void remove() {
        Iterator.super.remove();
    }

    @Override
    public void forEachRemaining(Consumer<? super List<Message>> action) {
        Iterator.super.forEachRemaining(action);
    }
}
```

#### &emsp;&emsp;批量消息生产者

由于批量消息发送是多条消息一起发送的，所以批量消费生产者的定义跟之前的事务消息生产者一样需要传入多个message和tag并返回SendResult数组：

```java
// BatchProducer.java
package org.didnelpsun.batch;

import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

// 批量生产者
public class BatchProducer extends Producer {

    public BatchProducer() {
        super("batch");
    }

    public BatchProducer(String nameServer, String group) {
        super(nameServer, group);
    }

    public ArrayList<SendResult> send(List<Message> messages) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        return send(messages, 2, 3000);
    }

    public ArrayList<SendResult> send(String topic, List<String> tags, ArrayList<String> messages) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        return send(topic, tags, messages, 2, 3000);
    }

    public ArrayList<SendResult> send(String topic, List<String> tags, ArrayList<String> messages, int retryTimesWhenSendFailed, int sendMsgTimeout) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        if (tags.size() == 0 || messages.size() == 0) {
            System.out.println("tags和messages不应为空");
            return null;
        }
        // 封装发送消息
        List<Message> messageList = new ArrayList<>();
        // 循环，针对message大小，如果tag大小不一致则不一一对应，如果tag数量小于message数量则取模运算
        for (int i = 0; i < messages.size(); i++) {
            // 包装消息
            Message message = new Message(topic, tags.get(i % tags.size()), messages.get(i).getBytes(StandardCharsets.UTF_8));
            messageList.add(message);
        }
        return send(messageList, retryTimesWhenSendFailed, sendMsgTimeout);
    }

    public ArrayList<SendResult> send(List<Message> messages, int retryTimesWhenSendFailed, int sendMsgTimeout) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        if (messages.size() == 0) {
            System.out.println("messages不应为空");
            return null;
        }
        DefaultMQProducer producer = Producer.getDefaultMQProducer(this.nameServer, this.group, retryTimesWhenSendFailed, sendMsgTimeout);
        // 开启生产者
        producer.start();
        // 定义一个返回数组
        ArrayList<SendResult> results = new ArrayList<>();
        // 定义消息分割器
        MessageSplitter splitter = new MessageSplitter(messages);
        while (splitter.hasNext()){
            try {
                // 获取每一批切割的消息集合
                List<Message> messagesItem = splitter.next();
                // 发送消息
                SendResult result = producer.send(messagesItem);
                results.add(result);
            } catch (Exception e){
                e.printStackTrace();
            }
        }
        producer.shutdown();
        System.out.println("BatchProducer发送完成");
        return results;
    }

    public static void main(String[] args) throws Exception {
        String topic = "batchTopic";
        String tag = "batch";
        List<Message> messages = new ArrayList<>();
        messages.add(new Message(topic, tag, "A".getBytes(StandardCharsets.UTF_8)));
        messages.add(new Message(topic, tag, "B".getBytes(StandardCharsets.UTF_8)));
        messages.add(new Message(topic, tag, "C".getBytes(StandardCharsets.UTF_8)));
        messages.add(new Message(topic, tag, "D".getBytes(StandardCharsets.UTF_8)));
        messages.add(new Message(topic, tag, "E".getBytes(StandardCharsets.UTF_8)));
        System.out.println(new BatchProducer().send(messages));
    }
}
```

```txt
BatchProducer发送完成
[SendResult [sendStatus=SEND_OK, msgId=7F000001136818B4AAC24148580D0000,7F000001136818B4AAC24148580D0001,7F000001136818B4AAC24148580D0002,7F000001136818B4AAC24148580D0003,7F000001136818B4AAC24148580D0004, offsetMsgId=C0A8D0D100002A9F0000000000014B37,C0A8D0D100002A9F0000000000014BFC,C0A8D0D100002A9F0000000000014CC1,C0A8D0D100002A9F0000000000014D86,C0A8D0D100002A9F0000000000014E4B, messageQueue=MessageQueue [topic=batchTopic, brokerName=Didnelpsun, queueId=1], queueOffset=0]]
```

#### &emsp;&emsp;批量消息消费者

需要给消费者添加每次消费条数限制和每次可以拉取消息限制。

```java
// BatchConsumer.java
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
public class BatchConsumer extends PushConsumer {

    public BatchConsumer(String topic) {
        super("batch", topic);
    }

    public BatchConsumer(String group, String topic) {
        super(group, topic);
    }

    public BatchConsumer(String group, String topic, String tag) {
        super(group, topic, tag);
    }

    public BatchConsumer(String group, ConsumeFromWhere consumeType, String topic) {
        super(group, consumeType, topic);
    }

    public BatchConsumer(String nameServer, String group, String topic, String tag) {
        super(nameServer, group, topic, tag);
    }

    public BatchConsumer(String group, ConsumeFromWhere consumeType, String topic, String tag) {
        super(group, consumeType, topic, tag);
    }

    public BatchConsumer(String group, String topic, String tag, MessageModel mode) {
        super(group, topic, tag, mode);
    }

    public BatchConsumer(String nameServer, String group, ConsumeFromWhere consumeType, String topic, String tag, MessageModel mode) {
        super(nameServer, group, consumeType, topic, tag, mode);
    }

    @Override
    public void receive() throws MQClientException {
        // 定义一个push的Consumer
        DefaultMQPushConsumer consumer = Consumer.getDefaultMQPushConsumer( this.nameServer, this.group, this.type, this.topic, this.tag, this.mode);
        // 每次可以消费的消息条数
        consumer.setConsumeMessageBatchMaxSize(10);
        // 每次可以拉取消息条数
        consumer.setPullBatchSize(40);
        // 注册监听器
        // MessageListenerConcurrently为监听订阅消息
        // 返回值为当前消费者状态
        consumer.registerMessageListener((MessageListenerConcurrently) (list, consumeConcurrentlyContext) -> {
            for (MessageExt msg : list) {
                System.out.print(new SimpleDateFormat("mm:ss").format(new Date()));
                System.out.println("->BatchConsumer:" + msg);
            }
            // 返回状态为成功
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
        });
        // 开启消费者
        consumer.start();
        System.out.println("BatchConsumer等待消息:" + consumer);
    }

    public static void main(String[] args) throws MQClientException {
        new BatchConsumer("batchTopic").receive();
    }
}
```

```txt
BatchConsumer等待消息:ClientConfig [namesrvAddr=127.0.0.1:9876, clientIP=192.168.208.209, instanceName=25056#19459953962300, clientCallbackExecutorThreads=8, pollNameServerInterval=30000, heartbeatBrokerInterval=30000, persistConsumerOffsetInterval=5000, pullTimeDelayMillsWhenException=1000, unitMode=false, unitName=null, vipChannelEnabled=false, useTLS=false, language=JAVA, namespace=null, mqClientApiTimeout=3000]
23:50->BatchConsumer:MessageExt [brokerName=Didnelpsun, queueId=1, storeSize=197, queueOffset=0, sysFlag=0, bornTimestamp=1649837660490, bornHost=/192.168.208.209:57655, storeTimestamp=1649837660498, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F0000000000014B37, commitLogOffset=84791, bodyCRC=1406770827, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='batchTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=5, CONSUME_START_TIME=1649838230805, UNIQ_KEY=7F000001136818B4AAC24148580D0000, CLUSTER=DefaultCluster, WAIT=true, TAGS=batch}, body=[65], transactionId='null'}]
23:50->BatchConsumer:MessageExt [brokerName=Didnelpsun, queueId=1, storeSize=197, queueOffset=1, sysFlag=0, bornTimestamp=1649837660490, bornHost=/192.168.208.209:57655, storeTimestamp=1649837660498, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F0000000000014BFC, commitLogOffset=84988, bodyCRC=1255198513, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='batchTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=5, CONSUME_START_TIME=1649838230805, UNIQ_KEY=7F000001136818B4AAC24148580D0001, CLUSTER=DefaultCluster, WAIT=true, TAGS=batch}, body=[66], transactionId='null'}]
23:50->BatchConsumer:MessageExt [brokerName=Didnelpsun, queueId=1, storeSize=197, queueOffset=2, sysFlag=0, bornTimestamp=1649837660490, bornHost=/192.168.208.209:57655, storeTimestamp=1649837660498, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F0000000000014CC1, commitLogOffset=85185, bodyCRC=1037565863, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='batchTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=5, CONSUME_START_TIME=1649838230805, UNIQ_KEY=7F000001136818B4AAC24148580D0002, CLUSTER=DefaultCluster, WAIT=true, TAGS=batch}, body=[67], transactionId='null'}]
23:50->BatchConsumer:MessageExt [brokerName=Didnelpsun, queueId=1, storeSize=197, queueOffset=3, sysFlag=0, bornTimestamp=1649837660490, bornHost=/192.168.208.209:57655, storeTimestamp=1649837660498, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F0000000000014D86, commitLogOffset=85382, bodyCRC=598960644, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='batchTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=5, CONSUME_START_TIME=1649838230805, UNIQ_KEY=7F000001136818B4AAC24148580D0003, CLUSTER=DefaultCluster, WAIT=true, TAGS=batch}, body=[68], transactionId='null'}]
23:50->BatchConsumer:MessageExt [brokerName=Didnelpsun, queueId=1, storeSize=197, queueOffset=4, sysFlag=0, bornTimestamp=1649837660490, bornHost=/192.168.208.209:57655, storeTimestamp=1649837660498, storeHost=/192.168.208.209:10911, msgId=C0A8D0D100002A9F0000000000014E4B, commitLogOffset=85579, bodyCRC=1421105810, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='batchTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=5, CONSUME_START_TIME=1649838230805, UNIQ_KEY=7F000001136818B4AAC24148580D0004, CLUSTER=DefaultCluster, WAIT=true, TAGS=batch}, body=[69], transactionId='null'}]
```

&emsp;

## 消息过滤

消息者在进行消息订阅时，除了可以指定要订阅消息的Topic外，还可以对指定Topic中的消息根据指定条件进行过滤，即可以订阅比Topic更加细粒度的消息类型。

对于指定Topic消息的过滤有两种过滤方式：Tag过滤与SQL过滤。

### &emsp;Tag过滤

通过consumer的subscribe()方法指定要订阅消息的Tag。如果订阅多个Tag的消息，Tag间使用或运算符||双竖线连接。

### &emsp;SQL过滤

SQL过滤是一种通过特定表达式对事先埋入到消息中的用户属性进行筛选过滤的方式。通过SQL过滤，可以实现对消息的复泵过滤。不过，只有使用PUSH模式的消费者才能使用SQL过滤。

SQL过滤表达式中支持多种常量类型与运算符。

#### &emsp;&emsp;支持常量类型

+ 数值：比如123，3.1415。
+ 字符：必须用单引号包裹起来，比如'abc'。
+ 布尔：TRUE或FALSE。
+ NULL：特殊的常量，表示空。

#### &emsp;&emsp;支持运算符

+ 数值比较：>，>=，<，<=，BETWEEN，=。
+ 字符比较：=，<>，IN。
+ 逻辑运算：AND，OR，NOT。
+ NULL判断：IS NULL或者IS NOT NULL。

### &emsp;消息过滤代码

如果是Tag过滤，则在消费者端对订阅的tag进行修改。

如果是SQL过滤，则首先在生产者生产消息时埋入过滤属性，通过`message.putUserProperty(过滤名, 过滤值)`来指定，在消费的订阅的tag位置填上`MessageSelector.bySql(语句)`来过滤，语句跟SQL语句不同，没有动词，如`age between 0 and 6`。

默认情况下Broker没有开启消息的SQL过滤功能，需要在Broker加载的配置文件broker.conf（单机）或properties（集群）中添加如下属性，以开启该功能`enablePropertyFilter = true`，重新启动时要指定配置文件`mqbroker -n localhost:9876 -c D:\RocketMQ\rocketmq-4.9.3\conf\broker.conf`。否则会报错：Exception in thread "main" org.apache.rocketmq.remoting.exception.RemotingTooMuchRequestException: sendDefaultImpl call timeout和CODE: 1  DESC: The broker does not support consumer to filter message by SQL92。此时查看RocketMQ控制台的集群的分片的配置找到enablePropertyFilter就可以发现为true。

#### &emsp;&emsp;过滤消息生产者

定义一个父类，里面有一个配置的Map属性：

```java
// FilterProducer.java
package org.didnelpsun.filter;

import org.apache.rocketmq.common.message.Message;
import org.didnelpsun.Producer;

import java.util.Map;

// 参数生产者
public class FilterProducer extends Producer {

    // Map类型参数
    protected Map<String, Object> properties;

    public FilterProducer() {
        super("filter");
    }

    public FilterProducer(Map<String, Object> properties) {
        super("filter");
        this.properties = properties;
    }

    public FilterProducer(String group) {
        super(group);
    }

    public FilterProducer(String nameServer, String group) {
        super(nameServer, group);
    }

    // 添加参数
    public Object put(String key, Object value) {
        return this.properties.put(key, value);
    }

    // 移除参数
    public Object remove(String key) {
        return this.properties.remove(key);
    }

    // 对参数赋值
    public Message putUserProperty(Message message){
        for (String key : this.properties.keySet()) {
            message.putUserProperty(key,  String.valueOf(this.properties.get(key)));
        }
        return message;
    }
}
```

#### &emsp;&emsp;过滤同步消息生产者

参考同步生产者：

```java
// SyncFilterProducer.java
package org.didnelpsun.filter;

import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

// 参数同步生产者
public class SyncFilterProducer extends FilterProducer {

    public SyncFilterProducer() {
        super();
    }

    public SyncFilterProducer(Map<String, Object> properties) {
        super();
        this.properties = properties;
    }

    public SyncFilterProducer(String group) {
        super(group);
    }

    public SyncFilterProducer(String nameServer, String group) {
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
        // 发送消息并赋值
        SendResult result = producer.send(this.putUserProperty(msg));
        producer.shutdown();
        System.out.println("SyncFilterProducer发送完成");
        return result;
    }

    public static void main(String[] args) throws Exception {
        Map<String, Object> prop = new HashMap<>();
        prop.put("age", 10);
        System.out.println(new SyncFilterProducer(prop).send("filterTopic", "sync", "SyncFilterProducer"));
    }
}
```

```txt
SyncFilterProducer发送完成
SendResult [sendStatus=SEND_OK, msgId=7F00000173C418B4AAC246F1964A0000, offsetMsgId=C0A8006600002A9F00000000000150A4, messageQueue=MessageQueue [topic=filterTopic, brokerName=broker-a, queueId=0], queueOffset=0]
```

#### &emsp;&emsp;过滤异步消息生产者

同理：

```java
// AsyncFilterProducer.java
package org.didnelpsun.filter;

import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.didnelpsun.Producer;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

// 参数异步生产者
public class AsyncFilterProducer extends FilterProducer {
    // 异步等待确认的睡眠时间
    private int sleep;

    public AsyncFilterProducer() {
        super();
        this.sleep = 5;
    }

    public AsyncFilterProducer(Map<String, Object> properties) {
        super();
        this.properties = properties;
        this.sleep = 5;
    }

    public AsyncFilterProducer(String group) {
        super(group);
        this.sleep = 5;
    }

    public AsyncFilterProducer(String group, int sleep) {
        super(group);
        this.sleep = sleep;
    }

    public AsyncFilterProducer(String nameServer, String group) {
        super(nameServer, group);
        this.sleep = 5;
    }

    public AsyncFilterProducer(String nameServer, String group, int sleep) {
        super(nameServer, group);
        this.sleep = sleep;
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
        // 发送消息，需要传入一个异步回调函数
        final SendResult[] result = new SendResult[]{null};
        producer.send(this.putUserProperty(msg), new SendCallback() {
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
        System.out.println("AsyncFilterProducer发送完成");
        return result[0];
    }

    public static void main(String[] args) throws Exception {
        Map<String, Object> prop = new HashMap<>();
        prop.put("age", 15);
        System.out.println(new AsyncFilterProducer(prop).send("filterTopic", "async", "AsyncFilterProducer"));
    }
}
```

```txt
AsyncFilterProducer发送完成
SendResult [sendStatus=SEND_OK, msgId=7F0000011C7818B4AAC246F1F6710000, offsetMsgId=C0A8006600002A9F000000000001538F, messageQueue=MessageQueue [topic=filterTopic, brokerName=broker-a, queueId=0], queueOffset=1]
```

#### &emsp;&emsp;过滤消息消费者

由于tag和sql是不兼容的，而我们之前已经定死了使用tag，所以我们需要重新设置一个新的Consumer：

```java
// FilterConsumer.java
package org.didnelpsun.consumer;

import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.consumer.MessageSelector;
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;
import org.apache.rocketmq.common.message.MessageExt;
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;

import java.text.SimpleDateFormat;
import java.util.Date;

public class FilterConsumer extends Consumer {
    // SQL语句，默认为空
    // 如果sql为空，则默认tag为*进行查询，而父类默认tag就是*，所以此时不用再重新设置
    protected String sql = "";

    public FilterConsumer(String topic) {
        super("filter", topic);
    }

    public FilterConsumer(String topic, String sql) {
        super("filter", topic);
        this.sql = sql;
    }

    public FilterConsumer(String group, String topic, String sql) {
        super(group, topic);
        this.sql = sql;
    }

    public FilterConsumer(String group, ConsumeFromWhere type, String topic) {
        super(group, type, topic);
    }

    public FilterConsumer(String nameServer, String group, String topic, String sql) {
        super(nameServer, group, topic, sql);
        this.sql = sql;
    }

    public FilterConsumer(String group, ConsumeFromWhere type, String topic, String sql) {
        super(group, type, topic);
        this.sql = sql;
    }

    public FilterConsumer(String group, String topic, String tag, MessageModel mode) {
        super(group, topic, tag, mode);
    }

    public FilterConsumer(String nameServer, String group, ConsumeFromWhere type, String topic, String sql, MessageModel mode) {
        super(nameServer, group, type, topic, mode);
        this.sql = sql;
    }

    // 获取过滤消费者实例
    public static DefaultMQPushConsumer getFilterMQPushConsumer(String nameServer, String group, ConsumeFromWhere type, String topic, String sql, MessageModel mode) throws MQClientException {
        // 定义一个filter的Consumer
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(group);
        consumer.setNamesrvAddr(nameServer);
        consumer.setConsumeFromWhere(type);
        consumer.subscribe(topic, MessageSelector.bySql(sql));
        consumer.setMessageModel(mode);
        return consumer;
    }

    @Override
    public void receive() throws MQClientException {
        DefaultMQPushConsumer consumer;
        if (this.sql.length() == 0)
            consumer = getDefaultMQPushConsumer(this.nameServer, this.group, this.type, this.topic, this.tag, this.mode);

        else
            // 定义一个filter的Consumer
            consumer = getFilterMQPushConsumer(this.nameServer, this.group, this.type, this.topic, this.sql, this.mode);
        // 注册监听器
        // MessageListenerConcurrently为监听订阅消息
        // 返回值为当前消费者状态
        consumer.registerMessageListener((MessageListenerConcurrently) (list, consumeConcurrentlyContext) -> {
            for (MessageExt msg : list) {
                System.out.print(new SimpleDateFormat("mm:ss").format(new Date()));
                System.out.println("->FilterConsumer:" + msg);
            }
            // 返回状态为成功
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
        });
        // 开启消费者
        consumer.start();
        System.out.println("FilterConsumer等待消息:" + consumer);
    }

    @Override
    public String toString() {
        return "FilterConsumer{" + "sql='" + sql + '\'' + ", nameServer='" + nameServer + '\'' + ", group='" + group + '\'' + ", type=" + type + ", topic='" + topic + '\'' + ", tag='" + tag + '\'' + ", mode=" + mode + '}';
    }

    public static void main(String[] args) throws MQClientException {
        new FilterConsumer("filterTopic", "age > 10").receive();
    }
}
```

此时发现只过滤到了age为15的异步消息。

```txt
FilterConsumer等待消息:ClientConfig [namesrvAddr=127.0.0.1:9876, clientIP=192.168.0.102, instanceName=20352#31031653679500, clientCallbackExecutorThreads=8, pollNameServerInterval=30000, heartbeatBrokerInterval=30000, persistConsumerOffsetInterval=5000, pullTimeDelayMillsWhenException=1000, unitMode=false, unitName=null, vipChannelEnabled=false, useTLS=false, language=JAVA, namespace=null, mqClientApiTimeout=3000]
37:42->FilterConsumer:MessageExt [brokerName=broker-a, queueId=0, storeSize=203, queueOffset=1, sysFlag=0, bornTimestamp=1649932662386, bornHost=/192.168.0.102:54725, storeTimestamp=1649932662396, storeHost=/192.168.0.102:10911, msgId=C0A8006600002A9F000000000001538F, commitLogOffset=86927, bodyCRC=496717472, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message{topic='filterTopic', flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=2, CONSUME_START_TIME=1649932662409, UNIQ_KEY=7F0000011C7818B4AAC246F1F6710000, CLUSTER=DefaultCluster, TAGS=async, age=15}, body=[65, 115, 121, 110, 99, 70, 105, 108, 116, 101, 114, 80, 114, 111, 100, 117, 99, 101, 114], transactionId='null'}]
```

&emsp;

## 消息发送重试

### &emsp;重发机制

Producer对发送失败的消息进行重新发送的机制，称为消息发送重试机制，也称为消息重投机制。

对于消息重投需要注意以下几点:

+ 生产者在发送消息时，若采用同步或异步发送方式，发送失败会重试，但oneway消息发送方式发送失败是没有重试机制的。
+ 只有普通消息具有发送重试机制，顺序消息是没有的。
+ 消息重投机制可以保证消息尽可能发送成功、不丢失，但可能会造成消息重复。消息重复在RocketMQ中是无法避免的问题。
+ 消息重复在一般情况下不会发生，当出现消息量大、网络抖动，消息重复就会成为大概率事件。
+ Producer主动重发、Consumer负载变化（即Rebalance，不会消息重复，但可能重复消费）也会导致重复消息。
+ 消息重复无法避免，但要避免消息的重复消费。
避免消息重复消费的解决方案是，为消息添加唯一标识（如消息Key），使消费者对消息进行消费判断来避免重复消费。
+ 消息发送重试有三种策略可以选择：同步发送失败策略、异步发送失败策略、消息刷盘失败策略。

### &emsp;同步发送失败策略

对于普通消息，消息发送默认采取round-robin轮询策略来选择所发送到的队列。如果发送失败，默认重试2次。但在重试时是不会选择上次发送失败的Broker，而是选择其它Broker。如果只有一个Broker，则会发送到不同的Queue（所以顺序消息无法实现重试机制）

同时，Broker还具有失败隔离功能，使Producer尽量选择未发生过发送失败的Broker作为目标Broker。

如果超过重试次数，则抛出异常，由Producer去保证消息不丢。当然当生产者出现RemotingException.MQClientException和MQBrokerException时，Producer会自动重投消息。

### &emsp;异步发送失败策略

异步发送失败重试时，异步重试不会选择其他broker，仅在同一个broker上做重试，所以该策略无法保证消息不丢。

### &emsp;消息刷盘失败策略

Master或Slave消息刷盘超时或Slave不可用（返回状态非SEND_OK）时，默认是不会将消息尝试发送到其他Broker的。不过，对于重要消息可以通过在Broker的配置文件设置retryAnotherBrokerWhenNotStoreOK属性为true来开启。

&emsp;

## 消息消费重试

### &emsp;顺序消息的消费重试

对于顺序消息，当Consumer消费消息失败后，为了保证消息的顺序性，其会自动不断地进行消息重试，直到消费成功。默认间隔为1秒，可以使用`consumer.ssetSuspendCurrentQueueTimeMillis`来设置，取值范围为10到30000。重试期间应用会出现消息消费被阻塞的情况。所以要求及时监控消费失败情况，避免消费被永久阻塞。

### &emsp;无序消息的消费重试

#### &emsp;&emsp;无序消息重试机制

对于无序消息，当Consumer消费消息失败时，可以通过设置返回状态达到消息重试的效果。不过需要注意，无序消息的重试只对集群消费方式生效，广播消费方式不提供失败重试特性。即对于广播消费，消费失败后，失败消息不再重试，继续消费后续消息。

#### &emsp;&emsp;消费重试次数与间隔

对于无序消息集群消费下的重试消费，每条消息默认最多重试16次，但每次重试的间隔时间是不同的，会逐渐变长。每次重试的间隔时间如下表（跟消息延迟等级类似）。

重试次数|与上次重试的间隔时间|重试次数|与上次重试的间隔时间
:------:|:------------------:|:------:|:------------------:
1|10秒|9|7分钟
2|30秒|10|8分钟
3|1分钟|11|9分钟
4|2分钟|12|10分钟
5|3分钟|13|20分钟
6|4分钟|14|50分钟
7|5分钟|15|1小时
8|6分钟|16|2小时

+ 如果超过16次则时间间隔为2小时。如果一直失败，则投递到死信队列。
+ 对于Consumer Group，若仅修改了一个Consumer的消费重试次数，则会应用到该Group中所有其它Consumer实例。如果多个Consumer有不同的设置，则最后被修改的值会覆盖之前的值。

### &emsp;重试队列

对于需要重试消费的消息，并不是Consumer在等待了指定时长后再次去拉取原来的消息进行消费，而是将这些需要重试消费的消息放入到了一个特殊Topic的队列中，而后进行再次消费的。这个特殊的队列就是重试队列。

当出现需要进行重试消费的消息时，Broker会为每个**消费组**都设置一个Topic名称为%RETRY%consumerGroup@consumerGroup的重试队列。

Broker对于重试消息的处理是通过延时消息实现的。先将消息保存到SCHEDULE _TOPIC_XXX延迟队列中，延迟时间到后，会将消息投递到%RETRY%consumerGroup@consumerGroup重试队列中。

### &emsp;重试配置

#### &emsp;&emsp;消费重试配置

集群消费方式下，消息消费失败后若希望消费重试，则需要在消息监听器接口的实现中明确进行如下三种方式之一的配置：

1. 返回ConsumeConcurrentlyStatus.RECONSUME_LATER。（官方推荐）
2. 返回Null。
3. 抛出异常。

#### &emsp;&emsp;消费不重试配置

集群消费方式下，消息消费失败后若不希望消费重试，则在捕获到异常后同样也返回与消费成功后的相同的结果，即ConsumeConcurrentlyStatus.CONSUME_SUCCESS，则不进行消费重试。

&emsp;

## 死信队列

### &emsp;概念

当一条消息初次消费失败，消息队列会自动进行消息重试;达到最大重试次数后，若消费依然失败，则表明消费者在正常情况下无法正确地消费该消息，此时，消息队列不会立刻将消息丢弃，而是将其发送到该消费者对应的特殊队列中。这个队列就是死信队列（Dead-Letter Queue，DLQ），而其中的消息则称为死信消息（Dead-Letter Message，DLM）。

### &emsp;特征

+ 死信队列中的消息不会再被消费者正常消费。
+ 死信存储有效期与正常消息相同，均为3天，3天后会被自动删除。
+ 死信队列就是一个特殊的Topic，名称为%DLQ%consumerGroup@consumerGroup。即每个消费者组都有一个死信队列。
+ 如果一个消费者组未产生死信消息，则不会为其创建相应的死信队列。

### &emsp;处理

实际上，当一条消息进入死信队列，就意味着系统中某些地方出现了问题，从而导致消费者无法正常消费该消息，比如代码中原本就存在Bug。因此，对于死信消息，通常需要开发人员进行特殊处理。最关键的步骤是要排查可疑因素，解决代码中可能存在的Bug。然后再将原来的死信消息再次进行投递消费。

[RocketMQ消息处理：MQ/rocketmq_process](https://github.com/Didnelpsun/MQ/tree/main/rocketmq_process)。
