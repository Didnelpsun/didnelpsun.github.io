---
layout: post
title: "主从复制"
date:  2022-03-21 16:43:49 +0800
categories: notes redis basic
tags: Redis 基础 主从复制
excerpt: "主从复制"
---

## 概念

### &emsp;定义

主机数据更新后根据配置和策略，自动复制同步到备机的master/slaver机制，Master以写为主，Slave以读为主。

一般都是一主多从的模式，如果主服务器宕机那么该如何处理？使用下个文档的集群的模式。

### &emsp;作用

+ 读写分离，性能扩展。
+ 容灾快速恢复。

&emsp;

## 搭建服务

尝试搭建一主两从的服务器。

### &emsp;配置服务器

首先创建一个testRedis文件夹，我选择的地址为E:\redis。将配置文件移动到这个文件夹下。

由于需要一主两从，所以创建三个配置文件：redis6379.conf、redis6380.conf、redis6381.conf。写入配置内容，通过include引入其他文件，然后对基本文件进行修改：

```conf
include .\\redis.windows.conf
pidfile .\\redis_6379.pid
port 6379
dbfilename dump6379.rdb
```

```conf
include .\\redis.windows.conf
pidfile .\\redis_6380.pid
port 6380
dbfilename dump6380.rdb
```

```conf
include .\\redis.windows.conf
pidfile .\\redis_6381.pid
port 6381
dbfilename dump6381.rdb
```

并且在新建的redis文件夹的配置文件中将appendonly关掉，并打开daemorize yes。还可以添加不同的日志文件logfile，这里我没有使用。

然后关闭Redis：`redis-server --service-stop`。

在自建的redis配置文件下按配置文件启动redis：`E:\redis>redis-server redis6379.conf`：

```txt
[67028] 21 Mar 20:23:13.259 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
[67028] 21 Mar 20:23:13.259 # Redis version=5.0.14.1, bits=64, commit=ec77f72d, modified=0, pid=67028, just started
[67028] 21 Mar 20:23:13.260 # Configuration loaded
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 5.0.14.1 (ec77f72d/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 67028
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           http://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

[67028] 21 Mar 20:23:13.273 # Server initialized
[67028] 21 Mar 20:23:13.273 * Ready to accept connections
```

同样使用另外两个控制台启动其他两个端口，由于是前台启动所以不要关闭控制台。Linux可以通过`ps -ef | grep redis`来查看是否启动。虽然这三个服务器都启动了，但是我们并没有对其配置，所以这三个都是主服务器。

通过`redis-cli -p 端口号`来连接不同端口号的Redis服务器，然后输入`info replication`查看主机信息：

```txt
# Replication
role:master
connected_slaves:0
master_replid:49e03e5f23585415794479f166d1aa98c2de6b29
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:0
second_repl_offset:-1
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0
```

根据role:master就可以判断当前的服务器是个主机。

### &emsp;配置主从关系

#### &emsp;&emsp;命令配置

使用`slaveof 主机IP 主机端口号`，将当前服务器变成某个实例的从服务器。

如在6380和6381的redis-cli上执行`slaveof 127.0.0.1 6379`，返回OK，再执行`info replication`：

```txt
# Replication
role:slave
master_host:127.0.0.1
master_port:6379
master_link_status:up
master_last_io_seconds_ago:4
master_sync_in_progress:0
slave_repl_offset:140
slave_priority:100
slave_read_only:1
connected_slaves:0
master_replid:1edc5f1a151e55b55eef3306ac1ec63ae0b713b2
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:140
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:140
```

此时6380变为了从机。6379执行`info replication`：

```txt
# Replication
role:master
connected_slaves:2
slave0:ip=127.0.0.1,port=6380,state=online,offset=378,lag=1
slave1:ip=127.0.0.1,port=6381,state=online,offset=378,lag=0
master_replid:1edc5f1a151e55b55eef3306ac1ec63ae0b713b2
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:378
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:378
```

6379拥有了两个从机。

如果主机有密码还要在从机的配置文件加上`masterauth 密码`表示访问主服务器的密码。

由于主服务器负责写，从服务器负责读，所以在主机上添加一个键，从机上也能读到。主机也可以读数据，但是如果从机进行写操作会报错：(error) READONLY You can't write against a read only replice。

#### &emsp;&emsp;文件配置

使用命令配置的主从关系如果关闭了Redis就不存在了，如果要长期保持需要在从配置文件中添加`slaveof 主机IP 主机端口号`的配置信息。其他内容和命令配置一样。

&emsp;

## 应用

### &emsp;特点

