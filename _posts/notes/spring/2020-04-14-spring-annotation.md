---
layout: post
title: "Spring注释总结"
date: 2020-04-14 13:13:55 +0800
categories: notes spring senior
tags: spring 高级
excerpt: "相关注释与使用"
---

Spring现在一般都是采用注释来操作，如之前的用注释进行实例化，自动注入等都是使用方式。下面会讲到一些之前没有使用过的注释。

## @Conditional

## @Profile

指定组件在哪个环境的情况下才能被注册到容器中，不指定，任何环境下都能注册这个组件：
  
1. 加了环境标识的bean，只有这个环境被激活的时候才能注册到容器中。默认是default环境。
2. 写在配置类上，只有是指定的环境的时候，整个配置类里面的所有配置才能开始生效。

## @Lazy

## @Primary

## @PropertySource

## @Value

## @Test

参照地址<https://www.jianshu.com/p/75de79fba705><https://www.cnblogs.com/cxuanBlog/p/11179439.html><https://www.jianshu.com/p/23a960f369dc><https://www.cnblogs.com/xiaoxi/p/5935009.html><https://www.jianshu.com/p/71e8971d2bc5?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation>
