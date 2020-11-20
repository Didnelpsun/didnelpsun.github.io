---
layout: post
title:  "前端面试题库"
date:   2020-06-28 20:20:21 +0800
categories: share
tags: html css js javascript 面试 题库
excerpt: "前端基础面试题库搜集"
---

## HTML与CSS

### &emsp;div居中方法

1. display:inline-block+text-align:center，在父级块级元素中设置text-align:center。
2. margin:0 auto，将块元素设定已知的宽度。
3. postion:absolute，margin-left:-(width/2)实现水平居中。
4. postion:absolute+margin:0 auto + left：0 right:0 bottom:0 top:0。
5. flex布局。

### &emsp;弹性盒模型

flex：display:flex；flex-direction，justify-content，align-item，flex-wrap四个用的最多。

### &emsp;浮动

float:right/left，清除clear:both/left/right。

### &emsp;

### &emsp;

### &emsp;



&emsp;

## JS

### &emsp;undefined和null的区别

undefined和null都拥有一个如它们类型的值，但是undefined是已经定义未赋值，而null是未定义的值。

### &emsp;深浅拷贝区别

数据类型分为基本数据类型和引用数据类型，引用数据类型是只保存数据保存地址的指针而非数据值，深浅拷贝是针对Object和Array这种引用数据类型的。

浅拷贝只复制指向某个对象的指针，而不复制对象本身，新旧对象还是共享同一块内存。但深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会改到原对象。

当我们把一个对象赋值给一个新的变量时，赋的其实是该对象的在栈中的地址，而不是堆中的数据。也就是两个对象指向的是同一个存储空间，无论哪个对象发生改变，其实都是改变的存储空间的内容，因此，两个对象是联动的。

浅拷贝是按位拷贝对象，它会创建一个新对象，这个对象有着原始对象属性值的一份精确拷贝。如果属性是基本类型，拷贝的就是基本类型的值；如果属性是内存地址（引用类型），拷贝的就是内存地址 ，因此如果其中一个对象改变了这个地址，就会影响到另一个对象。即默认拷贝构造函数只是对对象进行浅拷贝复制(逐个成员依次拷贝)，即只复制对象空间而不复制资源。

#### &emsp;浅拷贝实现

+ Object.assign()
+ Array.prototype.concat()
+ Array.prototype.slice()

#### &emsp;深拷贝实现

JSON.parse(JSON.stringify())

原理： 用JSON.stringify将对象转成JSON字符串，再用JSON.parse()把字符串解析成对象，一去一来，新的对象产生了，而且对象会开辟新的栈，实现深拷贝。

这种方法虽然可以实现数组或对象深拷贝，但不能处理函数。

_.cloneDeep也可以实现。

或者也可以自己手写递归方法来拷贝。

### &emsp;匿名函数

箭头函数相当于匿名函数，并且简化了函数定义。箭头函数有两种格式，一种像上面的，只包含一个表达式，连{ ... }和return都省略掉了。还有一种可以包含多条语句，这时候就不能省略{ ... }和return。

箭头函数内部的this是词法作用域，由上下文确定。