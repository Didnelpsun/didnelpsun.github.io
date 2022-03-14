---
layout: post
title: "应用开发"
date: 2022-03-10 17:48:02 +0800
categories: notes springboot base
tags: SpringBoot 基础 开发
excerpt: "应用开发"
---

SpringBoot可以支持多种开发模式，可以开发各种应用，主要的还是Web应用。

## 配置文件

之前一般都是使用XML和propeties配置文件。这里会提到新的yaml配置文件

YAML是YAML Ain't Markup Language的递归缩写，虽然直译为其不是一种标记语言但是仍然为标记语言。非常适合做以数据为中心的配置文件。

如果propeties和yaml配置文件都有则一起生效。yaml优先级低于properties。

### &emsp;语法

+ key: value的表示方法，特别是key和value的冒号后有空格。
+ 大小写敏感。
+ 使用缩进表示层级关系。
+ 缩进不允许使用tab，只允许空格。
+ 缩进的空格数不重要，只要相同层级的元素左对齐即可。
+ #表示注释。
+ 字符串内容无需加引号，如果要加，''与""表示字符串的内容会被转义/不转义。

### &emsp;数据类型

YAML的key不能是中文。

#### &emsp;&emsp;字面量

既单个不可分的值，如date、boolean、string、number、null。

```yaml
key: value
```

#### &emsp;&emsp;对象

既键值对的集合，包括map、hash、object。

```yaml
# 行内格式：
key: {key1: value1, key2: value2, key3: value3}
# 非行内格式：
key:
    key1: value1
    key2: value2
    key3: value3
```

#### &emsp;&emsp;数组

一组按需排列的值，包括array、list、queue、set。

```yaml
# 行内格式：
key: [value1,value2,value3]
# 非行内格式：
key:
    - value1
    - value2
    - value3
```

### &emsp;示例

使用IDEA的Spring Initializr创建一个新项目，命名demo2_develp，将组改为org.didnelpsun，软件包名称为org.didnelpsun.boot。依赖项的Developer Tools中中勾选Spring Boot DevTools和Lombok，Web选择Spring Web。点击完成。

为了顺眼将主类名和测试类名都改为Application和ApplicationTests。

在boot下新建一个bean文件夹，并新建一个User类型：

```java
// User.java
package org.didnelpsun.boot.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Date;
import java.util.Map;
import java.util.Set;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer id;
    private String name;
    private Date birthday;
    private Boolean sex;
    private Account primeAccount;
    private String[] interests;
    private Set<Account> accounts;
    private Map<String, Float> scores;
}
```

然后新建一个Account类：

```java
// Account.java
package org.didnelpsun.boot.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    private Integer id;
    private String name;
    private Integer userid;
    private Double money;
}
```

给User添加配置，表示配置以user开头的配置内容：

```java
// User.java
package org.didnelpsun.boot.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Controller;

import java.util.Date;
import java.util.Map;
import java.util.Set;

@ConfigurationProperties(prefix = "user")
@Controller
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer id;
    private String name;
    private Date birthday;
    private Boolean sex;
    private Account primeAccount;
    private String[] interests;
    private Set<Account> accounts;
    private Map<String, Float> scores;
}
```

此时IDEA会报一个错：Spring Boot Configuration Annotation Processor not configured。这时需要添加一个对于注解配置的依赖，启动编写注解时对于配置的提示：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

此外在pom.xml中的build标签下配置：

```xml
<exclude>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
</exclude>
```

将这个开发辅助的插件不要打包到最后的应用jar包中。

Maven导入后新建一个application.yaml：

```yaml
user:
  id: 1
  name: Didnelpsun
  birthday: 2022/3/10
  sex: true
  primeAccount:
    id: 1
    name: 黄金账户
    userid: 1
    money: 10040.54
  interests:
    - 动漫
    - 小说
  accounts:
    - id: 1
      name: 黄金账户
      userid: 1
      money: 10040.54
    - id: 2
      name: 白银账户
      userid: 1
      money: 225.95
    - id: 3
      name: 钻石账户
      userid: 1
      money: 7466.72
  scores:
    Englist: 78.5
    Politics: 80.0
    Math: 135.0
    Computer: 140.5
```

进行主类测试：

```java
// Application.java
package org.didnelpsun.boot;

import org.didnelpsun.boot.bean.User;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        ApplicationContext applicationContext = SpringApplication.run(Application.class, args);
        User user = (User) applicationContext.getBean("user");
        System.out.println(user);
    }

}
```

