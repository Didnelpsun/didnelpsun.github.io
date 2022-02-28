---
layout: post
title: "基本概念与环境搭建"
date: 2022-02-28 00:26:25 +0800
categories: notes springmvc base
tags: SpringMVC 基础
excerpt: ""
---

SpringMVC是一种基于Java的MVC模式的请求驱动类型的Web框架。服务器端分为持久层（MyBatis）、业务层（Spring）、表现层（SpringMVC）。

MVC设计模式包括：M即model，模型，如JavaBean；V即view，视图，如JSP；C即controller，控制器，如Servlet。

## 搭建环境

### &emsp;创建项目

使用IDEA的Maven创建项目，选择模板org.apache.maven.archetypes:maven-archetype-webapp。

然后要在目录添加对应的文件夹，在main下新建java和resources文件夹，在main同级构建test文件夹，在test下新建java和resources文件夹。

我这里在pom.xml修改了编译目标，并在pom.xml中添加依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>org.didnelpsun</groupId>
  <artifactId>demo</artifactId>
  <version>1.0-SNAPSHOT</version>
  <packaging>war</packaging>

  <name>demo Maven Webapp</name>
  <!-- FIXME change it to the project's website -->
  <url>https://www.didnelpsun.com</url>

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
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-web</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-webmvc</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/javax.servlet/servlet-api -->
    <dependency>
      <groupId>javax.servlet</groupId>
      <artifactId>servlet-api</artifactId>
      <version>2.5</version>
      <scope>provided</scope>
    </dependency>
    <!-- https://mvnrepository.com/artifact/javax.servlet.jsp/jsp-api -->
    <dependency>
      <groupId>javax.servlet.jsp</groupId>
      <artifactId>jsp-api</artifactId>
      <version>2.2</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>

  <build>
    <finalName>demo</finalName>
    <pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (maybe moved to parent pom) -->
      <plugins>
        <plugin>
          <artifactId>maven-clean-plugin</artifactId>
          <version>3.1.0</version>
        </plugin>
        <!-- see http://maven.apache.org/ref/current/maven-core/default-bindings.html#Plugin_bindings_for_war_packaging -->
        <plugin>
          <artifactId>maven-resources-plugin</artifactId>
          <version>3.0.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.8.0</version>
        </plugin>
        <plugin>
          <artifactId>maven-surefire-plugin</artifactId>
          <version>2.22.1</version>
        </plugin>
        <plugin>
          <artifactId>maven-war-plugin</artifactId>
          <version>3.2.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-install-plugin</artifactId>
          <version>2.5.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-deploy-plugin</artifactId>
          <version>2.8.2</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

然后选择pom.xml右键maven重新加载。

使用SpringMVC还需要配置一个前端控制器，需要在Servlet中配置，即在src/main/webapp/WEB-INF/web.xml中配置：

```xml
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >

<web-app>
  <display-name>Archetype Created Web Application</display-name>
  <servlet>
    <!--给Servlet取一个名字-->
    <servlet-name>dispatcherServlet</servlet-name>
    <!--Servlet所使用的类，是一个固定类-->
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  </servlet>
  <!--配置Servlet映射，即任何URL请求都会经过这个Servlet-->
  <servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <!--URL匹配，即URL是这个字符串就会调用该Servlet-->
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```

由于该项目是一个SpringMVC项目，所以需要进行Spring的配置，在src/main/resources下新建->XML配置文件->Spring配置，新建一个SpringMVC.xml。

### &emsp;配置服务器

由于SpringMVC是一个Web项目，所以需要配置服务器，即选择添加配置，点击+号，选择Tomcat本地服务器，然后点击部署，选择加号，选择工件，点击demo:war，然后将应用程序上下文改为/，即根路径。

此时点击运行就会跳到<http://localhost:8080/>显示Hello World。

## 编写

修改webapp下的index.jsp：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
    <head>
        <title>demo</title>
    </head>
    <body>
        <a href=""></a>
    </body>
</html>
```

我们想对这个index.jsp进行Java的控制，所以在java下新建org.didnelpsun.controller.HelloController控制器：

