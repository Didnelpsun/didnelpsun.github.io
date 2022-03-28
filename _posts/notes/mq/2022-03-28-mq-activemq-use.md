---
layout: post
title:  "ActiveMQ安装使用"
date:   2022-03-28 17:13:13 +0800
categories: notes mq activemq
tags: MQ ActiveMQ
excerpt: "ActiveMQ安装使用"
---

首先访问[ActiveMQ官网](https://activemq.apache.org/)，ActiveMQ为Java编写的消息队列服务器。

## 安装配置

一共有两个版本，一个是[经典版本](https://activemq.apache.org/components/classic/download/)一个是[Artemis版本](https://activemq.apache.org/components/artemis/download/)。

### &emsp;Windows安装配置

解压zip压缩包到安装目录。然后在/bin/win64下启动activemq.bat就可以了，ActiveMQ会启动在<http://127.0.0.1:8161>启动。初次登录需要账户密码，初始用户名和密码都为admin。

如果关闭控制台就会关闭。

如果想通过命令行直接启动可以将这个路径配置到环境变量path中。

如果想修改密码可以到conf/jetty-realm.properties中配置。

如果想配置运行端口可以到conf/jetty.xml中配置。

ActiveMQ的后端接口是61616。

### &emsp;Linux安装配置

使用`mv`将安装包移动到指定目录，然后使用`tar -zxvf 安装包名`对安装包解压。

然后`cd ./bin`，然后使用`./activemq start`启动。

使用`ps -ef|grep activemq|grep -v grep`查看是否启动。

使用`./activemq restart`进行重启，`./activemq stop`进行关闭。

使用`./activemq start > 地址`可以将启动时的日志保存到这个地址中。

&emsp;

## Java实现

### &emsp;配置

首先使用IDEA新建Maven工程，命名为activemq_java，然后引入依赖：

```xml
<!-- https://mvnrepository.com/artifact/org.apache.activemq/activemq-all -->
<dependency>
    <groupId>org.apache.activemq</groupId>
    <artifactId>activemq-all</artifactId>
    <version>5.17.0</version>
</dependency>
<!-- https://mvnrepository.com/artifact/org.apache.xbean/xbean-spring -->
<dependency>
    <groupId>org.apache.xbean</groupId>
    <artifactId>xbean-spring</artifactId>
    <version>4.20</version>
</dependency>
```

### &emsp;MQ标准

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

```
