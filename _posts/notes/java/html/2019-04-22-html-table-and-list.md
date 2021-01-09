---
layout: post
title:  "表格与列表"
date:   2019-04-22 10:19:13 +0800
categories: notes html base
tags: HTML 基础 table border th headers scope colspan rowspan tr td caption colgroup span col thead tbody tfoot cellpadding ul ol reversed dl
excerpt: "表格以及列表标签属性"
---

## 表格

### &emsp;1. \<table>标签

表格由 `<table>` 标签来定义。每个表格均有若干行（由 `<tr>` 标签定义），每行被分割为若干单元格（由 `<td>` 标签定义）。字母 td 指表格数据（table data），即数据单元格的内容。数据单元格可以包含文本、图片、列表、段落、表单、水平线、表格等等。

#### &emsp;&emsp;1.1 border属性

border 属性规定表格单元周围是否显示边框。且只允许属性值 "" 或 "1"。（无和有）  
值 "1" 指示应该显示边框，且表格不用于布局目的。

<span style="color:aqua">格式：</span>`<table border="1"></table>`

### &emsp;2. \<th>标签

`<th>` 标签定义 HTML 表格中的表头单元格。

HTML 表格有两种单元格类型：  
表头单元格 - 包含头部信息（由 `<th>` 元素创建）  
标准单元格 - 包含数据（由 `<td>` 元素创建）  
`<th>` 元素中的文本通常呈现为粗体并且居中。  
`<td>` 元素中的文本通常是普通的左对齐文本。  

#### &emsp;&emsp;2.1 headers属性

规定与表头单元格相关联的一个或多个表头单元格。

<span style="color:aqua">格式：</span>`<th headers="规定表头单元格关联的一个或多个表头单元格的 id 列表，以空格间隔。">内容</th>`

#### &emsp;&emsp;2.2 scope属性

规定某个表头单元格是否是列、行、列组或行组的表头。

<span style="color:aqua">格式：</span>`<th scope="col|row|colgroup|rowgroup">`

|col|规定单元格是列的表头|
|row|规定单元格是行的表头|
|colgroup|规定单元格是列组的表头|
|rowgroup|规定单元格是行组的表头|

实例：

```html
<table border="1">
  <tr>
    <th></th>
    <th scope="col">Month</th>
    <th scope="col">Savings</th>
  </tr>
  <tr>
    <td>1</td>
    <td>January</td>
    <td>$100</td>
  </tr>
  <tr>
    <td>2</td>
    <td>February</td>
    <td>$80</td>
  </tr>
</table>
```

#### &emsp;&emsp;2.3 colspan属性

定义表头单元格应该横跨的列数。即合并单元格的横向。

<span style="color:aqua">格式：</span>`<th colspan="规定表头单元格应该横跨的列数。">内容</th>`

<span style="color:orange">注意：</span>colspan="0" 告知浏览器使单元格横跨到列组 (colgroup) 的最后一列。目前仅firefox支持

#### &emsp;&emsp;2.4 rowspan属性

定义表头单元格应该横跨的行数。即合并单元格的纵向。  

<span style="color:aqua">格式：</span>`<th rowspan="规定表头单元格应该横跨的行数。">`

<span style="color:orange">注意：</span>rowspan="0" 告知浏览器使单元格横跨到表格组件中的最后一个行（thead、tbody 或 tfoot）。仅firefox与opera支持

### &emsp;3. \<tr>标签

`<tr>` 标签定义 HTML 表格中的行。
一个 `<tr>` 元素包含一个或多个 `<th>` 或 `<td>` 元素。

### &emsp;4. \<td>标签

定义 HTML 表格中的标准单元格。

#### &emsp;&emsp;4.1 headers属性

规定与表格单元格相关联的一个或多个表头单元格。

#### &emsp;&emsp;4.2 colspan属性

定义单元格应该横跨的列数。

#### &emsp;&emsp;4.3 rowspan属性

定义单元格应该横跨的行数。

### &emsp;5. \<caption>标签

定义表格的标题。  

`<caption>` 标签必须直接放置到 `<table>` 标签之后。只能对每个表格定义一个标题。  
通常这个标题会被居中于表格之上。然而，CSS 属性 "text-align" 和 "caption-side" 能用来设置标题的对齐方式和显示位置。  

<span style="color:aqua">格式：</span>`<caption>标题</caption>`

### &emsp;6. \<colgroup>标签

用于对表格中的列进行组合，以便对其进行格式化。
通过使用 `<colgroup>` 标签，可以向整个列应用样式，而不需要重复为每个单元格或每一行设置样式。
注释：只能在 `<table>` 元素之内，在任何一个 `<caption>` 元素之后，在任何一个 `<thead>`、`<tbody>`、`<tfoot>`、`<tr>` 元素之前使用 `<colgroup>` 标签。
提示：如果想对 `<colgroup>` 中的某列定义不同的属性，请在 `<colgroup>` 标签内使用 `<col>` 标签。

#### &emsp;&emsp;6.1 span属性

