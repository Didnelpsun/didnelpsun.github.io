---
layout: post
title:  "RabbitMQ发布确认"
date:   2022-04-06 20:23:58 +0800
categories: notes mq rabbitmq
tags: MQ RabbitMQ 发布确认
excerpt: "RabbitMQ发布确认"
---

## 概念

之前在[RabbitMQ简单模式]({% post_url /notes/mq/2022-04-01-mq-rabbitmq-mode-1 %})的发布确认模式中也提到过发布确认这个概念，但是这两者之间有很大的不同。

### &emsp;定义

发布确认模式是RabbitMQ的工作模式，表示消息发布后需要确认，从而保存消息，并要求队列一定要持久化。而这里的发布确认指的是对于RabbitMQ这个服务整体。

在生产环境中由于一些不明原因，导致RabbitMQ重启，在RabbitMQ重启期间生产者消息投递必然会失败，导致消息丢失，需要手动处理和恢复。于是，我们开始思考，如何才能进行RabbitMQ的消息可靠投递呢？特别是在这样比较极端的情况，RabbitMQ集群不可用的时候（集群能解决这种问题且对于集群这种问题出现的可能性不大，除非主机全部宕机），无法投递的消息该如何处理呢？

### &emsp;基本流程

![发布确认流程][confirm]

整体的流程还是生产者->RabbitMQ服务器（交换机->队列）->消费者，但是生产者和RabbitMQ服务器之间需要一个缓存存放生产的消息。为什么需要一个缓存？之前的发布确认模式是在生产者中接收确认消息然后删除生产者这边队列的消息，此时把缓存当作原来的队列保存消息，剥离了生产者的负责确认的业务，从而让生产者只关心发送消息，不用管消息确认和持久化。

如果RabbitMQ整体宕机了，则交换机和队列都不存在。如果只有交换机宕机了，则队列也不可能收到消息。如果只有队列收不到消息，则交换机发不出消息。此时消费者都收不到消息，生产者希望如果发不出去则把消息放到缓存中，交换机也希望把发不出去队列的消息放到缓冲中。如果RabbitMQ整体宕机了，则生产者会把消息直接放到缓存中，定时任务对消息进行重新投递发送给交换机；如果交换机存在队列宕机了，则交换机将未成功的消息存到缓存中，（缓存定时发送消息给交换机）如果接收到消息的确认，则交换机将确认返回给缓存，缓存根据确认信息从缓存中删除已经确认的消息。

&emsp;

## 基本环境

首先新建一个confirm的SpringBoot模块，依赖项选择Lombok、Spring Configuration Processor、Spring Web、Spring for RabbitMQ。

### &emsp;连接配置

修改配置文件为YAML文件：

```yaml
# RabbitMQ连接配置
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    username: guest
    password: guest
    # 开启发布确认
    # NONE：禁用发布确认模式，为默认只
    # CORRELATED：发布消息成功到交换机后自动除非回调方法
    # SIMPLE：经测试有两种效果，其一效果和CORRELATED值一样会触发回调方法，
    # 其二在发布消息成功后使用rabbitTemplate调用waitForConfirms或 waitForConfirmsOrDie方法等待broker节点返回发送结果，根据返回结果来判定下一步的逻辑，要注意的点是
    # waitForConfirmsOrDie方法如果返回false则会关闭channel，则接下来无法发送消息到 broker
    # 相当于单个确认，未确认会阻塞等待
    publisher-confirm-type: correlated
```

然后新建config包，重新用Java文件的方式建立配置文件（Java定义的常量更方便引用）：

```java
// PropertyConfig.java
package org.didnelpsun.config;

public class PropertyConfig {
    public static final String CONFIRM_EXCHANGE = "confirm_exchange";
    public static final String CONFIRM_QUEUE = "confirm_queue";
    public static final String CONFIRM_ROUTING_KEY = "confirm_key";

}
```

```java
// ConfirmConfig.java
package org.didnelpsun.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static org.didnelpsun.config.PropertyConfig.*;

@Configuration
// 发布确认配置
public class ConfirmConfig {
    // 交换机
    @Bean
    public DirectExchange confirmExchange(){
        return new DirectExchange(CONFIRM_EXCHANGE);
    }
    // 队列
    @Bean
    public Queue confirmQueue(){
        return QueueBuilder.nonDurable(CONFIRM_QUEUE).build();
    }
    // 绑定队列与交换机
    @Bean
    public Binding confirmBind(@Qualifier("confirmQueue") Queue confirmQueue, @Qualifier("confirmExchange") DirectExchange confirmExchange){
        return BindingBuilder.bind(confirmQueue).to(confirmExchange).with(CONFIRM_ROUTING_KEY);
    }
}
```

