---
layout: post
title: "相关问题与报错"
date: 2022-02-26 14:23:11 +0800
categories: notes jekyll other
tags: Jekyll 其他 问题
excerpt: "相关问题与报错"
---

## in `require': cannot load such file -- webrick (LoadError)

Ruby3.0.0以上不会再自带webrick，官网有提到这个问题，执行`bundle add webrick`把webrick添加到依赖就可以，[Quickstart https://jekyllrb.com/docs/](https://jekyllrb.com/docs/)，[issue752 https://github.com/github/pages-gem/issues/752](https://github.com/github/pages-gem/issues/752)。
