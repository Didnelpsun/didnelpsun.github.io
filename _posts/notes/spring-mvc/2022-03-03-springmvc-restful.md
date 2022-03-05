---
layout: post
title: "Restful风格"
date: 2022-03-03 22:58:48 +0800
categories: notes springmvc base
tags: SpringMVC 基础 restful
excerpt: "Restful风格"
---

## Restful概念

### &emsp;概念解释

REST：Representational State Transfer，表现层资源状态转移。

+ 表现层：即表述层，包括前端的视图和后端的控制层。
+ 资源：资源是一种看待服务器的方式，即将服务器看怍是由很多离散的资源组成。每个资源是服务器上一个可命名的抽象概念。因为资源是一个抽象的概念，所以它不仅仅能代表服务于文件系统中的一个文件、数据库中的一张表等等具体的东西，可以将资源设计的要多抽象有多抽象，只要想象力允许而且客户端应用开发者能够理解。与面向对象设计类似，资源是以名词为核心来组织的，首先关注的是名词。一个资源可以由一个或多个URI来标识。URI既是资源的名称，也是资源在Web上的地址。对某个资源感兴趣的客户端应用，可以通过资源的URI与其进行交互。
+ 资源的表述：资源的表述是一段对于资源在某个特定时刻的状态的描述。可以在客户端服务器端之间转移（交换）。资源的表述可以有多种格式，例悚HTML/XML/JSON/纯文本/图片/视频/音频等等。资源的表述格式可以通过协商机制来确定。请求响应方向的表述通常使用不同的格式。
+ 状态转移：状态转移说的是在客户端和服务器端之间转移（transfer）来代表资源状态的表述。通过转移和操作资源的表述来间接实现操作资源的目的。

Web应用程序最重要的REST原则是，客户端和服务器之间的交互在请求之间是无状态的。从客户端到服务器的每个请求都必须包含理解请求所必需的信息。如果服务器在请求之间的任何时间点重启，客户端不会得到通知。此外，无状态请求可以由任何可用服务器回答，这十分适合云计算之类的环境。客户端可以缓存数据以改进性能。

### &emsp;实现方式

RESTful架构是对MVC架构改进后所形成的一种架构，通过使用事先定义好的接口与不同的服务联系起来。在RESTful架构中，浏览器使用POST进行插入，DELETE进行删除，PUT进行更新和GET进行查询。因此，RESTful是通过URI实现对资源的管理及访问，具有扩展性强、结构清晰的特点。

操作|传统方式|REST风格
:--:|:------:|:------:
查询操作|selectUserByld?id=1|user/1-->get请求方式
插入操作|insertUser|user-->post请求方式
删除操作|deleteUser?id=1|user/1-->delete请求方式
更新操作|updateUser|user-->put请求方式

&emsp;

## Restful使用

### &emsp;GET和POST

默认提交只支持GET和POST请求方式，所以先对这两个进行处理。

