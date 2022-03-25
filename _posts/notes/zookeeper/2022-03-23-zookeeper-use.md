---
layout: post
title: "基本使用"
date: 2022-03-23 16:46:51 +0800
categories: notes zookeeper base
tags: ZooKeeper 基础 原理
excerpt: "基本使用"
---

## Curator客户端

ZooKeeper的原生客户端为zkCli，Java可以使用[Curator](https://curator.apache.org/)客户端框架。

首先利用Spring Initializr新建一个SpringBoot项目，名称为curator，组和软件包名为为org.didnelpsun，Java选择17。依赖项选择Lombok、Spring Configuration Processor、Spring Web。

### &emsp;引入依赖

首先引入ZooKeeper，然后引入Curator：

```xml
<!-- https://mvnrepository.com/artifact/org.apache.zookeeper/zookeeper -->
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.8.0</version>
</dependency>
<!-- https://mvnrepository.com/artifact/org.apache.curator/curator-framework -->
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>5.2.1</version>
</dependency>
```

### &emsp;基本配置

修改application.properties：

```properties
# 重试连接次数
curator.retryCount=5
# 超时时间，单位为毫秒
curator.elapsedTimeMs=5000
# 连接字符串
curator.connectString=127.0.0.1:2181
# Session超时时间
curator.sessionTimeoutMs=60000
# 连接超时时间
curator.connectionTimeoutMs=5000
```

然后新建config包并新建一个配置文件CuratorConfig：

```java
// CuratorConfig.java
package org.didnelpsun.config;

import lombok.Data;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.retry.RetryNTimes;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Data
@ConfigurationProperties(prefix = "curator")
@Configuration
public class CuratorConfig{
    private int retryCount;
    private int elapsedTimeMs;
    private String connectString;
    private int sessionTimeoutMs;
    private int connectionTimeoutMs;

    @Bean(initMethod="start")
    public CuratorFramework curatorFramework() {
        return CuratorFrameworkFactory.newClient(connectString, sessionTimeoutMs, connectionTimeoutMs, new RetryNTimes(retryCount, elapsedTimeMs));
    }
}
```

### &emsp;编写测试

对test文件夹下的测试文件进行修改：

```java
// CuratorApplicationTests.java
package org.didnelpsun;

import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.CreateMode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.nio.charset.StandardCharsets;

@SpringBootTest
class CuratorApplicationTests {
    private CuratorFramework curatorFramework;
    @Autowired
    public void setCuratorFramework(CuratorFramework curatorFramework) {
        this.curatorFramework = curatorFramework;
    }
    @Test
    // 创建新节点
    public void createNode() throws Exception{
        // 添加持久节点，默认为持久节点
        String path = curatorFramework.create().forPath("/test");
        // 设置数据
        curatorFramework.setData().forPath("/test", "test".getBytes(StandardCharsets.UTF_8));
        // 添加持久序号节点
        // withMode表示这个节点的类型
        String path2 = curatorFramework.create().withMode(CreateMode.PERSISTENT_SEQUENTIAL).forPath("/test/ps", "ps".getBytes(StandardCharsets.UTF_8));
        // 添加临时序号节点
        String path3 = curatorFramework.create().withMode(CreateMode.EPHEMERAL_SEQUENTIAL).forPath("/test/es", "es".getBytes(StandardCharsets.UTF_8));
        System.out.printf("Curator创建持久节点%s成功",path);
        System.out.printf("Curator创建持久序号节点%s成功",path2);
        System.out.printf("Curator创建临时序号节点%s成功",path3);
        // 获取某个节点的所有子节点
        System.out.println(curatorFramework.getChildren().forPath("/"));
    }
    @Test
    // 获取节点数据
    public void getData() throws Exception{
        byte[] bytes = curatorFramework.getData().forPath("/test/ps");
        System.out.println(new String(bytes));
    }
    @Test
    // 创建父结点
    public void createWithParent() throws Exception{
        // 检查某节点是否存在
        // 返回值为Stat类型，如果不存在就返回null
        if(curatorFramework.checkExists().forPath("/test")!=null){
            String path = curatorFramework.create().creatingParentsIfNeeded().forPath("/test/parent/child");
            System.out.printf("Curator创建节%s成功", path);
        }
    }
    @Test
    // 删除节点
    public void deleteNode() throws Exception{
        // guaranteed表示如果服务端可能删除成功，但是client没有接收到删除成功的提示，Curator将会在后台持续尝试删除该节点
        // deletingChildrenIfNeeded表示如果存在子节点就一起删除
        curatorFramework.delete().guaranteed().deletingChildrenIfNeeded().forPath("/test/parent");
    }
}
```

&emsp;

## 分布式锁

### &emsp;锁的种类

+ 读锁：大家都可以读，要想上读锁的前提是之前的锁没有写锁。
+ 写锁：只有得到写锁的才能写。要想上写锁的前提是，之前没有任何锁。

Zookeeper对读写锁进行统一管理。

### &emsp;读锁

+ 创建一个临时序号节点，节点的数据是read，表示是读锁。
+ 获取当前Zookeeper中序号比自己小的所有节点。
+ 判断最小节点是否是读锁：
  + 如果不是读锁的话，则上锁失败，为最小节点设置监听。阻塞等待，Zookeeper的watch机制会当最小节点发生变化时通知当前节点，于是再执行第二步的流程。
  + 如果是读锁的话，则上锁成功。

### &emsp;写锁

+ 创建一个临时序号节点，节点的数据是write，表示是。
+ 写锁获取Zookeeper中所有的子节点。
+ 判断自己是否是最小的节点：
  + 如果是，则上写锁成功。
  + 如果不是，说明前面还有锁，则上锁失败，监听最小的节点，如果最小节点有变化，则回到第二步。

### &emsp;羊群效应

通过上锁方式，往往多个需要上锁的节点都会监听一个节点的状态，只要节点发生变化，就会触发其他节点的监听事件，多个节点共同争抢上锁，对于Zookeeper的压力增大。

可以使用链式监听来解决这个问题，让每一个节点都只监听顺序的上一个节点。

### &emsp;Curator实现读写锁

在测试文件中添加，调用一次getReadLock就能产生一个读锁，getWriteLock就能产生一个写锁。如果调用getReadLock，再换一个控制台调用getWriteLock会被阻塞，一直打印等待获取写锁，同理相反会一直打印等待获取读锁：

```java
@Test
// 获取读锁
public void getReadLock() throws Exception{
    // 读写锁，指明创建读写锁的路径
    InterProcessReadWriteLock interProcessReadWriteLock = new InterProcessReadWriteLock(curatorFramework, "/lock");
    // 获取读锁对象
    InterProcessLock interProcessLock = interProcessReadWriteLock.readLock();
    System.out.println("等待获取读锁");
    // 获取读锁
    // 是尝试获取锁，如果没有拿到就会一直阻塞在这里
    interProcessLock.acquire();
    for(int i=0;i<10;i++){
        Thread.sleep(3000);
        System.out.println(i);
    }
    // 释放锁
    interProcessLock.release();
    System.out.println("等待释放锁");
}
@Test
// 获取写锁
public void getWriteLock() throws Exception{
    // 读写锁，指明创建读写锁的路径
    InterProcessReadWriteLock interProcessReadWriteLock = new InterProcessReadWriteLock(curatorFramework, "/lock");
    // 获取写锁对象
    InterProcessLock interProcessLock = interProcessReadWriteLock.writeLock();
    System.out.println("等待获取写锁");
    // 获取写锁
    interProcessLock.acquire();
    for(int i=0;i<10;i++){
        Thread.sleep(3000);
        System.out.println(i);
    }
    // 释放锁
    interProcessLock.release();
    System.out.println("等待释放锁");
}
```

&emsp;

## Watch机制

我们可以把Watch理解成是注册在特定Znode上的触发器。当这个Znode发生改变，也就是调用了create，delete，setData方法的时候，将会触发Znode 上注册的对应事件，请求 Watch的客户端会接收到异步通知。

### &emsp;交互过程

+ 客户端调用`getData`方法，此时watch参数为true。服务端接收请求，返回节点数据，并在对应的哈希表中插入被watch的znode路径以及watcher列表。
+ 当被watch的znode被删除，服务端会查找哈希表，找到znode对应的所有watcher，异步通知客户端，并删除哈希表中对应的key-value。

### &emsp;监听原理

1. 首先需要一个main线程。
2. 在main线程中创建ZooKeeper客户端，此时会创建两个线程，一个是负责网络连接通信的connect，一个是负责监听的listener。
3. ZooKeeper客户端通过connect线程将注册的监听事件发送给ZooKeeper服务端。
4. 在ZooKeeper服务端的注册监听器列表中将注册的监听事件添加到列表中。
5. ZooKeeper服务端监听到数据或路径编号，将会把这个消息发送给ZooKeeper客户端的listener线程。
6. listener线程内部调用process方法进行处理。

### &emsp;zkCli使用watch

+ `get -W 路径`或`get watch 路径`：一次性监听节点的内容，如果内容变化则会收到通知。
+ `ls -W 路径`或`ls watch 路径`：监听目录，创建和删除子节点时会收到通知，子节点中新增节点则不会收到通知。
+ `ls -R -W 路径`：对于子节点中子节点的变化进行通知，但是内容的变化不会收到通知。

### &emsp;Curator使用watch

在测试文件中添加测试方法：

```java
@Test
// 监听节点
public void addNodeListener() throws Exception{
    // 需要导入curator-recipes依赖
    // NodeCache使用节点数据作为本地缓存使用。这个类可以对节点进行监听，能够处理节点的增删改事件，数据同步等。 还可以通过注册自定义监听器来更细节的控制这些数据变动操作。
    NodeCache nodeCache = new NodeCache(curatorFramework,"/test");
    nodeCache.getListenable().addListener(new NodeCacheListener() {
        @Override
        public void nodeChanged() throws Exception {
            System.out.println("/test路径发生变化");
            System.out.printf("/test数据为%s", new String(curatorFramework.getData().forPath("/test")));
        }
    });
    nodeCache.start();
    // 阻塞方法，让方法一直调用
    System.in.read();
}
```
