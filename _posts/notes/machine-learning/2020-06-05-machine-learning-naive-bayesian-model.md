---
layout: post
title:  "朴素贝叶斯"
date:   2020-06-05 15:21:46 +0800
categories: notes machine-learning
tags: 机器学习 基础 machine-learning 朴素贝叶斯 贝叶斯 NBM 多项式 高斯 伯努利
excerpt: "Naive Bayesian Model"
---

最为广泛的两种分类模型是决策树模型（Decision Tree Model）和朴素贝叶斯模型（Naive Bayesian Model，NBM）。和决策树模型相比，朴素贝叶斯分类器（Naive Bayes Classifier或NBC）发源于古典数学理论，有着坚实的数学基础，以及稳定的分类效率。同时，NBC模型所需估计的参数很少，对缺失数据不太敏感，算法也比较简单。理论上，NBC模型与其他分类方法相比具有最小的误差率。但是实际上并非总是如此，这是因为NBC模型假设属性之间相互独立，这个假设在实际应用中往往是不成立的，这给NBC模型的正确分类带来了一定影响。

朴素贝叶斯是基于贝叶斯定理与特征条件独立假设（即假设特征向量的每个变量都是相互独立的）。

朴素贝叶斯法是对于给定的训练数据集，基于特征条件独立假设学习输入输出的联合概率分布；然后得到这个模型，基于这个模型，对给定的输入x，利用贝叶斯定义求出后验概率最大的输出y。其根本就是反向推导。

朴素贝叶斯法实际上是学习到生成数据的机制，所以就是<span style="color:yellowgreen">生成模型</span>。生成模型给观测值和标注数据序列指定一个联合概率分布。在机器学习中，生成模型可以用来直接对数据建模，例如根据某个变量的概率密度函数进行数据采样，也可以用来建立变量间的条件概率分布。能够随机生成观测数据的模型，尤其是在给定某些隐含参数的条件下。除了生成模型还有判别模型。

生成模型和判别模型都是为了获取后验概率P(c\|x)，<span style="color:yellowgreen">判别模型</span>给定x直接建模P(c\|x)来预测c（如后面的决策树、BP神经网络、支持向量机等），而<span style="color:yellowgreen">生成模型</span>则是对联合概率分布P(x,c)建模，然后得到P(c\|x)。

## 朴素贝叶斯法的理论基础

