---
layout: post
title: "环境搭建与入门"
date: 2022-02-28 00:26:25 +0800
categories: notes springmvc base
tags: SpringMVC 基础 @RequestMapping @RequestParam
excerpt: "环境搭建与入门"
---

SpringMVC是一种基于Java的MVC模式的请求驱动类型的Web框架。服务器端分为持久层（MyBatis）、业务层（Spring）、表现层（SpringMVC）。

MVC设计模式包括：M即model，模型，如JavaBean；V即view，视图，如JSP；C即controller，控制器，如Servlet。

## 搭建环境

### &emsp;创建项目

使用IDEA的Maven创建项目，选择模板org.apache.maven.archetypes:maven-archetype-webapp。

然后要在目录添加对应的文件夹，在main下新建java和resources文件夹，在main同级构建test文件夹，在test下新建java和resources文件夹。

#### &emsp;&emsp;添加依赖

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
  <url>http://www.didnelpsun.com</url>

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
      <version>4.11</version>
      <scope>test</scope>
    </dependency>
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
  </dependencies>

  <build>
    <finalName>demo</finalName>
    <pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (may be moved to parent pom) -->
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

#### &emsp;&emsp;配置前端控制器

SpringMVC是基于原生的Servlet，通过前端控制器DispatcherServlet对请求和响应进行统一处理，所以使用SpringMVC还需要配置一个前端控制器，需要在Servlet中配置，即在src/main/webapp/WEB-INF/web.xml中配置：

```xml
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >
<!--web工程的入口配置文件-->
<web-app>
  <display-name>Archetype Created Web Application</display-name>
  <!--配置前端控制器，对浏览器的请求统一处理-->
  <!--默认配置方式-->
  <!--此配置作用下SpringMVC的配置文件默认于WEB/INF下，默认名称位<servlet-name>-servlet.xml，
  比如此时默认名称就为dispatcherServlet-servlet.xml。-->
<!--  <servlet>-->
<!--    <servlet-name>dispatcherServlet</servlet-name>-->
<!--    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>-->
<!--  </servlet>-->
<!--  <servlet-mapping>-->
<!--    &lt;!&ndash;当匹配url-pattern的路由后会调用servlet-name所映射的servlet&ndash;&gt;-->
<!--    <servlet-name>dispatcherServlet</servlet-name>-->
<!--    &lt;!&ndash;/表示匹配当前发送的所有请求，但是不包括.jsp文件&ndash;&gt;-->
<!--    &lt;!&ndash;因为JSP文件就是Servlet，需要专门的Servlet进行处理&ndash;&gt;-->
<!--    &lt;!&ndash;如果包含JSP则DispatcherServlet会当成普通的请求处理，不会返回JSP页面&ndash;&gt;-->
<!--    &lt;!&ndash;/*则包含所有请求，包括.jsp文件&ndash;&gt;-->
<!--    <url-pattern>/</url-pattern>-->
<!--  </servlet-mapping>-->
  <!--扩展配置方式-->
  <!--可以通过init-param标签设置SpringMVC配置文件的位置和名称，
  通过load-on-startup标签设置SpringMVC前端控制器DispatcherServlet的初始化时间-->
  <servlet>
    <servlet-name>dispatcherServlet</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <!--初始化参数，配置SpringMVC配置文件的位置和名称-->
    <init-param>
      <!--固定参数名称，表示上下文配置路径-->
      <param-name>contextConfigLocation</param-name>
      <!--classpath表示类路径，指定路径，在resources文件夹下-->
      <param-value>classpath:SpringMVC.xml</param-value>
    </init-param>
    <!--初始化顺序，服务器启动时初始化-->
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```

load-on-startup元素标记容器是否应该在Web应用程序启动的时候就加载这个Servlet（实例化并调用其init()方法）。它的值必须是一个整数，表示Servlet被加载的先后顺序。如果该元素的值为负数或者没有设置，则容器会当Servlet被请求时再加载。如果值为正整数或者0时，表示容器在应用启动时就加载并初始化这个Servlet，值越小，Servlet的优先级越高，就越先被加载。值相同时，容器就会自己选择顺序来加载。

由于该项目是一个SpringMVC项目，所以需要进行Spring的配置，在src/main/resources下新建->XML配置文件->Spring配置，新建一个SpringMVC.xml。

