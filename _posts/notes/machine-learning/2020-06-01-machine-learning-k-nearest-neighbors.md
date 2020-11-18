---
layout: post
title:  "k近邻算法"
date:   2020-06-01 23:41:06 +0800
categories: notes machine-learning
tags: 机器学习 基础 machine-learning KNN k近邻 kd树 kd-tree ball树 ball-tree
excerpt: "K-Nearest Neighbors"
---

k近邻算法本身十分简单，作为机器学习算法入门的第一节算法，它是再适合不过了。它甚至见到到周志华的西瓜书都没有记录这个算法，而李航的《统计学习方法》中则保留了。

## 定义

k近邻法最简单直接地介绍，就是我们有一个数据集，数据集中有对应的特征向量的实例，每个实例都有标注对应的类别。那么现在我们有一个新的实例，它有对应的特征向量，但是我们没有标注它的类别，怎么办？使用k近邻法，就是找到与它特征值最近（或者说最相似的）k个实例点，从这k个实例点中选择最接近（一般是频率出现最高的）的类别，这个类别就是这个新实例的类别。

具体的数学定义如下：

已知有$T=\lbrace (x_1,y_1),(x_2,y_2)...(x_N,y_N)\rbrace, x_i∈R_n,y_i∈\lbrace c_1,c_2...c_K\rbrace, i=1,2\ldots N$，即输入N个实例向量组，其中y属于k个类别。

输入实例特征向量x，输出对应的实例类y。

<span style="color:aqua">k近邻公式：</span>

$$y = arg \max_{c_j}{\sum_{x_i\in N_k(x)}I(y_i=c_j),i=1,2\ldots N;j=1,2\ldots K}$$

其中$I()$为指示函数，只有括号内的条件为真时才为1，其他情况为0。

当取近邻数k=1的时候就是最近邻算法，代表判断的准则为最近的一个实例点的类。

&emsp;

## 实例图形展示

k近邻算法二维展示：

![k近邻二维图][knn2d]

当k选择为1时，根据测算距离的方法（这里是欧式距离，即以目标点为中心画圆），求出最近的一个点，这个点是五角星，所以这个目标的实例点就是五角星类。而当k为7时，选择7个最近点（再次画圆，不断扩大半径直到圆能包含7个点），根据这7个点进行类型判断（一般是多数表决法，选取出现频率最高的），这时三角形的类更符合（出现了4个，而五角星是3个），所以这个实例点的类型就变为三角形类了。

&emsp;

## k临近算法流程

一般算法流程：

+ 收集数据：可以使用任何方法
+ 准备数据：距离计算所需要的数值，最后是结构化的数据格式。
+ 分析数据：可以使用任何方法
+ 训练算法：（此步骤kNN）中不适用
+ 测试算法：计算错误率
+ 使用算法：首先需要输入样本数据和结构化的输出结果，然后运行k-近邻算法判定输入数据分别属于哪个分类，最后应用对计算出的分类执行后续的处理。

我们可以看出来k近邻法没有训练这个过程，因为一个实例来了就都是放在所有的数据中计算相似度/距离。

&emsp;

## k近邻算法特点

优点

+ 精度高：能根据最近邻的几个点来综合分析这个实例点的类别，准确性高。
+ 对异常值不敏感：当k值选的合理时（较大），能平滑掉异常值的影响。
+ 无数据输入假定：k近邻算法的输入值直接输入就可以进行判断，

缺点

+ 计算复杂度高：因为一个实例输入，就需要计算所有数据对于它的距离，如果数据过多，计算复杂是十分高的。
+ 空间复杂度高：计算的数据需要保存来比较，大量的数据需要大量的存储空间。

适用数据范围

+ 数值型：数值型目标变量则可以从无限的数值集合中取值，如0.555，666.666等（数值型目标变量主要用于回归分析）。
+ 标称型：标称型目标变量的结果只在有限目标集中取值，比如真与假（标称型目标变量主要用于分类）。

&emsp;

## k近邻算法三要素

三要素分别为度量距离、k值选择、分类决策规则。

### &emsp;度量距离

#### &emsp;&emsp;1.闵式距离（Lp距离/闵可夫斯基距离）

已知特征变量为：$x_i=(x_i^{(1)},x_i^{(2)}\ldots x_i^{(n)})$，xi,xj的<span style="color:aqua">Lp距离：</span>

$$L_p(x_i,x_j)=\left(\sum_{l=1}^n\mid x_i^{(l)}-x_j^{(l)}\mid ^p\right)^{1 \over p}$$

其中p大于等于1且为整数。

其中如果p为2就是欧式距离L2，如果p为1就是曼哈顿距离L1，如果p为∞，那么就是切比雪夫距离L∞。

Lp在p取值不同下各种计算方法的“圈”（以只有两个参数为例）：

![圈][circle]

欧式距离就是画圆，而曼哈顿距离就是差的正值，而切比雪夫距离因为幂数达到无穷大，所以差值较小就会被差值较大的遮盖（参考幂函数，当幂无穷大的时候，底数更大的值要远远超过底数稍小的），所以取得的就算差值的最大值。

Lp距离就如我们最熟悉的距离计算方法欧式距离，计算的是两点之间的距离。但是实际上并不是所有的问题都应该计算两点距离。

