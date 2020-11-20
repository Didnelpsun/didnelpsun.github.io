---
layout: post
title:  "状态与参数"
date:   2019-12-02 22:38:14 +0800
categories: notes react typescript
tags: react typescript Ethernal props state 接口 sfc PropTypes DefaultProps
excerpt: "组件状态参数"
---

## 组件状态参数

我们通过第一步，应该已经完成了主页的构建，并将部分元素绑定了事件处理函数，那么现在我们需要做的就是将主页的部分内容不管分出来组件化。

何为组件化？不单单是将一部分代码放到另一个文件中再导入，更重要的是组件与组件之间的参数的传递和状态的改变。

### &emsp;1. tsx下的参数与状态

官方文档中已经写到了组件的状态和参数的使用，但是我们现在又提到一遍肯定是因为tsx下的参数与状态的使用有所不同。

在jsx中，对于参数的使用是在页面或者父组件中调用子组件，然后再在子组件中以参数属性="值"的方式写上相对应的参数的值，如：`<Hi name="jack" sex="man">`，然后在子组件的创建中以props.参数属性的形式使用参数（前提是参数名为props）。而对于状态的使用是利用constructor函数构建并给state赋值。

但是在tsx中，你直接这么做，都是会报错的，它会给出同样的错误：参数或者状态不存在。

为什么不存在？参数我已经在外部传进来了，而状态我就在组件内定义的啊，为什么不能定义状态？

我们应该明白tsx更严格，所以要求会更多，其实思考一下jsx中参数传入本身就不算很严谨，比如我在外面传入了一个参数，它在jsx中可以是任意类型的，但是我们不能保证如果在组件内使用该参数会不会会因为类型的问题而发生错误，会不会因为参数缺失而出错，而状态也是一样。

而tsx为了保证严谨，规定参数的个数和类型，原来的jsx就无法适应tsx。

### &emsp;2. 接口使用

那么如何让状态和参数都可用呢？答案就是使用接口。我们如果学过面向对象的编程语言就应该明白接口是什么，就是一种让一类多继承的解决方案。

首先应该申明接口，状态和参数都要声明对应的接口，用来说明状态和参数的个数和类型，并被组件类继承并实现，组件类提供了用来实现的接口。

<span style="color:aqua">格式：</span>

```jsx
interface propsInterface {
    key:type,
    ...
}

interface stateInterface {
    key:type,
    ...
}

class ComponentClass extends Component<propsInterface, stateInterface> {
    constructor(props: any) {
        super(props);
        this.state = {
            key:value,
            ...
        }
    }
    render(
        return()
    )
}
```

为了将state更改为不可更改，防止直接修改state而造成修改无效的问题，可以如下解决：

```jsx
public readonly state: Readonly<stateInterface> = {
    key:value
}
```

### &emsp;3. 无状态组件sfc类型

在react基础的学习中我们已经学习了[jsx下面的无状态组件]({% post_url /notes/react/2019-05-18-react-state-and-life-cycle %})（在2.4），其实有状态和无状态的定义的组件差不多，而在tsx下面定义无状态，即可以像原来一样直接实现接口：

```jsx
interface propsInterface {
    key:type,
    ...
}

class ComponentClass extends Component<propsInterface, {}> {
    constructor(props: any) {
        super(props);
        }
    }
    render(
        return()
    )
}
```

也可以使用sfc：

```jsx
interface propsInterface {
  key:value
}

class componentClass extends React.SFC<propsInterface>{
  constructor(props){
      super(props);
  }
  render(){
    const {key} = props;
    return (
    )
  }
}

export default componentClass;
```

或者：

```jsx
interface propsInterface {
  key:value
}

const componentClass: React.SFC<propsInterface> = props => {
  const {key} = props;
  return (
  )
}

export default componentClass;
```

优点有：

1. 适当减少代码量，可读性增强；

2. 无状态，统一移交给高阶组件（HOC）或者 Redux 进行管理；

3. 这种模式在大型项目或者组件中经常被使用，未来 React 也会对 SFC 做一些专门的优化；

### &emsp;4. 参数类型与默认参数

PropTypes：接受的 props 类型强校验。（代替了 React.createClass 中的 getDefaultProps）

DefaultProps：对应 props 要是值为空，则使用 DefaultProps 中对应的值。

```jsx
componentClass.propTypes = {
  key:type,
  ...
};

componentClass.defaultProps = {
  key:value,
  ...
};
```

如：

```jsx
TodoItem.propTypes = {
  content: PropTypes.string.isRequired,
  index: optionalArrayOf: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onDelete: PropTypes.func,
};

TodoItem.defaultProps = {
  content: 'default Value'
};
```