### &emsp;配置服务器

由于SpringMVC是一个Web项目，所以需要配置服务器，即选择添加配置，点击+号，选择Tomcat本地服务器，然后点击部署，选择加号，选择工件，点击demo:war，然后将应用程序上下文改为/，即根路径。

此时点击运行就会跳到<http://localhost:8080/>显示Hello World。这里访问的就是index.jsp。

然后我们将index.jsp从webapp下放到WEB-INF/pages下，这样我们就不能直接访问index.jsp了。这时我们的目的就是通过转发的方式访问index.jsp。

### &emsp;编写控制器

由于前端控制器已经创建过了，所以就只用定义控制器的方法，让前端控制器根据不同的路由或参数调用这些方法。

我们想对这个index.jsp进行Java的控制，所以在java下新建org.didnelpsun.controller.HelloController控制器，如果想将这些控制器作为组件来进行管理，则需要用到Spring的Bean控制方式，一种是注解，一种是XML，这里适用注解：

```java
// HelloController.java
package org.didnelpsun.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HelloController {
    // 访问index
    // RequestMapping表示请求映射，当访问path内的路径/时会调用index方法转发到index
    @RequestMapping("/")
    public String index(){
        // 返回视图名称，从而被视图解析器解析
        // 由于要访问的是/WEB-INF/pages/index.jsp，根据后面视图解析器的配置
        // 前缀为/WEB-INF/pages/，后缀为.jsp，所以这里返回的就是index字符串
        return "index";
    }
}
```

### &emsp;编写SpringMVC配置

之前前端控制器配置时提到需要指定SpringMVC配置文件，所以此时我们就需要编写SpringMVC配置。

需要Spring将Java程序注入到JSP中要经过扫描的操作，在Spring中有主类App.java进行扫描，而这里没有主类，就需要在XML中扫描组件HelloController。

此外由于控制器类会返回对应的JSP页面，所以还要编写视图解析器，将控制器指定的页面解析处理。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <!--开启扫描组件-->
    <context:component-scan base-package="org.didnelpsun.controller"/>
    <!--配置视图解析器-->
    <!--对转向页面的路径解析。prefix：前缀，suffix：后缀 -->
    <bean id="internalResourceViewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <!--所有的视图页面全部在WEB-INF的pages下-->
        <!--WEB-INF不能直接URL访问也不能重定向访问，只能转发访问-->
        <property name="prefix" value="/WEB-INF/pages/"/>
        <!--后缀为jsp-->
        <property name="suffix" value=".jsp"/>
    </bean>
