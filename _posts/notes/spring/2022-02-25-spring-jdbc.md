---
layout: post
title: "数据库操作"
date: 2022-02-25 23:13:22 +0800
categories: notes spring base
tags: Spring 基础 JdbcTemplate 事务管理
excerpt: "数据库操作"
---

JDBC已经能够满足大部分用户最基本的需求，但是在使用JDBC时，必须自己来管理数据库资源如：获取PreparedStatement，设置SQL语句参数，关闭连接等步骤。

​JdbcTemplate是Spring对JDBC的一层薄封装，目的是使JDBC更加易于使用。JdbcTemplate是Spring的一部分。JdbcTemplate处理了资源的建立和释放。他帮助我们避免一些常见的错误，比如忘了总要关闭连接。他运行核心的JDBC工作流，如Statement的建立和执行，而我们只需要提供SQL语句和提取结果。

其中操作关系型数据的有JdbcTemplate和HibernateTemplate，操作nosql型数据的RedisTemplates以及操作消息队列的JmsTemplates。

## JdbcTemplate

### &emsp;建立工程

使用[标准Spring项目XML模板：Spring/basic_xml](https://github.com/Didnelpsun/Spring/tree/master/basic_xml)。

需要spring-jdbc、spring-tx（Spring事务管理）、mysql-connector-java的依赖：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>${spring.version}</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-tx</artifactId>
    <version>${spring.version}</version>
</dependency>
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version>
</dependency>
```

然后使用MyBatis所使用的user表，并在entity中定义User类并把HelloWorld.java删掉：

```java
// User.java
package org.didnelpsun.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

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
    }

    public User(Integer id, String name, String sex, Date birthday, String address){
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }

    public User(String name, String sex, Date birthday, String address){
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }
}
```

### &emsp;基本使用

一般如果是只使用Java代码，则应该配置数据源等：

```java
// App.java
package org.didnelpsun;
// 引入ApplicationContext容器
import org.springframework.context.ApplicationContext;
// 引入支持XML配置的context容器
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.sql.DriverManager;

//项目入口
public class App
{
    public static void main(String[] args){
        // 准备Spring的内部数据源
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost:3306/data");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        // 1.创建JdbcTemplate对象
        JdbcTemplate jdbcTemplate = new JdbcTemplate();
        // 设置数据源
        jdbcTemplate.setDataSource(dataSource);
        // 2.执行操作
        jdbcTemplate.execute("select * from user");
    }
}
```

若是使用Spring，可以在XML中配置对应的参数：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <!--配置JdbcTemplate-->
    <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource" />
    </bean>
    <!--内置数据源-->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver" />
        <property name="url" value="jdbc:mysql://localhost:3306/data" />
        <property name="username" value="root" />
        <property name="password" value="root" />
    </bean>
</beans>
```

修改App.java：

```java
// App.java
package org.didnelpsun;
// 引入ApplicationContext容器
import org.springframework.context.ApplicationContext;
// 引入支持XML配置的context容器
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.sql.DriverManager;

//项目入口
public class App
{
    public static void main(String[] args){
        // 1.获取容器
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        JdbcTemplate jdbcTemplate = applicationContext.getBean("jdbcTemplate", JdbcTemplate.class);
        // 2.执行操作
        jdbcTemplate.execute("select * from user");
    }
}
```

### &emsp;CRUD

对于CRUD，可以调用JdbcTemplate对象的相关方法：

+ update方法：用于更新数据，即插入、更新、删除。返回值为SQL语句匹配的行数，若找不到对应的数据则返回0，找到一条则返回1。Spring已经自动提交事务了，不需要手动commit。
+ query方法：用于查询数据，常用的有：
  + `query(String var1, @Nullable Object[] var2, RowMapper<T> var3)`：所有版本都可以使用。
  + `query(String var1, RowMapper<T> var2, @Nullable Object... var3)`：只能在JDK1.5之后使用，第三个参数是可变参数，可以有也可以没有。
  + 其中RowMapper是用来保存返回结果集的列表接口，是一个结果封装工具，参数的类型必须实现这个接口，其中有一个mapRow方法，把结果集中的数据封装到泛型中（这里是User类），最后返回一个List。
  + Spring也提供了对象封装到集合的方法，即`BeanPropertyRowMapper<User>(User.class)`方法，可以不用自己实现接口。
+ queryForObject：查询一行。有三个参数，第一个是sql语句，第二个是返回类型即`类.class`，第三个是可变参数。

```java
// App.java
package org.didnelpsun;
// 引入ApplicationContext容器
import org.didnelpsun.entity.User;
import org.springframework.context.ApplicationContext;
// 引入支持XML配置的context容器
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

//项目入口
public class App
{
    public static void main(String[] args){
        // 1.获取容器
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        JdbcTemplate jdbcTemplate = applicationContext.getBean("jdbcTemplate", JdbcTemplate.class);
        // 2.执行操作
//        List<User> users = jdbcTemplate.query("select * from user",new UserRowMappper());
        List<User> users = jdbcTemplate.query("select * from user",new BeanPropertyRowMapper<User>(User.class));
        for(User user : users){
            System.out.println(user);
        }
    }
}

class UserRowMappper implements RowMapper<User> {
    @Override
    public User mapRow(ResultSet resultSet, int i) throws SQLException {
        User user = new User(resultSet.getInt("id"), resultSet.getString("name"),
                resultSet.getString("sex"), resultSet.getDate("birthday"),
                resultSet.getString("address"));
        return user;
    }
}
```

