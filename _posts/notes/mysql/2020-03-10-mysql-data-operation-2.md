---
layout: post
title:  "数据操作（下）"
date:   2020-03-10 09:45:51 +0800
categories: notes mysql base
tags: MySQL 基础 mysql 插入 更新 删除 
excerpt: "数据插入删除等"
---

## CTE

公用表表达式（CTE）是一个命名的临时结果集，仅在单个SQL语句(例如SELECT，INSERT，UPDATE或DELETE)的执行范围内存在。
与派生表类似，CTE不作为对象存储，仅在查询执行期间持续。 与派生表不同，CTE可以是自引用(递归CTE)，也可以在同一查询中多次引用。 此外，与派生表相比，CTE提供了更好的可读性和性能。

### &emsp;定义

<span style="color:aqua">格式：</span>

```sql
WITH CTE名字(列1,列2...) AS(
    处理表达式
)--下面的部分都是可选的，根据查询需要进行选择--
SELECT 列1,列2...
FROM 表名
WHERE 条件
ORDER BY 排序条件
LIMIT 限制条件
```

```sql
--这个例子是与销售有关--
--先使用CTE查询，再合并，最后再查询--
WITH salesrep AS (
    SELECT
        employeeNumber,
        CONCAT(firstName, ' ', lastName) AS salesrepName
    FROM
        employees
    WHERE
        jobTitle = 'Sales Rep'
),
customer_salesrep AS (
    SELECT 
        customerName, salesrepName
    FROM
        customers
            INNER JOIN
        salesrep ON employeeNumber = salesrepEmployeeNumber
)
SELECT
    *
FROM
    customer_salesrep
ORDER BY customerName;
```

### &emsp;与其他语句的混用

1. 在SELECT，UPDATE和DELETE语句的开头可以使用WITH子句：
+ WITH ... SELECT ...
+ WITH ... UPDATE ...
+ WITH ... DELETE ...
2. 可以在子查询或派生表子查询的开头使用WITH子句：
+ SELECT ... WHERE id IN (WITH ... SELECT ...);
+ SELECT * FROM (WITH ... SELECT ...) AS derived_table;
3. 可以在SELECT语句之前立即使用WITH子句，包括SELECT子句：
+ CREATE TABLE ... WITH ... SELECT ...
+ CREATE VIEW ... WITH ... SELECT ...
+ INSERT ... WITH ... SELECT ...
+ REPLACE ... WITH ... SELECT ...
+ DECLARE CURSOR ... WITH ... SELECT ...
+ EXPLAIN ... WITH ... SELECT ...

### &emsp;CTE的递归

<span style="color:aqua">格式：</span>

```sql
WITH RECURSIVE CTE名字 AS (
    初始查询 --，形成基本结果集，被称为锚成员
    UNION ALL
    --递归成员由一个UNION ALL或UNION DISTINCT运算符与锚成员相连--
    递归查询 -- 是引用CTE名称的查询，被称为递归成员--
    --其中必须有一个终止条件，如WHERE子句--
)
SELECT 列1,列2...
FROM 表明
WHERE 条件
ORDER BY 排序条件
LIMIT 限制条件
```

CTE递归的执行顺序：

1. 首先，将成员分为两个：锚点和递归成员。
2. 接下来，执行锚成员形成基本结果集(R0)，并使用该基本结果集进行下一次迭代。
3. 然后，将Ri结果集作为输入执行递归成员，并将Ri+1作为输出。
4. 之后，重复第三步，直到递归成员返回一个空结果集，换句话说，满足终止条件。
5. 最后，使用UNION ALL运算符将结果集从R0到Rn组合。

递归成员限制，递归成员不能包含以下结构：

+ 聚合函数，如MAX，MIN，SUM，AVG，COUNT等
+ GROUP BY子句
+ ORDER BY子句
+ LIMIT子句
+ DISTINCT

<span style="color:orange">注意：</span>上述约束不适用于锚定成员。 另外，只有在使用UNION运算符时，要禁止DISTINCT才适用。 如果使用UNION DISTINCT运算符，则允许使用DISTINCT。另外，递归成员只能在其子句中引用CTE名称，而不是引用任何子查询。

```sql
WITH RECURSIVE cte_count (n)
AS (
      SELECT 1 --锚成员--
      UNION ALL
      SELECT n + 1 --递归查询--
      FROM cte_count
      WHERE n < 4 --终止条件--
      --当n=3递归成员将返回一个空集合，从而停止递归--
    )
SELECT n
FROM cte_count;
```

