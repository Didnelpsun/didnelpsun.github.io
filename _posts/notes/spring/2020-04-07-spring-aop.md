---
layout: post
title: "面向切面AOP"
date: 2020-04-07 15:41:25 +0800
categories: notes spring base
tags: Spring 基础 AOP Proxy
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

[案例九事务控制：Spring/demo9_transaction_control](https://github.com/Didnelpsun/Spring/tree/master/demo9_transaction_control)。

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

使用Proxy类，提供者是JDK。

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

+ 生成的代理类：$Proxy0 extends Proxy implements Person，我们看到代理类继承了Proxy类，Java的继承机制决定了JDK动态代理类们无法实现对 类 的动态代理。所以也就决定了Java动态代理只能对接口进行代理。
+ 每个生成的动态代理实例都会关联一个调用处理器对象，可以通过Proxy提供的静态方法getInvocationHandler去获得代理类实例的调用处理器对象。在代理类实例上调用其代理的接口中所声明的方法时，这些方法最终都会由调用处理器的invoke方法执行
+ 代理类的根类java.lang.Object 中有三个方法也同样会被分派到调用处理器的 invoke 方法执行，它们是hashCode，equals和toString，可能的原因有：一是因为这些方法为public且非final类型，能够被代理类覆盖； 二是因为这些方法往往呈现出一个类的某种特征属性，具有一定的区分度，所以为了保证代理类与委托类对外的一致性，这三个方法也应该被调用处理器分派到委托类执行。

但是基于接口的动态代理并不是都好用的，如上面的事务控制的TransactionManager就是对ConnectionThread的Connection对象方法的加强。Connection不是一个接口而是一个对象，所以就不能基于接口。

#### &emsp;&emsp;基于子类的动态代理

此时需要加一个依赖：

```xml
<!-- https://mvnrepository.com/artifact/cglib/cglib -->
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.3.0</version>
</dependency>
```

此时基于的类是Enhancer，提供者是第三方cglib。

使用`Enhancer.create()`方法创建代理对象。要求被代理类不能是最终类，即必须有子类继承它，对应两个参数：

+ Class：指定被代理对象的字节码，即`被代理对象类.class`。
+ Callback：即提供方法增强的代码，一般都是一个该接口的实现类，一般都是匿名内部类，但是不是必须的。一般都是该接口的子接口实现类`new MethodInterceptor(){@Override public Object intercept(Object o, Method method, Object objects, MethodProxy methodProxy) throws Throwalbe{return null;}}`。intercept方法与invoke方法一样都会拦截代理方法。
  + 前三个参数与invoke的三个参数是一样的。
  + methodProxy：指当前执行方法的代理对象。
  + 返回值也跟被代理对象返回值一样。

首先新建一个与entity同级的cglib的软件包，不实现接口：

```java
// HelloWorld.java
package org.didnelpsun.cglib;

public class HelloWorld {
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

然后直接在App.java中定义一个基于子类的动态代理实例：

```java
//项目入口
public class App
{
    public static void main(String[] args){
        HelloWorld helloWorld = new HelloWorld();
        HelloWorld HelloEnhancer = (HelloWorld) Enhancer.create(
                helloWorld.getClass(),
                new MethodInterceptor() {
                    @Override
                    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
                        System.out.println("HelloEnhancer-saySomeThing-Before-Intercept");
                        helloWorld.saySomeThing();
                        System.out.println("HelloEnhancer-saySomeThing-After-Intercept");
                        return null;
                    }
                }
        );
        HelloEnhancer.saySomeThing();
    }
}
```

由此可知动态代理HelloEnhancer是委托类HelloWorld的子类，通过Enhander.create方法进行创立。

[案例九动态代理：Spring/demo9_dynamic_agent](https://github.com/Didnelpsun/Spring/tree/master/demo9_dynamic_agent)。

### &emsp;动态代理实现事务控制

回到[案例九事务控制：Spring/demo9_transaction_control](https://github.com/Didnelpsun/Spring/tree/master/demo9_transaction_control)进行编写。

首先dao同级目录新建proxy目录，然后新建一个ServiceProxy用于对UserService进行代理，并复制insertUser中的事务管理代码和相关依赖到invoke方法中：

```java
// ServiceProxy.java
package org.didnelpsun.proxy;

import org.didnelpsun.service.UserService;
import org.didnelpsun.service.UserServiceInterface;
import org.didnelpsun.utils.TransactionManager;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class ServiceProxy {
    private UserService userService;
    // Spring依赖注入
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
    private TransactionManager transactionManager;
    public void setTransactionManager(TransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }
    // 获取用户代理
    // 获取的对象必须是委托类的接口而不是委托类，因为实现类是与Proxy同级的
    public UserServiceInterface getUserService() {
        return (UserServiceInterface) Proxy.newProxyInstance(
                userService.getClass().getClassLoader(),
                userService.getClass().getInterfaces(),
                new InvocationHandler() {
                    @Override
                    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                        Object returnValue = null;
                        try{
                            // 开启事务
                            transactionManager.begin();
                            // 执行操作
                            System.out.println("ServiceProxy-getUserService-Before-Invoke");
                            returnValue = method.invoke(userService,args);
                            System.out.println("ServiceProxy-getUserService-After-Invoke");
                            // 提交事务
                            transactionManager.commit();
                        }
                        catch (Exception e){
                            // 回滚事务
                            System.out.println(e);
                            transactionManager.rollback();
                        }
                        finally {
                            // 释放连接
                            transactionManager.release();
                        }
                        return returnValue;
                    }
                }
        );
    }
}
```

此时所有UserService的方法都会经过事务代理。

在UserService中的insertUser将事务管理和TransactionManager都删掉：

```java
@Override
public boolean insertUser() throws SQLException {
    System.out.println("UserService-insertUser");
    userDAO.insertUser();
    return true;
}
```

在XML中将userService的transactionManager删掉，并加上：

```xml
<!--配置serviceProxy这个生成service代理的工厂类-->
<bean id="serviceProxy" class="org.didnelpsun.proxy.ServiceProxy">
    <property name="userService" ref="userService" />
    <property name="transactionManager" ref="transactionManager" />
