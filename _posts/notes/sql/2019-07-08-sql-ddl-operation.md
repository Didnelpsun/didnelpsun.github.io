---
layout: post
title:  "DDL操作"
date:   2019-07-08 09:31:41 +0800
categories: notes sql base
tags: sql SQL 基础 语法 DDL 非空 不等 主键 外键 范围 默认值 自动 视图
excerpt: "DDL高级语法"
---

主要讲的是约束，用于限制加入表的数据的类型。

可以在创建表时规定约束（通过 CREATE TABLE 语句），或者在表创建之后也可以（通过 ALTER TABLE 语句）。

## 非空

NOT NULL 约束强制列不接受 NULL 值。强制字段始终包含值。这意味着，如果不向字段添加值，就无法插入新记录或者更新记录。

<span style="color:aqua">格式：</span>`属性 NOT NULL`

```sql
--强制 "Id_P" 列和 "LastName" 列不接受 NULL 值--
CREATE TABLE Persons
(
Id_P int NOT NULL,
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255)
)
```

&emsp;

## 不相等

UNIQUE 约束唯一标识数据库表中的每条记录。

UNIQUE 和 PRIMARY KEY 约束均为列或列集合提供了唯一性的保证。

PRIMARY KEY 拥有自动定义的 UNIQUE 约束。

请注意，每个表可以有多个 UNIQUE 约束，但是每个表只能有一个 PRIMARY KEY 约束。

### &emsp;1. CREATE TABLE时

<span style="color:aqua">格式：</span>MySQL：`UNIQUE (属性)`  SQL Server / Oracle / MS Access:`属性 UNIQUE,`

如果需要命名 UNIQUE 约束，以及为多个列定义 UNIQUE 约束，请使用下面的<span style="color:aqua">格式：</span>`CONSTRAINT 主不相等约束名 UNIQUE (被约束属性名1,被约束属性名2...)`

### &emsp;2. ALTER TABLE时

当表已被创建时，如需在某列创建 UNIQUE 约束，<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD UNIQUE (属性名)`

如需命名 UNIQUE 约束，并定义多个列的 UNIQUE 约束，<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD CONSTRAINT 主不相等约束名 UNIQUE (被约束属性名1,被约束属性名2...)`

### &emsp;3. 撤销不等约束

撤销UNIQUE约束<span style="color:aqua">格式：</span>MySQL：`ALTER TABLE 表名 DROP INDEX 被约束属性名`   SQL Server / Oracle / MS Access：`ALTER TABLE 表名 DROP CONSTRAINT 被约束属性名`

&emsp;

## 主键

PRIMARY KEY 约束唯一标识数据库表中的每条记录。主键必须包含唯一的值。不能包含 NULL 值。

每个表都应该有一个主键，并且每个表只能有一个主键。

### &emsp;1. CREATE TABLE时

<span style="color:aqua">格式：</span>MySQL：`PRIMARY KEY (属性)` SQL Server / Oracle / MS Access：`属性 PRIMARY KEY`

如需命名 PRIMARY KEY 约束，并定义多个列的 PRIMARY KEY 约束，<span style="color:aqua">格式：</span>`CONSTRAINT 主键名 PRIMARY KEY (主键属性1,主键属性2...)`

### &emsp;2. ALTER TABLE时

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD PRIMARY KEY (属性名)`

如果需要命名 PRIMARY KEY 约束，以及为多个列定义 PRIMARY KEY 约束<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD CONSTRAINT 主键名 PRIMARY KEY (主键属性1,主键属性2...)`

<span style="color:orange">注意：</span>如果您使用 ALTER TABLE 语句添加主键，必须把主键列声明为不包含 NULL 值（在表首次创建时）。

### &emsp;3. 撤销主键约束

<span style="color:aqua">格式：</span>MySQL: `ALTER TABLE 表名 DROP PRIMARY KEY` SQL Server / Oracle / MS Access：`ALTER TABLE 表名 DROP CONSTRAINT 主键名`

&emsp;

## 外键

一个表中的 FOREIGN KEY 指向另一个表中的 UNIQUE KEY(唯一约束的键)。

FOREIGN KEY 约束用于预防破坏表之间连接的行为。也能防止非法数据插入外键列，因为它必须是它指向的那个表中的值之一。

### &emsp;1. CREATE TABLE时

<span style="color:aqua">格式：</span>MySQL: `FOREIGN KEY (本表外键) REFERENCES 参照表名(参照键)` SQL Server / Oracle / MS Access：`外键在本表属性名 数据类型 FOREIGN KEY REFERENCES 参照表名(参照键)`

<span style="color:aqua">格式：</span>`CONSTRAINT 联合键名 FOREIGN KEY (外键属性1,外键属性2...) REFERENCES 参照表名(参照属性1,参照属性2...)`

