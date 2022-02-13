---
layout: post
title: "注释依赖注入"
date: 2020-03-25 23:04:22 +0800
categories: notes spring base
tags: Spring 基础 @Component @ComponentScan @ComponentScans @Configuration @Import @Scope @Bean @Repository @Service @Controller @RestController
excerpt: "注释依赖注入"
---

在Spring中，尽管使用XML配置文件可以实现Bean的装配工作，但如果应用中Bean的数量较多，会导致XML配置文件过于臃肿，从而给维护和升级带来一定的困难。

Java从JDK5.0以后，提供了Annotation（注解）功能，Spring也提供了对Annotation技术的全面支持。Spring3中定义了一系列的Annotation（注解），常用的注解如下：

1. @Component：可以使用此注解描述Spring中的Bean，但它是一个泛化的概念，仅仅表示一个组件（Bean），并且可以作用在任何层次。使用时只需将该注解标注在相应类上即可。如果不好分类就用这个注解。一般是针对普通的POJO。主文件使用@ComponentScan来获取组件。
2. @Repository：用于将数据访问层（DAO层）的类标识为Spring中的Bean，其功能与@Component相同。
3. @Service：通常作用在业务层（Service层），注入DAO层，用于将业务层的类标识为Spring中的Bean，其功能与@Component相同。
4. @Controller：通常作用在控制层（如Struts2的Action），用于将控制层的类标识为Spring中的Bean，注入服务，其功能与@Component相同。
5. 其他的相关配置在后面一节会谈到。

我们这里会讲到[三层架构]({% post_url notes/spring/2020-01-29-spring-introduction-and-build %})，我们暂时只会用到前面三种注释，对于三层结构的注释会在后面使用。

## @Component、@ComponentScan和@ComponentScans

### &emsp;@Component

我们之前在[容器与实例注入]({% post_url notes/spring/2020-03-19-spring-container-and-instance-injection %})已经用过了@Component和@ComponentScan来配置，这里我们并不会着重谈到。

<!-- 在XML文件中写入`<context:component-scan base-package="扫描的包名">`引入Component的扫描组件。 -->

在对应实体类上添加@Component注释相当于配置文件中applicationContext.xml中的一句：\<bean id="XXX" class="XXXXX"></bean>，即将这个类实例化变成一个实例放入实例池中被容器操纵。

同时我们也可以从此知道，我们在接口上添加这个注解是没有用的，因为接口没有构造方法也不可能被实例化。

对于@Controller，@Service，@Repository注解，查看其源码你会发现，他们中有一个共同的注解@Component，@ComponentScan注解默认就会装配标识了@Controller，@Service，@Repository。它们并没有本质的区别，只是为了标注不同的功能罢了。

### &emsp;@ComponentScan

@ComponentScan的作用就是根据定义的扫描路径，把符合扫描规则的类装配到Spring容器中，如我们在App.java就是在最上面加上这个注释，表明在这里使用扫描器，来查看加载类。

<!-- 与ComponentScan注解相对应的XML配置就是\<context:component-scan/> -->

如<span style="color:aqua">格式：</span>`@ComponentScan(value="要扫描的包名")`。如果没有赋值，则默认会扫描所有带有@Component的类。