如果你觉得下面的部分看的不是很懂，可以直接看最后的[理论流程总结](#理论流程总结)。再回头看下面的细节说明。

### &emsp;参数定义

设输入空间$\mathscr X \in R^n$为n维向量的集合，输出空间维类标记集合$\mathscr Y=\lbrace c_1,c_2\ldots c_K\rbrace$。输入x属于$\mathscr X$，而输出类标记y为$\mathscr Y$。X为$\mathscr X$上的随机向量，Y为$\mathscr Y$上的随机变量，而P(X,Y)为XY的联合概率分布。

训练数据集$T=\lbrace (x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\rbrace$由P(X,Y)独立同分布产生。

### &emsp;贝叶斯公式

{% raw %}

贝叶斯定理公式为：

$$P(B_i\mid A)={{P(B_i)P(A\mid B_i)}\over{\sum_{j=1}^n}P(B_j)P(A\mid B_j)}$$

所以：

$$P(y\mid x)={P(y)P(x\mid y)\over{P(x)}}$$

{% endraw %}

P(y)为类的先验概率，P(x\|y)为样本x对于类标记y的类条件概率，也称为似然，P(x)是用于归一化的证据因子，对于给定的样本x，证据因子P(x)于类标记y无关。所以在贝叶斯算法中估计P(y\|x)的问题就变成了根据训练集来估计先验概率P(y)和似然P(x\|y)。

### &emsp;条件独立性假设

朴素贝叶斯法对条件概率分布做出了条件独立性的假设，即用于分类的特征在类确定的条件夏都是条件独立的，因为这是个约束较强的假设（因为基本很少条件会是完全独立的，就比如身高体重），所以就叫朴素贝叶斯法（假设后模型相对很简单）。

独立性假设是：

$$P(X=x\mid Y=c_k)=P({X^{(1)}=x^{(1)},\ldots ,X^{(n)}=x^{(n)}\mid Y=c_k})=\prod_{j=1}^nP(X^{(j)}=x^{(j)}\mid Y=c_k)$$

即将原来的同时满足多个条件的概率拆开为满足多个条件下的概率的乘积，这种转换必定是要求条件独立的，因为如果条件是交叉的，那么乘积将大于原本应该的乘积。

### &emsp;先验概率

朴素贝叶斯首先学习先验概率分布$P(Y=c_k),k=1,2\ldots K$

先验概率（prior probability）是指根据以往经验和分析得到的概率，如全概率公式，它往往作为"由因求果"问题中的"因"出现的概率。这里的先验概率是指Y为k个类的每个可能性的概率。

先验概率$P(Y=c_k)$就是指样本空间中各类样本所占比例，即在这个样本空间中样本是$c_k$类的可能性，根据大数定理，只要训练集包含足够的独立分布样本，这个$P(Y=c_k)$就能通过出现频率来估计。

### &emsp;联合概率分布计算

然后计算条件概率分布$P(X=x\mid Y=c_k)=P({X^{(1)}=x^{(1)},\ldots ,X^{(n)}=x^{(n)}\mid Y=c_k}),k=1,2\ldots K$

即当实例X为x特征向量时类别为$c_k$的概率是类别为$c_k$时对应的特征向量等于特定值x的概率。

所以就可以根据这两个数据得到联合概率分布P(X,Y)，即X的条件下类型是Y的概率分布。

实际上如果要得到条件概率分布$P(X=x\mid Y=c_k)$要先求出对应的条件概率，参数是指数级别的，如果参数过多，基本上不可能求出来每一个具体的概率。（因为假设$x^{(j)}$可取值有$S_j$个，j=1,2...n，Y的可取值为K个，那么可取参数对为$K\prod_{j=1}^n S_j$）

### &emsp;后验概率

根据先验概率我们就可以求出后验概率，即当X满足一些列值时类型为$c_k$的概率$P(Y=c_k\mid X=x)$，然后我们就可以根据求出来的一系列概率的最大的那个概率对应的类作为x的类输出。后验概率的计算根据贝叶斯定理：

{% raw %}

$$P(Y=c_k\mid X=x)={{P(X=x\mid Y=c_k)P(Y=c_k)}\over {\sum_kP(X=x\mid Y=c_k)P(Y=c_k)}}$$

将条件独立性假设公式代入

<span style="color:aqua">朴素贝叶斯法分类：</span>

$$P(Y=c_k\mid X=x)={{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}\over {\sum_kP(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}，k=1,2\ldots K$$

<span style="color:aqua">朴素贝叶斯分类器：</span>

$$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}\over {\sum_kP(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$$

这个分类器主要进行单点估计。

又在计算每个类$c_k$的时候分母都是一样的，所以就不用计算分母，得到更简单的公式：

$$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$$

{% endraw %}

### &emsp;后验概率最大化

从上面我们可以知道，我们将实例的类分给后验概率最大的类，所以我们如果要求精度变高，自然会要求这个后验概率变大，后验概率最大化，即等价于期望风险最小化。

如果我们采用0-1损失函数：

$$L(Y,f(X))=\begin{cases}1,Y \neq f(X)\\0,Y=f(X)\\\end{cases}$$

其中f(X)为分类决策函数（即我们采用贝叶斯算出来的函数），这时期望风险函数为：$R_{exp}(f)=E[L(Y,f(X))]$。

这个期望是对联合分布P(X,Y)而取值的，所以条件期望是：

$$R_{exp}(f)=E_X\sum_{k=1}^K[L(c_k,f(X))]P(c_k\mid X)$$

为了让期望风险最小化，只用对X=x逐个极小化：

$$f(x)=arg\min_{y\in\mathscr Y}\sum_{k=1}^KL(c_k,y)P(c_k\mid X=x)$$

$$=arg\min_{y\in\mathscr Y}\sum_{k=1}^KP(y\neq c_k\mid X=x)$$

$$=arg\min_{y\in\mathscr Y}(1-P(y=c_k\mid X=x))$$

$$=arg\max_{y\in\mathscr Y}P(y=c_k\mid X=x)$$

我们也可以从逻辑上退出期望风险最小化就是后验概率最大化，就是将X=x时对应$c_k$类的概率极大化，期望风险最小化准则就变成了后验概率最大化准则：

$$f(x)=arg\max_{c_k}P(c_k\mid X=x)$$

这就是贝叶斯法采用的原理。

### &emsp;极大似然估计

我们应该了解为什么要进行参数估计？因为我们之前就已经提到了，因为贝叶斯算法需要知道许多条件下的概率，而如果参数个数变多，那么这些概率就变得非常庞大难以计算了，这就是为什么我们要进行估计的原因。

实际上概率模型的学习就是对参数的估计。

朴素贝叶斯法中，学习就是计算（实际上是估计）$P(Y=c_k)$和$P(X^{(j)}=x^{(j)}\mid Y=c)$。可以使用极大似然估计来估计对应的概率。

（对于参数估计大概有两种解决方案，频率注意学派认为参数虽然未知，但是存在固定值，所以可以通过优化似然函数等来确定参数值；而贝叶斯学派则认为参数是未能观测到随机变量，这个变量是有分布的，所以可假定这个参数服从一个先验分布，然后基于观测到的数据计算参数的后验分布。极大似然估计就是根据数据采样来估计频率分布参数的方法）

{% raw %}

先验概率$P(Y=c_k)$的极大似然估计是：

$$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)}\over N},k=1,2\ldots ,K$$

其实就是估计每个类出现的频次。

设第j个特征$x^{(j)}$的可能取值为$\lbrace a_{j1},a_{j2}\ldots a_{jS_j}\rbrace$，$x_i^{(j)}$为第i个样本的第j个特征；$a_{jl}$为第j个特征所可能取的第l个值；I()为指示函数，中间条件为真就返回1，假就返回0。$j=1,2\ldots n;\ l=1,2\ldots S_j;\ k=1,2\ldots K$

那么条件概率$P(X^{(j)}=a_{jl}\mid Y=c_k)$的极大似然估计下，条件概率就是出现的频次：

$$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)\over{{\sum_{i=1}^N}I(y_i=c_k)}}$$

