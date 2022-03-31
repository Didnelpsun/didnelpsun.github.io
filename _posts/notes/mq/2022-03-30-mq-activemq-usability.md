---
layout: post
title:  "ActiveMQ高可用"
date:   2022-03-30 21:33:10 +0800
categories: notes mq activemq
tags: MQ ActiveMQ 高可用
excerpt: "ActiveMQ高可用"
---

高可用性主要在于事务、持久、签收、持久化、集群。

## 传输协议

默认传输是TCP的，为了效率和高可用性，也可以使用其他协议。

### &emsp;协议配置

ActiveMQ的传输URL默认为tcp://127.0.0.1:61616，即默认是使用TCP协议的。

ActiveMQ支持的client-broker通讯协议有：TCP、NIO、UDP、SSL、HTTP、HTTPS、VM。

修改方式是修改/conf/activemq.xml的transportConnectors标签：

```xml
<transportConnectors>
    <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
    <transportConnector name="openwire" uri="tcp://0.0.0.0:61616?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="stomp" uri="stomp://0.0.0.0:61613?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="mqtt" uri="mqtt://0.0.0.0:1883?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="ws" uri="ws://0.0.0.0:61614?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
</transportConnectors>
```

URI描述信息的头部都是采用协议名称表示ActiveMQ天然支持这些协议不需要其他配置，如描述amqp协议的监听端口时，采用的URI描述格式为amqp开头，而唯独在进行openwire协议描述时，URI头却采用的tcp开头。这是为什么？

