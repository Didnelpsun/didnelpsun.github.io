---
layout: post
title:  "数据操作（上）"
date:   2020-03-09 23:26:40 +0800
categories: notes mysql base
tags: MySQL 基础 mysql 分页 排序 运算符 匹配 正则 连接 聚集函数 INSTR 子查询 派生表 临时表
excerpt: "分页排序连接聚集等"
---

对于已经谈过的查询方法，这里并不会说到，只会谈到与[SQL教程]({{ site_url }}/notes/sql)不同的地方

## 分页与限制

在[SQL教程的分页和限制]({% post_url notes/sql/2019-07-08-sql-ddl-operation %})中我们讲到了使用LIMIT来控制显示的数据。但是在MySQL中如果要控制偏移量并不需要使用OFFSET，<span style="color:aqua">格式：</span>`LIMIT [位置偏移量,] 行数`，偏移量是可选的，如果是LIMIT 3,5就是偏移3条记录选取五个，即从2号到6号。

&emsp;

## 排序

### &emsp;FIELD()

可以使用ORDER BY对于属性列进行排序，但是这种排序往往是根据属性值的数字顺序或者字符顺序，如果我们要规定一系列字符串的顺序，可以使用`FIELD()`函数为列中的值定义自己的自定义排序顺序。如：

```sql
--将状态按照break、work、out、attend meeting四个顺序进行排序--
SELECT
    status
FROM
    test
ORDER BY FIELD(
    status,
    `break`,
    `work`,
    `out`,
    `attend meeting`
)
```

### &emsp;自然排序

同时因为说到了一般的排序是按照字符串排序的，且由第一个字符不断向后对比，NULL大于其他值，这就导致了如果是字符串的数字，那么10小于2等现象会出现，那么我们如何对它们进行自然的排序呢？

第一种方式是将同时具有字符串和数字的属性列拆开，分别对它们排序再使用`CONCAT()`合并。

```sql
--在之前首先将数据分为两部分prefix和suffix，然后再合并--
SELECT
    CONCAT(prefix, suffix)
FROM
    items
ORDER BY prefix , suffix;
```

第二种，如果格式标准可以使用函数对于数据转换，然后对转换后的结果进行排序：

```sql
SELECT
    item_no
FROM
    items
ORDER BY CAST(item_no AS UNSIGNED) , item_no;
--将数据转换成整型--
```

第三种也是针对数字字符串的排序，但是前两种都是针对不同长度的数据且数字顺序较乱的情况下，如果字符部分不变，而只是数字部分变化呢？又或者更简单的，如何排序纯数字字符串呢？使用`LENGTH()`：

```sql
--对J-1，J-2...排序--
SELECT
    item_no
FROM
    items
ORDER BY LENGTH(item_no) , item_no;
--首先对长度排序，越短的越在前面，相同的再比较数字大小--
```

&emsp;

## 常用运算符

算术运算符就是加减乘除模。

比较运算符除了=、<、<=、>=、>、<>或!=还有一些特别的运算符。

<=>是安全等于，如果两边表达式相等或者都为NULL时返回TRUE，如果双方不等或者一方为NULL就返回FALSE，不会返回UNKNOWN。而=当表达式有一个NULL就会返回UNKNOWN。

ISNULL或IS NULL与IS NOT NULL判断是否为空值。

LEAST(参数1,参数2...)返回最小值，GREATEST(参数1,参数2...)返回最大值，这两个参数中有一个NULL，则整个都返回NULL。

参数 BETWEEN 极小值 AND 极大值，如果表达式大于或等于最小值，小于或等于最大值就返回1，否则为0。

IN和NOT IN判断值是否在列表中。

逻辑运算符有四个：

逻辑运算符|说明
:-------:|:--:
NOT或者!|逻辑非
AND或者&&|逻辑与
OR或者\|\||逻辑或
XOR|逻辑异或

位运算符如下：

位运算符|说明
\||按位或
&|按位与
^|按位异或
\<\<|按位左移
\>\>|按位右移
~|按位取反，反转所有比特

&emsp;

## 匹配与正则

