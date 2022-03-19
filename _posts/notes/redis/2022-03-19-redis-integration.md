---
layout: post
title:  "整合"
date:   2022-03-19 18:28:40 +0800
categories: notes redis basic
tags: Redis 基础 整合 Jedis
excerpt: "整合"
---

## Jedis

即Java操作Redis。

### &emsp;配置Jedis

首先创建一个Maven项目，不用其他模板，命名为jedis。

然后导入Jedis依赖：

```xml
<!-- https://mvnrepository.com/artifact/redis.clients/jedis -->
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>4.1.1</version>
</dependency>
```

然后还需要一个JUnit依赖：

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.8.2</version>
    <scope>compile</scope>
</dependency>
```

新建一个org.didnelpsun.Main的文件：

```java
// Main.java
package org.didnelpsun;

import redis.clients.jedis.Jedis;

public class Main {
    public static final String host = "127.0.0.1";
    public static final int port = 6379;
    public static void main(String[] args){
        // 创建Jedis对象
        Jedis jedis = new Jedis(host, port);
        // 使用ping测试
        System.out.println(jedis.ping());
    }
}
```

如果有密码需要设置`redis.auth(密码值)`。

运行，发现有一个警告：

```txt
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
```

这是因为Jedis依赖SL4J包来进行日志管理，只需要添加一个slf4j-nop依赖就可以了，注意要把scope标签删掉，不然编译时这个插件不起作用：

```xml
<!-- https://mvnrepository.com/artifact/org.slf4j/slf4j-simple -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-nop</artifactId>
    <version>1.7.36</version>
</dependency>
```

如果运行失败，返回连接超时则可能是防火墙阻止了访问或者Redis配置不允许远程访问，可以使用`systemctl stop firewalld`关闭防火墙或修改redis.conf文件。

### &emsp;测试Redis操作

通过Jedis可以通过Java使用Redis的操作命令：

```java
// Main.java
package org.didnelpsun;

import org.junit.jupiter.api.Test;
import redis.clients.jedis.Jedis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Main {
    public static final String host = "127.0.0.1";
    public static final int port = 6379;
    // 创建Jedis对象
    public static Jedis j = new Jedis(host, port);
    public static void main(String[] args){
        // 使用ping测试
        s(j.ping());
    }
    // 将判断key是否存在变为静态方法
    public static boolean e(String name){
        return j.exists(name);
    }
    // 将打印方法改名
    public static void s(Object object){
        System.out.println(object);
    }
    // 操作键
    @Test
    public void testKey(){
        // 获取Redis中的所有key
        Set<String> keys = j.keys("*");
        for(String key : keys){
            s(key);
        }
        // 判断是否存在
        if(e("key")){
            // 获取存活时间
            s(j.ttl("key"));
        }
        else{
            // 设置键
            s(j.set("key", "test"));
        }
        // 获取键
        s(j.get("key"));
    }
    // 操作列表
    @Test
    public void testList(){
        // 如果不存在
        if(!e("list")){
            // 右边插入
            j.rpush("list","value1", "value2");
        }
        // 获取列表全部值
        List<String> list = j.lrange("list",0,-1);
        s(list);
    }
    // 操作集合
    @Test
    public void testSet(){
        // 如果有就删除值
        if(e("set")){
            j.srem("value1", "value2");
        }
        j.sadd("set","value1","value2");
        // 获取集合所有值
        Set<String> set = j.smembers("set");
        // 可以看出set集合是乱序的
        s(set);
    }
    // 操作哈希
    @Test
    public void testHash(){
        if(e("hash")){
            j.hdel("hash","name","age");
        }
        Map<String,String> map = new HashMap<>();
        map.put("name","金");
        map.put("age","22");
        // 添加多个域需要使用map
        j.hmset("hash",map);
        List<String> hash = j.hmget("hash","name","age");
        for(String h: hash){
            s(h);
        }
    }
    // 操作有序集合
    @Test
    public void testZset(){
        if(!e("zset")){
            j.zadd("zset", 99, "shanghai");
            j.zadd("zset", 80, "wuhan");
        }
        List<String> zset = j.zrange("zset", 0 ,-1);
        s(zset);
    }
}
```

### &emsp;Jedis模拟验证码

要求：

1. 输入手机号，点击发送后随机生成6位数字码，2分钟有效
2. 输入验证码，点击验证，返回成功或失败。
3. 每个手机号每天只能输入3次。

首先随机生成六位数字码，可以使用Java的Random类来生成。两分钟有效可以将验证码放入Redis中，并设置过期时间为120秒。接着根据Redis获取手机号和验证码进行对比，数据结构对象为key-value，key为电话号码，value为验证码。最后每个手机号每天只能输入3次，就再新建新的数据表用来保存手机号码和剩余次数，过期时间为一天86400秒。

所以需要两个数据结构，其中手机号作为key不可以重复：第一个是手机号和验证码，过期时间为120秒，每接收到一个手机号就返回一个随机数字保存在一起；第二个是手机号和可发送次数，过期时间为86400秒，初始化为3，每接收一次手机号请求可发送次数就减一，当为0时返回不可发送错误，每操作第一个数据结构前都需要检查第二个数据结构。

在org.didnelpsun下新建一个PhoneVerify：

## SpringBoot整合Redis

### &emsp;整合配置

SpringBoot已经给出了Redis的starter：spring-boot-starter-data-redis。

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-data-redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <version>2.6.4</version>
</dependency>
```

SpringBoot对Redis进行了自动配置：

+ 使用RedisAutoConfiguration自动配置类。导入RedisProperties属性类的属性，spring.redis.x是对redis的配置。
+ 连接工厂有两个：LettuceConnectionConfiguration、JedisConnectionConfiguration。
+ 自动注入了RedisTemplate（key和value都是Object类型）和StringRedisTemplate（key和value都是String类型）。底层只要我们使用StringRedisTemplate，RedisTemplate就可以操作Redis。

Redis的连接地址为redis://用户:密码@网站地址:端口号（默认为6379）。本地默认为<redis://localhost:6379/>。