#### &emsp;&emsp;@ComponentScan源码

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Repeatable(ComponentScans.class)
public @interface ComponentScan {
    /**
     * 对应的包扫描路径 可以是单个路径，也可以是扫描的路径数组
     * @return
     */
    @AliasFor("basePackages")
    String[] value() default {};
    /**
     * 和value一样是对应的包扫描路径，可以是单个路径，也可以是扫描的路径数组
     * @return
     */
    @AliasFor("value")
    String[] basePackages() default {};
    /**
     * 指定具体的扫描的类
     * @return
     */
    Class<?>[] basePackageClasses() default {};
    /**
     * 对应的bean名称的生成器，默认的是BeanNameGenerator
     * @return
     */
    Class<? extends BeanNameGenerator> nameGenerator() default BeanNameGenerator.class;
    /**
     * 处理检测到的bean的scope范围
     */
    Class<? extends ScopeMetadataResolver> scopeResolver() default AnnotationScopeMetadataResolver.class;
    /**
     * 是否为检测到的组件生成代理
     * Indicates whether proxies should be generated for detected components, which may be
     * necessary when using scopes in a proxy-style fashion.
     * <p>The default is defer to the default behavior of the component scanner used to
     * execute the actual scan.
     * <p>Note that setting this attribute overrides any value set for {@link #scopeResolver}.
     * @see ClassPathBeanDefinitionScanner#setScopedProxyMode(ScopedProxyMode)
     */
    ScopedProxyMode scopedProxy() default ScopedProxyMode.DEFAULT;
    /**
     * 控制符合组件检测条件的类文件   默认是包扫描下的  **/*.class
     * @return
     */
    String resourcePattern() default ClassPathScanningCandidateComponentProvider.DEFAULT_RESOURCE_PATTERN;
    /**
     * 是否对带有@Component @Repository @Service @Controller注解的类开启检测,默认是开启的
     * @return
     */
    boolean useDefaultFilters() default true;
    /**
     * 指定某些定义Filter满足条件的组件，FilterType有5种类型如：
     *                                  ANNOTATION, 注解类型 默认
                                        ASSIGNABLE_TYPE,指定固定类
                                        ASPECTJ， ASPECTJ类型
                                        REGEX,正则表达式
                                        CUSTOM,自定义类型
     * @return
     */
    Filter[] includeFilters() default {};
    /**
     * 排除某些过来器扫描到的类
     * @return
     */
    Filter[] excludeFilters() default {};
    /**
     * 扫描到的类是都开启懒加载 ，默认是不开启的
     * @return
     */
    boolean lazyInit() default false;
}
```

#### &emsp;&emsp;源码参数

+ basePackages与value:  用于指定包的路径，进行扫描。
+ basePackageClasses: 用于指定某个类的包的路径进行扫描。
+ nameGenerator: bean的名称的生成器。
+ useDefaultFilters: 是否开启对@Component，@Repository，@Service，@Controller的类进行检测。
+ includeFilters: 包含的过滤条件。
  1. FilterType.ANNOTATION：按照注解过滤。
  2. FilterType.ASSIGNABLE_TYPE：按照给定的类型。
  3. FilterType.ASPECTJ：使用ASPECTJ表达式。
  4. FilterType.REGEX：正则。
  5. FilterType.CUSTOM：自定义规则。
+ excludeFilters: 排除的过滤条件，用法和includeFilters一样。

如：

```java
@ComponentScan(value = "com.xhx.spring.service",
        useDefaultFilters = true,
        basePackageClasses = HelloController.class
)
```

#### &emsp;&emsp;常用的方法

+ 自定扫描路径下边带有@Controller，@Service，@Repository，@Component注解加入Spring容器。
+ 通过includeFilters加入扫描路径下没有以上注解的类加入Spring容器。
+ 通过excludeFilters过滤出不用加入Spring容器的类。
+ 自定义增加了@Component注解的注解方式。

#### &emsp;&emsp;常用参数

+ value：指定要扫描的package。
+ includeFilters=Filter[]：指定只包含的组件。
+ excludeFilters=Filter[]：指定需要排除的组件。
+ useDefaultFilters=true/false：指定是否需要使用Spring默认的扫描规则：被@Component，@Repository，@Service，@Controller或者已经声明过@Component自定义注解标记的组件。

#### &emsp;&emsp;详细的例子

使用[标准Spring项目注释模板：Spring/basic_annotation](https://github.com/Didnelpsun/Spring/tree/master/basic_annotation)。首先重新在entity的utils文件夹下定义HelloWorld.java，将user成员由String类型变为一个User类型：

```java
// HelloWorld.java
package org.didnelpsun.entity.utils;

import org.didnelpsun.entity.user.User;

public class HelloWorld {
    public HelloWorld (User user) {
        this.user = user;
        System.out.println("HelloWorldClass");
    }
    private String words;
    private User user;
    public void setWords(String word){
        this.words = word;
    }
    public void saySomeThing(){
        System.out.println(this.user.name +" says "+ this.words);
    }
}
```

其中HelloWorld构造方法需要再传入User类。

entity/user中定义User.java：

```java
// User.java
package org.didnelpsun.entity.user;

import org.didnelpsun.entity.utils.HelloWorld;

public class User {
    public String name;
    public Integer age;
    public HelloWorld helloWorld;
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
}
```

User类包含一个HelloWorld成员，所以构造时需要把this传入构造函数，entity/user中定义User的两个子类：

```java
// Didnelpsun.java
package org.didnelpsun.entity.user;

