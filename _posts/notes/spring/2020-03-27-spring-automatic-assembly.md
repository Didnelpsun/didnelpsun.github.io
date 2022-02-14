---
layout: post
title: "自动装配"
date: 2020-03-27 10:57:02 +0800
categories: notes spring base
tags: Spring 基础 autowire byName byType constructor default @Autowired @Qualifier @Resourse @Inject @Named
excerpt: "autowire属性与注释"
---

依赖注入和自动装配息息相关。依赖注入的本质就是装配，装配是依赖注入的具体行为。

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

## XML方式

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

### &emsp;autowire属性

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

[案例六XML方式自动装配：Spring/demo6_automatic_assembly_xml](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_xml)。

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

我们现在也可以不管它，也可以详细了解一下[注解原理]({% post_url notes/spring/2020-03-28-spring-annotation-principle %})。

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

### &emsp;XML混合模式

使用之前[案例六XML方式自动装配：Spring/demo6_automatic_assembly_xml](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_xml)，在XML文件配置中修改两个实例：

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

[案例六XML与注解混合自动装配：Spring/demo6_automatic_assembly_xml_and_annotation](https://github.com/Didnelpsun/Spring/tree/master/demo6_automatic_assembly_xml_and_annotation)。

### &emsp;纯注释模式

在XML与注释混合的模式下，我们可以看到我们使用@Autowired的流程，首先在XML中配置好资源和所有要用到的实例，然后在依赖的类的setter方法上加上@Autowired就可以了。这样我们就不用管哪个类依赖哪个类，而只用把所有的类都实例化就可以了。

但是有时候我们也会觉得很麻烦，我们还要知道哪些类需要用到，如果不用到的类要删掉，那么我们有没有方法不用管哪些类被使用到呢？那就是使用纯注释的方式。即@Autowired与@Compontent以及@CompontentScan混合。

使用[标准Spring项目注释模板：Spring/basic_annotation](https://github.com/Didnelpsun/Spring/tree/master/basic_annotation)。

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

### &emsp;属性与构造器

我们之前是在Setter方法上注释的，而如果我们将注释放在需要注入的属性上也是没有问题的。

```java
//User.java
@Autowired
private HelloWorld helloworldAttri;
//@Autowired
public void setHelloWorld(HelloWorld helloworldPara){
    this.helloworldAttri = helloworldPara;
}
```

比如这样，将setHelloWorld对应的helloworldAttri属性上加上注释也可以。

```java
//User.java
private HelloWorld helloworldAttri;
@Autowired
public User(HelloWorld helloWorldPara){
    helloworldAttri = helloWorldPara;
}
```

构造函数也可以自动连接，不过其实<span style="color:red">构造器下如果你不加注释也可以！</span>这是因为扫描标签会扫描所有实例，然后根据构造器来加入依赖（而setter函数则不会这样做）。但是你要注意加入扫描标签，且在与xml混合模式下要加入依赖实例的标签。

### &emsp;required=false

现在有两种情况：

假如xml文件的bean标签里面有property，而对应的Java文件中里面却去掉了属性的getter/setter，并使用@Autowired注解标注这两个属性会怎么样？答案是Spring会按照xml优先的原则去Java文件中寻找这两个属性的getter/setter，导致的结果就是初始化bean报错。因为xml的配置是在后置处理器前面处理的。如果属性找不到又不想让Spring容器抛出异常，就是显示null，那应该怎么做呢？

又假如你要设置一个类，比如Person类，有一个属性Home来表示房子的住址，但是并不是所有人都有住址，所以这个依赖类并不是必要的，所以我们就想如果我们不传入依赖它也不会报错，我们又应该如何做呢？

默认情况下，@Autowired注释意味着依赖是必须的，它类似于@Required注释，然而，你可以使用@Autowired的（required=false）选项关闭默认行为。

虽然我们可以在我们定义的类上使用这个，但是它还是会报错，我们一般只会在简单类型的属性上使用这个注释方式。

比如我们在User.java中修改：

```java
private static String username;
@Autowired
public void setUsername(String name){
    username = name;
}
```

这时候就会报错，因为你没有传入一个String类型的参数进入。如果你不想将这个参数作为必要传入的参数，可以加上required=false（但是我觉得这个并不是必要，你完全可以不加注释，这样它就不会报错，并且直接输出null）。

&emsp;

## @Named

由JavaEE提供，使用方式和@Qualifier类似。如我们使用Hi类型的Bean就用`@Named("HiBean")`，同理如果使用HelloWorld就用：

```java
@Inject
@Named("HelloWorldBean1")
public void setHelloWorld(HelloWorld sayword){
    say = sayword;
}
```

其实@Name的注释就等价于name属性配置。

&emsp;

## @Qualifier

由Spring提供，可能会有这样一种情况，当你创建多个具有相同类型的bean时，并且想要用一个属性只为它们其中的一个进行装配，在这种情况下，你可以使用@Qualifier注释和@Autowired注释通过指定哪一个真正的bean将会被装配来消除混乱。

### &emsp;纯注释模式

我们首先将原来的HelloWorld变成一个实现接口的类，然后定义一个接口Say，最后再实例化一个Hi类。

```java
//HelloWorld.java
package org.didnelpsun.test;

import org.springframework.stereotype.Component;

@Component
// @Named("HelloWorld")
public class HelloWorld implements Say {
    private String words;
    //重写构造方法
    public HelloWorld(){ System.out.println("HelloWorldClass..."); }
    @Override
    public void setWords(String sayword){ this.words = sayword; }
    @Override
    public void SayWord() { System.out.println(this.words); }
}
```

```java
//Hi.java
package org.didnelpsun.test;

import org.springframework.stereotype.Component;

@Component
// @Named("Hi")
public class Hi implements Say {
    private String words;
    //重写构造方法
    public Hi(){
        System.out.println("HiClass...");
    }
    @Override
    public void setWords(String sayword){
        this.words = sayword;
    }
    @Override
    public void SayWord() {
        System.out.println(this.words);
    }
}
```

```java
//Say.java
package org.didnelpsun.test;

public interface Say {
    public String words = null;
    abstract public void setWords(String words);
    public void SayWord();
}
```

```java
//User.java
package org.didnelpsun.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class User {
    private static final String username = "Didnelpsun";
    private Say say;
    @Autowired
    // @Qualifier("HelloWorld")
    public void setHelloWorld(Say sayword){
        say = sayword;
    }
    public void Say(){
        System.out.println(this.username);
        say.SayWord();
    }
}
```

```java
//App.java
package org.didnelpsun;
//项目入口
import org.didnelpsun.test.HelloWorld;
import org.didnelpsun.test.Hi;
import org.didnelpsun.test.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.support.ClassPathXmlApplicationContext;

@ComponentScan
public class App
{
    //获取私有属性，这个属性是应用文档属性
    private static ApplicationContext welcomeContext;
    public static void main(String args[]){
        welcomeContext = new AnnotationConfigApplicationContext(App.class);
        User Didnelpsun = (User) welcomeContext.getBean(User.class);
        HelloWorld hello = (HelloWorld) welcomeContext.getBean(HelloWorld.class);
        hello.setWords("Hello");
        Hi hi = (Hi)welcomeContext.getBean(Hi.class);
        hi.setWords("Hi");
        Didnelpsun.Say();
    }
}
```

请注意我们没有将接口也注释为@Component，因为它不会是一个实例，所以没必要注释到。我们在App.java中将两个Say实例都已经配置好了。而这时User.java中的Say sayword参数传入依赖会报错：Could not autowire. There is more than one bean of 'Say' type.Beans:helloWorld(HelloWorld.java) hi(Hi.java)。

我们只用在这里加上@Qualifier("HelloWorld")标注要注入的实例是HelloWorld，然后再将两个Say实例分别加上@Named("HelloWorld")和@Named("Hi")给它们取好名字就可以了。如我在上面注释掉的那几行。

### &emsp;xml混合模式

我们可能会觉得上面这个例子和我们想象的不太一样。我们修改成原来的样子：

```xml
<context:component-scan base-package="org.didnelpsun" />
<bean id = "HelloWorldBean" class="org.didnelpsun.test.HelloWorld">
    <property name="words" value="hello"/>
</bean>
<bean id="UserBean" class="org.didnelpsun.test.User">
</bean>
```

将所有的@Qualifier和@ComponentScan、@Component删除：

```java
//App.java
welcomeContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
User Didnelpsun = (User) welcomeContext.getBean("UserBean");
Didnelpsun.Say();
```

```java
//User.java
private static final String username = "Didnelpsun";
private Say say;
@Autowired
public void setHelloWorld(Say sayword){say = sayword;}
public void Say(){
    System.out.println(this.username);
    say.SayWord();
}
```

这样运行是没有问题，而如果我们实例两个HelloWorld类的bean呢？

```xml
<bean id = "HelloWorldBean1" class="org.didnelpsun.test.HelloWorld">
    <property name="words" value="hello1"/>
</bean>
<bean id = "HelloWorldBean2" class="org.didnelpsun.test.HelloWorld">
    <property name="words" value="hello2"/>
</bean>
```

同样会注入出问题，应该使用@Qualifier来标注到底注入哪个实例：`@Qualifier("HelloWorldBean1")`，位置就是@Autowired下面。这样就没有问题了。

### &emsp;单独使用@Qualifier

我们上面也已经使用过了@Qualifier注解，但是我们可以注意到，我们使用这个注解都是伴随着@Autowired注解一同使用的。因为在给类成员注入时不能单独使用，必须配合@Autowired，但是注入方法参数时可以单独使用。

```java
@Autowired
public void setHelloWorld(@Qualifier("HelloWorld") HelloWorld sayword){
    say = sayword;
}
```

但是这个单独使用不是说就不用@Autowired了，而是指将他们两个注释分开，将@Qualifier放到方法参数前。

&emsp;

## @Resource

由JavaEE提供，是JSR250中的规范，你可以在字段中或者setter方法中使用@Resource注释，它和在Java EE5中的运作是一样的。基本和@Autowired用法一致。通过这个注释也可以取代@Autowired和@Qualifier很多用法。

1. @Resource后面没有任何内容，默认通过name属性去匹配bean，找不到再按type去匹配。
2. 指定了name或者type则根据指定的类型去匹配bean。
3. 指定了name和type则根据指定的name和type去匹配bean，任何一个不匹配都会报错。

我们将使用上面定义的三个实例HelloWorldBean1、HelloWorldBean2、HiBean来判断。

### &emsp;1. @Resource默认

如果我们使用@Resource而不加任何参数，它会默认按照依赖参数的类型名来匹配。如参数是Hi sayword，则它匹配的是Hi，而如果是HelloWorld类型，则会报错，因为有两个实例，同样Say也会报错，因为有三个实例。

### &emsp;2. type属性

如果我们传入的参数是Hi类型，那么如果使用type属性来配置又应该如何做呢？应该<span style="color:aqua">格式：</span>`@Resource(type = 类完整路径.class)`，如我的就是`@Resource(type = org.didnelpsun.test.Hi.class)`。这样没有问题。

同样如果我们使用的是@Resource(type = org.didnelpsun.test.HelloWorld.class)它还是会报错，因为有两个实例。

### &emsp;3. description属性

而我们使用description属性，和上面的使用方式是差不多的，但是这个路径将以字符串的形式来呈现，并使用的是相对路径，后面也没有class后缀。<span style="color:aqua">格式：</span>`@Resource(description = "相对路径")`，如我的是`@Resource(description = "Hi")`。

不过从这里我们会发现，如果我们的参数配置出错，它是会默认以默认方式来配置的，比如我们这里，将参数类保持为Hi，但是改成@Resource(description = "HelloWorldBean1")或者@Resource(description = "HelloWorld")，它是不会报错的。这是比较智能的一点。

### &emsp;4. name属性

而上面几个都不能解决我们多个同类实例的问题，我们应该如何做呢？使用name属性，<span style="color:aqua">格式：</span>`@Resource(name = "实例名")`，我的是`@Resource(name = "HelloWorldBean1")`，这样就可以使用了。

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
1️. @Autowired是Spring自带的，通过AutowiredAnnotationBeanPostProcessor类实现的依赖注入，Spring属于第三方的。
2️. @Resource是JSR250规范的实现，J2EE的注解，在javax.annotation包下，根据导入注解的包名就可以知道。J2EE是Java自己的东西。因此，建议使用@Resource注解，以减少代码和Spring之间的耦合。
3️. @Inject是JSR330规范实现的，需要导入javax.inject.Inject jar包 ，才能实现注入。
+ 从作用域：
1️. @Autowired可以作用在constructor、method、parameter、field、annotation_type上。
2️. @Resource可以作用method、field、type上。
3️. @Inject可以作用constructor、method、field上。
+ 从默认装配方法：
1️. @Autowired默认按照byType方式进行bean匹配。
2️. @Resource默认根据属性名称(byName)方式进行自动装配。如果有多个类型一样的Bean候选者，则可以通过name指定进行注入。
3️. @Inject是根据类型进行自动装配的，如果需要按名称进行装配，则需要配合@Named。
+ @Autowired如果有多个类型一样的Bean候选者，需要指定按照名称(byName)进行装配，则需要配合@Qualifier。指定名称后，如果Spring IOC容器中没有对应的组件bean抛出NoSuchBeanDefinitionException。也可以将@Autowired中required配置为false，当找不到相应bean的时候，系统不会抛异常。
+ @Autowired、@Inject用法基本一样，不同的是@Inject没有一个request属性。

[自动装配的文件：spring/annotation](https://github.com/Didnelpsun/notes/tree/master/spring/annotation)
