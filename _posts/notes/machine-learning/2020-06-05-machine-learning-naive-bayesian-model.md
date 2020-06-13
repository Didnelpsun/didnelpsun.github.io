---
layout: post
title:  "朴素贝叶斯"
date:   2020-06-05 15:21:46 +0800
categories: notes machine-learning
tags: machine-learning 朴素贝叶斯 NBM
excerpt: "Naive Bayesian Model"
---

最为广泛的两种分类模型是决策树模型（Decision Tree Model）和朴素贝叶斯模型（Naive Bayesian Model，NBM）。和决策树模型相比，朴素贝叶斯分类器（Naive Bayes Classifier或NBC）发源于古典数学理论，有着坚实的数学基础，以及稳定的分类效率。同时，NBC模型所需估计的参数很少，对缺失数据不太敏感，算法也比较简单。理论上，NBC模型与其他分类方法相比具有最小的误差率。但是实际上并非总是如此，这是因为NBC模型假设属性之间相互独立，这个假设在实际应用中往往是不成立的，这给NBC模型的正确分类带来了一定影响。

{% raw %}

朴素贝叶斯是基于贝叶斯定理（概论统计学中学过，公式为$P(B_i\mid A)={{P(B_i)P(A\mid B_i)}\over{\sum_{j=1}^n}P(B_j)P(A\mid B_j)}$）与特征条件独立假设（即假设特征向量的每个变量都是相互独立的）。

{% endraw %}

对于给定的训练数据集，基于特征条件独立假设学习输入输出的联合概率分布；然后得到这个模型，基于这个模型，对给定的输入x，利用贝叶斯定义求出后验概率最大的输出y。

朴素贝叶斯法实际上是学习到生成数据的机制，所以就是<span style="color:yellowgreen">生成模型</span>。生成模型给观测值和标注数据序列指定一个联合概率分布。在机器学习中，生成模型可以用来直接对数据建模，例如根据某个变量的概率密度函数进行数据采样，也可以用来建立变量间的条件概率分布。

生成模型指能够随机生成观测数据的模型，尤其是在给定某些隐含参数的条件下。除了生成模型还有判别模型。



## 朴素贝叶斯法的理论基础

### &emsp;参数定义

设输入空间$\mathscr X \in R^n$为n维向量的集合，输出空间维类标记集合$\mathscr Y=\{c_1,c_2\ldots c_K\}$。输入x属于$\mathscr X$，而输出类标记y为$\mathscr Y$。X为$\mathscr X$上的随机向量，Y为$\mathscr Y$上的随机变量，而P(X,Y)为XY的联合概率分布。

训练数据集$T=\{(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\}$由P(X,Y)独立同分布产生。

### &emsp;条件独立性假设

朴素贝叶斯法对条件概率分布做出了条件独立性的假设，即用于分类的特征在类确定的条件夏都是条件独立的，因为这是个约束较强的假设（因为基本很少条件会是完全独立的，就比如身高体重），所以就叫朴素贝叶斯法（假设后模型相对很简单）。

独立性假设是：$P(X=x\mid Y=c_k)=P({X^{(1)}=x^{(1)},\ldots ,X^{(n)}=x^{(n)}\mid Y=c_k})=\prod_{j=1}^nP(X^{(j)}=x^{(j)}\mid Y=c_k)$

### &emsp;联合概率分布计算

朴素贝叶斯首先学习先验概率分布$P(Y=c_k),k=1,2\ldots K$

先验概率（prior probability）是指根据以往经验和分析得到的概率，如全概率公式，它往往作为"由因求果"问题中的"因"出现的概率。这里的先验概率是指Y为k个类的每个可能性的概率。

然后计算条件概率分布$P(X=x\mid Y=c_k)=P({X^{(1)}=x^{(1)},\ldots ,X^{(n)}=x^{(n)}\mid Y=c_k}),k=1,2\ldots K$

即当实例X为x特征向量时类别为$c_k$的概率是类别为$c_k$时对应的特征向量等于特定值的概率。

所以就可以根据这两个数据得到联合概率分布P(X,Y)，即X的条件下类型是Y的概率分布。

实际上如果要得到条件概率分布$P(X=x\mid Y=c_k)$要先求出对应的条件概率，参数是指数级别的，如果参数过多，基本上不可能求出来每一个具体的概率。（因为假设$x^{(j)}$可取值有$S_j$个，j=1,2...n，Y的可取值为K个，那么可取参数对为$K\prod_{j=1}^n S_j$）

### &emsp;后验概率

根据先验概率我们就可以求出后验概率，即当X满足一些列值时类型为$c_k$的概率$P(Y=c_k\mid X=x)$，然后我们就可以根据求出来的一系列概率的最大的那个概率对应的类作为x的类输出。后验概率的计算根据贝叶斯定理：

{% raw %}

$P(Y=c_k\mid X=x)={{P(X=x\mid Y=c_k)P(Y=c_k)}\over {\sum_kP(X=x\mid Y=c_k)P(Y=c_k)}}$

将条件独立性假设公式代入：

<span style="color:aqua">朴素贝叶斯法分类：</span>$P(Y=c_k\mid X=x)={{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}\over {\sum_kP(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}，k=1,2\ldots K$

<span style="color:aqua">朴素贝叶斯分类器：</span>$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}\over {\sum_kP(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$

又在计算每个类$c_k$的时候分母都是一样的，所以就不用计算分母，得到更简单的公式：

$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$

{% endraw %}

### &emsp;后验概率最大化

从上面我们可以知道，我们将实例的类分给后验概率最大的类，所以我们如果要求精度变高，自然会要求这个后验概率变大，后验概率最大化，即等价于期望风险最小化。

如果我们采用0-1损失函数：$L(Y,f(X))=\begin{cases}1,Y \neq f(X)\\0,Y=f(X)\\\end{cases}$

其中f(X)为分类决策函数（即我们采用贝叶斯算出来的函数），这时期望风险函数为：$R_{exp}(f)=E[L(Y,f(X))]$。

这个期望是对联合分布P(X,Y)而取值的，所以条件期望是：$R_{exp}(f)=E_X\sum_{k=1}^K[L(c_k,f(X))]P(c_k\mid X)$

为了让期望风险最小化，只用对X=x逐个极小化：

$$f(x)=arg\min_{y\in\mathscr Y}\sum_{k=1}^KL(c_k,y)P(c_k\mid X=x)$$

$$=arg\min_{y\in\mathscr Y}\sum_{k=1}^KP(y\neq c_k\mid X=x)$$

$$=arg\min_{y\in\mathscr Y}(1-P(y=c_k\mid X=x))$$

$$=arg\max_{y\in\mathscr Y}P(y=c_k\mid X=x)$$

我们也可以从逻辑上退出期望风险最小化就是后验概率最大化，就是将X=x时对应$c_k$类的概率极大化，期望风险最小化准则就变成了后验概率最大化准则：$f(x)=arg\max_{c_k}P(c_k\mid X=x)$。

这就是贝叶斯法采用的原理。

### &emsp;极大似然估计

首先我们应该了解为什么要进行参数估计？因为我们之前就已经提到了，因为贝叶斯算法需要知道许多条件下的概率，而如果参数个数变多，那么这些概率就变得非常庞大难以计算了，这就是为什么我们要进行估计的原因。

朴素贝叶斯法中，学习就是计算（实际上是估计）$P(Y=c_k)$和$P(X^{(j)}=x^{(j)}\mid Y=c)$。可以使用极大似然估计来估计对应的概率。

{% raw %}

先验概率$P(Y=c_k)$的极大似然估计是$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)}\over N},k=1,2\ldots ,K$

设第j个特征$x^{(j)}$的可能取值为$\{a_{j1},a_{j2}\ldots a_{jS_j}\}$，条件概率$P(X^{(j)}=a_{jl}\mid Y=c_k)$的极大似然估计为：

$$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)\over{{\sum_{i=1}^N}I(y_i=c_k)}}\quad j=1,2\ldots n;\ l=1,2\ldots S_j;\ k=1,2\ldots K$$

