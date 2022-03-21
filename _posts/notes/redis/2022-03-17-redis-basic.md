---
layout: post
title:  "Redis安装配置"
date:   2022-03-17 15:56:22 +0800
categories: notes redis basic
tags: Redis 基础
excerpt: "Redis安装配置"
---

## 概念

技术分类：

+ 功能性：Java、JSP、Tomcat、HTML、Linux、JDBC、Git。
+ 扩展性：Spring、SpringMVC、SpringBoot、MyBatis。
+ 性能：NoSQL、Hadoop、Nginx、MQ。

### &emsp;集群发展

最开始发展时基本上只需要一台服务器就能提供服务，而到了后来因为请求增多，导致需要多台服务器共同服务。

从而让应用服务器有CPU与内存压力，让数据库服务器有IO压力。NoSQL可以解决这些问题：

#### &emsp;&emsp;CPU与内存压力

由于需要让每个服务器都有均衡的访问压力，从而避免压力过于集中或分散，所以就需要负载均衡，从而需要一个反向代理Nginx。

当用户对服务器进行访问时Nginx会将其分发到可用的服务器，然后服务器给用户提供一个Session，而第二次访问可能会到其他服务器，那么此时往往会在另一个服务器创建一个新的Session，那么原来服务器的Session就丢失了，如何处理这个问题？

1. 存储到客户端Cookie，安全性低。
2. Session复制到所有服务器，数据冗余。
3. 存放到文件服务器或数据库中，IO问题。
4. Session集中存放到NoSQL数据库中，直接放到内存中。
5. 使用Token验证和校验权限。

#### &emsp;&emsp;IO压力

当数据库内数据大量增加时，为了降低IO压力，往往采用：

垂直切分：根据表中数据的逻辑关系，将同一个表中的数据按照某种条件拆分到多台数据库（主机）上。

我们可将本来可以在同一个表中的内容人为地划分为多个表。所谓“本来”，是指按照关系型数据库第三范式的要求，应该在同一个表中，将其拆分开就叫作反范化（Denormalize）。

将动态数据和静态数据分离就是动静分离，例如，对配置表的某些字段很少进行修改时，将其放到一个查询性能较高的数据库硬件上；对配置表的其他字段更新频繁时，则将其放到另一个更新性能较高的数据库硬件上。

我们把冷热数据分开存放，就叫作冷热分离，在MySQL的数据库中，冷数据查询较多，更新较少，适合用MyISAM引擎，而热数据更新比较频繁，适合使用InnoDB存储引擎，这也是垂直拆分的一种。

垂直切分的优点如下：

+ 拆分后业务清晰，拆分规则明确。
+ 系统之间进行整合或扩展很容易。
+ 按照成本、应用的等级、应用的类型等奖表放到不同的机器上，便于管理。
+ 便于实现动静分离、冷热分离的数据库表的设计模式。
+ 数据维护简单。

垂直切分的缺点如下：

+ 部分业务表无法关联，只能通过接口方式解决，提高了系统的复杂度。
+ 受每种业务的不同限制，存在单库性能瓶颈，不易进行数据扩展和提升性能。
+ 事务处理复杂。

水平切分：把单一的表的数据拆分成多个表，并分散到不同的数据库（主机）上。与垂直切分对比，水平切分不是将表进行分类，而是将其按照某个字段的某种规则分散到多个库中，在每个表中包含一部分数据，所有表加起来就是全量的数据。

水平切分的优点如下：

+ 单库单表的数据保持在一定的量级，有助于性能的提高。
+ 切分的表的结构相同，应用层改造较少，只需要增加路由规则即可。
+ 提高了系统的稳定性和负载能力。

水平切分的缺点如下：

+ 切分后，数据是分散的，很难利用数据库的Join操作，跨库Join性能较差。
+ 拆分规则难以抽象。
+ 分片事务的一致性难以解决。
+ 数据扩容的难度和维护量极大。

读写分离，基本的原理是让主数据库处理事务性增、改、删操作（INSERT、UPDATE、DELETE），而从数据库处理SELECT查询操作。数据库复制被用来把事务性操作导致的变更同步到集群中的从数据库。

读写分离的实现方式：基于程序代码内部实现、基于中间代理层实现。

但是这三种处理方式会破坏业务逻辑。

可以建立一个NoSQL的缓存数据库，减少IO的读操作。

