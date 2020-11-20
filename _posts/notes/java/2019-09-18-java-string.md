---
layout: post
title:  "字符串"
date:   2019-09-18 12:26:56 +0800
categories: notes java base
tags: Java 基础 字符串 String String-Builder 格式化 SimpleDateFormat
excerpt: "String类"
---

Java中字符串以`String`类的实例来处理。可以通过`java.lang`包中的`String`类创建字符串对象。

## 声明

字符串必须在双引号中，如："你好"，"a"  

<span style="color:aqua">格式：</span>`String 字符串变量名;`  

字符串必须声明才能使用，如果最开始不知道其值，可以赋为空字符串。

&emsp;

## 创建与赋值

### &emsp;1. 使用字符数组构造

<span style="color:aqua">格式：</span>`String 变量名=new String(字符数组名);`  

如：

```java
char a[] = {'a','b','c'};
String s = new String(a);
```

<span style="color:aqua">格式：</span>`String 变量名= new String(字符数组名,开始截取字符串位置，截取字符串长度);`  

可以提取字符数组的一部分。

### &emsp;2. 使用字符串常量构造

<span style="color:aqua">格式：</span>`String 变量名=new String(字符串常量);`  

如：  
`String s = new String("nmsl");`

### &emsp;3. 引用字符串常量

<span style="color:aqua">格式：</span>

```java
String 变量名;  
变量名=字符串常量;  
```

如：  

```java
String s1;
s1="hello world";
```

值得注意的是如果将多个变量都引用同一个字符串常量，那实际上他们是一样的，因为他们都指向同一个实体。

&emsp;

## 字符串连接

### &emsp;1. 连接多字符串

使用+连接多个字符串。  
且如果一个字符串太长，可以将字符串分开，换行再加上+。

### &emsp;2. 连接其他数据类型

同样使用+号连接，会将不同类型的变量统一转换为字符串，因为会自动调用`toString()`方法。  
如果我们想在输出的时候先对变量操作，可以使用()将相应的变量包裹，因为()的优先级最高。  

&emsp;

## 获取字符串信息

### &emsp;1. 获取字符串长度（length()）

<span style="color:aqua">格式：</span>`字符串变量名.length();`

### &emsp;2. 字符串查找（indexOf()、lastIndexOf()）

<span style="color:aqua">格式：</span>`目标字符串.indexOf(搜索字符串)`  

返回搜索的字符或字符串首次出现的位置。如果没有搜索到就返回-1。  

<span style="color:aqua">格式：</span>`目标字符串.lastIndexOf(搜索字符串)`  

返回搜索的字符或字符串最后一次出现的位置。如果没有搜索到就返回-1。  

如果搜索字符串是空字符串，那么返回就是字符串长度。  

### &emsp;3. 获取指定索引位置的字符（charAt()）

<span style="color:aqua">格式：</span>`目标字符串.charAt(索引值);`

&emsp;

## 字符串操作

### &emsp;1. 截取字符串（substring()）

<span style="color:aqua">格式：</span>`目标.substring(开始截取索引值)`  

返回从指定的索引值开始截取到结尾的子串。

<span style="color:orange">注意：</span>字符串中空格占一个索引位置。  

<span style="color:aqua">格式：</span>`目标.substring(开始截取索引值,结束索引值)`  

返回从指定的索引值开始截取到结束位置的子串。

### &emsp;2. 去除空格（trim()）

<span style="color:aqua">格式：</span>`目标字符串.trim()`  

返回字符串的副本，忽略前导空格和尾部空格。  

### &emsp;3. 替换字符串（replace()）

<span style="color:aqua">格式：</span>`目标字符串.replace(要替换的字符或字符串,用于替换原来字符串的内容)`  

返回的是一个新字符串，如果要替换的字符或字符串没有出现在目标字符串中，那返回原字符串。  
且替换是全局替换。

### &emsp;4. 判断字符串开始结尾（startsWith()、endsWith()）

这两个方法是判断字符串是否以指定的内容开始或者结束，其返回值为`boolean`值。  

`startsWith()`判断当前字符串对象的前缀是否为参数指定的字符串。  

<span style="color:aqua">格式：</span>`目标字符串.startsWith(前缀字符)`  

endsWith()判断当前字符串对象是否以参数指定的字符串结束。  

<span style="color:aqua">格式：</span>`目标字符串.endsWith(后缀字符)`  

如：  

