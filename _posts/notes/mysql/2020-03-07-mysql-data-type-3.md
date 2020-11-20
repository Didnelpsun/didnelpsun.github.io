---
layout: post
title:  "数据类型（3）"
date:   2020-03-07 15:00:00 +0800
categories: MySQL 基础 mysql 
tags: MySQL 基础 mysql 基础 DATE TIME DATETIME TIMESTAMP UNIX_TIMESTAMP
excerpt: "日期与时间"
---

## DATE

DATE是用于管理日期值的五种时间数据类型之一。 MySQL使用yyyy-mm-dd格式存储日期值。此格式是固定的，不可能更改它。

例如，您可能更喜欢使用mm-dd-yyyy格式，但是遗憾，不能直接使用。 一个代替的办法：遵循标准日期格式，并使用DATE_FORMAT函数按所需格式来格式化日期。

MySQL使用3个字节来存储DATE值。DATE值的范围为1000-01-01到9999-12-31。 如果要存储超出此范围的日期值，则需要使用非时间数据类型，例如整数，例如使用三列，分别存储年，月和日的数据。还需要创建存储函数来模拟MySQL提供的内置日期函数，这是不推荐的。

当严格模式被禁用时，MySQL将任何无效日期(例如2015-02-30)转换为零日期值0000-00-00。

### &emsp;1. MySQL日期值为两位数年份

MySQL使用四位数字存储日期值的年份。 如果您使用两位数的年份值，MySQL仍会接受以下规则：年份值在00-69范围内转换为2000-2069。70-99的年值被转换为1970 - 1999年。

但是，具有两位数字的日期值是不明确的，因此应避免使用它。

```sql
--创建一个名为people表，其生日(birth_date)列使用DATE数据类型。--
CREATE TABLE people (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL
);
--插入数据--
INSERT INTO people(first_name,last_name,birth_date)
VALUES('Max','Su','1992-10-11');
--查询数据--
SELECT
    first_name,
    last_name,
    birth_date
FROM
    people;
```

```terminal
>>>>>
+------------+-----------+------------+
| first_name | last_name | birth_date |
+------------+-----------+------------+
| Max        | Su        | 1992-10-11 |
+------------+-----------+------------+
1 row in set
```

```sql
--插入两位年份--
INSERT INTO people(first_name,last_name,birth_date)
VALUES('Jack','Daniel','01-09-01'),
      ('Lily','Bush','80-09-01');
--再查询--
```

```terminal
>>>>>
+------------+-----------+------------+
| first_name | last_name | birth_date |
+------------+-----------+------------+
| Max        | Su        | 1992-10-11 |
| Jack       | Daniel    | 2001-09-01 |
| Lily       | Bush      | 1980-09-01 |
+------------+-----------+------------+
3 rows in set
```

### &emsp;2. NOW()/SYSDATE()

获取当前日期和时间。

<span style="color:aqua">格式：</span>`SELECT NOW()` / `SELECT SYSDATE()`

如：`SELECT NOW() as cur_datetime;`

与now的不同点：(一般使用NOW而不用SYSDATE)

1. SYSDATE()返回的是函数执行时的时间
2. now()返回的是语句执行时的时间

### &emsp;3. DATE()

获取日期部分。如`SELECT DATE(NOW());`

### &emsp;4. CURDATE()

获取系统日期。

<span style="color:aqua">格式：</span>`SELECT CURDATE()`

### &emsp;5. DATEDIFF()

计算两个DATE，DATETIME或TIMESTAMP值之间的天数。