#### &emsp;&emsp;2.马氏距离

由P.C.Mahalanobis提出，是基于样本分布的一种距离测量，表示点与分布的距离。

我们熟悉的欧氏距离虽然很有用，但也有明显的缺点。它将样品的不同属性（即各指标或各变量）之间的差别等同看待，这一点有时不能满足实际要求。例如，在教育研究中，经常遇到对人的分析和判别，个体的不同属性对于区分个体有着不同的重要性。因此，有时需要采用不同的距离函数。

马氏距离考虑到各种特性之间的联系（例如身高和体重，越高的人体重必然要相对重一些），可以消除样本间的相关性。

马氏距离广泛用于分类和聚类分析。

![马氏路径][madistance]

马氏距离的计算公式如下：

一组向量$\lbrace \vec{X_1},\vec{X_2}\ldots \vec{X_n}\rbrace$，其中$\vec{X}=\lbrace x_1,x_2\ldots x_m\rbrace$。

均值为$\vec{\mu}=\lbrace \mu_1,\mu_2\ldots \mu_m\rbrace$，协方差矩阵为$\sum_{ij}=cov(x_i,x_j)$。

单向量的<span style="color:aqua">马氏距离：</span>

$$MD(\vec{X})=\sqrt{(\vec{X}-\vec{\mu})^T\sum^{-1}(\vec{X}-\vec{\mu})}$$

向量间的<span style="color:aqua">马氏距离：</span>

$$MD(\vec{X},\vec{Y})=\sqrt{(\vec{X}-\vec{Y})^T\sum^{-1}(\vec{X}-\vec{Y})}$$

单位矩阵的<span style="color:aqua">马氏距离：</span>

$$D_M(x)=\sqrt{(x-\mu)^T(x-\mu)}$$

对角矩阵的<span style="color:aqua">马氏距离：</span>

$$D_M(x)=\sqrt{\sum_{i=1}^n{(x_i-\mu_i)^2 \over \sigma_i^2}}$$

计算马氏距离的案例：

一组向量：{3,4},{5,6},{2,2},{8,4}求其马氏距离。

得到均值$\vec{\mu}=\lbrace 4,5,4\rbrace$

协方差矩阵：

$$\sum=\begin{bmatrix}7&2\\2&2.667\\\end{bmatrix},\sum^{-1}=\begin{bmatrix}0.18&-0.13\\-0.13&0.48\\\end{bmatrix}$$

得到{3,4}和{5,6}之间的距离$MD=\sqrt{(-2,-2)^T\sum^{-1}(-2,-2)}=1.2$

```python
import numpy
from numpy import dot as dot
x = numpy.array([[3,4],[5,6],[2,2],[8,4]])
# T为转置
xT = x.T
# numpy.cov为协方差方法，var为方差方法
D = numpy.cov(xT)
# numpy.linalg.inv为求逆矩阵
invD = numpy.linalg.inv(D)
tp = x[0] - x[1]
# numpy.dot计算点积
print(numpy.sqrt(dot(dot(tp, invD), tp.T)))

>>>>>1.243163121016122
```

### &emsp;k值选择

过小：

+ “学习”的近似误差会减小，但“学习”的估计误差会增大
+ 噪声敏感
+ 整体模型变得复杂，容易发生过拟合

过大：

+ 减少学习的估计误差，但缺点是学习的近似误差会增大
+ 整体的模型变得简单，精度下降

### &emsp;分类决策规则

一般是多数表决规则。

多数表决规则下，如果分类损失函数为0-1损失函数（即损失以分类的是否值作为结果），那么误分类率为：

$${1\over k}\sum_{x_l\in N_k(x)}I(y_i\neq c_j)=1-{1\over k}\sum_{x_l\in N_k(x)}I(y_i=c_j)$$

&emsp;

## k近邻算法实现

将使用Python进行实现：

