---
layout: post
title:  "决策树"
date:   2020-06-12 11:19:33 +0800
categories: notes machine-learning
tags: machine-learning 
excerpt: "Dicision Tree"
---

决策树是一种基本分类和回归的方法，它是一种树，可以被认为是一种if-then的集合，也可以被认为是特征空间和类空间上的条件概率分布。

特征树学习一般分为三步：特征选择、决策树生成、决策树修剪。

## 决策树模型与学习

### &emsp;决策树模型

分类决策树由结点以及有向边组成，结点分为内部结点和叶结点，内部结点表示一个特征或者属性，叶结点表示一个类。

用决策树分类，从根结点开始，对实例的某一特征进行测试，根据测试结果，将实例分配给其子结点，子结点对应该特征的一个取值，如此递归，最后到叶结点，实例就在叶结点的类中。

### &emsp;决策树与if-then

决策树的根结点到叶结点的每一条路径都是一条if-then规则；路径上内部结点的特征对应规则条件，而叶结点对应规则结论。决策树的路径霍其对应的if-then规则必须是互斥且完备的，每一个实例必须由且仅由一条路径或者if-then规则覆盖。

### &emsp;决策树与条件概率分布

条件概率分布定义在特征额空间的一个划分上，将特征空间划分为互不相交的单元或者区域，并在每个的那元或者区域定义一个类的概率分布，所以就构成了一个条件概率分布。

决策树的路径就对应划分的一个单元，决策树所表示的条件概率分布由各个单元给定条件下类的条件概率分布组成（原理类似贝叶斯定理）。其路径结果为区域，其过程为勾绘的边线。

假设X为表示特征的随机变量，Y为表示类的随机变量，那么这个条件概率分布可以表示为P(Y\|X)，X取值为给定划分下单元的集合，而Y取值与类的集合。

### &emsp;决策树学习

#### &emsp;&emsp;参数定义

