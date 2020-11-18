---
layout: post
title:  "控制流"
date:   2020-03-14 20:55:33 +0800
categories: notes mysql base
tags: MySQL 基础 mysql CASE IF THEN IFNULL NULLIF
excerpt: "分支与条件判断"
---

## CASE语句

是控制流结构，可以在查询中构造条件。使用方式和其他编程语言一致，CASE后是判断值，每一个分支对应着一个对比值，如果相等就直接到后面的条件，不过没有break，如果都不满足就到ELSE的值，最后使用END结束。

<span style="color:aqua">格式：</span>

```sql
CASE 值
WHEN 比较值1 THEN 结果1
WHEN 比较值2 THEN 结果2
...
ELSE 结果n END
```

如果我们对比值不是一个值，而是需要对一系列条件来对比，如条件为true就返回后面的结果，则

```sql
CASE
WHEN 条件1 THEN 结果1
WHEN 条件2 THEN 结果2
...
ELSE 结果n END
```

如果没有最后的ELSE子句且都不满足条件，则返回NULL。

CASE返回值的类型是来自于上下文类型，如果上下文是字符串类型，则返回值是字符串，如果是数值则会是数值。

比如我们要计算记录着缴纳学分数据的test数据库，score代表平均学分绩，如果小于60则不及格，course代表课时学分，小于30证明课程不足，fee代表费用，小于4000则代表未交满。计算对应的满足条件的人数：

```sql
SELECT
    SUM(CASE WHEN score>=60 THEN 1 ELSE 0 END) AS scoresum,
    SUM(CASE WHEN course>=30 THEN 1 ELSE 0 END) AS
    coursesum,
    SUM(CASE WHEN fee>=4000 THEN 1 ELSE 0 END) AS
    feesum
FROM
    test;
```

&emsp;

## IF语句与IF()

### &emsp;IF语句

IF语句允许根据表达式的某个条件或值结果来执行一组SQL语句。 要在MySQL中形成一个表达式，可以结合文字，变量，运算符，甚至函数来组合。表达式可以返回TRUE,FALSE或NULL，这三个值之一。

也和其他编程语言的if语句一样，如果条件为true就执行对应的运算语句，如果false就不执行。

<span style="color:aqua">格式：</span>

```sql
IF 条件表达式 THEN
    运算语句
END IF;
```

如果还要执行false的状态，则：

```sql
IF 条件表达式 THEN
    运算语句;
END IF;
```

如果有多个条件判断可以添加多个ELSEIF：

```sql
IF 条件表达式1 THEN
    运算语句1;
ELSEIF 条件表达式2 THEN
    运算语句2;
...
ELSE
    运算语句n;
END IF;
```

我们关注到这里有很多的;符号，因为如果有一个值返回就不用管后面的值了，END IF我觉得大部分是语法格式而非必要的逻辑格式。

```sql
DELIMITER $$
CREATE PROCEDURE GetCustomerLevel(
    in  p_customerNumber int(11), 
    out p_customerLevel  varchar(10))
BEGIN
    DECLARE creditlim double;
    SELECT creditlimit INTO creditlim
    FROM customers
    WHERE customerNumber = p_customerNumber;
    IF creditlim > 50000 THEN
 SET p_customerLevel = 'PLATINUM';
    ELSEIF (creditlim <= 50000 AND creditlim >= 10000) THEN
        SET p_customerLevel = 'GOLD';
    ELSEIF creditlim < 10000 THEN
        SET p_customerLevel = 'SILVER';
    END IF;
END$$
```

### &emsp;IF()

IF函数的使用方式要明显简单于IF语句，<span style="color:aqua">格式：</span>`IF(表达式1,表达式2,表达式3)`

当表达式1为true(表达式1<>0并且 表达式1<>NULL)，IF()返回结果为表达式2，否则返回表达式3。IF()返回的结果是数字还是字符串，取决于上下文中的使用。如果表达式2或表达式3中只有一个为NULL，那么IF()函数的结果类型为不是NULL的那一个表达式。

如`SELECT IF(1<2,'yes','no');`就会返回yes。

&emsp;

## IFNULL()与NULLIF()

这两个函数已经在[数据操作的空值]({% post_url notes/mysql/2020-03-09-mysql-data-operation-1 %})中讲过了。
