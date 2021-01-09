---
layout: post
title:  "Canvas画布"
date:   2020-02-11 11:26:23 +0800
categories: notes html html5
tags: HTML HTML5 Canvas
excerpt: "画布标签与脚本绘画"
---

什么是 Canvas?

HTML5 元素用于图形的绘制，通过脚本 (通常是JavaScript)来完成.

标签只是图形容器，也就是说你单纯使用`<canvas>`是没有任何作用的，你必须使用脚本来绘制图形。可以使用Canva绘制路径,盒、圆、字符以及添加图像。

## 创建画布与width、height属性

一个画布在网页中是一个矩形框，通过 `<canvas>` 元素来绘制。默认情况下 `<canvas>` 元素没有边框和内容。可以使用 style 属性来添加边框

```html
<canvas id="Canvas" width="200" height="100"></canvas>
```

<span style="color:orange">注意：</span>标签通常需要指定一个id属性 (脚本中经常引用)。

width 和 height 属性定义的画布的大小。一般以px为单位。

&emsp;

## 使用JavaScript进行绘图的起步

首先我们得到了这个画布，然后我要利用这个画布在上面画图，需要使用JavaScript。但是如果我们之前学习过JavaScript，就应该知道我们JavaScript里面完全没有画图的方法，那么如何画图呢？

```javascript
var c=document.getElementById("Canvas");
var pen=c.getContext("2d");
pen.fillStyle="#FF0000";
pen.fillRect(0,0,200,100);
```

这一连串代码是什么意思？  
首先针对第一行，document就说明是进行了dom操作，获取了id为Canvas的画布。  
然后对于第二行，getContext("2d") 对象是内建的 HTML5 对象，拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法。也就是说`c.getContext("2d")`相当于针对这个画布，而拿起来了一根只能画2d效果的笔🖊，这根笔叫pen。  
第三步，fillStyle属性可以为颜色，也可以为渐变或者图案，但是默认为黑色。也就是说这一步相当于将第二步建立的笔🖊沾上颜色，或者变为画某种图案的框，这里是沾上红色的颜料。  
第四步，就是画一个矩形图，`fillRect()`即画矩形的方法，函数参数：`fillRect(x,y,width,height)` 。

<span style="color:red">警告：</span>js代码应该放在window.onload()函数中，否则会报错：Uncaught TypeError: Cannot read property 'getContext' of null，因为在html元素加载之前就运行了JavaScript。

结果应该是这样：  
![示例图1][p1]

&emsp;

## 坐标

canvas 是一个二维网格。canvas 的左上角坐标为 (0,0)

上面的 fillRect 方法拥有参数 (0,0,200,100)。意思是：在画布上绘制 200x100 的矩形，从左上角开始 (0,0)。

&emsp;

## 路径

在Canvas上画线，我们将使用以下两种方法：  

### &emsp;1. 直线

```javascript
var c=document.getElementById("Canvas");
var pen=c.getContext("2d");
pen.moveTo(0,0);
pen.lineTo(200,100);
pen.stroke();
```

1. `moveTo(x,y)` 定义线条开始坐标  
2. `lineTo(x,y)` 定义线条结束坐标  
3. 绘制线条我们必须使用到 "ink" 的方法，就像`stroke()`。  

定义开始坐标(0,0), 和结束坐标 (200,100)。然后使用 `stroke()` 方法来绘制线条，也就是首先打两个点，然后使用`stroke()`方法来连线。

### &emsp;2. 圆形

`arc(x,y,r,start,stop)` x,y是开始绘画坐标，r是圆形半径，start是开始绘画的值，stop就是停止值，以弧度为单位。

```javascript
var c=document.getElementById("Canvas");
var pen=c.getContext("2d");
pen.beginPath();
pen.arc(0,0,40,0,2*Math.PI);
pen.stroke();
```

&emsp;

## 文本

### &emsp;1. font()

定义字体。

<span style="color:aqua">格式：</span>对象.font()="字号 字体"

### &emsp;2. fillText()

在 canvas 上绘制实心的文本

<span style="color:aqua">格式：</span>`fillText(text,x,y)` text代表文本，xy代表坐标。

```javascript
var c=document.getElementById("Canvas");
var pen=c.getContext("2d");
pen.font="30px Arial";
pen.fillText("Hello World",10,50);
```

首先我们获取pen，然后设置pen的字体和字号，即pen的样子和pen的大小，然后利用fillText方法在相应的位置写下text值的内容。

### &emsp;3. strokeText()

在 canvas 上绘制空心的文本，格式与fillText方法类似。`pen.strokeText("Hello World",10,50)`

&emsp;

## 渐变

渐变可以填充在矩形, 圆形, 线条, 文本等等, 各种形状可以自己定义不同的颜色。

以下有两种不同的方式来设置Canvas渐变：

`createLinearGradient(x,y,x1,y1)` - 创建线条渐变

`createRadialGradient(x,y,r,x1,y1,r1)` - 创建一个径向/圆渐变

当我们使用渐变对象，必须使用两种或两种以上的停止颜色。

addColorStop()方法指定颜色停止，参数使用坐标来描述，可以是0至1.

使用渐变，设置fillStyle或strokeStyle的值为渐变，然后绘制形状，如矩形，文本，或一条线。

### &emsp;1. createLinearGradient()

`createLinearGradient(x,y,x1,y1)`参数：  
x，y：就是选择渐变色彩开始的地方。  
x1，y1：就是渐变色彩结束的地方。

