---
layout: post
title: "SSM框架整合环境"
date: 2022-03-07 22:53:20 +0800
categories: notes springmvc ssm
tags: SpringMVC SSM
excerpt: "SSM框架整合环境"
---

即整合Spring+SpringMVC+MyBatis。可以使用多种方式，这里使用注解+XML方式。以Spring为中心整合其他两个，先Spring，后SpringMVC，最后MyBatis。

首先使用IDEA的Maven创建webapp项目ssm。

添加依赖：

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <spring.version>5.3.16</spring.version>
</properties>

<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>
    <!--Spring依赖-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>
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
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-test</artifactId>
        <version>${spring.version}</version>
        <scope>test</scope>
    </dependency>
    <!--SpringMVC依赖-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/javax.servlet/javax.servlet-api -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.1</version>
        <!--依赖范围-->
        <!--服务器会提供这个依赖，所以打包时不会打war包进去-->
        <scope>provided</scope>
    </dependency>
    <!-- https://mvnrepository.com/artifact/javax.servlet.jsp/jsp-api -->
    <dependency>
        <groupId>javax.servlet.jsp</groupId>
        <artifactId>jsp-api</artifactId>
        <version>2.2</version>
        <scope>provided</scope>
    </dependency>
    <!-- https://mvnrepository.com/artifact/javax.servlet/jstl -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>jstl</artifactId>
        <version>1.2</version>
    </dependency>
    <!--MyBatis配置-->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.9</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.28</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/org.mybatis/mybatis-spring -->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis-spring</artifactId>
        <version>2.0.7</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/com.zaxxer/HikariCP -->
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
        <version>5.0.1</version>
    </dependency>
</dependencies>
```

SpringMVC和Spring都是一套的所以可以轻松连接，而Spring和MyBatis不是一套组件，所以需要添加mybatis-spring依赖。

## 搭建Spring

添加main和test的java和resources文件夹。创建org.didnelpsun文件夹，并在下面添加entity、dao、service、controller包。

### &emsp;编写代码文件

entity下新建一个User类：

```java
// User.java
package org.didnelpsun.entity;

import java.io.Serializable;
import java.util.Date;

public class User implements Serializable {
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
    public String toString() {
        return "User{" + "id=" + this.id + ",name=" + this.name + ",birthday=" + this.birthday + ",sex=" + this.sex + ",address=" + this.address + "}";
    }

    public User() {
    }

    public User(Integer id, String name, String sex, Date birthday, String address) {
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }

    public User(String name, String sex, Date birthday, String address) {
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }
}
```

为了Java类能被数据库操作和数据传输，需要实现序列化接口。

然后在对应的文件夹下新建IUserDao.java、UserDaoImpl.java、IUserService.java、UserServiceImpl.java、UserController.java并表明其之间的实现关系。

```java
// IUserDao.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import java.util.List;

public interface IUserDao {
    List<User> selectAllUsers();
}
```

```java
// UserDaoImpl.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository("userDao")
public class UserDaoImpl implements IUserDao {
    @Override
    public List<User> selectAllUsers() {
        return null;
    }
}
```

```java
// IUserService.java
package org.didnelpsun.service;

import org.didnelpsun.entity.User;
import java.util.List;

public interface IUserService {
    List<User> selectAllUsers();
}
```

```java
// UserServiceImpl.java
package org.didnelpsun.service;

import org.didnelpsun.dao.UserDaoImpl;
import org.didnelpsun.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service("userService")
public class UserServiceImpl implements IUserService {
    // 私有的DAO
    private UserDaoImpl userDao;
    // Spring注入
    @Autowired
    public void setUserDao(UserDaoImpl userDao) {
        this.userDao = userDao;
    }
    @Override
    public List<User> selectAllUsers() {
        System.out.println("selectAllUsers");
        return userDao.selectAllUsers();
    }
}
```

```java
// UserController.java
package org.didnelpsun.controller;

import org.springframework.stereotype.Controller;

