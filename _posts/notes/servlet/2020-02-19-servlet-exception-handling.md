---
layout: post
title:  "异常处理"
date:   2020-02-19 22:00:02 +0800
categories: notes servlet base
tags: javaweb servlet 基础 异常
excerpt: "异常捕获与处理"
---

当一个Servlet抛出一个异常时，Web容器在使用了exception-type元素的web.xml中搜索与抛出异常类型相匹配的配置。

你必须在web.xml中使用error-page元素来指定对特定异常或HTTP状态码作出相应的Servlet调用。

假设，有一个ErrorHandler的Servlet在任何已定义的异常或错误出现时被调用。以下将是在web.xml中创建的项。

```xml
<!-- servlet 定义 -->
<servlet>
        <servlet-name>ErrorHandler</servlet-name>
        <servlet-class>ErrorHandler</servlet-class>
</servlet>
<!-- servlet 映射 -->
<servlet-mapping>
        <servlet-name>ErrorHandler</servlet-name>
        <url-pattern>/ErrorHandler</url-pattern>
</servlet-mapping>

<!-- error-code 相关的错误页面 -->
<error-page>
    <error-code>404</error-code><!--错误编码-->
    <location>/ErrorHandler</location><!--定义错误时页面指向-->
</error-page>
<error-page>
    <error-code>403</error-code>
    <location>/ErrorHandler</location>
</error-page>

<!-- exception-type 相关的错误页面 -->
<error-page>
    <exception-type><!--定义错误时抛出的异常类型-->
          javax.servlet.ServletException
    </exception-type >
    <location>/ErrorHandler</location>
</error-page>

<error-page>
    <exception-type>java.io.IOException</exception-type >
    <location>/ErrorHandler</location>
</error-page>
```

如果你想对所有的异常有一个通用的错误处理程序，那么应该定义下面的 error-page，而不是为每个异常定义单独的 error-page 元素：

```xml
<error-page>
    <exception-type>java.lang.Throwable</exception-type >
    <location>/ErrorHandler</location>
</error-page>
```

## 相关方法

以下是错误处理的 Servlet 可以访问的请求属性列表，用来分析错误/异常的性质。

序号|属性|描述
:--:|:-:|:---
1|javax.servlet.error.status_code|该属性给出状态码，状态码可被存储，并在存储为 java.lang.Integer 数据类型后可被分析。
2|javax.servlet.error.exception_type|属性给出异常类型的信息，异常类型可被存储，并在存储为 java.lang.Class 数据类型后可被分析。
3|javax.servlet.error.message|该属性给出确切错误消息的信息，信息可被存储，并在存储为 java.lang.String 数据类型后可被分析。
4|javax.servlet.error.request_uri|该属性给出有关 URL 调用 Servlet 的信息，信息可被存储，并在存储为 java.lang.String 数据类型后可被分析。
5|javax.servlet.error.exception|该属性给出异常产生的信息，信息可被存储，并在存储为 java.lang.Throwable 数据类型后可被分析。
6|javax.servlet.error.servlet_name|该属性给出 Servlet 的名称，名称可被存储，并在存储为 java.lang.String 数据类型后可被分析。

&emsp;

## 错误实例

```java
// ErrorHandler.java
// 导入必需的 java 库
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.util.*;

// 扩展 HttpServlet 类
public class ErrorHandler extends HttpServlet {
  // 处理 GET 方法请求的方法
    public void doGet(HttpServletRequest request,
                    HttpServletResponse response)
            throws ServletException, IOException
    {
        // 分析 Servlet 异常
        Throwable throwable = (Throwable) request.getAttribute("javax.servlet.error.exception"); //获取抛出的异常
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code"); //获取状态码
        String servletName = (String) request.getAttribute("javax.servlet.error.servlet_name"); //获取发生错误的页面
        if (servletName == null){ //如果servletName是空值，就代表错误的页面为空，也就是找不到页面
            servletName = "Unknown";
        }
        String requestUri = (String) request.getAttribute("javax.servlet.error.request_uri");//获取发生错误的路由
        if (requestUri == null){
            requestUri = "Unknown";
        }

        // 设置响应内容类型
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        String title = "Error/Exception Information";
        String docType = "<!doctype html>\n";
        out.println(docType + "<html>\n" + "<head><title>" + title + "</title></head>\n" + "<body bgcolor=\"#f0f0f0\">\n");
        if (throwable == null && statusCode == null){ //如果什么错误都不知道
            out.println("<h2>Error information is missing</h2>");
            out.println("Please return to the <a href=\"" +response.encodeURL("http://localhost:8080/") + "\">Home Page</a>.");//情返回到到主页
        }
        else if (statusCode != null){
            out.println("The status code : " + statusCode);
        }
        else{ //抛出异常信息
            out.println("<h2 class="tutheader">Error information</h2>");
            out.println("Servlet Name : " + servletName + "</br></br>");
            out.println("Exception Type : " + throwable.getClass( ).getName( ) + "</br></br>");
         out.println("The request URI: " + requestUri + "<br><br>");
         out.println("The exception message: " + throwable.getMessage( ));
        }
        out.println("</body>");
        out.println("</html>");
    }
    // 处理 POST 方法请求的方法
    public void doPost(HttpServletRequest request,
                        HttpServletResponse response)
                        throws ServletException, IOException {
        doGet(request, response);
    }
}
```

```xml
<!--web.xml-->
<servlet><!--将所有的以下错误都交给ErrorHandler.java处理-->
    <servlet-name>ErrorHandler</servlet-name>
    <servlet-class>ErrorHandler</servlet-class>
</servlet>
<!-- servlet mappings -->
<servlet-mapping>
    <servlet-name>ErrorHandler</servlet-name>
    <url-pattern>/ErrorHandler</url-pattern>
</servlet-mapping>
<error-page>
    <error-code>404</error-code>
    <location>/ErrorHandler</location>
</error-page>
<error-page>
    <exception-type>java.lang.Throwable</exception-type >
    <location>/ErrorHandler</location>
</error-page>
```