```python
from numpy import *
from matplotlib import pyplot as plt
import operator


# group代表训练数据组
# labels代表对应的数据的类别

def createDataSet():
    group = array([[1.0, 1.1], [1.0, 1.0], [0, 0], [0, 0.1]])
    label = ['A', 'A', 'B', 'B']
    return group, label


# inX代表测试集，即要判断类别的数据
# dataSet代表训练集，即用于训练模型的数据
# labels对应的训练标签
# k，knn算法参数，即判断的临近点个数


def knnClassify(inX, dataSet, labels, k):
    # shape函数是numpy.core.fromnumeric中的函数，它的功能是读取矩阵的长度，
    # 比如shape[0]就是读取矩阵第一维度的长度，即数据集的列数
    dataSetSize = dataSet.shape[0]
    # tile函数位于python模块numpy.lib.shape_base中，他的功能是重复某个数组。
    # 比如tile(A,(n,2))，功能是将数组A按行重复n次，按列重复2次，构成一个新的数组
    # 在列向量方向上重复inX共1次(横向)，行向量方向上重复inX共dataSetSize次(纵向)
    # 而diffMat就是将测试的数组变为和训练集一样后与原数组的差值
    diffMat = tile(inX, (dataSetSize, 1)) - dataSet
    # 将差值平方
    sqDiffMat = diffMat ** 2
    # sum()所有元素相加，sum(0)列相加，sum(1)行相加
    sqDistances = sqDiffMat.sum(1)
    # 最后将差值平方对应相加再开方，这就是欧式距离
    distances = sqDistances ** 0.5
    # print(distances)
    # argsort函数返回的是数组值从小到大的索引值
    # 返回distances中元素从小到大排序后的索引值，也就是实例数据的索引
    sortedDistIndicies = distances.argsort()
    # print(sortedDistIndicies)
    # 定义一个记录类别次数的字典
    classCount = {}
    # 开始循环，选出最临近的k个实例点
    for item in range(k):
        # 取出对应的索引对应的实例类别
        voteIlabel = labels[sortedDistIndicies[item]]
        # dict.get(key,default=None),字典的get()方法,返回指定键的值,如果值不在字典中返回默认值0。
        # 对于最临近的k个数据点进行类型统计，以类名为键名，以频率为键值，当出现新的键名就将对应的键值初始化为0
        classCount[voteIlabel] = classCount.get(voteIlabel, 0) + 1
    # key=operator.itemgetter(1)根据字典的值进行排序
    # key=operator.itemgetter(0)根据字典的键进行排序
    # reverse降序排序字典
    sortedClassCount = sorted(classCount.items(), key=operator.itemgetter(1), reverse=True)
    # 开始绘图
    x = []
    y = []
    # 设置x
    for item in range(dataSet.shape[0]):
        x.append(dataSet[item][0])
        y.append(dataSet[item][1])
    plt.plot(x,y,'og')
    plt.plot(inX[0],inX[1],'or')

    plt.show()
    # 取出频率最高的类名
    return sortedClassCount[0][0]


if __name__ == '__main__':
    # 利用方法获取训练数据集和类集
    groups, labels = createDataSet()
    print(knnClassify([2, 0.5], groups, labels, 3))
```

&emsp;

## kd-tree

为什么要使用kd树？因为k近邻算法要计算所有的数据再与输入的数据进行对比，无论是计算还是最后检索都十分麻烦，而kd树就是利用二叉树来保存处理k近邻算法的数据。

### &emsp;构造kd树

开始:构造根结点，根结点对应于包含T的k维空间的超矩形区域。选择$x_{(1)}$为坐标轴，以T中所有实例的$x_{(1)}$坐标的中位数为切分点，将根结点对应的超矩形区域切分为两个子区域。切分由通过切分点并与坐标轴$x_{(1)}$垂直的超平面实现。由根结点生成深度为1的左、右子结点:左子结点对应坐标$x_{(1)}$小于切分点的子区域，右子结点对应于坐标$x_{(1)}$大于切分点的子区域。将落在切分超平面上的实例点保存在根结点。

(2)重复:对深度为j的结点，选择$x_{(l)}$为切分的坐标轴，l= j(mod k)+1（坐标轴循环），以该结点的区域中所有实例的$x_{(l)}$坐标的中位数为切分点，将该结点对应的超矩形区域切分为两个子区域（也可以计算这些点该坐标轴的平均值，选择距离这个平均值最近的点作为超平面与这个坐标轴的交点。这样这个树不会完美地平衡，但区域会倾向于正方地被划分，连续的分割更有可能在不同方向上发生。）。切分由通过切分点并与坐标轴$x_{(l)}$垂直的超平面实现。由该结点生成深度为j+1的左、右子结点：左子结点对应坐标$x_{(l)}$小于切分点的子区域，右子结点对应坐标$x_{(l)}$大于切分点的子区域。将落在切分超平面上的实例点保存在该结点。

(3)直到两个子区域没有实例存在时停止。从而形成kd树的区域划分。

给定一个二维数据集：$T=\lbrace (15,4)^T,(7,11)^T,(23,10)^T,(4,14)^T,(9,8)^T,(1,6)^T,(3,2)^T\rbrace$，构造一个平衡kd树。

首先按照第一维升序排序得到：$\lbrace (1,6)^T,(3,2)^T,(4,14)^T,(7,11)^T,(9,8)^T,(15,4)^T,(23,10)^T\rbrace$。

按照第二维升序排序得到：$\lbrace (3,2)^T,(15,4)^T,(1,6)^T,(9,8)^T,(23,10)^T,(7,11)^T,(4,14)^T\rbrace$。

因为一共有7个数据，所以应该折半第一维选第四个为根节点保存的数据，即$(7,11)^T$。然后将两部分数据分开，两部分各按第二维进行切分。第二层的根节点为$(1,6)^T$和$(9,8)^T$。最后一层按照第一维进行切分。最后得到kd树：

![kd树][kdtree]

<span style="color:orange">注意：</span>如果元素有偶数个节点，那么你可以取较大的作为父节点也可以取较小的作为父节点，构造出来的树没有特别大的不同，但是要保持一样的取值规则。

### &emsp;检索kd树

搜索的目标是找到当前最近临近点。

