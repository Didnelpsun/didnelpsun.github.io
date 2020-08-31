---
layout: post
title:  "安装与介绍"
date:   2019-05-12 18:45:21 +0800
categories: notes react base
tags: react 基础 结构 ReactDom jsx
excerpt: "安装结构与jsx"
---

## react安装并建立项目

感觉非常奇异的官方文档对于react的安装提供了多种方式，对于一般使用的方式倒是不怎么重视，我选择使用安装react脚手架的方式是通过npm：`npm install -g create-react-app`。然后cd到指定目录，使用`create-react-app app名字`来搭建react项目（当然要首先到需要创建项目的目录下），它默认完成所有操作，进入这个项目后使用`npm start`或者`yarn start`（如果安装了yarn的话）来启动项目。

&emsp;

## react项目结构

```markdown
react-project/
├──node_modules/
├──public/
│    └──favicon.ico
│    └──index.html
│    └──logo192.png
│    └──logo512.png
│    └──manifest.json
│    └──robots.txt
├──src/
│    └──App.css
│    └──App.js
│    └──App.test.js
│    └──index.css
│    └──index.js
│    └──logo.svg
│    └──serviceWorker.js
│    └──setupTests.js
├──.gitignore
├──package.json
├──README.md
├──yarn.lock
```

我们会看到一些奇怪的文件。它们各有不同的用处

manifest.json里面是配置logo图标的，这是一个描述的应用程序的Web App清单。Web应用程序清单在JSON文本文件中提供有关应用程序的信息（例如名称，作者，图标和描述）。 清单的目的是将Web应用程序安装到设备的主屏幕上，从而为用户提供更快的访问权限和更丰富的体验。

robots.txt是一个纯文本文件，在这个文件中网站管理者可以声明该网站中不想被robots访问的部分，或者指定搜索引擎只收录指定的内容。当一个搜索机器人（有的叫搜索蜘蛛）访问一个站点时，它会首先检查该站点根目录下是否存在robots.txt，如果存在，搜索机器人就会按照该文件中的内容来确定访问的范围；如果该文件不存在，那么搜索机器人就沿着链接抓取。另外，robots.txt必须放置在一个站点的根目录下，而且文件名必须全部小写。不过目前的robots文件是还没有配置的。

App.test.js是React自己的测试文件，你可以通过`npm test`或者`yarn test`命令启动测试文件。

serviceWorker.js是负责离线缓存，用来在本地保存加载的资源，以便后面启动程序会更快。

setupTests.js是一个导入测试库的文件，上面的App.test.js能被启动测试也是因为这个文件导入了测试库，而且这个文件不能是别的名字而必须是setupTests.js这个名字。

所以从上面得知，我们如果想开始编写我们自己的程序，至少可以删除掉logo192.png、logo512.png、manifest.json、logo.svg四个文件，不过暂时我们不用删。

&emsp;

## ReactDom与JSX

首先我们看index.html，看他的结构平平无奇，就是一个普通的html网页结构，不过我们要注意这里面有一个元素的id是root。而且index.html里面没什么东西，但是我们通过脚手架启动时会发现一些图片啊链接啥的，这些是哪里来的？

那么我们再看看src下的index.js，index页面的逻辑文件，上面的东西也非常少，只有