打印成功。如果YAML的键名为中文会报错：Reason: No converter found capable of converting from type \[java.lang.Integer\] to type [java.util.Map\<java.lang.String, java.lang.Object\>]。

那么键值加上双引号或单引号是什么意思？如对YAML配置文件中user.primeAccount.name设置：

YAML|打印
:--:|:--:
"黄金账户 \n 测试"|黄金账户 <br> 测试
'黄金账户 \n 测试'|黄金账户 \n 测试
黄金账户 \n 测试|黄金账户 \n 测试

所以双引号不会转义字符，所以字符串中的\n就是换行的意思，而单引号和不写引号都会转移字符串，把这个值全部当作字符串字面量来处理。

<span style="color:orange">注意：</span>上面的user.name会无效，因为SpringBoot会直接从电脑管理员的user.name值来获取，所以在YAML文件中怎么改user.name值都不会改变程序的user.name值。

&emsp;

## Web开发

可以查看[SprintBoot核心特性](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features)。

### &emsp;静态资源处理

#### &emsp;&emsp;静态资源访问

只要将静态资源放到类路径下的/static或/public或/resources或/META-INF/resources目录下，只要访问当前项目的根路径那么就能访问这些资源了，因为SpringBoot使用了SpringMVC的ResourceHttpRequestHandler。

IDEA自动构造的SpringBoot项目已经为我们自动构建了static目录，我们在下面新建三个文件夹img、js、css，然后在img下添加一个图片test.jpg，然后运行项目，访问根路径下的资源路径<http://localhost:8080/img/test.jpg>就能找到这个图片。

那么为什么SpringBoot能找到这个图片？为什么不认为这个路径是一个请求？在boot下新建一个controller包作为控制器包，然后新建一个TestController：

```java
// TestController
package org.didnelpsun.boot.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @RequestMapping("/img/test.jpg")
    public String test(){
        return "test";
    }
}
```

这里定义了一个控制器方法test，其请求路径也是<http://localhost:8080/img/test.jpg>，返回值是一个test字符串，那么再次运行访问同样路径SpringBoot会返回图片还是字符串呢？点击后发现访问的不再是图片而是字符串了。