1. 在kd树中找出包含目标点x的叶结点：从根结点出发，递归地向下访问kd树。若目标点x当前维的坐标小于切分点的坐标，则移动到左子结点，否则移动到右子结点。直到子结点为叶结点为止。
2. 以此叶结点为“当前最近点”。
3. 递归地向上回退，在每个结点进行以下操作:  
(a)如果该结点保存的实例点比当前最近点距离目标点更近，则以该实例点为“当前最近点”  
(b)当前最近点一定存在于该结点一个子结点对应的区域。检查该子结点的父结点的另一子结点对应的区域是否有更近的点。具体地，检查另一子结点对应的区域是否与以目标点为球心、以目标点与“当前最近点”间的距离为半径的超球体相交。如果相交，可能在另一个子结点对应的区域内存在距目标点更近的点，移动到另一个子结点。接着，递归地进行最近邻搜索;如果不相交，向上回退。
4. 当回退到根结点时，搜索结束。最后的“当前最近点”即为x的最近邻点。

### &emsp;插入kd树

元素插入kd树和检索kd树是类似的，首先对于切割轴的方法来寻找插入点对应的各个坐标轴的值，如是两个数据点xy，就是在偶数层比较x坐标值，而在奇数层比较y坐标值。如果到达树底部，即一个空指针就是所要插入的点。

### &emsp;删除kd树

kd树的删除同样用递归程序来实现。并且删除的过程与二叉树的删除类似。假设从kd树中删除结点(a,b)。如果(a,b)的两个子树都为空，则用空树来代替(a,b)。否则，在(a,b)的子树中寻找一个合适的结点来代替它，譬如(c,d)，则递归地从K-D树中删除(a,b)。一旦(a,b)已经被删除，则用(c,d)代替(a,b)。(a,b)的替代节点(c,d)要么是(a,b)左子树中的X坐标最大值的结点，要么是(a,b)右子树中x坐标最小值的结点。

### &emsp;kd树的Python实现

```python
# 利用sklearn包
import numpy as np
from sklearn.neighbors import KDTree

np.random.seed(0)
# 当我们设置相同的seed，每次生成的随机数相同。
# 如果不设置seed，则每次会生成不同的随机数
X = np.array([[2, 3], [5, 4], [9, 6], [4, 7], [8, 1], [7, 2]])

# KDTree(数组元素,树叶子个数)，这里因为这里的单个数据是两个一组所以是2
tree = KDTree(X, leaf_size=2)
# X[:1]指它只会返回对应的第一组k个数据，k就是kd树的k个最近邻值
# 第一个参数为对应的k个最近邻与其距离
# 第二个参数是对应的k个最近邻的索引值
dist, ind = tree.query(X[:1], k=2)

print(dist)  # k个最近的距离
print(ind)  # k个最近的索引
print(X[ind])  # k个最近的点

>>>>>
[[0.         3.16227766 4.47213595]]
[[0 1 3]]
[[[2 3]
  [5 4]
  [4 7]]]
```

