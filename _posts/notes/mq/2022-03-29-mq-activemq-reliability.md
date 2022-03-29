---
layout: post
title:  "ActiveMQ可靠性"
date:   2022-03-29 15:09:56 +0800
categories: notes mq activemq
tags: MQ ActiveMQ 消息 事务
excerpt: "ActiveMQ可靠性"
---

JMS的可靠性靠三个方面完成：持久性、事务、签收。

## 消息

即Message对象。

### &emsp;组成

#### &emsp;&emsp;消息头

+ JSMDestination：发送目的地，主要指Queue和Topic。
+ JSMDeliveryMode：发送模式，即：
  + 持久模式PERSISTENT：消息应该被传送“一次仅仅一次”，这就意味者如果JMS提供者出现故障，该消息并不会丢失，它会在服务器恢复之后再次传递。
  + 非持久模式NON_PERSISTENT：最多会传送一次，这意味这服务器出现故障，该消息将永远丢失。
+ JMSExpiration：消息过期时间：
  + 默认永不过期。
  + 消息过期时间等于Destination的send方法中的timeToLive值加上发送时刻的GMT时间值。
  + 如果timeToLive值等于零，则JMSExpiration被设为零，表示该消息永不过期。
  + 如果发送后，在消息过期时间之后消息还没有被发送到目的地，则该消息被清除。
+ JMSPriority：消息优先级：
  + 从0-9十个级别，0到4是普通消息，5到9是加急消息。
  + JMS不要求MQ严格按照这十个优先级发送消息，但必须保证加急消息要先于普通消息到达。
  + 默认是4级。
+ JMSMessageID：消息ID，消息唯一标识，使用雪花算法由MQ产生。

#### &emsp;&emsp;消息体

是封装具体消息数据的部分，发送和接收的消息体类型必须一致。

具有五种消息体格式：

+ TextMessage：普通字符串消息，包含一个String。
+ MapMessage：一个Map类型的消息，key为String类型，而值为Java的基本类型。
+ BytesMessagee：二进制数组消息，包含一个byte[]数组。
+ StreamMessage：Java数据流消息，用标准流操作来顺序的填充和读取。
+ ObjectMessage：对象消息，包含一个可序列化的Java对象。

最常用的是前两个，由Session产生消息体。

#### &emsp;&emsp;消息属性

如果需要除消息头字段以外的值，那么可以使用消息属性，用于识别、去重、重点标注等。

他们是以属性名和属性值对的形式制定的。可以将属性是为消息头得扩展，属性指定一些消息头没有包括的附加信息，比如可以在属性里指定消息选择器。

消息的属性就像可以分配给一条消息的附加消息头一样。它们允许开发者添加有关消息的不透明附加信息。它们还用于暴露消息选择器在消息过滤时使用的数据。

使用`setStringProperty`方法设置，`getStringProperty`方法获取。

### &emsp;持久化

通过对Producer设置传输模式JSMDeliveryMode。

#### &emsp;&emsp;队列非持久化

如果对于队列进行非持久化，即对`Producer.setDeliveryMode(DeliveryMode.NON_PERSISTENT)`，那么消息是不存在的，即数量为0，但是此时队列这个容器还是存在的。

#### &emsp;&emsp;队列持久化

消息持久化是队列的的默认传送模式，此模式保证这些消息只被传送一次和成功使用一次。对于这些消息，可靠性是优先考虑的因素。可靠性的另一个重要方面是确保持久性消息传送至目标后，消息服务在向消费者传送即消费前它们之前不会丢失这些消息。

如果设置数据持久化，那么消息是能被保存的，这个消息是被保存在Number of Pending Messages中，即等待入队。

此时Messages Enqueued和Messages Dequeued都是0，即使宕机前已经有消息入队了，即ActiveMQ只保存消息本身，而不保存消息是否入队这个状态，因为ActiveMQ是无状态的，如果宕机了，持久化会保存消息并认为消息是没有入队的。

如果消息已经出队了被消费掉了则ActiveMQ是不保存的。

#### &emsp;&emsp;主题持久化

ActiveMQ默认的主题消费者是不持久的，只向当前启动的消费者发送消息，关掉的消费者，会错过很多消息，并无法再次接收这些消息，所以无法同步信息。让消费者重新启动时，接收到错过的消息就必须持久化订阅。

持久化订阅必须设置客户端ID`connection.setClientID`，且需要定义一个TopicSubscriber来替换原来的MessageConsumer。

