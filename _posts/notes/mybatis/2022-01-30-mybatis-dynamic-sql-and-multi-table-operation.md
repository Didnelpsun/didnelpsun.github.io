---
layout: post
title:  "动态SQL与多表操作"
date:   2022-01-30 22:44:20 +0800
categories: notes mybatis base
tags: MyBatis 基础 动态 多表
excerpt: "SQL动态注入与多表联合"
---

使用[案例三代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo3_crud_by_proxy)。

然后在UserDAO.xml和UserDAO.java以及AppTest.java中将所有的CUD方法全部删掉，只留下查询方法，在UserDAO.xml中：

```java
// 查询所有用户
List<User> selectAllUsers();
// 查询一个用户
User selectUser(Integer id);
// 根据用户名模糊查询用户
List<User> selectUsersByName(String name);
// 根据查询条件对象Query混合模糊查询
List<User> selectUsersByQuery(Query query);
```

## 动态SQL

此时我们可以看到上面所说的查询都是按某个条件查询的，即如果要通过id查询就使用selectUser方法，如果通过name查询就是selectUsersByName方法。

而如果我们不确定具体查询条件是什么，或者说查询条件不止是一个属性那如何查询呢？我们需要把这些条件都综合起来，即创建一个方法概括以上所有方法，传入一个User对象作为参数进行查询而不用管到底选择哪一个方法`List<User> selectUsersByCondition(User user);`。

UserDAO.xml为：

```xml
<select id="selectUsersByCondition" parameterType="org.didnelpsun.entity.User" resultType="org.didnelpsun.entity.User">
    <!--注意SQL语句后不要加上分号，否则MyBatis会认为语句已经结束从而报错-->
    select * from user where 0=0
    <!--在进行并操作时不能使用&而只能使用and，因为&会被识别为java关键字-->
    <!-- <if test="name!=null">
        name=#{name}
    </if> -->
    <if test="id!=null">
        and id=#{id} 
    </if>
    <if test="name!=null">
        and name=#{name} 
    </if>
    <if test="sex!=null">
        and sex=#{sex} 
    </if>
    <if test="birthday!=null">
        and birthday=#{birthday} 
    </if>
    <if test="address!=null">
        and address=#{address} 
    </if>
    <!--最后应该以分号结尾-->
    ;
</select>
```

然后定义一个测试类：

```java
// 测试条件查询
public void testSelectUsersByCondition() {
    User u = new User();
    u.setId(1);
    u.setSex("男");
    List<User> users = userDAO.selectUsersByCondition(u);
    for (User user : users) {
        System.out.println(user.toString());
    }
}
```

由于使用等号所以不能进行模糊查询。

## 多表操作
