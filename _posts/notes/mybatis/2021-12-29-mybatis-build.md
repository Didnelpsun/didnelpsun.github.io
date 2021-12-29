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

## 基础配置与工程

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
                <property name="driver" value="com.mysql.jdbc.Driver"/>
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
    <select id="FindAllUsers">
        select * from user
    </select>
</mapper>
```
