---
layout: post
title:  "基本使用"
date:   2020-06-12 11:22:45 +0800
categories: notes mathjax base
tags: maven 基础 安装 配置
excerpt: "基本使用与标识"
---

## 显示位置与大小

+ 正文（inline）中的LaTeX公式用`$...$`定义
+ 单独显示（display）的LaTeX公式用`$$...$$`定义，此时公式居中并放大显示

## 希腊字母

显示|命令|显示|命令
:--:|:--:|:-:|:-:
α|\alpha|β|\beta
γ|\gamma|δ|\delta
ε|\epsilon|ζ|\zeta
η|\eta|θ|\theta
ι|\iota|κ|\kappa
λ|\lambda|μ|\mu
ν|\nu|ξ|\xi
π|\pi|ρ|\rho
σ|\sigma|τ|\tau
υ|\upsilon|φ|\phi
χ|\chi|ψ|\psi
ω|\omega

+ 若需要大写希腊字母，将命令首字母大写即可。\Gamma呈现为$\Gamma$
+ 若需要斜体希腊字母，将命令前加上var前缀即可。\varGamma呈现为$\varGamma$

&emsp;

## 一般运算符

显示|命令|显示|命令
:-:|:--:|:-:|:--:
<|\lt|>|\gt
≤|\le|≥|\ge
≠|\neq|×|\times
÷|\div|±|\pm
∓|\mp|≈|\approx
∼|\sim|≅|\cong
≡|\equiv|≺|\prec
$\ldots$|\ldots|$\cdots$|\cdots

<span style="color:yellow">提示：</span>如果是否的话在命令前加上not大概就可以了，如果是\gt就使用\ngtr或者\not\gt，结果都是$\ngtr$。

&emsp;

## 特殊符号

显示|命令|显示|命令
:-:|:--:|:-:|:--:
∞|\infty|∪|\cup
∩|\cap|⊂|\subset
⊆|\subseteq|⊃|\supset
⊊ |\subsetneq|∖|\setminus
∈|\in|∉|\notin
∅|\varnothing|∀|\forall
∃|\exists|¬|\lnot
∧|\land|∨|\lor
∇|\nabla|∂|\partial
↑|\uparrow|↓|\downarrow
⇑|\Uparrow|⇓|\Downarrow
→|\to|→|\rightarrow
←|\leftarrow|⇒|\Rightarrow
⇐|\Leftarrow|↦|\mapsto
⟶|\longrightarrow|⟵|\longleftarrow
⊤|\top|⊥|\bot
⊢|\vdash|⊨|\vDash
⋆|\star|∗|\ast
⊕|\oplus|∘|\circ
∙|\bullet|mod|\pmode
⨄|\biguplus|⨆|\bigsqcup
∵|\because|∴|\therefore
$\bigotimes$|\bigotimes|$\bigodot$|\bigodot

&emsp;

## 修饰符

### &emsp;上下标

+ 上标：^
+ 下标：_
+ C_n^2呈现为$C_n^2$
+ C^{N^n}呈现为$C^{N^n}$

### &emsp;向量与矢量

+ \vec 单字符向量：如\vec a就是$\vec a$
+ \overrightarrow{字母群} 多字符向量：\overrightarrow{xyz}就是$\overrightarrow{xyz}$
+ \overline 字符群 矢量字符群：\overline{xyz}为$\overline{xyz}$

### &emsp;上角标

+ 对于单字符，\hat: \hat x为$\hat x$
+ 对于多字符，\widehat: \widehat{xyz}为$\widehat{xyz}$
+ 下弯角标，\check：\check{xy}为$\check{xy}$
+ 下弯圆标，\breve：\breve{xy}为$\breve{xy}$

### &emsp;上圆标

+ 单圆标 \dot：\dot x为$\dot x$
+ 双圆标 \ddot：\ddot x为$\ddot x$

### &emsp;连线符

+ 上连线 \overline：\overline{a+b+c+d}显示$\overline{a+b+c+d}$
+ 下连线 \underlint：\underline{a+b+c+d}显示$\underline{a+b+c+d}$
+ 上大括号 \overbrace
+ 下大括号 \underbrace：如\overbrace{a+\underbrace{b+c}_{1.0}+d}^{2.0}就是$\overbrace{a+\underbrace{b+c}_{1.0}+d}^{2.0}$

