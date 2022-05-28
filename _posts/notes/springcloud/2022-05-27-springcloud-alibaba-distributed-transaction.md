---
layout: post
title: "分布式事务"
date: 2022-05-27 01:01:39 +0800
categories: notes springcloud alibaba
tags: SpringCloud Alibaba Seata 分布式 事务
excerpt: "分布式事务"
---

即将数据库分布在多个位置，对数据CRUD时会需要进行事务处理。

## 基础

### &emsp;分布式事务协议

在分布式系统里，每个节点都可以知晓自己操作的成功或者失败，却无法知道其他节点操作的成功或失败。当一个事务跨多个节点时，为了保持事务的原子性与一致性，而引入一个协调者来统一掌控所有参与者的操作结果，并指示它们是否要把操作结果进行真正的提交或者回滚。

#### &emsp;&emsp;两阶段提交协议

即2PC，是常用的分布式事务解决方案，即将事务的提交过程分为两个阶段来进行处理。

参与角色：

+ 协调者：事务的发起者，有一个。
+ 参与者：事务的执行者，有多个。

阶段一，准备阶段（投票Vote阶段）：

1. 协调者向所有参与者发送事务内容，询问是否可以提交事务，并等待答复。
2. 各参与者执行事务操作，将undo和redo信息记入事务日志中，但不提交事务。
3. 如参与者执行成功，给协调者反馈同意，否则反馈中止。

阶段二，提交Commit阶段：

当协调者节点从所有参与者节点获得的相应消息都为同意时：

1. 协调者节点向所有参与者节点发出**正式提交commit**的请求。
2. 参与者节点正式完成操作，并释放在整个事务期间内占用的资源。
3. 参与者节点向协调者节点发送ack完成消息。
4. 协调者节点收到所有参与者节点反馈的ack完成消息后，完成事务。

如果任一参与者节点在第一阶段返回的响应消息为中止，或者协调者节点在第一阶段的询问超时之前无法获取所有参与者节点的响应消息时：

1. 协调者节点向所有参与者节点发出**回滚操作rollback**的请求。
2. 参与者节点利用阶段一写入的undo信息执行回滚，并释放在整个事务期间内占用的资源。
3. 参与者节点向协调者节点发送ACK回滚完成消息。
4. 协调者节点受到所有参与者节点反馈的ACK回滚完成消息后，取消事务。

不管最后结果如何，第二阶段都会结束当前事务。

虽然保证了数据强一致性，但是存在缺点：

1. 性能问题：执行过程中，所有参与节点都是事务阻塞型的。当参与者占有公共资源时，其他第三方节点访问公共资源不得不处于阻塞状态。
2. 可靠性问题：参与者发生故障。协调者需要给每个参与者额外指定超时机制，超时后整个事务失败。协调者发生故障。参与者会—直阻塞下去。需要额外的备机进行容错。
3. 数据一致性问题：二阶段无法解决的问题，协调者在发出commit消息之后宕机，而唯一接收到这条消息的参与者同时也宕机了。那么即使协调者通过选举协议产生了新的协调者，这条事务的状态也是不确定的，图人知道事务是否被已经提交。

#### &emsp;&emsp;三阶段提交协议

三阶段提交协议，是二阶段提交协议的改进版本，三阶段提交有两个改动点：

+ 在协调者和参与者中都引入超时机制。
+ 在第一阶段和第二阶段入插入一个准备阶段。保证了在最后提交阶段之前各参与节点的状态是一致的。

也就是说，除了引入超时机制之外，3PC把2PC的准备阶段再次一分为二，先问再做，这样三阶段提交就有CanCommit、PreCommit、DoCommit三个阶段。

阶段一，CanCommit阶段：

3PC的CanCommit阶段其实和2PC的准备阶段很像。协调者向参与者发送commit请求，参与者如果可以提交就返回Yes响应，否则返回No响应：

1. 事务询问协调者向所有参与者发出包含事务内容的CanCommit请求，询问是否可以提交事务，并等待所有参与者答复。
2. 响应反馈参与者收到cancommit请求后，如果认为可以执行事务操作，则反馈yes并进入预备状态，否则反馈
no。

