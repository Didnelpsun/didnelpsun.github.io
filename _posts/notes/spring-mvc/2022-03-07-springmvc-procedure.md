---
layout: post
title: "SpringMVC执行过程"
date: 2022-03-07 19:05:39 +0800
categories: notes springmvc base
tags: SpringMVC 高级
excerpt: "SpringMVC执行过程"
---

## 常用组件

+ DispatcherServlet：前端控制器，不需要工程师开发，由框架提供。统一处理请求和响应，整个流程控制的中心。由它调用其它组件处理用户的请求。
+ HandlerMapping：处理器映射器，不需要工程师开发，由框架提供。根据请求的url、method等信息查找Handler，即控制器方法。
+ Handler：处理器，需要工程师开发。在DispatcherServlet的控制下Handler对具体的用户请求进行处理。
+ HandlerAdapter：处理器适配器。不需要工程师开发，由框架提供。通过HandlerAdapter对处理器（控制器方法）进行执行。
+ ViewResolver：视图解析器。不需要工程师开发。由框架提供。进行视图解析，得到相应的视图，例如：ThymeleafView、InternalResourceView、RedirectView。
+ View：视图。不需要工程师开发。由框架或视图技术提供。将模型数据通过页面展示给用户。

&emsp;

## DispatcherServlet初始化过程

本质是Servlet生命周期来进行调度。从ServletConfig->Servlet->GenericServlet->HttpServletBean->FrameworkServlet。

初始化WebApplicationContext。会声明对应的容器，其中Spring和SpringMVC为两个容器，Spring容器为SpringMVC容器的父容器。

在FrameworkServlet创建WebApplicationContext。

DispatcherServlet初始化策略：FrameworkServlet创建WebApplicationContext后刷新容器，调用onRefresh(wac)，此方法在DispatcherServlet中进行了重写，调用了initStrategies方法，初始化策略，即初始化DispatcherServlet各个组件。组件初始化放在服务器加载的时候，避免第一次初始化内容过多。

&emsp;

## DispatcherServlet调用过程

首先processRequest()，FrameworkServlet重写HttpServlet中的service方法和doXXX方法，这些方法中调用了processRequest(request,response)方法。然后是doService方法进行服务。接着是doDispatch方法

&emsp;

## SpringMVC运行流程

1. 用户向服务器发送请求，请求被SpringMVC前端控制器DispatcherServlet捕获。
2. DispatcherServlet对请求URL进行解析，获得URI，判断请求URI对应的映射。如果不存在，则判断是否配置了mvc:default-servlet-handler，如果没有配置则控制台报错映射查不到，客户端报错404。如果配置了则访问模板资源，找不到该路径也会报错404。若存在则继续执行。
3. 根据URI调用HandlerMapping获得该Handler配置的所有相关的对象，包括Handler对象以及Handler对象对应的拦截器，最后以HandlerExectuionChain执行链对象的形式返回。
4. DispatcherServlet根据获得的Handler，选择一个合适的HandlerAdapter。
5. 如果成功获得HandlerAdapter，此时将开始执行拦截器的preHandler方法。（正向）
6. 提取Request中的模型数据。填充Handler入参，开始执行Handler \Controller方法，处理请求。在填充Handler的入参过程中，根据你的配置，Spring将帮你做一些额外的工作：HttpMessageConveter，将请求淌息（如JSON、XML等数据）转换成一个对象，将对象转换为指定的响应信息；数据转换，对请求背息进行数据转换，如String转换成Integer、Double等；数据格式化，对请求消息进行数据格式化，如将字符串转换成格式化数字或格式化日期等；数据验证，验证数据的有效性，包括长度、格式等，验证结果存储到BindingResult或Error中。
7. Handler执行完成后，向DispatcherServlet返画一个ModelAndView对象。
8. 此时将开始执行拦截器的postHandler方法。（逆向）
9. 根据返回的ModelAndView（此时会判断是否存在异常，如果存在异常，则执行HandlerExceptionResolverft行异常处理）选择一个适合的ViewResolver进行视图解析，根据Model和View，来渲染视图。
10. 渲染视图完毕执行拦截器的afterCompletiont方法。（逆向）
11. 将渲染结果返回给客户端。
