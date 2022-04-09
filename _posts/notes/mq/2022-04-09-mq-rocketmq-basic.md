---
layout: post
title:  "RocketMQ基础"
date:   2022-04-09 00:53:39 +0800
categories: notes mq rocketmq
tags: MQ RocketMQ 基础
excerpt: "RocketMQ基础"
---

## 基本概念

RocketMQ的概念与之前学的MQ有一些不同。

### &emsp;通信实体

+ 消息：消息系统所传输信息的物理载体，生产和消费数据的最小单位，每条消息必须属于一个主题。
+ 主题：
  + 表示一类消息的集合，每个主题包含若干条消息，每条消息只能属于一个主题，是RocketMQ进行消息订阅的基本单位。主题和消息是1:n关系。
  + 一个生产者可以同时发送多种Topic的消息；而一个消费者只对某种特定的Topic感兴趣，即只可以订阅和消费一种Topic的消息。生产者和主题是1:n关系，消费者和主题是1:1关系。
+ 标签：
  + 用于同一主题下区分不同类型的消息。
  + 来自同一业务单元的消息，可以根据不同业务目的在同一主题下设置不同标签。标签能够有效地保持代码的清晰度和连贯性，并优化RocketMQ提供的查询系统。
  + 消费者可以根据Tag实现对不同子主题的不同消费逻辑，实现更好的扩展性。
  + Topic是消息的一级分类，Tag是消息的二级分类。
+ 队列：
  + 存储消息的物理实体。一个Topic中可以包含多个Queue，每个Queue中存放的就是该Topic的消息。
  + 一个Topic的Queue也被称为一个Topic中消息的分区（Partition）。
  + 一个Topic的Queue中的消息只能被同一个消费者组中的一个消费者消费，不允许被同一个消费者组中的多个消费者消费。
  + 一个Queue中的消息只能被同一个消费者组中的多个消费者互斥消费，不允许被同一个消费者组中的多个消费者同时消费。
+ 消息标识：
  + RocketMQ中每个消息拥有唯一的MessageId，且可以携带具有业务标识的Key（由用户指定给业务的唯一标识），以方便对消息的查询。
  + MessageId有两个：在生产者send()消息时会自动生成一个msgId（producerIp+进程pid+MessageclientDsetter类的classLoader的hashcode+当前时间+AutomicInteger自增计数器
）；当消息到达Broker后，Broker也会自动生成一个offsetMsgId（brokerIp+物理分区的offset/Queue中的偏移量）。msgId、offsetMsgId与key都称为消息标识。

### &emsp;系统架构

#### &emsp;&emsp;Producer

+ 消息生产者，负责生产消息。
+ Producer通过MQ的负载均衡模块选择相应的Broker集群队列进行消息投递，投递的过程支持快速失败并且低延迟。
+ RocketMQ中的消息生产者都是以生产者组（Producer Group）的形式出现的。生产者组是同一类生产者的集合，这类Producer发送相同Topic类型的消息。一个生产者组可以同时发送多个主题的消息。

#### &emsp;&emsp;Consumer

+ 消息消费者，负责消费消息。
+ 一个消息消费者会从Broker服务器中获取到消息，并对消息进行相关业务处理。
+ RocketMQ中的消息消费者都是以消费者组（Consumer Group）的形式出现的。消费者组是同一类消费者的集合，这类Consumer消费的是同一个Topic类型的消息。

#### &emsp;&emsp;Broker

+ 充当着消息中转角色，负责存储消息、转发消息。
+ Broker在RocketMQ系统中负责接收并存储从生产者发送来的消息，同时为消费者的拉取请求作准备。
+ Broker同时也存储着消息相关的元数据，包括消费者组消费进度偏移offset、主题、队列等。

Broker构成：

+ Remoting Module：整个Broker的实体，负责处理来自clients端的请求。而这个Broker实体则由以下模块构成。
+ Client Manager：客户端管理器。负责接收、解析客户端（Producer/Consumer）请求，管理客户端。例如，维护Consumer的Topic订阅信息。
+ Store Service：存储服务。提供方便简单的API接口，处理消息存储到物理硬盘和消息查询功能。
+ HA Service：高可用服务，提供Master Broker和Slave Broker之间的数据同步功能。
+ Index Service：索引服务。根据特定的Message key，对投递到Broker的消息进行索引服务，同时也提供根据Message Key对消息进行快速查询的功能。

