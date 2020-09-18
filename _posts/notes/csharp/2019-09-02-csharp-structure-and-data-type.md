---
layout: post
title:  "基础"
date:   2019-09-02 14:01:22 +0800
categories: notes csharp base
tags: C# csharp 基础 结构 语法 数据类型
excerpt: "结构与数据类型"
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

1. 命名空间声明（Namespace declaration）  
2. 一个class  
3. Class方法  
4. Class属性  
5. 一个Main方法  
6. 语句（Statements）& 表达式（Expressions）  
7. 注释  

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

+ 标识符必须以字母、下划线或@开头，后面可以跟一系列的字母、数字（ 0 - 9 ）、下划线（ _ ）、@。<span style="color:orange">C#不能用$开头</span>
+ 标识符中的第一个字符不能是数字。
+ 标识符必须不包含任何嵌入的空格或符号，比如 ? - +! # % ^ & * ( ) [ ] { } . ; : " ' / \。
+ 标识符不能是 C# 关键字。除非它们有一个 @ 前缀。 例如，@if是有效的标识符，但if不是，因为if是关键字。
+ 标识符必须区分大小写。大写字母和小写字母被认为是不同的字母。
+ 不能与C#的类库名称相同。

### &emsp;命名空间

命名空间这个概念C#是类似于CPP的命名空间，是为了区分不同模块的命名冲突而产生的模块管理方式，使用`useing 命名空间`的方式导入相关命名空间中的类与成员，使用`namespace 命名空间名`规定这个文件内的类与成员是属于哪个命名空间的。使用namespace关键字必须包裹所有的成员。

<span style="color:orange">注意：</span>C#并不要求文件名与主类名一致，这与Java是不一样的。这是因为C#主类对于包含包含主类的类的要求并没有Java严格。

&emsp;

## 数据类型

C#数据类型分三种，一种是值类型，一种是引用类型，一种是指针类型。

### &emsp;1.值类型

类型|中文名|值域|默认值
:-:|:----:|:-:|:----:
bool|布尔值|True 或 False|默认为False
byte|8 位无符号整数|0 到 255|默认为0
char|16 位 Unicode 字符|U +0000 到 U +ffff|默认为'\0'
decimal|128 位精确的十进制值，28-29 有效位数|(-7.9 x 1028 到 7.9 x 1028) / 100 |到 28|默认为0.0M
double|64 位双精度浮点型|(+/-)5.0 x 10-324 到 (+/-)1.7 x 10308|默认为0.0D
float|32 位单精度浮点型|-3.4 x 1038 到 + 3.4 x 1038|默认为0.0F
int|32 位有符号整数类型|-2,147,483,648 到 2,147,483,647|默认为0
long|64 位有符号整数类型|-9,223,372,036,854,775,808 到|9,223,372,036,854,775,807|默认为0L
sbyte|8 位有符号整数类型|-128 到 127|默认为0
short|16 位有符号整数类型|-32,768 到 32,767|默认为0
uint|32 位无符号整数类型|0 到 4,294,967,295|默认为0
ulong|64 位无符号整数类型|0 到 18,446,744,073,709,551,615|默认为0
ushort|16 位无符号整数类型|0 到 65,535|默认为0

### &emsp;2.引用类型

引用类型不包含存储在变量中的实际数据，但它们包含对变量的引用。

换句话说，它们指的是一个内存位置。使用多个变量时，引用类型可以指向一个内存位置。如果内存位置的数据是由一个变量改变的，其他变量会自动反映这种值的变化。内置的引用类型有：object、dynamic和string。

#### &emsp;&emsp;2.1对象类型（Object）

对象（Object）类型是C#通用类型系统（Common Type System - CTS）中所有数据类型的终极基类。Object 是 System.Object 类的别名。所以对象（Object）类型可以被分配任何其他类型（值类型、引用类型、预定义类型或用户自定义类型）的值。但是，在分配值之前，需要先进行类型转换。

<span style="color:aqua">格式：</span>`object 变量名 = 变量值;`

当一个值类型转换为对象类型时，则被称为<span style="color:yellowgreen">装箱</span>；另一方面，当一个对象类型转换为值类型时，则被称为<span style="color:yellowgreen">拆箱</span>。

```csharp
object obj;
obj = 100; // 这是装箱
```

#### &emsp;&emsp;2.2动态类型（Dynamic）

您可以存储任何类型的值在动态数据类型变量中。这些变量的类型检查是在运行时发生的。