```javascript
var c=document.getElementById("Canvas");
var pen=c.getContext("2d");

// Create gradient
var colorpen=pen.createLinearGradient(0,0,200,0);
colorpen.addColorStop(0,"red");
colorpen.addColorStop(1,"white");

// Fill with gradient
pen.fillStyle=colorpen;
pen.fillRect(10,10,150,80);
```

我们可能不懂对于上面xy和x1y1的说明。

![p2][p2]

我们把200变为400：

![p3][p3]

我们应该明白这个开始和终止变色的意思了，按照原来的代码，首先从红色开始变色，从最左边开始，从200px的时候完全变为白色。这是在addColorStop只设置两色且两种颜色在两边的情况。

而addColorStop方法是什么意思？首先1和0代表整个渐变的路程，0是开始渐变，1是完成渐变，0到1之间可以插入一个以上的颜色，而这个方法就是打断点，每个方法就是一个断点，对应一个不同的颜色，可以由红色变成绿色又变成蓝色等等。

然后我们看整个代码，第一行还是获取画布，第二行是获取画画布的笔🖊，第二段则是设置渐变颜色，与之前的单色代码相比，这里多出来的就相当于原来是单色就直接沾上颜料就可以直接画图，但是用渐变就要首先调色，第二段就是调色的代码，第三段就是普通的画图代码，不同的是将fillStyle赋值为之前的调的渐变色。

### &emsp;2. createRadialGradient()

`createRadialGradient(x,y,x1,y1)`参数：  
x：表示渐变的开始圆的 x 坐标
y：表示渐变的开始圆的 y 坐标
r：表示开始圆的半径
x1：表示渐变的结束圆的 x 坐标
y1：表示渐变的结束圆的 y 坐标
r1：表示结束圆的半径

```javascript
var c=document.getElementById("Canvas");
var pen=c.getContext("2d");

// Create gradient
var colorpen=pen.createRadialGradient(75,50,5,90,60,100);
colorpen.addColorStop(0,"red");
colorpen.addColorStop(1,"white");

// Fill with gradient
pen.fillStyle=colorpen;
pen.fillRect(10,10,150,80);
```

&emsp;

## 图像

`drawImage(image,x,y)`

img是对应的图片对象，x和y是拖拽至的坐标。

[p1]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgQAAAHFBAMAAAB/cPwpAAAAAXNSR0IArs4c6QAAAA9QTFRF/////wAAAAAA/9PT/xoaioWU6wAAAjlJREFUeNrt1UENgDAQAMELDnBQioEmlYB/T5DwQACPa3KzEuazEZKetl67hgABAgQIPoJjT+xK3iECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQ5BOcM7GxBEGLqiFAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEPwjKB0CBAgQIHgJbgHwNNk1dj5JAAAAAElFTkSuQmCC

[p2]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAABmCAMAAABCx9vtAAAAAXNSR0IArs4c6QAAAHtQTFRF/zY2/3p6/3R0/25u/z4+/xAQ/xoa/4WF/yQk/7e3/1hY/2Nj/7Gx/05O/0RE/5KS/15e/zAw/yoq/8DA/6am/0lJ/5aW/8TE/6Ki/8nJ/39//1NT/2lp//7+/4qK/x8f/xUV/56e/5ub/6qq/7y8/46O/62t/9XV/8zMvhEZmgAAAUFJREFUeNrt3NlygkAQQFGMGoMaiHHBjSTEjf//QumZHmB80SrRKpJ7f2CaLs5rB2mrC9Lky3bQYm2h/WqZttRm2s52tI3LwrJ91dSWaCtXXut0e8X4g770I71K39Kb6dM0kQJbT4uK5tK7tJGGpg9pJG2lrunF1JHWpoFULs3tSpfkdqM7qXbhFlB+eX7P+Bfzt2j8qMntx7Xxs2vjTxvb/iN+nux5P0/L/33oQhe6/5puDF3oQhe60IUudKEL3QfQjaALXehCF7rQhS50oQtd6EIXutCFLnShC13oQhe60IUudKELXehCF7rQhS50oQtd6EIXutCFLnShC13oQhe60IUudKEL3TbSzaALXeg2PX4A3bvo7v8Y3bBbf8M9Uz3lXnMPVnesvCNW3gUr/3xV7XbV5d0q/2aVf7HqhmtV6Rm/WEfzCCZDgQAAAABJRU5ErkJggg==

[p3]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAABlCAMAAADEU6lDAAAAAXNSR0IArs4c6QAAAFFQTFRF/wkJ/xkZ/w8P/z09/yYm/xMT/ysr/0ZG/1hY/zQ0/11d/1NT/y8v/0FB/0tL/x0d/yEh/zk5/2Fh/09P/2Rk//j4/4OD/3R0/5mZ/6qq/42NW9oSWgAAAOBJREFUeNrt3EkOggAMQFGc51lQvP9BjQKNGmNA2WDeP0HT9G2bpHn20KV+52/L2ytN0ix5qB+Nol7VpmpbNIzG0bJsFu2qBmWrskm0jg5Fi7JpNI/2t473To3G7z1P37XxX6ZvOP7A9tvYfldv/7fxHQ+66KKLru2jiy66to+u40H38/Ggiy666KKLLrrooosuuuiiiy666KKLLrrooosuuuiiiy666KKLLrrooosuuuiiiy666KKLLrrooosuuuiiiy666KKL7pvrabj9Hbp/Rzc/Vp0al9Wu9W9XxW+qKz6i2UeHjcwTAAAAAElFTkSuQmCC
