---
layout: post
title: "自动装配"
date: 2020-03-27 10:57:02 +0800
categories: notes spring base
tags: Spring 基础 autowire byName byType constructor default @Autowired @Qualifier @Resourse @Inject @Named
excerpt: "自动装配相关属性与注释"
---

依赖注入和自动装配息息相关。依赖注入的本质就是装配，装配是依赖注入的具体行为。依赖注入是两个相互关联的Bean，我们自己加一个Bean加到另外一个Bean的依赖中。而自动装配就是我们直接定义两个Bean或者使用注释，Spring自动添加对应的依赖。自动装配其实是依赖注入的升级版，为了简化依赖注入的配置而生成的。

依赖注入有两种形式：构造器注入和Setter注入。也就是我们在XML中写的一堆\<bean></bean>，我们每一个依赖Bean就要写一个实例，如果Bean太多我们还这样写就会非常麻烦，更何况我们还有把有关联的Bean装配起来，一旦Bean很多，就不好维护了。

为此Spring使用自动装配解决这个问题，开发人员不用关心具体装配哪个Bean的引用，识别工作由Spring来完成，因此一般配有自动监测来和自动装配配合完成。自动装配其实就是将依赖注入"自动化"的一个简化配置的操作。也就是说我们只用实例化我们在应用程序中要使用的实例，而它依赖的实例将由Spring来实例化，如之前一直在使用的HelloWorld类。

自动配置有两大类方式，跟之前的依赖注入和实例化一样，一种是XML，一种是注解。

XML的\<bean>配置中通添加autowire属性实现四种形式的自动装配，byName, byType, constructor, autodetect。byName就是会将与属性的名字一样的Bean进行装配。byType就同属性一样类型的Bean进行装配。constructor就是通过构造器来将类型与参数相同的Bean进行装配。autodetect是constructor与byType的组合，会先进行constructor，如果不成功，再进行byType。

<!-- Spring2.5之后提供了注解方式的自动装配。但是要使用这些注解，需要在配置文件中配置<context:annotation-config />。只有加上这一配置，才可以使用注解进行自动装配，默认情况下基于注解的装配是被禁用的。 -->

常用的自动装配注解有以下几种：@Autowired，@Resource，@Inject，@Qualifier，@Named。

<span style="color:orange">注意：</span>@Autowired注解是byType类型的，因此会将接口的实现类取代接口，自动装配给控制类。

不过自动装配也有比较大的问题：

当自动装配始终在同一个项目中使用时，它的效果最好。如果通常不使用自动装配，它可能会使开发人员混淆的使用它来连接只有一个或两个Bean定义。不过，自动装配可以显著减少需要指定的属性或构造器参数，但你应该在使用它们之前考虑到自动装配的局限性和缺点。

限制|描述
:--:|:--
重写的可能性|你可以使用总是重写自动装配的\<constructor-arg>和\<property>设置来指定依赖关系。
原始数据类型|你不能自动装配所谓的简单类型包括基本类型，字符串和类。
混乱的本质|自动装配不如显式装配精确，所以如果可能的话尽可能使用显式装配。

## autowire属性

### &emsp;搭建XML环境