</beans>
```

Spring自带了13个视图解析器，能够将逻辑视图名转换为物理实现（主要是InternalResourceviewResolver）。

视图解析器|描述
:--------:|:--:
BeanNameviewResolver|将视图解析为Spring应用上下文中的Bean，其中Bean的ID与视图的名字相同
ContentNegotiatingviewResolver|通过考虑客户端需要的内容类型来解析视图，委托给另外一个能够产生对应内容类型的视图解析器
FreeMarkerviewResolver|将视图解析为FreeMarker模板
InternalResourceviewResolver|将视图解析为Web应用的内部资源，一般为JSP
JasperReportsviewResolver|将视图解析为JasperReports定义
ResourceBundleviewResolver|将视图解析为资源bundle，一般为属性文件
TilesviewResolver|将视图解析为Apache Tile定义，其中tile ID与视图名称相同。注意有两个不同的TilesviewResolver实现，分别对应于Tiles 2.0和Tiles 3.0
UrlBasedviewResolver|直接根据视图的名称解析视图，视图的名称会匹配一个物理视图的定义
VelocityLayoutviewResolver|将视图解析为Velocity布局，从不同的Velocity模板中组合页面
VelocityviewResolver|将视图解析为Velocity模板
XmlViewResolver|将视图解析为特定XML文件中的bean定义。类似于BeanName-ViewResolver
XsltviewResolver|将视图解析为XSLT转换后的结果

SpringMVC视图解析器解析流程：

1. 将SpringMVC控制器中的返回结果封装成一个ModelAndView对象。
2. 通过SpringMVC中的视图解析器，使用ViewResolver对控制器返回的ModelAndView对象进行解析，逻辑视图转换成物理视图。
3. 调用View中的`render()`方法对物理视图进行渲染。

此时能访问到index.jsp了。

<span style="color:orange">注意：</span>如果你发现你代码没有问题，但是对应的页面根本返回不出来报404，可以肯定并不是路径问题。在控制台发现异常信息为：org.springframework.web.servlet.DispatcherServlet cannot be cast to class jakarta.servlet.Servlet，这是因为Tomcat版本与Maven版本不兼容，javaee改名jakartaee的问题，所以Tomcat渲染会有问题，比如此时Tomcat10不能跳转到index页面，而Tomcat8.5版本就没问题，所以版本太高不一定好。

<span style="color:orange">注意：</span>internalResourceViewResolver的prefix的值与控制器的RequestMapping以及返回值都与URL密切相关，切记不能写错，特别是/的使用。

### &emsp;动态前缀

如果我们在JSP页面的a标签的href中指定路由，如/hi，那么这是相对路径，分为浏览器解析的和服务器解析的，如服务器解析的就是根据程序上下文的在WEB-INF下，这就是我们开发者所想要的，但是如果是浏览器解析的就是localhost://8080的，这就是有问题的。

所以我们需要使用动态前缀：`${pageContext.request.contextPath}`。

如我们重新定义index.jsp：

```jsp
<html>
<body>
<h2><a href="${pageContext.request.contextPath}/">Hello World!</a></h2>
</body>
</html>
```

会报错404，这时路由会变成<http://localhost:8080/$%7BpageContext.request.contextPath%7D/>，这是由于使用的是archetype-webapp生成的web工程，默认创建的web版本为2.3，从而导致获取使用pageContext获取项目路径时被错误解析。

解决方法是将Web改为2.3以上的版本，对web.xml的头部进行修改：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--web工程的入口配置文件-->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
         ...
</webapp>
```

也可以使用themyleaf的服务端渲染技术来完成。

### &emsp;基本流程总结

浏览器发送请求，蒂请求地址符合前端控制器的url-pattern。该请求就会被前端控制器DispatcherServlet处理。前端控割韶会读取SpringMVC的核心配置文件。通过扫描组件找到控制器。将请求地址和控制器中@RequestMapping注解的value属性值进行匹配，若匹配成功，该注解所标识的控制器方法就是处理请求的方法。处理请求的方法需要返回一个字符申类型的视图名称，该视图名称会被视图解析器解析，加上前缀和后缀组成视图的路径，通过Thymeleaf对视图进行渲染，最空转发到视图所对应页面。

&emsp;

## @RequestMapping注解

将请求和处理请求的控制器关联起来，建立映射关系。标识一个类时就是设置映射请求路径的初始信息，标识一个方法时就是设置映射请求路径的具体信息，对于每个方法的路由就是对应的类的路由拼接上方法的路由。控制器方法如果要映射路由必须使用@RequestMapping注解，即使类上已经添加@RequestMapping。

### &emsp;匹配请求方式

@RequestMapping的匹配请求方式通过@RequestMapping的参数来匹配。

#### &emsp;&emsp;value和path

value和path都是一样的意思，都是通过路径字符串直接匹配路由。参数为String类型数组，表示多个路由都是同一种操作方式。

value和path属性必须设置，可以省略value和path键名。只有value和path属性先匹配其他属性的设置才有作用。

#### &emsp;&emsp;method

通过请求方式（get或post）匹配请求映射。参数为RequestMethod类型数组，表示该请求能够匹配多种请求方式。如`@RequestMapping(value = "/",method = RequestMethod.GET)`。默认匹配GET请求。

请求地址value或path如果满足，但是请求方式method不满足，则浏览器会报错405：Request method GET not supported。

对于处理指定请求方式的控制器方法，SpringMVC中提供了@RequestMapping的派生注解，可以不用设置method：处理get请求的映射：@GetMapping、处理post请求的映射：@PostMapping、处理put请求的映射：@PutMapping处理、delete请求的映射：@DeleteMapping。

常用的请求方式有get、post、put、delete。但是目前浏览器只支持get和post，若在form表单提交时，为method设置了其他请求方式的字符串（put或delete），则按照默认的谲求方式get处理。若要发送put和delete请求，则需要通过Spring提供的过鲸器HiddenHttpMethodFilter，在restful部分会讲到。

