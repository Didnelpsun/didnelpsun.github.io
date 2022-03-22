---
layout: post
title:  "集群"
date:   2022-03-21 23:11:57 +0800
categories: notes redis basic
tags: Redis 基础 集群
excerpt: "集群"
---

## 概念

### &emsp;产生

+ 容量不够，Redis如何进行扩容？
+ 并发写操作，Redis如何分摊？

另外，主从模式，薪火相传模式，主机宕机，导致IP地址发生变化，应用程序中配置需要修改对应的主机地址、端口等信息。

之前通过代理主机来解决，但是Redis3.0中提供了解决方案。就是无中心化集群配置。

### &emsp;定义

Redis集群实现了对Redis的水平扩容，即启动N个redis节点，将整个数据库分布存储在这N个节点中，每个节点存储总数据的1/N。

Redis集群通过分区（partition）来提供一定程度的可用性（availability）︰即使集群中有一部分节点失效或者无法进行通讯，集群也可以继续处理命令请求。

&emsp;

## 搭建

### &emsp;配置文件

将所有rdb和pid文件都删掉。一共需要六个实例，即除了原来的6379、6380、6381，还需要新建6382、6383、6384三个config文件并复制之前的配置，然后对所有conf文件中添加新的配置：

```conf
# 打开集群模式
cluster-enabled yes
# 设置节点配置文件名
cluster-config-file nodes-6379.conf
# 设置节点失联时间，超过该时间，集群自动进行主从切换
cluster-node-timeout 15000
```

然后在redis文件夹下启动这六个实例：`redis-server redis6379.conf`。

### &emsp;合成集群

启动后保证所有服务实例的nodes-xxxx.conf文件都生成了。

然后Linux要到redis安装目录的src文件夹下启动。Windows直接在redis文件夹下执行。

执行`redis-cli --cluster create --cluster-replicas 1 192.168.1.111:6379 192.168.1.111:6380 192.168.1.111:6381 192.168.1.111:6382 192.168.1.111:6383 192.168.1.111:6384`。注意此时不能使用127的本机环路地址，而必须使用真实IP地址，Windows使用`ipconfig`查看。

--cluster-replicas 1指的是每个主机的从机数量，一台主机一台从机，正好三组。一个集群至少三个主节点。分配原则尽量保证每个主数据库运行在不同的IP地址，每个从库和主库不在一个IP地址网段（子网）上。