</bean>
<!--使用serviceProxy进行实例工厂模式生成bean-->
<bean id="userServiceProxy" factory-bean="serviceProxy" factory-method="getUserService" />
```

使用代理时必须转为委托类的接口而不是委托类，在App.java中将userService重新定义为`UserServiceInterface userService = (UserServiceInterface) applicationContext.getBean("userServiceProxy");`其他不动，执行：

![事务控制代理][transaction]

&emsp;

## AOP

### &emsp;概念

即面向切面编程，是OP的延续，通过预编译方式和运行期间动态代理实现程序功能的一种技术。如上面的业务管理就可以通过AOP即Spring的配置而不是代码完成直接动态代理的做法。

Spring会根据委托类是否实现了接口来自动判断AOP的类型是基于子类的还是基于接口的。

+ joinpoint连接点：指那些被拦截到的点。在Spring中由于Spring只支持方法类型的连接点，所以这些点就是指被拦截的方法，如被代理的UserService的insertUser方法。
+ pointcut切入点：指对连接点进行拦截的定义。即根据条件判断（如使用`"名字".equals(method.getName())`判断方法名称）对部分方法进行增强，则这些被选择增强的方法就是切入点。切入点包含在连接点中，连接点选择要代理的切入点。
+ advice通知（增强）：指拦截到连接点之后所需要做的事情，即invoke中的方法体，之前就是事务管理。通知类型，根据method.invoke判断：
  + 前置通知：method.invoke前执行。
  + 后置通知：method.invoke后执行。
  + 异常通知：catch异常中执行。
  + 最终通知：finally中总是会执行。
  + 环绕通知：整个invoke方法在执行就是环绕通知。在环绕通知中有明确的切入点方法调用。
+ introduction引介：是一种特殊的通知，在不修改类代码的情况下可以在运行期间为类动态添加一些方法或Field。
+ target代理的目标对象。
+ weaving织入：把增强应用到目标对象来创建新的代理对象的过程。其中Spring采用动态dialing织入，AspectJ采用编译期织入和类装载期织入。如我们之前在UserService的DAO方法中加上了事务管理就是织入。
+ Proxy代理：一个类被AOP织入增强后就产生一个结果代理类。
+ Aspect切面：是切入点和通知（引介）的结合。代理方法和织入的公共方法的结合，即整个对于代理方法和公共方法配置的过程，包括什么时候执行和执行什么方法。

开发期间程序员的工作：

1. 编写核心业务代码，包括CRUD和处理。
2. 公共代码抽取出来作为通知。
3. 配置文件声明切入点和通知之间的关系，即切面。

运行阶段Spring的工作：

1. 监控切入点方法的执行。
2. 一旦切入点方法被执行，使用代理机制，动态创建目标对象的代理对象，根据通知类别，在代理对象的对应位置，将通知对应的功能织入，完成完整的代码逻辑执行。

需要导入切面表达式的依赖（可以去掉mysql的依赖）：

```xml
<!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.8</version>
</dependency>
```

利用[案例九事务控制：Spring/demo9_transaction_control](https://github.com/Didnelpsun/Spring/tree/master/demo9_transaction_control)代码。

对于dao层：

```java
// UserDAO.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import java.util.List;

public class UserDAO implements UserDAOInterface{
    @Override
    public List<User> selectUsers() {
        System.out.println("UserDAO-selectUsers");
        return null;
    }
    @Override
    public int insertUser(User user) {
        System.out.println("UserDAO-insertUser");
        return 0;
    }
    @Override
    public int deleteUser(int id) {
        System.out.println("UserDAO-deleteUser");
        return 0;
    }
}
```

```java
// UserDAOInterface.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import java.util.List;

public interface UserDAOInterface {
    // 获取用户方法
    List<User> selectUsers();
    // 插入用户方法
    int insertUser(User user);
    // 删除用户方法
    int deleteUser(int id);
}
```

对于entity包：

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

对于service层：

```java
// UserService.java
package org.didnelpsun.service;

import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import java.util.List;

public class UserService implements UserServiceInterface{
    // 业务层调用持久层，需要依赖注入
    private UserDAO userDAO;
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
    public void test(){
        System.out.println("UserService-test");
    }
    @Override
    public List<User> selectUsers() {
        System.out.println("UserService-selectUsers");
        return userDAO.selectUsers();
    }
    @Override
    public int insertUser(User user){
        System.out.println("UserService-insertUser");
        return userDAO.insertUser(user);
    }
    @Override
    public int deleteUser(int id) {
        System.out.println("UserService-deleteUser");
        return userDAO.deleteUser(id);
    }
}
```

```java
// UserServiceImplement.java
package org.didnelpsun.service;

import org.didnelpsun.entity.User;
import java.util.List;

// 用户业务层接口
public interface UserServiceInterface {
    void test();
    // 获取用户，返回用户列表
    List<User> selectUsers();
    // 插入用户，返回用户数
    int insertUser(User user);
    // 删除用户，返回用户数
    int deleteUser(int id);
}
```

建立一个前置通知类：

```java
// Logger.java
package org.didnelpsun.utils;

// 公共类用于记录日志
public class Logger {
    // 用于打印日志，用于在所有切入点方法即业务层方法执行之前执行
    public void printLog(){
        System.out.println("LoggerClass-printLog");
    }
}
```

### &emsp;AspectJ表达式

即在execution中的表达式的写法。

execution(修饰符模式 返回类型模式 方法名模式(参数模式)异常模式)。

表达式可以使用||、&&、!进行组合，在XML下就是、or、and、not。

如果使用表达式则默认AOP代理模式为子类模式，需要修改`proxy-target-class="true"`。

表达式说明：

+ 其中修饰符模式可以省略。
+ 返回类型不可以省略。可以用一个通配符\*来表达任意返回值。返回类型与包名之间需要一个空格。
+ 包名不可以省略。可以通配符\*来表达任意包名，但是每一级包名需要加上.来分隔，即有几级包，就需要写几个\*.。同时包名可以使用..表示当前包以及子包，所以可以用*..表示所有包。
+ 类名不可以省略。可以用一个通配符\*来表示所有类。类名和包名之间不需要空格和.。
+ 方法名不可以省略。类名和方法名之间需要加.，可以使用一个通配符\*来表示所有类。
+ 参数列表不可以省略。基本类型直接写名称，引用类型写包名.类名的方式调用。可以使用一个通配符\*来表示任意参数，但是这时候也代表必须有一个参数。可以使用..表示有无参数均可，参数为任意类型。

全通配写法，即任何方法都会被匹配：`* *..*.*(..)`。

开发中切入点表达式的通常写法是切到业务层实现类下的所有方法。

### &emsp;XML方式

#### &emsp;&emsp;实现通知

对于view层：

```java
// App.java
package org.didnelpsun.view;

import org.didnelpsun.entity.User;
import org.didnelpsun.service.UserServiceInterface;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import java.sql.SQLException;
import java.util.List;