### &emsp;2. ALTER TABLE时

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD FOREIGN KEY (本表外键) REFERENCES 参照表名(参照键)`

多列属性的<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD CONSTRAINT 联合键名 REFERENCES 参照表名(参照属性1,参照属性2...)`

### &emsp;3. 撤销外键约束

<span style="color:aqua">格式：</span>MySQL：`ALTER TABLE 表名 DROP FOREIGN KEY 联合键名` SQL Server / Oracle / MS Access：`ALTER TABLE 表名 DROP CONSTRAINT 联合键名`

&emsp;

## 值范围

CHECK 约束用于限制列中的值的范围。

如果对单个列定义 CHECK 约束，那么该列只允许特定的值。

如果对一个表定义 CHECK 约束，那么此约束会在特定的列中对值进行限制。

### &emsp;1. CREATE TABLE时

<span style="color:aqua">格式：</span>MySQL: `CHECK(约束条件)` SQL Server / Oracle / MS Access：`属性名 类型 CHECK(约束条件)`

```sql
--My SQL:--
CREATE TABLE Persons
(
Id_P int NOT NULL,
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255),
CHECK (Id_P>0)
)
--SQL Server / Oracle / MS Access:--
CREATE TABLE Persons
(
Id_P int NOT NULL CHECK (Id_P>0),
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255)
)
```

为多个列定义 CHECK 约束，<span style="color:aqua">格式：</span>`CONSTRAINT 约束名 CHECK (约束条件)`

### &emsp;2. ALTER TABLE时

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD CHECK (约束条件)`

多行<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD CONSTRAINT 约束名 CHECK (约束条件)`

### &emsp;3. 撤销值约束

<span style="color:aqua">格式：</span>MySQL：`ALTER TABLE 表名 DROP CONSTRAINT 约束名` SQL Server / Oracle / MS Access：`ALTER TABLE 表名 DROP CHECK 约束名`

&emsp;

## 默认值

DEFAULT 约束用于向列中插入默认值。

如果没有规定其他的值，那么会将默认值添加到所有的新记录。

### &emsp;1. CREATE TABLE时

<span style="color:aqua">格式：</span>`属性名 类型 DEFAULT '默认值'`

通过使用类似 GETDATE() 这样的函数，DEFAULT 约束也可以用于插入系统值：

```sql
CREATE TABLE Orders
(
Id_O int NOT NULL,
OrderNo int NOT NULL,
Id_P int,
OrderDate date DEFAULT GETDATE()
)
```

### &emsp;2. ALTER TABLE时

<span style="color:aqua">格式：</span>MySQL：`ALTER TABLE 表名 ALTER 列名 SET DEFAULT '默认值'` SQL Server / Oracle / MS Access：`ALTER TABLE 表名 ALTER COLUMN 列名 SET DEFAULT '默认值'`

### &emsp;3. 撤销默认值

<span style="color:aqua">格式：</span>MySQL：`ALTER TABLE 表名 ALTER 列名 DROP DEFAULT` SQL Server / Oracle / MS Access：`ALTER TABLE 表名 ALTER COLUMN 列名 DROP DEFAULT`

&emsp;

## 自动生成主键

常希望在每次插入新记录时，自动地创建主键字段的值。

我们可以在表中创建一个 auto-increment 字段。

### &emsp;1. 用于MySQL的语法

下列 SQL 语句把 "Persons" 表中的 "P_Id" 列定义为 auto-increment 主键：

```sql
CREATE TABLE Persons
(
P_Id int NOT NULL AUTO_INCREMENT,
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255),
PRIMARY KEY (P_Id)
)
```

MySQL 使用 AUTO_INCREMENT 关键字来执行 auto-increment 任务。默认地，AUTO_INCREMENT 的开始值是 1，每条新记录递增 1。

要让 AUTO_INCREMENT 序列以其他的值起始，请使用下列 SQL 语法：`ALTER TABLE Persons AUTO_INCREMENT=100`

要在 "Persons" 表中插入新记录，我们不必为 "P_Id" 列规定值（会自动添加一个唯一的值）：

```sql
INSERT INTO Persons (FirstName,LastName)
VALUES ('Bill','Gates')
```

上面的 SQL 语句会在 "Persons" 表中插入一条新记录。"P_Id" 会被赋予一个唯一的值。"FirstName" 会被设置为 "Bill"，"LastName" 列会被设置为 "Gates"。

### &emsp;2. 用于SQL Server的语法

下列 SQL 语句把 "Persons" 表中的 "P_Id" 列定义为 auto-increment 主键：

```sql
CREATE TABLE Persons
(
P_Id int PRIMARY KEY IDENTITY,
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255)
)
```

MS SQL 使用 IDENTITY 关键字来执行 auto-increment 任务。默认地，IDENTITY 的开始值是 1，每条新记录递增 1。

