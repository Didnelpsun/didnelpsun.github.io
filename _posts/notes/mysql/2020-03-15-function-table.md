---
layout: post
title:  "函数表"
date:   2020-03-14 12:00:00 +0800
categories: notes mysql other
tags: MySQL 其他 mysql
excerpt: "相关函数表"
---

因为字符串，时间，数字，类型转换，聚合，控制流相关函数之前就已经提到了，所以我们会先介绍一下其他函数

## 加密函数

+ AES_ENCRYPT(str,key);//返回使用密钥key对字符串str利用高级加密标准算法加密后的结果
+ AES_DECRYPT(str,key);    //返回使用密钥key对字符串str利用高级加密标准算法解密后的结果
+ DECODE(str,key);//使用key作为密钥解密加密字符串str
+ ENCRYPT(str,salt);//使用UNIX crypt()函数，用关键词salt加密字符串str
+ ENCODE(str,key);//使用key作为密钥加密字符串str
+ MD5();//计算字符串str的MD5校验和
+ PASSWORD(str);//返回字符串str的加密版本
+ SHA();//计算字符串str的安全散列算法(SHA)校验和

PASSWORD()函数用来创建一个经过加密的密码字符串，它适合于插入到MySQL的安全系统。这个加密过程是不可以逆转的， 和UNIX密码加密使用不同的算法

如果愿意的话，可以通过ENCRYPT()函数使用UNIX crypt()系统加密字符串，ENCRYPT()函数接收要加密的字符串 和(可选的)用于加密过程的salt(一个可以唯一确定口令的字符串，就像钥匙一样)。

还可以使用ENCODE()函数和DECODE()函数来加密和解密字符串，ENCODE()有两个参数:被加密的字符串和作为加密基础的密钥：

```sql
INSERT INTO users VALUES('','john',ENCODE('asdfasdf','secret_key'));
SELECT * FROM users;
SELECT id,uname,DECODE(upass,'secret_key') FROM users;
```

&emsp;

## 格式化函数

+ DATE_FORMAT(DATE类型值,格式字符串);//依照格式字符串格式化日期DATE类型值的值
+ FORMAT(x,y);//把x格式化为以逗号隔开的数字序列，y是结果的小数位数
+ INET_ATON(ip);//返回ip地址的数字表示
+ INET_NTOA(num);//返回数字所代表的ip地址
+ TIME_FORMAT(time,格式字符串);//依照格式字符串格式化时间TIME值

&emsp;

## 系统信息函数

+ DATABASE();//返回当前数据库名称
+ BENCHMARK(count,expr);//将表达式expr重复运行count次
+ CONNECTION_ID();//返回当前客户的连接id
+ FOUND_ROWS();//将最后一个select查询(没有以limit进行限制结果)返回的记录行数返回
+ GET_LOCK(str,dur);//获取一个由字符串str命名的并且有dur秒延时的锁定
+ IS_FREE_LOCK(str);//检查以str命名的锁定是否释放
+ LAST_INSERT_ID();//返回由该系统自动产生的最后一个auto increment id的值
+ MASTER_POS_WAIT(log,pos,dur);//锁定主服务器dur秒直到从服务器与主服务器的日志log指定的位置pos同步
+ RELEASE_LOCK(str);//释放由字符串str命名的锁定
+ USER() / SYSTEM_USER();//返回当前登录用户名
+ VERSION();//返回MySQL服务器的版本

&emsp;

## 数学函数

+ ABS(x);//返回x的绝对值
+ ACOS(x);//返回x(弧度)的反余弦值
+ ASIN(x);//返回x(弧度)的反正弦值
+ ATAN(x);//返回x(弧度)的反正切值
+ CEILING(x);//返回大于x的最小整数值
+ COS(x);//返回x(弧度)的余弦值
+ COT(x);//返回x(弧度)的余切
+ DEGREES(x);//返回弧度值x转化为角度的结果
+ EXP(x);//返回值e(自然对数的底)的x次方
+ FLOOR(x);//返回小于x的最大整数值
+ GREATEST(x1,x2,x3...);//返回集合中最大的值
+ LEAST(x1,x2,x3,,,);//返回集合中最小的值
+ LN(x);//返回x的自然对数
+ LOG(x,y);//返回x的以y为底的对数
+ MOD(x,y);//返回x/y的模(余数)
+ PI();//返回pi的值（圆周率）
+ POW(x,y)或者POWER(x,y);//返回x的y次幂
+ RAND();//返回0到1内的随机数
+ RADIANS(x);//返回角度x转化为弧度的结果
+ ROUND(x,y);//返回参数x的四舍五入的有y位小数的值
+ SIGN(x);//返回代表数字x的符号的值
+ SQRT(x);//返回x的开方
+ SIN(x);//返回x(弧度)的正弦值
+ TAN(x);返回x(弧度)的正切值
+ TRUNCATE(x,y);//返回数字x截短为y位小数的结果

&emsp;

## 聚合函数

+ AVG(列);//返回指定列的平均值
+ COUNT(列);//返回指定列中非null值的个数
+ MIN(列);//返回指定列的最小值
+ MAX(列);//返回指定列的最大值
+ SUM(列);//返回指定列的所有值之和
+ STD(列)或STDDEV(列);//返回指定列的所有值的标准偏差
+ VARIANCE(列);//返回指定列的所有值的标准方差
+ GROUP_CONCAT(列);//返回由属于一组的列值连接组合而成的结果

&emsp;

## 时间日期函数

&emsp;

## 字符串函数

+ LENGTH();//获取字符串长度
+ TRIM();//去除字符
+ CONCAT();//合并属性或者字符串

&emsp;

## 控制流函数

+ CASE;
+ IF();
+ IFNULL;
+ NULLIF;

&emsp;

## 类型转换函数

+ CAST();
+ CONVERT();
