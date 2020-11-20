---
layout: post
title:  "面向对象"
date:   2019-09-27 15:48:21 +0800
categories: notes java base
tags: Java 基础 继承 重构 转型 重载 多态 抽象 接口 内部类
excerpt: "继承、多态与内部类"
---

## Object类

使用`class`关键字定义类时，就开始使用继承，因为在Java中所有的类都继承了`java.lang.Object`类。`Object`类比较特殊，是所有类的父类，是Java类层的最高层。

当创建一个类除非是显示继承其他类，否则就是由`java.lang.Object`类继承而来的，如`String`类等，自定义的类也是继承`Object`类，由于全部的类都是`Object`类的子类，所以省略`extends Object`关键字。

由于所有的类都是`Object`类的子类，所以所有类都可以重写`Object`类中的方法。  

但是`getClass()`方法、`notify()`方法、`notifyAll()`方法、`wait()`方法等方法不可被重写，因为其为`final`类型，即用`final`关键字修饰，不可修改与被继承。

### &emsp;1.getClass()

是`Object`类的方法，返回对象执行时的`Class`实例，然后使用此实例调用`getName()`方法可以获取该类的名称。  

<span style="color:aqua">格式：</span>`getClass().getName();`

### &emsp;2.toString()

将一个对象返回为字符串的形式，将返回一个`String`实例，实际使用时会重写`toString`方法，为对象提供一个特定的输出模式，当这个类转换为字符串或字符串连接时会自动调用重写的方法。  
如：  

```java
public class Newclass{
    public String toString(){
        return "在"+getClass().getName()+"类中重写了toString()方法";
    }
    public static void main(String[] args){
        System.out.println(new Newclass());
    }
}
```

在主函数中打印创建的`Newclass`对象，应该自动调用该对象的`toString()`方法，因为在这个对象中重写了`toString`方法，所以返回的是一串自定义字符串，并写上了当前实例化的类的类名。

### &emsp;3.equals()

在已经定义过的类，如`String`类、`Number`类中`equals()`方法不同于==运算符比较两边的引用，而是比较两边的内容，实际上`equals()`方法在Object类中默认的功能就是比较其引用是否相同，而在已经包装好的`String`类等中重写了该方法变为比较内容，但是在自定义的类中，没有定义过这种功能，所以在自定义类中需要同样地重写该函数。

&emsp;

## 继承

### &emsp;extends和super关键字

类的继承在于基于某个父类，指定一个新子类，子类拥有父类原有的属性和方法，并有自己独有的属性与方法，甚至可以重写父类的属性方法。Java的继承是单继承的，所以只能有一个父类。  

`extends`关键字说明继承，`super`关键字调用父类。

```java
class Test{
    public Test(){ // 构造方法，没有返回值且方法名和类名一致
    }
    protected void doSometing(){ // 成员方法
    }
    protected Test doIt(){ // 方法返回值为Test类型
        return new Test();
    }
}
class Test2 extends Test{ // 定义Test2继承Test类
    public Test2(){ // 定义Test构造方法
        super(); // super是父类，super()调用父类
        super.doSomething(); // 调用父类成员方法
    }
    public void doSomethingnew(){ // 定义子类新方法
    }
    public void doSomething(){ // 重写父类方法
    }
    protect Test2 doIt(){ // 重写父类方法，返回值为Test2
        return new Test2();
    }
}
```

首先定义了两个类Test和Test2，其中Test2继承了Test类，Test类是Test2的父类。

子类初始化可以连同初始化父类构造方法，既可以在子类中调用`super()`来调用父类构造方法，也可以在子类中使用`super`关键字来调用父类成员。

### &emsp;权限修饰符约束继承

<span style="color:red">继承不是所有就都可以继承</span>，子类无法调用`private`权限的成员，且也无法继承权限为private的成员。如：

```java
public class RunTest{
    public static void main(String args[]){
        Cat c = new Cat();
        c.shot();
    }
}

class Animal{
    private void shot(){
        System.out.println("wwwww");
    }
}

class Cat extends Animal{
}
```

