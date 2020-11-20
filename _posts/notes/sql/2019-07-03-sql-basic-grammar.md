---
layout: post
title:  "基础语法"
date:   2019-07-03 15:40:03 +0800
categories: notes sql base
tags: SQL 基础 语法 数据类型 DDL 创建 更改 删除 DML 查询 插入 更新
excerpt: "数据类型与DDL、DML"
---

首先需要<span style="color:orange">注意</span>的是sql语法对于大小写不敏感。

可以把 SQL 分为两个部分：数据操作语言 (DML) 和 数据定义语言 (DDL)。
SQL (结构化查询语言)是用于执行查询的语法。但是 SQL 语言也包含用于更新、插入和删除记录的语法。

查询和更新指令构成了 SQL 的 DML 部分：

+ SELECT - 从数据库表中获取数据
+ UPDATE - 更新数据库表中的数据
+ DELETE - 从数据库表中删除数据
+ INSERT INTO - 向数据库表中插入数据

SQL 的数据定义语言 (DDL) 部分使我们有能力创建或删除表格。我们也可以定义索引（键），规定表之间的链接，以及施加表间的约束。

SQL 中最重要的 DDL 语句:

+ CREATE DATABASE - 创建新数据库
+ ALTER DATABASE - 修改数据库
+ CREATE TABLE - 创建新表
+ ALTER TABLE - 变更（改变）数据库表
+ DROP TABLE - 删除表
+ CREATE INDEX - 创建索引（搜索键）
+ DROP INDEX - 删除索引

<span style="color:red">警告！</span>SQL中的值如果是字符串需要使用英文单引号括起来，而数值不需要且不能。

SQL有如下数据类型：

#### Microsoft Access 数据类型

数据类型|描述|存储
:-----:|:---|:--
Text|用于文本或文本与数字的组合。最多 255 个字符。|
Memo|用于更大数量的文本。最多存储 65,536 个字符。注释：无法对 memo 字段进行排序。不过它们是可搜索的。|
Byte|允许 0 到 255 的数字。|1 字节
Integer|允许介于 -32,768 到 32,767 之间的数字。|2 字节
Long|允许介于 -2,147,483,648 与 2,147,483,647 之间的全部数字|4 字节
Single|单精度浮点。处理大多数小数。|4 字节
Double|双精度浮点。处理大多数小数。|8 字节
Currency|用于货币。支持 15 位的元，外加 4 位小数。可以选择使用哪个国家的货币。|8 字节
AutoNumber|AutoNumber 字段自动为每条记录分配数字，通常从 1 开始。|4 字节
Date/Time|用于日期和时间|8 字节
Yes/No|逻辑字段，可以显示为 Yes/No、True/False 或 On/Off。在代码中，使用常量 True 和 False （等价于 1 和 0）注释：Yes/No 字段中不允许 Null 值|1 比特
Ole Object|可以存储图片、音频、视频或其他 BLOBs (Binary Large OBjects)|最多 1GB
Hyperlink|包含指向其他文件的链接，包括网页。| 
Lookup Wizard|允许你创建一个可从下列列表中进行选择的选项列表。|4 字节

#### MySQL 数据类型

在 MySQL 中，有三种主要的类型：文本、数字和日期/时间类型。

Text 类型：

数据类型|描述
:-----:|:---
CHAR(size)|保存固定长度的字符串（可包含字母、数字以及特殊字符）。在括号中指定字符串的长度。最多 255 个字符。
VARCHAR(size)|保存可变长度的字符串（可包含字母、数字以及特殊字符）。在括号中指定字符串的最大长度。最多 255 个字符。<span style="color:blue">注释：</span>：如果值的长度大于 255，则被转换为 TEXT 类型。
TINYTEXT|存放最大长度为 255 个字符的字符串。
TEXT|存放最大长度为 65,535 个字符的字符串。
BLOB|用于 BLOBs (Binary Large OBjects)。存放最多 65,535 字节的数据。
MEDIUMTEXT|存放最大长度为 16,777,215 个字符的字符串。
MEDIUMBLOB|用于 BLOBs (Binary Large OBjects)。存放最多 16,777,215 字节的数据。
LONGTEXT|存放最大长度为 4,294,967,295 个字符的字符串。
LONGBLOB|用于 BLOBs (Binary Large OBjects)。存放最多 4,294,967,295 字节的数据。
ENUM(x,y,z,etc.)|允许你输入可能值的列表。可以在 ENUM 列表中列出最大 65535 个值。如果列表中不存在插入的值，则插入空值。<span style="color:blue">注释：</span>：这些值是按照你输入的顺序存储的。可以按照此格式输入可能的值：ENUM('X','Y','Z')
SET|与 ENUM 类似，SET 最多只能包含 64 个列表项，不过 SET 可存储一个以上的值。