要规定 "P_Id" 列以 20 起始且递增 10，请把 identity 改为 IDENTITY(20,10)

要在 "Persons" 表中插入新记录，我们不必为 "P_Id" 列规定值（会自动添加一个唯一的值）：

```sql
INSERT INTO Persons (FirstName,LastName)
VALUES ('Bill','Gates')
```

上面的 SQL 语句会在 "Persons" 表中插入一条新记录。"P_Id" 会被赋予一个唯一的值。"FirstName" 会被设置为 "Bill"，"LastName" 列会被设置为 "Gates"。

### &emsp;3. 用于Access的语法

下列 SQL 语句把 "Persons" 表中的 "P_Id" 列定义为 auto-increment 主键：

```sql
CREATE TABLE Persons
(
P_Id int PRIMARY KEY AUTOINCREMENT,
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255)
)
```

MS Access 使用 AUTOINCREMENT 关键字来执行 auto-increment 任务。默认地，AUTOINCREMENT 的开始值是 1，每条新记录递增 1。

要规定 "P_Id" 列以 20 起始且递增 10，请把 autoincrement 改为 AUTOINCREMENT(20,10)

要在 "Persons" 表中插入新记录，我们不必为 "P_Id" 列规定值（会自动添加一个唯一的值）：

```sql
INSERT INTO Persons (FirstName,LastName)
VALUES ('Bill','Gates')
```

上面的 SQL 语句会在 "Persons" 表中插入一条新记录。"P_Id" 会被赋予一个唯一的值。"FirstName" 会被设置为 "Bill"，"LastName" 列会被设置为 "Gates"。

### &emsp;4. 用于Oracle的语法

在 Oracle 中，代码稍微复杂一点。必须通过 sequence 对创建 auto-increment 字段（该对象生成数字序列）。

CREATE SEQUENCE 语法：

```sql
CREATE SEQUENCE seq_person
MINVALUE 1
START WITH 1
INCREMENT BY 1
CACHE 10
```

上面的代码创建名为 seq_person 的序列对象，它以 1 起始且以 1 递增。该对象缓存 10 个值以提高性能。CACHE 选项规定了为了提高访问速度要存储多少个序列值。

要在 "Persons" 表中插入新记录，我们必须使用 nextval 函数（该函数从 seq_person 序列中取回下一个值）：

```sql
INSERT INTO Persons (P_Id,FirstName,LastName)
VALUES (seq_person.nextval,'Lars','Monsen')
```

上面的 SQL 语句会在 "Persons" 表中插入一条新记录。"P_Id" 的赋值是来自 seq_person 序列的下一个数字。"FirstName" 会被设置为 "Bill"，"LastName" 列会被设置为 "Gates"。

&emsp;

## 视图

什么是视图？  
在 SQL 中，视图是基于 SQL 语句的结果集的可视化的表。

视图包含行和列，就像一个真实的表。视图中的字段就是来自一个或多个数据库中的真实的表中的字段。我们可以向视图添加 SQL 函数、WHERE 以及 JOIN 语句，我们也可以提交数据，就像这些来自于某个单一的表。

<span style="color:blue">注释：</span>数据库的设计和结构不会受到视图中的函数、where 或 join 语句的影响。但是实际上我之前都没有用过它，因为我之前都是使用navicat图形化界面，已经给我了视图的功能。

### &emsp;1. 创建视图

<span style="color:aqua">格式：</span>`CREATE VIEW 视图名字 AS SELECT 列1,列2... FROM 表名 WHERE 约束情况`

这里有一个实例，一个来自 Northwind 数据库的视图实例会计算在 1997 年每个种类的销售总数。请注意，这个视图会从另一个名为 "Product Sales for 1997" 的视图那里选取数据：

```sql
CREATE VIEW [Category Sales For 1997] AS
SELECT DISTINCT CategoryName,Sum(ProductSales) AS CategorySales
FROM [Product Sales for 1997]
GROUP BY CategoryName
```

我们可以像这样查询上面这个视图：`SELECT * FROM [Category Sales For 1997]`

我们也可以向查询添加条件。现在，我们仅仅需要查看 "Beverages" 类的全部销量：

```sql
SELECT * FROM [Category Sales For 1997]
WHERE CategoryName='Beverages'
```

### &emsp;2. 更新视图

<span style="color:aqua">格式：</span>`CREATE/REPLACE VIEW 视图名 AS SELECT 列1,列2... FROM 表名 WHERE 条件`

向 "Current Product List" 视图添加 "Category" 列：

```sql
CREATE VIEW [Current Product List] AS
SELECT ProductID,ProductName,Category
FROM Products
WHERE Discontinued=No
```

### &emsp;3. 撤销视图

<span style="color:aqua">格式：</span>`DROP VIEW 视图名`