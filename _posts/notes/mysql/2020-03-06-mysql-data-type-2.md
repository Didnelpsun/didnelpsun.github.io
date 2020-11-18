---
layout: post
title:  "数据类型（2）"
date:   2020-03-06 13:40:10 +0800
categories: notes mysql base
tags: MySQL 基础 mysql CHAR VARCHAR TINYTEXT TEXT MEDIUMTEXT LONGTEXT ENUM SET
excerpt: "字符串"
---

## 字符串类型

在MySQL中，字符串可以容纳从纯文本到二进制数据(如图像或文件)的任何内容。

字符串类型|描述
:--------:|:--
char|固定长度的非二进制(字符)字符串
varchar|可变长度的非二进制字符串
BINARY|一个固定长度的二进制字符串
VARBINARY|一个可变长度的二进制字符串
TINYBLOB|一个非常小的BLOB(二进制大对象)
BLOB|一个小的BLOB(二进制大对象)
MEDIUMBLOB|一个中等大小的BLOB(二进制大对象)
LONGBLOB|一个大的BLOB(二进制大对象)
TINYTEXT|一个非常小的非二进制字符串
TEXT|一个小的非二进制字符串
MEDIUMTEXT|一个中等大小的非二进制字符串
LONGTEXT|一个很大的非二进制字符串
ENUM|枚举; 每个列值可以被分配一个枚举成员
SET|集合; 每个列值可以分配零个或多个SET成员

### &emsp;1. CHAR

CHAR数据类型是MySQL中固定长度的字符类型。 我们经常声明CHAR类型，其长度指定要存储的最大字符数。 例如，CHAR(20)最多可以容纳20个字符。

如果要存储的数据是固定大小，则应使用CHAR数据类型。在这种情况下，与VARCHAR相比，您将获得更好的性能。

CHAR数据类型的长度可以是从0到255的任何值。当存储CHAR值时，MySQL将其值与空格填充到声明的长度。

当查询CHAR值时，MySQL会删除尾部的空格。

请注意，如果启用PAD_CHAR_TO_FULL_LENGTH SQL模式，MySQL将不会删除尾随空格。

```sql
--新建一个表--
CREATE TABLE test (
    status CHAR(3)
);
--插入数据，前后都有一个空格--
INSERT INTO test(status)
VALUES(' J ');
--然后查询它--
SELECT
    status, LENGTH(status)
FROM
    test;
```

```terminal
>>>>>
+--------+----------------+
| status | LENGTH(status) |
+--------+----------------+
|  J     |              2 |
+--------+----------------+
1 rows in set
```

如上显示它会将最后的空格删掉。

#### &emsp;&emsp;1.1LENGTH()、CHAR_LENGTH()

`LENGTH()`获取以字节为单位的字符串长度；`CHAR_LENGTH()`获取以字符为单位的字符串长度。如果是一般字符串，那么它们的返回结果应该是一致的，而如果一个字符串有特殊字符，结果是不同的。

#### &emsp;&emsp;1.2比较与匹配

存储或比较CHAR值时，MySQL使用分配给列的字符集排序规则。

使用比较运算符比较CHAR值时，MySQL不会考虑尾随空格，例如：=，<>，>，<等等。

<span style="color:orange">注意：</span>当使用CHAR值进行模式匹配时，LIKE运算符会考虑尾随空格。

在之前的案例中值J的前面和后面都加空格存储。 但是，当执行以下查询时：

```sql
SELECT *
FROM test
WHERE
    status = ' J ';
Empty set
```

MySQL没有返回任何行记录，因为它不考虑尾随空格，且关注前面的空格。 要与"J"匹配，需要删除尾随空格：

```sql
SELECT *
FROM test
WHERE
    status = ' J';
```

```terminal
>>>>>
+--------+
| status |
+--------+
|  Y     |
+--------+
1 row in set
```

#### &emsp;&emsp;1.3UNIQUE索引

如果CHAR列具有UNIQUE索引，并且插入的值有多个尾随空格不同的值，则MySQL将拒绝因重复键错误而要求您进行的更改。

```sql
--创建唯一值索引--
CREATE UNIQUE INDEX uidx_status ON test(status);
--插入值--
INSERT INTO test(status)
VALUES('N ');
--报错--
Error Code: 1062. Duplicate entry 'N' for key 'uidx_status'
```

#### &emsp;&emsp;1.4CONCAT()与CONCAT_WS()

虽然将这两个函数放在CHAR类型中，但是实际上它们是针对所有的字符串。