Number 类型：

数据类型|描述
:-----:|:---
TINYINT(size)|-128 到 127 常规。0 到 255 无符号*。在括号中规定最大位数。
SMALLINT(size)|-32768 到 32767 常规。0 到 65535 无符号*。在括号中规定最大位数。
MEDIUMINT(size)|-8388608 到 8388607 普通。0 to 16777215 无符号*。在括号中规定最大位数。
INT(size)|-2147483648 到 2147483647 常规。0 到 4294967295 无符号*。在括号中规定最大位数。
BIGINT(size)|-9223372036854775808 到 9223372036854775807 常规。0 到 18446744073709551615 无符号*。在括号中规定最大位数。
FLOAT(size,d)|带有浮动小数点的小数字。在括号中规定最大位数。在 d 参数中规定小数点右侧的最大位数。
DOUBLE(size,d)|带有浮动小数点的大数字。在括号中规定最大位数。在 d 参数中规定小数点右侧的最大位数。
DECIMAL(size,d)|作为字符串存储的 DOUBLE 类型，允许固定的小数点。

<span style="color:blue">注释：</span>这些整数类型拥有额外的选项 UNSIGNED。通常，整数可以是负数或正数。如果添加 UNSIGNED 属性，那么范围将从 0 开始，而不是某个负数。

Date 类型：

数据类型|描述
:-----:|:---
DATE()|日期。<span style="color:aqua">格式：</span>YYYY-MM-DD<span style="color:blue">注释：</span>支持的范围是从 '1000-01-01' 到 '9999-12-31'
DATETIME()|*日期和时间的组合。<span style="color:aqua"><span style="color:aqua">格式：</span></span>YYYY-MM-DD HH:MM:SS<span style="color:blue">注释：</span>支持的范围是从 '1000-01-01 00:00:00' 到 '9999-12-31 23:59:59'
TIMESTAMP()|*时间戳。TIMESTAMP 值使用 Unix 纪元('1970-01-01 00:00:00' UTC) 至今的描述来存储。<span style="color:aqua">格式：</span>YYYY-MM-DD HH:MM:SS。<span style="color:blue">注释：</span>支持的范围是从 '1970-01-01 00:00:01' UTC 到 '2038-01-09 03:14:07' UTC
TIME()|时间。<span style="color:aqua">格式：</span>HH:MM:SS <span style="color:blue">注释：</span>支持的范围是从 '-838:59:59' 到 '838:59:59'
YEAR()|2 位或 4 位格式的年。<span style="color:blue">注释：</span>4 位格式所允许的值：1901 到 2155。2 位格式所允许的值：70 到 69，表示从 1970 到 2069。

<span style="color:blue">注释：</span>即便 DATETIME 和 TIMESTAMP 返回相同的格式，它们的工作方式很不同。在 INSERT 或 UPDATE 查询中，TIMESTAMP 自动把自身设置为当前的日期和时间。TIMESTAMP 也接受不同的格式，比如 YYYYMMDDHHMMSS、YYMMDDHHMMSS、YYYYMMDD 或 YYMMDD。

#### SQL Server数据类型

Character 字符串：

数据类型|描述|存储
:-----:|:---|:--
char(n)|固定长度的字符串。最多 8,000 个字符。|n
varchar(n)|可变长度的字符串。最多 8,000 个字符。|n
varchar(max)|可变长度的字符串。最多 1,073,741,824 个字符。|
text|可变长度的字符串。最多 2GB 字符数据。|

Unicode 字符串：

数据类型|描述|存储
:-----:|:---|:--
nchar(n)|固定长度的 Unicode 数据。最多 4,000 个字符。|n
nvarchar(n)|可变长度的 Unicode 数据。最多 4,000 个字符。|n
nvarchar(max)|可变长度的 Unicode 数据。最多 536,870,912 个字符。|
ntext|可变长度的 Unicode 数据。最多 2GB 字符数据。|

Binary 类型：

数据类型|描述|存储
:-----:|:---|:--
bit|允许 0、1 或 NULL|1
binary(n)|固定长度的二进制数据。最多 8,000 字节。|
varbinary(n)|可变长度的二进制数据。最多 8,000 字节。|
varbinary(max)|可变长度的二进制数据。最多 2GB 字节。|
image|可变长度的二进制数据。最多 2GB。|

Number 类型：

