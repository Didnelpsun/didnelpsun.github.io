---
layout: post
title:  "流程控制"
date:   2019-09-13 08:36:41 +0800
categories: notes java base
tags: java 基础 if else switch case while for foreach break continue return
excerpt: "条件分支、循环与控制"
---

## 条件语句

### &emsp;1. if语句

<span style="color:aqua">格式：</span>

1. if(条件)语句（单句）  

2. if(条件){语句块}  

3. if(条件){语句块1}  
else{语句块2};

4. if(条件1){语句块1}  
else if(条件2){语句块2};  
……  
else if(条件n){语句块n};  

5. if(条件1){语句块1}  
else if(条件2){语句块2};  
……  
else{语句块n};  

### &emsp;2. switch语句

<span style="color:aqua">格式：</span>

```java
swtich(表达式)  
{  
    case 常量1：  
        语句块1  
        (break;)  
    ……  
    case 常量n：  
        语句块n  
        (break;)  
    default:  
        语句块n+1  
        (break;)  
}
```

switch中表达式的值何常量必须为整型字符型或字符串类型，不可为实数，如3.51。switch语句首先计算表达式的值，如果该值与某个case后的常量值相等，则执行该case后的语句块，直到break。default是可选的，如果都不符合且没有default，那么switch不做处理。
case的值必须不同。

&emsp;

## 循环语句

### &emsp;1. while语句

<span style="color:aqua">格式：</span>

```java
while(条件）{  
语句块  
}  
```

当条件为真，执行，再返回判断。  

<span style="color:aqua">格式：</span>

```java
do{  
语句块  
}  
while(条件);  
```

首先执行语句再判断，若真再执行，所以语句至少执行一次。且结尾多一个分号。

### &emsp;2. for语句

<span style="color:aqua">格式：</span>

```java
for( 初始化值 ; 循环条件 ; 修整变量 ){  
    语句块  
}
```

### 3. foreach语句

<span style="color:aqua">格式：</span>

```java
for( 元素变量 x : 遍历对象 obj ){  
引用了x的Java语句  
}  
```

x仅仅是一个代用的变量，不用初始化用来遍历对象，如Javascript的forin语句。
如：  

```java
public class Pepetition{
    public static void main(String[] args){
        int arr[] = {7,10,1};
        System.out.println("一维数组中的元素为");
        for(int x:arr){
            System.out.println(x);
        }
    }
}
```

&emsp;

## 循环控制

### &emsp;1. break语句

在swtich语句中break可以跳出分支，在循环结构中break也可以中断循环。  

<span style="color:aqua">格式：</span>`break;`  

但是如果是多层循环，那么它仅能跳出该层循环。

如果需要指定跳出的循环，可以使用标签。  

<span style="color:aqua">格式：</span>

```java
标签名:for(){  
……  
break 标签名;  
}  
```

如：

```java
public class BreakOutsideNested{
    public static void main(String[] args){
    Loop:for(int i=0;i<3;i++){
            for(int j=0;j<6;j++){
                if(j==4){
                    break Loop;
                }
                System.out.println("i="+i+" j="+j);
            }
        }
    }
}
>>>>>
i=0 j=0
i=0 j=1
i=0 j=2
i=0 j=3
```

### &emsp;2. continue语句

<span style="color:aqua">格式：</span>`continue;`  

不是立刻跳出循环体，而是跳出本次循环进行循环体下一个循环。在for循环中遇到continue首先执行for语句中的增量部分，再进行条件测试。而while语句中直接回到条件测试部分。  

如果需要指定跳出的循环，也可以使用标签。  

<span style="color:aqua">格式：</span>

```java
标签名:for(){  
……  
continue 标签名;  
}  
```

&emsp;

## 无条件分支（return关键字）

return语句作为一个无条件的分支，无需判断条件即可发生。return语句主要有两个用途:一方面用来表示一个方法返回的值（假定没有void返回值），另一方面是指它导致该方法退出，并返回那个值。根据方法的定义，每一个方法都有返回类型，该类型可以是基本类型，也可以是对象类型，同时每个方法都必须有个结束标志，因此，return起到了这个作用。在返回类型为void的方法里面，有个隐含的return语句，因此，在void方法里面可以省略不写。
