---
layout: post
title:  "区块、布局与框架"
date:   2019-05-01 19:15:19 +0800
categories: notes html base
tags: HTML 基础 div span iframe
excerpt: "布局控制元素块与iframe"
---

## 区块

HTML 区块元素：  
大多数 HTML 元素被定义为块级元素或内联元素。  
块级元素在浏览器显示时，通常会以新行来开始（和结束）。如：`<h1>`, `<p>`, `<ul>`, `<table>`

HTML 内联元素：  
内联元素在显示时通常不会以新行开始。`<b>`, `<td>`, `<a>`, `<img>`

### &emsp;1. \<div>标签

`<div>` 元素是块级元素，它可用于组合其他 HTML 元素的容器。

`<div>` 元素没有特定的含义。除此之外，由于它属于块级元素，浏览器会在其前后显示折行。

如果与 CSS 一同使用，`<div>` 元素可用于对大的内容块设置样式属性。

`<div>` 元素的另一个常见的用途是文档布局。它取代了使用表格定义布局的老式方法。使用 `<table>` 元素进行文档布局不是表格的正确用法。`<table>` 元素的作用是显示表格化的数据。

### &emsp;2. \<span>标签

与div元素类似，对文档中的行内元素进行组合。

`<span>` 标签没有固定的格式表现。当对它应用样式时，它才会产生视觉上的变化。如果不对 `<span>` 应用样式，那么 `<span>` 元素中的文本与其他文本不会任何视觉上的差异。  

`<span>` 标签提供了一种将文本的一部分或者文档的一部分独立出来的方式。

&emsp;

## 布局

### &emsp;1. div布局

大多数的布局一般都是采用div布局，这样的元素布局没有别的特效，但是胜在比较灵活。一般通过float和flex控制元素定位。

### &emsp;2. table布局

虽然table标签用于定义表格，但是同样，表格里一般是文本，但是一样可以包含元素，所以也可以使用table的一系列标签进行布局，如thead用于定义页面头部，col属性规定行宽等。

当然，即使可以使用 HTML 表格来创建漂亮的布局，但设计表格的目的是呈现表格化数据 - 表格不是布局工具。

&emsp;

## \<iframe>标签（框架）

`<iframe>`的定义是：使用框架，你可以在同一个浏览器窗口中显示不止一个页面。

<span style="color:aqua">格式：</span>`<iframe src="URL"></iframe>`

也可以通过与`<a>`并联来改变`<iframe>`目标指向：

```html
<iframe src="" name="iframe_a"></iframe>
<p><a href="//www.baidu.com" target="iframe_a">百度</a></p>
```

因为 a 标签的 target 属性是名为 iframe_a 的 iframe 框架，所以在点击链接时页面会显示在 iframe框架中。

### &emsp;1. height和width属性

设置框架长宽。

<span style="color:aqua">格式：</span>`<iframe width="" height=""></iframe>`

数值如果是数字，就默认以px为单位。

### &emsp;2. name属性

设置框架名字。

### &emsp;3. sandbox属性

如果指定了空字符串（sandbox=""），该属性对呈现在iframe框架中的内容启用一些额外的限制条件。

sandbox 属性的值既可以是一个空字符串（将会启用所有的限制），也可以是用空格分隔的一系列指定的字符串。

HTML 5通过sandbox属性提升iFrame的安全性。sandbox属性可以防止不信任的Web页面执行某些操作。

HTML 5规范的编辑Ian Hickson谈到了sandbox的好处，它可以防止如下操作：  
访问父页面的DOM（从技术角度来说，这是因为相对于父页面iframe已经成为不同的源了）  
执行脚本  
通过脚本嵌入自己的表单或是操纵表单  
对cookie、本地存储或本地SQL数据库的读写  

Opera 和 Internet Explorer 9 及之前的版本不支持 sandbox 属性。

<span style="color:aqua">格式：</span>`<iframe sandbox="值"></iframe>`

值|说明
:-:|:--
""|启用所有限制条件
allow-same-origin|允许将内容作为普通来源对待。如果未使用该关键字，嵌入的内容将被视为一个独立的源。
allow-top-navigation|嵌入的页面的上下文可以导航（加载）内容到顶级的浏览上下文环境（browsing context）。如果未使用该关键字，这个操作将不可用。
allow-forms|允许表单提交。
allow-scripts|允许脚本执行。

### &emsp;4. seamless属性

是一个布尔属性。规定 `<iframe>` 看起来像是包含的文档的一部分（没有边框和滚动条）。

只有 Chrome 和 Safari 6 支持 `<iframe>` 标签的 seamless 属性。

<span style="color:aqua">格式：</span>`<iframe seamless>`

### &emsp;5. src属性

设置框架目标指向网页。

<span style="color:aqua">格式：</span>`<iframe src=""></iframe>`

### &emsp;6. srcdoc属性

规定要显示在内联框架中的页面的 HTML 内容。

该属性应该与 sandbox 和 seamless 属性一起使用：
如果浏览器支持 srcdoc 属性，且指定了 srcdoc 属性，它将覆盖在 src 属性中规定的内容。  
如果浏览器不支持 srcdoc 属性，且指定了 srcdoc 属性，它将显示在 src 属性中规定的文件。  

只有 Chrome 和 Safari 6 支持

<span style="color:aqua">格式：</span>`<iframe srcdoc="HTML元素">`
