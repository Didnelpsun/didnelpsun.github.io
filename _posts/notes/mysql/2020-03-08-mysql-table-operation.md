---
layout: post
title:  "表操作"
date:   2020-03-08 17:02:00 +0800
categories: notes mysql base
tags: MySQL 基础 mysql 表 创建 修改 删除 主键 外键 约束
excerpt: "表操作与约束"
---

## 创建表

<span style="color:aqua">格式：</span>`CREATE TABLE 表名(列1 数据类型 约束,列2 数据类型 约束...)`

&emsp;

## 修改表

### &emsp;1. 添加字段

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD 新字段名 数据类型 约束条件;`

在MySQL中还有独特的语法：`ALTER TABLE 表名 ADD 新字段名 数据类型 约束条件 [FIRST|AFTER 已存在的字段名];`

FIRST 为可选参数，其作用是将新添加的字段设置为表的第一个字段；AFTER 为可选参数，其作用是将新添加的字段添加到指定的已存在的字段名的后面。

### &emsp;2. 修改字段数据类型

要使用到MySQL的独特的MODIFY关键字，<span style="color:aqua">格式：</span>`ALTER TABLE 表名 MODIFY 字段名 数据类型;`

### &emsp;3. 删除字段

<span style="color:aqua">格式：</span>`ALTER TABLE 表名 DROP 字段名;`

### &emsp;4. 修改字段名称

使用CHANGE关键字，<span style="color:aqua">格式：</span>`ALTER TABLE 表名 CHANGE 旧字段名 新字段名 新数据类型;`

### &emsp;5. 修改表名

<span style="color:aqua">格式：</span>·ALTER TABLE 旧表名 RENAME TO 新表名;`TO也可以不写。

还有一种<span style="color:aqua">格式：</span>`RENAME TABLE 表名1 TO 新表名1,表名2 TO 新表名2...;`

这种方式也可以修改视图名甚至数据库名。

&emsp;

## 删除表

<span style="color:aqua">格式：</span>`DROP TABLE IF EXISTS 表1,表2...;`

&emsp;

## 主键

添加主键<span style="color:aqua">格式：</span>`属性名 数据类型 PRIMARY KEY 默认值` / `CONSTRANINT 约束名 PRIMARY KEY 属性名` / `PRIMARY KEY 属性名`

复合主键<span style="color:aqua">格式：</span>`PRIMARY KEY 属性1,属性2...`

添加主键约束<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD PRIMARY KEY(列名);`

删除主键<span style="color:aqua">格式：</span>`ALTER TABLE 表名 DROP PRIMARY KEY;`

&emsp;

## 外键

添加外键<span style="color:aqua">格式：</span>`FOREIGN KEY 属性1,属性2... REFERENCES 参照表名 参照属性1,参照属性2...` / `CONSTRANINT 外键名 FOREIGN KEY 属性1,属性2... REFERENCES 参照表名(参照属性1,参照属性2...)`

修改外键<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD CONSTAINT 索引名 FOREIGN KEY(属性1,属性2...) REFERENCES 参照表名(参照属性1,参照属性2...)`

删除外键<span style="color:aqua">格式：</span>`ALTER TABLE 表名 DROP FOREIGN KEY 外键约束名;`

&emsp;

## 约束

约束与[SQL语法]({{ site_url }}/notes/sql)一致，包括UNIQUE、NOT NULL、DEFAULT

如果检查约束，使用`CHECK(约束检查)`。如：

```sql
CREATE TABLE test
(
    id INT(11) PRIMARY KEY,
    name VARCHAR(25),
    deptId INT(11),
    salary FLOAT,
    CHECK(salary>0 AND salary<100),
    FOREIGN KEY(deptId) REFERENCES tb_dept1(id)
);
```

修改检查约束<span style="color:aqua">格式：</span>`ALTER TABLE 表名 ADD CONSTRAINT 检查约束名 CHECK(检查约束)`

删除检查约束<span style="color:aqua">格式：</span>`ALTER TABLE 表名 DROP CONSTRAINT 检查约束名;`
