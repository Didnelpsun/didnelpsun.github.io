---
layout: post
title:  "安装与基础语法"
date:   2019-09-12 14:15:12 +0800
categories: notes java base
tags: java 基础 安装 JRE JDK 数据类型 常量 变量 运算符 注释 输出 输入
excerpt: "安装配置与语法"
---

## Java配置安装与运行

<span style="color:yellowgreen">JRE：</span>Java Runtime Environment JRE顾名思义是Java运行时环境，包含了Java虚拟机，Java基础类库。是使用Java语言编写的程序运行所需要的软件环境，是提供给想运行Java程序的用户使用的。  

<span style="color:yellowgreen">JDK：</span>Java Development Kit JDK顾名思义是Java开发工具包，是程序员使用Java语言编写Java程序所需的开发工具包，是提供给程序员使用的。JDK包含了JRE，同时还包含了编译Java源码的编译器javac，还包含了很多Java程序调试和分析的工具：jconsole，jvisualvm等工具软件，还包含了Java程序编写所需的文档和demo例子程序。如果你需要运行Java程序，只需安装JRE就可以了。如果你需要编写Java程序，需要安装JDK。  

首先注意类名与文件名保持一致，到目标Java文件的目录下，打开cmd窗口。然后输入javac 文件名.java，如果编译成class格式文件成功就接着输入Java类名。  

<span style="color:yellowgreen">源文件名：</span>源文件名必须和类名相同。当保存文件的时候，你应该使用类名作为文件名保存（切记Java是大小写敏感的），文件名的后缀为.java。（如果文件名和类名不相同则会导致编译错误）。

### &emsp;基本Java编译运行

1. javac 文件名.java ->文件名.class  
2. java 文件名（无.class扩展名）
3. 如果出现打印中文乱码的情况，比如记事本写程序运行就会报错，因为记事本编码格式为UTF-8，而Java默认是ANSI，那么使用`javac -encoding utf-8 文件名.java`命令来设置编译语言编码。
4. 有时候系统会有些问题，导致无法找到对应的class文件，你可以把Java文件放到别的地方进行编译运行。

&emsp;  

## Java基础语法

### &emsp;1.Java主类

一个 Java 程序可以认为是一系列对象的集合，而这些对象通过调用彼此的方法来协同工作。

每一个应用程序都必须包含一个`main()`方法，含有`main()`方法的类一般为主类。`public static void main(String[] args)`方法是程序开始执行的位置。

主类可以含有`main()`方法，不是必要条件，充要条件是带有`public`关键字，仅有主类可以带有`public`关键字，且`main()`方法必须声明为`public static void`。`public`关键字是权限修饰符。

`static`是静态修饰符。知编译器`main()`函数是一个静态函数。也就是说main函数中的代码是存储在静态存储区的，即当定义了类以后这段代码就已经存在了。如果`main()方法`没有使用`static`修饰符，那么编译不会出错，但是如果你试图执行该程序将会报错，提示`main()`方法不存在。因为包含`main()`的类并没有实例化（即没有这个类的对象），所以其`main()`方法也不会存。而使用`static`修饰符则表示该方法是静态的，不需要实例化即可使用。

`void`是返回值修饰符。表名主函数一般返回值是无类型。

`String[]args`是一个字符串类型的数组，是`main()`函数的参数。如C语言的主函数`main()`，虽然其中并没有传入参数，但是实际上操作系统代我们给主函数已经传入了字符串数组类型的参数。Java是显式地传入参数，并转为字符串类型。args就是参数英文的首字母。名字并不重要。

主函数可以被重载，但是JVM只识别`main（String[] args）`，其他都是作为一般函数。这里面的args参数数组变量可以更改，其他都不能更改。
一个Java文件中可以包含很多个类，每个类中有且仅有一个主函数，但是每个Java文件中可以包含多个主函数，在运行时，需要指定JVM入口是哪个。当如一个类的主函数可以调用另一个类的主函数。