1. 采用异步复制。
2. 一个主Redis服务器可以含有多个从Redis服务器。
3. 每个从Redis服务器可以接收来自其他从Redis服务器的连接。
4. 主从复制对于主Redis服务器来说是非阻塞的，这意味着当从服务器在进行主从复制同步过程中，主Redis仍然可以处理外界的访问请求。
5. 主从复制对于从Redis服务器来说也是非阻塞的，这意味着，即使从Redis在进行主从复制过程中也可以接受外界的查询请求，只不过这时候从Redis返回的是以前老的数据，如果你不想这样，那么在启动Redis时，可以在配置文件中进行设置，那么从Redis在复制同步过程中来自外界的查询请求都会返回错误给客户端。（虽然说主从复制过程中对于从Redis是非阻塞的，但是当从Redis从主Redis同步过来最新的数据后还需要将新数据加载到内存中，在加载到内存的过程中是阻塞的，在这段时间内的请求将会被阻，但是即使对于大数据集，加载到内存的时间也是比较多的）。
6. 主从复制提高了Redis服务的扩展性，避免单个Redis服务器的读写访问压力过大的问题，同时也可以给为数据备份及冗余提供一种解决方案。
7. 为了编码主Redis服务器写磁盘压力带来的开销，可以配置让主Redis不在将数据持久化到磁盘，而是通过连接让一个配置的从Redis服务器及时的将相关数据持久化到磁盘，不过这样会存在一个问题，就是主Redis服务器一旦重启，因为主Redis服务器数据为空，这时候通过主从同步可能导致从Redis服务器上的数据也被清空。

### &emsp;原理

#### &emsp;&emsp;全量复制

Redis全量复制一般发生在Slave初始化阶段，这时Slave需要将Master上的所有数据都复制一份。具体步骤如下：

+ 从服务器连接主服务器，发送sync同步命令。
+ 主服务器接收到sync同步命令后，开始执行bgsave命令生成rdb快照文件并使用缓冲区记录此后执行的所有写命令。
+ 主服务器bgsave执行完后，向所有从服务器发送rdb快照文件，并在发送期间继续记录被执行的写命令。
+ 从服务器收到快照文件后丢弃所有旧数据，载入收到的快照。
+ 主服务器快照发送完毕后开始向从服务器发送缓冲区中的写命令。
+ 从服务器完成对快照的载入，开始接收命令请求，并执行来自主服务器缓冲区的写命令用于更新。

完成了从服务器数据初始化的所有操作，从服务器此时可以接收来自用户的读请求。

#### &emsp;&emsp;增量复制

Redis增量复制是指Slave从服务器初始化后开始正常工作时主服务器发生的写操作同步到从服务器的过程。 增量复制的过程主要是主服务器每执行一个写命令就会向从服务器发送相同的写命令，从服务器接收并执行收到的写命令。

部分同步的实现依赖于主服务器端为复制流维护一个内存缓冲区（in-memory backlog）和一个复制偏移量（replication offset）与master run id，在Master主服务器内存中给每个Slave从服务器维护了一份同步日志和同步标识，每个Slave从服务器在跟Master主服务器进行同步时都会携带自己的同步标识和上次同步的最后位置。

当主从连接断掉之后，Slave从服务器隔断时间（默认1s）主动尝试和Master主服务器进行连接，如果从服务器携带的偏移量标识还在Master主服务器上的同步备份日志中，那么就从Slave从发送的偏移量开始继续上次的同步操作，如果Slave从发送的偏移量已经不在Master主的同步备份日志中（可能由于主从之间断掉的时间比较长或者在断掉的短暂时间内Master主服务器接收到大量的写操作），则必须进行一次全量更新。在部分同步过程中，Master主会将本地记录的同步备份日志中记录的指令依次发送给Slave从服务器从而达到数据一致。

#### &emsp;&emsp;同步策略

主从刚刚连接的时候，进行全量同步；全同步结束后，进行增量同步。当然，如果有需要，Slave从服务器在任何时候都可以发起全量同步。Redis策略是，无论如何，首先会尝试进行增量同步，如不成功，要求从机进行全量同步。

如果多个Slave从服务器断线了，需要重启的时候，因为只要Slave从服务器启动，就会发送sync请求和主机全量同步，当多个同时出现的时候，可能会导致Master主服务器IO剧增宕机。

### &emsp;一主两仆

如果各个服务器运行正常。

但是突然一个从服务器宕机了，其他服务器继续操作，主服务器进行对数据进行修改。某一个时刻宕机的从服务器修复成功重新启动，此时从服务器会自动将主服务器的数据全部复制过来。