数据类型|描述|存储
:-----:|:---|:--
tinyint|允许从 0 到 255 的所有数字。|1 字节
smallint|允许从 -32,768 到 32,767 的所有数字。|2 字节
int|允许从 -2,147,483,648 到 2,147,483,647 的所有数字。|4 字节
bigint|允许介于 -9,223,372,036,854,775,808 和 9,223,372,036,854,775,807 之间的所有数字。|8 字节
decimal(p,s)|固定精度和比例的数字。允许从 -10^38 +1 到 10^38 -1 之间的数字。p 参数指示可以存储的最大位数（小数点左侧和右侧）。p 必须是 1 到 38 之间的值。默认是 18。s 参数指示小数点右侧存储的最大位数。s 必须是 0 到 p 之间的值。默认是 0。|5-17 字节
numeric(p,s)|固定精度和比例的数字。允许从 -10^38 +1 到 10^38 -1 之间的数字。p 参数指示可以存储的最大位数（小数点左侧和右侧）。p 必须是 1 到 38 之间的值。默认是 18。s 参数指示小数点右侧存储的最大位数。s 必须是 0 到 p 之间的值。默认是 0。|5-17 字节
smallmoney|介于 -214,748.3648 和 214,748.3647 之间的货币数据。|4 字节
money|介于 -922,337,203,685,477.5808 和 922,337,203,685,477.5807 之间的货币数据。|8 字节
float(n)|从 -1.79E + 308 到 1.79E + 308 的浮动精度数字数据。 参数 n 指示该字段保存 4 字节还是 8 字节。float(24) 保存 4 字节，而 float(53) 保存 8 字节。n 的默认值是 53。|4 或 8 字节
real|从 -3.40E + 38 到 3.40E + 38 的浮动精度数字数据。|4 字节

Date 类型：

数据类型|描述|存储
:-----:|:---|:--
datetime|从 1753 年 1 月 1 日 到 9999 年 12 月 31 日，精度为 3.33 毫秒。|8 bytes
datetime2|从 1753 年 1 月 1 日 到 9999 年 12 月 31 日，精度为 100 纳秒。|6-8 bytes
smalldatetime|从 1900 年 1 月 1 日 到 2079 年 6 月 6 日，精度为 1 分钟。|4 bytes
date|仅存储日期。从 0001 年 1 月 1 日 到 9999 年 12 月 31 日。|3 bytes
time|仅存储时间。精度为 100 纳秒。|3-5 bytes
datetimeoffset|与 datetime2 相同，外加时区偏移。|8-10 bytes
timestamp|存储唯一的数字，每当创建或修改某行时，该数字会更新。timestamp 基于内部时钟，不对应真实时间。每个表只能有一个 timestamp 变量。|

其他数据类型：

数据类型|描述
:-----:|:---
sql_variant|存储最多 8,000 字节不同数据类型的数据，除了 text、ntext 以及 timestamp。
uniqueidentifier|存储全局标识符 (GUID)。
xml|存储 XML 格式化数据。最多 2GB。
cursor|存储对用于数据库操作的指针的引用。
table|存储结果集，供稍后处理。

## DDL基础操作

### &emsp;1. 创建

#### &emsp;&emsp;1.1CREATER DATABASE

用于创建数据库。

<span style="color:aqua">格式：</span>`CREATER DATABASE 数据库名`

#### &emsp;&emsp;1.2CREATE TABLE

用于创建数据库中的表。

<span style="color:aqua">格式：</span>

```sql
CREATE TABLE 表名称
(
列名称1 数据类型,
列名称2 数据类型,
列名称3 数据类型,
...
)
```

#### &emsp;&emsp;1.3CREATE INDEX

用于在表中创建索引。在不读取整个表的情况下，索引使数据库应用程序可以更快地查找数据。<span style="color:orange">注意：</span>用户无法看到索引，它们只能被用来加速搜索/查询。

<span style="color:yellow">提示：</span>更新一个包含索引的表需要比更新一个没有索引的表花费更多的时间，这是由于索引本身也需要更新。因此，理想的做法是仅仅在常常被搜索的列（以及表）上面创建索引。

<span style="color:aqua">格式：</span>`CREATE INDEX 索引名 ON 表名 (列名1 ASC/DESC,列名2 ASC/DESC...)`

一般我们的索引值不允许有重复的数值，所以应该加上UNIQUE关键字：`CREATE UNIQUE INDEX 索引名 ON 表名 (列名)`。对于UNIQUE关键字稍后再具体讲解。

### &emsp;2. 更改

ALTER TABLE 语句用于在已有的表中添加、修改或删除列。关于ADD、DROP关键字后面会仔细谈到。