与其他数据库管理系统相比，MySQL字符串连接更为清晰。 例如，如果您使用PostgreSQL或Oracle，则必须使用字符串连接运算符||。 在Microsoft SQL Server中，您可以使用加法算术运算符(+)连接字符串值。

CONCAT()函数需要一个或多个字符串参数，并将它们连接成一个字符串。CONCAT()函数需要至少一个参数，否则会引起错误。

<span style="color:aqua">格式：</span>`CONCAT(字符串1,字符串2...);`

CONCAT()函数在连接之前将所有参数转换为字符串类型。如果任何参数为NULL，则CONCAT()函数返回NULL值。

连接两个引用的字符串：MySQL和CONCAT：`SELECT CONCAT('MySQL','CONCAT');`

还有一种特殊形式的CONCAT()函数：CONCAT_WS()函数。
CONCAT_WS()函数将两个或多个字符串值与预定义的分隔符相连接。<span style="color:aqua">格式：</span>CONCAT_WS(分隔符,字符串1,字符串2... );

CONCAT_WS函数在字符串参数之间添加分隔符，并返回单个字符串，并在字符串参数之间插入分隔符。

以下语句连接两个字符串值：Max和Su，并用逗号分隔这两个字符串：`SELECT CONCAT_WS(';','Max','Su');`将返回`Max;Su`。

#### &emsp;&emsp;1.5LEFT()

针对字符串，也是不止针对CHAR类型。返回具有指定长度的字符串的左边部分。

<span style="color:aqua">格式：</span>`LEFT(字符串,截取的长度，为正整数)`

如果长度参数为NULL则返回NULL，如果是0或者负数则返回空字符串，如果大于等于字符串的本身长度就返回整个字符串。

#### &emsp;&emsp;1.6SUBSTRING() / SUBSTR()

SUBSTRING函数从特定位置开始的字符串返回一个给定长度的子字符串。 MySQL提供了各种形式的子串功能。

<span style="color:aqua">格式：</span>`SUBSTRING(提取子字符串的字符串,截取位置);` / `SUBSTRING(提取子字符串的字符串 FROM 截取位置);`

截取位置参数是一个整数，用于指定子串的起始字符，可以是正或负整数。如果为正，则SUBSTRING函数从字符串的开始处提取子字符串。如果为0就返回空字符串。

<span style="color:aqua">格式：</span>`SUBSTRING(提取子字符串的字符串,截取位置,截取长度);` / `SUBSTRING(提取子字符串的字符串 FROM 截取位置 FOR 截取长度);`

如果位置参数和截取长度参数的总和大于字符串本身的长度，则会返回从开始位置到结尾的子串。

#### &emsp;&emsp;1.7REVERSE()

反转字符串，<span style="color:aqua">格式：</span>`REVERSE(字符串)`

#### &emsp;&emsp;1.8TRIM()、LTRIM()、RTRIM()

用来删除不必要的字符，并返回字符串。

<span style="color:aqua">格式：</span>`TRIM( BOTH / LEADING / TRAILING 移除的字符串 FROM 目标字符串)`

使用LEADING，TRAILING或BOTH选项明确指示TRIM()函数从字符串中删除前导，尾随或前导和尾随的不必要的字符。

如果您没有指定任何内容，TRIM()函数默认使用BOTH选项。

移除的字符串是要删除的字符串。默认情况下，它是一个空格。这意味着如果不指定特定的字符串，则TRIM()函数仅删除空格。

如：`SELECT TRIM(' Didnelpsun );`会返回Didnelpsun。

如果是仅删除前导或者尾随的空格，而不是其他字符，就可以使用`LTRIM()`和`RTRIM()`来删除。

### &emsp;2. VARCHAR

VARCHAR是可变长度的字符串，其长度可以达到65,535个字符。 MySQL将VARCHAR值作为1字节或2字节长度前缀加上实际数据。

长度前缀指定值的字节数。 如果列需要少于255个字节，则长度前缀为1个字节。 如果列需要超过255个字节，长度前缀是两个长度字节。

但是，最大长度受到最大行大小(65,535字节)和所使用的字符集的限制。 这意味着所有列的总长度应该小于65,535字节。

```sql
--创建表--
CREATE TABLE IF NOT EXISTS test (
    s1 VARCHAR(32765) NOT NULL,
    s2 VARCHAR(32766) NOT NULL
)  CHARACTER SET 'latin1' COLLATE LATIN1_DANISH_CI;
--尝试长度加1--
CREATE TABLE IF NOT EXISTS test_2 (
    s1 VARCHAR(32766) NOT NULL, -- error
    s2 VARCHAR(32766) NOT NULL
)  CHARACTER SET 'latin1' COLLATE LATIN1_DANISH_CI;
```

