---
layout: post
title:  "数据类型（1）"
date:   2020-03-06 13:40:10 +0800
categories: notes mysql base
tags: MySQL 基础 mysql TINYINT SMALLINT MEDIUMINT INT BIGINT ZEROFILL SIGNED UNSIGNED FLOAT DOUBLE DECIMAL TRUNCATE FORMAT BIT BIN LPAD
excerpt: "数字与布尔"
---

## 数字类型

除了BIT类型，其他数字类型都可以有或无符号。

数字类型|描述
:------:|:--
TINYINT|一个很小的整数
SMALLINT|一个小的整数
MEDIUMINT|一个中等大小的整数
INT|一个标准整数
BIGINT|一个大整数
DECIMAL|定点数
FLOAT|单精度浮点数
DOUBLE|双精度浮点数
BIT|一个字节字段

### &emsp;1. TINYINT、SMALLINT、MEDIUMINT、INT、BIGINT

整数，无论正负。

类型|字节|有符号最小值|有符号最大值|无符号最大值
:--:|:--|:----------:|:---------:|:---------:
TINYINT|1|-2^4|2^4|2^8
SMALLINT|2|-2^8|2^8|2^16
SMALLINT|3|-2^12|2^12|2^24
SMALLINT|4|-2^16|2^16|2^32
SMALLINT|8|-2^32|2^32|2^64

```sql
--使用INT类型作为自加主键
CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_text VARCHAR(255)
);
```

#### &emsp;&emsp;1.1INT()显示宽度

MySQL提供了一个扩展，允许指定显示宽度以及INT数据类型。显示宽度包含在INT关键字后面的括号内，例如，INT(3)指定一个显示宽度为三位数的INT。
<span style="color:orange">注意：</span>显示宽度属性不能控制列可以存储的值范围。显示宽度属性通常由应用程序用于格式化整数值。 MySQL将显示宽度属性作为返回结果集的元数据。

#### &emsp;&emsp;1.2ZEROFILL属性

在定义表单时如果在INT类型的数据后添加ZEROFILL属性，则会将所有的空格填充为0。

```sql
--创建表--
CREATE TABLE test(
    id INT AUTO_INCREMENT PRIMARY KEY,
    v1 INT(2) ZEROFILL,
    v2 INT(3) ZEROFILL,
    v3 INT(5) ZEROFILL
);
--插入新行--
INSERT into test(v1,v2,v3)
VALUES(2,2,2);
--查询数据--
SELECT v1,v2,v3
FROM test;
```

```terminal
>>>>>
+----+-----+-----+------+
|id  |v1   |v2   |v3    |
+----+-----+-----+------+
|0   |02   |002  |00002 |
+----+-----+-----+------+
```

因为已知会控制显示宽度，那么不满足宽度的默认将以空格填充，而使用ZEROFILL属性后将以0替代空格。

<span style="color:yellow">提示：</span>对整数列使用ZEROFILL属性，MySQL将自动将一个UNSIGNED属性添加到该列。

#### &emsp;&emsp;1.3SIGNED与UNSIGNED

指INT类型是否为有符号类型。

<span style="color:aqua">格式：</span>`INT类型 SIGNED/UNSIGNED`

#### &emsp;&emsp;1.4GREATEST()与LEAST()

GREATEST和LEAST函数都使用N个参数，并分别返回最大和最小值。下面说明GREATEST和LEAST函数的<span style="color:aqua">格式：</span>`GREATEST(值1, 值2...);`

参数可能具有混合数据类型。以下比较规则适用于这两个函数：

+ 如果任何参数为NULL，则两个函数都将立即返回NULL，而不进行任何比较。
+ 如果在INT或REAL上下文中使用函数，或者所有参数都是整数值或REAL值，那么它们将分别作为INT和REAL来比较。
+ 如果参数由数字和字符串组成，则函数将它们作为数字进行比较。
+ 如果至少一个参数是非二进制(字符)字符串，则函数将将参数作为非二进制字符串进行比较。
+ 在所有其他情况下，函数将参数作为二进制字符串进行比较

### &emsp;2. FLOAT、DOUBLE、REAL、DECIMAL / NUMERIC

浮点类型有两种，分别是单精度浮点数（FLOAT）和双精度浮点数（DOUBLE 和REAL）；定点类型只有一种，就是 DECIMAL / NUMRIC。

浮点类型和定点类型都可以用(M, D)来表示，其中M称为精度，表示总共的位数；D称为标度，表示小数的位数。

浮点数类型的取值范围为 M（1～255）和 D（1～30，且不能大于 M-2），分别表示显示宽度和小数位数。M 和 D 在 FLOAT 和DOUBLE 中是可选的，FLOAT 和 DOUBLE 类型将被保存为硬件所支持的最大精度。DECIMAL 的默认 D 值为 0、M 值为 10。

类型名称|说明|存储需求
:------:|:--|:------:
FLOAT|单精度浮点数|4 个字节
DOUBLE|双精度浮点数|8 个字节
DECIMAL / NUMRIC(M,D)|压缩的"严格"定点数|M+2 个字节

DECIMAL 类型不同于 FLOAT 和 DOUBLE。DOUBLE 实际上是以字符串的形式存放的，DECIMAL 可能的最大取值范围与 DOUBLE 相同，但是有效的取值范围由 M 和 D 决定。如果改变 M 而固定 D，则取值范围将随 M 的变大而变大。从上表中可以看到，DECIMAL 的存储空间并不是固定的，而由精度值 M 决定，占用 M+2 个字节。

