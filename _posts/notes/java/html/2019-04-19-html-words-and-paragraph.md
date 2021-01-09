---
layout: post
title:  "文本与段落"
date:   2019-04-19 16:21:48 +0800
categories: notes html base
tags: HTML 基础 文本 段落 格式化 计算机 引用 说明
excerpt: "文本和段落标签属性"
---

&emsp;

## \<hn>标签

`<h1>`~`<h6>`定义不同大小标题，`<h1>`是最大的标题，`<h6>`是最小的标题，浏览器自动在标题前后加空行。

<span style="color:aqua">格式：</span>`<h1>`内容`</h1>`

我们应该确保将 HTML 标题标签只用于标题。不要仅仅是为了生成粗体或大号的文本而使用标题。搜索引擎使用标题为的网页的结构和内容编制索引。因为要让其他用户可以通过标题来快速浏览的网页，所以用标题来呈现文档结构是很重要的。  

应该将h1用作主标题（最重要的），其后是h2（次重要的），再其次是h3，以此类推。  

&emsp;

## \<p>标签

用于定义每个段落。由于`<p>`是块级元素，所以会在段前段后加空行。  

&emsp;

## \<br/>标签

换行，是单标签。

&emsp;

## \<hr/>标签

`<hr/>` 标签在 HTML 页面中创建水平线以分割内容。

&emsp;

## \<!-- -->标签

用于注释，其中的内容不会显示

<span style="color:aqua">格式：</span>`<!--注释-->`

&emsp;

## 文本格式化标签（基本以CSS替代）

### &emsp;1. \<b>标签

定义粗体文本。

### &emsp;2. \<em>标签

定义斜体字。

### &emsp;3. \<i>标签

定义斜体字。

### &emsp;4. \<small>标签

定义小号字。

### &emsp;5. \<strong>标签

定义加重语气。

### &emsp;6. \<sub>标签

定义下标字。下标文本将会显示在当前文本流中字符高度的一半为基准线的下方，但是与当前文本流中文字的字体和字号都是一样的。下标文本能用来表示化学公式，比如 H2O。

<span style="color:aqua">格式：</span>`<sub>下标</sub>`

### &emsp;7. \<sup>标签

定义上标字。上标文本将会显示在当前文本流中字符高度的一半为基准线的上方，但是与当前文本流中文字的字体和字号都是一样的。上标文本能用来添加脚注。

<span style="color:aqua">格式：</span>`<sup>上标</sup>`

### &emsp;8. \<ins>标签

定义插入字。字下加下划线。  
cite属性：归档一个文本被插入的原因的文档的URL  
Datetime属性：以YYYY-MM-DDThh:mm:ssTZD规定文本被插入的日期和时间  

### &emsp;9. \<del>标签

定义删除字，字上加横杠。
cite属性：归档一个文本被删除的原因的文档的URL
Datetime属性：以YYYY-MM-DDThh:mm:ssTZD规定文本被删除的日期和时间

&emsp;

## 计算机输出标签

### &emsp;1. \<code>标签

定义计算机代码文本。

### &emsp;2. \<samp>标签

定义计算机程序的样本文本。

### &emsp;3. \<var>标签

定义变量。

### &emsp;4. \<pre>标签

定义预格式化文本，被包围在`<pre>`标签中的文本会保留空格和换行符，文本会呈现等宽字体。

&emsp;

## 定义说明与引用标签

### &emsp;1. \<abbr>标签

`<abbr>` 标签用来表示一个缩写词或者首字母缩略词，如"WWW"或者"NATO"。
通过对缩写词语进行标记，您就能够为浏览器、拼写检查程序、翻译系统以及搜索引擎分度器提供有用的信息。在某些浏览器中，当您把鼠标移至带有 `<abbr>` 标签的缩写词/首字母缩略词上时，`<abbr>` 标签的 title 属性可被用来展示缩写词/首字母缩略词的完整版本。  

实例：`The<abbr title="World Health Organization">WHO</abbr> was founded in 1948.`

### &emsp;2. \<address>标签

`<address>` 标签定义文档作者/所有者的联系信息。  

如果 `<address>` 元素位于 `<body>` 元素内部，则它表示该文档作者/所有者的联系信息。

如果 `<address>` 元素位于 `<article>` 元素内部，则它表示该文章作者/所有者的联系信息。

`<address>` 元素的文本通常呈现为斜体。大多数浏览器会在该元素的前后添加换行。

不应该使用 `<address>` 标签来描述邮政地址，除非这些信息是联系信息的组成部分。

<span style="color:orange">注意：</span>`<address>` 元素通常被包含在 `<footer>` 元素的其他信息中。

实例：

```html
<address>
Written by <a href="mailto:webmaster@example.com">Jon Doe</a>.<br> 
Visit us at:<br>
Example.com<br>
Box 564, Disneyland<br>
USA
</address>
```

### &emsp;3. \<bdo>标签

bdo指的是bidi覆盖（Bi-Directional Override）。`<bdo>` 标签用来覆盖默认的文本方向。

<span style="color:aqua">格式：</span>`<bdo dir="值"></bdo>` 有ltr和rtl两个值。

### &emsp;4 \<blockquote>标签

`<blockquote>` 标签定义摘自另一个源的块引用。浏览器通常会对 `<blockquote>` 元素进行缩进。如果标记是不需要段落分隔的短引用，请使用 `<q>`。

### &emsp;5 \<q>标签

`<q>` 标签定义一个短的引用。浏览器经常会在这种引用的周围插入引号。还有cite属性，用于规定引用的源URL。

### &emsp;6. \<cite>标签

定义作品（比如书籍、歌曲、电影、电视节目、绘画、雕塑等等）的标题。

### &emsp;7. \<dfn>标签

是一个短语标签，用来定义一个定义项目。

### &emsp;8. \<kbd>标签

定义键盘文本。经常用在于计算机相关的文档和手册中。