```java
public class Main { //定义主类Main
    public static void main(String[] args) //定义主函数，并定义传入参数的字符串的形参
    {
    for(int i=0;i <args.length;i++)
    System.out.println(args[i]); //在主函数定义本身，功能是打印传入参数
    }
}
public class B { //定义B类
    public static void main(String[] args) //在B类中定义主函数
{
Main c = new Main(); //实例Main的实例c
    String[] b = {"111","222","333"};
    c.main(b); //调用c的main方法。
    }
}
```

由于Main类主函数为静态函数，也可以不用实例化，直接在B类中调用。  

一个程序仅有主类可以带有`public`关键字，成员中的方法可以带有`public`关键字代表共有的方法。如：Main.java

```java
public class Main{
    static String s1 ="hello";
    public static void main(String[]args){
        String s2 = "world";
        System.out.println(s1);
        System.out.println(s2);
    }
}
```

### &emsp;2.数据类型

Java一共有八种基本类型：数值型：byte、short、int、long、float、double和字符型与布尔型。

#### &emsp;&emsp;2.1整数类型

Java可以用三种形式表示整形数据；十进制、八进制和十六进制。十进制正常表示，八进制前面以0开头，十六进制以0X或者0x开头。  
整型数据根据长度不同分为2^8长度的byte，2^16的short，2^32的int，2^64的long。  
对于long型值，当赋给值超过int类型的范围时，则需要在数字后加L或者l，表示该数值为长整型，如：long num = 2147483650L。  

#### &emsp;&emsp;2.2浮点类型

Java中有float单精度浮点数和double双精度浮点数，分别占32,64位，与C语言类似，小数都被默认为双精度类型，但是与C不同的是，如果使用单精度浮点数类型，需要在小数最后添加F或者f，是必须的，可以在double类型的浮点数后加D或者d，也可以不加。  

如：

```java
float f1 = 13.34f;
double d1 = 2345.35343d;
```

#### &emsp;&emsp;2.3字符类型

与C类似，单引号表示字符，双引号表示字符串。
char类型用于存储单个字符，也可以使用数字，因为和C一样，单个字符与unicode表的序号是等价的。如：char x = 'a'; === char x = 97;
因为Java可以把字符作为整数对待，且unicode编码采用无符号编码，所以可以存储65536个字符，可以显示转换为数字：

```java
public class Gess{
    public static void main(String[] args){
        char word = 'd',word2 = '@';
        int p = 23943;
        System.out.println("d在"+(int)word+"@在"+(int)word2);
        System.out.println("23943是"+(char)p);
    }
}
```

Java中的转义字符与C等类似。

#### &emsp;&emsp;2.4布尔类型

又叫逻辑类型，使用boolean关键字定义，仅有true和false两个值，不能与整数类型相互转换。

#### &emsp;&emsp;2.5类型转换

##### &emsp;&emsp;&emsp;2.5.1隐式类型转换

`byte<short<int<long<float<double`  
低精度会向高精度转换。

##### &emsp;&emsp;&emsp;2.5.2强制类型转换

<span style="color:aqua">格式：</span>(目标类型)原数据变量  

与C类似。如：`(int)p;`

### &emsp;3.常量变量

#### &emsp;&emsp;3.1标识符

类名：对于所有的类来说，类名的首字母应该大写。如果类名由若干单词组成，那么每个单词的首字母应该大写，例如 MyFirstJavaClass 。  

方法名：所有的方法名都应该以小写字母开头。如果方法名含有若干单词，则后面的每个单词首字母大写。 

Java 是大小写敏感的，这就意味着标识符 Hello 与 hello 是不同的。  

所有的标识符都应该以字母,美元符`$`、或者下划线`_`开始。  

首字符之后可以是字母,美元符`$`、下划线`_`或数字的任何字符组合。由于Java语言使用unicode标准字符集，所以变量名与字母可以含有中文日文等文字。但是不建议使用。

也不能使用!^&%等特殊符号作为标识符。  

标识符不能为Java关键字和保留字。

#### &emsp;&emsp;3.2声明变量

<span style="color:aqua">格式：</span>`类型名 变量名 = 数值；/类型名 变量名;`

#### &emsp;&emsp;3.3声明常量（final关键字）

在程序中只能被赋值一次。  

