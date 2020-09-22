---
layout: post
title:  "网络安全技术"
date:   2019-09-21 22:12:45 +0800
categories: notes computer-network
tags: 计算机网络
excerpt: "结构与数据类型"
---

PIX防火墙基本配置方法

访问模式：

模式名称|进入方式|功能|显示
:-----:|:-----:|:--:|:--:
非特权模式|默认|无特权|pixfirewall>
特权模式|输入`enable`|改变当前配置|pixfirewall#
配置模式|输入`configure terminal`|大部分全局配置都在这里|pixfirewall(config)#
监视模式|防火墙开机重启时，点击Escape或输入Break字符|更新操作系统映像或口令恢复|monitor>