选项|说明|例子|匹配值示例
:--:|:--|:---|:--------
^|匹配文本的开始字符|'^b' 匹配以字母b开头的字符串|book、big、banana、 bike
$|匹配文本的结束字符|'st$' 匹配以st结尾的字符串|test、resist、persist
.|匹配任何单个字符|'b.t' 匹配任何b和t之间有一个字符|bit、bat、but、bite
\*|匹配零个或多个在它前面的字符|'f*n' 匹配字符n前面有任意个字符f|fn、fan、faan、abcn
+|匹配前面的字符1次或多次|'ba+' 匹配以b开头，后面至少紧跟一个 a|ba、bay、bare、battle
<字符串>|匹配包含指定字符的文本|'fa'|fan、afa、faad
[字符集合]|匹配字符集合中的任何一个字符|'[xz]'匹配 x 或者 z|dizzy、zebra、x-ray、 extra
[^]|匹配不在括号中的任何字符|'[^abc]' 匹配任何不包含 a、b 或c的字符串|desk、fox、f8ke
字符串{n,}|匹配前面的字符串至少n次|b{2} 匹配 2 个或更多的 b|bbb、 bbbb、 bbbbbbb
字符串{n,m}|匹配前面的字符串至少n次，至多m次|b{2,4} 匹配最少2个， 最多4个 b|bbb、 bbbb

&emsp;

## 连接

MySQL支持INNER JOIN、LEFT JOIN、RIGHT JOIN、CROSS JOIN，但是不支持FULL JOIN，如果要使用，可以使用UNION来连接左右外连接的结果。其他的连接方式基本和SQL标准一致。

然后MySQL还多了一个关键字USING，这个关键字怎么使用呢？

<span style="color:aqua">格式：</span>`SELECT 列名1,列名2... FROM 表1 INNER JOIN 表2 USING(相同的列);`

而我们一般是什么格式呢？`SELECT 列名1,列名2... FROM 表1 INNER JOIN 表2 ON 表1.相同的列=表2.相同的列;`也就是说USING就是替代原来的ON子句，但是这是有限制的，必须是INNER JOIN且两个表属性名相同。

&emsp;

## 聚集函数

除了[SQL聚集函数]({% post_url notes/sql/2019-07-10-sql-dml-operation %})中的那些函数。

### &emsp;INSTR()

INSTR()函数返回字符串中子字符串第一次出现的位置。如果在str中找不到子字符串，则INSTR()函数返回零(0)。

<span style="color:aqua">格式：</span>`INSTR(要搜索的字符串,要搜索的子字符串。);`

INSTR()函数不区分大小写。这意味着如果通过小写，大写，标题大小写等，结果总是一样的。

如果希望INSTR函数在非二进制字符串上以区分大小写的方式执行搜索，则可以使用BINARY运算符将INSTR函数的参数从非二进制字符串转换为二进制字符串。

返回MySQL INSTR字符串中的子字符串SQL的位置：`SELECT INSTR('MySQL INSTR', 'SQL');`

### &emsp;GROUP_CONCAT()

GROUP_CONCAT()函数将组中的字符串连接成为具有各种选项的单个字符串。也就是将纵向的数据变成横向的。

<span style="color:aqua">格式：</span>

```sql
GROUP_CONCAT(DISTINCT 表达式
    ORDER BY 表达式
    SEPARATOR 分隔字符);
```

```sql
--使用数据库--
USE test;
--定义表--
CREATE TABLE t (
    v CHAR
);
--插入数据--
INSERT INTO t(v) VALUES('A'),('B'),('C'),('B');
--使用GROUP_CONCAT()来合并字符串--
SELECT
    GROUP_CONCAT(DISTINCT v
        ORDER BY v ASC
        SEPARATOR ';')
FROM
    t;
-->>>>>A;B;C
```

上面语句类似于把SELECT v FROM t GROUP BY v;语句的结果串接起来。

+ DISTINCT子句用于在连接分组之前消除组中的重复值。
+ SEPARATOR指定在组中的值之间插入的文字值。如果不指定分隔符，则GROUP_CONCAT函数使用逗号(，)作为默认分隔符。
+ GROUP_CONCAT函数忽略NULL值，如果找不到匹配的行，或者所有参数都为NULL值，则返回NULL。
+ GROUP_CONCAT函数返回二进制或非二进制字符串，这取决于参数。 默认情况下，返回字符串的最大长度为1024。如果您需要更多的长度，可以通过在SESSION或GLOBAL级别设置group_concat_max_len系统变量来扩展最大长度。

又或者最简单的获取城市的语句：`SELECT GROUP_CONTACT(DISTINCT country) FROM test;`，它返回的就是一行包含城市名字的数据。

我们也可以同时使用`CONCAT_WS()`或者`CONTACT()`，这两个函数在[数据类型：字符串的1.4CONCAT()与CONCAT_WS()]({% post_url notes/mysql/2020-03-06-mysql-data-type-2 %})的字符串函数中。

### &emsp;标准偏差函数

