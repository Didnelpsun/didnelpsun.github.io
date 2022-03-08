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

## 消息转换处理

HttpMessageConverter即报文信息转换器，将请求报文转换为Java对象，或将Java对象转换为响应报文。SpringMVC在我们不配置的情况下会自动注册相应组件。

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

### &emsp;@ResponseBody处理字符串

在index.jsp中添加`<a href="${pageContext.request.contextPath}/responseBody">通过ResponseBody响应</a>`。

添加控制器方法：

```java
@RequestMapping("/responseBody")
// 加上这个注解后返回值不再是视图名称，而是响应的响应体
@ResponseBody
public String responseBody() {
    return "ResponseBody响应";
}
```

此时会中文乱码。那么如何解决？

#### &emsp;&emsp;配置\<mvc:message-converters\>

已知web.xml中的\<mvc:annotation-driven/\>这个注解是用来控制SpringMVC的注解开启的，但是我们之前没有配置具体的内容，此时SpringMVC会默认配置一些组件，如消息转换器StringHttpMessageConverter、映射器RequestMappingHandlerMapping、适配器RequestMappingHandlerAdapter、异常解析器ExceptionHandlerExcetionResolver。

可以通过\<mvc:message-converters\>来配置从服务器到前端的字符编码。\<mvc:message-converters\>不写的话，系统会默认帮你注册一堆默认的消息转换器。你自己配置了，那么系统就不会帮你注册了默认的了而只会注册你配置的。

mvc:message-converters的register-defaults="false"属性可以控制SpringMVC不要帮你注册默认的。

