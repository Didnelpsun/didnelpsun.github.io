---
layout: post
title:  "图形化界面"
date:   2019-09-29 21:13:45 +0800
categories: notes java base
tags: java 基础 
excerpt: "用户可视化"
---

因为之前的代码都像C一样抽象，这并不是利于理解。我们之前应该会用C语言来做一些信息管理系统，如成绩的录入等。但是我们的操纵界面都是在终端进行的。为了让用户更舒适的利用程序，显然终端对于绝大多数人都不合适，所以这就是图形化界面的产生原因。

Java的图形化界面包分为两个：awt和swing包

图形用户界面的构件一般包括菜单、输入输出组件、按钮、画板、窗口和对话框等，这些组件构成Java的抽象窗口工具包（Abstract Window Toolkit，AWT）。

Java在awt基础上推出了轻量化的swing图形用户界面包，提供了更丰富的组件。

## 窗体容器

JFrame是带有标题、边框的顶层窗体。窗体是一个容器，在其内部可以添加其它组件，所有的Swing组件都必须被添加到容器中，才能被显示。

### &emsp;JFrame类基本使用

+ JFrame()创建一个无标题的窗口。
+ JFrame(String s)创建标题为s的窗口。
+ public void setVisible(boolean b)设置窗口是否可见，窗口默认是不可见的。
+ public void setSize(int x轴长度,int y轴长度)设置窗体容器长宽。
+ public void dispose()撤消当前窗口，并释放窗口所使用的资源。
+ public void setDefaultCloseOperation(int operation)该方法用来设置单击窗体右上角的关闭图标后，程序会做出怎样的处理。默认动作是窗体隐藏。

具体参数：

+ DO_NOTHING_ON_CLOSE（在WindowConstants中定义）：不执行任何操作；要求程序在已注册的WindowListener对象的windowClosing方法中处理该操作。
+ HIDE_ON_CLOSE（在WindowConstants中定义）：调用任意已注册的WindowListener对象后自动隐藏该窗体。
+ DISPOSE_ON_CLOSE（在WindowConstants中定义）：调用任意已注册WindowListener的对象后自动隐藏并释放该窗体。
+ EXIT_ON_CLOSE（在JFrame中定义）：使用System exit方法退出应用程序。仅在应用程序中使用。

也就是说没有设置的话,默认点关闭时只是隐藏窗体,在后台进程中还可以看到，如果有多个窗口，只是销毁调用dispose的窗口，其他窗口仍然存在，整个应用程序还是处于运行状态。

```java
import javax.swing.*;

public class RunTest{
    public static void main(String args[]){
        new Frame();
    }
}
class Frame extends JFrame {
    Frame(){
        setSize(100,100);
        setVisible(true);
        setTitle("Frame窗体");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
}
```

![JFrame窗体1][JFrame1]

### &emsp;添加组件

[JFrame1]:data:image/png;base64,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

[]
