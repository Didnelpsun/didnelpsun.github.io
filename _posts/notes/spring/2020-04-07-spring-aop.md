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

### &emsp;事务控制

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

[案例九事务控制案例：Spring/demo9_transaction_control](https://github.com/Didnelpsun/Spring/tree/master/demo9_transaction_control)。

### &emsp;代理

分为静态代理和动态代理。

动态代理利用反射机制在运行时创建代理类。

+ 字节码随用随创建，随用随加载。
+ 在不修改源码的基础上对方法增强。

动态代理类别：

+ 基于接口的动态代理。
+ 基于子类的动态代理。

#### &emsp;&emsp;方法增强

方法增强即在不修改原有类的源码的情况下对其方法进行重构。

常用的方法增强（即扩充方法功能）的方式有三种。

1. 类继承、方法覆盖：必须控制对象创建，才能使用该方式。
2. 装饰者模式：必须和目标对象实现相同接口或继续相同父类，特殊构造器（传入被包装对象）。
3. 动态代理。

#### &emsp;&emsp;构建项目

使用[标准Spring项目XML模板：Spring/basic_xml](https://github.com/Didnelpsun/Spring/tree/master/basic_xml)。

代理模式即为其他对象提供一个代理以控制对某个对象的访问。代理类B主要负责为委托的真实对象A进行预处理消息、过滤消息、传递消息给委托类A，代理类B不现实具体服务，而是利用委托类A的方法来完成服务，并将执行结果封装处理给委托类A。

在entity中定义一个接口：

```java
// Say.java
package org.didnelpsun.entity;

public interface Say {
    public void saySomeThing();
}
```

将HelloWorld实现这个接口：

```java
// HelloWorld.java
package org.didnelpsun.entity;

public class HelloWorld implements Say {
    // 默认构造函数，一旦HelloWorld类被实例化就会被调用
    public HelloWorld() {
        System.out.println("HelloWorldClass");
    }
    // 私有变量words
    private String words;
    private String user = "Didnelpsun";
    // 如果我们要对这个类的属性赋值，那么一定要是set开头，这是符合settergetter规范的
    // 如果需要参数就要传入参数
    public void setWords(String word){
        this.words = word;
    }
    // 定义方法调用对应属性并输出
    public void saySomeThing(){
        System.out.println(this.user +" says "+ this.words);
    }
}
```

#### &emsp;&emsp;静态代理

为HelloWorld类创建一个静态代理类HelloStaticProxy，记住HelloStaticProxy代理的是委托类HelloWorld的接口Say而不是委托类HelloWorld（所以需要代理的类的方法必须在接口中）：

```java
// HelloStaticProxy.java
package org.didnelpsun.entity;

public class HelloStaticProxy implements Say {
    private Say say = new HelloWorld();
    @Override
    public void saySomeThing() {
        System.out.println("HelloStaticProxy-saySomeThing-Before-Invoke");
        say.saySomeThing();
        System.out.println("HelloStaticProxy-saySomeThing-After-Invoke");
    }
}
```

需要在代理类HelloStaticProxy中定义一个委托类HelloWorld的成员且必须赋值给<span style="color:orange">接口</span>，且在代理的方法中调用委托类HelloWorld的方法，并相当于以代理类HelloStaticProxy的相同名的方法saySomeThing重新定义委托类HelloWorld的方法saySomeThing。

最后直接调用代理类HelloStaticProxy的saySomeThing方法，也相当于对HelloWorld类的同名saySomeThing方法的重新定义：

```java
// App.java
package org.didnelpsun;
// 引入依赖类HelloWorld
import org.didnelpsun.entity.HelloStaticProxy;
import org.didnelpsun.entity.HelloWorld;
// 引入ApplicationContext容器
import org.springframework.context.ApplicationContext;
// 引入支持XML配置的context容器
import org.springframework.context.support.ClassPathXmlApplicationContext;

//项目入口
public class App
{
    //获取私有属性，这个属性是应用文档属性
    private static ApplicationContext applicationContext;
    public static void main(String[] args){
        applicationContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        HelloStaticProxy helloStaticProxy = (HelloStaticProxy) applicationContext.getBean("helloStaticProxy");
        // 这个方法是HelloWorld的Setter所以用不了
//        helloStaticProxy.setWords("nmsl");
        // 调用实例方法
        helloStaticProxy.saySomeThing();
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id = "helloStaticProxy" class="org.didnelpsun.entity.HelloStaticProxy">
    </bean>
</beans>
```

![静态代理][static]

使用静态代理很容易就完成了对一个类的代理操作。但是静态代理的缺点也暴露了出来：由于代理只能为少部分的类服务，如HelloStaticProxy由于实现了HelloWorld也同样实现的Say接口，所以其只能代理实现了Say接口的HelloWorld类。如果需要代理的类很多，那么就需要编写大量的代理类，比较繁琐。

#### &emsp;&emsp;基于接口的动态代理

使用`Proxy.newProxyInstance()`方法进行创建代理并赋值给委托类接口，对应三个参数：

+ ClassLoader：类加载器。用于加载代理对象字节码。和被代理对象使用相同的类加载器。是固定写法：`被代理对象类.getClass().getClassLoader()`。
+ Class[]：字节码数组。用于让代理对象和被代理对象具有相同的方法。也是固定写法：`被代理对象类.getClass().getInterfaces()`。
+ InvocationHandler：用于提供增强方法。让我们写如何代理，一般都是一个该接口的实现类，一般为匿名内部类，但是不是必须的。执行被代理对象的任何接口方法都会经过该方法。需要`new InvocationHandler(){@Override public Object invoke(Object proxy, Method method, Object[] args) throws Throwalbe { 增强代码 return method.invoke(代理对象类.args)}}`。
  + proxy：代理对象的引用。在方法中可以调用proxy作为代理对象的this。
  + method：当前执行的方法。
  + args：当前执行所需的参数。
  + 和被代理对象方法具有相同的返回值。

定义一个对于代理方法的处理类：

```java
// DynamicHandler.java
package org.didnelpsun.entity;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class DynamicHandler implements InvocationHandler {
    // 委托类，通过委托对象建立代理处理方法
    private Object delegate;
    public DynamicHandler(Object delegate){
        this.delegate = delegate;
    }
    // 拦截引用委托接口的方法从而实现动态代理
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println( proxy.getClass().getName() + "-" + method.getName() + "-Before-Invoke");
        // 获取代理所调用的方法即为method，将委托对象的方法拦截并调用
        method.invoke(delegate, args);
        System.out.println( proxy.getClass().getName() + "-"  + method.getName() + "-After-Invoke ");
        return null;
    }
}
```

在主函数中定义动态代理：

```java
// App.java
package org.didnelpsun;
// 引入依赖类HelloWorld
import org.didnelpsun.entity.DynamicHandler;
import org.didnelpsun.entity.HelloStaticProxy;
import org.didnelpsun.entity.HelloWorld;
// 引入ApplicationContext容器
import org.didnelpsun.entity.Say;
import org.springframework.context.ApplicationContext;
// 引入支持XML配置的context容器
import org.springframework.context.support.ClassPathXmlApplicationContext;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;

//项目入口
public class App
{
    //获取私有属性，这个属性是应用文档属性
    private static ApplicationContext applicationContext;
    public static void main(String[] args){
        applicationContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        // 将委托类转换为接口
        Say helloWorld = new HelloWorld();
        // 获取处理器，并传入委托对象
        InvocationHandler handler = new DynamicHandler(helloWorld);
        // 获取代理对象
        Say helloDynamicProxy = (Say) Proxy.newProxyInstance(
                helloWorld.getClass().getClassLoader(),
                helloWorld.getClass().getInterfaces(),
                handler
                );
        helloDynamicProxy.saySomeThing();
    }
}
```

![动态代理][dynamic]

重新回顾这个动态代理创建的方法：

1. 通过实现InvocationHandler接口创建自己的调用处理器。
2. 通过为Proxy类指定ClassLoader对象和一组interface来创建动态代理类。
3. 通过反射机制获得动态代理类的构造函数，其唯一参数类型是调用处理器接口类型。
4. 通过构造函数创建动态代理类实例，构造时调用处理器对象作为参数被传入。

对于具体代码：

1. 首先将委托类转换为接口`Say helloWorld = new HelloWorld();`：
   + 也就是说这时候只有HelloWorld继承Say接口的那些方法能被保留（只有一个saySomeThing方法），其他方法以及私有属性是调用不了的。
   + 对于使用`this.成员`的已经加入接口方法的，如在saySomeThing中加上this.words的输出的this.words不受影响不会是null，因为最开始构建的是HelloWorld，this.words已经被带入到saySomeThing方法中，即使强转为接口类型里面的数据也会被保留。
   + 此时的helloWorld对象就是一个干净的只有Say接口方法的对象，要代理的方法全部在helloWorld对象中，不会有其他的方法或成员对要代理的方法进行干扰。
2. 获取处理代理对象方法的处理器`InvocationHandler handler = new DynamicHandler(helloWorld);`：
   + DynamicHandler是实现InvocationHandler接口，里面包含一个invoke方法。
   + 此时传入的参数helloWorld就是DynamicHandler类定义的委托类delegate，无论是怎么样处理动态代理Handler里面都必须有一个委托类，后面的invoke方法才能调用委托类里的方法对委托类的方法进行加强。
   + invoke方法就是截断委托类调用的方法。如后面主函数中会调用`helloDynamicProxy.saySomeThing();`，此时动态代理helloDynamicProxy会去第三个参数handler中找到invoke方法，调用helloDynamicProxy.saySomeThing()这个方法就相当于调用invoke方法。
   + invoke方法三个参数：proxy就是helloDynamicProxy，method就是saySomeThing，args没有参数；`method.invoke(delegate, args);`两个参数：delegate就是helloWorld，args就是参数此时没有，就等价于调用`delegate.method(args)`，即调用`helloWorld.saySomeThing(args)`，此时就完成了代理的加强方法的设置。如果相对参数进行变动可以直接调用`args[index]`获取并传入。
   + saySomeThing没有返回值，所以invoke方法也没有返回值，必须两个一样。所以也可以是`return method.invoke(delegate, args);`。
3. 创建代理：`Say helloDynamicProxy = (Say) Proxy.newProxyInstance(...)`：
   + 调用newProxyInstance方法生成Proxy对象->调用apply方法生成ProxyClassFactory对象->调用generateProxyClass生成ProxyGenerator对象->调用generateClassFile生成ProxyGenerator的class文件->返回ProxyClassFactory生成Class对象->返回Proxy生成Proxy实例。
   + 此时就调用了三个参数产生了代理。

所以基于接口的动态代理的核心实现就是invoke方法。

但是基于接口的动态代理并不是都好用的，如上面的事务控制的TransactionManager就是对ConnectionThread的Connection对象方法的加强。Connection不是一个接口而是一个对象，所以就不能基于接口。


&emsp;

## AOP

### &emsp;概念

### &emsp;XML方式

### &emsp;注解方式

[static]:data:image/png;base64,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

[dynamic]:data:image/png;base64,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

[]
