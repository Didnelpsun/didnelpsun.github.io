---
layout: post
title:  "消息中间件"
date:   2022-03-28 15:26:47 +0800
categories: notes mq base
tags: MQ 基础
excerpt: "消息中间件"
---

## 概念

### &emsp;定义

MQ即Message Queue，称为消息队列，也是消息中间件MOM。主要包括Kafka、RabbitMQ、RocketMQ、ActiveMQ。

消息队列，是基础数据结构中“先进先出”的一种数据结构。一般用来解决应用解耦，异步消息，流量削峰等问题，实现高性能，高可用，可伸缩和最终一致性架构。

面向消息的中间件MOM（message-oriented middleware）能够很好的解决以上问题。MOM是指利用高效可靠的消息传递机制进行与平台无关的数据交流，并基于数据通信来进行分布式系统的集成。通过提供消息传递和消息排队模型在分布式环境下提供应用解耦、弹性伸缩、冗余存储、流量削峰、异步通信、数据同步等功能。

### &emsp;消息传递机制

即并行计算机中各台处理机通过传递消息包来实现通信和同步的机制。

在消息传递多处理机系统中，每台处理机有各自的局部存储器和高速缓冲存储器，每台处理机只能访问自己的局部存储器，处理机间的通信通过消息传递来进行。与消息传递对应的是共享存储。

优点：

1. 硬件适用范围广。消息传递模型不但在并行计算机中工作良好，而且适用于机群系统（许多处理机通过通信网络连接而形成的系统）。
2. 功能强。消息传递提供描述并行算法的全部功能，还提供数据并行模型不提供的控制功能。
3. 性能好。现代中央处理器的有效利用需要存储层次结构的有效管理，消息传递通过显式控制数据局部性实现这一点。
4. 可扩展性好。

缺点：

1. 需要进行细致的数据分布。
2. 需要负责消息传递的进行。

### &emsp;实现功能

MQ的实现都应该实现下面的功能：

+ 消息需要进行发送和接收，所以需要API的发送和接收。
+ 由于消息不能中断，所以必须要MQ的高可用性。
+ 为了保证可用性，就必须使用集群和容错机制。
+ 为了保存消息，必须对MQ进行持久化。
+ 需要对消息传输控制，需要实现延时发送和定时投递。
+ 为了保证消息安全，必须实现签收机制。

&emsp;

## 使用场景

### &emsp;存在问题

微服务架构后，链式调用是我们在写程序时候的一般流程，为了完成一个整体功能会将其拆分成多个函数（或子模块），比如模块A调用模块B，模块B调用模块C，模块C调用模块D。但在大型分布式应用中，系统间的RPC交互繁杂，一个功能背后要调用上百个接口并非不可能，从单机架构过渡到分布式微服务架构的通例。如果调用的每个接口之间存在继承关系，下游接口对上游接口进行组装，则一旦上游的父接口需要增加功能，则下游的所有子接口与实现类都要重新对父接口功能进行封装，导致开发联调的效率很低。

每个接口模块的吞吐能力是有限的，这个上限能力如果堤坝当大流量（洪水）来临时，容易被冲垮。上游只需要一个操作，但是下游需要对上游的操作进行业务逻辑处理，从而让大流量冗余到多个接口模块中。

等待同步存在性能问题，RPC接口基本上是同步调用，整体的服务性能遵循“木桶理论”，即整体系统的耗时取决于链路中最慢的那个接口。一组操作如果同时等待一个提供的服务会造成整个系统的僵死，从而导致系统中其他与等待资源无关的服务也无法运行。

### &emsp;作用

所以MQ的功能有：

+ 解耦。将不同的信息按照统一的格式发送给不同的主体进行处理，每个系统只用负责自己的部分，系统之间使用消息来进行监听。
+ 削峰。设置流量缓冲池，通过异步操作将步骤进行拆开为消息给不同主体处理，从而降低访问流量。
+ 异步。对于不重要的信息进行异步传输，重要的信息直接优先完成传输，而不再是一个一个走流程同步完成。

&emsp;

## JMS

### &emsp;概念

JMS即Java消息服务（Java Message Service）应用程序接口，是一个Java平台中关于面向消息中间件（MOM）的API，用于在两个应用程序之间，或分布式系统中发送消息，进行异步通信。Java消息服务是一个与具体平台无关的API，绝大多数MOM提供商都对JMS提供支持。