#### &emsp;&emsp;NameServer

+ 是一个Broker与Topic路由的注册中心，支持Broker的动态注册与发现。
+ RocketMQ的思想来自于Kafka，而Kafka是依赖了Zookeeper的。所以，在RocketMQ的早期版本，即在MetaQ v1.0与v2.0版本中，也是依赖于Zookeeper的。从MetaQ v3.0，即RocketMQ开始去掉Zookeeper依赖，使用了自己的NameServer。
+ Broker管理：接受Broker集群的注册信息并且保存下来作为路由信息的基本数据；提供心跳检测机制，检查Broker是否还存活。
+ 路由信息管理：每个NameServer中都保存着Broker集群的整个路由信息和用于客户端查询的队列信息。Producer和Conumser通过NameServer可以获取整个Broker集群的路由信息，从而进行消息的投递和消费。

路由注册：

+ NameServer通常也是以集群的方式部署，不过，NameServer是无状态的，即NameServer集群中的各个节点间是无差异的，各节点间相互不进行信息通讯。那各节点中的数据是如何进行数据同步的哪在Broker节点启动时，轮训NameServer列表，与每个NameServer节点建立长连接，发起注册请求。在NameServer内部维护着一个Broker列表，用来动态存储Broker的信息。优点是搭建简单，缺点是维护和扩展困难。
+ Broker节点为了证明自己是活着的，为了维护与NameServer间的长连接，会将最新的信息以心跳包的方式上报给NameServer，每30秒发送一次心跳。心跳包中包含Brokerld、Broker地址、Broker名称、Broker所属集群名称等等。NameServer在接收到心跳包后，会更新心跳时间戳，记录这个Broker的最新存活时间。

路由剔除：

+ 由于Broker关机、宕机或网络抖动等原因，NameServer没有收到Broker的心跳，NameServer可能会将其从Broker列表中剔除。
+ NameServer中有一个定时任务，每隔10秒就会扫描一次Broker表，查看每一个Broker的最新心跳时间戳距离当前时间是否超过120秒，如果超过，则会判定Broker失效，然后将其从Broker列表中剔除。
+ 对于RocketMQ日常运维工作，例如Broker升级，需要停止Broker的工作。运维工程师需要将Broker的读写权限禁掉。一旦client（Consumer或Producer）向broker发送请求，都会收到broker的NO_PERMISSION响应，然后client会进行对其它Broker的重试。当OP观察到这个Broker没有流量时会移除这个Broker。

路由发现：

+ RocketMQ的路由发现采用的是Pull模型。当Topic路由信息出现变化时，NameServer不会主动推送给客户端，而是客户端定时拉取主题最新的路由。默认客户端每30秒会拉取一次最新的路由。实时性较差。
+ 如果是Push模型，则如果路由信息出现变化则会主动推动给客户端。需要维持大量长连接。
+ 如果是Long Polling模型，则按照一定的时间间隔轮询访问查看是否变化，并维持连接一定时间，在这个时间段内如果存在变化则更新变化并继续保持，如果没有变化则关闭连接。

### &emsp;运行流程

1. 启动NameServer，NameServer启动后开始监听端口，等待Broker、Producer、Consumer连接。
2. 启动Broker时，Broker会与所有的NameServer建立并保持长连接，然后每30秒向NameServer定时发送心跳包。
3. 发送消息前，可以先创建Topic，创建Topic时需要指定该Topic要存储在哪些Broker上，当然，在创建Topic时也会将Topic与Broker的关系写入到NameServer中。不过，这步是可选的，也可以在发送消息时自动创建Topic。
4. Producer发送消息，启动时先跟NameServer集群中的其中一台建立长连接，并从NameServer中获取路由信息，即当前发送的Topic消息的Queue与Broker的地址（IP+Port）的映射关系。然后根据算法策略从队选择一个Queue，与队列所在的Broker建立长连接从而向Broker发消息。当然，在获取到路由信息后，Producer会首先将路由信息缓存到本地，再每30秒从NameServer更新一次路由信息。
5. Consumer跟Producer类似，跟其中一台NameServer建立长连接，获取其所订阅Topic的路由信息，然后根据算法策略从路由信息中获取到其所要消费的Queue，然后直接跟Broker建立长连接，开始消费其中的消息。Consumer在获取到路由信息后，同样也会每30秒从NameServer更

