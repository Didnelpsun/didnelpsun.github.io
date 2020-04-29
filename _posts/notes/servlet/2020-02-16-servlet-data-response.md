---
layout: post
title:  "数据响应"
date:   2020-02-16 16:52:38 +0800
categories: notes servlet base
tags: javaweb servlet 基础 HTTP 服务端 setCharacterEncoding setContentType setIntHeader
excerpt: "服务端HTTP响应"
---

## 服务端响应格式

当一个 Web 服务器响应一个 HTTP 请求时，响应通常包括一个状态行、一些响应报头、一个空行和文档。一个典型的响应如下所示：

```terminal
HTTP/1.1 200 OK
Content-Type: text/html
Header2: ...
...
HeaderN: ...
  (Blank Line)
<!doctype ...>
<html>
<head>...</head>
<body>
...
</body>
</html>
```

状态行包括 HTTP 版本（在本例中为 HTTP/1.1）、一个状态码（在本例中为 200）和一个对应于状态码的短消息（在本例中为 OK）。

&emsp;

## 服务端响应报头

头信息|描述
:----:|:--
Allow|这个头信息指定服务器支持的请求方法（GET、POST 等）。
Cache-Control|这个头信息指定响应文档在何种情况下可以安全地缓存。可能的值有：public、private 或 no-cache 等。Public 意味着文档是可缓存，Private 意味着文档是单个用户私用文档，且只能存储在私有（非共享）缓存中，no-cache 意味着文档不应被缓存。
Connection|这个头信息指示浏览器是否使用持久 HTTP 连接。值 close 指示浏览器不使用持久 HTTP 连接，值 keep-alive 意味着使用持久连接。
Content-Disposition|这个头信息可以让您请求浏览器要求用户以给定名称的文件把响应保存到磁盘。
Content-Encoding|在传输过程中，这个头信息指定页面的编码方式。
Content-Language|这个头信息表示文档编写所使用的语言。例如，en、en-us、ru 等。
Content-Length|这个头信息指示响应中的字节数。只有当浏览器使用持久（keep-alive）HTTP 连接时才需要这些信息。
Content-Type|这个头信息提供了响应文档的 MIME（Multipurpose Internet Mail Extension）类型。
Expires|这个头信息指定内容过期的时间，在这之后内容不再被缓存。
Last-Modified|这个头信息指示文档的最后修改时间。然后，客户端可以缓存文件，并在以后的请求中通过 If-Modified-Since 请求头信息提供一个日期。
Location|这个头信息应被包含在所有的带有状态码的响应中。在 300s 内，这会通知浏览器文档的地址。浏览器会自动重新连接到这个位置，并获取新的文档。
Refresh|这个头信息指定浏览器应该如何尽快请求更新的页面。您可以指定页面刷新的秒数。
Retry-After|这个头信息可以与 503（Service Unavailable 服务不可用）响应配合使用，这会告诉客户端多久就可以重复它的请求。
Set-Cookie|这个头信息指定一个与页面关联的 cookie。

&emsp;

## 一般方法

下面的方法可用于在 Servlet 程序中设置 HTTP 响应报头。这些方法通过 HttpServletResponse 对象可用。

序号|返回类型|方法|描述
:-:|:------:|:-:|:----
1|String|encodeRedirectURL(String url)|为 sendRedirect 方法中使用的指定的 URL 进行编码，或者如果编码不是必需的，则返回 URL 未改变。
2|String|encodeURL(String url)|对包含 session 会话 ID 的指定 URL 进行编码，或者如果编码不是必需的，则返回 URL 未改变。
3|boolean|containsHeader(String name)|返回一个布尔值，指示是否已经设置已命名的响应报头。
4|boolean|isCommitted()|返回一个布尔值，指示响应是否已经提交。
5|void|addCookie(Cookie cookie)|把指定的 cookie 添加到响应。
6|void|addDateHeader(String name, long date)|添加一个带有给定的名称和日期值的响应报头。
7|void|addHeader(String name, String value)|添加一个带有给定的名称和值的响应报头。
8|void|addIntHeader(String name, int value)|添加一个带有给定的名称和整数值的响应报头。
9|void|flushBuffer()|强制任何在缓冲区中的内容被写入到客户端。
10|void|reset()|清除缓冲区中存在的任何数据，包括状态码和头。
11|void|resetBuffer()|清除响应中基础缓冲区的内容，不清除状态码和头。
12|void|sendError(int sc)|使用指定的状态码发送错误响应到客户端，并清除缓冲区。
13|void|sendError(int sc, String msg)|使用指定的状态发送错误响应到客户端。
14|void|sendRedirect(String location)|使用指定的重定向位置 URL 发送临时重定向响应到客户端。
15|void|setBufferSize(int size)|为响应主体设置首选的缓冲区大小。
16|void|setCharacterEncoding(String charset)|设置被发送到客户端的响应的字符编码（MIME 字符集）例如，UTF-8。
17|void|setContentLength(int len)|设置在 HTTP Servlet 响应中的内容主体的长度，该方法设置 HTTP Content-Length 头。
18|void|setContentType(String type)|如果响应还未被提交，设置被发送到客户端的响应的内容类型。
19|void|setDateHeader(String name, long date)|设置一个带有给定的名称和日期值的响应报头。
20|void|setHeader(String name, String value)|设置一个带有给定的名称和值的响应报头。
21|void|setIntHeader(String name, int value)|设置一个带有给定的名称和整数值的响应报头。
22|void|setLocale(Locale loc)|如果响应还未被提交，设置响应的区域。
23|void|setStatus(int sc)|为该响应设置状态码。