这个就会报错。而权限改为public或者protected就可以继承。

### &emsp;子类实例的构造

Java中一切都以对象的方式进行处理，在继承中，创建一个子类对象，将包含一个父类子对象，这个对象与单用父类构造函数创建的对象是一样的。两者的区别是后者是来自外部，而前者来自子类对象内部。也就是说当实例化子类对象的时候父类对象也同样会被实例化，即实例化子类对象时，Java编译器会在子类的构造方法中自动调用父类的无参构造方法。

如：

```java
class Parent{
    Parent(){
    System.out.println("父类构造方法");
    }
}
class Child extends Parent{
    Child(){
        System.out.println("子类构造方法");
    }
}
public class GrandChild extends Child{
    GrandChild(){
        System.out.println("孙子类构造方法");
    }
    public static void main(String[] args){
        GrandChlid g = new GrandChild();
    }
}
>>>>>
父类构造方法
子类构造方法
孙子类构造方法
```

所以可知当实例化一个子类对象，会首先依次实例化其父类对象。  

在实例化子类对象时，父类无参构造方法会被自动隐式调用，但是有参构造函数不会被自动调用，只能依赖`super`关键字显示地被调用父类构造方法，并在括号中传入参数。且super语句需要放到子类构造器的第一行，不然会出错。  

如果一个父类没有提供一个无参构造类（或者说把原本的无参构造类变成有参的了），那么子类构造的时候会报错：

```java
class Animal{
    public Animal(String s){
       System.out.println(s);
    }
}

class Cat extends Animal{
}
```

这里的Cat类会变红，因为无法构造Cat类。那么应该怎么办呢？应该在子类的构造方法中调用`super()`方法并传入参数手动构造（super方法一定要在第一行）：

```java
class Animal{
    public Animal(String s){
       System.out.println(s);
    }
}

class Cat extends Animal{
    public Cat(){
        super("Cat");
    }
}
```

如果使用`finalize()`方法对对象进行显示清理，需要确保子类的`finalize()`方法的最后一个动作是调用父类的`finalize()`方法，以保证父类的垃圾也能被回收。

&emsp;

## 转型

对象类型地转换十分常见，分为向上转型和向下转型，也就是抽象和具体的转换问题。

### &emsp;1.向上转型

```java
class Father{
    // function1方法被Son类继承，且为静态方法，所以可以在main中使用
    // 如果不为静态方法，则function1方法必须先实例化才能使用
    public static void function1(Father f){
    }
}
public class Son extends Father{
    public static void main(String args[]){
        Father s = new Son();// 向上转型
        function1(s);
    }
}
```

在这里定义了两个类`Father`和`Son`类，`Son`类继承`Father`类，`Father`类中定义了`function1`的方法，其传递的参数是`Father`类型的。由于`Son`类继承`Father`类，所以也可以在`Son`类中调用其`function1`的方法。但是值得注意的是在`Son`类中调用`function1`的方法传入的参数不是其定义时的`Father`类型的参数，而是`Son`类型的。  

这种把子类对象赋值给父类类型的变量的技术就是向上转型。  

为什么可以实现向上转型，这就是抽象和具体的转换，抽象就是一类事物所共有的特征，具体就是在共有的特征外还有自己独有的特征。如果一个对象是一个类的子类，那就满足一个类的所有共有特征，还有自己独有的特征，所以是符合特征的，因为抽象的范围比具体的范围更广。由于具体向抽象转型，所以其总是安全的。  

同时向上转型的一个目的就是将子类的实现全部反馈到父类上，让父类根据不同的情况进行不同的处理方法，这能保证子类的实现很安全，因为我们不再直接使用子类，而是用父类来进行操作，同时这样也很方便，只用一个父类就足够了，而不会因为复杂的子类实现而头痛。

这就是多态的思想，在父类上定义所有子类所共有的特征，然后传入子类对象仍能使用，因为子类符合父类标准。但是如果你向上转型，那么你独有的属性和方法都会失效，而只会保存继承而来的属性和方法。对于向上转型更多是为了改进原来的父类。相当于按照父类模板来建造的子类对象，是子类的简化。  

