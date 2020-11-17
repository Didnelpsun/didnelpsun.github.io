---
layout: post
title:  "最大熵模型"
date:   2020-06-14 15:20:17 +0800
categories: notes machine-learning
tags: 机器学习 基础 machine-learning 最大熵模型
excerpt: "Maximum Entropy Model"
---

最大熵模型是由最大熵原理所推导的模型。

## 最大熵原理

最大熵原理认为，学习概率模型时，在所有可能的概率模型（分布）中，熵最大的模型是最好的模型。即在满足约束条件的模型集合中选择熵最大的模型。

假设离散随机变量X的概率分布为P(X)，则其熵为：

$$H(P)=-\sum_xP(x)\log P(x)$$

且满足不等式$0\le H(P)\le\log\mid X\mid$，其中\|X\|为X的取值个数，当且仅当X的分布是均匀分布，右边对等号成立，也就是说当X服从均匀分布时熵最大。

最大熵原理将熵最大化表示逼近等可能性。

假设随机变量X有5个取值{A,B,C,D,E}，估计取各值概率P(A)，P(B)，P(C)，P(D)，P(E)。

已知只有5个值ABCDE，所以得到：

$$P(A)+P(B)+P(C)+P(D)+P(E)=1$$

满足该条件的概率为无穷多个，一般认为这个分布中取各值的概率为相等的：

$$P(A)=P(B)=P(C)=P(D)=P(E)=\frac{1}{5}$$

若又有一些概率值约束条件：

$$P(A)+P(B)=\frac{3}{10}$$

满足这两个约束条件的概率分布仍有无穷个。一般认为AB为等概率的，CDE为等概率的，所以：

$$P(A)=P(B)=\frac{3}{20}$$

$$P(A)+P(C)=\frac{7}{30}$$

若是有更多的条件也是按如此进行估计，这种学习方法正是遵循了最大熵原理。即如果未知，就认为它们分布都是均匀的，都是平均分配的。

&emsp;

## 最大熵模型定义

假设分类模型为一个条件概率分布P(Y\|X)，$X\in\mathscr X\in R^n$表示输入，$Y\in \mathscr Y$表示输出，$\mathscr X，\mathscr Y$分别为输入输出的集合。表示给定输入X，以条件概率P(Y\|X)输出Y。