```javascript
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

这个语句比较独特，这是什么？不论你有没有学过其他框架，其实这都是可以理解的。

### &emsp;render元素渲染

我们在使用React前就明白了React有一个独特的特性，就是模拟DOM元素，而减少原生DOM操作，那么React是如何实现的呢？就是通过react-dom的包，我们初始化一个React项目，它就是React初始化下载的三个主要的包之一。

主要的方法`是ReactDOM.render(...)`， 是渲染方法，所有的 js,html 都可通过它进行渲染绘制，他又两个参数，内容和渲染目标 js 对象。

<span style="color:aqua">格式：</span>`ReactDOM.render(内容，渲染目标js对象)`

内容就是要在渲染目标中显示的东西，可以是一个React部件，也可以是一段HTML或TEXT文本。渲染目标JS对象，就是一个DIV或TABEL,或TD 等HTML的节点对象。

<span style="color:red">警告：</span>return返回的HTNML元素只能是一个整的，而不能是多个。

\<React.StrictMode>表示这个所包裹组件下的JavaScript的是严格模式。

`unmountComponentAtNode()` 这个方法是解除渲染挂载，作用和 render 刚好相反，也就清空一个渲染目标中的React部件或 html 内容.如`ReactDOM.unmountComponentAtNode(div);`

所以我们应该清楚了，首先首页html文件中主要就一个元素root，我们在js文件中将app元素挂载到root元素上，就呈现了相关的效果。

### &emsp;JSX

那么app元素是什么呢？准确来说app是一个组件，App.js和App.css构建了这个app组件。

我们可以看一下App.js的内容：

```jsx
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
```

App就是一个组件，被挂载了。我们可以在这里更改内容，以改变组件样式。import导入相关资源和包。

我们可以看到这里有一个奇怪的表达，一个App类return返回一些HTML元素，里面还有一些JavaScript语言，这些混合的东西是什么？这就是React的独特JavaScript扩展JSX格式。（如果是使用Typescript就是Tsx）

虽然现在是App.js，但是在index.js中更改引用组件格式：`import App from './App.jsx';`，然后将App.js改为jsx格式，运行成功。

<span style="color:orange">注意：</span>在JSX中许多原本的属性换成了别的名字，如class会与JavaScript的class类冲突就改成了className，还有许多用-连接的属性都改成了小驼峰式。

### &emsp;使用变量

在{}之中的就是JavaScript语法，我们可以在{}中使用JavaScript来调用一些变量。

如：

```jsx
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

这些HTML元素可以使用JavaScript变量外包裹大括号进行赋值，也可以使用引号包裹字符串进行赋值，但是同一处只能使用其中一种方式。

同时JSX允许将HTML元素如同JavaScript对象一样在流程控制等地方使用，如`if x>1 return <h1>hello</h1>`。但是JSX在HTML中只能使用JavaScript表达式而不能使用多行JavaScript语句，也就是不能换行。

这个HTML元素可以有多个HTML元素组合在一起，但是必须由一个且仅有一个大的HTML元素包裹起来。

### &emsp;JSX与HTML转换

我们发现了React的JSX的使用后，觉得的确十分方便，但是我们又有一些疑惑，这是怎么将HTML与JavaScript对象相互转换的呢？官方文档已经给出了一些解释：

```jsx
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);

const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);

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

对于ReactDom还有需要说明的是，与很多框架的某些概念类似，React元素是不可修改的，如果一定要修改就必须使用ReactDom.render()重新渲染需要更改的部分。同时React会跟新需要更新的部分，而不会整个元素树重新的渲染。

&emsp;

## 开始项目

我们现在开始修改React脚手架给我们的项目，首先删除logo192.png、logo512.png、manifest.json、logo.svg四个文件。删除对应的依赖，主要在index.html和App.jsx中。（后面的组件全部使用JSX格式文件）。

删除index.html的`<meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#000000" />`。

删除App.css内所有内容，删除App.jsx的return中的内容，仅保留最外面的一层class为App的div元素，这时你会发现你的页面全部为空白。

### &emsp;JavaScript表达式

然后尝试在HTML中使用JavaScript常量：

```jsx
// App.jsx
import React from 'react';
import './App.css';

function App() {
  const username = 'Didnelpsun'
  return (
    <div className="App">
      <div>{username}</div>
    </div>
  )
}

export default App;
```

或者：

```jsx
// App.jsx
import React from 'react';
import './App.css';

function App() {
  const username = 'Didnelpsun'
  const username2 = 'Reactjs'
  const check = 1
  return (
    <div className="App">
      {check>0?username:username2}
    </div>
  )
}

export default App;
```

![打印didnelpsun][didnelpsun]

### &emsp;使用方法

尝试使用方法等控制输出，方法返回值可以为HTML元素：

