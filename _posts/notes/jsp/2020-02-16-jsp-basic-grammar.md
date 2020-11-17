---
layout: post
title:  "基础语法"
date:   2020-02-16 23:28:57 +0800
categories: notes jsp base
tags: JSP 基础 javaweb 脚本 声明 语法
excerpt: "JSP语法标签"
---

## 脚本程序

脚本程序可以包含任意量的Java语句、变量、方法或表达式，只要它们在脚本语言中是有效的。

脚本程序的语法格式：`<% 代码片段 %>`

或者，您也可以编写与其等价的XML语句，就像下面这样：

```jsp
<jsp:scriptlet>
  代码片段
</jsp:scriptlet>
```

```jsp
<body>
Hello World!<br/>
<%
  out.println("Your IP address is " + request.getRemoteAddr());
%>
</body>
```

![测试1][test1]

&emsp;

## 声明

一个声明语句可以声明一个或多个变量、方法，供后面的Java代码使用。在JSP文件中，您必须先声明这些变量和方法然后才能使用它们。

JSP声明的语法格式：`<%! declaration; [ declaration; ]+ ... %>`

或者，您也可以编写与其等价的XML语句，就像下面这样：

```jsp
<jsp:declaration>
  代码片段
</jsp:declaration>
```

```jsp
<%! String name = "Userking"; %>
<%
  out.println("your name is " + name);
%>
```

![测试2][test2]

&emsp;

## 表达式

一个JSP表达式中包含的脚本语言表达式，先被转化成String，然后插入到表达式出现的地方。由于表达式的值会被转化成String，所以您可以在一个文本行中使用表达式而不用去管它是否是HTML标签。

表达式元素中可以包含任何符合Java语言规范的表达式，但是不能使用分号来结束表达式。

JSP表达式的语法格式：`<%= 表达式 %>`

同样，您也可以编写与之等价的XML语句：

```jsp
<jsp:expression>
  表达式
</jsp:expression>
```

```jsp
<p>
  Today's date: <%= (new java.util.Date()).toLocaleString()%>
</p>
```

![测试3][test3]

&emsp;

## 运算符和常量

jsp中运算符和java是一致的，而常量也类似：

+ 布尔值(boolean)：true 和 false；
+ 整型(int)：与Java中的一样;
+ 浮点型(float)：与Java中的一样;
+ 字符串(string)：以单引号或双引号开始和结束；
+ Null：null。

## 注释

JSP注释主要有两个作用：为代码作注释以及将某段代码注释掉。

JSP注释的语法格式：`<%-- 这里可以填写 JSP 注释 --%>`

```jsp
<h2>A Test of Comments</h2>
<%-- 该部分注释在网页中不会被显示--%>
```

![测试4][test4]

不同情况下使用注释的语法规则：

语法|描述
:--:|:---
<%-- 注释 --%>|JSP注释，注释内容不会被发送至浏览器甚至不会被编译
\<!-- 注释 -->|HTML注释，通过浏览器查看网页源代码时可以看见注释内容
<\%|代表静态 <%常量
%\\>|代表静态 %> 常量
\\'|在属性中使用的单引号
\\"|在属性中使用的双引号

&emsp;

## 控制流语句

### &emsp;1. 判断语句

#### &emsp;&emsp;1.1if-else语句

<font color="aqua">格式：</font>

```jsp
<%
if(判断语句1){
    执行1
}
else if(判断语句2){
    执行2
}
else
    执行3
%>
```

```jsp
<%! int i=1;%>
<%
  if(i>0){
    out.println("大于0");
  }
  else if(i<0){
    out.println("小于0");
  }
  else
    out.println("等于0");
%>
```

![测试4][test4]

或者需要使用html元素：

```jsp
<%
if (判断语句)
{ %>
    执行1
<% }
else
{ %>
    执行2
<% }
%>
```

我们可能不太明白这个是怎么写的。不如先看个案例：

```jsp
<%! int day = 3; %>
<%
if (day == 1 | day == 7)
{ %>
    <p> Today is weekend</p>
<% }
else
{ %>
    <p> Today is not weekend</p>
<% }
%>
```

![测试5][test5]

其实跟上面是一样的，都是if-else，但是因为要使用html元素，所以需要用<%%>来将java部分截断放在尖括号中。

#### &emsp;&emsp;1.2switch语句

<span style="color:aqua">格式：</span>

```jsp
<%  
switch(变量) {
case 值1:
    执行1
    break;
...
default:
    执行n
}
%>
```

### &emsp;2. 循环语句

可以使用while语句和for语句：

```jsp
<%! int fontSize; %>
<%for ( fontSize = 10; fontSize <= 15; fontSize++){ %>
  <span style="color:yellowgreen ;font-size:<%= fontSize %>">
  JSP循环
  </span><br />
<%}%>
```

```jsp
<%! int fontSize = 10; %>
<%while ( fontSize <= 15){ %>
  <span style="color:yellowgreen ;font-size:<%= fontSize %>">
  JSP循环
  </span><br />
<%fontSize++;%>
<%}%>
```

![测试6][test6]

&emsp;

## 指令

JSP指令用来设置与整个JSP页面相关的属性。

JSP指令语法格式：`<%@ JSP指令="值" %>`

这里有三种指令标签：

指令|描述
:--:|:---
<%@ page ... %>|定义页面的依赖属性，比如脚本语言、error页面、缓存需求等等
<%@ include ... %>|包含其他文件
<%@ taglib ... %>|引入标签库的定义，可以是自定义标签

### &emsp;1. 页面指令

Page指令为容器提供当前页面的使用说明。一个JSP页面可以包含多个page指令。

Page指令的语法<span style="color:aqua">格式：</span>`<%@ page 属性="值" %>`

等价的XML<span style="color:aqua">格式：</span>`<jsp:directive.page 属性="值" />`

下表列出与Page指令相关的属性：

属性|描述
:--:|:---
buffer|指定out对象使用缓冲区的大小
autoFlush|控制out对象的 缓存区
contentType|指定当前JSP页面的MIME类型和字符编码
errorPage|指定当JSP页面发生异常时需要转向的错误处理页面
isErrorPage|指定当前页面是否可以作为另一个JSP页面的错误处理页面
extends|指定servlet从哪一个类继承
import|导入要使用的Java类
info|定义JSP页面的描述信息
isThreadSafe|指定对JSP页面的访问是否为线程安全
language|定义JSP页面所用的脚本语言，默认是Java
session|指定JSP页面是否使用session
isELIgnored|指定是否执行EL表达式
isScriptingEnabled|确定脚本元素能否被使用

### &emsp;2. 引用指令

JSP可以通过include指令来包含其他文件。被包含的文件可以是JSP文件、HTML文件或文本文件。包含的文件就好像是该JSP文件的一部分，会被同时编译执行。

Include指令的语法<span style="color:aqua">格式</span>如下：`<%@ include file="地址" %>`

Include指令中的文件名实际上是一个相对的URL。如果您没有给文件关联一个路径，JSP编译器默认在当前路径下寻找。

等价的XML<span style="color:aqua">格式：</span>`<jsp:directive.include file="地址" />`

&emsp;

### &emsp;3. 标签集合指令

JSP API允许用户自定义标签，一个自定义标签库就是自定义标签的集合。

Taglib指令引入一个自定义标签集合的定义，包括库路径、自定义标签。

Taglib指令的<span style="color:aqua">格式：</span>`<%@ taglib uri="地址" prefix="标签名" %>`

uri属性确定标签库的位置，prefix属性指定标签库的前缀。

等价的XML语法<span style="color:aqua">格式：</span>`<jsp:directive.taglib uri="地址" prefix="标签名" />`

## 行为/动作元素

JSP行为标签使用XML语法结构来控制servlet引擎。它能够动态插入一个文件，重用JavaBean组件，引导用户去另一个页面，为Java插件产生相关的HTML等等。与JSP指令元素不同的是，JSP动作元素在请求处理阶段起作用。JSP动作元素是用XML语法写成的。

行为标签只有一种语法格式，它严格遵守XML标准：`<jsp:action_name 属性="值" />`

行为标签基本上是一些预先就定义好的函数，下表罗列出了一些可用的JSP行为标签：

语法|描述
:--:|:---
jsp:include|用于在当前页面中包含静态或动态资源
jsp:useBean|寻找和初始化一个JavaBean组件
jsp:setProperty|设置 JavaBean组件的值
jsp:getProperty|将 JavaBean组件的值插入到 output中
jsp:forward|从一个JSP文件向另一个文件传递一个包含用户请求的request对象
jsp:plugin|用于在生成的HTML页面中包含Applet和JavaBean对象
jsp:element|动态创建一个XML元素
jsp:attribute|定义动态创建的XML元素的属性
jsp:body|定义动态创建的XML元素的主体
jsp:text|用于封装模板数据

所有的动作要素都有两个属性：id属性和scope属性。

+ id属性：id属性是动作元素的唯一标识，可以在JSP页面中引用。动作元素创建的id值可以通过PageContext来调用。

+ scope属性：该属性用于识别动作元素的生命周期。 id属性和scope属性有直接关系，scope属性定义了相关联id对象的寿命。 scope属性有四个可能的值： (a) page, (b)request, (c)session, 和 (d) application。

### &emsp;1. `<jsp:include>`

来包含静态和动态的文件。该动作把指定文件插入正在生成的页面。语法<span style="color:aqua">格式：</span>`<jsp:include page="relative URL" flush="true" />`

前面已经介绍过include指令，它是在JSP文件被转换成Servlet的时候引入文件，而这里的jsp:include动作不同，插入文件的时间是在页面被请求的时候。

以下是include动作相关的属性列表。

属性|描述
:--:|:---
page|包含在页面中的相对URL地址。
flush|布尔属性，定义在包含资源前是否刷新缓存区。

我们新建一个date.jsp在index.jsp同一界面，并修改index.jsp，代码如下所示：

```jsp
<!--date.jsp-->
<p>
   Today's date: <%= (new java.util.Date()).toString()%>
</p>
```

```jsp
<!--index.jsp-->
<h2>The include action Example</h2>
<jsp:include page="date.jsp" flush="true" />
```

![测试7][test7]

### &emsp;2. `<jsp:useBean>`

jsp:useBean动作用来装载一个将在JSP页面中使用的[JavaBean]({% post_url notes/java/2020-02-18-java-javabean %})。

这个功能非常有用，因为它使得我们既可以发挥Java组件重用的优势，同时也避免了损失JSP区别于Servlet的方便性。

jsp:useBean动作语法<span style="color:aqua">格式</span>为：`<jsp:useBean id="name" class="package.class" />`

在类载入后，我们既可以通过 jsp:setProperty 和 jsp:getProperty 动作来修改和检索bean的属性。

以下是useBean动作相关的属性列表。

属性|描述
:--:|:---
class|指定Bean的完整包名。
type|指定将引用该对象变量的类型。
beanName|通过 java.beans.Beans 的 instantiate() 方法指定Bean的名字。

在给出具体实例前，让我们先来看下 jsp:setProperty 和 jsp:getProperty 动作元素：

### &emsp;3. `<jsp:setProperty>`

jsp:setProperty用来设置已经实例化的Bean对象的属性，有两种用法。首先，你可以在jsp:useBean元素的外面（后面）使用jsp:setProperty，如下所示：

```jsp
<jsp:useBean id="myName" ... />
...
<jsp:setProperty name="myName" property="someProperty" .../>
```

此时，不管jsp:useBean是找到了一个现有的Bean，还是新创建了一个Bean实例，jsp:setProperty都会执行。

第二种用法是把jsp:setProperty放入jsp:useBean元素的内部，如下所示：

```jsp
<jsp:useBean id="myName" ... >
...
   <jsp:setProperty name="myName" property="someProperty" .../>
</jsp:useBean>
```

此时，jsp:setProperty只有在新建Bean实例时才会执行，如果是使用现有实例则不执行jsp:setProperty。

属性|描述
:--:|:---
name|name属性是必需的。它表示要设置属性的是哪个Bean。
property|property属性是必需的。它表示要设置哪个属性。有一个特殊用法：如果property的值是"*"，表示所有名字和Bean属性名字匹配的请求参数都将被传递给相应的属性set方法。
value|value 属性是可选的。该属性用来指定Bean属性的值。字符串数据会在目标类中通过标准的valueOf方法自动转换成数字、boolean、Boolean、 byte、Byte、char、Character。例如，boolean和Boolean类型的属性值（比如"true"）通过 Boolean.valueOf转换，int和Integer类型的属性值（比如"42"）通过Integer.valueOf转换。

value和param不能同时使用，但可以使用其中任意一个。

param是可选的。它指定用哪个请求参数作为Bean属性的值。如果当前请求没有参数，则什么事情也不做，系统不会把null传递给Bean属性的set方法。因此，你可以让Bean自己提供默认属性值，只有当请求参数明确指定了新值时才修改默认属性值。

### &emsp;4. `<jsp:getProperty>`

jsp:getProperty动作提取指定Bean属性的值，转换成字符串，然后输出。语法<span style="color:aqua">格式：</span>

```jsp
<jsp:useBean id="myName" ... />
...
<jsp:getProperty name="myName" property="someProperty" .../>
```

属性|描述
:--:|:---
name|要检索的Bean属性名称。Bean必须已定义。
property|表示要提取Bean属性的值

```java
//TestBean.java
//放在src目录下
public class TestBean {
   private String message = "No message in Bean";
   public String getMessage() {
      return(message);
   }
   public void setMessage(String message) {
      this.message = message;
   }
}
```

```jsp
<!--index.jsp-->
<h2>Using JavaBeans in JSP</h2>
<jsp:useBean id="test" class="TestBean" />
<jsp:setProperty name="test" property="message" value="Bean Message" />
<p>Get message</p>
<jsp:getProperty name="test" property="message" />
```

结果发现报错了，找不到路径：

![找不到路径][error1]

这是为什么？明明在idea中标识时它并没有报错？尝试将它放在Bean包中，在TestBean.java最上面加上package Bean，并将他移动到src下新建的Bean文件夹中，再修改index.jsp：

```jsp
<!--index.jsp-->
...
<jsp:useBean id="test" class="Bean.TestBean" />
...
```

![测试8][test8]

成功！证明这些bean就必须放在一个包中而不能成为单独的文件。这是为什么？我参考了一些文档得出结论：

<span style="color:red">警告：</span>

1. Javabean一定要放在命名包里，不能放在默认包里，也就是在bean文件的开头要`package 包名;`了，如果不放在命名包里而放在了默认包里（就比如我就把这个文件放在src目录下），最后将报如下这样的错误：  
org.apache.jasper.JasperException: Unable to compile class for JSP:An error occurred at line: 18 in the jsp file: /javabean.jsp
TempBean cannot be resolved to a type  
java现在已经不允许命名包里的类调用默认包里的类了，也不允许在命名包里使用import classname(这个是默认包里的类)来引用默认包里的类了，所以才会出现以上问题。拿tomcat来说，它是先将jsp文件转换成java文件，然后再将其编译成class文件来使用，但是tomcat转换成的java文件是定义在一个包里的，这个可以在tomcat的work目录中的java文件中看到，所以如果javabean放在默认包里的话，因为java本身的语言规范定义，jsp生成的java文件就无法使用javabean了，因为引用文件跟默认包其实在一个包中，实际上是没有用到包的。在jsp网页中以各种形式来使用放在默认包里的java类，都可能会引起编译错误，所以在jsp项目中，所有的类应该都放到自己相应的包 里，不要使用默认包。但是这里也有一个比较诡异的问题，虽然按JAVA规范说的是那样，但是如果在jsp网页中使用了默认包的类，只要把它用到的默认包的class文件考到tomcat的work目录中的相应文件夹下，就不会发生上面所说的编译错误而能正常运行，至于原因是什么我也搞不懂，不太清楚 tomcat对类的搜寻机制。反正为了确保不出错误，还是把类放在命名包中，不要使用默认包就好。
2. jsp:setProperty，jsp:getProperty这样的标签的时候，它的 property属性一定要用小写，不管javabean里的属性名的大小写如何，这里一定要写小写，不然就报Cannot find any information on property 'Msg' in a bean of type 'test.TestBean'之类的错误。
3. 有公共无参的构造函数，否则会无法使用
4. 各个属性要有set/get方法。
5. javabean要是一个public类，而不能是私有的

### &emsp;5. `<jsp:forward>`

把请求转到另外的页面。jsp:forward标记只有一个属性page。语法<span style="color:aqua">格式：</span>`<jsp:forward page="相对 URL 地址" />`

属性|描述
:--:|:---
page|page属性包含的是一个相对URL。page的值既可以直接给出，也可以在请求的时候动态计算，可以是一个JSP页面或者一个 Java Servlet

实例（因为我们已经在上面在`<jsp:include>`部分新建过date.jsp，所以就直接使用）:

```jsp
<!--index.jsp-->
<h2>The forward action Example</h2>
<jsp:forward page="date.jsp" />
```

![测试9][test9]

可以看到这个页面直接跳转到date.jsp页面，而不会显示h2元素。

#### &emsp;&emsp;`<jsp:forward>`和`<jsp:include>`的区别

首先他们的url都保持不变，但是最明显的是他们返回的元素是不一样的，前者是A->B->A，将AB的元素都显示出来，而后者是A->B，只会显示B元素。

#### &emsp;&emsp;`<jsp:forward>`和a元素指向jsp的区别

相当于redirect 和 forward 的区别

1. 从地址栏显示来说  
forward是服务器请求资源,服务器直接访问目标地址的URL,把那个URL的响应内容读取过来,然后把这些内容再发给浏览器.浏览器根本不知道服务器发送的内容从哪里来的,所以它的地址栏还是原来的地址。  
redirect是服务端根据逻辑,发送一个状态码,告诉浏览器重新去请求那个地址。所以地址栏显示的是新的URL。  
2. 从数据共享来说  
forward:转发页面和转发到的页面可以共享request里面的数据。  
redirect:不能共享数据。
3. 从传参来说
forward:获取request的参数。
redirect:仅能通过链接获取参数。
4. 从运用地方来说  
forward:一般用于用户登陆的时候,根据角色转发到相应的模块。  
redirect:一般用于用户注销登陆时返回主页面和跳转到其它的网站等。  
5. 从传输范围
forward:只能跳转到该项目其他jsp中，是服务端跳转。
redirect:任意地址，是客户端跳转。
6. 从效率来说  
forward:高。  
redirect:低。  
7. 从代码放置范围来说  
forward:需要注意位置，是因为一旦放置，jsp后面的代码都无法执行。  
redirect:无所谓。

### &emsp;6. `<jsp:plugin>`