+ STD(表达式) / STDEV_POP(表达式) - 返回表达式的总体标准偏差。如果没有匹配的行，则STD函数返回NULL
+ STDDEV(表达式) - 相当于STD函数，仅提供与Oracle数据库兼容。
+ STDDEV_SAMP(表达式) - 计算样本标准差
+ VAR_POP(表达式) / VARIANCE(表达式) - 计算表达式的总体标准差。
+ VAR_SAMP(表达式) - 计算表达式的样本标准差。

如：

```sql
SELECT FORMAT(STD(orderCount),2)
FROM (SELECT customerNumber, count(*) orderCount
FROM orders
GROUP BY customerNumber) t;
```

&emsp;

## 空值

### &emsp;IFNULL()、NULLIF()

IFNULL()，NULLIF()是控制流函数，接受两个参数，IFNULL()如果第一个非NULL则返回第二个，如果是NULL就返回第二个参数，NULLIF()中如果第一个参数等于第二个参数就返回NULL，否则返回第一个参数。

<span style="color:aqua">格式：</span>`IFNULL / NULLIF(表达式1,表达式2)`

等同于[CASE语句]({% post_url notes/mysql/2020-03-14-mysql-control-flow %})的：

```sql
CASE WHEN 表达式1 = 表达式2
   THEN NULL
ELSE
   表达式1
END;
```

### &emsp;COALESCE()

COALESCE函数需要多个参数，并返回第一个非NULL参数，如果全为NULL，则返回NULL。

<span style="color:aqua">格式：</span>`COALESCE(表达式1,表达式2...)`

如`SELECT COALESCE(NULL,0);`将返回0。

### &emsp;ISNULL()

只接受一个参数，如果是NULL就返回1，否就返回0。

&emsp;

## 序列

在[SQL教程的自动生成主键]({% post_url notes/sql/2019-07-08-sql-ddl-operation %})中已经提过了AUTO_INCREMENT序列。

### &emsp;相关说明

+ AUTO_INCREMENT列的起始值为1，当您向列中插入NULL值或在INSERT语句中省略其值时，它将增加1。
+ 要获取最后生成的序列号，请使用LAST_INSERT_ID()函数。 我们经常要后续语句中使用最后一个插入ID，例如将数据插入到表中。 最后生成的序列在会话中是唯一的。 换句话说，如果另一个连接生成序列号，从连接中可以使用LAST_INSERT_ID()函数获取它。
+ 如果将新行插入到表中并指定序列列的值，如果序列号不存在于列中，则MySQL将插入序列号，如果序列号已存在，则会发出错误。 如果插入大于下一个序列号的新值，MySQL将使用新值作为起始序列号，并生成大于当前值的唯一序列号。这会在序列中产生一段空白(不连续)。
+ 如果使用UPDATE语句将AUTO_INCREMENT列中的值更新为已存在的值，如果该列具有唯一索引，则MySQL将发出重复键错误。 如果将AUTO_INCREMENT列更新为大于列中现有值的值，MySQL将使用最后一个插入序列号加1的值作为下一行列号值。 例如，如果最后一个插入序列号为3，然后又将其更新为10，那么新插入行的序列号不是11，而是4。
+ 如果使用DELETE语句删除最后插入的行，MySQL可能会也可能不会根据表的存储引擎重复使用已删除的序列号。 如果您删除一行，则MyISAM表不会重复使用已删除的序列号，例如，如果删除表中的最后一个插入ID为10，则MySQL仍会为新行生成11个下一个序列号。 与MyISAM表类似，InnoDB表在行被删除时不重复使用序列号。

### &emsp;LAST_INSERT_ID

因为我们经常会因为简便而使用AUTO_INCREMENT序列来作为主键，但是经常会因为不断的插入大量数据而不知道当前的序列最大值。

<span style="color:aqua">格式：</span>`SELECT LAST_INSERT_ID();`

### &emsp;重置自动增量值

因为我们使用AUTO_INCREMENT序列，它随着插入数据而自动给出序列数据，如果表在反复操作，那么序列号会变得十分混乱。

#### &emsp;&emsp;ALTER TABLE

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 AUTO_INCREMENT=值;`，这个值不能小于当前序列值的最大值。

#### &emsp;&emsp;重建表插入

如果一系列的值都已经混乱，那就将除了序列值的数据选择并插入到同一个结构的表中。

&emsp;

## 子查询与派生表

子查询指一个查询语句嵌套在另一个查询语句内部的查询，在 SELECT 子句中先计算子查询，子查询结果作为外层另一个查询的过滤条件，查询可以基于一个表或者多个表。

子查询中常用的操作符有 ANY（SOME）、ALL、IN 和 EXISTS。

子查询可以添加到 SELECT、UPDATE 和 DELETE 语句中，而且可以进行多层嵌套。子查询也可以使用比较运算符，如"<"、"<="、">"、">="、"！="等。

```sql
SELECT name FROM tb_students_info
WHERE dept_id IN
    (SELECT dept_id
    FROM tb_departments
    WHERE dept_type= 'A' );