给定训练数据集$T=\lbrace(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\rbrace$。

联合分布P(X,Y)的经验分布：

$$\tilde P(X=x,Y=y)=\frac{\sum_{i=1}^NI(X_i=x,Y_i=y)}{N}$$

边缘分布P(X)的经验分布：

$$\tilde P(X=x)=\frac{\sum_{i=1}^NI(X_i=x)}{N}$$

其中N为训练样本容量。

用特征函数f(x,y)描述输入x和输出y之间的某一个事实，定义为：

$$f(x,y)=
\begin{cases}
1,&x,y满足某一事实\\
0,&否则\\
\end{cases}
$$

其为一个二值函数，当真值就为1，当假值就为0。

特征函数f(x,y)关于经验分布$\tilde P(X,Y)$的期望值，用$E_{\tilde P}(f)$表示：

$$E_{\tilde P}(f)=\sum_{x,y}\tilde{P}(x)P(y\mid x)f(x,y)$$

特征函数f(x,y)关于模型P(Y\|X)与经验分布$E_{\tilde P}(f)$的期望值，用$E_P(f)$表示：

$$E_P(f)=\sum_{x,y}\tilde{P}(x)P(y\mid x)f(x,y)$$

若模型能获取训练数据中的信息，那么久可以假设这两个期望值相等：

$$E_P(f)=E_{\tilde P}f(x)$$

这个式子就是模型学习的约束条件，假设有n个特征函数$f_i(x,y),i=1,2\ldots n$，那么就有n个约束条件。

<span style="color:aqua">最大熵模型定义：</span>假设满足所有约束条件的模型集合为：

$$\mathscr C\equiv\lbrace P\in\mathscr P\mid E_P(f_i)=E_{\tilde P}(f_i),\quad i=1,2\ldots n\rbrace$$

定义在条件概率分布P(Y\|X)上的条件熵为：

$$H(P)=-\sum_{x,y}\tilde P(x)P(y\mid x)\log P(y\mid x)$$

则模型集合$\mathscr C$中条件熵H(P)最大的模型称为最大熵模型。式中的对数为自然对数e。

&emsp;

## 最大熵模型的学习

最大熵模型的学习过程就是求解最大熵模型的过程。最大熵模型的学习可以形式化为约束最优问题。

对于给定的数据训练集$T=\lbrace(x_1,y_1),(x_2,y_2)\ldots (x_N,y_N)\rbrace$以及特征函数$f_i(x,y),i=1,2\ldots n$，最大熵模型的学习等价于约束最优化问题：

$$\max_{P\in \mathscr C}H(P)=-\sum_{x,y}\tilde P(x)P(y\mid x)\log P(y\mid x)$$

$$s.t.\quad E_P(f_i)=E_{\tilde P}(f_i), \quad i=1,2\ldots n$$

$$\sum_yP(y\mid x)=1$$

同时也可以转换为极小化问题：

$$\min_{P\in \mathscr C}-H(P)=\sum_{x,y}\tilde P(x)P(y\mid x)\log P(y\mid x)$$

$$s.t.\quad E_P(f_i)-E_{\tilde P}(f_i)=0, \quad i=1,2\ldots n$$

$$\sum_yP(y\mid x)=1$$

这三个问题的解就是最大熵模型学习的解。

具体推导过程如下：

将约束最优化的问题转换为无约束最优化的对偶问题，即将约束与变量转换。

首先引入拉格朗日乘子$\omega_0,\omega_1,\omega_2\ldots \omega_n$，定义拉格朗日函数L(P,ω 
)：

（拉格朗日乘数法：是一种寻找变量受一个或多个条件所限制的多元函数的极值的方法。这种方法将一个有n个变量与k个约束条件的最优化问题转换为一个有n+k个变量的方程组的极值问题，其变量不受任何约束。这种方法引入了一种新的标量未知数，即拉格朗日乘数：约束方程的梯度的线性组合里每个向量的系数。此方法的证明牵涉到偏微分，全微分或链法，从而找到能让设出的隐函数的微分为零的未知数的值。）

$$L(P,\omega)\equiv-H(P)+\omega_0\left(1-\sum_yP(y\mid x)\right)+\sum_{i=1}^n\omega_i(E_{\tilde P(f_i)-E_P(f_i)}$$

$$=\sum_{x,y}\tilde P(x)P(y\mid x)\log P(y\mid x)+\omega_0\left(1-\sum_y(y\mid x)\right)+\sum_{i=1}^n\omega_i\left(\sum_{x,y}\tilde P(x,y)f_i(x,y)-\sum_{x,y}\tilde P(x)P(y\mid x)f_i(x,y)\right)$$

原始最优化问题：

$$\min_{P\in \mathscr C}\max_\omega L(P,\omega)$$

对偶问题：

$$\max_\omega\min_{P\in \mathscr C}L(P,\omega)$$

因为拉格朗日函数L(P,ω)为P的凸函数，所以原始问题与对偶问题等价。

对偶问题是线性规划中提出来的，原问题的极大/极小问题就是对偶问题的极小/极大问题。对偶问题的变量系数矩阵为原问题的约束常量矩阵的转置矩阵，约束常量矩阵为原问题的变量系数矩阵的转置矩阵，同时约束系数矩阵为原问题约束系数问题的转置矩阵。

首先求出内部的极小问题$\min_{P\in \mathscr C}L(P,\omega)$，因为它是ω的函数，所以记作：

$$\Psi(x)=\min_{P\in \mathscr C}L(P,\omega)=L(P_\omega,\omega)$$

Ψ(x)为对偶函数，同时将其解记为：

$$P_\omega=\arg\min_{P\in \mathscr C}L(P,\omega)=P_\omega(y\mid x)$$

然后求拉格朗日方程对概率分布的偏导，即求L(P,ω)对P(y\|x)的偏导：

$$\frac{\partial L(P,\omega)}{\partial P(y\mid x)}=\sum_{x,y}\tilde P(x)(\log P(y\mid x)+1)-\sum_y\omega_0-\sum_{x,y}\left(\tilde P(x)\sum_{i=1}^n\omega_i f_i(x,y)\right)$$

$$=\sum_{x,y}\tilde P(x)\left(\log P(y\mid x)+1-\omega_0-\sum_{i=1}^n\omega_if_i(x,y)\right)$$

令偏导为0，在$\tilde P(x)\gt 0$的条件下，解得：

$$P(y\mid x)=\exp\left(\sum_{i=1}^n\omega_if_i(x,y)+\omega_0-1\right)=\frac{\exp\left(\sum_{i=1}^n\omega_if_i(x,y)\right)}{\exp(1-\omega_0)}$$

又因为$\sum_yP(y\mid x)=1$（全概率为1），得：

$$P_\omega(y\mid x)=\frac{1}{Z_\omega(x)}\exp\left(\sum_{i=1}^n\omega_if_i(x,y)\right)$$

$$Z_\omega(x)=\sum_y\exp\left(\sum_{i=1}^n\omega_if_i(x,y)\right)$$

这两个公式表示的模型$P_\omega=P_\omega(y\mid x)$就是最大熵模型，$Z_\omega(x)$为规范化因子，$f_i(x,y)$为特征函数，$\omega_i$为特征权值，ω就是最大熵模型中的参数向量。

然后求外部的极大化问题：

$$\max_\omega\Psi(x)$$

设解为$\omega^*$：

$$\omega^*=\arg\max_\omega\Psi(\omega)$$

可以使用最优化算法求出对偶函数Ψ(ω)的极大化得到$\omega^\ast$，用来表示$P^\ast\in\mathscr C$，$P^\ast=P_{\omega^\ast}=P_{\omega^\ast}(y\mid x)$是学习到的最优模型，最大熵模型。

所以最大熵模型的学习就是对对偶函数Ψ(ω)的极大化。