#### &emsp;&emsp;2.1添加列

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD 列名 数据类型`

#### &emsp;&emsp;2.2删除列

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 DROP 列名 数据类型`

#### &emsp;&emsp;2.3修改数值类型

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ALTER COLUMN 列名 数据类型`

#### &emsp;&emsp;2.4修改数据库

<span style="color:aqua">格式：</span>`ALTER DATABASE 数据库名`

这个语句比较复杂，且对于初学并不会用到。

### &emsp;3. 删除

#### &emsp;&emsp;3.1DROP INDEX

用于删除表中的索引。

<span style="color:aqua">格式：</span>

+ MS Access：`DROP INDEX 索引名 ON 表名`
+ MS SQL Server：`DROP INDEX 表名.索引名`
+ DB2/Oracle：`DROP INDEX 索引名`
+ MySQL：`ALTER TABLE 表名 DROP INDEX 索引名`

#### &emsp;&emsp;3.2DROP TABLE

用于删除表。

<span style="color:aqua">格式：</span>`DROP TABLE 表名`

#### &emsp;&emsp;3.3DROP DATABASE

删除数据库。

<span style="color:aqua">格式：</span>`DROP DATABASE 数据库名`

#### &emsp;&emsp;3.4TRUNCATE TABLE

删除表内的数据，但并不删除表本身。

<span style="color:aqua">格式：</span>`TRUNCATE TABLE 表名`

&emsp;

## DML基础操作

### &emsp;1. 查询

#### &emsp;&emsp;1.1SELECT和FROM

SELECT 语句用于从表中选取数据。结果被存储在一个结果表中（称为结果集）。

<span style="color:aqua">格式：</span>`SELECT 列名1,列名2... FROM 表名称` / `SELECT * FROM 表名称`（*代表全部）

#### &emsp;&emsp;1.2DISTINCT

在表中，可能会包含重复值。关键词 DISTINCT 用于返回唯一不同的值。

<span style="color:aqua">格式：</span>`SELECT DISTINCT 列名1,列名2... FROM 表名称`

#### &emsp;&emsp;1.3WHERE

如需有条件地从表中选取数据，可将 WHERE 子句添加到 SELECT 语句。

<span style="color:aqua">格式：</span>`SELECT 列名1,列名2... FROM 表名称 WHERE 列 运算符 值`

运算符包括算术运算符、比较运算符等之前提到的所有运算符。

#### &emsp;&emsp;1.4AND和OR

AND 和 OR 可在 WHERE 子语句中把两个或多个条件结合起来。

如果第一个条件和第二个条件都成立，则 AND 运算符显示一条记录。

如果第一个条件和第二个条件中只要有一个成立，则 OR 运算符显示一条记录。

<span style="color:aqua">格式：</span>`SELECT 列名1,列名2... FROM 表名称 WHERE 式子1 AND 式子2...` / `SELECT 列名1,列名2... FROM 表名称 WHERE 式子1 OR 式子2...`

#### &emsp;&emsp;1.5ORDER BY

ORDER BY 语句用于根据指定的列（即对应的属性名）对结果集进行排序。默认按照升序对记录进行排序。如果您希望按照降序对记录进行排序，可以使用 DESC 关键字。（如果是顺序就是ASC关键字）

<span style="color:aqua">格式：</span>`SELECT 列名1,列名2... FROM 表名称 ORDER BY 表中属性名1 ASC/DESC,表中属性名2 ASC/DESC...`

### &emsp;2. 插入

INSERT INTO 语句用于向表格中插入新的行或列。

<span style="color:aqua">格式：</span>`INSERT INTO 表名称 VALUES (值1, 值2,....)` \ `INSERT INTO 表名称 (列1, 列2,...) VALUES (值1, 值2...)`

### &emsp;3. 更新

<span style="color:aqua">格式：</span>`UPDATE 表名称 SET 列名称 = 新值 WHERE 列名称 = 某值`

### &emsp;4. 删除

<span style="color:aqua">格式：</span>`DELETE FROM 表名称 WHERE 列名称 = 值`

如果删除全部表<span style="color:aqua">格式：</span>`DELETE FROM 表名称` / `DELETE * FROM 表名称`

<span style="color:red">警告：</span>基础DML语句的删除更新等操作时一定要注意CASCADE或者RESTRICT，CASCADE为连锁删除，无论是否被引用，如作为一个表的主外键，都会被删除，RESTRICT为约束删除，即没有对本列的任何引用时才能删除。使用<span style="color:aqua">格式：</span>`DELETE/UPDATE CASCADE/RESTRICT`。