上转型后的对象不能访问子类新增的成员的，但是可以访问子类继承或者屏蔽的类成员，因为这是在父类中就定义好的。同样上转型对象可以使用子类继承的方法和重写的方法，作用等价于子类去调用。

同时我们可以将子类向上转型变成父类对象，同时也可以向下转型重新变为子类对象，但是父类建立的对象的引用不能指向子类，因为父类没办法扩充没有的方法或者属性。

如果子类重写了父类的静态方法，则子类重写后也必须是静态的，如果子类上转型对象调用静态方法，则调用的不是子类重写的静态方法，而是父类的静态方法。

### &emsp;2.向下转型

向下转型就是由抽象到具体，但是这种往往会出现问题，如鸽子是鸟，但是鸟不满足鸽子的独有特征。所以可以说子类对象总是父类的实例，但是不能说父类对象总是子类的实例。  

如果想向下转型，就必须使用显示类型转换：

<span style="color:aqua">格式：</span>`(目标类名)变量名;`  

但是这种向下转型往往有不安全的问题。所以就出现了Java的泛型编程。  

为什么需要向下转型？就是因为在实践中虽然将一堆不同类型的类都归于一组，但是获得了抽象性，也丢失了可扩展性。所以向下转型就可以强行获取到原来子类独有的方法。这样我们就可以获取到子类和父类的所有方法，之前隐藏的方法也能被获取到了。  

&emsp;

无论是什么转型，都需要有`父类 引用名 = new 子类`。而且不是所有的都能转型，必须<span style="color:red">这个实例是这个目标类的实例</span>才能转型到这个类（也就是是子类）。

&emsp;

## instanceof关键字

当进行向下转型时如果父类不是子类对象的实例，就会发生ClassCastException异常，所以向下转型需要判断父类对象是否为子类对象的实例。  

如果一个实例是子类的实例，那么它同样也是其父类的实例。

<span style="color:aqua">格式：</span>`对象的引用变量 instanceof 目标类;`  

返回`true`值就是是实例对象，`false`就是不是。

且null不属于任何类的子类，包括它自己。

&emsp;

## 重载与重写

重载和重写也是体现多态的方法。

<span style="color:yellowgreen">重载</span>就是在同一个类中允许同时存在一个以上的同名方法，只需要参数个数或者参数类型不同即可。  

编译器是根据方法名、参数类型和参数个数以及参数顺序来判断类中的方法是否唯一。（返回值类型不足以判断两个方法的重载）  
如：  

```java
public class Add{
    public static int add(int a,int b){
        return a+b;
    }
    public static double add(double a,double b){
        return a+b;
    }
    public static int add(int a){
        return a;
    }
    public static int add(int a,double b){
        return 1;
    }
    public static int add(double a,int b){
        return 1;
    }
    public static void main(String[] args){
        System.out.println("add(int,int)"+add(1,2));
        System.out.println("add(double,double)"+add(1.3,2.7));
        System.out.println("add(int)"+add(1));
    }
}
```

不同的参数传入函数会实现不同的实现，所以重载的意义就是实现不同参数的适应。

&emsp;

如果子类中声明与父类同名的属性，即可在子类中覆盖从继承来的父类的同名属性，子类同名属性的数据类型可以和被覆盖的属性的数据类型不同。这是属性重写或者是隐藏属性。

但是实际上最好不要对父类属性进行重写，所以一般都是方法的重写。

如果子类和父类的成员方法返回值，方法名称，参数类型与个数都完全相同，不同的仅仅是实现内容，那这种构造方法就是<span style="color:yellowgreen">重构/重写</span>。  

如果我们要重写方法，也就是假如父类有默认的处理方法，而子类继承父类而需要改写父类处理方法，那么就需要重写方法。因为重载的要求，所以我们重写时必须要求与父类的方法名，参数类型，参数数量，参数顺序保持一致，否则就是重载而不是重写。我们也可以在子类中命名与父类中同名的属性来覆盖父类的属性。

