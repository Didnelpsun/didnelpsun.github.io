---
layout: post
title:  "存储过程与函数"
date:   2020-03-11 20:03:06 +0800
categories: notes mysql base
tags: MySQL 基础 mysql 存储过程 函数
excerpt: "存储过程与自定义函数"
---

## 存储过程

存储过程是对于一套语句的集合，为了解决一套问题。

使用存储过程的目的是将常用或复杂的工作预先用 SQL 语句写好并用一个指定名称存储起来，这个过程经编译和优化后存储在数据库服务器中，因此称为存储过程。当以后需要数据库提供与已定义好的存储过程的功能相同的服务时，只需调用"CALL存储过程名字"即可自动完成。

常用操作数据库的 SQL 语句在执行的时候需要先编译，然后执行。存储过程则采用另一种方式来执行 SQL 语句。

一个存储过程是一个可编程的函数，它在数据库中创建并保存，一般由 SQL 语句和一些特殊的控制结构组成。当希望在不同的应用程序或平台上执行相同的特定功能时，存储过程尤为合适。

存储过程通常有如下优点：  

1) 封装性  
存储过程被创建后，可以在程序中被多次调用，而不必重新编写该存储过程的 SQL 语句，并且数据库专业人员可以随时对存储过程进行修改，而不会影响到调用它的应用程序源代码。  
2) 可增强 SQL 语句的功能和灵活性  
存储过程可以用流程控制语句编写，有很强的灵活性，可以完成复杂的判断和较复杂的运算。  
3) 可减少网络流量  
由于存储过程是在服务器端运行的，且执行速度快，因此当客户计算机上调用该存储过程时，网络中传送的只是该调用语句，从而可降低网络负载。  
4) 高性能  
存储过程执行一次后，产生的二进制代码就驻留在缓冲区，在以后的调用中，只需要从缓冲区中执行二进制代码即可，从而提高了系统的效率和性能。  
5) 提高数据库的安全性和数据的完整性  
使用存储过程可以完成所有数据库操作，并且可以通过编程的方式控制数据库信息访问的权限。

### &emsp;1. 创建

#### &emsp;&emsp;1.1格式

使用`CREATE PROCEDURE`<span style="color:aqua">格式：</span>

```sql
CREATE PROCEDURE 过程名 (IN / OUT / INOUT 参数名 类型...) 
过程体
```

1. 过程名  
存储过程的名称，默认在当前数据库中创建。若需要在特定数据库中创建存储过程，则要在名称前面加上数据库的名称，即 db_name.sp_name。需要注意的是，名称应当尽量避免选取与 MySQL 内置函数相同的名称，否则会发生错误。  

2. 过程参数  
存储过程的参数列表。其中，参数名为参数名字，类型为参数的类型（可以是任何有效的 MySQL 数据类型）。当有多个参数时，参数列表中彼此间用逗号分隔。存储过程可以没有参数（此时存储过程的名称后仍需加上一对括号），也可以有 1 个或多个参数。  
MySQL 存储过程支持三种类型的参数，即输入参数、输出参数和输入/输出参数，分别用`IN`、`OUT`和`INOUT`三个关键字标识。其中，输入参数可以传递给一个存储过程，输出参数用于存储过程需要返回一个操作结果的情形，而输入/输出参数既可以充当输入参数也可以充当输出参数。需要注意的是，参数的取名不要与数据表的列名相同，否则尽管不会返回出错信息，但是存储过程的 SQL 语句会将参数名看作列名，从而引发不可预知的结果。  

3. 过程体  
存储过程的主体部分，也称为存储过程体，包含在过程调用的时候必须执行的 SQL 语句。这个部分以关键字`BEGIN`开始，以关键字`END`结束。若存储过程体中只有一条SQL语句，则可以省略 BEGIN-END 标志。

#### &emsp;&emsp;1.2DELIMITER命令

在MySQL中，服务器处理SQL语句默认是以分号作为语句结束标志的。然而，在创建存储过程时，存储过程体可能包含有多条SQL语句，这些SQL语句如果仍以分号作为语句结束符，那么MySQL服务器在处理时会以遇到的第一条 SQL 语句结尾处的分号作为整个程序的结束符，而不再去处理存储过程体中后面的SQL语句，这样显然不行。为解决这个问题，通常可使用 DELIMITER 命令将结束命令修改为其他字符。

<span style="color:aqua">格式：</span>`DELIMITER 用户定义的结束符` 用户定义结束符号可以是一些特殊的符号，如两个"?"或两个"￥"等。应该避免使用反斜杠"\"字符，因为它是 MySQL 的转义字符。