<span style="color:aqua">格式：</span>`DATEDIFF(时间1,时间2)

DATEDIFF函数接受两个任何有效日期或日期时间值的参数。如果您传递DATETIME或TIMESTAMP值，则DATEDIFF函数仅将日期部分用于计算，并忽略时间部分。

### &emsp;6. UTC_DATE()

返回当前UTC日期作为'YYYY-MM-DD"或YYYYMMDD格式的值， 根据该函数是否用在字符串或数字语境中。

### &emsp;7. DATE_FORMAT()

将日期值格式化为特定格式。

<span style="color:aqua">格式：</span>`DATE_FORMAT(日期,格式化模式字符串);`

限定符|含义
:----:|:--
%a|三个字符缩写的工作日名称，例如:Mon, Tue, Wed,等
%b|三个字符缩写的月份名称，例如：Jan，Feb，Mar等
%c|以数字表示的月份值，例如：1, 2, 3…12
%D|英文后缀如：0th, 1st, 2nd等的一个月之中的第几天
%d|如果是1个数字(小于10)，那么一个月之中的第几天表示为加前导加0， 如：00, 01,02, …31
%e|没有前导零的月份的日子，例如：1,2，… 31
%f|微秒，范围在000000..999999
%H|24小时格式的小时，前导加0，例如：00,01..23
%h|小时，12小时格式，带前导零，例如：01，02 … 12
%I|与%h相同
%i|分数为零，例如：00,01，… 59
%j|一年中的的第几天，前导为0，例如，001,002，… 366
%k|24小时格式的小时，无前导零，例如：0,1,2 … 23
%l|12小时格式的小时，无前导零，例如：0,1,2 … 12
%M|月份全名称，例如：January, February,…December
%m|具有前导零的月份名称，例如：00,01,02，… 12
%p|AM或PM，取决于其他时间说明符
%r|表示时间，12小时格式hh:mm:ss AM或PM
%S|表示秒，前导零，如：00,01，… 59
%s|与%S相同
%T|表示时间，24小时格式hh:mm:ss
%U|周的第一天是星期日，例如：00,01,02 … 53时，前导零的周数
%u|周的第一天是星期一，例如：00,01,02 … 53时，前导零的周数
%V|与%U相同，它与%X一起使用
%v|与%u相同，它与%x一起使用
%W|工作日的全称，例如：Sunday, Monday,…, Saturday
%w|工作日，以数字来表示(0 = 星期日，1 = 星期一等)
%X|周的四位数表示年份,第一天是星期日; 经常与%V一起使用
%x|周的四位数表示年份,第一天是星期日; 经常与%v一起使用
%Y|表示年份，四位数，例如2000，2001，…等。
%y|表示年份，两位数，例如00，01，…等。
%%|将百分比(%)字符添加到输出

一般使用的格式化模式字符串：

DATE_FORMAT字符串|格式化日期
:---------------:|:-------:
%Y-%m-%d|2017/4/30
%e/%c/%Y|4/7/2013
%c/%e/%Y|7/4/2013
%d/%m/%Y|4/7/2013
%m/%d/%Y|7/4/2013
%e/%c/%Y %H:%i|4/7/2013 11:20
%c/%e/%Y %H:%i|7/4/2013 11:20
%d/%m/%Y %H:%i|4/7/2013 11:20
%m/%d/%Y %H:%i|7/4/2013 11:20
%e/%c/%Y %T|4/7/2013 11:20
%c/%e/%Y %T|7/4/2013 11:20
%d/%m/%Y %T|4/7/2013 11:20
%m/%d/%Y %T|7/4/2013 11:20
%a %D %b %Y|Thu 4th Jul 2013
%a %D %b %Y %H:%i|Thu 4th Jul 2013 11:20
%a %D %b %Y %T|Thu 4th Jul 2013 11:20:05
%a %b %e %Y|Thu Jul 4 2013
%a %b %e %Y %H:%i|Thu Jul 4 2013 11:20
%a %b %e %Y %T|Thu Jul 4 2013 11:20:05
%W %D %M %Y|Thursday 4th July 2013
%W %D %M %Y %H:%i|Thursday 4th July 2013 11:20
%W %D %M %Y %T|Thursday 4th July 2013 11:20:05
%l:%i %p %b %e, %Y|7/4/2013 11:20
%M %e, %Y|4-Jul-13
%a, %d %b %Y %T|Thu, 04 Jul 2013 11:20:05

### &emsp;8. WEEK()

返回该DATE类型值为一年中的第几周。

<span style="color:aqua">格式：</span>`WEEK(DATE类型值)`

### &emsp;9. YEAR()

返回该DATE类型值中的年份。

<span style="color:aqua">格式：</span>`YEAR(DATE类型值)`

### &emsp;10. MONTHNAME()

返回该DATE类型值中的月份。

<span style="color:aqua">格式：</span>`MONTHNAME(DATE类型值)`

### &emsp;11. STR_DATE()

varchar格式的时间转成时间格式。

<span style="color:aqua">格式：</span>`STR_DATE(时间字符串，格式化字符串)`

格式化字符串一般为：'%Y-%m-%d %H:%i:%s'。

### &emsp;12. DAYNAME()

返回指定日期的工作日的名称。 以下说明了DAYNAME函数的<span style="color:aqua">格式：</span>`DAYNAME(要获取其工作日名称的日期);`

如果日期为NULL或无效，例如2019-02-30，DAYNAME函数将返回NULL。

如：`SELECT DAYNAME('2020-03-05') dayname;`返回Thursday。

默认情况下，MySQL返回由lc_time_names系统变量控制的语言中的工作日的名称，查询当前lc_time_names变量设置的值，如`SELECT @@lc_time_names;`默认返回的是en_US。如果想返回中文就设置`SET @@lc_time_names = 'zh_CN';`，这样它返回的就是星期四。

详细的[语言环境表]({% post_url notes/mysql/2020-03-13-mysql-lc-time-names %})

### &emsp;13. DAYTOFWEEK()

返回日期的索引值，即周日为1，周六为7。

<span style="color:aqua">格式：</span>`DAYOFWEEK(DATE或DATETIME值)`

如果日期为NULL，零或者无效，则返回NULL。

&emsp;

## TIME

使用HH:MM:SS格式来查询和显示代表一天中的时间值(在24小时内)。要表示两个事件之间的时间间隔，MySQL使用大于24小时的HHH:MM:SS格式。

<span style="color:aqua">格式：</span>`列名 TIME;`

TIME值范围为-838:59:59至838:59:59。 此外，TIME值可以具有高达微秒精度(6位数)的小数秒部分。 要使用小数秒精度部分定义数据类型为TIME的列，<span style="color:aqua">格式：</span>：`列名 TIME(N);`N是表示小数部分的整数值，最多6位数。如其中包含3位数的小数秒：`begin_at TIME(3);`

TIME值需要3个字节进行存储。如果TIME值包括分数秒精度，则会根据小数秒精度的位数获取额外的字节。

分数秒精度|存储(字节)
:--------:|:------:
0|0
1，2|1
3，4|2
5，6|3

TIME和TIME(0)需要3个字节。 TIME(1)和TIME(2)需要4个字节(3 + 1); TIME(3)和TIME(6)分别需要5和6个字节。

### &emsp;1. TIME的允许格式

除了"HH:MM:SS"格式之外，MySQL还可以识别各种时间格式。

MySQL允许使用"HHMMSS"格式，而不使用分隔符(:)表示时间值。 例如'08:30:00'和'10:15:00'可以重写为'083000'和'101500'。

```sql
INSERT INTO tests(name,start_at,end_at)
VALUES('Test 2','083000','101500');
```

除了字符串格式之外，MySQL接受HHMMSS作为代表时间值的数字。也可以使用SS，MMSS。 例如，可以使用082000，而不是使用'082000'：

```sql
INSERT INTO tests(name,start_at,end_at)
VALUES('Test 3',082000,102000);
```

对于时间间隔，您可以使用'D HH:MM:SS'格式，其中D代表天数从0到34的范围。更灵活的语法是'HH:MM'，'D HH:MM'，'D HH'或'SS'。
如果使用分隔符:，可以使用1位数字表示小时，分钟或秒。 例如，可以使用9:5:0而不是'09:05:00'。

```sql
INSERT INTO tests(name,start_at,end_at)
VALUES('Test 4','9:5:0',100500);
```

### &emsp;2. CURRENT_TIME()

用来获取数据库服务器的当前时间。根据使用该函数的上下文，CURRENT_TIME函数以字符串('HH:MM:SS')或数值(HHMMSS)返回当前时间值。

```sql
SELECT
    CURRENT_TIME() AS string_now,
    CURRENT_TIME() + 0 AS numeric_now;