```java
class Father{
    public void show(){
        System.out.println("Father.show()");
    }
}
class Son extends Father{
    // 重写父类方法
    public void show(){
        System.out.println("Son.show()");
    }
}
public class Override{
    public static void main(String[] args){
        Son s = new Son();
        // 调用子类重写方法
        s.show();
    }
}
```

假如我们要使用被父类重写的属性和方法，那么我们可以使用super.属性名/方法名来使用被覆盖掉的方法或者属性。如上面这个例子如果要调用被覆盖的方法只用`super.show()`就可以了。

当重写父类方法时，修改方法的权限只能从小权限向大权限改，也就是说权限必须更开放，如如果父类成员方法权限为`protected`，那么子类重写方法只能改为`protected`或者`public`以及无权限符。

当子类重写父类的方法还可以修改返回值类型，但是重写的返回值类型只能是父类同一方法返回值的子类，如返回Test类型值的方法修改后返回类型为Test2就可以，而一般的Int类型就不行，因为不是其原来返回值类型的子类。

&emsp;

## 抽象（abstract关键字）

如四边形都是拥有四边，等腰三角形拥有两条相等的三角形，这些描述都是十分合理的，但是对于图形，这样的类就十分抽象，是最顶级的抽的象类，所以就很难用具体的语言进行描述，所以这就是抽象类。抽象类的最主要目的就是继承扩展。

一般父类被定义为抽象类，需要使用该抽象类进行继承和多态处理。由继承机制可以得知，一般越上面的父类就越抽象。

在多态机制中不需要实例化抽象类的父类，只需要子类对象，所以在Java中也不能实例化抽象类对象，所以就比如图像类不能抽象出一个具体图形，但是其子类就可以。所以抽象类不能使用new关键字来构造对象。

最典型的例子就是在Java中没有构造Object类的构造函数，就是因为多态机制它作为抽象类不可实例化。（在JavaScript中就含有，但是它可以被实例化，所以JavaScript就不是面向对象的语言，而是基于对象的语言）

虽然抽象类不能通过new来创建对象，但是可以定义抽象类引用对象，然后用子类对象进行赋值，也就是上转型。

且子类如果要实例化就必须实现抽象类中的所有方法，即重写（因为抽象方法没有意义）。

<span style="color:aqua">格式：</span>

```java
public abstract class 抽象类名{  
    abstract 权限修饰符 抽象方法名();  
}  
```

`abstract`关键字就是定义抽象类和抽象方法的关键字。

使用`abstract`关键字定义的类就是抽象类，定义的方法就是抽象方法。

抽象方法不能被声明成`final`和`static`。

抽象方法没有方法体，它本身没有任何意义，也没有任何作用，除非它在子类被重写，而承载这个抽象方法的抽象类必须被继承（抽象类的存在意义就是被继承）。

也就是说如果声明一个抽象的方法，那么承载它的类必须是抽象类，只要类中有一个抽象方法，那么它就是抽象类。  

当然抽象类中也可以含有非抽象的具体实现的方法。也就是说抽象类可以没有抽象方法。它们双方并不是充分必要条件。当然抽象类被继承后需要实现其中所有的抽象方法，也就是说要保证相同的方法名称，参数列表和相同返回值类型创建出非抽象方法，也可以是抽象方法。  

&emsp;

## 接口（interface和implements关键字）

接口是抽象类的延伸，可以当作纯粹的抽象类，接口中所有的方法都没有方法体。为什么会出现接口的概念？就是当继承的时候父类的有些方法可能对继承父类的部分子类有效而不是对所有的子类都有效，如多边形的面积求法就不同于三角形和四边形。如果把这部分功能放在父类中被继承，不需要这功能的类仍然需要重写该方法，所以为了让子类继承父类并继承部分类需要的功能，且子类不能同时继承多个父类，所以就出现了接口。让子类继承父类并实现接口。

### &emsp;1.定义和实现

接口定义<span style="color:aqua">格式：</span>

```java
public interface 接口名{  
    接口内方法，接口中的方法都是抽象方法，不能具体实现功能。  
    包含常量定义和方法定义两部分
}
```  

