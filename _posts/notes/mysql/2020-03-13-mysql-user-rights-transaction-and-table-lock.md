---
layout: post
title:  "权限事务与锁定"
date:   2020-03-13 16:07:11 +0800
categories: notes mysql base
tags: MySQL 基础 mysql 
excerpt: "用户权限、事务与表锁定"
---

## 用户与权限

在对 MySQL 的日常管理和实际操作中，为了避免用户恶意冒名使用 root 账号控制数据库，通常需要创建一系列具备适当权限的账号，应该尽可能地不用或少用 root 账号登录系统，以此来确保数据的安全访问。比如我现在用的用户和密码就都是root。

### &emsp;创建

可以使用 CREATE USER 语句来创建一个或多个 MySQL 账户，并设置相应的口令<span style="color:aqua">格式：</span>`CREATE USER 用户名 IDENTIFIED BY PASSWORD 口令即密码`

+ 如果指定创建用户账号，<span style="color:aqua">格式：</span>为 '用户名'@'主机名'。主机名即用户连接 MySQL 时所在主机的名字。若在创建的过程中，只给出了账户的用户名，而没指定主机名，则主机名默认为"%"，表示一组主机。
+ PASSWORD关键字为可选项，用于指定散列口令，即若使用明文设置口令，则需忽略PASSWORD关键字；若不想以明文设置口令，且知道 PASSWORD() 函数返回给密码的散列值，则可以在口令设置语句中指定此散列值，但需要加上关键字PASSWORD。
+ IDENTIFIED BY用于指定用户账号对应的口令，若该用户账号无口令，则可省略此子句。
+ 指定用户账号的口令在IDENTIFIED BY关键字或PASSWOED关键字之后。给定的口令值可以是只由字母和数字组成的明文，也可以是通过 PASSWORD() 函数得到的散列值。
+ 如果使用 CREATE USER 语句时没有为用户指定口令，那么 MySQL 允许该用户可以不使用口令登录系统，然而从安全的角度而言，不推荐这种做法。
+ 使用 CREATE USER 语句必须拥有 MySQL 中 MySQL 数据库的 INSERT 权限或全局 CREATE USER 权限。
+ 使用 CREATE USER 语句创建一个用户账号后，会在系统自身的 MySQL 数据库的 user 表中添加一条新记录。若创建的账户已经存在，则语句执行时会出现错误。
+ 新创建的用户拥有的权限很少。他们可以登录 MySQL，只允许进行不需要权限的操作，如使用 SHOW 语句查询所有存储引擎和字符集的列表等。

```sql
--建立用户--
CREATE USER 'james'@'localhost'
IDENTIFIED BY 'tiger'
--启动服务器--
mysql -h localhost -u james -p
--输入密码--
Enter password: --<<<tiger--
```

### &emsp;修改

#### &emsp;&emsp;修改用户名

使用RENAME USER语句修改一个或多个已经存在的 MySQL 用户账号的<span style="color:aqua">格式：</span>`RENAME USER 旧用户 TO 新用户`

+ RENAME USER 语句用于对原有的 MySQL 账户进行重命名。
+ 若系统中旧账户不存在或者新账户已存在，则该语句执行时会出现错误。
+ 要使用 RENAME USER 语句，必须拥有 MySQL 中的 MySQL 数据库的 UPDATE 权限或全局 CREATE USER 权限。

#### &emsp;&emsp;修改用户密码

使用 SET PASSWORD 语句<span style="color:aqua">格式：</span>

```sql
SET PASSWORD FOR 用户名 =
{
    PASSWORD('新明文口令')
    / OLD_PASSWORD('旧明文口令')
    / '加密口令值'
}
```

+ FOR 子句为可选项。指定欲修改口令的用户。
+ PASSWORD('新明文口令')表示使用函数 PASSWORD() 设置新口令，即新口令必须传递到函数 PASSWORD() 中进行加密。
+ 加密口令值：表示已被函数 PASSWORD() 加密的口令值。<span style="color:orange">注意：</span>PASSWORD() 函数为单向加密函数，一旦加密后不能解密出原明文。
+ 在 SET PASSWORD 语句中，若不加上 FOR 子句，表示修改当前用户的口令。若加上 FOR 子句，表示修改账户为 user 的用户口令。
+ user 必须以 'user_name'@'host_name' 的格式给定，user_name 为账户的用户名，host_name 为账户的主机名。
+ 该账户必须在系统中存在，否则语句执行时会出现错误。
+ 在 SET PASSWORD 语句中，只能使用选项 PASSWORD('新明文口令') 和加密口令值中的一项，且必须使用其中的一项。

