---
layout: post
title:  "条件渲染"
date:   2019-07-15 09:10:53 +0800
categories: notes vue base
tags: Vue 基础 v-if template v-else v-else-if key v-show
excerpt: "条件渲染"
---

## v-if指令

v-if指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 truthy 值的时候被渲染。

### &emsp;单元素渲染

如果我们要控制一个元素的条件渲染，那么我们只用将v-if直接绑定在一个元素上就行了。如`<div v-if="show">展示内容</div>`，然后在data中设置show值，true就是渲染，false就是不渲染。这个不渲染就是指它不会存在于DOM树上，不是hidden属性的隐藏，但是如果你查看源码，这个元素却的确有存在的痕迹，但是是完全被注释了：![注释][if]。

### &emsp;多元素渲染

如果你要使用v-if将多个元素进行条件渲染，那么你需要使用一个元素将需要渲染的元素包裹起来。如\<div>等。但是如果你这么做，你会发现Vue会将这个包裹元素也渲染出来，如果你不喜欢这个包裹元素，不想让这个元素被渲染，那么请使用\<template>元素包裹，这样最后的渲染结果中就不包含这个包裹元素了。

### &emsp;JS表达式

如果你需要根据JS表达式来判断是否渲染一个或者一组元素，你也可以在引号中直接使用JS表达式来判断渲染。如`<template v-if="4>2">`。同样你也可以引用data中的属性，如data中有一个show值为false，你可以通过`<template v-if="Number(show)+1">`来展示元素。

### &emsp;v-else与v-else-if

同原生的else和elseif一样，也是与v-if共同配合使用的。但是你要注意v-else-if和v-else所绑定的元素必须紧跟在带 v-if或者v-else-if的元素之后。

### &emsp;key属性

Vue会尽可能高效地渲染元素，通常会复用已有元素而不是从头开始渲染。这么做除了使Vue变得非常快之外，还有其它一些好处。例如，如果你允许用户在不同的登录方式之间切换：

```html
<template v-if="loginType === 'username'">
  <label>Username</label>
  <input placeholder="Enter your username">
</template>
<template v-else>
  <label>Email</label>
  <input placeholder="Enter your email address">
</template>
```

那么在上面的代码中切换loginType将不会清除用户已经输入的内容。因为两个模板使用了相同的元素，\<input>不会被替换掉——仅仅是替换了它的placeholder。

这样也不总是符合实际需求，所以Vue为你提供了一种方式来表达"这两个元素是完全独立的，不要复用它们"。只需添加一个具有唯一值的key属性即可：

```html
<template v-if="loginType === 'username'">
  <label>Username</label>
  <input placeholder="Enter your username" key="username-input">
</template>
<template v-else>
  <label>Email</label>
  <input placeholder="Enter your email address" key="email-input">
</template>
```

现在，每次切换时，输入框都将被重新渲染。所以它会将输入的内容删除。而\<label>元素仍然会被高效地复用，因为它们没有添加key属性。

&emsp;

## v-show

我们也可以使用v-show来设置元素，如`<div v-show="show">`，但是这种控制不是控制元素的渲染与否，而是控制元素的显示，即带有v-show的元素始终会被渲染并保留在DOM中。v-show只是简单地切换元素的CSS属性display。![v-show][show]

<span style="color:red">警告：</span>v-show不能和\<template>元素共同使用，不然会失效。

&emsp;

## v-if和v-show

v-if是"真正"的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。

v-if也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。

相比之下，v-show就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于CSS进行切换。

一般来说，v-if有更高的切换开销，而v-show有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用v-show较好；如果在运行时条件很少改变，则使用v-if较好。