{% endraw %}

### &emsp;理论流程总结

首先我们知道了贝叶斯理论、贝叶斯分类和朴素贝叶斯分类等概念。贝叶斯理论>贝叶斯分类>朴素贝叶斯分类。

贝叶斯公式为：$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}$，根据分类这个情况，就变成这种公式：$P(类别\mid 特征)=\frac{P(特征\mid 类别)P(类别)}{P(特征)}$。

而显然B作为A的特征不可能只有一个特征，假设有$B_1,\ldots B_n$个特征。所以贝叶斯公式就变为：

$$P(A\mid B_1,B_2\ldots B_n)=\frac{P(A)P(B_1,B_2\ldots B_n\mid A)}{P(B_1,B_2\ldots B_n)}$$

因为先验概率P(A)和多个特征的联合概率分布$P(B_1,B_2\ldots B_n)$都可以单独计算，与A以及$B_n$的关系无关，所以这两项可以算为常数。

所以最重要的是求出$P(B_1,B_2,\ldots B_n\mid A)$，因为链式法则：

$$P(B_1,B_2\ldots B_n\mid A)=P(B_1\mid A)P(B_2\mid A,B_1)P(B_2\mid A,B_1,B_2)\ldots P(B_n\mid A,B_1,B_2\ldots B_{n-1})$$

这是非常麻烦的，而如果假设这些特征都是相互独立的，那么$P(B_1,B_2\ldots B_n\mid A)=\prod_{i=1}^nP(B_i\mid A)$，这就是朴素贝叶斯。

&emsp;

## 贝叶斯模型

### &emsp;朴素贝叶斯算法

所以根据上面的一系列证明，我们可以得到最后的贝叶斯算法定义：

输入为训练数据集$T=\lbrace(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\rbrace$，其中$x_i=(x_i^{(1)},x_i^{(2)}\ldots x_i^{(n)})^T$，$x_i^{(j)}$是第i个样本第j个特征值，$x_i^{(j)}\in\lbrace a_{j1},a_{j2}\ldots a_{jS_j}\rbrace$，$a_{jl}$是第j个特征值可能取得的第l个值，j=1,2...n,l=1,2...$S_j$，$y_i\in\lbrace c_1,c_2\ldots c_K\rbrace$或者输入为实例x。

输出为y即x的分类。

{% raw %}

第一步，<span style="color:aqua">先验概率：</span>

$$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)}\over N},k=1,2\ldots ,K$$

第二步，<span style="color:aqua">条件概率：</span>

$$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)\over{{\sum_{i=1}^N}I(y_i=c_k)}}\quad j=1,2\ldots n;\ l=1,2\ldots S_j;\ k=1,2\ldots K$$

第三步，<span style="color:aqua">根据实例确定类：</span>

$$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$$

{% endraw %}

### &emsp;贝叶斯估计

{% raw %}

在特征值为离散值时，使用极大似然估计可能会出现概率为0的情况，因为参数过大样本可能不能充分满足每一种可能的情况，这个情况就未被观测到，所以这个情况下的概率就计算为0。频率因为概率计算时是以乘积的形式，所以一旦一个概率为0，会影响到总体的概率全部为0，这回影响到后验概率的结果，从而让分类具有了误差，所以我们要消除这个可能性。因为概率可能为非负，所以我们想加上一个正数，让概率全为正数，这就解决了概率可能为0的问题。

这就是贝叶斯估计，<span style="color:aqua">条件概率的贝叶斯估计：</span>

$$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)+\lambda\over{{\sum_{i=1}^N}I(y_i=c_k)}+S_j\lambda}\quad \lambda\ge0$$

这个式子等价于在随机变量各个取值的频数上加上一个正数λ>0，当λ为0就是极大似然估计。一般λ取1，称为<span style="color:yellowgreen">拉普拉斯平滑：</span>（平滑顾名思义就是将函数平滑化，不会有较大的差值）。

对于任何l=1,2...$S_j$，k=1,2...K，都有：

$$P_\lambda(X^{(j)}=a_{jl}\mid Y=c_k)>0,\quad\sum_{l=1}^{S_j}P(X^{(j)}=a_{jl}\mid Y=c_k)=1$$

所以表明贝叶斯估计的式子确实代表一种概率分布。

<span style="color:aqua">先验概率的贝叶斯估计：</span>

