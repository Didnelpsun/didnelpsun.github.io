---
layout: post
title:  "连接池与事务控制"
date:   2022-01-30 00:13:52 +0800
categories: notes mybatis base
tags: MyBatis 基础 连接池 事务控制
excerpt: "连接池使用与事务控制分析"
---

## 连接池

实际使用基本上都是使用连接池，即减少时间开支也避免重复的启动与释放操作。

连接池里面包括多个连接。连接池负责对连接的维护。其实就是一个集合对象，且必须是线程安全的，必须实现队列的特性，先进先出。

使用[案例一代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo1_build_xml)。

### 连接池分类

MyBaits连接池提供了三种方式的配置。

配置的位置是主配置文件SqlMapConfig.xml中的dataSource标签，其中type属性就是连接池的方式：

+ POOLED：传统javax.sql.DataSource规范，有针对规范的实现PooledDataSource类。
+ UNPOOLED：传统获取连接的方式，虽然UnpooledDataSource类也实现了java.sql.DataSource接口，但是没有使用池的思想，每次使用都重新生成。
+ JNDI：服务器提供的JNDI技术实现来获取DataSource对象，不同的服务器所得到的对象是不同的。如果不是web或者maven的war工程是不能使用的。（一般使用tomcat服务器，采用的连接池就是dbcp连接池）

连接池分为两个，一个是空闲池，另外一个是活动池。当一个线程进来会先进入空闲池获取连接，如果空闲池没有连接，而是会到活动池查看池中的连接数量，若数量没有到达活动池最大容量就新建一个连接进行使用，若数量到最大容量则找到最先进来的连接进行初始化返回使用（抢占式）。

&emsp;

## JNDI

是SUN公司提供的一种标准的Java命名系统接口，JNDI提供统一的客户端API，通过不同的访问提供者接口JNDI服务供应接口（SPI）的实现，由管理者将JNDI API映射为特定的命名服务和目录系统，使得Java应用程序可以和这些命名服务和目录服务之间进行交互。

利用Tomcat模拟Windows的注册表。

[JNDI参考](https://www.cnblogs.com/xdp-gacl/p/3951952.html)。

&emsp;

## 事务控制

注意事务的四个问题：

1. 什么是事务。
2. 事务的四大特性ACID。
3. 不考虑隔离性会产生的三个问题。
4. 解决办法：四种隔离级别。

MyBatis通过sqlSession对象的commit方法来提交事务（CUD事务），并通过rollback来回滚事务。

### 提交

之前我们提交事务需要使用`session.commit()`方法，但是实际上可以提供了`factory.openSession(true)`这个方法来自动进行事务提交从而不用每次写提交方法。

但是这种只能是一个方法只进行一次数据库交互的时候来使用，如果一个方法有多次数据库交互则不能自动提交事务，否则很难控制事务。
