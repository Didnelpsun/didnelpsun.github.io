---
layout: post
title: "整合Junit"
date: 2022-02-19 00:01:03 +0800
categories: notes spring other
tags: Spring 其他 Junit 测试
excerpt: "Spring整合Junit测试"
---

其中JUnit就是测试框架，其文件在test文件夹下。JUnit没有main方法也能执行，因为其集成了main方法，该方法会判断当前测试类中哪些方法具有@Test注解。

JUnit不管我们使用了什么框架，所以在执行测试方法时JUnit不知道我们使用了Spring框架所以就不会为我们读取配置文件创建Spring容器。所以当测试方法执行时没有IoC容器，所以即使Autowried也无法注入。

此时就需要Spring与JUnit的集合Jar包spring-test：

```xml
<!-- https://mvnrepository.com/artifact/org.springframework/spring-test -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-test</artifactId>
    <version>5.3.16</version>
    <scope>test</scope>
</dependency>
```

所以就需要在main方法上使用JUnit提供的@RunWith注解把原有的JUnit集成main方法的runner运行器替换`@RunWith(SpringJUnit4ClassRunner.class)`。

且还有告诉Spring的运行器Spring的容器的创建方式和位置：`@ContextConfiguration`：

+ locations：指定配置XML文件的位置，并加上classpath：关键字表明在类路径下。
+ classes：指定注解配置类的位置，加上.class。

此时就能执行自动注入了。