import org.didnelpsun.entity.utils.HelloWorld;

public class Didnelpsun extends User{
    public Didnelpsun(){
        this.name = "Didnelpsun";
        this.helloWorld = new HelloWorld(this);
        System.out.println("DidnelpsunClass");
    }
}
```

```java
// Scala.java
package org.didnelpsun.entity.user;

import org.didnelpsun.entity.utils.HelloWorld;

public class Scala extends User{
    public Scala(){
        this.name = "Scala";
        this.helloWorld = new HelloWorld(this);
        System.out.println("ScalaClass");
    }
}
```

最后由于主类测试要使用Didnelpsun实例，所以只在Didnelpsun类上添加一个@Component并修改App.java：

```java
// App.java
package org.didnelpsun;
import org.didnelpsun.entity.user.Didnelpsun;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan()
public class App
{
    private static ApplicationContext welcomeContext;
    public static void main(String[] args){
        welcomeContext = new AnnotationConfigApplicationContext(App.class);
        Didnelpsun didnelpsun = welcomeContext.getBean(Didnelpsun.class);
        didnelpsun.helloWorld.setWords("nmsl");
        didnelpsun.helloWorld.saySomeThing();
    }
}
```

运行：

![result1][result1]

虽然只在Didnelpsun上添加@Component，但是由于Didnelpsun继承于User所以会先构造，又User又依赖HelloWorld所以会第二个构造，最后才是Didnelpsun类实例。所以即使没有给HelloWorld添加@Component注解也能构造Didnelpsun成功。而没有依赖的Scala实例则不会在Bean池中。此时`User user = welcomeContext.getBean(User.class);`也会成功，因为虽然Bean池中没有User实例，但是Didnelpsun是User的子类，所以Spring默认将Didnelpsun给user。

将User、HelloWorld和Scala类都加上@Component：

![result2][result2]

+ 实例化顺序是按照类的全限定类名以及包名顺序，从A到Z，所以实例化会按照user->utils，Didnelpsun->Scala->User。
+ 每个类初始化前都会按照依赖关系先创建依赖类，所以会User->HelloWorld->Didnelpsun。
+ 由于依赖关系而被创建的类不会影响到后面同样类的创建，所以在Didnelpsun和Scala创建时会创建两次User和HelloWorld。
+ 由于HelloWorld和User是互相依赖，所以到创建HelloWorld时会先创建User，最后不会再重新构建User了。
+ `User user = welcomeContext.getBean(User.class);`此时会报错，因为实例池中有Didnelpsun和Scala实例，所以Spring不知道取哪个User的子实例作为User的实例。（@Autowired是根据类型进行自动装配的。在上面的例子中，如果当Spring上下文中存在不止一个UserDao类型的bean时，就会抛出BeanCreationException异常；如果Spring上下文中不存在UserDao类型的bean，也会抛出BeanCreationException异常。我们可以使用@Qualifier配合@Autowired来解决这些问题）

在entity中新建一个UserDAO.java，并添加持久层注释：

```java
package org.didnelpsun.entity;

import org.springframework.stereotype.Repository;