FLOAT 类型的取值范围如下：  
有符号的取值范围：-3.402823466E+38～-1.175494351E-38。  
无符号的取值范围：0 和 -1.175494351E-38～-3.402823466E+38。

DOUBLE 类型的取值范围如下：  
有符号的取值范围：-1.7976931348623157E+308～-2.2250738585072014E-308。  
无符号的取值范围：0 和 -2.2250738585072014E-308～-1.7976931348623157E+308。

FLOAT 和 DOUBLE 在不指定精度时，默认会按照实际的精度（由计算机硬件和操作系统决定），DECIMAL 如果不指定精度，默认为（10，0）。

REAL在默认情况下会等价于DOUBLE类型，但是如果SQL服务器模式包括REAL_AS_FLOAT选项，那么会默认它为FLOAT同义字。

<span style="color:red">警告：</span>在 MySQL 中，定点数以字符串形式存储，在对精度要求比较高的时候（如货币、科学数据），使用 DECIMAL 的类型比较好，另外两个浮点数进行减法和比较运算时也容易出问题，所以在使用浮点数时需要注意，并尽量避免做浮点数比较。

#### &emsp;&emsp;2.1TRUNCATE()

<span style="color:aqua">格式：</span>`TRUNCATE(数字,要保留的小数位数)`

#### &emsp;&emsp;2.2FORMAT()

也是为了格式化数字的，<span style="color:aqua">格式：</span>`FORMAT(要格式化的数字,要舍入的小数位数,分组)`

千位分隔符是一个可选参数，用于确定千位分隔符和分隔符之间的分组。如果省略，MySQL将默认使用en_US。

如：`SELECT FORMAT(12500.2015,2,'de_DE');`会返回12.500,20，因为de_DE语言环境会使用.来分隔千位，而使用,来分隔小数点。

### &emsp;3. BIT

MySQL提供了允许您存储位值的BIT类型。BIT(m)可以存储多达m位的值，m的范围在1到64之间。如果省略，默认值为1。

要指定一个位值字面值，可使用b'val'或0bval来表示，该val是仅包含0和1的二进制值。
开头字符b可以写成B，例如b01和B11。

但是，前导0b是区分大小写的，所以不能使用0B。如0B'1000'就是错误的。

我们将创建一个表，用来保存工作日信息，并利用BIT进行相关处理：

```sql
CREATE TABLE working_calendar(
    y INT,
    w INT,
    days BIT(7),
    PRIMARY KEY(y,w)
);
--days列中的值表示工作日或休息日，即1：表示工作日，0表示休息日。--
--假设2017年第一周的星期六、星期日和星期五不是工作日，在working_calendar表中插入一行--
INSERT INTO working_calendar(y,w,days)
VALUES(2017,1,B'0111100');
--查询--
SELECT y, w , days
FROM working_calendar;
```

```terminal
>>>>>
+------+---+---------+
| y    | w | days    |
+------+---+---------+
| 2017 | 1 | <       |
+------+---+---------+
1 row in set
```

#### &emsp;&emsp;3.1BIN()

如上所见，days列中的位值被转换成一个字符（因为0111100转换为十进制为60，而60的ASCII码正好为<）。要将其表示为位值，请使用`BIN()`函数：

```sql
SELECT y, w , bin(days)
FROM working_calendar;
```

```terminal
>>>>>
+------+---+-----------+
| y    | w | bin(days) |
+------+---+-----------+
| 2017 | 1 | 111100    |
+------+---+-----------+
1 row in set
```

如果将值插入到长度小于m位的BIT(m)列中，MySQL将在位值的左侧使用零填充。比如这个案例我们插入的是01111100值，如果我们输入111100的值也可以工作，因为MySQL将使用零填充左侧。但是无论怎么样这个显示并不是我们想要的，我们要可以工作，也能显示我们原来的二进制数据，而它把前导符0给删掉了。

#### &emsp;&emsp;3.2LPAD()

为了使其变为原来的样子，我们使用`LPAD()`函数进行填充，<span style="color:aqua">格式：</span>LPAD(数据,数据长度,填充值)

如我们再输入`SELECT y, w , lpad(bin(days),7,'0') FROM working_calendar;`将会变成我们原来的数据。

### &emsp;4. 数学函数

MySQL中含有许多数学操作，所以需要很多数学函数：

+ ABS(x);//返回x的绝对值
+ ACOS(x);//返回x(弧度)的反余弦值
+ ASIN(x);//返回x(弧度)的反正弦值
+ ATAN(x);//返回x(弧度)的反正切值
+ CEILING(x);//返回大于x的最小整数值
+ COS(x);//返回x(弧度)的余弦值
+ COT(x);//返回x(弧度)的余切
+ DEGREES(x);//返回弧度值x转化为角度的结果
+ EXP(x);//返回值e(自然对数的底)的x次方
+ FLOOR(x);//返回小于x的最大整数值
+ LN(x);//返回x的自然对数
+ LOG(x,y);//返回x的以y为底的对数
+ MOD(x,y);//返回x/y的模(余数)
+ PI();//返回pi的值（圆周率）
+ POW(x,y)或者POWER(x,y);//返回x的y次幂
+ RAND();//返回0到1内的随机数
+ RADIANS(x);//返回角度x转化为弧度的结果
+ ROUND(x,y);//返回参数x的四舍五入的有y位小数的值
+ SIGN(x);//返回代表数字x的符号的值
+ SQRT(x);//返回x的开方
+ SIN(x);//返回x(弧度)的正弦值
+ TAN(x);返回x(弧度)的正切值

## 布尔类型

MySQL并没有内置的布尔类型，实际上也不必要，我们可以使用`TINYINT(1)`取代布尔值。
