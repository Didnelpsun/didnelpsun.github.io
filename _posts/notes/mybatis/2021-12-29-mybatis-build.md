---
layout: post
title:  "1099端口占用"
date:   2021-12-29 13:05:33 +0800
categories: notes mybatis base
tags: MyBatis 基础 环境
excerpt: "环境搭建"
---

SSM包括Spring MVC、MyBatis和Spring。Spring MVC是MVC框架，负责表现层，MyBatis是持久层框架，负责数据访问。Spring包括IoC和AOP。

MyBatis封装JDBC的细节，使得开发者只用关心SQL语句而无需关心注册驱动等。

## XML方式

### 搭建基础工程

直接使用IDEA的Maven工程创建，使用quick-start就可以了，不用使用webapp文件模板。

然后在pom.xml中添加`<packaging>jar</packaging>`表示打包方式使用jar包。然后安装MyBatis：[MyBatis官网](https://mybatis.org/mybatis-3/zh/getting-started.html)：

```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>x.x.x</version>
</dependency>
```

然后去[MyBatis产品网址](https://blog.mybatis.org/)查看最新版本号。最后点击pom.xml右键maven的重新导入就可以了。

由于是数据库操作所以还需要去[Maven中央仓库](https://mvnrepository.com/artifact/mysql/mysql-connector-java)寻找一个mysql的依赖，直接搜索mysql：

```xml
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.27</version>
</dependency>
```

由于需要使用数据库，所以需要建立一个MySQL数据库文件，具体方式可以见[MySQL安装配置](../mysql/2020-03-03-mysql-install-and-configure.md)。

### 编写对象

#### 实体对象

在java/org.didnelpsun这种组织名文件夹下新建一个文件夹，名字任意，我取的是entity，新建实体类，即处理数据的对象。如我要处理一个User数据，里面有id等属性：

```java
package org.didnelpsun.entity;

import java.io.Serializable;
import java.util.Date;

public class User implements Serializable{
    private String id;
    private String name;
    private Date birthday;
    private String sex;
    private String address;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
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
}
```

由于Java的都是对象，而MyBatis是管理数据库，所以要将对象序列化为字节才能保存与传输，所以需要继承java.io.Serializable接口。可以在main/java/org.xxx/下新建一个类，如User类。至于为什么要将类序列化可以参考这个[博客](https://blog.csdn.net/u011568312/article/details/57611440)：把原本在内存中的对象状态变成可存储或传输的过程称之为序列化。序列化之后，就可以把序列化后的内容写入磁盘，或者通过网络传输到别的机器上。

#### 持久对象

为了对User对象进行处理，所以需要一个User的持久层接口，在在java/org.didnelpsun这种组织名文件夹下新建一个文件夹dao，新建一个接口UserDAO：

```java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;

import java.util.List;

public interface UserDAO {
    // 查询所有用户
    List<User> FindAllUsers();
}
```

这里定义了一个方法就是查询所有User用户类。

### 创建配置文件

#### 创建MyBatis配置文件

创建一个xml文件对MyBatis进行整体的配置，一般命名为SqlMapConfig，将其放在resources下：

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
            <transactionManager type="JDBC"></transactionManager>
            <!--配置连接池即数据源-->
            <dataSource type="POOLED">
                <!--配置数据库连接的基本信息-->
                <!--jdbc驱动程序-->
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <!--数据库连接字符串-->
                <property name="url" value="jdbc:mysql://localhost:3306/default"/>
                <property name="username" value="root"/>
                <property name="password" value="root"/>
            </dataSource>
        </environment>
    </environments>
    <!--指定映射配置文件的位置，映射配置文件指的是每个DAO独立的配置文件-->
    <mappers>
        <!--resource是相对于resources文件夹的资源地址-->
        <mapper resource="org.didnelpsun/dao/UserDAO.xml"/>
    </mappers>
</configuration>
```

#### 创建DAO映射配置文件

可以对每一个持久层接口DAO文件进行单独的映射配置，在resources下创建org.didnelpsun文件夹，并再创建一个dao文件夹，放入对应的DAO配置文件，我用的是UserDAO.xml：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!--namespace是DAO的地址-->
<mapper namespace="org.didnelpsun.dao.UserDAO">
    <!--配置查询所有，id为对应类的方法名，不能随便改-->
    <!--resultType即持久层返回的数据应该封装成什么样的数据类-->
    <select id="FindAllUsers" resultType="org.didnelpsun.entity.User">
        select * from user
    </select>
</mapper>
```

<span style="color:orange">注意：</span>MyBatis的映射配置文件必须和DAO接口的包结构相同。即配置文件UserDAO.xml在resources的org.didnelpsun.dao下，那对应的UserDAO比如也应该在org.didnelpsun.dao下。

### 配置测试

最后更改对应的test文件夹里的测试文件：

```java
package org.didnelpsun;

// import static org.junit.Assert.assertTrue;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import org.junit.Test;

/**
 * Unit test for simple App.
 */
public class AppTest 
{
    /**
     * Rigorous Test :-)
     */
    @Test
    public void shouldAnswerWithTrue()
    {
        //1.读取配置文件
        InputStream in = null;
        try {
            // 由于代码可能移动到各种地方，所以基本读取路径都不适用绝对路径和相对路径
            // 使用类加载器，只能读取类路径的配置文件
            // 使用ServletContext对象的getRealPath()，读取当前项目运行路径。
            in = Resources.getResourceAsStream("SqlMapConfig.xml");
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 2.创建SqlSessionFactory工厂
        SqlSessionFactoryBuilder builder = new SqlSessionFactoryBuilder();
        // SqlSessionFactory不能new
        // 这个工厂使用的是一个工厂builder，并调用build方法创建
        // 创建工厂MyBatis使用的是创建者模式，隐藏实现细节，使得使用者专注于方法
        SqlSessionFactory factory = builder.build(in);
        // 3.使用工厂模式生产SqlSession对象，解耦，即降低了类之间的依赖关系
        SqlSession session = factory.openSession();
        // 4.使用SqlSession创建DAO接口的代理对象，使用了代理模式，不修改源码方法上对已有方法增强
        UserDAO userDAO = session.getMapper(UserDAO.class);
        // 5.使用代理对象执行方法
        List<User> users = userDAO.FindAllUsers();
        for(User user : users){
//          System.out.println(user);
            System.out.println(user.toString());
        }
        // 6.释放资源
        session.close();
        try {
            assert in != null;
            in.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
//        assertTrue( true );
    }
}
```

### XML方式总结

除了编写User这种实体类和UserDAO这种持续对象，XML方式的主要实现方式就是通过XML。

#### XML配置

在main的resources下新建一个SqlMapConfig.xml编写配置。配置内容有两个：一是environment标签的数据库连接配置，包括链接、用户名和密码；二是mapper标签的用于配置DAO持久对象的XML配置文件。（路径是相对于resources文件夹）

#### DAO配置

承接上面所说的DAO配置文件，每一个DAO都有一个XML配置文件。每一个持久层的SQL操作都包含在mapper标签中，里面包含SQL操作标签，再包含一个SQL语句。

上面的三个都是XML配置，解析XML配置的技术是dom4j。

#### 封装对象

根据读取配置文件的信息来创建对象工厂封装对象。

其中这个工厂生产封装过程由MyBatis自己完成：

1. 根据配置文件的信息创建Connection对象注册驱动，获取数据库连接。
2. 获取预处理对象PreparedStatement，此时需要SQL语句：`conn.prepareStatement(sql);`，其中这个sql就是由上面的第二的mapper标签包含的SQL语句。
3. 执行查询方法，即获取`ResultSet resultSet = preparedStatement.executeQuery();`。
4. 遍历结果集并封装返回结果，`while(resultSet.next()){}`。其中结果集中的每一个对象类型就是select标签的resultType属性所指向的。然后利用反射根据名称获取结果集的每个属性并赋值给对象。

我们要完成封装这一步就需要知道两个信息：连接信息和映射信息。主要是映射信息，包含：执行的SQL语句、封装结果的实体类全限定类名。将这两个信息组合起来定义一个对象。键名为对应DAO的全限定类名加上点再加上SQL方法名，键值为一个Mapper对象，包含一个String的SQL语句和一个String的domainClassPath即作用类域。

#### 创建代理

即利用SqlSession创建DAO接口的代理对象。传入的参数为DAO对象这个类。

创建代理的方法为`public <T> getMapper(Class<T> daoInterfaceClass){}`。传入参数为返回类型为T的DAO接口，方法返回值为T。

整个案例[XML方式代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo1_build_xml)。

&emsp;

## 注解方式

不用编写DAO文件与编写DAO配置，直接将java/resources下的org.didnelpsun.dao文件夹删除。

然后更改UserDAO，给对应方法加上注解，里面是SQL语句：

```java
public interface UserDAO {
    // 查询所有用户
    @Select("select * from user")
    List<User> FindAllUsers();
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

所以注解是什么意思呢？就是DAO实现方式的简化。若是我们自己写FindAllUsers方法，就必须接受一个SessionFactory然后对这个Session进行处理，并进行对应的操作，而使用注解或XML就直接写一个SQL语句就可以了，其他的对应的Session维护代码由MyBatis自动完成。

案例[注解方式代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo1_build_annotation)。
