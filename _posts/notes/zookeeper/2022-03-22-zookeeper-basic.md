---
layout: post
title: "基础原理"
date: 2022-03-23 14:46:27 +0800
categories: notes zookeeper base
tags: ZooKeeper 基础原理
excerpt: "基础原理"
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

修改zoo.cfg文件，注意Windows是两个斜杠：

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

Linux和Windows操作一致。但是Windows下的zkServer不能传参数。

+ 查看进程是否启动：`jps`。
+ 查看状态：Linux：`bin/zkServer.sh status`。
+ 启动客户端：Linux：`bin/zkCli.sh`；Windows：`zkCli`。
+ 退出客户端：`quit`。
+ 关闭ZooKeeper：Linux：`bin/zkServer.sh stop`；Windows：关闭控制台。

&emsp;

## 数据结构

ZooKeeper的数据保存在节点上，即znode，多个znode构成一个树型结构。ZooKeeper就是一个树。

ZooKeeper的节点引用通过路径模式。

### &emsp;路径结构

首先启动zkServer，打开zkCli。

随便输入什么就可以查看所有操作命令：

```txt
addWatch [-m mode] path # optional mode is one of [PERSISTENT, PERSISTENT_RECURSIVE] - default is PERSISTENT_RECURSIVE
addauth scheme auth
close
config [-c] [-w] [-s]
connect host:port
create [-s] [-e] [-c] [-t ttl] path [data] [acl]
delete [-v version] path
deleteall path [-b batch size]
delquota [-n|-b|-N|-B] path
get [-s] [-w] path
getAcl [-s] path
getAllChildrenNumber path
getEphemerals path
history
listquota path
ls [-s] [-w] [-R] path
printwatches on|off
quit
reconfig [-s] [-v version] [[-file path] | [-members serverID=host:port1:port2;port3[,...]*]] | [-add serverId=host:port1:port2;port3[,...]]* [-remove serverId[,...]*]
redo cmdno
removewatches path [-c|-d|-a] [-l]
set [-s] [-v version] path data
setAcl [-s] [-v version] [-R] path acl
setquota -n|-b|-N|-B val path
stat [-w] path
sync path
version
whoami
```

#### &emsp;&emsp;查看路径

我们可以通过`ls path`来查看对应路径下有什么节点。

如`ls /`就可以看到[zookeeper]，然后`ls /zookeeper`，就可以看到[config, quota]，然后查看发现两个都是空的，所以基础的ZooKeeper节点为：

```txt
   zookeeper
       |
   ---------
   |       |
config   quota
```

使用`ls -R 路径`可以递归查询路径下的所有节点。

&emsp;

## 节点

### &emsp;节点结构

包括四个部分：

+ data：保存数据。
+ acl：保存权限。定义了什么样的用户可以操作这个节点，且能够进行怎么样的操作。
+ stat：保存当前znode的状态元数据。
+ child：当前节点子节点。

#### &emsp;&emsp;节点权限

+ c：create创建权限，允许在该节点下创建子节点。
+ w: write更新权限，允许更新该节点的数据。
+ r: read读取权限，允许读取该节点的内容以及子节点的列表信息。
+ d: delete删除权限，允许删除该节点的子节点。
+ a: admin管理者权限，允许对该节点进行acl权限设置。

#### &emsp;&emsp;节点状态

使用`stat 路径`或`get -s 路径`可以获取节点状态信息：

+ czxid：创建节点的事务ZXID。
+ znode：被创建的毫秒数（从1970年开始）。
+ mzxid：znode最后更新的事务zxid。
+ mtime: znodc最后修改的毫秒致（从1970年开始）。
+ pZxid：znode最后更新的子节点zxid。
+ cversion：znode子节点变化号，znode子节点修改次数。
+ dataVersion: znode数据变化号。
+ aclVersion：znode访问控制列表的变化号。
+ ephemeralOwner：如果是临时节点，这个是znode拥有者的session id。如果不是临时节点则是0。
+ datalength：znode的数据长度。
+ numChildren：znode子节点数量。

### &emsp;节点类型

#### &emsp;&emsp;节点分类