所以静态资源访问的原理是静态映射/**会匹配所有相同的请求路径，当收到一个请求，会先去控制器看看能不能处理，如果不能处理则所有请求又会转交给静态资源处理器进行处理，静态资源处理器会到所规定的目录查找静态资源，如果找到就返回静态资源，如果找不到就返回404。

默认静态访问资源是没有前缀的，如果要配置前缀则需要在配置文件中添加`spring.mvc.static-path-pattern: /test/**`，则以后要访问静态资源则应该是根路径+/test/+资源路径。记住这是访问前缀，请求需要加test，但是不代表静态资源的实际位置在test目录下。

如果我们不想在SpringBoot所给的固定文件目录下配置资源文件，也可以使用配置`spring.resources.static-locations=["静态资源目录"]`。

SpringBoot也支持[webjar](https://www.webjars.com)，选择使用的webjar写在pom.xml中就能自动导入和自动映射，位置在类路径/webjars/依赖包路径。

#### &emsp;&emsp;默认欢迎页面

SpringBoot支持静态方式主页，也支持模板方式主页。

SpringBoot就会自动调用这个页面为默认的主页面：

+ 将index.html或名为index的模板放到静态资源目录下。
+ 编写控制器处理/index路径。

向static下添加index.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>主页</title>
</head>
<body>
  <h3>主页面</h3>
</body>
</html>
```

#### &emsp;&emsp;默认页面图片

也跟默认主页一样放到静态资源目录下就可以了，名字必须为favicon.ico。

### &emsp;视图解析

SpringBoot默认不支持JSP，所以需要模板引擎。

SpringBoot将程序打包为jar包时，SpringBoot无法与JSP作为视图解析器一起正常使用的主要原因是因为Tomcat中使用了硬编码的文件模式。当用于部署SpringBoot应用程序时，JSP文件不会出现在嵌入式Tomcat中，并且在尝试满足请求时，将获得404 PAGE NOT FOUND。这是因为jar打包，所以不会从WEB-INF文件夹中复制JSP文件。如果META-INF/resources使用war打包时将JSP文件保留在文件夹下，则应该可以。

Thymeleaf允许使用模板作为原型，这意味着可以将它们视为静态文件并放在resources/templates文件夹中以供SpringBoot使用。但是JSP文件将具有JSTL标记等，在渲染前需要JSPER对其进行编译，因此无法将其设置为静态文件。

支持的模板引擎：

+ spring-boot-starter-thymeleaf。
+ spring-boot-starter-freemarker。
+ spring-boot-starter-groovy-templates。

以后大部分都是前后端分离，所以这部分后端可以不用管。

### &emsp;拦截器

在进行网页请求时往往需要请求验证，需要前端验证和后端验证，如进行登录就需要拦截请求查看用户名和密码是否一致。

SpringBoot中处理器、拦截器、过滤器都是责任链模式。

SpringMVC已经讲到过HandlerInterceptor，具有preHandle、postHandle、AfterCompletion三个方法。

如登录页面时preHandle用于用户验证、postHandle用于获取用户信息、AfterCompletion用于清理登录缓存。

boot下新建一个interceptor包，然后新建一个LoginInterceptor：

```java
// LoginInterceptor.java
package org.didnelpsun.boot.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// 登录检查
public class LoginInterceptor implements HandlerInterceptor {
    @Override
    // 如果session中存在name就代表已经登录，需要对新用户进行拦截
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if(request.getSession().getAttribute("name") == null){
            System.out.println("登录成功");
            return true;
        }
        System.out.println("登录失败");
        return false;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }
}
```

此时已经配置好拦截器的具体操作，然后需要配置需要拦截哪些请求，并把配置放在容器中。SpringBoot的配置可以使用XML配置但是一般不用，基本上是使用Java配置类和代码，SpringMVC中提到需要继承WebMvcConfigurer接口，如果没有则新建一个config包，新建一个InterceptorConfig：

```java
// InterceptorConfig.java
package org.didnelpsun.boot.config;

import org.didnelpsun.boot.interceptor.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration(proxyBeanMethods = false)
// 添加拦截器配置
public class InterceptorConfig implements WebMvcConfigurer {
    // 登录拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor()).addPathPatterns("/login");
    }
}
```

此时如果我们访问/login请求时就会启动这个拦截器。那么此时GET请求和POST请求都会成功吗？TestController中添加控制器进行测试：

```java
@RequestMapping("/login")
public String login(String name, String password, HttpServletRequest request){
    HttpSession session = request.getSession();
    session.setAttribute("name", name);
    session.setAttribute("password", password);
    System.out.println(name + password);
}
```

进行测试发现GET和POST都没问题。如果要清除Session需要点击开发者工具的Application的Storage的Clear site data。（postman测试时也需要删除，但是用浏览器删除session无效，需要重启postman）

并且注意如果使用重定向则request会过时。

### &emsp;文件上传

SpringMVC中已经使用过相关内容。SpringBoot与SpringMVC的文件上传类似。

首先准备一个页面，修改index.html中：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>主页</title>
</head>
<body>
  <h3>主页面</h3>
  <form method="post" enctype="multipart/form-data">
      头像：<input type="file" name="file"><br>
      <input type="submit" value="上传头像">
  </form>
</body>
<script>
    document.getElementsByTagName("form")[0].action=window.document.location.href+"upload"
</script>
</html>
```

添加一个控制器来处理这个请求：

```java
@PostMapping("/upload")
public String upload(@RequestPart("file") MultipartFile file, HttpSession session) throws IOException {
    // 类标注@Slf4j来获取日志打印信息对象log进行信息打印
    log.info("文件信息：原始名称：{}，大小：{}，路径：{}",file.getOriginalFilename(), file.getSize(), file.getResource());
    if(!file.isEmpty()){
        // 利用transferTo进行文件传输到项目静态资源的img文件夹下
        file.transferTo(new File(session.getServletContext().getRealPath("")+ File.separator +file.getOriginalFilename()));
        return "上传成功！";
    }
    else
        return "文件为空！";
}
```

如果以后一个input要上传多文件，则使用MultipartFile[]来接收。如果找不到文件夹路径可以加一个判断，这在SpringMVC中已经使用过。

此时可能报错：org.apache.tomcat.util.http.fileupload.impl.FileSizeLimitExceededException: The field file exceeds its maximum permitted size of 1048576 bytes，表示传输图片超过最大值。

第一种方式是创建Config类，使用@Bean定义一个返回MultipartConfigElement类型对象的函数，使用MultipartConfigFactory.setMaxFileSize设置单个文件最大值，并将这个MultipartConfigFactory对象返回。

第二种方式是直接设置properites或yaml配置文件：

```properties
// 设置单个文件大小
spring.servlet.multipart.max-file-size= 5MB
// 设置单次请求文件的总大小
spring.servlet.multipart.max-request-size= 50MB
```

```yaml
spring:
  servlet:
    multipart:
      # 设置单个文件大小
      max-file-size:
        5MB
      # 设置单次请求文件的总大小
      max-request-size:
        50MB
```

我使用了yaml方式，并重新上传发现没问题了。

SpringBoot与SpringMVC的文件上传使用基本一致，不同的是文件上传依赖不用我们自己编写了。

可以根据session.getServletContext().getRealPath看到这个项目的部署地址：C:\Users\Didnelpsun\AppData\Local\Temp\tomcat-docbase.8080.1730221008709940455\。如果是SpringMVC则应该是Tomcat安装目录下而不是在用户应用数据目录下。

### &emsp;异常处理器

#### &emsp;&emsp;默认规则

+ 默认情况下，Spring Boot提供/error处理所有错误的映射。
+ 对于机器客户端，它将生成JSON响应，其中包含错误，HTTP状态和异常消息的详细信息。
+ 对于浏览器客户端，响应一个whitelabel错误视图，以HTML格式呈现相同的异常数据。

默认返回信息有：

+ timestamp：当前错误时间戳信息。
+ status：状态码。
+ error：错误类型。
+ message：错误信息。
+ path：请求路径。

+ 要对错误页面进行自定义，添加View解析为error。
+ 要完全替换默认行为，可以实现ErrorController并注册该类型的Bean定义，或添加ErrorAttributes类型的组件以使用现有机制但替换其内容。

#### &emsp;&emsp;定制错误处理逻辑

+ 自定义错误页。静态资源目录下新建error文件夹或template文件夹并新建处理文件：
  + 4xx.html用来处理所有4开头状态码错误。
  + 5xx.html用来处理所有5开头状态码错误。
  + 指定具体的错误状态码如404.html用来处理指定的状态码错误。
+ @ControllerAdvice+@ExceptionHandler处理异常。
+ 实现HandlerExceptionResolver处理异常。

### &emsp;Web原生组件注入

即注入Servlet、Filter、Listener。

#### &emsp;&emsp;Servlet API

在boot下新建一个serlvet包，并新建一个TestServlet：

```java
// HttpServlet.java
package org.didnelpsun.boot.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// WebServlet表示当前为WebServlet
// 用于标注在一个继承了HttpServlet类之上，属于类级别的注解
@WebServlet(name = "TestServlet", value = "/testServlet")
public class TestServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.getWriter().write("doGet");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

    }
}
```

除此之外还需要将@WebServlet注解的Servlet注入到容器中，需要在主程序类Application的累上添加@ServletComponetScan对@WebServlet注解进行扫描实例化并注入。如我这里是`@ServletComponentScan(basePackages = {"org.didnelpsun.boot.servlet","org.didnelpsun.boot.filter","org.didnelpsun.boot.listener"})`。

同理我们可以使用@WebFilter、@WebListener注册过滤器和监听器，同样使用@ServletComponetScan注解来扫描注册到容器中，新建filter和listener包并添加过滤器和监听器：

```java
// TestFilter.java
package org.didnelpsun.boot.filter;

import lombok.extern.slf4j.Slf4j;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import java.io.IOException;

@Slf4j
@WebFilter(filterName = "TestFilter", value = "/*")
public class TestFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) {
        log.info("过滤器初始化完成");
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        log.info("过滤器工作");
        // 过滤器放行
        filterChain.doFilter(servletRequest,servletResponse);
    }

    @Override
    public void destroy() {
        log.info("过滤器销毁完成");
    }
}
```

```java
// TestListener.java
package org.didnelpsun.boot.listener;

import lombok.extern.slf4j.Slf4j;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@Slf4j
@WebListener
public class TestListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        log.info("容器初始化完成");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        log.info("容器销毁完成");
    }
}
```

此时我们如果使用了拦截器，则会发现这个原生Servlet没有经过拦截器。因为SpringBoot基于SpringMVC，请求全部经过前端控制器DispatcherServlet，通过doDispatch方法进行拦截，而这里我们使用原生Servlet，所以不走前端控制器，所以此时的拦截器就没用了。

#### &emsp;&emsp;RegistrationBean

filter用于数据过滤处理、listener用于初始化作用域数据、interceptor用于拦截请求。

有ServletRegistrationBean、FilterRegistrationBean、ServletListenserRegistrationBean三个组件。使用配置类将这三个Bean放到容器中。

先将主程序的ServletComponentScan注解注释掉。

在config包中添加RegisterConfig：

```java
// RegisterConfig.java
package org.didnelpsun.boot.config;

import org.didnelpsun.boot.filter.TestFilter;
import org.didnelpsun.boot.listener.TestListener;
import org.didnelpsun.boot.servlet.TestServlet;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class RegisterConfig {
    @Bean
    public ServletRegistrationBean<TestServlet> testServlet(){
        // 将定义的Servlet注册
        return new ServletRegistrationBean<>(new TestServlet(),"/testServlet");
    }
    @Bean
    public FilterRegistrationBean<TestFilter> testFilter(){
        // 对Servlet进行过滤
//        return new FilterRegistrationBean<>(new TestFilter(), testServlet());
        // 对URL进行过滤
        FilterRegistrationBean<TestFilter> filterRegistrationBean = new FilterRegistrationBean<>(new TestFilter());
        filterRegistrationBean.setUrlPatterns(List.of("/*"));
        return filterRegistrationBean;
    }
    @Bean
    public ServletListenerRegistrationBean<TestListener> testListener(){
        return new ServletListenerRegistrationBean<>(new TestListener());
    }
}
```

这里@Configuration的proxyBeanMethods保持为true，保证过滤器等都是一个，避免多次请求新建多个处理器。

### &emsp;嵌入式Servlet容器

SpringBoot使用嵌入式Servlet容器，之前SpringMVC需要使用外置的Tomcat服务器，将Java项目打包为war然后放到Tomcat上运行，配置起来十分麻烦，而SpringBoot自己的容器就自动配置好，可以独立运行。

#### &emsp;&emsp;嵌入式Servlet容器运行流程

默认支持的WebServer：Tomcat、Jetty和Undertow。原理是底层的ServletWebServerApplicationContext容器启动自动寻找ServletSebServerFactory并引导创建服务器：

1. SpringBoot启动应用，发现是Web应用，Web场景包导入了Tomcat。
2. Web应用会创建一个Web版的IoC容器ServletWebServerApplicationContext。
3. ServletWebServerApplicationContext启动寻找ServletSebServerFactory服务器工厂。
4. 底层ServletWebServerFactoryAutoConfiguration根据导入依赖自动配置TomcatServletWebServerFactory、JettyServletWebServerFactory、UndertowServletWebServerFactory。Web场景默认导入Tomcat。

#### &emsp;&emsp;切换嵌入式Servlet容器

使用不同的场景，默认spring-boot-starter-web是使用Tomcat：

+ spring-boot-starter-tomcat。
+ spring-boot-starter-jetty。
+ spring-boot-starter-undertow。

如果使用其他的就要在web场景中排除Tomcat再引入其他的容器：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

maven重新导入启动服务器就发现切换了服务器。

#### &emsp;&emsp;定制Servlet容器

1. 实现`WebServerFactorycustomizer<ConfigurableServletwebServerFactory>`接口。
2. 修改配置文件中server.xxx的相关内容。
3. 直接自定义ConfigurableServletWebServerFactory。

&emsp;

## 数据访问

### &emsp;配置数据库

首先需要导入相关依赖，这里使用的是JDBC：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jdbc</artifactId>
</dependency>
```

导入后可以发现其导入了com.zaxxer.HikariCP数据源、org.springframework.spring-jdbc数据操作、org.springframework.spring-tx事务管理。我们可以发现这里没用导入驱动Driver，这是因为官方不知道我们开发者开发时需要使用什么数据库，所以就没有默认指定驱动。

如我们使用MySQL，就需要自己导入mysql-connector-java包，之前已经使用过。其中SpringBoot已经对MySQL依赖已经进行版本仲裁，所以可以不用写版本，也可以在配置文件中对版本修改。注意本机数据库版本与驱动版本相对应。

```xml
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version>
</dependency>
```

自动配置类：

+ DataSourceAutoConfiguration：数据源的自动配置。
+ DataSourceTransactionManagerAutoConfiguration：事务管理器的自动配置。
+ JdbcTemplateAutoConfiguration：JdbcTemplate的自动配置，可以来对数据库进行CRUD。
+ JndiDataSourceAutoConfiguration：JNDI的自动配置。
+ XADataSourceAutoConfiguration：分布式事务相关。

SpringBoot底层配置好的数据库连接池为HikariDataSource。

使用数据库还使用yaml配置数据源spring.datasousrce的相关数据：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/data
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
```

如果数据库没有配置会报错：

```txt
Consider the following:
    If you want an embedded database (H2, HSQL or Derby), please put it on the classpath.
    If you have database settings to be loaded from a particular profile you may need to activate it (no profiles are currently active).
```

项目启动会自动去连接数据库，如果配置内容有问题则会报错：Caused by: java.sql.SQLException: Access denied for user 'root'@'localhost' (using password: YES)。

只有所有数据库配置没问题才能启动成功。

### &emsp;配置Druid连接池

SpringBoot默认使用HikariCP，SpringMVC默认使用C3P0。我们这里可以整合第三方[Druid](https://druid.apache.org/)。

整合方法有两种：1、纯手工自定义；2、找starter。

#### &emsp;&emsp;配置文件

首先引入依赖：

```xml
<!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.8</version>
</dependency>
```

然后SpringMVC是使用XML来配置数据源，SpringBoot使用Java代码Config来配置，config下新建一个DataSourceConfig：

```java
// DataSourceConfig.java
package org.didnelpsun.boot.config;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.support.http.StatViewServlet;
import com.alibaba.druid.support.http.WebStatFilter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;

@Configuration
public class DataSourceConfig {
    // 使用配置文件注入，Druid的配置名和默认的一样所以可以直接配置
    @ConfigurationProperties("spring.datasource")
    @Bean
    public DataSource dataSource() throws SQLException {
        DruidDataSource dataSource = new DruidDataSource();
        // 开启监控和防火墙功能
        dataSource.setFilters("stat,wall");
        return dataSource;
    }
    // 配置Druid官方教程的数据库连接池监控页
    // Druid内置提供了一个StatViewServlet用于展示Druid的统计信息。
    //这个StatViewServlet的用途包括：
    //提供监控信息展示的html页面
    //提供监控信息的JSON API
    @Bean
    public ServletRegistrationBean<?> statViewServlet(){
        // 监控首页地址为/druid/index.html
        ServletRegistrationBean<StatViewServlet> servletRegistrationBean = new ServletRegistrationBean<>(new StatViewServlet(), "/druid/*");
        // 添加监控页的用户密码
        servletRegistrationBean.addInitParameter("loginUsername","admin");
        servletRegistrationBean.addInitParameter("loginPassword", "root");
        return servletRegistrationBean;
    }
    // WebStatFilter用于监控Web-JDBC应用数据
    @Bean
    public FilterRegistrationBean<?> webStatFilter(){
        FilterRegistrationBean<WebStatFilter> filterRegistrationBean = new FilterRegistrationBean<>(new WebStatFilter());
        filterRegistrationBean.setUrlPatterns(List.of("/*"));
        // 对静态资源和druid监控页进行排除，使用初始化参数
        filterRegistrationBean.addInitParameter("exclusions", "*.js,*.gif,*.jpg,*.png,*.css,*ico,/druid/*");
        return filterRegistrationBean;
    }
}
```

#### &emsp;&emsp;starter

将配置文件全部注解掉。

除了配置文件，其实阿里也提供了官方的starter：druid-spring-boot-starter：

```xml
<!-- https://mvnrepository.com/artifact/com.alibaba/druid-spring-boot-starter -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.8</version>
</dependency>
```

配置跟默认数据源一样，所以不需要额外配置用户名密码等：

```yaml
spring:
  datasource:
    druid:
      # 开启监控和防火墙
      filters: stat,wall
      aop-patterns:
        - org.didnelpsun.boot.*
      # 开启监控页
      stat-view-servlet:
        enabled: true
        login-username: admin
        login-password: root
        # 必须开启这个运行才能使用
        allow: ""
      # 开启web监控过滤器
      web-stat-filter:
        enabled: true
        urlPattern: /*
        exclusions: '*.js,*.gif,*.jpg,*.png,*.css,*ico,/druid/*'
```

### &emsp;整合MyBatis

MyBatis是第三方，所以其starter应该是以mybatis开头：

```xml
<!-- https://mvnrepository.com/artifact/org.mybatis.spring.boot/mybatis-spring-boot-starter -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.2</version>
</dependency>
```

然后在配置文件中添加：

```yaml
mybatis:
  config-location: classpath:mybatis.xml
```

resources下新建一个mybatis.xml：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!--config文件专用的dtd格式文件-->
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">

<!--mybatis的主配置文件-->
<configuration>
    <!--配置已经在yaml文件中配置好了-->
</configuration>
```

下面的两种配置方式在MyBatis中就已经使用过，实际上就是MyBatis的具体应用，这里可以继续重温一遍。

#### &emsp;&emsp;XML方式

+ 依赖提供全局配置文件。
+ SqlSessionFactory：自动配置。
+ SqlSession：自动配置了SqlSessionTemplate组合了SqlSession。
+ @Import(AutoConfigurationMapperScannerRegistrar.class)：导入自动配置扫描注册器。
+ Mapper：只要编写操作MyBatis的接口标注了@Mapper就能自动扫描进行。
+ 修改配置文件的mybatis对MyBatis进行配置。

即MyBatis中的配置方式需要XML文件，其中需要两种配置文件，一种是写基本数据操作的DAO接口Java文件，一种是具体实现操作编写SQL语句的DAO配置XML文件。

在boot文件夹新建一个dao包，并新建一个接口：

```java
// IUserDao.java
package org.didnelpsun.boot.dao;

import org.apache.ibatis.annotations.Mapper;
import org.didnelpsun.boot.bean.User;
import java.util.List;

//@Repository
// 这里不能使用@Repository，因为这个注释需要配置扫描地址，否则报错
// Parameter 0 of method setUserDao in org.didnelpsun.boot.service.UserServiceImpl required a bean of type 'org.didnelpsun.boot.dao.IUserDao' that could not be found.
// @Mapper不需要配置扫描地址，所有的Mapper注解都会被扫描到
@Mapper
public interface IUserDao {
    // 查询所有用户
    List<User> selectAllUsers();
    // 查询一个用户
    User selectUser(Integer id);
    // 插入用户
    void insertUser(User user);
    // 更新用户
    void updateUser(User user);
    // 删除用户
    void deleteUser(Integer id);
    // 根据用户名模糊查询用户
    List<User> selectUsersByName(String name);
    // 获取用户总数
    Integer getUsersSum();
}
```

然后在resources文件下新建一个dao包，创建XML文件UserDaoImpl编写接口对应的SQL语句：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!--namespace是DAO的地址-->
<mapper namespace="org.didnelpsun.boot.dao.IUserDao">
    <!--配置查询所有，id为对应类的方法名，不能随便改-->
    <!--resultType即持久层返回的数据应该封装成什么样的数据类-->
    <select id="selectAllUsers" resultType="org.didnelpsun.boot.bean.User">
        select * from user
    </select>
    <!--查询一个用户-->
    <select id="selectUser" parameterType="Integer" resultType="org.didnelpsun.boot.bean.User">
        select * from user where id=#{id};
    </select>
    <!--插入用户-->
    <insert id="insertUser" parameterType="org.didnelpsun.boot.bean.User">
        insert into user(name,sex,birthday,address) values (#{name},#{sex},#{birthday},#{address});
    </insert>
    <!--更新用户-->
    <update id="updateUser" parameterType="org.didnelpsun.boot.bean.User">
        update user set name=#{name},sex=#{sex},birthday=#{birthday},address=#{address} where id=#{id};
    </update>
    <!--删除用户-->
    <delete id="deleteUser" parameterType="Integer">
        <!--由于只有一个参数，所以这个参数就是个占位符，叫什么都可以-->
        delete from user where id=#{id};
    </delete>
    <!--获取用户总数，即记录总条数-->
    <select id="getUsersSum" resultType="Integer">
        select count(id) from user;
    </select>
    <!--根据名称模糊查询用户-->
    <select id="selectUsersByName" parameterType="String" resultType="org.didnelpsun.boot.bean.User">
        <!--这里不能使用百分号来模糊查询，必须在测试代码中写-->
        <!--这种方式参数是以PreparedStatement占位参数的形式变成SQL语句，即进行预处理，所以更推荐-->
        select * from user where name like #{name}
        <!--如果是模糊查询也可以使用下面的方式，不过里面的参数固定为 ${value} -->
        <!-- select * from user where name like '${value}'; -->
        <!--这种方式参数是以Statement拼接字符串的形式变成SQL语句-->
    </select>
</mapper>
```

此时需要在yaml中添加`mapper-locations: classpath:dao/*.xml`表示映射的具体SQL语句在resources文件夹下的dao文件夹，并对应所有XML文件。

由于服务层调用持久层，所以新建一个service包，并新建一个IUserService和UserServiceImpl：

```java
// IUserService.java
package org.didnelpsun.boot.service;

import org.didnelpsun.boot.bean.User;
import java.util.List;

public interface IUserService {
    // 查询所有用户
    List<User> selectAllUsers();
    // 查询一个用户
    User selectUser(Integer id);
    // 插入用户
    void insertUser(User user);
    // 更新用户
    void updateUser(User user);
    // 删除用户
    void deleteUser(Integer id);
    // 根据用户名模糊查询用户
    List<User> selectUsersByName(String name);
    // 获取用户总数
    Integer getUsersSum();
}
```

```java
// UserService.java
package org.didnelpsun.boot.service;

import org.didnelpsun.boot.bean.User;
import org.didnelpsun.boot.dao.IUserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements IUserService {
    private IUserDao userDao;

    @Autowired
    public void setUserDao(IUserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public List<User> selectAllUsers() {
        return userDao.selectAllUsers();
    }

    @Override
    public User selectUser(Integer id) {
        return userDao.selectUser(id);
    }

    @Override
    public void insertUser(User user) {
        userDao.insertUser(user);
    }

    @Override
    public void updateUser(User user) {
        userDao.updateUser(user);
    }

    @Override
    public void deleteUser(Integer id) {
        userDao.deleteUser(id);
    }

    @Override
    public List<User> selectUsersByName(String name) {
        return userDao.selectUsersByName(name);
    }

    @Override
    public Integer getUsersSum() {
        return userDao.getUsersSum();
    }
}
```

在控制层调用服务层：

```java
// TestController
package org.didnelpsun.boot.controller;

import lombok.extern.slf4j.Slf4j;
import org.didnelpsun.boot.bean.User;
import org.didnelpsun.boot.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
public class TestController {
    UserServiceImpl userService;

    @Autowired
    public void setUserService(UserServiceImpl userService) {
        this.userService = userService;
    }

    @RequestMapping("/img/test.jpg")
    public String test(){
        return "test";
    }
    @RequestMapping("/login")
    public String login(String name, String password, HttpServletRequest request){
        HttpSession session = request.getSession();
        session.setAttribute("name", name);
        session.setAttribute("password", password);
        System.out.println(name + password);
        return "登录成功！";
    }
    @PostMapping("/upload")
    public String upload(@RequestPart("file") MultipartFile file, HttpSession session) throws IOException {
        // 类标注@Slf4j来获取日志打印信息对象log进行信息打印
        log.info("文件信息：原始名称：{}，大小：{}，路径：{}",file.getOriginalFilename(), file.getSize(), file.getResource());
        if(!file.isEmpty()){
            // 利用transferTo进行文件传输到项目静态资源的img文件夹下
            file.transferTo(new File(session.getServletContext().getRealPath("")+ File.separator +file.getOriginalFilename()));
            return "上传成功！";
        }
        else
            return "文件为空！";
    }
    @RequestMapping("/allUser")
    public List<User> allUser(){
        return userService.selectAllUsers();
    }
    @RequestMapping("/user/{id}")
    public User user(@PathVariable Integer id){
        return userService.selectUser(id);
    }
}
```

记住最后一定要覆盖原来的User类：

```java
// User.java
package org.didnelpsun.boot.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.io.Serializable;
import java.util.Date;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class User implements Serializable{
    private Integer id;
    private String name;
    private Date birthday;
    private String sex;
    private String address;
}
```

访问<http://localhost:8080/allUser>，没问题。

如果需要开启驼峰命名策略，即将数据库中的user_id看成Java对象的userId，需要在MyBatis的XML配置文件中配置：

```xml
<!--mybatis的主配置文件-->
<configuration>
    <!--配置已经在yaml文件中配置好了-->
    <!--开启驼峰命名策略-->
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>
</configuration>
```

在YAML中只需要配置这两个规则配置就完成了。其实不使用config-location不写MyBatis的XML配置文件也可以使用，直接在yaml配置文件的mybatis.configuration下配置就可以了，但是注意此时就不能配置config-location了：

```yaml
mybatis:
#  config-location: classpath:mybatis.xml
  mapper-locations:
    - classpath:dao/*.xml
  # 配置了configuration就不能配置config-location来指定配置文件，否则会冲突
  configuration:
    map-underscore-to-camel-case: true
```

#### &emsp;&emsp;注解方式

&emsp;

## 单元测试

&emsp;

## 指标监控

