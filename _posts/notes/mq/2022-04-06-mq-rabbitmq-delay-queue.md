---
layout: post
title:  "RabbitMQ延迟队列"
date:   2022-04-06 13:59:47 +0800
categories: notes mq rabbitmq
tags: MQ RabbitMQ 队列 延迟
excerpt: "RabbitMQ延迟队列"
---

## 概念

### &emsp;定义

延迟队列就是存放需要在指定时间被处理的元素队列。

### &emsp;应用场景

对于延迟时间发送的实现，可以使用定时器轮询机制不断查看数据进行延时发送，比如每天零点查看有哪些数据需要定时，但是对于大批量数据而言这种轮询机制效率十分低下，所以就需要延迟队列。

&emsp;

## 延迟队列

此时延迟队列即死信队列的一种，是属于消息TTL过期的情况，通过对队列的TTL设置让消息过期后发到死信队列中，实现延时队列的效果。在死信队列的TTL过期的情况下，有一个消费者和一个处理者共同消费消息，如果消费者超过TTL不消费消息则消息转发到处理者。对于处理者而言，这个消息就相当于延迟了一个TTL时间。

### &emsp;延迟队列执行流程

首先只需要一个生产者Producer和一个消费者Consumer。生产者Producer发送消息给普通发送的路由交换机normal_exchange。普通交换机使用delay_3的RoutingKey来绑定队列queue_3，表示这个队列的消息将延时3秒发送；使用delay_10的RoutingKey来绑定队列queue_10，表示这个队列的消息将延时10秒发送。queue_3和queue_10都通过send的RoutingKey绑定到延迟发送的路由交换机delay_exchange（死信交换机），延迟发送交换机再把消息延时发送给队列queue（实际上是一个死信队列）中，queue绑定发送消息给Consumer。

![延迟队列][queue]

### &emsp;延迟队列连接配置

