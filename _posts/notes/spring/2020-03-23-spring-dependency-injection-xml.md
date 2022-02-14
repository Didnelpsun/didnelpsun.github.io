---
layout: post
title: "代码依赖注入"
date: 2020-03-23 17:17:09 +0800
categories: notes spring base
tags: Spring 基础 xml 构造器 constructor-arg ref type value index 设值函数 property p-namespace 内部类 list set map properties null
excerpt: "代码依赖注入"
---

我们在创建Spring Bean的时候就已经使用过了依赖注入的概念，但是我们一直都没有仔细的系统的去讲。

依赖注入分为两种大的方式，一种是基于注释，一种是基于代码。具体细分一共有三种：

+ 注释
+ 构造函数
+ 设值函数

可注入的数据类型：

+ 基本数据类型与String
+ 其他Bean实例类型
+ 复杂类型/集合类型

每个基于应用程序的Java都有几个对象，这些对象一起工作来呈现出终端用户所看到的工作的应用程序。当编写一个复杂的Java应用程序时，应用程序类应该尽可能独立于其他Java类来增加这些类重用的可能性，并且在做单元测试时，测试独立于其他类的独立性。依赖注入（或有时称为布线）有助于把这些类粘合在一起，同时保持他们独立。

但是显然这些依赖都是应该比较固定的，如果是变化很大的数据，不同用户的注册相关信息之类的，那么依赖注入会造成很大的时间开销，所以是不适合的。

```java
// 新建一个Didnelpsun类
public class Didnelpsun{
    // 拥有一个私有变量，类型为blog，代表为博客类
    private Blog DidBlog;
    public Didnelpsun(){
        // 构造函数中新建一个blog类来赋值给Didnelpsun属性
        DidBlog = new Blog();
    }
}
// 这是基本的实现，那么我们如果使用依赖注入的方式来实现呢？
public class Didnelpsun{
    private Blog DidBlog;
    public Didnelpsun(Blog DidBlog){
        this.DidBlog = DidBlog;
    }
}
```

从上面的例子就可以看出依赖注入的大致含义，对于原先的函数，DidBlog成员需要在函数内自己new一个，而使用了依赖注入后，这个成员不用自己new，而依赖注入到函数体内的参数来赋值为成员。

为了控制反转和依赖注入，我们将初始化一个Blog类的的过程从构造函数中移除，而将这个功能交给传入的参数，构造方法不关心这个类是如何构造的，从而降低了构造函数的压力，并且把具体实现放在外面，当发生更改时直接对DidBlog参数更改，而不用更改函数体。在控制反转中这个类将由容器构造并赋值给这个属性。这就是依赖注入。

我们可能会奇怪构造函数中第一个的DidBlog为什么没有指明this，是因为DidBlog这个属性在第一个构造方法中是独有的，而第二个构造方法中参数和类属性重名了，所以必须指明this，虽然我们也可以不重名，但是并不推荐这样使用，因为并不直观。

