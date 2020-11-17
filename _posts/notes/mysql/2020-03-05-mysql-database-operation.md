---
layout: post
title:  "数据库操作"
date:   2020-03-05 10:12:45 +0800
categories: notes mysql base
tags: MySQL 基础 mysql 数据库 创建 修改 删除 导入 导出 OUTFILE
excerpt: "数据库基础操作"
---

因为许多基本语法都在[SQL教程]({{ site_url }}/notes/sql)中介绍过，所以后面都将介绍MySQL独特的语法。

## 创建数据库

<span style="color:aqua">格式：</span>`CREATE DATABASE IF NOT EXISTS 数据库名 DEFAULT CHARSET 编码字符集 DEFAULT COLLATE 校对规则;`

其中两个DEFAULT是可有可无的。

如：`CREATE DATABASE IF NOT EXISTS yiibaidb DEFAULT CHARSET utf8 COLLATE utf8_general_ci;`

&emsp;

## 修改数据库

<span style="color:aqua">格式：</span>`ALTER DATABASE 数据库名 DEFAULT CHARACTER SET 字符集名 DEFAULT COLLATE 校对规则名;`

如果已经选定了默认数据库，就不用写数据库名。

&emsp;

## 删除数据库

<span style="color:aqua">格式：</span>`DROP DATABASE IF EXISTS 数据库名;`

<span style="color:orange">注意：</span>MySQL 安装后，系统会自动创建名为 information_schema 和 mysql 的两个系统数据库，系统数据库存放一些和数据库相关的信息，如果删除了这两个数据库，MySQL 将不能正常工作。

&emsp;

## 导入数据库数据

首先`USE 数据库名;`然后使用`SOURSE SQL数据文件所在地址;`

或者使用`LOAD DATA INFILE SQL数据文件所在地址;`

如果不使用USE关键字，也可以在后面加上INTO TABLE。

```sql
LOAD DATA INFILE 'F:/worksp/mysql/discounts.csv' 
INTO TABLE discounts 
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

文件的字段由FIELD TERMINATED BY ','指示的逗号终止，并由ENCLOSED BY '"'指定的双引号括起来。因为文件第一行包含列标题，列标题不需要导入到表中，因此通过指定IGNORE 1 ROWS选项来忽略第一行。

当您在LOAD DATA INFILE中使用LOCAL选项时，即`LOAD DATA LOCAL INFILE`客户端程序会读取客户端上的文件并将其发送到MySQL服务器。该文件将被上传到数据库服务器操作系统的临时文件夹。

&emsp;

## 导出数据库数据

最简单的<span style="color:aqua">格式：</span>`SELECT 选择的属性 FROM 数据库.数据表 INTO OUTFILE 地址和文件名;`

```sql
SELECT 
    orderNumber, status, orderDate, requiredDate, comments
FROM
    orders
WHERE
    status = 'Cancelled'
INTO OUTFILE 'F:/worksp/mysql/cancelled_orders.csv'
FIELDS ENCLOSED BY '"'
TERMINATED BY ';'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n';
```

该语句在F:/worksp/mysql/目录下创建一个包含结果集，名称为cancelled_orders.csv的CSV文件。

CSV文件包含结果集中的行集合。每行由一个回车序列和由LINES TERMINATED BY '\r\n'子句指定的换行字符终止。文件中的每行包含表的结果集的每一行记录。

每个值由FIELDS ENCLOSED BY '"'子句指示的双引号括起来。 这样可以防止可能包含逗号(，)的值被解释为字段分隔符。 当用双引号括住这些值时，该值中的逗号不会被识别为字段分隔符。