```jsx
// App.jsx
import React from 'react';
import './App.css';

function App() {
  const username = 'Didnelpsun'
  const username2 = 'Reactjs'
  let check = (state) => {
    if (state>0) {
      return <div>{username}</div>
    }
    else {
      return <div>{username2}</div>
    }
  }
  return (
    <div className="App">
      {check(-1)}
    </div>
  )
}

export default App;
```

![打印Reactjs][reactjs]

### 内联Style必须为一个对象

我们一般在HTML元素上内联样式，一般赋值字符串就可以了，但是React会报错：Style prop value must be an object，所以我们必须包上一个大括号转换为对象，但是这样还是不行，必须加上两层大括号才行。

最外层的大括号满足style属性必须绑定Object的要求，而{}表示的其实是一个JavaScript对象，里面应该表示的是JavaScript变量或者JavaScript常量，而不是字面量，如果我们之前已经定义了一个JavaScript样式对象，那么可以直接赋值，但是我们现在写的是字面量，所以必须再在外面加一层{}，将字面量转换为JavaScript变量。

或者从另一个角度来说，Style都是默认绑定字面量字符串的，但是React要求所有属性必须用{}来绑定，所以就需要加上两个大括号，从字面量转换为JavaScript变量再转换回字面量。

{% raw %}

```jsx
// App.jsx
import React from 'react';
import './App.css';

function App() {
  const username = 'Didnelpsun'
  const username2 = 'Reactjs'
  let check = (state) => {
    if (state>0) {
      return <div style={{'color':'red'}}>{username}</div>
    }
    else {
      return <div style={{'color':'aqua'}}>{username2}</div>
    }
  }
  return (
    <div className="App">
      {check(-1)}
    </div>
  )
}

export default App;
```

{% endraw %}

![打印天蓝色的Reactjs][aquareactjs]