阶段二，PreCommit阶段：

协调者根据参与者的反应情况来决定是否可以进行事务的PreCommit操作。根据响应情况，有以下两种可能：

假如所有参与者均反馈yes，协调者预执行事务：

1. 发送预提交请：协调者向参与者发送PreCommit请求，并进入准备阶段。
2. 事务预提交：参与者接收到PreCommit请求后，会执行事务操作，并将undo和redo信息记录到事务日志中，但不提交事务。
3. 响应反馈：如果参与者成功的执行了事务操作，则返回ACK响应，同时开始等待最终指令。

假如有任何一个参与者向协调者发送了no响应，或者等待超时之后，协调者都没有接到参与者的响应，那么就执行事务的中断：

1. 发送中断请求：协调者向所有参与者发送abort请求。
2. 中断事务：参与者收到来自协调者的abort请求之后或超时之后，仍未收到协调者的请求，执行事务的中断。

阶段三，DoCommit阶段：

进入阶段三后，无论协调者出现问题，或者协调者与参与者网络出现问题，都会导致参与者无法接收到协调者发出的doCommit请求或abort请求。此时。参与者都会在等待超时之后，继续执行事务提交。

该阶段进行真正的事务提交，也可以分为以下两种情况：

执行提交，所有参与者均反馈ACK响应，执行真正的事务提交：

1. 发送提交请求协调接收到参与者发送的ACK向应，那么他将从预提交状态进入到提交状态，并向所有参与者发送doCommit请求。
2. 事务提交参与者接收到doCommit请求之后，执行正式的事务提交。并在完成事务提交之后释放所有事务资源。
3. 响应反馈事务提交完之后，向协调者发送ACK响应。
4. 完成事务协调者接收到所有参与者的ACK响应之后，完成事务。

中断事务，任何一个多与者反馈no，或者等待超时后协调者尚无法收到所有参与者的反馈：

1. 发送中断请求如果协调者处于工作状态，向所有参与者发出abort请求。
2. 事务回滚参与者接收到abort请求之后，利用其在阶段二记录的undo信息来执行事务的回滚操作，并在完成回滚之后释放所有的事务资源。
3. 反馈结果参与者完成事务回滚之后，向协调者反馈ACK消息。
4. 中断事务协调者接收到参与者反馈的ACK消息之后，执行事务的中断。

在doCommit阶段，如果参与者无法及时接收到来自协调者的doCommit或者rebort请求时，会在等待超时之后，会继续进行事务的提交。其实这个应该是基于概率来决定的，当进入第三阶段时，说明参与者在第二阶段已经收到了PreCommit请求，那么协调者产生PreCommit请求的前提条件是他在第二阶段开始之前，收到所有参与者的CanCommit响应都是Yes。一旦参与者收到了PreCommit，意味他知道大家其实都同意修改了。所以，一句话概括就是，当进入第三阶段时，由于网络超时等原因，虽然参与者没有收到commit或者abort响应，但是他有理由相信成功提交的几率很大。

+ 优点：相比二阶段提交，三阶段提交降低了阻塞范围，在等待超时后协调者或参与者会中断事务。避免了协调者单点问题，阶段3中协调者出现问题时，参与者会继续提交事务。
+ 缺点：数据不一致问题依然存在，当在参与者收到preCommit请求后等待doCommit指令时，此时如果协调者请求中断事务，而协调者无法与参与者正常通信，会导致参与者继续提交事务，造成数据不一致。

### &emsp;分布式事务解决方案

+ TCC。
+ 全局消息。
+ 基于可靠信息服务的分布式事务。
+ 最大努力通知。

#### &emsp;&emsp;TCC

即事务补偿，具体实现有Byte-TCC。TCC方案是一种应用层面侵入业务的两阶段提交，是目前最火的一种柔性事务方案，其核心思想是:针对每个操作，都要注册一个与其对应的确认和补偿（撤销）操作。

