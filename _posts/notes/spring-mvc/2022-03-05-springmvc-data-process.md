---
layout: post
title: "数据处理"
date: 2022-03-05 16:31:17 +0800
categories: notes springmvc base
tags: SpringMVC 基础 数据
excerpt: "数据处理"
---

## 静态资源处理

如果你的DispatcherServlet拦截正则化的URL，就不存在访问不到静态资源的问题。如果你的DispatcherServlet拦截url-pattern为"/"，拦截了所有的请求，同时对.js,*.jpg的访问也就被拦截了。所以此时静态资源就无法被访问了，如static里的图片。

### &emsp;激活Tomcat的DefaultServlet

在web.xml里添加如下配置

```xml
<servlet-mapping>
    <servlet-name>default</servlet-name>
    <url-pattern>*.jpg</url-pattern>
</servlet-mapping>
<servlet-mapping>
    <servlet-name>default</servlet-name>
    <url-pattern>*.js</url-pattern>
</servlet-mapping>
<servlet-mapping>
    <servlet-name>default</servlet-name>
    <url-pattern>*.css</url-pattern>
</servlet-mapping>
```

要配置多个，每种文件配置一个。

要写在DispatcherServlet的前面， 让DefaultServlet先拦截，这个就不会进入Spring了，性能最好。

默认Servlet的名字：

+ Tomcat,Jetty,JBoss,andGlassFish：default。
+ Google App Engine：_ah_default。
+ Resin：resin-file。
+ WebLogic：FileServlet。
+ WebSphere：SimpleFileServlet。

### &emsp;使用\<mvc:resources\>

Spring3.0.4以后版本提供了mvc:resources标签。

```xml
<!--SpringMVC框架通过使用mvc：resources标签可以配置静态资源的解析：
  	location：表示静态资源在项目目录中的位置，/表示项目的webapp目录的位置（maven项目）
  	mapping：表示匹配http请求的url的中的位置，/表示tomcat配置的web根目录，此处配置的web根目录为http://localhost:8080/项目名/
  	如果这样子的话，建议映射的方法就不要使用static作为action映射的路径名
-->
<mvc:resources location="/static/" mapping="/static/**"/>
```

配置的location一定要是webapp根目录下才行，如果你将资源目录，放置到webapp/WEB-INF下面的话，则就会访问失败，因为默认这里是安全目录客户端无法访问。

