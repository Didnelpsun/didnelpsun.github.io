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

&emsp;

## 事务控制

此前的事务控制是基于动态代理的，而此时是Spring框架提供的一组事务控制的接口，在spring-tx包中，基于AOP，可以用代码实现也可以用配置实现。

### &emsp;相关接口

#### &emsp;&emsp;PlatformTransactionManager

提供事务操作的方法，有三个具体操作：

+ 获取事务状态信息：`TransactionStatus getTranscation(TransactionDefinition definition)`。
+ 提交事务：`void commit(TransactionStatus status)`。
+ 回滚事务：`void rollback(TransactionStatus status)`。

具体的实现类对象有：

+ `org.springframework.jdbc.datasource.DataSourceTransactionMananger`：使用JDBC或iBatis进行持久化数据时使用。
+ `org.springframework.orm.hibernate5.HiberstateTransactionManager`：使用Hibernate版本进行持久化数据时使用。

#### &emsp;&emsp;TransactionDefinition

是事务的定义信息，有如下方法：

+ 获取事务对象名称：`String getName()`。
+ 获取事务隔离级别：`int getIsolationLevel()`。
+ 获取事务传播行为：`int getPropagationBehavior()`。
+ 获取事务超时时间：`int getTimeout()`。默认是-1没有超时限制，若有则以秒为单位设置。
+ 获取事务是否只读：`boolean isReadOnly()`。查询时设置为只读。

事务隔离级反映事务提交并发访问时的处理态度：

+ ISOLATION_DEFAULT：默认级别，归属下列某一种。
+ ISOLATION_READ_UNCOMMITTED：可以读取未提交数据。
+ ISOLATION_READ_COMMITTED：只能读取已提交数据，解决脏读问题（Oracle默认级别）。
+ ISOLATION_REPEATABLE_READ：是否读取其他事务提交修改后的效据，解决不可重复读问题（MySQL默认级别）。
+ ISOLATION_SERIALIZABLE：是否读取其他事务提交添加后的数据，解决幻影读问题。

事务传播行为（propagation behavior）指的就是当一个事务方法被另一个事务方法调用时，这个事务方法应该如何进行。例如A事务方法调用B事务方法时，B是继续在调用者A的事务中运行呢，还是为自己开启一个新事务运行，这就是由B的事务传播行为决定的。

@TransactionAttribute注释可以替代getPropagationBehavior的部分使用条件，用作定义一个需要事务的方法。它可以有以下参数。如果没有指定参数，@TransactionAttribute注释使用REQUIRED作为默认参数。没有NEVER和NESTED数值：

+ PROPAGATION_REQUIRED：方法在一个事务中执行，如果调用的方法已经在一个事务中，则使用该事务，否则将创建一个新的事务。
+ PROPAGATION_SUPPORTS：如果方法在一个事务中被调用，则使用该事务，否则不使用事务。
+ PROPAGATION_MANDATORY：方法必须在一个事务中执行，也就是说调用的方法必须已经有一个事务，否则新抛出一个错。
+ PROPAGATION_REQUIRES_NEW：方法将在一个新的事务中执行，如果调用的方法已经在一个事务中，则暂停旧的事务。
+ PROPAGATION_NOT_SUPPORTED：以非事务方式运行，如果方法在一个事务中被调用，将抛出一个错误（ERROR）并挂起事务。
+ PROPAGATION_NEVER：以非事务方式运行，若存在事务，则抛出异常。
+ PROPAGATION_NESTED：若当前存在事务，则在嵌套事务内执行，若当前没有事务，则按照REQUIRED方式执行。

#### &emsp;&emsp;TransactionStatus

提供事务的具体运行状态信息：

+ 刷新事务：`void flush()`。
+ 获取事务是否存在存储点：`boolean hasSavepoint()`。
+ 获取事务是否完成：`boolean isCompleted()`。
+ 获取事务是否为新的事务：`boolean isNewTransaction()`。
+ 获取事务是否回滚：`boolean isRollbackOnly()`。
+ 设置事务回滚：`void setRollbackOnly()`。