### &emsp;NoSQL定义

NoSQL指Not Only SQL，泛指非关系型数据库。不依赖业务逻辑方式存储，而是以key-value模式存储。

+ 不遵循SQL标准。
+ 不支持ACID即数据库的四个特性（原子性、一致性、隔离性、持续性）。
+ 远超SQL的性能。

#### &emsp;&emsp;键值数据库

+ 相关产品：Redis、Riak、SimpleDB、Chordless、Scalaris、Memcached。
+ 应用：内容缓存。
+ 优点：扩展性好、灵活性好、大量写操作时性能高。
+ 缺点：无法存储结构化信息、条件查询效率较低。
+ 使用者：百度云（Redis）、GitHub（Riak）、BestBuy（Riak）、Twitter（Ridis和Memcached）。

#### &emsp;&emsp;列族数据库

+ 相关产品：BigTable、HBase、Cassandra、HadoopDB、GreenPlum、PNUTS。
+ 应用：分布式数据存储与管理。
+ 优点：查找速度快、可扩展性强、容易进行分布式扩展、复杂性低。
+ 使用者：Ebay（Cassandra）、Instagram（Cassandra）、NASA（Cassandra）、Facebook（HBase）。

#### &emsp;&emsp;文档数据库

+ 相关产品：MongoDB、CouchDB、ThruDB、CloudKit、Perservere、Jackrabbit。
+ 应用：存储、索引并管理面向文档的数据或者类似的半结构化数据。
+ 优点：性能好、灵活性高、复杂性低、数据结构灵活。
+ 缺点：缺乏统一的查询语言。
+ 使用者：百度云数据库（MongoDB）、SAP（MongoDB）。

#### &emsp;&emsp;图形数据库

+ 相关产品：Neo4J、OrientDB、InfoGrid、GraphDB。
+ 应用：大量复杂、互连接、低结构化的图结构场合，如社交网络、推荐系统等。
+ 优点：灵活性高、支持复杂的图形算法、可用于构建复杂的关系图谱。
+ 缺点：复杂性高、只能支持一定的数据规模。

### &emsp;Redis场景

适应场景：

+ 高并发读写。
+ 海量读写。
+ 高扩展性。

不适应场景：

+ 事务支持。
+ 结构化存储，复杂数据关系，需要即席查询（Ad hoc，由用户自定义查询条件）。

### &emsp;Redis相关介绍

Redis的端口号为6379，来源于Alessia Merz的Merz的九宫格打字法的字母数字。

默认16个数据库，下标从0开始，默认使用0号库。所有库使用统一用户密码。

不同于SQL使用的多线程+锁的技术，Redis使用单线程+多路IO复用技术。Redis就是类似于买票的黄牛的作用。

&emsp;

## 安装启动

### &emsp;Windows版本

Redis没有Windows版本，因为Redis是单线程高性能的。所以Redis需要单线程轮询。Windows操作系统机制的轮询是不太一样的。简而言之Linxu轮询用epoll，WindowS用selector但是性能上来说epoll是高于selector的。 所以Redis推荐使用Linux版本。

Github有相关非官方的Windwos版本<https://github.com/tporadowski/redis/releases>。

以及一个个人编译官网的版本<https://www.renren.io/detail/14294>。

### &emsp;Linux版本

