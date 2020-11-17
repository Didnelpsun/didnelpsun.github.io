---
layout: post
title:  "数据类型（4）"
date:   2020-03-08 16:39:17 +0800
categories: notes mysql base
tags: MySQL 基础 mysql 
excerpt: "类型转换与空间、JSON"
---

## 类型转换

`cast()`和`convert()`是用来做类型转换的。

<span style="color:aqua">格式：</span>`CAST(值 AS 类型)` / `CONVERT(值,类型)`

可以转换的类型是有限制的。这个类型可以是以下值其中的一个：

+ 二进制，同带binary前缀的效果 : BINARY
+ 字符型，可带参数 : CHAR()
+ 日期 : DATE
+ 时间: TIME
+ 日期时间型 : DATETIME
+ 浮点数 : DECIMAL
+ 整数 : SIGNED
+ 无符号整数 : UNSIGNED

如`SELECT CAST('3.23' AS SIGNED);`

&emsp;

## 空间数据类型

字符串类型|描述
:-------:|:--:
GEOMETRY|任何类型的空间值
POINT|一个点(一对X-Y坐标)
LINESTRING|曲线(一个或多个POINT值)
POLYGON|多边形
GEOMETRYCOLLECTION|GEOMETRY值的集合
MULTILINESTRING|LINESTRING值的集合
MULTIPOINT|POINT值的集合
MULTIPOLYGON|POLYGON值的集合

这些都是为了处理一些数学科学类问题而出现的，一般的处理并不会用到。

## JSON

JSON文档的存储大约与存储LONGBLOB或LONGTEXT数据量相同。

<span style="color:aqua">格式：</span>`JSON属性列名 JSON`

<span style="color:orange">注意：</span>JSON列不能有默认值。 JSON列不能直接编入索引。但是可以在包含从JSON列中提取的值的生成列上创建索引。当从JSON列查询数据时，MySQL优化器将在匹配JSON表达式的虚拟列上查找兼容的索引。

MySQL JSON数据类型示例假设跟踪访客在网站上的行为。 一些访问者可能只是查看页面，而其他访问者可能会查看页面并购买产品。 要存储这些信息，我们将创建一个名为events的新表。
USE testdb;
CREATE TABLE events( 
  id int auto_increment primary key, 
  event_name varchar(255), 
  visitor varchar(255), 
  properties json, 
  browser json
);
SQL
事件表中的每个事件都有一个唯一标识事件的id。事件还有一个event_name列，例如浏览量，购买等。visitor列用于存储访问者信息。
properties和browser列是JSON类型。 它们用于存储访问者浏览网站的事件属性和浏览器信息(如版本，名称等等)。
我们将一些数据插入到events表中：
INSERT INTO events(event_name, visitor,properties, browser) 
VALUES (
  'pageview', 
   '1',
   '{ "page": "/" }',
   '{ "name": "Safari", "os": "Mac", "resolution": { "x": 1920, "y": 1080 } }'
),
('pageview', 
  '2',
  '{ "page": "/contact" }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 2560, "y": 1600 } }'
),
(
  'pageview', 
  '1',
  '{ "page": "/products" }',
  '{ "name": "Safari", "os": "Mac", "resolution": { "x": 1920, "y": 1080 } }'
),
(
  'purchase', 
   '3',
  '{ "amount": 200 }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1600, "y": 900 } }'
),
(
  'purchase', 
   '4',
  '{ "amount": 150 }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1280, "y": 800 } }'
),
(
  'purchase', 
  '4',
  '{ "amount": 500 }',
  '{ "name": "Chrome", "os": "Windows", "resolution": { "x": 1680, "y": 1050 } }'
);
SQL
要从JSON列中引出值，可以使用列路径运算符(->)。
SELECT id, browser->'$.name' browser FROM events;