<span style="color:aqua">格式：</span>`final 数据类型 常量名称[= 值];`  

一般常量名称首字母为大写，且中间以下划线连接，但是并不是必要的。  
当定义的final变量属于成员变量时，就必须定义时设定其初值，否则会出现编译错误。
如：  

```java
public class Part{ //新建类Part
//声明常量PI，此时如果不同时赋值，会出现错误
    static final double PI = 3.14;
    static int age = 23; //声明age变量为int类型并赋值

    public static void main(String[] args){ // 主方法
        final int number; //声明int类型常量number，因为是局部变量，所以可以分开赋值
        number = 1235; //只能赋值一次
        age = 22;
//number = 1236;
        System.out.println("常量：" + PI);
        System.out.println("赋值后的number的值：" + number);
        System.out.println("int类型的变量：" + age);
    }
}
```

`final` 修饰符通常和 `static` 修饰符一起使用来创建类常量。

如：  

```java
public class Test{
  final int value = 10;
  // 下面是声明常量的实例
  public static final int BOXWIDTH = 6;
  static final String TITLE = "Manager";
  public void changeValue(){
     value = 12; //将输出一个错误
  }
}
```

那么final关键字和final static的区别在于什么？

就比如将一个数赋值为随机函数的值，所以按道理这个数的值是随机的。如果使用final就代表在这个程序的生命周期中它的值是不变的，运行一次它就是一个固定的值，但是它下一次运行被随机函数赋值的值是不一定的。而如果是使用final static修饰，则代表为其开辟了一个固定空间，在装载就被实例化，所以无论被实例化多少次都会是第一次赋给的值。

如果没有这个需要其实没有特别大的区别，但是Java中定义全局常量，通常使用public static final修饰，这样就只能在定义时被赋值。

值得注意的是final关键字不仅仅可以定义数值类型变量，也可以定义引用类型变量。一个被定义为final的对象引用只能指向唯一一个对象，不可指向其他对象。但是对象本身的值是可以更改的，如果使引用的对象的值不可以更改就需要使用static final。

如果要声明一个完全公有的常量，则<span style="color:aqua">格式：</span>`public static final 变量名 = 值;`，public控制变量空间，static控制变量时间，final控制变量数值。

### &emsp;4.运算符

#### &emsp;&emsp;4.1赋值运算符

=、+=、-=、*=、/=、%=  
且Java中赋值运算符可以连在一起使用，如：x = y = z =1;

#### &emsp;&emsp;4.2算术运算符

+、-、*、/、%  
与C一样，除运算中如果除数或者被除数为负数，结果值的正负依赖于被除数。模运算也是如此：  

```java
a%b=a-(a/b)*b  
5%3=5-(5/3)*3=2  
5%-3=5-(5/-3)*-3=2  
-5%3=-5-(-5/3)*3=-2  
-5%-3=-5-(-5/-3)*-3=-2  
```

如果操作数中有浮点数则采用的规则为  
`a%b=a-(b*q),这里q=int(a/b)`  

```java
5.2%3.1=5.2-1*3.1=2.1  
5.2%-3.1=5.2-(-1)*(-3.1)=2.1  
-5.2%3.1=-5.1-(-1)*3.1=-2.1  
-5.2%-3.1=-5.1-(-1)*(-3.1)=-2.1  
```

#### &emsp;&emsp;4.3自增自减运算符

++、--  
使用与操作元的位置的影响同C。

#### &emsp;&emsp;4.4比较运算符

\>、<、==、>=、<=、!=  
\>、<、>=、<=操作数据为整型，浮点型、字符型，不能为布尔型。  
==、!=操作数据为基本类型数据与引用类型数据。  

#### &emsp;&emsp;4.5逻辑运算符

&&、&、|、!  
&会判断两边表达式的逻辑值，而&&是针对boolean类型的进行判断，当第一个表达式为false时不再判断第二个。  
逻辑表达式中从左端的表达式可以判断整个表达式的值称为短路，而判断两边的表达式为非短路。&&是短路运算符，&是非短路运算符。  

#### &emsp;&emsp;4.6位运算符

