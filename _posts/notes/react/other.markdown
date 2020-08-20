# 组件生命周期

## 纯类组件

如果你对于组件还是不怎么了解，可以跳过这个内容，如果你已经十分清楚了组件的使用，那么可以继续看这个内容。

类组件分为普通类组件（React.Component）以及纯类组件（React.PureComponent）,就是extends继承哪种类的区别。

PureComponent，这是react15新加的东西。

使用方法就是`class 组件名 extends React.PureComponent`。

Component和PureComponent的区别：  
先了解下React生命周期函数（会在以后说到）shouldComponentUpdate，这个函数返回一个布尔值，如果返回true，那么当props或state改变的时候进行更新；如果返回false，当props或state改变的时候不更新，默认返回true。这里的更新不更新，其实说的是执不执行render函数，如果不执行render函数，那该组件和其子组件都不会重新渲染。

1>继承PureComponent时，不能再重写shouldComponentUpdate。  
2>React.PureComponent基于shouldComponentUpdate做了一些优化，通过prop和state的浅比较来实现shouldComponentUpdate，也就是说，如果是引用类型的数据，只会比较是不是同一个地址，而不会比较具体这个地址存的数据是否完全一致。

纯类组件是为了优化渲染而出现的，当组件更新时，如果组件的 props 和 state 都没发生改变，render 方法就不会触发，省去 Virtual DOM 的「生成」和「比对」过程，达到提升性能的目的。

React 做了如下判断：

```jsx
if (this._compositeType === CompositeTypes.PureClass) {
  shouldUpdate = !shallowEqual(prevProps, nextProps)
  || !shallowEqual(inst.state, nextState);
}
```

这里的 shallowEqual 会比较 Object.keys(state | props) 的长度是否一致，每一个 key 是否两者都有，并且是否是一个引用，也就是只比较了第一层的值，因为比较很浅，所以深层的嵌套数据是对比不出来的。

<span style="color:orange">注意：</span>

1. 如果 PureComponent 里有 shouldComponentUpdate 函数的话，React 会直接使用 shouldComponentUpdate 的结果作为是否更新的依据；只有不存在 shouldComponentUpdate 函数，React 才会去判断是不是 PureComponent，是的话再去做 shallowEqual 浅比较。也因为可以少写 shouldComponentUpdate 函数，倒也节省了点代码。

2. 因为只做了浅比较，所以需要注意 state 或 props 中修改前后的对象引用是否一致；

3. 由于是React15.3之后才有的，所以可能需要进行兼容操作；

```react
import React { PureComponent, Component } from 'react';
class Foo extends (PureComponent || Component) {
  //...
}
```