### &emsp;XML方式配置事务管理

由于进行事务控制是基于AOP的，所以添加AOP依赖：

```xml
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.8</version>
</dependency>
```

然后XML配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/aop
       http://www.springframework.org/schema/aop/spring-aop.xsd
       http://www.springframework.org/schema/tx
       http://www.springframework.org/schema/tx/spring-tx.xsd
">
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
    <!--基于XML的事务控制配置-->
    <!--1.配置事务管理器-->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource" />
    </bean>
    <!--2.配置事务的通知-->
    <tx:advice id="interceptor" transaction-manager="transactionManager">
        <!--5.配置事务的属性-->
        <!--即需要事务控制的方法-->
        <!--
            isolation：用于指定事务的隔离级别，默认为DEFAULT，使用数据库的默认隔离级别。
            propagation：用于指定事务的传播行为，默认为REQUIRED，表示一定有事务，是增删改的选择，查询可以用SUPPORT。
            read-only：用于指定事务是否只读，默认false，表示读写，只有查询才能设置为true。
            timeout：用于指定事务的超时时间，默认值是-1，表示永不超时，如果指定了数值则以秒为单位。
            rollback-for：用于指定一个异常，当产生该异常时事务回滚，产生其他异常时事务不回滚。没有默认值，表示任何异常都回滚
            no-rollback-for：用于指定一个异常，当产生该异常时不事务回滚，产生其他异常时事务回滚。没有默认值，表示任何异常都回滚
        -->
        <tx:attributes>
            <!--name可以使用通配符-->
            <tx:method name="select*" propagation="SUPPORTS" read-only="true"/>
        </tx:attributes>
    </tx:advice>
    <!--3.配置AOP中的通用切入点表达式-->
    <aop:config>
        <!--切入点表达式-->
        <aop:pointcut id="expression" expression="execution(public * *..service.*Service.*User*(..))"/>
        <!--4.建立事务通知和切入点表达式之间的关系-->
        <aop:advisor advice-ref="interceptor" pointcut-ref="expression" />
    </aop:config>
</beans>
```

[案例十XML方式事务控制：Spring/demo10_jdbc_xml](https://github.com/Didnelpsun/Spring/tree/master/demo10_jdbc_xml)。

### &emsp;注解方式配置事务管理

直接在[案例十XML方式事务控制：Spring/demo10_jdbc_xml](https://github.com/Didnelpsun/Spring/tree/master/demo10_jdbc_xml)的基础上修改。

将[案例十XML方式事务控制：Spring/demo10_jdbc_xml](https://github.com/Didnelpsun/Spring/tree/master/demo10_jdbc_xml)的src覆盖到[标准Spring项目注释模板：Spring/basic_annotation](https://github.com/Didnelpsun/Spring/tree/master/basic_annotation)的src。覆盖pom.xml。

将resources的SpringBeans.xml删掉，将entity的HelloWorld类删掉。

修改App.java：

```java
// UserDAO.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Repository;
import java.util.List;