如：`SET PASSWORD FOR 'jack'@'localhost'= PASSWORD('lion');`

### &emsp;删除

<span style="color:aqua">格式：</span>`DROP USER 用户1...;`

在 DROP USER 语句的使用中，若没有明确地给出账户的主机名，则该主机名默认为"%"。

<span style="color:orange">注意：</span>用户的删除不会影响他们之前所创建的表、索引或其他数据库对象，因为 MySQL 并不会记录是谁创建了这些对象。

### &emsp;用户权限

如果新建了一个用户，那么它是没有任何权限的，可以使用`SHOW GRANT FOR 用户名;`来查看权限。USAGE ON*.* 表示该用户对任何数据库和任何表都没有权限。

#### &emsp;&emsp;授予权限

<span style="color:aqua">格式：</span>

```sql
GRANT 权限类型1 列名1,权限类型2 列名2...
ON 对象 权限级别 TO
用户名 IDENTIFIED BY PASSWORD 口令
 WITH GRANT OPTION
/ MAX_QUERIES_PER_HOUR 次数
/ MAX_UPDATES_PER_HOUR 次数
/ MAX_CONNECTIONS_PER_HOUR 次数
/ MAX_USER_CONNECTIONS 次数
```

列名是可选的，是单赋值给某一列，如果全部授予权限就不必要了。

权限级别是用于指定权限的级别。可以授予的权限有如下几组：

+ 列权限，和表中的一个具体列相关。例如，可以使用 UPDATE 语句更新表 students 中 student_name 列的值的权限。
+ 表权限，和一个具体表中的所有数据相关。例如，可以使用 SELECT 语句查询表 students 的所有数据的权限。
+ 数据库权限，和一个具体的数据库中的所有表相关。例如，可以在已有的数据库 mytest 中创建新表的权限。
+ 用户权限，和 MySQL 中所有的数据库相关。例如，可以删除已有的数据库或者创建一个新的数据库的权限。

对应地，在 GRANT 语句中可用于指定权限级别的值有以下几类格式：

+ *：表示当前数据库中的所有表。
+ *.*：表示所有数据库中的所有表。
+ db_name.*：表示某个数据库中的所有表，db_name 指定数据库名。
+ db_name.tbl_name：表示某个数据库中的某个表或视图，db_name 指定数据库名，tbl_name 指定表名或视图名。
+ tbl_name：表示某个表或视图，tbl_name 指定表名或视图名。
+ db_name.routine_name：表示某个数据库中的某个存储过程或函数，routine_name 指定存储过程名或函数名。
+ TO 子句：用来设定用户口令，以及指定被赋予权限的用户 user。若在 TO 子句中给系统中存在的用户指定口令，则新密码会将原密码覆盖；如果权限被授予给一个不存在的用户，MySQL 会自动执行一条 CREATE USER 语句来创建这个用户，但同时必须为该用户指定口令。

权限类型：

