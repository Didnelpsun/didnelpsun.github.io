---
layout: post
title:  "自定义DAO的CRUD操作"
date:   2022-01-28 14:42:27 +0800
categories: notes mybatis base
tags: MyBatis 基础 编写 CRUD
excerpt: "基于自定义DAO进行CRUD"
---

使用[案例一代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo1_build_xml)。

由于实际开发中基本上都是使用代理DAO，所以使用自定义DAO的机会较少。

## 实现DAO层

### DAO实现类

使用MyBatis的XML方式代理DAO时就是使用XML来实现UserDAO.java文件，而我们自定义DAO就是需要自己定义一个UserDAO的实现类。

在main\java\org\didnelpsun\dao下新建一个implement文件夹，下面新建一个文件UserDAOImplement：

#### 简单查询

```java
package org.didnelpsun.dao.implement;

import java.util.List;

import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

public class UserDAOImplement implements UserDAO {

    // 定义一个私有SqlSession工厂
    private SqlSessionFactory factory;

    public void setFactroy(SqlSessionFactory factory){
        this.factory = factory;
    }

    public SqlSessionFactory getFactory(){
        return this.factory;
    }

    public UserDAOImplement(SqlSessionFactory factory){
        this.factory = factory;
    }

    @Override
    public List<User> selectAllUsers() {
        // 1.根据factory获取SqlSession对象
        SqlSession session = factory.openSession();
        // 2.调用SqlSession中的方法实现查询列表
        // 参数就是能获取配置信息的key，即在resources/org/didnelpsun/dao/UserDAO.xml中的配置信息
        // key为对应的mapper标签的namespace属性"org.didnelpsun.dao.UserDAO"+对应的标签id属性
        List<User> users = session.selectList("org.didnelpsun.dao.UserDAO.selectAllUsers");
        // 3.释放资源
        session.close();
        return users;
    }
    @Override
    public User selectUser(Integer id) {
        // 1.根据factory获取SqlSession对象
        SqlSession session = factory.openSession();
        // 2.调用SqlSession中的方法实现
        User user = session.selectOne("org.didnelpsun.dao.UserDAO.selectUser", id);
        // 3.释放资源
        session.close();
        return user;
    }
}
```

#### 插入

```java
@Override
public void insertUser(User user) {
    // 1.根据factory获取SqlSession对象
    SqlSession session = factory.openSession();
    // 2.调用SqlSession中的方法
    session.insert("org.didnelpsun.dao.UserDAO.insertUser");
    // 3.提交事务
    session.commit();
    // 4.释放资源
    session.close();
}
```

这时候你会发现插入失败，因为方法使用不对，应该是`session.insert("org.didnelpsun.dao.UserDAO.insertUser", user);`。

#### 更新

```java
@Override
public void updateUser(User user) {
    // 1.根据factory获取SqlSession对象
    SqlSession session = factory.openSession();
    // 2.调用SqlSession中的方法
    session.update("org.didnelpsun.dao.UserDAO.updateUser", user);
    // 3.提交事务
    session.commit();
    // 4.释放资源
    session.close();
}
```

#### 删除

```java
@Override
public void deleteUser(Integer id) {
    // 1.根据factory获取SqlSession对象
    SqlSession session = factory.openSession();
    // 2.调用SqlSession中的方法
    session.delete("org.didnelpsun.dao.UserDAO.deleteUser", id);
    // 3.提交事务
    session.commit();
    // 4.释放资源
    session.close();
}
```

### 编写测试类

然后编写测试文件，模仿[案例三代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo3_crud_by_proxy)：

```java
package org.didnelpsun;

//import static org.junit.Assert.assertTrue;
import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.dao.implement.UserDAOImplement;
import org.didnelpsun.entity.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class AppTest {
    private InputStream in;
    private UserDAO userDAO;

    // 测试之前执行
    @Before
    public void init() {
        // 1.读取配置文件
        in = null;
        try {
            in = Resources.getResourceAsStream("SqlMapConfig.xml");
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 2.创建SqlSessionFactory工厂
        // SqlSessionFactory不能new
        SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(in);
        // 3.使用工厂对象创建DAO对象
        userDAO = new UserDAOImplement(factory);
    }

    // 测试之后执行
    @After
    public void destroy() throws Exception {
        assert in != null;
        in.close();
    }

    @Test
    public void Test() {
        // 5.使用自定义对象执行方法
        testSelectAllUsers();
    }

    // 测试查询所有用户
    public void testSelectAllUsers() {
        List<User> users = userDAO.selectAllUsers();
        for (User user : users) {
            System.out.println(user.toString());
        }
    }

    // 测试插入用户
    public void testInsertUser() {
        Calendar c = Calendar.getInstance();
        c.set(2000, 2, 14);
        Date d = new Date();
        d = c.getTime();
        User user = new User("蓝新煜", "男", d, "福建省福州市");
        userDAO.insertUser(user);
    }

    // 测试更新用户
    public void testUpdateUser() {
        Calendar c = Calendar.getInstance();
        c.set(1998, 8, 21);
        Date d = new Date();
        d = c.getTime();
        User user = new User(2, "黄康", "男", d, "湖北省鄂州市");
        userDAO.updateUser(user);
    }

    // 测试删除用户
    public void testDeleteUser() {
        userDAO.deleteUser(3);
    }

    // 测试查询用户
    public void testSelectUser() {
        User user = userDAO.selectUser(1);
        System.out.println(user.toString());
    }

    // 测试根据名称查询用户
    public void testSelectUsersByName() {
        List<User> users = userDAO.selectUsersByName("%黄%");
        for (User user : users) {
            System.out.println(user.toString());
        }
    }

    // 测试获取用户总数
    public void testGetUsersSum() {
        System.out.println("用户总数为：" + userDAO.getUsersSum());
    }
```