```java
String s1 = new String("24533");  
boolean b = s1.startsWith("24");  
```

### &emsp;5. 判断字符串是否相等（equals()、equalslgnoreCase()）

对于字符串对象不能简单地使用==来比较，因为这样比较的是两个对象的地址，而这两个对象如果是不一样的，对象的地址是不同的。所以即使他们的值相等，那么返回的仍然是`false`。  

<span style="color:aqua">格式：</span>`目标字符串1.equals(目标字符串2)`  

如果字符串具有相同的字符或者长度，就返回`true`。  

<span style="color:aqua">格式：</span>`目标字符串1.equalsIgnoreCase(目标字符串2)`  

如果字符串具有相同的字符或者长度，就返回`true`。但是字符串不区分大小写。  

### &emsp;6. 判断字符串顺序（compareTo()）

<span style="color:aqua">格式：</span>`目标字符串1.compareTo(目标字符串2)`  

按字典顺序比较两个字符串，基于每个字符的Unicode值，如果目标字符串1位于目标字符串2前面，就返回一个负整数，若是在后面，就返回一个正整数，如果相等就返回0。

### &emsp;7. 大小写转换（toLowerCase()、toUpperCase()）

<span style="color:aqua">格式：</span>`目标字符串.toLowerCase()`  

全部字母转为小写。  

<span style="color:aqua">格式：</span>`目标字符串.toUpperCase()`  

全部字母转为大写。  
大小写转换时数字与非字符不受影响。  

### &emsp;8. 分割字符串（split()）

<span style="color:aqua">格式：</span>`目标字符串.split(分隔符号或者正则表达式)`  

如果有多高分隔符，可使用\|隔开分割符。

<span style="color:aqua">格式：</span>`目标字符串.split(分隔符号或者正则表达式,切割限定次数)`

```java
String str2="a&b&c";
String strs[]=str2.split("&");
   for(String str:strs){
System.out.println(str);
}
不会输出a,b,c,只有这样处理才可以：
String str2="a&b&c";
String strs[]=str2.split("\\u0024");
   for(String str:strs){
System.out.println(str);
}  
```

1. 如果用\.作为分隔的话，必须是如下写法：`String.split("\\.")`,这样才能正确的分隔开，不能用`String.split(".")`;
2. 如果用\|作为分隔的话，必须是如下写法：`String.split("\\|")`,这样才能正确的分隔开，不能用`String.split("|")`;
`.`和`|`都是转义字符，必须得加`\\`;

&emsp;

## 字符串生成器（String-Builder类）

创建成功的字符串对象，长度是固定的，内容无法被改变，虽然使用+可以增长字符串，但是其实是返回一个新的`String`对象。如果是重复修改字符串会大量占用系统内存，所以增加了字符序列`String-Builder`类。该类在`java.lang.StringBuilder`的API。  

<span style="color:aqua">格式：</span>`StringBuilder 对象名 = new StringBuilder("字符串初始值");`

### &emsp;1. append()

用于向字符串生成器追加内容，可以追加任何数据类型，如`int`、`boolean`、另一个字符串生成器等。  

<span style="color:aqua">格式：</span>`字符串生成器名.append(内容);`  

### &emsp;2. insert()

用于向字符串生成器插入内容，可以插入任何数据类型，如`int`、`boolean`、另一个字符串生成器等。  

<span style="color:aqua">格式：</span>`字符串生成器名.insert(目标索引值,内容);`

### &emsp;3. delete()

用于删除字符串生成器中的字符。  

<span style="color:aqua">格式：</span>`字符串生成器名.delete(起始位置,结束位置);`  

不包含结束位置。  

### &emsp;4. toString()

将该对象转换为字符串输出。直接`字符串.string()`

&emsp;

## 格式化字符串

`String`类的静态`format()`方法用于创建格式化的字符串。  
可以和`println()`配合使用以实现`printf()`方法的作用。  

<span style="color:aqua">格式：</span>`String.format(格式转换字符串，参数)`  

参数可以为0，如果参数数量超过了对应格式符的数量，多余的就自动省略。  

<span style="color:aqua">格式：</span>`String.format(格式化应用的语言环境,格式转换字符串，参数)`  

一般省去语言环境的化就进行本地化，如果该参数为`null`，就不进行本地化。  

格式转换码一般以%开始。

### &emsp;1. 日期时间字符串格式化

导入Date包:`import java.util.Date`  

