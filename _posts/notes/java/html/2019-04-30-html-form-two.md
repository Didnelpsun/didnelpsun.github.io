---
layout: post
title:  "表单（下）"
date:   2019-04-30 21:50:24 +0800
categories: notes html base
tags: HTML 基础 textarea form select optgroup
excerpt: "文本域、标记、下拉框等"
---

## \<textarea>标签（文本域）

`<textarea>` 标签定义一个多行的文本输入控件。

文本区域中可容纳无限数量的文本，其中的文本的默认字体是等宽字体（通常是 Courier）。

可以通过 cols 和 rows 属性来规定 textarea 的尺寸大小，不过更好的办法是使用 CSS 的 height 和 width 属性。

### &emsp;1. autofocus属性

autofocus 属性是一个布尔属性。

autofocus 属性规定文本区域应该在页面加载时自动获得焦点。

<span style="color:aqua">格式：</span>`<textarea autofocus>`

### &emsp;2. cols属性

cols 属性规定文本区域的可见宽度。

textarea 的尺寸大小也可以通过 CSS 的 height 和 width 属性设置。

<span style="color:aqua">格式：</span>`<textarea cols="number">`

number：规定文本区域的宽度（以平均字符宽度计）。默认值是 20。

### &emsp;3. disabled属性

disabled 属性是一个布尔属性。

disabled 属性规定文本区域应该被禁用。

被禁用的文本区域既不可用，文本也不可选择（不能被复制）。

可以设置 disabled 属性，直到满足某些条件（比如选择一个复选框），才恢复用户对该文本区域的使用。然后，可以使用 JavaScript 来移除 disabled 属性的值，以使文本区域变为可用状态。

<span style="color:aqua">格式：</span>`<textarea disabled>`

<span style="color:orange">注意：</span>disabled 与 disabled = "disabled"的区别  
disabled = "disabled" 是 XML 规范写法，如果保持 XML 兼容，必须写成 disabled = "disabled"，如果您不使用 XHTML 并且不关心的 XML 语法，那么你可以单独使用。
在除了火狐以外的浏览器，例如chrome `<textarea disabled>` 是可以被选择并复制的。

### &emsp;4. form属性

form 属性规定文本区域所属的一个或多个表单。是html5的新特性。

<span style="color:aqua">格式：</span>`<textarea form="form_id">`

form_id：规定文本区域所属的一个或多个表单的 id 列表，以空格分隔。

除了 Internet Explorer，其他主流浏览器都支持 form 属性。

实例：

```html
位于 form 表单外的文本区域（但仍然属于 form 表单的一部分）：

<form action="demo-form.php" id="usrform">
  Name: <input type="text" name="usrname">
  <input type="submit">
</form>

<textarea name="comment" form="usrform">输入内容...</textarea>
```

### &emsp;5. maxlength属性

规定文本区域的最大长度（以字符计）。

<span style="color:aqua">格式：</span>`<textarea maxlength="number">`

Internet Explorer 10、Firefox、Chrome 和 Safari 支持 maxlength 属性。Opera 或者 Internet Explorer 9 及之前的版本不支持 `<textarea>` 标签的 maxlength 属性。除了 Internet Explorer 和 Opera，其他主流浏览器都支持 maxlength 属性。

### &emsp;6. name属性

name 属性为文本区域规定名称。

name 属性用于在 JavaScript 中对元素进行引用，或者在表单提交之后，对表单数据进行引用。

<span style="color:aqua">格式：</span>`<textarea name="">`

### &emsp;7. placeholder属性

placeholder 属性规定一个简短的提示，它描述了文本区域的期望值。

当文本区域为空，且当字段获得焦点后又失去焦点时，文本区域中显示该提示。

<span style="color:aqua">格式：</span>`<textarea placeholder="描述信息...">`

### &emsp;8. readonly属性

readonly 属性是一个布尔属性。

readonly 属性规定文本区域为只读。

在只读的文本区域中，无法对内容进行修改，但用户可以通过 tab 键切换到该控件，选取或复制其中的内容。

可以设置 readonly 属性，直到满足某些条件（比如选择一个复选框），才恢复用户对该文本区域的使用。然后，可以使用 JavaScript 来移除 readonly 属性的值，以使文本区域变为可编辑状态。

<span style="color:aqua">格式：</span>`<textarea readonly>`

### &emsp;9. required属性