```sql
--无参数--
DELIMITER //
CREATE PROCEDURE ShowStudentScore()
BEGIN
SELECT * FROM tb_students_score;
END //
--有参数--
DELIMITER //
CREATE PROCEDURE GetScoreByStudent
--输入参数name--
(IN name VARCHAR(30))
BEGIN
SELECT student_score FROM tb_students_score
WHERE student_name=name;
END //
```

### &emsp;2. 查看

可以使用`SHOW PROCEDURE STATUS`命令查看数据库中存在哪些存储过程，若要查看某个存储过程的具体信息，则可以使用 `SHOW CREATE PROCEDURE 存储过程名`。

### &emsp;3. 修改

通过`ALTER PROCEDURE`语句来修改，<span style="color:aqua">格式：</span>`ALTER PROCEDURE 存储过程名 特征...`

特征有：

+ CONTAINS SQL 表示子程序包含 SQL 语句，但不包含读或写数据的语句。
+ NO SQL 表示子程序中不包含 SQL 语句。
+ READS SQL DATA 表示子程序中包含读数据的语句。
+ MODIFIES SQL DATA 表示子程序中包含写数据的语句。
+ SQL SECURITY  DEFINER / INVOKER 指明谁有权限来执行。
+ DEFINER 表示只有定义者自己才能够执行。
+ INVOKER 表示调用者可以执行。
+ COMMENT 'string' 表示注释信息。

`ALTER PROCEDURE showstuscore MODIFIES SQL DATA SQL SECURITY INVOKER;`将访问数据的权限已经变成了 MODIFIES SQL DATA，安全类型也变成了 INVOKE。

对于要修改存储过程的内容或者名字，只能直接删除原有的而再创建新的存储过程。

### &emsp;4. 删除

`DROP PROCEDURE IF EXISTS 过程名`

&emsp;

## 自定义函数

在使用 MySQL 的过程中，MySQL 自带的函数可能完成不了我们的业务需求，这时候就需要自定义函数。

自定义函数是一种与存储过程十分相似的过程式数据库对象。它与存储过程一样，都是由 SQL 语句和过程式语句组成的代码片段，并且可以被应用程序和其他 SQL 语句调用。

自定义函数与存储过程之间存在几点区别：

+ 自定义函数不能拥有输出参数，这是因为自定义函数自身就是输出参数；而存储过程可以拥有输出参数。
+ 自定义函数中必须包含一条 RETURN 语句，而这条特殊的 SQL 语句不允许包含于存储过程中。
+ 可以直接对自定义函数进行调用而不需要使用 CALL 语句，而对存储过程的调用需要使用 CALL 语句。

### &emsp;创建与使用

一般使用`CREATE FUNCTION`，<span style="color:aqua">格式：</span>

```sql
CREATE FUNCTION 函数名 (参数1 类型1, 参数2 类型2...)
RETURNS 类型
函数主体
```

```sql
CREATE FUNCTION StudentNameById()
RETURNS VARCHAR(10)
RETURN
(SELECT name FROM tb_students_info
WHERE id=1);
```

+ 自定义函数不能与存储过程具有相同的名称。
+ 参数只有名称和类型，不能指定关键字 IN、OUT 和 INOUT。
+ RETURNS 类型 用于声明自定义函数返回值的数据类型。其中，类型用于指定返回值的数据类型。
+ 函数体。所有在存储过程中使用的 SQL 语句在自定义函数函数体中同样适用，包括前面所介绍的局部变量、SET 语句、流程控制语句、游标等。除此之外，自定义函数体还必须包含一个 RETURN 值 语句，其中 值 用于指定自定义函数的返回值。
+ 在 RETURN VALUE 语句中包含 SELECT 语句时，SELECT 语句的返回结果只能是一行且只能有一列值。

功创建自定义函数后，就可以如同调用系统内置函数一样，使用关键字`SELECT`调用用户自定义的函数，<span style="color:aqua">格式：</span>`SELECT 自定义函数名(参数...)`。如上个函数的调用：`SELECT StudentNameById();`

### &emsp;查看

若要查看数据库中存在哪些自定义函数，可以使用 `SHOW FUNCTION STATUS` 语句；若要查看数据库中某个具体的自定义函数，可以使用 `SHOW CREATE FUNCTION 函数名` 语句，其中<函数名>用于指定该自定义函数的名称。

### &emsp;修改

和存储过程一样，只能更改特征<span style="color:aqua">格式：</span>`ALTER FUNCTION 自定义函数名 特征...`。而对于内容的修改就只能删除再重新定义。

### &emsp;删除

<span style="color:aqua">格式：</span>`DROP FUNCTION IF EXISTS 自定义函数名;`