```

```terminal
>>>>>
+------------+-------------+
| string_now | numeric_now |
+------------+-------------+
| 23:04:53   |      230453 |
+------------+-------------+
1 row in set
```

### &emsp;3. ADDTIME()、SUBTIME()、TIMEDIFF()

<span style="color:aqua">格式：</span>`ADDTIME(时间或时间日期表达式,时间表达式)`

对于两个表达式进行加法操作。第一参数为TIME或者DATETIME类型，而第二个参数只能为TIME类型。返回值为TIME类型。

<span style="color:aqua">格式：</span>`SUBTIME(时间1,时间2)`

对于两个表达式进行减法操作，参数要求与ADDTIME函数一样。

<span style="color:aqua">格式：</span>`TIMEDIFF(时间1,时间2)`

TIMEDIFF()的参数只接受TIME或DATETIME类型，它们的参数必须是一个类型。如果是不同类型的参数则会返回NULL。但是它只会返回TIME类型的返回值。且范围为-838:59:59到838:59:59。

如我们使用`SELECT TIMEDIFF('2009-03-01 00:00:00', '2009-01-01 00:00:00') diff;`，它的返回结果是838:59:59，但是实际上应该是1416，因为这个值超出范围了，所以会被截断，我们可以选择时间戳的`TIMESTAMPDIFF()`来解决。

### &emsp;4. UTC_TIME()

返回当前UTC时间在 'HH:MM:SS' 或 'HHMMSS' 格式的值，根据该函数是否用在字符串或数字语境中。

### &emsp;5. TIMEFORMAT()

使用方法和DATEFORMAT方法类似，但是仅用来格式化TIME类型数据。

### &emsp;6. HOUR()

返回时间的小时。 对于一天时间值，返回值的范围是0到23。 但是，TIME值的范围实际上要大得多，所以HOUR可以返回大于23的值。

<span style="color:aqua">格式：</span>`HOUR(TIME类型值)`

### &emsp;7. MINUTE()

返回时间分钟，范围为0到59。

<span style="color:aqua">格式：</span>`MINUTE(TIME类型值)`

### &emsp;8. SECOND()

返回时间秒数，范围为0到59。

<span style="color:aqua">格式：</span>`SECOND(TIME类型值)`

### &emsp;9. TIME_TO_SEC()

将TIME参数变为秒。也可以传入DATETIME参数，但是它只会讲时分秒转为秒，而不会对于年月日进行转换。

<span style="color:aqua">格式：</span>`TIME_TO_SEC(TIME类型值)`

如：`SELECT TIME_TO_SEC('22:23:00'); >>>>>80580`

&emsp;

## DATETIME

DATETIME存储包含日期和时间的值。 当从DATETIME列查询数据时，一般以YYYY-MM-DD HH:MM:SS为格式。

默认情况下，DATETIME的值范围为1000-01-01 00:00:00至9999-12-31 23:59:59。

DATETIME值使用5个字节进行存储。另外，DATETIME值可以包括格式为YYYY-MM-DD HH:MM:SS [.fraction]。例如：2017-12-20 10:01:00.999999的尾数有小数秒。 当包含小数秒精度时，DATETIME值需要更多存储：

分数秒精度|存储(字节)
:-------:|:-------:
0|0
1，2|1
3，4|2
5，6|3

例如，2017-12-20 10:01:00.999999需要8个字节，2015-12-20 10:01:00需要5个字节，3个字节为.999999，而2017-12-20 10:01:00.9只需要6个字节，小数秒精度为1字节。

### &emsp;1. 相关处理函数

DATETIME类型的处理函数很多都已经提过了。包括`NOW()`、`DATE()`、`DATE_FORMAT()`、`TIME_FORMAT()`、`DATE_DIFF`、`TIME_DIFF`、获取时间的`TIME()`、`YEAR()`、获取季度的`QUARTER()`、`MONTH()`、`WEEK()`、`DAY()`、`HOUR()`、`MINUTE()`和`SECOND()`。

### &emsp;2. DATE_ADD()、DATE_SUB()

这两个函数与ADDTIME()、SUBTIME()两个函数类似，都是将时间值上加减，但是它们返回的是DATETIME值而非TIME值。

<span style="color:aqua">格式：</span>ADDTIME/SUBTIME(DATE或DATETIME类型值,INTERVAL 时间表达式 时间单位)

根据参数，DATE_ADD函数可能会返回一个DATETIME值或一个字符串：

+ DATETIME - 如果第一个参数是DATETIME值，或者如果间隔值具有时间元素，如小时，分钟或秒等。
+ 否则返回字符串。

时间单位是什么？实例：

```sql
SELECT DATE_ADD('2017-12-31 00:00:01',INTERVAL 1 DAY) result;
-->>>>>2018-01-01 00:00:01--
SELECT DATE_ADD('2017-12-31 23:59:59', INTERVAL '1:1' MINUTE_SECOND) result;
-->>>>>2018-01-01 00:01:00--
```

时间单位|描述|时间单位|描述
:------|:--:|:------|:--:
MICROSECOND|微秒|SECOND|秒
MINUTE|分钟|HOUR|小时
DAY|天|WEEK|周
MONTH|月|QUARTER|季度
YEAR|年|SECOND_MICROSECOND|秒_微秒
MINUTE_MICROSECOND|分钟_微秒|MINUTE_SECOND|分钟_秒
HOUR_MICROSECOND|小时_微妙|HOUR_SECOND|小时_秒
HOUR_MINUTE|小时_分钟|DAY_MICROSECOND|天_微秒
DAY_SECOND|天_秒|DAY_MINUTE|天_分钟
DAY_HOUR|天_小时|YEAR_MONTH|年_小时

<span style="color:orange">注意：</span>时间表达式被视为一个字符串，因此，当用非字符串值时，应该注意。

1. 间隔为HOUR_MINUTE，5/2求值结果为2.5000(不是2.5)，并被视为2小时5000分钟。对于这种结果你应该去使用`CAST()`函数来转换结果，如：`SELECT DATE_ADD('2017-01-01', INTERVAL CAST(6/4 AS DECIMAL(3,1)) HOUR_MINUTE) result;`。
2. DATE值如果加上TIME值会自动转换为DATETIME值。
3. 如果起始值无效，将返回NULL。
4. 如果您将MONTH，YEAR或YEAR_MONTH的间隔添加到导致日期大于新月份的最大日期的日期，则该日期将被调整为新月份的最大日期。如：`SELECT DATE_ADD('2017-01-30', INTERVAL 1 MONTH) result;`，将会得到2017-02-28的结果。

### &emsp;3. EXTRACT()

用于返回日期/时间的单独部分，比如年、月、日、小时、分钟等等。

<span style="color:aqua">格式：</span>`EXTRACT(时间单位 FROM 时间表达式)`

时间单位就是上面的表格，使用方式类似。

&emsp;

## TIMESTAMP

TIMESTAMP是一种保存日期和时间组合的时间数据类型。 TIMESTAMP列的格式为YYYY-MM-DD HH:MM:SS，固定为19个字符。

TIMESTAMP值的范围从'1970-01-01 00:00:01' UTC到'2038-01-19 03:14:07' UTC。

### &emsp;1. 时区的保存

当您将TIMESTAMP值插入到表中时，MySQL会将其从连接的时区转换为UTC后进行存储。 当您查询TIMESTAMP值时，MySQL会将UTC值转换回连接的时区。请注意，对于其他时间数据类型(如DATETIME)，不会进行此转换。

当检索由不同时区中的客户端插入TIMESTAMP值时，将获得存储数据库中不同的值。 只要不更改时区，就可以获得与存储的相同的TIMESTAMP值。

```sql
--创建一个名为test_timestamp的新表，具有一列：t1，其数据类型为TIMESTAMP--
CREATE TABLE IF NOT EXISTS test_timestamp (
    t1  TIMESTAMP
);
--使用SET time_zone语句将时区设置为"+00：00"UTC。--
SET time_zone='+00:00';
--将TIMESTAMP值插入到test_timestamp表中。--
INSERT INTO test_timestamp
VALUES('2020-03-05 00:00:01');
--从test_timestamp表中查询选择TIMESTAMP
SELECT
    t1