1. 授予数据库权限时，<权限类型>可以指定为以下值：
+ SELECT：表示授予用户可以使用 SELECT 语句访问特定数据库中所有表和视图的权限。
+ INSERT：表示授予用户可以使用 INSERT 语句向特定数据库中所有表添加数据行的权限。
+ DELETE：表示授予用户可以使用 DELETE 语句删除特定数据库中所有表的数据行的权限。
+ UPDATE：表示授予用户可以使用 UPDATE 语句更新特定数据库中所有数据表的值的权限。
+ REFERENCES：表示授予用户可以创建指向特定的数据库中的表外键的权限。
+ CREATE：表示授权用户可以使用 CREATE TABLE 语句在特定数据库中创建新表的权限。
+ ALTER：表示授予用户可以使用 ALTER TABLE 语句修改特定数据库中所有数据表的权限。
+ SHOW VIEW：表示授予用户可以查看特定数据库中已有视图的视图定义的权限。
+ CREATE ROUTINE：表示授予用户可以为特定的数据库创建存储过程和存储函数的权限。
+ ALTER ROUTINE：表示授予用户可以更新和删除数据库中已有的存储过程和存储函数的权限。
+ INDEX：表示授予用户可以在特定数据库中的所有数据表上定义和删除索引的权限。
+ DROP：表示授予用户可以删除特定数据库中所有表和视图的权限。
+ CREATE TEMPORARY TABLES：表示授予用户可以在特定数据库中创建临时表的权限。
+ CREATE VIEW：表示授予用户可以在特定数据库中创建新的视图的权限。
+ EXECUTE ROUTINE：表示授予用户可以调用特定数据库的存储过程和存储函数的权限。
+ LOCK TABLES：表示授予用户可以锁定特定数据库的已有数据表的权限。
+ ALL 或 ALL PRIVILEGES：表示以上所有权限。
2. 授予表权限时，<权限类型>可以指定为以下值：
+ SELECT：授予用户可以使用 SELECT 语句进行访问特定表的权限。
+ INSERT：授予用户可以使用 INSERT 语句向一个特定表中添加数据行的权限。
+ DELETE：授予用户可以使用 DELETE 语句从一个特定表中删除数据行的权限。
+ DROP：授予用户可以删除数据表的权限。
+ UPDATE：授予用户可以使用 UPDATE 语句更新特定数据表的权限。
+ ALTER：授予用户可以使用 ALTER TABLE 语句修改数据表的权限。
+ REFERENCES：授予用户可以创建一个外键来参照特定数据表的权限。
+ CREATE：授予用户可以使用特定的名字创建一个数据表的权限。
+ INDEX：授予用户可以在表上定义索引的权限。
+ ALL 或 ALL PRIVILEGES：所有的权限名。
3. 授予列权限时，<权限类型>的值只能指定为 SELECT、INSERT 和 UPDATE，同时权限的后面需要加上列名列表 column-list。
4. 最有效率的权限是用户权限。  
+ 授予用户权限时，<权限类型>除了可以指定为授予数据库权限时的所有值之外，还可以是下面这些值：  
+ CREATE USER：表示授予用户可以创建和删除新用户的权限。
+ SHOW DATABASES：表示授予用户可以使用 SHOW DATABASES 语句查看所有已有的数据库的定义的权限。

```sql
GRANT SELECT,INSERT ON *.*
TO 'testUser'@'localhost'
IDENTIFIED BY 'testPwd'
WITH GRANT OPTION;
```

#### &emsp;&emsp;删除权限

以使用 REVOKE 语句删除一个用户的权限，此用户不会被删除，两种<span style="color:aqua">格式：</span>

```sql
--第一种：--
REVOKE 权限类型1 列名1,权限类型2 列名2...
ON 对象类型 权限名 FROM 用户1, 用户2...
--第二种：--
REVOKE ALL PRIVILEGES, GRANT OPTION
FROM USER 用户1,用户2...
```

+ 第一种语法格式用于回收某些特定的权限。
+ 第二种语法格式用于回收特定用户的所有权限。
+ 要使用REVOKE语句，必须拥有MySQL数据库的全局CREATE USER权限或UPDATE权限。

如`REVOKE INSERT ON *.* FROM 'testUser'@'localhost';`

&emsp;

## 事务

数据库中事务是用户一系列的数据库操作序列，这些操作要么全做要么全不做，是一个不可分割的工作单位。

### &emsp;开始

<span style="color:aqua">格式：</span>`BEGIN TRANSACTION 事务名称 / @事务变量名称`

@事务变量名称是由用户定义的变量，必须用char、varchar、nchar或nvarchar数据类型来声明该变量。

BEGIN TRANSACTION语句的执行使全局变量`@@TRANCOUNT`的值加 1。这个变量是用来控制事务的顺序和流程的。

### &emsp;提交

COMMIT 表示提交事务，即提交事务的所有操作。具体地说，就是将事务中所有对数据库的更新写回到磁盘上的物理数据库中，事务正常结束。

提交事务，意味着将事务开始以来所执行的所有数据修改成为数据库的永久部分，因此也标志着一个事务的结束。一旦执行了该命令，将不能回滚事务。只有在所有修改都准备好提交给数据库时，才执行这一操作。

<span style="color:aqua">格式：</span>`COMMIT TRANSACTION 事务名称 / @事务变量名称`