1. 第一阶段：Try（尝试），主要是对业务系统做检测及资源预留（加锁，锁住资源）。
2. 第二阶段：本阶段根据第—阶段的结果，决定是执行confirm还是cancel。
   + Confirm（确认）：执行真正的业务，释放锁。
   + Cancel（取消）：预留资源进行取消，释放锁。

最终一致性保证：

+ TCC事务机制以初步操作Try为中心的，确认操作Confirm和取消操作Cancel都是围绕初步操作Try而展开。因此，Try阶段中的操作，其保障性是最好的，即使失败，仍然有取消操作Cancel可以将其执行结果撤销。
+ Try阶段执行成功并开始执行confirm阶段时，默认confirm阶段是不会出错的。也就是说只要Try成功，Confirm一定成功。
+ Confirm与Cancel如果失败，由TCC框架进行重试补偿。
+ 存在极低概率在CC环节彻底失败，则需要定时任务或人工介入。

### &emsp;Seata概念

#### &emsp;&emsp;组成部件

组成部件即1+3：

+ XID即Transaction ID，全局唯一的事务ID。
+ TC，事务协调者，维护全局和分支事务的状态，驱动全局事务提交或回滚。
+ TM，事务管理器，定义全局事务的范围，开始全局事务、提交或回滚全局事务。
+ RM，资源管理器，管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。

如购买商品是一个事务，所以购买商品整体业务就需要一个TM；动作中里面需要多个操作，包括新增订单，更新库存，这两个就分别对应订单表和库存表，即有两个RM；TC就管理整个业务，包括购买商品等其他业务。

1. TM向TC申请开启一个全局事务，全局事务创建成功并生成一个全局唯一的XID。
2. XID在微服务调用链路的上下文中传播。
3. RM向TC注册分支事务，将其纳入XID对应全局事务的管辖。
4. TM向TC发起针对XID的全局提交或回滚决议。
5. TC调度XID下管辖的全部分支事务完成提交或回滚请求。

#### &emsp;&emsp;AT模式

Seata所使用的模式就是AT模式，特点就是对业务无入侵式，整体机制分二阶段提交：

1. 业务数据和回滚日志记录在同一个本地事务中提交，释放本地锁和连接资源。
2. 提交异步化，非常快速地完成。回滚通过一阶段的回滚日志进行反向补偿。

在AT模式下，用户只需关注自己的业务SQL，用户的业务SQL作为一阶段，Seata框架会自动生成事务的二阶段提交和回滚操作。

#### &emsp;&emsp;实现步骤

1. TM端使用@GlobalTransaction进行全局事务开启、提交、回滚。
2. TM开始RPC调用远程服务。
3. RM端seata-client通过扩展DataSaurceProxy，实现自动生成undo_log与TC上报。
4. TM告知TC提交/回滚全局事务。
5. TC通知RM各自执行commit/rollback操作，同时清除undo_log。

### &emsp;安装

