---
layout: post
title:  "数组"
date:   2019-09-21 15:14:34 +0800
categories: notes java base
tags: Java 基础 数组 Arrays 
excerpt: "Arrays类"
---

Java中数组以`Arrays`类的实例来处理。可以通过`java.util`包中的`Arrays`类中的方法来处理数组对象。值得注意的是这个`Arrays`类是在`util`中的，证明它本身是一个工具包，所以`Arrays`是一个工具类，用来处理数组，而不是数组本身，在Java中数组本身就有定义，不需要新的构造函数来构造，这一点与字符串对象是不同的。

## 一维数组

### &emsp;1.创建一维数组

创建有两种方式：  

第一种方式：  

<span style="color:aqua">格式：</span>`数组元素类型[] 数组名;/数组元素类型 数组名[];（不推荐使用）` / `数组名 = new 数组元素类型[数组元素个数];`  

当使用new为数组分配内存时，整型数组种各个元素的初始值都是0。  
如：  

```java
int[] arr;
arr = new int[5];
```

第二种方式：  

<span style="color:aqua">格式：</span>`数组元素类型 数组名 = new 数组元素类型[数组元素个数];`

### &emsp;2.初始化一维数组

初始化有两种方式：  

<span style="color:aqua">格式：</span>`数组元素类型 数组名[] = {值序列};`

第一种是边创建数组对象边初始化，第二种是已经创立了数组对象再赋值。

### &emsp;3.使用一维数组

通过：数组名[下标]使用，一般使用循环。

&emsp;

## 二维数组

### &emsp;1.创建二维数组

创建有两种方式：

1. <span style="color:aqua">格式：</span>
`数组元素类型[][] 数组名;/数组元素类型 数组名[][];（不推荐使用）`  
`数组名 = new 数组元素类型[行元素个数][列元素个数];`

2. 为每一维数组分配空间。  
<span style="color:aqua">格式：</span>

`数组元素类型 数组名 = new 数组元素类型[][];`  

`数组名[0] = new 数组元素类型[行元素个数];`  

`数组名[1] = new 数组元素类型[列元素个数];`  

### &emsp;2.初始化二维数组

初始化有三种方式：

<span style="color:aqua">格式：</span>

1. 数组元素类型 数组名[] = new 数组元素类型[][]{值序列};  
2. 数组元素类型 数组名[][] = {值序列};  
第一种是边创建数组对象边初始化，第二种是已经创立了数组对象再赋值。
3. 数组名[行坐标][列坐标] = 数据；

&emsp;

## 数组操作

### &emsp;1.数组遍历

#### &emsp;&emsp;1.1循环

一般使用循环。可以通过数组对象的length属性获得数组长度。  

一维数组就使用一层循环，如果是n维数组就使用n层循环。  
如：  

{% raw %}

```java
public class Trap{
    public statci void main(String[] args){
        int b[][] = new int[][]{{1},{ 2,3 },{ 4,5,6 }};
        for(int k=0; k<b.length; k++){
            for(int c=0; c<b[k].length; c++){
                System.out.print(b[k][c]);
            }
            System.out.println();
        }
    }
}
>>>>>
1
23
456
```

{% endraw %}

也可以使用foreach语句循环输出：  

{% raw %}

```java
public class Main{ //创建类
    public static void main(String[] args){ //主方法
        int arr[][] = new int[][]{{ 4,3 },{ 2,1 }}; //定义数组对象
        System.out.println("数组中元素是：");
        int i = 0; //设置外层限制计数参数
        for(int x[]:arr){ //外层循环变量设置为arr[][]二维数组中的一维数组x[]；
            i++; //一维数组坐标加一
            int j = 0;
            for(int e:x){
                j++;
                if(i == arr.length && j == x.length){
                    System.out.print(e);
                }else
                    System.out.print(e+"、");
            }
            System.out.println();
        }
    }
}
```

{% endraw %}

### &emsp;2.替换元素

可以通过`Arrays`类的`fill()`静态方法。由于其方法本身的限制，所以一般用于给整个数组初始化同一个值。  

<span style="color:aqua">格式：</span>`Arrays.fill(数组名,同数组类型一致的数值);`

将数组元素全部替换为该数值。  

<span style="color:aqua">格式：</span>`Arrays.fill(数组名,开始填充元素索引,结束填充元素索引,同数组类型一致的数值);`

将数组部分替换这个值。

### &emsp;3.数组排序

可以通过`Arrays`类的`sort()`静态方法。是按照字典顺序进行升序排序。  

<span style="color:aqua">格式：</span>`Arrays.sort(数组名);`/`Arrays.sort(数组名,开始排序索引,结束排序索引);`

### &emsp;4.数组复制

<span style="color:aqua">格式：</span>`copyOf(复制目标数组，复制新数组的长度);` 

如果新数组长度小于原数组就进行截取，如果大于就使用0填充。  

`copyOfRange(复制目标数组，开始复制索引，结束复制索引);`  

结束复制索引可以大于数组长度，且结束索引复制不包括该索引所在数值。

### &emsp;5.数组查询

<span style="color:aqua">格式：</span>`binarySearch(搜索数组,搜索值);`

 `binarySearch()`使用二分法进行搜索。插入点是索引键将要插入数组的那一点，即第一个大于该键的元素的索引。一般使用为了方便需要先使用`sort()`方法排序。  

1. 搜索值是数组元素，从0开始计数，得搜索值的索引值；  

2. 搜索值不是数组元素，且在数组范围内，从1开始计数，得"-插入点索引值"；  

3. 搜索值不是数组元素，且大于数组内元素，索引值为–(length + 1);  

4. 搜索值不是数组元素，且小于数组内元素，索引值为–1。  

如：  

```java
int arr [] =newint[]{1,3,4,5,8,9};
Arrays.sort(arr);
int index1 = Arrays.binarySearch(arr,6);
int index2 = Arrays.binarySearch(arr,4);
int index3 = Arrays.binarySearch(arr,0);
int index4 = Arrays.binarySearch(arr,10);
System.out.println("index1 = "+ index1 +", index2 = " + index2 +
", index3 = " + index3 +", index4 = "+ index4);
>>>>>index1= -5, index2 = 2, index3 = -1, index4 = -7
```

<span style="color:aqua">格式：</span>`bianrySearch(搜索数组,开始搜索索引,结束搜索索引,要搜索的元素);`  

1. 该搜索键在范围内，且是数组元素，由0开始计数，得搜索值的索引值；  

2. 该搜索键在范围内，但不是数组元素，由1开始计数，得"-插入点索引值"；  

3. 该搜索键不在范围内，且小于范围（数组）内元素，返回–(fromIndex + 1)；  

4. 该搜索键不在范围内，且大于范围（数组）内元素，返回–(toIndex + 1)。  

如：

```java
int arr [] =newint[]{1,3,4,5,8,9};
System.out.println(arr.length+1);
Arrays.sort(arr);
int index5 = Arrays.binarySearch(arr,1, 4, 6);
int index6 = Arrays.binarySearch(arr,1, 4, 4);
int index7 = Arrays.binarySearch(arr,1, 4 ,2);
int index8 = Arrays.binarySearch(arr,1, 3, 10);
int index9 = Arrays.binarySearch(arr,1, 3, 0);
System.out.println("index5 = "+ index5 +", index6 = " + index6 +
 ", index7 = " + index7 +", index8 = "+ index8 +
", index9 = " + index9);
>>>>>index5 = -5, index6 = 2,index7 = -2, index8 = -4, index9 = -2
```