//项目入口
public class App
{
    public static void main(String[] args) throws SQLException {
        // 表现层调用业务层
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        // 使用AOP时也必须转为委托类的接口而不是委托类
        UserServiceInterface userService = (UserServiceInterface) applicationContext.getBean("userService");
        userService.test();
        userService.selectUsers();
        userService.insertUser(new User());
        userService.deleteUser(0);
    }
}
```

由于需要使用AOP，所以添加AOP的XML配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop = "http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/aop
       http://www.springframework.org/schema/aop/spring-aop.xsd
">
    <bean id="userService" class="org.didnelpsun.service.UserService">
        <property name="userDAO" ref="userDAO" />
    </bean>
    <bean id="userDAO" class="org.didnelpsun.dao.UserDAO" />
    <!--Spring基于XML的AOP配置步骤-->
    <!--1.把通知的Bean交给Spring管理-->
    <!--配置Logger类-->
    <bean id="logger" class="org.didnelpsun.utils.Logger" />
    <!--2.使用aop:config标签表明开始对AOP的配置-->
    <!--配置AOP-->
    <aop:config>
        <!--3.使用aop:aspect表明开始配置AOP切面-->
        <!--id属性是给切面一个唯一标识-->
        <!--ref属性是指定通知类bean的id-->
        <aop:aspect id="loggerAdvice" ref="logger">
            <!--4.在aop:aspect标签内部使用对应标签来配置通知的类型与切入点-->
            <!--method属性用于指定类的哪个方法来进行前置通知-->
            <!--logger是前置通知，使用aop:before配置-->
            <!--pointcut属性，用于指定切入点表达式，指对业务层哪些方法进行增强-->
            <!--切入点表达式的写法：execution(表达式)-->
            <!--表达式：访问修饰符 返回值 全限定类名.方法名(参数列表)-->
            <aop:before method="printLog" pointcut="execution(public void org.didnelpsun.service.UserService.test())" />
        </aop:aspect>
    </aop:config>
</beans>
```

此时就只有在test前进行了前置通知。

![前置通知][before]

将表达式改为`<aop:before method="printLog" pointcut="execution(public * *..service.*Service.*User*(..))" />`，此时就只会在service包下的以Service结尾的类的方法名带有User的方法进行前置通知，所以test方法就不会前置通知，而其他所有Service类都有前置通知：

![过滤的前置通知][before2]

#### &emsp;&emsp;通知类型

然后对Logger类修改，添加其他通知类型：

```java
// Logger.java
package org.didnelpsun.utils;

// 公共类用于记录日志
public class Logger {
    // 用于打印日志，用于在所有切入点方法即业务层方法执行之前执行
    // 前置通知
    public void beforePrintLog(){
        System.out.println("前置通知");
    }
    // 后置通知
    public void returnPrintLog(){
        System.out.println("后置通知");
    }
    // 异常通知
    public void exceptionPrintLog(){
        System.out.println("异常通知");
    }
    // 最终通知
    public void afterPrintLog(){
        System.out.println("最终通知");
    }
}
```

然后添加对应的XML配置，前置通知为aop:before，后置通知（返回通知）为aop:after-returning，异常通知为aop:after-throwing，最终通知为aop:after：

```xml
<aop:before method="beforePrintLog" pointcut="execution(public * *..service.*Service.*User*(..))" />
<aop:after-returning method="returnPrintLog" pointcut="execution(public * *..service.*Service.*User*(..))" />
<aop:after-throwing method="exceptionPrintLog" pointcut="execution(public * *..service.*Service.*User*(..))" />
<aop:after method="afterPrintLog" pointcut="execution(public * *..service.*Service.*User*(..))" />
```

![四种通知][advice]

由于没有异常，所以此时按照前置通知->后置通知->最终通知的顺序执行。如果有异常则异常通知替换后置通知的位置执行。

#### &emsp;&emsp;环绕通知

最后使用环绕通知，在XML中添加对应的标签，为aop:around：`<aop:around method="aroundPrintLog" pointcut="execution(public * *..service.*Service.*User*(..))" />`。

在Logger中添加aroundPrintLog：

```java
// 环绕通知
public void aroundPrintLog(){
    System.out.println("环绕通知");
}
```

此时会报错：Exception in thread "main" org.springframework.aop.AopInvocationException: Null return value from advice does not match primitive return type for: public int org.didnelpsun.service.UserService.insertUser(org.didnelpsun.entity.User)。

不管是cglib代理还是jdk代理，你的返回值必须是包装类，如下图我返回的是基本类型，所以就会报错。将service里的insertUser和deleteUser的返回类型由int改为Integer，dao层不用改。

![环绕通知][around]

此时发现service方法都没有执行，而只有通知方法执行了。这是因为此时只指定了切入点，但是没有明确地指定环绕通知的代码和切入点代码执行顺序。

Spring提供了一个ProceedingJoinPoint接口，有一个方法proceed，用于明确调用切入点方法并规定执行顺序，改接口可以作为环绕通知的方法参数，在程序执行时Spring框架会为我们提供该接口的实现类来使用。

重新定义环绕通知方法：

```java
public Object aroundPrintLog(ProceedingJoinPoint proceedingJoinPoint){
    Object returnValue;
    System.out.println("环绕通知");
    try {
        // 获取方法执行所需参数
        Object[] args = proceedingJoinPoint.getArgs();
        System.out.println("前置通知");
        // 明确执行切入点方法即业务层方法
        returnValue = proceedingJoinPoint.proceed(args);
        System.out.println("后置通知");
        return returnValue;
    }catch (Throwable throwable){
        System.out.println("异常通知");
        throw new RuntimeException(throwable);
    }finally {
        System.out.println("最终通知");
    }
}
```

此时会很奇怪，因为之前的其他通知都是在XML配置中的，而为什么环绕通知的方法中需要直接用代码调用配置其他通知。因为Spring中环绕通知是一种可以在代码中手动控制增强方法何时执行的方式。

所以自己配的方式就是环绕通知方式，用环绕通知就可以一次性配所有通知。为了达到之前效果可以直接将XML文件中的其他通知配置全部删掉，只留环绕通知。

#### &emsp;&emsp;使用表达式标签

可以将AspectJ表达式抽取出来直接赋值给每个aop配置，在aop:aspect下使用aop:pointcut标签，id为表达式标签id，expression即表达式内容。写完了这个标签后就可以直接在aop:before等标签的pointcut-ref中指定引用表达式标签的id：

