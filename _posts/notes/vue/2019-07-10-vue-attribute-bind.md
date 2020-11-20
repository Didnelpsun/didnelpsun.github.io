---
layout: post
title:  "样式绑定"
date:   2019-07-10 15:33:36 +0800
categories: notes vue base
tags: Vue 基础 v-bind class style 对象 数组
excerpt: "样式与属性绑定"
---

v-bind提供了属性的绑定的方式。不过虽然这里讲的是v-bind指令，但是只会讲到样式绑定，其余属性的使用方式是类似的。

首先我们看一个Vue的例子：

{% raw %}

```vue
<template>
  <div class="hello">
      <div class="class1">
      //中间大括号无空格
      {{ msg }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      class1: {
        'width': '100px',
        'height': '100px',
        'backgroundColor': 'yellow'
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.class1{
  width: 100px;
  height: 100px;
  background-color: yellow;
}
</style>
```

{% endraw %}

这是组件化的写法，对应的组件化后面会讲到，不过只要你新建一个Vue项目，它所有的Vue文件都是这样的格式，所以你可以先不管他。我们在data中和style中都定义一个名字为class1的类。class="class1"是原生定义类的方法，这个指向的是style标签中定义的class。

## 绑定class

使用大括号引用data，如\<div class=\{\{ class1 }}>是错误的，虽然\{\{}}用来引用data数据，但是对应的属性你这样是不能使用的，它会报错，我们一般都需要使用v-bind指令来绑定对应的数据。那么我们应该如何使用data中的class呢？

### &emsp;对象

#### &emsp;&emsp;单值对象

我们可以通过绑定对象来动态的切换class，如我们在data中加入一个属性为bool1，值为true，然后在模板中改成：`<div v-bind:class="{class1:bool1}">`，你会发现效果是一样的，如果你再测试一下，这里的class1是指向style标签的。同样你也可以将这个改成`<div v-bind:class="{'class1':bool1}">`，这个加不加引号是不影响的。

这也是基本用法，前面的参数是对应的style标签中的类名，而后面的参数是对应data中的值，true就应用class，false就不应用。Vue首先看到是v-bind指令，然后首先在data数据中查找对应的第二参数布尔属性的布尔值，如上面的bool1，如果这个值为真，那么就将这个类名赋值给class，假则否。

#### &emsp;&emsp;多值对象

同样，你也可以在这个对象中写入多个对应的style标签class，格式与单值对象的一致的。

如在style标签中加入`.class2{ font-size: 20px;color: green;}`，然后模板改成`<div v-bind:class="{class1:bool1,class2:bool1}">`，那么它将被渲染为`<div class="class1 class2">`。

#### &emsp;&emsp;对象与原生混合

v-bind指令用来绑定样式，但是我们一般使用的情况下，都是要动态改变样式的，不然如果我们的样式是静态的，那显然还是用原生的样式绑定更节省代码，v-bind指令可以和原生的绑定方式混合使用，静态不变的用原生，动态的用v-bind指令。`<div class="class1" v-bind:class="{class2:bool1}">`和原来的效果是一样的。

#### &emsp;&emsp;对象字符串

如果我们觉得在模板中定义样式的是否使用，如果要判断多个对象的使用布尔值，那么会很长，所以这时我们就只用将一个data中的对象名赋值给v-bind:class，然后再在data中定义对应的样式布尔值。

请注意，这里的标题是对象字符串，而不是字符串对象，因为这里绑定的值是字符串，并没有外面的{}来指向data，这个字符串表示的指向是对象。

将模板改为`<div v-bind:class="classGroup">`，然后在data中定义`classGroup: { class1: true, class2: true }`，效果一样，首先Vue看到是v-bind，所以它会将classGroup看做data中的属性，然后去data中找classGroup，然后判断其中类名的布尔值，如果是真就将对应的类名赋值给class，然后再根据最后赋值成的class属性值在style标签中查找class。

<span style="color:red">警告：</span>这里有一个特殊情况，但是不推荐使用，就是修改模板为`<div v-bind:class="class1">`，data中修改为`class1:true`，这个效果也是一样。流程前面的都一样，但是在data中这个class1不再是对象，而是一个非对象值，它会把它首先转换为布尔值，如果是真，那么就把这个字符串赋值给class，然后再在style标签中寻找对应的class。也就是说他将对象的布尔值的设置直接省略了。

同时你也可以在这里使用计算属性来简便运算。

### &emsp;数组

#### &emsp;&emsp;参数数组

我们可以使用数组来给class赋值的，但是同对象不一样的是，对象类似于集合类型，也就是控制一个对象中只能出现哪些类型，且只能出现一次，而数组则关注于数字，它在数组中只提供一些形参，而具体的赋值是什么类则在data中。模板中定义`<div v-bind:class="[classa,classb]">`，data中定义`classa: 'class1',classb: 'class2'`。同时v-bind:class后面的引号是可有可无的，你也可以直接赋值一个数组。

#### &emsp;&emsp;三元运算符