required 属性是一个布尔属性。

required 属性规定一个文本区域是必需的/必须填写（以提交表单）。

除了 Internet Explorer 和 Safari，其他主流浏览器都支持 required 属性。

<span style="color:aqua">格式：</span>`<textarea required>`

### &emsp;10. rows属性

rows 属性规定文本区域的可见高度，以行数计。

<span style="color:aqua">格式：</span>`<textarea rows="number">`

number：规定文本区域的高度（以行数计）。默认值是 2。

### &emsp;11. wrap属性

规定在表单提交时文本区域中的文本是如何换行的。

<span style="color:aqua">格式：</span>`<textarea wrap="soft|hard">`

number：规定文本区域的高度（以行数计）。默认值是 2。

soft 在表单提交时，textarea 中的文本不换行。默认。
hard 在表单提交时，textarea 中的文本换行（包含换行符）。当使用 "hard" 时，必须指定 cols 属性。

&emsp;

## \<label>标签（标记）

input 元素定义标注（标记）。

label 元素不会向用户呈现任何特殊效果。不过，它为鼠标用户改进了可用性。如果您在 label 元素内点击文本，就会触发此控件。就是说，当用户选择该标签时，浏览器就会自动将焦点转到和标签相关的表单控件上。

```html
<form action="demo_form.php">
  <label for="male">Male</label>
  <input type="radio" name="sex" id="male" value="male"><br>
  <label for="female">Female</label>
  <input type="radio" name="sex" id="female" value="female"><br><br>
  <input type="submit" value="提交">
</form>
```

### &emsp;1. for属性

规定 label 绑定的表单元素。

<span style="color:aqua">格式：</span>`<label for="id">`

### &emsp;2. form属性

规定 `<label>` 元素所属的一个或多个表单。

<span style="color:aqua">格式：</span>`<label form="id">`多个表单以空格分隔。

&emsp;

## \<fieldset>标签

以将表单内的相关元素分组。并会在相关表单元素周围绘制边框。其实仅是起到了包围和分组表单元素的作用，也不算特别必要。

具有disabled, form, name三个属性，较为普遍，和其他标签的同名属性用法一样。

&emsp;

## \<legend>标签

`<legend>` 标签为 `<fieldset>` 元素定义标题。

```html
<form>
  <fieldset>
    <legend>Personalia:</legend>
    Name: <input type="text" size="30"><br>
    Email: <input type="text" size="30"><br>
    Date of birth: <input type="text" size="10">
  </fieldset>
</form>
```

&emsp;

## \<select>标签（下拉选框）

`<select>` 元素用来创建下拉列表。中的`<option>`标签定义了列表中的可用选项。是一种表单控件，可用于在表单中接受用户输入。  

实例：

```html
<select>
  <option value="volvo">Volvo</option>
  <option value="saab">Saab</option>
  <option value="mercedes">Mercedes</option>
  <option value="audi">Audi</option>
</select>
```

### &emsp;1. autofocus属性

autofocus 属性是一个布尔属性。  
autofocus 属性规定下拉列表在页面加载时自动获得焦点。就是打开页面时默认选择该下拉选框。（选框默认变蓝）  

<span style="color:aqua">格式：</span>`<select autofocus="autofocus"></select>`

Internet Explorer 10、Opera、Chrome 和 Safari 支持 autofocus 属性。

### &emsp;2. disabled属性

disabled 属性是一个布尔属性。  
disabled 属性规定下拉列表应该被禁用。  
被禁用的下拉列表既不可用，也不可点击。  
可以设置 disabled 属性，直到满足某些条件（比如选择一个复选框），才恢复用户对该下拉列表的使用。然后，可以使用 JavaScript 来移除 disabled 属性的值，以使下拉列表变为可用状态。  

<span style="color:aqua">格式：</span>`<select disabled="disabled"></select>`

### &emsp;3. form属性

规定下拉列表所属的一个或多个表单。将下拉列表与一些表单相连，一同传输数据。

<span style="color:aqua">格式：</span>`<select form="规定下拉列表所属的一个或多个表单的 id 列表，以空格分隔。">`

Firefox、Opera、Chrome 和 Safari 支持 form 属性。  

实例：

