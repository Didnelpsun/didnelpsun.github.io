---
layout: post
title:  "安装与介绍"
date:   2019-05-12 18:45:21 +0800
categories: notes react base
tags: react 基础 结构 ReactDom jsx
excerpt: "安装结构与jsx"
---

## react安装并建立项目

感觉非常奇异的官方文档对于react的安装提供了多种方式，对于一般使用的方式倒是不怎么重视，我选择使用安装react的方式是通过npm：`npm install -g create-react-app`。然后使用`create-react-app app名字`来搭建react项目（当然要首先到需要创建项目的目录下），进入这个项目后使用`npm start`或者`yarn start`（如果安装了yarn的话）来启动项目。

&emsp;

## react项目结构

```markdown
react-project/
├──node_modules/
├──public/
│    └──favicon.ico
│    └──index.html
│    └── manifest.json
├──src/
│    └──App.css
│    └──App.js
│    └──App.test.js
│    └──index.css
│    └──index.js
│    └──logo.svg
├──.gitignore
├──package.json
├──README.md
├──yarn.lock
```

对于有些文件可以删除，如manifest.json和App.test.js，都是用于测试的，而我们现在暂时还不需要。

&emsp;

## ReactDom与jsx

首先我们看index.html，看他的结构平平无奇，就是一个普通的html网页结构，不过我们要注意这里面有一个元素的id是root。而且index.html里面没什么东西，但是我们通过脚手架启动时会发现一些图片啊链接啥的，这些是哪里来的？

那么我们再看看index.js，index页面的逻辑文件，上面的东西也非常少，就`ReactDOM.render(<App />, document.GetElementById("root"));`。

这个语句比较独特，这是什么？

我们在使用react前就明白了react有一个独特的特性，就是模拟DOM元素，而减少原生DOM操作，那么react是如何实现的呢？就是通过react-dom的包，我们初始化一个react项目，它就是下载的三个主要的包之一。

主要的方法`是ReactDOM.render(...)`， 是渲染方法，所有的 js,html 都可通过它进行渲染绘制，他又两个参数，内容和渲染目标 js 对象。

<span style="color:aqua">格式：</span>`ReactDOM.render(内容，渲染目标js对象)`

内容就是要在渲染目标中显示的东西，可以是一个 React 部件，也可以是一段HTML或TEXT文本。渲染目标JS对象，就是一个DIV或TABEL,或TD 等HTML的节点对象。

`unmountComponentAtNode()` 这个方法是解除渲染挂载，作用和 render 刚好相反，也就清空一个渲染目标中的 React 部件或 html 内容.如`ReactDOM.unmountComponentAtNode(div);`

所以我们应该清楚了，首先首页html文件中主要就一个元素root，我们在js文件中将app元素挂载到root元素上，就呈现了相关的效果。

那么app元素是什么呢？准确来说app是一个组件，App.js和App.css构建了这个app组件。

我们可以看一下App.js的内容：

```react
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>欢迎来到菜鸟教程</h2>
        </div>
        <p className="App-intro">
          你可以在
          <code>src/App.js </code>
          文件中修改。
        </p>
      </div>
    );
  }
}

export default App;
```

app就是一个组件，被挂载了。我们可以在这里更改内容，以改变组件样式。

import导入相关资源和包，我们可以看到这里有一个奇怪的表达，一个app类返回一些html元素，里面还有一些js语言，这些混合的东西是什么？这就是react的独特JavaScript扩展jsx。（如果是使用typescript就是tsx）

虽然现在都是js文件，但是我们将其改为jsx，依然不会报错。

在{}之中的就是js语法，我们可以在{}中使用JavaScript来调用一些变量。

如：

```react
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);

ReactDOM.render(
  element,
  document.getElementById('root')
);
```

这些html元素可以使用js变量外包裹大括号进行赋值，也可以使用引号包裹字符串进行赋值，但是同一处只能使用其中一种方式。

同时jsx允许将html元素如同js对象一样在流程控制等地方使用，如`if x>1 return <h1>hello</h1>`。但是jsx只能使用JavaScript表达式而不能使用多行JavaScript语句。

这个html元素可以有多个html元素组合在一起，但是必须由一个且仅有一个大的html元素包裹起来。

我们发现了react的jsx的使用后，觉得的确十分方便，但是我们又有一些疑惑，这是怎么将html与js对象相互转换的呢？官方文档已经给出了一些解释：

```react
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);

===

const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);

===

// 注意：这是简化过的结构
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```

前两种代码都是等价的，而react会将以上两种代码转换为第三种的对象形式。

对于ReactDom还有需要说明的是，与很多框架的某些概念类似，react元素是不可修改的，如果一定要修改就必须使用ReactDom.render()重新渲染需要更改的部分。同时react会跟新需要更新的部分，而不会整个元素树重新的渲染。