对于Date类详细请看[Java基础7]({% post_url /notes/java/2019-09-25-java-date %})

然后需要创建Date对象然后对这个对象格式化然后输出。  

#### &emsp;&emsp;1.1 format()函数

日期格式化转换码：  
%te：一个月的天数；  
%tb：语言环境下的月份简称；  
%tB：语言环境下的月份全称；  
%ta：语言环境下的星期几简称；
%tA：指定语言环境的星期几全称；  
%tc：包括全部日期和时间信息；  
%ty：二位年份；  
%tY:四位年份；  
%tj：一年中的第几天；  
%tm：月份；  
%td：一个月中的第几天；

如：  

```java
import java.util.Date;
public class Eval{
    public static void main(String[] args){
        Date date = new Date();
        String year = String.format("%Y",date);
        String month = String.format("%tB",date);
        String day = String.format("%td",date);
        System.out.println("今年："+year+"年");
        System.out.println("现在是"+month);
        System.out.println("今天是："+day+"号");
    }
}
```

时间格式转换码：  
%tI：2位数字的12的小时；  
%tH：2位数字的24的小时；  
%tl：1到2位数字的12的小时；  
%tk：1到2位的24的小时；  
%tM：2位数字的分钟；  
%tS：2位数字的秒数；  
%tL：3位数字的毫秒数；  
%tN：9位数字的微秒数；  
%tp：指定语言的上午下午标记；  
%tZ：相对于GMT RFC 82格式的数字时区偏移量；  
%ts：1970.1.1.00:00:00到现在的秒数；  
%tQ：1970.1.1.00:00:00到现在的秒数；  
获取时间方式是与获取日期一致的。

日期时间组合格式转换码：  
%tF：年-月-日 四位年份格式；  
%tD：月/日/年 两位年份格式；  
%tc：全部日期和时间信息；  
%tr：时：分：秒 PM/AM 12时制格式；  
%tT：时：分：秒 24时制格式；  
%tR：时：分 24时制格式；

### &emsp;1.2 SimpleDateFormat类

`SimpleDateFormat`是一个以语言环境敏感的方式来格式化和分析日期的类。  `SimpleDateFormat`允许你选择任何用户自定义日期时间格式来运行。  

如：

```java
import  java.util.*;
import java.text.*;
public class DateDemo {
    public static void main(String args[]) {
    Date dNow = new Date( );
    SimpleDateFormat ft = new SimpleDateFormat ("yyyy-MM-dd hh:mm:ss");
        System.out.println("当前时间为: " + ft.format(dNow));
   }
}
```

这一行代码确立了转换的格式，其中yyyy是完整的公元年，MM是月份，dd是日期，HH:mm:ss 是时、分、秒。

注意:有的格式大写，有的格式小写，例如MM是月份mm是分；HH是24小时制，而hh是12小时制。  
`>>>>>2019-09-18 22:16:34`

格式控制符：

字母|描述|示例  
:--:|:--|:--:
G|纪元标记|AD  
y|四位年份|2001  
M|月份|July or 07  
d|一个月的日期|10  
h|A.M./P.M. (1~12)格式小时|12  
H|一天中的小时 (0~23)|22  
m|分钟数|30  
s|秒数|55  
S|毫秒数 234  
E|星期几|Tuesday  
D|一年中的日子|360  
F|一个月中第几周的周几|2 (second Wed. in July)  
w|一年中第几周|40  
W|一个月中第几周|1  
a|A.M./P.M. 标记|PM  
k|一天中的小时(1~24)|24  
K| A.M./P.M. (0~11)格式小时|10  
z|时区 Eastern Standard Time|+8000  
'|文字定界符|Delimiter  
"|单引号|`  

### &emsp;1.3 printf()函数

printf方法可以很轻松地格式化时间和日期。使用两个字母格式，它以 %t 开头并且以下面表格中的一个字母结尾。  
c 包括全部日期和时间信息 星期六 十月 27 14:21:20 CST 2007  
F "年-月-日"格式 2007-10-27  
D "月/日/年"格式 10/27/07  
r "HH:MM:SS PM"格式（12时制） 02:25:51 下午  
T "HH:MM:SS"格式（24时制） 14:28:16  
R "HH:MM"格式（24时制） 14:28  

如：