如果突然主服务器宕机了，其他服务器会继续运作，保持从服务器的位置，此时在从服务器控制台执行`info replication`，会发现master_link_status:up变为master_link_status:down，即从服务器知道主服务器宕机了。某一个时刻主服务器又重新启动，执行`info replication`会发现其主服务器的身份没有变，其从服务器的连接都保持不变。

### &emsp;薪火相传

当出现大量的从服务器时，一个主服务器管理多个从服务器会给主服务器大量的IO压力，此时可以将从服务器作为从服务器的从服务器，此时主服务器的从服务器就减少了，主服务器的数据不直接通过本身传输，而是通过自身直接挂载的从服务器间接传送给其下面的从服务器。

通过`slaveof 从服务器IP 从服务器端口`将本从服务器挂载到其他从服务器上。

这样服务器的结构为树形，降低了主服务器IO压力，但是增加了传输时效，而且一旦某个从服务器宕机后，其他后面的从服务器都无法备份。

### &emsp;反客为主

当主服务器宕机后，默认从服务器还是可以运作，但是只能读操作无法写操作。而我们如果需要写操作，可以让从服务器变为主服务器，后面的挂载在这个从服务器下的从服务器可以不变，同级的和上级的从服务器需要修改。

通过`slaveof no one`将从机变为主机。但是这种方式需要手动操作，且必须明确指定哪个从服务器作为主服务器，必须知道各个服务器之间的关系。

&emsp;

## 哨兵

哨兵模式就是为了解决反客为主的自动化问题。

### &emsp;哨兵定义

哨兵模式是一种特殊的模式，首先Redis提供了哨兵的命令，哨兵是一个独立的进程，作为进程，它会独立运行。其原理是哨兵通过发送命令，等待Redis服务器响应，从而监控运行的多个Redis实例。

这里的哨兵有两个作用：

+ 通过发送命令，让Redis服务器返回监控其运行状态，包括主服务器和从服务器。
+ 当哨兵监测到master宕机，会自动将Slave从服务器切换成Master主服务器，然后通过发布订阅模式通知其他的从服务器，修改配置文件，让它们切换主机。

然而一个哨兵进程对Redis服务器进行监控，可能会出现问题，为此，我们可以使用多个哨兵进行监控。各个哨兵之间还会进行监控，这样就形成了多哨兵模式。

用文字描述一下故障切换（failover）的过程。假设主服务器宕机，哨兵1先检测到这个结果，系统并不会马上进行failover过程，仅仅是哨兵1主观的认为主服务器不可用，这个现象成为主观下线。当后面的哨兵也检测到主服务器不可用，并且数量达到一定值时，那么哨兵之间就会进行一次投票，投票的结果由一个哨兵发起，进行failover操作。切换成功后，就会通过发布订阅模式，让各个哨兵把自己监控的从服务器实现切换主机，这个过程称为客观下线。这样对于客户端而言，一切都是透明的。

一般一台服务器一个哨兵。

### &emsp;哨兵使用

在自定义的redis目录下新建一个sentinel.conf哨兵配置文件，这个名字是固定的，添加内容：

```conf
sentinel monitor 监控对象服务器名称 服务器IP 服务器端口号 至少多收个哨兵同意迁移的数量
```

如我们现在是一主两从，所以写入`sentinel monitor test 127.0.0.1 6379 1`。

通过`redis-sentinel 哨兵配置文件地址`来启动哨兵。如`redis-sentinel sentinel.conf`

其他配置项：

配置项|参数类型|作用
:----:|:------:|:--:
port|整数|启动哨兵进程端口
dir|文件夹目录|哨兵进程服务临时文件夹，默认为/tmp，要保证有可写入的权限
sentinel down-after-milliseconds|<服务名称><毫秒数（整数）>|指定哨兵在监控Redis服务时，当Redis服务在一个默认毫秒数内都无法回答时，单个哨兵认为的主观下线时间，默认为30000（30秒）
sentinel parallel-syncs|<服务名称><服务器数（整数）>|指定可以有多少个Redis服务同步新的主机，一般而言，这个数字越小同步时间越长，而越大，则对网络资源要求越高
sentinel failover-timeout|<服务名称><毫秒数（整数）>|指定故障切换允许的毫秒数，超过这个时间，就认为故障切换失败，默认为3分钟
sentinel notification-script|<服务名称><脚本路径>|指定sentinel检测到该监控的redis实例指向的实例异常时，调用的报警脚本。该配置项可选，比较常用

