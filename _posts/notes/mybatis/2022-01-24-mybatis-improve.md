---
layout: post
title:  "模拟MyBatis依赖"
date:   2022-01-24 23:44:02 +0800
categories: notes mybatis base
tags: MyBatis 基础 改造
excerpt: "工程改进"
---

我们之前的工程都是使用MyBatis来创建的，而这次我们将MyBatis的依赖删掉，尝试自己实现MyBatis的功能。

即在pom.xml文件中将MyBatis的依赖注释掉。

然后在java.org.didnelpsun下面新建mybatis包，这里面就是自己编写的MyBatis。

## XML解析

由于不使用MyBatis框架了，所以对应的XML配置文件的结构文件DTD的依赖就不用了，把SqlMapConfig.xml和UserDAO.xml前面的DTD格式文件配置注释掉。

所以此时我们需要自己将XML内容进行解析，这个内容并不难，使用的是dom4j技术，其他的XML解析技术也可以。

将dom4j依赖加到dom.xml中：

```xml
<dependency>
  <groupId>org.dom4j</groupId>
  <artifactId>dom4j</artifactId>
  <version>2.1.3</version>
</dependency>
```

然后还需要配合一个xpath：

```xml
<dependency>
  <groupId>jaxen</groupId>
  <artifactId>jaxen</artifactId>
  <version>1.2.0</version>
  <type>bundle</type>
</dependency>
```

然后在mybatis文件夹下新建一个utils包用来包含工具类。

然后在utils下新建一个XMLConfigBuilder.java用来解析XML配置文件。

这个文件解析返回的是XML配置，所以还需要定义一个配置类。在mybatis下新建一个cfg包，并新建一个Configuration类。

```java
package org.didnelpsun.mybatis.cfg;

// 自定义MyBaits的配置类

public class Configuration {
    // 属性为对应的连接属性
    private String driver;
    private String url;
    private String username;
    private String password;

    
    public String getDriver() {
        return driver;
    }

    public void setDriver(String driver) {
        this.driver = driver;
    }

    
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
```

在之前的对于XML方式总结的封装对象时，谈到映射信息的键值为Mapper对象。所以此时我们还需要在cfg下定义一个Mapper类。

## 编写代理

此时就会发现AppTest.java里的所有关于MyBatis的依赖全部失效了，包括：

1. class Resources。
2. class SqlSessionFactoryBuilder。
3. interface SqlSessionFactory。
4. interface SqlSession。

然后在java.org.didnelpsun下面新建自己编写的MyBatis依赖类与接口：