如果你也要在数组中判断布尔值来控制赋值哪个class，那么可以在数组中使用三元运算符，如`<div v-bind:class="[boo1?class1:' ',class2]">`，就根据boo1的布尔值来判断，真就是赋值class1，假就是赋值class2。这种简单的互斥性是对象格式所不能实现的。

#### &emsp;&emsp;数组与对象混合

同样你也可以将数组和对象混合使用，如你可把上面的模板改成`<div v-bind:class="[{class1:bool1},{class2:!bool1}]">`，效果是一样的。

&emsp;

## 绑定style

原生的style属性绑定直接将字符串赋值给style。不过这样会比较长。

### &emsp;对象值

一般使用一对大括号作为对象进行赋值，CSS属性名只可以用驼峰式来命名，不然会报错。模板定义`<div v-bind:style="{color:divcolor, fontSize:font+'px'}">`，data中定义`divcolor: 'green', font: 30`。

### &emsp;对象名

因为这样字段也很长，所以我们一般都是将style绑定为一个样式名，然后在data中定义，CSS属性名可以用驼峰式（camelCase）或短横线分隔（kebab-case，记得用引号括起来）来命名。直接用字符串引用：`<div v-bind:style="class1">`

同样你也可以使用计算属性来处理对应的style对象。

### &emsp;数组

同class的数组，style的数组也是同样的使用方式：`<div v-bind:style="[style1,style2]">`，同样也可以不加引号赋值。

### &emsp;自动适配

Vue会给一些特殊的CSS属性针对不同的浏览器自动加上前缀。如transform属性。这就减少了一定的适配的麻烦。

### &emsp;多重值

style的多重值也是为了前端的适配而产生，不过你也可以在其他很多地方使用到。它是对象与数组的同时使用。如`<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>`。这样写只会渲染数组中最后一个被浏览器支持的值。在本例中，如果浏览器支持不带浏览器前缀的flexbox，那么就只会渲染display: flex。

&emsp;

## 动态参数

从2.6.0开始，可以用方括号括起来的JavaScript表达式作为一个指令的参数。

如`<a v-bind:[attributeName]="url"> ... </a>`，这里的attributeName会被作为一个JavaScript表达式进行动态求值，求得的值将会作为最终的参数来使用。例如，如果你的Vue实例有一个data属性attributeName，其值为"href"，那么这个绑定将等价于v-bind:href。

同样地，你可以使用动态参数为一个动态的事件名绑定处理函数：`<a v-on:[eventName]="doSomething"> ... </a>`，在这个示例中，当eventName的值为 "focus" 时，v-on:[eventName] 将等价于v-on:focus。

### &emsp;值约束

动态参数预期会求出一个字符串，异常情况下值为null。这个特殊的null值可以被显性地用于移除绑定。任何其它非字符串类型的值都将会触发一个警告。

### &emsp;表达式约束

动态参数表达式有一些语法约束，因为某些字符，如空格和引号，放在HTML attribute名里是无效的。例如：`<a v-bind:['foo' + bar]="value"> ... </a>`变通的办法是使用没有空格或引号的表达式，或用计算属性替代这种复杂表达式。

在 DOM 中使用模板时 (直接在一个HTML文件里撰写模板)，还需要避免使用大写字符来命名键名，因为浏览器会把 attribute 名全部强制转为小写：`<a v-bind:[someAttr]="value"> ... </a>`，在 DOM 中使用模板时这段代码会被转换为 `v-bind:[someattr]`。除非在实例中有一个名为"someattr"的 property，否则代码不会工作。

&emsp;

## 总结

v-bind指令不止针对于样式的绑定，而是面向所有的属性的数值，只是因为样式比较复杂，所以这里针对v-bind重点讲的是样式绑定。对于静态不会被改变的样式使用原生的绑定也足够，如果我们需要动态改变样式就可以使用v-bind。

原来的样式乃至属性，都是一条线地绑定到对应的属性名上，而v-bind将这种联系切割开，然后使用data中的值来保存这种对应关系。而如果原来我们需要改变样式，我们就必须获取DOM元素，然后对DOM元素来修改，这种直接操作DOM的方式是不被推荐的，而Vue采取与其他框架同样的处理方式，将元素对应的属性剥离到JS，然后根据获取的属性渲染组件，如果属性改变就重新渲染，这样我们要改变属性，直接改变对应的数值，也不用去获取DOM元素了，这对DOM树起到了保护的作用。

同时Vue的v-bind指令的使用也有一定的规律，一般使用""就是直接获取data属性值，而"{}"就是直接获取字符串的值，这和我们原来的使用不太一样，如果是不用任何符号就是变量，如果加引号就是获取字符串。不过我们也可以按照负负得正来理解这种使用差异。

class主要是使用的整块的样式赋值，而style更针对的部分的样式。对象的赋值方式更关注的是这个样式是否被赋值，这些可能被使用的样式都是已知的，而数值的方式更关注的是多少类的样式被赋值，它不关心是谁被赋值，而是要求赋值的目的被达成。