```xml
<mvc:annotation-driven>
    <mvc:message-converters register-defaults="false">
        <!--处理响应体为文本模式的情况下对字符编码改为UTF-8-->
        <bean class="org.springframework.http.converter.StringHttpMessageConverter">
            <!--默认字符编码-->
            <property name="defaultCharset" value="UTF-8"/>
            <!--是否给响应头添加自动字符编码类型-->
            <property name="writeAcceptCharset" value="false"/>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

#### &emsp;&emsp;配置@RequestMapping

给@RequestMapping注解添加produces。它的作用是指定返回值类型还可以设定返回值的字符编码。

即`@RequestMapping(value = "/responseBody", produces = {"text/plain;charset=utf-8","text/html;charset=utf-8"})`。指定响应的字符集为utf-8，就不会再用@ResponseBody的StringHttpMessageConverter的字符集了。前面的text/plain就是返回的响应体类型。

<span style="color:yellow">提示：</span>还有一个属性与其对应，就是consumes：指定处理请求的提交内容类型（Content-Type），例如application/json、text/html。是在Reques请求处使用。

### &emsp;@ResponseBody处理JSON

由于@ResponseBody只能处理文本信息，而如果我们在控制器中返回一个类，如我们把上个案例的User类复制到entity包中：

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

如果我们控制器直接返回User类给前端，那么前端会报错500标识无法转换这个类型。因为前端是JS，而后端我们使用的是Java，JS是不能直接处理Java对象的。

那么如何进行转换？使用JSON格式。

首先导入jackson依赖：

```xml
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.13.1</version>
</dependency>
```

添加index.jsp的标签：`<a href="${pageContext.request.contextPath}/responseBodyUser">通过ResponseBody响应User</a>`。

添加控制器：

```java
@RequestMapping(value = "/responseBodyUser", produces = {"text/plain;charset=utf-8","text/html;charset=utf-8"})
@ResponseBody
public User responseBodyUser() {
    return new User("金","男","2000-04-12","湖北省武汉市");
}
```

此时会报错No converter for [class org.didnelpsun.entity.User] with preset Content-Type 'null'。因为我们要在produces设置返回值类型：`@RequestMapping(value = "/responseBodyUser", produces = {"application/json;charset=utf-8"})`。这样就可以了，返回`{"id":null,"name":"金","sex":"男","birthday":"2000-04-12","address":"湖北省武汉市"}`JSON字符串对象，表示Java会把User对象调用toString字符串化再转换为JSON格式给前端。

所以处理JSON的步骤：

1. 导入jackson的依赖。
2. 在SpringMVC的核心配置文件SpringMVC.xml中开启mvc的注解驱动\<mvc:annotation-driven\>，此时适配器HandlerAdaptor会自动装配一个消息转换器MappingJackson2HttpMessageConverter，可以将响应到浏览器的Java对象转换为JSON格式的字符串。
3. 在处理器方法上使用@ResponseBody注解进行标识。
4. 将Java对象直接作为控制器方法的返回值返回，就会自动转为JSON格式的字符串。

### &emsp;处理AJAX

使用原生JS的AJAX：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>主页</title>
</head>
<body>
<%--<form method="post" action="${pageContext.request.contextPath}/requestBody">--%>
<%--<form method="post" action="${pageContext.request.contextPath}/requestEntity">--%>
<form method="post" id="form">
    <label>
        用户：
        <input type="text" name="name" id="name">
    </label><br>
    <label>
        密码：
        <input type="text" name="password" id="password">
    </label><br>
    <input type="submit" value="提交" onclick="ajaxSubmit('${pageContext.request.contextPath}/ajaxResponse')">
</form>
<a href="${pageContext.request.contextPath}/response/true">通过ServletAPI进行字符流响应</a>
<a href="${pageContext.request.contextPath}/response/false">通过ServletAPI进行字节流响应</a>
<a href="${pageContext.request.contextPath}/responseBody">通过ResponseBody响应</a>
<a href="${pageContext.request.contextPath}/responseBodyUser">通过ResponseBody响应User</a>
</body>
<script>
    function ajaxSubmit(url){
        // 创建异步对象
        let ajax = new XMLHttpRequest();
        // get模式
        if(document.getElementById("form").method==="get"){
            // 设置方法和url
            ajax.open("get",url + "?name=" + document.getElementById("name").value + "&password=" + document.getElementById("password").value);
            // 发送请求
            ajax.send();
        }
        else{
            // post请求url不变
            ajax.open("post",url);
            // 设置请求报文头部类型为application/x-www-form-urlencoded标识使用AJAX
            ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            // 设置JSON数据
            let data = {
                    'name':document.getElementById("name").value,
                    'password':document.getElementById("password").value
                }
            // 发送数据
            ajax.send(data.toString());
        }
        // 注册事件，表明AJAX传输成功的处理
        ajax.onreadystatechange = ()=>{
            if(ajax.readyState == 4 && ajax.status == 200){
                console.log(ajax.responseText);
                alert("提交成功！");
            }
        }
    }
</script>
</html>
```

提交用户名和密码后如果提交成功会打印后台响应数据并提示提交成功。

编写控制器，因为返回的是字符串而不是对象，所以不用设置produces：

```java
@PostMapping(value = "/ajaxResponse")
@ResponseBody
public String ajaxResponse(String name, String password){
    return "name:" + name + " password:" + password;
}
```

控制器获取提交数据并再返回给前端这个字符串数据。

运行后会发405错误：Request method 'POST' not supported，表示<http://localhost:8080/>不支持POST方式。表示使用AJAX后页面没有跳转到/ajaxResponse而是重新返回到主页，这是因为AJAX请求不发生跳转。

由于使用view-controller所以默认访问方式是GET方式而不支持POST方式，所以我们把view-controller注解掉，然后添加控制器访问方法为GET和POST都支持：

```java
@RequestMapping("/")
public String index(){
    return "index";
}
```

<span style="color:orange">注意：</span>在点击第一次时可能alert没有弹出来，这是因为网页组件元素还没有完全生成部署，需要等一会等Tomcat把所有信息都输出了就代表已经编译完成了。

### &emsp;@RestController

由于数据交互需要大量的HTTP和JSON，所以@ResponseBody注解会经常使用。@RestController就是@ResponseBody的派生注解，是SpringMVC提供的一个复合注解（@Controller+@ResponseBody），标识在控制器的类上，就相当于给类添加了@Controller注解，并且为其中的每个方法都添加了@ResponseBody注解。