&emsp;

## 实例

### &emsp;1. setCharacterEncoding()、setContentType()和setIntHeader()

```java
// HeaderTest.java
// 导入必需的 java 库
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.util.*;
// 扩展 HttpServlet 类
public class HeaderTest extends HttpServlet {
  // 处理 GET 方法请求的方法
    public void doGet(HttpServletRequest request,
                    HttpServletResponse response)
            throws ServletException, IOException
    {
        // 设置刷新自动加载时间为 5 秒
        response.setIntHeader("Refresh", 1);
        // 设置响应内容类型
        response.setContentType("text/html");
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        // Get current time
        Calendar calendar = new GregorianCalendar();
        String am_pm;
        int hour = calendar.get(Calendar.HOUR);
        int minute = calendar.get(Calendar.MINUTE);
        int second = calendar.get(Calendar.SECOND);
        if(calendar.get(Calendar.AM_PM) == 0)
            am_pm = "AM";
        else
            am_pm = "PM";
        String CT = hour+":"+ minute +":"+ second +" "+ am_pm;
        PrintWriter out = response.getWriter();
        String title = "自动刷新 Header 设置";
        String docType = "<!doctype html>\n";
        out.println(docType +
            "<html>\n" +
            "<head><title>" + title + "</title></head>\n"+
            "<body bgcolor=\"#f0f0f0\">\n" +
            "<h1 align=\"center\">" + title + "</h1>\n" +
            "<p>当前时间是：" + CT + "</p>\n");
  }
  // 处理 POST 方法请求的方法
  public void doPost(HttpServletRequest request,
                     HttpServletResponse response)
      throws ServletException, IOException {
     doGet(request, response);
  }
```

![java图片1][java1]

首先`setCharacterEncoding()`、`setContentType()`已经被使用过了。一个是设置响应的字符编码，一个是文件格式。然后是`setIntHeader()`方法，和`setHeader()`差不多的用法，只不过数值是否可以为整数的区别。这里给出的响应头是Refresh，指刷新的意思，后面的数值代表刷新页面的秒数。然后后面就使用Canlendar类获取到现在的时间，每隔一秒刷新一次，就重新获取时间一次。还有如下响应头：

#### &emsp;&emsp;HTTP消息头

（1）通用信息头

即能用于请求消息中,也能用于响应信息中,但与被传输的实体内容没有关系的信息头,如Data,Pragma

主要: Cache-Control , Connection , Data , Pragma , Trailer , Transfer-Encoding , Upgrade

（2）请求头

用于在请求消息中向服务器传递附加信息,主要包括客户机可以接受的数据类型,压缩方法,语言,以及客户计算机上保留的信息和发出该请求的超链接源地址等.

主要: Accept , Accept-Encoding , Accept-Language , Host ,

（3）响应头

用于在响应消息中向客户端传递附加信息,包括服务程序的名称,要求客户端进行认证的方式,请求的资源已移动到新地址等.

主要: Location , Server , WWW-Authenticate(认证头)

（4）实体头

用做实体内容的元信息,描述了实体内容的属性,包括实体信息的类型,长度,压缩方法,最后一次修改的时间和数据的有效期等.

主要: Content-Encoding , Content-Language , Content-Length , Content-Location , Content-Type

（4）扩展头

主要：Refresh, Content-Disposition

#### &emsp;&emsp;各种头的主要用法

（1）Content-Type的作用

该实体头的作用是让服务器告诉浏览器它发送的数据属于什么文件类型。

例如：当Content-Type 的值设置为text/html和text/plain时，前者会让浏览器把接收到的实体内容以HTML格式解析，后者会让浏览器以普通文本解析。`response.setHeader("Content-Type","video/x-msvideo");`

（2）Content-Disposition 的作用

当Content-Type 的类型为要下载的类型时 ， 这个信息头会告诉浏览器这个文件的名字和类型。

`response.setHeader("Content-Disposition", "attachment;filename=aaa.doc");`

Content-Disposition中指定的类型是文件的扩展名，并且弹出的下载对话框中的文件类型图片是按照文件的扩展名显示的，点保存后，文件以filename的值命名，保存类型以Content中设置的为准。

<span style="color:orange">注意：</span>在设置Content-Disposition头字段之前，一定要设置Content-Type头字段。

解决中文文件名乱码的解决方法，平常想的是使用getBytes() ， 实际上应使用email的附件名编码方法对文件名进行编码，但IE不支持这种作法(其它浏览器支持) , 使用javax.mail.internet.*包的MimeUtility.encodeWord("中文.txt")的方法进行编码。

（3）Authorization头的作用

Authorization的作用是当客户端访问受口令保护时，服务器端会发送401状态码和WWW-Authenticate响应头，要求客户机使用Authorization来应答。

`response.setStatus(401);response.setHeader("WWW-Authenticate", "Basic realm=\"Tomcat Manager Application\"");`

[java1]:data:image/png;base64,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