COMMIT TRANSACTION语句的执行使全局变量`@@TRANCOUNT`的值减 1。

### &emsp;撤销

ROLLBACK 表示撤销事务，即在事务运行的过程中发生了某种故障，事务不能继续执行，系统将事务中对数据库的所有已完成的操作全部撤销，回滚到事务开始时的状态。这里的操作指对数据库的更新操作。

当事务执行过程中遇到错误时，使用 ROLLBACK TRANSACTION 语句使事务回滚到起点或指定的保持点处。同时，系统将清除自事务起点或到某个保存点所做的所有的数据修改，并且释放由事务控制的资源。因此，这条语句也标志着事务的结束。

<span style="color:aqua">格式：</span>`ROLLBACK TRANSACTION
事务名称 / @事务变量名称 / 存储点名称 / @含有存储点名称的变量名`，TRANSCATION关键字是可选的。

当条件回滚只影响事务的一部分时，事务不需要全部撤销已执行的操作。可以让事务回滚到指定位置，此时，需要在事务中设定保存点（SAVEPOINT）。保存点所在位置之前的事务语句不用回滚，即保存点之前的操作被视为有效的。保存点的创建通过`SAVING TRANSACTION 保存点名称`语句来实现，再执行`ROLLBACK TRANSACTION 保存点名称`语句回滚到该保存点。

若事务回滚到起点，则全局变量`@@TRANCOUNT`的值减 1；若事务回滚到指定的保存点，则全局变量`@@TRANCOUNT`的值不变。

```sql
--开启事务--
BEGIN TRANSACTION;
SELECT @orderNumber := max(orderNUmber)
FROM orders;
--将最大值加一--
SET @orderNumber = @orderNumber  + 1;
--插入数据--
INSERT INTO orders(orderNumber,
                   orderDate,
                   requiredDate,
                   shippedDate,
                   status,
                   customerNumber)
VALUES(@orderNumber,
       NOW(),
       DATE_ADD(NOW(), INTERVAL 5 DAY),
       DATE_ADD(NOW(), INTERVAL 2 DAY),
       'In Process',
        145);
INSERT INTO orderdetails(orderNumber,
                         productCode,
                         quantityOrdered,
                         priceEach,
                         orderLineNumber)
VALUES(@orderNumber,'S18_1749', 30, '136', 1),
      (@orderNumber,'S18_2248', 50, '55.09', 2);
--提交--
commit;
```

### &emsp;@@TRANCOUNT

这个变量是干嘛的？在处理事务的时候，一般都用ROLLBACK TRANSACTION来回滚，但是如果在嵌套事务中这样使用的话，就会出现错误。

在MySQL里，嵌套事务的层次是由@@TRANCOUNT全局变量反映出来的。每一次BEGIN都会引起@@TRANCOUNT加1。而每一次COMMIT都会使@@TRANCOUNT减1，而ROLLBACK会回滚所有的嵌套事务包括已经提交的事务和未提交的事务，而使@@TRANCOUNT置0。例如：

```terminal
BEGIN -- @@TranCount = 1
    BEGIN -- @@TranCount = 2
        BEGIN -- @@TranCount = 3
        COMMIT -- @@TranCount = 2
    COMMIT -- @@TranCount = 1
COMMIT -- @@TranCount = 0
```

&emsp;

## 表锁定

MySQL允许客户端会话明确获取表锁，以防止其他会话在特定时间段内访问表。客户端会话只能为自己获取或释放表锁。它不能获取或释放其他会话的表锁。

上锁<span style="color:aqua">格式：</span>`LOCK TABLES 表名 READ / WRITE;`

解锁<span style="color:aqua">格式：</span>`UNLOCK TABLES;`

读锁的作用：

+ 同时可以通过多个会话获取表的READ锁。此外，其他会话可以从表中读取数据，而无需获取锁定。
+ 持有READ锁的会话只能从表中读取数据，但不能写入。此外，其他会话在释放READ锁之前无法将数据写入表中。来自另一个会话的写操作将被放入等待状态，直到释放READ锁。
+ 如果会话正常或异常终止，MySQL将会隐式释放所有锁。这也与WRITE锁相关。

写锁的使用：

+ 只有拥有表锁定的会话才能从表读取和写入数据。
+ 在释放WRITE锁之前，其他会话不能从表中读写。
