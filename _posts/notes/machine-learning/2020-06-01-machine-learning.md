---
layout: post
title:  "k近邻算法"
date:   2020-06-01 23:41:06 +0800
categories: notes machine-learning
tags: machine-learning
excerpt: "K-Nearest Neighbors"
---

k近邻算法本身十分简单，作为机器学习算法入门的第一节算法，它是再适合不过了。它甚至见到到周志华的西瓜书都没有记录这个算法，而李航的《统计学习方法》中则保留了。

## 定义

k近邻法最简单直接地介绍，就是我们有一个数据集，数据集中有对应的特征向量的实例，每个实例都有标注对应的类别。那么现在我们有一个新的实例，它有对应的特征向量，但是我们没有标注它的类别，怎么办？使用k近邻法，就是找到与它特征值最近（或者说最相似的）k个实例点，从这k个实例点中选择最接近（一般是频率出现最高的）的类别，这个类别就是这个新实例的类别。

具体的数学定义如下：

已知有T={(x1,y1),(x2,y2)...(xN,yN)}, xi∈Rn,yi∈{c1,c2...cK}, i=1,2...N.即输入N个实例向量组，其中y属于k个类别。

输入实例特征向量x，输出对应的实例类y。

![k近邻公式][knnformula]

其中I()为指示函数，只有括号内的条件为真时才为1，其他情况为0。

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

已知特征变量为：![x值][x]，xi,xj的Lp距离定义为：![Lp距离][lp]。其中p大于等于1且为整数。

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

一组向量![ma1][ma1]，其中![ma2][ma2]。

均值为![ma3][ma3]，协方差矩阵为![ma4][ma4]。

单向量的马氏距离：![ma5][ma5]，向量间的马氏距离：![ma6][ma6]

单位矩阵的马氏距离：![ma7][ma7]，对角矩阵的马氏距离：![ma8][ma8]。

计算马氏距离的案例：

![maexample]

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

多数表决规则下，如果分类损失函数为0-1损失函数（即损失以分类的是否值作为结果），那么误分类率为：![误分类率][misclassification-rate]。

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

## kd树

为什么要使用kd树？因为k近邻算法要计算所有的数据再与输入的数据进行对比，无论是计算还是最后检索都十分麻烦，而kd树就是利用二叉树来保存处理k近邻算法的数据。

### &emsp;构造kd树

开始:构造根结点，根结点对应于包含T的k维空间的超矩形区域。选择x(1)为坐标轴，以T中所有实例的x(1)坐标的中位数为切分点，将根结点对应的超矩形区域切分为两个子区域。切分由通过切分点并与坐标轴a(1)垂直的超平面实现。由根结点生成深度为1的左、右子结点:左子结点对应坐标x(1)小于切分点的子区域，右子结点对应于坐标x(1)大于切分点的子区域。将落在切分超平面上的实例点保存在根结点。

(2)重复:对深度为j的结点，选择x(l)为切分的坐标轴，l= j(mod k)+1，以该结点的区域中所有实例的x(l)坐标的中位数为切分点，将该结点对应的超矩形区域切分为两个子区域。切分由通过切分点并与坐标轴x(l)垂直的超平面实现。由该结点生成深度为j+1的左、右子结点：左子结点对应坐标x(l)小于切分点的子区域，右子结点对应坐标x(l)大于切分点的子区域。将落在切分超平面上的实例点保存在该结点。

(3)直到两个子区域没有实例存在时停止。从而形成kd树的区域划分。

给定一个二维数据集：T={(15,4)T,(7,11)T,(23,10)T,(4,14)T,(9,8)T,(1,6)T,(3,2)T}，构造一个平衡kd树。

首先按照第一维升序排序得到：{(1,6)T,(3,2)T,(4,14)T,(7,11)T,(9,8)T,(15,4)T,(23,10)T}。

按照第二维升序排序得到：{(3,2)T,(15,4)T,(1,6)T,(9,8)T,(23,10)T},(7,11)T,(4,14)T。

因为一共有7个数据，所以应该折半第一维选第四个为根节点保存的数据，即(7,11)T。然后将两部分数据分开，两部分各按第二维进行切分。第二层的根节点为(1,6)T和(9,8)T。最后一层按照第一维进行切分。最后得到kd树：

