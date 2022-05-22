---
layout: post
title: "熔断限流"
date: 2022-05-22 17:58:41 +0800
categories: notes springcloud alibaba
tags: SpringCloud Alibaba Sentinel 熔断 限流
excerpt: "熔断限流"
---

## 基础

### &emsp;概念

包括后台监控程序以及前台监控平台。

Sentinel分为两个部分：

+ 核心库（Java客户端）不依赖任何框架/库，能够运行于所有Java运行时环境，同时对Dubbo/Spring Cloud等框架也有较好的支持。
+ 控制台（Dashboard）基于Spring Boot开发，打包后可以直接运行，不需要额外的Tomcat等应用容器。

### &emsp;安装

[Sentinel的Github官网](https://github.com/alibaba/Sentinel)。Sentinel是单独一个组件，可以独立出来，直接界面化的细粒度统一配置。在Github上下载对应的jar包。

注意8080端口不要被占用，8080被占用可以用参数--server.port=8888。直接在下载地址运行`java -jar sentinel-dashboard-1.8.4.jar`进行启动。