#### &emsp;&emsp;params

通过请求的请求参数匹配进行映射。参数为String类型数组，可以通过四种表达式设置请求参数和请求应映射的匹配关系：

1. "param"：要求请求映射所匹配的请求必须携带param参数。
2. "!param"：要求请求映射所匹配的请求不能携带param参数。
3. "param=value"：要求请求映射所匹配的请求必须携带param参数，且param=value。
4. "param!=value"：要求请求映射所匹配的请求必须携带param参数，但是param!=value。

修改控制器：

```java
// HelloController.java
package org.didnelpsun.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(value = "/")
public class HelloController {
    // 访问index
    // RequestMapping表示请求映射，当访问path内的路径/时会调用index方法转发到index
    @GetMapping
    public String index(){
        // 返回视图名称，从而被视图解析器解析
        // 由于要访问的是/WEB-INF/pages/index.jsp，根据后面视图解析器的配置
        // 前缀为/WEB-INF/pages/，后缀为.jsp，所以这里返回的就是index字符串
        return "index";
    }
    // 必须携带value参数
    @GetMapping(value = "/{value}", params = {"value"})
    // 通过@PathVariable注解获取参数，括号内为参数名
    public String hello(){
        return "index";
    }
}
```

修改JSP文件：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
</head>
<body>
<h2><a href="${pageContext.request.contextPath}/">Hello World!</a></h2>
<h2><a href="${pageContext.request.contextPath}/?value=hello">携带value="hello"</a></h2>
</body>
</html>
```

点击之后没问题。

如果参数不匹配则会报400错误。

#### &emsp;&emsp;headers

通过请求的请求头信息匹配映射。参数为String数组类型，可以通过四种表达式设置头部信息和匹配头部关系：

1. "header"：要求请求映射所匹配的请求必须携带header头部信息。
2. "!header"：要求请求映射所匹配的请求不能携带header头部信息。
3. "header=value"：要求请求映射所匹配的请求必须携带header头部信息，且header=value。
4. "header!=value"：要求请求映射所匹配的请求必须携带header头部信息，但是header!=value。

如`@RequestMapping(value = "/{value}", params = {"value"}, headers = {"Host=localhost:8082"})`就是要求必须携带Host=localhost:8082。此时报错是404错误。

&emsp;

## SpringMVC路径

### &emsp;ant风格路径

SpringMVC支持ant风格的路径，即可以通过通配符匹配路径：

+ ?：表示任意的单个字符。
+ *：表示任意的0或多个字符。
+ \*\*：表示任意的一层或多层目录。

在使用\*\*时，只能使用/\*\*/xxx的方式来表示。如果\*\*旁边添加了别的内容，则直接按两个\*来解析。

如JSP添加：`<h2><a href="${pageContext.request.contextPath}/test/ant">ant风格路径</a></h2>`，控制器中增加一个方法：

```java
// 测试ant风格路径
@RequestMapping("**/a*")
public String testAnt(){
    return "index";
}
```

注意浏览器路径中/、?这种代表特殊含义的符号不能匹配控制器的路径中的?和\*。

### &emsp;restful风格

SpringMVC支持restful风格的占位符。

+ 原始方式：/select?id=1。
+ restful方式：/select/1。

当通过路径方式传参时，可以在@RequestMapping的value属性中通过占位符{xxx}表示传输的数据，再通过@PathVariable获取请求的参数，设置在控制器方法的参数前，代表这个参数是获取请求的参数。同时要注意这个注解修饰的参数和URL有关系，是URL绑定的占位符，所以当使用这个注解修饰变量来获取路径参数时，必须在路径加上这个变量，在URL中加上/{xxx}占位符可以通过@PathVariable("xxx")绑定到操作方法的入参中。

如之前的params属性给出的例子：

```java
// 必须携带value参数
@RequestMapping(value = "/{value}", params = {"value"}, headers = {"Host=localhost:8082"})
// 通过@PathVariable注解获取参数，括号内为参数名
public String hello(@PathVariable("value")String value){
    System.out.println(value);
    return "index";
}
```

params指定路径必须携带的参数名，value表示这个参数在路径的位置，@PathVariable获取对应名的参数并赋值给变量。

<span style="color:orange">注意：</span>如果使用`<h2><a href="${pageContext.request.contextPath}/hello">携带value="hello"</a></h2>`会报错，因为restful路径第一个不能是变量。

所以需要重新定义`<h2><a href="${pageContext.request.contextPath}/restful/hello">携带value="hello"</a></h2>`，然后定义控制器：

```java
@RequestMapping(value = "/restful/{value}")
// 通过@PathVariable注解获取参数，括号内为参数名
public String restful(@PathVariable("value")String value){
    System.out.println(value);
    return "index";
}
```

这样就能直接获取/restful后面传入的参数了。

&emsp;

## 获取请求参数

在WEB-INF/pages下新建一个页面param.jsp用来测试获取请求参数，然后修改index.jsp：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
</head>
<body>
<h2><a href="${pageContext.request.contextPath}/">Hello World!</a></h2>
<h2><a href="${pageContext.request.contextPath}/?value=hello">携带value="hello"</a></h2>
<h2><a href="${pageContext.request.contextPath}/test/ant">ant风格路径</a></h2>
<h2><a href="${pageContext.request.contextPath}/restful/hello">携带value="hello"</a></h2>
<h2><a href="${pageContext.request.contextPath}/param">获取请求参数</a></h2>
</body>
</html>
```