![kd树][kdtree]

<span style="color:orange">注意：</span>如果元素有偶数个节点，那么你可以取较大的作为父节点也可以取较小的作为父节点，构造出来的树没有特别大的不同，但是要保持一样的取值规则。

### &emsp;检索kd树

搜索的目标是找到当前最近临近点。

1. 在kd树中找出包含目标点x的叶结点:从根结点出发，递归地向下访问kd树。若目标点x当前维的坐标小于切分点的坐标，则移动到左子结点，否则移动到右子结点。直到子结点为叶结点为止。
2. 以此叶结点为“当前最近点”。
3. 递归地向上回退，在每个结点进行以下操作:  
(a)如果该结点保存的实例点比当前最近点距离目标点更近，则以该实例点为“当前最近点”  
(b)当前最近点一定存在于该结点一个子结点对应的区域。检查该子结点的父结点的另一子结点对应的区域是否有更近的点。具体地，检查另一子结点对应的区域是否与以目标点为球心、以目标点与“当前最近点”间的距离为半径的超球体相交。如果相交，可能在另一个子结点对应的区域内存在距目标点更近的点，移动到另一个子结点。接着，递归地进行最近邻搜索;如果不相交，向上回退。
4. 当回退到根结点时，搜索结束。最后的“当前最近点”即为x的最近邻点。

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

[knnformula]:data:image/png;base64,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

[knn2d]:data:image/png;base64,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

[x]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKcAAAAgAQMAAABNbfrPAAAAAXNSR0IArs4c6QAAAAZQTFRF////AAAAVcLTfgAAAQ5JREFUKM+9kDFOxDAURMdWxBpE4SCKdBhoKPcIgWKpucEibrA1xfcKCiQKuAFHCQjBOZA4wMIFYL6dv0KiBkuWJi8/M/MD/O05SEB4p/ALTFZGZxFodyiaGzR3Rk9IY6GbgBhdBiC1FCGKG1n8QadLo6nSfaUhG+0rPS5U8kiHSu8rfVrTU232qR0+8MrWU0q57SMOo+fos6MfJoP7ynmVEi5DA+x5jzngRC8FOvXa4FUKpX0prbaVoswmTVfqx1mh7y8Hn/XNAy2O1GKrKXRXx6459zgDti/ORDdFxwe8tIK3qznpeac7Vf+BmQkaqZnDOlX4nVEZaaISo856R1f/Z9nFW8Oyd9mptv7f8w3TQTTJmYvsxgAAAABJRU5ErkJggg==

[lp]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO0AAAA+BAMAAAA1yYE9AAAAAXNSR0IArs4c6QAAACRQTFRF////AAAAoqKi0dHREBAQ4eHh9PT0w8PDT09PiIiIZmZmOzs7vwG6fAAAAkpJREFUWMPtmE1Ow0AMhcdUBbp7roQEux4BJC7QNRuOwLISe1RxCq4AGxbsOR/N/GQ8iZNMQkqEmtk0nSbzxfazx1Nj5jGPUQemwRJOy96ZO3PbBg9MCOLf5uE0DiNzWlzQRLKcrNAOkj8fBsaJc1bOji7/XK45EvcQb1JVQEflUrE4lB/tLMaR/5b9uBJcMhrXzcKMIqb7tf24eI/cwpP1WIdZ4Qq1rlOWdLDYbuzFZT8uVep6zCjkbF0UDc7mul0IlfqKjpyg6lt4g88lFyoXRgSeUm55O+f0nvaLN/ilJxdJXR/ADREWemZVz+z1XD4qhE3S34h0KoGoOd0b7K1hN4vU1jgr9IO6bAoKcTQ66o19RefSKaXB5B+pujmZFes0cBOfshYATnLYChZdwYlc2V6lXC1/FO7iIXKTDc+7RV2I1SxxbwjTLjh/vfyO96Ar65u4lOHnNL5mdzvIz41cRIFQKVLF3g+hZ2gmQ0RN5canUKDce7J9kE1THp29ha9EmsHprFaHXcdjtwku7qWQ3k70rNYNs48AuPJQ87KIABrP3Hab4KR+iJpa4wZVlSFqPwy1cG2Kx9tIrpuuWrzd7tFerp76cZvaf9TLGbR90Hy6y7sOe0nF19t/ZRFlm4FZeVV9hR+Rw9VeTvY/SRjUFV/dx/46LMZZ9vY5DWs/LENjd9PRPw/mkrrsc+gn1+1coIvbdArXS+Am87zAR/xPI/Oc8s8HZ5t6BO/y33Mxkb2TcQ/tIk7HXts0g6aR8xT2orqHzWMeYvwAPuEjCAiM2ZwAAAAASUVORK5CYII=