FROM
    test_timestamp;
-->>>>>2020-03-05 00:00:01
--将会话时区设置为不同的时区，以查看从数据库服务器返回的值：--
SET time_zone ='+03:00';
SELECT t1
FROM test_timestamp;
-->>>>>2020-03-05 03:00:01--
```

所以查询结果集中为调整到新时区的不同时间值。

### &emsp;2. 自动初始化和更新

```sql
--创建一个名为categories的表：--
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--created_at列是一个TIMESTAMP列，其默认值设置为CURRENT_TIMESTAMP。--
--向categories表中插入一个新行，而不指定created_at列的值：--
INSERT INTO categories(name)
VALUES ('A');
--开始查询；--
SELECT
    *
FROM
    categories;
-->>> |  1 | A    | 2020-03-07 22:20:17 |
```

这样TIMESTAMP列自动初始化为指定列插入行的当前时间戳作为一个值。此功能称为自动初始化。

```sql
--然后将添加一个名为updated_at，数据类型为TIMESTAMP的新列到categories表中。--
ALTER TABLE categories
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
--updated_at列的默认值为CURRENT_TIMESTAMP。但是，在DEFAULT CURRENT_TIMESTAMP子句之后又有一个子句ON UPDATE CURRENT_TIMESTAMP。--
--以下语句将一个新行插入到categories表中。--
INSERT INTO categories(name)
VALUES('B');
--查询--
SELECT * FROM categories;
```

```terminal
>>>>>
+----+------+---------------------+---------------------+
| id | name | created_at          | updated_at          |
+----+------+---------------------+---------------------+
|  1 | A    | 2020-03-07 22:20:17 | 2020-03-07 22:23:42 |
|  2 | B    | 2020-03-07 22:23:52 | 2020-03-07 22:23:52 |
+----+------+---------------------+---------------------+
2 rows in set (0.00 sec)
```

```sql
--created_at列的默认值是插入行的时间戳。更新id=2的行的name列中的值，并从categories表更新查询数据。--
UPDATE categories
SET
    name = 'B+'
