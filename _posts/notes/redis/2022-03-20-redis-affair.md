---
layout: post
title:  "事务"
date:   2022-03-20 16:02:10 +0800
categories: notes redis basic
tags: Redis 基础 事务
excerpt: "事务"
---

## 概念

### &emsp;定义

Redis事务是一个单独的隔离操作：事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。

Redis事务的主要作用就是串联多个命令防止别的命令插队。

### &emsp;三大特性

+ 单独的隔离操作：事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。
+ 没有隔离级别的概念：队列中的命令没有提交之前都不会实际被执行，因为事务提交前任何指令都不会被实际执行。
+ 不保证原子性：事务中如果有一条命令执行失败，其后的命令仍然会被执行，没有回滚。

&emsp;

## 事务操作

### &emsp;操作命令

Redis针对事务提供了几个操作命令，主要是multi、exec、discard三个命令。

+ 输入multi命令表示开始事务。
+ 一条条输入基本命令，返回QUEUED。批量操作在发送exec命令前被放入队列缓存。
+ 如果输入discard则放弃组队。
+ 收到exec命令后进入事务执行，事务中任意命令执行失败，其余的命令依然被执行。
+ 在事务执行过程，其他客户端提交的命令请求不会插入到事务执行命令序列中。

从输入multi命令开始，输入的命令都会依次进入命令队列中，但不会执行，直到输入exec后，Redis会将之前的命令队列中的命令依次执行。组队的过程中可以通过discard来放弃组队。

+ `multi`：用于标记一个事务块的开始，后面需要一条条的输入事务。总是返回OK。
+ `exec`：用于执行所有事务块内的命令。返回值是事务块内所有命令的返回值，按命令执行的先后顺序排列。 当操作被打断时，返回空值nil。
+ `discard`：用于取消事务，放弃执行事务块内的所有命令。总是返回OK。

### &emsp;错误处理

当组队中某个命令出现了报告错误，如执行命令的语法出现问题，则执行时整个所有队列都会取消。如果执行会报错：(error) EXECABORT Transaction discarded because of previous errors。

如果执行阶段某个命令报出错误，则只有报错命令不会执行，其他命令照常执行。

### &emsp;事务冲突

即多个请求对同一个数据进行操作，多个请求会产生冲突。

对于事务冲突Redis采用锁的机制进行处理。

#### &emsp;&emsp;锁机制

+ 悲观锁（Pessimistic Lock），顾名思义，就是很悲观，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会阻塞直到它拿到锁。传统的关系型数据库里边就用到了很多这种锁机制，比如行锁，表锁等，读锁，写锁等，都是在做操作之前先上锁。
+ 乐观锁（Optimistic Lock），顾名思义，就是很乐观，每次去拿数据的时候都认为别人不会修改，所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据，可以使用版本号等机制。乐观锁适用于多读的应用类型，这样可以提高吞吐量。

#### &emsp;&emsp;监视

Redis就是利用乐观锁的check-and-set机制实现事务的。

+ `watch 键名1 键名2 ...`：用于监视一个或多个key ，如果在事务执行之前这些key被其他命令所改动，那么事务将被打断。在multi前执行。总是返回OK。
+ `unwatch`：用于取消watch命令对所有key的监视。总是返回OK。

watch需要在multi命令前执行。

如我们打开两个控制台，两个控制台都watch一个键，然后两边都输入multi，并输入一个set命令对这个键操作，其中一个控制台先exec执行成功，而另外一个控制台exec会返回nil执行失败。这里也可以看出Redis使用的是乐观锁，只要对监视值进行改动就更新失败，而如果Redis是实现悲观锁则操作会成功。

&emsp;

## 秒杀案例

秒杀即多个用户共同请求资源数比用户数少的数据。对应商品库存减一，并生成一个秒杀成功者清单。

利用Spring Initializr新建一个SpringBoot项目，名称为affair，组为com.didnelpsun，软件包为com.didnelpsun，Java选择17。依赖项选择一个Spring Configuration Processor和Spring Web。

直接添加Redis依赖：

```xml
<!-- https://mvnrepository.com/artifact/redis.clients/jedis -->
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>4.1.1</version>
</dependency>
```

### &emsp;编写秒杀方法

添加一个控制方法：

```java
// TestController.java
package com.didnelpsun.controller;

import com.didnelpsun.utils.RedisUtil;
import org.springframework.web.bind.annotation.*;

@RestController
public class TestController {
    // POST操作
    @PostMapping("/buy")
    public Boolean buyPost(@RequestParam String userId, @RequestParam String productId){
        return RedisUtil.secKill(userId, productId);
    }
    // Get操作，将GET路径转为POST
    @GetMapping("/buy/{userId}/{productId}")
    public Boolean buyGet(@PathVariable String userId, @PathVariable String productId){
        return buyPost(userId, productId);
    }
}
```

