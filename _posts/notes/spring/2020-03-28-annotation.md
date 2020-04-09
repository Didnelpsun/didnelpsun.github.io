---
layout: post
title: "注解原理"
date: 2020-03-28 23:02:01 +0800
categories: notes spring senior
tags: spring 高级 注解 自动装配
excerpt: "自动装配后的注解原理"
---

## xml解释

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans-4.2.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context-4.2.xsd">
    <context:annotation-config/>
</beans>
```

那么为什么是这个东西呢？这些是什么意思？首先xml配置文件在[基本容器与实例注入]({% post_url notes/spring/2020-03-19-spring2 %})已经讲过了：

因为xml文档都有格式，为了spring的配置文件增加的节点能满足要求、合法，所以引入校验该xml的格式文件。

xmlns是xml命名空间的意思，而xmlns:xsi是指xml所遵守的标签规范。

1. xmlns：关于初始化bean的格式文件地址
2. xmlns:xsi：辅助初始化bean
3. xsi:context：关于spring上下文，包括加载资源文件
4. xsi:schemaLocation：用于声明了目标名称空间的模式文档

而之前的xmlns:context="http://www.springframework.org/schema/context"就是\<context:annotation-config/>配置文件，用来说明这个标签是来干嘛的，类似于import。

而后面几个xsi:schemaLocation是什么？是对应的注释的相关模式文档。

使用@Autowired注解，必须事先在Spring容器中声明AutowiredAnnotationBeanPostProcessor的Bean：\<bean class="org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor "/>，使用 @Required注解，就必须声明RequiredAnnotationBeanPostProcessor的Bean：\<bean class="org.springframework.beans.factory.annotation.RequiredAnnotationBeanPostProcessor"/>。类似地，使用@Resource、@PostConstruct、@PreDestroy等注解就必须声明CommonAnnotationBeanPostProcessor；使用@PersistenceContext注解，就必须声明PersistenceAnnotationBeanPostProcessor的Bean。BeanPostProcessor是之前就讲过的后置处理器。

这是非常麻烦的，所以我们使用\<context:annotation- config/>就是激活那些已经在spring容器里注册过的bean上面的注解，也就是隐式地向Spring容器注册AutowiredAnnotationBeanPostProcessor、RequiredAnnotationBeanPostProcessor、CommonAnnotationBeanPostProcessor以及PersistenceAnnotationBeanPostProcessor这4个BeanPostProcessor。让这些后置处理器处理注释来配置注释过的类。

&emsp;

## 源码解释

