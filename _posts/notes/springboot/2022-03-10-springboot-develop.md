---
layout: post
title: "应用开发"
date: 2022-03-10 17:48:02 +0800
categories: notes springboot base
tags: SpringBoot 基础 开发
excerpt: "应用开发"
---

SpringBoot可以支持多种开发模式，可以开发各种应用，主要的还是Web应用。

## 配置文件

之前一般都是使用XML和propeties配置文件。这里会提到新的yaml配置文件

YAML是YAML Ain't Markup Language的递归缩写，虽然直译为其不是一种标记语言但是仍然为标记语言。非常适合做以数据为中心的配置文件。

如果propeties和yaml配置文件都有则一起生效。yaml优先级低于properties。

### &emsp;语法

+ key: value的表示方法，特别是key和value的冒号后有空格。
+ 大小写敏感。
+ 使用缩进表示层级关系。
+ 缩进不允许使用tab，只允许空格。
+ 缩进的空格数不重要，只要相同层级的元素左对齐即可。
+ #表示注释。
+ 字符串内容无需加引号，如果要加，''与""表示字符串的内容会被转义/不转义。

### &emsp;数据类型

YAML的key不能是中文。

#### &emsp;&emsp;字面量

既单个不可分的值，如date、boolean、string、number、null。

```yaml
key: value
```

#### &emsp;&emsp;对象

既键值对的集合，包括map、hash、object。

```yaml
# 行内格式：
key: {key1: value1, key2: value2, key3: value3}
# 非行内格式：
key:
    key1: value1
    key2: value2
    key3: value3
```

#### &emsp;&emsp;数组

一组按需排列的值，包括array、list、queue、set。

```yaml
# 行内格式：
key: [value1,value2,value3]
# 非行内格式：
key:
    - value1
    - value2
    - value3
```

### &emsp;示例

使用IDEA的Spring Initializr创建一个新项目，命名demo2_develp，将组改为org.didnelpsun，软件包名称为org.didnelpsun.boot。依赖项的Developer Tools中中勾选Spring Boot DevTools和Lombok，Web选择Spring Web。点击完成。

为了顺眼将主类名和测试类名都改为Application和ApplicationTests。

在boot下新建一个bean文件夹，并新建一个User类型：

```java
// User.java
package org.didnelpsun.boot.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Date;
import java.util.Map;
import java.util.Set;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer id;
    private String name;
    private Date birthday;
    private Boolean sex;
    private Account primeAccount;
    private String[] interests;
    private Set<Account> accounts;
    private Map<String, Float> scores;
}
```

然后新建一个Account类：

```java
// Account.java
package org.didnelpsun.boot.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    private Integer id;
    private String name;
    private Integer userid;
    private Double money;
}
```

给User添加配置，表示配置以user开头的配置内容：

```java
// User.java
package org.didnelpsun.boot.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Controller;

import java.util.Date;
import java.util.Map;
import java.util.Set;

@ConfigurationProperties(prefix = "user")
@Controller
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer id;
    private String name;
    private Date birthday;
    private Boolean sex;
    private Account primeAccount;
    private String[] interests;
    private Set<Account> accounts;
    private Map<String, Float> scores;
}
```

此时IDEA会报一个错：Spring Boot Configuration Annotation Processor not configured。这时需要添加一个对于注解配置的依赖，启动编写注解时对于配置的提示：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

此外在pom.xml中的build标签下配置：

```xml
<exclude>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
</exclude>
```

将这个开发辅助的插件不要打包到最后的应用jar包中。

Maven导入后新建一个application.yaml：

```yaml
user:
  id: 1
  name: Didnelpsun
  birthday: 2022/3/10
  sex: true
  primeAccount:
    id: 1
    name: 黄金账户
    userid: 1
    money: 10040.54
  interests:
    - 动漫
    - 小说
  accounts:
    - id: 1
      name: 黄金账户
      userid: 1
      money: 10040.54
    - id: 2
      name: 白银账户
      userid: 1
      money: 225.95
    - id: 3
      name: 钻石账户
      userid: 1
      money: 7466.72
  scores:
    Englist: 78.5
    Politics: 80.0
    Math: 135.0
    Computer: 140.5
```

进行主类测试：

```java
// Application.java
package org.didnelpsun.boot;

import org.didnelpsun.boot.bean.User;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        ApplicationContext applicationContext = SpringApplication.run(Application.class, args);
        User user = (User) applicationContext.getBean("user");
        System.out.println(user);
    }

}
```

打印成功。如果YAML的键名为中文会报错：Reason: No converter found capable of converting from type \[java.lang.Integer\] to type [java.util.Map\<java.lang.String, java.lang.Object\>]。

那么键值加上双引号或单引号是什么意思？如对YAML配置文件中user.primeAccount.name设置：

YAML|打印
:--:|:--:
"黄金账户 \n 测试"|黄金账户 <br> 测试
'黄金账户 \n 测试'|黄金账户 \n 测试
黄金账户 \n 测试|黄金账户 \n 测试

所以双引号不会转义字符，所以字符串中的\n就是换行的意思，而单引号和不写引号都会转移字符串，把这个值全部当作字符串字面量来处理。

<span style="color:orange">注意：</span>上面的user.name会无效，因为SpringBoot会直接从电脑管理员的user.name值来获取，所以在YAML文件中怎么改user.name值都不会改变程序的user.name值。

&emsp;

## Web开发

可以查看[SprintBoot核心特性](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features)。

### &emsp;基础功能

#### &emsp;&emsp;静态资源管理

只要将静态资源放到类路径下的/static或/public或/resources或/META-INF/resources目录下，只要访问当前项目的根路径那么就能访问这些资源了，因为SpringBoot使用了SpringMVC的ResourceHttpRequestHandler。

IDEA自动构造的SpringBoot项目已经为我们自动构建了static目录，我们在下面新建三个文件夹img、js、css，然后在img下添加一个图片test.jpg，然后运行项目，访问根路径下的资源路径<http://localhost:8080/img/test.jpg>就能找到这个图片。

那么为什么SpringBoot能找到这个图片？为什么不认为这个路径是一个请求？在boot下新建一个controller包作为控制器包，然后新建一个TestController：

```java
// TestController
package org.didnelpsun.boot.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @RequestMapping("/img/test.jpg")
    public String test(){
        return "test";
    }
}
```

这里定义了一个控制器方法test，其请求路径也是<http://localhost:8080/img/test.jpg>，返回值是一个test字符串，那么再次运行访问同样路径SpringBoot会返回图片还是字符串呢？点击后发现访问的不再是图片而是字符串了。

所以静态资源访问的原理是静态映射/**会匹配所有相同的请求路径，当收到一个请求，会先去控制器看看能不能处理，如果不能处理则所有请求又会转交给静态资源处理器进行处理，静态资源处理器会到所规定的目录查找静态资源，如果找到就返回静态资源，如果找不到就返回404。

默认静态访问资源是没有前缀的，如果要配置前缀则需要在配置文件中添加`spring.mvc.static-path-pattern: /test/**`，则以后要访问静态资源则应该是根路径+/test/+资源路径。记住这是访问前缀，请求需要加test，但是不代表静态资源的实际位置在test目录下。

如果我们不想在SpringBoot所给的固定文件目录下配置资源文件，也可以使用配置`spring.web.resources.static-location=[classpath:静态资源路径]`。