使用[标准Spring项目XML模板：Spring/basic_xml](https://github.com/Didnelpsun/Spring/tree/master/basic_xml)。

在entity下新建一个User类：

```java
// User.java
package org.didnelpsun.entity;

public class User {
    private String name;
    private Integer age;
    private HelloWorld helloWorld;
    public User(){
        this.name = "";
        this.age = 0;
        this.helloWorld = null;
        System.out.println("UserClass");
    }
    public User(int age){
        this();
        this.age = age;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public HelloWorld getHelloWorld() {
        return helloWorld;
    }
    public void setHelloWorld(HelloWorld helloWorld) {
        this.helloWorld = helloWorld;
    }
}
```

由于User类实例依赖HelloWorld类实例，所以XML配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id = "HelloWorld" class="org.didnelpsun.entity.HelloWorld">
        <property name="words" value="hi" />
    </bean>
    <bean id="User" class="org.didnelpsun.entity.User">
        <property name="helloWorld" ref="HelloWorld"></property>
    </bean>
</beans>
```

定义两个Bean一个是HelloWorld一个是User，如果我们要实现依赖，那么我们要使用ref属性来配置。

```java
// App.java
package org.didnelpsun;
// 引入依赖类HelloWorld
import org.didnelpsun.entity.HelloWorld;
// 引入ApplicationContext容器
import org.springframework.context.ApplicationContext;
// 引入支持XML配置的context容器
import org.springframework.context.support.ClassPathXmlApplicationContext;

//项目入口
public class App
{
    //获取私有属性，这个属性是应用文档属性
    private static ApplicationContext welcomeContext;
    public static void main(String args[]){
        //将Spring beans配置文件引入，使里面的配置可以被使用
        // 因为项目中我们已经标注了Rosource文件夹，所以默认会去对应的文件夹中寻找配置文件
        // 并让ClassPathXmlApplicationContext根据配置生成对应的实例
        welcomeContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        // 从context容器中取出名为HelloWorldBean的实例，转型为HelloWorld
        User user = (User) welcomeContext.getBean("User");
        user.getHelloWorld().saySomeThing();
    }
}
```

我们也可以不在App.java中实例化这个HelloWorld类。这些是不影响对应的依赖的。如果我们不在XML中配置依赖，也就是删除`<property name="helloWorld" ref="HelloWorldBean"></property>`，然后再加上`user.setHelloWorld(new HelloWorld());`也可以配置成功依赖。但是你要注意这是因为在应用程序中配置的，所以这种实例的依赖不是由Spring容器控制的，而是由应用程序控制的，所以你需要关注这些依赖的创建和销毁，当然这是不被建议使用的。

### &emsp;相关参数

即通过autowire属性替代显式的ref依赖设置。让Spring自己根据依赖关系去找对应的Bean。

名称|说明
:--:|:--
no|这是默认的设置，它意味着没有自动装配，你应该使用显式的Bean引用来连线。你不用为了连线做特殊的事。在依赖注入章节你已经看到这个了。
byName|由属性名自动装配。Spring容器看到在XML配置文件中Bean的自动装配的属性设置为byName。然后尝试匹配，并且将它的属性与在配置文件中被定义为相同名称的Beans的属性进行连接。
byType|由属性数据类型自动装配。Spring容器看到在XML配置文件中Bean的自动装配的属性设置为byType。然后如果它的类型匹配配置文件中的一个确切的Bean名称，它将尝试匹配和连接属性的类型。如果存在不止一个这样的Bean，则一个致命的异常将会被抛出。
constructor|类似于byType，但该类型适用于构造函数参数类型。如果在容器中没有一个构造函数参数类型的Bean，则一个致命错误将会发生。
autodetect|Spring首先尝试通过constructor使用自动装配来连接，如果它不执行，Spring尝试通过byType来自动装配。

可以使用byType或者constructor自动装配模式来连接数组和其他类型的集合。

但是实际上这种XML配置并不会经常使用！因为配起来和一般的方法一样，且有一定的限制！

#### &emsp;&emsp;1. byName

按定义来说这种模式由属性名称指定自动装配。Spring容器看作Beans，在XML配置文件中Beans的auto-wire属性设置为byName。然后，它尝试将它的<span style="color:red">属性类名，即id或name</span>与配置文件中定义为相同名称的Beans进行匹配和连接。如果找到匹配项，它将注入这些Beans，否则，它将抛出异常。

Spring容器会按照set属性的名称去容器中查找同名的Bean对象，然后将查找到的对象通过set方法注入到对应的Bean中，未找到对应名称的Bean对象则set方法不进行注入。需要注入的set属性的名称和被注入的Bean的名称必须一致。

针对上面的例子，我们应该如何改动呢？注意这个属性值为byName是依赖名字来查找对应的实例的。XML中将参数的ref那行删除，然后改成：`<bean id="User" class="org.didnelpsun.entity.User" autowire="byName" />`，并且一定要注意改变<span style="color:orange">实例名字</span>，即将HelloWorld的Bean实例名字改为helloWorld。即Bean的id必须跟依赖的成员名相同。

```xml
<bean id = "helloWorld" class="org.didnelpsun.entity.HelloWorld">
    <property name="words" value="hi" />
</bean>
<bean id="User" class="org.didnelpsun.entity.User" autowire="byName" />
```

但是实际上经过测试这个名字是依赖的类的小驼峰式名字而不是成员名。

#### &emsp;&emsp;2. byType

定义说这种模式由属性类型指定自动装配。Spring容器看作Beans，在XML配置文件中Beans的autowire属性设置为byType。然后，如果它的<span style="color:red">类名，即class</span>恰好与配置文件中beans类型名称中的一个相匹配，它将尝试匹配和连接它的属性。如果找到匹配项，它将注入这些Beans，否则，它将抛出异常。

如果你将上面的byName属性变为byType属性，那么也可以运行。原因上面已经说了。但是你要注意了，如果存在多个HelloWorld实例，那么它会报错，因为byType只能拥有一个类的实例，如果有多个同一类的实例，那么它就不知道找哪个实例了，无论实例名是什么它都会报错。

#### &emsp;&emsp;3. constructor

这种模式与byType非常相似，但它应用于构造器参数。Spring容器看作Beans，在XML配置文件中Beans的autowire属性设置为constructor。然后，它尝试把它的构造函数的参数与配置文件中Beans名称中的一个进行匹配和连线。如果找到匹配项，它会注入这些Bean，否则，它会抛出异常。即根据构造方法的参数的数据类型，进行byType模式的自动装配。

```xml
<bean id="User" class="org.didnelpsun.entity.User" autowire="constructor" />
```

此时会报错，因为这个User实例配置下使用的构造函数没有带HelloWorld参数的构造方法，所以默认使用无参构造函数。所以helloWorld被定义为null，所以必须定义一个带有HelloWorld参数的方法：

```java
public User(HelloWorld helloWorld){
    this();
    this.helloWorld = helloWorld;
}
```

同时你要注意，如果你在类中加入了构造函数，那么无论你使用什么方式来实例化这个类，你都需要先用构造函数来构造这个实例，都需要先满足构造函数所需要的参数，否则会报错：警告: Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'UserBean' defined in class path resource \[SpringBeans.xml]: Instantiation of bean failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate \[org.didnelpsun.test.User]: No default constructor found; nested exception is java.lang.NoSuchMethodException: org.didnelpsun.test.User.\<init>()

#### &emsp;&emsp;4. default

由上级标签\<beans>的default-autowire属性确定，即默认自动装配的方式。在配置bean时，\<bean>标签中Autowire属性的优先级比其上级标签高，即是说，如果在上级标签中定义default-autowire属性为byName，而在\<bean>中定义为byType时，Spring IoC容器会优先使用\<bean>标签的配置。

[案例六autowried属性自动装配：Spring/demo6_automatic_assembly_autowried](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_autowried)。

&emsp;

<!-- ## 自动扫描标签

使用[Spring项目模板文件：spring/spring](https://github.com/Didnelpsun/notes/tree/master/spring/spring)。

注解连线在默认情况下在Spring容器中不打开。因此，在可以使用基于注解的连线之前，我们将需要在我们的Spring配置文件中启用它：`<context:annotation-config/>`

在此之前，如果我们要使用这些注释应该还要配置好，要使用自动扫描标签来扫描对应的注释，因为它是默认关闭的，如果不开启则注释是不会有作用的。

### &emsp;\<context:annotation-config/>

一般采用的是这个标签，但是如果你加入这个标签后它会报错，说The prefix "context" for element "context:annotation-config" is not bound。

这是因为xml配置文件头部缺少`xmlns:context="http://www.springframework.org/schema/context"`。但是它还是会报错说虽然你配置的很完善但是不知道指向是什么。完整的代码如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans-4.2.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context-4.2.xsd">
    <context:annotation-config/>
</beans>
```

我们使用的时候只用在里面加内容就可以了。如果某个类的头上带有特定的注解@Component、@Repository、@Service或@Controller，就会将这个对象作为Bean注入进spring容器。

### &emsp;\<context:component-scan/>

<span style="color:aqua">格式：</span>`<context:component-scan base-package="扫描的包名"/>`。如我的就是\<context:component-scan base-package="org.didnelpsun" />。

我们推荐使用的是这个标签，因为这个标签功能更多。它提供两个子标签：\<context:include-filter>和\<context:exclude-filter>。各代表引入和排除的过滤器。

而\<context:annotation-config/>仅能够在已经在已经注册过的bean上面起作用。对于没有在spring容器中注册的bean，它并不能执行任何操作。但是\<context:component-scan/>自动将带有@component,@service,@Repository等注解的对象注册到spring容器中的功能。  

因为\<context:annotation-config>和\<context:component-scan>同时存在的时候，前者会被忽略。如@autowire，@resource等注入注解只会被注入一次！

&emsp; -->

## @Autowired

你会发现XML的自动装配并没有我们想象的好用。不谈对于一些实例命名的约束下甚至不如按原来的ref属性，而且基本上不会简便代码。实际上我们在实际运用中也不会用这个属性，而更多是采用的注释的方式，因为这种方式更简便。

由Spring提供，通过@Autowired的使用可以应用到Bean属性的Setter方法，非Setter方法，构造函数和属性。在使用@Autowired之前，我们对一个Bean配置起属性时，是用的`<property name="属性名" value=" 属性值"/>`。当Spring发现@Autowired注解时，将自动在代码上下文中找到与其匹配（默认是类型匹配）的Bean，并自动注入到相应的地方去。

@Autowired注释对在哪里和如何完成自动连接提供了更多的细微的控制。可以在Setter方法中被用于自动连接Bean，就像@Autowired注释，容器，一个属性或者任意命名的可能带有多个参数的方法。它会默认使用byType类型的识别。

### &emsp;@AutowiredXML混合模式

使用之前[案例六autowried属性自动装配：Spring/demo6_automatic_assembly_autowried](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_autowried)，在XML文件配置中修改两个实例：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <!--用于扫描文件包下所有组件，作用等同于@ComponentScan-->
    <context:component-scan base-package="org.didnelpsun" />
    <bean id = "HelloWorld" class="org.didnelpsun.entity.HelloWorld">
        <property name="words" value="hi" />
    </bean>
    <bean id="User" class="org.didnelpsun.entity.User" />
</beans>
```

请注意这里再也没有说明HelloWorld类和User类两个实例的依赖关系了。

直接在要装配的属性的Setter方法上添加@Autowired注解：

```java
// User.java
package org.didnelpsun.entity;

import org.springframework.beans.factory.annotation.Autowired;

public class User {
    private String name;
    private Integer age;
    private HelloWorld helloWorld;
    public User(){
        this.name = "";
        this.age = 0;
        this.helloWorld = null;
        System.out.println("UserClass");
    }
    public User(int age){
        this();
        this.age = age;
    }
    public User(HelloWorld helloWorld){
        this();
        this.helloWorld = helloWorld;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public HelloWorld getHelloWorld() {
        return helloWorld;
    }
    @Autowired
    public void setHelloWorld(HelloWorld helloWorld) {
        this.helloWorld = helloWorld;
    }
}
```

因为我们要依赖的类的Setter函数是setHelloWorld，所以就在它上面加上@Autowired。

这里在Setter方法上加注释，但是如果使用构造函数，则<span style="color:red">构造器下如果你不加注释也可以！</span>这是因为扫描标签会扫描所有实例，然后根据构造器来加入依赖（而setter函数则不会这样做）。但是你要注意加入扫描标签，且在与XML混合模式下要加入依赖实例的标签。

### &emsp;@Autowired纯注释模式

在XML与注释混合的模式下，我们可以看到我们使用@Autowired的流程，首先在XML中配置好资源和所有要用到的实例，然后在依赖的类的setter方法上加上@Autowired就可以了。这样我们就不用管哪个类依赖哪个类，而只用把所有的类都实例化就可以了。

但是有时候我们也会觉得很麻烦，我们还要知道哪些类需要用到，如果不用到的类要删掉，那么我们有没有方法不用管哪些类被使用到呢？那就是使用纯注释的方式。即@Autowired与@Compontent以及@CompontentScan混合。

#### &emsp;&emsp;Setter函数

修改Java文件：

```java
// User.java
package org.didnelpsun.entity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class User {
    private String name;
    private Integer age;
    private HelloWorld helloWorld;
    public User(){
        this.name = "";
        this.age = 0;
        this.helloWorld = null;
        System.out.println("UserClass");
    }
    public User(int age){
        this();
        this.age = age;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public HelloWorld getHelloWorld() {
        return helloWorld;
    }
    @Autowired
    public void setHelloWorld(HelloWorld helloWorld) {
        this.helloWorld = helloWorld;
    }
}
```

```java
// App.java
package org.didnelpsun;
// 引入依赖类HelloWorld
import org.didnelpsun.entity.HelloWorld;
// 引入ApplicationContext容器
import org.didnelpsun.entity.User;
import org.springframework.context.ApplicationContext;
// 引入支持注释类的context容器
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
// 引入ComponentScan注释
import org.springframework.context.annotation.ComponentScan;

@ComponentScan
//项目入口
public class App
{
    // 获取私有属性，这个属性是应用文档属性
    private static ApplicationContext welcomeContext;
    public static void main(String[] args){
        // 表明实例后的对象都将放到welcomeContext的容器中，后面这一串的方法是
        // 利用注释的config来构造context容器的意思，参数是主类名.class，即获取App这个类创建容器
        welcomeContext = new AnnotationConfigApplicationContext(App.class);
        User user = (User) welcomeContext.getBean(User.class);
        user.getHelloWorld().setWords("hi");
        user.getHelloWorld().saySomeThing();
    }
}
```

直接在对应的地方加上@Autowired就可以了。并注意由于是自动装配，所以需要把User的依赖类HelloWorld也加上@Component注解，否则Spring找不到HelloWorld实例。

#### &emsp;&emsp;属性与构造器

我们之前是在Setter方法上注释的，而如果我们将注释放在需要注入的属性上也是没有问题的，但是不建议在字段上注入：

```java
@Autowired
private HelloWorld helloWorld;
```

在带有依赖参数的构造函数上加注释也是可以的：

```java
@Autowired
public User(HelloWorld helloWorld){
    this();
    this.helloWorld = helloWorld;
}
```

#### &emsp;&emsp;required=false

现在有两种情况：

假如XML文件的bean标签里面有property，而对应的Java文件中里面却去掉了属性的Getter/Setter，并使用@Autowired注解标注这两个成员属性会怎么样？答案是Spring会按照XML优先的原则去Java文件中寻找这两个属性的Getter/Setter，导致的结果就是找不到对应的Getter/Setter，从而不能把property进行赋值，从而初始化bean报错。因为XML的配置是在后置处理器前面处理的。如果属性找不到又不想让Spring容器抛出异常，就是显示null，那应该怎么做呢？

又假如你要设置一个类，比如Person类，有一个属性Home来表示房子的住址，但是并不是所有人都有住址，所以这个依赖类并不是必要的，所以我们就想如果我们不传入依赖它也不会报错，我们又应该如何做呢？

默认情况下，@Autowired注释意味着依赖是必须的，它类似于@Required注释，然而，你可以使用@Autowired的required=false选项关闭默认行为。

比如我们在User.java中修改：

```java
private static String name;
@Autowired
public void setUsername(String name){
    name = name;
}
```

这时候就会报错，因为你没有传入一个String类型的参数进入。如果你不想将这个参数作为必要传入的参数，可以加上required=false（但是我觉得这个并不是必要，你完全可以不加注释，这样它就不会报错，并且直接输出null）。

[案例六@Autowried标签自动装配：Spring/demo6_automatic_assembly_@Autowried](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_@Autowried)。

<!-- &emsp;

## @Named

由JavaEE提供，使用方式和@Qualifier配合。@Name的注释就等价于name属性配置，用来给组件添加名字。 -->

&emsp;

## @Qualifier

由Spring提供。@Autowired按类型装配Spring Bean。可能会有这样一种情况，当你创建多个具有相同类型的Bean时，并且想要用一个属性只为它们其中的一个进行装配，在这种情况下，你可以使用@Qualifier注释和@Autowired注释通过指定哪一个真正的Bean将会被装配来消除混乱。（在autowired属性中是使用byName这种设置来避免的）

使用[标准Spring项目注释模板：Spring/basic_annotation](https://github.com/Didnelpsun/Spring/tree/master/basic_annotation)。

并添加一个User类：

```java
// User.java
package org.didnelpsun.entity;

import org.springframework.stereotype.Component;

@Component
public class User {
    private String name;
    private Integer age;
    private HelloWorld helloWorld;
    public User(){
        this.name = "";
        this.age = 0;
        this.helloWorld = null;
        System.out.println("UserClass");
    }
    public User(int age){
        this();
        this.age = age;
    }
    public User(HelloWorld helloWorld){
        this();
        this.helloWorld = helloWorld;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public HelloWorld getHelloWorld() {
        return helloWorld;
    }
    @Autowried
    public void setHelloWorld(HelloWorld helloWorld) {
        this.helloWorld = helloWorld;
    }
}
```

修改App.java：

```java
// App.java
package org.didnelpsun;
// 引入依赖类HelloWorld
import org.didnelpsun.entity.HelloWorld;
// 引入ApplicationContext容器
import org.didnelpsun.entity.User;
import org.springframework.context.ApplicationContext;
// 引入支持注释类的context容器
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
// 引入ComponentScan注释
import org.springframework.context.annotation.ComponentScan;

@ComponentScan
//项目入口
public class App
{
    // 获取私有属性，这个属性是应用文档属性
    private static ApplicationContext welcomeContext;
    public static void main(String[] args){
        // 表明实例后的对象都将放到welcomeContext的容器中，后面这一串的方法是
        // 利用注释的config来构造context容器的意思，参数是主类名.class，即获取App这个类创建容器
        welcomeContext = new AnnotationConfigApplicationContext(App.class);
        // 使用getBean方法来从容器中获取实例，参数为想要取得的实例类名.class，通过HelloWorld类来获取容器中的Bean
        User user = welcomeContext.getBean(User.class);
        user.getHelloWorld().setWords("hi");
        user.getHelloWorld().saySomeThing();
    }
}
```

此时自动装配是没有问题的。

而如果我们想在App.java中将`user.getHelloWorld().setWords("hi");`这条语句删掉，并重新定义一个Hi类继承HelloWorld类并装配到User类中：

```java
// Hi.java
package org.didnelpsun.entity;

import org.springframework.stereotype.Component;

@Component
public class Hi extends HelloWorld{
    public Hi(){
        System.out.println("HiClass");
        this.setWords("hi");
    }
}
```

此时User会调用HelloWorld实例而不会调用Hi实例，因为@AutoWried注解是byType的，所以会优先HelloWorld。

那么如何让User使用Hi实例呢？

### &emsp;@Qualifier纯注释模式

首先给HelloWorld和Hi实例取名字，即在@Component注解上添加名字：`@Component("HelloWorld")`和`@Component("Hi")`。

然后在User.java的@Autowried下添加`@Qualifier("Hi")`，这样Hi就会被当做HelloWorld参数被注入User里了。

### &emsp;@QualifierXML混合模式

在resources下添加一个SpringBean.xml，并添加三个Bean：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <!--用于扫描文件包下所有组件，作用等同于@ComponentScan-->
    <context:component-scan base-package="org.didnelpsun" />
    <bean id = "HelloWorld" class="org.didnelpsun.entity.HelloWorld">
        <property name="words" value="hi"/>
    </bean>
    <bean id = "Hi" class="org.didnelpsun.entity.Hi" />
    <bean id="User" class="org.didnelpsun.entity.User">
    </bean>
</beans>
```

将所有的@ComponentScan、@Component删除，并修改App.java：

```java
welcomeContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
User user = (User) welcomeContext.getBean("User");
user.getHelloWorld().saySomeThing();
```

不修改@Qualifier和@Autowried，运行也正确。

<span style="color:orange">注意：</span>使用纯注解模式时Spring的@AutoWried会根据最接近依赖HelloWorld类来确定实例，所以纯注解模式下虽然有HelloWorld实例和继承HelloWorld的Hi实例，但是Spring默认会选择HelloWorld实例而不是Hi实例。但是现在使用XML混合模式，已经创建了HelloWorld和Hi实例，根据类型HelloWorld和Hi都是HelloWorld类的实例，所以此时会报错因为不知道选哪个。最根本的原因是使用注解是隐式地声明实例，Spring会根据注释和依赖关系创建实例，所以此时实例池只有User和HelloWorld实例，而XML混合模式下Hi、User、HelloWorld实例都是已经显式声明，已经被Spring创建在Bean池中，然后Spring再根据Bean池中的Bean池来构建对应依赖关系，而这时由于存在两个依赖的类所以会报错。

### &emsp;单独使用@Qualifier

我们上面也已经使用过了@Qualifier注解，但是我们可以注意到，我们使用这个注解都是伴随着@Autowired注解一同使用的。因为在给类成员注入时不能单独使用，必须配合@Autowired，但是注入方法参数时可以单独使用。

```java
@Autowired
public void setHelloWorld(@Qualifier("HelloWorld") HelloWorld helloWorld){
    this.helloWorld = helloWorld;
}
```

单独使用时将@Qualifier放到方法参数前。

[案例六@Qualifier标签自动装配：Spring/demo6_automatic_assembly_@Qualifier](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_@Qualifier)。

&emsp;

## @Primary

当我们使用自动配置的方式装配Bean时，如果这个Bean有多个候选者，假如其中一个候选者具有@Primary注解修饰，该候选者会被选中，作为自动配置的值。

&emsp;

## @Resource

由JavaEE提供，是JSR250中的规范，你可以在字段中或者Setter方法中使用@Resource注释，它和在Java EE5中的运作是一样的。基本和@Autowired用法一致。通过这个注释也可以取代@Autowired和@Qualifier很多用法。

1. @Resource后面没有任何内容，默认通过name属性去匹配Bean，找不到再按type去匹配。
2. 指定了name或者type则根据指定的类型去匹配Bean。
3. 指定了name和type则根据指定的name和type去匹配Bean，任何一个不匹配都会报错。

Spring中找不到@Resource注解是因为@Resource注解是javax.annotacion包下的，属于java的扩展包，在标准JDK中没有。解决方法：添加javax.annotation-api。

```xml
<!-- https://mvnrepository.com/artifact/javax.annotation/javax.annotation-api -->
<dependency>
    <groupId>javax.annotation</groupId>
    <artifactId>javax.annotation-api</artifactId>
    <version>1.3.2</version>
</dependency>
```

继续使用@Qualifier的案例代码，并把@Qualifier相关的全部删掉，包括SpringBean.xml以及Java文件中的相关注释。

```java
// App.java
package org.didnelpsun;
// 引入依赖类HelloWorld
import org.didnelpsun.entity.HelloWorld;
// 引入ApplicationContext容器
import org.didnelpsun.entity.User;
import org.springframework.context.ApplicationContext;
// 引入支持注释类的context容器
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
// 引入ComponentScan注释
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.support.ClassPathXmlApplicationContext;

@ComponentScan
//项目入口
public class App
{
    // 获取私有属性，这个属性是应用文档属性
    private static ApplicationContext welcomeContext;
    public static void main(String[] args){
        // 表明实例后的对象都将放到welcomeContext的容器中，后面这一串的方法是
        // 利用注释的config来构造context容器的意思，参数是主类名.class，即获取App这个类创建容器
        welcomeContext = new AnnotationConfigApplicationContext(App.class);
        // 使用getBean方法来从容器中获取实例，参数为想要取得的实例类名.class，通过HelloWorld类来获取容器中的Bean
        User user = (User) welcomeContext.getBean(User.class);
        user.getHelloWorld().saySomeThing();
    }
}
```

```java
// HelloWorld.java
package org.didnelpsun.entity;
// 引入Components注释
import org.springframework.stereotype.Component;

// 这种标注被放在被管理和引用的类上
@Component("HelloWorld")
public class HelloWorld {
    // 默认构造函数，一旦HelloWorld类被实例化就会被调用
    public HelloWorld () {
        System.out.println("HelloWorldClass");
    }
    // 私有变量words
    private String words;
    private String user = "Didnelpsun";
    // 如果我们要对这个类的属性赋值，那么一定要是set开头，这是符合settergetter规范的
    // 如果需要参数就要传入参数
    public void setWords(String word){
        this.words = word;
    }
    // 定义方法调用对应属性并输出
    public void saySomeThing(){
        System.out.println(this.user +" says "+ this.words);
    }
}
```

```java
// Hi.java
package org.didnelpsun.entity;

import org.springframework.stereotype.Component;

@Component("Hi")
public class Hi extends HelloWorld{
    public Hi(){
        System.out.println("HiClass");
        this.setWords("hi");
    }
}
```

### &emsp;1. @Resource默认

```java
// User.java
package org.didnelpsun.entity;

import org.springframework.stereotype.Component;
import javax.annotation.Resource;

@Component
public class User {
    private String name;
    private Integer age;
    private HelloWorld helloWorld;
    public User(){
        this.name = "";
        this.age = 0;
        this.helloWorld = null;
        System.out.println("UserClass");
    }
    public User(int age){
        this();
        this.age = age;
    }
    public User(HelloWorld helloWorld){
        this();
        this.helloWorld = helloWorld;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public HelloWorld getHelloWorld() {
        return helloWorld;
    }
    @Resource
    public void setHelloWorld(HelloWorld helloWorld) {
        this.helloWorld = helloWorld;
    }
}
```

这时发现会报错，因为有两个HelloWorld实例，一个是HelloWorld一个是Hi。（如果把HelloWorld实例的@Component注解去掉则只有一个实例从而正确）

### &emsp;2. type属性

如果我们传入的参数是类型，则应该使用type属性，<span style="color:aqua">格式：</span>`@Resource(type = 类完整路径.class)`。

<!-- ### &emsp;3. description属性

而我们使用description属性，和上面的使用方式是差不多的，但是这个路径将以字符串的形式来呈现，并使用的是相对路径，后面也没有class后缀。<span style="color:aqua">格式：</span>`@Resource(description = "相对路径")`，如我的是`@Resource(description = "Hi")`，因为User类与Hi类同级。 -->

### &emsp;3. name属性

而上面几个都不能解决我们多个同类实例的问题，我们应该如何做呢？使用name属性，<span style="color:aqua">格式：</span>`@Resource(name = "实例名")`：

```java
// User.java
package org.didnelpsun.entity;

import org.springframework.stereotype.Component;
import javax.annotation.Resource;

@Component
public class User {
    private String name;
    private Integer age;
    private HelloWorld helloWorld;
    public User(){
        this.name = "";
        this.age = 0;
        this.helloWorld = null;
        System.out.println("UserClass");
    }
    public User(int age){
        this();
        this.age = age;
    }
    public User(HelloWorld helloWorld){
        this();
        this.helloWorld = helloWorld;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public HelloWorld getHelloWorld() {
        return helloWorld;
    }
    @Resource(name = "Hi")
    public void setHelloWorld(HelloWorld helloWorld) {
        this.helloWorld = helloWorld;
    }
}
```

并且name和type属性可以同时使用。

### &emsp;@Autowire与@Resource

@Autowire与@Resource的不同：

+ @Autowired默认按byType自动装配，而@Resource默认byName自动装配。
+ @Autowired只包含一个参数：required，表示是否开启自动准入，默认是true。而@Resource包含七个参数，其中最重要的两个参数是：name和type。
+ @Autowired如果要使用byName，需要使用@Qualifier一起配合。而@Resource如果指定了name，则用byName自动装配，如果指定了type，则用byType自动装配。
+ @Autowired能够用在：构造器、方法、参数、成员变量和注解上，而@Resource能用在：类、成员变量和方法上。
+ @Autowired是spring定义的注解，而@Resource是JSR-250定义的注解。

@Autowired的装配顺序：

![@Autowired的装配顺序][@Autowired]

@Resource的装配顺序：

如果同时指定了name和type：

![@Resource的name和type装配顺序][@Resource1]

如果只指定name：

![@Resource的name装配顺序][@Resource2]

如果只指定type：

![@Resource的type装配顺序][@Resource3]

如果没有指定就默认顺序：

![@Resource的默认装配顺序][@Resource4]

[案例六@Resource标签自动装配：Spring/demo6_automatic_assembly_@Resource](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_@Resource)。

&emsp;

## @Inject

由JavaEE提供，JSR330的规范，默认是按照类型匹配。如果要按照名字来匹配需要使用@Named。需要导入javax.inject.Inject的jar包 ，才能实现注入。

因为JRE无法决定构造方法注入的优先级，所以规范中规定类中只能有一个构造方法带@Inject注解。

如果是字段上注释不能是final类型，而在方法上注释不能是抽象方法。

你会在[Maven中心仓库](https://mvnrepository.com/artifact/org.glassfish.hk2.external/javax.inject)找到。点击对应的版本，并找到maven就可以得到代码：

```xml
<!-- https://mvnrepository.com/artifact/org.glassfish.hk2.external/javax.inject -->
<dependency>
    <groupId>org.glassfish.hk2.external</groupId>
    <artifactId>javax.inject</artifactId>
    <version>2.5.0-b62</version>
</dependency>
```

然后粘贴到pom.xml重新导入就可以了。

因为是按照依赖参数类型来匹配的，所以如果传入的参数类型是Hi类型就不会报错，因为Hi类型的实例就只有一个，而HelloWorld类型有两个。这时候你就需要@Name的注释了。

&emsp;

## 总结

### &emsp;自动装配注释使用位置

1. 属性字段域
2. 构造方法
3. 设值函数

属性字段域就是我们要注入的相关属性，就比如我们之前的HelloWorld hello。我们就可以把它改成`@Autowired private HelloWorld hello;`。请注意因为是依赖注入，所以这个属性字段一定不能是final类型。且构造方法一定是非抽象的。

+ 从来源：
  1. @Autowired是Spring自带的，通过AutowiredAnnotationBeanPostProcessor类实现的依赖注入，Spring属于第三方的。
  2. @Resource是JSR250规范的实现，J2EE的注解，在javax.annotation包下，根据导入注解的包名就可以知道。J2EE是Java自己的东西。因此，建议使用@Resource注解，以减少代码和Spring之间的耦合。
  3. @Inject是JSR330规范实现的，需要导入javax.inject.Inject jar包 ，才能实现注入。
+ 从作用域：
  1. @Autowired可以作用在constructor、method、parameter、field、annotation_type上。
  2. @Resource可以作用method、field、type上。
  3. @Inject可以作用constructor、method、field上。
+ 从默认装配方法：
  1. @Autowired默认按照byType方式进行bean匹配。
  2. @Resource默认根据属性名称(byName)方式进行自动装配。如果有多个类型一样的Bean候选者，则可以通过name指定进行注入。
  3. @Inject是根据类型进行自动装配的，如果需要按名称进行装配，则需要配合@Named。
+ @Autowired如果有多个类型一样的Bean候选者，需要指定按照名称（byName）进行装配，则需要配合@Qualifier。指定名称后，如果Spring IOC容器中没有对应的组件Bean抛出NoSuchBeanDefinitionException。也可以将@Autowired中required配置为false，当找不到相应bean的时候，系统不会抛异常。
+ @Autowired、@Inject用法基本一样，不同的是@Inject没有一个request属性。

&emsp;

## 基本类型与复杂类型装配

上面的注解用于注入其他Bean类型，而@Value注解之前用过，用户注入基本数据类型与String类型。属性为value。可以使用SpEL即Spring的EL表达式（${表达式}）。

而对于复杂类型如Set这种就只能使用XML方式注入，注解方式不行。

[@Autowired]:data:image/png;base64,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

[@Resource1]:data:image/png;base64,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

[@Resource2]:data:image/png;base64,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

[@Resource3]:data:image/png;base64,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

[@Resource4]:data:image/png;base64,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