### &emsp;生产者

新建controller包，建立生产者：

```java
// Controller.java
package org.didnelpsun.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

import static org.didnelpsun.config.PropertyConfig.*;

@RestController
public class Controller {
    @Resource
    private RabbitTemplate rabbitTemplate;

    // 发送消息
    @GetMapping("/send/{message}")
    public String send(@PathVariable String message) {
        rabbitTemplate.convertAndSend(CONFIRM_EXCHANGE, CONFIRM_ROUTING_KEY, message);
        System.out.println("发送消息成功:" + message);
        return message;
    }
}
```

### &emsp;消费者

新建service包，新建消费者：

```java
// Consumer.java
package org.didnelpsun.service;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import static org.didnelpsun.config.PropertyConfig.CONFIRM_QUEUE;

@Service
public class Consumer {
    @RabbitListener(queues = CONFIRM_QUEUE)
    public void receive(Message message){
        System.out.println("接收消息:" + new String(message.getBody()));
    }
}
```

访问<http://localhost:8080/send/test>一切正常。

&emsp;

## 消息回调

即如果消息无法发出则让消息返回到生产者这边保存到缓存中。生产者通过回调接口感知到消息是否发送成功。

### &emsp;回调接口

需要实现RabbitTemplate.ConfirmCallback，然后再把这个实现重新注入回接口中，从而让RabbitTemplate能调用ConfirmCallback的confirm方法实现：

```java
// CallBack.java
package org.didnelpsun.service;

import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.nio.charset.StandardCharsets;

@Service
public class CallBack implements RabbitTemplate.ConfirmCallback {
    // 注入RabbitTemplate实例
    @Resource
    private RabbitTemplate rabbitTemplate;

    // 实例化后就执行将这个实例注入到rabbitTemplate中
    @PostConstruct
    public void init() {
        rabbitTemplate.setConfirmCallback(this);
    }

    // 确认方法
    // correlationData保存回调消息的ID与相关信息
    // ack交换机是否接收到消息，如果接收到了为true，如果没有为false
    // cause接收失败的原因，如果ack为true则cause为null，如果ack为false，cause为字符串类型
    @Override
    public void confirm(CorrelationData correlationData, boolean ack, String cause) {
        if (correlationData == null) {
            System.out.println("消息回调失败");
            return;
        }
        String id = correlationData.getId();
        if (ack)
            System.out.println("接收到ID为" + id + "的消息:" + (correlationData.getReturned() != null ? new String(correlationData.getReturned().getMessage().getBody(), StandardCharsets.UTF_8) : ""));
        else System.out.println("未接收到ID为" + id + "的消息:" + cause);
    }
}
```

这个方法执行的顺序是初始化CallBack实例，rabbitTemplate先注入，confirm方法成员生成，@Service实例化CallBack并放入池中，构造完成后执行init方法将实例注入rabbitTemplate。

### &emsp;配置回调

此时还是运行有问题的，因为我们会很奇怪，confirm方法中这三个参数是怎么来的？

实际上这并不是RabbitMQ为我们注入的，而是需要我们自己在发送消息时设置的：

```java
// Controller.java
package org.didnelpsun.controller;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.ReturnedMessage;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.didnelpsun.config.PropertyConfig.*;

@RestController
public class Controller {
    @Resource
    private RabbitTemplate rabbitTemplate;

    // 发送消息
    @GetMapping("/send/{message}")
    public String send(@PathVariable String message) {
        // 设置回退消息
        CorrelationData data = new CorrelationData(UUID.randomUUID().toString());
        // ReturnedMessage参数：
        // Message message
        // int replyCode;
        // String replyText
        // String exchange
        // String routingKey
        data.setReturned(new ReturnedMessage(new Message(message.getBytes(StandardCharsets.UTF_8)), 200, "成功", CONFIRM_EXCHANGE, CONFIRM_ROUTING_KEY));
        rabbitTemplate.convertAndSend(CONFIRM_EXCHANGE, CONFIRM_ROUTING_KEY, message, data);
        System.out.println("发送消息成功:" + message);
        return message;
    }
}
```