MySQL将发出错误消息：Error Code: 1118. Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs 0.000 sec

如上所示，行长度太大，所以创建语句失败。

如果插入长度大于VARCHAR列长度的字符串，MySQL将发出错误：

```sql
CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(3)
);

INSERT INTO items(title)
VALUES('ABCD');
```

在这个例子中，MySQL发出以下错误消息：1406 - Data too long for column 'title' at row 1

和CHAR的定长相比，VARCHAR不定长，所以不会将尾部的空格删除。

但是，当插入包含导致列长度超过的尾随空格的VARCHAR值时，MySQL将截断尾随空格。 此外，MySQL发出警告，如 1 warning(s): 1265 Data truncated for column 'title' at row 1。

### &emsp;3. TINYTEXT、TEXT、MEDIUMTEXT、LONGTEXT

TEXT可用于存储可以从1字节到4GB长度的文本字符串。 我们经常在电子商务网站中找到用于在新闻站点存储物品的TEXT数据类型，如：产品详细描述。
与CHAR和VARCHAR不同，您不必在列使用TEXT类型时指定存储长度。 此外，当检索或插入文本数据(如CHAR和VARCHAR)时，MySQL不会删除或填充空格。

<span style="color:orange">注意：</span>TEXT数据不存储在数据库服务器的内存中，因此，每当查询TEXT数据时，MySQL都必须从磁盘读取它，这与CHAR和VARCHAR相比要慢得多。

MySQL提供四种TEXT类型：TINYTEXT，TEXT，MEDIUMTEXT和LONGTEXT。

类型|字符数|容量
:--:|:---:|:--:
TINYTEXT|2^8|1B
TEXT|2^16-1|64KB
MEDIUMTEXT|2^32-1|16MB
LONGTEXT|2^64-1|4GB

### &emsp;4. ENUM

ENUM是一个字符串对象，其值是从列创建时定义的允许值列表中选择的。

ENUM数据类型是紧凑型数据存储，MySQL ENUM使用数字索引(1，2，3，…)来表示字符串值。可读查询和输出。

#### &emsp;&emsp;4.1创建

<span style="color:aqua">格式：</span>

```sql
CREATE TABLE 表名 (
    ...
    列名 ENUM ('值1','值2'...),
    ...
);
```

在这种语法中，可以有三个以上的枚举值。但是，将枚举值的数量保持在20以下是一个很好的做法。

```sql
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    priority ENUM('Low', 'Medium', 'High') NOT NULL
);
```

也就是说priority列只接受三个Low, Medium, High值。 在后台，MySQL将每个枚举成员映射到数字索引。在这种情况下，Low，Medium和High分别映射到1,2和3（注意：与数组不同，这不是从0开始的而是从1）。

#### &emsp;&emsp;4.2插入

要将数据插入到ENUM列中，可以使用预定义列表中的枚举值。

```sql
NSERT INTO tickets(title, priority)
VALUES('Scan virus for computer A', 'High');
```

除了枚举值之外，还可以使用枚举成员的数字索引将数据插入ENUM列。如我们使用的值为3，而不是使用High枚举值，因为High被映射到3，所以就是等效的：

```sql
INSERT INTO tickets(title, priority)
VALUES('Scan virus for computer A', 3);
```

因为我们将优先级属性priority定义为NOT NULL列，当插入新行而不指定这个属性的值时，MySQL将使用第一个枚举成员作为默认值。而如果没有设置非空约束，MySQL将设置其为空值。

在非严格的SQL模式下，如果在ENUM列中插入无效值，MySQL将使用空字符串''，插入数字索引为0。 如果启用了严格的SQL模式，尝试插入无效的ENUM值将导致错误。

#### &emsp;&emsp;4.3查询

```sql
SELECT *
FROM
    tickets
WHERE
--因为映射关系，所以下面是等效的。
    priority = 'LOW';
    --priority = 1;
```

使用索引还有一个用字符枚举更有优势的好处，就是可以使用比较运算符，例如`priority >= 1;`

<span style="color:orange">注意：</span>因为是根据索引号排序ENUM值。 因此，成员的顺序取决于它们在枚举列表中的定义。所以一定要注意定义时的顺序。一般NULL < '' = 0 < 1 < 2...。

#### &emsp;&emsp;4.4枚举的优缺点

优点：

+ 可以限制值的范围。
+ 速度比普通字符串快，因为枚举型靠映射的整型来管理。
+ 一共有2 个字节，0-65535，因此可以有 65535个选项可以使用。

缺点：