对于这个例子的CTE递归步骤为：

1. 首先，分离锚和递归成员。
2. 接下来，锚定成员形成初始行(SELECT 1)，因此第一次迭代在n = 1时产生1 + 1 = 2。
3. 然后，第二次迭代对第一次迭代的输出(2)进行操作，并且在n = 2时产生2 + 1 = 3。
4. 之后，在第三次操作(n = 3)之前，满足终止条件(n <3)，因此查询停止。
5. 最后，使用UNION ALL运算符组合所有结果集1,2和3。

&emsp;

## EXPLAIN

使用EXPLAIN关键字可以模拟优化器执行SQL查询语句，从而知道MySQL是如何处理你的SQL语句的。分析你的查询语句或是表结构的性能瓶颈。

通过EXPLAIN，我们可以分析出以下结果：

+ 表的读取顺序
+ 数据读取操作的操作类型
+ 哪些索引可以使用
+ 哪些索引被实际使用
+ 表之间的引用
+ 每张表有多少行被优化器查询

<span style="color:aqua">格式：</span>`EXPLAIN +SQL语句`

EXPLAIN出来的信息有10列，分别是id、select_type、table、type、possible_keys、key、key_len、ref、rows、Extra。

### &emsp;1. id

SELECT识别符。这是SELECT的查询序列号，是SQL执行的顺序的标识，SQL从大到小的执行

1. id相同时，执行顺序由上至下
2. 如果是子查询，id的序号会递增，id值越大优先级越高，越先被执行
3. id如果相同，可以认为是一组，从上往下顺序执行；在所有组中，id值越大，优先级越高，越先执行

### &emsp;2. select_type

表示查询中每个select子句的类型

1. SIMPLE(简单SELECT，不使用UNION或子查询等)
2. PRIMARY(子查询中最外层查询，查询中若包含任何复杂的子部分，最外层的select被标记为PRIMARY)
3. UNION(UNION中的第二个或后面的SELECT语句)
4. DEPENDENT UNION(UNION中的第二个或后面的SELECT语句，取决于外面的查询)
5. UNION RESULT(UNION的结果，union语句中第二个select开始后面所有select)
6. SUBQUERY(子查询中的第一个SELECT，结果不依赖于外部查询)
7. DEPENDENT SUBQUERY(子查询中的第一个SELECT，依赖于外部查询)
8. DERIVED(派生表的SELECT, FROM子句的子查询)
9. UNCACHEABLE SUBQUERY(一个子查询的结果不能被缓存，必须重新评估外链接的第一行)

### &emsp;3. table

显示这一步所访问数据库中表名称（显示这一行的数据是关于哪张表的），有时不是真实的表名字，可能是简称，例如上面的e，d，也可能是第几步执行的结果的简称

### &emsp;4. type

对表访问方式，表示MySQL在表中找到所需行的方式，又称"访问类型"。

常用的类型有： ALL、index、range、 ref、eq_ref、const、system、NULL（从左到右，性能从差到好）

+ ALL：Full Table Scan， MySQL将遍历全表以找到匹配的行
+ index: Full Index Scan，index与ALL区别为index类型只遍历索引树
+ range:只检索给定范围的行，使用一个索引来选择行
+ ref: 表示上述表的连接匹配条件，即哪些列或常量被用于查找索引列上的值
+ eq_ref: 类似ref，区别就在使用的索引是唯一索引，对于每个索引键值，表中只有一条记录匹配，简单来说，就是多表连接中使用primary key或者 unique key作为关联条件
+ const、system: 当MySQL对查询某部分进行优化，并转换为一个常量时，使用这些类型访问。如将主键置于where列表中，MySQL就能将该查询转换为一个常量，system是const类型的特例，当查询的表只有一行的情况下，使用system
+ NULL: MySQL在优化过程中分解语句，执行时甚至不用访问表或索引，例如从一个索引列里选取最小值可以通过单独索引查找完成。

### &emsp;5. possible_keys

指出MySQL能使用哪个索引在表中找到记录，查询涉及到的字段上若存在索引，则该索引将被列出，但不一定被查询使用（该查询可以利用的索引，如果没有任何索引显示 null）

该列完全独立于EXPLAIN输出所示的表的次序。这意味着在possible_keys中的某些键实际上不能按生成的表次序使用。
如果该列是NULL，则没有相关的索引。在这种情况下，可以通过检查WHERE子句看是否它引用某些列或适合索引的列来提高你的查询性能。如果是这样，创造一个适当的索引并且再次用EXPLAIN检查查询