运行<http://localhost:8080/send/test>，发现消息接收成功：

```txt
发送消息成功:test
接收到ID为d65b4634-c047-4168-aea6-e7da27d6478e的消息:test
接收消息:test
```

发现能捕捉到交换机收到的信息，然后将发送函数send的交换机名称改错为d，尝试发送<http://localhost:8080/send/test>：

```txt

发送消息成功:test
2022-04-07 14:33:43.057 ERROR 51560 --- [ 127.0.0.1:5672] o.s.a.r.c.CachingConnectionFactory       : Shutdown Signal: channel error; protocol method: #method<channel.close>(reply-code=404, reply-text=NOT_FOUND - no exchange 'd' in vhost '/', class-id=60, method-id=40)
未接收到ID为7d0edc53-83d5-46ba-9fc3-b5615db32285的消息:channel error; protocol method: #method<channel.close>(reply-code=404, reply-text=NOT_FOUND - no exchange 'd' in vhost '/', class-id=60, method-id=40)
```

以后可以在回调函数中将这些发送失败的数据保存到缓存中等待重新发送。

如果将发送函数send的队列名称改错为d，尝试发送<http://localhost:8080/send/test>：

```txt
发送消息成功:test
接收到ID为f0789944-b88f-49e5-98fc-a035289f7975的消息:test
```

此时发现好像成功了，但是此时只收到两条消息，正常成功应该是三条消息，应该还有一条接收消息:test，表示此时交换机接收消息成功，但是队列接收消息失败。

&emsp;

## 消息回退

消息回调只是对交换机的发布确认，如果是交换机没问题而队列有问题则消息会丢失。

### &emsp;Mandatory参数

在仅开启了生产者确认机制的情况下，交换机接收到消息后，会直接给消息生产者发送确认消息，如果发现该消息不可路由（即RoutingKey有问题导致无法访问队列），那么消息会被直接丢弃，此时生产者是不知道消息被丢弃这个事件的。那么如何让无法被路由的消息被通知？通过设置mandatory参数可以在当消息传递过程中不可达目的地时将消息返回给生产者。

### &emsp;配置回退

首先在YAML文件中设置spring.rabbitmq.publisher-returns=true支持消息回退。

然后在CallBack中继续实现消息回退接口：

```java
// CallBack.java
package org.didnelpsun.service;

import org.springframework.amqp.core.ReturnedMessage;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.nio.charset.StandardCharsets;

@Service
public class CallBack implements RabbitTemplate.ConfirmCallback, RabbitTemplate.ReturnsCallback {
    // 注入RabbitTemplate实例
    @Resource
    private RabbitTemplate rabbitTemplate;

    // 实例化后就执行将这个实例注入到rabbitTemplate中
    @PostConstruct
    public void init() {
        rabbitTemplate.setConfirmCallback(this);
    }

    // 确认方法
    // correlationData保存回调消息的ID与相关信息
    // ack交换机是否接收到消息，如果接收到了为true，如果没有为false
    // cause接收失败的原因，如果ack为true则cause为null，如果ack为false，cause为字符串类型
    @Override
    public void confirm(CorrelationData correlationData, boolean ack, String cause) {
        if (correlationData == null) {
            System.out.println("消息回调失败");
            return;
        }
        String id = correlationData.getId();
        if (ack)
            System.out.println("接收到ID为" + id + "的消息:" + (correlationData.getReturned() != null ? new String(correlationData.getReturned().getMessage().getBody(), StandardCharsets.UTF_8) : ""));
        else System.out.println("未接收到ID为" + id + "的消息:" + cause);
    }

    // 消息回退，只有消息不可达才回退，所以只处理失败没有处理成功
    @Override
    public void returnedMessage(ReturnedMessage returnedMessage) {
        System.out.printf("消息被回退:[内容:%s,原因:%s,响应码:%s,交换机:%s,路由:$%s]\n", new String(returnedMessage.getMessage().getBody(), StandardCharsets.UTF_8),returnedMessage.getReplyText(),returnedMessage.getReplyCode(),returnedMessage.getExchange(),returnedMessage.getRoutingKey());
    }
}
```

继续将发送函数send的队列名称改错为d，尝试发送<http://localhost:8080/send/test>：

