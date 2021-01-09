---
layout: post
title:  "表单（上）"
date:   2019-04-23 13:25:30 +0800
categories: notes html base
tags: HTML 基础 form action
excerpt: "表单与输入元素"
---

## \<form>标签

表单是一个包含表单元素的区域。

表单使用表单标签 `<form>` 来设置:

```html
<form>
input 元素
</form>
```

表单元素是允许用户在表单中输入内容,比如：\<input>、\<textarea>、\<button>、\<select>、\<option>、\<optgroup>、\<fieldset>、\<label>。

### &emsp;1. accept-charset属性

<span style="color:aqua">格式：</span>`<form accept-charset="字符集">`

### &emsp;2. action属性

规定当提交表单时，向何处发送表单数据。

<span style="color:aqua">格式：</span>`<form action="URL">`

url可以是绝对也可以是相对路径。

### &emsp;3. autocomplete属性

autocomplete 属性规定表单是否应该启用自动完成功能。

自动完成允许浏览器预测对字段的输入。当用户在字段开始键入时，浏览器基于之前键入过的值，应该显示出在字段中填写的选项。

除了 Opera，其他主流浏览器都支持 autocomplete 属性。

<span style="color:aqua">格式：</span>`<form autocomplete="on|off">`

on 默认。规定启用自动完成功能。浏览器会基于用户之前键入的值自动完成值。
off 规定禁用自动完成功能。用户必须在每次使用时输入值到每个字段中，浏览器不会自动完成输入。

autocomplete "on" 适用于表单，"off" 适用于特定的输入字段，反之亦然。

实例：

```html
<form action="demo_form.html" method="get" autocomplete="on">
  First name:<input type="text" name="fname"><br>
  E-mail: <input type="email" name="email"><br>
  <input type="submit">
</form>
```

### &emsp;4. enctype属性

规定在将表单数据发送到服务器之前如何对其进行编码。即提交数据的格式。

<span style="color:orange">注意：</span>只有 method="post" 时才使用 enctype 属性。

<span style="color:aqua">格式：</span>`<form enctype="value">`

值|说明
:--:|:---
application/x-www-form-urlencoded|默认。在发送前对所有字符进行编码（将空格转换为 "+" 符号，特殊字符转换为 ASCII HEX 值）。
multipart/form-data|不对字符编码。当使用有文件上传控件的表单时，该值是必需的。
text/plain|将空格转换为 "+" 符号，但不编码特殊字符。

### &emsp;5. method属性

规定如何发送表单数据（form-data）（表单数据会被发送到在 action 属性中规定的页面中）。

表单数据可被作为 URL 变量的形式来发送（method="get"）或者作为 HTTP post 事务的形式来发送（method="post"）。

关于 GET 的注释：  
将表单数据以名称/值对的形式附加到 URL 中  
URL 的长度是有限的（大约 3000 字符）  
绝不要使用 GET 来发送敏感数据！（在 URL 中是可见的）  
对于用户希望加入书签的表单提交很有用  
GET 更适用于非安全数据，比如在 Google 中查询字符串  

关于 POST 的注释：  
将表单数据附加到 HTTP 请求的 body 内（数据不显示在 URL 中）  
没有长度限制  
通过 POST 提交的表单不能加入书签  

<span style="color:aqua">格式：</span>`<form method="get|post">`

### &emsp;6. name属性

规定表单的名称。用于在 JavaScript 中引用元素，或者在表单提交之后引用表单数据。

<span style="color:aqua">格式：</span>`<form name="">`

### &emsp;7. novalidate属性

是一个布尔属性。规定当提交表单时不对表单数据（输入）进行验证

<span style="color:aqua">格式：</span>`<form novalidate>`

### &emsp;8. target属性

规定一个名称或一个关键词，指示在何处打开 action URL，即在何处显示提交表单后接收到的响应。定义浏览器上下文（比如选项卡、窗口或内联框架）的名称或关键词。

<span style="color:aqua">格式：</span>`<form target="_blank|_self|_parent|_top|framename">`

<span style="color:orange">注意：</span>在 HTML5 中，不再支持 frame 和 frameset，所以 _parent、_top 和 framename 值大多用于 iframe。

