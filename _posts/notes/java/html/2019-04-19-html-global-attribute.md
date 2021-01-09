---
layout: post
title:  "全局属性"
date:   2019-04-19 08:12:21 +0800
categories: notes html base
tags: HTML 基础 全局 属性 class id style
excerpt: "标签所公有的属性"
---

总的来说，一般使用的全局属性也就是id、class、style、title属性，如果要利用js传输数据可能会使用到data属性。  

## accesskey属性

规定激活元素（使元素获得焦点）的快捷键。  

<span style="color:aqua">格式：</span>`<元素 accesskey="激活该元素的快捷键">`

以下元素支持 accesskey 属性：`<a>`, `<area>`, `<button>`, `<input>`, `<label>`, `<legend>`以及 `<textarea>`。
实例：`<a href="http://www.w3school.com.cn/html/" accesskey="h">HTML</a><br />`
`<a href="http://www.w3school.com.cn/css/" accesskey="c">CSS</a>`

&emsp;

## class属性

规定元素的一个或多个类名（引用样式表中的类）。class 属性大多数时候用于指向样式表中的类（class）。不过，也可以利用它通过 JavaScript 来改变带有指定 class 的 HTML 元素。

<span style="color:aqua">格式：</span>`<元素 class="类名">` 如需为一个元素规定多个类，用空格分隔类名。  

class 属性不能在以下 HTML 元素中使用：`<base>`, `<head>`, `<html>`, `<meta>`, `<param>`, `<script>`, `<style>` 以及 `<title>`。  

<span style="color:yellow">提示：</span>可以给 HTML 元素赋予多个 class，例如：`<span class="left_menu important">`。这么做可以把若干个 CSS 类合并到一个 HTML 元素。  

<span style="color:yellow">提示：</span>类名不能以数字开头！只有 Internet Explorer 支持这种做法。  

实例：`<h1 class="intro">`

&emsp;

## contenteditable属性

规定元素内容是否可编辑。如果元素未设置 contenteditable 属性，那么元素会从其父元素继承该属性。

<span style="color:aqua">格式：</span>`<元素 contenteditable="true|false">`  

实例：`<p contenteditable="true">这是一个可编辑的段落。</p>`

&emsp;

## contextmenu属性

规定 `<div>` 元素的上下文菜单。上下文菜单会在用户右键点击元素时出现。contextmenu 属性的值是要打开的 `<menu>` 元素的 id。

<span style="color:aqua">格式：</span><元素 contextmenu="菜单id">`

<span style="color:orange">注意：</span>目前只有 Firefox 支持 contextmenu 属性。

实例：  

```html
<div contextmenu="mymenu">
    <menu type="context" id="mymenu">
        <menuitem label="Refresh"></menuitem>
        <menuitem label="Twitter"></menuitem>
    </menu>
</div>
```

&emsp;

## data-*属性

使用 data-* 属性来嵌入自定义数据。  

data-* 属性用于存储页面或应用程序的私有自定义数据。  

data-* 属性赋予我们在所有 HTML 元素上嵌入自定义 data 属性的能力。  

存储的（自定义）数据能够被页面的 JavaScript 中利用，以创建更好的用户体验（不进行 Ajax 调用或服务器端数据库查询）。  

data-* 属性包括两部分：属性名不应该包含任何大写字母，并且在前缀 "data-" 之后必须有至少一个字符。属性值可以是任意字符串。
用户代理会完全忽略前缀为 "data-" 的自定义属性。  

<span style="color:aqua">格式：</span>`<元素 data-*="规定属性的值（以字符串）">`

实例：

```html
<ul>
    <li data-animal-type="鸟类">喜鹊</li>
    <li data-animal-type="鱼类">金枪鱼</li>
    <li data-animal-type="蜘蛛">蝇虎</li>
</ul>
```

&emsp;

## dir属性

规定元素内容的文本方向。  

<span style="color:aqua">格式：</span>`<元素 dir="ltr|rtl">`ltr：默认。从左向右的文本方向。rtl：从右向左的文本方向。  

dir 属性在以下标签中无效：`<base>`, `<br>`, `<frame>`, `<frameset>`, `<hr>`, `<iframe>`, `<param>` 以及 `<script>`。  

实例：`<p dir="rtl">Write this text right-to-left!</p>`

&emsp;

## draggable属性

规定元素是否可以拖动，连接和图像默认是可以推动。  

<span style="color:aqua">格式：</span>`<元素 draggable="true|false|auto">` true是可以，false是不可，auto是使用默认行为。  

实例：`<p draggable="true">这是一个可拖动的段落。</p>`

&emsp;

## dropzone属性

拖动数据会产生被拖动数据的副本，基本不支持。  

<span style="color:aqua">格式：</span>`<元素 dropzone="copy|move|link">` copy移动会复制，move移动会使数据移动到新位置，link移动数据会产生指向原始数据的连接。  

&emsp;

## hidden属性

规定元素是否应该被显示，一般为显示。  

<span style="color:aqua">格式：</span>`<元素 hidden>`  

在xhtml中必须为`<元素 hidden="hidden">`  

&emsp;

## id属性  

规定元素唯一的id，且id不可以重复。可以用来作为连接锚或者引入CSS样式表。  

<span style="color:aqua">格式：</span>`<元素 id="id值">`

&emsp;

## lang属性  

规定元素显示语言。

<span style="color:aqua">格式：</span>`<元素 lang="语言码">`  

lang 属性在以下标签中无效：`<base>`, `<br>`, `<frame>`, `<frameset>`, `<hr>`, `<iframe>`, `<param>` 以及 `<script>`。

&emsp;

## spellcheck属性  

规定是否对元素进行拼写和语法检查。  
可以检查：`<input>` 元素中的文本值（非密码）、`<textarea>` 元素中的文本、可编辑元素中的文本。

<span style="color:aqua">格式：</span>`<元素 spellcheck="true|false">`

实例：`<p contenteditable="true" spellcheck="true">拼写检查的段落。</p>`

&emsp;

## style属性

规定元素的行内样式（inline style）style 属性将覆盖任何全局的样式设定，例如在 `<style>` 标签或在外部样式表中规定的样式。  

<span style="color:aqua">格式：</span>`<元素 style="样式值">` 不同样式由分号分隔  

实例：
`<h1 style="color:blue; text-align:center">This is a header</h1>`

&emsp;

## tabindex属性

指定元素tab键顺序的链接。（当tab键用于导航时）

<span style="color:aqua">格式：</span>`<元素 tabindex="顺序">` 1是第一个  

以下元素支持 tabindex 属性：`<a>`, `<area>`, `<button>`, `<input>`, `<object>`, `<select>` 以及 `<textarea>`。  

实例：

```html
<a href="http://www.w3school.com.cn/" tabindex="2">W3School</a>
<a href="http://www.google.com/" tabindex="1">Google</a>
<a href="http://www.microsoft.com/" tabindex="3">Microsoft</a>
```

&emsp;

## title属性

规定关于元素的额外信息。这些信息通常会在鼠标移到元素上时显示一段工具提示文本（tooltip text）。

<span style="color:yellow">提示：</span>title 属性常与 `<form>` 以及 `<a>` 元素一同使用，以提供关于输入格式和链接目标的信息。同时它也是 `<abbr>` 和 `<acronym>` 元素的必需属性。  

<span style="color:aqua">格式：</span>`<元素 title="值">`

实例：`<abbr title="People's Republic of China">PRC</abbr> was founded in 1949. `

&emsp;

## tanslate属性

规定是否应该翻译此元素内容。

<span style="color:aqua">格式：</span>`<元素 translate="yes|no">`

基本浏览器没有实现。