实现接口<span style="color:aqua">格式：</span>

```java
public class 类名 implements 接口名{  
}  
/
public class 类名 extends 父类名 implements 接口名{  
}  
```

在接口中定义的方法必须被声明为`public`或者`abstract`形式，其他权限修饰符都不认可，即使不声明也是默认该形式。  

且在接口中定义的任何字段都是`static`和`final`的。

接口中亦可以有属性，不过这些都是会改变的属性，在子类会重新被重写。且相同接口的使用不代表这些类有继承的关系。

### &emsp;2.多继承

Java不允许多继承，但是使用接口可以实现多继承，因为一个类可以同时实现多个接口，但是很可能会带来更多的代码量，因为继承一个接口就要实现其所有的方法。  

<span style="color:aqua">格式：</span>`class 类名 implements 接口1,接口2...`

同时接口可以继承其他接口<span style="color:aqua">格式：</span>

```java
interface 接口1 extends 接口2 {  
}
```

<span style="color:orange">注意：</span>接口不能继承类。

### &emsp;3.接口回调

接口回调类似上转型，如果我们使用了一个类来继承一个接口，但是我们也可以实例化一个接口类的实例，这就是接口回调：

```java
public class C implements A{
    public void run(){}
};
A a = new C();
a.run();
```

这个接口变量就可以调用被类重写和定义的接口方法。所以不同的子类可以重写同一个接口的实现方式，这也是多态的呈现方式。

### &emsp;4.接口权限符

因为接口常量权限默认都是public、static、final类型，这些修饰符都可以省略，接口中方法权限默认则是public和abstract类型，也可以省略。

如果interface前有public，则称这样的接口是一个public接口，public接口可以被任何一个类实现，如果无public修饰则可以被与此接口所在同一个包中的类实现。

### &emsp;5.import导入接口

同类一样，接口也可以通过import关键字来导入使用。

### &emsp;6.默认方法

Java 8对接口做了进一步的增强。  
a. 在接口中可以添加使用default关键字修饰的非抽象方法。即：默认方法（或扩展方法）  
b. 接口里可以声明静态方法，并且可以实现。  

默认方法（或扩展方法）  

Java 8允许给接口添加一个非抽象的方法实现，只需要使用`default`关键字即可，这个特征又叫做扩展方法（也称为默认方法或虚拟扩展方法或防护方法）。在实现该接口时，该默认扩展方法在子类上可以直接使用，它的使用方式类似于抽象类中非抽象成员方法。  

扩展方法不能够重写（也称复写或覆盖）Object中的方法，却可以重载Object中的方法。

`toString`、`equals`、`hashCode`不能在接口中被覆盖，却可以被重载。  

默认方法允许我们在接口里添加新的方法，而不会破坏实现这个接口的已有类的兼容性，也就是说不会强迫实现接口的类实现默认方法。

默认方法和抽象方法的区别是抽象方法必须要被实现，默认方法不是。作为替代方式，接口可以提供一个默认的方法实现，所有这个接口的实现类都会通过继承得到这个方法（如果有需要也可以重写这个方法）

如：

```java
interface Defaulable {
    // 使用default关键字声明了一个默认方法
     @SuppressLint("NewApi")
     default String myDefalutMethod() {
        return "Default implementation";
    }
}
class DefaultableImpl implements Defaulable {
    // DefaultableImpl实现了Defaulable接口，没有对默认方法做任何修改
}
class OverridableImpl implements Defaulable {
        // OverridableImpl实现了Defaulable接口重写接口的默认实现，提供了自己的实现方法。
        @Override
        public String myDefalutMethod() {
            return "Overridden implementation";
        }
}
```

JVM平台的接口的默认方法实现是很高效的，并且方法调用的字节码指令支持默认方法。默认方法使已经存在的接口可以修改而不会影响编译的过程。`java.util.Collection`中添加的额外方法就是最好的例子：`stream()`, `parallelStream()`, `forEach()`, `removeIf()`

