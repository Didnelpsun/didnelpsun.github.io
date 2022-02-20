---
layout: post
title: "面向切面AOP"
date: 2020-04-07 15:41:25 +0800
categories: notes spring base
tags: Spring 基础 AOP
excerpt: "面向切面编程"
---

前面是Spring的第一个核心概念IoC，而现在是第二个核心概念AOP。

## 动态代理

### &emsp;创建工程

使用[标准Spring项目XML模板：Spring/basic_xml](https://github.com/Didnelpsun/Spring/tree/master/basic_xml)。

将SpringBeans.xml中所有Bean配置全部删除。由于业务层引用持久层，表现层引用业务层，所以新建一个dao包：

```java
// UserDAOInterface.java
package org.didnelpsun.dao;

public interface UserDAOInterface {
    // 插入用户方法
    void insertUser();
}
```

```java
// UserDAO.java
package org.didnelpsun.dao;

public class UserDAO implements UserDAOInterface{
    @Override
    public void insertUser() {
        System.out.println("UserDAO-insertUser");
    }
}
```

建立service层：

```java
// UserServiceImplement.java
package org.didnelpsun.service;

// 用户业务层接口
public interface UserServiceInterface {
    // 插入用户
    boolean insertUser();
}
```

```java
// UserService.java
package org.didnelpsun.service;

import org.didnelpsun.dao.UserDAO;

public class UserService implements UserServiceInterface{
    // 业务层调用持久层，需要依赖注入
    private UserDAO userDAO = new UserDAO();
    @Override
    public boolean insertUser() {
        System.out.println("UserService-insertUser");
        userDAO.insertUser();
    }
}
```

将App.java移动到view包下：

```java
// App.java
package org.didnelpsun.view;

import org.didnelpsun.service.UserService;

import java.sql.SQLException;

//项目入口
public class App
{
    public static void main(String[] args) throws SQLException {
        // 表现层调用业务层
        UserService userService = new UserService();
        Boolean result = userService.insertUser();
        System.out.println(result);
    }
}
```

最后entity下面新建一个User类：

```java
// User.java
package org.didnelpsun.entity;

import java.io.Serializable;
import java.util.Date;

public class User implements Serializable{
    private Integer id;
    private String name;
    private String sex;
    private Date birthday;
    private String address;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public String toString(){
        return "User{" + "id=" + this.id + ",name=" + this.name + ",birthday=" + this.birthday + ",sex=" + this.sex + ",address=" + this.address + "}";
    }

    public User() {
        System.out.println("UserClass");
    }

    public User(Integer id, String name, String sex, Date birthday, String address){
        System.out.println("UserClass");
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }

    public User(String name, String sex, Date birthday, String address){
        System.out.println("UserClass");
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }
}
```

### &emsp;添加事务

对于多个CRUD操作合在一起时可能某个步骤出错导致产生脏数据，所以对于一个数据操作某个操作部分失败事务必须回滚。

所以每个数据操作都必须在一个线程上，否则会被其他线程干扰。可以建立连接线程类来建立包含连接操作的线程：

```java
// ConnectionThread.java
package org.didnelpsun.utils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

// 从数据源获取连接并实现和线程的绑定
public class ConnectionThread {
    private ThreadLocal<Connection> connectionThreadLocal = new ThreadLocal<Connection>();
    // 不能自己定义，只能等待Spring的注入
    private DataSource dataSource;
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    // 获取当前线程上的连接
    public Connection getThreadConnection() throws SQLException {
        // 从ThreadLocal上获取连接
        Connection connection = connectionThreadLocal.get();
        // 判断当前线程上是否有连接
        if (connection == null){
            // 没有就从数据源获取一个连接并存入ThreadLocal中绑定
            connection = dataSource.getConnection();
            // 把连接存入线程
            connectionThreadLocal.set(connection);
        }
        return connection;
    }
    // 将连接从线程上移除解绑
    public void removeThreadConnection(){
        connectionThreadLocal.remove();
    }
}
```

然后在utils包下新建对应的事务管理类，对建立连接的线程进行事务管理，其实Connection类本身就具有事务管理，这是对事务管理的再封装：

```java
// TransactionManager.java
package org.didnelpsun.utils;

import java.sql.SQLException;

// 事务管理工具类，包括开启事务、提交事务、回滚事务、释放连接
public class TransactionManager {
    // 获取连接，需要Spring注入
    private ConnectionThread connectionThread;
    public void setConnectionThread(ConnectionThread connectionThread) {
        this.connectionThread = connectionThread;
    }
    public void begin() throws SQLException {
        // 将获取到的连接的自动提交关闭
        this.connectionThread.getThreadConnection().setAutoCommit(false);
    }
    public void commit() throws SQLException {
        this.connectionThread.getThreadConnection().commit();
    }
    public void rollback() throws SQLException {
        this.connectionThread.getThreadConnection().rollback();
    }
    public void release() throws SQLException {
        // 将连接还回连接池
        this.connectionThread.getThreadConnection().close();
        // 将连接与线程解绑
        this.connectionThread.removeThreadConnection();
    }
}
```

然后在业务层就可以使用业务管理修改对应的操作：

```java
// UserService.java
package org.didnelpsun.service;

import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.utils.TransactionManager;

import java.sql.SQLException;

public class UserService implements UserServiceInterface{
    // 业务层调用持久层，需要依赖注入
    private UserDAO userDAO;
    // 需要业务管理，需要依赖注入
    private TransactionManager transactionManager;
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
    public void setTransactionManager(TransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }
    @Override
    public boolean insertUser() throws SQLException {
        System.out.println("UserService-insertUser");
        try{
            // 1.开启事务
            transactionManager.begin();
            // 2.执行操作
            userDAO.insertUser();
            // 3.提交事务
            transactionManager.commit();
            // 4.返回结果
            return true;
        }
        catch (Exception e){
            // 5.回滚事务
            System.out.println(e);
            transactionManager.rollback();
            return false;
        }
        finally {
            // 6.释放连接
            transactionManager.release();
        }
    }
}
```

UserService的transactionManager和transactionManager的connectionThread等都需要Spring注入：

```xml
<bean id="userService" class="org.didnelpsun.service.UserService">
    <property name="userDAO" ref="userDAO" />
    <property name="transactionManager" ref="transactionManager" />
</bean>
<bean id="userDAO" class="org.didnelpsun.dao.UserDAO" />
<bean id="transactionManager" class="org.didnelpsun.utils.TransactionManager">
    <property name="connectionThread" ref="connectionThread" />
</bean>
<bean id="connectionThread" class="org.didnelpsun.utils.ConnectionThread">
    <property name="dataSource" ref="dataSource" />
</bean>
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <!--配置数据库连接的基本信息-->
    <!--jdbc驱动程序-->
    <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"/>
    <!--数据库连接字符串-->
    <property name="url" value="jdbc:mysql://localhost:3306/data"/>
    <property name="username" value="root"/>
    <property name="password" value="root"/>
</bean>
```

且注意需要在pom.xml中加上两个依赖：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>${spring.version}</version>
</dependency>
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version>
</dependency>
```

并且注意org.springframework.jdbc.datasource.DriverManagerDataSource这个类只提供连接而不提供连接池，这里只是示范所以不使用池，如果需要使用池则应该使用org.apache.commons.dbcp.BasicDataSource或org.springframework.jndi.JndiObjectFactoryBean。

由于其他CRUD操作也需要事务控制，所以其他的如更新用户方法也同样需要使用我们自定义的事务操作方法，从而造成了大量的代码冗余和方法之间的依赖。

所以为了方法解耦，让我们不需要重新自定义事务控制造成大量冗余代码和方法耦合，就需要动态代理。（上面对事务管理Connection添加为ThreadConnection类就属于增强方法，是装饰者模式，即ThreadConnection对Connection进行装饰）

### &emsp;特点

+ 字节码随用随创建，随用随加载。
+ 在不修改源码的基础上对方法增强。

常用的方法增强（即扩充方法功能）的方式有三种。

1. 类继承、方法覆盖：必须控制对象创建，才能使用该方式。
2. 装饰者模式：必须和目标对象实现相同接口或继续相同父类，特殊构造器（传入被包装对象）。
3. 动态代理。

类别：

+ 基于接口的动态代理。
+ 基于子类的动态代理。

使用`Proxy.newProxyInstance()`方法进行创建代理，对应三个参数：

+ ClassLoader：类加载器。用于加载代理对象字节码。和被代理对象使用相同的类加载器。是固定写法：`被代理对象类.getClass().getClassLoader()`。
+ Class[]：字节码数组。用于让代理对象和被代理对象具有相同的方法。也是固定写法：`被代理对象类.getClass().getInterfaces()`。
+ InvocationHandler：用于提供增强方法。让我们写如何代理，一般都是一个该接口的实现类，一般为匿名内部类，但是不是必须的。需要`new InvocationHandler(){@Override public Object invoke(Object proxy, Method method, Object[] args) throws Throwalbe {}}`。

&emsp;

## AOP

### &emsp;概念

### &emsp;XML方式

### &emsp;注解方式