继续使用[RabbitMQ队列：MQ/rabbitmq_queue](https://github.com/Didnelpsun/MQ/tree/main/rabbitmq_queue)。新建一个delay_queue模块，注意这里我们不再使用Maven，而是整合SpringBoot，使用Spring Initializr，依赖项选择Lombok、Spring Configuration Processor、Spring Web、Spring for RabbitMQ。

修改配置文件为YAML文件：

```yaml
# RabbitMQ连接配置
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    username: guest
    password: guest

# 项目配置参数
property:
  # 交换机名称
  # 普通交换机
  NORMAL_EXCHANGE: normal_exchange
  # 死信交换机
  DELAY_EXCHANGE: delay_exchange
  # 队列名称
  # 普通队列
  QUEUE3: queue_3
  QUEUE10: queue_10
  # 死信队列
  QUEUE: queue
  # RoutingKey
  DELAY3: delay_3
  DELAY10: delay_10
  SEND: send
```

新建一个config包，里面新建一个PropertyConfig注入参数：

```java
// PropertyConfig.java
package org.didnelpsun.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "property")
public class PropertyConfig {
    private String normalExchange;
    private String delayExchange;
    private String queue3;
    private String queue10;
    private String queue;
    private String delay3;
    private String delay10;
    private String send;
    private int ttl3;
    private int ttl10;

    public void setNormalExchange(String normalExchange) {
        this.normalExchange = normalExchange;
    }

    public void setDelayExchange(String delayExchange) {
        this.delayExchange = delayExchange;
    }

    public void setQueue3(String queue3) {
        this.queue3 = queue3;
    }

    public void setQueue10(String queue10) {
        this.queue10 = queue10;
    }

    public void setQueue(String queue) {
        this.queue = queue;
    }

    public void setDelay3(String delay3) {
        this.delay3 = delay3;
    }

    public void setDelay10(String delay10) {
        this.delay10 = delay10;
    }

    public void setSend(String send) {
        this.send = send;
    }

    public void setTtl3(int ttl3) {
        this.ttl3 = ttl3;
    }

    public void setTtl10(int ttl10) {
        this.ttl10 = ttl10;
    }

    public String getNormalExchange() {
        return normalExchange;
    }

    public String getDelayExchange() {
        return delayExchange;
    }

    public String getQueue3() {
        return queue3;
    }

    public String getQueue10() {
        return queue10;
    }

    public String getQueue() {
        return queue;
    }

    public String getDelay3() {
        return delay3;
    }

    public String getDelay10() {
        return delay10;
    }

    public String getSend() {
        return send;
    }

    public int getTtl3() {
        return ttl3;
    }

    public int getTtl10() {
        return ttl10;
    }
}
```

加上MqConfig配置连接：

```java
// MqConfig.java
package org.didnelpsun.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class MqConfig {

    @Resource
    private PropertyConfig config;

    public void setConfig(PropertyConfig config) {
        this.config = config;
    }

    // 声明普通交换机
    @Bean
    public DirectExchange normalExchange() {
        return new DirectExchange(config.getNormalExchange());
    }

    // 声明死信交换机
    @Bean
    public DirectExchange delayExchange() {
        return new DirectExchange(config.getDelayExchange());
    }

    //  声明队列
    // 普通队列
    public Queue normalQueue(int ttl, String queueName) {
        // 设置参数
        Map<String, Object> arguments = new HashMap<>();
        // 绑定普通队列和死信交换机
        // 设置死信交换机
        arguments.put("x-dead-letter-exchange", config.getDelayExchange());
        // 设置死信RoutingKey
        arguments.put("x-dead-letter-routing-key", config.getSend());
        // 设置TTL
        arguments.put("x-message-ttl", ttl);
        // nonDurable为非持久化，传入队列名称
        return QueueBuilder.nonDurable(queueName).withArguments(arguments).build();
    }

    @Bean
    public Queue queue3() {
        return normalQueue(config.getTtl3(), config.getQueue3());
    }

    @Bean
    public Queue queue10() {
        return normalQueue(config.getTtl10(), config.getQueue10());
    }

    // 死信队列
    @Bean
    public Queue queue() {
        return QueueBuilder.durable(config.getQueue()).build();
    }

    // 绑定队列和交换机
    // 普通队列和普通交换机
    public Binding bind(Queue queue, DirectExchange exchange, String key) {
        return BindingBuilder.bind(queue).to(exchange).with(key);
    }

    @Bean
    public Binding delay3(@Qualifier("queue3") Queue queue, @Qualifier("normalExchange") DirectExchange exchange) {
        return bind(queue, exchange, config.getDelay3());
    }

    @Bean
    public Binding delay10(@Qualifier("queue10") Queue queue, @Qualifier("normalExchange") DirectExchange exchange) {
        return bind(queue, exchange, config.getDelay10());

    }

    // 死信交换机与死信队列
    @Bean
    public Binding send(@Qualifier("queue") Queue queue, @Qualifier("delayExchange") DirectExchange exchange) {
        return bind(queue, exchange, config.getSend());
    }
}
```

### &emsp;延迟队列生产者

新建一个controller包，通过URL发送消息：

```java
// Controller.java
package org.didnelpsun.controller;

import org.didnelpsun.config.PropertyConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Date;

@RestController
public class Controller {
    // 注入参数
    @Resource
    private PropertyConfig config;

    public void setConfig(PropertyConfig config) {
        this.config = config;
    }

    // RabbitMQ模板
    @Resource
    private RabbitTemplate rabbitTemplate;

    @GetMapping("/send/{msg}")
    public String send(@PathVariable String msg) {
        rabbitTemplate.convertAndSend(config.getNormalExchange(), config.getDelay3(), new Date() + "延迟三秒消息：" + msg);
        rabbitTemplate.convertAndSend(config.getNormalExchange(), config.getDelay10(), new Date() + "延迟十秒消息：" + msg);
        return "延迟发送成功";
    }
}
```

### &emsp;延迟队列消费者

需要使用监听器监听队列消息，所以新建一个service包：

```java
// Consumer.java
package org.didnelpsun.service;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class Consumer {
    // 使用监听器接收消息
    @RabbitListener(queues = "queue")
    public void receive(Message message, Channel channel) {
        System.out.println(new Date() + ":" + new String(message.getBody(), StandardCharsets.UTF_8));
    }
}
```

运行<http://localhost:8080/send/test>，就可以看到延迟发送了两条消息：

```txt
Wed Apr 06 13:01:54 CST 2022:Wed Apr 06 13:01:51 CST 2022延迟三秒消息：test
Wed Apr 06 13:02:01 CST 2022:Wed Apr 06 13:01:51 CST 2022延迟十秒消息：test
```

&emsp;

## 动态延迟时间

此时都是固定延时时间的，队列的TTL都是固定的，而我们如何实现自己灵活设置延时时间呢？将连接MqConfig中的队列不固定设置TTL，在生产者方对队列设置TTL。

### &emsp;动态配置

首先添加两个配置参数：

```yaml
# RabbitMQ连接配置
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    username: guest
    password: guest

# 项目配置参数
property:
  # 交换机名称
  # 普通交换机
  normal_exchange: normal_exchange
  # 死信交换机
  delay_exchange: delay_exchange
  # 队列名称
  # 普通队列
  queue3: queue_3
  queue10: queue_10
  # 无TTL队列
  queueFree: queue_free
  # 死信队列
  queue: queue
  # RoutingKey
  delay3: delay_3
  delay10: delay_10
  delay: delay
  send: send
  # TLL
  ttl3: 3000
  ttl10: 10000
```

添加PropertyConfig的两个成员：

```java
// PropertyConfig.java
package org.didnelpsun.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "property")
public class PropertyConfig {
    private String normalExchange;
    private String delayExchange;
    private String queue3;
    private String queue10;
    private String queueFree;
    private String queue;
    private String delay3;
    private String delay10;
    private String delay;
    private String send;
    private int ttl3;
    private int ttl10;

    public String getNormalExchange() {
        return normalExchange;
    }

    public void setNormalExchange(String normalExchange) {
        this.normalExchange = normalExchange;
    }

    public String getDelayExchange() {
        return delayExchange;
    }

    public void setDelayExchange(String delayExchange) {
        this.delayExchange = delayExchange;
    }

    public String getQueue3() {
        return queue3;
    }

    public void setQueue3(String queue3) {
        this.queue3 = queue3;
    }

    public String getQueue10() {
        return queue10;
    }

    public void setQueue10(String queue10) {
        this.queue10 = queue10;
    }

    public String getQueueFree() {
        return queueFree;
    }

    public void setQueueFree(String queueFree) {
        this.queueFree = queueFree;
    }

    public String getQueue() {
        return queue;
    }

    public void setQueue(String queue) {
        this.queue = queue;
    }

    public String getDelay3() {
        return delay3;
    }

    public void setDelay3(String delay3) {
        this.delay3 = delay3;
    }

    public String getDelay10() {
        return delay10;
    }

    public void setDelay10(String delay10) {
        this.delay10 = delay10;
    }

    public String getDelay() {
        return delay;
    }

    public void setDelay(String delay) {
        this.delay = delay;
    }

    public String getSend() {
        return send;
    }

    public void setSend(String send) {
        this.send = send;
    }

    public int getTtl3() {
        return ttl3;
    }

    public void setTtl3(int ttl3) {
        this.ttl3 = ttl3;
    }

    public int getTtl10() {
        return ttl10;
    }

    public void setTtl10(int ttl10) {
        this.ttl10 = ttl10;
    }
}
```

然后MqConfig新建一个队列并绑定连接：

```java
// MqConfig.java
package org.didnelpsun.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class MqConfig {

    @Resource
    private PropertyConfig config;

    public void setConfig(PropertyConfig config) {
        this.config = config;
    }

    // 声明普通交换机
    @Bean
    public DirectExchange normalExchange() {
        return new DirectExchange(config.getNormalExchange());
    }

    // 声明死信交换机
    @Bean
    public DirectExchange delayExchange() {
        return new DirectExchange(config.getDelayExchange());
    }

    //  声明队列
    // 普通队列
    public Queue normalQueue(int ttl, String queueName) {
        // 设置参数
        Map<String, Object> arguments = new HashMap<>();
        // 绑定普通队列和死信交换机
        // 设置死信交换机
        arguments.put("x-dead-letter-exchange", config.getDelayExchange());
        // 设置死信RoutingKey
        arguments.put("x-dead-letter-routing-key", config.getSend());
        // 设置TTL
        // 如果大于0就绑定TTL
        if (ttl > 0)
            arguments.put("x-message-ttl", ttl);
        // nonDurable为非持久化，传入队列名称
        return QueueBuilder.nonDurable(queueName).withArguments(arguments).build();
    }

    @Bean
    public Queue queue3() {
        return normalQueue(config.getTtl3(), config.getQueue3());
    }

    @Bean
    public Queue queue10() {
        return normalQueue(config.getTtl10(), config.getQueue10());
    }

    // 非固定TTL队列
    @Bean
    public Queue queueFree() {
        return normalQueue(0, config.getQueueFree());
    }

    // 死信队列
    @Bean
    public Queue queue() {
        return QueueBuilder.durable(config.getQueue()).build();
    }

    // 绑定队列和交换机
    // 普通队列和普通交换机
    public Binding bind(Queue queue, DirectExchange exchange, String key) {
        return BindingBuilder.bind(queue).to(exchange).with(key);
    }

    @Bean
    public Binding delay3(@Qualifier("queue3") Queue queue, @Qualifier("normalExchange") DirectExchange exchange) {
        return bind(queue, exchange, config.getDelay3());
    }

    @Bean
    public Binding delay10(@Qualifier("queue10") Queue queue, @Qualifier("normalExchange") DirectExchange exchange) {
        return bind(queue, exchange, config.getDelay10());

    }

    @Bean
    public Binding delay(@Qualifier("queueFree") Queue queue, @Qualifier("normalExchange") DirectExchange exchange) {
        return bind(queue, exchange, config.getDelay());

    }

    // 死信交换机与死信队列
    @Bean
    public Binding send(@Qualifier("queue") Queue queue, @Qualifier("delayExchange") DirectExchange exchange) {
        return bind(queue, exchange, config.getSend());
    }
}
```

### &emsp;动态延迟队列生产者

控制器添加一个新方法：

```java
// Controller.java
package org.didnelpsun.controller;

import org.didnelpsun.config.PropertyConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Date;

@RestController
public class Controller {
    // 注入参数
    @Resource
    private PropertyConfig config;

    public void setConfig(PropertyConfig config) {
        this.config = config;
    }

    // RabbitMQ模板
    @Resource
    private RabbitTemplate rabbitTemplate;

    @GetMapping("/send/{msg}")
    public String send(@PathVariable String msg) {
        rabbitTemplate.convertAndSend(config.getNormalExchange(), config.getDelay3(), new Date() + "延迟三秒消息：" + msg);
        rabbitTemplate.convertAndSend(config.getNormalExchange(), config.getDelay10(), new Date() + "延迟十秒消息：" + msg);
        return "延迟发送成功";
    }

    @GetMapping("/send/{ttl}/{msg}")
    public String send(@PathVariable String ttl, @PathVariable String msg) {
        // 需要传入一个后置处理器对消息处理
        rabbitTemplate.convertAndSend(config.getNormalExchange(), config.getDelay(), new Date() + "延迟" + (Float.parseFloat(ttl) / 1000) + "秒消息：" + msg, message -> {
            // 设置存活时间
            message.getMessageProperties().setExpiration(ttl);
            return message;
        });
        return "延迟发送成功";
    }
}
```

在考虑使用RabbitMQ来实现延迟任务队列的时候，需要确保业务上每个任务的延迟时间是一致的，所以遇到不同的任务类型需要不同的延时的话，需要为每一种不同延迟时间的消息建立单独的消息队列。所以具体是动态TTL还是固定TTL看需要的业务。

消费者不用变。访问<http://localhost:8080/send/4000/test>：Wed Apr 06 16:04:42 CST 2022:Wed Apr 06 16:04:38 CST 2022延迟4.0秒消息：test。

如果连续访问<http://localhost:8080/send/10000/test10>，<http://localhost:8080/send/4000/test4>：

```txt
Wed Apr 06 16:10:16 CST 2022:Wed Apr 06 16:10:06 CST 2022延迟10.0秒消息：test10
Wed Apr 06 16:10:16 CST 2022:Wed Apr 06 16:10:09 CST 2022延迟4.0秒消息：test4
```

此时发现有问题，test10是6秒发送16秒应该接收，test4是9秒发送13秒接收，但是实际上test10和test4都是16秒接收的，而且test10在test4前面。

这是因为队列的先进先出特性识有当过期的消息到了队头，才会被真的丢弃或者进入死信队列。所以大量的不同延时的消息到队列时可能出现挤压导致到时的消息不能及时进入死信队列。test4在13秒就应该过期了，但是此时队列中test10还在对头阻塞了所以test4无法出队，只能跟着test10一起出队。

## 延迟交换机

由于队列本身的特性，所以同一个队列中第一个入队的元素的TTL会影响后面过期消息的出队，导致无法正常按照TTL设置出队，而我们又不想一个个地给消息绑定不同的队列，可以使用插件实现延时。

此时的延迟队列就跟死信队列没什么关系了，

### &emsp;插件安装

在[插件官网](https://www.rabbitmq.com/community-plugins.html)中找到[rabbitmq-delayed-message-exchange插件](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange)的ez文件，放到RabbtiMQ的安装目录的plugins插件目录下，然后在该目录打开控制台执行`rabbitmq-plugins enable rabbitmq_delayed_message_exchange`，重启RabbitMQ服务。

此时打开RabbitMQ控制台的Exchanges中，点击Add a new exchange，然后点开Type，原来只有direct、fanout、headers、topic四种类型，此时最下面多了一个x-delayed-message类型。表示此时延迟不再由队列设置TTL来实现延迟，而是由交换机来实现延迟功能，而不是由死信来间接实现。

### &emsp;延迟交换机执行流程

![延迟交换机][exchange]

此时我们沿用之前定义的一些参数，延迟交换机为delayExchange，普通队列为queue，队列和交换机之间的RoutingKey为delay。

使用前记得把原来的队列和交换机都删掉避免连接冲突。并在MqConfig中将@Configuration注解掉。

### &emsp;延迟交换机配置

新建一个新的延迟交换机的相关配置类建立相关连接：

```java
// ExchangeConfig.java
package org.didnelpsun.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class ExchangeConfig {

    @Resource
    private PropertyConfig config;

    public void setConfig(PropertyConfig config) {
        this.config = config;
    }

    // 声明延迟交换机
    // 由于这是个插件导入的，所以需要自定义交换机
    @Bean
    public CustomExchange delayExchange(){
        Map<String, Object> arguments = new HashMap<>();
        // 消息延迟发送的类型，为路由类型，直接根据RoutingKey发送消息
        arguments.put("x-delayed-type", "direct");
        // 参数分别为：名字、类型、是否持久化，是否自动删除，附加参数
        return new CustomExchange(config.getDelayExchange(), "x-delayed-message", false, false, arguments);
    }

    //  声明队列
    @Bean
    public Queue queue() {
        return QueueBuilder.durable(config.getQueue()).build();
    }

    @Bean
    // 绑定队列和交换机
    // 普通队列和延迟交换机
    public Binding delay(@Qualifier("queue") Queue queue, @Qualifier("delayExchange") CustomExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(config.getDelay()).noargs();
    }
}
```

### &emsp;延迟交换机生产者

```java
@GetMapping("/delay/{delay}/{msg}")
public String send(@PathVariable Integer delay, @PathVariable String msg) {
    // 需要传入一个后置处理器对消息处理
    rabbitTemplate.convertAndSend(config.getDelayExchange(), config.getDelay(), new Date() + "延迟" + (delay / 1000) + "秒消息：" + msg, message -> {
        // 设置存活时间
        message.getMessageProperties().setDelay(delay);
        return message;
    });
    return "延迟发送成功";
}
```

消费者和原来的一样，所以可以直接运行，访问<http://localhost:8080/delay/10000/test10>，<http://localhost:8080/delay/4000/test4>：

```txt
Wed Apr 06 20:13:55 CST 2022:Wed Apr 06 20:13:51 CST 2022延迟4秒消息：test4
Wed Apr 06 20:13:59 CST 2022:Wed Apr 06 20:13:49 CST 2022延迟10秒消息：test10
```

此时队列就正常了。

[RabbitMQ队列：MQ/rabbitmq_queue](https://github.com/Didnelpsun/MQ/tree/main/rabbitmq_queue)。

[queue]:data:image/png;base64,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

[exchange]:data:image/png;base64,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