然后在HelloController下添加跳转到该页面的控制器：

```java
@RequestMapping("/param")
public String param(){
    return "param";
}
```

### &emsp;servletAPI

即Servlet原生接口。将HttpServletRequest作为控制器方法的形参，此时HttpServletRequest类型的参数表示封装了当前请求的请求报文对象。

```java
@RequestMapping("/param")
public String paramApi(HttpServletRequest request){
    String value = request.getParameter("value");
    System.out.println(value);
    return "param";
}
```

利用HttpServletRequest的getParameter就可以捕获传入的参数。如访问<http://localhost:8080/param?value=3>，这个控制器方法没有使用`@RequestMapping(value = "/param/{value}")`所以就不能使用restful格式获取参数了。

为什么能获取到HttpServletRequest？这是谁传入的参数？因为前端控制器DispatcherServlet继承了HttpServlet，当到了该路由时调用对应控制器，DispatcherServlet调用父类方法直接将请求封装到HttpServletRequest中并传入控制器方法。

### &emsp;控制器形参

#### &emsp;&emsp;基本使用

保证控制器的形参名和请求的参数名一致，SpringMVC会自动将请求参数赋值给形参。

```java
@RequestMapping("/param")
public String paramController(String value){
    System.out.println(value);
    return "param";
}
```

此时由于控制器说明只有一个参数value，所以其他参数会全部丢弃，即访问<http://localhost:8080/param?value=3&name=2>就只能获取到value值。

当遇到输入多个参数时，SpringMVC会按照参数名称来一一赋值，所以输入参数的顺序不重要。当没有赋值到的就是null。

如果输入的是一个复选框的内容，即同名数据，一个name有多个value值，SpringMVC则提供String数组类型的参数来包装提供给我们，也可以提供String类型的参数给我们，数据中间以逗号拼接。

#### &emsp;&emsp;@RequestParam

将路径参数和控制器方法的形参创建映射关系。

如果形参名和参数名不一致，则无法自动赋值，这时候可以使用@RequestParam注解在形参名前，表示形参名和参数名的映射对应关系。

```java
@RequestMapping("/param")
public String paramController(String value, @RequestParam("user") String name){
    System.out.println("value:" + value + " name:" + name);
    return "param";
}
```

此时访问<http://localhost:8080/param?value=1&user=3>就可以获取对应数据。

但是此时name这个参数名就不能获取到参数了，即<http://localhost:8080/param?value=1&name=3>会报错400，且user这个属性不再是非必须的而是必须的了，因为@RequestParam注释的required属性默认为true，如果改为非必须就设置`@RequestParam(value = "user", required = false)`。

此外@RequestParam注释还有一个defaultValue属性，表示不传值或传空值的默认值。

#### &emsp;&emsp;@RequestHeader

将请求头信息和控制器方法的形参创建映射关系。由于请求头和控制器方法的形参没有默认映射关系，所以要获取请求头的信息必须使用@RequestHeader注解。

