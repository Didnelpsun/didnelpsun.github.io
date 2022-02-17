---
layout: post
title:  "JavaBean定义"
date:   2020-02-18 17:15:25 +0800
categories: notes java other
tags: Java 其他 Javabean bean other 打包
excerpt: "bean对逻辑的打包"
---

Bean在计算机英语中，就是指可重用组件的含义。而JavaBean就是指用Java定义的可重用组件，所以这个概念是远大于Java实体类的定义的。

Java语言欠缺属性、事件、多重继承功能。所以，如果要在Java程序中实现一些面向对象编程的常见需求，只能手写大量胶水代码。Java Bean正是编写这套胶水代码的惯用模式或约定。这些约定包括getXxx、setXxx、isXxx、addXxxListener、XxxEvent等。

JavaBean是描述Java的软件组件模型，有点类似于Microsoft的COM组件概念。在Java模型中，通过JavaBean可以无限扩充Java程序的功能，通过JavaBean的组合可以快速的生成新的应用程序。对于程序员来说，最好的一点就是JavaBean可以实现代码的重复利用，另外对于程序的易维护性等等也有很重大的意义。

所以JavaBean的概念远大于实体类的概念。

比如说一个购物车程序，要实现购物车中添加一件商品这样的功能，就可以写一个购物车操作的JavaBean，建立一个public的AddItem成员方法，前台JSP文件里面直接调用这个方法来实现。如果后来又考虑添加商品的时候需要判断库存是否有货物，没有货物不得购买，在这个时候我们就可以直接修改JavaBean的AddItem方法，加入处理语句来实现，这样就完全不用修改前台JSP程序了。

简单来说，JavaBean，是对Java代码同一逻辑的组合和封装，用户可以使用JavaBean将功能、处理、值、数据库访问和其他任何可以用Java代码创造的对象进行打包，并且其他的开发者可以通过内部的JSP页面、Servlet、其他JavaBean、applet程序或者应用来使用这些对象。用户可以认为JavaBean提供了一种随时随地的复制和粘贴的功能，而不用关心任何改变。

JavaBean的特性是：

1. 所有属性为private。
2. 提供默认构造方法。
3. 提供Getter和Setter。
4. 实现Serializable接口。
5. 使用包装类。