@PropertySource("classpath:data.properties")
@Repository("userDAO")
public class UserDAO implements UserDAOInterface{
    // 配置DataSource
    @Value("${driver}")
    private String driver;
    @Value("${url}")
    private String url;
    @Value("${name}")
    private String username;
    @Value("${password}")
    private String password;
    private DriverManagerDataSource dataSource;
    // 定义一个JdbcTemplate进行操作
    private JdbcTemplate jdbcTemplate;
    // 此时注入必须用@Qualifier标明名字，因为setJdbcTemplate会默认找名为jdbcTemplate的实例
    // JdbcTemplate实例化必须同时设置datasource，否则会报错，所以必须在getJdbcTemplate方法中设置
    @Autowired
    @Qualifier("template")
    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    @Bean("template")
    @Autowired
    @Qualifier("dataSource")
    public JdbcTemplate getJdbcTemplate(DriverManagerDataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
    @Bean("dataSource")
    public DriverManagerDataSource getDataSource(){
        this.dataSource = new DriverManagerDataSource();
        this.dataSource.setDriverClassName(this.driver);
        this.dataSource.setUrl(this.url);
        this.dataSource.setUsername(this.username);
        this.dataSource.setPassword(this.password);
        return this.dataSource;
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

这里需要注意的是由于JdbcTemplate不是我们自己定义的类，所以无法使用注解@Component进行实例化，所以就只能通过@Bean实例化，然后注入到userDAO。

在resources下新建一个data.properties文件：

```properties
# 数据库连接
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/data
name=root
password=root
```

对于注解混合模式，需要使用`<tx:annotation-driven transaction-manager="defaultTransactionManager" proxy-target-class="true" />`开启事务管理。若是纯注解模式需要在配置文件这里是App.java上添加@EnableTransactionManagement注解，开启基于注解的事务管理功能。这里不是接口继承的代理模式，所以还要加上参数：`@EnableTransactionManagement(proxyTargetClass = true)`。

需要注册事务管理器，在dao层上注册：

```java
//注册事务管理器
@Bean
public DataSourceTransactionManager dataSourceTransactionManager(){
    return new DataSourceTransactionManager(this.dataSource);
}
```

将需要进行事务控制的方法上加上@Transactional注解，或直接在业务层实现类上添加。如果要添加事务相关属性，直接在这个注解内添加：

```java
// UserService.java
package org.didnelpsun.service;

import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service("userService")
public class UserService implements UserServiceInterface {
    // 私有的DAO
    private UserDAO userDAO;
    // Spring注入
    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
    @Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
    @Override
    public User selectUser(Integer id) {
        return userDAO.selectUser(id);
    }
    @Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
    @Override
    public List<User> selectUsersByName(String name) {
        return userDAO.selectUsersByName(name);
    }
    @Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
    @Override
    public List<User> selectAllUsers() {
        return userDAO.selectAllUsers();
    }
    @Transactional(propagation = Propagation.REQUIRED)
    @Override
    public int insertUser(User user) {
        return userDAO.insertUser(user);
    }
    @Transactional(propagation = Propagation.REQUIRED)
    @Override
    public int updateUser(User user) {
        return userDAO.updateUser(user);
    }
    @Transactional(propagation = Propagation.REQUIRED)
    @Override
    public int deleteUser(Integer id) {
        return userDAO.deleteUser(id);
    }
}
```

注解模式无法使用通配符，所以如果一个类的方法需要不同的事务管理配置，需要给每个要事务管理的方法上都加一个对应的配置。

[案例十注解方式事务控制：Spring/demo10_jdbc_annotation](https://github.com/Didnelpsun/Spring/tree/master/demo10_jdbc_annotation)。

### &emsp;编程方式配置事务管理

使用较少，基于[案例十XML方式事务控制：Spring/demo10_jdbc_xml](https://github.com/Didnelpsun/Spring/tree/master/demo10_jdbc_xml)重新修改。

XML配置中只用注册事务管理器就可以，事务操作由事务管理器完成，并提供一个模板：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
">
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
    <!--基于XML的事务控制配置-->
    <!--配置事务管理器-->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource" />
    </bean>
    <!--配置事务模板对象-->
    <bean id="transactionTemplate" class="org.springframework.transaction.support.TransactionTemplate" />
</beans>
```

使用方法就是在业务层中定义和一个TransactionTemplate成员，然后等待Spring注入，并在需要事务处理的地方调用`transactionTemplate.execute()`方法：



[案例十编程方式事务控制：Spring/demo10_jdbc_program](https://github.com/Didnelpsun/Spring/tree/master/demo10_jdbc_program)。