```

我们可能已经关注到了这个查询条件中的查询语句，显然这里面的查询就又新产生了一个表。往往这样的就叫派生表，但是也不是所有这种被嵌套的表都是派生表，当SELECT语句的FROM子句中使用<span style="color:orange">独立子查询</span>时，我们将其称为派生表。派生表和子查询通常可互换使用。而如果不是独立子查询，就说明被嵌套的表和外面的表是一体的，也就不存在派生这个说法了。

```sql
SELECT 列名
FROM(
    SELECT 列名 --被包裹的就是派生表
    FROM 表名 --
)派生表别名
WHERE 派生表别名.属性 条件;
```

派生表必须含有别名，不然会报错：Every derived table must have its own alias.

```sql
SELECT 
    productName, sales
FROM
    (SELECT 
        productCode, 
        ROUND(SUM(quantityOrdered * priceEach)) sales
    FROM
        orderdetails
    INNER JOIN orders USING (orderNumber)
    WHERE
        YEAR(shippedDate) = 2013
    GROUP BY productCode
    ORDER BY sales DESC
    LIMIT 5) top5products2013
INNER JOIN
    products USING (productCode);
```

&emsp;

## 临时表

在MySQL中，临时表是一种特殊类型的表，它允许你存储一个临时结果集，可以在单个会话中多次重用。派生表类似于临时表，但是在SELECT语句中使用派生表比临时表简单得多，因为它不需要创建临时表的步骤。

当使用JOIN子句查询需要单个SELECT语句的数据是复杂的时候，临时表非常方便。 在这种情况下，我们就可以使用临时表来存储直接结果，并使用另一个查询来处理它。

MySQL临时表具有以下特殊功能：

+ 使用CREATE TEMPORARY TABLE语句创建临时表。请注意，在CREATE和TABLE关键字之间添加TEMPORARY关键字。
+ 当会话结束或连接终止时，MySQL会自动删除临时表。当您不再使用临时表时，也可以使用DROP TABLE语句来显式删除临时表。
+ 一个临时表只能由创建它的客户机访问。不同的客户端可以创建具有相同名称的临时表，而不会导致错误，因为只有创建临时表的客户端才能看到它。 但是，在同一个会话中，两个临时表不能共享相同的名称。
+ 临时表可以与数据库中的普通表具有相同的名称，不过原表就将无法使用。 例如，如果在一个数据库中创建一个名为employees的临时表，则现有的employees表将变得无法访问。 对employees表发出的每个查询现在都是指employees临时表。 当删除您临时表时，永久employees表可以再次访问。

<span style="color:red">警告：</span>即使临时表可以与永久表具有相同的名称，但不推荐。 因为这可能会导致混乱或意外的数据丢失。例如，如果与数据库服务器的连接丢失，并且你自动重新连接到服务器，则不能区分临时表和永久性表。 然后，你又发出一个DROP TABLE语句，这个时候删除的可能是永久表而不是临时表，这种结果是不可预料的。

### &emsp;创建

和普通的创建表并没什么区别，只需要将TEMPORARY关键字添加到CREATE TABLE语句的中间。

```sql
例如，以下语句创建一个临时表，按照收入存储前5名客户：
CREATE TEMPORARY TABLE top5customers
SELECT p.customerNumber,
       c.customerName,
       FORMAT(SUM(p.amount),2) total
FROM payments p
INNER JOIN customers c ON c.customerNumber = p.customerNumber
GROUP BY p.customerNumber
ORDER BY total DESC
LIMIT 5;
```

然后从top5customers临时表中查询数据，例如：`SELECT * FROM top5customers;`

### &emsp;删除

可以使用DROP TABLE语句来删除临时表，但最好添加TEMPORARY关键字如下：`DROP TEMPORARY TABLE 临时表名;`

DROP TEMPORARY TABLE语句仅删除临时表，而不是永久表。 当将临时表命名为永久表的名称相同时，它可以避免删除永久表的错误。

如果尝试使用DROP TEMPORARY TABLE语句删除永久表，则会收到一条错误消息，指出您尝试删除的表是未知的。

如果开发使用连接池或持久连接的应用程序，则不能保证临时表在应用程序终止时自动删除。因为应用程序使用的数据库连接可能仍然打开并放置在其他客户端使用的连接池中。 因此，当不再使用它们时马上删除临时表，这是一个很好的做法。