```python
# 纯Python
from collections import namedtuple
from math import sqrt
import numpy as np


# kd节点类，参数为传入的对应数据组值
class KDNode(object):
    # 初始化方法，参数为整体数值
    # value代表本节点的值，即这个树对应的父节点值
    # split代表树的分割信息，即以哪个轴进行分割
    # left代表树的左节点值
    # right代表树的右节点值
    def __init__(self, value, split, left, right):
        # value=[x,y]
        self.value = value
        self.split = split
        self.right = right
        self.left = left


class KDTree(object):
    # 构造kd树
    def __init__(self, data):
        # data=[[x1,y1],[x2,y2]...,]
        # 维度
        k = len(data[0])

        # 创建节点方法，参数为分割轴与数据集信息
        def CreateNode(split, data_set):
            # 如果数据集为空，就证明分割完毕，就返回None
            if not data_set:
                return None
            # key=lambda x: x[split]为对前面的对象中的第split维数据（即对本次切割的value）的值进行排序。
            # key=lambda 变量：变量[维数] 。维数可以按照自己的需要进行设置。
            data_set.sort(key=lambda x: x[split])
            # 整除2
            split_pos = len(data_set) // 2
            # 取数据集此轴的中点数据
            median = data_set[split_pos]
            # split_next为下一个节点的切割轴
            split_next = (split + 1) % k

            return KDNode(median, split, CreateNode(split_next, data_set[: split_pos]),
                          CreateNode(split_next, data_set[split_pos + 1:]))

        # 根节点为以0为切割点，以整个数据集为其他数据集
        self.root = CreateNode(0, data)

    # search方法为搜寻方法，self为kd树本身，root为寻找开始的根节点，x为寻找的数据，count为寻找的节点个数
    def search(self, root, x, count=1):
        # nearest为临近实例点集
        nearest = []
        # 有count个要求求的数据点
        for i in range(count):
            # 就输入count个[-1,None]插入到临近实例点集
            nearest.append([-1, None])
        # kd树的nearest属性就是numpy数组化的nearset列表
        self.nearest = np.array(nearest)

        # 递归方法，用来递归查询节点数据
        def recurve(node):
            # 如果这个查询的目标数据不为None
            if node is not None:
                # split本为分割函数，这里是获取切割轴
                axis = node.split
                # 取节点的切割轴坐标的数据总体数据与x的切割轴坐标的数据之差
                daxis = x[axis] - node.value[axis]
                # 如果差值小于0就代表节点更小，所以将节点的数据在总体数据kd树的左子树中迭代
                if daxis < 0:
                    recurve(node.left)
                else:
                    recurve(node.right)
                # zip()函数用于将可迭代的对象作为参数，将对象中对应的元素打包成一个个元组，然后返回由这些元组组成的列表。
                # 如果各个迭代器的元素个数不一致，则返回列表长度与最短的对象相同，利用 * 号操作符，可以将元组解压为列表。
                # dist计算的是对应的点与查询点的欧式距离
                dist = sqrt(sum((p1 - p2) ** 2 for p1, p2 in zip(x, node.value)))
                # enumerate() 函数用于将一个可遍历的数据对象(如列表、元组或字符串)组合为一个索引序列，
                # 同时列出数据和数据下标，一般用在for循环当中。
                for i, d in enumerate(self.nearest):
                    # 如果当前nearest内i处未标记（即数据为-1），或者新点与x距离更近
                    if d[0] < 0 or dist < d[0]:
                        self.nearest = np.insert(self.nearest, i, [dist, node.value], axis=0)  # 插入比i处距离更小的
                        # 剔除最后一个数据，即因为加入一个更近的，将最远的数据剔除
                        self.nearest = self.nearest[:-1]
                        break
                # count()方法用于统计字符串里某个字符出现的次数。
                # 找到nearest集合里距离最大值的位置，为-1值的个数
                n = list(self.nearest[:, 0]).count(-1)
                # abs()函数返回数字的绝对值。
                # 切分轴的距离比nearest中最大的小（存在相交）
                if self.nearest[-n - 1, 0] > abs(daxis):
                    # 相交，x[axis]< node.data[axis]时，去右边（左边已经遍历了）
                    if daxis < 0:
                        recurve(node.right)
                    # x[axis]> node.data[axis]时，去左边，（右边已经遍历了）
                    else:
                        recurve(node.left)
        # 从根节点开始遍历
        recurve(root)
        return self.nearest


# namedtuple类位于collections模块,有了namedtuple后通过属性访问数据能够让我们的代码更加的直观更好维护。
# namedtuple能够用来创建类似于元祖的数据类型，除了能够用索引来访问数据，能够迭代，还能够方便的通过属性名来访问数据。
# 在python中,传统的tuple类似于数组，只能通过下表来访问各个元素，我们还需要注释每个下表代表什么数据。
# 通过使用namedtuple，每哥元素有了自己的名字。类似于C语言中的struct,这样数据的意义就可以一目了然。
# 最近坐标点、最近距离和访问过的节点数
result = namedtuple("Result_tuple", "nearest_point nearest_dist nodes_visited")

data = [[2, 3], [5, 4], [9, 6], [4, 7], [8, 1], [7, 2]]
kd = KDTree(data)

# [3, 4.5]最近的3个点
n = kd.search(kd.root, [3, 4.5], 3)
print(n)

>>>>>
[[1.8027756377319946 list([2, 3])]
 [2.0615528128088303 list([5, 4])]
 [2.692582403567252 list([4, 7])]]
```

参照<https://github.com/wenffe/python-KD-/blob/master/%E6%9E%84%E5%BB%BAkd%E6%A0%91.py>：

