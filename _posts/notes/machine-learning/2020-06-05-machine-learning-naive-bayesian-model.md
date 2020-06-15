---
layout: post
title:  "朴素贝叶斯"
date:   2020-06-05 15:21:46 +0800
categories: notes machine-learning
tags: machine-learning 朴素贝叶斯 贝叶斯 NBM 多项式 高斯 伯努利
excerpt: "Naive Bayesian Model"
---

最为广泛的两种分类模型是决策树模型（Decision Tree Model）和朴素贝叶斯模型（Naive Bayesian Model，NBM）。和决策树模型相比，朴素贝叶斯分类器（Naive Bayes Classifier或NBC）发源于古典数学理论，有着坚实的数学基础，以及稳定的分类效率。同时，NBC模型所需估计的参数很少，对缺失数据不太敏感，算法也比较简单。理论上，NBC模型与其他分类方法相比具有最小的误差率。但是实际上并非总是如此，这是因为NBC模型假设属性之间相互独立，这个假设在实际应用中往往是不成立的，这给NBC模型的正确分类带来了一定影响。

朴素贝叶斯是基于贝叶斯定理与特征条件独立假设（即假设特征向量的每个变量都是相互独立的）。

朴素贝叶斯法是对于给定的训练数据集，基于特征条件独立假设学习输入输出的联合概率分布；然后得到这个模型，基于这个模型，对给定的输入x，利用贝叶斯定义求出后验概率最大的输出y。其根本就是反向推导。

朴素贝叶斯法实际上是学习到生成数据的机制，所以就是<span style="color:yellowgreen">生成模型</span>。生成模型给观测值和标注数据序列指定一个联合概率分布。在机器学习中，生成模型可以用来直接对数据建模，例如根据某个变量的概率密度函数进行数据采样，也可以用来建立变量间的条件概率分布。能够随机生成观测数据的模型，尤其是在给定某些隐含参数的条件下。除了生成模型还有判别模型。

生成模型和判别模型都是为了获取后验概率P(c\|x)，<span style="color:yellowgreen">判别模型</span>给定x直接建模P(c\|x)来预测c（如后面的决策树、BP神经网络、支持向量机等），而<span style="color:yellowgreen">生成模型</span>则是对联合概率分布P(x,c)建模，然后得到P(c\|x)。

## 朴素贝叶斯法的理论基础

### &emsp;参数定义

设输入空间$\mathscr X \in R^n$为n维向量的集合，输出空间维类标记集合$\mathscr Y=\{c_1,c_2\ldots c_K\}$。输入x属于$\mathscr X$，而输出类标记y为$\mathscr Y$。X为$\mathscr X$上的随机向量，Y为$\mathscr Y$上的随机变量，而P(X,Y)为XY的联合概率分布。

训练数据集$T=\{(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\}$由P(X,Y)独立同分布产生。

### &emsp;贝叶斯公式

{% raw %}

贝叶斯定理公式为$P(B_i\mid A)={{P(B_i)P(A\mid B_i)}\over{\sum_{j=1}^n}P(B_j)P(A\mid B_j)}$

所以$P(y\mid x)={P(y)P(x\mid y)\over{P(x)}}$

{% endraw %}

P(y)为类的先验概率，P(x\|y)为样本x对于类标记y的类条件概率，也称为似然，P(x)是用于归一化的证据因子，对于给定的样本x，证据因子P(x)于类标记y无关。所以在贝叶斯算法中估计P(y\|x)的问题就变成了根据训练集来估计先验概率P(y)和似然P(x\|y)。

### &emsp;条件独立性假设

朴素贝叶斯法对条件概率分布做出了条件独立性的假设，即用于分类的特征在类确定的条件夏都是条件独立的，因为这是个约束较强的假设（因为基本很少条件会是完全独立的，就比如身高体重），所以就叫朴素贝叶斯法（假设后模型相对很简单）。

独立性假设是：$P(X=x\mid Y=c_k)=P({X^{(1)}=x^{(1)},\ldots ,X^{(n)}=x^{(n)}\mid Y=c_k})=\prod_{j=1}^nP(X^{(j)}=x^{(j)}\mid Y=c_k)$

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

$P(Y=c_k\mid X=x)={{P(X=x\mid Y=c_k)P(Y=c_k)}\over {\sum_kP(X=x\mid Y=c_k)P(Y=c_k)}}$

将条件独立性假设公式代入：

<span style="color:aqua">朴素贝叶斯法分类：</span>$P(Y=c_k\mid X=x)={{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}\over {\sum_kP(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}，k=1,2\ldots K$

<span style="color:aqua">朴素贝叶斯分类器：</span>$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}\over {\sum_kP(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$

这个分类器主要进行单点估计。

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

我们应该了解为什么要进行参数估计？因为我们之前就已经提到了，因为贝叶斯算法需要知道许多条件下的概率，而如果参数个数变多，那么这些概率就变得非常庞大难以计算了，这就是为什么我们要进行估计的原因。

实际上概率模型的学习就是对参数的估计。

朴素贝叶斯法中，学习就是计算（实际上是估计）$P(Y=c_k)$和$P(X^{(j)}=x^{(j)}\mid Y=c)$。可以使用极大似然估计来估计对应的概率。

（对于参数估计大概有两种解决方案，频率注意学派认为参数虽然未知，但是存在固定值，所以可以通过优化似然函数等来确定参数值；而贝叶斯学派则认为参数是未能观测到随机变量，这个变量是有分布的，所以可假定这个参数服从一个先验分布，然后基于观测到的数据计算参数的后验分布。极大似然估计就是根据数据采样来估计频率分布参数的方法）

{% raw %}

先验概率$P(Y=c_k)$的极大似然估计是$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)}\over N},k=1,2\ldots ,K$，其实就是估计每个类出现的频次。

设第j个特征$x^{(j)}$的可能取值为$\{a_{j1},a_{j2}\ldots a_{jS_j}\}$，$x_i^{(j)}$为第i个样本的第j个特征；$a_{jl}$为第j个特征所可能取的第l个值；I()为指示函数，中间条件为真就返回1，假就返回0。$j=1,2\ldots n;\ l=1,2\ldots S_j;\ k=1,2\ldots K$

那么条件概率$P(X^{(j)}=a_{jl}\mid Y=c_k)$的极大似然估计下，条件概率就是出现的频次：$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)\over{{\sum_{i=1}^N}I(y_i=c_k)}}$

