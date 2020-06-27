---
layout: post
title:  "文件解析"
date:   2020-06-27 15:20:13 +0800
categories: notes java senior
tags: java 高级 文件 转换 excel
excerpt: "Java与不同格式文件的转换"
---

## Excel转Java

首先我们使用一个Maven来新建的quickstart项目。

然后如果我们要使用Excel文件，那么.xls格式的excel文件需要HSSF支持，需要相应的poi.jar，.xlsx格式的excel文件需要XSSF支持，需要poi-ooxml.jar。所以我们要在pom.xml文件中加入相应的依赖文件：

```xml
<!-- https://mvnrepository.com/artifact/org.apache.poi/poi -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>4.1.2</version>
</dependency>
<!-- https://mvnrepository.com/artifact/org.apache.poi/poi-ooxml -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>4.1.2</version>
</dependency>
```


