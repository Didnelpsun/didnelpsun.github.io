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
