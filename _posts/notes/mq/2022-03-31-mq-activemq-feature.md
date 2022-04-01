---
layout: post
title:  "ActiveMQ特性"
date:   2022-03-31 19:29:01 +0800
categories: notes mq activemq
tags: MQ ActiveMQ 特性
excerpt: "ActiveMQ特性"
---

## 投递

### &emsp;异步投递

[官网异步投递介绍](https://activemq.apache.org/async-sends)。

#### &emsp;&emsp;特点

消息队列默认三个特色，异步、削峰、解耦，所以投递默认都是异步的。ActiveMQ支持同步异步两种模式。

如果明确指定使用同步，或不使用事务的情况下发送持久消息，那么将以同步方式发送。对于第二种情况，每一次同步发送会阻塞生产者直到Broker返回一个确认表示消息已经被持久化到磁盘，保证了消息安全，但是造成了很大延时。

对于慢消费者使用同步发送消息可能出现producer堵塞等情况，慢消费者适合使用异步发送。如果允许少量数据丢失可以异步发送持久化消息。

#### &emsp;&emsp;配置异步

Spring：

+ `new ActiveMQConnectionFactory("tcp://locahost:61616?jms.useAsyncSend=true");`。
+ `((ActiveMQConnectionFactory)connectionFactory).setUseAsyncSend(true);`。
+ `((ActiveMQConnection)connection).setUseAsyncSend(true);`。

#### &emsp;&emsp;确认异步

那么异步发送如何确认是否成功？

异步发送丢失消息的场景是：生产者设置UseAsyncSend=true，使用producer.send(msg)持续发送消息。由于消息不阻塞，生产者会认为所有send的消息均被成功发送至MQ。如果MQ突然宕机，此时生产者端内存中尚未被发送至MQ的消息都会丢失。

所以，正确的异步发送方法是需要自己定义方法接收回调ACK的。

同步发送和异步发送的区别就在此，同步发送等send不阻塞了就表示一定发送成功了，异步发送需要接收回执并由客户端再判断一次是否发送成功。

打开[ActiveMQ使用Java实现可靠性：MQ/activemq_java_reliability](https://github.com/Didnelpsun/MQ/tree/main/activemq_java_reliability)代码，然后复制一个QueueProducer改为AckQueueProducer：

```java
// AckQueueProducer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.ActiveMQMessageProducer;
import org.apache.activemq.AsyncCallback;

import javax.jms.*;
import java.util.UUID;

public class AckQueueProducer extends Producer {
    public AckQueueProducer(String activemq_url, String queue_name) {
        super(activemq_url, queue_name);
    }

    public boolean send() {
        try {
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 设置同步
            activeMQConnectionFactory.setUseAsyncSend(true);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Queue queue = session.createQueue(destination_name);
            // 5.创建消息的生产者
            // 使用需要确认的消息生产者
            ActiveMQMessageProducer activeMQMessageProducer = (ActiveMQMessageProducer) session.createProducer(queue);
            // 6.使用MessageProducer生产消息发送到MQ的队列中
            for (int i = 1; i <= 3; i++) {
                // 生产一个随机ID
                String id = UUID.randomUUID().toString();
                // 7.创建消息，可以视为一个字符串
                TextMessage textMessage = session.createTextMessage("sendAckQueueMessage:" + i + ",id:" + id);
                // 设置消息ID
                textMessage.setJMSMessageID(id);
                // 8.通过MessageProducer发送消息给MQ，并获取回调函数
                activeMQMessageProducer.send(textMessage, new AsyncCallback() {
                    @Override
                    public void onSuccess() {
                        System.out.println("id:" + id + "消息发送成功");
                    }

                    @Override
                    public void onException(JMSException e) {
                        e.printStackTrace();
                        System.out.println("id:" + id + "消息发送失败");
                    }
                });
            }
            // 9.关闭资源
            activeMQMessageProducer.close();
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

### &emsp;延时投递与重复投递

[官网延时投递与定时投递](https://activemq.apache.org/delay-and-schedule-message-delivery)。

#### &emsp;&emsp;配置延时

首先在activemq.xml配置中的broker标签设置`schedulerSupport="true"`。

属性名称|数值类型|介绍
AMQ_SCHEDULED_DELAY|long|延时投递时间
AMQ_SCHEDULED_PERIOD|long|重复投递时间间隔
AMQ_SCHEDULED_REPEAT|int|重复投递次数
AMQ_SCHEDULED_CRON|String|Cron表达式设置定时

#### &emsp;&emsp;编写代码

继续使用上面的代码，然后新建消费者和生产者。封装了一个辅助消息类ScheduledMessage：

```java
// DelayQueueProducer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.ScheduledMessage;

import javax.jms.*;

public class DelayQueueProducer extends Producer {
    public DelayQueueProducer(String activemq_url, String queue_name) {
        super(activemq_url, queue_name);
    }

    public boolean send() {
        try{
            // 延迟时间
            long delay = 3 * 1000;
            // 重复间隔
            long period = 4 * 1000;
            // 重复次数
            int repeat = 5;
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Queue queue = session.createQueue(destination_name);
            // 5.创建消息的生产者
            MessageProducer messageProducer = session.createProducer(queue);
            // 6.使用MessageProducer生产消息发送到MQ的队列中
            for (int i = 1; i <= 3; i++) {
                // 7.创建消息，可以视为一个字符串
                TextMessage textMessage = session.createTextMessage("sendDelayQueueMessage:"+i);
                // 设置投递相关参数
                // 设置Long型参数就是setLongProperty方法
                textMessage.setLongProperty(ScheduledMessage.AMQ_SCHEDULED_DELAY, delay);
                textMessage.setLongProperty(ScheduledMessage.AMQ_SCHEDULED_PERIOD, period);
                // 设置Int型参数就是setIntProperty方法
                textMessage.setIntProperty(ScheduledMessage.AMQ_SCHEDULED_REPEAT, repeat);
                // 8.通过MessageProducer发送消息给MQ
                messageProducer.send(textMessage);
            }
            // 9.关闭资源
            messageProducer.close();
            session.close();
            connection.close();
            return true;
        } catch (JMSException e){
            e.printStackTrace();
            return false;
        }
    }
}
```

然后编写测试文件：

```java
// DelayQueueProducerTest.java
package org.didnelpsun;

import org.didnelpsun.entity.DelayQueueProducer;

public class DelayQueueProducerTest {
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    public static final String queue_name = "queue_test";

    public static void main(String[] args) {
        if (new DelayQueueProducer(activemq_url, queue_name).send())
            System.out.println("消息发送完成");
        else
            System.out.println("消息发送失败");
    }
}
```

消费者测试文件：

```java
// DelayQueueConsumerTest.java
package org.didnelpsun;

import org.didnelpsun.entity.ListenerConsumer;

public class DelayQueueConsumerTest {
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    public static final String queue_name = "queue_test";

    public static void main(String[] args) {
        if (new ListenerConsumer(activemq_url, queue_name).receive())
            System.out.println("消息接收完成");
        else
            System.out.println("消息接收失败");
    }
}
```

先启动消费者再启动生产者，虽然生产者启动后已经停止了，但是消息由于会延时发送所以即使代码停止MQ会一直发送消息。

&emsp;

## 消息重发

[官网重发介绍](https://activemq.apache.org/redelivery-policy)。

### &emsp;重发场景

+ 客户端用了事务且在session中调用了`rollback()`。
+ 客户端用了事务且在调用`commit()`之前关闭或着直接没有`commit()`。
+ 客户端在CLIENT_ACKNOWLEDGE的传递模式下，在session中调用了`recover()`。

默认重发间隔是一秒钟，重复次数是六次。

### &emsp;有毒消息

一个消息被重发超过默认的最大重发次数（默认6次）时，消费端会给MQ发送一个poison ack表示这个消息有毒（有异常），告诉broker不要再发了。这个时候broker会把这个消息放到DLQ（死信队列）。

### &emsp;重发配置

对消费者进行重发配置：

1. collisionAvoidanceFactor：设置防止冲突范围的正负百分比，只有启用useCollisionAvoidance参数时才生效。也就是在延迟时间上再加一个时间波动范围。默认值为0.15。
2. maximumRedeliveries：最大重传次数，达到最大重连次数后抛出异常。为-1时不限制次数，为0时表示不进行重传。默认值为6。
3. maximumRedeliveryDelay：最大传送延迟，只在useExponentialBackOff=true时有效（V5.5），假设首次重连间隔为10ms，倍数为2，那么第二次重连时间间隔为20ms，第三次重连时间间隔为40ms，当重连时间间隔大的最大重连时间间隔时，以后每次重连时间问隔都为最大重连时问间隔。默认为-1。
4. initialRedeliveryDelay：初始重发延迟时间，默认1000L。
5. redeliveryDelay：重发延迟时间，当initialRedeliveryDelay=0时生效，默认1000L。
6. useCollisionAvoidance：启用防止冲突功能，默认false。
7. useExponentialBackOff：启用指数倍数递增的方式增加延迟时间，默认false
8. backOffMultiplier：重连时间间隔递增倍数，只有值大于1和启用useExponentialBackOff参数时才生效。默认是5。

可以进行测试，如在有事务的消费者代码中把commit注解掉，生产消息，并让消费者消费，消费前六次由于没有提交事务所以能重复访问到消息，消费到第七次后由于重发配置消费不到消息了。此时查看ActiveMQ控制台的Queues就可以看到一个ActiveMQ.DLQ队列出现，这个就是死信队列。

### &emsp;死信队列

![官网死信队列介绍](https://activemq.apache.org/message-redelivery-and-dlq-handling)。

即Dead Letter Queue，开发人员可以进行人工干预。一般生产环境中在使用MQ的时候设计两个队列，一个是核心业务队列，一个是死信队列。

#### &emsp;&emsp;配置队列格式

在plicyEntry标签的deadLetterStrategy标签中可以设置下面子标签：

+ SharedDeadLetterStrategy：默认，将所有的DeadLetter保存在一个共享的队列中，这是ActiveMQ broker端默认的策略。共享队列默认为ActiveMQ.DLQ，可以通过deadLetterQueue属性来设定。
+ IndividualDeadLetterStrategy：把DeadLetter放入各自的死信通道中，对于Queue而言，死信通道的前缀默认为“ActiveMQ.DLQ.Queue."﹔对于Topic而言。死信通道的前缀默认为“ActiveMQ.DLQ.Topic."，使用queuePrefix、topicPrefix来指定上述前缀。

#### &emsp;&emsp;配置其他功能

有时需要直接删除过期的消息而不需要发送到死队列中，processExpired表示是否将过期消息放入死信队列，默认为true。
默认情况下、Activemq不会把非持久的死消息发送到死信队列中，processNonPersistent”表示是否将“非持久化”消息放入死信队列，默认为false，如果需要则改为true。

&emsp;

## 防止重复

即幂等性。

### &emsp;重复场景

网络延迟传输中，会造成进行MQ重试中，在重试过程中，可能会造成重复消费。

### &emsp;解决方案

+ 如果消息是做数据库的插入操作，给这个消息做一个唯一主键，那么就算出现重复消费的情况，就会导致主键冲突，避免数据库出现脏数据。
+ 使用Token对于数据和用户进行验证，如果重复就不允许访问。
+ 准备一个访问更快的第三服务方来做消费记录。以Redis为例，给消息分配一个全局ID，只要消费过该消息，将\<id,message\>以K-V形式写入Redis。 在消费者开始消费前，先去Redis中查询有没消费记录即可。