```html
<form action="http://w3schools.com/tags/demo_form.asp" id="carform">
  Firstname:<input type="text" name="fname">
  <input type="submit">
</form>
<br>
<select name="carlist" form="carform">
  <option value="volvo">Volvo</option>
  <option value="saab">Saab</option>
  <option value="opel">Opel</option>
  <option value="audi">Audi</option>
</select>
<p>下拉列表超出了表单元素,但仍是表单的一部分。</p>
```

### &emsp;4. multiple属性

规定可同时选择多个选项。multiple 属性是一个布尔属性。  
在不同操作系统和浏览器中，选择多个选项的差异：

对于 windows：按住 Ctrl 按钮来选择多个选项  

对于 Mac：按住 command 按钮来选择多个选项  

由于上述差异的存在，同时由于需要告知用户可以使用多项选择，对用户更友好的方式是使用复选框。  

<span style="color:aqua">格式：</span>`<select multiple="multiple"></select>`

实例：

```html
<select multiple="multiple">
  <option value ="volvo">Volvo</option>
  <option value ="saab">Saab</option>
  <option value="opel">Opel</option>
  <option value="audi">Audi</option>
</select>
```

### &emsp;5. name属性

name 属性规定 select 元素的名称。用于对提交到服务器后的表单数据进行标识，或者在客户端通过 JavaScript 引用表单数据。

<span style="color:aqua">格式：</span>`<select name="下拉列表的名称">`

### &emsp;6. required属性

规定用户在提交表单前必须选择一个下拉列表中的选项。是布尔值，主流浏览器都没有实现，但是是html5中的新属性。  

<span style="color:aqua">格式：</span>`<select required>`

实例：

```html
<form action="demo_form.html">
  <select required>
    <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="mercedes">Mercedes</option>
      <option value="audi">Audi</option>
    </select>
  <input type="submit">
</form>
```

### &emsp;7. size属性

size 属性规定下拉列表中可见选项的数目。

如果 size 属性的值大于 1，但是小于列表中选项的总数目，浏览器会显示出滚动条，表示可以查看更多选项。

<span style="color:aqua">格式：</span>`<select size="number">`

number：下拉列表中可见选项的数目。默认值是 1。如果使用了 multiple 属性，默认值是 4。

&emsp;

## \<optgroup>标签

`<optgroup>` 标签经常用于把相关的选项组合在一起。
如果你有很多的选项组合, 你可以使用`<optgroup>` 标签能够很简单的将相关选项组合在一起。

<span style="color:aqua">格式：</span>

```html
<optgroup>
  <option>
  </option>
</optgdroup>
```

### &emsp;1. disabled属性

disabled 属性是一个布尔属性。disabled 属性规定选项组应该被禁用。被禁用的选项组既不可用，也不可点击。  
可以设置 disabled 属性，直到满足某些条件（比如选择一个复选框），才恢复用户对该选项组的使用。然后，可以使用 JavaScript 来移除 disabled 属性的值，以使选项组变为可用状态。  

<span style="color:aqua">格式：</span>`<optgroup disabled="disabled"></optgroup>`

实例：

```html
<select>
  <optgroup label="German Cars" disabled>  <!--该组下的所有选项都不可选-->
    <option value="mercedes">Mercedes</option>
    <option value="audi">Audi</option>
  </optgroup>
</select>
```

### &emsp;2. label属性

label 属性为选项组规定描述标签。该描述不可选，仅仅是作为描述作用。  

<span style="color:aqua">格式：</span>`<optgroup label="标签名"></optgroup>`

&emsp;

## \<option>标签

The `<option>` 标签定义下拉列表中的一个选项（一个条目）。  
`<option>` 标签中的内容作为 `<select>` 或者 `<datalist>` 一个元素使用。  
`<option>` 标签可以在不带有任何属性的情况下使用，但是您通常需要使用 value 属性，此属性会指示出被送往服务器的内容。  

### &emsp;1. disabled属性

disabled 属性是一个布尔属性。  
disabled 属性规定某个选项应该被禁用。  
被禁用的选项既不可用，也不可点击。  
可以设置 disabled 属性，直到满足某些条件（比如选择一个复选框），才恢复用户对该选项的使用。然后，可以使用 JavaScript 来清除 disabled 属性，以使选项变为可用状态。

<span style="color:aqua">格式：</span>`<option disabled="disabled">内容</option>`

### &emsp;2. label属性

label 属性规定更短版本的选项。下拉列表中会显示出所规定的更短版本。原来在`<option>``</option>`标签中的文本就失效了。