一共三个属性：value、required、defaultValue。使用方法同RequestParam。

#### &emsp;&emsp;@CookieValue

将Cookie信息和控制器方法的形参创建映射关系。

一共三个属性：value、required、defaultValue。使用方法同RequestParam。

由于是使用JSP的页面，所以默认会给出Cookie值，如果是HTML页面则不会有Cookie值，则需要调用`HttpSession session = request.getSession()`创建会话来从服务器获取Session和Cookie。

```java
@RequestMapping("/param")
public String paramController(String value,
                              @RequestParam(value = "user", required = false) String name,
                              @RequestHeader("Host") String host,
                              @CookieValue("JSESSIONID") String cookie
){
    System.out.println("value:" + value + " name:" + name);
    System.out.println("host:" + host);
    System.out.println("cookie:" + cookie);
    return "param";
}
```

### &emsp;POJO

#### &emsp;&emsp;获取POJO对象

可以在控制器方法的形参位置设置一个实体类类型的形参，此时若浏览器传输的请求参数的参数名和实体类中的属性名一致，则请求参数会为此实体类属性赋值。

与上面类型不同的是，之前参数是一个个参数，而这时候是将一些参数整合成POJO对象，如User类。

在org.didnelpsun下创建一个entity实体类包，并创建一个User类：

```java
// User.java
package org.didnelpsun.entity;

import java.io.Serializable;

public class User implements Serializable{
    private Integer id;
    private String name;
    private String sex;
    private String birthday;
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

    public String getBirthday() {
        return birthday;
    }

    public void setBirthday(String birthday) {
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

    public User(Integer id, String name, String sex, String birthday, String address){
        System.out.println("UserClass");
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }

    public User(String name, String sex, String birthday, String address){
        System.out.println("UserClass");
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
    }
}
```

编写param：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>param</title>
</head>
<body>
    <form action="${pageContext.request.contextPath}/param" method="post">
        <label>
            用户名
            <input type="text" name="name">
        </label><br>
        <label>
            性别
            <input type="radio" name="sex" value="男">男
        </label>
        <label>
            <input type="radio" name="sex" value="女">女
        </label><br>
        <label>
            生日
            <input type="date" name="birthday">
        </label><br>
        <label>
            地址
            <input type="text" name="address">
        </label><br>
        <input type="submit" value="提交" />
    </form>
</body>
</html>
```

然后编写控制器，如果是直接获取参数，那么要写好几个参数，这很麻烦，所以使用POJO对象：

```java
@RequestMapping("/param")
public String paramPojo(User user){
    System.out.println(user);
    return "param";
}
```

如果控制器方法参数写为User user, String name, String sex这种，后面的name和sex属性也会被赋值，因为SpringMVC是按属性名赋值的，只要一样就赋值，不过这样显然没什么意义。

#### &emsp;&emsp;中文乱码

注意这样就直接传输过来了。但是这时候sex值会乱码，因为字符编码不一致。

要改变编码方式必须在获取请求参数之前，否则就已经乱码了。

请求乱码有两种，一种是post请求乱码，一种是get请求乱码。

如果将表单的提交方式改为get，即method="get"就不会乱码，那么就代表get请求的乱码我们在此之前就已经解决过了。

get请求的乱码是由Tomcat造成的，所以要解决get请求乱码就需要让Tomcat不乱码，在Tomcat安装目录的conf/server.xml中找到`<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />`，要解决乱码就要在其中加上URIEncoding="UTF-8"。

post请求的乱码是DispatcherServlet造成的，所以即使在控制器方法中重新设置了编码格式也没有用，因为DispatcherServlet获取参数时就已经乱码了，所以为了解决乱码必须在DispatcherServlet请求参数之前完成。由于我们之前在web.xml中设置过前端控制器DispatcherServlet是在服务器启动时就加载的，所以就必须找到一种技术在DispatcherServlet执行之前就开始。

Servlet中学过组件加载顺序，监听器Listener->过滤器Filter->服务器小程序Servelt。而监听器只监听事件，只会执行一次，而过滤器只要请求路径满足过滤路径都会被过滤器过滤，所以此时我们可以使用过滤器处理中文乱码问题。