首先还是利用[标准Spring项目XML模板：Spring/basic_xml](https://github.com/Didnelpsun/Spring/tree/master/basic_xml)来构建示例项目。

## 构造函数注入

即通过构造函数实现依赖注入。

### &emsp;传入依赖类（constructor-arg标签与ref属性）

<span style="color:aqua">格式：</span>`<constructor-arg ref="依赖值"/>`

首先我们还是按照构造一个User类，然后User类调用HelloWorld类的思路来举例子：

```java
// User.java
package org.didnelpsun.entity;

public class User {
    private HelloWorld helloWorld;
    public HelloWorld getHelloWorld() {
        return helloWorld;
    }
    public void setHelloWorld(HelloWorld helloWorld) {
        this.helloWorld = helloWorld;
    }
    public User(HelloWorld helloWorld){
        this.helloWorld = helloWorld;
        System.out.println("UserClass");
    }
    public void SayHello(){
        helloWorld.sayHello();
    }
}
```

我们来分析一下这个例子。首先我们主要的类是User类，它有一个私有属性是HelloWorld类型的。然后我们使用User的构造器来初始化这个类，它按照依赖注入的概念不在构造函数中创建类，而是使用一个参数引入，然后把参数赋值给类的属性，再打印。User类还有一个方法SayHello，这个方法是调用HelloWrold类的方法。

```java
// HelloWorld.java
package org.didnelpsun.entity;

public class HelloWorld {
    public HelloWorld(){
        System.out.println("HelloWorldClass");
    }
    public void SayHello(){
        System.out.println("Hello,World!");
    }
}
```

然后再看HelloWorld类，它也有一个只打印的构造方法和一个SayHello方法。

```java
// App.java
package org.didnelpsun;
import org.didnelpsun.entity.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App
{
    private static ApplicationContext welcomeContext;
    public static void main(String args[]){
        welcomeContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        User Didnelpsun = (User) welcomeContext.getBean("Didnelpsun");
        Didnelpsun.SayHello();
    }
}
```

主类就是获取一个名为Didnelpsun的实例，这个实例对应的是User类实例化的，然后调用它的SayHello方法。这里我们要关注到一个细节，虽然User类中的构造器中需要传入一个依赖的类HelloWorld，但是在主类中它并没有表现出传入这个参数。

如在开头所说的，在之前的案例中，如果要传入实例的值，如String类型的打印需要的字符串，需要在XML的property属性标签中配置，那依赖注入是否也是如此呢？

```xml
<bean id="HelloWorld" class="org.didnelpsun.entity.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.entity.User">
    <constructor-arg ref="HelloWorld"/>
</bean>
```

我们可以在这里看出细节，在XML中首先定义一个HelloWorld的实例，也就是说已经实例化一个名为HelloWorld的HelloWorld类实例了，并把它放在实例池中，然后实例化名为Didnelpsun的User类，因为User类需要传入依赖的HelloWorld类，所以使用<span style="color:orange">\<constructor-arg/>标签</span>，并使用<span style="color:orange">ref</span>属性确定依赖类的实例名，来自动注入依赖的实例，也就是从实例池中取出实例化好了的实例。包括实例化以及注入依赖实例，这些都是在Spring容器中自动完成的，这就是依赖注入，也是一种控制反转。

Didnelpsun类依赖HelloWorld类，所以要创建Didnelplsun类必须先新建一个HelloWorld的Bean。

![result1][result1]

### &emsp;多依赖多类传入

如果我们的参数也多个类的依赖或者一种类多个值的依赖，为了不让参数类型混淆，那么我们建议将对应的参数按照传参顺序来配置。

不修改App.java。新建一个HelloWorld2类，直接复制HelloWorld.java，HelloWorld2基本上与HelloWorld一致，只是打印的内容不同变成HelloWorld2Class：

```java
// HelloWorld2.java
package org.didnelpsun.entity;

public class HelloWorld2 {
    public HelloWorld2(){
        System.out.println("HelloWorldClass2");
    }
    public void SayHello(){
        System.out.println("Hello,World!");
    }
}
```

添加一个新构造方法，将User类的依赖成员扩展为两个类，一个是HelloWorld类型的helloWorld，一个是HelloWorld2的helloWorld2：

```java
public User(HelloWorld helloWorld, HelloWorld2 helloWorld2){
    this.helloWorld = helloWorld;
    this.helloWorld2 = helloWorld2;
    System.out.println("UserClass2");
}
```

```xml
<bean id="HelloWorld" class="org.didnelpsun.entity.HelloWorld"/>
<bean id="HelloWorld2" class="org.didnelpsun.entity.HelloWorld2"/>
<bean id="Didnelpsun" class="org.didnelpsun.entity.User">
    <constructor-arg ref="HelloWorld" />
    <constructor-arg ref="HelloWorld2"/>
</bean>
```

![result2][result2]

如果更换HelloWorld和HelloWorld2参数标签的顺序也不会报错，所以证明如果不是一个类的参数，那么传参就没有问题。而如果是同一个类，但是内容不同，那么必然需要按传参顺序来传参。

如是简单属性的传入如String和int类型。也就是以下的传参类型。

### &emsp;固定类型传入（type和value属性）

如果你要传入的依赖类不是类，而是一个包装类，也就是根据基础值而包装好的类，如Integer类等，那么你要如何去实例化这个类呢？显然这是很麻烦且不合理的使用，而type会让你像传入对应的值一样方便。如果你使用type属性显式的指定了构造函数参数的类型，容器也可以使用与简单类型匹配的类型。记住仅支持简单的类型！

```java
// User.java
package org.didnelpsun.entity;

public class User {
    private HelloWorld helloWorld;
    private String words;
    private Integer age;
    private String password;
    public User(HelloWorld helloWorld, String words, String password, Integer age){
        this.helloWorld = helloWorld;
        this.words = words;
        this.password = password;
        this.age = age;
        System.out.println("UserClass");
    }
    public void SayHello(){
        helloWorld.SayHello();
        System.out.println("age:"+age+" password:"+password+" want to say:"+words);
    }
}
```

我们可以使用type来指定传入参数的类型，然后value代表的是值。这个值必须是和传入的参数的顺序是一致的。

```xml
<bean id="HelloWorld" class="org.didnelpsun.entity.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.entity.User">
    <constructor-arg ref="HelloWorld"/>
    <constructor-arg type="java.lang.String" value="Hello!"/>
    <constructor-arg type="java.lang.String" value="password!"/>
    <constructor-arg type="java.lang.Integer" value="19" />
</bean>
```

![result3][result3]

若是不同类型的参数可以调整位置，但是相同类型的参数的相对位置不能变，如这里的words在前，password在后面。

### &emsp;根据索引传参（index属性）

因为type属性当传入大量相同类型的参数时会按照传值顺序来赋值，这样会比较不方便，所以干脆直接用索引的形式来传入参数。

可以将XML配置文件改成这样：

```xml
<bean id="Didnelpsun" class="org.didnelpsun.entity.User">
    <constructor-arg index="0" ref="HelloWorld"/>
    <constructor-arg index="1" value="Hello!"/>
    <constructor-arg index="2" value="password!"/>
    <constructor-arg index="3" value="19" />
</bean>
```

按照参数定义的索引来传入参数，从0开始，对于基本类使用value属性来注入，而对于自定义的依赖类则使用ref属性来注入。

## 设值函数注入

这也是之前我们最经常使用的Setter方法。当容器调用一个无参的构造函数或一个无参的静态factory方法来初始化你的Bean后，通过容器在你的bean上调用设值函数，基于设值函数的DI就完成了。具体的还可以看看[Java的Setter和Getter方法]({% post_url notes/java/2020-03-25-java-setter-and-getter %})。

### &emsp;设置值与依赖（property标签与value、ref属性）

<span style="color:aqua">格式：</span>`<property name="类属性名" ref="依赖实例名"/>` / `<property name="类属性名" value="简单值"/>`

这种设值方式我们之前已经使用过许多次了，我们将原来的构造函数改成设值函数：

```java
// User.java
package org.didnelpsun.entity;

public class User {
    private HelloWorld helloWorld;
    private String words;
    private Integer age;
    private String password;
    public void setHelloWorld(HelloWorld helloWorld){
        this.helloWorld = helloWorld;
    }
    public void setWords(String words){
        this.words = words;
    }
    public void setAge(Integer age){
        this.age = age;
    }
    public void setPassword(String password){
        this.password = password;
    }
    public User(){
        System.out.println("UserClass");
    }
    public void SayHello(){
        helloWorld.SayHello();
        System.out.println("age:"+age+" password:"+password+" want to say:"+words);
    }
}
```

```xml
<bean id="HelloWorld" class="org.didnelpsun.entity.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.entity.User">
    <property name="helloWorld" ref="HelloWorld"/>
    <property name="words" value="Hello!"/>
    <property name="age" value="19"/>
    <property name="password" value="password!"/>
</bean>
```

![result3][result3]

我们还要强调一遍，使用ref属性，表示引用，而这个属性值为要引用的Bean的id，而不是类名。但是这时候的name属性，也就是引用的名字，就应该是依赖类的名字的首字母小写后的驼峰式名字，如果不是这样它将无法找到识别。

### &emsp;p-namespace配置

因为写property标签与value、ref属性会比较麻烦，所以这里有简单的方法，<span style="color:aqua">格式：</span>

```xml
<bean id = "实例名" class = "全限定类名"
    p:依赖属性名-ref="依赖实例ID"
    p:成员属性名="值"
    ...
/>
```

如果你要使用这个还需要在xml文件中的beans标签中加上这个配置：`xmlns:p="http://www.springframework.org/schema/p"`

```xml
<bean id="HelloWorld" class="org.didnelpsun.entity.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.entity.User"
    p:helloWorld-ref = "HelloWorld"
    p:words="Hello!"
    p:age="19"
    p:password="password!"
    >
</bean>
```

![result3][result3]

记住因为是简化的使用，所以命名是比较讲究的，如果是传入依赖类，那么使用方式必须是p:类参数名-ref="实例名"，如果后面不加ref，或者类定义时的参数名不对，都是会报错的。而传入参数主要还是讲究p后面对应的也是定义时的参数名。

### &emsp;内部类传入

在此之前，我们是使用ref属性来传入一个实例的依赖实例，而如果我们不使用这个属性呢？我们可以直接使用property属性来传入依赖类，并使用参数的形式传入实例。

```xml
<bean id="Didnelpsun" class="org.didnelpsun.entity.User">
    <property name="helloWorld">
        <bean id="HelloWorld" class="org.didnelpsun.entity.HelloWorld"/>
    </property>
    <property name="words" value="Hello!"/>
    <property name="age" value="19"/>
    <property name="password" value="password!"/>
</bean>
```

![result4][result4]

将Bean的实例传入来代替了ref属性。参数的name属性代表定义时传入的参数名。也就是说之前是实例化了一个实例，而这个实例和需要这个依赖的实例是同级的，而这时则不是同级的，当要传入的时候再在这个内部创建一个实例传入。所以User先实例化，然后再实例化HelloWorld，跟前面的不同。

### &emsp;构造器注入和设值函数注入

构造器注入和设值函数注入相比，我觉得设值函数的注入更方便。首先设值函数可以在应用程序中重新调用这个函数重新配置实例的属性，而构造器则不行，而且构造器的参数传入必须要按照顺序，而设值函数则只用写出相关的属性名就可以了。虽然设值函数的注入要写许多设值函数，代码量多，但是运用会更灵活，对于不使用的数据可以不用设值。

但是如果一个对象必须配置一个属性，设值函数的注入则不能满足约束，所以就必须使用构造函数来强制要求必须传入某个属性。综上，如果一个对象必须需要某个属性，就使用构造函数配置，其他则使用设值函数配置。

&emsp;

## 注入多值

如果想传入多个值，如List、Set、Map和Properties。那么我们也可以完成，如我们之前已经在表格中显示过的\<list>、\<set>、\<map>、\<props>元素。我们可以直接在XML中定义相关数值，如<span style="color:aqua">格式：</span>

```xml
<property name="addressList">
    <list>
        <value>UK</value>
        <value>France</value>
        <value>USA</value>
        <value>China</value>
    </list>
</property>
<property name="addressSet">
    <set>
        <value>UK</value>
        <value>France</value>
        <value>USA</value>
        <value>China</value>
    </set>
</property>
<property name="addressMap">
    <map>
        <entry key="1" value="UK"/>
        <entry key="2" value="France"/>
        <entry key="3" value="USA"/>
        <entry key="4">
            <value>China</value>
        </entry>
    </map>
</property>
<property name="addressProp">
    <props>
        <prop key="one">UK</prop>
        <prop key="two">France</prop>
        <prop key="three">USA</prop>
        <prop key="four">China</prop>
    </props>
</property>
```

元素|描述
:--:|:--
\<list>|它有助于连接数据，如注入一列值，允许重复。
\<set>|它有助于连接一组值，但不能重复。
\<map>|它可以用来注入名称-值对的集合，其中名称和值可以是任何类型。
\<props>|它可以用来注入名称-值对的集合，其中名称和值都是字符串类型。

同时注意，如果是数据结构类型一致，那么不同的子标签可以互换，如值集合类型\<list>、\<array>、\<set>三个标签可以互换，也就是说如果是set类型的参数，你可以使用上面这三个子标签来传入对应值，而不是只能使用\<set>。同理键值对类型\<map>和\<props>标签也是如此。

&emsp;

## 空值与null

一般的情况下，如果你没有传入参数，它会默认传入null值。如果你使用的字符串，那么它会打印null，这看起来很不舒服，所以我们可以将空值传入，也就是将value赋值为""。这样它会传入空字符串。

而在某种情况下我们要传入null值怎么办？我们可以使用\<null/>来解决：`<property name = "参数名"><null/></property>`

[案例五XML配置下的依赖注入：Spring/demo5_di_xml](https://github.com/Didnelpsun/Spring/tree/master/demo5_di_xml)。

[result1]:data:image/png;base64,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

[result2]:data:image/png;base64,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

[result3]:data:image/png;base64,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

[result4]:data:image/png;base64,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