&emsp;

## 字体

+ Typewriter \mathtt{字符群}：$\mathtt{ABCDE}$
+ Blackboard Bold \mathbb{字符群}：$\mathbb{ABCDE}$
+ Sans Serif \mathsf{字符群}：$\mathsf{ABCDE}$
+ 黑体 \mathbf{字符群}：$\mathbf{ABCDE}$
+ 罗马字体 \mathrm{字符群}：$\mathrm{ABCDE}$
+ 手写体 \mathscr{字符群}：$\mathscr{ABCDE}$

基本的简写表如下：

命令|字体|命令|字体
:-:|:--:|:-:|:--:
\rm|罗马体|\it|意大利体
\bf|黑体|\cal|花体
\sl|倾斜体|\sf|等线体
\mit|数学斜体|\tt|打字机字体
\sc|小体大写字母

&emsp;

## 分组

使用{}将具有相同等级的内容扩入其中，成组处理，这是非常必要的，因为不同的组结果就不同。

如10^10为$10^10$，而10^{10}为$10^{10}$。

&emsp;

## 分式与根式

+ 分式 \frac{公式1}{公式2}：\frac{4}{7}呈现为$\frac{4}{7}$
+ 分式 {公式1 \over 公式2}： {a+1 \over b+1}呈现为${a+1 \over b+1}$
+ 根式：\sqrt[根数]{底数}：\sqrt[5]{\frac{4}{7}}呈现为$\sqrt[5]{\frac{4}{7}}$

<span style="color:yellow">提示：</span>书写连分数表达式时，请使用\cfrac代替\frac或者\over，这样会看起来更大更清晰。

&emsp;

## 括号与竖线

+ 小括号：()呈现为$()$
+ 中括号：[]呈现为$[]$，也可以使用\lbrack和\rbrack。
+ 大括号：使用\{\}，也可以使用\brace{}{}和\lbrace以及\rbrace
+ 尖括号：\langle,\rangle呈现为$\langle\rangle$，此处为与分组符号{}相区别，使用转义字符\
+ 上取整：使用\lceil和\rceil表示。如\lceil x \rceil：${\lceil x \rceil}$
+ 下取整：使用\lfloor和\rfloor表示。如\lfloor x \rfloor：$\lfloor x \rfloor$
+ 不可见括号：使用.
+ 对于绝对值一般都是使用\|来进行分割：$\|x\|$，但是有排版空间大小的问题，应该使用\mid代替
+ 使用\left或\right使符号大小与邻近的公式相适应；该语句适用于所有括号类型，括号竖线都可以，\left(\frac{x}{y}\right)呈现为$\left(\frac{x}{y}\right)$

&emsp;

## 求和积分与极限

+ 求和 \sum：\sum_{i=1}^n{a_i}呈现为$\sum_{i=1}^n{x_i}$
+ 极限 \lim_{底\to 目标}：$\lim_{x\to 0}$呈现为$\lim_{x\to 0}$
+ 积分 \int：\int_0^\infty{fxdx}呈现$\int_0^\infty{fxdx}$
+ 还有\prod：∏，\bigcup: ⋃，\bigcap：⋂，\iint：∬，\iiint：∭，\iiiint：⨌，\oint：∮，\rm {d}：d，′：\prime，微分符号∂	就用\partial

<span style="color:yellow">提示：</span>

+ 尽可能少的在指数和积分中使用\frac，因为看起来会不清晰。
+ 同时多重积分不要使用多个\int，而应该使用\iint和\iiint。

&emsp;

## 其他函数

以\函数名的格式进行处理，如：

+ \sin x：$\sin x$
+ \cos x：$\cos x$
+ \ln x：$\ln x$
+ \log x：$\log_2 x$
+ \max(x)：$\max(x)$

&emsp;

## 空格

默认mathjax是不会识别空格的，所以你会发现你打出来的`$a b$`最后会变成$a b$

+ 小空格\ ：a\ b为$a\ b$
+ 4格空格\quad：a\quad b为$a\quad b$