$$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)+\lambda}\over {N+K\lambda}}$$

{% endraw %}

### &emsp;实例

已知训练数据表：

$$\begin{array}{c|ccccccccccccccc}
{}&{1}&{2}&{3}&{4}&{5}&{6}&{7}&{8}&{9}&{10}&{11}&{12}&{13}&{14}&{15}\\
\hline
{X^{(1)}}&{1}&{1}&{1}&{1}&{1}&{2}&{2}&{2}&{2}&{2}&{3}&{3}&{3}&{3}&{3}\\
{X^{(2)}}&{S}&{M}&{M}&{S}&{S}&{S}&{M}&{M}&{L}&{L}&{L}&{M}&{M}&{L}&{L}\\
{Y}&{-1}&{-1}&{1}&{1}&{-1}&{-1}&{-1}&{1}&{1}&{1}&{1}&{1}&{1}&{1}&{-1}\\
\end{array}$$

根据学习到的朴素贝叶斯分类器确定$x=(2,S)^T$的类标记y。$X^{(1)}X^{(2)}$为它两个特征，取值的集合分别为{1,2,3}，{S,M,L}，Y为类标记，为{1,-1}。

首先利用朴素贝叶斯算法

解：根据表格，计算概率：

先验概率：$P(Y=1)={9\over 15}={3\over 5},\ P(Y=-1)={6\over 15}={2\over 5}$

条件概率：$P(X^{(1)}=1\mid Y=1)={2\over 9},\ P(X^{(1)}=2\mid Y=1)={3\over 9},\ P(X^{(1)}=3\mid Y=1)={4\over 9}$

$P(X^{(2)}=S\mid Y=1)={1\over 9},\ P(X^{(2)}=M\mid Y=1)={4\over 9},\ P(X^{(2)}=L\mid Y=1)={4\over 9}$

$P(X^{(1)}=1\mid Y=-1)={3\over 6}={1\over 2},\ P(X^{(1)}=2\mid Y=-1)={2\over 6}={1\over 3},\ P(X^{(1)}=3\mid Y=-1)={1\over 6}$

$P(X^{(2)}=S\mid Y=-1)={3\over 6}={1\over 2},\ P(X^{(2)}=M\mid Y=-1)={2\over 6}={1\over 3},\ P(X^{(2)}=L\mid Y=-1)={1\over 6}$

对于给定的$x=(2,S)^T$计算：

$P(Y=1)P(X^{(1)}=2\mid Y=1)P(X^{(2)}=S\mid Y=1)={3\over 5}\cdot{1\over 3}\cdot{1\over 9}={1\over 45}$

$P(Y=-1)P(X^{(1)}=2\mid Y=-1)P(X^{(2)}=S\mid Y=-1)={2\over 5}\cdot{1\over 3}\cdot{1\over 2}={1\over 15}$

因为${1\over 15}$更大，所以y为-1的概率更大，所以y的类为-1。

&emsp;

使用贝叶斯估计的拉普拉斯平滑

解：首先根据贝叶斯估计公式，因为Y取值一共有两种，所以根据公式，

先验概率：$P(Y=1)={10\over 17},\ P(Y=-1)={7\over 17}$

因为$X^{(1)}X^{(2)}$的取值都为三种，

条件概率：$P(X^{(1)}=1\mid Y=1)={3\over 12}={1\over 4},\ P(X^{(1)}=2\mid Y=1)={4\over 12}={1\over 3},\ P(X^{(1)}=3\mid Y=1)={5\over 12}$

$P(X^{(2)}=S\mid Y=1)={2\over 12}={1\over 6},\ P(X^{(2)}=M\mid Y=1)={5\over 12},\ P(X^{(2)}=L\mid Y=1)={5\over 12}$

$P(X^{(1)}=1\mid Y=-1)={4\over 9},\ P(X^{(1)}=2\mid Y=-1)={3\over 9}={1\over 3},\ P(X^{(1)}=3\mid Y=-1)={2\over 9}$

$P(X^{(2)}=S\mid Y=-1)={4\over 9},\ P(X^{(2)}=M\mid Y=-1)={3\over 9}={1\over 3},\ P(X^{(2)}=L\mid Y=-1)={2\over 9}$

对于给定的$x=(2,S)^T$计算：

$P(Y=1)P(X^{(1)}=2\mid Y=1)P(X^{(2)}=S\mid Y=1)={10\over 17}\cdot{1\over 3}\cdot{1\over 6}={5\over 153}\approx0.0327$

$P(Y=-1)P(X^{(1)}=2\mid Y=-1)P(X^{(2)}=S\mid Y=-1)={7\over 17}\cdot{1\over 3}\cdot{4\over 9}={28\over 459}\approx0.0610$

所以0.0610更大，y为-1。

### &emsp;代码实现