@Repository
public class UserDAO {
    public String url;
    public String username;
    public String password;
    public UserDAO(){
        System.out.println("UserDAOClass");
    }
}
```

![result3][result3]

默认会扫描所有带注释的包，而我们现在只需要部分Bean，在App.java的类上的@ComponentScan上添加对应参数：

```java
// App.java
package org.didnelpsun;
import org.didnelpsun.entity.user.Didnelpsun;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan()
public class App
{
    private static ApplicationContext welcomeContext;
    public static void main(String[] args){
        welcomeContext = new AnnotationConfigApplicationContext(App.class);
    }
}
```

+ value属性：扫描指定包下所有组件，使用默认扫描规则，即被@Component，@Repository，@Service，@Controller或者已经声明过@Component自定义注解标记的组件。`@ComponentScan("org.didnelpsun.entity.user")`或`@ComponentScan(value = {"org.didnelpsun.entity.user"})`，扫描user包下的组件，所以UserDAOClass和HelloWorldClass都没有显示。
+ basePackageClasses属性：用来扫描指定某个类所在包及其子包下的所有组件。`@ComponentScan(basePackageClasses = {Didnelpsun.class})`，所以会扫描Didnelpsun类所在的user包下的组件，如果user包下有子包也会一起扫描。
+ includeFilters属性：指定要扫描包并设置过滤器，加载被@Component注解标记的组件和默认规则的扫描（因为useDefaultFilters默认为true）。其中type包括以下几种属性：
  + ANNOTATION：按照注解进行过滤。扫描user包下的组件，扫描过滤方式是按照注解，只有被标注为@Component才会被扫描。`@ComponentScan(value = "org.didnelpsun.entity.user", includeFilters = {@ComponentScan.Filter(type = FilterType.ANNOTATION, value = Component.class)}, useDefaultFilters = false)`。
  + ASSIGNABLE_TYPE：按照给定的类型进行过滤。只有同类或其子类或子接口或实现接口的类才能被过滤。将entity包下的所有组件都包含进来，只过滤那些User类或User类的子类的Bean。`@ComponentScan(value = "org.didnelpsun.entity", includeFilters = {@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {User.class})}, useDefaultFilters = false)`。
  + ASPECTJ：按照ASPECTJ表达式进行过滤。
  + REGEX：按照正则表达式进行过滤。
  + CUSTOM：按照自定义规则进行过滤。如果实现自定义规则进行过滤时，自定义规则的类必须是org.springframework.core.type.filter.TypeFilter接口的实现类。
+ excludeFilters属性：过滤掉被@Component标记的组。


![result4][result4]
1. 扫描指定包，：`@ComponentScan(value = "com.yibai", excludeFilters = { @Filter(type = FilterType.ANNOTATION, value = Component.class) })`
2. 扫描指定包，自定义过滤规则：`@ComponentScan(value = "com.yibai", includeFilters = { @Filter(type = FilterType.CUSTOM, value = ColorBeanLoadFilter.class) }, useDefaultFilters = true)`

为什么useDefaultFilters=false？其实@Component，@Controller，@Service和@Repository三者功能相同，后三个注解是为了对应后端代码的三层结构由第一个注解"复制"而来的。查看源码可以发现，后三个注解上面都有一个@Component。也就是说@Controller，@Service和@Repository除了是它们自己，也是一个@Component在进行includeFilters过滤时，如果useDefaultFilters =true，它会默认把所有包含@Component注解的类都进行扫描。因此只有加上useDefaultFilters=false才能得到正确的结果。

### &emsp;@ComponentScans

可以一次声明多个@ComponentScan。

#### &emsp;&emsp;@ComponentScans源码

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Repeatable(ComponentScans.class)  //指定ComponentScan可以被ComponentScans作为数组使用
public @interface ComponentScan {
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
public @interface ComponentScans {
    ComponentScan[] value();

}
```

#### &emsp;&emsp;具体例子

```java
@ComponentScans(value = { @ComponentScan(value = "com.yibai.spring.annotation"),
        @ComponentScan(value = "com.yibai.spring.annotation", includeFilters = {
                @Filter(type = FilterType.CUSTOM, value = ColorBeanLoadFilter.class) }) })
public class MainConfig {
    @Bean(name = "pers", initMethod = "init", destroyMethod = "destory")
    public Person person() {
        return new Person();
    }
}
```

&emsp;

## @Configuration和@Bean

### &emsp;基本使用

Spring帮助我们管理Bean分为两个部分，一个是注册Bean，一个装配Bean。完成这两个动作有三种方式，一种是使用自动配置的方式，一种就是使用XML配置的方式，一种是使用JavaConfig的方式，即通过注释。

而@Configuration和@Bean就是最后一种方式来注册装配Bean。

Spring的带有@Configuration的注解类表示这个类可以使用Spring IoC容器作为bean定义的来源。@Bean注解用于告诉方法，产生一个Bean对象，然后这个Bean对象交给Spring管理。产生这个Bean对象的方法Spring只会调用一次，随后这个Spring将会将这个Bean对象放在自己的IOC容器中。这样的注释的配置方法，就将一些xml的类似\<property>配置标签直接用Java代码取代。

SpringIoC容器管理一个或者多个bean，这些bean都需要在@Configuration注解下进行创建，在一个方法上使用@Bean注解就表明这个方法需要交给Spring进行管理。

