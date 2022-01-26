---
layout: post
title:  "CRUD操作"
date:   2022-01-26 16:08:33 +0800
categories: notes mybatis base
tags: MyBatis 基础 CRUD
excerpt: "基于代理DAO进行CRUD"
---

## CRUD基本流程

以查询所有为例，即调用SelectList方法：

1. SqlSessionFactoryBuilder接受SqlMapConfig.xml文件流，构建出SqlSessionFactory对象。
2. SqlSessionFactory读取SqlMapConfig.xml读取SqlMapConfig.xml中连接数据库和mapper映射信息，用来生产出真正操作数据库的SqlSession对象。
3. SqlSession对象的两个作用：无论哪个分支，除了连接数据库信息，还需要得到SQL语句：
   + 生成接口代理对象。
   + 定义通用CRUD方法。
4. SqlSessionImpl对象是SqlSession所实现的接口，有两种使用方式：
   + getMapper方法：①先用SqlSessionFactory读取的数据库连接信息创建Connection对象。②通过JDK代理模式创建出代理对象作为getMapper方法返回值。主要工作是创建代理时第三个参数处理类中得到SQL语句。③执行对应CRUD操作。
   + CRUD方法（selectList、selectOne、Insert等）：①用SqlSessionFactory读取的数据库连接信息创建出JDBC的Connection对象。②直接得到SQL语句，使用JDBC的Connection对象进行CRUD操作。
5. 封装结果集。无论是使用代理对象还是通用CRUD方法，都要对返回的数据库结果集进行封装，变成Java对象返回给调用者，所以必须知道调用者所需要的返回类型。