### &emsp;ResponseEntity

用于控制器方法的返回值类型，该控制器方法的返回值就是响应到浏览器的响应报文。所以我们可以自己定义路径的响应报文。

&emsp;

## 文件处理

不论是上传还是下载本质就是文件复制。

### &emsp;文件下载

使用ResponseEntity可以实现文件下载的功能。

首先在SpringMVC.xml中加上\<mvc:default-servlet-handler/\>开启静态资源处理。然后在webapp下新建static/img文件夹，并随便放入一张图片test.jpg。

在index.jsp中添加路径标签：`<br><label for="filename">文件名：</label><input type="text" id="filename"><div onclick="(()=>{window.location.href += 'download/'+document.getElementById('filename').value;})()">下载文件</div>`。

添加控制器：

```java
@RequestMapping("/download/{filename}")
// ResponseEntity类型为响应报文，其中响应报文内的数据类型为字节流类型，参数为Session会话对象
public ResponseEntity<byte[]> download(HttpSession session, @PathVariable("filename") String filename) throws IOException{
    // 获取ServletContext对象
    ServletContext servletContext = session.getServletContext();
    // 获取服务器中文件的真实路径
    // 使用File.separator取代单纯的/分隔符就能解决不同操作问题的兼容问题
    String path = servletContext.getRealPath(File.separator + "static" + File.separator + "img" + File.separator  + filename);
//       System.out.println(path);
    // 判断文件是否存在
    if(!new File(path).exists()){
        System.out.println("文件不存在！");
        // 返回状态码
        return new ResponseEntity<>(null,null,HttpStatus.NO_CONTENT);
    }
    // 创建输入流
    InputStream inputStream = new FileInputStream(path);
    // 创建字节数组
    // available()方法可以在读写操作前先得知数据流里有多少个字节可以读取
    // 在进行网络操作时往往出错，因为你调用available()方法时，对发发送的数据可能还没有到达，你得到的count是0，所以在数据到达前应该不断等待
    int count = 0;
    while (count == 0) {
        count = inputStream.available();
    }
    byte[] bytes = new byte[inputStream.available()];
    // 将流读到字节数组中
    inputStream.read(bytes);
    // 创建HttpHeaders对象设置响应头信息
    MultiValueMap<String, String> headers = new HttpHeaders();
    // 设置下载方式和下载文件名字
    // Content-disposition是MIME协议的扩展，指示MIME用户代理如何显示附加的文件。
    // 是以内联的形式（即网页或者页面的一部分），还是以附件的形式下载并保存到本地。
    // attachment附件方式下载文件
    // java.net.URLEncoder.encode(filename, StandardCharsets.UTF_8)对文件名进行编码，避免下载文件中文名乱码
    headers.add("Content-Disposition","attachment;filename="+java.net.URLEncoder.encode(filename, StandardCharsets.UTF_8));
    // 创建ResponseEntity对象
    // 响应体就是图片的流
    ResponseEntity<byte[]> responseEntity = new ResponseEntity<>(bytes,headers,HttpStatus.OK);
    // 关闭输入流
    inputStream.close();
    return responseEntity;
}
```

### &emsp;文件上传

#### &emsp;&emsp;基本上传编写

文件上传一定是POST功能。

必须添加一个上传所需要的依赖：

```xml
<!-- https://mvnrepository.com/artifact/commons-fileupload/commons-fileupload -->
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.4</version>
</dependency>
```

SpringMVC会将上传的文件转换为MultipartFile类型的数据，此外我们还需要在SpringMVC.xml中配置文件上传解析器，让SpringMVC自动将上传文件封装成这个类型：

```xml
<!--文件上传解析器，且id名字必须为multipartResolver，否则SpringMVC找不到-->
<bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
    <!--默认字符编码-->
    <property name="defaultEncoding" value="utf-8"/>
    <!--默认上传文件最大值，上传的不能超过10M。不然直接报500这个错-->
<!--       <property name="maxUploadSize" value="10000000"/>-->
</bean>
```

