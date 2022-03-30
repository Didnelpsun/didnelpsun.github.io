---
layout: post
title:  "ActiveMQ安装使用"
date:   2022-03-28 17:13:13 +0800
categories: notes mq activemq
tags: MQ ActiveMQ
excerpt: "ActiveMQ安装使用"
---

首先访问[ActiveMQ官网](https://activemq.apache.org/)，ActiveMQ为Java编写的消息队列服务器。

## 安装配置

一共有两个版本，一个是[经典版本](https://activemq.apache.org/components/classic/download/)一个是[Artemis版本](https://activemq.apache.org/components/artemis/download/)。

### &emsp;Windows安装配置

解压zip压缩包到安装目录。然后在/bin/win64下启动activemq.bat就可以了，ActiveMQ会启动在<http://127.0.0.1:8161>启动。初次登录需要账户密码，初始用户名和密码都为admin。

如果关闭控制台就会关闭。

如果想通过命令行直接启动可以将这个路径配置到环境变量path中。

如果想修改密码可以到conf/jetty-realm.properties中配置。

如果想配置运行端口可以到conf/jetty.xml中配置。

ActiveMQ的后端接口是61616。

### &emsp;Linux安装配置

使用`mv`将安装包移动到指定目录，然后使用`tar -zxvf 安装包名`对安装包解压。

然后`cd ./bin`，然后使用`./activemq start`启动。

使用`ps -ef|grep activemq|grep -v grep`查看是否启动。

使用`./activemq restart`进行重启，`./activemq stop`进行关闭。

使用`./activemq start > 地址`可以将启动时的日志保存到这个地址中。

### &emsp;配置文件

安装目录的/conf/activemq.xml文件就是总的配置文件，我们可以通过`activemq start xbean:file:\配置文件地址`来指定启动的配置文件，从而能启动多个ActiveMQ实例，如`activemq start xbean:file:\D:\ActiveMQ\apache-activemq-5.17.0\conf\activemq.xml`。

&emsp;

## Java实现队列

队列是点对点式的。

### &emsp;配置

首先使用IDEA新建Maven工程，命名为activemq_java，然后引入依赖：

```xml
<!-- https://mvnrepository.com/artifact/org.apache.activemq/activemq-all -->
<dependency>
    <groupId>org.apache.activemq</groupId>
    <artifactId>activemq-all</artifactId>
    <version>5.17.0</version>
</dependency>
<!-- https://mvnrepository.com/artifact/org.apache.xbean/xbean-spring -->
<dependency>
    <groupId>org.apache.xbean</groupId>
    <artifactId>xbean-spring</artifactId>
    <version>4.20</version>
</dependency>
<!--ActiveMQ需要-->
<!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-core -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.17.2</version>
</dependency>
```

### &emsp;编写队列生产者

新建一个生产者org.didnelpsun.entity.Producer：

```java
// Producer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;
import javax.jms.*;

public class Producer {
    private String activemq_url;
    private String queue_name;
    public Producer(String activemq_url, String queue_name){
        this.activemq_url = activemq_url;
        this.queue_name = queue_name;
    }
    public boolean send() {
        try{
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Queue queue = session.createQueue(queue_name);
            // 5.创建消息的生产者
            MessageProducer messageProducer = session.createProducer(queue);
            // 6.使用MessageProducer生产消息发送到MQ的队列中
            for (int i = 1; i <= 3; i++) {
                // 7.创建消息，可以视为一个字符串
                TextMessage textMessage = session.createTextMessage("sendMessage:"+i);
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

然后新建一个org.didnelpsun.Main：

```java
// Main.java
package org.didnelpsun;

import org.didnelpsun.entity.Producer;

public class Main {
    // 设置ActiveMQ的连接地址，后端运行在61616
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    // 设置目的地队列名称
    public static final String queue_name = "queue_test";

    public static void main(String[] args) {
        if (new Producer(activemq_url, queue_name).send())
            System.out.println("消息发送完成");
        else
            System.out.println("消息发送失败");
    }
}
```

然后启动ActiveMQ并运行。看到消息发送完成，访问<http://127.0.0.1:8161/admin>查看传输的队列有哪些<http://127.0.0.1:8161/admin/browse.jsp?JMSDestination=queue_test>，Number Of Pending Messages表示等待处理的消息数为3，Number Of Consumers表示消费者数量为0，表示还没有消费者使用消息，Messages Enqueued为3，表示一共进入了三条消息，Messages Dequeued表示消息出列为0，表示还没有消费者处理消息。

### &emsp;编写队列消费者

新建一个消费者org.didnelpsun.entity.Consumer：

```java
// Consumer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;
import javax.jms.*;

public class Consumer {
    private String activemq_url;
    private String queue_name;

    public Consumer(String activemq_url, String queue_name) {
        this.activemq_url = activemq_url;
        this.queue_name = queue_name;
    }

    public boolean receive() {
        try {
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Queue queue = session.createQueue(queue_name);
            // 5.创建消息的消费者
            MessageConsumer messageConsumer = session.createConsumer(queue);
            while (true) {
                // 消费者存在时间为3秒，并获取消费者回复消息
                TextMessage textMessage = (TextMessage) messageConsumer.receive(3000);
                // 如果消费者收到消息并回复了，就打印
                if (textMessage != null)
                    System.out.println("receiveMessage:" + textMessage.getText());
                else
                    break;
            }
            // 6.关闭资源
            messageConsumer.close();
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

修改Main：

```java
// Main.java
package org.didnelpsun;

import org.didnelpsun.entity.Consumer;
import org.didnelpsun.entity.Producer;

public class Main {
    // 设置ActiveMQ的连接地址，后端运行在61616
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    // 设置目的地队列名称
    public static final String queue_name = "queue_test";

    public static void main(String[] args) {
        if (new Producer(activemq_url, queue_name).send())
            System.out.println("消息发送完成");
        else
            System.out.println("消息发送失败");
        if (new Consumer(activemq_url,queue_name).receive())
            System.out.println("消息接收完成");
        else
            System.out.println("消息接收失败");
    }
}
```

然后在ActiveMQ控制台将队列中的信息全部删除，然后重新运行：

```text
消息发送完成
receiveMessage:sendMessage:1
receiveMessage:sendMessage:2
receiveMessage:sendMessage:3
消息接收完成
```

ActiveMQ控制台中显示：0，1，3，3。如果消费者进程结束了那么1就会变成0。

### &emsp;消费者监听

之前使用receive方法来接收消息，如果没有消息会一直阻塞在这个地方。这里可以使用监听器来接收消息，如果有消息就处理，没有消息就做别的事情。

首先对消费者代码进行优化，将Consumer作为父类，ReceiveConsumer作为子类：

```java
// Consumer.java
package org.didnelpsun.entity;

public class Consumer {
    protected String activemq_url;
    protected String queue_name;

    public Consumer(String activemq_url, String queue_name) {
        this.activemq_url = activemq_url;
        this.queue_name = queue_name;
    }

    public boolean receive() {
        return true;
    }
}
```

```java
// ReceiveConsumer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;

public class ReceiveConsumer extends Consumer {
    public ReceiveConsumer(String activemq_url, String queue_name) {
        super(activemq_url, queue_name);
    }
    @Override
    public boolean receive() {
        try {
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Queue queue = session.createQueue(queue_name);
            // 5.创建消息的消费者
            MessageConsumer messageConsumer = session.createConsumer(queue);
            while (true) {
                // 消费者存在时间为3秒，并获取消费者回复消息
                TextMessage textMessage = (TextMessage) messageConsumer.receive(3000);
                // 如果消费者收到消息并回复了，就打印
                if (textMessage != null)
                    System.out.println("receiveMessage:" + textMessage.getText());
                else
                    break;
            }
            // 6.关闭资源
            messageConsumer.close();
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

修改主函数：

```java
// Main.java
package org.didnelpsun;

import org.didnelpsun.entity.Consumer;
import org.didnelpsun.entity.Producer;
import org.didnelpsun.entity.ReceiveConsumer;

public class Main {
    // 设置ActiveMQ的连接地址，后端运行在61616
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    // 设置目的地队列名称
    public static final String queue_name = "queue_test";

    public static void main(String[] args) {
        if (new Producer(activemq_url, queue_name).send())
            System.out.println("消息发送完成");
        else
            System.out.println("消息发送失败");
        if (new ReceiveConsumer(activemq_url,queue_name).receive())
            System.out.println("消息接收完成");
        else
            System.out.println("消息接收失败");
    }
}
```

然后新建一个监听器的消费者：

```java
// ListenerConsumer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;
import javax.jms.*;
import java.io.IOException;

public class ListenerConsumer extends Consumer {
    public ListenerConsumer(String activemq_url, String queue_name) {
        super(activemq_url, queue_name);
    }
    @Override
    public boolean receive() {
        try {
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Queue queue = session.createQueue(queue_name);
            // 5.创建消息的消费者
            MessageConsumer messageConsumer = session.createConsumer(queue);
            // 6.添加监听器
            messageConsumer.setMessageListener(new MessageListener() {
                // 对Message进行监听
                @Override
                public void onMessage(Message message) {
                    if(message instanceof TextMessage textMessage){
                        try {
                            System.out.println("receiveMessage:" + textMessage.getText());
                        } catch (JMSException e) {
                            e.printStackTrace();
                        }
                    }
                }
            });
            // 保证消费者进程存在
            System.in.read();
            messageConsumer.close();
            session.close();
            connection.close();
            return true;
        } catch (JMSException | IOException e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

然后修改主函数的ReceiveConsumer为ListenerConsumer，运行，消费者程序打印三条消息后一直运行，控制台随便输入什么然后回车就能关闭消费者程序。

如果我们在程序中不添加`System.in.read();`，那么可能什么都打印不出来，因为read会让线程一直等待，守护消费者线程异步执行，避免消费者线程还没有等待消费完成就随着主线程一起结束。也可以使用sleep来达成同样的效果。

### &emsp;消费者并发

当有多个消费者时会发生什么情况？

+ 如果是先启动生产者进程，创建了消息，然后一个个启动消费者进程，那么先启动的消费者进程会先去消费消息，从而让后面的消费者进程没有消息可以消费。
+ 如果是先一个个启动消费者进程，然后启动生产者进程，创建了消息，那么ActiveMQ使用时间片分配轮询抢夺资源，看起来是一半一半地消费。

&emsp;

## Java实现主题

主题是发布订阅模式。

### &emsp;概念

+ 生产者将消息发布到topic中，每个消息可以有多个消费者，属于1:N的关系
+ 生产者和消费者之间有时间上的相关性。订阅某一个主题的消费者只能消费自它订阅之后发布的消息。
+ 生产者生产时，topic不保存消息它是无状态的不落地，假如无人订阅就去生产，那就是一条废消息，所以，一般先启动消费者再启动生产者。

### &emsp;编写主题生产者

首先对原来的Producer进行泛化：

```java
// Producer.java
package org.didnelpsun.entity;

public class Producer {
    protected String activemq_url;
    protected String destination_name;
    public Producer(String activemq_url, String destination_name){
        this.activemq_url = activemq_url;
        this.destination_name = destination_name;
    }
    public boolean send() {
        return true;
    }
}
```

然后是队列消费者：

```java
// QueueProducer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;
import javax.jms.*;

public class QueueProducer extends Producer {
    public QueueProducer(String activemq_url, String queue_name) {
        super(activemq_url, queue_name);
    }

    public boolean send() {
        try{
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
                TextMessage textMessage = session.createTextMessage("sendQueueMessage:" + i);
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

然后编写主题消费者：

```java
// TopicProducer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;
import javax.jms.*;

public class TopicProducer extends Producer {
    public TopicProducer(String activemq_url, String topic_name) {
        super(activemq_url, topic_name);
    }

    public boolean send() {
        try {
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            Topic topic = session.createTopic(destination_name);
            MessageProducer messageProducer = session.createProducer(topic);
            for (int i = 1; i <= 3; i++) {
                TextMessage textMessage = session.createTextMessage("sendTopicMessage:" + i);
                messageProducer.send(textMessage);
            }
            messageProducer.close();
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

### &emsp;编写主题消费者

首先修改父类：

```java
// Consumer.java
package org.didnelpsun.entity;

public class Consumer {
    protected String activemq_url;
    protected String destination_name;

    public Consumer(String activemq_url, String destination_name) {
        this.activemq_url = activemq_url;
        this.destination_name = destination_name;
    }

    public boolean receive() {
        return true;
    }
}
```

记得将两个队列消费者的打印内容receiveMessage改为receiveQueueMessage，将queue_name改为destination_name，然后编写主题消费者：

```java
// TopicConsumer.java
package org.didnelpsun.entity;

import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;
import java.io.IOException;

public class TopicConsumer extends Consumer {
    public TopicConsumer(String activemq_url, String topic_name) {
        super(activemq_url, topic_name);
    }
    @Override
    public boolean receive() {
        try {
            // 1.创建连接工厂，按照URL采用默认用户名和密码
            ActiveMQConnectionFactory activeMQConnectionFactory = new ActiveMQConnectionFactory(activemq_url);
            // 2.连接工厂获得连接Connection，并启动访问
            Connection connection = activeMQConnectionFactory.createConnection();
            connection.start();
            // 3.创建会话，有两个参数，第一个是事务，第二个是签收
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // 4.创建目的地，是队列还是主题
            Topic topic = session.createTopic(destination_name);
            // 5.创建消息的消费者
            MessageConsumer messageConsumer = session.createConsumer(topic);
            // 6.添加监听器
            messageConsumer.setMessageListener((message) -> {
                if (message instanceof TextMessage textMessage) {
                    try {
                        System.out.println("receiveTopicMessage:" + textMessage.getText());
                    } catch (JMSException e) {
                        e.printStackTrace();
                    }
                }
            });
            // 保证消费者进程存在
            System.in.read();
            messageConsumer.close();
            session.close();
            connection.close();
            return true;
        } catch (JMSException | IOException e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

### &emsp;测试

然后在test文件中新建测试：

```java
// ConsumerTest.java
package org.didnelpsun;

import org.didnelpsun.entity.TopicConsumer;

public class ConsumerTest {
    // 设置ActiveMQ的连接地址，后端运行在61616
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    // 设置目的地主题名称
    public static final String topic_name = "topic_test";

    public static void main(String[] args) {
        if (new TopicConsumer(activemq_url, topic_name).receive())
            System.out.println("消息接收完成");
        else
            System.out.println("消息接收失败");
    }
}
```

复制两份一共三份消费者。

```java
// ProducerTest.java
package org.didnelpsun;

import org.didnelpsun.entity.TopicProducer;

public class ProducerTest {
    // 设置ActiveMQ的连接地址，后端运行在61616
    public static final String activemq_url = "tcp://127.0.0.1:61616";
    // 设置目的地主题名称
    public static final String topic_name = "topic_test";

    public static void main(String[] args) {
        if (new TopicProducer(activemq_url, topic_name).send())
            System.out.println("消息发送完成");
        else
            System.out.println("消息发送失败");
    }
}
```

先启动消费者，然后启动生产者，到<http://127.0.0.1:8161/admin/topics.jsp>查看，发现是3，3，9，代表每个消费者都会收到9条消息。

如果先启动生产者，后启动消费者，则消费者收不到消息。

### &emsp;主题队列对比

比较项目|Topic主题|Queue队列
:------:|:-------:|:-------:
工作模式|“订阅-发布"模式，如果当前没有订阅者，消息将会被丢弃。如果有多个订阅者，那么这些订阅者都会收到消息|“负载均衡""模式，如果当前没有消费者，消息也不会丢弃；如果有多个消费者，那么一条消息也只会发送给其中一个消费者，并且要求消费者ACK信息。
有无状态|无|Queue数据默认会在MQ服务器上以文件形式保存，比如Active MQ一般保存在$AMQ_HOME\data\kr-store\data下面。也可以配置成DB存储。
传传递完整性|如果没有订阅者，消息会被丢弃|消息不会丢弃
处理效率|由于消息要按照订阅者的数量进行复制，所以处理性能会随着订阅者的增加而明显降低，并且还要结合不同消息协议自身的性能差异|由于一条消息只发送给一个消费者，所以就算消费者再多，性能也不会有明显降低。不同消息协议的具体性能也是有差异的

[ActiveMQ使用Java实现：MQ/activemq_java](https://github.com/Didnelpsun/MQ/tree/main/activemq_java)。
