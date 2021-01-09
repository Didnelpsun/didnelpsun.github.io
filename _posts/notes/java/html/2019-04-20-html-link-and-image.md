---
layout: post
title:  "链接和图像"
date:   2019-04-20 21:12:53 +0800
categories: notes html base
tags: HTML 基础 a img map area
excerpt: "a标签和img标签等"
---

## 链接

### &emsp;\<a>标签

用于设置超文本链接。  
超链接可以是一个字，一个词，或者一组词，也可以是一幅图像，您可以点击这些内容来跳转到新的文档或者当前文档中的某个部分。当您把鼠标指针移动到网页中的某个链接上时，箭头会变为一只小手。  

默认情况下，链接将以以下形式出现在浏览器中：  
一个未访问过的链接显示为蓝色字体并带有下划线。  
访问过的链接显示为紫色并带有下划线。  
点击链接时，链接显示为红色并带有下划线。  

<span style="color:aqua">格式：</span>`<a>链接元素（可以为文本，图片或其他元素）</a>`

#### &emsp;&emsp;1. href属性

href 属性描述了链接的目标。

<span style="color:aqua">格式：</span>`<a href="url">链接元素</a>`  

实例：`<a href="www.baidu.com">百度</a>`

#### &emsp;&emsp;2. mailto属性

<span style="color:aqua">格式：</span>在`<a>`中与href配合使用：`<a href=mailto:收信人（邮箱）>send email</a>`

在`<form>`标签中使用：`<form action="mailto:收信人"></form>`

参数列表：  

| 英文 | 含义 |
| :--: | :--: |
|  to  |收信人|
|subject|主题|
|  cc  | 抄送 |
| bcc  | 暗送 |
| body | 内容 |
实例：  

querystring方式：
`<a href="mailto:sample@163.com?subject=test&cc=sample@hotmail.com
&body=use mailto sample">send mail</a>`  
单词之间的空格使用 %20 代替，以确保浏览器可以正常显示文本。  

form方式：  

```html
<form name='sendmail' action='mailto:sample@163.com'>
    <input name='cc' type='text' value='sample@hotmail.com'>
    <input name='subject' type='text' value='test'>
    <input name='body' type='text' value='use mailto sample'>
</form>
```

#### &emsp;&emsp;3. target属性

使用 target 属性，你可以定义被链接的文档在何处显示。  

_self在本页面打开，覆盖原有页面（默认）  
_blank在新的页面打开  
_top这个目标使得文档载入包含这个超链接的窗口，用 _top 目标将会清除所有被包含的框架并将文档载入整个浏览器窗口。  
_parent针对框架：这个目标使得文档载入父窗口或者包含来超链接引用的框架的框架集。如果这个引用是在窗口或者在顶级框架中，那么它与目标 _self 等效。  
框架名：在指定的框架中打开被链接文档。  

#### &emsp;&emsp;4. id属性

可以给链接指定id，然后在别的链接的href以#id的形式指向该链接。

#### &emsp;&emsp;5. name属性

与Id作用类似，也是以#name方式跳转。

&emsp;

## 图像

### &emsp;1. \<img/>标签

`<img>` 是空标签，意思是说，它只包含属性，并且没有闭合标签。

#### &emsp;&emsp;1.1 src属性

要在页面上显示图像，你需要使用源属性（src）。src 指 "source"。源属性的值是图像的 URL 地址。

<span style="color:aqua">格式：</span>`<img src="URL地址">`

#### &emsp;&emsp;1.2 alt属性

alt 属性用来为图像定义一串预备的可替换的文本。在浏览器无法载入图像时，替换文本属性告诉读者她们失去的信息。此时，浏览器将显示这个替代性的文本而不是图像。为页面上的图像都加上替换文本属性是个好习惯，这样有助于更好的显示信息，并且对于那些使用纯文本浏览器的人来说是非常有用的。

<span style="color:aqua">格式：</span>`<img alt="注释">`

#### &emsp;&emsp;1.3 width与height属性

设置图像高度和宽度，默认单位为像素

#### &emsp;&emsp;1.4 float属性（一般使用CSS样式）

控制图片浮动在文字哪里。

<span style="color:aqua">格式：</span>`<img style="float:right|left">`

清除浮动：`<img style="clear:both">`

#### &emsp;&emsp;1.5 usemap属性

usemap 属性将图像定义为客户端图像映射。  
图像映射指的是带有可点击区域的图像。  
usemap 属性与 `<map>` 元素的 name 或 id 属性相关联，以建立 `<img>` 与 `<map>` 之间的关系。

<span style="color:aqua">格式：</span>`<img usemap="# + 要使用的 <map> 元素的 name 或 id 属性">`

### &emsp;2. \<map>标签

定义一个客户端图像映射。图像映射（image-map）指带有可点击区域的一幅图像。

<span style="color:aqua">格式：</span>`<map id="map标签唯一的名称" name="image-map规定的名字"></map>`  

area 元素永远嵌套在 map 元素内部。area 元素可定义图像映射中的区域。
`<img>`中的 usemap 属性可引用 `<map>` 中的 id 或 name 属性（取决于浏览器），所以我们应同时向 `<map>` 添加 id 和 name 属性。

### &emsp;3. \<area>标签

`<area>` 标签定义图像映射内部的区域（图像映射指的是带有可点击区域的图像）。是一个单标签。最好关闭。

`<area>` 元素始终嵌套在 `<map>` 标签内部。

<span style="color:aqua">格式：</span>`<area></area>`

#### &emsp;&emsp;3.1 alt属性

显示图片备注。

#### &emsp;&emsp;3.2 href属性

href 属性规定区域中连接的目标。在 HTML5 中, `<area>` 标签已经不再使用 href 属性， 使用 placeholder 来指定链接。

