---
layout: post
title:  "ActiveMQ整合"
date:   2022-03-30 13:48:59 +0800
categories: notes mq activemq
tags: MQ ActiveMQ 整合 Spring SpringBoot
excerpt: "ActiveMQ整合"
---

## Spring整合

首先新建一个Maven项目，命名为activemq_integration_spring。

### &emsp;Spring配置

#### &emsp;&emsp;POM依赖

然后导入依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.didnelpsun</groupId>
    <artifactId>activemq_integration_spring</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <activemq-version>5.17.0</activemq-version>
        <spring-version>5.3.17</spring-version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.activemq</groupId>
            <artifactId>activemq-all</artifactId>
            <version>${activemq-version}</version>
        </dependency>
        <!--ActiveMQ连接池-->
        <dependency>
            <groupId>org.apache.activemq</groupId>
            <artifactId>activemq-pool</artifactId>
            <version>${activemq-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.xbean</groupId>
            <artifactId>xbean-spring</artifactId>
            <version>4.20</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.13.2.1</version>
        </dependency>
        <!--Spring与ActiveMQ的整合-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jms</artifactId>
            <version>${spring-version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring-version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring-version}</version>
        </dependency>
        <!--ActiveMQ需要-->
        <!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-core -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.17.2</version>
        </dependency>
    </dependencies>

</project>
```

#### &emsp;&emsp;配置实例

我们使用XML和注解混合模式，在resources下添加application.properties：

```properties
brokerUrl = tcp://127.0.0.1:61616
queueName = queue
topicName = topic
```

所以先编写applictionContext.xml配置实例：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="
       http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context.xsd
">
    <!--导入配置文件-->
    <context:property-placeholder location="classpath*:application.properties" />
    <!--开启包扫描-->
    <context:component-scan base-package="org.didnelpsun.entity" />
    <!--配置JMS工厂生产消息队列连接-->
    <!--存放连接的连接池-->
    <bean id="pooledConnectionFactory" class="org.apache.activemq.pool.PooledConnectionFactory" destroy-method="stop">
        <!--生产连接工厂-->
        <property name="connectionFactory">
            <!--生产具体类型的连接工厂-->
            <bean class="org.apache.activemq.ActiveMQConnectionFactory">
                <property name="brokerURL" value="${brokerUrl}"/>
            </bean>
        </property>
    </bean>
    <!--配置队列目的地-->
    <bean id="activeMQQueue" class="org.apache.activemq.command.ActiveMQQueue">
        <constructor-arg name="name" value="${queueName}" />
    </bean>
    <!--配置队列主题-->
    <bean id="activeMQTopic" class="org.apache.activemq.command.ActiveMQTopic">
        <constructor-arg name="name" value="${topicName}" />
    </bean>
    <!--配置JSM工具类，由Spring提供，对JMS操作进行整合-->
    <bean id="jmsTemplate" class="org.springframework.jms.core.JmsTemplate">
        <property name="connectionFactory" ref="pooledConnectionFactory" />
        <property name="defaultDestination" ref="activeMQQueue" />
        <!--消息转换器-->
        <property name="messageConverter">
            <bean class="org.springframework.jms.support.converter.SimpleMessageConverter" />
        </property>
    </bean>
</beans>
```

### &emsp;Spring队列

#### &emsp;&emsp;Spring生产者

然后新建一个org.didnelpsun.entity.Producer：

```java
// QueueProducer
package org.didnelpsun.entity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

@Service
public class Producer {
    private JmsTemplate jmsTemplate;
    @Autowired
    public void setJmsTemplate(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public static void main(String[] args) {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("applicationContext.xml");
        Producer producer = applicationContext.getBean("producer", Producer.class);
        // Lambda表达式直接发送信息
        producer.jmsTemplate.send(session -> session.createTextMessage("send"));
        System.out.println("发送成功");
    }
}
```

启动ActiveMQ，运行后发送消息。

#### &emsp;&emsp;Spring消费者

同样编写消费者：

```java
// QueueConsumer
package org.didnelpsun.entity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

@Service
public class Consumer {

    private JmsTemplate jmsTemplate;
    @Autowired
    public void setJmsTemplate(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public static void main(String[] args) {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("applicationContext.xml");
        Consumer consumer = applicationContext.getBean("consumer", Consumer.class);
        // 接收消息
        String text = (String) consumer.jmsTemplate.receiveAndConvert();
        System.out.println("receive:" + text);
    }
}
```

### &emsp;Spring主题

首先在applicationContext.xml中将defaultDestination换成topic就可以了，不用更改消费者和生产者的代码，因为配置目的地是直接在配置文件中进行的。

### &emsp;监听

消费者不启动，即不需要在生产者启动前先启动一次对主题订阅，直接通过配置进行监听。

实现一个MessageListener：

```java
// MqMessageListener.java
package org.didnelpsun.entity;

import org.springframework.stereotype.Component;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.TextMessage;

@Component
public class MqMessageListener implements MessageListener {
    @Override
    public void onMessage(Message message) {
        if(message instanceof TextMessage textMessage){
            try {
                System.out.println("receive:" + textMessage.getText());
            } catch (JMSException e) {
                e.printStackTrace();
            }
        }
    }
}
```

在applicationContext.xml中添加监听器：

```xml
<!--配置监听器-->
<bean id="defaultMessageListenerContainer" class="org.springframework.jms.listener.DefaultMessageListenerContainer">
    <property name="connectionFactory" ref="pooledConnectionFactory" />
    <property name="destination" ref="activeMQTopic" />
    <property name="messageListener" ref="mqMessageListener" />
</bean>
```

此时只启动生产者，不用启动消费者，监听器会自动监听记录：

```txt
receive:send
发送成功
```

所以监听成功了。

[ActiveMQ使用Spring整合：MQ/activemq_integration_spring](https://github.com/Didnelpsun/MQ/tree/main/activemq_integration_spring)。

&emsp;

## SpringBoot整合

使用Spring Initializr新建项目activemq_integration_springboot，软件包和组为org.didnelpsun。依赖选择Lombok、Spring Configuration Processor、Spring Web、Spring for Apache ActiveMQ 5。看pom.xml中已经引入了spring-boot-starter-activemq。

### &emsp;SpringBoot配置

修改properties变为yaml然后进行配置：

```yaml
server:
  port: 8081

spring:
  activemq:
    broker-url: tcp://127.0.0.1:61616
    user: admin
    password: admin
    # 维持连接运行等待时间
    close-timeout: 15s
    # 等待消息发送响应的时间。设置为0等待永远
    send-timeout: 0
  jms:
    # 如果是false就是队列，如果是true就是主题
    pub-sub-domain: false

# 队列主题名称
queueName: queue
topicName: topic
```

然后新建一个org.didnelpsun.config.ActiveMQConfig，启动类添加@EnableJms：

```java
// ActiveMQConfig.java
package org.didnelpsun.config;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.command.ActiveMQQueue;
import org.apache.activemq.command.ActiveMQTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.core.JmsMessagingTemplate;
import org.springframework.jms.core.JmsTemplate;

import javax.jms.ConnectionFactory;
import javax.jms.Queue;
import javax.jms.Topic;

@Configuration
// 开启JMS
@EnableJms
public class ActiveMQConfig {
    @Value("${queueName}")
    private String queue;
    @Value("${topicName}")
    private String topic;
    @Bean
    public Queue queue(){
        return new ActiveMQQueue(queue);
    }
    @Bean
    public Topic topic(){
        return new ActiveMQTopic(topic);
    }
    @Bean
    ConnectionFactory connectionFactory() {
        return new ActiveMQConnectionFactory();
    }
    @Bean
    JmsTemplate jmsTemplate(ConnectionFactory connectionFactory) {
        JmsTemplate jmsTemplate = new JmsTemplate(connectionFactory);
        jmsTemplate.setPriority(999);
        return jmsTemplate;
    }
    @Bean(value="jmsMessagingTemplate")
    JmsMessagingTemplate jmsMessagingTemplate(JmsTemplate jmsTemplate) {
        return new JmsMessagingTemplate(jmsTemplate);
    }
}
```

### &emsp;SpringBoot队列

#### &emsp;&emsp;触发生产

新建一个org.didnelpsun.service.QueueProducer，可以使用JmsTemplate也可以使用JmsMessagingTemplate：

```java
// QueueProducer.java
package org.didnelpsun.org.didnelpsun.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsMessagingTemplate;
import org.springframework.stereotype.Service;
import javax.jms.Queue;

@Service
public class QueueProducer {
    private JmsMessagingTemplate jmsMessagingTemplate;
    @Autowired
    public void setJmsMessagingTemplate(JmsMessagingTemplate jmsMessagingTemplate) {
        this.jmsMessagingTemplate = jmsMessagingTemplate;
    }
    private Queue queue;
    @Autowired
    public void setQueue(Queue queue) {
        this.queue = queue;
    }
    public void send(){
        jmsMessagingTemplate.convertAndSend(queue, "send");
    }
}
```

然后编写测试类：

```java
package org.didnelpsun;

import org.didnelpsun.config.ActiveMQConfig;
import org.didnelpsun.org.didnelpsun.service.QueueProducer;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import javax.annotation.Resource;

// 测试类全套写法
// 测试哪些类
@SpringBootTest(classes = {ActiveMQConfig.class, QueueProducer.class})
// 进行测试的工具
@RunWith(SpringJUnit4ClassRunner.class)
// 表明WebApplicationContext应该使用Web应用程序根路径的默认值为测试加载资源
@WebAppConfiguration
class ActivemqIntegrationSpringbootApplicationTests {
    @Resource
    private QueueProducer queueProducer;
    @Test
    public void testSend(){
        queueProducer.send();
    }
}
```

运行后会发送一条消息。

如果使用主启动类进行测试可以使用`SpringApplication.run(QueueProducer.class, args)`。

#### &emsp;&emsp;定时生产

这时是运行一次发送一条消息，发送完就停止运行，如果我们想不停的运行生产者，定时就发送一条消息：

```java
// 定时发送
@Scheduled(fixedDelay = 3000)
public void sendTime(){
    send();
    System.out.println("定时发送");
}
```

然后重新调用sendTime，并且需要调用@EnableScheduling来激活定时：

```java
package org.didnelpsun;

import org.didnelpsun.config.ActiveMQConfig;
import org.didnelpsun.org.didnelpsun.service.QueueProducer;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import javax.annotation.Resource;

// 测试类全套写法
// 测试哪些类
@SpringBootTest(classes = {ActiveMQConfig.class, QueueProducer.class})
// 进行测试的工具
@RunWith(SpringJUnit4ClassRunner.class)
// 表明WebApplicationContext应该使用Web应用程序根路径的默认值为测试加载资源
@WebAppConfiguration
@EnableScheduling
class ActivemqIntegrationSpringbootApplicationTests {
    @Resource
    private QueueProducer queueProducer;
    @Test
    public void testSend(){
        queueProducer.send();
    }
    @Test
    public void testSendTime(){
        queueProducer.sendTime();
        System.in.read();
    }
}
```

运行测试。

#### &emsp;&emsp;SpringBoot消费者

编写QueueConsumer：

```java
// QueueConsumer.java
package org.didnelpsun.org.didnelpsun.service;

import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;
import javax.jms.JMSException;
import javax.jms.TextMessage;

@Service
public class QueueConsumer {
    // 添加对目的地的监听
    @JmsListener(destination = "${queueName}")
    public void receive(TextMessage textMessage) throws JMSException {
        System.out.println("receive:" + textMessage.getText());
    }
}
```

此时不需要编写测试类，直接运行默认的没有修改过的主程序类就可以了，会打印所有的消息，并持续运行。因为生产者的两个发送消息的方法都是需要显式调用触发的，所以需要使用测试类运行发送消息，而消费者的接收方法是注册一个监听器，不需要触发，只要运行程序监听器就能被自动注册来监听消息。

### &emsp;SpringBoot主题

由于需要使用主题，所以在配置中将pub-sub-domain设置为true。

#### &emsp;&emsp;发布者

```java
// TopicProducer.java
package org.didnelpsun.org.didnelpsun.service;

import org.springframework.jms.core.JmsMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.jms.Topic;

@Service
public class TopicProducer {
    @Resource
    private JmsMessagingTemplate jmsMessagingTemplate;
    @Resource
    private Topic topic;
    @Scheduled(fixedDelay = 3000)
    public void send(){
        jmsMessagingTemplate.convertAndSend(topic, "send");
        System.out.println("定时发送");
    }
}
```

主题的信息发送也需要触发，所以添加测试方法：

```java
package org.didnelpsun;

import org.didnelpsun.config.ActiveMQConfig;
import org.didnelpsun.org.didnelpsun.service.QueueProducer;
import org.didnelpsun.org.didnelpsun.service.TopicProducer;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import javax.annotation.Resource;
import java.io.IOException;

// 测试类全套写法
// 测试哪些类
@SpringBootTest(classes = {ActiveMQConfig.class, QueueProducer.class, TopicProducer.class})
// 进行测试的工具
@RunWith(SpringJUnit4ClassRunner.class)
// 表明WebApplicationContext应该使用Web应用程序根路径的默认值为测试加载资源
@WebAppConfiguration
@EnableScheduling
class ActivemqIntegrationSpringbootApplicationTests {
    @Resource
    private QueueProducer queueProducer;
    @Resource
    private TopicProducer topicProducer;
    @Test
    public void testSend(){
        queueProducer.send();
    }
    @Test
    public void testSendTime() throws IOException {
        queueProducer.sendTime();
        System.in.read();
    }
    @Test
    public void testTopic() throws IOException {
        topicProducer.send();
        System.in.read();
    }
}
```

#### &emsp;&emsp;订阅者

基本上和队列的消费者一样的代码：

```java
// TopicConsumer.java
package org.didnelpsun.org.didnelpsun.service;

import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;
import javax.jms.JMSException;
import javax.jms.TextMessage;

@Service
public class TopicConsumer {
    // 添加对目的地的监听
    @JmsListener(destination = "${topicName}")
    public void receive(TextMessage textMessage) throws JMSException {
        System.out.println("receive:" + textMessage.getText());
    }
}
```

然后运行主程序文件启动消费者，然后再运行测试文件主题生产者发送消息。

[ActiveMQ使用SpringBoot整合：MQ/activemq_integration_springboot](https://github.com/Didnelpsun/MQ/tree/main/activemq_integration_springboot)。