```python
# -*- coding: UTF-8 -*-
import numpy as np
from functools import reduce

"""
函数说明:创建实验样本
Parameters:
    无
Returns:
    postingList - 实验样本切分的词条
    classVec - 类别标签向量

"""


# 定义数据集
def loadDataSet():
    # 切分的词条
    postingList = [['my', 'dog', 'has', 'flea', 'problems', 'help', 'please'],
                   ['maybe', 'not', 'take', 'him', 'to', 'dog', 'park', 'stupid'],
                   ['my', 'dalmation', 'is', 'so', 'cute', 'I', 'love', 'him'],
                   ['stop', 'posting', 'stupid', 'worthless', 'garbage'],
                   ['mr', 'licks', 'ate', 'my', 'steak', 'how', 'to', 'stop', 'him'],
                   ['quit', 'buying', 'worthless', 'dog', 'food', 'stupid']]
    # 类别标签向量，1代表侮辱性词汇，0代表不是
    classVec = [0, 1, 0, 1, 0, 1]
    # 返回实验样本切分的词条和类别标签向量
    return postingList, classVec


"""
函数说明:将切分的实验样本词条整理成不重复的词条列表，也就是词汇表

Parameters:
    dataSet - 整理的样本数据集
Returns:
    vocabSet - 返回不重复的词条列表，也就是词汇表

"""


# 创建词汇列表
def createVocabList(dataSet):
    vocabSet = set([])  # 创建一个空的不重复列表集合
    for document in dataSet:
        # 对于set集合来说|运算符就是取集合并集
        vocabSet = vocabSet | set(document)
    # 得到了一个不重复的集合
    # 起到了第一步的筛选作用
    return list(vocabSet)


"""
函数说明:根据vocabList词汇表，将inputSet向量化，向量的每个元素为1或0

Parameters:
    vocabList - createVocabList返回的列表
    inputSet - 切分的词条列表
Returns:
    returnVec - 文档向量,词集模型

"""


def setOfWords2Vec(vocabList, inputSet):
    # 创建一个其中所含元素都为0的向量
    # set的len()方法取得集合的项数
    returnVec = [0] * len(vocabList)
    for word in inputSet:
        # 遍历每个词条
        if word in vocabList:
            # 如果词条存在于词汇表中，则置1
            returnVec[vocabList.index(word)] = 1
        else:
            print("the word: %s is not in my Vocabulary!" % word)
    # 返回文档向量
    return returnVec


"""
函数说明:朴素贝叶斯分类器训练函数

Parameters:
    trainMatrix - 训练文档矩阵，即setOfWords2Vec返回的returnVec构成的矩阵
    trainCategory - 训练类别标签向量，即loadDataSet返回的classVec
Returns:
    p0Vect - 非侮辱类的条件概率数组
    p1Vect - 侮辱类的条件概率数组
    pAbusive - 文档属于侮辱类的概率

"""


def trainNB0(trainMatrix, trainCategory):
    numTrainDocs = len(trainMatrix)  # 计算训练的文档数目
    numWords = len(trainMatrix[0])  # 计算每篇文档的词条数
    pAbusive = sum(trainCategory) / float(numTrainDocs)  # 文档属于侮辱类的概率
    p0Num = np.zeros(numWords);
    p1Num = np.zeros(numWords)  # 创建numpy.zeros数组,
    p0Denom = 0.0;
    p1Denom = 0.0  # 分母初始化为0.0
    for i in range(numTrainDocs):
        if trainCategory[i] == 1:  # 统计属于侮辱类的条件概率所需的数据，即P(w0|1),P(w1|1),P(w2|1)···
            p1Num += trainMatrix[i]
            p1Denom += sum(trainMatrix[i])
        else:  # 统计属于非侮辱类的条件概率所需的数据，即P(w0|0),P(w1|0),P(w2|0)···
            p0Num += trainMatrix[i]
            p0Denom += sum(trainMatrix[i])
    p1Vect = p1Num / p1Denom  # 相除
    p0Vect = p0Num / p0Denom
    return p0Vect, p1Vect, pAbusive  # 返回属于侮辱类的条件概率数组，属于非侮辱类的条件概率数组，文档属于侮辱类的概率


"""
函数说明:朴素贝叶斯分类器分类函数

Parameters:
    vec2Classify - 待分类的词条数组
    p0Vec - 侮辱类的条件概率数组
    p1Vec -非侮辱类的条件概率数组
    pClass1 - 文档属于侮辱类的概率
Returns:
    0 - 属于非侮辱类
    1 - 属于侮辱类

"""


def classifyNB(vec2Classify, p0Vec, p1Vec, pClass1):
    p1 = reduce(lambda x, y: x * y, vec2Classify * p1Vec) * pClass1  # 对应元素相乘
    p0 = reduce(lambda x, y: x * y, vec2Classify * p0Vec) * (1.0 - pClass1)
    print('p0:', p0)
    print('p1:', p1)
    if p1 > p0:
        return 1
    else:
        return 0


"""
函数说明:测试朴素贝叶斯分类器

Parameters:
    无
Returns:
    无

"""


def testingNB():
    listOPosts, listClasses = loadDataSet()  # 创建实验样本
    myVocabList = createVocabList(listOPosts)  # 创建词汇表
    trainMat = []
    for postinDoc in listOPosts:
        trainMat.append(setOfWords2Vec(myVocabList, postinDoc))  # 将实验样本向量化
    p0V, p1V, pAb = trainNB0(np.array(trainMat), np.array(listClasses))  # 训练朴素贝叶斯分类器
    testEntry = ['love', 'my', 'dalmation']  # 测试样本1
    thisDoc = np.array(setOfWords2Vec(myVocabList, testEntry))  # 测试样本向量化
    if classifyNB(thisDoc, p0V, p1V, pAb):
        print(testEntry, '属于侮辱类')  # 执行分类并打印分类结果
    else:
        print(testEntry, '属于非侮辱类')  # 执行分类并打印分类结果
    testEntry = ['stupid', 'garbage']  # 测试样本2

    thisDoc = np.array(setOfWords2Vec(myVocabList, testEntry))  # 测试样本向量化
    if classifyNB(thisDoc, p0V, p1V, pAb):
        print(testEntry, '属于侮辱类')  # 执行分类并打印分类结果
    else:
        print(testEntry, '属于非侮辱类')  # 执行分类并打印分类结果


if __name__ == '__main__':
    testingNB()
```