```python
#!usr/bin/env python3
# -*- coding = UTF-8 -*-

"""
构建kd树，提高KNN算法的效率（数据结构要自己做出来才有趣）
    1. 使用类对象方法封装kd树
"""

import numpy as np
import time


class Node(object):
    '''结点对象'''
    def __init__(self, item=None, label=None, dim=None, parent=None, left_child=None, right_child=None):
        self.item = item   # 结点的值(样本信息)
        self.label = label  # 结点的标签
        self.dim = dim   # 结点的切分的维度(特征)
        self.parent = parent  # 父结点
        self.left_child = left_child  # 左子树
        self.right_child = right_child # 右子树


class KDTree(object):
    '''kd树'''

    def __init__(self, aList, labelList):
        self.__length = 0  # 不可修改
        self.__root = self.__create(aList,labelList)  # 根结点, 私有属性, 不可修改

    def __create(self, aList, labelList, parentNode=None):
        '''
        创建kd树
        :param aList: 需要传入一个类数组对象(行数表示样本数，列数表示特征数)
        :labellist: 样本的标签
        :parentNode: 父结点
        :return: 根结点
        '''
        dataArray = np.array(aList)
        m,n = dataArray.shape
        labelArray = np.array(labelList).reshape(m,1)
        if m == 0:  # 样本集为空
            return None
        # 求所有特征的方差，选择最大的那个特征作为切分超平面
        var_list = [np.var(dataArray[:,col]) for col in range(n)]  # 获取每一个特征的方差
        max_index = var_list.index(max(var_list))  # 获取最大方差特征的索引
        # 样本按最大方差特征进行升序排序后，取出位于中间的样本
        max_feat_ind_list = dataArray[:,max_index].argsort()
        mid_item_index = max_feat_ind_list[m // 2]
        if m == 1:  # 样本为1时，返回自身
            self.__length += 1
            return Node(dim=max_index,label=labelArray[mid_item_index], item=dataArray[mid_item_index], parent=parentNode, left_child=None, right_child=None)

        # 生成结点
        node = Node(dim=max_index, label=labelArray[mid_item_index], item=dataArray[mid_item_index], parent=parentNode, )
        # 构建有序的子树
        left_tree = dataArray[max_feat_ind_list[:m // 2]] # 左子树
        left_label = labelArray[max_feat_ind_list[:m // 2]] # 左子树标签
        left_child = self.__create(left_tree,left_label,node)
        if m == 2:  # 只有左子树，无右子树
            right_child = None
        else:
            right_tree = dataArray[max_feat_ind_list[m // 2 + 1:]] # 右子树
            right_label = labelArray[max_feat_ind_list[m // 2 + 1:]] # 右子树标签
            right_child = self.__create(right_tree,right_label,node)
            # self.__length += 1
        # 左右子树递归调用自己，返回子树根结点
        node.left_child=left_child
        node.right_child=right_child
        self.__length += 1
        return node

    @property
    def length(self):
        return self.__length

    @property
    def root(self):
        return self.__root

    def transfer_dict(self,node):
        '''
        查看kd树结构
        :node:需要传入根结点对象
        :return: 字典嵌套格式的kd树,字典的key是self.item,其余项作为key的值，类似下面格式
        {(1,2,3):{
                'label':1,
                'dim':0,
                'left_child':{(2,3,4):{
                                     'label':1,
                                     'dim':1,
                                     'left_child':None,
                                     'right_child':None
                                    },
                'right_child':{(4,5,6):{
                                        'label':1,
                                        'dim':1,
                                        'left_child':None,
                                        'right_child':None
                                        }
                }
        '''
        if node == None:
            return None
        kd_dict = {}
        kd_dict[tuple(node.item)] = {}  # 将自身值作为key
        kd_dict[tuple(node.item)]['label'] = node.label[0]
        kd_dict[tuple(node.item)]['dim'] = node.dim
        kd_dict[tuple(node.item)]['parent'] = tuple(node.parent.item) if node.parent else None
        kd_dict[tuple(node.item)]['left_child'] = self.transfer_dict(node.left_child)
        kd_dict[tuple(node.item)]['right_child'] = self.transfer_dict(node.right_child)
        return kd_dict

    def transfer_list(self,node, kdList=[]):
        '''
        将kd树转化为列表嵌套字典的嵌套字典的列表输出
        :param node: 需要传入根结点
        :return: 返回嵌套字典的列表
        '''
        if node == None:
            return None
        element_dict = {}
        element_dict['item'] = tuple(node.item)
        element_dict['label'] = node.label[0]
        element_dict['dim'] = node.dim
        element_dict['parent'] = tuple(node.parent.item) if node.parent else None
        element_dict['left_child'] = tuple(node.left_child.item) if node.left_child else None
        element_dict['right_child'] = tuple(node.right_child.item) if node.right_child else None
        kdList.append(element_dict)
        self.transfer_list(node.left_child, kdList)
        self.transfer_list(node.right_child, kdList)
        return kdList

    def _find_nearest_neighbour(self, item):
        '''
        找最近邻点
        :param item:需要预测的新样本
        :return: 距离最近的样本点
        '''
        itemArray = np.array(item)
        if self.length == 0:  # 空kd树
            return None
        # 递归找离测试点最近的那个叶结点
        node = self.__root
        if self.length == 1: # 只有一个样本
            return node
        while True:
            cur_dim = node.dim
            if item[cur_dim] == node.item[cur_dim]:
                return node
            elif item[cur_dim] < node.item[cur_dim]:  # 进入左子树
                if node.left_child == None:  # 左子树为空，返回自身
                    return node
                node = node.left_child
            else:
                if node.right_child == None:  # 右子树为空，返回自身
                    return node
                node = node.right_child

    def knn_algo(self, item, k=1):
        '''
        找到距离测试样本最近的前k个样本
        :param item: 测试样本
        :param k: knn算法参数，定义需要参考的最近点数量，一般为1-5
        :return: 返回前k个样本的最大分类标签
        '''
        if self.length <= k:
            label_dict = {}
            # 获取所有label的数量
            for element in self.transfer_list(self.root):
                if element['label'] in label_dict:
                    label_dict[element['label']] += 1
                else:
                    label_dict[element['label']] = 1
            sorted_label = sorted(label_dict.items(), key=lambda item:item[1],reverse=True)  # 给标签排序
            return sorted_label[0][0]

        item = np.array(item)
        node = self._find_nearest_neighbour(item)  # 找到最近的那个结点
        if node == None:  # 空树
            return None
        print('靠近点%s最近的叶结点为:%s'%(item, node.item))
        node_list = []
        distance = np.sqrt(sum((item-node.item)**2))  # 测试点与最近点之间的距离
        least_dis = distance
        # 返回上一个父结点，判断以测试点为圆心，distance为半径的圆是否与父结点分隔超平面相交，若相交，则说明父结点的另一个子树可能存在更近的点
        node_list.append([distance, tuple(node.item), node.label[0]])  # 需要将距离与结点一起保存起来

        # 若最近的结点不是叶结点，则说明，它还有左子树
        if node.left_child != None:
            left_child = node.left_child
            left_dis = np.sqrt(sum((item-left_child.item)**2))
            if k > len(node_list) or least_dis < least_dis:
                node_list.append([left_dis, tuple(left_child.item), left_child.label[0]])
                node_list.sort()  # 对结点列表按距离排序
                least_dis = node_list[-1][0] if k >= len(node_list) else node_list[k-1][0]
        # 回到父结点
        while True:
            if node == self.root:  # 已经回到kd树的根结点
                break
            parent = node.parent
            # 计算测试点与父结点的距离，与上面距离做比较
            par_dis = np.sqrt(sum((item-parent.item)**2))
            if k >len(node_list) or par_dis < least_dis:  # k大于结点数或者父结点距离小于结点列表中最大的距离
                node_list.append([par_dis, tuple(parent.item) , parent.label[0]])
                node_list.sort()  # 对结点列表按距离排序
                least_dis = node_list[-1][0] if k >= len(node_list) else node_list[k - 1][0]

            # 判断父结点的另一个子树与结点列表中最大的距离构成的圆是否有交集
            if k >len(node_list) or abs(item[parent.dim] - parent.item[parent.dim]) < least_dis :  # 说明父结点的另一个子树与圆有交集
                # 说明父结点的另一子树区域与圆有交集
                other_child = parent.left_child if parent.left_child != node else parent.right_child  # 找另一个子树
                # 测试点在该子结点超平面的左侧
                if other_child != None:
                    if item[parent.dim] - parent.item[parent.dim] <= 0:
                        self.left_search(item,other_child,node_list,k)
                    else:
                        self.right_search(item,other_child,node_list,k)  # 测试点在该子结点平面的右侧

            node = parent  # 否则继续返回上一层
        # 接下来取出前k个元素中最大的分类标签
        label_dict = {}
        node_list = node_list[:k]
        # 获取所有label的数量
        for element in node_list:
            if element[2] in label_dict:
                label_dict[element[2]] += 1
            else:
                label_dict[element[2]] = 1
        sorted_label = sorted(label_dict.items(), key=lambda item:item[1], reverse=True)  # 给标签排序
        return sorted_label[0][0],node_list

    def left_search(self, item, node, nodeList, k):
        '''
        按左中右顺序遍历子树结点，返回结点列表
        :param node: 子树结点
        :param item: 传入的测试样本
        :param nodeList: 结点列表
        :param k: 搜索比较的结点数量
        :return: 结点列表
        '''
        nodeList.sort()  # 对结点列表按距离排序
        least_dis = nodeList[-1][0] if k >= len(nodeList) else nodeList[k - 1][0]
        if node.left_child == None and node.right_child == None:  # 叶结点
            dis = np.sqrt(sum((item - node.item) ** 2))
            if k > len(nodeList) or dis < least_dis:
                nodeList.append([dis, tuple(node.item), node.label[0]])
            return
        self.left_search(item, node.left_child, nodeList, k)
        # 每次进行比较前都更新nodelist数据
        nodeList.sort()  # 对结点列表按距离排序
        least_dis = nodeList[-1][0] if k >= len(nodeList) else nodeList[k - 1][0]
        # 比较根结点
        dis = np.sqrt(sum((item-node.item)**2))
        if k > len(nodeList) or dis < least_dis:
            nodeList.append([dis, tuple(node.item), node.label[0]])
        # 右子树
        if k > len(nodeList) or abs(item[node.dim] - node.item[node.dim]) < least_dis: # 需要搜索右子树
            if node.right_child != None:
                self.left_search(item, node.right_child, nodeList, k)

        return nodeList

    def right_search(self,item, node, nodeList, k):
        '''
        按右根左顺序遍历子树结点
        :param item: 测试的样本点
        :param node: 子树结点
        :param nodeList: 结点列表
        :param k: 搜索比较的结点数量
        :return: 结点列表
        '''
        nodeList.sort()  # 对结点列表按距离排序
        least_dis = nodeList[-1][0] if k >= len(nodeList) else nodeList[k - 1][0]
        if node.left_child == None and node.right_child == None:  # 叶结点
            dis = np.sqrt(sum((item - node.item) ** 2))
            if k > len(nodeList) or dis < least_dis:
                nodeList.append([dis, tuple(node.item), node.label[0]])
            return
        if node.right_child != None:
            self.right_search(item, node.right_child, nodeList, k)

        nodeList.sort()  # 对结点列表按距离排序
        least_dis = nodeList[-1][0] if k >= len(nodeList) else nodeList[k - 1][0]
        # 比较根结点
        dis = np.sqrt(sum((item - node.item) ** 2))
        if k > len(nodeList) or dis < least_dis:
            nodeList.append([dis, tuple(node.item), node.label[0]])
        # 左子树
        if k > len(nodeList) or abs(item[node.dim] - node.item[node.dim]) < least_dis: # 需要搜索左子树
            self.right_search(item, node.left_child, nodeList, k)

        return nodeList


if __name__ == '__main__':
    t1 = time.time()
    # dataArray = np.array( [[19,2 ],[ 7,0],[13,5],[3,15],[3,4],[ 3, 2], [ 8,9],[ 9,3],[17,15 ], [11,11]])
    dataArray = np.random.randint(0,20,size=(10000,2))
    # print('dataArray',dataArray)
    # label = np.array([[ 0],[ 1],[0],[ 1],[ 1],[ 1],[ 0],[ 1],[ 1], [1]])
    label = np.random.randint(0,3,size=(10000,1))
    # print('data',np.hstack((dataArray,label)))
    kd_tree = KDTree(dataArray,label)
    # kd_dict = kd_tree.transfer_dict(kd_tree.root)
    # print('kd_dict:',kd_dict)
    # kd_list = kd_tree.transfer_list(kd_tree.root)
    # print('kd_list',kd_list)
    # for i in kd_list:
    #     print(i)
    # node = kd_tree.find_nearest_neighbour([12,7])
    # print('%s最近的叶结点:%s'%([12,7],node.item))
    t2 = time.time()
    label, node_list = kd_tree.knn_algo([12,7],k=5)
    print('点%s的最接近的前k个点为:%s'%([12,7], node_list))
    print('点%s的标签:%s'%([12,7],label))
    t3 = time.time()
    print('创建树耗时：',t2-t1)
    print('搜索前k个最近邻点耗时：',t3-t2)
```

