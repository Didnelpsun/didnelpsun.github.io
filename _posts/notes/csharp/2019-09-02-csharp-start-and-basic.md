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

&emsp;

## 语法结构

C#语法与Java相似，所以你会很明显的明白下面程序的是什么意思，如果没有学过面向对象语法也可以先看看相关概念：

```csharp
using System;
// 调入System命名空间中的类或方法，如下面的Console类

// 将这个文件的命名空间
namespace hello
{
    // 定义一个Animal类
    class Animal
    {
        // 定义公共属性name
        public string name = "Animal";
        // 定义cry方法
        public void cry()
        {
            // 打印类属性
            Console.WriteLine(name);
            // 避免闪退
            Console.ReadKey();
        }
    }
    // 定义主方法
    public class AnimalTest
    {
        // 在一个类中调用Main方法
        static void Main(string[] args)
        {
            // 实例化Animal类并调用cry方法
            Animal animal = new Animal();
            animal.cry();
        }
    }
}
```

### &emsp;成员变量

每一个类中包含着变量与函数，变量就成为成员变量，因为这个变量是这个类的成员，如上面的name变量，就是一个成员变量。

### &emsp;成员方法

对应的函数就称为成员方法。如cry方法就是Animal类中的一个成员方法。用以执行对应的逻辑。

### &emsp;实例化

如果一个类中的成员要被使用，如果使用的成员不是静态的，也就是不是被static关键字修饰的，那么你必须实例化这个类，将实例化的结果保存为一个实例，再在实例上使用对应方法或者属性。实例化的<span style="color:aqua">格式：</span>`类名 实例变量名 = new 实例化方法()`。

### &emsp;主类

如其他编程语言一样，一个程序必然有一个主类main是程序的入口，这个类无论在哪个类下都是可以的。

### &emsp;标识符

标识符是用来识别类、变量、函数或任何其它用户定义的项目。在 C# 中，类的命名必须遵循如下基本规则：

+ 标识符必须以字母、下划线或 @ 开头，后面可以跟一系列的字母、数字（ 0 - 9 ）、下划线（ _ ）、@。
+ 标识符中的第一个字符不能是数字。
+ 标识符必须不包含任何嵌入的空格或符号，比如 ? - +! # % ^ & * ( ) [ ] { } . ; : " ' / \。
+ 标识符不能是 C# 关键字。除非它们有一个 @ 前缀。 例如，@if是有效的标识符，但if不是，因为if是关键字。
+ 标识符必须区分大小写。大写字母和小写字母被认为是不同的字母。
+ 不能与C#的类库名称相同。

### &emsp;命名空间

命名空间这个概念C#是类似于CPP的命名空间，是为了区分不同模块的命名冲突而产生的模块管理方式，使用`useing 命名空间`的方式导入相关命名空间中的类与成员，使用`namespace 命名空间名`规定这个文件内的类与成员是属于哪个命名空间的。使用namespace关键字必须包裹所有的成员。

<span style="color:orange">注意：</span>C#并不要求文件名与主类名一致，这与Java是不一样的。这是因为C#主类对于包含包含主类的类的要求并没有Java严格。
