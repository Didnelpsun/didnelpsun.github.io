---
layout: post
title:  "引用与代码"
date:   2019-09-19 16:15:51 +0800
categories: notes markdown base
tags: Markdown 基础 引用 代码
excerpt: "引用与代码"
---

## 引用

一般：

```markdown
> 第一层引用
>> 第二层引用
>>> 第三层引用
```

引用列表：

```markdown
>区块中使用列表
>1. 第一项
>2. 第二项
>+ 第一项
>+ 第二项
>+ 第三项
```

列表中引用：

```markdown
* 第一项
    > 引用1
    > 引用2
* 第二项
```

&emsp;

## 代码

### &emsp;1. 使用单反引号

```markdown
`code`
```

### &emsp;2. 使用制表符或四个空格

```markdown
    var x =1;
    x+=1;
```

### &emsp;3. 使用三反引号

```markdown
` ` `使用的编程语言 （前面反引号中间都用空格隔开了，避免被编译，实际上是不会有中间的空格的）

code

` ` `
```