### &emsp;6. Key

key列显示MySQL实际决定使用的键（索引），必然包含在possible_keys中

如果没有选择索引，键是NULL。要想强制MySQL使用或忽视possible_keys列中的索引，在查询中使用FORCE INDEX、USE INDEX或者IGNORE INDEX。

### &emsp;7. key_len

表示索引中使用的字节数，可通过该列计算查询中使用的索引的长度（key_len显示的值为索引字段的最大可能长度，并非实际使用长度，即key_len是根据表定义计算而得，不是通过表内检索出的）

不损失精确性的情况下，长度越短越好

### &emsp;8. ref

列与索引的比较，表示上述表的连接匹配条件，即哪些列或常量被用于查找索引列上的值

### &emsp;9. rows

估算出结果集行数，表示MySQL根据表统计信息及索引选用情况，估算的找到所需的记录所需要读取的行数

### &emsp;10. Extra

该列包含MySQL解决查询的详细信息,有以下几种情况：

+ Using where:不用读取表中所有信息，仅通过索引就可以获取所需数据，这发生在对表的全部的请求列都是同一个索引的部分的时候，表示mysql服务器将在存储引擎检索行后再进行过滤。
+ Using temporary：表示MySQL需要使用临时表来存储结果集，常见于排序和分组查询，常见 group by ; order by。
+ Using filesort：当Query中包含 order by 操作，而且无法利用索引完成的排序操作称为"文件排序"。如`EXPLAIN SELECT * FROM test ORDER BY name;`
+ Using join buffer：改值强调了在获取连接条件时没有使用索引，并且需要连接缓冲区来存储中间结果。如果出现了这个值，那应该注意，根据查询的具体情况可能需要添加索引来改进能。
+ Impossible where：这个值强调了where语句会导致没有符合条件的行（通过收集统计信息不可能存在结果）。
+ Select tables optimized away：这个值意味着仅通过使用索引，优化器可能仅从聚合函数结果中返回一行
+ No tables used：Query语句中使用from dual 或不含任何from子句

总结：

+ EXPLAIN不会告诉你关于触发器、存储过程的信息或用户自定义函数对查询的影响情况。
+ EXPLAIN不考虑各种Cache。
+ EXPLAIN不能显示MySQL在执行查询时所作的优化工作。
+ 部分统计信息是估算的，并非精确值。
+ EXPALIN只能解释SELECT操作，其他操作要重写为SELECT后查看执行计划。

&emsp;

## PREPARED

之前的MySQL版本4.1，查询以文本格式发送到MySQL服务器。 之后，MySQL服务器使用文本协议将数据返回给客户端。MySQL必须完全解析查询，并将结果集转换为字符串，然后再将其返回给客户端。

文本协议具有严重的性能问题。为了解决这个问题，MySQL自版本4.1以来添加了一个名为PREPARED语句的来实现一些新功能。

PREPARED语句利用客户端/服务器二进制协议。它将包含占位符(?)的查询传递给MySQL服务器，如：

```sql
SELECT *
FROM products
WHERE productCode = ?;
```

当MySQL使用不同的productcode值执行此查询时，不必完全解析查询。 因此，这有助于MySQL更快地执行查询，特别是当MySQL多次执行查询时。 因为PREPARED语句使用占位符(?)，这有助于避免SQL注入的问题，从而使您的应用程序更安全一些。

为了使用MySQL准备语句，您需要使用其他三个MySQL语句如下：

+ PREPARE - 准备执行的声明。
+ EXECUTE  - 执行由PREPARE语句定义的语句。
+ DEALLOCATE PREPARE - 发布PREPARE语句。

```sql
PREPARE stmt1 FROM 'SELECT productCode, productName
                    FROM products
                    WHERE productCode = ?';

SET @pc = 'S10_1678';
EXECUTE stmt1 USING @pc;
DEALLOCATE PREPARE stmt1;
```

+ 首先，使用PREPARE语句准备执行语句。我们使用SELECT语句根据指定的产品代码从products表查询产品数据。然后再使用问号(?)作为产品代码的占位符。
+ 接下来，声明了一个产品代码变量@pc，并将其值设置为S10_1678。
+ 然后，使用EXECUTE语句来执行产品代码变量@pc的准备语句。
+ 最后，我们使用DEALLOCATE PREPARE来发布PREPARE语句