{% endraw %}

其中$x_i^{(j)}$为第i个样本的第j个特征；$a_{jl}$为第j个特征所可能取的第l个值；I()为指示函数，中间条件为真就返回1，假就返回0。

&emsp;

## 贝叶斯模型

### &emsp;朴素贝叶斯算法

所以根据上面的一系列证明，我们可以得到最后的贝叶斯算法定义：

输入为训练数据集$T=\{(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\}$，其中$x_i=(x_i^{(1)},x_i^{(2)}\ldots x_i^{(n)})^T$，$x_i^{(j)}$是第i个样本第j个特征值，$x_i^{(j)}\in\{a_{j1},a_{j2}\ldots a_{jS_j}\}$，$a_{jl}$是第j个特征值可能取得的第l个值，j=1,2...n,l=1,2...$S_j$，$y_i\in\{c_1,c_2\ldots c_K\}$或者输入为实例x。

输出为y即x的分类。

{% raw %}

1. <span style="color:aqua">先验概率：</span>$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)}\over N},k=1,2\ldots ,K$

2. <span style="color:aqua">条件概率：</span>$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)\over{{\sum_{i=1}^N}I(y_i=c_k)}}\quad j=1,2\ldots n;\ l=1,2\ldots S_j;\ k=1,2\ldots K$

3. <span style="color:aqua">根据实例确定类：</span>$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$

{% endraw %}

### &emsp;贝叶斯估计

{% raw %}

使用极大似然估计可能会出现概率为0的情况，因为概率计算时是以乘积的形式，所以一旦一个概率为0，会影响到总体的概率全部为0，这回影响到后验概率的结果，从而让分类具有了误差，所以我们要消除这个可能性。因为概率可能为非负，所以我们想加上一个正数，让概率全为正数，这就解决了概率可能为0的问题。这就是贝叶斯估计，<span style="color:aqua">条件概率的贝叶斯估计：</span>$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)+\lambda\over{{\sum_{i=1}^N}I(y_i=c_k)}+S_j\lambda}\quad \lambda\ge0$

这个式子等价于在随机变量各个取值的频数上加上一个正数λ>0，当λ为0就是极大似然估计。一般λ取1，称为拉普拉斯平滑（平滑顾名思义就是将函数平滑化，不会有较大的差值）。

对于任何l=1,2...$S_j$，k=1,2...K，都有$P_\lambda(X^{(j)}=a_{jl}\mid Y=c_k)>0,\quad\sum_{l=1}^{S_j}P(X^{(j)}=a_{jl}\mid Y=c_k)=1$，所以表明贝叶斯估计的式子确实代表一种概率分布。

<span style="color:aqua">先验概率的贝叶斯估计：</span>$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)+\lambda}\over {N+K\lambda}}$

{% endraw %}
