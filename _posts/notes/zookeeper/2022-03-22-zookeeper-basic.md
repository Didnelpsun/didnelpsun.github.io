---
layout: post
title: "基础"
date: 2022-03-23 14:46:27 +0800
categories: notes zookeeper base
tags: ZooKeeper 基础
excerpt: "基础"
---

是一个开源分布式提供协商服务的项目。

## 基础知识

### &emsp;工作机制

ZooKeeper从设计模式角度来理解∶是一个基于观察者模式设计的分布式服务管理框架，它负责存储和管理大家都关心的教据，然后接受观察者的注册，一旦这些数据的状态发生变化，ZooKeeper就将负责通知已经在ZooKeeper上主册的那些观察者做出目应的反应。

### &emsp;运行特点

+ 包含一个领导者Leader和多个跟随着Follower组成的集群，只要有半数以上的节点存活，集群就能正常服务。
+ 每个Server都保存一份相同的数据副本，无论Client连接到哪个Server数据都是一致的。
+ 更新请求顺序执行，来自同一个Client的更新请求按发送顺序依次执行。
+ 更新具有原子性。
+ 更新具有实时性。

### &emsp;数据结构

ZooKeeper数据模型的结构与Unix文件系统很类似，整体上可以看作是一棵树，每个节点称做一个ZNode。每一个ZNode默认能够存储1MB的数据，每个ZNode都可以通过其路径唯一标识。

### &emsp;应用场景

提供的服务包括：统一命名服务、统一配置管理、统一集群管理、服务器节点动态上下线、软负载均衡等。

+ 统一命名服务：在分布式环境下，经常需要对应用/服务进行统一命名，便于识别。例如IP不容易记住，而域名容易记住。
+ 统一配置管理：一般要求一个集群中，所有节点的配置信息是一致的，比如Kafka集群，对配置文件修改后，希望能够快速同步到各个节点上。配置管理可交由ZooKeeper实现，将配置信息写入ZooKeeper上的一个Znode，各个客户端服务器监听这个Znode，一旦Znode中的数据被修改，ZooKeeper将通知各个客户端服务器。
+ 统一集群管理：分布式环境中，实时掌握每个节点的状态是必要的，可根据节点实时状态做出一些调整。ZooKeeper可以实现实时监控节点状态变化，可将节点信息写入ZooKeeper上的一个ZNode，监听这个ZNode可获取它的实时状态变化。
+ 服务器节点动态上下线：客户端能实时洞察到服务器上下线的变化：
  1. 服务端启动时去注册信息（创建都是临时节点）。
  2. 获取到当前在线服务器列表，并且注册监听。
  3. 服务器节点下线。
  4. 服务器节点上下线事件通知。
  5. process重新再去获取服务器列表，并注册监听。
+ 软负载均衡：在ZooKeeper中记录每台服务器的访问数，让访问数最少的服务器去处理最新的客户端请求。
+ 分布式协调组件：如在负载均衡时会有多个冗余服务器，在对一个服务器内的数据进行修改时就需要ZooKeeper通知其他保存同样数据的冗余服务器一起修改这个内容，保证内容同步。
+ 无状态化：让业务逻辑不关系用户状态信息。如将多个业务分到不同的服务器上，正常来说每个服务器要提供服务首先要判断用户是否登录，使用ZooKeeper不用让每个服务器都关心用户状态问题，而交给一个统一的数据中心对用户状态进行管理，让业务服务器做到无状态化。

&emsp;

## 安装配置

登录[ZooKeeper官网](https://zookeeper.apache.org/)，然后选择tar.gz文件下载，对文件进行解压。ZooKeeper是Java编写的，所以需要先安装JDK。

### &emsp;Linux安装

对文件进行解压：`tar -zxvf 文件名 -C /opt/module`。

将安装目录的conf路径下的zoo_sample.cfg修改为zoo.cfg：`mv zoo_sample.cfg zoo.cfg`。

打开zoo.cfg，修改dataDir路径：`dataDir=安装目录/data`和dataLogDir路径：`dataLogDir=安装目录/log`。然后创建这个data和log文件夹`mkdir data`，`mkdir log`。

### &emsp;Windows安装

将安装目录的conf目录下的zoo_sample.cfg文件，复制一份，重命名为zoo.cfg。

安装目录下新建一个data文件夹和一个log文件夹。

修改zoo.cfg文件：

```cfg
dataDir=D:\\ZooKeeper\\apache-zookeeper-3.8.0-bin\\data
dataLogDir=D:\\ZooKeeper\\apache-zookeeper-3.8.0-bin\\log
```

### &emsp;配置文件

+ tickTime：心跳时间，ZooKeeper服务器与客户端心跳时间，单位为毫秒。用于心跳机制，并设置最小的Session超时时间为两倍心跳时间。
+ initLimit：初始通信限制时间，不是指时间而是指多少个心跳时间，具体时间为initLimit×tickTime。集群中的Follower服务器与Leader服务器之间的初始连接时能容忍的最大心跳数，如果超过就代表初始化连接失败。
+ syncLimit：同步限制时间，指多少个心跳时间。集群中的Follower服务器与Leader服务器之间的最大响应心跳数，如果超过九代表响应失败。
+ clientPort：客户端端口号。
+ dataDir：数据文件目录和数据持久化路径。
+ logDataDir：日志文件地址。
+ autopurge.snapRetainCount：保存的数据快照数，多余的会删除。
+ autopurge.purgeInterval：自动触发清除任务的事件间隔，单位为小时，默认为0，表示不自动清除。

&emsp;

## 操作

### &emsp;启动

Windows双击zkServer.cmd启动程序，控制台显示bind to port 0.0.0.0/0.0.0.0:2181，表示服务端启动成功。

如果ZooKeeper audit is disabled。

ZooKeeper新版本启动的过程中，ZooKeeper新增的审核日志是默认关闭，所以控制台输出ZooKeeper audit is enabled。需要修改zkServer.cmd在call %JAVA%后面添加"-Dzookeeper.audit.enable=true"。也可以在ZooKeeper的配置文件conf/zoo.cfg新增一行audit.enable=true即可。

此时倒数几行会打印- ZooKeeper audit is enabled。

如果怕麻烦可以直接将bin目录加入path环境变量：D:\ZooKeeper\apache-zookeeper-3.8.0-bin\bin，然后命令行直接输入zkServer。

如果是Linux则是`bin/zkServer/sh`。

### &emsp;其他操作

Linux和Windows操作一致。

+ 查看进程是否启动：`jps`。
+ 查看状态：Linux：`bin/zkServer.sh status`。
+ 启动客户端：Linux：`bin/zkCli.sh`；Windows：`zkCli`。
+ 退出客户端：`quit`。
+ 关闭ZooKeeper：Linux：`bin/zkServer.sh stop`；Windows：关闭控制台。