<span style="color:aqua">格式：</span>`dynamic 变量名 = 变量值;`

例如：`dynamic d = 20;`。

动态类型与对象类型相似，但是对象类型变量的类型检查是在编译时发生的，而动态类型变量的类型检查是在运行时发生的。

#### &emsp;&emsp;2.3字符串类型（String）

字符串（String）类型允许给变量分配任何字符串值。字符串（String）类型是System.String类的别名。它是从对象（Object）类型派生的。字符串（String）类型的值可以通过两种形式进行分配：引号和@引号。

例如：`String str = "runoob.com";`，或者一个@引号字符串：`@"runoob.com";`，C#的string字符串的前面可以加@（称作"逐字字符串"），它将转义字符（\）当作普通字符对待，比如：`string str = @"C:\Windows";`等价于：`string str = "C:\\Windows";`。

@字符串中可以任意换行，换行符及缩进空格都计算在字符串长度之内：

```csharp
string str = @"<script type=""text/javascript"">
    <!--
    -->
</script>";
```

#### &emsp;&emsp;2.4自定义引用类型

用户自定义引用类型有：class类、interface接口或delegate委托（类似函数指针）等。

### &emsp;3.指针类型

指针类型变量存储另一种类型的内存地址。C# 中的指针与 C 或 C++ 中的指针有相同的功能。
声明指针类型的<span style="color:aqua">格式：</span>`指针类型* 指针名;`

例如：`char* cptr;/int* iptr;`。

由C和C++可知一般使用指针类型都不安全。

### &emsp;4.可空类型

可空类型NullAble是基于其他基本数据类型，就是在其他数据类型的取值范围上加上一个null类型，允许其为空，尤其是用于数据库中暂且未赋值的数据项。

如：`boolean ? a = true;`

就是说明布尔类型变量a可以为true、false和null。

<span style="color:aqua">格式：</span>基本数据类型 ? 变量名 = 初始值;

### &emsp;5.Null合并运算符

Null合并运算符用于定义可空类型和引用类型的默认值。Null合并运算符为类型转换定义了一个预设值，以防可空类型的值为Null。Null合并运算符把操作数类型隐式转换为另一个可空（或不可空）的值类型的操作数的类型。

如果第一个操作数的值为null，则运算符返回第二个操作数的值，否则返回第一个操作数的值。

<span style="color:aqua">格式：</span>`变量1=变量2 ?? 变量3;`

如：`num2 = num1 ?? 5.34;`，num1如果为空值则返回 5.34否则num2就是num1，如同条件运算符 ? :。

&emsp;

## 类型转换

类型转换从根本上说是类型铸造，或者说是把数据从一种类型转换为另一种类型。在C#中，类型铸造有两种形式：

+ 隐式类型转换：这些转换是C# 默认的以安全方式进行的转换, 不会导致数据丢失。例如，从小的整数类型转换为大的整数类型，从派生类转换为基类。
+ 显式类型转换：显式类型转换，即强制类型转换。显式转换需要强制转换运算符，而且强制转换会造成数据丢失。

下面的实例显示了一个显式的类型转换：

```csharp
namespace TypeConversionApplication
{
  class ExplicitConversion
  {
    static void Main(string[] args)
    {
      double d = 5673.74;
      int i;// 强制转换 double 为 int
      Console.WriteLine(i);
      Console.ReadKey();
    }
  }
}
>>>>>5673
```

内置类型转换方法，<span style="color:aqua">格式：</span>`变量.方法`

序号|方法 & 描述
:--:|:--------:
ToBoolean|如果可能的话，把类型转换为布尔型。
ToByte|把类型转换为字节类型。
ToChar|如果可能的话，把类型转换为单个 Unicode 字符类型。
ToDateTime|把类型（整数或字符串类型）转换为 日期-时间 结构。
ToDecimal|把浮点型或整数类型转换为十进制类型。
ToDouble|把类型转换为双精度浮点型。
ToInt16|把类型转换为16位整数类型。
ToInt32|把类型转换为32位整数类型。
ToInt64|把类型转换为64位整数类型。
ToSbyte|把类型转换为有符号字节类型。
ToSingle|把类型转换为小浮点数类型。
ToString|把类型转换为字符串类型。
ToType|把类型转换为指定类型。
ToUInt16|把类型转换为16位无符号整数类型。
ToUInt32|把类型转换为32位无符号整数类型。
ToUInt64|把类型转换为64位无符号整数类型。