@Controller("userController")
public class UserController {
}
```

### &emsp;编写Spring配置文件

点击main的resources右键，新建->XML配置文件->Spring配置，新建ApplicationContext.xml。其中Spring的配置文件只用管dao、service、entity三个包，controller由SpringMVC控制。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="
       http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context.xsd
">
    <!--由于没有主文件进行标准Java运行，这里是Web项目，所以不使用@ComponentScan注解-->
    <!--开启注解扫描，只处理service和dao-->
    <context:component-scan base-package="org.didnelpsun">
        <!--将Controller注解的类都不处理-->
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
    </context:component-scan>
</beans>
```

### &emsp;编写测试文件

在test的java文件下编写TestRun文件：

```java
import org.didnelpsun.service.UserServiceImpl;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class TestRun {
    @Test
    public void testSpring(){
        // 加载配置文件
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("ApplicationContext.xml");
        // 获取对象
        UserServiceImpl userService = (UserServiceImpl) applicationContext.getBean("userService");
        // 调用方法
        userService.selectAllUsers();
    }
}
```

如果运行没有错误就则可以继续配置。

&emsp;

## 搭建SpringMVC

### &emsp;配置web.xml

在webapp/WEB-INF/web.xml中编写前端控制器、SpringMVC配置、过滤器，其中字符编码过滤器必须在最前面：

```xml
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >

<web-app>
  <display-name>SSM</display-name>
  <!--中文编码过滤器-->
  <filter>
    <filter-name>characterEncodingFilter</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <!--编码类型-->
    <init-param>
      <param-name>encoding</param-name>
      <param-value>UTF-8</param-value>
    </init-param>
    <!--强转响应请求-->
    <init-param>
      <param-name>forceRequestEncoding</param-name>
      <param-value>true</param-value>
    </init-param>
    <init-param>
      <param-name>forceResponseEncoding</param-name>
      <param-value>true</param-value>
    </init-param>
  </filter>
  <filter-mapping>
    <filter-name>characterEncodingFilter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
  <!--请求类型过滤器-->
  <filter>
    <filter-name>hiddenHttpMethodFilter</filter-name>
    <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
  </filter>
  <filter-mapping>
    <filter-name>hiddenHttpMethodFilter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
  <!--配置前端控制器-->
  <servlet>
    <servlet-name>dispatcherServlet</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <!--加载SpringMVC.xml配置文件-->
    <init-param>
      <param-name>contextConfigLocation</param-name>
      <param-value>classpath:SpringMVC.xml</param-value>
    </init-param>
    <!--启动时机-->
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```

### &emsp;配置SpringMVC

即在resources文件夹下新建一个Spring的配置文件SpringMVC.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="
       http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/mvc
       http://www.springframework.org/schema/mvc/spring-mvc.xsd
">
    <!--开启注解扫描-->
    <!--只用扫描Controller-->
    <!--include标签表示在原有的基础上添加，所以需要将默认扫描改为false表示什么都不扫描-->
    <context:component-scan base-package="org.didnelpsun" use-default-filters="false">
        <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
    </context:component-scan>
    <!--配置视图解析器-->
    <!--id名不能写错-->
    <bean id="internalResourceViewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/page/"/>
        <property name="suffix" value=".jsp" />
    </bean>
    <!--配置过滤静态资源-->
    <mvc:default-servlet-handler />
    <!--开启SpringMVC注解支持-->
    <mvc:annotation-driven />
    <!--添加view-controller-->
    <mvc:view-controller path="/" view-name="index" />
</beans>
```

### &emsp;编写页面

由于SpringMVC.xml中指定页面都是在WEB-INF/page下，所以新建page文件夹并将index.jsp移动到下面，进行修改：

```jsp
<%@ page contentType="text/html;charset=UTF-8"  %>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>首页</title>
</head>
<body>
    <a href="${pageContext.request.contextPath}/user/selectAllUsers">查询所有用户</a>
</body>
</html>
```

### &emsp;编写控制器

修改UserController：

```java
// UserController.java
package org.didnelpsun.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller("userController")
@RequestMapping("/user")
public class UserController {
    @RequestMapping("/selectAllUsers")
    public String selectAllUsers(){
        System.out.println("控制层");
        return "index";
    }
}
```

最后部署Tomcat进行运行，注意部署时选择应用程序上下文为空，且不要选择最新的Tomcat。

此时会报错404：<http://localhost:8080/$%7BpageContext.request.contextPath%7D/user/selectAllUsers>，之前提到将Web改为2.3以上的版本，对web.xml的头部进行修改：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--web工程的入口配置文件-->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
```

