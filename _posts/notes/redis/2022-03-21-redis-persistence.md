---
layout: post
title: "持久化"
date:  2022-03-21 00:40:05 +0800
categories: notes redis basic
tags: Redis 基础 持久化 RDB AOF
excerpt: "持久化"
---

持久化即将数据保存到硬盘上。Redis提供了两种不同的持久化方式：RDB（Redis Database）和AOF（Append Of File）。

## 持久化基本流程

1. 客户端向服务端发送写操作（数据在客户端的内存中）。
2. 数据库服务端接收到写请求的数据（数据在服务端的内存中）。
3. 服务端调用write这个系统调用，将数据往磁盘上写（数据在系统内存的缓冲区中）。
4. 操作系统将缓冲区中的数据转移到磁盘控制器上（数据在磁盘缓存中）。
5. 磁盘控制器将数据写到磁盘的物理介质中（数据真正落到磁盘上）。

在我们安装了redis之后，所有的配置都是在redis.conf文件中，里面保存了RDB和AOF两种持久化机制的各种配置。

## RDB

### &emsp;RDB概念

#### &emsp;&emsp;RDB含义

在指定的时间间隔内将内存中的数据集快照Snapshot二进制文件写入磁盘，它恢复时是将快照文件查接读到内存里。

#### &emsp;&emsp;Fork概念

+ Fork的作用是复制一个与当前进程一样的进程。新进程的所有数据（变量、环境变量、程序计数器等）数值都和原进程一致，但是是一个全新的进程，并作为原进程的子进程。
+ 在Linux程序中，fork后会产生一个和父进程完全相同的子进程，但子进程在此后多会exec系统调用，出于效率考虑，Linux中引入了“写时复制技术”。
+ 一般情况父进程和子进程会共用同一段物理内存，只有进程空间的各段的内容要发生变化时，才会将父进程的内容复制一份给子进程。（读时共享，写时复制）

#### &emsp;&emsp;RDB持久化流程

Redis会单独创建（fork）一个子进程来进行持久化，会先将数据写入到一个临时文件中，待持久化过程都结束了，再用这个临时文件替换上次持久化好的文件。整个过程中，主进程是不进行任何IO操作的，这就确保了极高的性能，如果需要进行大规模数据的恢复，且对于数据恢复的完整性不是非常敏感，那RDB方式要比AOF方式更加的高效。

### &emsp;RDB触发机制

什么时候触发保存？对于RDB来说，提供了三种机制：save、bgsave、自动化。

#### &emsp;&emsp;RDB触发方式

+ save命令：只能用户手动保存，当一个用户请求时，其他用户请求将全部阻塞。不推荐使用。
+ bgsave命令：表示在后台异步使用fork进行快照操作，并同时可以响应客户端请求。Redis进程执行fork操作创建子进程，RDB持久化过程由子进程负责，完成后自动结束。阻塞只发生在fork阶段，一般时间很短。基本上Redis内部所有的RDB操作都是采用bgsave命令。
+ 配置自动化：由配置文件redis.conf来完成的。

命令|save|bgsave
:--:|:--:|:----:
IO类型|同步|异步
阻塞|是|是（阻塞发生在fork）
复杂度|O(n)|O(n)
优点|不会消耗额外内存|不阻塞客户端命令
缺点|阻塞客户端命令|需要fork，消耗内存

#### &emsp;&emsp;配置文件

在redis.conf配置文件的SNAPSHOT部分中指定持久化配置：

+ dbfilename dump.rdb：指定默认的备份文件。
+ dir：指定rdb文件生成的地址。
+ stop-writes-on-bgsave-error：当Redis无法写入磁盘时，是否直接关掉Redis的写操作，推荐设为yes。
+ rdbcompresssion：表示对于存储到磁盘中的快照是否压缩，如果是yes，那么Redis会使用LZF算法进行压缩，如果不想消耗CPU进行压缩可以设置为no，推荐yes。
+ fdbchecksum：存储快照后是否使用CRC64算法进行数据校验，会增加大约百分之十的性能消耗，推荐yes。
+ save：这里是用来配置触发Redis的RDB持久化条件，也就是什么时候将内存中的数据保存到硬盘。比如“save m n”。表示m秒内数据集存在n次修改时，自动触发bgsave。不需要持久化，那么你可以注释掉所有的save行来停用保存功能。

