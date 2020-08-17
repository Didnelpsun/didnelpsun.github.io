---
layout: post
title:  "下载与安装"
date:   2020-08-16 17:04:22 +0800
categories: notes webpack base
tags: webpack 基础 配置
excerpt: "配置项"
---

## 一般配置

### &emsp;使用require.context

如果我们觉得一个个显式地导出很麻烦，那么我们可以使用Webpack专门的导出API：

```javascript
let exportModules = {}

// require.context是一个webpack的api,通过执行require.context函数获取一个特定的上下文,主要用来实现自动化导入模块,
// 在前端工程中,如果遇到从一个文件夹引入很多模块的情况,可以使用这个api,它会遍历文件夹中的指定文件,然后自动导入,
// 使得不需要每次显式的调用import导入模块
// require.context函数接受三个参数，directory {String} -读取文件的路径，useSubdirectories {Boolean} -是否遍历文件的子目录
// regExp {RegExp} -匹配文件的正则，语法: require.context(directory, useSubdirectories = false, regExp = /^.//);


const re = require.context('./', true, /\.js$/);

re.keys().forEach(key => {
    let name = key.substring(key.lastIndexOf('/')+1, key.lastIndexOf('.'))
    exportModules[name] = re(key)
});

module.exports = exportModules
```

这时它打包出来和之前的结果是一致的。

### &emsp;使用development和production模式

所谓development和production模式就是开发和生产模式，我们之前应该对这两种模式有所了解。

在Webpack中，开发模式source map是很完备的，可以调试中快速定位问题，而对于生产模式这种Debug的功能就不是很重要了。

同时，你可以很明显的发现，生产模式的代码是被压缩的，不会转行，而开发模式则没有，你会看到里面有许多说明的部分，且格式工整。

如果我们要在生产与开发模式采用不同的配置，那么更改一个配置文件是很麻烦的，所以一般都是配置两个配置文件。

[]