```xml
<aop:before method="beforePrintLog" pointcut-ref="expression" />
<aop:after-returning method="returnPrintLog" pointcut-ref="expression" />
<aop:after-throwing method="exceptionPrintLog" pointcut-ref="expression" />
<aop:after method="afterPrintLog" pointcut-ref="expression" />
<aop:pointcut id="expression" expression="execution(public * *..service.*Service.*User*(..))"/>
```

此时只有aop:aspect这个表情下的aop:pointcut才能使用，如果在别的切面是不能使用这个表达式的。如果将aop:aspect拿到与aop:pointcut同级，这时会报错，只有aop:pointcut在使用的aop:aspect前定义，后面的aop:aspect才能使用定义的表达式。

[案例九XML方式AOP：Spring/demo9_aop_xml](https://github.com/Didnelpsun/Spring/tree/master/demo9_aop_xml)。

### &emsp;注解方式

#### &emsp;&emsp;修改项目

使用[标准Spring项目注释模板：Spring/basic_annotation](https://github.com/Didnelpsun/Spring/tree/master/basic_annotation)。

添加pom.xml依赖：

```xml
<!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.8</version>
</dependency>
```

然后将XML方式AOP的org.didnelpsun下的所有包都覆盖原来的包，删掉App.java，修改view里的App.java：

```java
// App.java
package org.didnelpsun.view;
// 引入ApplicationContext容器
import org.didnelpsun.entity.User;
import org.didnelpsun.service.UserService;
import org.springframework.context.ApplicationContext;
// 引入支持注释类的context容器
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
// 引入ComponentScan注释
import org.springframework.context.annotation.ComponentScan;

@ComponentScan("org.didnelpsun")
//项目入口
public class App
{
    public static void main(String[] args){
        // 获取私有属性，这个属性是应用文档属性
        ApplicationContext applicationContext = new AnnotationConfigApplicationContext(App.class);
        UserService userService = applicationContext.getBean(UserService.class);
        userService.test();
        userService.selectUsers();
        userService.insertUser(new User());
        userService.deleteUser(0);
    }
}
```

还需要实例化，给UserService和UserDAO添加@Component注解，在UserService中在setUserDAO方法上添加@Autowried注解。

#### &emsp;&emsp;切面配置

再进行切面配置。@Aspect注解表示对切面类进行注解，在Logger类上添加，此外还需要在下面添加@Component。然后在各个通知方法上添加配置，@Before等价于aop:before标签，@AfterReturning等价于aop:after-returning，@AfterThrowing等价于aop:after-throwing，@After等价于aop:after，@Around等价于aop:around，如果想使用表达式，则用@Pointcut("表达式")等价于aop:pointcut，且注解必须在类的一开始就声明表达式，且下面跟一个空方法来获取这个表达式，且不能有参数列表。

其中@Before，@After，@Around都必须在括号中添加字符串，表示AspectJ表达式，其中引用@Pointcut定义的表达式时必须带上括号。

```java
// Logger.java
package org.didnelpsun.utils;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Component
@Aspect
// 公共类用于记录日志
public class Logger {
    @Pointcut("execution(public * *..service.*Service.*User*(..))")
    private void expression(){}
    // 用于打印日志，用于在所有切入点方法即业务层方法执行之前执行
    // 前置通知
    @Before("expression()")
    public void beforePrintLog(){
        System.out.println("前置通知");
    }
    // 后置通知
    @AfterReturning("expression()")
    public void returnPrintLog(){
        System.out.println("后置通知");
    }
    // 异常通知
    @AfterThrowing("expression()")
    public void exceptionPrintLog(){
        System.out.println("异常通知");
    }
    // 最终通知
    @After("expression()")
    public void afterPrintLog(){
        System.out.println("最终通知");
    }
    // 环绕通知
    @Around("expression()")
    public Object aroundPrintLog(ProceedingJoinPoint proceedingJoinPoint){
        Object returnValue;
        System.out.println("环绕通知");
        try {
            // 获取方法执行所需参数
            Object[] args = proceedingJoinPoint.getArgs();
            System.out.println("前置通知");
            // 明确执行切入点方法即业务层方法
            returnValue = proceedingJoinPoint.proceed(args);
            System.out.println("后置通知");
            return returnValue;
        }catch (Throwable throwable){
            System.out.println("异常通知");
            throw new RuntimeException(throwable);
        }finally {
            System.out.println("最终通知");
        }
    }
}
```

然后配置类上添加@EnableAspectJAutoProxy表示开启AOP，这里是App类。这里需要在@ComponentScan下添加`@EnableAspectJAutoProxy(proxyTargetClass = true)`。否则会无法生成UserService实例。

对于proxyTargetClass参数：

+ true：
  + 目标对象实现了接口：使用CGLIB代理机制。
  + 目标对象没有接口（只有实现类）：使用CGLIB代理机制。
+ false：
  + 目标对象实现了接口：使用JDK动态代理机制（代理所有实现了的接口）。
  + 目标对象没有接口（只有实现类）：使用CGLIB代理机制

如果是使用XML配置文件则使用`<aop:aspectj-autoproxy/>`标签开启AOP。

[案例九注解方式AOP：Spring/demo9_aop_annotation](https://github.com/Didnelpsun/Spring/tree/master/demo9_aop_annotation)。

[static]:data:image/png;base64,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

[dynamic]:data:image/png;base64,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

[transaction]:data:image/png;base64,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

[before]:data:image/png;base64,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

[before2]:data:image/png;base64,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

[advice]:data:image/png;base64,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

[around]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKsAAAExCAIAAACMAMXfAAAgAElEQVR4Ae1ceXAU55XvQWBxmUO3uA9zI3GaGwzG19ocAcdHHDvJbq0d29lknVSyVeukkiJ2smVXtsqb3UpVYifrmCTGAR9gg21Mgi2bI9xCQQiEZA4hAQJJHBISOmbf6GmeHl93fz3T0+2lpTd/DO973+/9vte/39PMSC0RmjBhgiGPTqxAl0587XLpEQVkAjr7HMgEyAR0dgU6+/XLa4BMQGdXoLNfv7wGyAR0dgX49SclJYX4ujPESRkZGcp1jli56icP9D30yZFLuDHu4Rd/dF9o37aSWgXo/bLn0Pn3f+3Rhx9Ydvf8GRMGdj1//ER1g/en2DCmLPj2T565f2rzoW2ll20gPqQzcu+aPzJ8+lR1k9fkMTLfSO8C/ef849MrxzUVbPrja69v2lc3YumT/3xH1hf3NRlubGhsbGpoCntthZYvK/eue+aM6KHFuNuMkbmrO3Y/qlImzxjVteD3r7y7vxHoCwpq+j735K1Tsj56v8KP08yc1Tt+86Md5nRHz7iYgKSs6StW3JEzNL1PcktddVnR1nfWfnqiPipUqPfIhcuXzJ0wqF/X+vOl+7e8/e6esxFHWx/Dlq96JmfPqx/0vn3p5Oyb6s4Wb1+/bkvxJfyqS+qaZITh0YZtPvrOCz/t0dT+guyWOWn8Yz97YuSuX656q7SNOzTyy6u+PWHvS6vWH48cNmLlc99ZcDMeW7vtf3649hjGbc+hXsPmLl0yf9yglORrNRVHd7y3YWtJW8uA0HZ1Hc/1i5RF3//x8kFtuSU/fmlJaxje87vv/uEgZvXM9i44M1/XicXngP7jFs3MqNhBnwPSJ945vV/pp9HPARm3P/X04l7Fm9e/n7er4POrA2cvuT3zZN7BypYIbyhj0b/867KB5//2waa8A2Utwxcsu33Amb/ln2mbgX5jF80ampnWt2L3lry9xxsHz7hz0S2X9u46dTVSe7U5Y8bcW4f1Pnek+Exds2GEmxqu1je20ibEHK4KZ982Z1zT4Y+LLkbOMULDFjx4W0r+hvVFNa3r+gtlJYX79+493uWW8WmVu/5aWNWaxqdQ+oKnvrtyaM3ujz74eN/x2szp996d01yws/RK67bD9TIeNWy6crbs2KH9+y/0yR3Rsu/Paz7423547Dt8/Nyl1o8+DswaF5yYlU7ifg0IZQ7IDlVs3LR13/kIVWFR0e7U5Loo68AZc4c07X35lQ2HIp7nFzWkPfeV+ZPePLAdBYvAelXu+P1b2yLr/KPhAc8/MG1in+15kQ+d4ROb/7h5+ON3feOH06pOHC7Yu+OTnUeq6OUjAebmwwcO1U/LyR3y9omTkQ4G5+T0u5iffzz6anP1XPHhc5AfOOJaZPv6R9a02cOb9r/ym/V/j7RSUHCx3/NP3Do566MPWt+bnLoKJXW7qSv7rNUCnzVwphvPlxxsVTA3bCSfKTp4kI8dnKRn1rngxHz99RlxT0C4oqyseerc+5de211SVl5WdvbSOfY+3a9fX6PyTGWX5OTkyEHNlWcvhqampxpG+wRcPlMeXdQeLyouHxHqZRj4bcfVkk3/tWp/zqyZU3JyZ62cPGf21t/89/ri1hcIIxHmpsMHCuunTZo0+N2TpwxjQE5O2sWD7QOgKKIsU1LTjPP7yqOT2Fy45tnvwbS2oZy6unne0z9dMbydsmD1D367N8rVnraI9Mx6Fyzo7FNxT4Bx/pNXf9vtvsXT7/3q4h5JRtOVU/vee33tzjaJuhghY8iSZ1/AdzU89nJSEj8/3BKVzzBOb/nVi3wPpL1acXDrOwe3ru85ctm3nl704MLdP3u/PAJJiLnpcH5h/dTc3AHvnirPysnNuHLwjehnguuPN6+SQiEj1N4xdBiOvjHF0FXtgT//8hT7oF97NtZv+hyuV+uC+So0GYsJaGluNrqE2l+6QqBBuKX9sluqCjevLtxsJHXvlzk0964HVjz0SEXxL7ZeiJzSAl8dFXmvrD1A7wvwQlDTaqGmidatrn2ysm++Vnm6qvVDZbiu5INPji56ZNjwXkZ55AcRCTBDdVNhfuG1qZMmZW9smpibeSV/bawDYDS3fjS1+57UqavmixWl+OHD6fLVfSdmnQsql3bdbjTBqqqrjZszM6OTm5KV1S18oQo/NBlG9/SR40Zn9wR0c31N+ZG8D/dWhtLS0tqqa2ouGsktlz8vbXucq0vqFjLgY53zIzR22fe+/9jMPoS8uU8fo6Xhatt7cwLMEcbGyAhkTJgwesLEgVfyD5bwr2o60SqoqrpgpA0Y0K1tL2n8V/7jpWfvyW5bJtgVsEQmLGwxYHpmvQvYnB1zW+vRfyy+F2ioCQ2fu3DaiO7XGpPTRy/40t05XQs2vrW/7fUrNOye7zy5ZHRyfUNS79SskfBpPqfvqc/e3Xu61anLNUkTFi2enG1cC/dMHTx2wYpHV05tyf+kqAYVj3wvkF2x8+Mj0XmKtgH/tlTXp966eP7ktC5NXXqlDcm9a+Wdo5v3vv3WwQutA5QAc+shLVWhgQvnjxzYe1DXoxvXHbrQPgK9B4wZOSgjPT19wC2Txmc2nT1d1x0Wfbtcqa6Fl+zai0lj5y+aPrJ7Y9NNKcOmLV26ION83tsfleBnGYeu2OXZhaGs3HmTspIu1XZLzczM7BOuqaqN4Xr1LuBZdsxKJxYTYDSUHy6pSx87febsmblDelTlb1r99p6q6PtXS+WxkiupY2bOmzd39q25I/o3fp63Zl1eRfTnAbUnCkqbBkyau2DezMmjskPlO9at3ni0Liq3bgKMxsqiQ+VdBkycPmvWrKljM8Ondq57bUPh5ejbTwLMrdfcUmUMXLRgTP+r+99bV8AGwBi7/N8fXzZj+vTp47O7G13Tx0AEj1FN+fj9cN3Jvx+rSxkDasyaMjKl/tjHa9Zsaf/xh74rRWyrZe3p09eyc2YvmD9r+tQpUwZf3h39rlvL7OBC60G2zNe3EZLfFL1ekE63svgc0Ok06NwXLBPQuf2X3xXu7P7LBMgEyLtAZ58BmQCZgM6uQGe/fnkNkAno7Ap09uuX1wCZgM6uQGe/fnkNkAnwSIGXXnqJMylLvuUi9pbNRQMduMTid4T8vlqw85lnnsFT7KwlgN/NCL86AWZLwAxzEoUjnwBAMdeUFxIAAsJTkqpoizJ2AScHjJnKrlDyXAF1AkhH7gQloZLnORHFZIwjUimBUyxLkBCfsYT6oYDvEq0EsSigTkAsNQqGbMNAcYV2eRVhMIlLS2SMAE4ucVwKxDcBZpMgA+fhs3Iw+Ep4ChSMUsiXjmOhUMnSnQLxTYD5DPpqVjxGL/kQYC15TIUUcAYzzHy0ZDxRwGICSH0MuEPkIiXNGaUKkEQIYCzkGU8uQ0hcK2AxAWQStxk8gyU6hwHt4hZ1QHlNhrYgQE7M8NgyQwDzKZxT4tgVsJgAc7HiMQBoCNASbgzFZh5L2yjJTyES2gU2DjCTS8adAs4ToNedRoGOR8+oigICuAuQxys2dz10yCrnCeBfhVwCylPAd2OPwVQC85iSEviqgG4C0I8YDeZgiM1Vlkm4NkJyALLRldMWgCmGXQVGeAliV0CdANKUjNFzxYvXs8EuN9gRTE1SG44lAlAUUO8Oo6akrII2L814xUIAQAYeVAsxJimDAVEhgHaVJeURz2tpS4LYFYjv7wbtzKDz4gIAmAotAxwU7rQlTJKJKBDfBCRyktTemAqo7wI3ZpfSlX8KyAT4p20wmGUCguGTf13KBPinbTCYZQKC4ZN/XcoE+KdtMJhlAoLhk39dygT4p20wmGUCguGTf13KBPinbTCYZQKC4ZN/Xap3hx1PMt/7cbzBg5yJ3OAxH+rYpwBiVCDWCeA2m/0gd/mWElNDdnkCQECEPCmxHwrY3hsEn/h5GksUJK/iMWfgQ8AxEFtu2SV5LefneYn1CuheA2LU1AyzNEzTB+BhF3gsC3EXn5GETqSA72oOki2zAroJMKMtM5bqm5PkFpDwmJZQouTpOMxrAISUIF4FdBNgdlFhR2PMtsVulXIEX4rrito+LXUTYLZW0wQ3D2B8yXkoT0kKYIvHeBZlNEfLViIK6CYgXl5Lt8hyZEOMkoz3IMF7qICXE+DOV17FY7xIJUNLy2nzUJfOQ+UwAaS4ooilAZZJOwYipCpA8hgBlIElB1C5BAkq4DABwM49wMPsTLXLJ9giHQqdyBB4IiYnsZ4Ad0KbZwVOchwLDuAx71Ji/xSwngB357nzj+YGynnMe6AtAFAMAIg5TGIXClhMAJc4Lkbyj1fFa1Jcp9OJ8Z7CO+zksXpfQDHATll30mMVHsGfFQ/MPdBxgFR2lVpZxquAOgFKvaXclkml0G7JayG2g2EejOd4PVh23SngMAHuSKUqQArI7wgFyCxfWpUJ8EXWAJHKBATILF9alQnwRdYAkcoEBMgsX1qVCfBF1gCRygQEyCxfWpUJ8EXWAJHKBATILF9alQnwRdYAkVrcG8TuNT+05/dp6FKVH+ArS4K5C7xlc9dDR62ynQC4YDunE9SC2wmxJZvl0ZZISSaogG4C7OwxH8lNpV1ezh2FmPA8j4W0RTx2AecHjJnKrlDyXAHdBFhqqujOuShWXHQsQQCfDKKCAHc5CTVGAd/ltRI7KqCbgBhlBRg6gYFSRbu8FXIOk7ycwyh2BBBSgngVsJ0AxSQ7XvSbXCe/MaClvpx2iQcy4jrJ4mugTgD3wPFgMAl9AqRiNuSVDLIRPxVSwPFmmGMzAnCngDoB6IdiBplkdwbHIwYz5jzx21FJ/gtWQJ0AOh7MoxgCZclnQrEZkQiAZ77khBQjAJc8tswQgDdAVBK4UMB2Akhis+iUgfMw5hkqxG5wiQBliwOQigBESBkFgLXynLgCthNAHihnQJ67ArGSQTyWE5IChS32JZ5ieVbsJII0K2A7AeQZeWmnPiE5OybtSjgS+THDY46R2D8FbCcAjiQ/0EgwFQPLbhCsTIO+BHmohJMjGx1EWwqhAiO8BLEroE4AaUqiKwEt8QzCk5GQxyRmeD6WthR+fQmRUxt6vOyaFVDvDpNtJC7WkDGQ53ITnlNDEh4AgwfPcyrzFpQAAAsx5ngzD8fw2IyUjEYB578ZQqsUiS2TlscAktfyJZJYVmESCjleg5Qt1wo4T4BraikMhALqu0AgmpYmPVRAJsBDMQNJJRMQSNs8bFomwEMxA0klExBI2zxsWibAQzEDSSUTEEjbPGxaJsBDMQNJJRMQSNs8bFomwEMxA0klExBI2zxsWibAQzEDSSUTEEjbPGxa/Q0RoB6xctV3Ju77z5+uP4XnjHv4xW8O3fLzFzaf8/Bca6qeg+csWbZg/ODU7g3Vp4s+27Dh0xO1YYAOvO/ZH9yZ0VZzbdev/+1Ph60JJBu3AhYTEDeHVwX9Zn39Ww8OOP3xh2+UXukxdM49K55OaXnhV59VhY0Lu9b8ujQZzuk79csPT/LqPOGJKHADTUDKlNljkgpee/mdffXQ2MHDdanPfWP2lNTP/nLeqK8sPVwZaTdjcEPkH3l4p4CLCUjKmr5ixR05Q9P7JLfUVZcVbX1n7acnIqa1PkK9Ry5cvmTuhEH9utafL92/5e1395xtjG4OW77qmZw9r37Q+/alk7NvqjtbvH39ui3FlyIv9IaRmppqVBdXRJkajnz46mtpl6LLKIXtv71HLFh677xxg/onN14sP7rjvfV/LWkjhhJ9z/pd2xM7xkb8nwQzFj721Tn9yz/+8/++/PLq9Xuvjbr/m18e361NjVDGwieeXDb62sGNf1y9ZvORm6Y9+u1HJve6TqruU+6Y2bBn/Z/+tLGgceR9T3x9dkrbdpdQyDBwGFozVysK9xWUXbmu2HaRcdvjT60Yde3g+2tWv/5+ftOopU9+fX6UGF46dD077Noe2UE24n4NCGUOyA5VbNy0dd/5iASFRUW7U5PromoMnDF3SNPel1/ZcCjydZ9f1JD23FfmT3rzwPZ2I3tV7vj9W9si6/yj4QHPPzBtYp/teZeiBC7/7d67ufTTN/Zu2lnWBAwHj7QM/PnDk8b2zsNz9T3rd102FJyyuCcgXFFW1jx17v1Lr+0uKSsvKzt76VxF++X269fXqDxT2SU5OfK5zWiuPHsxNDU91TDaJ+DymfLoovZ4UXH5iBC8RiQ6AfWln60vNYxQUrfkrvCy1lJ3qdEY3Ltn27n6nvW77dfWQaO4J8A4/8mrv+123+Lp9351cY8ko+nKqX3vvb52Zzm+13cxQsaQJc++sITJdTkpia2McEv7K/3pLb96ke+5jkP9Jyx5cPmcUek9usJbCT7YYGp71l9RlK3D/msxAS3NzUaXUPsHhBC8P4dbWkiClqrCzasLNxtJ3ftlDs2964EVDz1SUfyLrRcigBZ4I6/Ie2XtAXpfgBeCmnKq1QUt4TDMDxlo9BgwcXzGpaMHTl7WVbXu9Zr50Dduzzi84Q9vnrzUGBmwoYufWt7+MQD60vTstOt4erAB7UbTdVRVVxs3Z2b2aEukZGV1C1+oqmlbdk8fOW50Nry+Gs31NeVH8j7cWxlKS0tr262puWgkt1z+vLTtca4uqVvIaG7b1f9z4cIFo192Vvc21E1j7vzaY3eOan03ocKmpkYj1MXUdOaggd2qD/xl64EjJa0Hw/sMf93R96zfpaM7amDxGnApf9eR+x5e8k/Lu237/GqfMQvvHFq7/3eHI5+wIo/m9BmPPjHxzNaNecXVjUl9hs+dld74+ZbTuGmc3rXt1G33PvK12r/sr6i/KWXM/H+Yc/OuXz5/vKptX/dP1f6dR+95aMXjX+r5WcmVHkNm3z05XPzm/tbPm1RWfeLk5W5TFtwzNXziauRr/erZY8erGo0zJ042zJu14v6avKPVLT0zx07Jzbxm0PegDj3rr4iO7qhBUkZG9KetdIkN5YdL6tLHTp85e2bukB5V+ZtWv72nKjoBLZXHSq6kjpk5b97c2bfmjujf+HnemnV59F187YmC0qYBk+YumDdz8qjsUPmOdas3Hq2LvvP3G7toVnbFzo+PRF9R6MxIUH+6sPhK/9HTZs6ZNXl439qizX9447Mz7T62YmEEmgZOmbfwtrkzp8Nj0OWd20uvGo3lx06GM8ZOnQUt3ZLafHTT9suTJqec+HRbSW2kSt+zfrf11I78JH8z1JHdjeXaTG+psRQJpgMpIBPQgcx0dSkyAa5k60BFMgEdyExXlyIT4Eq2DlQkE9CBzHR1KTIBrmTrQEUyAR3ITFeXIhPgSrYOVCQT0IHMdHUpMgGuZOtARTIBHchMV5fi2QQo/zmgsnTVW3uRt2ztvBL9v/y9AP9PIu2s5f8JpdjkqwLqb4iYLcH/2NOyCfKJm8qRnI3ASIhLSlKVHRUBKODkkDRTEVICjQLqBJCO3AlKAhHPW/KSMY5IKscSOMWyBHfxGUuoHwr4LtFKEIsC6gTEUqNgyDYMFFdol1cRBpO4tETGCODkEselQHwTYDYJMnAePisHg6+Ep0DBKIV86TgWCpUs3SkQ3wSYz6CvZsVj9JIPAdaSx1RIAWcww8xHS8YTBSwmgNTHgDtELlLSnFGqAEmEAMZCnvHkMoTEtQIWE0AmcZvBM1iicxjQLm5RB5TXZGgLAuTEDI8tMwQwn8I5JY5dAYsJMBcrHgOAhgAt4cZQbOaxtI2S/BQioV1g4wAzuWTcKeA8AXrdaRToePSMqigggLsAebxic9dDh6xyngD+VcgloDwFfDf2GEwlMI8pKYGvCugmAP2I0WAOhthcZZmEayMkByAbXTltAZhi2FVghJcgdgXUCSBNyRg9V7x4PRvscoMdwdQkteFYIgBFAfXeIGpKyipo89KMVywEAGTgQbUQY5IyGBAVAmhXWVIe8byWtiSIXYH4/m7Qzgw6Ly4AgKnQMsBB4U5bwiSZiALxTUAiJ0ntjamA+i5wY3YpXfmngEyAf9oGg1kmIBg++delTIB/2gaDWSYgGD7516VMgH/aBoNZJiAYPvnXpUyAf9oGg1kmIBg++delTIB/2gaDWSYgGD7516V6d9jxJPO9H8cbPMiZyA0e86GOfQogRgVinQBus9kPcpdvKTE1ZJcnAAREyJMS+6GA7b1B8Imfp7FEQfIqHnMGPgQcA7Hlll2S13J+npdYr4DuNSBGTc0wS8M0fQAedoHHshB38RlJ6EQK+K7mINkyK6CbADPaMmOpvjlJbgEJj2kJJUqejsO8BkBICeJVQDcBZhcVdjTGbFvsVilH8KW4rqjt01I3AWZrNU1w8wDGl5yH8pSkALZ4jGdRRnO0bCWigG4C4uW1dIssRzbEKMl4DxK8hwp4OQHufOVVPMaLVDK0tJw2D3XpPFQOE0CKK4pYGmCZtGMgQqoCJI8RQBlYcgCVS5CgAg4TAOzcAzzMzlS7fIIt0qHQiQyBJ2JyEusJcCe0eVbgJMex4AAe8y4l9k8B6wlwd547/2huoJzHvAfaAgDFAICYwyR2oYDFBHCJ42Ik/3hVvCbFdTqdGO8pvMNOHqv3BRQD7JR1Jz1W4RH8WfHA3AMdB0hlV6mVZbwKqBOg1FvKbZlUCu2WvBZiOxjmwXiO14Nl150CDhPgjlSqAqSA/I5QgMzypVWZAF9kDRCpTECAzPKlVZkAX2QNEKlMQIDM8qVVmQBfZA0QqUxAgMzypVWZAF9kDRCpTECAzPKlVZkAX2QNEKnFvUHsXvNDe36fhi5V+QG+siSYu8BbNnc9dNQq2wmAC7ZzOkEtuJ0QW7JZHm2JlGSCCugmwM4e85HcVNrl5dxRiAnP81hIW8RjF3B+wJip7AolzxXQTYClporunItixUXHEgTwySAqCHCXk1BjFPBdXiuxowK6CYhRVoChExgoVbTLWyHnMMnLOYxiRwAhJYhXAdsJUEyy40W/yXXyGwNa6stpl3ggI66TLL4G6gRwDxwPBpPQJ0AqZkNeySAb8VMhBRxvhjk2IwB3CqgTgH4oZpBJdmdwPGIwY84Tvx2V5L9gBdQJoOPBPIohUJZ8JhSbEYkAeOZLTkgxAnDJY8sMAXgDRCWBCwVsJ4AkNotOGTgPY56hQuwGlwhQtjgAqQhAhJRRAFgrz4krYDsB5IFyBuS5KxArGcRjOSEpUNhiX+IplmfFTiJIswK2E0CekZd26hOSs2PSroQjkR8zPOYYif1TwHYC4EjyA40EUzGw7AbByjToS5CHSjg5stFBtKUQKjDCSxC7AuoEkKYkuhLQEs8gPBkJeUxihudjaUvh15cQObWhx8uuWQH17jDZRuJiDRkDeS434Tk1JOEBMHjwPKcyb0EJALAQY44383AMj81IyWgUcP6bIbRKkdgyaXkMIHktXyKJZRUmoZDjNUjZcq2A8wS4ppbCQCigvgsEomlp0kMFZAI8FDOQVDIBgbTNw6ZlAjwUM5BUMgGBtM3DpmUCPBQzkFQyAYG0zcOmZQI8FDOQVDIBgbTNw6ZlAjwUM5BUMgGBtM3Dpj2bAOU2j7JMsGNv2RJspoOVq78f8AVcHr/dZ2ctv534BbTUmY9QJ8BsCd6itdSIfOKmciRnIzAS4pKSVGVHRQAKODkkzVSElECjgDoBpCN3gpJAxPOWvGSMI5LKsQROsSzBXXzGEuqHAr5LtBLEooA6AbHUKBiyDQPFFdrlVYTBJC4tkTECOLnEcSkQ3wSYTYIMnIfPysHgK+EpUDBKIV86joVCJUt3CsQ3AeYz6KtZ8Ri95EOAteQxFVLAGcww89GS8UQBiwkg9THgDpGLlDRnlCpAEiGAsZBnPLkMIXGtgMUEkEncZvAMlugcBrSLW9QB5TUZ2oIAOTHDY8sMAcyncE6JY1fAYgLMxYrHAKAhQEu4MRSbeSxtoyQ/hUhoF9g4wEwuGXcKOE+AXncaBToePaMqCgjgLkAer9jc9dAhq5wngH8VcgkoTwHfjT0GUwnMY0pK4KsCuglAP2I0mIMhNldZJuHaCMkByEZXTlsAphh2FRjhJYhdAXUCSFMyRs8VL17PBrvcYEcwNUltOJYIQFFAvTeImpKyCtq8NOMVCwEAGXhQLcSYpAwGRIUA2lWWlEc8r6UtCWJXIL6/GrMzg86LCwBgKrQMcFC405YwSSaiQHwTkMhJUntjKqC+C9yYXUpX/ikgE+CftsFglgkIhk/+dSkT4J+2wWCWCQiGT/51KRPgn7bBYJYJCIZP/nUpE+CftsFglgkIhk/+dSkT4J+2wWBW7w06dm3+yb/jj/eRM5Ef75sPdexTADEqEOsEcJvNfpC7fEuJqSG7PAEgIEKelNgPBWzvDIFP/DyNJQqSV/GYM/Ah4BiILbfskryW8/O8xHoFdK8BMWpqhlkapukD8LALPJaFuIvPSEInUsB3NQfJllkB3QSY0ZYZS/XNSXILSHhMSyhR8nQc5jUAQkoQrwK6CTC7qLCjMWbbYrdKOYIvxXVFbZ+WugkwW6tpgpsHML7kPJSnJAWwxWM8izKao2UrEQV0ExAvr6VbZDmyIUZJxnuQ4D1UwMsJcOcrr+IxXqSSoaXltHmoS+ehcpgAUlxRxNIAy6QdAxFSFSB5jADKwJIDqFyCBBVwmABg5x7gYXam2uUTbJEOhU5kCDwRk5NYT4A7oc2zAic5jgUH8Jh3KbF/ClhPgLvz3PlHcwPlPOY90BYAKAYAxBwmsQsFLCaASxwXI/nHq+I1Ka7T6cR4T+EddvJYvS+gGGCnrDvpsQqP4M+KB+Ye6DhAKrtKrSzjVUCdAKXeUm7LpFJot+S1ENvBMA/Gc7weLLvuFHCYAHekUhUgBeR3hAJkli+tygT4ImuASGUCAmSWL63KBPgia4BIZQICZJYvrcoE+CJrgEhlAgJkli+tygT4ImuASGUCAmSWL63KBPgia4BIZQICZJYvrVrcHcZzNLdt+J06akq5haMsCeYu8JbNXQ8dtcp2AuCC7ZxOUAtuJ8SWbJZHWyIlmaACugmws8d8JJdcHW8AAAH1SURBVDeVdnk5dxRiwvM8FtIW8dgFnB8wZiq7QslzBXQTYKmpojvnolhx0bEEAXwyiAoC3OUk1BgFfJfXSuyogG4CYpQVYOgEBkoV7fJWyDlM8nIOo9gRQEgJ4lXAdgIUk+x40W9ynfzGgJb6ctolHsiI6ySLr4E6AdwDx4PBJPQJkIrZkFcyyEb8VEgBx5thjs0IwJ0C6gSgH4oZZJLdGRyPGMyY88RvRyX5L1gBdQLoeDCPYgiUJZ8JxWZEIgCe+ZITUowAXPLYMkMA3gBRSeBCAdsJIInNolMGzsOYZ6gQu8ElApQtDkAqAhAhZRQA1spz4grYTgB5oJwBee4KxEoG8VhOSAoUttiXeIrlWbGTCNKsgO0EkGfkpZ36hOTsmLQr4UjkxwyPOUZi/xSwnQA4kvxAI8FUDCy7QbAyDfoS5KESTo5sdBBtKYQKjPASxK6AOgGkKYmuBLTEMwhPRkIek5jh+VjaUvj1JURObejxsmtWQL07TLaRuFhDxkCey014Tg1JeAAMHjzPqcxbUAIALMSY4808HMNjM1IyGgWc/2oMrVIktkxaHgNIXsuXSGJZhUko5HgNUrZcK+A8Aa6ppTAQCqjvAoFoWpr0UAGZAA/FDCSVTEAgbfOwaZkAD8UMJJVMQCBt87BpmQAPxQwk1f8BosSEmHqJl1UAAAAASUVORK5CYII=
