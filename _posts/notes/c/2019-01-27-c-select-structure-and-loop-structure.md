---
layout: post
title:  "选择与循环结构"
date:   2019-01-27 13:44:33 +0800
categories: notes c base
tags: C 基础
excerpt: "选择与循环结构"
---

## 选择结构

### &emsp;1.关系运算符和关系表达式

关系运算符一共有六种，<小于、>大于、<=小于等于、>=大于等于、==等于、！=不等于。

前四种关系运算符优先级相等，且高于最后两种关系运算符。

关系表达式就是两个或以上数值或则和数值表达式连接起来的式子，其值为布尔值，只有01。

其运算顺序为由左到右。且需要优先级：d=a>b，由于a>b为真，所以d被赋值为1。

关系表达式不存在允许连等判断的情况，所以其一对表示式结束后判断的值只为10：f=a>b>c;假设a=6，b=4，c=3，所以按道理来说这样相比a最大，所以为真，f应该被赋值为1，但是请注意a>b为真，所以a>b的结果就是1，而1小于3，所以为假，f就是0。

### &emsp;2.逻辑运算符和逻辑表达式

逻辑运算符一共三种，&&与、\|\|或、!非。与和或都是二元运算符，而非是一元运算符，!的优先级最高，其次是与和或，由左向右。

逻辑值1为真，0为假，但是确认一个值是否为真则是判断是否非0。

在&&与判断时，如果第一个值为真才会判断第二个值，也就是说，如果第二个值为赋值语句且第一个为假时，那么第二个赋值语句就不执行。

同样\|\|或判断时，如果第一个值就是真，那么不会再执行后面的表达式。

### &emsp;3.条件运算符和条件表达式

可以用来替代后面简单的if else语句。

<span style="color:aqua">格式：</span>`表达式1?表达式2:表达式3;`

判断表达式1是否为真，是真就执行表达式2，假就执行表达式3。

由于条件运算符优先于赋值运算符，所以可以使用：`变量名 = 表达式1?变量2:变量3;`

### &emsp;4.if语句

如果if语句后的表达式为真就执行后面的语句。如果假就不执行或者执行if else或者else语句。

<span style="color:aqua">格式：</span>

```c
①if(表达式) 执行语句
②
if(表达式) 
    执行语句1
else
    执行语句2
③
if(表达式1)
    执行语句1
elseif(表达式2)
    执行语句2
...
else
    执行语句n
```

if语句可以多层嵌套使用。
if判断表达式后不能加分号，除非执行语句为空，需要在执行语句后加分号。
如果if执行语句只有一条，可以不使用花括号，否则需要使用花括号来分明层次与逻辑。
在if语句的嵌套中要注意if和else的配对关系，else总是与它上面的最近的未配对的if配对。如果想单独配对则需要使用花括号表名层次。

### &emsp;5.switch语句

<span style="color:aqua">格式：</span>

```c
swtich(表达式)
{
    case 常量1：
        语句块1
        (break;)
    ...
    case 常量n：
        语句块n
        (break;)
    default:
        语句块n+1
        (break;)
}
```

表达式只能为整数类型和字符型。如果没有default语句而其他条件都不符合则swtich语句不执行，如果没有break就接着判断。case后的执行语句可以不用花括号。

&emsp;

## 循环结构

### &emsp;1.while语句

<span style="color:aqua">格式：</span>

```c
while(条件）{
    语句块
}
```

当条件为真，执行，再返回判断。

<span style="color:aqua">格式：</span>

```c
do{
    语句块
}
while(条件);
```

首先执行语句再判断，若真再执行，所以语句至少执行一次。且结尾多一个分号。

### &emsp;2.for语句

<span style="color:aqua">格式：</span>

```c
for(初始化值;循环条件;修整变量){
    语句块
}
```

### &emsp;3.break语句

在swtich语句中break可以跳出分支，在循环结构中break也可以中断循环。

<span style="color:aqua">格式：</span>`break;`

但是如果是多层循环，那么它仅能跳出该层循环。

如果需要指定跳出的循环，可以使用标签。

<span style="color:aqua">格式：</span>

```c
标签名:for(){
    ...
    break 标签名;
}
```

### &emsp;4.continue语句

<span style="color:aqua">格式：</span>`continue;`

不是立刻跳出循环体，而是跳出本次循环进行循环体下一个循环。

在for循环中遇到continue首先执行for语句中的增量部分，再进行条件测试。

而while语句中直接回到条件测试部分。

如果需要指定跳出的循环，也可以使用标签。

<span style="color:aqua">格式：</span>