&、|、~（取反）、^（异或）、<<（左移）、>>（右移）、>>>（无符号右移）  
左移n位就是乘上2^n，右移就是除以2^n。

#### &emsp;&emsp;4.7三元运算符

?:;  
也称为条件运算符。与C的三元运算符是一致的。

### &emsp;5.注释

`//单行注释`  

`/*单行注释*/`  

`/*多行`  
`*注释`  
`*/`  

`/**`  
`文档注释`  
`*/`  

### &emsp;6.输出

分别有System.out.print、System.out.println、System.out.printf三种基础方法。  

由于Java是类的集合，如果使用方法必须使用类，所以print等方法都在System类中。  

+ print将它的参数显示在命令窗口，并将输出光标定位在所显示的最后一个字符之后。  
+ println将它的参数显示在命令窗口，并在结尾加上换行符，将输出光标定位在下一行的开始。
+ printf是格式化输出的形式。

格式符：  

格式符|数值类型|结果类型
:--:|:--:|:--------:|
'd'|整数|结果被格式化为十进制整数。  
'o'|整数|结果被格式化为八进制整数。  
'x', 'X'|整数|结果被格式化为十六进制整数。  
'e', 'E'|浮点|结果被格式化为用计算机科学记数法表示的十进制数。  
'f'|浮点|结果被格式化为十进制数。  
'g', 'G'|浮点|根据精度和舍入运算后的值，使用计算机科学记数形式或十进制格式对结果进行格式化。  
'a', 'A'|浮点|结果被格式化为带有效位数和指数的十六进制浮点数。  

如：

```java
System.out.print("用print输出i:"+ i);
System.out.println( "用println输出i:"+ i);
System.out.printf("i的值为%d", i);
```

### &emsp;7.输入

java.util.Scanner是Java5的新特征，我们可以通过Scanner类来获取用户的输入。

创建Scanner对象的基本语法：`Scanner s = new Scanner(System.in);`

这个Scanner类就是一个输入的空间，通过调用类来开启输入空间，然后通过`hasNext()`和`hasNextLine()`等方法来判断输入空间是否还有数据，如果有就使用`next()`或`nextLine()`等方法来取出下一个输入的字符。一般为了安全最后不使用Scanner类就要调用`close()`方法。

#### &emsp;&emsp;7.1next()方法

需要配套`hasNext()`方法来使用：

```java
public static void main(String args[]){
    Scanner s = new Scanner(System.in);
    while (s.hasNext()){
        String letter = s.next();
        System.out.println(letter);
    }
    s.close();
}
```

#### &emsp;&emsp;7.2nextLine()方法

需要配套`hasNextLine()`方法来使用：

```java
public static void main(String args[]){
    Scanner s = new Scanner(System.in);
    while (s.hasNextLine()){
        String letter = s.nextLine();
        System.out.println(letter);
    }
    s.close();
}
```

你会发现上面两个例子都无法停止输入，因为我们没有给定一个显式的停止标识，而输入的空间则总是非空的。如果我们想输入一行就结束了，那么我们可以不用hasNext和hasNextLine这两个方法进行循环，直接`String letter = s.nextLine();System.out.println(letter);`就可以了。

那么这两个方法的区别是什么呢？

next():

1. 一定要读取到有效字符后才可以结束输入。
2. 对输入有效字符之前遇到的空白，next()方法会自动将其去掉。
3. 只有输入有效字符后才将其后面输入的空白作为分隔符或者结束符。
4. next()不能得到带有空格的字符串。

nextLine()：

1. 以Enter为结束符,也就是说nextLine()方法返回的是输入回车之前的所有字符。
2. 可以获得空白。

也就是如果你输入了Didnelpsun King Golden这种字符串，next()会分别输出Didnelpsun、King、Golden这三个单词，而nextLine()会一行中就输出。

#### &emsp;&emsp;7.3nextInt()等方法

如果你想输入数字或者布尔类型，如Boolean、Integer、BigDecimal、Byte等，都有对应的next以及hasNext方法。

如NextBoolean对应hasNextBoolean，nextFloat对应hasNextFloat，nextLong对应hasNextLong等。

其基本使用与上面的方法类似。