根据浏览器的类型，插入通过Java插件 运行Java Applet所必需的OBJECT或EMBED元素。

如果需要的插件不存在，它会下载插件，然后执行Java组件。 Java组件可以是一个applet或一个JavaBean。

plugin动作有多个对应HTML元素的属性用于格式化Java 组件。param元素可用于向Applet 或 Bean 传递参数。

以下是使用plugin 动作元素的典型实例:

```jsp
<jsp:plugin type="applet" codebase="dirname" code="MyApplet.class" width="60" height="80">
   <jsp:param name="fontcolor" value="red" />
   <jsp:param name="background" value="black" />
   <jsp:fallback>
      Unable to initialize Java Plugin
   </jsp:fallback>
</jsp:plugin>
```

如果你有兴趣可以尝试使用applet来测试jsp:plugin动作元素，`<fallback>`元素是一个新元素，在组件出现故障的错误是发送给用户错误信息。

### &emsp;7. `<jsp:element>` 、 `<jsp:attribute>`、 `<jsp:body>`

动态定义XML元素。动态是非常重要的，这就意味着XML元素在编译时是动态生成的而非静态。

`<jsp:element>`定义整个xml元素，套在最外面，name属性定义xml元素的类型，而 `<jsp:attribute>`定义这个元素的属性名，name后接着属性名，而属性值被括在里标签中，`<jsp:body>`和`<jsp:attribute>`是平等的定义元素的XML元素的主题，一般为XML元素包含的内容。

```jsp
<jsp:element name="xmlElement">
<jsp:attribute name="xmlElementAttr">
    属性值
</jsp:attribute>
<jsp:body>
    xml元素主体
</jsp:body>
</jsp:element>
```

会变成

```html
<xmlElement xmlElementAttr="属性值">
    xml元素主体
</xmlElement>
```

### &emsp;8. `<jsp:text>`

允许在JSP页面和文档中使用写入文本的模板，语法<span style="color:aqua">格式：</span>`<jsp:text>Template data</jsp:text>`

以上文本模板不能包含其他元素，只能只能包含文本和EL表达式（注：EL表达式将在后续章节中介绍）。请注意，在XML文件中，不能使用表达式如 ${whatever > 0}，因为>符号是非法的。 你可以使用 ${whatever gt 0}表达式或者嵌入在一个CDATA部分的值。`<jsp:text><![CDATA[<br>]]></jsp:text>`

如果你需要在 XHTML 中声明 DOCTYPE,必须使用到<jsp:text>动作元素，实例如下：

```jsp
<jsp:text><![CDATA[<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "DTD/xhtml1-strict.dtd">]]>
</jsp:text>
<head><title>jsp:text action</title></head>
<body>
    <books>
        <book>
            <jsp:text>  
            Welcome to JSP Programming
            </jsp:text>
        </book>
    </books>
</body>
</html>
```

![实验10][test10]

## 自定义对象

JSP支持九个自动定义的变量，为隐含对象或者叫隐式对象。这九个隐含对象的简介见下表：

对象|描述
:--:|:---
request|HttpServletRequest类的实例
response|HttpServletResponse类的实例
out|PrintWriter类的实例，用于把结果输出至网页上
session|HttpSession类的实例
application|ServletContext类的实例，与应用上下文有关
config|ServletConfig类的实例
pageContext|PageContext类的实例，提供对JSP页面所有对象以及命名空间的访问
page|类似于Java类中的this关键字
Exception|Exception类的对象，代表发生错误的JSP页面中对应的异常对象

我们上边已经使用过了out对象，当时我还觉得很奇怪为什么可以使用out对象而之前又没有定义过，所以现在就给出了解释，这是自动定义的对象，可以直接使用。

### &emsp;1. request对象

request对象是javax.servlet.http.HttpServletRequest 类的实例。每当客户端请求一个JSP页面时，JSP引擎就会制造一个新的request对象来代表这个请求。

request对象提供了一系列方法来获取HTTP头信息，cookies，HTTP方法等等。

### &emsp;2. response对象

response对象是javax.servlet.http.HttpServletResponse类的实例。当服务器创建request对象时会同时创建用于响应这个客户端的response对象。

response对象也定义了处理HTTP头模块的接口。通过这个对象，开发者们可以添加新的cookies，时间戳，HTTP状态码等等。

### &emsp;3. out对象

out对象是 javax.servlet.jsp.JspWriter 类的实例，用来在response对象中写入内容。

最初的JspWriter类对象根据页面是否有缓存来进行不同的实例化操作。可以在page指令中使用buffered='false'属性来轻松关闭缓存。

JspWriter类包含了大部分java.io.PrintWriter类中的方法。不过，JspWriter新增了一些专为处理缓存而设计的方法。还有就是，JspWriter类会抛出IOExceptions异常，而PrintWriter不会。

下表列出了我们将会用来输出boolean，char，int，double，Srtring，object等类型数据的重要方法：

方法|描述
:--:|:---
out.print(dataType dt)|输出Type类型的值
out.println(dataType dt)|输出Type类型的值然后换行
out.flush()|刷新输出流

### &emsp;4. session对象

session对象是 javax.servlet.http.HttpSession 类的实例。和Java Servlets中的session对象有一样的行为。

session对象用来跟踪在各个客户端请求间的会话。

### &emsp;5. application对象

application对象直接包装了servlet的ServletContext类的对象，是javax.servlet.ServletContext 类的实例。

这个对象在JSP页面的整个生命周期中都代表着这个JSP页面。这个对象在JSP页面初始化时被创建，随着jspDestroy()方法的调用而被移除。

通过向application中添加属性，则所有组成您web应用的JSP文件都能访问到这些属性。

### &emsp;6. config对象

config对象是 javax.servlet.ServletConfig 类的实例，直接包装了servlet的ServletConfig类的对象。

这个对象允许开发者访问Servlet或者JSP引擎的初始化参数，比如文件路径等。

以下是config对象的使用方法，不是很重要，所以不常用：`config.getServletName();`

它返回包含在`<servlet-name>`元素中的servlet名字，<span style="color:orange">注意：</span>`<servlet-name>`元素在 WEB-INF\web.xml 文件中定义。

### &emsp;7. pageContext 对象

pageContext对象是javax.servlet.jsp.PageContext 类的实例，用来代表整个JSP页面。

这个对象主要用来访问页面信息，同时过滤掉大部分实现细节。

这个对象存储了request对象和response对象的引用。application对象，config对象，session对象，out对象可以通过访问这个对象的属性来导出。

pageContext对象也包含了传给JSP页面的指令信息，包括缓存信息，ErrorPage URL,页面scope等。

PageContext类定义了一些字段，包括PAGE_SCOPE，REQUEST_SCOPE，SESSION_SCOPE， APPLICATION_SCOPE。它也提供了40余种方法，有一半继承自javax.servlet.jsp.JspContext 类。

其中一个重要的方法就是removeArribute()，它可接受一个或两个参数。比如，pageContext.removeArribute("attrName")移除四个scope中相关属性，但是下面这种方法只移除特定scope中的相关属性：`pageContext.removeAttribute("attrName", PAGE_SCOPE);`

### &emsp;8. page 对象

这个对象就是页面实例的引用。它可以被看做是整个JSP页面的代表。

page 对象就是this对象的同义词。

### &emsp;9. exception 对象

exception 对象包装了从先前页面中抛出的异常信息。它通常被用来产生对出错条件的适当响应。

对于jsp的教程到此为止，其他的使用方法和servlet类似。

[test1]:data:image/png;base64,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

[test2]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPEAAAA1CAMAAACnbP2ZAAAAAXNSR0IArs4c6QAAAFdQTFRF////AACFx///hQAApeP////npVQAKCgoAAAAAABS///H56dSUgAA/+Ol5///AFSlUqfnAIPHhcf+/8eFx4MApZmIvMeQpVSFAIOVhQBSUqelUlRSx+OlBtWmnQAAAsNJREFUaN7tmNl24yAMht10GRqSGYydTGd5/+ccoY3FSXCbM+c0qf4L20UI6xMgnA7fvpqGr0dsMplMJpPJZDKZTCbTZ9Hzy+vTNf7bx4fN8vHmiCc3rs3H7RGf1MeIb1lG/L+JZxfw7l3EKwgb9rsf3/Ud3oX9Djtw0yTdskeKF5pT0DPdsBGsY7uPYSyX4VribFXvZPHuYUPRbB+hER9Te+rOA6RYxm5WJpfJYChUcmmIf4MpEx+dcHonj/D2Q3p8fZrpxsGDcKTMNNWNDXG2Zm8am4khD2FQ4iN2GiU/zr31iDmxE4wCLprClriYKLDTRKIloDMFAs1w/UO3EWOIA0eYX8ath9PE2Vp4J5jI0fBwAp/aPQZEV0hTb+V7HGCG3vsd9cV7Q6wzgsT0dl2YEmqgaY2ydCbZIGPdsd6uLbFYC29JWopmpu7FdFNuKEGDUlyqBhAbXjzPBb603ceL8iGh4WLKobIV3WfHknzpui2Zl6uarIW3vAsGP3Bv3cfUNRLCuuqWptfT4gi5pUuMvWQfv4sY60Vm1iXQWE8Sq2NFnMLngNcQQ46fX0qudXOMxFT3yuVYE8dz31w+I0uoRaxoLbyLOT7yNr2GGHD/YpqbfYx/TO4isc9b+gSxL+pde+J65eG6oMeGWAvvgnjjCXlBLHVlcv0z22N5HYpajYcNVeweMRaBM6uaqv6w/VWXuJ+bQesMH6NU7LA2q7XwLolh7lNiFsTQzmWgTwxDy4KgjTPqpwWcwxeJ6ch8O7Oq+Wx1i6JencfSUJ2qtXdFTMhLYo4+rvkumxUIq0XMXzChV7nwi+fcPuYocgTUB9MU6lWW81JY1bsmxrW4JKZkxTVfonfyfd4Wwov7eLyj/zrMfZr97rp/THya32C4UmfXo/HtnrrhX536q6ZHHO5mB7s1R5PJZDKZTCaTyWQymUyif0XkPvc9K26+AAAAAElFTkSuQmCC

[test3]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAAAuCAMAAABAghGUAAAAAXNSR0IArs4c6QAAAGBQTFRF///////HAACFUgAAx///AFSl5///AAAAUqfn56dS/+OlhQAApVQA///nAABSx4MApeP/AIPHhcf//8eFeGeghQBjUlRSkI9SUlQA/8fH1//npaeFAIOFx+OlpYMAx8fncR7/lgAABEdJREFUaN7tmet22jAMgKGlJW4BNwmlW7vL+7/lbN0s3wh07JztTPpBE1+lz7Isp6uViYmJiYmJiYmJiYmJiYmJiYnJPyRuO3yi1353ePmfmbF0KPShngN3LdSn+6DBkJ65tw/Fd5v0PBb9dL0ufnjkQUGybk512O+UeeFFRoPnoTSKS9bPXV6/DbVhTheqP0eZtAAU9DyR7sUzNGHR9XlpF2qEpdSeFTkaDfSkrvkaSuMZKvvWo2tkql68/f0VUM+67n4XFQiGTPzrQOUZcHlABL/B7iGzMtVr5z3mBik9w4p9e06vkWOC+voC0Ef+RVVWVWOEuz/+Gaj9bldC/UmMRp4vWBXs+bqRrmtEMWcAVX2mVW7QrCwIW3+toLrDW2ne0/0o08yZq3Jj1G05oIkOsPdU4NhOaCQ8R2U81bowsKeZ850A7++7tIvQz3g3QbAaoa509GgDE1L2QBG9t9amLsugllFKQX26H9A8n9CqlcWuvI7SeK4i+1moHKNgVgorpzgQVaQpkmauCD74fvgSDaUhQg+BmopqqFFnHlhxgSLeML72Eu16DaiuCrncPDIroaJWDaipcRgwWnFmd2sdghPFEQPBkX8jjQj1dUOHH7nFnNw5vq+Pyk8n6AxQj4/wPIk74dbJzlylRpiddVFcwGKG2YDqq8E01PVzYX2CGsfS0Q1ch3YfuU7aA6mxP3xccVCx78Bf9vr2zpCzvHQTaq7VgR75YkDgqrRA58ZpEwtPizs1/Y7ru1CrDqIx6FJBhdHEr8SK1DjGL/Sb4RKoPAEAcGKFSiNGslYtv8uWjAOYxDkO0lTgOcmpNo/noJN7athog/bQ+BdDyLjS9QiERi1jRxMqNirPYdqgmDQ9/ODOqjFvs/l8ACihgh96DZWD7UiVevmjiaI4a4wMOVFchirrXsRUx0N3YqprbkIFda78iWagP67O8OWIfXjfyWGTGvPhXy/XsqdqqDTOTIs4lgeqF9MyqBQDXAa1mY3ow4NP/yEzWU7/bOZOvpegNrIFAbRtL7C6pUiUyhp7hnqRp2Yx1bEVcCST22BOdPe9DImiCC8jBEjSySuorpmOaFRebXflZqRbPwNtQ22k4AtQ9TKIC2SNaX0XMqv69B/A//FqAVDxloPDuO0pzbvGA14K3JauRQA1Fvut2jQUsuDy0obDN6qgUuaWfKOaLrgnJ5QNV863rWrgKI2GvHria1V9ERI+01V56qhW54QJTcw9P7AitNIZS56nQm5PeSo+371RKgitZvnQoPJUp78/eHlidXSCOzau/tV3lgR1Ma1VeapTSbpPLqwOJCfX1Mak/bju1fcJvCrxrMFMdvgsMZzLLxpADzcRfr2QiydnK6h4D2q6ouXQ6u9Gy1Bbh0kXqr5OqslqqHTXvOnXwoVjz+Rzn2BHg3BjwePH5Mb/KRgMw82hGlMTExMTExMTExMTExMTk79efgE8K0a2CJQkdgAAAABJRU5ErkJggg==

[test4]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAArCAMAAAA36JSjAAAAAXNSR0IArs4c6QAAADxQTFRF////UgAA/+OlhQAA56dSpeP/AABSAAAA5///AFSl///npVQA///HAACFx///hcf/x4MAUqfn/8eFAIPHxnWRSwAAANRJREFUSMftlNsOAiEMRLkpCiiw/P+/CiIRpAnNqokmnSeyoYdhaJcxEolE+gkZez59keikHnQ8lK+Ct9V+j6oHqEr3HyNmh75gL1ck0ckFUel4PxhtckU0tq43nRakTU+KENHJel3BsT3RewzzKamR8ETBgcg7j40EpgNKQX0BENEejU1h3vpOjrlWcI9664hMMfdEmJLs+zFUVMD1Y417HhtoZlCXbhlN7zjMdeh+GssmbyAnx4IxhzIMmKmut3kaedTkAR7GBy/1UpVJiZFIpP/TDXnwCaRIa0lBAAAAAElFTkSuQmCC

[test5]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPUAAAAvCAMAAAAMynweAAAAAXNSR0IArs4c6QAAAGBQTFRF////5///AABSpeP////HhQAAAFSlAAAAAIPH/8eFx4MAUqfn56dSAACFx///UgAA/+OlpVQA///nhcf/UlRSAIOVhQBsUlQAx+OlhYPHpaeFx8eFx6dSUqfHhVSlpcelDwoxrwAAAupJREFUaN7tmIlu2zAMhtPEriXZrZ3Y7e71/d9y4k9SR44Bc1IgQ0igjSNZJD/xkNrNxsTExMTExMTExMTExOQeZOj6v84f9tvd53rgO3frN4dO5YLzRn2T1JnvgJpkGp+fVmf4P0ow6nuhRsILZtPG55mp8fzySl73daZKXXuZz+ZDLppAWudUT2JNzKoB+nLYx2mXF+EFZvGswWstNu3Lq0/OYmG/jhps6v404nkhvTIRxz17QjZLasZxBXVIvUIU0cKKmldGf+n7NLr0Jn3PFpl6GqErsKoZHvzoNEby9rKGOjpAVqIKp7/JDFG/v2K6z6Htyx7etDTafMvU5HpSxFhYUmY4ojyNCxml3IkGZjEjORVIAVELNO+5JzejWhoK9Cw7N3RrqKeRA4hPCWpKaU01TsiQOr5Q5+zmN/EdOlQRf5bUiK/ffoxxKMBkr8OYkryPZiPiDFtsJsAkhrDf6viwhnpIRRI1aeHqoJcUhiNchXWGl9xSYFCsnLwzJTVGwnPTug39aPpSnqQDFZvxtudVWiuU4rLRMO+Tj1dQYy9DSa0F72SyOHUl5cmhuptpqFQRB6rq4VFV0/YUZ89ZfYFaW8EZanHnBtQAKam54FIzdZpp9d0sZOxz1Kexphh5CtV2N3CNzufOS7RGd3zE3oy6qmupEfQWSWgeishfR3fuRpqLvaS+XNc0/zOamsZfe+5GxSGQ+bDNmOKmeUqde9BVPRy9lVTQOdhL59AWOXRLcXvlbvb7qfKppM49fK6bI1z+AiNvrZw/YHvfaVc+7GdWxj5F0zAxuJpaTITuqvPaFTf0JVXc9ruyFIHQHn5yXifqVI29as2rh062gjPA578IdJFQCzYuI9pVM7UuXFbezdItKl235KQiX7Rsqnhxhvti3TE1+1rc0zK11JTXjpCugOUiVsa5ly+PFTU2KTv4GXJ8OD/K/xnc40HL5fDBAt3d9k/P/4X68aBNTExMTExMTExMTNbKHyWCMOZMuduhAAAAAElFTkSuQmCC