JMS是一种与厂商无关的API，用来访问收发系统消息，它类似于JDBC（Java Database Connectivity）。这里，JDBC是可以用来访问许多不同关系数据库的API，而JMS则提供同样与厂商无关的访问方法，以访问消息收发服务。许多厂商都支持JMS，包括IBM的MQSeries、BEA的Weblogic JMS service和Progress的SonicMQ。 JMS 使您能够通过消息收发服务（有时称为消息中介程序或路由器）从一个JMS客户机向另一个JMS客户机发送消息。消息是JMS中的一种类型对象，由两部分组成：报头和消息主体。报头由路由信息以及有关该消息的元数据组成。消息主体则携带着应用程序的数据或有效负载。根据有效负载的类型来划分，可以将消息分为几种类型，它们分别携带：简单文本（TextMessage）、可序列化的对象（ObjectMessage）、属性集合（MapMessage）、字节流（BytesMessage）、原始值流（StreamMessage），还有无有效负载的消息（Message）。

### &emsp;构成元素

+ JMS提供者：连接面向消息中间件的，JMS接口的一个实现。提供者可以是Java平台的JMS实现，也可以是非Java平台的面向消息中间件的适配器。
+ JMS客户：生产或消费基于消息的Java的应用程序或对象。
+ JMS生产者：创建并发送消息的JMS客户。
+ JMS消费者：接收消息的JMS客户。
+ JMS消息：包括可以在JMS客户之间传递的数据的对象。由消息头、消息体、消息属性三个部分。具有五种类型：
  + StreamMessage：Java原始值的数据流。
  + MapMessage：一套键值对。
  + TextMessage：一个字符串对象。
  + ObjectMessage：一个序列化的Java对象。
  + BytesMessage：一个未解释字节的数据流。
+ JMS队列：一个容纳那些被发送的等待阅读的消息的区域。与队列名字所暗示的意思不同，消息的接受顺序并不一定要与消息的发送顺序相同。一旦一个消息被阅读，该消息将被从队列中移走。
+ JMS主题：一种支持发送消息给多个订阅者的机制。

### &emsp;对象模型

+ 连接工厂。连接工厂（ConnectionFactory）是由管理员创建，并绑定到JNDI树中。客户端使用JNDI查找连接工厂，然后利用连接工厂创建一个JMS连接。
+ JMS连接。JMS连接（Connection）表示JMS客户端和服务器端之间的一个活动的连接，是由客户端通过调用连接工厂的方法建立的。
+ JMS会话。JMS会话（Session）表示JMS客户与JMS服务器之间的会话状态。JMS会话建立在JMS连接上，表示客户与服务器之间的一个会话线程。
+ JMS目的。JMS目的（Destination），又称为消息队列，是实际的消息源。
+ JMS生产者和消费者。生产者（Message Producer）和消费者（Message Consumer）对象由Session对象创建，用于发送和接收消息。
+ JMS消息：
  + 点对点（Point-to-Point）或队列模型：在点对点的消息系统中，消息分发给一个单独的使用者。点对点消息往往与队列（javax.jms.Queue）相关联。
  + 发布/订阅（Publish/Subscribe）模型：发布/订阅消息系统支持一个事件驱动模型，消息生产者和消费者都参与消息的传递。生产者发布事件，而使用者订阅感兴趣的事件，并使用事件。该类型消息一般与特定的主题（javax.jms.Topic）关联。

&emsp;

## 流程

### &emsp;基本逻辑

发送者把消息发送给消息服务器，消息服务器将消息存放在若干队列或主题中，在合适的时候，消息服务器会将消息转发给接受者。在这个过程中，发送和接受是异步的，也就是发送无需等待，而且发送者和接受者的生命周期也没有必然关系。

尤其在发布pub/订阅sub模式下，也可以完成一对多的通信，即让一个消息有多个接受者。

### &emsp;MQ标准流程

```txt
                   Connection Factory
                       连接工厂
                          |
                          |创建
                          |
                          v
                      Connection
                         连接
                          |
                          |创建
                          |
                          v
Message Producer<------Session------>Message Consumer
    消息生产者    创建   会话  创建     消息接收者
        |                 |                 |
        |发送             |创建             |接收
        |                 |                 |
        v                 v                 v
   Destination         Message         Destination
     目的地              消息             目的地
```

&emsp;

## 对比

特性|ActiveMQ|RabbitMQ|RocketMQ|Kafka
:--:|:------:|:------:|:------:|:---:
开发语言|Java|Erlang|Java|Java/Scala
单机吞吐量|万级|万级|十万级|十万级
Topic数量对吞吐量影响|||达到千级/百级会有小幅度下降|达到十级/百级会有大幅度下降
时效性|ms级|μs级|ms级|ms级
可用性|高|高|非常高|非常高
可靠性|较低丢失率|基本无丢失率|可以零丢失|可以零丢失
功能支持|MQ支持非常完善|并发能力强，性能高|MQ支持较为完善，分布式，扩展性好|MQ支持较简单
社区活跃度|低|中|高|高
适用场景|简单低量|时效性高|可靠性高|数据量高