值|说明
:-:|:--
_blank|在新窗口/选项卡中打开。
_self|在同一框架中打开。（默认）
_parent|在父框架中打开。
_top|在整个窗口中打开。
framename|在指定的 iframe 中打开。

&emsp;

## \<input>标签

规定了用户可以在其中输入数据的输入字段。

`<input>` 元素在 `<form>`元素中使用，用来声明允许用户输入数据的 input 控件。

输入字段可通过多种方式改变，取决于 type 属性。

### &emsp;1. 常见用法

input一般通过改变type属性来改变input形式，下面是有关type属性相关的某些值。这里提到了，后面的type属性就不会再介绍下面的值。

#### &emsp;&emsp;1.1文本域

<span style="color:aqua">格式：</span>`<input type="text">`

```html
<form>
First name: <input type="text" name="firstname"><br>
Last name: <input type="text" name="lastname">
</form>
```

#### &emsp;&emsp;1.2密码

密码字段字符不会明文显示，而是以星号或圆点替代。

<span style="color:aqua">格式：</span>`<input type="password">`

#### &emsp;&emsp;1.3单选按钮

<span style="color:aqua">格式：</span>`<input type="radio">`

实例：

```html
<form>
  <input type="radio" name="sex" value="male">Male<br>
  <input type="radio" name="sex" value="female">Female
</form>
```

#### &emsp;&emsp;1.4复选框

<span style="color:aqua">格式：</span>`<input type="checkbox">`

实例：

```html
<form>
  <input type="checkbox" name="vehicle" value="Bike">I have a bike<br>
  <input type="checkbox" name="vehicle" value="Car">I have a car
</form>
```

#### &emsp;&emsp;1.5提交按钮

<span style="color:aqua">格式：</span>`<input type="submit" value="submit">`

<span style="color:orange">注意：</span>这些按钮都必须在form标签中，不然会失效。

#### &emsp;&emsp;1.6 清零按钮

<span style="color:aqua">格式：</span>`<input type="reset">`

### &emsp;2. accept属性

规定了可通过文件上传提交的服务器接受的文件类型。

<span style="color:orange">注意：</span>accept属性仅适用于 `<input type="file">`。

<span style="color:yellow">提示：</span>请不要将该属性作为您的验证工具。应该在服务器上对文件上传进行验证。

<span style="color:aqua">格式：</span>`<input accept="audio/*|video/*|image/*|MIME_type">` 多个值使用逗号隔开

