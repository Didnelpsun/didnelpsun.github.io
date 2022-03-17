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

Redis使用单线程+多路IO复用技术。Redis就是类似于买票的黄牛的作用。

## 安装配置

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

### &emsp;启动Redis

如果是Windows操作系统，启动方式比较简单，基本上默认配置是开机自启，所以这里介绍Linux如何启动。

#### &emsp;前台启动

即我们自己通过命令行`redis-server`启动Redis服务，但是此时这个控制台不能关闭，否则Redis也会被关闭，不推荐使用。

#### &emsp;后台启动

进行opt下的redis安装目录，看到redis.conf这个Redis配置文件。

一种方式是直接修改这个配置文件，打开这个配置文件，找到daemonize配置项（大概为128行左右），默认为no即不支持后台启动，改为yes支持后台启动。其他配置内容不要修改，否则会启动不了。然后到Redis安装目录的bin目录下`redis-server`启动。

另一种方式是不修改原生配置文件，使用`cp redis.conf /etc/redis.conf`将配置文件复制到etc目录下，然后修改内容。然后到Redis安装目录的bin目录下`redis-server /etc/redis.conf`使用别的地方的配置文件进行启动。

### &emsp;Redis客户端

即Redis-Cli，如果启动了Redis Server，执行`redis-cli`就能启动Redis客户端。如果要在不同的端口启动多个不同的Redis客户端，就要使用`redis-cli -p 端口号`。

如果是单个实例，直接使用`redis-cli shutdown`关闭这个Redis客户端，也可以进行`redis-cli`进入终端后调用`shutdown`关闭。如果是多个实例，需要指定端口进行关闭`redis-cli -p 端口号 shutdown`。