查看[官方传输配置](https://activemq.apache.org/configuring-transports)。

### &emsp;基本支持协议

+ OpenWire协议：为Broker默认协议，是Apache自己定义的一种跨语言协议，允许从多种不同语言和平台对ActiveMQ进行本机访问，支持TCP、SSL、NIO、UDP、VM等传输方式，默认使用TCP，直接配置这些连接，是4.x版本以后默认的传输协议。速度较慢。
+ AMQP协议：即Advanced Message Queuing Protocol，一个提供统一消息服务的应用层标准的高级消息队列协议，是应用层协议的一个开放标准，为面向消息的中间件设计。基于此协议的客户端与消息中间件可传递消息，并不受客户端/中间件不同产品，不同开发语言等条件的限制。速度较快。
+ MQTT协议：即Message Queuing Telemetry Transport，消息队列遥测传输，是IBM开发的一个即时通讯协议，偏硬件部分，有可能成为物联网的重要组成部分。该协议支持所有平台，几乎可以把所有联网物品和外部连接起来，被用来当做传感器和致动器（比如通过Twitter让房屋联网）的通信协议。速度最快。
+ STOMP协议：即Streaming Text Orientated Message Protocol，是流文本定向消息协议，是一种为MOM面向消息的中间件设计的简单文本协议。速度最慢。
+ SSL协议：即Secure Sockets Layer Protocol，安全套接字协议，为网络通信提供安全及数据完整性的一种安全协议。其拓展协议TLS与SSL在传输层与应用层之间对网络连接进行加密。
+ WS协议：即WebSocket Protocol，是HTML5一种新的协议。它实现了浏览器与服务器全双工通信。和HTTP一样是一种应用层协议，都是基于TCP传输的，WebSocket本身和Socket并没有多大关系，更不能等同。
+ UDP协议：即User Datagram Protocol，用户数据报协议，性能比TCP协议更好，但是不具备可靠性。
+ HTTP协议：即Hyper Text Transfer Protocol，超文本传输协议。
+ VM：本身不是协议，当客户端和代理在同一个Java虚拟机中运行时,他们之间需要通信，但不想占用网络通道，而是直接通信，可以使用该方式。

#### &emsp;&emsp;TCP协议

端口号为61616，在网络传输数据前，必须要序列化数据，消息是通过一个叫wire protocol的协议来序列化成字节流。默认情况下ActiveMQ把wire protocol叫做OpenWire，它的目的是促使网络上的效率和数据快速交互。

+ TCP协议传输可靠性高，稳定性强。
+ 高效性，字节流方式传递，效率很高。
+ 有效性、可用性，应用广泛，支持任何平台。

TCP连接的URI形式：tcp://hostname:port?key=value&key=value

[TCP协议配置](https://activemq.apache.org/tcp-transport-reference)。

#### &emsp;&emsp;NIO协议

ActiveMQ默认使用BIO连接，如果有大量的客户端，或者瓶颈在网络传输上，可以考虑使用NIO。

NIO协议和TCP协议类似，但NIO协议更侧重于底层的访问操作。它允许开发人员对同一资源可有更多的客户端调用和服务端有更多的负载。

适合使用NIO协议的场景：

1. 可能有大量的客户端去连接到Broker上，一般情况下，大量的客户端去连接Broker是被操作系统的线程所限制的。因此，NIO的实现比TCP需要更少的线程去运行，所以建议使用NIO协议。
2. 可能对于Broker有一个很迟钝的网络传输，NIO比TCP提供更好的性能。

NIO连接的URI形式：nio://hostname:port?key=value&key=value。

[NIO协议配置](https://activemq.apache.org/nio-transport-reference)。

### &emsp;NIO使用

#### &emsp;&emsp;配置NIO

首先修改ActiveMQ的配置文件conf/activemq.xml，在transportConnectors标签中添加`<transportConnector name="nio" uri="nio://0.0.0.0:61618?trace=true&amp;maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>`。启动ActiveMQ后看到控制台打印Connector nio started。

使用NIO后直接将代码中的连接地址修改就可以了，不需要修改代码。

#### &emsp;&emsp;多协议支持

默认是BIO+TCP，此时改成了URI格式头以"nio”开头，表示这个端口使用以TCP协议为基础的NIO网络IO模型。但是这样的设置方式，只能使这个端口支持OpenWire协议。所以如果将TCP改成其他协议呢？

[官网AUTO设置](https://activemq.apache.org/auto)可以支持同时使用多种协议。在配置文件中使用`<transportConnector name="autotnio" uri="autotnio://0.0.0.0:61608?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600&amp;org.apache.activemq.transport.nio.SelectorManager.corePoolSize=20&amp;org.apache.activemq.transport.nio.SelectorManager.maximumPoolSize=50"/>`来替代上面的配置。代码中连接地址不变。此时可以将其他所有协议都注释掉，只用这一个协议接口设置。

&emsp;

## 持久化

之前所说的持久主要是指关闭了服务后消费者仍然存在，仍然可以订阅，消息可以异步发送的是否保存消息的PERSISTENT模式，这些都是基于数据存储的持久化。

与事务、持久、签收不同的是，这三者来自于MQ本身自带的功能，如果MQ自身毁坏则功能失败，而持久化需要依靠其他工具来维持高可用性，比如SQL服务器。

原理是在发送者将消息发送出去后，消息中心首先将消息存储到本地数据文件、内存数据库或者远程数据库等再试图将消息发送给接收者，成功则将消息从存储中删除，失败则继续尝试发送。消息中心启动以后首先要检查指定的存储位置，如果有未发送成功的消息，则需要把消息发送出去。

### &emsp;AMQ

即AMQ Message Store，基于文件的存储方式，是以前的默认消息存储，现在不用了。

AMQ是一种文件存储形式，它具有写入速度快和容易恢复的特点。消息存储在一个个文件中，文件的默认大小为32M，当一个文件中的消息已经全部被消费，那么这个文件将被标识为可删除，在下一个清除阶段，这个文件被删除。适用于ActiveMQ5.3之前的版本。

### &emsp;LevelDB

也是基于文件的存储方式，曾经被ActiveMQ使用，但是又最终被废弃，因为本身不稳定且有许多问题。

LevelDB是Google开源的持久化KV单机数据库，具有很高的随机写，顺序读/写性能，但是随机读的性能很一般，也就是说，LevelDB很适合应用在查询较少，而写很多的场景。LevelDB应用了LSM（Log Structured Merge）策略，lsm_tree对索引变更进行延迟及批量处理，并通过一种类似于归并排序的方式高效地将更新迁移到磁盘，降低索引插入开销。

### &emsp;KahaDB

#### &emsp;&emsp;配置位置

+ KahaDB是目前默认的存储方式，可用于任何场景，提高了性能和恢复能力。
+ 消息存储使用一个事务日志和仅仅用一个索引文件来存储它所有的地址。
+ KahaDB是是一个专门针对消息持久化的解决方案，它对典型的消息使用模式进行了优化。
+ 数据被追加到data logs中。当不再需要log文件中的数据的时候，log文件会被丢弃。

基于日志文件的存储方式。从/conf/activemq.xml中可以看到：

```xml
<persistenceAdapter>
    <kahaDB directory="${activemq.data}/kahadb"/>
</persistenceAdapter>
```

还有[KahaDB具体说明](https://activemq.apache.org/kahadb)可以查看具体有哪些配置信息。

#### &emsp;&emsp;原理

可以在对应目录D:\ActiveMQ\apache-activemq-5.17.0\data\kahadb下查看对应的数据：db-1.log、db.data、db.redo、lock四个文件。其实还会产生一个db.free文件。

1. db-序号.log：KahaDB存储消息到预定义大小的数据记录文件中。当数据文件已满时，一个新的文件会随之创建，序号数值也会随之递增，它随着消息数量的增多，如每32M一个文件，文件名按照数字进行编号，如db-1.log、db-2.log、db-3.log……。当不再有引用到数据文件中的任何消息时，文件会被删除或归档。
2. db.data：只会有一个，该文件包含了持久化的BTree索引，索引了消息数据记录中的消息,它是消息的索引文件，本质上是B-Tree即B树，使用B-Tree作为索引指向db-序号.log里面存储的消息。
3. db.free：当前db.data文件里哪些页面是空闲的，文件具体内容是所有空闲页的ID。
4. db.redo：用来进行消息恢复，如果KahaDB消息存储在强制退出后启动这个文件，用于恢复BTree索引。
5. lock：文件锁，表示当前获得KahaDB读写权限的Broker。

### &emsp;JDBC

直接存储在SQL数据库中进行分离。

#### &emsp;&emsp;配置依赖

需要让ActiveMQ和MySQL有关联，首先要配置ActiveMQ对于MySQL的依赖，由于ActiveMQ是Java编写的，所以可以将依赖的jar包mysql-connector-java放到ActiveMQ中。下载的方式是到Maven仓库中搜索对应的依赖，然后选择Files栏目的jar选项就可以直接在浏览器中下载。

然后移动到对应目录，具体的位置是安装目录的lib文件夹下，表示ActiveMQ的依赖。

#### &emsp;&emsp;配置连接

然后将ActiveMQ的持久化数据库从KahaDB改为JDBC，在activemq.xml中将KahaDB配置注释掉，后面添加一个配置：

```xml
<persistenceAdapter> 
  <jdbcPersistenceAdapter dataSource="#mysql-ds"/> 
</persistenceAdapter>
```

dataSource指定将要引用的持久化数据库的bean配置名称（这里是配置名称，而不是一个数据库名称），#为引用符。

createTablesOnStartup是否在启动的时候创建数据表，默认值是true，这样每次启动都会去创建数据表了，一般是第一次启动的时候设置为true之后改成false。

所以在activemq.xml中新建一个名为mysql-ds的配置实例。[官网持久化](https://activemq.apache.org/persistence)给出了配置案例，我改成了自己的配置：

```xml
<bean id="mysql-ds" class="org.apache.commons.dbcp2.BasicDataSource" destroy-method="close"> 
    <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"/> 
    <property name="url" value="jdbc:mysql://localhost:3306/data?relaxAutoCommit=true"/> 
    <property name="username" value="root"/> 
    <property name="password" value="root"/> 
    <property name="poolPreparedStatements" value="true"/> 
</bean> 
```

然后粘贴到activemq.xml中，记住位置要在broker标签后，import标签前。

如果需要对配置进行改动，如使用Druid，则需要在lib中添加其他的依赖包。

#### &emsp;&emsp;配置数据库

<!-- 使用`CREATE DATABASE IF NOT EXISTS activemq DEFAULT CHARSET utf8 COLLATE utf8_general_ci;`新建activemq数据库。 -->

如果没有连接的数据库还需要新建数据库，data数据库已经建好了。

由于createTablesOnStartup默认为true，所以AcitveMQ中会在数据库中自动建立三张表：

+ ACTIVEMQ_MSGS：消息表，queue和topic都存在里面：
  + ID：自增的数据库主键。
  + CONTAINER：消息的Destination目的地。
  + MSGID_PROD：消息发送者的主键。
  + MSG_SEQ：是发送消息的顺序，MSGID_PROD+MSG_SEQ可以组成JMS的MessageID。
  + EXPIRATION：消息的过期时间，存储的是从1970-01-01到现在的毫秒数。
  + MSG：消息本体的Java序列化对象的二进制数据。
  + PRIORITY：优先级，从0-9，数值越大优先级越高。
+ ACTIVEMQ_ACKS：存储持久订阅的信息和最后一个持久订阅接收的消息ID，即订阅关系：
  + CONTAINER：消息的Destination目的地。
  + SUB_DEST：如果是使用Static集群，这个字段会有集群其他系统的信息。如果是单机则是空。
  + CLIENT_ID：每个订阅者都必须有一个唯一的客户端ID用以区分。
  + SUB_NAME：订阅者名称。
  + SELECTOR：选择器，可以选择只消费满足条件的消息。条件可以用自定义属性实现，可支持多属性AND和OR操作。
  + LAST_ACKED_ID：记录消费过的消息的ID。
+ ACTIVEMQ_LOCK：在集群环境中才有用，只有一个Broker可以获得消息，称为Master Broker，其他的只能作为备份等待Master Broker不可用，才可能成为下一个Master Broker。这个表用于记录哪个Broker是当前的Master Broker。
  + ID：每一个锁的ID。
  + TIME：上锁时间。
  + BROKER_NAME：持有锁的ActiveMQ Broker的名字，即主Broker的名称。

也可以手动添加这三张表。

重新启动ActiveMQ。

如果报错，查看安装目录/data/activemq.log：java.sql.SQLException: Cannot create PoolableConnectionFactory (Communications link failure，The last packet sent successfully to the server was 0 milliseconds ago. The driver has not received any packets from the server，是SSL的问题，将连接配置改为`<property name="url" value="jdbc:mysql://localhost:3306/activemq?relaxAutoCommit=trueserverTimezone=UTC&amp;useSSL=false&amp;useUnicode=true&amp;characterEncoding=utf-8"/>`。

如果报错：java.sql.SQLException: Cannot create PoolableConnectionFactory (Public Key Retrieval is not allowed)，再在连接上添加`&amp;allowPublicKeyRetrieval=true`。

如果报错：java.io.IOException: Transport Connector could not be registered in JMX: java.io.IOException: Transport scheme NOT recognized: \[autotnio\]，这是因为端口被占用，使用`netstat -ano`查看，也可以直接将原来设置过的NIO连接注释掉，反正我们也不会使用：`<transportConnector name="autotnio" uri="autotnio://0.0.0.0:61608?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600&amp;org.apache.activemq.transport.nio.SelectorManager.corePoolSize=20&amp;org.apache.activemq.transport.nio.SelectorManager.maximumPoolSize=50"/>`。

<span style="orange">注意：</span>如果我们是两台主机互相访问，出现数据库服务器拒绝连接，这是因为本地主机的MySQL默认配置了不允许从远程访问登录。此时也不能使用root账户，因为这样不能授权远程访问：You are not allowed to create a user with GRANT，必须新建一个用户admin：

1. `mysql -u root -p`：打开MySQL控制台进入root管理员账户。
2. `create user 'admin'@'%' identified by 'admin';`：新建一个admin账户用来远程访问。
3. `grant all on *.* to 'admin'@'%' with grant option;`：支持root用户允许远程连接MySQL数据库。
4. `flush privileges;`：更新设置。

在activemq.xml中修改用户名和密码为admin。

#### &emsp;&emsp;运行代码

使用[ActiveMQ使用SpringBoot整合：MQ/activemq_integration_springboot](https://github.com/Didnelpsun/MQ/tree/main/activemq_integration_springboot)，对打印的字符串进行修改，由于需要持久化，所以使用持久模式的消息，配置delivery-mode：

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
    pub-sub-domain: true
    template:
      delivery-mode: PERSISTENT

# 队列主题名称
queueName: queue
topicName: topic
```

如果是Spring，那就设置`producer.setDeliveryMode(DeliveryMode.PERSISTENT)`。

如果测试队列的生产者，那么activemq_msgs中会出现数据，其他两张表都是空：

ID|CONTAINER|MSGID_PROD|MSGID_SEQ|EXPIRATION|MSG|PRIORITY
:-:|:------:|:--------:|:-------:|:--------:|:-:|:------:
1|queue://queue|ID:Didnelpsun-53397-1648716930494-1:1:1:1|1|0|十六进制消息|0

如果消费，则消息会从Broker中删除。

如果测试主题，那么即使被消费消息也不会被删掉，会被保存到activemq_acks中。

### &emsp;JDBC Message Store with ActiveMQ Journal

即ActiveDB和JDBC之间的高速缓存。这种方式克服了JDBC Store的不足，JDBC每次消息过来，都需要去写库和读库。当消费者的消费速度能够及时跟上生产者消息的生产速度时，journal文件能够大大减少需要写入到DB中的消息。如果消费者的消费速度很慢，这个时候journal文件可以使消息以批量方式写到DB。

```xml
<persistenceFactory>
    <!--携带高速缓存-->
    <journalPersistenceAdapterFactory
        journalLogFiles="4"
        journalLogFilesize="32768"
        useJournal="true"
        useQuickJournal="true"
        dataSource="#mysql-ds"
        dataDirectory="activemq-data"/>
</persistenceFactory>
```

消息可以消费，但是数据不会马上同步到JDBC数据库中，因为数据还在journal文件里，过一段时间才一起同步到数据库中。即如果1s中生产了1000条消息，1s中消费了900条消息，那么就只用从内存同步100条消息到数据库，而如果没有高速缓存就要先同步1000条消息然后再删除900条消息。

&emsp;

## 集群

ActiveMQ的[主从模式](https://activemq.apache.org/masterslave)有两种：共享文件、JDBC。

使用ZooKeeper作为分发器来搭建主从集群。

### &emsp;主从原理

使用ZooKeeper集群注册所有的ActiveMQ Broker但只有其中的一个Broker可以提供服务它将被视Master，其他的Broker处于待机状态被视为Slave。

如果Master因故障而不能提供服务ZooKeeper会从Slave中选举出一个Broker充当Master。

Slave连接Master并同步他们的存储状态，Slave不接受客户端连接。所有的存储操作都将被复制到连接至Master的Slaves。如果Master宕机得到了最新更新的Slave会成为Master。故障节点在恢复后会重新加入到集群中并连接Master进入Slave模式。

所有需要同步的消息操作都将等待存储状态被复制到其他法定节点的操作完成才能完成。

所以，如果你配置了replicas=3，那么法定大小是(3/2)+1=2。Master将会存储并更新然后等待(2-1)=1个Slave存储和更新完成，才汇报success。

有一个node要作为观擦者存在。当一个新的Master被选中，你需要至少保障一个法定node在线以能够找到拥有最新状态的node。这个node才可以成为新的 Master。

因此，推荐运行至少3个replica nodes以防止一个node失败后服务中断。

### &emsp;分布式配置

1. zookeeper安装包解压后拷贝到目标目录下并重新名为zk01，再复制zk01形成zk02、zk03。
2. 进入zk01、zk02、zk03分别新建文件夹log和data。
3. 分别进入zk01-zk03各自的conf文件夹，复制zoo.cfg配置文件。
4. 编辑zoo.cfg，配置log和data地址
5. 在各自mydata 下面创建myid的文件，在里面写入server的数字。
6. 分别启动三个服务器。
7. zkCi连接Server。带参数指定-server+地址。

<!-- MS通讯端口|服务编口|Jetty控制台端口
:--------:|:------:|:-------------:
62626|61616|8161
62627|61617|8162
62628|61618|8163 -->