为什么要配置这个id？因为MultipartResolver是一个接口，CommonsMultipartResolver是MultipartResolver的实现类，且实现类不止一个，所以如果通过MultipartResolver的类型去找Bean会找到多个实现类，从而只能根据id设置来获取。

添加JSP：

```jsp
<form action="${pageContext.request.contextPath}/upload" method="post" enctype="multipart/form-data">
    头像：<input type="file" name="file"><br>
    <input type="submit" value="上传头像">
</form>
```

添加控制器：

```java
@PostMapping("/upload")
// SpringMVC把这个文件封装到MultipartFile类中
public String upload(MultipartFile file, HttpSession session) throws IOException {
    // 判断file是否传入为空
    if(file.getSize()==0){
        return "redirect:/";
    }
    // getName获取传输文件的参数名，即前端表单以什么参数名传输到后端的，这里是photo
    // getOriginalFileName获取传输文件的实际名字，即用户传输的这个文件的名字，用户传什么文件名这里就获取到什么
    String fileName = file.getOriginalFilename();
    // 获取文件路径
    String path = session.getServletContext().getRealPath(File.separator + "static" + File.separator + "img" + File.separator);
    // 判断路径是否存在
    if(!new File(path).exists()){
        // 不存在则创建目录
        if(!new File(path).mkdir()){
            // 创建文件目录失败
            return "redirect:/";
        }
    }
    // 设置上传地址
    file.transferTo(new File(path + File.separator + fileName));
    return "redirect:/";
}
```

#### &emsp;&emsp;表单数据名与控制器参数名对应

如果报错500：Request processing failed; nested exception is java.lang.NullPointerException: Cannot invoke "org.springframework.web.multipart.MultipartFile.getOriginalFilename()" because "file" is null，是因为前端提交表单的数据名\<input type="file" name="file"\>\<br\>name值和控制器方法的参数名MultipartFile参数名不匹配。要求form提交文件的数据名与控制器方法的MultipartFile参数名一样，否则无法自动赋值从而无法初始化，也可以用注解配置映射关系，但是没必要。

#### &emsp;&emsp;上传文件位置

这里上传的文件所在目录不在项目的静态目录下，而是在服务器部署的静态目录下，可以使用`HttpSession.getServletContext().getRealPath`获取地址，我的在D:\Tomcat\Tomcat 8.5\webapps\ROOT\static\img下。

#### &emsp;&emsp;重名文件覆盖

当我们给服务器传入相同文件名的文件时，新的图片会覆盖之前在服务器静态目录的文件，这是我们不想得到的效果，因为我们客户端不知道服务器的内容，所以也不可以避免重名问题。这里不是文件覆盖，而是文件内容覆盖。

那么应该如何解决呢？

可以使用UUID（是一个128比特的数值，这个数值可以通过一定的算法计算出来）来替换原来的名字；也可以在原来名字后面加上上传时间，在下载时只用匹配文件名而不用匹配上传时间。

如使用UUID，将上传文件名从源文件名换成UUID名：`String fileName = UUID.randomUUID().toString().replaceAll("-","") + file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));`。用随机UUID并去掉横线拼接上文件类型的后缀。

#### &emsp;&emsp;跨域上传

此时文件只能往本项目里面传，那么怎么跨服务器传文件呢？

首先导入依赖：

```xml
<!-- https://mvnrepository.com/artifact/com.sun.jersey/jersey-core -->
<dependency>
    <groupId>com.sun.jersey</groupId>
    <artifactId>jersey-core</artifactId>
    <version>1.19.4</version>
</dependency>
<!-- https://mvnrepository.com/artifact/com.sun.jersey/jersey-client -->
<dependency>
    <groupId>com.sun.jersey</groupId>
    <artifactId>jersey-client</artifactId>
    <version>1.19.4</version>
</dependency>
```