### &emsp;高斯朴素贝叶斯与伯努利朴素贝叶斯

之前介绍的朴素贝叶斯算法是多项式朴素贝叶斯，实际上还有高斯朴素贝叶斯和伯努利朴素贝叶斯两种算法。它们在计算流程上并没有什么太大的不同，只是因为特征向量$X^{(j)}$不同而导致$P(X^{(j)}=a_{jl}\mid Y=c_k)$条件概率的计算方式不同罢了。

下面是三种算法模型计算公式，其中平滑系数$\lambda\ge0$：

{% raw %}

#### &emsp;&emsp;1.多项式朴素贝叶斯

$X^{(j)}$为离散值，假设$X^{(j)}$满足多项式分布，那么条件概率就是出现的频次。

$$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)+\lambda\over{{\sum_{i=1}^N}I(y_i=c_k)}+S_j\lambda}$$

#### &emsp;&emsp;2.伯努利朴素贝叶斯

$X^{(j)}$为非常稀疏的离散值，假设$X^{(j)}$满足伯努利分布，即特征$X^{(j)}$出现就为1，不出现就为0，不关心它到底出现的频率或者程度，所以所有的特征值只有1和0两个值。

$$P(X^{(j)}=a_{jl}\mid Y=c_k)=P(X^{(j)}=1\mid Y=c_k)X^{(j)}+(1-P(X^{(j)}=1\mid Y=c_k))(1-X^{(j)})$$

$$P(X^{(j)}=1\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=1,y_i=c_k)+\lambda\over{{\sum_{i=1}^N}I(y_i=c_k)}+2\lambda}$$

#### &emsp;&emsp;3.高斯朴素贝叶斯

$X^{(j)}$为一个连续值，那么我们可以设$X^{(j)}$具有概率密度函数，一般是正态分布（高斯分布），即$P(X^{(j)}=a_{jl}\mid Y=c_k)\sim \mathscr N(\mu_{c_k,j},\sigma^2_{c_k,j})$。

$$P(X^{(j)}=a_{jl}\mid Y=c_k)={1\over{\sqrt{2\pi\sigma^2_{c_k,j}}}}\exp(-{{(x_i-\mu_{c_k,j})^2\over{2\sigma^2_{c_k,j}}}})$$

$\mu_{c_k,j}$为类别是$c_k$的样本中，特征$X^{(j)}的均值，$$\sigma^2_{c_k,j}$为类别是$c_k$的样本中，特征$X^{(j)}$的标准差。

{% endraw %}

### &emsp;基于sklearn的实现

scikit-learn中朴素贝叶斯类库的使用也比较简单。相对于决策树，KNN之类的算法，朴素贝叶斯需要关注的参数是比较少的。

在scikit-learn中，一共有3个朴素贝叶斯的分类算法类。分别是GaussianNB，MultinomialNB和BernoulliNB。其中GaussianNB就是先验为高斯分布的朴素贝叶斯，MultinomialNB就是先验为多项式分布的朴素贝叶斯，而BernoulliNB就是先验为伯努利分布的朴素贝叶斯。

MultinamialNB这个函数，只有3个参数：alpha（拉普拉斯平滑），fit_prior（表示是否要考虑先验概率），和class_prior：可选参数。

MultinomialNB一个重要的功能是有partial_fit方法，这个方法的一般用在如果训练集数据量非常大，一次不能全部载入内存的时候。这时我们可以把训练集分成若干等分，重复调用partial_fit来一步步的学习训练集。