如果当前没有redis-sentinel，可以从其他Windows编译Redis的redis-sentinel复制过来使用。

```txt
989:X 21 Mar 2022 22:22:33.845 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
989:X 21 Mar 2022 22:22:33.846 # Redis version=6.2.5, bits=64, commit=00000000, modified=0, pid=989, just started
989:X 21 Mar 2022 22:22:33.846 # Configuration loaded
989:X 21 Mar 2022 22:22:33.847 # You requested maxclients of 10000 requiring at least 10032 max file descriptors.
989:X 21 Mar 2022 22:22:33.851 # Server can't set maximum open files to 10032 because of OS error: Too many open files.
989:X 21 Mar 2022 22:22:33.851 # Current maximum open files is 3200. maxclients has been reduced to 3168 to compensate for low ulimit. If you need higher maxclients increase 'ulimit -n'.
989:X 21 Mar 2022 22:22:33.851 * monotonic clock: POSIX clock_gettime
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 6.2.5 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in sentinel mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 26379
 |    `-._   `._    /     _.-'    |     PID: 989
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           https://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

989:X 21 Mar 2022 22:22:33.864 # WARNING: Sentinel was not able to save the new configuration on disk!!!: Permission denied
989:X 21 Mar 2022 22:22:33.865 # Sentinel ID is b5f18b269cd732edde7ceb3b9d417684860b0e3e
989:X 21 Mar 2022 22:22:33.866 # +monitor master test 127.0.0.1 6379 quorum 1
989:X 21 Mar 2022 22:22:33.869 * +slave slave 127.0.0.1:6380 127.0.0.1 6380 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:22:33.872 # WARNING: Sentinel was not able to save the new configuration on disk!!!: Permission denied
989:X 21 Mar 2022 22:22:33.873 * +slave slave 127.0.0.1:6381 127.0.0.1 6381 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:22:33.876 # WARNING: Sentinel was not able to save the new configuration on disk!!!: Permission denied
```

指定sentinel.conf配置文件映射到容器内时直接使用文件映射, 这么做有可能导致哨兵没有写入配置文件的权限，不影响使用。

如果将6378服务器的控制台关闭，则过十秒左右哨兵控制台会继续打印：

```txt
989:X 21 Mar 2022 22:37:39.660 # +sdown master test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.660 # +odown master test 127.0.0.1 6379 #quorum 1/1
989:X 21 Mar 2022 22:37:39.660 # +new-epoch 1
989:X 21 Mar 2022 22:37:39.661 # +try-failover master test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.677 # WARNING: Sentinel was not able to save the new configuration on disk!!!: Permission denied
989:X 21 Mar 2022 22:37:39.678 # +vote-for-leader b5f18b269cd732edde7ceb3b9d417684860b0e3e 1
989:X 21 Mar 2022 22:37:39.678 # +elected-leader master test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.678 # +failover-state-select-slave master test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.779 # +selected-slave slave 127.0.0.1:6381 127.0.0.1 6381 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.779 * +failover-state-send-slaveof-noone slave 127.0.0.1:6381 127.0.0.1 6381 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.888 * +failover-state-wait-promotion slave 127.0.0.1:6381 127.0.0.1 6381 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.913 # WARNING: Sentinel was not able to save the new configuration on disk!!!: Permission denied
989:X 21 Mar 2022 22:37:39.914 # +promoted-slave slave 127.0.0.1:6381 127.0.0.1 6381 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.915 # +failover-state-reconf-slaves master test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:39.965 * +slave-reconf-sent slave 127.0.0.1:6380 127.0.0.1 6380 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:40.929 * +slave-reconf-inprog slave 127.0.0.1:6380 127.0.0.1 6380 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:40.930 * +slave-reconf-done slave 127.0.0.1:6380 127.0.0.1 6380 @ test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:40.991 # +failover-end master test 127.0.0.1 6379
989:X 21 Mar 2022 22:37:40.992 # +switch-master test 127.0.0.1 6379 127.0.0.1 6381
989:X 21 Mar 2022 22:37:40.996 * +slave slave 127.0.0.1:6380 127.0.0.1 6380 @ test 127.0.0.1 6381
989:X 21 Mar 2022 22:37:40.997 * +slave slave 127.0.0.1:6379 127.0.0.1 6379 @ test 127.0.0.1 6381
989:X 21 Mar 2022 22:37:41.013 # WARNING: Sentinel was not able to save the new configuration on disk!!!: Permission denied
```

可以从switch-master test 127.0.0.1 6379 127.0.0.1 6381看出6379换成了6381作为主服务器，6379作为从服务器。