/static/**这个路径表示匹配/static/下的所有URL，映射到ResourceHttpRequestHandler进行处理，location指定静态资源的位置.可以是web application根目录下、jar包里面，这样可以把静态资源压缩到jar包中。cache-period可以使得静态资源进行web cache。

如果出现下面的错误，可能是没有配置\<mvc:annotation-driven/\> 的原因：WARNING: No mapping found for HTTP request with URI \[/mvc/user/findUser/lisi/770\] in DispatcherServlet with name 'SpringMVC'。

使用这个标签就是把mapping的URI注册到SimpleUrlHandlerMapping的urlMap中，key为mapping的URI pattern值，而value为ResourceHttpRequestHandler，这样就巧妙的把对静态资源的访问由 HandlerMapping转到ResourceHttpRequestHandler处理并返回，所以就支持类路径classpath目录，jar包内静态资源的访问。另外需要注意的一点是不要对SimpleUrlHandlerMapping设置DefaultHandler。因为对 static uri的DefaultHandler就是ResourceHttpRequestHandler，否则无法处理static resources request。

### &emsp;使用\<mvc:default-servlet-handler/\>

处理静态资源的是默认的DefaultSevlet，DispatcherServlet是处理控制器中请求映射的，而控制器方法中没有写访问静态资源的映射，所以无法处理静态资源。如果要添加处理静态资源的依赖，必须在SpringMVC.xml中添加`<mvc:default-servlet-handler />`表示开发对静态资源的访问。在运行期间，先交给前端控制器DispatcherServlet处理，如果DispatcherServlet找不到对应映射，则SpringMVC会调用DefaultServletHttpRequestHandler交给DefaultSevlet处理。

可以在Tomcat安装目录下的conf/web.xml中查看，DefaultSevlet其load-on-startup为1，JspServlet的load-on-startup为3，这是Tomcat的默认映射。根据就近原则，工程项目里的web.xml会覆盖Tomcat里的web.xml作为本工程的设置。

多个HandlerMapping的执行顺序问题：DefaultAnnotationHandlerMapping的order属性值是0，\<mvc:resources/\>注解自动注册的SimpleUrlHandlerMapping的order属性值是2147483646，\<mvc:default-servlet-handler/\>自动注册的SimpleUrlHandlerMapping的order属性值是2147483647。

Spring会先执行order值比较小的。当访问一个image.jpg图片文件时，先通过DefaultAnnotationHandlerMapping来找处理器，一定是找不到的，我们没有叫image.jpg的Action。再按order值升序找匹配，由于最后一个SimpleUrlHandlerMapping是匹配/**所有路径的，所以一定会匹配上，再响应图片。

&emsp;

## HttpMessageConverter

即报文信息转换器，将请求报文转换为Java对象，或将Java对象转换为响应报文。

提供两个注解：@RequestBody（请求体转换为Java对象）、@ResponseBody（Java对象转换为响应体）和两个类型：RequestEntity（请求类型）、ResponseEntity（响应类型）。

使用[案例一搭建环境：SpringMVC/demo1_build](https://github.com/Didnelpsun/SpringMVC/tree/master/demo1_build)。

删除HelloControll.java新建PageController.java。

由于直接跳转到index，所以在SpringMVC.xml中添加`<mvc:view-controller path="/" view-name="index" />`和`<mvc:annotation-driven />`。

在web.xml中在前端控制器前添加之前定义的编码过滤器：

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

### &emsp;@RequestBody

可以获取请求体，需要在控制器方法中设置一个形参，使用@RequestBody进行标识，当前请求的请求体就会为当前注解所标识的形参赋值。

由于GET请求会把请求参数凭借在请求路径上，所以只有POST请求会有请求体。

修改index.jsp：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
</head>
<body>
    <form method="post" action="${pageContext.request.contextPath}/requestBody">
        <label>
            用户：
            <input type="text" name="name">
        </label><br>
        <label>
            密码：
            <input type="text" name="password">
        </label><br>
        <input type="submit" value="提交">
    </form>
</body>
</html>
```

添加控制器：

```java
package org.didnelpsun.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class PageController {
    @PostMapping("/requestBody")
    public String requestBody(@RequestBody String requestBody){
        System.out.println("请求体："+requestBody);
        // 重定向
        return "redirect:/";
    }
}
```

此时我们会发现后端获取的数据乱码了，之前不是已经定义过编码过滤器吗？在浏览器打开开发者工具，点击network获取这次请求，点击playload发现载荷的数据都是没有乱码的，那为什么到了后端就乱码了呢？这是因为在提交表单的时候前端自己对中文重新编码了，所以传到编码过滤器之前就已经乱码了，后端的编码过滤器自然就没用了。所以解决方式就是在前端设置请求头的字符编码。

后端接受的字符串方法体的样式是取决于前端对于参数的提交形式。如果前端是以空行的形式提交参数，则获取的请求头中的参数之间就是以空行的形式。

### &emsp;RequestEntity

RequestEntity封装请求报文的一种类型，跟着一种泛型，设置了封装类型后就会自动将请求的数据封装为这个类型，如RequestEntity\<String\>就是想请求信息封装为字符串。需要在控制器方法的形参中设置该类型的形参，当前请求的请求报文就会赋值给该形参，可以通过`getHeaders()`获取请求头信息，通过`getBody()`获取请求体信息，通过`getClass()`获取封装类型的类，通过`getMethod()`获取请求类型，通过`getType()`获取封装类型，通过`getUrl`获取请求路径。

添加控制器：

```java
@PostMapping("/requestEntity")
public String requestEntity(RequestEntity<String> requestEntity){
    System.out.println("请求头：" + requestEntity.getHeaders());
    System.out.println("请求体：" + requestEntity.getBody());
    return "redirect:/";
}
```

修改index.jsp的提交路径：`<form method="post" action="${pageContext.request.contextPath}/requestEntity">`。

我们可以获得响应数据，并发现这时候我们的请求体的中文没有乱码。

从这里我们可以从请求头明白上面中文传输乱码的原因。我们提交的请求编码为：accept-encoding:"gzip, deflate, br"。假如你在前端设置编码`req.Headers["Accept-Charset"] = "utf-8";`也没用。这是因为普通浏览器访问网页之所以添加"Accept-Encoding" = "gzip,deflate"是因为浏览器对于从服务器中返回的对应的gzip压缩的网页会自动解压缩，所以在其request的时候会添加对应的头，表明自己接受压缩后的数据。而此代码中，如果也添加此头信息，结果就是，返回的压缩后的数据没有解码，而将压缩后的数据当做普通的HTML文本来处理，当前显示出来的内容，是乱码了。

从前端想要获得正确网页内容，而非乱码的话，就有两种方式了：

1. 不要设置Accept-Encoding的Header：`//req.Headers.Add("Accept-Encoding", "gzip,deflate");`。
2. 设置Accept-Encoding的Header，同时设置对应的自动解压缩的模式：`req.Headers["Accept-Encoding"] = "gzip,deflate";req.AutomaticDecompression = DecompressionMethods.GZip;`。

### &emsp;原生ServletAPI

响应可以响应一个完整的页面，也可以响应一组数据。可以使用ServletAPI对response进行处理。

在index.jsp中添加两个按钮，都是指向/response，如果使用字符流方式传入true，如果是字节流方式传入false：`<a href="${pageContext.request.contextPath}/response/true">通过ServletAPI进行字符流响应</a><a href="${pageContext.request.contextPath}/response/false">通过ServletAPI进行字节流响应</a>`。

添加控制器：

```java
// 由于不需要返回视图名称，所以返回值为null
@RequestMapping("/response/{type}")
public void response(HttpServletResponse response, @PathVariable("type") Boolean type) throws IOException {
    if(type){
        // 字符流方式
        // 这句话的意思，是让浏览器用utf8来解析返回的数据，即设置客户端解析的编码
        response.setContentType("text/html; chartset=UTF-8");
        //这句话的意思，是告诉servlet用UTF-8转码，而不是用默认的ISO8859，即服务端对中文的编码
        response.setCharacterEncoding("UTF-8");
        response.getWriter().println("ServletAPI字符流方式响应");
    }
    else{
        // 字节流方式
        // 这句话的意思，是让浏览器用utf8来解析返回的数据,即设置客户端解析的编码
        response.setHeader("Content-type", "text/html;charset=UTF-8");
        // response.setContentType("text/html; chartset=UTF-8");  //尝试使用这个设置“Content-type”未成功
        // 这句话的意思，使得放入流的数据是utf8格式
        response.getOutputStream().write("ServletAPI字节流方式响应".getBytes(StandardCharsets.UTF_8));
    }
}
```

此时跳转的路径的响应就只是字符流和字节流，而不是一个完整的页面。

### &emsp;@ResponseBody

### &emsp;@ResponseBody处理JSON

### &emsp;处理AJAX

### &emsp;@RestController

### &emsp;ResponseEntity