[circle]:data:image/png;base64,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

[madistance]:data:image/png;base64,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

[ma1]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIsAAAAjAQMAAACemGs/AAAAAXNSR0IArs4c6QAAAAZQTFRF////AAAAVcLTfgAAAQZJREFUKM+1kjFOAzEQRf94V5uNtNjZzsUqiziBSwqKcJOVcoGUlBsJQYOUlCk5AkdwSckRcgTKSCDMH0dBgpq4+fbTaP732MCZV58+XUqblL4gKR2O0AISgUL33T8byvj7rD69g3scQQEOdxiAqqpQFKpEISBwW9SQe1bXRH5xRFvIK9FWg44ZyTPwRhsKLpAR9sCKRwomGTXqQVXRa3pg9qeqZJUEiTv20srpqFWV+DY+WYjnXOqY25su3NoWprtil31GjZ09TKRprFn6YZXRvG+dW9t5Xy79+8ci56IpxGgcDfyDDL2NosuQ0xGV9QkNeYREU5xQzIO85mNSbvRGL+f+NvgGH/ovVmLwgdMAAAAASUVORK5CYII=

[ma2]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJsAAAAjAQMAAAC5NurXAAAAAXNSR0IArs4c6QAAAAZQTFRF////AAAAVcLTfgAAAPBJREFUKM+9kbFtwzAQRf9JgAIEQqR06kLBHkAjCK5ceAjWgYuMwMQ23HAAt9ohA9BFjJQeQSN4A+cfk9iGoVos7oMPx3+fJDDWejkP0dRhvNXcbYotp9tbWDFRSg23MAdkPQS/ByCOCj2EVh4qCt/SM/YnpD3kBJX8N4E4Gy1sdMq0E0jQAkzGShHWnXaaSFgp2unpGazDPsD2elwjPalR52Rm0JWQVmH2QPhVrR6belM9+9dGYVFwwqFceVMfytovJ8v87xIBzsG0mkk+r/Cdcx1Kwuk/tPiA8giry7sys4kwmV9eXEK8PHMmixF//AeWnDVA8n6X/AAAAABJRU5ErkJggg==

[ma3]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAAAjAQMAAADPDFhcAAAAAXNSR0IArs4c6QAAAAZQTFRF////AAAAVcLTfgAAAONJREFUKM+90r0KwjAQB/C/tsQOAYtTBsGiL1CdXJRWJ9+iPoC7OJUq6qxrH6ZScNRVcPEddBTxrq1C8WNslsv9LgncEaDQ1bh/5QqKXl4uU1mMcirTUPJzKn5packaA3YETSb5H608PpV3Gl8Y+xAqybVU9bzC/3FWKHp3Lh3Edch2xBWBpE4aIW5CdqyXzlh7rn8cKHlrqf2MtRqSrg7u7hrUG92hOoZnUoM7XsBxUdZNGpOBCanJuoYTQDcsWJSPSG2exwmugGF6pDZGMtMpHIEaUt2o9/QuQJ9a4PFvi/4JT7+eM6B9KS9lAAAAAElFTkSuQmCC