客户端选择策略：

客户端在配置时必须要写上NameServer集群的地址。客户端首先会首先一个随机数，然后再与NameServer节点数量取模，此时得到的就是所要连接的节点索引，然后就会进行连接。如果连接失败，则会采用round-robin策略，逐个尝试着去连接其它节点。

&emsp;

## 集群概念

### &emsp;数据策略

#### &emsp;&emsp;复制策略

Broker的Master与Slave间的数据同步方式。分为同步复制与异步复制：

+ 同步复制：消息写入Master后，Master会等待Slave同步数据成功后才向Producer返回成功ACK。
+ 异步复制：消息写入Master后，Master立即向Producer返回成功ACK，无需等待Slave同步数据成功。

#### &emsp;&emsp;刷盘策略

是Broker中消息的落盘方式，即消息发送到Broker内存后消息持久化到磁盘的方式。分为同步刷盘与异步刷盘：

+ 同步刷盘：当消息持久化到Broker的磁盘后才算是消息写入成功。
+ 异步刷盘：当消息写入到Broker的内存后即表示消息写入成功，无需等待消息持久化到磁盘。

### &emsp;集群结构

为了增强Broker性能与吞吐量，Broker一般都是以集群形式出现的。各集群节点中可能存放着相同Topic的不同Queue。不过，这里有个问题，如果某Broker节点宕机，如何保证数据不丢失呢?其解决方案是，将每个Broker集群节点进行横向扩展，即将Broker节点再建为一个HA集群，解决单点问题。

Broker节点集群是一个主从集群，即集群中具有Master与Slave两种角色。Master负责处理读写操作请求，而Slave仅负责读操作请求。一个Master可以包含多个Slave，但一个Slave只能隶属于一个Master。Master与Slave的对应关系是通过指定相同的BrokerName、不同的Brokerld 来确定的。Brokerld为0表示Master，非0表示Slave。每个Broker与NameServer集群中的所有节点建立长连接，定时注册Topic信息到所有NameServer。

新一次路由信息。不过不同于Producer的是，Consumer还会向Broker发送心跳，以确保Broker的存活状态。

### &emsp;Broker集群模式

根据Broker集群中各个节点间关系的不同，Broker集群可以分为以下几类：

#### &emsp;&emsp;单Master

只有一个Broker（其本质上就不能称为集群）。这种方式也只能是在测试时使用，生产环境下不能使用，因为存在单点问题。

#### &emsp;&emsp;多Master

Broker集群仅由多个Master构成，不存在Slave。同一Topic的各个Queue会基本平均分布在各个Master节点上。

+ 优点：配置简单，单个Master宕机或重启维护对应用无影响，在磁盘配置为RAID10时，即使机器宕机不可恢复情况下，由于RAID10磁盘非常可靠，消息也不会丢（异步刷盘丢失少量消息，同步刷盘一条不丢），性能最高。
+ 缺点：单台机器宕机期间，这台机器上未被消费的消息在机器恢复之前不可订阅（不可消费），消息实时性会受到影响。

#### &emsp;&emsp;异步复制多Master多Slave模式

Broker集群由多个Master构成，每个Master又配置了多个Slave（在配置了RAID磁盘阵列的情况下，一个Master一般配置一个Slave即可）。Master与Slave的关系是主备关系，即Master负责处理消息的读写请求，而Slave仅负责消息的备份与Master宕机后的角色切换。

此时会采用异步复制，即前面所讲的复制策略中的异步复制策略，即消息写入Master成功后，Master立即向Producer返回成功ACK，无需等待Slave同步数据成功。

