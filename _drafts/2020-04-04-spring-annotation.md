---
layout: post
title: "注释总结"
date: 2020-04-04 13:13:55 +0800
categories: notes spring senior
tags: Spring 高级 @Component @Controller @Service
excerpt: "相关注释与使用"
---

Spring现在一般都是采用注释来操作，如之前的用注释进行实例化，自动注入等都是使用方式。下面会讲到一些之前没有使用过的注释。

注释从功能上一般分四种：

+ 用于创建对象，与编写\<bean>标签功能一致  

1. @Component：将当前类对象放入Spring容器中，属性有value，即指定实例的id名。当我们不指明id时，它的默认实例id为当前类名的首字母小写值。在使用时要先导入Spring命名空间。
2. @Controller：作用和属性与@Component一致。但是分别表示不同的层次的对象。用于三层结构的表现层。
3. @Service：作用和属性与@Component一致。但是分别表示不同的层次的对象。用于三层结构的业务层。
4. @Repository：作用和属性与@Component一致。但是分别表示不同的层次的对象。用三层结构的持久层。
5. @Configuration：指定当前类是一个配置类，用于取代xml配置文件。直接标注在返回Bean的类上。对于配置类作为AnnotationConfigApplicationContext对象传入的参数时，@Configuration可以不写。因为创建容器时会必然按照传入的这个配置类参数来去查找依赖，而如果配置类名不传入容器配置，而是在其他地方扫描如使用@ComponentScan，那么就必须使用@Configuration。
6. @ComponentScan：用于通过注解指定Spring创建容器时要扫描的包，value或者basePackages属性指定扫描路由。等同于xml配置的\<context:component-scan/>。
7. @ComponentScans：定义多个扫描类，中间可以加上@ComponentScan也可以加上@Filter的注解。
8. @Bean：用于把当前方法的返回值作为Bean对象存入Spring的IoC容器中。拥有属性name，用来指定Bean的名字，name属性如果要指定必须写出name=""，默认值是当前方法名。当我们使用注解来配置方法时，如果方法有参数，Spring框架会去容器中寻找可使用Bean，查找方式于@Autowired注解一致，只用一个类型满足才会成功注入，其他情况都报错。
9. @Import：用于导入其他的配置类或者实例类。属性是value，指定导入类的字节码。

+ 用于注入依赖或者数据，与编写\<property>标签功能一致

1. @Autowired：自动按照类型注入，只要容器中有唯一的bean对象类型与要注入的变量类型相匹配，注入就会成功。如果容器有多个类型可以匹配，首先会按照类型匹配所有对应的对象，然后会根据依赖变量名称（需要注入的类的属性名）作为bean的id来寻找名字相同的bean，如果这些bean有与变量名一致的，那就作为注入的对象，如果变量名与所有bean名字都不同，就报错。出现的位置可以是是类上，可以是成员，也可以是方法。此时设值函数的注入就不再是必须的了。
2. @Qualifier：在按照类型注入的基础上再按照名称来注入，以`@Qualifier(value="实例名")`为格式，value可以省略。在给类成员注入时不能单独使用，必须配合@Autowired，但是注入方法参数时可以单独使用。
3. @Resourse：按照bean的id注入，不同于@Qualifier，可以单独使用，属性不再是value而是name。
4. @Value：上面几个注释只能注入其他类型的bean，对于集合类型数据只能通过xml文件来配置注入。而对于基本数据类型和String类型，则可以使用@Value注解来注入。拥有一个value属性，来指定数据属性，同时它也可以使用SpEl表达式（Spring的el表达式），采用${表达式}格式。

+ 用于改变作用范围，与scope属性一致

1. @Scope：只有这一个注释，使用方式与scope属性一致。属性为value，常用的取值为singleton和prototype。

+ 用于控制生命周期，与init-method以及destroy-method属性一致

1. @PostConstrut：用于指定初始化方法。
2. @PreDestroy：用于指定销毁方法。
3. @Before：

## @Conditional

## @Profile

指定组件在哪个环境的情况下才能被注册到容器中，不指定，任何环境下都能注册这个组件：
  
1. 加了环境标识的bean，只有这个环境被激活的时候才能注册到容器中。默认是default环境。
2. 写在配置类上，只有是指定的环境的时候，整个配置类里面的所有配置才能开始生效。

## @Lazy

## @Primary

## @PropertySource与@PropertySources

我们之前已经使用过了properties格式的配置文件，而@PropertySourse的注释就是为了导入properties格式的配置文件。具有一个value属性，用来指定配置文件的路径，其中有一个classpath关键字，用来表示类路径。如：`@PropertySource("classpath:com/didnelpsun/config.properties")`就是指定对应的路径，中间以/分隔，并且最后要加上配置文件格式。

然后导入了配置文件，就需要使用`@Value("${配置文件的key}")`来从配置文件中获得对应的配置key。

而@PropertySources也是用来指定多个@PropertySource。

## @Value

## @Test

## @Before

参照地址<https://www.jianshu.com/p/75de79fba705><https://www.cnblogs.com/cxuanBlog/p/11179439.html><https://www.jianshu.com/p/23a960f369dc><https://www.cnblogs.com/xiaoxi/p/5935009.html><https://www.jianshu.com/p/71e8971d2bc5?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation>