&emsp;

## 矩阵

### &emsp;构造矩阵

+ 起始标记`\begin{matrix}`，结束标志为`\end{matrix}`
+ 每一行末尾标记\\\\，行间元素之间以&分隔

如：

```mathjax
$$\begin{matrix}
1&0&0\\
0&1&0\\
0&0&1\\
\end{matrix}$$
```

就变成：

$$\begin{matrix}
1&0&0\\
0&1&0\\
0&0&1\\
\end{matrix}$$

### &emsp;矩阵边框

在起始、结束标记处用下列词替换matrix

+ pmatrix：小括号边框
+ bmatrix：中括号边框
+ Bmatrix：大括号边框
+ vmatrix：单竖线边框
+ Vmatrix：双竖线边框

如：

```mathjax
$$\begin{bmatrix}
1&0&0\\
0&1&0\\
0&0&1\\
\end{bmatrix}$$
```

就变成：

$$\begin{bmatrix}
1&0&0\\
0&1&0\\
0&0&1\\
\end{bmatrix}$$

### &emsp;省略元素

+ 横省略号：\cdots
+ 竖省略号：\vdots
+ 斜省略号：\ddots

如：

```mathjax
$$\begin{bmatrix}
{x_{11}}&{x_{12}}&{\cdots}&{x_{1n}}\\
{x_{21}}&{x_{22}}&{\cdots}&{x_{2n}}\\
{\vdots}&{\vdots}&{\ddots}&{\vdots}\\
{x_{m1}}&{x_{m2}}&{\cdots}&{x_{mn}}\\
\end{bmatrix}$$
```

就变成：

$$\begin{bmatrix}
{x_{11}}&{x_{12}}&{\cdots}&{x_{1n}}\\
{x_{21}}&{x_{22}}&{\cdots}&{x_{2n}}\\
{\vdots}&{\vdots}&{\ddots}&{\vdots}\\
{x_{m1}}&{x_{m2}}&{\cdots}&{x_{mn}}\\
\end{bmatrix}$$

&emsp;

## 方程组

+ 起始标记`\begin{cases}`，结束标志为`\end{cases}`
+ 每一行末尾标记\\\\，一行方程式写一行

```mathjax
$$\begin{cases}
a_1x+b_1y+c_1z=d_1\\
a_2x+b_2y+c_2z=d_2\\
a_3x+b_3y+c_3z=d_3\\
\end{cases}
$$
```

即：

$$\begin{cases}
a_1x+b_1y+c_1z=d_1\\
a_2x+b_2y+c_2z=d_2\\
a_3x+b_3y+c_3z=d_3\\
\end{cases}
$$

其实其他两种表示方法也可以：

```mathjax
$$ F^{HLLC}=\left\{
\begin{array}{rcl}
F_L       &      & {0      <      S_L}\\
F^*_L     &      & {S_L \leq 0 < S_M}\\
F^*_R     &      & {S_M \leq 0 < S_R}\\
F_R       &      & {S_R \leq 0}
\end{array} \right. $$
//上面的.是必要的，这也是不同的地方
```

$$ F^{HLLC}=\left\{
\begin{array}{rcl}
F_L && {0<S_L}\\
F^*_L&& {S_L \leq 0 < S_M}\\
F^*_R&& {S_M \leq 0 < S_R}\\
F_R && {S_R \leq 0}
\end{array} \right. $$

&emsp;

## 阵列

+ 起始标记`\begin{array}`，结束标志为`\end{array}`
+ 对齐方式：在{array}后以{}逐行统一声明，左对齐：l；居中：c；右对齐：r
+ 竖直线：在声明对齐方式时，插入\|建立竖直线
+ 插入水平线：\hline

```mathjax
$$\begin{array}{c|lll}
{↓}&{a}&{b}&{c}\\
\hline
{R_1}&{c}&{b}&{a}\\
{R_2}&{b}&{c}&{c}\\
\end{array}$$
```

即：

$$\begin{array}{c|lll}
{↓}&{a}&{b}&{c}\\
\hline
{R_1}&{c}&{b}&{a}\\
{R_2}&{b}&{c}&{c}\\
\end{array}$$