### &emsp;kd树优化：BBF

已知kd树的检索方法就是首先找到目标点的最近叶子节点，然后不断向上回溯找到当前的最近临近点，当检索到根节点时，当前最近近邻点就是最近邻点。

如果实例点是随机分布的，那么kd树搜索的平均计算复杂度是O(NlogN)，这里的N是训练实例树。kd树更适用于训练实例数远大于空间维数时的k近邻搜索，当空间维数接近训练实例数时，它的效率会迅速下降，接近线性扫描的速度，即单纯地扫描所有的点。

kd树搜索过程中的“回溯”是由“查询路径”决定的，并没有考虑查询路径上一些数据点本身的一些性质。一个简单的改进思路就是将“查询路径”上的结点进行排序，如按各自分割超平面（也称bin）与查询点的距离排序，也就是说，回溯检查总是从优先级最高（Best Bin）的树结点开始。

+ 设置一个优先队列，在寻找子节点的时候填充进入数据，在查询目标节点的时候利用优先队列的节点进行最近计算；
+ 在某一层，分割面是第ki维，分割值是kv，那么 abs(q[ki]-kv) 就是没有选择的那个分支的优先级，也就是计算的是那一维上的距离；
+ 同时，从优先队列里面取节点只在某次搜索到叶节点后才发生，计算过距离的节点不会出现在队列的，比如1~10这10个节点，你第一次搜索到叶节点的路径是1-5-7，那么1，5，7是不会出现在优先队列的。换句话说，优先队列里面存的都是查询路径上节点对应的相反子节点，比如：搜索左子树，就把对应这一层的右节点存进队列。