接着上面使用过的[ActiveMQ使用Java实现：MQ/activemq_java](https://github.com/Didnelpsun/MQ/tree/main/activemq_java)，并重命名为activemq_java_reliability，在entity下新建一个PersistentConsumer并复制TopicConsumer代码进行改造：

```java
// PersistentConsumer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;
import java.io.IOException;

public class PersistentConsumer extends Consumer {
    protected String clientId;

    public PersistentConsumer(String activemq_url, String topic_name) {
        super(activemq_url, topic_name);
        this.clientId = "clientId";
    }

    public PersistentConsumer(String activemq_url, String topic_name, String clientId) {
        super(activemq_url, topic_name);
        this.clientId = clientId;
    }

    @Override
    public boolean receive() {
        try {
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            // 设置订阅者ID
            connection.setClientID(this.clientId);
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Topic topic = session.createTopic(destination_name);
            // 5.创建消息的消费者
            // 参数topic为发送端的主题，参数name为这个订阅的名字
            TopicSubscriber topicSubscriber = session.createDurableSubscriber(topic, this.clientId + "subscribe");
            // 启动服务
            connection.start();
            // 6.进行接收
            Message message = topicSubscriber.receive();
            while (message != null){
                TextMessage textMessage = (TextMessage) message;
                System.out.println("receivePersistentTopicMessage:" + textMessage.getText());
                message = topicSubscriber.receive(3000);
            }
            // 7.关闭资源
            topicSubscriber.close();
            session.close();
            connection.close();
            return true;
        } catch (JMSException e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

然后test中编写一个测试函数：

```java
// PersistentTest.java
package org.didnelpsun;

import org.didnelpsun.entity.PersistentConsumer;

public class PersistentTest {
    // 设置ActiveMQ的连接地址，后端运行在61616
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    // 设置目的地主题名称
    public static final String topic_name = "topic_test";
    public static void main(String[] args) {
        if (new PersistentConsumer(activemq_url, topic_name).receive())
            System.out.println("消息接收完成");
        else
            System.out.println("消息接收失败");
    }
}
```

然后运行这个测试函数，跳到<http://127.0.0.1:8161/admin/subscribers.jsp>可以看到订阅的信息，Active Durable Topic Subscribers标识活跃的持久化主题订阅者，这里就有我们定义的默认ID为clientId的订阅者信息，然后运行test中的ProviderTest提供信息，订阅者打印：

```txt
receivePersistentTopicMessage:sendTopicMessage:1
receivePersistentTopicMessage:sendTopicMessage:2
receivePersistentTopicMessage:sendTopicMessage:3
消息接收完成
```

表示收到信息，等待三秒后clientId订阅者从Active Durable Topic Subscribers变为Offline Durable Topic Subscribers，表示这个订阅者下线了。

此时如果我们先启动生产者程序再生产三条消息，然后再将订阅者程序运行让clientId订阅者上线，则clientId订阅者可以收到刚生产的三条信息。

所以持久化订阅后一定要先运行一次消费者程序，让订阅者向MQ注册，即“留个坑位”。无论订阅者是否在线，等上线后订阅者都能收到没有收到的所有消息。

&emsp;

## 事务

之前我们在设置`connection.createSession`时将第一个参数设为false，表示不使用事务方式提交会话。

事务偏向于生产者。

### &emsp;生产者事务

如果不使用事务，则只要执行send发送，消息就立刻进入消息队列，此时createSession的第二个有关签收的参数的设置就必须有效，否则无法处理。

如果使用事务，则执行send发送，消息不会立刻进入消息队列，此时createSession的第二个有关签收的参数的设置不是必要的。即我们如果使用事务，执行send后查看ActiveMQ控制台会发现会显示0，0，0，0，即消息还没有送到准备队列中。

只有再执行一个commit方法，消息才能被真正提交到队列中。生产者事务需要进行批量发送，需要缓冲区处理，如果出错就调用rollback进行回滚。

### &emsp;消费者事务

消费者也存在事务。如果是false，则消息只能消费一次，消费了一次后面就无法消费，进行等待。如果是true，也需要使用commit进行提交事务，如果不commit提交，那么可以对消息进行不断地重复消费，消费了之后不会提交消息已经被消费的状态，从而Messages Dequeued仍然是0；只有commit之后，消费了的消息才能出列表示已经被消费了。

&emsp;

## 签收

签收偏向于消费者。一般签收都是针对消费者，生产者没有签收这个概念。

createSession的第二个用来传签收的参数。

### &emsp;非事务模式

+ 自动签收AUTO_ACKNOWLEDGE：默认，一旦接收方应用程序的消息处理回调函数返回，会话对象就会自动确认消息的接收。 一般接收方的做法是调用`consumer.setMessageListener()`注册消息处理函数，如果该函数返回，代表着一条消息被接受方成功接收， ActiveMQ服务器会认为消息接收成功。函数的返回可以是正常的返回，也可以是因为抛出异常而结束。
+ 手动签收CLIENT_ACKNOWLEDGE：客户端调用acknowledge方法进行签收。
+ 允许重复消息：DUPS_OK_ACKNOWLEDGE：可以允许部分重复，。

### &emsp;有事务模式

SESSION_TRANSACTED：使用事务签收