```txt
发送消息成功:test
消息被回退:[内容:test,原因:NO_ROUTE,响应码:312,交换机:confirm_exchange,路由:$d]
接收到ID为ef723b53-3fa2-472f-b7ed-e44cf293b167的消息:test
```

表示交换机接收到消息了，但是队列没收到且被回退。

<span style="color:orange">注意：</span>如果使用x-delayed-message延迟队列插件，则消息成功发送给自定义队列时也会被认为是消息不可达从而调用returnedMessage方法，所以需要通过消息发送的队列名称来判断是否成功。

&emsp;

## 备份交换机

### &emsp;概念

在RabbitMQ中，有一种备份交换机的机制存在，可以很好的应对这个问题。什么是备份交换机呢?备份交换机可以理解为RabbitMQ中交换机的“备胎”，当我们为某一个交换机声明一个对应的备份交换机时，就是为它创建一个备胎，当交换机接收到一条不可路由消息时，将会把这条消息转发到备份交换机中，由备份交换机来进行转发和处理，通常备份交换机的类型为Fanout，这样就能把所有消息都投递到与其绑定的队列中，然后我们在备份交换机下绑定一个队列，这样所有那些原交换机无法被路由的消息，就会都进入这个队列了。当然，我们还可以建立一个报警队列，用独立的消费者来进行监测和报警。

### &emsp;备份流程

![备份交换机][backup]

此时就不用生产者重新发送消息了，直接将消息传输给扇出交换机进行广播。

所以此时只需要编写一个备份交换机、备份队列、报警队列、监控者并绑定之间的对应关系。

### &emsp;修改配置

添加常量：

```java
// PropertyConfig.java
package org.didnelpsun.config;

public class PropertyConfig {
    // 确认
    public static final String CONFIRM_EXCHANGE = "confirm_exchange";
    public static final String CONFIRM_QUEUE = "confirm_queue";
    public static final String CONFIRM_ROUTING_KEY = "confirm_key";
    // 备份
    public static final String BACKUP_EXCHANGE = "backup_exchange";
    public static final String BACKUP_QUEUE = "backup_queue";
    // 监控报警
    public static final String WARN_QUEUE = "warn_queue";
}
```

建立连接：

```java
// ConfirmConfig.java
package org.didnelpsun.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static org.didnelpsun.config.PropertyConfig.*;

@Configuration
// 发布确认配置
public class ConfirmConfig {
    // 交换机
    @Bean
    public DirectExchange confirmExchange() {
        // 转发给备份交换机
        return ExchangeBuilder.directExchange(CONFIRM_EXCHANGE)
                .withArgument("alternate-exchange", BACKUP_EXCHANGE).build();
    }

    // 队列
    @Bean
    public Queue confirmQueue() {
        return QueueBuilder.nonDurable(CONFIRM_QUEUE).build();
    }

    // 绑定队列与交换机
    @Bean
    public Binding confirmBind(@Qualifier("confirmQueue") Queue queue, @Qualifier("confirmExchange") DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(CONFIRM_ROUTING_KEY);
    }

    // 交换机
    @Bean
    public FanoutExchange backupExchange() {
        return new FanoutExchange(BACKUP_EXCHANGE);
    }

    // 队列
    @Bean
    public Queue backupQueue() {
        return QueueBuilder.nonDurable(BACKUP_QUEUE).build();
    }

    // 绑定队列与交换机
    @Bean
    public Binding backupBind(@Qualifier("backupQueue") Queue queue, @Qualifier("backupExchange") FanoutExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange);
    }

    // 队列
    @Bean
    public Queue warnQueue() {
        return QueueBuilder.nonDurable(WARN_QUEUE).build();
    }

    // 绑定队列与交换机
    @Bean
    public Binding warnBind(@Qualifier("warnQueue") Queue queue, @Qualifier("backupExchange") FanoutExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange);
    }
}
```

### &emsp;监控者

对消息进行监控报警：

```java
// Monitor.java
package org.didnelpsun.service;

import org.didnelpsun.config.PropertyConfig;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class Monitor {
    // 监控报警队列
    @RabbitListener(queues = PropertyConfig.WARN_QUEUE)
    public void receiveWarning(Message message) {
        System.out.println("消息路由失败:" + new String(message.getBody(), StandardCharsets.UTF_8));
    }
}
```

