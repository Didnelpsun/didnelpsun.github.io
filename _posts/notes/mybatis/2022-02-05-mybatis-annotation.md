---
layout: post
title:  "注解开发"
date:   2022-02-05 23:35:04 +0800
categories: notes mybatis base
tags: MyBatis 基础 注解
excerpt: "注解开发"
---

之前的XML文件主要有两个，一个是resources文件夹中的SqlMapConfig.xml用来配置MyBatis整体，一个是resources下面的DAO文件夹下的与实体类DAO操作的Java文件对应的DAO.xml。

## 改造构建

使用[案例一代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo1_build_xml)。

不用编写DAO文件与编写DAO配置，直接将java/resources下的org.didnelpsun.dao文件夹删除。

然后更改UserDAO，给对应方法加上注解，里面是SQL语句：

```java
public interface UserDAO {
    // 查询所有用户
    @Select("select * from user")
    List<User> selectAllUsers();
}
```

然后对SqlMapConfig.xml更改对应的DAO的mapper的resource属性，使用class属性指定被注解的dao全限定类名：

```xml
<mappers>
    <!--class是对应dao的全限定类名-->
    <mapper class="org.didnelpsun.dao.UserDAO"/>
</mappers>
```

最后结果是一样的。

所以注解是什么意思呢？就是DAO实现方式的简化。若是我们自己写selectAllUsers方法，就必须接受一个SessionFactory然后对这个Session进行处理，并进行对应的操作，而使用注解或XML就直接写一个SQL语句就可以了，其他的对应的Session维护代码由MyBatis自动完成。

[案例八注解方式构建代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo8_annotation_build)。

&emsp;

## 基本CRUD

## 复杂关系