在[发布说明](https://github.com/seata/seata/releases)中下载zip压缩包seata-server。这里的seata-server就是TC。

#### &emsp;&emsp;application.yml

下载完成后解压到指定目录，打开conf，复制application.yml为备份文件application.yml.backup，然后再修改为自己的配置内容，包括自定义事务组名称、事务日志存储模式为db、数据库连接信息，参考application.example.yml进行配置，主要是server服务器配置、store数据存储配置、registry注册配置，注意MySQL 8版本以上的启动名中要加上cj：

```yaml
# Seata端口
server:
  port: 7091

# 应用名
spring:
  application:
    name: seata-server

# 日志打印配置
logging:
  config: classpath:logback-spring.xml
  file:
    path: ${user.home}/logs/seata
  extend:
    logstash-appender:
      destination: 127.0.0.1:4560
    kafka-appender:
      bootstrap-servers: 127.0.0.1:9092
      topic: logback_to_logstash

# Seata控制台用户配置
console:
  user:
    username: seata
    password: seata

# Seata基本配置
seata:
  # Seata配置中心配置
  config:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      # 命名空间ID
      namespace: 
      cluster: default
      username: nacos
      password: nacos
  # Seata注册中心配置
  registry:
    type: nacos
    preferred-networks: 30.240.*
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      namespace: 
      cluster: default
      username: nacos
      password: nacos
  # Seata服务器配置
  server:
    service-port: 8091 #If not configured, the default is '${server.port} + 1000'
    max-commit-retry-timeout: -1
    max-rollback-retry-timeout: -1
    rollback-retry-timeout-unlock-enable: false
    enableCheckAuth: true
    retryDeadThreshold: 130000
    xaerNotaRetryTimeout: 60000
    recovery:
      handle-all-session-period: 1000
    undo:
      log-save-days: 7
      log-delete-period: 86400000
    session:
      branch-async-queue-size: 5000 #branch async remove queue size
      enable-branch-async-remove: false #enable to asynchronous remove branchSession
    vgroupMapping:
      # 事务组名称
      my_test_tx_group: seata_tx_group
  # Seata事务数据存储
  store:
    # 数据保存类型为数据库
    mode: db
    session:
      mode: db
    lock:
      mode: db
    # 设置保存数据到数据库的数据库配置
    db:
      datasource: dbcp
      db-type: mysql
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://127.0.0.1:3306/seata?rewriteBatchedStatements=true
      user: root
      password: root
      min-conn: 5
      max-conn: 100
      global-table: global_table
      branch-table: branch_table
      lock-table: lock_table
      distributed-lock-table: distributed_lock
      query-limit: 100
      max-wait: 5000
  # Seata安全配置
  security:
    secretKey: SeataSecretKey0c382ef121d778043159209298fd40bf3850a017
    tokenValidityInMilliseconds: 1800000
    ignore:
      urls: /,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-fe/public/**,/api/v1/auth/login
```

#### &emsp;&emsp;mysql.sql

然后新建数据库seata，并在seata里建表，这个表不用我们自己建，SQL文件mysql.sql在[官网脚本地址](https://github.com/seata/seata/blob/develop/script/server/db/mysql.sql)中：

```sql
-- -------------------------------- The script used when storeMode is 'db' --------------------------------
-- the table to store GlobalSession data
CREATE TABLE IF NOT EXISTS `global_table`
(
    `xid`                       VARCHAR(128) NOT NULL,
    `transaction_id`            BIGINT,
    `status`                    TINYINT      NOT NULL,
    `application_id`            VARCHAR(32),
    `transaction_service_group` VARCHAR(32),
    `transaction_name`          VARCHAR(128),
    `timeout`                   INT,
    `begin_time`                BIGINT,
    `application_data`          VARCHAR(2000),
    `gmt_create`                DATETIME,
    `gmt_modified`              DATETIME,
    PRIMARY KEY (`xid`),
    KEY `idx_status_gmt_modified` (`status` , `gmt_modified`),
    KEY `idx_transaction_id` (`transaction_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

-- the table to store BranchSession data
CREATE TABLE IF NOT EXISTS `branch_table`
(
    `branch_id`         BIGINT       NOT NULL,
    `xid`               VARCHAR(128) NOT NULL,
    `transaction_id`    BIGINT,
    `resource_group_id` VARCHAR(32),
    `resource_id`       VARCHAR(256),
    `branch_type`       VARCHAR(8),
    `status`            TINYINT,
    `client_id`         VARCHAR(64),
    `application_data`  VARCHAR(2000),
    `gmt_create`        DATETIME(6),
    `gmt_modified`      DATETIME(6),
    PRIMARY KEY (`branch_id`),
    KEY `idx_xid` (`xid`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

-- the table to store lock data
CREATE TABLE IF NOT EXISTS `lock_table`
(
    `row_key`        VARCHAR(128) NOT NULL,
    `xid`            VARCHAR(128),
    `transaction_id` BIGINT,
    `branch_id`      BIGINT       NOT NULL,
    `resource_id`    VARCHAR(256),
    `table_name`     VARCHAR(32),
    `pk`             VARCHAR(36),
    `status`         TINYINT      NOT NULL DEFAULT '0' COMMENT '0:locked ,1:rollbacking',
    `gmt_create`     DATETIME,
    `gmt_modified`   DATETIME,
    PRIMARY KEY (`row_key`),
    KEY `idx_status` (`status`),
    KEY `idx_branch_id` (`branch_id`),
    KEY `idx_xid_and_branch_id` (`xid` , `branch_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS `distributed_lock`
(
    `lock_key`       CHAR(20) NOT NULL,
    `lock_value`     VARCHAR(20) NOT NULL,
    `expire`         BIGINT,
    primary key (`lock_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('AsyncCommitting', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryCommitting', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryRollbacking', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('TxTimeoutCheck', ' ', 0);
```

运行后生成四张表。

#### &emsp;&emsp;启动

首先启动Nacos`startup -m standalone`，再次启动seata-server，在bin目录下点击seata-server.bat进行启动。

### &emsp;项目准备

#### &emsp;&emsp;业务需求

这里我们会创建三个服务，一个订单服务，一个库存服务，一个账户服务。

当用户下单时，会在订单服务中创建一个订单，然后通过远程调用库存服务来扣减下单商品的库存，再通过远程调用账户服务来扣减用户账户里面的余额，最后在订单服务中修改订单状态为已完成。

该操作跨越三个数据库，有两次远程调用，很明显会有分布式事务问题。

#### &emsp;&emsp;数据库

使用`CREATE DATABSE 数据库名`语句创建seata_order、seata_storage、seata_account三个数据库：

```sql
CREATE DATABSE seata_order;
CREATE DATABSE seata_storage;
CREATE DATABSE seata_account;
```

#### &emsp;&emsp;业务表

在这三个数据库中分别建立对应业务表order、storage、account：

seata_order数据库order表SQL语句：

```sql
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
    `id` BIGINT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT(11) DEFAULT NULL COMMENT '用户ID', 
    `product_id` BIGINT(11) DEFAULT NULL COMMENT '产品ID',
    `count` INT(11) DEFAULT NULL COMMENT '数量',
    `money` DECIMAL(11,0) DEFAULT NULL COMMENT '金额',
    `status` INT(1) DEFAULT NULL COMMENT '订单状态，0：创建中；1：已完结'
) ENGINE=INNODB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
```

seata_storage数据库storage表SQL语句：

```sql
DROP TABLE IF EXISTS `storage`;
CREATE TABLE `storage` (
    `id` BIGINT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT(11) DEFAULT NULL COMMENT '产品ID',
    `total` INT(11) DEFAULT NULL COMMENT '总库存',
    `used` INT(11) DEFAULT NULL COMMENT '已用库存',
    `residue` INT(11) DEFAULT NULL COMMENT '剩余库存'
) ENGINE=INNODB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
INSERT INTO seata_storage.storage
VALUES (1, 1, 100, 0, 100);
```

seata_account数据库account表SQL语句：

```sql
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
    `id` BIGINT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT(11) DEFAULT NULL COMMENT '用户ID', 
    `total` DECIMAL(10,0) DEFAULT NULL COMMENT '总额度',
    `used` DECIMAL(10,0) DEFAULT NULL COMMENT '已用余额',
    `residue` DECIMAL(10,0) DEFAULT 0 COMMENT '剩余可用额度'
) ENGINE=INNODB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
INSERT INTO seata_account.account
VALUES (1, 1, 1000, 0, 1000);
```

#### &emsp;&emsp;回滚日志表

undo_log表，即回滚日志表，每一个Seata数据库都需要这个表：

+ undo_log表必须在每个业务数据库中创建，用于保存当前所有数据的回滚操作数据。
+ 当全局提交时，undo_log记录直接删除。
+ 当全局回滚时，将现有数据撤销，还原至操作前的状态。

订单、库存、账户三个库下都需要建各自的回滚日志表。直接将[官网回滚SQL](https://github.com/seata/seata/blob/develop/script/client/at/db/mysql.sql)复制下来，在每个数据库中都执行一遍：

```sql
CREATE TABLE IF NOT EXISTS `undo_log`
(
    `branch_id`     BIGINT       NOT NULL COMMENT 'branch transaction id',
    `xid`           VARCHAR(128) NOT NULL COMMENT 'global transaction id',
    `context`       VARCHAR(128) NOT NULL COMMENT 'undo_log context,such as serialization',
    `rollback_info` LONGBLOB     NOT NULL COMMENT 'rollback info',
    `log_status`    INT(11)      NOT NULL COMMENT '0:normal status,1:defense status',
    `log_created`   DATETIME(6)  NOT NULL COMMENT 'create datetime',
    `log_modified`  DATETIME(6)  NOT NULL COMMENT 'modify datetime',
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4 COMMENT ='AT transaction mode undo table';
```

&emsp;

## 订单

新建模块order2001（由于与前面的order模块不同所以使用2001端口）。

### &emsp;订单配置

添加application.yaml：

在application.yaml同级即Resources下添加registry.conf，里面的内容就是seata-server配置的相关内容，不需要手写，到[官方Seata-Nacos案例注册配置文件](https://github.com/seata/seata-samples/blob/master/springcloud-nacos-seata/order-service/src/main/resources/registry.conf)粘贴：

```conf
registry {
  # file 、nacos 、eureka、redis、zk、consul、etcd3、sofa
  type = "nacos"

  nacos {
    application = "seata-server"
    serverAddr = "127.0.0.1:8848"
    group = "SEATA_GROUP"
    namespace = ""
    cluster = "default"
    username = "nacos"
    password = "nacos"
  }
  eureka {
    serviceUrl = "http://localhost:8761/eureka"
    application = "default"
    weight = "1"
  }
  redis {
    serverAddr = "localhost:6379"
    db = 0
    password = ""
    cluster = "default"
    timeout = 0
  }
  zk {
    cluster = "default"
    serverAddr = "127.0.0.1:2181"
    sessionTimeout = 6000
    connectTimeout = 2000
    username = ""
    password = ""
  }
  consul {
    cluster = "default"
    serverAddr = "127.0.0.1:8500"
  }
  etcd3 {
    cluster = "default"
    serverAddr = "http://localhost:2379"
  }
  sofa {
    serverAddr = "127.0.0.1:9603"
    application = "default"
    region = "DEFAULT_ZONE"
    datacenter = "DefaultDataCenter"
    cluster = "default"
    group = "SEATA_GROUP"
    addressWaitTime = "3000"
  }
  file {
    name = "file.conf"
  }
}

config {
  # file、nacos 、apollo、zk、consul、etcd3
  type = "nacos"

  nacos {
    serverAddr = "127.0.0.1:8848"
    namespace = ""
    group = "SEATA_GROUP"
    username = "nacos"
    password = "nacos"
    dataId = "seataServer.properties"
  }
  consul {
    serverAddr = "127.0.0.1:8500"
  }
  apollo {
    appId = "seata-server"
    apolloMeta = "http://192.168.1.204:8801"
    namespace = "application"
  }
  zk {
    serverAddr = "127.0.0.1:2181"
    sessionTimeout = 6000
    connectTimeout = 2000
    username = ""
    password = ""
  }
  etcd3 {
    serverAddr = "http://localhost:2379"
  }
  file {
    name = "file.conf"
  }
}
```

registry.conf是seata配置文件的入口，主要存放注册中心的配置属性（registry {XXX}） 和配置中心的属性值（config{XXX}）。

新建实体类org.didnelpsun.entity.Order：

### &emsp;订单持久层

新建持久层org.didnelpsun.dao.IOderDao：

新建对应的具体实现mapper/OrderMapper.xml：

### &emsp;订单业务层

接口service.IOrderService：

实现impl.OrderServiceImpl：

添加IAccountService：

### &emsp;订单控制层

新建controller.OrderController：

### &emsp;订单启动

新建Order2001Application：

如果报jvm启动失败：Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain) throws java.lang.ClassFormatError accessible: module java.base does not "opens java.lang" to unnamed module @5e0e82ae，是因为启动参数的垃圾回收参数不对，应该是在jdk14之后，已经丢弃了cms垃圾回收器，所以修改响应的垃圾回收器参数即可，VM选项添加--add-opens=java.base/java.lang=ALL-UNNAMED。

nacos配置一个service.vgroupMapping.my-tx-group=seata_tx_group。

&emsp;

## 库存

&emsp;

## 账户