选择[Redis官网](https://redis.io/)，然后点击Download it就可以下载。

1. 将安装包放到/opt目录。
2. 解压安装包：`tar -zxvf xxx`。
3. 解压后进入目录。
4. 目录下执行make命令即进行编译成C文件。如果没有安装C语言环境会报错，可以使用gcc。（如果编译失败可以执行`make distclean`清除编译再`make`）
5. 执行`make install`进行安装。默认会安装到/usr/local/bin。

如果使用Ubuntu直接`apt install redis`。

### &emsp;Docker安装

使用Docker容器，在里面就可以安装Redis。

### &emsp;Redis安装内容

查看安装目录：

+ redis-benchmark：性能测试工具，可以在自己本子运行，查看性能。
+ redis-check-aof：修复有问题的AOF文件，rdb和aof后面会说明。
+ redis-check-dump：修复有问题的dump.rdb文件,
+ redis-sentinel：Redis集群使用。
+ redis-server：Redis服务器启动命令。
+ redis-cli：客户端，操作入口。

### &emsp;Windows启动Redis

如果是Windows操作系统，启动方式比较简单，基本上默认配置是开机自启。

可以使用`redis-server --service-install redis.windows.conf`或`redis-server --service-start`来启动。

### &emsp;Linux启动Redis

#### &emsp;前台启动

即我们自己通过命令行`redis-server`启动Redis服务，但是此时这个控制台不能关闭，否则Redis也会被关闭，不推荐使用。

#### &emsp;后台启动

进行opt下的redis安装目录，看到redis.conf这个Redis配置文件。

一种方式是直接修改这个配置文件，打开这个配置文件，找到daemonize配置项（大概为128行左右），默认为no即不支持后台启动，改为yes支持后台启动。其他配置内容不要修改，否则会启动不了。然后到Redis安装目录的bin目录下`redis-server`启动。

另一种方式是不修改原生配置文件，使用`cp redis.conf /etc/redis.conf`将配置文件复制到etc目录下，然后修改内容。然后到Redis安装目录的bin目录下`redis-server /etc/redis.conf`使用别的地方的配置文件进行启动。

### &emsp;Redis客户端

即Redis-Cli，如果启动了Redis Server，执行`redis-cli`就能启动Redis客户端。如果要在不同的端口启动多个不同的Redis客户端，就要使用`redis-cli -p 端口号`。

如果是单个实例，直接使用`redis-cli shutdown`关闭这个Redis客户端，也可以进行`redis-cli`进入终端后调用`shutdown`关闭。如果是多个实例，需要指定端口进行关闭`redis-cli -p 端口号 shutdown`。

&emsp;

## 关闭

### &emsp;Windows关闭Redis

可以使用进程管理关闭，也可以调用`redis-server --service-stop`关闭。

&emsp;

## 配置

### &emsp;redis.conf文件

打开Redis安装目录下的redis.conf文件（或者是redis.windows.conf），这是Redis的配置文件：

```conf
# Redis配置文件示例

# 单位注释：当需要内存大小时，可以指定
# 它通常采用1k 5GB 4M等形式
# 只支持字节，不支持比特
#
# 1k => 1000 bytes
# 1kb => 1024 bytes
# 1m => 1000000 bytes
# 1mb => 1024*1024 bytes
# 1g => 1000000000 bytes
# 1gb => 1024*1024*1024 bytes
#
# 大小写不敏感，单元不区分大小写，所以1GB/1gB都是一样的

################################## INCLUDES ###################################

# 在此处包括一个或多个其他配置文件。如果你有一个适用于所有Redis服务器的标准模板可以使用这个，但也需要自定义每台服务器的一些设置。
# 包含文件可以包括其他文件，所以明智地使用它。
# 注意，来自管理员或Redis Sentinel的命令“CONFIG REWRITE”不会重写选项“include”，因为Redis总是使用最后处理的
# 行作为配置指令的值，您最好输入includes以避免在运行时覆盖配置更改。
# 如果您对使用includes覆盖配置选项感兴趣，最好使用include作为最后一行。
#
# include .\path\to\local.conf
# include c:\path\to\other.conf

################################## MODULES #####################################

# 在启动时加载模块。如果服务器无法加载模块，它将中止。可以使用多个loadmodule指令。
#
# loadmodule .\path\to\my_module.dll
# loadmodule c:\path\to\other_module.dll

################################## NETWORK #####################################

# 默认情况下，如果未指定“绑定”配置指令，Redis将侦听服务器上所有可用网络接口的连接。可以使用“bind”配置指令，后跟一个或多个IP地址，只监听一个或多个选定接口。
#
# 默认情况bind=127.0.0.1只能接受本机的访问请求
# 不写的情况下，无限制接受任何ip地址的访问
# 生产环境肯定要写你应用服务器的地址，服务器是需要远程访问的，所以需要将其注释掉
# 如果开启了protected-mode，那么在没有设定bind ip且没有设密码的情况下，Redis只允许接受本机的响应·
bind 127.0.0.1

# 开启保护模式，只能本机访问，如果要支持远程访问需要把它改为no
protected-mode yes

# 默认运行端口号
port 6379

# 设置TCP的backlog，backlog其实是一个连接队列，backlog队列总和=未完成三次握手队列＋已经完成三次握手队列。
# 在高并发环境下你需要一个高backlog值来避免慢客户端连接问题。
# 注意Linux内核会将这个值减小到/proc/sys/net/core/somaxconn的值（128），所以需要确认增大/proc/sys/net/core/somaxconn和/proc/sys/net/ipv4/tcp_max_syn_backlog（128）两个值来达到想要的效果
tcp-backlog 511

# 以秒为单位设置超时时间，如果为0表示永不超时
timeout 0

# TCP长链接保持时间，默认每300秒检查一次Redis是否操作，如果没有操作就关闭连接
# 如果并发量较大建议缩小该值
tcp-keepalive 300

################################# GENERAL #####################################

# 是否支持后台启动
# 当前Windows不支持
# daemonize yes

# Redis是否被监督
# 当前Windows不支持
# supervised no

# 每一个实例都会产生一个不同的pid文件，指定pid存放位置
# 当前Windows不支持
# pidfile /var/run/redis.pid

# 表示日志的级别：
# 调试debug：大量信息，对开发/测试有用
# 冗长verbose：许多信息很少有用，但不像调试级别那样混乱
# 注意notice：适度冗长，你可能想要在生产中得到什么
# 警告waring：只记录非常重要/关键的消息
loglevel notice

# 日志文件输出路径
logfile ""

# 启用Windows事件日志的日志记录，如果使用Windows进行Redis服务则自动开启
# syslog-enabled no

# 指定Redis在Windows应用程序日志中指定事件的源名称
# syslog-ident redis

# 指定系统日志工具。必须是USER或介于LOCAL0-LOCAL7之间
# 当前Windows不支持
# syslog-facility local0

# 设置数据库的数量。Redis默认16个数据库
# 默认数据库是DB0，您可以使用select<dbid>在每个连接上选择一个不同的数据库
# 其中dbid是介于0和“databases-1”之间的数字
databases 16

# 通常只有在交互式会话中才会显示徽标
# 如果设置yes会始终显示图标
always-show-logo yes

################################ SNAPSHOTTING  ################################

# ...

################################## SECURITY ###################################

# 设置是否需要密码登录
# requirepass foobared

################################### CLIENTS ####################################

# 设置最大客户端连接数
# 如果达到了此限制，Redis会拒绝新的连接请求，并返回max number of clients reached
# maxclients 10000

############################## MEMORY MANAGEMENT ################################

# 设置最大内存容量，当达到上限时Redis会试图移除数据，规则参照maxmemory-policy
# maxmemory <bytes>

# 设置移除规则：
# volatile-lru：使用LRU算法移除key，只对设置了过期时间的键（最近最少使用)
# alkeys-lru：在所有集合key中，使用LRU算法移除key
# volatile-random：在过期集合中移除随机的key，只对设置了过期时间的键
# alkeys-random：在所有集合key中，移除随机的key
# volatile-ttl：移除那些TTL值最小的key，即那些最近要过期的key
# noeviction：不进行移除。针对写操作，只是返回错误信息
# maxmemory-policy noeviction

# 设置样本数量，一般3-7
# maxmemory-samples 5

# ...
```

&emsp;

## 发布与订阅

### &emsp;概念

即publish和subscribe，是一种消息通信模式，发送者pub发送信息，订阅者sub接收信息。发送信息和接收信息通过频道及沟通。

消息的发送者（称为发布者）不会将消息直接发送给特定的接收者（称为订阅者）。而是将发布的消息分为不同的类别，无需了解哪些订阅者（如果有的话）可能存在。同样的，订阅者可以表达对一个或多个类别的兴趣，只接收感兴趣的消息，无需了解哪些发布者（如果有的话）存在。

### &emsp;Redis实现

1. 首先打开一个控制台A，输入`redis-cli`进入客户端A。
2. 调用`subscribe 频道名1 ...`让这个客户端A订阅这个频道。控制台A会返回三行信息：第一行是subscribe表示对频道进行订阅，第二行是频道名，第三行是(integer) 1，表示订阅的频道的数量。此时控制台A就不能输入其他数据，只能等待发布者发布的频道信息了。
3. 打开另一个控制台B，输入`redis-cli`进入客户端B。
4. 调用`publish 频道名 发布内容`让客户端B发布内容到对应频道。控制台B会返回一行信息(integer) 1，表示订阅者数量。
5. 客户端A收到频道信息。返回三行信息：第一行是message表示收到频道信息，第二行是频道名，第三行是收到的发布内容。