#### &emsp;&emsp;RDB备份修复

备份方式：

1. 通过`config get dir`查询rdb文件所在目录。
2. 使用`cp 源目录 目标目录`将文件复制到其他地方。

恢复方式：

1. 关闭Redis。
2. 把备份文件复制到工作目录下`cp 源目录 目标目录`。
3. 启动Redis，备份数据会直接加载。

### &emsp;RDB特点

#### &emsp;&emsp;RDB优势

+ 适合大规模的数据恢复。
+ 对数据完整性和一致性要求不高更适合使用。
+ 节省磁盘空间。
+ 恢复速度快。

#### &emsp;&emsp;RDB劣势

+ Fork的时候，内存中的数据被克隆了一份，空间大致2倍的膨胀性需要考虑。
+ 虽然Redis在fork时使用了写时拷贝技术，但是如果数据庞大时还是比较消耗性能。
+ 在备份周期在一定间隔时间做一次备份，所以如果Redis意外宕机的话，就会丢失最后一次快照后的所有修改。

&emsp;

## AOF

### &emsp;AOF概念

#### &emsp;&emsp;AOF含义

以日志的形式来记录每个写操作（增量保存），将Redis执行过的所有写指令记录下来（读操作不记录)，只许追加文件但不可以改写文件，redis启动之初会读取该文件重新构建数据，换言之，redis重启的话就根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复工作。

#### &emsp;&emsp;AOF持久化流程

1. 客户端的请求写命令会被append追加到AOF缓冲区内。
2. AOF缓冲区根据AOF持久化策略（always、everysec、no）将操作sync同步到磁盘的AOF文件中。
3. AOF文件大小超过重写策略或手动重写时，会对AOF文件rewrite重写，压缩AOF文件容量。
4. Redis服务重启时，会重新load加载AOF文件中的写操作达到数据恢复的目的。

### &emsp;AOF触发机制

#### &emsp;&emsp;AOF开启方式

Redis默认开启RDB，AOF是不开启的。可以在redis.conf中配置文件名称，默认为appendonly.aof。AOF文件的保存路径，同RDB的路径一致。

#### &emsp;&emsp;AOF触发频率

通过appendfsync配置触发持久化频率

+ always：始终同步，每次Redis的写入都会立刻记入日志。
+ everysec：每秒同步，每秒记入日志一次，如果宕机，本秒的数据可能丢失。
+ no：Redis不主动进行同步，把同步时机交给操作系统。

命令|always|everysec|no
:--:|:----:|:------:|:-:
优点|不丢失数据|丢失数据少|不用管
缺点|效率低，IO开销较大，一般的sata盘只有几百TPS|丢1秒数据|不可控

#### &emsp;&emsp;AOF与RDB优先级

由于AOF持久化不会调用数据，所以系统默认读取AOF数据。

#### &emsp;&emsp;AOF备份修复

备份方式：AOF的备份机制和性能虽然和RDB不同，但是备份和恢复的操作同RDB一样，都是拷贝备份文件，需要恢复时再拷贝到Redis工作目录下，启动系统即加载。

正常恢复方式：

1. 修改配置文件中默认的appendonly no，改为yes。
2. 将有数据的aof文件复制一份保存到对应备份文件目录（查看目录`config get dir`）。
3. 重启Redis重新加载。

异常恢复方式：