[if]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAAATCAIAAABEJifTAAABfElEQVRIDWNUUVFhGBaAaVj4AuSJUZ8MvqgkPU40vFNTI6xFB51XSPfJoPMC1EEEfKLulZrqpY7h+M9vXmOI0VZA2DoiNcJKGI8leHwC0mzHd23dtpso+t9++IzCpw/n7dEVhz5rB2ELVqgDcPhEFOiLIK1Ph2avOPqWPk4lbMvNrbPXXeOzS031xkwkQN3YfALM0wFanw/Pno0WG4Qto7UKYMzMPvRUyg5bkcOCYbmwtYEUhiABAWGriCBtXqiiz9fWwWMSGLcBWgiJDSuOQjOYuneqHdyaZ4dnb70B1Q3MmXbSMOueHsIMzTfA1C3Nq2WqfhQ1oBmxt1YgLsBmEMySAaGBWTdIi/fZodlbUfMuyDHMQkJCWBz17fGVcw85jT08dDgfXnn8HVkFMO0FGnM+vvL4G7IoHdjAaPRQenNo9srjWLMutnwCdRU4UX7SCsJSCtPB3WhWAGPDjvfqOszEBleHI3XB5YcOA0+cDB1PgF066pPBF2HDJ04AGQhx4r6qudgAAAAASUVORK5CYII=