<span style="color:aqua">格式：</span>`<option label="选项的更短的版本。">内容</option>`

除了 Firefox，其他主流浏览器都支持 label 属性。
实例：

```html
<select>
    <option label="Volvo">Volvo (Latin for "I roll")</option>
    <option label="Saab">Saab (Swedish Aeroplane AB)</option>
    <option label="Mercedes">Mercedes (Mercedes-Benz)</option>
    <option label="Audi">Audi (Auto Union Deutschland Ingolstadt)</option>
</select>
```

### &emsp;3. selected属性

规定在页面加载时预先选定该选项。即默认选项。selected 属性是一个布尔属性。  
被预选的选项会显示在下拉列表最前面的位置。  

<span style="color:aqua">格式：</span>`<option selected="selected">内容</option>`

### &emsp;4. value属性

value 属性规定在表单被提交时被发送到服务器的值。  
开始标签 `<option>` 与结束标签 `</option>` 之间的内容是浏览器显示在下拉列表中的内容，而 value 属性中的值是表单提交时被发送到服务器的值。
<font color="orange">注意：</font>  

如果没有规定 value 属性，选项的值将设置为 `<option>` 标签中的内容。

<span style="color:aqua">格式：</span>`<option value="传送值">选项</option>`

&emsp;

## \<button>标签（按钮）

定义一个按钮。

在 `<button>` 元素内部，您可以放置内容，比如文本或图像。这是该元素与使用 `<input>` 元素创建的按钮之间的不同之处。

### &emsp;属性

属性|值|说明
:--:|:-:|:-
autofocus|autofocus|规定当页面加载时按钮应当自动地获得焦点。
disabled|disabled|规定应该禁用该按钮。
form|form_id|规定按钮属于一个或多个表单。
formaction|URL|规定当提交表单时向何处发送表单数据。覆盖 form 元素的 action 属性。该属性与 type="submit" 配合使用。
formenctype|application/x-www-form-urlencoded、multipart/form-data、text/plain|规定在向服务器发送表单数据之前如何对其进行编码。覆盖 form 元素的 enctype 属性。该属性与 type="submit" 配合使用。
formmethod|get、post|规定用于发送表单数据的 HTTP 方法。覆盖 form 元素的 method 属性。该属性与 type="submit" 配合使用。
formnovalidate|formnovalidate|如果使用该属性，则提交表单时不进行验证。覆盖 form 元素的 novalidate 属性。该属性与 type="submit" 配合使用。
formtarget|_blank、_self、_parent、_top、framename|规定在何处打开 action URL。覆盖 form 元素的 target 属性。该属性与 type="submit" 配合使用。
name|name|规定按钮的名称。
type|button/reset/submit|规定按钮的类型。
value|text|规定按钮的初始值。可由脚本进行修改。

## \<datalist>标签（输入下拉框）

规定了 `<input>` 元素可能的选项列表。`<datalist>` 标签被用来在为 `<input>` 元素提供"自动完成"的特性。用户能看到一个下拉列表，里边的选项是预先定义好的，将作为用户的输入数据。也就是说这个是可以让input元素填和选的结合，一般的可能用到的值，就写在datalist中，用户可以选，如果不是这些值，用户就自己输，节省了用户输入那些常用的值的时间。

使用 `<input>` 元素的 list 属性来绑定 `<datalist>` 元素。

如是一个 `<input>` 元素，`<datalist>` 中描述了其可能的值：

```html
<input list="browsers">
<datalist id="browsers">
  <option value="Internet Explorer">
  <option value="Firefox">
  <option value="Chrome">
  <option value="Opera">
  <option value="Safari">
</datalist>
```

## \<output>标签

作为计算结果输出显示(比如执行脚本的输出)。Internet Explorer 浏览器不支持 `<output>` 标签。

```html
<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">0
  <input type="range" id="a" value="50">100
  +<input type="number" id="b" value="50">
  =<output name="x" for="a b"></output>
</form>
```

### &emsp;1. for属性

规定计算中使用的元素与计算结果之间的关系。

<span style="color:aqua">格式：</span>`<output for="element_id">`

规定一个或多个元素的 id 列表，以空格分隔。这些元素描述了计算中使用的元素与计算结果之间的关系。

### &emsp;2. name属性

规定 `<output>` 元素的名称。用于在表单提交后引用表单数据，或者用于在 JavaScript 中引用元素。