[ma4]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAAAiCAMAAAC6CMGSAAAAAXNSR0IArs4c6QAAADZQTFRF////CAgI9/f3y8vL39/fICAgtbW1AAAAv7+/QEBAMzMzbGxs6enpSEhInJycf39/UFBQWFhYQO4jUQAAAURJREFUWMPtl+uSgyAMhSmiR/HWvv/L7nS7K4QQBXHb2Rnyo2pqk88kB6lS1apVu84smH0OxrRYe8/uV8Dg7K2mvXX+9R3vZDmgafBWln0aXQqT22fsd+qjMPk0m+h+TtxhKzviXBE3VAYNF/13ToQnr7geJYRYR6XMqs3r11tiR0MeW2gXd3NPDk2QT4JJ1VqE2rS2BOb5CRo6lSYCM1mTOjNpMAVt0nMfewYIdGxmwoOCLys/JqschxmXTGWDyIpQ/Kak8ou4hb4tY6ye4voFR8BmxAHC6yGIDHfb2cxaJXcpb0WFKCIBZhomdRlMEB2SsoQlQM+Nf9lrNmsF72HksaiRLHfmVlYYmgAH94TfLytFs26A//AdHvc3DzrKeJzdJpVvwabWDs6eUl0LRyaJJBpbD+zfQXduk3RB8zpVrdo/tS92awudLOWKRAAAAABJRU5ErkJggg==

[ma5]:data:image/png;base64,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

[ma6]:data:image/png;base64,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

[ma7]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANYAAAAnCAMAAABE80agAAAAAXNSR0IArs4c6QAAADlQTFRF////np6eKysrGhoa9fX1e3t7REREAAAA4+Pjs7Ozv7+/zMzMjY2NY2Nj19fXcHBwVlZWODg4DAwM7JZPHAAAAkNJREFUaN7tmA9zsyAMximKD/inVr//h31vVLcEEZN27bvb5HbXtfrE/CCJAWPOcY5znOMHDPyn8WqsX7paJ9UfwHpPirwfa/370VhBLrlkpyTo9a/Hcgqs7lZvqOpBbqAb6jdhjaoZDFOdYg0aA11Tv4Uq3HQq5xKs0Kj0o3si/yFV+DnosDxaZt9Xuny5Rr20rkJf5eItrtIGRdMw6/2sNDA1eU9yYHigesc7qkEbuxd4OrdqAz183tUMg+injLUAdcnt0NMSAqfUt0xPefBtWKMICzRKPGgUOYmBgr6MRT4BWRTG67c1gVGaCeZWDUsu3RCUes/01FHsrAyrKMt/u7uc+H1aAr3c4zG3DGZaQNA9pZdgsQk7isJ7xfjMX7FXREO/yPXpnRIs8zDWdsu849YMUtInXNMnbwykWLOMiq3RMdYanfcY8sdvBO5WjYrlVqvW232sz8w5CsLt3K2i2M99eQVhDHlMtCFcSoZG3xTqIEwKd3dZEITxCnh9hpG61WJgL+eLWj/m3sWEBIwUZvvb/oOwdGhuq8zd/bHaWEACaxFHpT7ca2eSiHRdeFKS2DqoGF9YxtqNMteJxo+lBa94i2iVemeLdQxk4ZVdBsHq10omPhqwLm0RlfpejJWBwEE3s15vnM6rYJOOvelV+s7WZSx2SqLbmBAsX3XH7RzdV6SrWzaw0TdX1dmPbhtJntZar3Arc/BRNCDQszSM6/XESR+ZbsW2v8+tjMLAeDWvHI9OyLPnK68/dzrHOf78+AfzbRYUbTcS7QAAAABJRU5ErkJggg==

