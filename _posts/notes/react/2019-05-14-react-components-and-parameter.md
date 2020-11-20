---
layout: post
title:  "组件与参数"
date:   2019-05-14 14:25:49 +0800
categories: notes react base
tags: React 基础 组件 参数 props
excerpt: "组件与参数"
---

## 组件

无论什么框架，主要目的都是追求简便代码，前端就是组件复用，React也是如此。

<span style="color:orange">注意：</span>组件名要大写。因为React会默认小写字母开头的组件为原生DOM元素。

### &emsp;声明方式

我们要使用组件首先要构建组件，声明组件的方式有两种：

#### &emsp;&emsp;1.function()函数  

```jsx
function 组件名(参数) {
  return(<组件内容>)
}
```

一个函数就是一个组件，return一份DOM解构，之前的App组件就是一个函数式组件。

特点:  

1. 没有生命周期，也会被更新并挂载，但是没有生命周期函数。
2. 没有this(组件实例）。
3. 没有内部状态（state）。
4. 因为无state，直接return，无render重新渲染。

优点 ：轻量，如果你的组件没有涉及到内部状态，只是用来渲染数据，那么就用函数式组件，性能较好。React中大部分的组件都需要写成函数式组件。

#### &emsp;&emsp;2.class()类  

```jsx
class 组件名 extends React.Component{
  render() {
    return(<组件内容>)
  }
}
```

默认JavaScript代码应该在render方法中，render方法外应该为构造器，访问器，组件属性和组件方法。

如我们利用上个文档所用的项目[React项目1源码：React/demo1_start](https://github.com/Didnelpsun/React/tree/master/demo1_start)，然后将App.jsx修改为一个类组件：

{% raw %}

```jsx
// App.jsx
import React from "react";
import "./App.css";

class App extends React.Component {
  render() {
    const username = "Didnelpsun";
    const username2 = "Reactjs";
    let check = (state) => {
      if (state > 0) {
        return <div style={{ color: "red" }}>{username}</div>;
      } else {
        return <div style={{ color: "aqua" }}>{username2}</div>;
      }
    };
    return <div className="App">{check(-1)}</div>;
  }
}

export default App;
```

{% endraw %}

类组件比函数式组件多了一个render()方法，这个方法是用来渲染组件的，而函数式组件也能渲染出来，但是函数式组件只能渲染一次，不同的内容都是依靠改变参数传入的，而类组件有状态state，所以就有一个render渲染方法，如果state改变，那么render就会重新执行并渲染，函数式组件不需要这个过程，所以就没有render方法。具体会在后面的状态部分讲到。

<span style="color:yellow">提示：</span>函数式组件也可以启用状态，不过需要使用Hook。

所以函数式声明组件有如下的优势：  

函数组件与基于Class声明的类组件比较，不需要声明类，可以避免大量的譬如extends或者constructor这样的代码不需要显示声明this关键字，在ES6的类声明中往往需要将函数的this关键字绑定到当前作用域，而因为函数式声明的特性，我们不需要再强制绑定。更佳的性能表现:因为函数式组件中并不需要进行生命周期的管理与状态管理，因此React并不需要进行某些特定的检查或者内存分配，从而保证了更好地性能表现。

### &emsp;组件使用

我们这里可以明白，所谓组件其实就是类，组件名就是类名（ES6前没有类的定义）

所以当定义了组件后，使用该组件就应该是以<组件名>的方式。

当组件不在当前文件需要引用：`import 组件名 from 地址`

<span style="color:orange">注意：</span>同时一定要在那个组件文件中的最后面使用`export default 组件名;`默认导出组件！不然是找不到这个被引用的组件的。

如我们在src文件夹下新建了一个components文件夹作为组件的文件夹，然后再新建一个User文件夹，再在里面新建一个User.jsx，构建一个命为User的函数式组件，作为输出用户名的组件：

{% raw %}

```jsx
// User.jsx
import React from 'react'

function User () {
    const username = "Didnelpsun";
    const username2 = "Reactjs";
    let check = (state) => {
      if (state > 0) {
        return <div style={{ color: "red" }}>{username}</div>;
      } else {
        return <div style={{ color: "aqua" }}>{username2}</div>;
      }
    };
    return (
        <div>{check(-1)}</div>
    )
}

export default User
```

{% endraw %}

然后在App.jsx中引用User组件并使用：

```jsx
// App.jsx
import React from "react";
import "./App.css";
import User from './components/User/User'

class App extends React.Component {
  render() {
    return <div className="App"><User></User></div>;
  }
}

export default App;
```

输出结果和原来的是一致的。

&emsp;

## 参数

之前使用的组件全部是不能改变数据的组件，而如果我们想传递一些数据到一个组件去，那么就应该使用参数。（只有自定义组件才能定义参数，原生的HTML是无法操作的）。参数可以为原始类型，可以为对象数组等，甚至也可以为子组件。

### &emsp;传递原始类型参数

参数一般命名为props，是一个对象，里面包裹着具体的参数，也可以取为别的名字。一般为：`function 函数名(参数名){}`或者`class 类名(参数名){}`。

参数的使用，在组件内部：`参数名.参数成员名`，父组件传值时为`参数成员名=""`。

如我们User.jsx中有个check方法，根据传入的数值大小返回对应的元素，目前是写死的，而我们可以用参数，从父组件App.jsx中传入对应的数值，这样就是活的数据了：

{% raw %}

```jsx
// User.jsx
import React from 'react'

function User (props) {
    const username = "Didnelpsun";
    const username2 = "Reactjs";
    let check = (state) => {
      if (state > 0) {
        return <div style={{ color: "red" }}>{username}</div>;
      } else {
        return <div style={{ color: "aqua" }}>{username2}</div>;
      }
    };
    return (
        // 注意因为是函数式组件所以没有this
        <div>{check(props.value)}</div>
    )
}

export default User
```

{% endraw %}

```jsx
// App.jsx
import React from "react";
import "./App.css";
import User from './components/User/User'

class App extends React.Component {
  render() {
    // 如果参数为常数就可以直接使用字符串
    // return <div className="App"><User value="-1"></User></div>;
    // 如果参数为一个JS变量就要使用{}括起来
    let value = -1
    return <div className="App"><User value={value}></User></div>;
  }
}

export default App;
```

React的数据是单向数据，父组件能影响子组件，而相反则不能，所以参数是只读的，不能改变自身接受到的参数。

### &emsp;传递对象与嵌套参数

同时组件内可以再嵌套参数，并且可以将参数传入大组件和大组件中的小组件，当然也可以将参数整个传入大组件，再由大组件去传入参数给小组件。

我们之前是根据传入的参数来返回对应的用户名和文字颜色，现在我们可以把这些数据全部改成参数。

思考这个逻辑，我们现在想打印一个名片，名片是一个组件，叫UserCard，用来作为展板，名片的底色作为参数，而UserCard上又有User组件用来展示User信息，新建UserCard文件夹与JSX文件，并修改对应内容：

```jsx
// App.jsx
import React from "react";
import "./App.css";
import UserCard from './components/UserCard/UserCard'

class App extends React.Component {
  render() {
    // 如果参数为一个JS变量就要使用{}括起来
    let value = {'name':'Didnelpsun', 'tel':'139959446' ,'color':'red', 'backColor': 'green'}
    // 请一定注意你子组件获取的prop是一个对象，必须把数据提取出来，根据对应属性
    return <div className="App"><UserCard value={value}></UserCard></div>;
  }
}

export default App;
```

```jsx
// UserCard.jsx
import React from 'react'
import User from '../User/User'

function UserCard(props) {
    let style = {"backgroundColor":props.value.backColor, "width":"10vw", "padding":"15px", "margin":"15px"}
    return (
        <div style={style}>
            {/* 只有取出props.value再传入，否则传入的值为{value:{value:{}}} */}
            <User value={props.value}></User>
        </div>
    )
}

export default UserCard
```

```jsx
// User.jsx
import React from 'react'

function User (props) {
    let check = (mes) => {
        // 错误，不能拼接字符串
        // return <div style={'color:'+mes.color}>{mes.name}</div>
        // 错误，不能使用连线式内联样式flex-direction和justify-content，必须使用小驼峰式
        let style = {"color":mes.color, "display":"flex", "flexDirection":"column", "justifyContent":"center"}
        return (
            <div style={style}>
                <div>{mes.name}</div>
                <div>{mes.tel}</div>
            </div>
        )
    };
    return (
        // 需要取出对应的value参数对应值
        <div>{check(props.value)}</div>
    )
}

export default User
```

如果要在组件的render中使用props，必须首先解析props为不同的变量。

### &emsp;使用解构与展开运算符

你也可以直接使用ES6的解构语法，将对象或者数组解构，来获取参数。

<span style="color:aqua">格式：</span>`const { 变量1，变量2 ...}=this.props;`

你也可以配合使用ES6的展开运算符，将props展开传入子组件。

<span style="color:aqua">格式：</span>`<组件 {...参数}>`

这样如果参数为一个对象，那么传入的参数就是一个个键值对，比如参数为`{number:1,value:'string'}`，传入的参数就是number和value。

传入用展开运算符，接受用解构，这种配合处理参数的方式要比自己手动处理快得多，而且能获取自己想要的数据丢掉不必要的参数。

更改原有代码：

```jsx
// App.jsx
import React from "react";
import "./App.css";
import UserCard from './components/UserCard/UserCard'

class App extends React.Component {
  render() {
    // 如果参数为一个JS变量就要使用{}括起来
    let value = {'name':'Didnelpsun', 'tel':'139959446' ,'color':'red', 'backColor': 'green'}
    // 请一定注意你子组件获取的prop是一个对象，必须把数据提取出来，根据对应属性
    return <div className="App"><UserCard {...value} ></UserCard></div>;
  }
}

export default App;
```

```jsx
// UserCard.jsx
import React from 'react'
import User from '../User/User'

function UserCard(props) {
    // 只需要backColor就只取出这个属性
    const {backColor} = props
    let style = {"backgroundColor":backColor, "width":"10vw", "padding":"15px", "margin":"15px"}
    return (
        <div style={style}>
            {/* 再重新展开传入参数 */}
            <User {...props}></User>
        </div>
    )
}

export default UserCard
```

```jsx
// User.jsx
import React from 'react'

function User (props) {
    let check = (mes) => {
        // 获取参数中数据
         const {name, tel, color} = mes
        let style = {"color":color, "display":"flex", "flexDirection":"column", "justifyContent":"center"}
        return (
            <div style={style}>
                <div>{name}</div>
                <div>{tel}</div>
            </div>
        )
    };
    return (
        // 直接传入props到构造方法中
        <div>{check(props)}</div>
    )
}

export default User
```

最后得到：

![卡片结果][card]

[React项目2源码：React/demo2_props](https://github.com/Didnelpsun/React/tree/master/demo2_props)

[card]:data:image/png;base64,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