1. 修改配置文件中默认的appendonly no，改为yes。
2. 如遇到AOF文件损坏（Could not connect to Redis at 127.0.0.1:6379: Connection refused），通过`redis-check-aof --fix appendonly.aof`进行恢复。
3. 备份被写坏的AOF文件。
4. 重启redis然后重新加载。

### &emsp;压缩重写机制

#### &emsp;&emsp;压缩含义

AOF采用文件追加方式，文件会越来越大为避免出现此种情况，新增了重写机制，当AOF文件的大小超过所设定的阈值时，Redis就会启动AOF文件的内容压缩，只保留可以恢复数据的最小指令集。可以使用命令bgrewriteaof操作。

如`set key1 value1; set key2 value2`会被压缩成`set key1 value1 key2 value2`。

#### &emsp;&emsp;重写原理

AOF文件持续增长而过大时，会fork出一条新进程来将文件重写（也是先写临时文件最后再rename）。redis4.0版本后的重写，是指把rdb的快照，以二级制的形式附在新的aof头部，作为已有的历史数据，替换掉原来的流水账操作。

#### &emsp;&emsp;no-appendfsync-on-rewrite配置

+ 如果no-appendfsync-on-rewrite=yes，不写入aof文件只写入缓存，用户请求不会阻塞，但是在这段时间如果宕机会丢失这段时间的缓存数据。降低数据安全性，提高性能。
+ 如果no-appendfsync-on-rewrite=no，还是会把数据往磁盘里写入，但是遇到重写操作，可能会发生阻塞。数据安全，但是性能降低。

#### &emsp;&emsp;压缩重写触发机制

Redis会记录上次重写时的AOF文件大小，默认配置是当AOF文件大小是上次rewrite后大小的一倍且文件大于64M时触发压缩重写。

重写虽然可以节约大量磁盘空间，减少恢复时间。但是每次重写还是有一定的负担的因此设定Redis要满足一定条件才会进行重写：

+ auto-aof-rewrite-percentage：设置重写的基准值，默认文件达到100%时开始重写（文件是原来重写后文件的2倍时触发）。
+ auto-aof-rewrite-min-size：设置重写的基准值，默认最小文件64MB。达到这个值开始重写。

系统载入时或者上次重写完毕时，Redis会记录此时AOF大小，设为base_size，如果Redis的AOF当前大小>= base_size+base_size*auto-aof-rewrite-percentage且>=auto-aof-rewrite-min-size，Redis会开始重写。

即按照默认规定，文件达到64MB开始第一次重写，如降到50MB，下一次达到100MB开始重写。

#### &emsp;&emsp;重写流程

1.bgrewriteaof触发重写，判断是否当前有bgsave或bgrewriteaof在运行，如果有，则等待该命令结束后再继续执行。
2. 主进程fork出子进程执行重写操作，保证主进程不会阻塞。
3. 子进程遍历redis内存中数据到临时文件，客户端的写请求同时写入aof_buf缓冲区和aof_rewrite_buf重写缓冲区保证原AOF文件完整以及新AOF文件生成期间的新的数据修改动作不会丢失。
4. 子进程写完新的AOF文件后，向主进程发信号，父进程更新统计信息。主进程把aof_rewrite_buf中的数据写入到新的AOF文件。
5. 使用新的AOF文件覆盖旧的AOF文件，完成AOF重写。

### &emsp;AOF特点

#### &emsp;&emsp;AOF优势

+ 备份机制更稳健，丢失数据概率更低。
+ 可读的日志文本，通过操作AOF稳健，可以处理误操作。

#### &emsp;&emsp;AOF劣势

+ 比起 RDB占用更多的磁盘空间。
+ 恢复备份速度要慢。
+ 每次读写都同步的话，有一定的性能压力。
+ 存在个别Bug，造成恢复不能。

&emsp;

## 对比

+ 官方推荐两个都启用。
+ 如果对数据不敏感，可以选单独用RDB。
+ 不建议单独用AOF，因为可能会出现Bug。
+ 如果只是做纯内存缓存，可以都不用。