```python
# 高斯朴素贝叶斯
import numpy as np
import pandas as pd
from sklearn.naive_bayes import GaussianNB

np.random.seed(0)
x = np.random.randint(0,10,size=(6,2))
y = np.array([0,0,0,1,1,1])
data = pd.DataFrame(np.concatenate([x, y.reshape(-1,1)], axis=1), columns=['x1','x2','y'])
display(data)

gnb = GaussianNB()
gnb.fit(x,y)
# 每个类别的先验概率
print('概率：', gnb.class_prior_)
# 每个类别样本的数量
print('样本数量：', gnb.class_count_)
# 每个类别的标签
print('标签：', gnb.classes_)
# 每个特征在每个类别下的均值
print('均值：',gnb.theta_)
# 每个特征在每个类别下的方差
print('方差：',gnb.sigma_)

#测试集
x_test = np.array([[6,3]])
print('预测结果：', gnb.predict(x_test))
print('预测结果概率：', gnb.predict_proba(x_test))
```

```python
# 伯努利朴素贝叶斯
from sklearn.naive_bayes import BernoulliNB

np.random.seed(0)
x = np.random.randint(-5,5,size=(6,2))
y = np.array([0,0,0,1,1,1])
data = pd.DataFrame(np.concatenate([x,y.reshape(-1,1)], axis=1), columns=['x1','x2','y'])
display(data)

bnb = BernoulliNB()
bnb.fit(x,y)
# 每个特征在每个类别下发生（出现）的次数。因为伯努利分布只有两个值。
# 我们只需要计算出现的概率P(x=1|y)，不出现的概率P(x=0|y)使用1减去P(x=1|y)即可。
print('数值1出现次数：', bnb.feature_count_)
# 每个类别样本所占的比重，即P(y)。注意该值为概率取对数之后的结果，
# 如果需要查看原有的概率，需要使用指数还原。
print('类别占比p(y)：',np.exp(bnb.class_log_prior_))
# 每个类别下，每个特征（值为1）所占的比例（概率），即p（x|y）
# 该值为概率取对数之后的结果，如果需要查看原有的概率，需要使用指数还原
print('特征概率：',np.exp(bnb.feature_log_prob_))
```

```python
# 多项式朴素贝叶斯
from sklearn.naive_bayes import MultinomialNB

np.random.seed(0)
x = np.random.randint(0,4,size=(6,2))
y = np.array([0,0,0,1,1,1])
data = pd.DataFrame(np.concatenate([x,y.reshape(-1,1)], axis=1), columns=['x1','x2','y'])
display(data)

mnb = MultinomialNB()
mnb.fit(x,y)
# 每个类别的样本数量
print(mnb.class_count_)
# 每个特征在每个类别下发生（出现）的次数
print(mnb.feature_count_)
# 每个类别下，每个特征所占的比例（概率），即P(x|y)
# 该值为概率取对数之后的结果，如果需要查看原有的概率，需要使用指数还原
print(np.exp(mnb.feature_log_prob_))
```

&emsp;

## 半朴素贝叶斯

为了降低后验概率P(Y\|X)的难度，朴素贝叶斯采用条件独立假设。然而实际上条件独立很难产生，所以需要对属性条件独立性进行一定的放松，所以产生了半朴素贝叶斯分类器。

半朴素贝叶斯的基本想法是适当考虑一部分属性间的相互依赖信息，对条件独立性假设进行放松，从而不需进行完全联合概率计算，又不至于彻底忽略较强的属性依赖关系。

“独依赖估计”（ODE)是半朴素贝叶斯分类器最常用的策略。即假设每个属性在类别之外最多仅依赖另一个属性。即：

$$P(Y=c_k\mid X=x)\propto P(Y=c_k)\prod_{j=1}^nP(X^{(j)}=x^{(j)}\mid Y=c_k,pa^j)$$

其中$pa^j$为属性$x^{(j)}$所依赖的属性，称为$x^{(j)}$的父属性，此时，对于每个属性特征$x^{(j)}$的父属性$pa^j$已知，那么可以采用拉普拉斯平滑等方式来估计$P(X^{(j)}=x^{(j)}\mid Y=c_k,pa^j)$，而不同的确立父属性的方法产生不同的独依赖分类器。

最直接的做饭是假设所有的属性都依赖同一个属性——超父，然后通过交叉验证等模型选择方法来确定超父属性，于是形成了<span style="color:yellowgreen">SPODE</span>方法。如图中（b）

![spode与tan][spodetan]

TAN是在最大带权生成树算法的基础上，通过以下步骤将属性间依赖关系简约为以上所示树形结构：

1. 计算任意两个特征属性间的条件互信息：$I(x^{(i)},x^{(j)}\mid y)=\sum_{x^{(i)},x^{(j)};y=c_k\in\mathscr y}P(x^{(i)},x^{(j)}\mid y=c_k)\log\frac{P(x^{(i)},x^{(j)}\mid y=c_k)}{P(x^{(i)}\mid y=c_k)P(x^{(j)}\mid y=c_k)}$。
2. 以属性为结点构建完全图，任意两个结点之间边的权重设置为$I(x^{(i)},x^{(j)})$。
3. 构建此完全图的最大带权生成树，挑选根变量，将边置为有向。
4. 加入类别结点y，增加从y到每个属性的有向边。