&emsp;

如对应kd树如下，求(2,4.5)最近邻：

![kd树2][kdtree2]

1. 将(7,2)根节点加入优先队列中；
2. 提取优先队列中的(7,2)，由于(2,4.5)位于(7,2)分割超平面的左侧，所以检索其左子结点(5,4)。同时，根据BBF机制”搜索左/右子树，就把对应这一层的兄弟结点即右/左结点存进队列”，将其(5,4)对应的兄弟结点即右子结点(9,6)压人优先队列中，此时优先队列为{(9,6)}，最佳点为(7,2)；然后一直检索到叶子结点(4,7)，此时优先队列为{(2,3)，(9,6)}，“最佳点”则为(5,4)；
3. 提取优先级最高的结点(2,3)，重复步骤2，直到优先队列为空。

&emsp;

## ball-tree

ball树其构造过程是以质心C和半径r分割样本空间，每一个节点是一个超球体。

实际的ball tree的结点保存圆心和半径。叶子结点保存它包含的观测点。

![ball树][balltree]

### &emsp;kd树与ball树

虽然kd树的方法对于低维度（d<20）近邻搜索非常快, 当d增长到很大时, 效率变低。为了解决kd树在高维上效率低下的问题, ball树数据结构就被研发出来了。其中kd树沿卡迪尔轴（即坐标轴）分割数据，切割面为超平面, 而ball树在沿着一系列的超球面（hyper-spheres）来分割数据。ball树在构建时十分麻烦，但是在高维检索时效率远高于kd树。

同时偏斜的数据集会造成我们想要保持树的平衡与保持区域的正方形特性的冲突。另外，矩形甚至是正方形并不是用在这里最完美的形状，由于它的角是凸出来的，所以很可能会因为矩形的角伸展到另一个子树区域而要遍历其他相关度不高的子树数据。

### &emsp;构造ball树

选择一个距离当前圆心最远的观测点$i_1$，和距离$i_1$最远的观测点$i_2$，将圆中所有离这两个点最近的观测点都赋给这两个簇的中心，然后计算每一个簇的中心点和包含所有其所属观测点的最小半径。对包含n个观测点的超圆进行分割，只需要线性的时间。
与kd树一样，如果结点包含的观测点到达了预先设定的最小值，这个顶点就可以不再分割了。

### &emsp;检索ball树

使用ball tree时，先自上而下找到包含target的叶子结点，从此结点中找到离它最近的观测点。这个距离就是最近邻的距离的上界。检查它的兄弟结点中是否包含比这个上界更小的观测点。方法是：如果目标点距离兄弟结点的圆心的距离大于这个圆的圆心加上前面的上界的值，则这个兄弟结点不可能包含所要的观测点。否则，检查这个兄弟结点是否包含符合条件的观测点。

[knn2d]:data:image/png;base64,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

[circle]:data:image/png;base64,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

[madistance]:data:image/png;base64,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

[kdtree]:data:image/png;base64,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

[kdtree2]:data:image/png;base64,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

[balltree]:data:image/png;base64,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