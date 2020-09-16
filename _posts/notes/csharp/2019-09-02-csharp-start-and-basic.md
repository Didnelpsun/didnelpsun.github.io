---
layout: post
title:  "基础"
date:   2019-09-02 14:01:22 +0800
categories: notes csharp base
tags: C# csharp 基础 开始
excerpt: "C#开始与基础语法"
---

C#是一个现代的、通用的、面向对象的编程语言，它是由微软（Microsoft）开发的，由Ecma和ISO核准认可的。
C#是由Anders Hejlsberg和他的团队在.Net框架开发期间开发的。

C#是专为公共语言基础结构（CLI）设计的。CLI由可执行代码和运行时环境组成，允许在不同的计算机平台和体系结构上使用各种高级语言。

虽然C#的构想十分接近于传统高级语言C和C++，是一门面向对象的编程语言，但是它与Java更加相似。

C#是.Net框架的一部分，且用于编写.Net应用程序。虽然Java与C#非常类似，但是Java是一整套技术，而C#则专门是一门语言，是为了.Net框架而服务的。

.Net框架是一个创新的平台，能帮您编写出下面类型的应用程序：

+ Windows 应用程序
+ Web 应用程序
+ Web 服务

.Net框架应用程序是多平台的应用程序。框架的设计方式使它适用于下列各种语言：C#、C++、Visual Basic、Jscript、COBOL等等。所有这些语言可以访问框架，彼此之间也可以互相交互。

.Net框架由一个巨大的代码库组成，用于C#等客户端语言。

C#是一种面向对象的编程语言。在面向对象的程序设计方法中，程序由各种相互交互的对象组成。相同种类的对象通常具有相同的类型，或者说，是在相同的class中。

## 基础语法

### &emsp;程序结构

一个 C# 程序主要包括以下部分：

①命名空间声明（Namespace declaration）  
②一个class  
③Class方法  
④Class属性  
⑤一个Main方法  
⑥语句（Statements）& 表达式（Expressions）  
⑦注释  

如:

```csharp
using System;
namespace HelloWorldApplication
{
   class HelloWorld
   {
      static void Main(string[] args)
      {
         /* 我的第一个 C# 程序*/
         Console.WriteLine("Hello World");
         Console.ReadKey();
      }
   }
}
>>>>>Hello World
```

让我们看一下上面程序的各个部分：

程序的第一行using System: using关键字用于在程序中包含System命名空间，即导入这个命名空间中的方法或者属性。一个程序一般有多个using语句。命名空间是在CPP中最早使用，类似于Java的包概念。

下一行是namespace声明。一个namespace里包含了一系列的类。即声明这个文件的命名空间是HelloWorldApplication。HelloWorldApplication命名空间包含了类HelloWorld。

下一行是class声明。类HelloWorld包含了程序使用的数据和方法声明。类一般包含多个方法。方法定义了类的行为。在这里，HelloWorld类只有一个Main方法。

下一行定义了Main方法，是所有C#程序的入口点。Main方法说明当执行时类将做什么动作。

下一行`/*...*/`将会被编译器忽略，且它会在程序中添加额外的 注释。

Main方法通过语句`Console.WriteLine("Hello World");` 指定了它的行为。

WriteLine是一个定义在System命名空间中的Console类的一个方法。该语句会在屏幕上显示消息 "Hello, World!"。

最后一行`Console.ReadKey();`是针对VS.NET用户的。这使得程序会等待一个按键的动作，防止程序从Visual Studio .NET启动时屏幕会快速运行并关闭。类似的处理方式在C中也有使用过。

以下几点值得注意：

+ C#是大小写敏感的。
+ 所有的语句和表达式必须以分号（;）结尾。
+ 程序的执行从Main方法开始。
+ 与Java不同的是，文件名可以不同于类的名称。