删掉原来的confirm_exchange，运行发送<http://localhost:8080/send/test>（此时路由为错误的d）：

```txt
发送消息成功:test
接收到ID为b535bc24-7ff9-43f7-97a3-1493116318db的消息:test
消息路由失败:test
```

mandatory参数与备份交换机可以一起使用的时候，如果两者同时开启，谁优先级高？经过上面结果显示答案是路由失败而不是消息被回退，所以备份交换机优先级高。

[RabbitMQ队列：MQ/rabbitmq_queue](https://github.com/Didnelpsun/MQ/tree/main/rabbitmq_queue)。

[confirm]:data:image/png;base64,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U/3/3HeqhevwVLzwn2p9/S8NR7v2hqq4X/DXVecq2WD/qFD5KH+sWvSn4JavkIr/7zqHbymR6mQgWkqmhr644ZH/6z9vp5X7S8OBq54/kjnOBVv62Mb1J769dcFkSJABBGwbzPwbJgM6EE0AARAAARDIHAJm/pN803dr0Pfp2x+Rcv8HN2WdnCe217pZjnvnCbfUxXzV/4OX/+4drvzD2I3h917+aGbgo+1tlXSXc/KI0Xyn++s0JZCvmf7+pl+b6YxvSeGX6N/3/7ZwMdJ/1ro1lFhBhQ8QAAEQAAEQAAEQAIEHT8DMQv+NX79zSiG8seAJ8sDFXqgv5p65lJO73I6n+Loi8fOEH84MkFbPE3KemVN/NyOH6Ke8P2AuQV9rvD6QkvSvz4gwCIAACIAACIAACIDAgyNgYqE/54UXNu/O3pjjlHR1PL875Nt2gHG/Wlte+E+/eYG9zL5e7pHV/R8c/swtGdJ/5vYtWgYCIAACIAACIJB+BEws9N+aZttyPe91d94ic/uyvv6FVm6T50bvaO2Rr79IBj1fN5OKzgMavPHS/wN6EYoFARAAARAAARAAARBIRsDMQr9kslMGs3Gfm1zz9l16fPvJ+s3lTjb4ev9LbNuJqsrffJsSRNX6E2B8Iudk9TaBzgD4EjxEVJSAJv1rrnmjzxACARAAARAAARAAARB4kARMLPTrsd56raVPur813TfTOSS73X2niUx5PrGx4nEmH+RVMnw40/06u6nl/pB2DG5Nv/7OJe7QF9ciCBRuti0iFZKAAAiAAAiAAAiAAAgsGwEI/QaUH868Jhvg12I/JOUf7UYO3Brgdv2169Zrr72j3SAAAiAAAiAAAiAAAiAAAquOwJpVVyNUCARAAARAAARAAARAAARAYFkJQOhfVpwoDARAAARAAARAAARAAARWHwEI/auvT1AjEAABEAABEAABEAABEFhWAhD6lxUnCgMBEAABEAABEAABEACB1UcAQv/q6xPUCARAAARAAARAAARAAASWlQCE/mXFicJAAARAAARAAARAAARAYPURgNC/+voENQIBEAABEAABEAABEACBZSUAoX9ZcaIwEAABEAABEAABEAABEFh9BCD0r74+QY1AAARAAARAAARAAARAYFkJQOhfVpwoDARAAARAAARAAARAAARWHwEI/auvT1AjEAABEAABEAABEAABEFhWAhD6lxUnCgMBEAABEAABEAABEACB1UcAQv/q6xPUCARAAARAAARAAARAAASWlQCE/mXFicJAAARAAARAAARAAARAYPURgNC/+voENQIBEAABEAABEAABEACBZSUAoX9ZcaIwEAABEAABEAABEAABEFh9BCD0r74+QY1AAARAAARAAARAAARAYFkJQOhfVpwoDARAAARAAARAAARAAARWHwEI/auvT1AjEAABEAABEAABEAABEFhWAhD6lxUnCgMBEAABEAABEAABEACB1UcAQv/q6xPUCARAAARAAARAAARAAASWlcC6+NKKHi2fnYvExyMGBEAABEAABEAABEAABEAgHQk8cu/ePX29b0mXPgZhEJiHgM1me+yxx+ZJgEcgAAIgAAIgAAIgAAIPncD/D6BMH9xpktM6AAAAAElFTkSuQmCC

[backup]:data:image/png;base64,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

[]