```java
@RequestMapping("/domainUpload")
// SpringMVC把这个文件封装到MultipartFile类中
public String domainUpload(MultipartFile file) throws IOException {
    // 判断file是否传入为空
    if(file.getSize()==0){
        return "redirect:/";
    }
    // 获取文件名
    String fileName = file.getOriginalFilename();
    // 定义上传服务器路径
    String serverPath = "D:\\Tomcat\\Tomcat 8.5\\webapps\\ROOT\\static\\img";
    // 创建客户端对象
    Client client = Client.create();
    // 和图片服务器进行连接
    WebResource webResource = client.resource(serverPath + fileName);
    // 上传资源
    webResource.put(file.getBytes());
    return "redirect:/";
}
```

修改index.jsp：`<form action="${pageContext.request.contextPath}/domainUpload" method="post" enctype="multipart/form-data">`。

如果上传路径不存在会报错409。

&emsp;

## 信息拦截处理

最早就谈到了过滤器，之前信息转换处理时就提到了报文信息转换器，接下来会讲到拦截器和异常处理器。

拦截器用于拦截控制器方法的执行。执行过程：请求Request->过滤器Filter->前端控制器DispatcherServlet->前置拦截器PreHandler->控制器Controller->后置拦截器PostHandler->视图渲染完成拦截器AfterCompletion。

拦截器需要实现HandlerInterceptor。

### &emsp;拦截器设置

新建一个interceptor包保存拦截器，新建一个PageInterceptor类来实现HandlerInterceptor接口：

```java
// PageInterceptor.java
package org.didnelpsun.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class PageInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("前置拦截器");
        return false;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("后置拦截器");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("完成拦截器");
    }
}
```

然后SpringMVC.xml中添加拦截器配置：

```xml
<!--拦截器-->
<mvc:interceptors>
    <bean class="org.didnelpsun.interceptor.PageInterceptor"/>
</mvc:interceptors>
```

然后运行，发现<http://localhost:8080/>不显示页面，打印了四个前置拦截器。

这是因为此时前置拦截器将控制器方法的执行拦截了，所以控制器方法无法执行。preHandler拦截器返回类型为布尔类型，放行为true，拦截为false，此时拦截了所以不显示页面。

设置调用父类的拦截器，默认都不拦截处理：

```java
// PageInterceptor.java
package org.didnelpsun.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class PageInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("前置拦截器");
//        return false;
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("后置拦截器");
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("完成拦截器");
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }
}
```

此时会正常显示并打印所有三个拦截器字符串。并且点击一个路径都会出现三个，这是因为所有路径都会经过拦截器。并且如果出现一个父路径点击后会跳转子路径的情况，如果没有渲染完成的执行顺序：父前置拦截器->子前置拦截器->子后置拦截器->子完成拦截器->父后置拦截器->父完成拦截器，渲染完成的执行顺序：父前置拦截器->父后置拦截器->父完成拦截器->子前置拦截器->子后置拦截器->子完成拦截器。

### &emsp;拦截器规则

如果要对拦截器进行拦截规则配置就不能使用bean标签，因为bean标签和ref标签都是一类只设置拦截器类，无法设置拦截规则。

设置拦截器规则必须使用mvc:interceptor标签。mvc:interceptors的属性path-matcher则表示配置一个自定义的PathMatcher，它主要用来处理路径的匹配规则，默认采用的PathMatcher为AntPathMatcher，具有ant风格的路径规则，如?表示任何单字符，*表示0个或多个字符，**表示0个或多个目录。

```xml
<!--拦截器-->
<mvc:interceptors>
    <mvc:interceptor>
        <!--拦截路径配置-->
        <mvc:mapping path="/**"/>
        <!--排除路径配置-->
        <mvc:exclude-mapping path="/"/>
        <bean class="org.didnelpsun.interceptor.PageInterceptor"/>
    </mvc:interceptor>
</mvc:interceptors>
```

此时就是拦截所有，但是排除主页面。此时运行就发现一开始不会有拦截器字符串打印，而点击一个链接则会打印且在跳转回主页面时也不会打印。

### &emsp;拦截器执行顺序

当多个拦截器设置时的执行顺序如下：