虽然默认方法很强大，但是使用之前一定要仔细考虑是不是真的需要使用默认方法，因为在层级很复杂的情况下很容易引起模糊不清甚至编译错误。总的来说其实并没有那么推荐使用这个。

### &emsp;7.总结

接口并不是类，编写接口的方式和类很相似，但是它们属于不同的概念。类描述对象的属性和方法。接口则包含类要实现的方法。  

除非实现接口的类是抽象类，否则该类要定义接口中的所有方法。  

接口无法被实例化，但是可以被实现。一个实现接口的类，必须实现接口内所描述的所有方法，否则就必须声明为抽象类。另外，在Java中，接口类型可用来声明一个变量，他们可以成为一个空指针，或是被绑定在一个以此接口实现的对象。  

接口与抽象类相似点：

+ 一个接口/抽象类可以有多个方法。  
+ 接口/抽象类文件保存在.java 结尾的文件中，文件名使用接口/抽象类名。  
+ 接口/抽象类的字节码文件保存在 .class 结尾的文件中。  
+ 接口/抽象类相应的字节码文件必须在与包名称相匹配的目录结构中。  
+ 接口/抽象类，没有构造方法，也不能用new来实例化对象，但是可以上转型和接口回调。
+ 如果子类继承或者实现接口/抽象类，都必须实现其接口或者类中的所有方法。

接口与抽象类的区别：  

+ 接口中所有的方法必须是抽象方法，抽象类可以有非抽象方法。  
+ 接口不能包含成员变量，除了`static`和`final`变量，即只能是常量；而抽象类可以有变量。  
+ 接口不是被类继承了，而是要被类实现。  
+ 接口支持多继承。

接口特性：

+ 接口中每一个方法也是隐式抽象的,接口中的方法会被隐式的指定为`public abstract`（只能是`public abstract`，其他修饰符都会报错）。  
+ 接口中可以含有变量，但是接口中的变量会被隐式的指定为`public static final`变量（并且只能是`public`，用`private`修饰会报编译错误）。  
+ 接口中的方法是不能在接口中实现的，只能由实现接口的类来实现接口中的方法。

使用接口来编程能保证实现的隐蔽性和对外调用的统一性，这就是面向接口编程。

&emsp;

## 内部类

内部类就是在一个类内部定义的类。内部类可以分为成员内部类，局部内部类，静态内部类，匿名内部类。这就是封装的概念。通过类进行封装，保护内部的实现。而包含内部类的类就是内部类的外部类。

总的来说Java内部类的用法：

1. 内部类可以用多个实例，每个实例都有自己的状态信息，并且与其他外围对象的信息相互独立。
2. 在单个外围类中，可以让多个内部类以不同的方式实现同一个接口，或者继承同一个类。
3. 创建内部类对象的时刻并不依赖于外围类对象的创建。
4. 内部类并没有令人迷惑的"is-a"关系，他就是一个独立的实体。
5. 内部类提供了更好的封装，除了该外围类，其他类都不能访问。
6. 特别是后面的编写图形类接口的时候，内部类能实现更专业高效的代码。

### &emsp;1.成员内部类

在一个类中使用内部类，可以在内部类中直接存取其所在类的私有变量成员。和成员变量是一样的，属于类的全局成员。  

<span style="color:aqua">格式：</span>

```java
权限修饰符 class 外部类名{  
    权限修饰符 class 内部类名{  
        ...
    }  
}
```

#### &emsp;&emsp;1.1说明

成员内部类也是最普通的内部类，它是外围类的一个成员，所以他是可以无限制的访问外围类的所有成员属性和方法，尽管是`private`的；但是外围类要访问内部类的成员属性和方法则需要通过内部类实例来访问。  

且注意内部类不能定义为public权限，因为同一个文件只能有一个public。

在成员内部类中要注意两点：

1. 成员内部类中不能存在任何`static`的变量和方法；
2. 成员内部类是依附于外围类的，所以只有先创建了外围类才能够创建内部类。  

