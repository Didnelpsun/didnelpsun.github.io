---
layout: post
title:  "参数传递"
date:   2019-07-29 08:29:20 +0800
categories: notes vue base
tags: Vue 基础 
excerpt: "参数传递与处理"
---

我们要复用组件，那么肯定组件中有不一样的地方，我们将相同的地方提取出来作为组件，而不同的地方则作为参数，传入组件中。

## 基础参数传入

我们将使用模块化系统来处理组件。首先我们还是使用上一个文档中的案例，其他文件跟使用Vue-cli搭建的Vue项目一致，更改HelloWorld.vue并新建一个Test.vue：

```vue
<!--HelloWorld.vue-->
<template>
  <div id="hello">
    <Test/>
    hello
  </div>
</template>

<script>

import Test from './Test'

export default {
  name: 'HelloWorld',
  components: {
    'Test': Test
  },
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
```

{% raw %}

```vue
<template >
  <div id="test">
    <span>{{value}}</span>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data () {
    return {
      value: 'Didnelpsun'
    }
  }
}
</script>
```

{% endraw %}

我们现在的目的是利用参数在HelloWorld.vue文件中改变Test组件的显示文字。

