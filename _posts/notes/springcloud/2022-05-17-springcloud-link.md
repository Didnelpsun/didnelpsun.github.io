---
layout: post
title: "请求链路跟踪"
date: 2022-05-17 23:49:02 +0800
categories: notes springcloud base
tags: SpringCloud 基础 请求链路跟踪 Zipkin Sleuth
excerpt: "分布式请求链路跟踪"
---

在微服务框架中，一个由客户端发起的请求在后端系统中会经过多个不同的的服务节点调用来协同产生最后的请求结果，每一个前段请求都会形成—条复杂的分布式服务调用链路，链路中的任何一环出现高延时或错误都会引起整个请求最后的失败。

Spring提供Sleuth来搜集链路请求，Zipkin负责展现这个链路请求。

## Zipkin

首先到[官网](https://github.com/openzipkin/zipkin)，按照指示下载jar包，然后移动到一个位置。在这个位置下运行`curl -sSL https://zipkin.io/quickstart.sh | bash -s`下载启动文件并启动这个文件，然后运行`java -jar zipkin.jar`进行启动Zipkin的jar包，此时会提示在<http://127.0.0.1:9411/zipkin/>查看路径。

&emsp;

## Sleuth

可以拿之前跟consumer8901代码基本一样的consumer8902作为案例进行简单测试。

### &emsp;配置

首先引入依赖：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-zipkin -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-zipkin</artifactId>
    <version>${spring.cloud.zipkin.version}</version>
</dependency>
```

```yaml
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      # 采样值，介于0到1，1表示全部采集
      probability: 1
```

其他需要链路监控的全部都按照这样改。
