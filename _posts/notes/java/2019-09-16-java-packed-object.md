---
layout: post
title:  "包装类"
date:   2019-09-16 23:01:12 +0800
categories: notes java base
tags: Java 基础 Integer Long Short Boolean Character Double Float Number
excerpt: "四种基本类型的包装对象"
---

为了将基本类型作为对象处理，并连接相关的方法，Java为每个基本类型都提供了包装类。这些类都保存在`java.lang`包中。

## Integer\Long\Short类

Number类有三个子类：Integer类、long类、Short类，分别封装int、long、short类型。他们的方法基本相同。

### &emsp;1. 构造方法

1. `Integer\Long\Short(数值)`  
如：`Integer num = new Integer(7);`  
2. `Integer\Long\Short(字符串值)`  
如：`Integer num = new Integer("135");`  

### &emsp;2. 引用字符串常量

1. `byteValue()`：以byte类型返回值。
2. `compareTo(比较值)`：比较两个数值，如果相等返回0，如果小于比较值就返回负值，大于就返回正值。
3. `equals(比较对象)`：比较两个对象是否相等。
4. `intValue()`：以int类型返回值。
5. `shortVale()`：以short类型返回值。
6. `toString()、toBinaryString()、toHexString()、toOctalString()`：转换为String的十、二、八、十六进制对象。  
7. `valueOf(字符串)`：返回保存指定的String值的对应Number对象。
8. `parseInt(字符串)`：返回保存在字符串中的数字的等价整数值。
9. `longValue()`：以long类型返回值。

### &emsp;3. 常量

`MAX_VALUE`：表示该数字类型可取的最大值。
`MIN_VALUE`：表示该数字类型可取的最小值。
`SIZE`：用来以二进制补码形式表示该数字类型值的位数。
`TYPE`：表示该基本类型的Class实例。

以数字类.常量名来获取，如：`int max = Integer.MAX_VALUE;`

&emsp;

## Boolean类

### &emsp;1. 构造方法

1. `Boolean(true/false)`  
创建一个表示该参数的Boolean对象。
2. `Boolean(字符串值)`  
创建一个表示该参数的`Boolean`对象。如果`String`参数不为`null`且忽略大小写时为`true`，则分配一个表示`true`的`Boolean`对象，否则获得一个`false`值的`Boolean`对象。  
如：`Boolean bool = new Boolean("ok");`

### &emsp;2. 引用字符串常量

1. `booleanValue()`：以`boolean`类型返回值。
2. `equals(比较对象)`：比较两个对象是否相等。
3. `parseBoolean(字符串)`：将字符串解析为`boolean`值。
4. `toString()`：返回表示该`boolean`值的字符串。
5. `valueOf(字符串)`：返回保存指定的`String`值的对应`boolean`值。

### &emsp;3. 常量

`TRUE`：对应基值`true`的`Boolean`对象。  
`FALSE`：对应基值`false`的`Boolean`对象。  
`TYPE`：基本类型`boolean`的`Class`实例。  

&emsp;

## Byte类

### &emsp;1. 构造方法

1. `Byte(数值)`  
如：`Byte num = new Byte(7);`
2. `Byte(字符串值)`  
如：`Byte num = new Byte("135");`

### &emsp;2. 常用方法

1. `byteValue();`
2. `compareTo(Byte对象);`
3. `doubleValue();`
4. `intValue();`
5. `parseByte(字符串);`
6. `toString();`
7. `valueOf(字符串);`
8. `equals(Byte对象);`

### &emsp;3. 常量

`MAX_VALUE`：表示Byte类型可取的最大值。

`MIN_VALUE`：表示Byte类型可取的最小值。

`SIZE`：用来以二进制补码形式表示Byte值的位数。

`TYPE`：表示该基本类型的Class实例。

&emsp;

## Character类

### &emsp;1. 构造方法

`Character(字符串值)`
如：`Character num = new Character("135");`
一旦创建，其中的字符串值就不能发生改变。

### &emsp;2. 常用方法

1. `charValue();`
2. `compareTo(Character对象);`
3. `toString();`
4. `valueOf(字符串);`
5. `equals(Character对象);`
6. `toUpperCase(字符串)`：将字符串参数变为全大写。
7. `toLowerCase(字符串)`：将字符串参数变为全小写。
8. `isUpperCase(字符串)`：判断字符串是否为大写字符。
9. `isLowerCase(字符串)`：判断字符串是否为小写字符。
如：`Character.isUpperCase("DFG")`

### &emsp;3. 常量

`CONNECTOR_PUNCTUATION`：返回byte型值，表示Unicode规范中的常规类型"Pc"。

`UNASSIGNED`：返回`byte`值，表示Unicode规范中的常规类别"Cn"。

`TITLECASE_LETTER`：返回`byte`值，表示Unicode规范中的常规类别"Lt"。

&emsp;

## Double\Float类

Number类有两个子类：Double类、Float类，分别封装double、float类型。他们的方法基本相同。

### &emsp;1. 构造方法

1. `Double\Float(数值)`
如：`Double num = new Double(7);`
2. `Double\Float(字符串值)`
如：`Double num = new Double("135");`

### &emsp;2. 常用方法

1. `byteValue()`
2. `compareTo(Double/Float对象)`
3. `equals(Double/Float对象)`
4. `intValue()`
5. `isNaN()`
6. `toString()`
7. `valueOf(字符串)`
8. `doubleValue()`
9. `floatValue()`
10. `longValue()`

### &emsp;3. 常量

`MAX_EXPONENT`：返回int值，表示有限double/float变量可取的最大指数。

`MIN_EXPONENT`：返回int值，表示有限double/float变量可取的最小指数。

`NEGATIVE_INFINITY`：返回double/float值，表示保存double/float类型的负无穷大值的常量。

`POSITIVE_INFINITY`：返回double/float值，表示保存double/float类型的正无穷大值的常量。

&emsp;

## Number类

抽象类`Number`类是`BigDecimal`、`BigInteger`、`Byte`、`Double`、`Float`、`Integer`、`Long`、`Short`类的父类，给他们提供转换为相应类型值的方法。抽象类也就是说明它仅作为标准，本身是不能构造相关实例的，这也是面向对象中的多态。
来自于`java.lang.Number`包。

抽象方法：  
`byteValue()`、`intValue()`、`doubleValue()`、`floatValue()`、`longValue()`、`shortValue()`