{% endraw %}

&emsp;

## 贝叶斯模型

### &emsp;朴素贝叶斯算法

所以根据上面的一系列证明，我们可以得到最后的贝叶斯算法定义：

输入为训练数据集$T=\{(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\}$，其中$x_i=(x_i^{(1)},x_i^{(2)}\ldots x_i^{(n)})^T$，$x_i^{(j)}$是第i个样本第j个特征值，$x_i^{(j)}\in\{a_{j1},a_{j2}\ldots a_{jS_j}\}$，$a_{jl}$是第j个特征值可能取得的第l个值，j=1,2...n,l=1,2...$S_j$，$y_i\in\{c_1,c_2\ldots c_K\}$或者输入为实例x。

输出为y即x的分类。

{% raw %}

第一步，<span style="color:aqua">先验概率：</span>$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)}\over N},k=1,2\ldots ,K$

第二步，<span style="color:aqua">条件概率：</span>$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)\over{{\sum_{i=1}^N}I(y_i=c_k)}}\quad j=1,2\ldots n;\ l=1,2\ldots S_j;\ k=1,2\ldots K$

第三步，<span style="color:aqua">根据实例确定类：</span>$y=f(x)=arg \max_{c_k}{{P(Y=c_k)\prod_jP(X^{(j)}=x^{(j)}\mid Y=c_k)}}$

{% endraw %}

### &emsp;贝叶斯估计

{% raw %}

在特征值为离散值时，使用极大似然估计可能会出现概率为0的情况，因为参数过大样本可能不能充分满足每一种可能的情况，这个情况就未被观测到，所以这个情况下的概率就计算为0。频率因为概率计算时是以乘积的形式，所以一旦一个概率为0，会影响到总体的概率全部为0，这回影响到后验概率的结果，从而让分类具有了误差，所以我们要消除这个可能性。因为概率可能为非负，所以我们想加上一个正数，让概率全为正数，这就解决了概率可能为0的问题。

这就是贝叶斯估计，<span style="color:aqua">条件概率的贝叶斯估计：</span>$P(X^{(j)}=a_{jl}\mid Y=c_k)={{\sum_{i=1}^N}I(x_i^{(j)}=a_{jl},y_i=c_k)+\lambda\over{{\sum_{i=1}^N}I(y_i=c_k)}+S_j\lambda}\quad \lambda\ge0$

这个式子等价于在随机变量各个取值的频数上加上一个正数λ>0，当λ为0就是极大似然估计。一般λ取1，称为拉普拉斯平滑（平滑顾名思义就是将函数平滑化，不会有较大的差值）。

对于任何l=1,2...$S_j$，k=1,2...K，都有$P_\lambda(X^{(j)}=a_{jl}\mid Y=c_k)>0,\quad\sum_{l=1}^{S_j}P(X^{(j)}=a_{jl}\mid Y=c_k)=1$，所以表明贝叶斯估计的式子确实代表一种概率分布。

<span style="color:aqua">先验概率的贝叶斯估计：</span>$P(Y=c_k)={{\sum_{i=1}^NI(y_i=c_k)+\lambda}\over {N+K\lambda}}$

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

使用贝叶斯估计的拉普拉斯估计

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

MultinamialNB这个函数，只有3个参数：alpha（拉普拉斯平滑），fit_prior（表示是否要考虑先验概率），和class_prior：可选参数
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