该模式的最大特点之一是，当Master宕机后Slave能够自动切换为Master。不过由于Slave从Master的同步具有短暂的延迟（毫秒级)，所以当Master宕机后，这种异步复制方式可能会存在少消量息的丢失问题。

#### &emsp;&emsp;同步双写多Master多Slave模式

该模式是多Master多Slave模式的同步复制实现。

所谓同步复制，指的是消息写入Master成功后，Master会等待Slave同步数据成功后才向Producer返回成功ACK，即Master与Slave都要写入成功后才会返回成功ACK，也即双写。

该模式与异步复制模式相比，优点是消息的安全性更高，不存在消息丢失的情况。但单个消息的RT略高，从而导致性能要略低（大约低10%）。

该模式存在一个大的问题，对于目前的版本，Master宕机后，Slave不能自动切换到Master。

&emsp;

## 安装配置

首先到[官网下载](http://rocketmq.apache.org/dowloading/releases/)下载安装包，选择Binary版本下载。

### &emsp;单机安装

将压缩包解压放到安装路径下，再把路径加\bin加入到环境变量中。

打开控制台输入`start mqnamesrv`启动NameServer。如果报错：

```txt
Unrecognized VM option 'UseConcMarkSweepGC'
Error: Could not create the Java Virtual Machine.
Error: A fatal exception has occurred. Program will exit.
```

无法识别UseCMSCompactAtFullCollection，因为JDK9及以后都取消了这一选项，检查自身JDK版本，用JDK8测试即可：

```txt
Java HotSpot(TM) 64-Bit Server VM warning: Using the DefNew young collector with the CMS collector is deprecated and will likely be removed in a future release
Java HotSpot(TM) 64-Bit Server VM warning: UseCMSCompactAtFullCollection is deprecated and will likely be removed in a future release.
The Name Server boot success. serializeType=JSON
```

输入`mqbroker -n 127.0.0.1:9876`在9876端口启动RocketMQ的Broker：The broker[Didnelpsun, 192.168.93.209:10911] boot success. serializeType=JSON and name server is 127.0.0.1:9876。

### &emsp;安装页面管理

跳转到[RocketMQ扩展](https://github.com/apache/rocketmq-externals)，下载[RocketMQ Dashboard](https://github.com/apache/rocketmq-dashboard)的ZIP文件。

这是一个Maven项目，运行`mvn spring-boot:run`启动。或者执行`mvn clean package -Dmaven.test.skip=true`进行打包再在target文件夹中运行jar：`java -jar rocketmq-dashboard-1.0.0.jar`。

此时如果报错：org.apache.rocketmq.remoting.exception.RemotingConnectException: connect to \<null\> failed，这是因为maven编译jar包时没有配置rocketmq.config.namesrvAddr，文件在src/main/resources下。可以修改application.properties：

```properties
rocketmq.config.namesrvAddr=127.0.0.1:9876
rocketmq.config.isVIPChannel=false
```

查看<http://localhost:8080/#/>。

### &emsp;搭建集群

这里搭建的是异步刷盘消息队列集群即2m-2s-async。

打开安装包的conf文件夹下你就会发现2m-2s-async文件夹，这就是异步两主两从集群的配置文件，里面有四个properties文件。分别是broker-a、broker-b两个主机和broker-a-s、broker-b-s两个从机。broker-a和broker-a-s保存同样的数据，broker-b和broker-b-s保存同样的数据。

我们在配置时需要将broker-a和borker-b-s配置在一起，broker-b和broker-a-s配置在一起，为什么要交叉的配置？为什么不是broker-a和borker-a-s配置在一起，broker-b和broker-b-s配置在一起？因为假如broker-a宕机了，那么跟他一起配置的Broker也会一起宕机，如果配置的是broker-a-s，则所有保存a数据的节点全部宕机，就无法使用a的数据了，如果配置的是broker-b-s，则另一组是broker-b和broker-a-s，此时a和b的数据都有，broker-a-s上升为主机。

打开broker-a.properties查看里面默认的配置：