内部类的实例一定要绑定在外部类的实例上，如果从外部类中初始化一个内部类对象，那么内部类对象就会被绑定到外部类对象上。内部类初始化方法与其他类初始化方法相同，都是使用`new`。也就是说需要使用内部类方法必须先实例化外部类，且类使用<span style="color:aqua">格式：</span>外部类名.内部类名。

如:

```java
public class OuterClass{
    innerClass in = new innerClass(); // 在外部类实例化内部类对象引用
    public void ouf(){
        in.inf(); // 在外部类方法中调用内部类方法
    }
    class innerClass{
        innerClass(){ // 内部类构造方法
        }
        public void inf(){ // 内部类成员方法
        }
        int y = 0; // 定义内部类成员变量
    }
    public innerClass doit(){ // 外部类方法，返回值为内部类引用
    // y = 4; // 外部类不可以直接访问内部类成员变量
        in.y = 4;
        return new innerClass();
    }
    public static void main(String[] args){
        OuterClass out = new OuterClass();
// 内部类的对象实例化操作必须在外部类或者外部类的静态方法中实现
        OuterClass.innerClass in = out.doit();
        OuterClass.innerClass in2 = out.new innerClass();
    }
}
```

外部类创建内部类实例与其他类创建对象引用时相同。内部可以访问其外部类成员，但是内部类成员只有内部类内才可以使用，外部类不能直接使用。  

如果在外部类和非静态方法之外实例化内部类对象，需要使用外部类，内部类的形式指定该对象的类型。内部类依赖外部类的存在而存在。

内部类是个编译时的概念，一旦编译成功后，它就与外围类属于两个完全不同的类（当然他们之间还是有联系的）。对于一个名为OuterClass的外围类和一个名为InnerClass的内部类，在编译成功后，会出现这样两个class文件：OuterClass.class和OuterClass$InnerClass.class。所以可以把还没有定义的内部类写在前面。

#### &emsp;&emsp;1.2内部类向上转型为接口

如果将一个权限修饰符为`private`的内部类向上转型为父类对象，或者直接向上转型为一个接口，那么就可以隐藏内部类具体实现过程。可以在外部提供一个接口，在接口中声明一个方法。如果在实现该接口的内部类中实现该接口的方法，那么就可以定义多个内部类以不同的方式实现一个接口的同一方法，而一般类是无法多次实现接口中同一方法的。（类似于重载）

```java
interface OutInterface{ // 定义一个接口
    public void f();
}
public class InterfaceInner{
    public static void main(String[] args){
        OuterClass out = new OuterClass(); // 实例化一个OuterClass2对象
        OutInterface outinter = out.doit(); // 调用doit()方法，返回一个OutInterface接口
        outinter.f(); // 调用f()方法
    }
}
class OuterClass{ // 定义一个内部类实现OutInterface接口
    private class InnerClass implements OutInterface{
        InnerClass(String s){ // 内部类构造方法
            System.out.println(s);
        }
        public void f(){
            System.out.println("访问内部类中的f()方法");
        }
    }
    public OutInterface doit(){ // 定义一个方法，返回类型为OutInterface接口
        return new InnerClass("访问内部类构造方法");
    }
}
```

OuterClass类中定义了一个修饰权限为private的内部类，这个内部类实现了OutInterface接口，后修改doit()方法，使该方法返回一个OutInterface接口。由于内部类InnerClass的修饰权限为private，所以只有其父类，即OuterClass类可以访问该内部类，可以访问doit()方法。由于该方法返回的是一个外部接口类型，这个接口可以作为外部使用的接口，其包含一个f()方法。在继承此方法的内部类中实现了此方法，如果某个类继承了外部类，由于内部的权限不能向下转型为内部类InnerClass，同时也不能访问f()方法，但是可以访问接口中的f()方法。如InterfaceInner类中的最后一条语句，接口调用f()方法，可以看出其执行的是内部类的f()方法，也就是对继承该类的子类隐藏了实现方法，隐藏了f()方法的具体实现，仅留下接口和外部类。这也是内部类的基础使用方法。  

非内部类不能被声明为`private`或者`protected`访问类型。