添加Redis操作：

```java
// RedisUtil.java
package com.didnelpsun.utils;

import redis.clients.jedis.Jedis;

public class RedisUtil {
    // 产品库存后缀
    public static final String stockSuffix = "s";
    // 秒杀清单后缀
    public static final String killSuffix = "k";
    // 秒杀
    public static Boolean secKill(String userId, String productId){
        // 首先对userId和productId判空
        if(userId.length() == 0 || productId.length() == 0){
            System.out.println("输入参数为空");
            return false;
        }
        // 对userId和productId是否有效进行判断，使用SQL数据库，这里略过
        // 连接Redis
        Jedis jedis = new Jedis("127.0.0.1",6379);
        // 获取product库存，如果库存为null则表示秒杀未开始，如果库存小于1则表示已经没有库存，返回false
        String stock = jedis.get(productId + stockSuffix);
        if (stock == null){
            System.out.println("秒杀未开始");
            jedis.close();
            return false;
        }
        if(Integer.parseInt(stock)<1){
            System.out.println("库存不足");
            jedis.close();
            return false;
        }
        // 根据秒杀清单查看用户是否在里面，如果在就返回false不允许再次秒杀
        // 秒杀清单应该为一个集合
        if(jedis.sismember(productId+killSuffix,userId)){
            System.out.println("已经秒杀成功");
            jedis.close();
            return false;
        }
        // 如果秒杀成功，则库存-1，秒杀成功的userId和productId添加到数据库中
        jedis.decr(productId+stockSuffix);
        jedis.sadd(productId+killSuffix,userId);
        System.out.println("秒杀成功");
        jedis.close();
        return true;
    }
}
```

然后运行访问<http://localhost:8080/buy/1/1>，返回false并提示秒杀未开始。

然后添加产品库存数据进行测试：`set 1s 2`，表示productId为1的库存有两个。访问<http://localhost:8080/buy/1/1>，返回ture，提示秒杀成功。再次访问返回false，提示已经秒杀成功。换一个userId秒杀<http://localhost:8080/buy/3/1>，返回true，再换一个<http://localhost:8080/buy/2/1>，返回false，消息库存不足。

### &emsp;模拟并发

此时的模拟操作都是简单的一个个的操作，如果多个用户同时并发操作会发生什么问题呢？

#### &emsp;&emsp;安装测试软件

可以使用ab，ab是Apache HTTP server benchmarking tool的缩写，可以用以测试HTTP请求的服务器性能，也是业界比较流行和简单易用的一种压力测试工具包。

Linux安装方式：`sudo apt-get install apache2-utils`。

