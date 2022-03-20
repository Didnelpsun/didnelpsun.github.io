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

```java
// PhoneVerify.java
package org.didnelpsun;

import redis.clients.jedis.Jedis;

import java.util.Objects;
import java.util.Random;

public class PhoneVerify {
    // 主机
    public static final String host = "127.0.0.1";
    // 端口
    public static final int port = 6379;
    // 次数限制时间
    public static final int limit = 24*60*60;
    // 验证码有效时间
    public static final int verify = 120;
    // 有效次数的key的后缀
    public static final String eff = "e";
    // 验证码的key的后缀
    public static final String ver = "v";
    // 生成六位随机数字
    public static String getRandomCode(){
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for(int i=0;i<6;i++){
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
    // 发送并保存验证码
    public static String setRandomCode(String telephone){
        // 连接Redis
        Jedis jedis = new Jedis(host,port);
        // 由于有效时间只对每个键生效，而我们需要两个有效期，所以需要两个键
        // 有效次数的key为telephone+e
        String e = telephone + eff;
        // 验证码的key为telephone+v
        String v = telephone + ver;
        // 先检查telephone是否有多余的有效次数
        // 判断是否是第一次请求，如果是就进行初始化
        if(!jedis.exists(e)){
            jedis.setex(e,limit,"3");
        }
        // 对telephone+e值减一，表示当前之后还可以发几次
        jedis.decr(e);
        if(Integer.parseInt(jedis.get(e))<0){
            jedis.close();
            return "NULL";
        }
        // 如果还可以发送就随机生成一个code并保存到Redis中
        String code = getRandomCode();
        // 如果是第一次就是新增，如果不是就是更新
        jedis.setex(v,verify,code);
        jedis.close();
        return code;
    }

    // 对手机号和验证码校验
    public static Boolean verifyTelephone(String telephone, String code){
        return Objects.equals(new Jedis(host,port).get(telephone + ver), code);
    }
}
```

主文件进行测试：

```java
// 模拟手机登录
@Test
public void testPhoneVerify(){
    String phone = "00000000000";
    // 获取验证码
    String code = PhoneVerify.setRandomCode(phone);
    if(code.equals("NULL")){
        s("超过请求次数");
        code = j.get(phone+PhoneVerify.ver);
        s(code);
        if(code!= null){
            s(PhoneVerify.verifyTelephone(phone,code));
        }
        else{
            s("验证码过期，且请求次数用完，今天不可登录");
        }
        return;
    }
    s(code);
    s(PhoneVerify.verifyTelephone(phone,code));
}
```

在使用过程中还要求如果登录成功，就立刻让手机号码的验证码失效。

[Jedis：Redis/jedis](https://github.com/Didnelpsun/Redis/tree/master/jedis)。

## SpringBoot整合Redis

利用Spring Initializr新建一个SpringBoot项目，名称为springboot，组为com.didnelpsun，软件包为com.didnelpsun，Java选择17。依赖项选择一个Spring Configuration Processor和Spring Web。

### &emsp;整合配置

SpringBoot已经给出了Redis的starter：spring-boot-starter-data-redis。

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-data-redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <!-- <version>2.6.4</version> -->
</dependency>
```

此外还需要Redis支持JSON数据：

```xml
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <!-- <version>2.13.2</version> -->
</dependency>
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-core -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-core</artifactId>
    <!-- <version>2.13.2</version> -->
</dependency>
```

SpringBoot对Redis进行了自动配置：

+ 使用RedisAutoConfiguration自动配置类。导入RedisProperties属性类的属性，spring.redis.x是对redis的配置。
+ 连接工厂有两个：LettuceConnectionConfiguration、JedisConnectionConfiguration。
+ 自动注入了RedisTemplate（key和value都是Object类型）和StringRedisTemplate（key和value都是String类型）。底层只要我们使用StringRedisTemplate，RedisTemplate就可以操作Redis。

Redis的连接地址为redis://用户:密码@网站地址:端口号（默认为6379）。本地默认为<redis://localhost:6379/>。

然后在yaml中配置Redis信息：

```yaml
# Redis服务器端口
spring.redis.host=127.0.0.1
# Redis连接端口
spring.redis.port=6379
# Redis数据库起始索引
spring.redis.database=0
# 连接超时时间（毫秒）
spring.redis.timeout=180000
# 连接池最大连接数（使用负值表示没有限制）
spring.redis.lettuce.pool.max-active=20
# 最大阻塞等待时间（负数表示没限制）
spring.redis.lettuce.pool.max-wait=-1
# 连接池中的最大空闲连接
spring.redis.lettuce.pool.max-idle=5
# 连接池中的最小空闲连接
spring.redis.lettuce.pool.min-idle=0
```

### &emsp;编写配置类

新建一个config包，下面编写一个RedisConfig继承CachingConfigurerSupport，是固定写法：

```java
// RedisConfig.java
package com.didnelpsun.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig extends CachingConfigurerSupport {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
//        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        om.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
        jackson2JsonRedisSerializer.setObjectMapper(om);
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
        // key采用String的序列化方式
        template.setKeySerializer(stringRedisSerializer);
        // hash的key也采用String的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);
        // value序列化方式采用jackson
        template.setValueSerializer(jackson2JsonRedisSerializer);
        // hash的value序列化方式采用jackson
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        template.afterPropertiesSet();
        return template;
    }
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory){
        RedisSerializer<String> redisSerializer = new StringRedisSerializer();
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        // 处理查询缓存转换宜昌
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);
        // 配置序列化，解决乱码问题，过期时间600秒
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(600))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(redisSerializer))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer))
                .disableCachingNullValues();
        return RedisCacheManager.builder(factory)
                .cacheDefaults(configuration)
                .build();
    }
}
```

### &emsp;测试

SpringBoot中集成了Redis变成了RedisTemplate，可以利用RedisTemplate进行操作。

新建一个controller包，然后新建一个TestController：

```java
// TestController
package com.didnelpsun.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    public void setRedisTemplate(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    @GetMapping("/test")
    public String testRedis(){
        redisTemplate.opsForValue().set("test", "test");
        return (String) redisTemplate.opsForValue().get("test");
    }
}
```

访问<http://localhost:8080/test>。

如果连接超时：io.netty.channel.ConnectTimeoutException: connection timed out: /192.0.0.1:6379，记得将：

+ redis配置中的spring.redis.timeout中连接超时时间（毫秒）中时间设置不能为0。
+ redis.conf（或redis.windows.conf和redis.windows-service.conf）的protected-mode yes改为：protected-mode no。
+ redis.conf（或redis.windows.conf和redis.windows-service.conf）的bind 127.0.0.1注解掉。
+ 防火墙中设置6379开启远程服务：
  + Linux：`/sbin/iptables -I INPUT -p tcp --dport 6379 -j ACCEPT`。
  + Windows：控制面板->搜索点击Windows Defender防火墙->点击左边的高级设置->点击入站规则->新建规则->点击规则类型为端口->端口输入6379->允许连接->全部都应用规则->命名为Redis。

[相关RedisTemplate介绍](https://blog.csdn.net/lydms/article/details/105224210)。

[Jedis：Redis/springboot](https://github.com/Didnelpsun/Redis/tree/master/springboot)。