[ma8]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMQAAABECAMAAADpyGqBAAAAAXNSR0IArs4c6QAAADZQTFRF////7OzsxMTEfHx8VlZW0dHREhISAAAAQUFB39/fIiIiMzMzj4+P9/f3oKCgs7OzbGxsCAgISIXAXQAAAspJREFUaN7tmumWgyAMhUHQi1uX93/Z6UynGnAhYAucGfOrtRr9yEISK8Qpp5ySSJBEPg3xJyxxQvwDiM8Hw+chkMrQ/psMEVqHtN7qu8moLxFaay1LgohiEKIyYzkQFx2pV6mEuQ8klYhFMpFNFalX3qt0+RvConDXs4tWrM2P8tTutHLLRkcrHu4yRdXkh7hCRSuuMIhUgj1DKLBz03PJycK3MJkgHAqN67z1IhSiywCxIgbV1HKEWkLgXgZEh5Y+YhDD44ssoobtJ4itbnAXYiwCwrwgRLglJJoyugmNiudOK4Zo0SeE0GYhboqdtnIwIPDaJ3RCiLpB15JNSs8LWn9vdmBkWOAZKITy+puej/kGuJc4FA8nmtOToesL7I19nt3odI5qfFMiln+Dy+3aArQA4mjEyude+W67hoGY9vl5ik0hyXX9wFCIlS91N3pdBhux5Tu0oc6mID1E29ReCKxAjKZi+D3eCrGIixmob72GWHqTpzPfhqBzEnD9aU5EDfrVMkHeQhbl9xxVs26KjeVYKQbEzlx3PrJJ8cEdFps2BfhLR39PR8GBEHEQDwqTl8Fa/0gIaeRGrfretxMWxOTxPnfajgl6YDR12pDAYt/D/FOkJW7XpAz0uWFxOcUaBB9iUAeeK2Ay4zgFrN6eIIGd10GK12Nri+hrQZwnbMcGbIjWyDelnEMQYj9sXQTbZk5Qq6QQcAZHfL02hLaCum2SQWAxtAtpiiyIwZ443vpkDD/NYPTElkLYQd3ewrvjTK9gMaeUtunJkOA7/akop8gJMXaLMuHCdIW5t0ZmCL2sdSo+ArK+zMchHwAgCvg3wiEIuJtlYRBgO2NxEAjpo0uFCLVECHEiCCDOnbJHhmWJV7JHCASQ/79SdIYdagm6v2VFcSCCLFFC4eT2lDj0SKVAIKpdLgsiS2NaFsRfsIQQJ8Qpp/xf+QLSDhudvQ0R/gAAAABJRU5ErkJggg==

[maexample]:data:image/png;base64,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

[misclassification-rate]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASsAAAA6BAMAAAAad2INAAAAAXNSR0IArs4c6QAAADBQTFRF////AAAA3d3dwcHBUVFRKysr9/f37u7uExMTbm5uCAgIkpKShoaGqKioPDw8z8/PMh5i9QAAAuxJREFUaN7tmD1uFTEQxz0vUVBEkGYkQJEQ0ispHxJVCkREmQaqtMkFEM07QNIg0fByAxAXCCUd3ICChpKGQ1CRXdvr8azt9a73SSiyi91id3/+ezwfnlWqjjrq+E8G4PxMKldF88siuq3WqrKqrCqrysqT9ZrMWM4n62Iak8v6+7m9PWOIuC0xT9bRh3wmsOLDqs/Oof72eGkesRcTDOkKxKvPvQdvGbOZLcGMCP5y2t6eLu3EKcfDvMr6/Q9nYpIZUbx/v72dW4SIB4xuVSJwPCakYyz27HjTbubZjLL2fjPmRFnrR54K0DfyTEzUt3hqrvVjb5d8pnCCCGZxseII0jOSDgAdHV0cNFLa0B+QtXi/4vZmTPY1pjPe0aWUpbrYQb5eX0oyKTMmSqaIg5gsG89MFphvQOYWIcuuPcVEwZRbRzZrSZaJ5wACBCJirRDzBUsAfVmQUbZ2L3uyQDHfwqCF0pV1911PFijnWzmy3qzCsqwgpyzbtxxTyBLhmZJ1wk0L3ZTM74E/zJJ1wp2IMxWvJpgolwcb5yLma/A8wNUZUuHKGme2b3Gm7OCiq3t+1su60Dcu4JhT1U+Vw/RcVDxbnPbfxUANTRlcLjmTyf0ChKz1Ur6LoMKyoucTuZ+ZTOArFbJettc7H938ehJMIAastWeYDweY3kp9WfvX2kdfDZzOYUR3YJh3h5gYf/ZLZOXYxGNkfdU2u9qkmShksTqx88m0A99KuiVAfljtmNdjuiXvuP7Edik/CnspDDBX43onhijsw5y1VCmTYAv/F8s74jn+3G3hByP57tucZrsMjFOtRaqUSSIEkH0Nk30LS5nEor3pooHXJpwaiaTKmDd+0JZFMEcxAFtFAabKulGiN20GJtp/Doiu5hW67gxMtCeLmWWVMcGcNlCfYIs2McSEaZuIzf4TAXWysFgWZ2pZU5io2NGwJEGEmF0rN5bpd8sl6TTEpKkp2qUvmK1MOiZu4cdxHXXckvEPW41D9LzY4xcAAAAASUVORK5CYII=

[kdtree]:data:image/png;base64,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