使用[案例二数据交互：SpringMVC/demo2_data_interaction](https://github.com/Didnelpsun/SpringMVC/tree/master/demo2_data_interaction)。

删除所有页面，添加一个user.jsp和index.jsp，修改index.jsp：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>首页</title>
</head>
<body>
    <h3><a href="${pageContext.request.contextPath}/user">前往User查询</a></h3>
</body>
</html>
```

修改SpringMVC.xml：

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
</beans>
```

删除PageController.java，添加UserController.java用来操作User增删改查：

```java
// UserController.java
package org.didnelpsun.controller;

import org.didnelpsun.entity.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class UserController {
    // /user GET 查询所有用户信息
    @GetMapping(value = "/user")
    public String selectAllUsers(Model model){
        model.addAttribute("userType","查询所有用户信息");
        return "user";
    }
    // /user/id GET 根据用户ID查询用户信息
    @GetMapping(value = "/user/{id}")
    public String selectUserByID(Model model, @PathVariable String id){
        System.out.println("查询用户id："+id);
        model.addAttribute("userType","查询用户ID"+id+"信息");
        return "user";
    }
    // /user POST 添加用户信息
    @PostMapping(value = "/user")
    public String insertUser(Model model, User user){
        System.out.println("添加用户："+user);
        model.addAttribute("userType","添加用户信息："+user);
        return "user";
    }
    // /user/1 DELETE 删除用户信息
    // /user PUT 修改用户信息
}
```

修改user.jsp，添加`<h3>${requestScope.userType}</h3>`用request添加userType属性表示当前User操作的类型：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>User</title>
</head>
<body>
    <h3>User查询</h3>
    <!--默认查询所有用户-->
    <form action="${pageContext.request.contextPath}/user">
        <label>
            <input type="text" name="id">
        </label><br>
        <input type="submit" value="根据用户ID查询用户信息">
    </form>
    <form action="${pageContext.request.contextPath}/user" method="post">
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
        <input type="submit" value="添加用户信息" />
    </form>
    <h3>${requestScope.userType}</h3>
</body>
</html>
```

此时使用添加用户没有问题，但是发现selectUserById这个根据ID查询用户的方法是有问题的。因为我们在使用input时，如果是GET方法默认是使用默认路径方式的，即<http://localhost:8080/user?id=3>，此时控制器不匹配Restful控制器方法，所以不进行处理，只有我们使用<http://localhost:8080/user/3>才会匹配成功，那么如何将input的默认路径风格改为Restful风格的路径呢？需要使用过滤器。

### &emsp;PUT

添加一个控制器方法：

```java
@PutMapping(value = "/user")
public String updateUser(Model model, User user){
    System.out.println("修改用户："+user);
    model.addAttribute("userType","修改用户信息："+user);
    return "user";
}
```

此时如果使用form表单提交并定义put方式，则这样是没用的，但是不会报错，因为form默认以get方式提交，所以此时form会把put视为get。

如果想起作用必须使用SpringMVC的过滤器，在web.xml中定义HiddenHttpMethodFilter：

```xml
<!--配置隐藏HTTP请求方式过滤器-->
<filter>
    <filter-name>hiddenHttpMethodFilter</filter-name>
    <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>hiddenHttpMethodFilter</filter-name>
    <!--对所有请求进行处理-->
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

根据HiddenHttpMethodFilter过滤器的源码可以知道使用这个的两个条件，一个是将请求方式改为POST，一个是必须传输一个请求参数为_method，对应值为请求方式（过滤器最后会将其全部转换为大写，所以这里大小写无所谓），添加一个form：

```jsp
<form action="${pageContext.request.contextPath}/user" method="post">
    <!--不需要用户知道和填写，所以类型为hidden-->
    <input type="hidden" name="_method" value="put">
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
    <input type="submit" value="添加用户信息" />
</form>
```

此时报错：JSP 只允许 GET、POST 或 HEAD。Jasper 还允许 OPTIONS。解决方法在目标视图user.jsp前面加一个isErrorPage=”true“：`<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" %>`。

### &emsp;DELETE

删除往往是一个超链接而不是一个表单，所以应该如何处理？使用JS阻止a标签超链接的默认跳转行为，然后获得DELETE表单，表单中不需要其他数据，只用设置为POST并定义一个hidden元素并定义_method为delete，然后超链接控制表单提交，不用commit按钮。

### &emsp;过滤器顺序

此时你可能发现put请求的中文乱码，然后post也乱码了。这是因为过滤器的顺序问题，过滤器按定义顺序执行。要保持中文不乱码注意要将字符编码过滤器放在HTTP请求过滤器之前，否则字符编码转换会在HTTP请求参数之后执行，这时候转换就没用了。

[案例三Restful：SpringMVC/demo3_restful](https://github.com/Didnelpsun/SpringMVC/tree/master/demo3_restful)。

&emsp;

## 应用案例

使用[案例三Restful：SpringMVC/demo3_restful](https://github.com/Didnelpsun/SpringMVC/tree/master/demo3_restful)进行用户的操作。

### &emsp;修改项目

在controller同级目录新建一个dao包，并新建一个UserDAO.java，并设置一些模拟数据：

```java
// UserDAO.java
package org.didnelpsun.dao;

import org.didnelpsun.entity.User;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Repository
public class UserDAO {
    // 模拟DAO操作
    // 设置一个Map容器，保存一个Integer的数据索引即User的id和User的数据
    private static final Map<Integer, User> users = new HashMap<>();
    // 注入模拟数据
    static {
        users.put(1,new User(1,"黄","男","2000-04-22", "湖北省武汉市"));
        users.put(2,new User(2,"金","男","2003-07-05", "湖北省仙桃市"));
        users.put(3,new User(3,"蓝","女","2001-11-17", "湖北省荆州市"));
        users.put(4,new User(4,"绿","男","2002-10-21", "福建省福州市"));
        users.put(5,new User(5,"紫","女","2001-05-06", "浙江省宁波市"));
    }
    // 数据插入指针，即user的id
    private static Integer pointer=6;
    // 保存用户，包括插入操作和更新操作
    public void saveUser(User user){
        // 如果传入user不带有id，就给一个id给user，即插入一个新用户
        if(user.getId()==null){
            // 判断pointer是否在users存在，如果在就自增，获取一个最新的id
            while (users.containsKey(pointer))
                pointer++;
            user.setId(pointer);
        }
        // 注意更新user时不能更新user的id，否则会覆盖其他数据
        users.put(user.getId(), user);
    }
    // 获取所有值的集合
    public Collection<User> selectAllUsers(){
        return users.values();
    }
    // 获取单个用户
    public User selectUser(Integer id){
        return users.get(id);
    }
    // 删除单个用户
    public User deleteUser(Integer id){
        return users.remove(id);
    }
}
```

并在SpringMVC.xml中扫描dao包：`<context:component-scan base-package="org.didnelpsun.controller, org.didnelpsun.dao"/>`。保持其他内容不变。

更新控制器：

```java
// UserController.java
package org.didnelpsun.controller;

import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class UserController {
    // 由于没有业务层，本来是Service调用DAO，所以此时直接Controller调用DAO
    private UserDAO userDAO;
    // 自动装配
    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }
    // 查询所有用户信息
    @GetMapping(value = "/user")
    public String selectAllUsers(Model model){
        model.addAttribute("users",userDAO.selectAllUsers());
        return "user";
    }
}
```

### &emsp;使用JSTL

然后需要编写user.jsp文件，需要循环这个List来展示所有User，必须使用JSTL。

首先导包：

```xml
<!-- https://mvnrepository.com/artifact/javax.servlet/jstl -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>jstl</artifactId>
    <version>1.2</version>
</dependency>
```

然后在引用JSTL标签库的JSP文件即user.jsp上添加`<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>`。

因为JSP本身不支持el表达式，所以添加isELIgnored="false"：`<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" isELIgnored="false" %>`。

循环需要使用foreach标签：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" isELIgnored="false" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>User</title>
</head>
<body>
    <div >
        <h3>User查询</h3>
    </div>
    <!--默认查询所有用户-->
    <table border="1" cellpadding="0" cellspacing="0" style="text-align: center">
        <tr>
            <th colspan="6">用户信息</th>
        </tr>
        <tr>
            <td colspan="5"></td>
            <td><a>插入新用户</a></td>
        </tr>
        <tr>
            <th>用户ID</th>
            <th>用户名</th>
            <th>性别</th>
            <th>生日</th>
            <th>地址</th>
            <th>操作</th>
        </tr>
        <!---items指定循环的变量名，var指定每次循环的对象-->
        <c:forEach items="${requestScope.users}" var="user">
            <tr>
                <td>${user.getId()}</td>
                <td>${user.getName()}</td>
                <td>${user.getSex()}</td>
                <td>${user.getBirthday()}</td>
                <td>${user.getAddress()}</td>
                <td>
                    <a>更新</a>
                    <a>删除</a>
                </td>
            </tr>
        </c:forEach>
    </table>
</body>
</html>
```

### &emsp;编写删除

为删除的a标签添加href属性：`<a href="${pageContext.request.contextPath}/user/${user.getId()}">删除</a>`。此时还是GET请求方式，所以需要新建一个form表单并设置请求方式和_method参数。那么如何让连接控制这个表单？可以使用原生JS也可以使用Vue。这里我们使用JS。

首先重新修改a标签，因为这个标签的跳转功能是没用的，所以把更新和删除的a标签都换成div标签，绑定对应的onclick事件处理函数：`<div onclick="deleteUser('${pageContext.request.contextPath}/${user.getId()}')">删除</div>`。

在user.jsp中添加JS代码：

```javascript
function deleteUser(url){
    // 创建一个表单
    let form = document.createElement("form");
    // 将form挂载到body上
    document.body.appendChild(form);
    form.method="post";
    // 新建input元素
    let input = document.createElement("input");
    input.type = "hidden";
    input.name = "_method";
    input.value = "delete";
    // 添加input元素到form表单中
    form.appendChild(input);
    // 添加跳转路径
    form.action = window.location.href + url;
    // 提交表单
    form.submit();
}
```

编写控制器：

```java
// 删除用户信息
@DeleteMapping(value = "user/{id}")
public String deleteUser(@PathVariable("id") Integer id){
    userDAO.deleteUser(id);
    // 要重新回到查询所有的主页面
    // 如果使用转发，则URL仍然是user/id，这就不是我们想要的
    // 因为进行删除这个请求之后跟原来的请求就没有关系了，所以使用重定向
    return "redirect:/user";
}
```

此时就可以了。

### &emsp;编写添加和修改

添加和修改都需要用saveUser方法，且都需要一个展示和修改单个用户信息的页面。所以新建一个userSave页面。

首先分析添加和修改的逻辑。

添加：

1. 点击插入的标签。
2. 跳转到userSave页面。
3. 填写表单。
4. 使用post方法进行提交，调用控制器insertUser方法。

更新：

1. 点击更新的标签。
2. 跳转到userSave页面，并调用控制器selectUserByID方法查询该ID的相关信息并放入userSave页面的表单中。所以这里会使用转发到userSave页面（控制器方法return userSave）。
3. 因为userid不能更改，所以在表单中的userid是设置不可修改的。填写表单。
4. 使用put方式进行提交，调用控制器updateUser方法。

由于需要使用PUT模式，需要设置_method，且使用提交时提交按钮需要根据是更新还是提交选择不同的上传模式。所以使用`<input type="hidden" name="_method" value="${requestScope.type}">`来从request中获取提交类型，并在控制器方法中使用model.addAttribute添加属性type表明提交类型。

#### &emsp;&emsp;添加

user.jsp中修改插入新用户的a标签：`<td><a href="/userSave">插入新用户</a></td>`。点击这个标签会直接跳转到/userSave页面。

修改userSave页面，由于后面的修改是PUT请求，所以需要增加一个_method的input标签：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" isELIgnored="false" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>UserSave</title>
</head>
<body>
    <!--添加POST和修改PUT的目标uri都是/user，所以表单的提交目标是/user-->
    <form action="${pageContext.request.contextPath}/user" method="post">
        <!--如果是修改，那么就是PUT请求，那么就需要设置_method标签，value值设为request的参数type，需要在控制器方法中设置为put-->
        <!--如果是添加，那么就是POST请求，_method的value只能是delete、put和patch而不能是post，所以此时应该把这个标签设为disabled-->
        <input type="hidden" name="_method" value="${requestScope.type}" disabled="${requestScope.type}=='post'">
        <!--用户id是不变的，只起到展示的作用-->
        <label>
            用户ID
            <input type="text" name="id" readonly>
        </label><br>
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
        <input type="submit" value="保存用户信息" />
    </form>
</body>
</html>
```

然后添加对应的两个控制器：

```java
// 跳转到添加模式的用户信息页面
@GetMapping(value = "/userSave")
public String forwardInsert(Model model){
    // 设置添加模式为POST
    model.addAttribute("type","post");
    return "userSave";
}
// 添加用户信息
@PostMapping(value = "/user")
// 直接通过实体类获取数据
public String insertUser(User user){
    // 添加数据
    userDAO.saveUser(user);
    // 返回主页面
    return "redirect:/user";
}
```

#### &emsp;&emsp;修改

修改按钮在JSP的循环中，跳转的路径为/userSave/{id}：

```jsp
<div onclick="updateUser('${pageContext.request.contextPath}/userSave/${user.getId()}')">更新</div>
```

```javascript
function updateUser(url){
    // 跳转
    window.location.href = url;
}
```

此时更新删除按钮的布局发生改变，所以给其父组件添加样式：`style="display: flex; flex-direction: row; justify-content: space-around"`。

添加跳转的控制器，进行的操作有设置请求方式，并获取这个用户的数据并传入request给前端：

```java
// 跳转到更新模式的用户信息页面
@GetMapping(value = "/userSave/{id}")
public String forwardUpdate(Model model, @PathVariable Integer id){
    model.addAttribute("type","put");
    model.addAttribute("user",userDAO.selectUser(id));
    // 由于需要保存查询的request值，所以使用转发而不是重定向
    return "userSave";
}
```

然后修改userSave.jsp，把user的信息填入。注意单选框的选择，由于radio的选择是靠checked，而checked属性没有true或者false，只要填上去就当作真，所以处理起来比较麻烦，不能直接在标签中使用Java变量，所以使用JS处理。JS是无法获取POST的request域数据的，所以跟_method一样使用隐藏域来保存这个数据：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" isELIgnored="false" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
<head>
    <link rel="icon" href="data:;base64,=">
    <title>UserSave</title>
</head>
<body>
    <!--添加POST和修改PUT的目标uri都是/user，所以表单的提交目标是/user-->
    <form action="${pageContext.request.contextPath}/user" method="post">
        <!--如果是修改，那么就是PUT请求，那么就需要设置_method标签，value值设为request的参数type，需要在控制器方法中设置为put-->
        <!--如果是添加，那么就是POST请求，_method的value只能是delete、put和patch而不能是post，所以此时应该把这个标签设为disabled-->
        <input type="hidden" name="_method" value="${requestScope.type}" disabled="${requestScope.type}=='post'">
        <!--使用隐藏域获取post的request域数据，并用disabled表示不提交sexValue到表单-->
        <input type="hidden" name="sexValue" value="${requestScope.user.getSex()}" id="sex" disabled>
        <!--用户id是不变的，只起到展示的作用-->
        <label>
            用户ID
            <input type="text" name="id" readonly value="${requestScope.user.getId()}">
        </label><br>
        <label>
            用户名
            <input type="text" name="name" value="${requestScope.user.getName()}">
        </label><br>
        <label>
            性别
            <input type="radio" name="sex" value="男" id="male">男
        </label>
        <label>
            <input type="radio" name="sex" value="女" id="female">女
        </label><br>
        <label>
            生日
            <input type="date" name="birthday" value="${requestScope.user.getBirthday()}">
        </label><br>
        <label>
            地址
            <input type="text" name="address" value="${requestScope.user.getAddress()}">
        </label><br>
        <input type="submit" value="保存用户信息" />
    </form>
</body>
<script>
    // 获取隐藏域标签所得的值
    if(document.getElementById("sex").value === "男"){
        document.getElementById("male").checked=true;
        document.getElementById("female").removeAttribute("checked");
    }
    else if(document.getElementById("sex").value === "女"){
        document.getElementById("female").checked=true;
        document.getElementById("male").removeAttribute("checked");
    }
</script>
</html>
```

设置提交控制器：

```java
// 更新用户信息
@PutMapping(value = "/user")
// 直接通过实体类获取数据
public String updateUser(User user){
    // 添加数据
    userDAO.saveUser(user);
    // 返回主页面
    return "redirect:/user";
}
```

[案例三Restful案例：SpringMVC/demo3_restful_demo](https://github.com/Didnelpsun/SpringMVC/tree/master/demo3_restful_demo)。
