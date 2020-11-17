---
layout: post
title:  "安装配置"
date:   2020-06-12 11:16:29 +0800
categories: notes mathjax base
tags: Mathjax 基础 安装 配置
excerpt: "Mathjax安装配置"
---

MathJax是一个能将LaTeX，MathML和AsciiMath表示的数学式在现代浏览器网页上正确呈现现出来的开源JavaScript显示引擎。使用时，只需在网页上包含进MathJax，之后按LaTeX,MathML或AsciiMath的规则编写的数学式将被JavaScript转换成HTML、SVG或MathML格式的同等式正确显示，它不要求客户端进行插件等的下载。

## 加载

在\<head>标签中加入：`<script type="text/javascript" async src="//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML">
</script>`

## 配置

这种格式通过用数学分隔符将数学式包围起来，使Mathjax能区分哪些是数学式，哪些是普通文本。有两种形式：一种是在段落内的，叫in-line mathematics；另一种是独立成段的，叫displayed mathematics。

displayed mathematics的默认分隔符是$$...$$和\[...\]，而in-line mathematics 的默认分隔符是 (\...\),如果要想使用 $...$ 作为分隔符，需要加上如下的配置：

```html
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>
```

详细的配置可以到[官网](https://www.mathjax.org/)

我的配置如下：

```html
<script type="text/x-mathjax-config">
    var mathId = document.getElementById("post-container");//选择公式识别范围
    MathJax.Hub.Config({
        showProcessingMessages: false,//关闭js加载过程信息
        messageStyle: "none",//不显示信息
        extensions: ["tex2jax.js"],
        jax: ["input/TeX", "output/HTML-CSS"],
        tex2jax: {
            inlineMath:  [ ["$", "$"] ],//行内公式选择符
            displayMath: [ ["$$","$$"] ],//段内公式选择符
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre','code','a'],//避开某些标签
            ignoreClass:"comment-content" //避开含该Class的标签
        },
        "HTML-CSS": {
            availableFonts: ["STIX","TeX"],//可选字体
            showMathMenu: false //关闭右击菜单显示
        }
    });
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,mathId]);//选择公式识别范围
</script>
```