### &emsp;三层架构

添加持久层：

```java
// UserDAOInterface.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import java.util.List;

public interface UserDAOInterface {
    User selectUser(Integer id);
    List<User> selectUsersByName(String name);
    List<User> selectAllUsers();
    int insertUser(User user);
    int updateUser(User user);
    int deleteUser(Integer id);
}
```

```java
// UserDAO.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

public class UserDAO implements UserDAOInterface{
    // 定义一个JdbcTemplate进行操作
    private JdbcTemplate jdbcTemplate;
    // Spring注入
    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    @Override
    public User selectUser(Integer id) {
        return jdbcTemplate.query("select * from user where id = ?",
                new BeanPropertyRowMapper<>(User.class), id).get(0);
    }
    @Override
    public List<User> selectUsersByName(String name) {
        return jdbcTemplate.query("select * from user where name like \'%" + name + "%\'",
                new BeanPropertyRowMapper<>(User.class));
    }
    @Override
    public List<User> selectAllUsers() {
        return jdbcTemplate.query("select * from user",
                new BeanPropertyRowMapper<>(User.class));
    }
    @Override
    public int insertUser(User user) {
        return jdbcTemplate.update("insert into user(name,sex,birthday,address) values (?,?,?,?);",
                user.getName(), user.getSex(),user.getBirthday(),user.getAddress());
    }
    @Override
    public int updateUser(User user) {
        return jdbcTemplate.update("update user set name=?,sex=?,birthday=?,address=? where id=?;",
                user.getName(), user.getSex(),user.getBirthday(),user.getAddress(), user.getId());
    }
    @Override
    public int deleteUser(Integer id) {
        return jdbcTemplate.update("delete from user where id=?", id);
    }
}
```

添加业务层：

```java
// UserServiceInterface.java
package org.didnelpsun.service;

import org.didnelpsun.entity.User;
import java.util.List;

public interface UserServiceInterface {
    User selectUser(Integer id);
    List<User> selectUsersByName(String name);
    List<User> selectAllUsers();
    int insertUser(User user);
    int updateUser(User user);
    int deleteUser(Integer id);
}
```

```java
// UserService.java
package org.didnelpsun.service;

import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import java.util.List;

public class UserService implements UserServiceInterface {
    // 私有的DAO
    private UserDAO userDAO;
    // Spring注入
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
    @Override
    public User selectUser(Integer id) {
        return userDAO.selectUser(id);
    }
    @Override
    public List<User> selectUsersByName(String name) {
        return userDAO.selectUsersByName(name);
    }
    @Override
    public List<User> selectAllUsers() {
        return userDAO.selectAllUsers();
    }
    @Override
    public int insertUser(User user) {
        return userDAO.insertUser(user);
    }
    @Override
    public int updateUser(User user) {
        return userDAO.updateUser(user);
    }
    @Override
    public int deleteUser(Integer id) {
        return userDAO.deleteUser(id);
    }
}
```

添加XML配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <!--配置持久层-->
    <bean id="userDAO" class="org.didnelpsun.dao.UserDAO">
        <property name="jdbcTemplate" ref="jdbcTemplate" />
    </bean>
    <!--配置JdbcTemplate-->
    <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource" />
    </bean>
    <!--内置数据源-->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver" />
        <property name="url" value="jdbc:mysql://localhost:3306/data" />
        <property name="username" value="root" />
        <property name="password" value="root" />
    </bean>
    <!--配置业务层-->
    <bean id="userService" class="org.didnelpsun.service.UserService">
        <property name="userDAO" ref="userDAO" />
    </bean>
</beans>
```

调用业务层操作：

```java
// App.java
package org.didnelpsun;
// 引入ApplicationContext容器
import org.didnelpsun.entity.User;
import org.didnelpsun.service.UserService;
import org.springframework.context.ApplicationContext;
// 引入支持XML配置的context容器
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

//项目入口
public class App
{
    public static void main(String[] args){
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        // 2.执行操作
        UserService userService = applicationContext.getBean("userService", UserService.class);
        List<User> users = userService.selectAllUsers();
        printList(users);
        User user = userService.selectUser(1);
        user.setSex("男");
        userService.updateUser(user);
        System.out.println("更新后：");
        users = userService.selectAllUsers();
        printList(users);
        System.out.println("模糊查询：");
        users = userService.selectUsersByName("黄");
        printList(users);
        Calendar calendar = Calendar.getInstance();
        calendar.set(2000, Calendar.APRIL,14);
        user = new User("测试","男", calendar.getTime(),"测试" );
        userService.insertUser(user);
        System.out.println("插入后：");
        users = userService.selectAllUsers();
        printList(users);
        user = userService.selectUsersByName("测").get(0);
        userService.deleteUser(user.getId());
        System.out.println("删除后：");
        users = userService.selectAllUsers();
        printList(users);
    }
    // 打印函数
    static public <T> void printList(List<T> list){
        for(T item : list){
            System.out.println(item);
        }
    }
}

class UserRowMappper implements RowMapper<User> {
    @Override
    public User mapRow(ResultSet resultSet, int i) throws SQLException {
        return new User(resultSet.getInt("id"), resultSet.getString("name"),
                resultSet.getString("sex"), resultSet.getDate("birthday"),
                resultSet.getString("address"));
    }
}
```

此外，还可以让UserDAO继承org.springframework.jdbc.core.support.JdbcDaoSupport类，这样我们就不用在DAO层定义JdbcTemplate，直接调用`super.getJdbcTemplate`就可以获得。