#### &emsp;&emsp;1.3使用this关键字获取内部类与外部类的引用

如果在外部类中定义的成员变量与内部类的成员变量名称相同，可以使用`this`关键字。

<span style="color:aqua">格式：</span>内部类当前对象的变量：`this.变量名` / 当前对象外部类的变量：`外部类名.this.变量名`  

```java
public class TheSameName {
    private int x;
    private class Inner {
        private int x;
        public void doit(int x) { // 传入的是形参x
            x++; // 调用形参x
            this.x++； // 调用内部类的变量x
            TheSameName.this.x++;
        }
    }
}
```

### &emsp;2.局部内部类

内部类不仅可以在类中定义，也可以在类的局部区域定义，如类的方法，选择和循环语句中等。局部内部类只在局部区域中有效。  

对于这个类的使用主要是应用与解决比较复杂的问题，想创建一个类来辅助我们的解决方案，到那时又不希望这个类是公共可用的，所以就产生了局部内部类。  

```java
interface OutInterface{ // 定义一个接口
}
class OuterClass{
    public OutInterface doit(final String x){
    // doit方法参数设置为final类型，也就是无法修改参数
    // 定义一个内部类
        class InnerClass implements OutInterface{
            InnerClass(String s){
                s = x;
                System.out.println(s);
            }
        return new InnerClass("doit");
    }
}
```

内部类被定义在doit()方法内部，但是内部类InnerClass是doit()方法的一部分，而不是OuterClass的一部分，所以doit方法外部无法访问内部类额，但是该内部类可以访问外部类和方法的成员。  

由于参数x被设置为`final`类型，所以是无法更改其值，因为其生命周期超越方法的生命周期，被认为是一个常量。

同样局部内部类也可以使用外部类中所有的成员方法和成员变量，因为是内部的。

### &emsp;3.静态内部类

同成员内部类不同，它可以直接创建使用，而不用依赖外部类的实现，使用static关键字来实现。即其实是内部类的一种特殊情况。

<span style="color:aqua">格式：</span>

```java
权限修饰符 class 外部类名{  
    static class 内部类名{  
        ...
    }  
}
```

### &emsp;4.匿名内部类

即没有名称的内部类。因为匿名类没有类名，所以不能直接定义对象，需要借助父类构造器定义对象。

使用匿名类是因为我们不想在别的地方被使用而仅在这里使用，就是只对这个父类进行一次个性化，只被执行一次，能简洁代码。

<span style="color:aqua">格式：</span>

```java
new 父类(){
    // 匿名类的类体
    成员变量;
    成员方法;
}
```

```java
class A{
    void show(){
        System.out.println("A class");
    }
}
public class Test{
    public static void main(String[] args){
        A a = new A();
        a.show();
        A aa = new A(){
            void show(){
                System.out.println("A noname class");
            }
        }
        aa.show();
    }
}
```

请注意，如果你要编译这个文件，那么你会得到三个class文件，一个是A.class，一个是Test.class，一个是Test\$1.class，最后一个文件即匿名类编译后的类文件。\$1就代表第一个匿名类，依次排序。

#### &emsp;&emsp;使用匿名类实现接口

我们之前实现接口，需要类继承接口再实例化，并把实例赋值给接口。假如我们只需要实现这个接口而不用去管这个接口是实现了赋值给谁，那继续这样操作是十分麻烦的。而如果我们使用了匿名类，那么我们可以直接在接口后使用匿名类实现接口。

```java
// 首先定义一个接口
interface SpeakHello{
    void speak();
}
// 定义一个类，传入接口类型的实例
class HelloTv{
    public void turnOn(SpeakHello hello){
        // 调用实例方法
        hello.speak();
    }
}
public class Test{
    public static void main(String[] args){
        // 创建一个实例
        HelloTv tv = new HelloTv();
        // 传入接口类型的方法，并使用匿名类直接定义重写
        // 匿名类看上去就是实例化接口一样，但是实际上不是
        tv.turnOn(new SpeakHello(){
            public void speack(){
                System.out.println("Hello!Welcome!");
            }
        })
    }
}
```