选出主服务器后哨兵会向原主服务器的从服务器发送slaveof命令，并在原主服务器上线后也发送slaveof命令。

### &emsp;选择优先级

那么为什么6381会称为主服务器呢？

选择条件依次为：

1. 选择优先级靠前的。通过slave-priority指定，默认100，值越小优先级越高。
2. 选择偏移量最大的。即获得原主机数据最全的。
3. 选择runid最小的从服务。每个Redis实例启动后都会随机生成一个40位的runid。

### &emsp;复制延时

由于所有的写操作都是先在Master主服务器上操作，然后同步更新到Slave从服务器上，所以从Master主服务器同步到Slave从服务器机器有一定的延迟，当系统很繁忙的时候，延迟问题会更加严重，Slave从服务器机器数量的增加也会使这个问题更加严重。

### &emsp;Java实现

#### &emsp;&emsp;Jedis

```java
private static JedisSentinelPool jedisSentinelPool=null;
public static Jedis getJedisFromSentinel() {
    if(jedisSentinelPool == null) {
        Set<String> sentinelSet=new HashSet<>();
        sentinelSet.add("127.0.0.1:26379");
        JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
        // 最大可用连接数
        jedisPoolConfig.setMaxTotal(10);
        // 最大闲置连接数
        jedisPoolConfig. setMaxIdle(5);
        // 最小闲置连接数
        jedisPoolConfig. setMinIdle(5);
        // 连接耗尽是否等待
        jedisPoolConfig.setBlockWhenExhausted(true);
        // 等待时间
        jedisPoolConfig.setMaxWaitMillis(2000);
        // 取连接的时候进行一下测试pingpong
        jedisPoolConfig.setTestOnBorrow(true);
        jedisSentinelPool= new JedisSentinelPool("mymaster", sentinelSet, jedisPoolConfig);
        return jedisSentinelPool.getResource(); 
    }
}
```

#### &emsp;&emsp;RedisTemplate

```xml
<!--连接池配置-->
<bean id = "poolConfig" class="redis.clients.jedis.JedisPoolConfig">
    <!-- 最大空闲数 -->
    <property name="maxIdle" value="50"></property>
    <!-- 最大连接数 -->
    <property name="maxTotal" value="100"></property>
    <!-- 最大等待时间 -->
    <property name="maxWaitMillis" value="20000"></property>
</bean>

<bean id="connectionFactory" class="org.springframework.data.redis.connection.jedis.JedisConnectionFactory">
    <constructor-arg name="poolConfig" ref="poolConfig"></constructor-arg>
    <constructor-arg name="sentinelConfig" ref="sentinelConfig"></constructor-arg>
    <property name="password" value="123456"></property>
</bean>

<!-- JDK序列化器 -->
<bean id="jdkSerializationRedisSerializer" class="org.springframework.data.redis.serializer.JdkSerializationRedisSerializer"></bean>

<!-- String序列化器 -->
<bean id="stringRedisSerializer" class="org.springframework.data.redis.serializer.StringRedisSerializer"></bean>

<bean id="redisTemplate" class="org.springframework.data.redis.core.RedisTemplate">
    <property name="connectionFactory" ref="connectionFactory"></property>
    <property name="keySerializer" ref="stringRedisSerializer"></property>
    <property name="defaultSerializer" ref="stringRedisSerializer"></property>
    <property name="valueSerializer" ref="jdkSerializationRedisSerializer"></property>
</bean>

<!-- 哨兵配置 -->
<bean id="sentinelConfig" class="org.springframework.data.redis.connection.RedisSentinelConfiguration">
    <!-- 服务名称 -->
    <property name="master">
        <bean class="org.springframework.data.redis.connection.RedisNode">
            <property name="name" value="mymaster"></property>
        </bean>
    </property>
    <!-- 哨兵服务IP和端口 -->
    <property name="sentinels">
        <set>
            <bean class="org.springframework.data.redis.connection.RedisNode">
                <constructor-arg name="host" value="192.168.11.128"></constructor-arg>
                <constructor-arg name="port" value="26379"></constructor-arg>
            </bean>
            <bean class="org.springframework.data.redis.connection.RedisNode">
                <constructor-arg name="host" value="192.168.11.129"></constructor-arg>
                <constructor-arg name="port" value="26379"></constructor-arg>
            </bean>
            <bean class="org.springframework.data.redis.connection.RedisNode">
                <constructor-arg name="host" value="192.168.11.130"></constructor-arg>
                <constructor-arg name="port" value="26379"></constructor-arg>
            </bean>
        </set>
    </property>
</bean>
```