span 属性定义了 `<colgroup>` 元素应该横跨的列数。
要为 `<colgroup>` 内的列定义不同的属性，请在 `<colgroup>` 标签内使用 `<col>` 标签

<span style="color:aqua">格式：</span>`<colgroup span="列数">`  

实例；

```html
<table border="1">
  <colgroup span="2" style="background:red"></colgroup>
  <tr>
    <th>ISBN</th>
    <th>Title</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>3476896</td>
    <td>My first HTML</td>
    <td>$53</td>
  </tr>
  <tr>
    <td>5869207</td>
    <td>My first CSS</td>
    <td>$49</td>
  </tr>
</table>
```

### &emsp;7. \<col>标签

规定了 `<colgroup>` 元素内部的每一列的列属性。
通过使用 `<col>` 标签，可以向整个列应用样式，而不需要重复为每个单元格或每一行设置样式。

#### &emsp;&emsp;7.1 span属性

规定 col 元素应该横跨的列数。  
实例：

```html
<table border="1">
  <colgroup>
    <col span="2" style="background-color:red" />
    <col style="background-color:yellow" />
  </colgroup>
  <tr>
    <th>ISBN</th>
    <th>Title</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>3476896</td>
    <td>My first HTML</td>
    <td>$53</td>
  </tr>
</table>
```

### &emsp;8. \<thead>标签

用于组合 HTML 表格的表头内容。  

`<thead>` 元素应该与 `<tbody>` 和 `<tfoot>` 元素结合起来使用，用来规定表格的各个部分（表头、主体、页脚）。  

通过使用这些元素，使浏览器有能力支持独立于表格表头和表格页脚的表格主体滚动。当包含多个页面的长的表格被打印时，表格的表头和页脚可被打印在包含表格数据的每张页面上。  

`<thead>` 标签必须被用在以下情境中：作为 `<table>` 元素的子元素，出现在 `<caption>`、`<colgroup>` 元素之后，`<tbody>`、 `<tfoot>` 和 `<tr>` 元素之前。  
`<thead>` 元素内部必须包含一个或者多个 `<tr>` 标签。  

### &emsp;9. \<tbody>标签

用于组合 HTML 表格的主体内容。`<tbody>` 标签必须被用在以下情境中：作为 `<table>` 元素的子元素，出现在 `<caption>`、`<colgroup>` 和 `<thead>` 元素之后。  

`<tbody>` 标签必须被用在以下情境中：作为 `<table>` 元素的子元素，出现在 `<caption>`、`<colgroup>` 和 `<thead>` 元素之后。

### &emsp;10. \<tfoot>标签

用于组合 HTML 表格的页脚内容。`<tfoot>` 标签必须被用在以下情境中：作为 `<table>` 元素的子元素，出现在 `<caption>`、`<colgroup>` 和 `<thead>` 元素之后，`<tbody>` 和 `<tr>` 元素之前。
实例：

```html
<table border="1">
  <thead>
    <tr>
      <th>Month</th>
      <th>Savings</th>
    </tr>
  </thead>
  <tfoot>
    <tr>
      <td>Sum</td>
      <td>$180</td>
    </tr>
  </tfoot>
  <tbody>
    <tr>
      <td>January</td>
      <td>$100</td>
    </tr>
    <tr>
      <td>February</td>
      <td>$80</td>
    </tr>
  </tbody>
</table>
```

### &emsp;11. cellpadding属性

cellpadding 属性规定单元边沿与其内容之间的空白。

<span style="color:aqua">格式：</span>`<body cellpadding="规定单元边沿与其内容之间的空白。"></body>`

&emsp;

## 列表

### &emsp;1. \<ul>（无序列表）

`<ul>` 标签定义无序列表。前面仅有图案。  
将 `<ul>` 标签与 `<li>` 标签一起使用，创建无序列表。  
实例:

```html
<ul>
  <li>Coffee</li>
  <li>Tea</li>
  <li>Milk</li>
</ul>
```

### &emsp;2. \<ol>（有序列表）

`<ol>` 标签定义了一个有序列表. 列表排序以数字来显示。
使用`<li>`标签来定义列表选项

#### &emsp;&emsp;2.1 reversed属性

reversed 属性是一个布尔属性。  
reversed 属性规定列表顺序为降序 (9, 8, 7...)，而不是升序 (1, 2, 3...)。

<span style="color:aqua">格式：</span>`<ol reversed="reversed"></ol>`

目前只有 Chrome 和 Safari 6 支持 reversed 属性

实例：

```html
<ol reversed>
  <li>Coffee</li>
  <li>Tea</li>
  <li>Milk</li>
</ol>
```

### &emsp;3. \<dl>（自定义列表）

`<dl>` 标签定义一个描述列表。
`<dl>` 标签与 `<dt>` （定义项目/名字）和 `<dd>` （描述每一个项目/名字）一起使用。
实例：

```html
<dl>
  <dt>Coffee</dt>
    <dd>Black hot drink</dd>
  <dt>Milk</dt>
    <dd>White cold drink</dd>
</dl>
```