```java
import java.util.Date;
public class DateDemo {
  public static void main(String args[]) {
     // 初始化 Date 对象
     Date date = new Date();
    //c的使用  
    System.out.printf("全部日期和时间信息：%tc%n",date);
    //f的使用  
    System.out.printf("年-月-日格式：%tF%n",date);  
    //d的使用  
    System.out.printf("月/日/年格式：%tD%n",date);  
    //r的使用  
    System.out.printf("HH:MM:SS PM格式（12时制）：%tr%n",date);  
    //t的使用  
    System.out.printf("HH:MM:SS格式（24时制）：%tT%n",date);  
    //R的使用  
    System.out.printf("HH:MM格式（24时制）：%tR",date);  
  }
}
>>>>>
全部日期和时间信息：星期一 九月 10 10:43:36 CST 2012  
年-月-日格式：2012-09-10  
月/日/年格式：09/10/12  
HH:MM:SS PM格式（12时制）：10:43:36 上午  
HH:MM:SS格式（24时制）：10:43:36  
HH:MM格式（24时制）：10:43  
```

如果你需要重复提供日期，那么利用这种方式来格式化它的每一部分就有点复杂了。因此，可以利用一个格式化字符串指出要被格式化的参数的索引。

索引必须紧跟在%后面，而且必须以`$`结束。例如：

```java
import java.util.Date;
public class DateDemo {
   public static void main(String args[]) {
       // 初始化 Date 对象
       Date date = new Date();
       // 使用toString()显示日期和时间
       System.out.printf("%1$s %2$tB %2$td, %2$tY","Due date:", date);
   }
}
>>>>>
Due date: February 09, 2014
```

或者，你可以使用<标志。它表明先前被格式化的参数要被再次使用。例如：

```java
import java.util.Date;
public class DateDemo {
   public static void main(String args[]) {
       // 初始化 Date 对象
       Date date = new Date();  
       // 显示格式化时间
       System.out.printf("%s %tB %<te, %<tY","Due date:", date);
   }
}

>>>>>
Due date: February 09, 2014
```

定义日期格式的转换符可以使日期通过指定的转换符生成新字符串。这些日期转换符如下所示：

```java
import java.util.*;
public class DateDemo {
   public static void main(String args[]) {
       Date date=new Date();
        //b的使用，月份简称  
        String str=String.format(Locale.US,"英文月份简称：%tb",date);
        System.out.println(str);
        System.out.printf("本地月份简称：%tb%n",date);  
        //B的使用，月份全称  
        str=String.format(Locale.US,"英文月份全称：%tB",date);  
        System.out.println(str);  
        System.out.printf("本地月份全称：%tB%n",date);  
        //a的使用，星期简称  
        str=String.format(Locale.US,"英文星期的简称：%ta",date);  
        System.out.println(str);  
        //A的使用，星期全称  
        System.out.printf("本地星期的简称：%tA%n",date);  
        //C的使用，年前两位  
        System.out.printf("年的前两位数字（不足两位前面补0）：%tC%n",date);  
        //y的使用，年后两位  
        System.out.printf("年的后两位数字（不足两位前面补0）：%ty%n",date);  
        //j的使用，一年的天数  
        System.out.printf("一年中的天数（即年的第几天）：%tj%n",date);  
        //m的使用，月份  
        System.out.printf("两位数字的月份（不足两位前面补0）：%tm%n",date);  
        //d的使用，日（二位，不够补零）  
        System.out.printf("两位数字的日（不足两位前面补0）：%td%n",date);  
        //e的使用，日（一位不补零）  
        System.out.printf("月份的日（前面不补0）：%te",date);  
   }
}
>>>>>
英文月份简称：May
本地月份简称：五月
英文月份全称：May
本地月份全称：五月
英文星期的简称：Thu
本地星期的简称：星期四
年的前两位数字（不足两位前面补0）：20
年的后两位数字（不足两位前面补0）：17
一年中的天数（即年的第几天）：124
两位数字的月份（不足两位前面补0）：05
两位数字的日（不足两位前面补0）：04
月份的日（前面不补0）：4
```

### &emsp;2. 常规字符串格式化

%b、%B：转换为布尔类型；  

%h、%H：转换为散列码；  

%s、%S：转换为字符串类型；  

%c、%C：转换为字符类型；  

%d：转换为十进制整数；  

%o：转换为八进制整数；  

%x、%X：转换为十六进制整数；  

%e：转换为用计算机科学计数法表示的十进制数；  

%a：转换为带有效位数和指数的十六进制浮点值；  

%n：转换为行分隔符； %%：转换为%；
