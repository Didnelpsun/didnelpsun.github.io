---
layout: post
title:  "安装与配置"
date:   2020-02-11 16:51:25 +0800
categories: notes servlet base
tags: Servlet 基础 javaweb 包
excerpt: "Servlet入门与安装包"
---

## Servlet入门

Java Servlet是运行在Web服务器或应用服务器上的程序，它是作为来自Web浏览器或其他HTTP客户端的请求和HTTP服务器上的数据库或应用程序之间的中间层。

使用Servlet，你可以收集来自网页表单的用户输入，呈现来自数据库或者其他源的记录，还可以动态创建网页。

JavaServlet通常情况下与使用CGI（Common Gateway Interface，公共网关接口）实现的程序可以达到异曲同工的效果。但是相比于 CGI，Servlet 有以下几点优势：

1. 性能明显更好。
2. Servlet在Web服务器的地址空间内执行。这样它就没有必要再创建一个单独的进程来处理每个客户端请求。
3. Servlet是独立于平台的，因为它们是用Java编写的。
4. 服务器上的Java安全管理器执行了一系列限制，以保护服务器计算机上的资源。因此，Servlet是可信的。
5. Java 类库的全部功能对Servlet来说都是可用的。它可以通过sockets和RMI机制与applets、数据库或其他软件进行交互。

```terminal
Servlet架构

web浏览器<--http协议-->HTTP服务器<--网络请求/请求资源-->Servlet程序<-请求数据->数据库
```

&emsp;

## Servlet作用

1. 读取客户端（浏览器）发送的显式的数据。这包括网页上的HTML表单，或者也可以是来自applet或自定义的HTTP客户端程序的表单。
2. 读取客户端（浏览器）发送的隐式的HTTP请求数据。这包括cookies、媒体类型和浏览器能理解的压缩格式等等。
3. 处理数据并生成结果。这个过程可能需要访问数据库，执行RMI或CORBA调用，调用Web服务，或者直接计算得出对应的响应。
4. 发送显式的数据（即文档）到客户端（浏览器）。该文档的格式可以是多种多样的，包括文本文件（HTML 或 XML）、二进制文件（GIF 图像）、Excel等。
5. 发送隐式的HTTP响应到客户端（浏览器）。这包括告诉浏览器或其他客户端被返回的文档类型（例如HTML），设置cookies和缓存参数，以及其他类似的任务。

&emsp;

## Servlet包

Java Servlet是运行在带有支持 Java Servlet规范的解释器的web服务器上的Java类。

Servlet可以使用javax.servlet和javax.servlet.http包创建，它是Java企业版（JAVAEE）的标准组成部分，Java企业版是支持大型开发项目的Java类库的扩展版本。所以在IDEA上面你是无法利用标准java创建Servlet的。

Java Servlet就像任何其他的Java类一样已经被创建和编译。在你安装Servlet包并把它们添加到你的计算机上的Classpath类路径中之后，你就可以通过JDK的Java编译器或任何其他编译器来编译Servlet。

Servlet API中一共有四个包，分别是：

1. javax.servlet，包含定义Servlet和Servlet容器间的类与接口。
2. javax.servlet.http，包含定义HTTP Servlet与Servlet容器之间的类与接口。
3. javax.servlet.annotation，包括对Servlet、Filter和Listener进行标注的注解，并为标注元件指定元数据。
4. javax.servlet.descriptor，包含为Web应用程序的配置信息提供编程式访问的类型。
