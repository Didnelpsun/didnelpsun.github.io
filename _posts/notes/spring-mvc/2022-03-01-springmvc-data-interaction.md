---
layout: post
title: "数据交互"
date: 2022-03-01 14:02:48 +0800
categories: notes springmvc base
tags: SpringMVC 基础 数据
excerpt: "数据交互"
---

## 获取请求参数

在WEB-INF/pages下新建一个页面param.jsp用来测试获取请求参数，然后修改index.jsp：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
<link rel="icon" href="data:;base64,=">
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
    <link rel="icon" href="data:;base64,=">
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

#### &emsp;&emsp;编码过滤器

注意这样就直接传输过来了。但是这时候sex值会乱码，因为字符编码不一致。

要改变编码方式必须在获取请求参数之前，否则就已经乱码了。

请求乱码有两种，一种是post请求乱码，一种是get请求乱码。

如果将表单的提交方式改为get，即method="get"就不会乱码，那么就代表get请求的乱码我们在此之前就已经解决过了。

get请求的乱码是由Tomcat造成的，所以要解决get请求乱码就需要让Tomcat不乱码，在Tomcat安装目录的conf/server.xml中找到`<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />`，要解决乱码就要在其中加上URIEncoding="UTF-8"。

post请求的乱码是DispatcherServlet造成的，所以即使在控制器方法中重新设置了编码格式也没有用，因为DispatcherServlet获取参数时就已经乱码了，所以为了解决乱码必须在DispatcherServlet请求参数之前完成。由于我们之前在web.xml中设置过前端控制器DispatcherServlet是在服务器启动时就加载的，所以就必须找到一种技术在DispatcherServlet执行之前就开始。

Servlet中学过组件加载顺序，监听器Listener->过滤器Filter->服务器小程序Servelt。而监听器只监听事件，只会执行一次，而过滤器只要请求路径满足过滤路径都会被过滤器过滤，所以此时我们可以使用过滤器处理中文乱码问题。

在web.xml中定义一个过滤器，这是SpringMVC就提供的组件：

```xml
<!--定义字符编码过滤器-->
<filter>
  <filter-name>characterEncodingFilter</filter-name>
  <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
  <!--强制请求编码转换为UTF-8-->
  <!--默认encoding是指向强制请求编码转换-->
  <init-param>
    <param-name>encoding</param-name>
    <param-value>UTF-8</param-value>
  </init-param>
<!--强制响应编码进行转换-->
  <init-param>
    <param-name>forceResponseEncoding</param-name>
    <param-value>true</param-value>
  </init-param>
</filter>
<!--定义过滤器映射，即过滤路径，哪些请求会被过滤-->
<filter-mapping>
  <filter-name>characterEncodingFilter</filter-name>
  <!--过滤所有请求，包括JSP文件-->
  <url-pattern>/*</url-pattern>
</filter-mapping>
```

&emsp;

## 域对象共享数据

当前我们都是从页面获取参数到后端，那么我们如何从后端将数据传递到前端页面呢？这就需要域对象共享数据。

域的类别：

+ PageContext：一个JSP页面的范围。
+ Request：一次请求，即请求发起到请求响应的过程。
+ Session：一次会话，即浏览器开启到浏览器关闭的过程。
+ ServletContext：即Application，整个应用的范围，从服务器开启到服务器关闭的过程。

Session钝化：服务器关闭但是浏览器未关闭，Session中的数据会序列化到磁盘上。
Session活化：浏览器未关闭而服务器又开启，则将磁盘Session数据读取到Session中。

### &emsp;servletAPI向request域

### &emsp;ModelAndView向request域