1. 若每个拦截器的preHandler都返回true：此时多个拦截器的执行顺序和拦截器在SpringMVC的配置文件的配置顺序相关。preHandler回按配置顺序执行，postHandler和afterComplation回按照配置反序执行。
2. 若某个拦截器的preHandler返回false：preHandler返回false的和它之前的拦截器的preHandler都会执行，所有的postHandler都不执行，只有返回false的拦截器之前的拦截器的afterComplation会执行。

总结而言拦截器的设置的执行顺序是一层包一层的。

复制PageInterceptor三次，并重命名为PageInterceptor1、PageInterceptor2、PageInterceptor3，并在打印字符串中加上拦截器的编号。

定义四个拦截器：

```xml
<mvc:interceptors>
    <bean class="org.didnelpsun.interceptor.PageInterceptor"/>
    <bean class="org.didnelpsun.interceptor.PageInterceptor1"/>
    <bean class="org.didnelpsun.interceptor.PageInterceptor2"/>
    <bean class="org.didnelpsun.interceptor.PageInterceptor3"/>
</mvc:interceptors>
```

打印：

前置拦截器
前置拦截器1
前置拦截器2
前置拦截器3
后置拦截器3
后置拦截器2
后置拦截器1
后置拦截器
完成拦截器3
完成拦截器2
完成拦截器1
完成拦截器

假如对拦截器2的preHandler返回false会怎么样？

前置拦截器
前置拦截器1
前置拦截器2
完成拦截器1
完成拦截器

&emsp;

## 异常处理

SpringMVC.xml中注解掉所有拦截器。

### &emsp;配置方式

SpringMVC提供了一个处理控制器方法执行过程中所出现异常的接口HandlerExceptionResolver。

HandlerExceptionResovler接口的实现类有默认异常处理器DefaultHandlerExceptionResolver和自定义异常处理器SimpleMappingExceptionResolver。

和自定义异常处理器需要在SpringMVC中配置：

```xml
<!--配置异常处理器-->
<bean class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
    <!--异常映射，当出现异常应该如何处理-->
    <property name="exceptionMappings">
        <props>
            <!--key为异常的全限定类名，包含的prop为跳转视图名-->
            <prop key="java.lang.ArithmeticException">error</prop>
        </props>
    </property>
</bean>
```

新建一个error.jsp：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>错误</title>
</head>
<body>
    <h3>出现错误</h3>
</body>
</html>
```

然后新建一个控制器方法映射路径，并创造一个数字计算异常：

```java
// 数字计算异常
@RequestMapping("/mathError")
public String mathError(){
    System.out.println(1/0);
    return "index";
}
```

此时访问<http://localhost:8080/mathError>就会跳转到error页面，注意此时路径仍然是mathError而不是error，因为前端路径没有变，error页面是后端对于前端的响应数据。

此时如果我们想知道出现什么错误，把后端数据传输到前端，则可以继续配置exceptionAttribute将异常信息存储到request请求域，value指定请求域的键名：`<property name="exceptionAttribute" value="exception" />`。

然后在error.jsp中使用这个信息：`<h4>${requestScope.exception}</h4>`。

### &emsp;注解方式

将SpringMVC.xml中的异常处理器配置注释掉。

使用@ContorllerAdvice注解标注到类上，标识当前类为异常处理的组件。使用@ExceptionHandler用于设置所标识方法处理的异常种类。

新建一个ExceptionController.java：

```java
// ExceptionController.java
package org.didnelpsun.controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

// 当前类为异常处理类
@ControllerAdvice
public class ExceptionController {
    // 标识处理数字计算异常
    @ExceptionHandler(ArithmeticException.class)
    // exception为当前异常对象
    public String arithmeticException(Exception exception, Model model){
        // 向request域添加参数
        model.addAttribute("exception",exception);
        return "error";
    }
}
```

@ExceptionHandler注解的value属性是一个数组，可以对多种异常进行统一的处理。

[案例四数据处理：SpringMVC/demo4_data_process](https://github.com/Didnelpsun/SpringMVC/tree/master/demo4_data_process)。