[React项目1源码：React/demo1_start](https://github.com/Didnelpsun/React/tree/master/demo1_start)

[didnelpsun]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAAAjCAYAAACuJpVrAAAFDklEQVR4Ae2Zv2vjSBTH58+YVuAmkCLuojKCFDZsI0hj2CKoCuKKxaQ4RBojtlhECmOuOEyKBbk4sIsFpzhQmoC2MHi7pFjwFlu42EJFChUpvseMZHk0ln2yfbs5lAmYzDjz4733mTfvvQmB+qmsBUhlNVOKQcGt8CFQcBXcClugwqopz1VwK2yBCqu2l+dGtzY0asCbxKVMFHYICHERlhq9z6A5/DMC0vn5O+0j5c+em8D97sMkzPD5j3ZswLzw4H+eF8oxH1kKbqFl/h9f5uAaV0MEdwGCuzH8rgfv0oJxSDl0+sbDNNpPaOW5+9lv29k5uOagyENjzG8d6MyrG33Mtt1BGK/gCsb4Bc0ScBMpok82KCGwRru7r4L7C4gKW5SGC0zhHRGQizEyvJ9dEGLC/y6syJrRA4YdC3otieFaw0Z/EqEI7nxgpklWhIdBG800DGjHFnqTbCdhgwhh187G0cMm7G64lImPLEqoQriEgN9OP0L0Lpo4oEw+Dfq5i+GjnBTGeBi5sE4O+KFOxnkIM5GE9QTpeLPALtvrKS+6fX8LuFiFU6AEnkK4xwSkZsIdjHkMHw9cmDUdOvteypYTpW24HQPGuz7GLObf9mHzsU30v4pKzeC/pSC0CWex9k0bBiWg4qHDBrh/+HBPDFjdNL8Y9WCxvWgL/rflXtNrHYQaaN8kOgSjHuyGJRzkXeCW1XMpxz6treDOPi68LN1yBW6MsFNfMRQfPR/C5p6SL4USuAR6J0TOd7720SQE9etppl8y1sxBYH+M7x3USR3el8XQ9XD5TSNA5DOeArSZbNkBmcJl/atNpdQucMvpudBi399bwZ1e1/OetwI3hMOAfFgCEQUMr9Z57iqwLAxkBp6hf0pALoP8IeAbJPsuE8INcAvnA4luTlqDz9BvEJBjV7iGRU1Yexe4ZfSU99m9vwXcGMElATkVMmYZblovt//O+WAm3eaYmw1LGymgMx9JDp8YU67Fc/3s0WI9XPNjcb6f3Qpp/hB/6cHkOYOG5kUP48cs2Kby7QI3f2slC8l6ynbYvV8ebhzAoZJXroHr3BcL9F/A1X/301qc1ePSJwOwAW5huQcsYv9YZPgcYTryYDc0Xutr50OhFKwMXBZL9dXMWIYbjWETAuPPIu9IPb8woSpzotNsfc21mj9O6+HSzLvFGalsRx6KAwow/9RGfZFt86kJXPp+dYZ8C7DhyXdl9BTl2q/97577PEfwvglKKFoDCZoMd5GlHjkInyTBHns8QSrOlsspPf3AYn5R3JL2WsiRA5le67SNnHeyqWnypgvJG57lNdN8IhuT5gArDztpvJZKxBeHKz8/OotakJUEIwks030FLhBP3OQ1i9Wpo+TaHHYtGCcu3N/WJVTl4GZlFhVKmbsAwxsHdsMT/iGx3nONty3oNRNeKts4LaV48pQdyBBujdXPy+fY/jsDlORLs/lfLV4Da2cehryE8+G80dC+tFduuReHm0tOWHF/avE6bybGIfFAF8Blf44fh3DPdWjsyZIe8IQk/FFQJ+9yXUkPJGx948xG73YmZNHr4ZqDGaJJP4ujpKbD6gzxkIFlGswRdJbv6nyPcw/jb3KiGOceXuhhC959VHjoXw6uCKyy7Q0JUEV1TmJuRZXLq6Xg5u1RqZ6CWymceWUU3Lw9KtVTcCuF87Ur84oSqteHWsGtMHMFV8GtsAUqrJryXAW3whaosGrKcysM9x9UofOkiSMeXQAAAABJRU5ErkJggg==

[reactjs]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAeCAYAAABpE5PpAAAEXUlEQVRoBe2Yv2vjSBTH358xrSGNIcVuZ5UruGINaQRuBFsYc4VRtZgUh0ljRIpgrjDiiiC2WJCLBaUIKMWB3ATkIqDr4mLBW7hQsYWKK1Sk+B4zkmxJdvxDDt7NngNB0nhm3puP3nzfGxGOfzsToJ1HHAfgCK1EEByh/V+hhXcaKkxG/yEqgWD3IXGkzSwoRKDcP0P1XQv6zSMO48ruzqcjgpvWj4MmX9hwRy7ckQNr0IX2viJASpf+TwEuHBvQzvrwU1o/6JqLNGUYFNyI4F28BZEKu/hToechHoOhAiId3iGMrbGxARqAsS6iTR+vmeVAP70eaPddEMkwv+bJRBMbelNCRehgBVJThz1ZVr9gZEBrpP0YqmcdWCv68dnzfQmVWgv9cQis1FwC9ZKYEy9WgTXL+hjCG2hQarHEEKui3rYxzXYpeb8h0qawPjDQezNnLBrrkIggNQ3YQgNt9BvcOQn9fzKeiMVUoPQsOLzfnQmtRiCmws4tMILXk0DEIP+ezunCHmjo3ARAFMAfubAvZBC1YAibLtxJGBtbghbCaTPQiYL+DddoF85Qh3r6Mls7By2fCDpQTxnYuy7c7xkQkQf9DeHthVdIDlNYDQK1HSRLAR5smMWomhiQiaB8Xrzz8FYDIwZ1uGjLWJzfPrs9i9ACG2rBhpjkaT7VXjc5aPmSo4r6YDlrRn93Vm5X7sX08zZC7UHnWzrdWghi2E17AfuZJW0NLXLRZQT2wcL0hUBlXcpBm2fPpxDen3UwqkC7m8eNGBc7Xqzpss95bYlmPuxPffTPW5B/kyGdJH3n0GKI8vX6KOPGt4bGX+BtBzLjUlCF2rPgzZb1Ngtil/vV0MQMiS4wDU5me8aOZ3Ql1Zf51Ucg/IvgXcpi21XPNHSvDFh3LtyxCS0XaTG07HZ9bgG7QBNzRAHcT7HMCL28LErKc5bWt6+BBmBmQ2V5/eL6syqbLplJMt4yDA/dHDQf/TcFLVyaLG7YGdp8nhCPf3HpYHiJ0mk9NB7m13WRFfX0XPfdRovyIOe+ZW8edDAidO+zjQDXRN6+0LSMjfH6LRRDW1FoFxNB3mT89C0+Kmq3eblZ1XVT20ZoiHzovEyoLY4v06EqFl5p6PGWE+WEBeNcRetLcnRIxJhqLRhJ2revFFTbmoCehQYkpQ1lyhN+lLtKSo50FeP4RUh/WOKoZ3xJDlRFaDML6qkKfegkx8KkJGIduP+mk5W/boaGRXTUM2ItCtGzahw1xAtRGa2eBT+jf9HEQiftIwTZwfSpmD0T558CuIViVG7qcL5moy+CP1BR5QJPFdSvH+PBRWiRD7OtLJLOiQTl3Mz5Vh4ZfpGPkEVo+xDZYmwcaVt0/Jm7xFqnwdlfrrZa5i8ALYTdJFDDwqE+xLxSaD6MjyackQPzI68FJcyz+1axsl+nVwrtEWbygVR8Cbk/0L5MWL9SaPtFyr6jj9BKEDxCO0IrQaDEkGOkHaGVIFBiyH8i42XMUkrNdgAAAABJRU5ErkJggg==

[aquareactjs]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAhCAYAAABObyzJAAADF0lEQVRoBe2YIVPEQAxG72dgkUgkFolEYpFIJBaJRGKRSCQWiURikUhkmNfZbyeX2Wu522vvrrOZ6fS6zSabt0m2sLAmVQQWVbPbZGsAK5OgAWwAKwlUTm8Z2ABWEqicPosM/DGzYzN7qISxyfQM8NKsO5IZ0HViZvdm9ruJ5QnnfO8LwHMze0vXs5ndJJhnewKRTGNNHxNuzpCrpQwkC6O8J4gv8cUOnsk0Fsya9kUGAbJQlCjlXctBA3wK9OiLQKV5A5gyL2UpQVN20qOv0h5KEnX9wVDq0Xn30xqiXTLVz7sws6+S44qxvAYclUqYRaHkHQMPYIJG3+QERC+ehIxh9zX1VvXVCFutgj7MO2xyv03B0fd4xt6j69WKnXEPEH9aD7Z4vhqh/PHRCUHGQwSHR2mx0uNO5p0WDhbBptlLYuYyjh+/WejjB3990lfCESC2vI8+uzXvlgDy4C9SPn7C8IxOCQxZyruhJs8GoCcpgdc7f18H4F3aFF853ta2fuc42C2/Y0AgKyg5LwqCiasuX0oAp/QobTKPstc82QUo74ZEvksbhE3vF3DYZHyM0tVasd9JBMig+gh3iYLwfUjfjrqjg2gTODjICAJER30wqXUtwW+exuNdvv8DUHPxB0ACBWisKOlteu8FiFGc+35Hv2JSqYTjIkqbgg4ws2N3APneGW3xvAlA2flMPsn2bUqOY1Ww6mve8XWAumpBtABgeSEDGM+O0wnPs/fh5+i3ANISojDfl3B8zzMxxpZU0ltnLMexCiDGCAxF/QkFVCDwnaaypFQoa+BKlGkqdwKnnNHJjpMydhhjHbQM7DGmzxjZxC99VP40zlwPkMph3ehx6TOL39uUHEcfQGUNp7KEbGA3lU3ABIwgo8c8AEiHoICvDZEt3QmOdbAoLnqW77/oYZ9N4L1fD88eIC3GH1jY9WuTz9o7fmchEeBUQc0CoHpjzNYpIM4CoP7EA+TUcrAAOZjIOHodPXboBB8L7MECBByL9/+xGQtSn92DBdgX1JTvGsBK2g1gA1hJoHJ6y8AGsJJA5fQ/uNA9qe4069gAAAAASUVORK5CYII=
