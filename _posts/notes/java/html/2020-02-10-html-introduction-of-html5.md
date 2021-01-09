---
layout: post
title:  "HTML5的说明"
date:   2020-02-10 21:44:23 +0800
categories: notes html html5
tags: HTML HTML5 元素 兼容 shiv
excerpt: "H5的新特性与新元素"
---

HTML5的设计目的是为了在移动设备上支持多媒体。

HTML5 中主要有如下特性：  
用于绘画的 canvas 元素  
用于媒介回放的 video 和 audio 元素  
对本地离线存储的支持  
新的特殊内容元素，比如 article、footer、header、nav、section  
新的表单控件，比如 calendar、date、time、email、url、search  

HTML5移除的元素：  
`<acronym>` `<applet>` `<basefont>` `<big>` `<center>` `<dir>` `<font>` `<frame>` `<frameset>` `<noframes>` `<strike>`

## 对于元素的支持与兼容

现代的浏览器都支持 HTML5。此外，所有浏览器，包括旧的和最新的，对无法识别的元素会作为内联元素自动处理。正因为如此，可以让浏览器处理未知的 HTML 元素。

### &emsp;定义样式

HTML5 定了 8 个新的 HTML 语义（semantic） 元素。所有这些元素都是 块级 元素。为了能让旧版本的浏览器正确显示这些元素，你可以设置 CSS 的 display 属性值为 block:

```html
header, section, footer, aside, nav, main, article, figure {
    display: block;
}
```

### &emsp;定义元素

同时也可以为html增加新的元素：

```html
<style>
myHero {
    display: block;
    background-color: #ddd;
    padding: 50px;
    font-size: 30px;
}
</style>
<body>
    <h1>我的第一个标题</h1>
    <p>我的第一个段落。</p>
    <myHero>我的第一个新元素</myHero>
</body>
```

### &emsp;shiv

Internet Explorer 8 及更早 IE 版本的浏览器不支持以上的方式。

我们可以使用 Sjoerd Visscher 创建的 "HTML5 Enabling JavaScript", " shiv" 来解决该问题:

```html
<!--[if lt IE 9]>
  <script src="http://cdn.static.runoob.com/libs/html5shiv/3.7/html5shiv.min.js"></script>
<![endif]-->
```

以上代码是一个注释，作用是在 IE 浏览器的版本小于 IE9 时将读取 html5.js 文件，并解析它。国内用户请使用本站静态资源库（Google 资源库在国内不稳定）：

针对IE浏览器 html5shiv 是比较好的解决方案。html5shiv主要解决HTML5提出的新的元素不被IE6-8识别，这些新元素不能作为父节点包裹子元素，并且不能应用CSS样式。