[show]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAAAZCAIAAABVS7frAAAJHUlEQVR4Ae1bXUwbVxY+Xe1biAkoXSMSi/Aj8tMmDi6rJA9YEBYWEGK1GK9UYYGC5Ox2+4JEkJ0gJKQICipIvGS3CxJVqkSVFlxpUZQ4UH5qovwI1lkTmlUsO9SaFtkJCdh1HpKnPffOeDzjn7FxoAth7gNz77nnnnPm+J57vnNHvFdQUABykz2wuz3wq939+vLbyx4gHpDDQN4HsgfkMJD3gOwBORvIe0D2AHpABkXyNpA9IIeBvAdkDwD8eoudYNT06GCiyj4b0lNwWdvyW3jYZxudCZH+n09l18K50wpqgftWVbXjbWzRnr9coWImO4cg1LFFiTuhtVTA+IDtKj9DKKrlyesXFnnShjslZ2tbi9LpMkYkfMOSdtaCPL3p3AlY/LLv3x9xndGnKb1BjDAoKys7cuRITGmPHj26c+dOzKltQ+z+2KqHbwq/HkrKIl9XcS8ynr9lrk+KPxFTcO0ngAPIRTuJuDdrfm76xtw0AI2xzZK5Y+SsPcOt/xGaSzupmR0jDO7evXvgwIG9e/dGSHzx4sX8/HwEkR1mfWLVgOXm34djzoqIrk7bJRHh3Rn8tBaEDPI6fCeZd1u06d4iDySj4d3lefpsjX05vsMOywoumrJdG0AcMcLg9evXVqtVr9cL3ffmzZvp6WmcEhJpn6gshHnbZ4IYKL1SU5nPc3q5HgFIWbQfFICiNP2Ytshnv/SpkC1NwMDLEXXI+R1SEbj/5Z+afEDyQA7LVO/kTnf3aO+nHRT5PBdgnuQyhkCFJ5n04h7t62TV8x3O5OaGxjrOMqQwHFX54VcG9R46iARFginkD+EcVX+beu2aI8OgzY25ipMrflDQxZE8Nt0Yak/vMNZq1tg+nYmEaqhImxtwDA4vzYmFRY8IHst0DL5Uc6iMU8GLVXFLeDrqOvVy8EFmawWdEmmhhrEQVURHGewU7wpO6ndDnd/RLt+hoxnXZwWKHlPN/oKkjuZ4tcHq6urCwkJxcTGnDQDzABL5IdehQD+NEecBEgNK50iVy4VctDbguIftlzBUaKQKBAVHb3uLdNml4J2l1NKTWeC2S1cO5V/9pf59++eFE1MCQdDxdVUH0GCIAEW+rtseq/7YeXBQpKTs+n0ORo40aiIxEFKB6tqdHwMBWnk607mTaUKtEERsKgVJSQxkOAYH6JYS4hbfUtPAEgDZcyKBSDGon8WuFtI1BrX92vULPiD7r0LbvCgoM8RS6EjVX7isG6A1Cgktbf8JLEL83Q8YS0VuMzC0REnvOKV69fBGuFyJIUeSlKNtBZtugIGwChahKdDUbh+uJZvY0hAKPIW69RQ6xDZH3914lpmb9oeDc5gcE+i0ViNAEnEYxzLcbC48oGt6TgpO2Di88cIA2XHfZ9OG/eXl5cXFqMxNj3zvRJVtViQ962g+HvY0BkT0+IPhFUanOWqEWZJP2OWhzBB/ESjySlpgakSCQzDV8ditr1Z3A2CctKiPKdYfz5JfJ35Tq/PX7/dyYTbVdK/eyS5/aunrtMRfFmNGdTzHb7+W+FiNWJpbqILFUN4QzC1P3qAbC+amHX8oUh9UAki9CXNhLLTYxzwJqA/vx0raD4vLyxXa4ycA8FdVqg4r/E++x43IN+bCwHV+kLiDJzdJMmhJWEUz2u+xsaaiRnHgMePc/mYeeaAuE89/PzUD6dwrX51zlBsOaZVLc9zb+buHN2ISsQZzwkwQ4XrPmHOkQXpDxgBFRAJtCI0MBgN2Z2aib3XKCs7kc3yiR1naPoCotCFiiRp4J+eDLZgEwAvGbFVwZTJanXjNVNMXgCe02Ww140QyiMXxzf0z7Ro1gKO8NE/hvtclHT8tyvdhXz4nn9PtJs8NZwNl+m+weONEJPnAXWjDFGFpI/x4TjeRwzJmS89IEAbkWBXgMXjFiWH+9dDfSiOt5INDezyO0H6NqSUFYvrBDHjlDoRX+l6+gkMkaOM1ZeYeUNW1NdaFGeK9dZgjYS+4GgRVWmGF0eUih2y8JhUGWAmw9UCskoCEmouAImvNUTEoiqdKgu6aXvnZRHARnMxibtsJmkrUMBJYRETQy0Klu1gMkKKWT80+/bMZcZE3+xjc/5sjal5MGPE9N68/7v0iKlo2ng3EgpMdhc5jAjNq+1djXaeSAPM/kUoFBDjV5fB4miCTwyED5r7/wWhAXBQ4mA/28RhpJ8SY2tP/4xpo2GOeFUB2eeBHtDZeJJA4gSnhVXJqmsOraNW6122/1JAQXCT4ioxwaGVlJSw5okeuffqc+3Q1Fy+H8PKM1xVMKzhLh+GaOGJd1HDGdc+dddSIiMj7X6mojVoI4H6+LqK6XwQgh+CfiDYy8a0753cLfzz9PFEqIAsdDve+03+tLI8QsvEhwQnphz9AKMLCZVoXJi/G538Wh7m5RL0n8INNMgzyMtMh8BLvE7GVnC3RIPrgm29pyqMqN5Zo1qJTAZYrjRbjhyU888Y7V50M/gwd3KZX9Vdg+eGQKj+Io1R1DfH8gzHcaGmrDQlMaBDuPVPhuuVm+OpFaolUNpBaF57jEJj2EyNblQdHrzgvmrQ9VmTxTvQ5z5g45wuvj4pMNUUmENbWs//xVuo0P89HVBphPcKe4A4HyQiKBKlgZOIfpXntejN+PcBGb4q4pUN2T70+x31bkApaKv9p5jdHtdVZDQH75zSxDFX3wi1zu1PTzq1OBnpxrKKHv3vcgSe6pQipzPg1hLyZ7LzgmxdARSN+VuPwj+iaiBIFdVku5SQS8O6FQ9LsLQorFSiuwGqElBBXx2zH27StbepWyj/u0QrjGndqHX65e7DpqYBasmgb3F/bamhkKylJaMdajuj/BqmkKRQkJNFlEU0vCnqg+BKCJcwDOrxsvCl90cKqpX/f203/dpPcPanAO9usS++UYt8gpWRp5D1pSkJ+sUXEWnKjFb9SSt2UBKAodcHbb6X6CqaC0SS/Lm8/8zfdIgJUliel71s3XWnqAsnVEzBTcW8LUpeMK98eFL2V+l9kcQj5kK9seGG661sIdJGTVQC3tq9fOIP5Wn/zLd1VoGjz3SdLfDc8sItA0bvxg8lvsRUekMNgK7wqy9xhHpDDYIf9YLK5W+EBOQy2wquyzB3mgf8BsQ3nmUFQaEsAAAAASUVORK5CYII=

[]