```txt
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 192.168.1.111:6383 to 192.168.1.111:6379
Adding replica 192.168.1.111:6384 to 192.168.1.111:6380
Adding replica 192.168.1.111:6382 to 192.168.1.111:6381
>>> Trying to optimize slaves allocation for anti-affinity
[WARNING] Some slaves are in the same host as their master
M: c8a23805f27128de5a46fe8f585021edf535beca 192.168.1.111:6379
   slots:[0-5460] (5461 slots) master
M: dc940572a4227a31c8c7f80fb601e3e819b2080f 192.168.1.111:6380
   slots:[5461-10922] (5462 slots) master
M: fc092f43f35bccfe9838053f98111b908a04c8ef 192.168.1.111:6381
   slots:[10923-16383] (5461 slots) master
S: 41ec8f6963ede8ccadcbf2056cde98927a78b4f2 192.168.1.111:6382
   replicates c8a23805f27128de5a46fe8f585021edf535beca
S: 9acb72d9e181fcb1b16c63afde69c965e4c375d9 192.168.1.111:6383
   replicates dc940572a4227a31c8c7f80fb601e3e819b2080f
S: 889eed4bf04db0ea18dfb1ecd3704a7f0d5e7ea5 192.168.1.111:6384
   replicates fc092f43f35bccfe9838053f98111b908a04c8ef
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.
>>> Performing Cluster Check (using node 192.168.1.111:6379)
M: c8a23805f27128de5a46fe8f585021edf535beca 192.168.1.111:6379
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
M: dc940572a4227a31c8c7f80fb601e3e819b2080f 192.168.1.111:6380
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: 9acb72d9e181fcb1b16c63afde69c965e4c375d9 192.168.1.111:6383
   slots: (0 slots) slave
   replicates dc940572a4227a31c8c7f80fb601e3e819b2080f
S: 889eed4bf04db0ea18dfb1ecd3704a7f0d5e7ea5 192.168.1.111:6384
   slots: (0 slots) slave
   replicates fc092f43f35bccfe9838053f98111b908a04c8ef
M: fc092f43f35bccfe9838053f98111b908a04c8ef 192.168.1.111:6381
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
S: 41ec8f6963ede8ccadcbf2056cde98927a78b4f2 192.168.1.111:6382
   slots: (0 slots) slave
   replicates c8a23805f27128de5a46fe8f585021edf535beca
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

&emsp;

## 使用

### &emsp;登录集群

登录加上-c表示采用集群策略连接，设置数据会自动切换到相应的写主机。如`redis-cli -c -p 6379`，使用任何一个端口节点都可以。

`cluster nodes`查看节点信息：

```txt
dc940572a4227a31c8c7f80fb601e3e819b2080f 192.168.1.111:6380@16380 master - 0 1647932222000 2 connected 5461-10922
9acb72d9e181fcb1b16c63afde69c965e4c375d9 192.168.1.111:6383@16383 slave dc940572a4227a31c8c7f80fb601e3e819b2080f 0 1647932222000 5 connected
889eed4bf04db0ea18dfb1ecd3704a7f0d5e7ea5 192.168.1.111:6384@16384 slave fc092f43f35bccfe9838053f98111b908a04c8ef 0 1647932222078 6 connected
fc092f43f35bccfe9838053f98111b908a04c8ef 192.168.1.111:6381@16381 master - 0 1647932220000 3 connected 10923-16383
41ec8f6963ede8ccadcbf2056cde98927a78b4f2 192.168.1.111:6382@16382 slave c8a23805f27128de5a46fe8f585021edf535beca 0 1647932223174 4 connected
c8a23805f27128de5a46fe8f585021edf535beca 192.168.1.111:6379@16379 myself,master - 0 1647932221000 1 connected 0-5460
```

myself,master就表示当前登录的6379是主机，其从机是slave后面是主机ID的192.168.1.111:6382@16382。

### &emsp;插槽

#### &emsp;&emsp;定义

在合成集群的输出中我们可以看到最后一个打印的是All 16384 slots covered。slot就是插槽。

一个Redis集群包含16384个插槽（hash slot），数据库中的每个键都属于这16384个插槽的其中一个。

集群使用公式CRC16(key)%16384来计算键key属于哪个槽，然后向对应插槽增加数据。其中CRC16(key)语句用于计算键key的CRC16校验和。从而负载均衡。而客户端不需要知道和指定key所在的插槽。

集群中的每个节点负责处理一部分插槽。如上面的：

```txt
M: c8a23805f27128de5a46fe8f585021edf535beca 192.168.1.111:6379
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
M: dc940572a4227a31c8c7f80fb601e3e819b2080f 192.168.1.111:6380
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
M: fc092f43f35bccfe9838053f98111b908a04c8ef 192.168.1.111:6381
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
```

三个主节点就负责所有插槽的三分之一，6379负责0-5460，6380负责5461-10922，6381负责10923-16383。

#### &emsp;&emsp;插入

我们可以尝试插入值：`set key1 value1`：

```txt
-> Redirected to slot [9189] located at 192.168.1.111:6380
OK
192.168.1.111:6380>
```

由于6379不负责key1的插槽，所以集群自动将主节点换成了key1插槽9189对应的主机6380。

如果我们要插入多个值，而多个值Redis无法计算插槽从而报错：

`mset key2 value2 key3 value3`：

```txt
(error) CROSSSLOT Keys in request don't hash to the same slot
```

如果我们要插入多个值，就需要将所有值都放在一个组中并命名组名，Redis会根据组名来选择插槽：`mset key2{test} value2 key3{test} value3`会返回OK。

#### &emsp;&emsp;查询

可以通过`cluster keyslot 键名`来获取集群中的键的插槽：

```txt
C:\Users\Didnelpsun>redis-cli -c -p 6379
127.0.0.1:6379> cluster keyslot key1
(integer) 9189
```

通过`get 键名`也会更换主机：

```txt
127.0.0.1:6379> get key1
-> Redirected to slot [9189] located at 192.168.1.111:6380
"value1"
192.168.1.111:6380>
```

不在一个插槽的键是不能使用`mget`来获取键值的：

```txt
127.0.0.1:6379> mget key1 key2
(error) CROSSSLOT Keys in request don't hash to the same slot
```

### &emsp;操作命令

集群信息：

+ `cluster info`：打印集群的信息。
+ `cluster nodes`：列出集群当前已知的所有节点（node），以及这些节点的相关信息。  

节点信息：

+ `cluster meet IP值 端口号`：将IP和端口号所指定的节点添加到集群当中，让它成为集群的一份子。
+ `cluster forget 节点ID`：从集群中移除节点ID指定的节点。
+ `cluster replicate 节点ID`：将当前节点设置为节点ID指定的节点的从节点。
+ `cluster saveconfig`：将节点的配置文件保存到硬盘里面。

槽信息：

+ `cluster addslots 插槽值1 插槽值2 ...`：将一个或多个槽指派给当前节点。
+ `cluster delslots 插槽值1 插槽值2 ...`：移除一个或多个槽对当前节点的指派。
+ `cluster flushslots`：移除指派给当前节点的所有槽，让当前节点变成一个没有指派任何槽的节点。
+ `cluster setslot 插槽值 node 节点ID`：将槽指派给节点ID指定的节点，如果槽已经指派给另一个节点，那么先让另一个节点删除该槽，然后再进行指派。
+ `cluster setslot 插槽值 migrating 节点ID`：将本节点的槽迁移到节点ID指定的节点中。
+ `cluster setslot 插槽值 importing 节点ID`：从节点ID指定的节点中导入槽到本节点。
+ `cluster setslot 插槽值 stable`：取消对槽的导入（import）或者迁移（migrate）。

键信息：

+ `cluster keyslot 键名`：计算键应该被放置在哪个槽上。
+ `cluster countkeysinslot 插槽值`：返回槽中目前包含的键值对数量。对应主机只能查看自减插槽值返回内的数据，如果不是当前主机对应的插槽值则返回0。
+ `cluster getkeysinslot 插槽值 数量`：返回对应数量个槽中的键。对应主机只能查看自减插槽值返回内的数据，如果不是当前主机对应的插槽值则返回nil。

### &emsp;Java操作

```java
public class JedisClusterTest{
    public static void main(String[]args) {
        Set<HostAndPort> set = new HashSet<HostAndPort>();
        // 因为集群所以随便放一个服务器就能访问其他服务器
        set.add(new HostAndPort("192.168.31.211", 6379));
        JedisCluster jedisCluster = new JedisCluster(set);
        jedisCluster.set("k1", "v1");
        System.out.printin(jedisCluster.get("k1");
    }
}
```

&emsp;

## 故障修复

集群中使用了哨兵模式，当一个主机宕机后（超过15秒）其对应的从机会变为主机，主机上线后变成原从机的从机。

如果某一段插槽的主从都挂掉处理方式看redis.conf配置：cluster-require-full-coverage为yes，那么整个集群都挂掉；cluster-require-full-coverage为no，那么，该插槽数据全都不能使用，也无法存储，其他正常使用。

&emsp;

## 集群特点

### &emsp;优点

+ 实现扩容。
+ 分摊压力。
+ 无中心配置相对简单。

### &emsp;缺点

+ 多键操作是不被支持的。
+ 多键的Redis事务是不被支持的。Lua脚本不被支持。
+ 由于集群方案出现较晚，很多公司已经采用了其他的集群方案，而代理或者客户端分片的方案想要迁移至redis cluster，需要整体迁移而不是逐步过渡，复杂度较大。
