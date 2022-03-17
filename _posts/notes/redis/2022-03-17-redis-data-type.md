---
layout: post
title:  "数据类型"
date:   2022-03-17 20:36:00 +0800
categories: notes redis basic
tags: Redis 基础 数据
excerpt: "数据类型"
---

Redis有五种数据类型。

## 常用操作

### &emsp;库操作

+ `select 库编号`：来切换库。
+ `dbsize`：查看当前数据库的key数量。
+ `flushdb`：清空当前库。
+ `flushall`：清空所有库。

## &emsp;键操作

+ `keys *`：查看当前库所有key。
+ `exists 键名`：查看键是否存在。
+ `type 键名`：查看键的类型。
+ `del 键名`：删除键。
+ `unlink 键名`：根据value选择非阻塞删除，仅将键从keyspace元数据中删除，真正的删除会在后续异步操作。
+ `expire 键名 数字`：为给定的键设置过期时间，单位为秒。
+ `ttl 键名`：查看还有多少秒过期，-1表示永不过期，-2表示已过期。

## 字符串

即String类型。

一个key对应一个value，是二进制安全的，表示String类型可以包含任何数据，比如JPG图片以及序列化对象。字符串的值最大为512M。

+ `set 键名 键值`：来添加键。如果键名不存在是添加，如果键名存在是更新。
+ `get 键名`：获取键值。

&emsp;

## 列表

即List类型。

&emsp;

## 集合

即Set类型。

&emsp;

## 哈希

即Hash类型。

&emsp;

## 有序集合

即Zset类型。
