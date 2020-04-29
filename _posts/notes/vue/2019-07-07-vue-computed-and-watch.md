---
layout: post
title:  "计算与侦听"
date:   2019-07-07 12:11:14 +0800
categories: notes vue base
tags: vue 基础 计算属性 computed 侦听属性 watch
excerpt: "计算属性与侦听属性"
---

## 计算属性

对于一些比较复杂的逻辑，比如一些数据的处理，就需要放在计算属性中来处理。如我们之前已经使用过的`message.split('').reverse().join('')`这个处理方法。我们可以放入计算属性中，即computed属性。

```vue
computed:{
    reverseM:function(){
        return this.message.split(' ').reverse().join(' ')
    }
}
```

我们直接可以通过`实例名.计算属性名`的方式来获取到对应的计算属性。这个计算属性依赖于对应的data属性。

### &emsp;计算属性与方法

我们可以将这个计算属性作为JS表达式直接放在HTML中，也可以作为方法放入methods中，所以我们要把这个计算属性作为计算属性呢？

不同的是计算属性是基于它们的响应式依赖进行缓存的。只在相关响应式依赖发生改变时它们才会重新求值。这就意味着只要message还没有发生改变，多次访问reversedM计算属性会立即返回之前的计算结果，而不必再次执行函数。

而于此不同的是如果放入HTML中，它会因为页面的改变而跟随组件的创建和销毁而重新计算。而对于方法而言，它一旦重新渲染，调用方法会自动再次执行函数并计算。

也就是如果你有相关的属性或者计算需要依赖一个数值，而且需要使用很多遍，你将它作为方法来调用肯定不合适，因为多此使用就会多次重新计算，这样会加大处理压力，而计算属性将这个数值作为缓存，可以减少处理时间。

### setter和getter

计算属性默认只有一个getter，不过你也可以提供一个setter。

```vue
computed: {
    fullName: {
        // getter
        get: function () {
            return this.firstName + ' ' + this.lastName
        },
        // setter
        set: function (newValue) {
            var names = newValue.split(' ')
            this.firstName = names[0]
            this.lastName = names[names.length - 1]
        }
    }
}
```

当我们使用vm.fullName = 'John Doe'时，setter会被调用，vm.firstName和vm.lastName也会相应地被更新。

&emsp;

## 侦听属性

Vue提供了一种更通用的方式来观察和响应Vue实例上的数据变动：侦听属性。当你有一些数据需要随着其它数据变动而变动时，你很容易滥用watch——特别是如果你之前使用过AngularJS。然而，通常更好的做法是使用计算属性而不是命令式的watch回调。

\<div id="demo">{{ fullName }}</div>

```vue
var vm = new Vue({
    el: '#demo',
    data: {
        firstName: 'Foo',
        lastName: 'Bar',
        fullName: 'Foo Bar'
    },
    watch: {
        firstName: function (val) {
            this.fullName = val + ' ' + this.lastName
        },
        lastName: function (val) {
            this.fullName = this.firstName + ' ' + val
        }
    }
})
//计算属性
var vm = new Vue({
    el: '#demo',
    data: {
        firstName: 'Foo',
        lastName: 'Bar'
    },
    computed: {
        fullName: function () {
            return this.firstName + ' ' + this.lastName
        }
    }
})
```

### &emsp;侦听器

虽然计算属性在大多数情况下更合适，但有时也需要一个自定义的侦听器。这就是为什么Vue通过watch选项提供了一个更通用的方法，来响应数据的变化。当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的。

```vue
<div id="watch-example">
  <p>
    Ask a yes/no question:
    <input v-model="question">
  </p>
  <p>{{ answer }}</p>
</div>
<!-- 因为 AJAX 库和通用工具的生态已经相当丰富，Vue 核心代码没有重复 -->
<!-- 提供这些功能以保持精简。这也可以让你自由选择自己更熟悉的工具。 -->
<script src="https://cdn.jsdelivr.net/npm/axios@0.12.0/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js"></script>
<script>
var watchExampleVM = new Vue({
  el: '#watch-example',
  data: {
    question: '',
    answer: 'I cannot give you an answer until you ask a question!'
  },
  watch: {
    // 如果 `question` 发生改变，这个函数就会运行
    question: function (newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    }
  },
  created: function () {
    // `_.debounce` 是一个通过 Lodash 限制操作频率的函数。
    // 在这个例子中，我们希望限制访问 yesno.wtf/api 的频率
    // AJAX 请求直到用户输入完毕才会发出。想要了解更多关于
    // `_.debounce` 函数 (及其近亲 `_.throttle`) 的知识，
    // 请参考：https://lodash.com/docs#debounce
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
  },
  methods: {
    getAnswer: function () {
      if (this.question.indexOf('?') === -1) {
        this.answer = 'Questions usually contain a question mark. ;-)'
        return
      }
      this.answer = 'Thinking...'
      var vm = this
      axios.get('https://yesno.wtf/api')
        .then(function (response) {
          vm.answer = _.capitalize(response.data.answer)
        })
        .catch(function (error) {
          vm.answer = 'Error! Could not reach the API. ' + error
        })
    }
  }
})
</script>
```

在这个示例中，使用watch选项允许我们执行异步操作 (访问一个 API)，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。