[test6]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAACaCAMAAAD8QrT9AAAAAXNSR0IArs4c6QAAAHJQTFRF////2f//7f///+2vteP////R/+OPm80y2dcyp93tm9fRxdEy7d1sm9Gvm82P///ttc0yKCgoxe3/p80ym85src6PqNOvtc5sp81szdZs4f/t1/zRqtzR2emhwevtxeKv7f/R7e2v7eOPp9Fsm9ePtdcyR2KsNAAABoVJREFUaN7tmu124jgMhl1wHNtxCAsBlra03dnd+7/F1Zcdh5Y2Tpkze+bEP1po4YmQZL2Sg/rjZy61rGUta1m/ehmPP9f7enOp67p/3de4/BzS5kF1Db03IMMp1Z2ftvAI/gEraPrpZtq5eegaeK/RKrQrMBh+u+oAZKsTvWv0bPr6QFYSXVlv2lW1rXk5psdXzKLvdU4/78Lxynbr1Ww6ONxFuul3qjo8HS4USQ+Rrfsd/PzbzaYrU9eaowpwZcHvlyN8jvUz22691dbNpiPfsWfwIkjfSxICHV4CXpqFN4xUwQu9ez279fGvwfZqqzEG1YzIYjYiBH+HeCFnyOFkuyWn2TkZCdvIk1vYCYlu9ZptNzVjrb5bIQjH4yrZru5NX9ayPl24E1GGMPsoDakySMmFjbAhJfGWK7LsiCI6lWAoKOs/sYaRWOkw5DvtLDWr0FAVkV1DdPgDlQVgSWlhenXazaTLB470IOVY5InpodQrg2f4nUSnH2ZzvrKdxHd2VJ3Qu8bTAyhl3GeQxkJ5rvuTnkdHR0AwKWc8pkq7wkLJZZ9sr7bPp5dzsedjsKqtZ6dgP/N6XNloO9OthxeWtwbpHSHRkffY6Nx2CCmaURxZzEbkVFuX099Ou4G+R7chvSvyDWgTWYNO0Cqnn9uVeCYm1Kx8v+EuQCXbxwFa1rJ+wxWHGYtyRxvrueGCv3kooTjFWuGxHMhghtuImz2puiJ7pepHdNRSFFYsNlBWHBU3Eo3YgDO2eL8iXWo8lzK4DI9SbLt8GJtmnxl0d0WHmeD0Othu+RrlgyV7hn0tdBJxiwPIMGST7QbUz5XT0TgX6TQRoHd4vOEyifSuOZ5eyswXrYdKjwqxlbHPwDPTXtkeWtCUFKMSOgtrDEB3uBweYHga2Q7agjljSvJ9sMXiBO8GuY0Zz7ZTWCkjS04kAjoElRvJOR10O9oObtN0rFKW7+xtaX61GtEvmPVXBzP3Ur/14ZwayPvTl7Ws/9+ysSyXT5IDI+lDrCcipoZH1XjqSQ8volb9roBebfESdMBGCivtNle4qNQisWUl2Mo5oTxDete0K1TWD+lFFZjoYUzHv0GdDc/xSJWUS+hlJ59kewqb2O6pkD19YHuaTwqiGqRHYrrFjwINABTkJp0HS4BtTYNyWc5g2umYM+Qd8BbSdcpNst30r4engjocDwmAH7syysAeZfQl2c50EF/QxILARjplSqJ3aGEVG4xkO7wYB9zJkeUIpusk2xXN1o+57T3NrUifnPOU6iRu1J2O6KZ9HGwP9eYRh2EazoOfZLjs6Xg4PqZb3yW6ddej//cOzE6ve91lnrk3/bjqsqjelf7lociylvVRfhxj2Z95j5LuNMn75cZWUmWoaz+y3cQN9+aSJk09kc6yjabyxXgIhMmBi22aU2NxnFyDzaisC71r4A9Y4G7QJ5dgQ2NuaofEUaBMMFmujz/qOlduoU7vOpiemoIYhn4XsDB+bPt0cSKcSSGKniERveH3THGm5UyIHR095c+CE6zZRHkCP+1F0uGBn3iqKq6QO+eSkdJbMt0Nrmbbbdu052mNq6nTsF23q+EpuKMZ2x7p0ARaPwyf0+iKh974tDuD8imU1mvbQd3xP5Mia4YtZ3I6s8J7Or4Kfk8LbRhswGb1io7CnXum3/+z9XKVCU089Rksn+u9V1f0rnHdYDtFhs+GfN5n3e44YncarRvToeMd6GQsD/Mc3ePqOwXYejBv5JnMZ98fy9qzVl0e1XvSP/tUi7Qu65esdO+NjlndnemhfdtmdwzkC00u5FL++WFqGlhrHrSzu++ml6OIod6muj7pMJ7pJt3Rj3UFSxYW0Fv0afWd6GC5lqpHjRJ/s4ZKcrXNWho90OM3tSbQs7rLdPjz5gHmxkqOIt7bHiadAAndX9HlV9jcoGft2xTPuGvbqW+lA6aQzqskKG6sMl9GFTshndH5cmgg0tlcPpoR20HMnid0TJKR8e5zyhmSz/oWfb1vm+cJzol0ykqf6Ny//8v0/CSP6bZ/adyEjonSLkpOraPfpV9qV/i9iHe2g9dREb9uOrJ0kW47a7KADoR3dHwN0r/cUbyPjOTJyHY53IO8H3mm3/enWtT80y1FPs4KAft9TMd2L7Pd0jcaXboN9kk3GdvquN+1ekd/g8000Lno0NkP07/VMUFHQ9/O/OD0d94Xaq7oF6dGnrkn/dMe1KllLWtZy1rWspb1c9d/IyBtMmMZ0OUAAAAASUVORK5CYII=

[test7]:data:image/png;base64,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

