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

### &emsp;Seata概念

即1+3：

+ XID即Transaction ID，全局唯一的事务ID。
+ TC，事务协调者，维护全局和分支事务的状态，驱动全局事务提交或回滚。
+ TM，事务管理器，定义全局事务的范围，开始全局事务、提交或回滚全局事务。
+ RM，资源管理器，管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。

1. TM向TC申请开启一个全局事务，全局事务创建成功并生成一个全局唯一的XID。
2. XID在微服务调用链路的上下文中传播。
3. RM向TC注册分支事务，将其纳入XID对应全局事务的管辖。
4. TM向TC发起针对XID的全局提交或回滚决议。
5. TC调度XID下管辖的全部分支事务完成提交或回滚请求。

### &emsp;安装

在[发布说明](https://github.com/seata/seata/releases)中，可以在[Maven中心仓库](https://mvnrepository.com/)下载jar包用于项目使用，直接搜索seata-all，但是我们这里需要下载zip压缩包seata-server。

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
      namespace: public
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
      namespace: public
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
      my_test_tx_group: fsp_tx_group
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

新建模块order2001（由于与前面的order模块不同所以使用2001端口）

&emsp;

## 库存

&emsp;

## 账户