容易看出，条件互信息$I(x^{(i)},x^{(j)}\mid y)$刻画了两个特征属性间在已知类别的情况下的相关性，所以通过最大生成树的算法，TAN只保留了强相关属性之间的依赖性。

<span style="color:yellowgreen">AODE</span>是一种基于集成学习机制，更为强大的独依赖分类器，AODE尝试将每个属性作为超父来构建SPODE，然后将那些具有足够训练数据支撑的SPODE集成作为最后结果，即：

$$P(Y=c_k\mid X=x)\propto \sum_{\begin{array}{c}i=1\\\mid D_{x^{(i)}}\mid\ge m\prime\end{array}}^nP(Y=c_k,X^{(i)}=x^{(i)})\prod_{j=1}^nP(X^{(j)}=x^{(j)}\mid Y=c_k,X^{(i)}=x^{(i)})$$

其中$D_{x^{(i)}}$是第i个属性$X^{(i)}$上取值为$x^{(i)}$的样本的集合，$m\prime$为阈值常数。

我们使用AODE需要先估计$P(Y=c_k,X^{(i)}=x^{(i)})$和$P(X^{(j)}=x^{(j)}\mid Y=c_k,X^{(i)}=x^{(i)})$，使用拉普拉斯平滑估计：

$$\tilde P(Y=c_k,X^{(i)}=x^{(i)})=\frac{\mid D_{c_k,x^{(i)}}\mid +1}{\mid D\mid +S_i}$$

$$\tilde P(X^{(j)}=x^{(j)}\mid Y=c_k,X^{(i)}=x^{(i)})=\frac{\mid D_{c_k,x^{(i)},x^{(j)}}\mid +1}{\mid D_{c_k,x^{(i)}}\mid+S_j}$$

其中$S_i$为第i个属性可能取值数，$D_{c_k,x^{(i)}}$为类别是$c_k$且第i个属性上取值为$x^{(i)}$的样本集合，对应的$D_{c_k,x^{(i)},x^{(j)}}$为类别是$c_k$的且在第i和j个特征属性取值为$x^{(i)}$和$x^{(j)}$的样本集合。

所以AODE与朴素贝叶斯类似，训练过程也是技术过程，对于训练数据集上符号套件的样本进行计数的过程，并且也无需模型选择。

独依赖能提升泛化能力，那么如果我们是多依赖更能进一步提升，将属性$pa^{(i)}$变为包含k个属性的集合$pa^{(i)^{[k]}}$，让ODE变为kDE，那么随之准确进行估计所需的训练样本指数增长，不充分的样本会不足以支撑精度。

&emsp;

## 贝叶斯网

贝叶斯网也叫信念网，借助有向无环图（DAG）来刻画属性依赖关系，并使用条件概率表（CPT）来描述属性的联合概率分布。

一个贝叶斯网由结构G和参数Q两部分构成，则B=<G,Q>。网络结构G为一个有向无环图，每个结点对应一个属性，若两个属性有直接依赖关系，就使用一条边连接，参数Q定量描述这种依赖关系，假设属性$x^{(i)}$在G中的父结点集为$\pi_i$，则Q包含每个属性的条件概率表$\theta_{x^{(i)}\mid \pi_i}=P_B(x^{(i)}\mid \pi_i)$

### &emsp;结构

贝叶斯网结构表现了属性间的条件独立性，给定父结点集，贝叶斯网假设每个属性与其非后裔属性独立，于是B=<G,Q>将属性联合概率分布定义为：

$$P_B(x^{(1)},x^{(2)}\ldots x^{(n)})=\prod_{i=1}^nP_B(x^{(i)}\mid \pi_i)=\prod_{i=1}^n\theta_{x^{(i)}\mid \pi_i}$$

假设c继承a，d继承b，e继承ab。那么$P_B(a,b,c,d,e)=P(a)P(b)P(c\mid a)P(d\mid b)P(e\mid a,b)$

贝叶斯网有三种典型结构：同父结构：一对多；V型结构：多对一；顺序结构：一对一。

同父结构下如果父结点已知则子结点条件独立；顺序结构中给定中间变量值，那么两侧条件独立；V型结构也叫冲撞结构，给定子结点取值，那么其两个父结点必不独立，而若是子节点完全未知则其两个父结点完全独立，这种称为边际性独立性。

为了分析有向图中变量间的条件独立性，可以使用“有向分离”将有向图转为无向图：

+ 找出有向图中所有V型结构，在V型结构的两个父结点中加上一条无向边。
+ 将所有有向边转为无向边

由此产生的无向图为道德图，令父结点相连的过程为道德化。






[spodetan]:data:image/png;base64,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

[]