&emsp;

## 数据插入删除与更新

这些基本和SQL语句一致，但是有些操作可以补充。

### &emsp;插入与更新

#### &emsp;&emsp;一般格式

插入复制数据<span style="color:aqua">格式：</span>`INSERT INTO 表名1(列1,列2...) SELECT 列1,列2... FROM 表名2;`

排序与控制更新<span style="color:aqua">格式：</span>`UPDATE 表名 SET 列1=值1,列2=值2... WHERE 条件 ORDER BY 排序属性列 LIMIT 控制行数;`

#### &emsp;&emsp;INSERT IGNORE

与INSERT INTO用法类似，但是如果插入表中已经存在相同的记录，就会忽略当前插入的新数据。

#### &emsp;&emsp;ON DUPLICATE KEY UPDATE

我们在使用插入数据的时候可能会出现主键的冲突，如插入的数据的主键与原来的主键重复，我们对此或许有三种处理方式，一种是使用INSERT IGNORE般的忽略新值，一种就是更改主键属性，另一种想法就是更新该数据。我们当然可以使用UPDATE来更新，我们也可以使用`ON DUPLICATE KEY UPDATE`来替代。如：

```sql
INSERT INTO test(id,name)
VALUES(3,'Didnelpsun)
ON DUPLICATE KEY UPDATE
    id=id+1,
    name="DidnelpsunUpdate";
```

本来我们插入的id为3，但是实际上与原来的主键属性冲突，而我们使用了这个ON DUPLICATE KEY UPDATE就是对原来冲突的属性进行更新，将id变为4，将name变为DidnelpsunUpdate。

#### &emsp;&emsp;REPLACE INTO

或者更简单的，我们可以使用`REPLACE INTO`句式，如果主键或者不相同约束没有影响，它与INSERT INTO类似，但是假如表中的一个旧数据，与一个用于PRIMARY KEY或一个UNIQUE索引的新记录具有相同的值，则在新记录被插入之前，旧记录被删除。其他没有被REPLACE的字段会填充默认值，且主键中如果有AUTO_INCREMENT属性则会自动加1。

除非表有一个PRIMARY KEY或UNIQUE索引，否则，使用一个REPLACE语句没有意义。该语句会与INSERT相同，因为没有索引被用于确定是否新行复制了其它的行。

REPLACE语句会返回一个数，来指示受影响的行的数目。该数是被删除和被插入的行数的和。如果对于一个单行REPLACE该数为1，则一行被插入，同时没有行被删除。如果该数大于1，则在新行被插入前，有一个或多个旧行被删除。如果表包含多个唯一索引，并且新行复制了在不同的唯一索引中的不同旧行的值，则有可能是一个单一行替换了多个旧行。

受影响的行数可以容易地确定是否REPLACE只添加了一行，或者是否REPLACE也替换了其它行：检查该数是否为1（添加）或更大（替换）。

三种用法：

1. `REPLACE INTO 表名(列1,列2...) VALUES (...)`
2. `REPLACE INTO 表名(列1,列2...) SELECT ...`
3. `REPLACE INTO 表名 SET 列1=值1,列2=值2...`

#### &emsp;&emsp;REPLACE INTO与ON DUPLICATE KEY UPDATE的对比

相同：

1. 没有主键或者非同约束的时候，REPLACE INTO与ON DUPLICATE KEY UPDATE相同。
2. 有主键或者非同约束的时候，都保留主键值，并且AUTO_INCREMENT自动+1。

不同：ON DUPLICATE KEY UPDATE保留了所有字段的旧值，再覆盖然后一起插入进去，而REPLACE INTO没有保留旧值，直接删除再插入新值，没有被插入的值就使用默认值来填充。

从底层执行效率上来讲，REPLACE INTO要比ON DUPLICATE KEY UPDATE效率要高，但是在写REPLACE INTO的时候，字段要写全，防止老的字段数据被删除。

#### &emsp;&emsp;REPLACE()

是一个函数，用来替换字符串或者二进制数据类型，<span style="color:aqua">格式：</span>`REPLACE(字符串对象,被替换值,替换值)`

如：`SELECT REPLACE('Didnelpsun','n','j') FROM ... >>>>>Didjelpsuj`

任何一个参数为NULL，就全部返回NULL。

### &emsp;排序与控制删除

<span style="color:aqua">格式：</span>`DELETE FROM 表名 WHERE 条件 ORDER BY 排序属性列 LIMIT 控制行数;`