[error1]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAOSCAMAAACiLT13AAABF1BMVEX///8uLi9jZGnl//8gICQAAAAoKCg0NjpSXHb/uQCHyfv//+rxsgIkqeD2/v//5aDw8/TaoAnoqVCwXHdTpuL5yIvX8/9mSwT74XP21bgtgv//+N+adRhRX7P/7Mz//vfHgwO44f+m4//asnYAVKU6J5vH///atCThY0SNkJH//8eLMTMDg8il0vSlVAFjxLO0QTNGXFFTvunl4t78Pg/MAgOFAAACAoXM7v54iQnMkSd7WiH/phuxjiNYEhLweBZ6f4FAlv/Gx8ZVQyqvr7I8P0HOuZk5jMxZXsstYA6Lw1gtKhoDA1F1sPpPZpObgFdSAFLx0Vn1sCm1shqwnZKFAFv/sQbylINtraNxdGApOFKMU4sQDQktW3VHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAyLTE4VDE4OjIwOjUxKzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wMi0xOFQxODoyMjoxOCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wMi0xOFQxODoyMjoxOCswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjIiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDphODY1NmI1Ni1kZDNiLWQ4NGEtODQwNy0yYWY2OWY2NThhYjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6YTg2NTZiNTYtZGQzYi1kODRhLTg0MDctMmFmNjlmNjU4YWI1IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YTg2NTZiNTYtZGQzYi1kODRhLTg0MDctMmFmNjlmNjU4YWI1Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphODY1NmI1Ni1kZDNiLWQ4NGEtODQwNy0yYWY2OWY2NThhYjUiIHN0RXZ0OndoZW49IjIwMjAtMDItMThUMTg6MjA6NTErMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6G8h0fAACJWUlEQVR4nO39+3Mcx33/+7+IRUNLLAmAIJcUCIngRZRC6GbLtqQoicw4OYzijz6f46okVan6/H3fqs+3TpyTSinnOLLLpTifWHIcy4lEQxYlEgQp8II7QC64RAPg+WFuPZfdnV3sAAvw+SgL2J3p6X73DLzN7unpPTQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDeOBS9LO9dFAAAPBXq4au+PYwCAICnFg0wAAB7gAYYAIA9QAMMAMAeoAEGAGAP0AADALAHaID3TnWoXq+XKnsdBgBgL5Sil/3V/tXNzfGRB5JU7V/d3Nyc+M5XdjNmfDH+fvNU3x+Faca3XnrrWjz/K33rfbXNzfGtl176uqRuO6KaE8rEg6jE8a03x78JUk0u1TY3x88mY2ud6ela10N2VLZq0kC/dbf9aGu9r7a5OWjefD1ftO2ZvL2ZOmEAgN2zGb7q72a2M/rNb8Z+8ONow5Xpj9aCPZron9XFzyVdmM08utm+/I54Jc7o5+PvfyBJVz6fXpCkmZnfjN0f2GHukjT5qaSx5S7klFLt/1/eizX9XOP1Qpt/AMCe6voQ9N2fb4Svr3z++Vq0Z6bbRWU5shGWOPtxRdKVz6ej2I7vRgid+/7jaefdyl6FAQDYBd2/BzxwLnz5s+km6QpRfcFp8WcHJH2z6Oxef3+3A2rHlWtzex0CAGC3tBiC/sgYSZd/uiVVyjVJ98uS38/0hkj99q1Srl0ZvPmJpJmx4ODq+CeSKn+08cmVr/rvF9a4nAlynpUeTUnS2EvX+6clrVVqV+bWJI3/4cYvl7ek2r/lyO+hypOfShqv13a3QfzlhiSdefPvB64M/m5mrVXyjrknDACwR9xJWJWtmjTS90DyJwhp1Julc/bGk/hsoYGtx9LQpo3tvf771459I2k0uHX55r8+kXTm6je6vrL0eOTxyPO35yRpeXNz81TfOwPrfSVvftaRFWnS3XdiwZ8Ndvkru7l5qs9KV/o2n9Q2N8fL3w4nV/lxDDu3SiduSzpz9+764clvJHv6wfP/+kSaGPjN9Y1X70oa/uEXec5K9a6C+k3e3tzcrL7bt7m6OX72jes6opuS9HBzc/OZQSv9aHWjtrk5Xv7eVyV/6tozgyPDG7Vqv2qbm6f/aGzlSW288qfXJH0/XuPUJKwXbkoaf/S7kq7/funPBpb7raTquDen7J1E/kcebm5uVuuSdHren1AVS6uxhc3N8ZE/7HtYi+aSVe8qdsLcgI86r+tRZt5ktmp8JwCgMwVNwvpwLGOjffsTSdJDMzvsbv/NRjQ/q/XsqCP/tOWnnj3TONWVOUl6NCDNj0jSuv6jsiZtPpR0srQlrfwkRzXSTs99Lmlm5l4lMS/qyuf/KwyrFux7/T+i3uvn05JmtPj+BzlrPHvlZwOS9KFUk65Mz9z2Dvlw/A8/iOU/tCb1VWpS9aGkykp22gn/vDXlBuy/vvKzVT+zn0+8+4ushACAHUndA565Xq/X6/XbnYy+VmuSFPbofndckm5Nl995f6PRIZ6755rv1/eXG7cjt+r1+qnj725I+u0NSRNDkmS8H2fWJJVqQTQnRloUlO033r8hvLvKDneG163KX3kvaj+PWqlb/v7av/9V/MisGt8akqQPn3/5nWDnlenPE3PKwvwPT0rqH5H0qC7p+HJm2pmfZ5y3W3XPSaUDDl7/rD/cNvPhuxkJAQA708Ue8JXBn89J0mDwhM78xTlJmtHPpfKbPxvQVDl81GhRR/SdY5ufXBn81bQkuxHbN5TM+9qWpDNvfnBl/bPMfxnMaDbq9RWor/JQbwSPIW3VfrYuTWy89MmPbn4i3fqkyYGLP5EUr3GqC3y4z3uCakaaOHHuA/l3hcdGpn/0q2lpthpL/Zn8++1jn0syA83Stu37P1uXNPbS0PTMmvS7ZMcfALBj3WqAazX9o/dqfCXceHoq7H+tfFj5y3gD+VC/k/ShqifnpK1jTT/iva61+UAf6sr0anaa2Y8rtZd/Kmmh7Gy14Y+4yz9Ndg2bPXZb+aONoenPJa24eav6eF3aWP5E/3BkaE1a9zd/59jmJ1o+IkkTF7aHfta/Jp3or7Ws8XzfUNDDnJn5zZlv//OVuU+kM98s6x8u39qSDj9w8//+z7akvkqtWpE0vtIsbavRDC/DqvP6X7fk5Xbl4Zo0O1ZzE7bIDQCQR1fvAUtSxemI/sufr0a9wtqvxxOzbq8MfnV9W7dzZPrtuTlJmy8P3/3yw4aJwmai+4Z+Ia/ZPNHvlvFoQ9JdSapL/qi3VLn5uzDFk19KV+Y+kWYuSC1rvP39/yf6Z8GtrcrGryXdUl36iSRtVdz8nzkzLfWP1B5NSdqupdLWJGli5XdqyQ3Ye31l7hNJZkD6cHJaktlIJQQA7EyqAZ7on5Wk6uPOHsGJDwT/i/725lTYqzvzV84iWdEqWTl8eFHyxmb18rlYR/o75/5+4MrgrxbXJPX91S+OJxtJE/4owJlP86QKp6a1rvFP/9v0/XqQZrb6H5Um6T+cnJZmxrS+Lk30LzdNGxc8htT4Cv/2saQJSdKtoTVp61jevAEAOXW1Bzyx+fLPEjdi/0G63L/81ZoU3Af1XZn+vI2cV94OutK/+c2VcFKuHup3vxvQh8Fcsp8Mth9zbvNZU7xzOeL9ylPjD6UrX41d9Rrhw+tN054sbUl9f3X9E2nzj3/cNCkAoOd0qwGulGvSff0i4+GaTzLbHm/Vie8cm9Vijr72/Ldfvb3iv/6399OzrQa9SbvzY5JmqlJ489frwFVqUvz+sLfCiGtRnYlWhW5Rj5w1/lDTqpajFOGyGVpU7B8YH03ckPrv/lrSxo/TaQEAPa3IryM8Un7Xf/zow7upec1n1iSd+e3/nn7Y4Oj40tEfflW//Oc/GJGk2m+DjZeDAq6MrUnSe15n8/CGVL0vSYP6bk3+0zq/2JI08l7Htclwa0jh/dHWWtb44vFgpcz5U5Kk79QU3vnNsDYkzXy6JVW+3zJte759XsEF8J7jYuIVAHRbod8HvP3h8y//8Tnpyh8vrylq/aKblTbVYXZuZNbfv/KjFW9SUvVb727ok//9y3cTT88++PDwO+d05Uefz0jS9o91d0jSrVNvV/vnJFVWNHBG0kz9/StHHvtJuui7NUmH/Jiq38pzozRdY8fs35Xe+eO3pR9dnJEkO/U9SbP+Jbpy8WQi+eGyvK9sOP73Uou07fnwM0myG9KV5ZZRAwA60fVZ0HEzM5KCB5Re/rGuS9JAOIbc9/4H1f7gsSJn3xFJmv27KJ8bc5W37k5feXJLweQgX+3nYfaVP/pA78x9IunuXW/L0P2BD48MrUVZVQZzdOWObKx9Kkmz7pCu49bQmrT27s8G9NHk59LMxLGR6SuDv5u5necmcazGabWfS9L/CupTHVqT5sf+6O8HfvS7j9aSS4D5z1l705Xnm6eNVSB40fi7H//kZ1vSrbGXhqYXJY2z+CQAdF3BDbBr7GcD3r3a2b+TxkdLW9Ls3znP5ET76neHUlN6o5Z243Z2f+yPPpC89tZX+aMPpHfcb0Qc6sbXD3z3p5JqH6peKZ97OC3N6G7wb4CmTqZq3NRE/wd6zn4u6e7fqf6/spL4p6myIqlV2vb8yzP9a9E/ZF7+RfPUAID2FTkE/R131YqJsfsD0jth9/W3z/i3hSeC28PRvvDlxA+cL4vwjf0gs/2teJOjHw6Ed5vH//IDSR++Gg1bj91vrwLZPnomLOLDV19N3dxufdxEg2Ouu9sr35uVPjzXNP93JiVJQzWpZdo2bX8/zGziCu0vAHRfkT3gf9HfznlP1EysvrH9yYCkD69cH9hekyaevPfjgZNzks4MPvK7qO6+K7q9ookTzz32ds1f8Z6PnVi9sD4d3cb96L8NfnV9e83L328lHlYnbm+vaWL1je0P/Gzfujm15q3u2J1bmdsDJ+tr0sRmXR/KK04Tq2+MtloKcztZ4+T+y351NHHi3N9/IMnN/8K5v0+G/6H3zyd/XL152nb9NDqPtL8AUIBD0cty41QAAKALokk1hc6CBgAA2WiAAQDYAzTAAADsARpgAAD2AA0wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgKfJoehlee+iAADgqVDf6wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANhXDkUvyzmS80XCAAB0Q99eBwAAwNOIBhgAgD1Qil7250i+KUkafutOyVe2kkbHV58Mn6w90dnn5qTKpQe2ar3d51efaPJyfbly6YEtJH4AAPYlp9W1W/6LC7Otjpre9tOenZOkJX13+b40/PrS1SDFxPSWpNHylrT+25nuxQsAwIEQm4RVfTxXKdeaJfcmYQ0P3Qkb4HVVV5wEbyxvzEp/Uf5PrwE+fTW2e3ihK0EDALDfdXYP+Fyf8cxK0sS2DQwu6ebAJfPBv0jD7xrzzromzw1bawcuGWutpf0FAEBSdgN8sX5qXNWh+vE/Hqi/PFCvH5M0Wa97LyRJ00GTOy5JOvKu3x6/9Z0ol9VfWPvBDU39O60uAABJsUlYla3aQL/VRv9cud73+PHJma3HfU8q/YsTDy7+15nHfz69Vn0oSSoPjy56x6wMXNpaWCo/Wtvc3t7ePtr34KtFDYz+8eNL/3nIm4S1/eJSqVQqbS1sl0qlUml0fQ/qCABAz8nqAT88rr7K2FplRVK5dris+uUpGX10Jki9eXja7/KajcOjCoek10clqfrFf9z47cTRl6y1I+WVz6yL3jAAAFKDZ4+OTfd/5z91fO6IJM2PSbNbui5NB/trn0VpfyVp9Rf+xKxfSZULX1/6ekt69tL6jcrY1wWHDwDA/pTZAJ8szaxuy8S2XZiVtBi8Gz556FrwU6MPJK2v9/VJMrXPKpKkL++d1uD6Y6ly4YvgqJeuCgAAqMEs6I8mtbI2vuK9qdZUGi8punlbec2Y9ZvTxv95QnrJWjv47La1A5eiTB73ffuPvMeFjT/+fLS4agAAsL9kP4Z0d0ja9h8Irs5NmI8mNTAuTR6XpNpn1h59yVprB8+ea3xbt3b36lVW4AAAIFN2A3y4rIlBSdL1+qcT/bP66sTy9Xr902D/6DtZs5mrZuPwc8Gbo6+dP7f5l+e7HC4AAAdD7B7wvMpbNUl6+afa9J44ujCr+5L0UGUF94CHX1/6wD1saSk4XL+Szs4efu6aZvT1ujR4YvCqZP27yQ8KrAcAAPtK9jcwzG2pvJi5R/ImPXsvVp2Nweub+pU0L1lJU5Ik43eXR3cWKgAAB0dmA1z9RpWVbpUQPbMU9JQBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL3oUPSy3DRhveBAAAB4mvTtdQAAADyNaIABANgDpejliJ59IEljCxMPgm3V/tXTNUnS5o6KmTy3bHeUQU+aPPd4PV/K0dcqiwUU3xMndfgvN5Y7PrhH6gAAu8/tAdeujx8ZGJckjZ2UJuv1+u053arX6/XxQgofff98/sRnjcmZfNQYY4wZzJXrC6Ume6v5MmmagzHmlcb7R80LJWn4R4maVY0xuerrJTQn8sTSvK7dVXktu7B2YmjrzwMA9pv+6OXD04/rL3yydmFb60PTujArjfk9m4ufF1P40gdtJL6pat6kE9Nbklr0rCaP3FiQbjZNM98qk1bOvjJ1Q5W+Zs34zDPxXvToxeVr0hvL16Q8p+eN5WuSFlrF0T+91aKu3VX7LHt7OzG09ecBAPuN0wBPflleW3zj/sS0dMrUZyXd9fcU1P4efNVXpm5Itc+azDCfqJent3YxJABAb3AGBE/cPTHyYP7R7aMrp24+slL17thmf39/f3//pbnRB9494Mlzc6Xzq0+G//J09duby6ObpR+unpuTpMqlpVLpe5XFyXMnJuZKo+sa3SyVSmXr7SiPDMxdWiqNrktVWypNzkmSztZ+uLnhH6eqLZW+V3kyrs3S9yqLqlxaKv1wc9kvyAuw8tx8o+ST5+ZK36ssesnrh1eeSKrayTlNnjs254Vgwyyfe+5OqTxw4vPHpe9Vjp5YfVK1pdLouob/8nR1rlS2Gn6r5nVKRzdLZetXZPS1yqIql6onzs2VSudXn0hSdWB5vWpLpdLous4+t7lZOr/6RJPn5kqvv72xLKly5u7NJ5Kkw8fr9SD00c1S6fzq4KWlUml0/fDh5Ytztnzu/rJGN0ulsq2u3V0pjR46Vl8MQiiVrUbHV59o9LXKZhBj5dJS6XTljq14CSfPPVdZ1NmXKoujm6XS5JxGN0ul0fXgaowurB4qlcdPrD7xL+DkuWXvelQuHfXq4hRVsudXL0W10KRf5VH/bAfvNXlurvTDzUfnDkcx/XAzOOT86hOvphPPDdaCM6azJ1aPjZdseI1PV+5YP9jRzdH16Nx7fx7L3nXe9K4Zd4sBHCTOPeCv/o9v7MV6vT6t6/V6qSLpbt0T9oCHT9ywdvNcSUu1lQ9ujL7zvL0x4e+aPWcHHm2XpPKKHZwclIy1R39wvnJhfdsO/on0g4d25O3zqp4/Zwf6vJuiNwf7w+Oqbz1vbWlTM33W3t8uVS7csfZXk+e9gpx4s5NPHrlq7VfHXvSTz/QZY15YGvlyUOtLX/ghRFne/Dc78oNTm98etr+6Jmn0reftxfMnpKXaij366otRYUsXv62gIs8++UbqP7+ui9v24uilKNGwtSOrg9KXffbi6DFNHlm3dsb758pEeWUrFfroxXN2YPnChW1rB78j6eGt0yVJOnvxnB387uD80TfO2QV9Om2MeetFf6MTkhdj5cK2td98LPkJNx8+GVD1lflro+88bwfuvjg6uu3VybsaS+MT23bdvYDB9YiERc2csl+/5NRCYZX9sx28nzyybu2v1qKY/BMsaerfj0p+TfXlnB0YdM7YzCk78GhAYR38YJeOvn2+MrEUjqbfHOxXcJ29a8YtYQAHiTsJ6yMzJ50pl8vl97yO8VjZ82qQonRnWVo+/YxG569p8oVPbmjK68yqtnhNtW+OX5A+v6bVW+e1tC5trd0bPLO9pdV/ln5+Q9W5tcrY59dU+6YStnLBcVvz/dIvb2hiWVp+ZWJwfVmqzq1pdP6aG26D5PfW16WtZ77xk09sW2u/3poff/X/fGV7yw8hynJ7S+u31oIsjz73yQ1NfX3hRY3OX9PWM99o9RfuLVW/IlNzp0s6dnVm6v+3pam5ejhyML8gVb89KL20oKm5kdK9QxvSVr9SgtCHFq+rtthfviet/rMkLb8yIWny5OfXtOo3xtIb56y1v+qPb5SCGAfPrEvVb4cJr01Nf/m3lz65MfnCJzdUW+z/s+0tTc2NhFcjdQH966HaZ197/0aIyp/4QorVIqyyf7aD9/cObUjzC2FMwQkOeDW9ppfWVbsbXXJNfKHaN5UXgzpM+sGWHt/qO3Z4I3bSguucuGYAcAC4DfDkqXF5k55/4n0op3rAQ+Utabzu9chmTw+5B79pTPj00lq9pLPGrH+srd/PuMVNlK1x0kXHbT0zHc44Hr9zb2umz5ivfpuONzv50JfGmPWPk4kHn/w/P78RhBDLsrb2bJDodHldUqna8DkrryKq/cHE5MmVLQ2/a8yss3s0HuhQ7Voqh1jotZm+989ram7V+BOCV/9zUNLs6WclrR2/4B6SuVFS8rRKmh//8dJCcE1m7982UZRr0T8XYhcwJl5UvBZulcfv3AveJ6qaumZeTT0bY6nzG9QhDLY2c/pb8X9vxa6zc80A4ABwG+DlmXW3BzxVLpfLb3gbZhsdH6h+tW7t0eDdkF5689Q5O/iH6YTGWusN/caOW/3FuKz/cT1b9juxNjW5t1Hyl6y11mY8lOs0NW6WlaF00myTQUXWb63NHxrV6PqUtdFTWZXX3nneXvx29rEz9ZGo7xqEPj9w6Z9vv/XizcE/nPGH4pdf+F7eaJqqOx3l56219mvvTe66NhCr8mw5eQpCyWvm11SSNNDkOXI/2C1J/3wvvsu9zvmvGQDsB04DXK1NDLo94LHjF+vHT5ZujeuyPeYlWauXpNmy39AtOZ+WWxNfRG8qQ+XZ015fpvQHE3LMJDtf0XE37UV/+HJg6NlSutMnab6/QXKnj+daXzr69vkghFiWE+Uw9jv1QfljnVmCiqj2zcgztWsaein2r4KJ8s9vxA9wQqnddWofhl77zA4+841Wf2GPeuOyq/+56PUsvVFbR+bGVGUkSdVXvn/6mMbvrEXH+SpD5fBOdPwCNinKPaGxKg8MPRu8X3OGlTNj8msqZZ7fIH0YbGViafzVFxOpouvsXDMAOACcBvhRfWHF6QFfvtU/IP369TPnyitbd70Oz9bpY9KxO48lybthWJ2Vht99RaU/mNBwsODE4Jn18Ttrqkx8rOpcX0mT7wVl1O6uDkqT/7NU9deOCI4bPRGOaVfGbt5Yf7Rdkkb91tpPXFm83iD5s6OXJL2TXM3ile3Ht/pKfgixLO8dGp2peyOaD755+7wmX7gejX0Ov+usaxFURNo6ff+G1+oElZY0Uz8vrTvjrsunn1FlYlM6+/55zV+dPC/p7KBT07OD0sDjS3/zYjSGu3x0U1Nzr76o4TN3ttzB8GjjH0yo6ozcV58sqdLvFDt57pOfXX37/NTc2+elv978+gfnpeG/CK5GOLQcu4CSs2BGWFS8FlVzIqxycLaD91vPDEjD/z3IKjzBZ/0uq1fT5yRp8oXr1yqvvRVrXYM6TAXBPnN4Y/DJQOwSOtdZ9w6NCgAODqcBPrN2vOa//I+KNLu18UTS1NzSyu1XK15PbnXhvDH9wXOr84N95pQ/FDl/9bapXpUka8xbUzemplfNn578Q039brDPfPWLsJD5we8a89X/HXbJguO2Jo1Z//CGZvrMxvZV1T7b7DNmNGooht81pn96q0Hyqd/1GWPWgr7oTJ8xxlxa+eRGbeb0JT+EMMul28ZcXL5Wmxk1b70oaelXt81XNxotZRFURFq9NfFYevxoOqy0pNrMqDHDzhD06hfW/OnJoLt385e3jTFH1p2a1qwxb83/5tfTxvT7feLVW5JufjVt1v9jXfNXb0cLW7kbTx2NSpn6ctJsHPq2/FnQ5m+PLC3r8a3qizd/eduY319b+tVtY/7kq+Bq6PEj715q/ALGBEWlaxFW2T/bwfvVhUFj/uR34alIXjOvptf0pck8v2Ed/GBHH3x+bWr6y9iiXsF19q9Zg2sEAPvcqxorv6oz5edPShorvzp04fmTkqTK8XK54UoSZ+OrIE6+2cbijdXUWoOj7a2W2GZySRnLPjZL+25nS1EOX0yOpO6Ntq5GSrIWbZ3taM3Js01W4mwq+vNo55oBwD7h3Jn7qrysr8pzmldZWtZXmvW/I3irln3saN+CqqcGWi2D2FjDG6+9YmDo2RutU8VMvvxf1yoTdzo/KT1hx7WoDG13uL7XWX+we2K65/88AGAndvIRtzRqdOpXHR9+dvadqXabt101+mDl5zm/7SgypRHzp1P7vP3daS0mj/x2fbrDY2/6vzf7evzPAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADiADkUvy00T1gsOBACAp0nfXgcAAMDTiAYYAIA9UIpe9h/R8ZqO6Hht8na1Lk0uDVpJYwsTzx7qs5uSNHlurlQqH90slUql0uScpOG/3FgOczhbK5VKkyfOzZVKpbKdvLy5OHlurlQqlUqlsq1a79X51ScaPnNiMSuaqi1b5+3oa5UgWeXSAxv8lDQ6vvpEYTaTl+vLCt+OHrIKCivF8pOk4bfulH74zLNLpVKp9MPNIHYvv7DcyrpzROVSdS6WReXSg5FXK4uqDD2/KEnV087Bw2dO9L1ayawdAAChRA/4yMDC2q36p7pbP3n5v2r1iiRpYmq27L3SxPMDl6SXrLX2qCRVJv7ptjHGGHNCkoatPSpNPG8HLklTHx17URPP26Mv2YFL0rwduGSstV+PvlBStsrYK6++6L16zRhjHnw6bYwxr0jqX37sJnzuzpakY8vXgi2TbxqzfnPaGDNYunJemti21tqBS+lCprcH/+u2jLX24uEGcWxNDjrvajMvnE+mmP/95Hnpz4+9+JoxZmWmzxgTHXLmxoupAwAAiOmPXo5Na238yYmNkbnJT8eW5+ZOPy6d+Fya1s+l2QupPt3QPaly4YuJ6S1JZ08tL0haNXogzdw2G18YaX6r7+TMbfPgS++tntleHz556Foyo0h1feHMkiSp9pmqK2ZdGn79P9avSird6+vTS9N+upUvZGTMmY+N9MbyNenOmX+XvMzt+i8u9i83LkQqPUp2i6MIViRp/WMZSW8sLzyQpPV/8t9eG30gSRtfyKz/k04s/P9H+xYkVYentyR7dlaS1m9K+meZ4YVmIQAAnnZOD/juiaEzi7Xo/fza8lfl8okhXSiXy7PetpnbG19I0lljTo2qcuGO3fzui5p885TXF431gKWlBacHrOroF1pdHGgcy+ipvpXN84PyOsArssaY9Y+tMSc0+Wfn/D63JGli2w5c0sSUtXZwSdWNmUsDZ/0e8Fsv6vGjb5pV+aU/G3LfDj/vdsi9nrO1Xs5eXz96678fH7bW2gVpaaEa9IBfKN30kp09Z/29AAA05N4DHtgq17SxVdN8f10aW9g81Wd1/L6+PbRutSlJ1Yu1+otL/UfnVra3Zxd1dG5VK4/ul5YWby5K0sq69OiJ+XjrrTvf2Mqlpe9V+h59WdpYLG0tlOzkqd8fKpU2FssD5ZWByqH0XdLqH858rfmHf76xLHt/27UuPfpCOrW0OVrdXJcq5ZUnA6PV2t0nUrlyqPYnQ3N3j85vHx0/Nr89uyh731bKK08kDYwuJTu75WfWHn05MHq/VCotTcwvS+VnHjzR4cMrTySpUt4Mb0+XK4e+cW7+Pl5a1OGjc5I0srEuqXJp6XuV29vb28dPLW9uLz3R8MnaE5VfuLUe3asGACBbf/xt9bHf5Ez0z57YkDS5OLT2c43VYqm+NJI0Mb0kDb/+sST7wvSW5A3Qrqz0rX8so8OfDS8dmpI0evqqZDXll3DqfnYko29N3aieX772b2/phlS58EWw46WrqoyvSZWRvkd6/ujS1SCKYKbU0Bcv1vqmjdZvykgvXZWkmb4+Sd7Qd8JWvSSZdWnSuQc809cnTUzPzw+Hm1ZXk2F4Nf+LqZU+6eyRq58NLz3/7MfSykpfn/TS1dXSd5evSRdG+48svfZJdi0BAJCUnIR1a2mxcvzE0JnyOX/D5f96clw/KA2Mx5JN/Oh5a4+WX3rTmOq/WWutXe0z5sSStXbwD18a0XA4BnvWGPPgS2PM++clVV4b1LzXfh5907heqbw2+v/ekCTN/+tzJyTJ+EO/RyU9s7l48cX+xRnpZ7/pe6GkmT6z8YUm/8ab6zRyXJoPh4qvSu+c18TFHz0/MlHJmISl7cFj6Y0T29bar7eiDVXziqTaZ26+0kvWDvZLz2r4W+uS9M1vLhlvtpe5Ki3dX5LuPjv91Y2vaX8BAE05PeChOZ158jjW1/3eT5/r39bM659WKt5KWDO39YVR+dcPVXnu63VJX3sd3HlJj177Qqr+25a0bSR5s5CGFzR6+s7p7cMafv3jjS9k9NJ9SXoQn4s1feFOeNN09Rdnn70qWb/z+kCqHNo4svhAZktS7bOzxzQxvVW58PXU7Ov31gee3NiaPC6d9e9SDy9ocvze/Pyw7ZcefJZR5Qd3RzZbnJWzszo1fzXo0wdM0OUu1UfO/O8gXmsUdrVvavTB6BfjR64KAICmnB7w2okhSbXFhbVbdW+6cf8vtzZmJU2dq8UeQ9LysRefWX/sPSz04Ev/MaTaZ+PSTN8rk28+kGSiWUhfPjj7rLT6C+85pMzGqfaZO2np5lXFesC1xWuzS4NnR/29UVP9X1ei53289OOS7n1xQxp4cr1RnTcOnZQ1xnz1KGvv2LQxc36YS9baoy8Fs67WNXRPGrjbv3Ho0no4z9o4zztVTd/gkub7Gj5oBQCAJ7USljsEvfnOdzYkSS99J34TeHWx8u72lmqfWXvxR89ba+34upSaBS1Jr5l3nre/PJm82dya9Uen/U5oZWI2/QDT6j/cSKSflSb/bF1SZWVLks6eSOc88GSuyXPAd89Zuy5J1bdelFR5Liji7InKkNcH3jx8fHtr9BWn3I0vJFXNKbsgqfbZ5l/yIDAAoKnmS1H++ndew/uR/3v2P/12tHT1a69dqvR/cUNSZSjj6GMvbUqf2Q9unH3w499G/dF591ZrA5ULdwaf3fbuJj884W1Yz05a9nMLe8D3vrghjZ4aDVMM/8htDuffXlnJNUV5a/G6pGcOP+eHNKT+R89JW4vXB7/4/YyG7kk6eibqAZ89Ffbub/7rcyc0augIAwAaSTXA4RD05eW12XJFuhs8Ayyp9IzXC62+9fzDt16UNLpx56okTbz0rCStGhMsxCGN9v/q9tyCJN0M5zdZk69VGjw8KmneLky+OXjzyAkNf+eOO0btTcKSJFWCbUEPuHJmXTp70XswuTK0Lg1cnXGOrX6S8xndofKWKq9dDFbbmiivl56Zfc08uDO8YgYvVYbWpbF+598SN53B9dVfLAwfP7eZMdsLAAAp9hzwpZuPT2xtaehJf3//80/66qWBExsLm77Tq5Iq5x8Or3znUf3O5OzXKw9fOLq5efjhuiqXlkpLT76UNNL3cHvk6JOLtcXDLy4NmMrtP3jOXwq6VBotb5a27MPt7aVL5+bsqS8yo6kcqy9KUuXMrdv9pxdLpdLSMwtPVtar71yflcLneiunljcPv7hkRzdLpYu1RVVP3l0eqT/e3t7ePrOxem+5csn8dlE6O3x/q7LwRGV3Zln5mQdPzq4sbJdKpaXfr00+u2QfHiqVNlYPlUql0ui6+k9+5Uf8zp3lsyurNxclmdVSaen0wKNn7t3f3h55oXzv/uDKmYHFSv9v66NLVmdrW2cGFiVNnpuzT277BVUObW006LUDAJ56B+L7gCdf/s2Ns3PrGn2gv5i6kdxbufD1nrSDZ2e9ZToBAEg7EA0wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAODgORS9LHct03rXcgIA4GDq2+sAAAB4GtEAAwCwB2iAAQDYA04DXB2q1+v1ev1Y/qOPDLSTGgAA+OI94PHj5XJ5Oc9xk/VT44UEBADA06B/R0c/VL7mGgAAxGTdA75Yr59UdaheH9eRgXq9Xqpo0hubvmzrL9t6/aQmP9XM9frJIwP1cXk7x6WL9dK3vFcAAKCprAb4q1d1a3xkThdmLy4cu1B+z+jip2fK75XuHpP0+5H3SreOTb2hiQvlOUnSxU/Hj79Xun5MUm2mfE73KrtZAQAA9qN4Azy7WK+fGtfKSV3/XGOzl6e0MauP6t+bktFHZ9Qnaaj20RmtOW3s5Slt1z6a1FpFqmzomE6M7GoNAADYh9KTsO7Pav6NknRmWXNbGpSkuS1dr9eng1RHYscEiWh3AQDIrfFzwFuxkeQL5XK5vFh4OAAAPB0yG+Dqp1vS7IBOlrQuKfzte6gR512wc2GlqBgBADhwMhvgkTldOKe74x9NamBc1aFfT2pgXJo8Lkk6sqhy7dbQjJ/4o0n1VS5Paai2WzEDAHCQPH/S+z32qnSm/F5JulA+MSSpctz7rfH3SpK88ehXJZ05MaQL5fIb/rZXVTlefkMTF/YkfAAA9pH2vo7w8k+3xnKsvMHXEQIA0BxfxgAAwB6gAQYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQqEO7U4yR7egoKf+BRm0lV6dRddN+Py85U5p8+YX1apreyEomXaO89Tx4fyftx7f3NQIg9Xcvq+7/n9rm/eT2UpuWn9174qk/LyZvOuslbpHeGmP9SiW256inkd3z89FAV/9OaGGBp0zeD9qismz92d1RtjvGecmXr4n/aJzOJJOY4GfrgkwvnI9dKG13QwfQib69DqAnGT6+MhV6Xrw+aZ6Om+2Vy8PfCYAdiA1BG0lWxvuEs+l7jcFW6w9whTfighf+b6PEB2m0PUgm2Vg+sXKT8h5nouTGLTBIF22N30d09mc2AJyXBg1jLP5YeU2SR/m1upcdr1/mefc3myg/N+7gorjlqbjzsQt/J7HrnNybVU/r1jNffgD2QDj6Z6JxOpPY7+yO9vsvgqHBcFvWsc4xbj6xjLNCynFceLRJxJU4LvlJ7O5Pxs15aXxesuKPxRQPN3aeMs5j6mWqftFvEz+f6eol65c6voDzsRt/J/H4EucrXc943XLnB2BXZA9B28x/4Yd9KRv/N76x3rZW/4y27v/PbZRP7nLzHmdNNM/GJpI1+6Rp2Q3gvLSMP+N9anvO7laqfm0cm8woe/v++jsJy24UX4t6tp0fgGI1mwWdGmkzif+fJt9H27P56b0fOdK3f1z250yXP1w4L43i8OcmN65/bHvDke1UvooaieaNVN7meV/+neSof658Os4PQHc1a4CT/2xu9T7UYHuY3ip+cIsPgbaOywqqyx8ynJfmWTeqf4t0qceDUvWL9u+8w7YP/05S17mVVknbzQ9AdzWbBW2NMcE9K19078xG723WPTGjrDmi8dtbxvn/v5O20+Oi1DbqObm38Vod1ywCB+clOw7n4VzTLN5AxnlMtgex+jUPLd/meA90f/2dJK9zs9LdtEE9m6WhHQb2QGwlLG9IyvtQkP9/SuNPJ/X2WyMrE83idGeRxn740z2jrK1zvF+Ak0+83Og445bT4ji/EfCTR3EpjMe6NZFbYDx+JWaFcl6yz0sifqdZ8eNyW5lwe5hfxnkMi1XWeZGcUGwYvx+3kZNPWE33oPB9Qeej4L+T5HVOnF+TqKebT3RumuQHoIfEu1eJ7W3m0/Rf4O0d1nb5Oz0uMx/OS+NA2im3Wxeli3r972Sn8XU7PwAdaroWdNTDSGxt79/L2dm0zKfBYe2Xv8PjMnPivDQOZPcyKESv/53s4DpLUmruVffqCwAAAAAAAAAAAGD/O4AzeA5glQAAB82BbKwOZKUA9Jyms6B7R0EPKrb89nY1mqfcfOZoZr5GtugnLrOWsUiVFz4XnD/bhqmD55GzM9y785Tz8OhJ2vD5Y/d5ZgAoUrOlKHfZrq8G0LKjYxu0ENGndTv52pbtUXNNz0+4YEWsxOwFF5NLPu5Yb52n/IyNFsuwu1QmAPSi3R/5S5aYiqDxghdNg83O18jsfOGKpjtzx58zjFbJTOpF65Ca5d+d85SXcX/HTwqD0ACK12wtaDRBbymfnjxPzddwBoBd0dUh6Git3GCpXGWsuROugButwRO8MLE1eZMHusnkLyscX/s4seZtuNhtbH92Out3ghqsMeWWF37nQGf5xs6Pcz5a1yd+HmJLGWdch4bxB+mNYmsRR+VGW00UZnz/vjpP8XzS6Rq8BYB9IxxyNCYc0jOJ/c7uaL//wgS/lThQ8fThkKFJ5pExjmiaxWVi6RoN4SbLC3pQ7eYbDq0m0of1aFUf5/yYxPt4OdkhOPmHe2PnP11P9zTE9ifOV0+dJ6dKmf9lnc/E32vqDwEAuq6YIWib2ZUI+sSy8T5yOAGmRffDuh+MNsqnabm2xf68YuUlv94tZ74mOMwG/4udj5b1seEv475vP/5gm4nmYyXKafqFu83K7YXzFG1NpkqFkwqdphfAbilyFnRqpNIkPt+S76Pt2fz0ydXkG6UP05nkdmsScTWVKk/+8Gqb+bY8HznjaXhck3IT8Wc3gztsfHr1PIXltTpvALCbimyAk8+mtHofarA9TG8VP7hZPiZHryvPfqe8WBw7yLfd+rc8rtHxyfPVKJO2RwcSDWmPn6dW5y3az3PAAHZBkbOgrTEmvFfpie49RtN6vG5JsmtilDVXNXXnMfyodNIGxyV6225g6Q9Y53ZnstzM8jrIN0P8fLSoT4NSW25oGL+x0YiCG2eDOFrp2fNkk6lN9Hfn/w7ni9H0AtgtXV0JyxuC9D7cFHxYWoVTW/35q+E6R+58Wxv/4U93jbK2zvF+AU4+8XLltu7p/cHHbGK/gkOdcqO1JJzyOs1XJhqQdesf5tu8Pu75scFU5PBHMLyaKDcj/vB+amwatXOcsw5VdECsvjY4IvyHVA+dJzeg8Agp9j76C7FRsclKAcC+Fe+uJra3mU/WMQXfz0sVW1R5zTt/O8q2o/jbisP03nlq9PfSbjkAUKhC14KOejaJre31MLKzaT+fNiWLLaq8qBvW3fw7jb/dOHruPDX4ewEAAAAAAAAAAACAg+MAziw6gFUCABw0B7KxOpCVAvDUKHQWdPc0/TL6HWTbejptg/nXzefZZn8/vazzhG0RGmeeePA2dVz29sTh6dJ2XJ/ch4cPGseeG+aBXQD7WJFLUbap0LYpu8AWbIOWJ1xloq18bct2rmj7tz7eI+XBwi7O2hoAsG8VuRRlm5p9otoiPm7TmXZnTLOofDsoOCh/R6evwPrs8Lry3QoA9rEeaoD3l4PWAevJ+oSresei68lQAaBdXR2CjtYKNootIhztD5Ygjq9plFjkKLWUUXzJYgVL6afWBE58kV24OHFsf3Y6L1n2MHiivHBt/87yjZ0f53zsuD5R4kbnscfqE7+uyXycZN47m94EAJCctZ+N8T+l44OVJr472u+/MMFvJQ5UPH2w380nlnEinsZxmVi6jKHV2K4oexM/JGe+RsZ/G08f1qNL9QnPZ7pePVUfJ9TM/9xExkmv6HuPUhcMAPaNYoagbWbPK+gTy8b7yMZ621qNLVr3A9dG+TQtNzl42WnPKVaeTdx8zJmvCb8AL/hf7Hx0qz4mx7nsmfoocV0z3qe/YjgZLwDsQ0XOgk4OOMokPo+T76Pt2fz0wYd7q/RhOpPcnvhC2haf5qny5A/btplvy/PRIp7c9cmbTzyPXa9P8riwvPTfieSNaofFNagxAOwfRTbAyc/IVu9DDbaH6W3i4Gb5mBy9uTz7092wHefbbv1z1yeVj03PYuqF+jQ4Lvk+DNf98uHmJQJA7ytyFrQ1xgS3/nzhzcTwK9Ll98iSvSQTOy52vHtHM/wIdu+VmtSm+Jus7pNzVzFZbmZ5HeSbIX4+ulSf2PnMKLdX6pM6ziZTx1O2el4ZAPaVrq6E5Q1teo2qol5LOGXWnxcbrp8UzpM1wSzZ8Ic/jTbK2jrH+wU4+cTLldu6p/cHzUJiv4JDnXKjz3ynvE7zlYkGet36h/l2qz4yyfJjncdeqY8TUHiEFHsfq3l4gzkciqcDDACZ4t3VxPY288k6puDOUKrYospr3qnsWiE9V59G17XdcgBgXyp0LeiMyT4Ku2c7zab9fNqULLao8ky821qYnqtPg+sKAAAAAAAAAAAAAGilh2cs9XBoAADsTE83cj0dHAAUpNBZ0N2T/S1FO8+29TTdBvOvm8/f3eEDqo1qm11u+His88B1anmNxIPCefJNHd4sQb61oxV7ntgJnMnQAJ4+RS5F2aaCGtlmBbZgs1uGVisyFdahy47HmkQb1rD8Pa5PuDBLEC/NLgD0ht0fiUyWmIogM6RGC4y0kW+nGsVjmiczjXZEG3ehPkE5sd87yRAA9rMi14I+0A5a763YNUBaDnIDwFOnq0PQ4Zq/7rf92th+66z0G62VlFg8KbVEUrTduZcZyydWrhtPtHZwsD87nfU7ZZljtPHywu8M6DTfFnFFmTQ4H1n1d09novzC6xO/PrHrn3Uz2obD0DTKANAV4VCmMeEQo0nsd3ZH+/0XJvitxIGKpw+HME0yj4xxTdMsLhNL12gIOlle0KPrNN+8cYXnpUGWTv2dA5qWX0h9nFAz/3NSGfe3sz+dIQAcdMUMQWdPsHEnvrp9ZGO9ba26Q9b9oLZRPk3LtS325xUrzya+eL6DfHPEZZqdk8z6t1l+N+ujxPXJeB+WY7zfXu+7/XIA4EAochZ0YgBTMonP2+T7aHs2P3346d0ifZgu2QyYxBfdtmgEUuXJH7btMN/ccTXIJyOeJo8tNSk/XvaOz1N0fWzw2FPq+gbDzw1qCgBPjyIb4ORnbKv3oQbbw/TJR0eb5ZPncZc8+93HfNw4Osm33cdwsnr1eRqwMEmiuet2fZL5tP2e1hjAU6jIWdDWGBPcUvSFNxPDr16X3yNLdpVM7LjY8e4dzfCj20kb3mlMHRkGlv7Ad26fJsvNLG8H+eaNK3Ze3Po1i6dR+VmbulSf1F6bvCoZKYMENL0AnlZdXQnLG9r0GlUpWnghmtRrjaxMNHvXf2XCyb/BD3+6dJS1dY73C3DyiZcrt3VP7w8+9hP7FRzqlButUeGUt9N8cx8vk8onIx6jRL4Z5Yf/4CmiPk7GQY5hqqAE5zrFflsnOABAl8S7q4ntbeaTdUzB83dSxe7xfKGdxWOKq0+j69PO8QDw1Cl0LeiMyT5yemw7y6b9fNqUMdVrT3tqO42nsPo0uD4AAAAAAAAAAAAAgFZ6eMZSD4cGAMDO9HQj19PBAUCPKXQWdPdkf0vRzrNtnqvzRGyu7XnzbaVxbZMPCnc7rnznudHzvDzQCwD5FbkUZZsKamSbFdiCzW5RotUsOsx3p/Y4rnCBFec3TS8A7GO7P4KZsf5liw3hxqbBtsy3Qyb1IrV3F+IKykn+7jhDAHgaFbkW9IHWqz2+YtcmaTnIDQDIqatD0OFawu63/drYfuusEBxbxTh77ePYgW4yycbyiZXrxhPEEe3PTmf9zlzm2G68vPC7BjrNt0VcUSaNzkdBccXPc+w6Jotv58ucAAAFC4cijQmHJk1iv7M72u+/MMFvJQ5UPH049GmSeZjYcakh0lRcJpau0RB0srygJ9hpvnnjCs9LOp9C4nKKzPzPSWVS6WOBAwBaKmYIOrt7FPSJZeN9ZGO9ba26VNb9gLdRPk3LtS325xUrzya+aL6DfHPEZXKck67HpcR5znjvlOOFaAxzsACgXUXOgk4MfMobfG7yPtqezU9v/SHUVunDdMnmwyS+6LZFvy1Vnvzh3g7zzR1X3ny6FJez3z/PNnjsKXWdbDAFWukYAAA5FNkAJ1uTVu9DDbaH6a3iBzfLJ8/Nyjz7nfJicXSSb964UvkkGtJux5XMp9X71AWkIwwAuRU5C9oaY5z7g5JzEzL8ynb5PblkF8vEjosd796AjBoDJ5FJbYq/yepomuh3stzM8naQb964Yuclo9fa7bhSe23y7MZThs8dZ5UPAGiuqytheUOiXqMqRQs1RJN6rZGViWYv+69MOPk3+OFPl46yts7xfgFOPvFy5bbu6f1Bc5HYr+BQp9xobQunvJ3mm/t4mdQsaOMk7HZcyfPs/DMpLME539EN/XA7rTAA9IQGE23bniqb1UHuJJ+dFtsTU3xNcXE1Os/tHA8AyKnQtaAzJgkp7NbtNJv282lTxlSvnujhFRZXg/MMAAAAAAAAAAAAAMhrH8xc2gchAgDQnn3RuO2LIAFgn+nyLOjsbxPqPLtu5BY9X9wkRfP5vzuMo/FZ8ReOLDy+XNcleq43/rwxD/gCQAGKXIpyp1p0vPI29tbY7MWgwozCVSw6imOneie+qBz3JwDg6ZOxPmXmuybrNQZbTeN0jRYMyRtH55x2rkfiS6w52fzEAgA6V+Ra0PtKrw+yFrvmSHL1614/GwCw/3V3CDpau9i/txm9UrDBxpKHiwrbMH10nJvOS5YYdjax7f5vkyjFTZ2ZLhz+7TSOFvWIMkmv7bwr8bW4Lm5C1nQGgH3KNPnPaxniacNtRl5HzLhrEjcaovWPN8ntJtweK8f4X8vUMJ2JF9FuHDnrEWxI5lN0fE7R2dclURXnOsUDAgB0TxGTsGziAzv64pyMnqlNvGmn89UobXJSU6NJTGE6m+j0tRlHKpbs4/2iso8tOj41uS7xCOkAA8BuKGQWtPG+ytYaG3wPns1sX4KhWJPcnpgTvAv9L2vSzVHeOHLXo0U+RcXn7M91XfyuMc0wABSpiAY42eo07FEFXznb6qO+4KYgjK/TOPLWI5VPs4ePIjuOL5lPg/duNomWncYYALqtoFnQwZCzjb031ga3MKONSr/Japecu5HJObvJ/TJek5E3Xeb+NuLIWw/r3nRt1FstIL7U3uR1yT5TAIAidfv7gP1FI/y7vcFCSt57E84KDjbLnRUcvg3vRcb3+zmFo6PGmWFsYvuD0nOn21Ec+Y+PoojmRdvi42t1XZxig6gUK4kOMAD0toxZtXsibwy9EGuzILoV306vS0+cJwA4aLrZA3Y6dnvJ5Iwib7q90rX4euS6AAAAAAAAAAAAAAC6rQdmVPVACAAA7K6eaPx6IggA2GPdfg4YKUbWuKtg+4thyHlQt6MHbTvJx1vQsnvx5FqwMiwgnI7Ng8UAUMxa0J0pevXhVvkXVb51Vs7w3ifWemynQ+gE2Wk+XY0nX4l+vuk1LgEAvaDxB393ltZo/V0FnZbbKl8Ty8mkMm7jW/9M7GWb+Zjux5NDLDcT2wQAT6+C1oIGlFxjmr4vADi6OgQdrlXsrfmsxFingq3WXaXZfZFeK9nfapzt/oe6jaW3brrgMBsuQh3mH1s82dkeC8SEu+PD0vHjgnrG6+vWP+v8ON/Cm0yUrmciH7cradV5Pt2KJ37+Y+chmVHwnhFoAChAOMRoTDiumRjqdHdH+/0XJvitxIHuuKWJ/y9eTuogo2C41cTLjZVj3HxTP1L1a1TP5PboOJMs1zg5pn43zidefvv5BNu7E0+4ucF/yTSKesSJXADgKVTMELTN7HCFfS0b7yMb621rd4wyOM5mf6DbKHMnLBO9TuaTq39mE28yj0hsN8733rdVx0b5t6vYeJLnP+N9MPPL0vICgK/IWdCpgU+j+Adw8n20vT2N8kl27Jy4MhueFv2z8LhUftb5XsDs48JGyCu31XzsvDrKp+vx+OffOQ8NG9qsrzAGgKdSkQ1w8rO21ftQJz3hBjlFvdtE/lkHWX9rs7hMk15pq7jzPobTrTYqlU+i+etSPHmvc7SdVhgACp0FbY0xwa1DX3hTMfxKePk9sWSXySg+hzajS+UcFyshOC7W3AT3eTPGq518op6b0xsO8kv03t0MMh+iNYmCcnVsM3rhbj65O8c57rZ2I57Y3ug8mGRKmlwASOjqSljekKbXqErhwgvRAkv+pORoFrQNp9na+A9/unSUc3I2bjC92br5eOncBZ2MM6vaRKUlZlubKN/Y7Oh4fonjwrexf0649Y/iME65Ron83Iyy8nfOnzuru+18wki7FU+YX3gdw6OMm9JEpzl3rxsA0DkT/sjYjr3RxZOfNXCxyyEAwP5V6FrQ2ZOdklOzsE81mssGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAILdD0ctyEfnXi8gUAID9rm+vAwAA4GlEAwwAwB6gAQYAYA+Uopdj/aubm5ub4yMPWh41trC5uXmqz7bOf3MHsQEAcGDFe8Djx8vnZq6PZyWcrJ8Ktl+20+PHy2/MDhQdHAAAB1VqCPrBkFp0bKufblXqNU2dKComAAAOvEb3gMfq9XqpImmyXq/XxzX5qWau109K0qO6hmqSHi5ftvV6vX68osu2fkzVofpJ6ciAd+RkvV6vH9u1egAAsK+kGuAzazKqDk2Pld+oHRnXxU/Hj79Xun5s6g1NXCjPSdLYmgb9xEePl58/OVuuRIdPLhy7UH7P6OKnZ8rvle7SAgMAkCXZAFe/0ZlZVecmBjV/csZentJ27aNJrVWyDv6oXtP8Ka04m5a1sKKP6t+bktFHZ5hkDQBApv7Yu1kt6syctKyFsiRtzW5pcFnSif6sg3X5p1v6PLbliGo1VcpzW7ouTRcTMwAA+15iFvT/PKlbrYaN7w5p3Xs1+ZOtsfKrsZ1fvSGpduSQdKFcLpcXuxcpAAAHSGKM+CdvlDQwrmM6MSJJpfGS19gurERpDpe9Eekjx5ZV2UhmOFUuv6GZ4VLQSAMAgLTkTdqPXtfMvcr8yZl1VecmzEeT6qtcntJQ7dbQjJ9kfnuoVq5ockFHdGKkel/S747LqDonaWxcsqr816QGxqXJ47tbGwAA9p/nT2r8eLn8qlQ5Xj4nqXK8XC6/IXnDya9KOlP2nJP35pw0MaLK8fKJIenMSZ3x9owfL5dPDElS5poeAAA89fg6QgAA9gDPCQEAsAdogAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU6tDuFGNkOzpKyn+gUVvJ1U5UOVOafPmF9Wqa3shKJl2jvPUs8nwUpXkE7ce39zUCgEb6u5dV9z/sbN4WzUttWrZpxTJ501kvcYv01hjrVyqxPUc9jeyen48Guvp3QgsLAMrfABWVZes2raNs24sgb6roR+N0JpnEBD9bF2R64XzsQmm7GzoAdE/fXgfQk0yRH+tenzRPx832SutS6PkAgKdTbAjaSLIy3ie/Td+DDbZaf+AvvEEZvPB/GyUamGh7kEyysXxi5SblPc5EyY1bYJAu2hq/v+rsz24YY/HHymuSPMqv1b3seP0yz7u/2UT5uXEHF8UtT8Wdj134O4ld5+TerHpat5758gOAnhGOippo/NIk9ju7o/3+i2DINGt01Sh9jJtPLOOskHIcFx5tEnEljku2UO7+RkOayfhjMcXDjZ2njPOYepmqX/TbxM9nunrJ+qWOL+B87MbfSTy+xPlK1zNet9z5AcAeyh6Ctpk9n7CPaeN9H2O9ba26F9b9/LNRPrnLzXucNdH8I5tI1uwTuJ34M96ntufsbqXq18axyYyytxdzPor6OwnLbhRfi3q2nR8A7IVms6BTI5Am8fmVfB9tz+an937kSN/+cdmfv9360A3j8OcmN65/bHvDke1UvooaieaNVN7mudjzERTS5b+THPXPlU/H+QHAbmjWACe7E63ehxpsD9NbxQ9u8eHY1nFZQXXpwzdv/VukSz0elKpftH/nHbYCz0ejInb6d5K6zq20StpufgCwG5rNgrbGmPBepie6pxhN1/FaiYybbxlzZ+O3/Yzzueik7fS4KLWNepTu7c1WxzWLwD3KxnNpFG8g4zwm24NY/ZqHlm9zvAda2PmQ1P2/k+R1bla6mzaoZ7M0tMMAekZsJSxvqM77sJT/YWX8abbefmtkZaLZre7s2tgPfxpslLV1jvcLcPKJlxsdZ9xyWhwX3neMTZO1YbroOL8Ip8B4/ErPlnXjd5oVPy63lQm3h/llnEdncm5G/SQnFBvG78cdDfgaRdV0DwrfF3Q+Cv47SV7nxPk1iXq6+SQHwzPzA4CeF+92Jra3mU/Tnkl7h7VdfjeO6/TYsNydZFCQboVU1N/JTuPrdn4A0FVN14KOel6Jre31I7KzaZlPg8PaL3+HxzUMZPcyKETH5yMrpwL+TnZwnSWl5151r74AAAAAAAAAAAAA0KsO4MykA1glAMBBcyAbqwNZKQAHTtNZ0L2joAc4W36rvRrN324+ozYzXyNb0JOoncUT7ei9euY9PIzfeS68UVwA0FuaLUW5y3Z9lYSWHSXboIUJV9FoK1/bsj3rUIfxRPZJPRsFYGz0H20vgH2j2VKUu6zZJ6ct4mM1nWl3xi6LyjctX76N49lZa1VgPfNdbydV4tuxGIQG0Pt6qAHeX3qto1VUPL1WT0lqsTY1AOwLXR2CjtYQDpYQVsZaROHKwNHaRM5NPGet4uSBsXt9/nLL8TWhE2sBu4srR/uz03nJsofBE+WF38XQWb6x8+Ocj3brE+a7w3h6r57x653MpyFrGoylA8BBF64JbIz/aZxei9fZHe33X5jgtxIHKp4+2O/mE8s4EU/juEwsXcYQamxXlL2JH5IzXyPjv42nD+uRoz4mI99O43Ey76l6JuuauvbxZGEWinrGqQsJAD2nmCFom9lVCfrEXq8tem+st63VcKd1P1htlE/Tcm2L/XnFykt+7V3OfE1wmA3+FzsfueqTHVxn8WRmpZ6pp000pMn34XZj/NnQ2V9HCAA9qchZ0KkvhzOJz93k+2h7Nj99cpX9RunDdCa53ZpEXE2lypM/PNtmvi3PR4t4wuMz9ncST1b+vVDP5HFheY3yCUbK3eF4AOh1RTbAyc/CVu9DDbaH6W3i4Gb5mBy9tjz7nfJicewg3x3VP8f21vkmmqseqWej4/K3rbTCAPaBImdBW2NMdH9OknPTMPxKe/k9r2TXxihrrmvsDqaTT/xeqUltir/J6iY5dw+T5WaW10G+GeLno0V9gvPZNN8dxNMr9UwdZ5OpEymz4gWAXtfVlbC8IUyvUVXwYWsVTo3157+G6ySF82FNMBs2/OFPl42yts7xfgFOPvFy5bbu6f3Bx3Viv4JDnXKjtSic8jrNVyYa0HXrH+bbqj7BSU3F22E8YYreqqcTUHiEFHuvZABOfrTGABDvria2t5lP1jEFT7hJFVtUec07j4l03Q7C9GY9dxJDwX8XANAdha4FnTGpR353d+fZtJ9Pm5LFFlWeM7Wq1U1RFRFCz9WzmGoCAAAAAAAAAAAAwAFyAGcmHcAqAQAOmgPZWB3ISgF4ahQ6C7p7sr+9Z+fZtp6O22D+dfN5utnfby8bPgFbjMaZJx7cTR2XvT1xeLq0Hdcn9+Hu88rRCx74BbCPFbkUZZsKbZuyC2yhwbfbRatWtJWvbdnOFW3/1sc4P+OvAGC/KnIpyjY1+yi3RXzOpzPtzud6Ufl2UHBQ/o5OX4H1ae+6plLz5UcA9rEeaoD3l4M2+NmT9QlX9U5Ex9AzgAOgq0PQ4dq+7rf92th+66zoG62JlFgkKbUUUrTduZcZyydWrhtPEEe0Pzudlyx7GDxRXvjdAJ3lGzs/zvnYcX2ixI3OY4/VJ35dk/k4yWh/AaCpcK1iY/xP6fhgpYnvjvb7L0zwW4kDFU8f7HfziWWciKdxXCaWLmNoNbYryt7ED8mZr5Hx38bTh/XoUn3C85muV0/Vxwk18z83kVOz9HsA2I+KGYK2mT2voE8sG+8jG+ttazUMat0PXBvl07Rc22J/XrHybOLmY858TXCYDf4XOx/dqo/JcS57pj5KXNeM93SAARxIRc6CTg44eoOSTd5H27P56YMP91bpw3QmuT3xhbYt+lGp8uQP27aZb8vz0SKe3PXJm088j12vT/K4sLz034mUGPTWrs+ZB4AuK7IBbtVzadiTabA9TG8TBzfLx+TozeXZ75QXi2MH+bZb/9z1SeWTaEh7pT4Njku+z7rcPAcMYN8rcha0NcYEt/580T08G723qZt+Cu9RprfG72hGKzM4ibJuELpvsjqMJvqdLDezvA7yzRA/H12qT+x8ZpTbK/VJHWeTqTNSAsBB0dWVsLyhTa9RVfAhbKPRQn9ebLh+UjhP1gSzZMMf/jTaKGvrHO8X4OQTL1du657eH/af4vsVHOqUG61R4ZTXab4y0UCvW/8w327VRyZZfmwlqV6pjxNQeIQUex+veSwQNVhWBACQ6K4mtreZT9YxBXePUsUWVV7zTmXXCum5+jS6ru2WAwD7UqFrQWdM9lHYPdtpNu3n06ZksUWVZ+Ld1sL0XH0aXFcAAAAAAAAAAAAAQCs9PGOph0MDAGBnerqR6+ngAKAghc6C7p6CFh5s8SCp80Rsru15822lUW2zy/UXsXCPSy+vkXhQOE++qcObJci3drRizxM7gTMZGsDTp8ilKNu066v7tux4NVjqIVrNosN8O5UdjzWJNqxh+Xtcn3BhliBeml0A6A27PxKZLDEVQWZIjRYYaSPfTjWKxzRPZhrtiDbuQn2CcmK/d5IhAOxnRa4FfaAdtN5bsWuAtBzkBoCnTleHoMM1f91v+7Wx/dZZ6TdaKymxeFJqiaRou3MvM5ZPrFw3niCOaH92Out3yjLHaOPlhd8Z0Gm+LeKKMmlwPrLq757ORPmF1yd+fWLXP+tmtA2HoWmUAaArwqFMY8IhRpPY7+yO9vsvTPBbiQMVTx8OYZpkHhnjmqZZXCaWrtEQdLK8oEfXab554wrPS4Msnfo7BzQtv5D6OKFm/uekMu5vZ386QwA46IoZgs6eYONOfHX7yMZ621p1h6z7QW2jfJqWa1vszytWnk188XwH+eaIyzQ7J5n1b7P8btZHieuT8T4sx3i/vd53++UAwIFQ5CzoxACmZBKft8n30fZsfvrw07tF+jBdshkwiS+6bdEIpMqTP2zbYb6542qQT0Y8TR5balJ+vOwdn6fo+tjgsafU9Q2GnxvUFACeHkU2wMnP2FbvQw22h+mTj442yyfP4y559ruP+bhxdJJvu4/hZPXq8zRgYZJEc9ft+iTzafs9rTGAp1CRs6CtMSa4pegLbyaGX70uv0eW7CqZ2HGx4907muFHt5M2vNOYOjIMLP2B79w+TZabWd4O8s0bV+y8uPVrFk+j8rM2dak+qb02eVUyUgYJaHoBPK26uhKWN7TpNapStPBCNKnXGlmZaPau/8qEk3+DH/506Shr6xzvF+DkEy9Xbuue3h987Cf2KzjUKTdao8Ipb6f55j5eJpVPRjxGiXwzyg//wVNEfZyMgxzDVEEJznWK/bZOcACALol3VxPb28wn65iC5++kit3j+UI7i8cUV59G16ed4wHgqVPoWtAZk33k9Nh2lk37+bQpY6rXnvbUdhpPYfVpcH0AAAAAAAAAAAAAAK308IylHg4NAICd6elGrqeDA4AeU+gs6O7J/painWfbPFfnidhc2/Pm20rj2iYfFO52XPnOc6PneXmgFwDyK3IpyjYV1Mg2K7AFm92iRKtZdJjvTu1xXOECK85vml4A2Md2fwQzY/3LFhvCjU2DbZlvh0zqRWrvLsQVlJP83XGGAPA0KnIt6AOtV3t8xa5N0nKQGwCQU1eHoMO1hN1v+7Wx/dZZITi2inH22sexA91kko3lEyvXjSeII9qfnc76nbnMsd14eeF3DXSab4u4okwanY+C4oqf59h1TBbfzpc5AQAKFg5FGhMOTZrEfmd3tN9/YYLfShyoePpw6NMk8zCx41JDpKm4TCxdoyHoZHlBT7DTfPPGFZ6XdD6FxOUUmfmfk8qk0scCBwC0VMwQdHb3KOgTy8b7yMZ621p1qaz7AW+jfJqWa1vszytWnk180XwH+eaIy+Q4J12PS4nznPHeKccL0RjmYAFAu4qcBZ0Y+JQ3+NzkfbQ9m5/e+kOordKH6ZLNh0l80W2LfluqPPnDvR3mmzuuvPl0KS5nv3+ebfDYU+o62WAKtNIxAAByKLIBTrYmrd6HGmwP01vFD26WT56blXn2O+XF4ugk37xxpfJJNKTdjiuZT6v3qQtIRxgAcityFrQ1xjj3ByXnJmT4le3ye3LJLpaJHRc73r0BGTUGTiKT2hR/k9XRNNHvZLmZ5e0g37xxxc5LRq+123Gl9trk2Y2nDJ87ziofANBcV1fC8oZEvUZVihZqiCb1WiMrE81e9l+ZcPJv8MOfLh1lbZ3j/QKcfOLlym3d0/uD5iKxX8GhTrnR2hZOeTvNN/fxMqlZ0MZJ2O24kufZ+WdSWIJzvqMb+uF2WmEA6AkNJtq2PVU2q4PcST47LbYnpvia4uJqdJ7bOR4AkFOha0FnTBJS2K3baTbt59OmjKlePdHDKyyuBucZAAAAAAAAAAAAAJDXPpi5tA9CBACgPfuicdsXQQLAPtPlWdDZ3ybUeXbdyC16vrhJiubzf3cYR+Oz4i8cWXh8ua5L9Fxv/HljHvAFgAIUuRTlTrXoeOVt7K2x2YtBhRmFq1h0FMdO9U58UTnuTwDA0ydjfcrMd03Wawy2msbpGi0YkjeOzjntXI/El1hzsvmJBQB0rsi1oPeVXh9kLXbNkeTq171+NgBg/+vuEHS0drF/bzN6pWCDjSUPFxW2YfroODedlywx7Gxi2/3fJlGKmzozXTj822kcLeoRZZJe23lX4mtxXdyErOkMAPuUafKf1zLE04bbjLyOmHHXJG40ROsfb5LbTbg9Vo7xv5apYToTL6LdOHLWI9iQzKfo+Jyis69LoirOdYoHBADoniImYdnEB3b0xTkZPVObeNNO56tR2uSkpkaTmMJ0NtHpazOOVCzZx/tFZR9bdHxqcl3iEdIBBoDdUMgsaON9la01NvgePJvZvgRDsSa5PTEneBf6X9akm6O8ceSuR4t8iorP2Z/ruvhdY5phAChSEQ1wstVp2KMKvnK21Ud9wU1BGF+nceStRyqfZg8fRXYcXzKfBu/dbBItO40xAHRbQbOggyFnG3tvrA1uYUYblX6T1S45dyOTc3aT+2W8JiNvusz9bcSRtx7WvenaqLdaQHypvcnrkn2mAABF6vb3AfuLRvh3e4OFlLz3JpwVHGyWOys4fBvei4zv93MKR0eNM8PYxPYHpedOt6M48h8fRRHNi7bFx9fqujjFBlEpVhIdYADobRmzavdE3hh6IdZmQXQrvp1el544TwBw0HSzB+x07PaSyRlF3nR7pWvx9ch1AQAAAAAAAAAAAAB0Ww/MqOqBEAAA2F090fj1RBAAsMe6/RwwUoyscVfB9hfDkPOgbkcP2naSj7egZffiybVgZVhAOB2bB4sBoJi1oDtT9OrDrfIvqnzrrJzhvU+s9dhOh9AJstN8uhpPvhL9fNNrXAIAekHjD/7uLK3R+rsKOi23Vb4mlpNJZdzGt/6Z2Ms28zHdjyeHWG4mtgkAnl4FrQUNKLnGNH1fAHB0dQg6XKvYW/NZibFOBVutu0qz+yK9VrK/1Tjb/Q91G0tv3XTBYTZchDrMP7Z4srM9FogJd8eHpePHBfWM19etf9b5cb6FN5koXc9EPm5X0qrzfLoVT/z8x85DMqPgPSPQAFCAcIjRmHBcMzHU6e6O9vsvTPBbiQPdcUsT/1+8nNRBRsFwq4mXGyvHuPmmfqTq16ieye3RcSZZrnFyTP1unE+8/PbzCbZ3J55wc4P/kmkU9YgTuQDAU6iYIWib2eEK+1o23kc21tvW7hhlcJzN/kC3UeZOWCZ6ncwnV//MJt5kHpHYbpzvvW+rjo3yb1ex8STPf8b7YOaXpeUFAF+Rs6BTA59G8Q/g5Ptoe3sa5ZPs2DlxZTY8Lfpn4XGp/KzzvYDZx4WNkFduq/nYeXWUT9fj8c+/cx4aNrRZX2EMAE+lIhvg5Gdtq/ehTnrCDXKKereJ/LMOsv7WZnGZJr3SVnHnfQynW21UKp9E89elePJe52g7rTAAFDoL2hpjgluHvvCmYviV8PJ7Yskuk1F8Dm1Gl8o5LlZCcFysuQnu82aMVzv5RD03pzcc5JfovbsZZD5EaxIF5erYZvTC3Xxyd45z3G3tRjyxvdF5MMmUNLkAkNDVlbC8IU2vUZXChReiBZb8ScnRLGgbTrO18R/+dOko5+Rs3GB6s3Xz8dK5CzoZZ1a1iUpLzLY2Ub6x2dHx/BLHhW9j/5xw6x/FYZxyjRL5uRll5e+cP3dWd9v5hJF2K54wv/A6hkcZN6WJTnPuXjcAoHMm/JGxHXujiyc/a+Bil0MAgP2r0LWgsyc7JadmYZ9qNJcNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwH51KHpZLiL/ehGZAgCw3/XtdQAAADyNaIABANgDNMAAAOyBUvRyrH91c3Nzc3zkQcujxhY2NzdP9dnW+W/uIDYAAA6seA94/Hj53Mz18ayEk/VTwfbLdnr8ePmN2YGigwMA4KBKDUE/GFKLjm31061KvaapE0XFBADAgdfoHvBYvV4vVSRN1uv1+rgmP9XM9fpJSXpU11BN0sPly7Zer9ePV3TZ1o+pOlQ/KR0Z8I6crNfr9WO7Vg8AAPaVVAN8Zk1G1aHpsfIbtSPjuvjp+PH3StePTb2hiQvlOUkaW9Ogn/jo8fLzJ2fLlejwyYVjF8rvGV389Ez5vdJdWmAAALIkG+DqNzozq+rcxKDmT87Yy1Parn00qbVK1sEf1WuaP6UVZ9OyFlb0Uf17UzL66AyTrAEAyNQfezerRZ2Zk5a1UJakrdktDS5LOtGfdbAu/3RLn8e2HFGtpkp5bkvXpeliYgYAYN9LzIL+nyd1q9Ww8d0hrXuvJn+yNVZ+Nbbzqzck1Y4cki6Uy+XyYvciBQDgAEmMEf/kjZIGxnVMJ0YkqTRe8hrbhZUozeGyNyJ95NiyKhvJDKfK5Tc0M1wKGmkAAJCWvEn70euauVeZPzmzrurchPloUn2Vy1Maqt0amvGTzG8P1coVTS7oiE6MVO9L+t1xGVXnJI2NS1aV/5rUwLg0eXx3awMAwP7z/EmNHy+XX5Uqx8vnJFWOl8vlNyRvOPlVSWfKnnPy3pyTJkZUOV4+MSSdOakz3p7x4+XyiSFJylzTAwCApx5fRwgAwB7gOSEAAPYADTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAQh2KvzWyeY4yuVLJSJJtld7ISkapko2Cw3OUki9ut8Q91TyC9uPb+xoBANrT38ExJm866yVukd4aY2XTbbS3qUVbb2RzpdsDXW0UaWEBAMrbBJv4j8bpTDKJCX62LsjkTOfku1u6Wtruhg4AKFpfcVl7fdI8HTfbK62L6ZVAAAAHXXwI2r8T6/0yXsuYfYPWSW6CZNE93waCfIJ0yfQm3Gyi/MLtJiwsVl702ws4qkB0XLg1fr/Z2Z8ZdrDfOQ/JeMOQ3Pq5FY3iSJ8IL7/o+OTerHpat5758gMA7AOmyX/xVM4+/0UiXeplLC8T+23c98kh6FR6k3F88oBE+iiCeDxuflnnIqxgun6x+ifrlhVnMu90fInzla5nvG658wMA9JysIWib+PxOvk9tz9ndiuVjE7/b0egYa6L5WDaevukod8sYbGYat/5uHzksP9fwe5P4WtSz7fwAAL0jcxa0N/gpa/y5yabB53lie6OR3HS+ihqJ5o1U3uY5O12XG6FU/ZLnpfF5aphfm49PtYyPsWcA2CeyGuBk96pRd6tFutTjQeHLYHu0f+cdtqwgu9wYtTovDbulzba38/hUq6S9+TgWACBLg1nQ/tBq+GnuDa2mW8n4ULUxxiTSJdqD2O3Qpo1ug51Z9z6dwqIetluIceJoXmjTvRn1i+49R9O64uU7KZO5G3efbV66mzaoZ7M0tMMA0OMSK2EFi2cE84aDZsWaYBqyglYm3G7CqcL+IeEcXJOYHB3mI3dSsX/31N8QlhgcrWi7CbrK/k7jdJ2T07Gd2cfGOhHZWDyxrKTE7OFwv9O5jNfPq080C9qdhR37kczdOHGY8KjY+TWJerr5pAb7s/IDAOwTWR23do/vxem33QqpUf3azT95nncaX7fzAwDsArcHvOM5PL05CajV1LC2csrIqu38E9l0Gl/Y9+9SfgAAAAAAAAAAAACARvbxTKh9HDoA4Gm3rxuxfR08AOwTyeeAd6gbD6CGj85Kih7R9ffkWO5p57OAG9UiX/lS+FjuntUj33Vwnq+Of2sTy3gAwH7TlS/UDZ63jf12t7copdneVoc2XPLL5C9fUdK9rUfOIJO/6QIDwC5osBRlp2xnXaf2PvA7LMQ7tnkc/lqW6VSxL1dqWX6+HmRx9dhR1uK7lABgF3S5AS6S/7UNBZfSOP9ulb879WgeQjgIDgDYI5lfR9ix2FLMxv2W3NhKTc6Szf7u7HuWrVbWCvJNLC6dOj6WLtwexRdtNk648Tg7KX+P6pHzOngprbeId/DlVACAfco0+S9M429odM/RuSfp7jWJFPG8m91rbZAuurEbzzfMPx5n7vLd/XtTj3zXQeGt4uiWcTpGAEAhihiCtokP8OT7bnW1YvnaxO9m5bt7msXS6kZrzvJbKaoeLa+D/K81jL7ekOnPALBbujsE7TP+FwQY/wuFTYNZPa37WbbFgzrR9//a9LcSJNO1UW4+ecvfq3rkuA7h8HPwXYsAgN1RRAOc/Bhv+LHe3sd9qo0wbm8xuImZUVhqU2fNTBvlN21vd60era5DKr9wAw0xABSuoFnQXkcraoe8kc6sHptzozNrvzXxdImmIXYHuUnvMHmPM34nNkePOCwjb/kJe1SPzOvQqMam2YQzAEB3dXklrOBD3Bq3G+e/N+EcXhv+UJhCCqdCe9tN/K6lOz1ZzjxlG773fxs3vZtORtEBNpZNWGw8H+eHidayalG+ex72pB6trkOYMsrXCdHSAQaA/SY9y/YptocnYqfXgWsIALugmz3gxnOQsJu4DgAAAAAAAAAAAABwQOyjGVT7KFQAAJrbV43avgoWALqs288BFyT725J2nm3zXN0He3Nk1vnc47xxtHxA14TP9+5K3Lmvi8l67pgHjgE81QpZC7ozBTWyzQpswbbVQjRdf7JZ5ZrFYYIgTBsdxl2KOzd39S9jw98AgB6x+yOSyRJTEbQVUtPEne4MGl7TIl08n12Ku70igh9OVRiEBvD0KmgtaHSP11fclx3GPKtsA8BTqqtD0NHax8Zd1Njdb50ViaO7j8ELk7hHGD/QTeathhxb0zgq140nWks52J+dzvqds6yGrpNyU/E2Sd/quObxNL7nW3jcsesSu+5ZpzH80ifT3hg5AKCFcGjRmHCo0ST2O7uj/f4LE/yWUo2PUfoYN59Yxol4GsdlYukaDUHnLdckDkod1yDOZByJ45I1apxvYgi6+LjT1yV2bDLwqAYmuR0AnjrFDEHbzC6Q+4U7bh/Z+wpdtRxmdb9TKEgf/4b5jHJti/05dFRu8rjkniZxND6uQTzu72bpCoo7mb5J/P5saGtpeQE89YqcBZ0aaDWJz//k+2h7Nj+996N1+jCdSW5PTPxt1Rq0WW7yuNzpGx3XIp5UXA3S5Y6j3bjDcmzwuFGD+IP2t8XUawB4GhTZACc/Y1u9DzXYbtzenntws3xMjl5vi/1tl5s8Lmf6BsfZ5GM7qXjC/fFmbbfizn1dUztohQE8xYqcBW2NMcGtQ194EzP8inj5PbRkl8koaw5t6k5n+BHu3ik1qU3xN1ndL+euZKflZrw3jV9kltMweSLiWDxNOqi7Fbd/ayGZezxl8DwzAEBdXgnLG+r0GlUFH7hW4dRifx6uiWbj+q9MMMs2/OFPl46yts7xfgEmNas3GHF2W/f0/nAoNL5fwaFOucaNs0W5ftNio/yC+hlFGbSOM/M4G08XjyeqWPgPm92IO3ldnH9WhdfVPdEmVQ4dYAAoRLz7ldjeZj5ZxxTcmWpUbG934szuxd2woDaOB4CnVqFrQWdPDkpOzeowm/bzaVPjqU3FlrtTuxZ3o4IAAAAAAAAAAAAAAF2yD2Y27YMQAQBoz75o3PZFkABQsEJnQXdPV74XPiPb5rm6D9jmyKzzOcF542j54GziAed8he9gLnOu6+I+/+s+pgwAT7Uil6JsU0GNbLMCW2jvW/OaLm/crHLN4jBBEKaNjuMuxZ2/BD8vS9MLAD1p90cmm6/HmLWhndy6sjNoeButapKdzy7F3V7+ThUYhAaAIteCRld4ncZ92XNssto1ADztujoEHa4Z7H7br43tt85Kwc49QcU2pJZYirY79zhj+cTKdeOJ1h4O9mens35ns9kaUu2Um4q3SfpWxzWPp/E938Ljjl2X2HXPunwAgIKEQ4zGhEOnJrHf2R3t91+Y4LcSByqePtjv5hPLOBFP47hMLF2jIei85SaHWlPHNYgzGUfiuGSNGuebGIIuPu70dYkdm5XGPfEA8DQrZgjaZnZ5wm/esfE+svdVtmrZTbLuB7eN8mlarm2xP4eOyk0el9zTJI7GxzWIx/3dLF1BcSfTZ7z3xx0Mc7AAIFDkLOjUQKtJfP4n30fbs/npvR+t04fpTHJ7YuJvq/5Ym+Umj8udvtFxLeJJxdUgXe442o07LMc6X4OYgdYXACJFNsDJ7k6r96EG243b23MPbpaPydHrbbG/7XKTx+VM3+A4axLlpuIJ98f/YbFbcbd/nekIA0Chs6CtMca57yc5NzHDr26X30NLdpmMsubQpu50hh/l7p1Sk9oUf5P15KtzI7TTcjPem8YvMstpmDwRcSyeJh3U3Yrbv7WQzD1KGT7LTNMLAJ6uroTlDXV6jaqCD12rcGqxPw/XRLNx/VcmmGUb/vCnS0dZW+d4vwCTmtUbjDi7rXt6f9AMJPYrONQp17hxtijXb2xslF9QP6Mog9ZxZh5n4+ni8UQVC/9hsxtxJ6+L88+q8LoG5Tmnl1YYAIoW734ltreZT9Yx7ebTpWKLLndnzO7F3bCgHMcBwFOv0LWgsycHJadmdZhN+/m0qfHUpt6eTbRrcTcqCAAAAAAAAAAAAACwRw7gjKgDWCUAwEFzIBurA1kpAAdOobOgu6cr3wufkW3zXN0HbPNsb56vkQ2fxO2uzuKJdvRePfMebmLPGYfTsnnQGMA+UORSlG0qqJFtVmALtkELE66K0Va+tmV71qEO44nsk3o2CsDY6D/aXgD7RpFLUbap2SenLeJjNZ1pd8Yui8o3LV++jePZWWtVYD3zXW8nVeJbnhiEBtD7eqgB3l96raNVVDy9Vk9JmatRq0dDBYBGujoEHa4Z7H7br43tt85Kwe4awbENqSWWou3OPctYPrFy3XiiNY6D/dnpvGTZw+CJ8sLvHOgs39j5cc5Hu/UJ891hPL1Xz/j1TubTFCPQAJ5K4drPxvifxvFBSRPfHe33X5jgtxIHKp4+2O/mE8s4EU/juEwsXcYQamxXlL2JH5IzXyPjv42nD+uRoz4mI99O43Ey76l6JuuauvbxZGEWinrGqQsJAD2nmCFom9lVCb95x8b7yN5X2apl98a6H6w2yqdpubbF/rxi5dnETcac+ZrgMBv8L3Y+ctUnO7jO4snMSj1TT5toSJPvw+3G+B3fZLwA0MOKnAWdHFj0Bh+bvI+2Z/PTBx/irdKH6Uxye+ILgVt8aqfKkz8822a+Lc9Hi3jC4zP2dxJPVv69UM/kcWF5jfJxCsv6qmcA6ElFNsDJz8JW70MNtofpbeLgZvmYHL22PPud8mJx7CDfHdU/x/bW+Saaqx6pZ6PjWrWt0X5aYQD7QJGzoK0xJro/J8m5aRh+dbv8nleya2OUNdc1dgfTySd+r9SkNsXfZHWTnLuHyXIzy+sg3wzx89GiPsH5bJrvDuLplXqmjrPJ1ImUWfECQK/r6kpY3hCm16gq+LC1CqfG+vNfw3WSwvmwJpgNG/7wp8tGWVvneL8AJ594uXJb9/T+4OM6sV/BoU650VoUTnmd5isTDei69Q/zbVWf4KSm4u0wnjBFb9XTCSg8Qoq9VzIAJz9aYwCId1cT29vMJ+uYgifcpIotqrzmncdEum4HYXqznjuJoeC/CwDojkLXgs6Y1CO/u7vzbNrPp03JYosqz5la1eomp4oIoefqWUw1AQAAAAAAAAAAAOAAOYAzkw5glQAAB82BbKwOZKUAPDUKnQXdPdnf3rPzbFtPx20w/7r5PN3s77eXDZ+ALUbjzBMP7qaOy96eODxd2o7rk/tw93nl6AUP/ALYx4pcirJNhbZN2QW2YBu0POEqFW3la1u2c0Xbv/Uxzs/4KwDYr4pcirJNzT7KbRGf8+lMu/O5XlS+HRQclL+j01dgfdq7rqnUfPkRgH2shxrg/eWgDX72ZH3CVb0T0TH0DOAA6OoQdLi2r/ttvza23zor+kZrIiUWSUothRRtd+5lxvKJlevGE8QR7c9O5yXLHgZPlBd+N0Bn+cbOj3M+dlyfKHGj89hj9Ylf12Q+TjLaXwBoKlyr2Bj/Uzo+WGniu6P9/gsT/FbiQMXTB/vdfGIZJ+JpHJeJpcsYWo3tirI38UNy5mtk/Lfx9GE9ulSf8Hym69VT9XFCzfzPTeTULP0eAPajYoagbWbPK+gTy8b7yMZ621oNg1r3A9dG+TQt17bYn1esPJu4+ZgzXxMcZoP/xc5Ht+pjcpzLnqmPEtc14z0dYAAHUpGzoJMDjt6gZJP30fZsfvrgw71V+jCdSW5PfKFti35Uqjz5w7Zt5tvyfLSIJ3d98uYTz2PX65M8Liwv/XciJQa9tetz5gGgy4psgFv1XBr2ZBpsD9PbxMHN8jE5enN59jvlxeLYQb7t1j93fVL5JBrSXqlPg+OS77MuN88BA9j3ipwFbY0xwa0/X3QPz0bvbeqmn8J7lOmt8Tua0coMTqKsG4Tum6wOo4l+J8vNLK+DfDPEz0eX6hM7nxnl9kp9UsfZZOqMlABwUHR1JSxvaNNrVBV8CNtotNCfFxuunxTOkzXBLNnwhz+NNsraOsf7BTj5xMuV27qn94f9p/h+BYc65UZrVDjldZqvTDTQ69Y/zLdb9ZFJlh9bSapX6uMEFB4hxd7Hax4LRA2WFQEAJLqrie1t5pN1TMHdo1SxRZXXvFPZtUJ6rj6Nrmu75QDAvlToWtAZk30Uds92mk37+bQpWWxR5Zl4t7UwPVefBtcVAAAAAAAAAAAAANBKD89Y6uHQAADYmZ5u5Ho6OAAoSKGzoLunoIUHWzxI6jwRm2t73nxbaVTb7HL9RSzc49LLayQeFM6Tb+rwZgnyrR2t2PPETuBMhgbw9ClyKco27frqvi07Xg2WeohWs+gw305lx2NNog1rWP4e1ydcmCWIl2YXAHrD7o9EJktMRZAZUqMFRtrIt1ON4jHNk5lGO6KNu1CfoJzY751kCAD7WZFrQR9oB633VuwaIC0HuQHgqdPVIehwzV/3235tbL91VvqN1kpKLJ6UWiIp2u7cy4zlEyvXjSeII9qfnc76nbLMMdp4eeF3BnSab4u4okwanI+s+runM1F+4fWJX5/Y9c+6GW3DYWgaZQDoinAo05hwiNEk9ju7o/3+CxP8VuJAxdOHQ5gmmUfGuKZpFpeJpWs0BJ0sL+jRdZpv3rjC89IgS6f+zgFNyy+kPk6omf85qYz729mfzhAADrpihqCzJ9i4E1/dPrKx3rZW3SHrflDbKJ+m5doW+/OKlWcTXzzfQb454jLNzklm/dssv5v1UeL6ZLwPyzHeb6/33X45AHAgFDkLOjGAKZnE523yfbQ9m58+/PRukT5Ml2wGTOKLbls0Aqny5A/bdphv7rga5JMRT5PHlpqUHy97x+cpuj42eOwpdX2D4ecGNQWAp0eRDXDyM7bV+1CD7WH65KOjzfLJ87hLnv3uYz5uHJ3k2+5jOFm9+jwNWJgk0dx1uz7JfNp+T2sM4ClU5Cxoa4wJbin6wpuJ4Vevy++RJbtKJnZc7Hj3jmb40e2kDe80po4MA0t/4Du3T5PlZpa3g3zzxhU7L279msXTqPysTV2qT2qvTV6VjJRBAppeAE+rrq6E5Q1teo2qFC28EE3qtUZWJpq9678y4eTf4Ic/XTrK2jrH+wU4+cTLldu6p/cHH/uJ/QoOdcqN1qhwyttpvrmPl0nlkxGPUSLfjPLDf/AUUR8n4yDHMFVQgnOdYr+tExwAoEvi3dXE9jbzyTqm4Pk7qWL3eL7QzuIxxdWn0fVp53gAeOoUuhZ0xmQfOT22nWXTfj5typjqtac9tZ3GU1h9GlwfAAAAAAAAAAAAAEArPTxjqYdDAwBgZ3q6kevp4ACgxxQ6C7p7sr+laOfZNs/VeSI21/a8+bbSuLbJB4W7HVe+89zoeV4e6AWA/IpcirJNBTWyzQpswWa3KNFqFh3mu1N7HFe4wIrzm6YXAPax3R/BzFj/ssWGcGPTYFvm2yGTepHauwtxBeUkf3ecIQA8jYpcC/pA69UeX7Frk7Qc5AYA5NTVIehwLWH3235tbL91VgiOrWKcvfZx7EA3mWRj+cTKdeMJ4oj2Z6ezfmcuc2w3Xl74XQOd5tsiriiTRuejoLji5zl2HZPFt/NlTgCAgoVDkcaEQ5Mmsd/ZHe33X5jgtxIHKp4+HPo0yTxM7LjUEGkqLhNL12gIOlle0BPsNN+8cYXnJZ1PIXE5RWb+56QyqfSxwAEALRUzBJ3dPQr6xLLxPrKx3rZWXSrrfsDbKJ+m5doW+/OKlWcTXzTfQb454jI5zknX41LiPGe8d8rxQjSGOVgA0K4iZ0EnBj7lDT43eR9tz+ant/4Qaqv0Ybpk82ESX3Tbot+WKk/+cG+H+eaOK28+XYrL2e+fZxs89pS6TjaYAq10DACAHIpsgJOtSav3oQbbw/RW8YOb5ZPnZmWe/U55sTg6yTdvXKl8Eg1pt+NK5tPqfeoC0hEGgNyKnAVtjTHO/UHJuQkZfmW7/J5csotlYsfFjndvQEaNgZPIpDbF32R1NE30O1luZnk7yDdvXLHzktFr7XZcqb02eXbjKcPnjrPKBwA019WVsLwhUa9RlaKFGqJJvdbIykSzl/1XJpz8G/zwp0tHWVvneL8AJ594uXJb9/T+oLlI7FdwqFNutLaFU95O8819vExqFrRxEnY7ruR5dv6ZFJbgnO/ohn64nVYYAHpCg4m2bU+Vzeogd5LPTovtiSm+pri4Gp3ndo4HAORU6FrQGZOEFHbrdppN+/m0KWOqV0/08AqLq8F5BgAAAAAAAAAAAADktQ9mLu2DEAEAaM++aNz2RZAAsM90eRZ09rcJdZ5dN3KLni9ukqL5/N8dxtH4rPgLRxYeX67rEj3XG3/emAd8AaAARS5FuVMtOl55G3trbPZiUGFG4SoWHcWxU70TX1SO+xMA8PTJWJ8y812T9RqDraZxukYLhuSNo3NOO9cj8SXWnGx+YgEAnStyLeh9pdcHWYtdcyS5+nWvnw0A2P+6OwQdrV3s39uMXinYYGPJw0WFbZg+Os5N5yVLDDub2Hb/t0mU4qbOTBcO/3YaR4t6RJmk13belfhaXBc3IWs6A8A+ZZr857UM8bThNiOvI2bcNYkbDdH6x5vkdhNuj5Vj/K9lapjOxItoN46c9Qg2JPMpOj6n6OzrkqiKc53iAQEAuqeISVg28YEdfXFORs/UJt600/lqlDY5qanRJKYwnU10+tqMIxVL9vF+UdnHFh2fmlyXeIR0gAFgNxQyC9p4X2VrjQ2+B89mti/BUKxJbk/MCd6F/pc16eYobxy569Ein6Lic/bnui5+15hmGACKVEQDnGx1Gvaogq+cbfVRX3BTEMbXaRx565HKp9nDR5Edx5fMp8F7N5tEy05jDADdVtAs6GDI2cbeG2uDW5jRRqXfZLVLzt3I5Jzd5H4Zr8nImy5zfxtx5K2HdW+6NuqtFhBfam/yumSfKQBAkbr9fcD+ohH+3d5gISXvvQlnBQeb5c4KDt+G9yLj+/2cwtFR48wwNrH9Qem50+0ojvzHR1FE86Jt8fG1ui5OsUFUipVEBxgAelvGrNo9kTeGXoi1WRDdim+n16UnzhMAHDTd7AE7Hbu9ZHJGkTfdXulafD1yXQAAAAAAAAAAAAAA3dYDM6p6IAQAAHZXTzR+PREEAOyxbj8HjBQja9xVsP3FMOQ8qNvRg7ad5OMtaNm9eHItWBkWEE7H5sFiAChmLejOFL36cKv8iyrfOitneO8Taz220yF0guw0n67Gk69EP9/0GpcAgF7Q+IO/O0trtP6ugk7LbZWvieVkUhm38a1/JvayzXxM9+PJIZabiW0CgKdXQWtBA0quMU3fFwAcXR2CDtcq9tZ8VmKsU8FW667S7L5Ir5XsbzXOdv9D3cbSWzddcJgNF6EO848tnuxsjwViwt3xYen4cUE94/V16591fpxv4U0mStczkY/blbTqPJ9uxRM//7HzkMwoeM8INAAUIBxiNCYc10wMdbq7o/3+CxP8VuJAd9zSxP8XLyd1kFEw3Gri5cbKMW6+qR+p+jWqZ3J7dJxJlmucHFO/G+cTL7/9fILt3Ykn3Nzgv2QaRT3iRC4A8BQqZgjaZna4wr6WjfeRjfW2tTtGGRxnsz/QbZS5E5aJXifzydU/s4k3mUckthvne+/bqmOj/NtVbDzJ85/xPpj5ZWl5AcBX5Czo1MCnUfwDOPk+2t6eRvkkO3ZOXJkNT4v+WXhcKj/rfC9g9nFhI+SV22o+dl4d5dP1ePzz75yHhg1t1lcYA8BTqcgGOPlZ2+p9qJOecIOcot5tIv+sg6y/tVlcpkmvtFXceR/D6VYblcon0fx1KZ681znaTisMAIXOgrbGmODWoS+8qRh+Jbz8nliyy2QUn0Ob0aVyjouVEBwXa26C+7wZ49VOPlHPzekNB/kleu9uBpkP0ZpEQbk6thm9cDef3J3jHHdbuxFPbG90HkwyJU0uACR0dSUsb0jTa1SlcOGFaIElf1JyNAvahtNsbfyHP106yjk5GzeY3mzdfLx07oJOxplVbaLSErOtTZRvbHZ0PL/EceHb2D8n3PpHcRinXKNEfm5GWfk758+d1d12PmGk3YonzC+8juFRxk1potOcu9cNAOicCX9kbMfe6OLJzxq42OUQAGD/KnQt6OzJTsmpWdinGs1lAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHrZoehlOfdB9QICAQDgadK31wEAAPA0KkUv+3MftFlAIIWpXHpgcyeuvlpZLDAWAAB8TgP82u3N07XgzcVDfVbS5O1qNN588c4zg1aKNcBn+9e9F1VbcpTt5LllG2z7XqV+aalUKk0O1kqlUqk0uu63dJOX68thVsNvHZ0LXo/+2eayKpeWvMTNnX1uznlXPb36xPshSaObpa2FbT+keIjfqywGyTV8sualP3noizxnLdvoa81b79HNsPAfbvr1Hj5zwjvGq6yvZZ0BAPud0wAvv3Z3deKB97panrODVhqZG+6zki7e2dzcnJN9tLm5OT4SNZo6/abfhK5vb28ffnH18dHxY/Pb21YDfc89Xtje3t7e3j7ad+jB6Orj7ZGj17YP/0F5cXtdOnn/tqStx1+GOQ2/fvrh43VJqtrSxvW1UunI0dXHfzAx26r/OjLgNsAn12rSoVObXhN2+Nw9L4bDLy7Z9e3QyLl7s4vDJ2tPvJTlZx48mTw3Vyo9WEy2kG04fLzetAE+fO7e9vbR42ub239w+u6y1xzblRWvuLn729vb2yOHH25vb2/T/gLAgecOQc8/vzLY5zV360t/cu14TXptemTwgaSl/tfuVoae9L92d3xg+YHTA56/t+G3Fn5n066slEqTc5PfuX01aEbKlUMPRu+XShsn5jQ4UFqUht+aelwqjZ599mrY1lUfPPj34VOP1yWtH5+4t719pr45umS3tPDECffsiVX3raREAzz5rZHn7pS2Fh57GR++4zeoWwsltyE/fHTOa3Zt/fsbyyo/8+DJ/Oz29sjY8qbXQl9rv/1t3QAHhap68u7yo+3t7e2RP3vpmWcWt7evLetsrVQqbTymBwwAT4fYjd8HQ7MXgkHoj8zk7JZ+ohlJZ058qk9Vq0mfalaqSJImj/xWkh7ISHpj+ZqGFyoXvl4fPnno2mhGQWZdoxp+/eObMm8s37977prOPlzvs9LkYUk6+8rUDU1VLoxMb0nrfYPrw1uPy9LkkatbbdXnXt/V8PUHkl7y31YufC3p7KycbZKk1V9E89Amj1zdUuXC10U1f18aaX29r09fnffLu/EvJw8deeWqJN2UKhfuLEiSFgoKAADQM2KzoA+XZaWx+vHKZTuuj0y5fGKocrxcnpsqu7wmcerfrbX24reNtdb+6lpG3meNMca84r2xxjyQ7p6z9uIZf//zpzb8V1Vz5IMbkmqfLfUNSrWZ4yPnzJake+tBYzhqjHlhdHamzwyOGmPMoL/tFX/vCUnS5AtS1XjePy/pS//Nhndv11hrj8ajXFqQBp6RJM0vPU5UoWqMeetFTb5pzFsvavSFqnnhtVckDb87qKpX+tlXRoM6Spp805gXSlLlNWO+/e6gJt/0Y5Wkl6y1g89uW3vxsKTJN4+uLEj67L454Z2sjS9W/XBfEQDgYIs1wPOntOV1b+9+7/pJd091qB461iCrVbPxhTXrN6eNfyNZw2FzV/vMWmuvSjp7IjzgdtBsnz3/p0FD+WD4hRfOmvV7td/dNmNHNXTW6ytq9OI5O7B8Ynxi267LWHv0B+c1+s7zduDui5JG33ne6zTe+600bz0f3JDX5llr7cClZmdhq7wlafLcnUR3u/rW89aWNiePXLX2q2MvauaU/fpu5UWpdOdx9fw5O9D3ivRlnw271MMnbli7ea5UubC+bb/5WJNHblg7Mqi0ymtHS59Om/Wb02ZFq+bETWsH/9vzfrT2asYRAICDJP7skdGKtxzHl3rj07HYbdCJ/llJ0sXPG2U1vKCzR65KUnoI2hv71V/+xn8/9rHR7HAw2nvzpiRNvvxf16SFaPj17qBu1t7SDUkaWpxWrbZ4VpKWJG2t3Zs88smCt230nakbXgjvPrmu6kpQm3Vv1FeSNr4wDc+BNHRPku5dfG5jVhtfyHjHSlvz/dIvNXp6Xdp65pvyxBdS9cmSJo/cKI99vq7aNxdf3HBHtEt3lqXl1+8MnpnaUvXc1dnX16X5YK87BF37TGeH/bqefbiwIE0e+Sd5QU5MtzfuDgDYfzIW4rhbXqxJU+Xli/X6wlptsX5qXNLMda//G7W/o8YY89VvrTHGnJCWFjRsvDHlpVQH7qa1IxPb9v+VtC55Q9Hjqm2+ckKz/5l6ANkbu37BSJr/pdd9rM30vX/e2b/+sWZPD3lvv3zwidf+auB//2vUA7brytkDnvzekKThV6Sb1g5cMv6x0tYz02ZQGvrSGLP+sZd4am6kNH9yaKJsjQn7+oGh8pY0Xh/c+v2MJGlzxTrDyfEhaCkYcJ6VpMkjvzVerCNNQgUAHBCNVt+oPjb1r8o6srFVrt2XsnrAS5I0eeTquqSFyoUvpPWbfhdOE5KkVSP5TdRZf6byc5sPnVKmJs+vS1LlwhfSV1/JeNO5NLwgVb0k/jTt+cqFf9ZbyxuSJo8cGrg2/Pp/hLlMLK0Oeg3mvEal4de9pvIvpm5oaUkaHrqzpdpnkiQbReSZfPk3N3TvaL9UmRj54pDiVn9xdta+P7XtdXKtNzqw/Kfb2zdvTHqd5F/pbIMzKEmqfVZd+dL4Pd2lpbDeU5K8akrS2YfenDbrnb2V4WZZAgAOhHgP2GrEm4SlR/X+kdiudA84pvaZteMvWWvt4B8aa7+W5N0D9m5nVoakmb73j89tLh05/5toxtbUv68HR9uLPzqXMZ1rKypg8JlvJGn29Pw1SRq/s+btKi+N/+C8c8j0trVeL7P6wuTfnF+tXZJUfUXyJmE5N1hfevOrf7qh6js3t0sa3P6XjHrdtBfn1tbqztNa2rzx5skbmqln3dldq5ek2fK6jl/wt8xbOz5Skrz5Wcas3+sLZ1k5PeBK/9L2OD1gAHh6xBrg6n2V/MeQxtY2V5w982vlcvkNTVw5eaHc6AnZ6uyXxpw4+yffBBOXb0a3cyfKr357YvvGiT+4d/Xmv5ZejB1Xv94wujeNueiNap8dlAYeP7d2/ILG76ypMvGxpubePi/99YuS5m/1lTIOr4zdkaSlofOTf3P04SvSzdgDRgP3vrph1zW68vOHg+dK8xkTn0ZPSLOnh54dvSTpHb+Rr33z40PPqXZ3dVCa/J/xcrdOH5OO3Xn87JMlaf23Gn6+pMrQypYUTBsffHY7/EfAsD8+Pi7VPvt6S9Zrj1cang8AwIERG4J+tBEMIVfvq+wuKjE296P/VZ55Y+Fu3Vz8fOxuZlbz0uSR367O/oVuxHcMPLkxurG6MiFv4HV1VcPeJCxJUumZdFarxhuI/XerX3lbatborakblUfT5mZl1fxpfeQ/dHPtgdHvr52VajOvH19OPwn1zPrjmf570i9VvdU/O3I+imvonlQZO3V1QZNHDi1f0/ULl7ImHm+98rHWP1xX5YKR1m74k8uefeH6gjQ//PrH+upmfLrU6sL5VfVPb00Nv/6xhk9e3Tx2r29ju8FjvTeTL7yZX8HgOwDgKVEun9P4ce9R3/dKlePnwj0T39H4D7zHkiaufKc0LimYKRV4Zfhd75FZqfKaeUWTfxM8P2SMOaF3zrsHvDJ88UXp7AlVvcd1h991sxr0HlWqvjDyWtYob3Ojr4S5eZO2Rr030cNPmnwz2Cdp1H9Id/JvXtTwxf8zDOL988mc2xeeg7BY94TFz98JOSfohazuPADgQHG/D3jyU12YzXNQD38f8Ojpq8NDd7bkT6/aK5WLazeCh7IAAEhzGuA3PtWZucYpHT3cAPeKyoUvghFlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAnDkUvy3sXBQAAT4X6XgcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBzh6KX5b2LAgCAp0I9fNW3h1EAAPDUogEGAGAP0AADALAHOmuAL9t6qdLlSGL66qfGi8wfAIC9FW+Aq9+q77Dlu1gPHWvz0Ml6/aT/8sopba5IOjI0UD91/P0wyZWLA/X6qZf/Inj/o4vlerDhR98aqNfL727sJHoAAHZJf+zdoylpZmyPQnFs3NJ2TerbWJNm9OvxWW/zlc+nJc3M3KvUvA2/mlaw4fv/15aklQ/H7g/sTcwAALQh3gMeW5PU91c7yO+rcrl8TjpTLpeXO89lbkuD0vcfr2nsf7yqmbo/3P3NtCp//fxJzYZt7MTY5f8xOKTZkSvXtnTm8n8f0sC5HUQPAMAuiTXA1fuS1P+JVB2qn3p3bKB+/H1duVgeqNdPvfy+pCsXy/X6qfI7kvTtb9Xrx9+XdORbA/X68XczMq+ODdTrp469HWZ3slIdq9dP/kWUU3VsoO7lfvFT6Va9frwiaVmVFelftzS+8eHpkvpHJElXlqXjH8w/lPqCG9D9y598+G5N0sYtyXxyaFIz64WcJwAAuqoUvexX3+PH4y9/s1quq7JVW72+8lgPZv7bf6wuPpZW79ZGHlRLn9al1frGqRtP7I1vpAerP/yi78n1x9KD6z+YCTI6uqLhmqTv/9fSY2n1oe0zfnarzywuSatr9TCnV35bl7R6d+a/Lc5JkoY2raqPamMr0gtzGtq06wO11f4NSVp7VNNgXZfuarvfSpIePpCu3Fp/PP7wbunxRN+D64dWNFrbtZMHAEB7NsNXsR7w2Jq2Pwv7l2OXT5RU+zedH7tU/tuTmrEa+UQTV/r+9tXoiP5Pvv94rfLX/2NwSL9LTou+srqlM5ffc0eMtbIlSX0VJ6cfXP4fJ0qq/dtXb0hnyuXFmvSoLhPLyrtT/fKiNCjdGtKJkWDPkYF//Hxt/A9rZ9a0sCIdkbYKnZ4NAEBXuA1w9b4mBv8kGPGdGPzk4aRkZv9zeVr/8Jy3X+u/GPiHrxYlTVzpO1GS9K9bGvrgw+PlYJw48vjXmjCffPSc1PeupLG+/z6kiSt9g9LKe2FOH5lffvLhw8n4kWNrlRVJRpod2Hi5dSX6/20nt60BANh9bgP8qK7NlanvObdRjbR17MrFoYGBTyW9vKiJoWDXwm8GDh+XdEG6W6/fnktn/ZuKFlakW0Na+Yk0MThga1r4zcCflCRFOVUvlgfqn8cOrN7X8fckzZ+U7m7/ZE4abBj/w43/8d+HZu5+2H7NAQDYQ+5jSGOfa1aLt505Tr+X9O1/2sqV08yFfCUeir07sno7leLRhh79WNJ89dzi2sSJ/9ya8Lb/7vic1qUzn2rB+eKIDzW2psO3htZO9Nf0UCpxDxgA0PucHrA3B1qSZkf8F89KpftbGv/zy29I+t1xzawlM7gujZXL5XK5PJvY852aToxIZ9Y08l7yqDCno2s689eXX43tXF/zu8fzdzfK959safNtSdK3K5KRfi/58V1++S8kXTkl6bs1zUjVU5LNW3UAAPaO0wA/qmv8eLn8/EnJG4O+8n8sSEbS9s+HrKT5U9L6uxtXLh53MviTkgaOva23L5aTk5+e+Z5m7NuXv5G2f5HY9ZMwp5pk//76Q0m6NaTF9yVdeS1ocSVdufi1VP7xZVs/Nf7hMWnx/eoRabs2Wa8fr+g/f/buxpXpKenRwBnJvv2tKU00Hq4GAKBnOEPQY59ruybNX5xT37s/1YyuSzrz9hdDa3f1j5KklZNztQ/1j3IXq/yXZ/pndFcfqVJS3IffL23duiVpvN6f2BXldGpOd+WNQn/3p6r9ncbrj3+t7R9Lki5+rn+UdOVn/jTq55ana38naTz8OsXah/pHSWf+5Mffv+UVtnGblbAAAL3P6QHf9yc73R3S7Lyk7wxpYuz8j5+bGJIqr0rS/NuvjkgaecnNYfuHbw9JEyN/kBpn/pfT54akibGL6buyYU6vvTokjZ+TpI+OnZRU0r9uub3Yie/89S+CJvXDV18dkia+810/w4HJk0OSxq9882P9y9+8PSSNXGElSgDAfuBMiXImNqn6eG6iP3lTd3dc+Xx6vM5EKgDAQRQO4fbg9wH7X8QAAMBB1nsNsPdFDAAAHGip6VF7bqqsvRn7BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADX/wcYuT1/Uq/zMAAAAABJRU5ErkJggg==

[test8]:data:image/png;base64,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

[test9]:data:image/png;base64,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
