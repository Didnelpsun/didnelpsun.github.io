---
layout: post
title:  "HTML基础1"
date:   2019-04-18 19:23:01 +0800
categories: notes html
tags: html HTML 基础 1 首部
excerpt: "html构建与首部标签"
---

## HTML介绍

HTML是描述网页的语言，即超文本标记语言(Hyper Text Markup Language)，并不是编程语言而是标记语言。文件后缀以.html和.htm，没有区别。  

首先开头是声明`<!DOCTYPE>表明该html是H5版本。`  
在html中的标签大部分都是成对出现，如果是单标签最好以/>结尾来闭合标签，一般是没有内容的空标签。  
首尾都有`<html></html>`标签包裹。  
`<head></head>`标签是头标签，用于说明html文档的格式等。  
`<body></body>`标签提供html整体内容，给我们呈现的样式。  
`<head></head>`标签保存着网站元数据。控制全局属性。

&emsp;  

## 首部标签

### &emsp;1.head的lang属性

表明显示的语言，en就是英语，zh就是中文，可以省略不写。  
<font color="aqua">格式</font>`<element lang="语言编号">`  
<font color="orange">注意：</font>lang 属性在以下标签中无效：`<base>, <br>, <frame>, <frameset>, <hr>, <iframe>, <param> 以及 <script>`。

### &emsp;2.`<title>`标签

提供标题取代整个网站的名字。

### &emsp;3.`<meta>`标签

控制整个网页元数据，仅在`<head></head>`标签中。

#### &emsp;&emsp; 3.1charset属性

规定html文档字符编码，一般编码为UTF-8。  
charset 属性可以通过任意元素上的 lang 属性来重写。
<font color="aqua">格式：</font>`<meta charset="编码形式">`