已知训练数据集$T=\{(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\}$，其中$x_i=(x_i^{(1)},x_i^{(2)}\ldots x_i^{(n)})^T$为输入实例（特征向量），n为特征个数，$y_i\in \{1,2\ldots K\}$为类标记，i=1,2...N，N为样本容量。

#### &emsp;&emsp;目标策略

决策树学习本质上是从训练数据集中归纳出一组分类规则。能对训练数据集进行正确分类的决策树可能有多个，也可以找不到一个，最重要的是找到能分类准确度最高的决策树，并具有较好泛化能力。

决策树学习用损失函数这一目标，而损失函数通常是正则化的极大似然函数，所以决策树学习策略是以损失函数为目标函数的最小化。

当损失函数确定以后，学习问题就是损失函数意义下选择最优决策树的问题，因为从所有可能的决策树中取最优决策树是NP完全问题。

#### &emsp;&emsp;NP完全问题

这是什么？这里的NP其实是Non-deterministic Polynomial的缩写，即多项式复杂程度的非确定性问题，NP完全问题有时也会简称为NP-C问题。与此概念相关的还有P类问题、NP类问题等。要理解什么是NP完全问题，首先得从P类问题开始理解。

所有可以在多项式时间内求解的判定问题构成P类问题

判定问题是指回答结果输出为Yes或No的问题，比如：3233是否可以写成两个大于1的数字的乘积？是否存在一条路线有且仅有一次的走过七桥问题的每一座桥？

在设计程序时，我们经常需要评估这个程序的时间复杂度，即衡量当问题规模变大后，程序执行所需的时间增长会有多快。如$O(1)$表示常数级别，即不管问题的规模变大多少倍，所耗的时间不会改变；$O(N^2)$表示平方级别，即当问题规模增大至2倍时，所花费的时间则放大至4倍；$O(2^N)$表示指数级别，即当问题规模倍数扩大时，所用时间会呈指数放大。

多项式时间则是指$O(1)$、$O(\log N)$、$O(N^2)$等这类可用多项式表示的时间复杂度，通常我们认为计算机可解决的问题只限于多项式时间内。而$O(2^N)$、$O(N!)$这类非多项式级别的问题，其复杂度往往已经到了计算机无法解决的程度。

所有非确定性多项式时间内可解的判定问题构成NP类问题

NP类问题将问题分为求解和验证两个阶段，问题的求解是非确定性的，无法在多项式时间内得到答案，而问题的验证却是确定的，能够在多项式时间里确定结果。

比如：是否存在一个公式可以计算下一个质数是多少？这个问题的答案目前是无法直接计算出来的，但是如果某人给出了一个公式，我们却可以在多项式时间里对这个公式进行验证。

NP中的一类比较特殊的问题，这类问题中每个问题的复杂度与整个类的复杂度有关联性，假如其中任意一个问题在多项式时间内可解的，则这一类问题都是多项式时间可解。这些问题被称为NP完全问题。

可以说NP完全问题是NP类问题的一种特殊情况：

问题类型|是否能在多项式时间内求解|是否能在多项式时间内验证
:-----:|:---------------------:|:------------------:
P|是|是
NP|是 or 否|是
NP-C|未知|是

表格中的问题类型的困难程度依次递增。

由表可知，NP类问题是否能在多项式时间内求解，其答案并不明确。

决策树的NP完全问题是指在决策树算法中，寻找最优决策树是一个NP完全问题。决策树的这一特点，说明我们无法利用计算机在多项式时间内，找出全局最优的解。

也正因为如此，大多数决策树算法都采用启发式的算法，如贪心算法，来指导对假设空间的搜索。可以说，决策树最后的结果，是在每一步、每一个节点上做的局部最优选择。决策树得到的结果，也因此没法保证为全局最优的。

#### &emsp;&emsp;决策树构建

决策树学习的算法所以一般都是一个递归选择最优特征，根据该特征对训练数据进行分割，使对各个子数据集有一个最好的分类的过程。这个过程就是特征空间的划分，也是决策树的构建。

开始，构建根结点，将所有训练数据都放在根结点。选择一个最优特征，按照这-特征将训练数据集分割成子集，使得各个子集有一个在当前条件下最好的分类。如果这些子集已经能够被基本正确分类，那么构建叶结点，并将这些子集分到所对应的叶结点中去；如果还有子集不能被基本正确分类，那么就对这些子集选择新的最优特征，继续对其进行分割，构建相应的结点。如此递归地进行下去，直至所有训练数据子集被基本正确分类，或者没有合适的特征为止。最后每个子集都被分到叶结点上，即都有了明确的类。这就生成了一棵决策树。

然而这时生成的决策树对于训练数据有较好的分类能力，但是对未知测试数据未必有良好分类能力，可能出现过拟合，所以我们需要剪枝，即从下而上，去除叶结点，使其退回到父结点甚至更高结点，作为新的叶结点。

如果特征数量过多，也可以在学习开始的时候就对特征进行选择，挑出分类能力强的特征。

决策树生成属于模型局部选择，而剪枝属于全局优化选择。

&emsp;

## 特征选择

特征选择是决策树学习的第一步，选取对于训练数据具有分类能力的特征，提升学习效率。如果一个特征分类结果与随机分类结果没有很大差别，那么这个特征是没有分类能力的，去掉这些特征对学习的精度影响不大，通常特征选择的准则是信息增益或者信息增益比。

### &emsp;信息增益

#### &emsp;&emsp;熵定义

在信息论与概率统计中，<span style="color:yellowgreen">熵</span>表示随机变量不确定性的度量，设X为一个取有限值的离散随机变量，其概率分布为$P(X=x_i)=p_i,\quad i=1,2\ldots n$，则随机变量X的熵为$H(X)=-\sum_{i=1}^np_i\log p_i$。

如果$p_i=0$，那么定义其为0。一般式子中的对数以2为底或者以e为底，此时熵的单位被称为比特和纳特。

由式子可知，熵只依赖X的分布，而与X的取值无关，所以X的熵也可以记作H(p)，与H(X)公式相等。

熵越大，随机变量的不确定性就越大，其中$0\le H(p)\le \log n$。

#### &emsp;&emsp;伯努利分布的熵

当随机变量只为两个值，如10时，X的分布为P(X=1)=p，P(X=0)=1-p，p∈\[0,1\]，熵为$H(p)=-p\log_2p-(1-p)\log_2(1-p)$

熵分布曲线如下（单位为比特）：

![10变量熵][10]

当p为1或者0时随机变量没有不确定性，当p=0.5，熵最大为1。

#### &emsp;&emsp;条件熵、经验熵与经验条件熵

设随机变量(X,Y)，其联合概率分布为$P(X=x_i,Y=y_i)=p_{ij},\quad i = 1,2\ldots n;\quad j=1,2\ldots m$，<span style="color:yellowgreen">条件熵</span>H(X\|Y)表示在已知随机变量X的条件下随机变量Y的不确定性，定义为X给定条件下Y的条件概率分布的熵对X的数学期望$H(Y\mid X)=\sum_{i=1}^np_iH(Y\mid X=x_i),\quad p_i=P(X=x_i),i=1,2\ldots n$。如果概率为0，就让$0\log 0=0$。

而当熵和条件熵的概率由数学估计（特别是极大似然估计）得到时，就称它们为经验熵和经验条件熵。

#### &emsp;&emsp;信息增益定义

<span style="color:yellowgreen">信息增益</span>表示已知特征X的信息而使得Y的信息不确定性减少的程度。

特征A对于训练数据集D的信息增益g(D,A)，定义为集合D的经验熵H(D)与特征A给定条件下D的经验条件熵H(D\|A)之差，即$g(D,A)=H(D)-H(D\mid A)$。

一般熵H(Y)与条件熵H(Y\|X)之差称为<span style="color:yellowgreen">互信息</span>。决策树学习中的信息增益等价于训练数据集中类与特征的互信息。

#### &emsp;&emsp;决策树的信息增益处理

决策树学习应用信息增益准则选择特征。给定训练数据集D和特征A,经验熵H(D)表示对数据集D进行分类的不确定性。而经验条件熵H(D\|A)表示在特征A给定的条件下对数据集D进行分类的不确定性。那么它们的差，即信息增益，就表示由于特征A而使得对数据集D的分类的不确定性减少的程度。显然，对于数据集D而言，信息增益依赖于特征，不同的特征往往具有不同的信息增益。信息增益大的特征具有更强的分类能力。

根据信息增益准则的特征选择方法是:对训练数据集(或子集) D,计算其每个特征的信息增益，并比较它们的大小，选择信息增益最大的特征。

#### &emsp;&emsp;信息增益算法

设训练数据集为D，\|D\|表示样本容量，即样本个数。设有K个类$C_k$，k=1,2...K，$\mid C_k \mid$为属于类$C_k$的样本个数，显然$\sum_{k=1}^K\mid C_k\mid = \mid D\mid$。设特征A有n个不同的取值$\{a_1,a_2\ldots a_n\}$，根据特征A的取值将D划分为n个子集$D_1,D_2\ldots D_n$，$\mid D_i\mid$为样本$D_i$的样本个数，又显然$\sum_{k=1}^K\mid D_i\mid = \mid D\mid$。记子集$D_i$中属于类$C_k$的样本集合为$D_{ik}$，即$D_{ik}=D_i\cap C_k$，又$\mid D_{ik}\mid$为$D_{ik}$样本个数。

输入：训练数据集D和特征A。
输出：特征A对训练集D的信息增益g(D,A)。

{% raw %}

1. 计算数据集D的经验熵：$H(D)=-\sum_{k=1}^K{{\mid C_k\mid}\over{\mid D\mid}}\log_2{{\mid C_k\mid}\over{\mid D\mid}}$
2. 计算特征A对数据集D的经验条件熵：$H(D\mid A)=\sum_{i=1}^n{{\mid D_i\mid}\over{\mid D\mid}}H(D_i)=-\sum_{i=1}^n{{\mid D_i\mid}\over{\mid D\mid}}\sum_{k=1}^K{{\mid D_{ik}\mid}\over{\mid D_i\mid}}\log_2{{\mid D_{ik}\mid}\over{\mid D_i\mid}}$
3. 计算信息增益：$g(D,A)=H(D)-H(D\mid A)$

{% endraw %}

### &emsp;信息增益比

如果使用信息增益算法作为划分训练数据集的特征，存在偏向于选择取值较多的特征的问题（即特征出现频率越多选择的偏向越大），使用信息增益比可以矫正这个问题。（即比如一个复杂的问题我解决了一大半和一个简单的问题我解决了一大半的解决能力的体现是不一样的）

{% raw %}

特征A对训练数据集D的<span style="color:yellowgreen">信息增益比</span>$g_R(D,A)$定义为其信息增益g(D,A)与训练数据集D关于特征A的值的熵$H_A(D)$之比：$g_R(D,A)={{g(D,A)}\over{H_A(D)}},\quad H_A(D)=-\sum_{i=1}^n{{\mid D_i\mid}\over{\mid D\mid}}\log_2{{\mid D_i\mid}\over{\mid D\mid}}$，其中n为特征A取值的个数。

{% endraw %}

&emsp;

## 决策树的生成

### &emsp;ID3算法

ID3算法核心为在决策树上各个结点运用信息增益准则选择最优特征，递归构建决策树。

具体来说：从根结点开始，对结点计算所有可能的特征的信息增益，选择当前信息增益最大的特征作为当前结点的特征，由该特征的不同取值建立子结点；再对子结点递归使用此方法构建树，直到所有特征的信息增益都很小或没有特征可以选择为止，最后得到决策树。ID3相当于用极大似然估计进行概率模型的选择。

#### &emsp;&emsp;ID3算法流程

输入：训练数据集D，特征集A阈值ε。
输出：决策树T。

1. 若D中所有实例都属于同一类$C_k$，则T为单结点树，并将$C_k$作为该结点的类标记，返回T；
2. 若A为∅，则T为单结点树，并将D中实例树最大的类$C_k$作为该结点的类标记，返回T；
3. 否则按照信息增益算法计算A中各特征对D的信息增益，选择信息增益最大的特征$A_g$；
4. 如果$A_g$的信息增益小于阈值ε，那证明这个信息增益过小，对于分类的精度没有太大的影响，就设置T为单结点树，并将D中实例数中出现频数最大的类$C_k$作为该结点的类标记，返回T；
5. 否则，对$A_g$的每一个可能值$a_i$，依照$A_g=a_i$将D分割为若干非空子集$D_i$，将$D_i$中实例数中出现频数最大的类作为标记，建立子结点，由结点以及子结点构成数T，返回T；
6. 对于第i各子结点，以$D_i$作为训练集，以$A-\{A_g\}$即次优信息增益特征为特征集，递归1到5步，得到子树$T_i$，返回$T_i$。

### &emsp;C4.5算法

C4.5算法与ID3算法类似，只是选择信息增益比作为选择特征的标准。

其步骤基本上和ID3算法步骤一致。

&emsp;

## 决策树的剪枝

之前也已经说过了，全部的局部最优未必是全局的最优，所以很可能决策树在生成时会出现过拟合的情况，剪枝就是降低决策树复杂性，提升决策树对未知测试集的分类精确性。

而剪枝就是去除一些子结点。

决策树的剪枝一般是通过极小化决策树整体的损失函数或者代价函数来实现。

### &emsp;损失函数

设决策树T的叶结点个数为\|T\|，t是T的叶结点，该叶结点上有$N_t$个样本点，其中k类的样本有$N_{tk}$个，k=1,2...K，$H_t(T)$为叶结点t上的经验熵，α≥0为参数。

{% raw %}

决策树学习的<span style="color:aqua">损失函数</span>为$C_\alpha(T)=\sum_{t=1}^{\mid T\mid}N_tH_t(T)+\alpha\mid T\mid,\quad H_t(T)=-\sum_k{{N_{tk}}\over{N_t}}\log{{N_{tk}}\over{N_t}}$

一般将损失函数右端第一项记为$\sum_{t=1}^{\mid T\mid}N_tH_t(T)=C(T)=-\sum_{t=1}^{\mid T\mid}\sum_{k=1}^KN_{tk}\log{{N_{tk}}\over{N_t}}$

那么这时$C_\alpha(T)=C(T)+\alpha\mid T\mid$

{% endraw %}

其中C(T)表示模型对训练数据的预测误差，即模型与训练数据的拟合程度，\|T\|表示模型复杂度，参数α控制两者之间的影响，较大的α促使选择较简单的模型树，而较小的α促使选择较复杂的模型树，α为0表示只考虑模型与训练数据的拟合程度，不考虑模型复杂度。

剪枝就是当α确定时，选择损失函数最小的模型，即损失函数最小的子树。当α值确定，子树越大，与训练数据的拟合程度就越好，但是模型树的复杂度就越高，相反则复杂度越低，拟合不好。损失函数表达了二者的平衡选择。

损失函数的极小化等价于正则化的极大似然估计。利用损失函数最小原则进行剪枝就是用正则化的极大似然估计进行模型选择。

苟富贵分工
[10]:data:image/jpeg;base64,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

[]