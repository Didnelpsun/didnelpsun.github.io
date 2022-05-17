---
layout: post
title: "请求链路跟踪"
date: 2022-04-30 23:14:36 +0800
categories: notes springcloud base
tags: SpringCloud 基础 请求链路跟踪 Sleuth
excerpt: "分布式 请求链路跟踪"
---

在微服务框架中，一个由客户端发起的请求在后端系统中会经过多个不同的的服务节点调用来协同产生最后的请求结果，每一个前段请求都会形成—条复杂的分布式服务调用链路，链路中的任何一环出现高延时或错误都会引起整个请求最后的失败。