+ 更改枚举成员需要使用ALTER TABLE语句重建整个表，这在资源和时间方面是昂贵的。
+ 获取完整的枚举列表很复杂，因为需要访问information_schema数据库：

```sql
SELECT
    column_type
FROM
    information_schema.COLUMNS
WHERE
    TABLE_NAME = 'tickets'
    AND COLUMN_NAME = 'priority';
```

+ 迁移到其他RDBMS可能是一个问题，因为ENUM不是SQL标准的，并且数据库系统不支持它。
+ 向枚举列表添加更多属性是不可能的。假设您要为每个优先级添加服务协议，例如High(24h)，Medium(1-2天)，Low(1周)，则不可以使用ENUM类型的。 在这种情况下，需要有一个单独的表来存储优先级列表，例如priority(id，name，sort_order，description)，并且通过引用了priority表的id字段的priority_id来替换tickets表中的priority字段。
+ 与查找表(priorities)相比，枚举列表不可重用。 例如，如果要创建一个名为tasks并且要重用优先级列表的新表，则是不可能的。

### &emsp;5. SET

SET是一个字符串对象，可以有零或多个值，其值来自表创建时规定的允许的一列值。指定包括多个SET成员的SET列值时各成员之间用逗号(',')间隔开。这样SET成员值本身不能包含逗号。set的容纳范围为64个不同的成员。set其实和枚举差不多，set指定了一个集合范围，在我们插入数据的时候，需要插入在set范围之内的元素，如果插入了未被包含的元素，那么就会发出警告。

#### &emsp;&emsp;5.1创建

当创建表时，SET成员值的尾部空格将自动被删除；当检索时，保存在SET列的值使用列定义中所使用的大小写来显示。请注意可以为SET列分配字符集和校对规则。对于二进制或大小写敏感的校对规则，当为列分配值时应考虑大小写。

使用方式和枚举类似，如：`CREATE TABLE myset (col SET('a', 'b', 'c', 'd'));`

#### &emsp;&emsp;5.2插入与查询

对于包含多个SET元素的值，当插入值时元素所列的顺序并不重要。在值中一个给定的元素列了多少次也不重要。当以后检索该值时，值中的每个元素出现一次，根据表创建时指定的顺序列出元素；SET值按数字顺序排序。NULL值排在非NULL SET值的前面。

```sql
INSERT INTO myset (col)
VALUES
    ('a,d'), ('d,a'), ('a,d,a'), ('a,d,d'), ('d,a,d');
--然后选择--
SELECT col FROM myset;
```

```terminal
+------+
| col  |
+------+
| a,d  |
| a,d  |
| a,d  |
| a,d  |
| a,d  |
+------+

5 rows in set (0.04 sec)
```

#### &emsp;&emsp;5.3查询集合值

可以使用FIND_IN_SET()函数或LIKE操作符搜索SET值：`SELECT * FROM 表名 WHERE FIND_IN_SET('SET值',SET组名)>0;` / `SELECT * FROM 表名 WHERE SET组名 LIKE '%SET值%';`

第1个语句找出SET组名所指集合包含SET值成员的行。第2个类似，但有所不同：它在其它地方找出SET组名所指集合包含SET值的行，甚至是在另一个SET成员的子字符串中。

`SELECT * FROM 表名 WHERE SET属性名 & 1;` / `SELECT * FROM 表名 WHERE SET属性名 = 'val1,val2';`

第1个语句寻找包含第1个set成员的值，&是采用位运算。第2个语句寻找一个确切匹配的值。应注意第2类的比较。将set值与'val1,val2'比较返回的结果与同'val2,val1'比较返回的结果不同。指定值时的顺序应与在列定义中所列的顺序相同。

如果想要为SET列确定所有可能的值，使用SHOW COLUMNS FROMtbl_name LIKEset_col并解析输出中第2列的SET定义。

#### &emsp;&emsp;5.4集合的排序

常规使用order by进行排序时，会按照字母的文本顺序。但枚举类型由于存储为索引值，因此会按照索引值进行排序：NULL < 0 < 1 < 2。

如果希望按照文本类型进行排序，可以使用：`ORDER BY cast(列名 as char)` / `ORDER BY concat(列名)`

#### &emsp;&emsp;5.5与ENUM的区别

虽然SET和ENUM都是规定值取值范围，但是它们有很大的区别。SET和ENUM的区别：

+ 虽然也是通过整数进行管理的，采用位运算即二进制，从第一位开始为1,逐一x2。
+ 每个集合类型8个字节，64位，因此只可以表示64个元素。
+ 使用的方式不同，ENUM类似单选，而SET类似多选，而且会自动去重。
