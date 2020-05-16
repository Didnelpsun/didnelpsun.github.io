---
layout: post
title: "Spring注释总结"
date: 2020-04-14 13:13:55 +0800
categories: notes spring senior
tags: spring 高级
excerpt: "相关注释与使用"
---

Spring现在一般都是采用注释来操作，如之前的用注释进行实例化，自动注入等都是使用方式。下面会讲到一些之前没有使用过的注释。

注释从功能上一般分四种：

+ 用于创建对象，与编写\<bean>标签功能一致  

1. @Component：将当前类对象放入Spring容器中，属性有value，即指定实例的id名。当我们不指明id时，它的默认实例id为当前类名的首字母小写值。在使用时要先导入Spring命名空间。
2. @Controller：作用和属性与@Component一致。但是分别表示不同的层次的对象。用于三层结构的表现层。
3. @Service：作用和属性与@Component一致。但是分别表示不同的层次的对象。用于三层结构的业务层。
4. @Repository：作用和属性与@Component一致。但是分别表示不同的层次的对象。用三层结构的持久层。

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

## @Conditional

## @Profile

指定组件在哪个环境的情况下才能被注册到容器中，不指定，任何环境下都能注册这个组件：
  
1. 加了环境标识的bean，只有这个环境被激活的时候才能注册到容器中。默认是default环境。
2. 写在配置类上，只有是指定的环境的时候，整个配置类里面的所有配置才能开始生效。

## @Lazy

## @Primary

## @PropertySource

## @Value

## @Test

参照地址<https://www.jianshu.com/p/75de79fba705><https://www.cnblogs.com/cxuanBlog/p/11179439.html><https://www.jianshu.com/p/23a960f369dc><https://www.cnblogs.com/xiaoxi/p/5935009.html><https://www.jianshu.com/p/71e8971d2bc5?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation>