最后运行没有问题。

### &emsp;整合Spring

修改UserController：

```java
// UserController.java
package org.didnelpsun.controller;

import org.didnelpsun.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller("userController")
@RequestMapping("/user")
public class UserController {
    UserServiceImpl userService;
    @Autowired
    public void setUserService(UserServiceImpl userService) {
        this.userService = userService;
    }
    @RequestMapping("/selectAllUsers")
    public String selectAllUsers(){
        userService.selectAllUsers();
        return "index";
    }
}
```

此时是无法运行的，因为运行Tomcat时，配置的web.xml和SpringMVC.xml都只扫描Controller，没有扫描Dao和Service，也没有联合ApplicationContext.xml。

所以启动Tomcat服务器时需要加载Spring配置文件。整个应用对象为ServletContext域对象，在服务器启动时创建一次，在服务器关闭时销毁一次。所以我们要用一种监听器，监听ServletContext域对象的创建和销毁，且各只执行一次。所以让这个监听器去加载Spring配置文件，创建WEB版本工程，存储ServletContext对象。

SpringMVC依赖的spring-web中已经提供了这个监听器。在web.xml中编写：

```xml
<!--应用加载监听器，默认只加载WEB-INF目录下的ApplicationContext.xml配置文件-->
<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
<!--设置ApplicationContext.xml配置文件的路径-->
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:ApplicationContext.xml</param-value>
</context-param>
```

然后运行，点击查询所有用户，控制台打印selectAllUsers。

&emsp;

## 搭建Mybatis

### &emsp;配置数据库连接

resources下新建SqlMapConfig.xml配置文件用来配置数据库连接：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!--config文件专用的dtd格式文件-->
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">

<!--mybatis的主配置文件-->
<configuration>
    <!--配置环境，default为默认值-->
    <environments default="mysql">
        <!--配置mysql的环境-->
        <environment id="mysql">
            <!--配置事务的类型-->
            <transactionManager type="JDBC"/>
            <!--配置连接池即数据源-->
            <dataSource type="POOLED">
                <!--配置数据库连接的基本信息-->
                <!--jdbc驱动程序-->
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <!--数据库连接字符串-->
                <property name="url" value="jdbc:mysql://localhost:3306/data"/>
                <property name="username" value="root"/>
                <property name="password" value="root"/>
            </dataSource>
        </environment>
    </environments>
    <!--指定映射配置文件的位置，映射配置文件指的是每个DAO独立的配置文件-->
    <mappers>
        <!--用于指定DAO接口所在的包，当指定了之后就不需要再写mapper以及resource或class了-->
        <package name="org.didnelpsun.dao"/>
    </mappers>
</configuration>
```

### &emsp;添加SQL语句

因为单独的DAO文件关联比较麻烦，且当前数据库操作比较简单，所以使用注解模式编写DAO，只需要接口文件，所以把UserDaoImpl删掉，并把接口添加注解：

```java
// IUserDao.java
package org.didnelpsun.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.didnelpsun.entity.User;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("userDao")
public interface IUserDao {
    // 查询所有用户
    @Select("select * from user")
    List<User> selectAllUsers();
    // 插入用户
    @Insert("insert into user(name,sex,birthday,address) values (#{name},#{sex},#{birthday},#{address})")
    void insertUser(User user);
    // 更新用户
    @Update("update user set name=#{name},sex=#{sex},birthday=#{birthday},address=#{address} where id=#{id}")
    void updateUser(User user);
    // 删除用户
    @Delete("delete from user where id=#{id}")
    void deleteUser(Integer id);
    // 查询一个用户
    @Select("select * from user where id=#{id}")
    User selectUser(Integer id);
    // 根据用户名模糊查询用户
    @Select("select * from user where name like #{name}")
    List<User> selectUsersByName(String name);
    // 获取用户总数
    @Select("select count(id) from user")
    Integer getUsersSum();
}
```

并在服务层将对应的持久层修改：

```java
// UserServiceImpl.java
package org.didnelpsun.service;