Windows安装方式：ab集成在Apache中，跳转到[Apache的官方Windows软件支持](https://www.apachehaus.com/cgi-bin/download.plx)，选择Apache X.X Server Binaries下的Apache x.x.x右边的Download Locations，随便点击一个下载。下载完成后进行解压并放到一个位置。进入安装目录下的bin就可以使用。

使用命令：`ab -n 请求数 -c 并发数 测试网址`。如果返回SSL not compiled in; no https support，就不用ab而使用abs。

如果是POST/PUT，需要使用：`ab -n 请求数 -c 并发数 -p POST/PUT提交数据文件地址 -T 'application/x-www-form-urlencoded' 测试地址`。T选项指定post文件的编码方式，默认是明文，如果指定-T 'application/x-www-form-urlencoded'，则表示post文件使用urlencode。

如果是Lunix测试Windows，测试地址则不能是localhost，而应该是主机IP地址，使用`ipconfig`命令查看IPv4地址。

#### &emsp;&emsp;测试单个用户

先执行`set 1s 50`添加数据。

然后在E盘下创建一个post.txt文件，表示只有一个用户疯狂请求：

```txt
userId=1&productId=1
```

此时进入安装目录的bin目录下测试：`ab -n 100 -c 20 -p E:\\post.txt -T application/x-www-form-urlencoded http://localhost:8080/buy`：

```txt
This is ApacheBench, Version 2.3 <$Revision: 1879490 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient).....done


Server Software:
Server Hostname:        localhost
Server Port:            8080

Document Path:          /buy
Document Length:        4 bytes

Concurrency Level:      20
Time taken for tests:   0.150 seconds
Complete requests:      100
Failed requests:        99
   (Connect: 0, Receive: 0, Length: 99, Exceptions: 0)
Total transferred:      10999 bytes
Total body sent:        17500
HTML transferred:       499 bytes
Requests per second:    667.68 [#/sec] (mean)
Time per request:       29.955 [ms] (mean)
Time per request:       1.498 [ms] (mean, across all concurrent requests)
Transfer rate:          71.72 [Kbytes/sec] received
                        114.10 kb/s sent
                        185.82 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     3    9  12.6      6     106
Waiting:        2    9  12.5      6     103
Total:          3   10  12.6      6     106

Percentage of the requests served within a certain time (ms)
  50%      6
  66%      8
  75%      9
  80%      9
  90%     12
  95%     44
  98%     45
  99%    106
 100%    106 (longest request)
```

IDEA中的打印结果为一个秒杀成功和许多个已经秒杀成功，表示如果是一个用户疯狂请求是没问题的。

#### &emsp;&emsp;测试多个用户

那么如果是多个不同的用户对同一个productId进行操作呢？

控制器方法中添加：

```java
// 随机生成用户ID
public static String getRandomUserId(){
    Random random = new Random();
    StringBuilder code = new StringBuilder();
    for(int i=0;i<4;i++){
        code.append(random.nextInt(10));
    }
    return code.toString();
}
// 随机用户秒杀
@GetMapping("/testBuy")
public Boolean testBuy(){
    return buyPost(getRandomUserId(), "1");
}
```

再执行`set 1s 50`添加数据。进入安装目录的bin目录下测试：`ab -n 100 -c 20  http://localhost:8080/testBuy`：

```txt
This is ApacheBench, Version 2.3 <$Revision: 1879490 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient).....done


Server Software:
Server Hostname:        localhost
Server Port:            8080

Document Path:          /testBuy
Document Length:        4 bytes

Concurrency Level:      20
Time taken for tests:   0.150 seconds
Complete requests:      100
Failed requests:        48
   (Connect: 0, Receive: 0, Length: 48, Exceptions: 0)
Total transferred:      10948 bytes
HTML transferred:       448 bytes
Requests per second:    668.69 [#/sec] (mean)
Time per request:       29.909 [ms] (mean)
Time per request:       1.495 [ms] (mean, across all concurrent requests)
Transfer rate:          71.49 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     2    9  13.6      5     111
Waiting:        2    8  13.2      5     105
Total:          2    9  13.6      5     111

Percentage of the requests served within a certain time (ms)
  50%      5
  66%      6
  75%      6
  80%      7
  90%     15
  95%     41
  98%     43
  99%    111
 100%    111 (longest request)
```

此时返回的是许多秒杀成功，后面接着就是库存不足，看着好像没问题，但是打开Redis查看1k和1s的数据，发现1k中有52条数据，但是实际上我们给了50个库存应该只能访问50个才对，此时1s为-2不为0，所以证明出现了并发的问题。如果我们再把数据放大一些，比如请求1000并发50，库存改为50，可能会发现秒杀成功和库存不足也会发生交错混乱，1s的库存余额会变得更小。

#### &emsp;&emsp;问题与措施

连接超时问题：大量请求数据，Redis由于是单线程所以造成堵塞，从而连接超时。可以使用连接池解决。

utils下新建一个连接池：

```java
// JedisPoolUtil.java
package com.didnelpsun.utils;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

import java.time.Duration;

// Redis连接池
public class JedisPoolUtil {
    private static volatile JedisPool jedisPool = null;
    public static String host = "127.0.0.1";
    public static int port = 6379;
    public static int timeout = 60000;
    private JedisPoolUtil(){

    }
    public static JedisPool getJedisPoolInstance(){
        if(jedisPool == null){
            synchronized (JedisPoolUtil.class){
                if(jedisPool == null){
                    JedisPoolConfig poolConfig = new JedisPoolConfig();
                    // 最大连接数
                    poolConfig.setMaxTotal(200);
                    // 最大闲置连接
                    poolConfig.setMaxIdle(32);
                    // 最大等待时间
                    poolConfig.setMaxWait(Duration.ofSeconds(10));
                    // 超过连接数是否阻塞
                    poolConfig.setBlockWhenExhausted(true);
                    // 连接时是否测试连接
                    poolConfig.setTestOnBorrow(true);
                    jedisPool = new JedisPool(poolConfig, host, port, timeout);
                }
            }
        }
        return jedisPool;
    }

    public static void release(JedisPool jedisPool, Jedis jedis){
        if(jedis != null){
            jedisPool.returnResource(jedis);
        }
    }
}
```

然后将`Jedis jedis = new Jedis("127.0.0.1",6379);`注释掉，使用连接池取Jedis：`Jedis jedis = JedisPoolUtil.getJedisPoolInstance().getResource();`。

超卖问题：即我们之前测试的1s的值为负数，超过原来的库存。可以使用乐观锁解决：

```java
// RedisUtils.java
package com.didnelpsun.utils;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.Transaction;

import java.util.List;

public class RedisUtil {
    // 产品库存后缀
    public static final String stockSuffix = "s";
    // 秒杀清单后缀
    public static final String killSuffix = "k";
    // 秒杀
    public static Boolean secKill(String userId, String productId){
        // 首先对userId和productId判空
        if(userId.length() == 0 || productId.length() == 0){
            System.out.println("输入参数为空");
            return false;
        }
        // 对userId和productId是否有效进行判断，使用SQL数据库，这里略过
        // 连接Redis
//        Jedis jedis = new Jedis("127.0.0.1",6379);
        Jedis jedis = JedisPoolUtil.getJedisPoolInstance().getResource();
        // 由于库存可能会出现混乱，所以对库存监视
        jedis.watch(productId + stockSuffix);
        // 获取product库存，如果库存为null则表示秒杀未开始，如果库存小于1则表示已经没有库存，返回false
        String stock = jedis.get(productId + stockSuffix);
        if (stock == null){
            System.out.println("秒杀未开始");
            jedis.close();
            return false;
        }
        if(Integer.parseInt(stock)<1){
            System.out.println("库存不足");
            jedis.close();
            return false;
        }
        // 根据秒杀清单查看用户是否在里面，如果在就返回false不允许再次秒杀
        // 秒杀清单应该为一个集合
        if(jedis.sismember(productId+killSuffix,userId)){
            System.out.println("已经秒杀成功");
            jedis.close();
            return false;
        }
        // 如果秒杀成功，则库存-1，秒杀成功的userId和productId添加到数据库中
//        jedis.decr(productId+stockSuffix);
//        jedis.sadd(productId+killSuffix,userId);
        // 开启事务
        Transaction multi = jedis.multi();
        // 组队
        multi.decr(productId+stockSuffix);
        multi.sadd(productId+killSuffix,userId);
        // 执行
        List<Object> result = multi.exec();
        if(result == null || result.size()==0){
            System.out.println("秒杀失败，存在异常");
            jedis.close();
            return false;
        }
        System.out.println("秒杀成功");
        jedis.close();
        return true;
    }
}
```

重新运行，再执行`set 1s 100`添加数据。进入安装目录的bin目录下测试：`ab -n 1000 -c 50  http://localhost:8080/testBuy`：

```txt
This is ApacheBench, Version 2.3 <$Revision: 1879490 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8080

Document Path:          /testBuy
Document Length:        4 bytes

Concurrency Level:      50
Time taken for tests:   0.488 seconds
Complete requests:      1000
Failed requests:        900
   (Connect: 0, Receive: 0, Length: 900, Exceptions: 0)
Total transferred:      109900 bytes
HTML transferred:       4900 bytes
Requests per second:    2049.74 [#/sec] (mean)
Time per request:       24.393 [ms] (mean)
Time per request:       0.488 [ms] (mean, across all concurrent requests)
Transfer rate:          219.99 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0       5
Processing:     2   17  12.2     15     139
Waiting:        2   14  12.0     11     130
Total:          3   18  12.2     15     139

Percentage of the requests served within a certain time (ms)
  50%     15
  66%     18
  75%     19
  80%     20
  90%     26
  95%     31
  98%     65
  99%     77
 100%    139 (longest request)
```

控制台的打印中是：秒杀失败，存在异常和秒杀成功交替出现（因为并发时多个用户同时访问时只有一个能得到，所以秒杀成功，其他同时访问的都会存在异常），最后才是库存不足，然后查看Redis数据，1s为0，代表高并发访问数据时没有问题。

库存残留问题：当库存量较大时，而并发数较大，请求次数接近库存量时，虽然已经秒杀完成了库存，但是发现库存数据不为0，这是因为乐观锁导致许多请求都失败，先点的没有秒杀到，后点的可能秒杀到了。

首先测试看看是否存在这个问题，执行`set 1s 500`添加数据。进入安装目录的bin目录下测试：`ab -n 1000 -c 200  http://localhost:8080/testBuy`：此时会发现库存不为0，还有一些库存。因为大量的用户请求发生大量冲撞，从而导致许多库存及时有较大的请求次数也没有卖完。如果有更多的请求可能就没有库存了，但是请求次数增多会给程序更大压力。

可以使用脚本语言将复杂或多步的Redis的单线程用任务队列的方式一次性提交给Redis执行，减少反复连接Redis的次数，提升性能，从而解决多任务并发问题。

可以使用Lua语言的脚本，类似Redis事务，有一定原子性，不会被其他命令插队，Redis2.6以上才支持。