#### &emsp;&emsp;3.3 hreflang属性

用于指定被链接文档的语言。
仅在使用 href 属性时才可以指定 hreflang 属性。

#### &emsp;&emsp;3.4 media属性

规定目标URL将显示在什么设备上。默认all
该属性使用与指定的URL显示在指定的设备上 (如 iPhone) , 音频或者打印媒介。
该attribute可以接受多个值。
仅在使用了href属性才需要media 属性。
逻辑操作符：and or ,
设备值：

|设备类型英文|  说明  |
| :---: |  :---:  |
|   all  |默认 适应所有设备|
|  aural |语音合成器|
|braille|盲文反馈设备|
|handheld|手持设备（小屏幕，有限的带宽）|
|projection|投影仪|
| print |打印预览模式/打印页数|
| screen |电脑屏幕|
|  tty  |电传打字机和类似使用固定间距字符网格的介质|
|   tv  |电视类型设备（分辨率低，滚动能力有限）|

|控制值英文|控制值含义|说明|示例|
|:-------:|:--------:|:--:|:--:|
|width|指定的显示区域的宽度|通常使用 "min-" 和 "max-" 前缀|media="screen and (min-width:500px)"|
|height|指定的显示区域的高度|通常使用 "min-" 和 "max-" 前缀|media="screen and (max-height:700px)"|
|device-width|指定目标显示/打印纸的宽度|通常使用 "min-" 和 "max-" 前缀|media="screen and (device-width:500px)"|
|device-height|指定目标显示/打印纸的高度|通常使用 "min-" 和 "max-" 前缀|media="screen and (device-height:500px)"|
|orientation|指定目标显示/纸的方向|取值：portrait/landscape|media="all and (orientation: landscape)"|
|aspect-ratio|指定的目标的显示区域的宽度/高度比例|通常使用 "min-" 和 "max-" 前缀|media="screen and (aspect-ratio:16/9)"|
|device-aspect-ratio|指定的目标的显示区域的设备宽度/设备高度比例|通常使用 "min-" 和 "max-" 前缀|media="screen and (aspect-ratio:16/9)"|
|color|指定目标显示每个像素颜色的位数|通常使用 "min-" 和 "max-" 前缀|media="screen and (color:3)"|
|color-index|指定目标显示可以处理的颜色数|通常使用 "min-" 和 "max-" 前缀|media="screen and (min-color-index:256)"|
|monochrome|指定在一个单色的帧缓冲器的像素位数|通常使用 "min-" 和 "max-" 前缀|media="screen and (monochrome:2)"|
|resolution|指定目标显示/纸的像素密度（DPI或DPCM）|通常使用 "min-" 和 "max-" 前缀|media="print and (resolution:300dpi)"|
|scan|指定一个电视显示屏的扫描方法|可能值是 "progressive" 和 "interlace"|media="tv and (scan:interlace)"|
grid|指定输出设备是电网或位图|grid的值为 "1", 其他的为 "0"|media="handheld and (grid:1)"|

#### &emsp;&emsp;3.5 rel属性

rel 属性规定当前文档与被链接文档之间的关系
值：

|英文|含义|
|:--:|:--:|
|alternate|文档的替代版本（比如打印页、翻译或镜像）|
|author|链接到文档的作者|
|bookmark|用于书签的永久网址|
|help|链接到帮助文档|
|license|链接到文档的版权信息|
|next|选项中的下一个文档|
|nofollow|是一个HTML标签的属性值，这个标签的意义是告诉搜索引擎"不要追踪此网页上的链接"或"不要追踪此特定链接"|
|noreferrer|如果用户点击链接指定浏览不要发送 HTTP referer 头部信息|
|prefetch|指定的目标文件应该被缓存|
|prev|选项中的前一个文档|
|search|文档链接到搜索工具|
|tag|当前文档的标签(关键词)|

#### &emsp;&emsp;3.6 target属性

target 属性规定区域中连接的目标。

#### &emsp;&emsp;3.7 type属性

type 属性指定了目标 URL 的 MIME 类型。  
该属性仅在 href 属性设置后才使用type属性。  

<span style="color:aqua">格式：</span>`<area type="链接文档的 MIME 类型。"></area>`

MIME= Multipurpose Internet Mail Extensions。

#### &emsp;&emsp;3.8 coords属性

规定选定区域坐标。以x，y为基准，图像左上角的坐标为0.0，与shape属性配合使用。

<span style="color:aqua">格式：</span>`<area cooords="坐标"></area>`  

属性值|含义
:--:|:----  
x1,y1,x2,y2|如果 shape 属性设置为 "rect"，则该值规定矩形左上角和右下角的坐标。  
x,y,radius|如果 shape 属性设置为 "circ"，则该值规定圆心的坐标和半径。  
x1,y1,..,xn,yn|如果 shape 属性设置为 "poly"，则该值规定多边形各顶点的值。如果第一个坐标和最后一个坐标不一致，那么为了关闭多边形，浏览器必须添加最后一对坐标。  

#### &emsp;&emsp;3.9 shapes属性

指定了区域的形状。

<span style="color:aqua">格式：</span>`<area shape="default|rect|circle|poly">`  

属性值：  
default 规定全部区域  
rect  定义矩形区域  
circ  定义圆形  
poly  定义多边形区域  

实例：

```html
<img src="planets.gif" alt="Planets" usemap="#planetmap" />
<map name="planetmap">
  <area href="sun.htm" shape="rect" coords="0,0,110,260">Sun</area>
  <area href="mercur.htm" shape="circle" coords="129,161,10">Mercury</area>
  <area href="venus.htm" shape="circle" coords="180,139,14">Venus</area>
</map>
```
