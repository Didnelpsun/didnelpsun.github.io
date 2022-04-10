---
layout: post
title:  "RocketMQ工作原理"
date:   2022-04-10 19:03:46 +0800
categories: notes mq rocketmq
tags: MQ RocketMQ 工作原理
excerpt: "RocketMQ工作原理"
---

## 消息生产

### &emsp;传送过程过程

即将消息写入到某Broker的某Queue中：

1. Producer发送消息之前，会先向NameServer发出获取消息Topic的路由信息的请求。
2. NameServer返回该Topic的路由表（实际上是一个Map，key为Topic字符串，value为这个Broker中该Topic的所有QueueName组成QueueDataQueueData实例列表）及Broker列表（也是一个Map，Key为BrokerName，value为该BrokerName名称相同的所有主从集群所组成的BrokerData实例）。
3. Producer根据代码中指定的Queue选择策略，从Quete列表中选出一个队列，用于后续存储消息Produer对消息做一些特殊处理，例如，消息本身超过4M，则会对其进行压缩。
4. Producer向选择出的Queue所在的Broker发出RPC请求，将消息发送到选择出的Queue。

### &emsp;队列选择算法

对于无序消息，其Queue选择算法，也称为消息投递算法，常见的有两种：

+ 轮询算法：默认选择算法。该算法保证了每个Queue中可以均匀的获取到消息。
+ 最小投递延迟算法：该算法会统计每次消息投递的时间延迟，然后根据统计出的结果将消息投递到时间延迟最小的Queue。如果延迟相同，则采用轮询算法投递。

&emsp;

## 消息存储

RocketMQ中的消息存储在本地文件系统中，这些相关文件默认在当前用户主目录下的store目录中，如C:\Users\Didnelpsun\store：

+ abort文件：该文件在Broker启动后会自动创建，正常关闭Broker，该文件会自动消失。若在没有启动Broker的情况下，发现这个文件是存在的，则说明之前Broker的关闭是非正常关闭。
+ checkpoint文件：其中存储着commitlog、consumequeue.index文件的最后刷盘时间戳。
+ commitlog文件夹：其中存放着commitlog文件，而消息是写在commitlog文件中的。
+ config文件夹：存放着Broker运行期间的一些配置数据。
+ consumequeue文件夹：其中存放着consumequeue文件，队列就存放在这个目录中。
+ index文件夹：其中存放着消息索引文件indexFile。
+ lock文件：运行期间所使用到的全局资源。

### &emsp;commitlog文件夹

#### &emsp;&emsp;commitlog文件目录

commitlog目录中存放着很多的mappedFile（或简称为commitlog文件）文件，当前Broker中的所有消息都是落盘到这些mappedFile文件中的。mappedFile文件大小为1G，文件名由20位十进制数构成，表示当前文件的第一条消息的起始位移偏移量。

需要注意的是，一个Broker中仅包含一个commitlog目录，所有的mappedFile文件都是存放在该目录中的。即无论当前Broker中存放着多少Topic的消息，这些消息都是被顺序写入到了mappedFile文件中的。也就是说，这些消息在Broker中存放时并没有被按照Topic进行分类存放。

由于mappedFile文件是顺序读写的文件，所以其访问效率很高。

#### &emsp;&emsp;消息单元

mappedFile文件内容由-一个个的消息单元构成。每个消息单元中包含消息总长度MsgLen、消息的物理位置physicalOffset、消息本内容Body、消息体长度BodyLength. 消息主题Topic、Topic长度TopicLength、消息生产者BornHost、 消息发送时间戳BornTimestamp、消息所在的队列QueueId、消息在Queue中存储的偏移量QueueOffset等近20余项消息相关属性。

### &emsp;consumequeue文件夹

#### &emsp;&emsp;consumequeue文件目录

使用/topic/queue/file三层组织结构。topic目录的目录名为topic名称，queue目录的目录名为queueId，每个queue目录存放consumequeue文件，它是commitlog文件的索引文件，可以根据它来定位到具体的消息。

consumequeue文件名也由20位数字构成，表示当前文件的第一个索引条目的起始位移偏移量。与
mappedFile文件名不同的是，其后续文件名是固定的。因为consumequeue文件大小是固定不变的。

#### &emsp;&emsp;索引条目

每个consumequeue文件可以包含30w个索引条目，每个索引条目包含了三个消息重要属性：消息在mappedFile文件中的偏移量CommitLog Offset（8字节）、消息长度（4字节）、消息的tag的hashcode值（8字节）。 这三个属性占20个字节，所以每个文件的大小是固定的30W*20字节。
