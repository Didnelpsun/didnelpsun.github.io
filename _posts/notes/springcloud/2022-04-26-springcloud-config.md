---
layout: post
title: "分布式配置"
date: 2022-04-26 21:37:58 +0800
categories: notes springcloud base
tags: SpringCloud 基础 配置 Config
excerpt: "分布式配置"
---

## 概念

对于一个微服务就会有一个pom.xml，而多个微服务就会产生大量的pom.xml；不同的情况需要不同的环境，至少需要开发DEV、生产PROD、测试TEST三种环境（还可能需要SIT系统集成测试、UAT用户验收测试）；此时就需要一个专门的配置中心管理这些配置。

SpringCloud Config为微服务架构中的微服务提供集中化的外部配置支持，配置服务器为各个不同微服务应用的所有环境提供了一个中心化的外部配置。

+ 集中管理配置文件。
+ 不同环境不同配置，动态化的配置更新，分环境部署比如dev/test/prod/beta/release。
+ 运行期间动态调整配置，不再需要在每个服务部署的机器上编写配置文件，服务会向配置中心统一拉取配置自己的信息。
+ 当配置发生变动时，服务不需要重启即可感知到配置的变化并应用新的配置。
+ 将配置信息以REST接口的形式暴露。

&emsp;

## 服务端

这里使用Github，首先在Github上面新建一个仓库，并克隆到本地，由于实例项目文件本身就会上传到github的仓库SpringCloud，所以这里就不用新建仓库。

新建模块config3344，这就是SpringCloud项目文件的配置中心模块。

### &emsp;配置

XML添加已给config-server配置：
