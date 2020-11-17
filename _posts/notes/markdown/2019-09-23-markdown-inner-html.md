---
layout: post
title:  "嵌入HTML"
date:   2019-09-23 09:12:42 +0800
categories: notes markdown base
tags: Markdown 基础 链接 图片
excerpt: "实现样式"
---

## 嵌入html

因为markdown十分简介，所以十分易学，但是与此同时会丧失很多功能，最大的丧失就是对于样式控制的丧失。

### &emsp;1. 文字

对于markdown文件是不能通过文字来设置样式的（也有些可以，但是不是所有转换器都支持），对于普遍的用法是嵌入html元素。

如`$\color{aqua}{格式}$`这种表示方法在vscode编辑器上就能显示颜色，但是别的就不一定支持。因为这是mathjax的格式。

对于字，是使用font元素。

face属性代表字体，size代表字号，color代表字色。

<span style="color:aqua">格式：</span>

```markdown
<span face="字体">字体</span>
<span size="字号">字号</span>
<span color="字色">字色</span>
```

### &emsp;2. 图片

设置图片大小一般还是使用`<img>`标签，通过style属性控制样式。