WHERE
    id = 2;
--查询更新结果--
SELECT
    *
FROM
    categories
WHERE
    id = 2;
```

```terminal
>>>>>
+----+------+---------------------+---------------------+
| id | name | created_at          | updated_at          |
+----+------+---------------------+---------------------+
|  2 | B+   | 2020-03-07 22:23:52 | 2020-03-07 22:27:34 |
+----+------+---------------------+---------------------+
1 row in set (0.00 sec)
```

updated_at列中的值在更新行时自动更改了时间戳。当行中任何其他列中的值从其当前值更改时，TIMESTAMP列的功能将自动更新为当前时间戳，这种行为称为自动更新。而updated_at列被称为自动更新列。

<span style="color:orange">注意：</span>如果执行UPDATE语句更新name列为和原来相同值，则updated_at列将不会更新。

```sql
UPDATE categories
SET
    name = 'B+'
WHERE
    id = 2;
```

updated_at列的值保持不变。

DEFAULT_CURRENT_TIMESTAMP和ON UPDATE CURRENT TIMESTAMP可以应用于多个列。

### &emsp;3. FROM_UNIXTIME()、UNIX_TIMESTAMP()

返回自1970年以来的秒数。

在MySQL数据表设计中，时间字段一般都设计为时间戳格式的，开发人员去查看的时候就显得有点不方便。可以使用FROM_UNIXTIME转换成日期格式进行查看。如：`SELECT *,FROM_UNIXTIME(create_time) AS DATETIME FROM ebk_cls_io_log;`

如果是日期格式的，要转换成时间戳查看只需要把FROM_UNIXTIME换成UNIX_TIMESTAMP即可。

我们可以联合之前的STR_TO_DATE函数变为现在的时间：`(UNIX_TIMESTAMP(STR_TO_DATE(end_charge_time,'%Y-%m-%d %H:%i:%s')) - UNIX_TIMESTAMP(STR_TO_DATE(begin_charge_time,'%Y-%m-%d %H:%i:%s'))) EquipmentChargeTime`

### &emsp;4. 与DATETIME的对比

TIMESTAMP需要4个字节，而DATETIME需要5个字节。 TIMESTAMP和DATETIME都需要额外的字节，用于分数秒精度。

TIMESTAMP值范围从1970-01-01 00:00:01 UTC到2038-01-19 03:14:07 UTC。 如果要存储超过2038的时间值，则应使用DATETIME而不是TIMESTAMP。

MySQL将TIMESTAMP存储在UTC(有时区)值中。 但是，MySQL存储DATETIME值是没有时区的。也就是说随着时区的变化，时间戳的内容会随之变化。

&emsp;

## YEAR

用来表示年份。

1个字节，1901-2155,可以用0000表示默认值。日期格式一般为YYYY。

1. 使用4位字符串或数字表示，范围'1901'~'2155'或1901~2155。例如，输入'2014'或2014，插入到数据库中的值均为2014。
2. 使用两位字符串表示,范围为'00'~'99'，其中，'00'~'69'范围的值会被转换为2000~2069范围的YEAR值，'70'~'99'范围的值会被转换为1970~1999范围的YEAR值。例如，输入14，插入到数据库中的值为2014。
3. 使用两位数字表示，范围为1~99其中，1~69范围的值会被转换为2001~2069范围的YEAR值，70~99范围的值会被转换为1970~1999范围的YEAR值。例如，输入14,插入到数据库中的值为2014。

<span style="color:orange">注意：</span>当使用YEAR类型时，一定要区分'0'和0。因为字符串格式的'0'表示的YEAR值是2000，而数字格式的0表示的YEAR值是0000。