```c
标签名:for(){
    ...
    continue 标签名;
}
```

### &emsp;5.goto语句

允许把控制无条件转移到同一函数内的被标记的语句。

<span style="color:aqua">格式：</span>

```c
goto 标签;
...
标签: 执行语句;
```

```c
#include <stdio.h>
int main ()
{
 /* 局部变量定义 */
    int a = 10;
    /* do 循环执行 */
    LOOP:do
    {
        if( a == 15)
        {/* 跳过迭代 */a = a + 1;
            goto LOOP;
        }
    printf("a 的值： %d\n", a);
    a++;
    }while( a < 20 );
    return 0;
}
```

### &emsp;6.return关键字

return表示从被调函数返回到主调函数继续执行，返回时可附带一个返回值，返回值可以是一个常量，变量，或是表达式。返回值可以为各种数据类型，如：int，float，double，char，a\[]（数组），*a（指针），结构或类（c++）

返回类型规定了return后面所加的量的类型，如果返回类型声明为void，则不需要返回值。

在函数中， 如果碰到return语句，那么程序就会返回调用该函数的下一条语句执行，也就是说跳出函数的执行，回到原来的地方继续执行下去。但是如果是在主函数中碰到return语句，那么整个程序就会停止，退出程序的执行。

### &emsp;7.循环打印图形

直角三角形(靠右直立)：

```c
int i,j;
    for (i=0; i<6; i++) {
        for (j=6;j>i ;j-- ) {
        printf("");
    }
    for (j=0; j<=i; j++) {
        printf("*");
    }
    printf("\n");
}
```

等腰三角形（直立）：

```c
int i,j;
for (i=0; i<6; i++) {
    for (j=6; j>i; j--) {
        printf(" ");
    }
    for (j=0; j<2*i+1;j++) {
        printf("*");
    }
    printf("\n");
}
```

倒立的等腰三角形：

```c
int i,j;
for (i=0; i<6; i++) {
    for (j=0; j<i; j++) {
        printf(" ");
    }
    for (j=0; j<11-2*i;j++) {
        printf("*");
    }
    printf("\n");
}
```

菱形：

```c
int i,j,k;
for(i=1;i<=5;i++){
    for(j=6;j>i;j--){
        printf(" ");
    }
    for(k=1;k<=2*i-1;k++){
        printf("*");
    }
    printf("\n");
}
for(i=1;i<=6;i++){
    for(j=1;j<=i-1;j++){
        printf(" ");
    }
    for(k=1;k<=13-2*i;k++){
        printf("*");
    }
    printf("\n");
}
```

空心三角形：

```c
int i,j;
for (i=0; i<5; i++) {
    for (j=5; j>i; j--) {//空格和上面一样输出
        printf(" ");
    }
    for (j=0; j<2*i+1;j++ ) {
        if (j==0||j==2*i||i==0||i==4) { //    *在第一行和最后一行正常输出，其余行只输出首和尾
            printf("*");
        }else{
            printf(" ");
        }
    }
    printf("\n");
}
```

空心菱形：

```c
int i,j;
for (i=0; i<4; i++) {
    for (j=3;j>i ; j--) {
        printf(" ");
    }
    for (j=0; j<2*i+1; j++) {
        if (j==0||j==2*i) {
            printf("*");
        }else{
            printf(" ");
        }
    }
    printf("\n");
}
for (i=0; i<4; i++) {
    for (j=0; j<i; j++) {
        printf(" ");
    }
    for (j=0;j<7-2*i; j++) {
        if (j==0||j==6-2*i) {
            printf("*");
        }else {
            printf(" ");
        }
    }
    printf("\n");
}
```

树形：

```c
int i,j;
for (i=0; i<3; i++) {
    for (j=4;j>i ; j--) {
        printf(" ");
    }
    for (j=0; j<2*i+1; j++) {
        printf("*");
    }
    printf("\n");
}
for (i=0; i<4; i++) {
    for (j=4; j>i; j--) {
        printf(" ");
    }
    for (j=0; j<2*i+1; j++) {
        printf("*");
    }
    printf("\n");
}
for (i=0; i<5; i++) {
    for (j=4; j>i; j--) {
        printf(" ");
    }
    for (j=0; j<2*i+1; j++) {
        printf("*");
    }
    printf("\n");
}
for (i=0; i<5; i++) {
    for(j=0;j<3;j++){
        printf(" ");
    }
    for (j=0; j<3;j++ ) {
        printf("*");
    }
    printf("\n");
}
for (i=0; i<2; i++) {
    for (j=0; j<10; j++) {
        printf("*");
    }
    printf("\n");
}
```
