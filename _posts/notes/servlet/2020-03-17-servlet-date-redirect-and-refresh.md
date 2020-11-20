---
layout: post
title: "日期重定向与刷新"
date: 2020-03-17 13:23:44 +0800
categories: notes servlet base
tags: javaweb servlet 基础 日期 Date 重定向 sendRedirect setStatus setHeader 刷新 setIntHeader
excerpt: "日期、重定向与刷新"
---

## 日期处理

Date 类支持两个构造函数。第一个构造函数初始化当前日期和时间的对象：`Date()`。或者接受一个参数，该参数等于 1970 年 1 月 1 日午夜以来经过的毫秒数：`Date(long millisec)`。

### &emsp;日期处理函数

序号|方法|描述
:--:|:--:|:---
1|boolean after(Date date)|如果调用的 Date 对象中包含的日期在 date 指定的日期之后，则返回 true，否则返回 false。
2|boolean before(Date date)|如果调用的 Date 对象中包含的日期在 date 指定的日期之前，则返回 true，否则返回 false。
3|Object clone()|重复调用 Date 对象。
4|int compareTo(Date date)|把调用对象的值与 date 的值进行比较。如果两个值是相等的，则返回 0。如果调用对象在 date 之前，则返回一个负值。如果调用对象在 date 之后，则返回一个正值。
5|int compareTo(Object obj)|如果 obj 是 Date 类，则操作等同于 compareTo(Date)。否则，它会抛出一个 ClassCastException。
6|boolean equals(Object date)|如果调用的 Date 对象中包含的时间和日期与 date 指定的相同，则返回 true，否则返回 false。
7|long getTime()|返回 1970 年 1 月 1 日以来经过的毫秒数。
8|int hashCode()|为调用对象返回哈希代码。
9|void setTime(long time)|设置 time 指定的时间和日期，这表示从 1970 年 1 月 1 日午夜以来经过的时间（以毫秒为单位）。
10|String toString()|转换调用的 Date 对象为一个字符串，并返回结果。

### &emsp;当前日期

直接构造Date对象，并使用toString()转换为字符串：`Date date = new Date(); System.out.println(date.toString());`。

### &emsp;日期比较

+ `getTime()` 来获取两个对象自1970年1月1日午夜以来经过的时间（以毫秒为单位），然后对这两个值进行比较。
+ `before()`、`after()`和`equals()`。由于一个月里12号在18号之前，例如，`new Date(99, 2, 12).before(new Date (99, 2, 18))`返回true。
+ `compareTo()`方法，该方法由Comparable接口定义，由Date实现。

### &emsp;格式化日期

一般的流程：

```java
Date dNow = new Date();
SimpleDateFormat ft =  new SimpleDateFormat ("E yyyy.MM.dd 'at' hh:mm:ss a zzz");
System.out.println(ft.format(dNow));
```

字符|描述|实例
:--:|:--:|:--
G|Era 指示器|AD
y|四位数表示的年|2001
M|一年中的月|July 或 07
d|一月中的第几天|10
h|带有 A.M./P.M. 的小时（1~12）|12
H|一天中的第几小时（0~23）|22
m|一小时中的第几分|30
s|一分中的第几秒|55
S|毫秒|234
E|一周中的星期几|Tuesday
D|一年中的第几天|360
F|所在的周是这个月的第几周|2 (second Wed. in July)
w|一年中的第几周|40
W|一月中的第几周|1
a|A.M./P.M. 标记|PM
k|一天中的第几小时（1~24）|24
K|带有 A.M./P.M. 的小时（0~11）|10
z|时区|Eastern Standard Time
'|Escape for text|Delimiter
"|单引号|`

&emsp;

## 网页重定向

当文档移动到新的位置，我们需要向客户端发送这个新位置时，我们需要用到网页重定向。当然，也可能是为了负载均衡，或者只是为了简单的随机，这些情况都有可能用到网页重定向。也就是说我们从一个网页跳转到另一个网页。

重定向请求到另一个网页的最简单的方式是使用response对象的`sendRedirect()`方法。下面是该方法的定义： 将请求重定向到另一页的最简单的方法是，用方法的sendRedirect()的响应对象。以下是这种方法的定义：`public void HttpServletResponse.sendRedirect(String location) throws IOException`。

该方法把响应连同状态码和新的网页位置发送回浏览器。您也可以通过把`setStatus()`和`setHeader()`方法一起使用来达到同样的效果：

```java
...
String site = 跳转新址 ;
response.setStatus(response.SC_MOVED_TEMPORARILY);
response.setHeader("Location", site);
...
```

```java
String site = new String("https://didnelpsun.github.io");
//
response.setStatus(response.SC_MOVED_TEMPORARILY);
response.setHeader("Location", site);
//或者
response.sendRedirect(site);
```

&emsp;

## 自动刷新

假设有一个网页，它是显示现场比赛成绩或股票市场状况或货币兑换率。对于所有这些类型的页面，您需要定期刷新网页。

Java Servlet提供了一个机制，使得网页会在给定的时间间隔自动刷新。

刷新网页的最简单的方式是使用响应对象的方法 setIntHeader()。

<span style="color:aqua">格式：</span>`public void setIntHeader(String header, int headerValue)`

此方法把头信息 "Refresh" 连同一个表示时间间隔的整数值（以秒为单位）发送回浏览器。如：`response.setIntHeader("Refresh", 5);`

![时间表][time]

```java
package test;

// 导入必需的 java 库
import java.io.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.text.SimpleDateFormat;
import java.util.Date;

// 扩展 HttpServlet 类
@WebServlet("/HelloWorld")
public class HelloWorld extends HttpServlet {
    private String message;
    public void init() throws ServletException
    {
        // 执行必需的初始化
        message = "Hello World";
    }

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
            throws ServletException, IOException
    {
        // 设置响应内容类型
        response.setContentType("text/html");
        response.setCharacterEncoding("utf-8");
        response.setIntHeader("Refresh", 1);
        Date date = new Date();
        SimpleDateFormat ft = new SimpleDateFormat("yyyy'年'M'月'd'日'H'时'm'分's'秒'");
        PrintWriter out = response.getWriter();
        out.println("<!doctype html>\n<html>\n<body>\n<h3>自动刷新时间表</h3>\n"
                +ft.format(date)+"</body>\n</html>");
    }

    public void destroy()
    {
        // 什么也不做
    }
}
```

[time]:data:image/png;base64,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