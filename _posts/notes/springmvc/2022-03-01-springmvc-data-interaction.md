---
layout: post
title: "数据交互"
date: 2022-03-01 14:02:48 +0800
categories: notes springmvc base
tags: SpringMVC 基础 数据
excerpt: "数据交互"
---

继续在[案例一搭建环境：SpringMVC/demo1_build](https://github.com/Didnelpsun/SpringMVC/tree/master/demo1_build)上编写。

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

然后在将HelloController改为PageController，下添加跳转到该页面的控制器：

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

#### &emsp;&emsp;@PathVariable

上一个文档已经描述了@PathVariable的用法，与下面不用的地方就在于需要使用Restful风格路径。

#### &emsp;&emsp;@RequestParam

将路径参数和控制器方法的形参创建映射关系。

如果形参名和参数名不一致，则无法自动赋值，这时候可以使用@RequestParam注解在形参名前，表示形参名和参数名的映射对应关系。

@RequestParam可以获取从前端URL获取到的数据，用来解析请求路径里的参数（GET请求）或者POST请求中表单格式的请求参数。

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

#### &emsp;&emsp;@RequestAttribute

在前端页面通过向request添加属性值，然后在后端参数列表中使用@RequestAttribute就可以将request域参数绑定到列表参数中。使用方式与@RequestParam类似。

与@RequestParam不同的是@RequestAttribute的值的获取不是从前端，而是从request域中获取，前端需要用setAttribute设置，否则获取不到。

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

#### &emsp;&emsp;@MatrixVariable

即传输矩阵变量。我们一般查询的路径为/param?id=1,name=2，这是查询字符串query string的方式。二如果使用/param;id=1;name=2，这是矩阵变量的方式。

我们在开发时会遇到这样一个问题，如果Cookie禁用了如何使用Session数据？根据Session-Cookie模式：如果我们在Session中保存了数据，Session.set(key,value)；每一个用户都会访问服务器，新用户不携带Cookie，服务器默认会给每一个用户新建一个Session会话，并赋予一个ID标识jsessionid，传输给客户端；客户端保存服务器发送来的jsessionid到本地Cookie中；客户端每次请求服务器服务都会携带这个jsessionid来获取对应的Session。如果Cookie禁用了那么服务器就不能通过jsessionid获取session中的数据。

如果Cookie用不了了可以使用矩阵变量携带jsessionid：/user;jsessionid=xxx，称为路径重写，即在Cookie禁用的情况下通过矩阵变量的形式传到服务器，但是这显然跟GET请求一样是不安全的。

那为什么不使用request来存放jsessionid呢？这是因为我们如果使用请求参数的方式进行传递，我们就没办法跟我们普通的请求参数进行区分了，那么服务器就会认为这个是一个请求参数而不会将其视为jsessionid进行特殊处理。

如果是一个变量的多个值那么可以使用逗号分隔：color=red,green,blue；或者可以使用重复的变量名：color=red;color=green;color=blue。

矩阵变量下每两个斜线就隔离出一个整体。斜线后的第一个参数就是真正的访问路径，第一个参数的分号后面的所有参数都是请求参数。

```java
@RequestMapping("/param")
public Map<String, Object> paramMatrix(@MatrixVariable("id") Integer id,
                          @MatrixVariable("name") String name){
    Map<String, Object> map = new HashMap<>();
    map.put("id", id);
    map.put("name", name);
    return map;
}
```

直接访问<http://localhost:8080/param;id=1;name=2>。此时会报错400：Required matrix variable 'id' for method parameter type Integer is not present。因为SpringMVC自动关闭了矩阵变量，我们要使用必须手动开启矩阵变量。

对于路径的处理，SpringMVC会使用UrlPathHelper进行解析，里面有一个removeSemicolonContent方法用来移除分号内容，默认是打开的。

打开的方法一个是后面的[注解配置SpringMVC]({% post_url /notes/springmvc/2022-03-07-springmvc-annotation %})的内容，使用实现WebMvcConfigurer接口的类作为配置类重写这个内容，重写configurePathMatch方法，调用`configurer.setUrlPathHelper(new UrlPathHelper.setRemoveSemicolonContent(false))`不移除分号之后的内容。

第二个办法就是直接在SpringMVC.xml中配置：`xml<mvc:annotation-driven enable-matrix-variables="true" />`。

此时发现还有错误，这是为什么呢？因为矩阵变量的第一个路径必须以变量的形式获取，不能是根路径下的第一层，即控制器方法写为：

```java
@RequestMapping("/{path}")
public Map<String, Object> paramMatrix(@MatrixVariable("id") Integer id,
                                       @MatrixVariable("name") String name,
                                       @PathVariable String path){
    Map<String, Object> map = new HashMap<>();
    map.put("id", id);
    map.put("name", name);
    map.put("path", path);
    return map;
}
```

访问<http://localhost:8080/param;id=1;name=2>，此时发现报错404，是因为需要在控制器方法上加一个@ResponseBody，这在后面的[数据处理]({% post_url /notes/springmvc/2022-03-05-springmvc-data-process %})会提到。此时又会报错406不可接受。这是因为SpringMVC无法将Map<String, Object>类型转换为JSON传输到前端。所以也需要[数据处理]({% post_url /notes/springmvc/2022-03-05-springmvc-data-process %})的@ResponseBody处理JSON部分知识，添加jackson依赖：

```xml
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.13.1</version>
</dependency>
```

然后设置返回值类型为JSON：`@RequestMapping(value = "/{path}", produces = {"application/json;charset=utf-8"})`，此时再次访问：

+ <http://localhost:8080/param;id=1;name=2>：`{"path":"param","name":"2","id":1}`。
+ <http://localhost:8080/param;id=1;name=2;name=4;name=6>：`{"path":"param","name":"2,4,6","id":1}`。
+ <http://localhost:8080/param;id=1;name=2;id=5;name=6>：`{"path":"param","name":"2,6","id":1}`。

为什么id只有第一个生效？因为id为整形类型。

如果将参数改为数组类型：

```java
@RequestMapping("/{path}")
public Map<String, Object> paramMatrix(@MatrixVariable("id") Integer[] id,
                                       @MatrixVariable("name") String[] name,
                                       @PathVariable String path){
    Map<String, Object> map = new HashMap<>();
    map.put("id", id);
    map.put("name", name);
    map.put("path", path);
    return map;
}
```

访问<http://localhost:8080/param;id=1;name=2;id=5;name=6>则能全部收到：`{"path":"param","name":["2","6"],"id":[1,5]}`。

如果将path也改为数组：

```java
@RequestMapping("/{path}")
public Map<String, Object> paramMatrix(@MatrixVariable("id") Integer[] id,
                                       @MatrixVariable("name") String[] name,
                                       @PathVariable String[] path){
    Map<String, Object> map = new HashMap<>();
    map.put("id", id);
    map.put("name", name);
    map.put("path", path);
    return map;
}
```

访问<http://localhost:8080/param;id=1;name=2;pdf;id=5;name=6>只能收到一个path：`{"path":["param"],"name":["2","6"],"id":[1,5]}`。访问<http://localhost:8080/id=1;name=2;pdf;id=5;name=6>，则是`{"path":["id=1"],"name":["2","6"],"id":[1,5]}`，表明path就固定是匹配路径的，改成其他的位置不行。

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

#### &emsp;&emsp;@ModelAttribute

可以在User参数前添加@ModelAttribute，将参数绑定到Model对象。

其位置包括下面三种：

+ 应用在方法上：被@ModelAttribute注解的方法会在Controller每个方法执行之前都执行，因此对于一个Controller中包含多个URL的时候，要谨慎使用。
+ 应用在方法的参数上：配合required属性表示这个参数是否必要。返回值对象会被默认放到隐含的Model中，在Model中的key为返回值首字母小写，value为返回的值。等同于`model.addAttirbute("user", user)`。
+ 应用在方法上，并且方法也使用了@RequestMapping：这种情况下，返回值String（或者其他对象）就不再是视图了，而是放入到Model中的值，此时对应的页面就是@RequestMapping的值。如果类上有@RequestMapping，则视图路径还要加上类的@RequestMapping的值。

#### &emsp;&emsp;编码过滤器

注意这样就直接传输过来了。但是这时候sex值会乱码，因为中文字符编码不一致。

要改变编码方式必须在获取请求参数之前，否则就已经乱码了。

请求乱码有两种，一种是post请求乱码，一种是get请求乱码。

如果将表单的提交方式改为get，即method="get"就不会乱码，那么就代表get请求的乱码我们在此之前就已经解决过了。

get请求的乱码是由Tomcat造成的，所以要解决get请求乱码就需要让Tomcat不乱码，在Tomcat安装目录的conf/server.xml中找到`<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />`，要解决乱码就要在其中加上URIEncoding="UTF-8"。

post请求的乱码是DispatcherServlet造成的，所以即使在控制器方法中重新设置了编码格式也没有用，因为DispatcherServlet获取参数时就已经乱码了，所以为了解决乱码必须在DispatcherServlet请求参数之前完成。由于我们之前在web.xml中设置过前端控制器DispatcherServlet是在服务器启动时就加载的，所以就必须找到一种技术在DispatcherServlet执行之前就开始。

Servlet中学过组件加载顺序，监听器Listener->过滤器Filter->服务器小程序Servelt。而监听器只监听事件，只会执行一次，而过滤器只要请求路径满足过滤路径都会被过滤器过滤，所以此时我们可以使用过滤器处理中文乱码问题。

在web.xml中定义一个过滤器，与servlet标签同级，这是SpringMVC就提供的组件：

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

在pages中新建一个share.jsp。index.jsp中添加`<h2><a href="${pageContext.request.contextPath}/share">域共享数据</a></h2>`。

添加一个基本的返回share页面的控制器：

```java
@RequestMapping("/share")
public String share(){
    return "share";
}
```

### &emsp;servletAPI向request域

根据上面的请求参数可以获得request，所以这里也可以获取request：

```java
// 使用servletAPI向Request域共享数据
@RequestMapping("/share/shareServletAPI")
public String shareServletAPI(HttpServletRequest request){
    // 向域对象共享数据
    request.setAttribute("shareType", "ServletAPI");
    return "share";
}
```

修改share.jsp，其中request是JSP的内置对象，表示客户端请求信息的封装，其他具体使用看JSP：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>share</title>
    <link rel="icon" href="data:;base64,=">
</head>
<body>
<%
    String shareType = (String) request.getAttribute("shareType");
%>
    <h3>${shareType}</h3>
</body>
</html>
```

访问<http://localhost:8080/share/shareServletAPI>就可以看到显示ServletAPI。

### &emsp;ModelAndView向request域

ModelAndView用来存储处理完后的结果数据，以及显示该数据的视图。从名字上看ModelAndView中的Model代表模型，View代表视图，这个名字就很好地解释了该类的作用。业务处理器调用模型层处理完用户请求后，把结果数据存储在该类的model属性中，把要返回的视图信息存储在该类的view属性中，然后让该ModelAndView返回该Spring MVC框架。框架通过调用配置文件中定义的视图解析器，对该对象进行解析，最后把结果数据显示在指定的页面上。

不论使用哪种方式进行request域共享，其信息都会被包装成ModelAndView对象。

```java
// 使用ModelAndView向Request域共享数据
@RequestMapping("/share/shareModelAndView")
public ModelAndView shareModelAndView(){
    ModelAndView modelAndView = new ModelAndView();
    // 处理模型数据，即向请求域request共享数据
    // addObject将对象添加到模型中，即添加到request域中，这个方法相当于request.setAttribute
    modelAndView.addObject("shareType", "ModelAndView");
    // 设置视图名称，即应该跳转到的视图页面名称，这里是share
    modelAndView.setViewName("share");
    return modelAndView;
}
```

访问<http://localhost:8080/share/shareModelAndView>会显示ModelAndView。

### &emsp;Model向request域

其实就是指ModelAndView中的Model，需要从参数传入Model对象。其View的功能由原来的控制器方法来实现：

```java
// 使用Model向Request域共享数据
@RequestMapping("/share/shareModel")
public String shareModel(Model model){
    // 添加属性
    model.addAttribute("shareType", "Model");
    return "share";
}
```

访问<http://localhost:8080/share/shareModel>会显示Model。

### &emsp;Map向request域

```java
// 使用Map向Request域共享数据
@RequestMapping("/share/shareMap")
public String shareMap(Map<String, Object> map){
    // 添加属性
    map.put("shareType", "Map");
    return "share";
}
```

SpringMVC会自动将Map数据注入到页面的request域中。因为底层Model也是用Map注入属性的，所以这里Map和Model都是一样的效果。

访问<http://localhost:8080/share/shareMap>会显示Map。

### &emsp;ModelMap向request域

```java
// 使用ModelMap向Request域共享数据
@RequestMapping("/share/shareModelMap")
public String shareModelMap(ModelMap modelMap){
    // 添加属性
    modelMap.addAttribute("shareType", "ModelMap");
    return "share";
}
```

基本和Model使用方法一致。

访问<http://localhost:8080/share/shareModelMap>会显示ModelMap。

### &emsp;Modle、Map和ModelMap

其三个的绑定属性的方法类型都是org.springframework.validation.support.BindingAwareModelMap。

```java
public interface Model {}
public class ModelMap extends LinkedHashMap<String，object> {}
public class ExtendedModelMap extends ModelMap implements Model {}
public class BindingAwareModelMap extends ExtendedlModelMap {}
```

### &emsp;向Session域

修改share.jsp来访问Session数据，直接从sessionScope中获取对应名的值：`<h3>${sessionScope.session}</h3>`。

#### &emsp;&emsp;原生API

使用原生API即HttpSession对象：

```java
// 向Session域共享数据
@RequestMapping("/share/shareSession")
public String shareSession(HttpSession session){
    // 添加属性
    session.setAttribute("session", "Session");
    return "share";
}
```

访问<http://localhost:8080/share/shareSession>会显示Session。

#### &emsp;&emsp;@SessionAttribute和@SessionAttributes

可以使用@SessionAttribute和@SessionAttributes注解，让参数在这个类下定义的多个请求间共享。@SessionAttributes只能作用在类上，@SessionAttribute只能作用于参数列表。类似于Session的Attribute，但不完全一样，一般来说@SessionAttributes设置的参数只用于暂时的传递，而不是长期的保存，长期保存的数据还是要放到Session中。

@SessionAttributes有两个参数，用于指定要保存的数据的名称和类型：

+ String[] value：要保存到session中的参数名称。
+ Class[] typtes：要保存的参数的类型，和value中顺序要对应上。

@SessionAttribute在参数之前，指定保存数据的名称和参数之间的映射，即从Session里面获取数据到参数。

通过@SessionAttributes注解设置的参数有三类用法：

1. 在视图中通过request.getAttribute或session.getAttribute获取。
2. 在后面请求返回的视图中通过session.getAttribute或者从model中获取。
3. 自动将参数设置到后面请求所对应处理器的Model类型参数或者有@ModelAttribute注释的参数里面。

将一个参数设置到SessionAttributes中需要满足两个条件：

1. 在@SessionAttributes注解中设置了参数的名字或者类型。
2. 在处理器中将参数设置到了model中。

@SessionAttributes用户后可以调用`SessionStatus.setComplete()`来清除，这个方法只是清除SessionAttribute里的参数，而不会应用Session中的参数。

如控制器方法不变，在PageController上添加`@SessionAttributes(value = {"session"}, types = {String.class})`表示这个Session的session值将在PageController下的所有路径共享。index.jsp上添加`<h3>${sessionScope.session}</h3>`获取Session值。然后运行，首先访问<http://localhost:8080/>，发现Session值首先是空的，因为我们还没有赋值，然后访问<http://localhost:8080/share/shareSession>，此时Session就已经被赋值了，最后再返回<http://localhost:8080/>就可以看到最下面出现了Session。所以这时候share和index两个页面的Session是共享的。

此时在index页面的某个方法的参数列表中添加@SessionAttribute("session") String session就可以在方法中访问这个Session了。

### &emsp;向Application域

通过Session获取Application即ServletContext：

```java
// 向Application域共享数据
@RequestMapping("/share/shareApplication")
public String shareApplication(HttpSession session){
    ServletContext application = session.getServletContext();
    // 添加属性
    application.setAttribute("application", "Application");
    return "share";
}
```

ServletContext有application对象，所以直接使用：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>share</title>
    <link rel="icon" href="data:;base64,=">
</head>
<body>
    <!--可以直接在对应的scope中调用值-->
    <h3>${requestScope.shareType}</h3>
    <h3>${sessionScope.session}</h3>
    <h3>${applicationScope.application}</h3>
</body>
</html>
```

访问<http://localhost:8080/share/shareApplication>会显示Application。

&emsp;

## 视图

即View接口，作用是渲染数据，将模型Model中的数据展示给用户。视图种类有很多，默认有转发视图和重定向视图。

### &emsp;InternalResourceView

SpringMVC默认的转发视图，我们当前在SpringMVC.xml配置的视图解析器使用的就是转发视图。如果没有配置视图解析器默认也是使用这个。

SpringMVC创建转发视图的过程：当控制器方法中所设置的视图名称以"forward:"为前缀时，创建InternalResourceView视图，此时的视图名称不会被SpringMVC配置文件中所配置的视图解析器解析。而是会将前缀"forward:"去掉，剩余部分作为最终路径通过转发的方式实现跳转。（而不会路径拼接）

### &emsp;RedirectView

SpringMVC默认的重定向视图。业务逻辑操作成功后一般都需要重定向视图。

转发是浏览器发送一次请求，然后服务器内部转发这次请求，重定向是浏览器发送一次请求访问Servlet，然后服务器给浏览器重定向地址，浏览器第二次请求重定向地址。

重定向就无法获取请求域的参数，无法请求WEB-INF资源，但是可以跨域，转发相反。

SpringMVC创建重定向视图的过程：当控制器方法中所设置的视图名称以"recirect:"为前缀时，创建RedirectView视图，此时的视图名称不会披SpringMVC配置文件中所配置的视图解析器解析，而是会将前缀"redirect:"去掉，剩杂部分作为最终路径通过重定向的方式实现跳转。

添加控制器：

```java
// 重定向
@RequestMapping("/redirect")
public String redirect(){
    return "index";
}
```

访问<http://localhost:8080/redirect>会直接跳转到首页<http://localhost:8080>，即index页面。

```java
// 重定向
@RequestMapping("/redirect")
public String redirect(){
    return "redirect:/index";
}
```

这时会报错，因为此时重定向路径为<http://localhost:8080/index>，所以匹配的是将index作为value来识别，从而报错，所以重定向的应该是请求路径而不是页面。如果改为`return "redirect:/";`，再访问，则会发生两次请求，一次是redirect页面，状态码为302，第二次才是localhost的首页。

### &emsp;JstlView

当工程引入JSTL（JSP标准标签库）的时候转发视图会自动转换为JstlView。使用Java代码控制HTML页面。

### &emsp;ThymeleafView

若使用的视图技术为Thymeleaf，在SpringMVC的SpringMVC.xml中配置了Thymeleaf的视图解析器，那么视图解析器解析之后得到的就是ThymeleafView。即路径没有任何前缀才能被Thymeleaf解析器解析为ThymeleafView。

当控制器方法中所设置的视图名称没有任何前缀时。此时的视图名称会被SpringMVC配置文件中所配置的视图解析器来解析，视图名称拼接视图前缀和视图后缀所得到的最终路径，会通过转发的方式实现跳转。

### &emsp;view-controller

当控制器方法中，仅仅用来实现页面跳转，即只需要设置视图名称时，可以将处理器方法在SpringMVC配置文件SpringMVC.xml中使用view-controller标签来表示。

使用时还需要在SpringMVC.xml中开启mvc注解驱动标签`<mvc:annotation-driven />`，否则会造成所有的@Controller注解无法解析，导致404错误：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/mvc
       http://www.springframework.org/schema/mvc/spring-mvc.xsd">
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
    <!--开启MVC注解驱动-->
    <mvc:annotation-driven />
    <!--配置view-controller-->
    <!--path即GetMapping内容，view-name即return内容-->
    <mvc:view-controller path="/" view-name="index"/>
    <mvc:view-controller path="/share" view-name="share"/>
</beans>
```

注解掉hello方法和share方法。这样定义后index访问是没有问题的，但是此时share访问是有问题的，因为SpringMVC会默认将其调用hello方法，把share看作value参数。而我们这时候把share方法撤销注释，此时share页面又能正常访问了，所以证明控制器方法能覆盖SpringMVC.xml的view-controller配置。因为请求是先去找处理器处理，如果找不到才会去找这个标签配置。

所以为了避免路径处理混乱一般还是使用控制器方法处理。

[案例二数据交互：SpringMVC/demo2_data_interaction](https://github.com/Didnelpsun/SpringMVC/tree/master/demo2_data_interaction)。