值|说明
:--:|:----
audio/*|接受所有的声音文件。
video/*|接受所有的视频文件。
image/*|接受所有的图像文件。
MIME_type|一个有效的 MIME 类型，不带参数。请参阅 IANA MIME 类型，获得标准 MIME 类型的完整列表。

### &emsp;3. alt属性

alt属性为用户由于某些原因（比如网速太慢、src 属性中的错误、浏览器禁用图像、用户使用的是屏幕阅读器）无法查看图像时提供了替代文本。

<span style="color:orange">注意：</span>alt属性只能与 `<input type="image">` 配合使用。

<span style="color:aqua">格式：</span>`<input alt="替代文本">`

### &emsp;4. autocomplete属性

autocomplete 属性规定输入字段是否应该启用自动完成功能。

自动完成允许浏览器预测对字段的输入。当用户在字段开始键入时，浏览器基于之前键入过的值，应该显示出在字段中填写的选项。

<span style="color:aqua">格式：</span>`<input autocomplete="on|off">`

禁止浏览器表单自动填充

普通文本框添加 autocomplete="off"，密码输入框添加 autocomplete="new-password"。  
`<input type="text" autocomplete="off" name="userName"/>`  
`<input type="password" autocomplete="new-password" name="password"/>`

如果是整个表单可以设置：

```html
<form method="post" action="/form" autocomplete="off">
...
</form>
```

### &emsp;5. autofocus属性

是一个布尔属性。规定当页面加载时 `<input>` 元素应该自动获得焦点。

<span style="color:aqua">格式：</span>`<input autofocus>`

### &emsp;6. checked属性

是一个布尔属性。

checked属性规定在页面加载时应该被预先选定的 `<input>` 元素。

checked属性适用于 `<input type="checkbox">` 和 `<input type="radio">`。

checked属性也可以在页面加载后，通过 JavaScript 代码进行设置。

<span style="color:aqua">格式：</span>`<input checked>`

### &emsp;7. disabled属性

是一个布尔属性。规定应该禁用的 `<input>` 元素。被禁用的 input 元素是无法使用和无法点击的。

对于disabled属性进行设置，使用户在满足某些条件时（比如选中复选框，等等）才能使用 `<input>` 元素。然后，可使用 JavaScript 来删除 disabled 值，使该`<input>` 元素变为可用的状态。

<span style="color:orange">注意：</span>表单中被禁用的 `<input>` 元素不会被提交。disabled 属性不适用于 `<input type="hidden">`。

<span style="color:aqua">格式：</span>`<input disabled>`

### &emsp;8. form属性

规定 `<input>` 元素所属的一个或多个表单。是为了让表单分散分布但是能同时提交。

除了 Internet Explorer，几乎所有的主流浏览器都支持 form 属性。

<span style="color:aqua">格式：</span>`<input form="form_id">`

id规定 `<input>` 元素所属的一个或多个表单的 id 列表，以空格分隔。

```html
//位于 form 表单外的输入字段（但仍然属于 form 表单的一部分）：
<form action="demo-form.php" id="form1">
    First name: <input type="text" name="fname"><br>
    <input type="submit" value="提交">
</form>
```

### &emsp;9. formaction属性

规定当表单提交时处理输入控件的文件的 URL。

formaction 属性覆盖 `<form>` 元素的 action 属性。

formaction 属性适用于 type="submit" 和 type="image"。

<span style="color:aqua">格式：</span>`<input formaction="地址">`

```html
<form action="demo-form.php">
    First name: <input type="text" name="fname"><br>
    Last name: <input type="text" name="lname"><br>
    <input type="submit" value="提交"><br> //这两个提交按钮会将这个表单提交到不同的地方
    <input type="submit" formaction="demo-admin.php" value="提交">
</form>
```

### &emsp;10. formenctype属性

规定当表单数据提交到服务器时如何编码（仅适用于 method="post" 的表单）。

formenctype 属性覆盖 `<form>` 元素的 enctype 属性。

formenctype 属性与 type="submit" 和 type="image" 配合使用。

Internet Explorer 9 及之前的版本不支持 `<input>` 标签的 formenctype 属性。

<span style="color:aqua">格式：</span>`<input formenctype="value">`

值|说明
:-:|:--
application/x-www-form-urlencoded|默认。在发送前对所有字符进行编码。将空格转换为 "+" 符号，特殊字符转换为 ASCII HEX 值。
multipart/form-data|不对字符编码。当使用有文件上传控件的表单时，该值是必需的。
text/plain|将空格转换为 "+" 符号，但不编码特殊字符。

### &emsp;11. formmethod属性

定义发送表单数据到 action URL 的 HTTP 方法。

formmethod 属性覆盖 `<form>` 元素的 method 属性。

formmethod 属性与 type="submit" 和 type="image" 配合使用。

表单数据可被作为 URL 变量的形式来发送（method="get"）或者作为 HTTP post 事务的形式来发送（method="post"）。

<span style="color:aqua">格式：</span>`<input formmethod="get|post">`

### &emsp;12. formnovalidate属性

是一个布尔属性。

novalidate 属性规定当表单提交时 `<input>` 元素不进行验证。

formnovalidate 属性覆盖 `<form>` 元素的 novalidate 属性。

formnovalidate 属性可与 type="submit" 配合使用。Safari 或者 Internet Explorer 9 及之前的版本不支持 `<input>` 标签的 formnovalidate 属性。

<span style="color:aqua">格式：</span>`<input formnovalidate>`

### &emsp;13. formtarget属性

规定表示提交表单后在哪里显示接收到响应的名称或关键词。

formtarget 属性覆盖 `<form>` 元素的 target 属性。

formtarget 属性可以与 type="submit" 和 type="image" 配合使用。Internet Explorer 9 及之前的版本不支持 `<input>` 标签的 formtarget 属性。

<span style="color:aqua">格式：</span>`<input formtarget="_blank|_self|_parent|_top|framename">`

### &emsp;14. height属性

规定 `<input>` 元素的高度。

<span style="color:orange">注意：</span>height 属性只适用于 `<input type="image">`。为图片指定 height 和 width 属性是一个好习惯。如果设置了这些属性，当页面加载时会为图片预留需要的空间。而如果没有这些属性，则浏览器就无法了解图像的尺寸，也就无法为其预留合适的空间。情况是当页面和图片加载时，页面布局会发生变化。

<span style="color:aqua">格式：</span>`<input height="以像素为单位">`

### &emsp;15. list属性

引用 `<datalist>` 元素，其中包含 `<input>` 元素的预定义选项。

Safari 或者 Internet Explorer 9 及之前的版本不支持 `<input>` 标签的 list 属性。

<span style="color:aqua">格式：</span>`<input list="绑定到 <input> 元素的 datalist 的 id">`

```html
<input list="browsers">

<datalist id="browsers">
  <option value="Internet Explorer">
  <option value="Firefox">
  <option value="Google Chrome">
  <option value="Opera">
  <option value="Safari">
</datalist>
```

### &emsp;16. max属性

规定 `<input>` 元素的最大值。

<span style="color:orange">注意：</span>max 属性与 min 属性配合使用，可创建合法值范围。max 和 min 属性适用于以下 input 类型：number、range、date、datetime、datetime-local、month、time 和 week。Firefox 或者 Internet Explorer 9 及之前的版本不支持 `<input>` 标签的 max 属性。由于 Internet Explorer 10 不支持这些 input 类型，max 属性将不适用于 IE 10 中的 date 和 time。

<span style="color:aqua">格式：</span>`<input max="number|date">`

```html
<form action="demo_form.html">

  Enter a date before 1980-01-01:
  <input type="date" name="bday" max="1979-12-31">

  Enter a date after 2000-01-01:
  <input type="date" name="bday" min="2000-01-02">

  Quantity (between 1 and 5):
  <input type="number" name="quantity" min="1" max="5">

  <input type="submit">

</form>
```

### &emsp;17. maxlength属性

规定 `<input>` 元素中允许的最大字符数。

<span style="color:aqua">格式：</span>`<input maxlength="最大值">`

### &emsp;18. min属性

与max属性类似。

### &emsp;19. multiple属性

是一个布尔属性。

multiple 属性规定允许用户输入到 `<input>` 元素的多个值。

multiple 属性适用于以下 input 类型：email 和 file。

<span style="color:aqua">格式：</span>`<input multiple>`

```html
<form action="demo-form.php">
    选择图片: <input type="file" name="img" multiple>
    <input type="submit">
</form>
```

### &emsp;20. name属性

`<input>` 元素的名称。用于在 JavaScript 中引用元素，或者在表单提交后引用表单数据。只有设置了 name 属性的表单元素才能在提交表单时传递它们的值。

<span style="color:aqua">格式：</span>`<input name="">`

### &emsp;21. pattern属性

规定用于验证 `<input>` 元素的值的正则表达式。

pattern 属性适用于下面的 input 类型：text、search、url、tel、email 和 password。请使用全局的 title 属性来描述模式以帮助用户。Safari 或者 Internet Explorer 9 及之前的版本不支持 `<input>` 标签的 pattern 属性。

<span style="color:aqua">格式：</span>`<input pattern="正则表达式">`

```html
<form action="demo_form.html">
    Country code: <input type="text" name="country_code" pattern="[A-Za-z]{3}" title="Three letter country code">
    <input type="submit">
</form>
```

### &emsp;22. placeholder属性

可描述输入字段预期值的简短的提示信息（比如：一个样本值或者预期格式的短描述）。该提示会在用户输入值之前显示在输入字段中。

placeholder 属性适用于下面的 input 类型：text、search、url、tel、email 和 password。

<span style="color:aqua">格式：</span>`<input placeholder="文本">`

### &emsp;23. readonly属性

是一个布尔属性。规定输入字段是只读的。

只读字段是不能修改的。不过，用户仍然可以使用 tab 键切换到该字段，还可以选中或拷贝其文本。

可以防止用户对值进行修改，直到满足某些条件为止（比如选中了一个复选框）。然后，需要使用 JavaScript 消除 readonly 值，将输入字段切换到可编辑状态。

<span style="color:aqua">格式：</span>`<input readonly>`

### &emsp;24. required属性

是一个布尔属性。规定必需在提交表单之前填写输入字段。

required 属性适用于下面的 input 类型：text、search、url、tel、email、password、date pickers、number、checkbox、radio 和 file。

<span style="color:aqua">格式：</span>`<input required>`

### &emsp;25. size属性

规定以字符数计的 `<input>` 元素的可见宽度。

size 属性适用于下面的 input 类型：text、search、tel、url、email 和 password。

<span style="color:orange">注意：</span>如需规定 `<input>` 元素中允许的最大字符数，请使用 maxlength 属性。

<span style="color:aqua">格式：</span>`<input size="数字，默认为20">`

### &emsp;26. src属性

显示为提交按钮的图像的 URL。

<span style="color:orange">注意：</span>src 属性对于 `<input type="image">` 是必需的属性，且只能与 `<input type="image">` 配合使用。

<span style="color:aqua">格式：</span>`<input src="URL">`

### &emsp;27. step属性

规定 `<input>` 元素的合法数字间隔。

实例：如果 step="3"，则合法数字应该是 -3、0、3、6，以此类推。

step 属性可以与 max 和 min 属性配合使用，以创建合法值的范围。step 属性适用于下面的 input 类型：number、range、date、datetime、datetime-local、month、time 和 week。Firefox 或者 Internet Explorer 9 及之前的版本不支持 `<input>` 标签的 step 属性。

<span style="color:aqua">格式：</span>`<input step="number">`

### &emsp;28. type属性

定义input显示的内容与类型

<span style="color:aqua">格式：</span>`<input type="">`

值|含义
:-:|:--
button|定义可点击的按钮（通常与 JavaScript 一起使用来启动脚本）。
checkbox|定义复选框。
colorNew|定义拾色器。
dateNew|定义 date 控件（包括年、月、日，不包括时间）。
datetimeNew|定义 date 和 time 控件（包括年、月、日、时、分、秒、几分之一秒，基于 UTC 时区）。
datetime-localNew|定义 date 和 time 控件（包括年、月、日、时、分、秒、几分之一秒，不带时区）。
emailNew|定义用于 e-mail 地址的字段。
file|定义文件选择字段和 "浏览..." 按钮，供文件上传。
hidden|定义隐藏输入字段。
image|定义图像作为提交按钮。
monthNew|定义 month 和 year 控件（不带时区）。
numberNew|定义用于输入数字的字段。
password|定义密码字段（字段中的字符会被遮蔽）。
radio|定义单选按钮。
rangeNew|定义用于精确值不重要的输入数字的控件（比如 slider 控件）。
reset|定义重置按钮（重置所有的表单值为默认值）。
searchNew|定义用于输入搜索字符串的文本字段。
submit|定义提交按钮。
telNew|定义用于输入电话号码的字段。
text|默认。定义一个单行的文本字段（默认宽度为 20 个字符）。
timeNew|定义用于输入时间的控件（不带时区）。
urlNew|定义用于输入 URL 的字段。
weekNew|定义 week 和 year 控件（不带时区）。

### &emsp;29. value属性

value 属性规定 `<input>` 元素的值。

value 属性对于不同 input 类型，用法也不同：
对于 "button"、"reset"、"submit" 类型 - 定义按钮上的文本
对于 "text"、"password"、"hidden" 类型 - 定义输入字段的初始（默认）值
对于 "checkbox"、"radio"、"image" 类型 - 定义与 input 元素相关的值，当提交表单时该值会发送到表单的 action URL。
value 属性对于 `<input type="checkbox">` 和 `<input type="radio">` 是必需的。
value 属性不适用于 `<input type="file">`。

<span style="color:aqua">格式：</span>`<input value="">`

### &emsp;30. width属性

规定 `<input>` 元素的宽度。只适用于 `<input type="image">`。

<span style="color:aqua">格式：</span>`<input width="像素为单位">`