+ 持久化目录节点（Persistent）：客户端和服务器端断开连接后，创建的节点不删除。
+ 持久化顺序编号目录节点（Persistent Sequential）：
  + 客户端和服务器端断开连接后，创建的节点不删除，并且ZooKeeper给该节点名称进行顺序编号。
  + ZooKeeper在创建znode时就会设置顺序标识，名称后面会附加一个值，顺序号是一个单调递增的计数器，由父结点维护。
  + 在分布式系统中，顺序号可以被用于为所有的事件进行全局排序，这样客户端可以通过顺序号推断事件的顺序。
+ 临时目录节点（Ephemeral）：客户端和服务器端断开连接后，创建的节点自己删除。
+ 临时顺序编号目录节点（Ephemeral Sequential）：客户端和服务器端断开连接后，创建的节点自动删除，然而ZooKeeper给该节点名称进行顺序编号。

使用`create [-s] [-e] 路径 数据`，其中-s为有序节点，-e为临时节点，如果不写-s/-e默认为创建持久化节点。

#### &emsp;&emsp;类型实现原理

对于持久节点：

1. Zookeeper客户端向Zookeeper服务端发送创建连接请求。
2. 连接生成后Zookeeper服务端返回session id。

对于临时节点：

1. Zookeeper客户端向Zookeeper服务端发送创建连接请求。
2. 连接生成后Zookeeper服务端返回session id。
3. 持续会话，Zookeeper客户端会不断续约session id的时间。
4. Zookeeper客户端将会话中断。
5. Zookeeper服务端在一段时间后会删除没有续约的session id所创建的临时节点。

#### &emsp;&emsp;临时节点应用

+ 临时节点：实现服务注册和发现。服务注册到注册中心中，对应创建的临时节点就在线，如果服务下线，则其临时节点也就消失了。
+ 临时序号节点：适用于临时的分布式锁。
+ Container节点（3.5.3新增）：容器节点，当容器中没有任何子节点后，该容器节点会被Zookeeper每隔60s自动删除。使用`create -c 路径`来创建。
+ TTL节点：指定节点的到期时间，到期后自动被删除。只能通过系统配置zookeeper.extendedTypesEnabled=true开启。

### &emsp;节点操作

#### &emsp;&emsp;添加节点

然后通过`create 路径`就可以创建节点。但是只能一层层的创建，如果其父路径不存在则创建失败。

如`create /test test`就可以存储数据test到一个新建的test节点中。

#### &emsp;&emsp;存储数据

使用`set 路径 值`就可以将对应值存入节点中。然后通过`get 路径`就可以获取数据。

#### &emsp;&emsp;删除节点

可以通过`delete 路径`来删除对应节点，但是这个路径必须是一个叶子节点，如果是非叶子节点，即其节点还有子节点就会删除失败：Arguments are not valid。

如果要删除非叶子节点就需要使用`deleteall 路径`。

#### &emsp;&emsp;乐观锁

通过版本号dataVersion属性对数据进行上锁。对数据的每一次更新操作都会让数据的dataVersion版本号加一。

如果在命令中添加`-v 版本号`表示对这个版本的数据进行操作，如果版本号与当前数据版本号不一致则执行失败。

#### &emsp;&emsp;权限设置

执行`addauth digest 用户名:密码`给当前会话添加权限用户。如`addauth digest Didnelpsun:1234`。

`操作 路径 数值 auth:用户名:密码:权限`来给数据添加权限。如`create /test test auth:Didnelpsun:1234:cdrwa`，即给/test路径的节点赋值为test，并给用户Didnelpsun添加对于这个节点的权限，包括cdrwa，即Didnelpsun对这个节点能创建、删除、读、写、授权。

&emsp;

## 数据持久化

Zookeeper的数据是运行在内存中，Zookeeper提供了两种数据持久化机制。

默认两种持久化机制都开启，通过两种形式的持久化，在恢复时先恢复快照文件中的数据到内存中，再用日志文件中的数据做增量恢复，这样的恢复速度更快。

### &emsp;事务日志

把执行的命令以日志形式保存在dataLogDir指定的路径的文件中，如果没有指定这个配置，那么按照dataDir指定的路径来保存。

保存文件以log为名字，为二进制文件打开乱码。

### &emsp;数据快照

Zookeeper会在一定的时间间隔内做一次内存数据的快照，把该时刻的内存数据保存在快照文件中。

保存文件以snapshot为名字，为二进制文件打开乱码。