首先我们还是使用[Spring标注模板](https://github.com/Didnelpsun/notes/tree/master/spring/spring)

然后我们把XML文件全部注释掉，不让XML配置起作用。

然后新建一个HelloWorldConfig.java文件：

```java
//HelloWorldConfig.java
package org.didnelpsun.test;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HelloWorldConfig {
    @Bean
    public HelloWorld HelloWorld(){
        return new HelloWorld();
    }
}
```

请注意这个代码的意思，首先这个文件并不是一个实例类，而是一个配置类，它只是起到了配置实例类的作用，@Configuration告诉容器这里是配置，可能会设置参数，然后返回实例。@Bean对应的方法将返回一个实例交给容器管理，所以这里的HelloWorld方法就是一个返回实例的方法，而具体的实现是依赖HelloWorld类。

```java
//App.java
package org.didnelpsun;
//项目入口
import org.didnelpsun.test.HelloWorld;
import org.didnelpsun.test.HelloWorldConfig;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class App
{
    private static ApplicationContext welcomeContext;
    public static void main(String args[]){
        welcomeContext = new AnnotationConfigApplicationContext(HelloWorldConfig.class);
        HelloWorld hello = welcomeContext.getBean(HelloWorld.class);
        hello.saySomeThing();
    }
}
```

![null][null]

### &emsp;配置参数

如果我们不想光溜溜就返回一个没有配置的实例，我们也可以返回一个配置好的实例：

```java
// HelloWorldConfig.java
@Configuration
public class HelloWorldConfig {
    @Bean
    public HelloWorld HelloWorld(){
        HelloWorld hello = new HelloWorld();
        hello.setWords("Hello");
        return hello;
    }
}
```

![hello][hello]

### &emsp;配置依赖

我们这里只使用了HelloWorld类实例，而如果我们要使用User类实例怎么办呢？如何实现User对HelloWorld的依赖呢？很简单，讲它们都用@Bean注释，然后讲被依赖类的配置方法传入依赖类的配置方法中。

```java
//App.java
welcomeContext = new AnnotationConfigApplicationContext(HelloWorldConfig.class);
User hello = welcomeContext.getBean(User.class);
hello.SayHello();
```

```java
//HelloWorldConfig.java
package org.didnelpsun.test;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HelloWorldConfig {
    @Bean
    public HelloWorld HelloWorld(){
        HelloWorld hello = new HelloWorld();
        hello.setWords("Hello");
        return hello;
    }
    @Bean
    public User User(){
        User user = new User();
        user.setHelloWorld(HelloWorld());
        user.setAge(19);
        user.setPassword("PassWord!");
        user.setWords("Hi");
        return user;
    }
}
```

![配置依赖][ref]

如果你使用的是构造函数而非设置函数进行依赖注入，那么你可以直接`return new User(HelloWorld());`。

### &emsp;生命周期

可以使用`@Bean(initMethod = "方法名", destroyMethod = "方法名")`的方法来规定生命周期处理函数。

[@Configuration和@Bean实例：spring/configuration-bean](https://github.com/Didnelpsun/notes/tree/master/spring/configuration-bean)

### &emsp;说明

@Configuration注解的配置类有如下要求：

1. @Configuration不可以是final类型；
2. @Configuration不可以是匿名类；
3. 嵌套的configuration必须是静态类。

### &emsp;@Configuration与@Components

我们最开始使用注释注册Bean是使用@Components注释的，那么他们有什么区别和联系呢？

共同点：都可以用于创建Bean；

不同点：

+ 实现原理不同，@Configuration基于CGlib代理实现，@Component基于反射实现；
+ 使用场景：@Configuration用于全局配置，比如数据库相关配置，MVC相关配置等；业务Bean的配置使用注解配置(@Component,@Service,@Repository,@Controller)。
+ 功能本质不同：@Components的本质是创建实例，而@Configuration的本质是取代xml文件。@Components和扫描器必须要配合使用，可以使用\<context:component-scan/>，也可以使用@ComponentScan，可以使用xml文件来配置，也可以使用@Configuration配置。

### &emsp;@Configuration的必要性

对于配置类作为AnnotationConfigApplicationContext对象传入的参数时，@Configuration可以不写。因为创建容器时会必然按照传入的这个配置类参数来去查找依赖。如上面的`welcomeContext = new AnnotationConfigApplicationContext(HelloWorldConfig.class);`，这时候上面的@Configuration注释就不用写了。

但是如果你要扫描多个多个包，也就是说如果你传入容器的配置类中要扫描多个别的配置类，那么你就要将所有要扫描的配置类都加上@Configuration。否则它将不知道要扫描哪一个。或者你可以通过`AnnotationConfigApplicationContext(someConfig.class,someConfig.class,someConfig.class...);`，这样Spring就知道你具体要传入哪些配置类了。

&emsp;

## @Import

针对上面的@Configuration必要性的问题，如果你既不想在配置容器时传入一大堆的配置类，也不想写一个总配置文件扫描其他子配置文件，那么可以使用@   Import来导入配置。

@Import注解允许从另一个配置类中加载@Bean定义。如别的类我们需要使用到一个实例HelloWorld，只用`@Import(HelloWorld.class)`就可以了。而且如果你在一个配置文件A的a类中引用了B的实例b类，那么你要在主函数文件中使用a类和b类，你就只用引入A文件，而不用引入B文件，因为B文件所需要的类已经通过@Import被导入了。

使用@Import导入后，有@Import注解的类就是父配置类，导入的就是子配置类。

&emsp;

## @Scope

与xml的scope属性一样也是规定实例作用域的，值都是一样的。如@Scope("prototype")。

&emsp;

## @Repository

@Repository会被作为持久层操作（数据库）的bean来使用@Repository注解修饰哪个类，则表明这个类具有对对象进行CRUD（增删改查）的功能，而且@Repository是@Component注解的一个派生品，所以被@Repository注解的类可以自动的被@ComponentScan 通过路径扫描给找到。（这也在一定程度上解释了，为什么被@Repository注解的类也能@Autowired，这个注释后面会提到）

为什么@Repository只能标注在 DAO 类上呢？这是因为该注解的作用不只是将类识别为Bean，同时它还能将所标注的类中抛出的数据访问异常封装为 Spring 的数据访问异常类型。 Spring本身提供了一个丰富的并且是与具体的数据访问技术无关的数据访问异常结构，用于封装不同的持久层框架抛出的异常，使得异常独立于底层的框架。

实际的应用将在后面讲到。

&emsp;

## @Service

@Service标注业务层组件，标注将这个类交给Spring容器管理，spring容器要为他创建对象。

如果只用@autowired注解来注入bean，不在业务层使用@Service
启动服务会报错：Field xxxService in xx.xxx.controller.xxxController required a bean of type 'xx.xxx.utils.xxxService' that could not be found。

对于实际的应用将在后面讲到。

&emsp;

## @Controller

@Controller 注解的bean会被spring-mvc框架所使用。

@Controller用于标记在一个类上，使用它标记的类就是一个SpringMvc Controller对象，分发处理器会扫描使用该注解的类的方法，并检测该方法是否使用了@RequestMapping注解。
@Controller只是定义了一个控制器类，而使用@RequestMapping注解的方法才是处理请求的处理器。
@Controller标记在一个类上还不能真正意义上说它就是SpringMvc的控制器，应为这个时候Spring还不认识它，这个时候需要把这个控制器交给Spring来管理。有两种方式可以管理：

```xml
<!--基于注解的装配-->
<!--方式一-->
<bean class="com.HelloWorld"/>
<!--方式二-->
<!--路径写到controller的上一层-->
<context:component-scan base-package="com"/>
```

```java
package com;
@Controller
public class HelloWorld{

    @RequestMapping(value="/showRegUser")
    public String printHello() {
        return "hello";
    }

    @Autowried
    private IocSerevce service;
    public void add(){
        service.add();
    }
}
```

### &emsp;@Controller和@RestController的区别

1. 如果只是使用@RestController注解Controller，则Controller中的方法无法返回jsp页面，或者html，配置的视图解析器InternalResourceViewResolver不起作用，返回的内容就是Return里的内容。
2. 如果需要返回到指定页面，则需要用 @Controller配合视图解析器InternalResourceViewResolver才行。如果需要返回JSON，XML或自定义mediaType内容到页面，则需要在对应的方法上加上@ResponseBody注解。
3. 例如使用@Controller注解，在对应的方法上，视图解析器可以解析return 的jsp,html页面，并且跳转到相应页面若返回json等内容到页面，则需要加@ResponseBody注解
4. @RestController注解，相当于@Controller+@ResponseBody两个注解的结合，返回json数据不需要在方法前面加@ResponseBody注解了，但使用@RestController这个注解，就不能返回jsp,html页面，视图解析器无法解析jsp,html页面

对于实际的应用将在后面讲到。

[result1]:data:image/png;base64,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

[result2]:data:image/png;base64,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

[result3]:data:image/png;base64,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

[result4]:data:image/png;base64,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

[null]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMQAAAAeCAIAAAD8YSZ1AAAEo0lEQVR4Ae1aP07rTBBfP72eCtlFOAGOQgEnsCUa3gnsjvTJk1PACaBIRNJDl5yANEjOCeLie4pvQApHqTiB36w3rDfxerLmE/74wqaA9czs/PntZGbWinF6ekoKn6OjowJNEzQCexD4sYev2RoBZQR+SiXf3t6kdE3UCCAI6MqEgKNZ1RDQyVQNLy2NIKCTCQFHs6ohoJOpGl5aGkFAJxMCjmZVQ0AnUzW8tDSCgPzVALKBs9Lz65HfTML+/XTJiTuL8+sHj0x+P0U7dPVHZoXJL8adp8hQ36sl9yKAwIuwytTKkyltXN0GjmVsTi5Nk9ngbrr8Dw7SiJ66EUnT8/bQK4tB0z+MAAIvwiozJ08mJs0rAU3S3sjeLkLMWJleTf+GCCjNTJA3/TAxncvzNP2GGOmQFRHAKpOo4vWfeOU4rQsSQdPJpiXG5dWLC4tcIKaLDQfmJ3c1CM3Ab9J2maaLSfcx4p1U0JkuxipjFq6wcXXTcy1mW7S1M8aJj7jCTRiyf2W2aJhiXEk4uHteGgabItaTLh8BQWzoHfNZAlEos09piPNijEzyXw6yZT6oJhN5TdaEHFsnhCyRbgooBM563OmwLMnCyE1bbs9bjLvdiM1A7q+TKBvexV1p2vh1GzxcE5V8EhTSXV77IsqGfTibzI07nqzkPWtzb2QrQSGd0riHMtkNDbFFk6b1p9t9AlEWctBOIC5jOQ1jB7Q35jS3gHvRskk8YVMpohBxA1gfcB5XWJWr1OYUlQJel44ZT/J6s7ORlxzDiP7ExDRp5YDsObPN1eyFHbxhLJ/DmNgtlZYqKNzdZRhNqKNVP4LC3MO9SspsQdLcv99kWchc1ZzGb5/BdxMQaFy5NgAw59wyhVxAuviY81JVHyMqV6YT65iQdfJKSPmdjslUdsQyTWJZvaGb74TGlD9UWLHSSaB2dhK4kA6HPvUWf39RQb1MFLHFqqxr5YjlYc1fZm4A2TRdLk/gyxSH9++XZUShzP4XoqkmEw2YxCF8eXJkCmFkrbBAVSIUZy/FxrStPc92WhV+T4GbDSjBDRkg78O2lVR+ktpimeSQWb+z6WVi02cF2HHPGs/WJQgNtpCVKqzsVu0blNocmweR/sXcZpXchlEghQ9semCzNh4U7HqZrWyvrdLXylTRicSjrSIfkrgovTvwB5KsVryHwumqeJhv3rvatkXF1wmbimAS2rUFxYk4l+2WHYel7/CKCvf6UBD43JAFc1hlavqjoU9loemMO/kwu3UGmQzv1vPHSWvo9Ua0Y0Fz6cd+YArWSpZQRAbkpjcaZdaoEFeI2AIxo+lDJ2NawcX79/fjLPsZHf6Kbe4VJjLH8zNbYKUfuioeclXFRZktWnvGMzvwmIdpEo7DY09AAwQgzXtuczF+FAt+mcKiaUUKEjICL8Iqs2tIfwNeJv2l6BDtJ11xawsT8iawY/a+oDajn2dIqc19nvnvrBkGAR8uv+FmojoAKLA2dwDhfc0QeCOTXDu+psdqXv2P25xagFqqPgR0m6sP64O3pJPp4I+4vgB1MtWH9cFb0sl08EdcX4A6merD+uAt6WQ6+COuL8C/wv+qN1ecpIwAAAAASUVORK5CYII=

[hello]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM8AAAAgCAIAAAA68btfAAAFTklEQVR4Ae1bsW7jOBClDtenCizgnC+IDKdI7j5AAtJkqyvlLu7tQC6SL0gKG7H7uLPba+ImgNwfYBW3sP4gXkCCq3yBbihKlBRRIuXI60VCN0uRwzfDx+HMUMoqp6enqPR3dHRUOv6rDwbNv/7+8w9qZRD8WP3z70ZRaI9s/DQGlE/vbT+NSqmIy8BvXAkpIBmoiwHpbXUxKXH4DEhv43MkJepi4Hcu0NvbG1dGCkgGRBiQsU2EJSlTDwPS2+rhUaKIMCC9TYQlKVMPA9Lb6uFRoogwIL1NhCUpUw8D0tvq4VGiiDDAfwMighKcX086Lc8ePiw2RfLn148mmt9MnSIBbj/RQsTWs97Ukd86uZxVECiht2SoggKE+N4WNK/uLF2NP2MHgbcc3S82B9hpxZn2HRQE592xWWmRX0qY7Nd23qenEXxlbB5zd62E3pKhStzyvY3A0ViC3Xww0bJhjFhTSbEU/oIMVK7bwLGGttfQL8+D4AvyJZf8EQZEY1tax+t/rq/r7QvkQF4LKzYySuMfFU6PQmewjkaghjP8kd2wOi2ckYNgPe8/OTRZpzCD9Uyk1CsHbF7dDgyV6E7reldKph/LAaNlsP4p0oWXmV6XZ4/un+HP7LiJrwSQpZ/flzFDjN5y0IyF8bqYU3bxNvTqbRE6Vk8Q2pRkdDDC0rezXo+4UbiXiQ2qMTDXs37fIXWY8e3ECW8Y6VlB0Px2Zz1eIxGHSwHiWWb3wglvJEBuaMY99WYUu3ViDauVAsSVIrWQJRv1lejCXtX+3u9PQZQs2ep6sC5ls7BdHdCbK+x8MHrR1pA7J5VxCWCJGTDU6kzGnUQEqm3ysDO9CVa2hbdVc2c9TC/ZL+sOkYOUFcRPlTNpHoLZA4Re6g13nkSsd2I0aCmK891FjQaOPWDumdbwly/EMxRl82y7SGuLZO0U4PtZitKCSFz1lwJMLOSCFOkCr3qI7+NkyRRqhdevncHhBQaaV4YGBKzoaBEgFWA2IM/0419vFuWUj9DL1BJaC0cj2mW8X7OlH68lP2Wn2HaiHiO09V4RKr6ZEpm8Qk6P2mggVR2MjUQOcl/yUKFFgi+C6Nvz4Fo9HnewteWvaSrAs0RLdJFzb6gJY8myVi9LwwJ3W2w2J3DaXPshvvKXALL0c/tqpJfq8v0oboY9OO/pOHRsqEDS2MXbMCPIteH4JdQliFErzLa5XqGOfP0nmPuy6MlxwHHlZgGjYZFk3aJRyXvBLEjlJ6Yu4mo6Wg57UbpM1xUkhOvGWfNZvQShUYZZJmBls1ITaqKXIoZpifoWjjK+m/Y/KrhDJiUlIQ2eKahMkyQLDcqRAH4w6ZFcCDJCuQeY9bL0NbMrkjpzs6MOXBWZOBslhRoVxRcc+oA836dpGrZfxMJkMreV1YXFtx6pzKAae68LwhvSL7ttzbUL32XmAbk2ZAVqoTcNCScBVzrxfuFD1YH6qXAJorGNVp2Q10hJSLRmNimsTGm5s3qat8fmYGKAJOSvoduxGmlT2W0IQyN0O5hMaI1LAUt0AZbS6kCyJKBg4kP8pYEcD6osnUlfoSrUzU6oC7QMbUPEQgqVbxTpIgWNZpnEwsCzZ/axmWIDBOAcDIzWevaUThlFgHnVgj270VvCvDO9QXBQ4/2im8W0h/9/rpjTfrVOoOODn8UOviJwLEtzi25zBzevFgP2dSetxbivAwK1RpiCoqrusy5cNJN+1vUffF00VzKK94MbV7cBnyST1k2LxNsLAzKT7oVWCcpkQHobkxbZuRcGpLfthVYJymRAehuTFtm5Fwakt+2FVgnKZOB/9kEH6TX6/1sAAAAASUVORK5CYII=

[ref]:data:image/png;base64,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