import org.didnelpsun.dao.IUserDao;
import org.didnelpsun.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("userService")
public class UserServiceImpl implements IUserService {
    // 私有的DAO
    private IUserDao userDao;
    // Spring注入
    @Autowired
    public void setUserDao(IUserDao userDao) {
        this.userDao = userDao;
    }
    @Override
    public List<User> selectAllUsers() {
        return userDao.selectAllUsers();
    }
}
```

### &emsp;测试MyBatis

在TestRun中定义：

```java
@Test
public void testMyBatis() throws IOException {
    // 加载配置文件
    InputStream in = Resources.getResourceAsStream("SqlMapConfig.xml");
    // 创建SqlSessionFactory对象
    SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
    // 创建SqSession对象
    SqlSession session = sqlSessionFactory.openSession();
    // 获取代理对象
    IUserDao userDao = session.getMapper(IUserDao.class);
    // 查询所有数据
    List<User> users = userDao.selectAllUsers();
    for(User user : users){
        System.out.println(user.toString());
    }
    // 关闭资源
    session.close();
    in.close();
}
```

### &emsp;整合MyBatis

目的就是将生成的代理对象也存储到容器中，直接在Spring的配置文件ApplicationContext.xml中编写。

连接池有C3P0和HikariCP两种，Hikari是SpringBoot2.0默认连接池，这里使用HikariCP。使用连接池后我们就不用自己去处理连接管理了。

resources下新建一个JdbcConfig.properties：

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/data
username=root
password=root
```

在ApplicationContext.xml配置下引用这个文件：

```xml
<!--整合MyBatis-->
<!--引入数据库配置-->
<context:property-placeholder location="classpath:JdbcConfig.properties"/>
<!--配置连接池-->
<bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
    <!--jdbc驱动程序-->
    <property name="driverClassName" value="${driver}"/>
    <!--数据库连接字符串-->
    <property name="jdbcUrl" value="${url}"/>
    <property name="username" value="${username}"/>
    <property name="password" value="${password}"/>
</bean>
<!--配置SqlSessionFactory工程-->
<bean id="sqlSessionFactoryBean" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="dataSource"/>
</bean>
<!--配置dao接口所在包-->
<bean id="mapperScannerConfigurer" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
    <property name="basePackage" value="org.didnelpsun.dao"/>
</bean>
```

此时就可以把MyBatis的配置文件SqlMapConfig.xml删掉。

此时点击查询所有用户报错：Cause: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is java.sql.SQLException: Access denied for user 'Didnelpsun'@'localhost' (using password: YES)

这是因为properties配置文件中使用了username，而在ApplicationContext.xml中使用EL表达式取值时和系统的用户名冲突了，可以把键名改为name或者jdbc.username皆可：

```properties
jdbc.driver=com.mysql.cj.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/data
jdbc.username=root
jdbc.password=root
```

然后重新配置连接池：

```xml
<bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
    <!--jdbc驱动程序-->
    <property name="driverClassName" value="${jdbc.driver}"/>
    <!--数据库连接字符串-->
    <property name="jdbcUrl" value="${jdbc.url}"/>
    <property name="username" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
</bean>
```

&emsp;

## 声明式事务管理

需要在Spring配置文件的ApplicationContext.xml中配置：

```xml
<!--配置声明式事务管理-->
<!--配置事务管理器-->
<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <property name="dataSource" ref="dataSource"/>
</bean>
<!--配置事务通知-->
<tx:advice id="interceptor" transaction-manager="transactionManager" >
    <tx:attributes>
        <!--如果是查询语句就设置为只读-->
        <tx:method name="select*" read-only="true"/>
    </tx:attributes>
</tx:advice>
<!--配置AOP增强-->
<aop:config>
    <!--配置切入点进行拦截事务处理-->
    <!--对service包下的所有ServiceImpl的所有方法进行事务管理-->
    <aop:advisor advice-ref="interceptor" pointcut="execution(* org.didnelpsun.service.*ServiceImpl.*(..))" />
</aop:config>
```

[SSM模板：SpringMVC/ssm](https://github.com/Didnelpsun/SpringMVC/tree/master/ssm)。
