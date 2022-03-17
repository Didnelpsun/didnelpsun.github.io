---
layout: post
title: "整合Swagger"
date: 2022-03-16 16:01:04 +0800
categories: notes springboot senior
tags: SpringBoot 高级 Swagger
excerpt: "整合Swagger"
---

## 概念

+ 后端时代：前端只用设计静态页面，后端使用模板引擎JSP等渲染页面。
+ 前后端分离：后端只需要控制层、服务层、持久层三层，前端分为控制层和视图层。前后端使用API接口交互。

Swagger是最流行的API框架，RestFul API文档在线自动生成。直接运行，可以在线测试API接口。

现在SWAGGER官网主要提供了几种开源工具，提供相应的功能。可以通过配置甚至是修改源码以达到你想要的效果：

+ Swagger Codegen：通过Codegen可以将描述文件生成html格式和cwiki形式的接口文档，同时也能生成多钟语言的服务端和客户端的代码。支持通过jar包，docker，node等方式在本地化执行生成。也可以在后面的Swagger Editor中在线生成。
+ Swagger UI提供了一个可视化的UI页面展示描述文件。接口的调用方、测试、项目经理等都可以在该页面中对相关接口进行查阅和做一些简单的接口请求。该项目支持在线导入描述文件和本地部署UI项目。
+ Swagger Editor：类似于markendown编辑器的编辑Swagger描述文件的编辑器，该编辑支持实时预览描述文件的更新效果。也提供了在线编辑器和本地部署编辑器两种方式。
+ Swagger Inspector：感觉和postman差不多，是一个可以对接口进行测试的在线版的postman。比在Swagger UI里面做接口请求，会返回更多的信息，也会保存你请求的实际请求参数等数据。
+ Swagger Hub：集成了上面所有项目的各个功能，你可以以项目和版本为单位，将你的描述文件上传到Swager Hub中。在Swager Hub中可以完成上面项目的所有工作，需要注册账号，分免费版和收费版。

Swagger是一个API文档维护组织，后来成为了Open API标准的主要定义者，现在最新的版本为17年发布的Swagger3（Open Api3）。国内绝大部分人还在用过时的Swagger2（17年停止维护并更名为Swagger3）。Swagger2的包名为io.swagger，而Swagger3的包名为io.swagger.core.v3。

Swagger3特性：

+ 支持Spring 5，Webflux（仅请求映射支持，尚不支持功能端点）、Spring Integration。
+ 官方在Spring Boot的自动装配springfox-boot-starter以后可以直接依赖一个dependency与Swagger2.0更好的规范兼容性。
+ 支持OpenApi 3.0.3。
+ 轻依赖 spring-plugin，swagger-core。

Spring与Swagger的兼容非官方项目（不同实现方式）：

+ Swagger：SpringFox是Spring社区维护的一个项目（非官方），帮助使用者将Swagger2集成到Spring中。常常用于Spring中帮助开发者生成文档，并可以轻松的在Spring Boot中使用。有Swagger3版本但是没有持续更新。
+ OpenAPI：SpringDoc也是Spring社区维护的一个项目（非官方），帮助使用者将Swagger3集成到Spring中。也是用来在Spring中帮助开发者生成文档，并可以轻松的在Spring Boot中使用。该组织下的项目支持Swagger页面Oauth2登录（Open API3的内容），相较SpringFox来说，它的支撑时间更长，无疑是更好的选择。但由于国内发展较慢，在国内不容易看到太多有用的文档，不过可以访问它的官网。它使用了Swagger3（OpenAPI3），但Swagger3并未对Swagger2的注解做兼容，大部分注解都进行了大的变动，不易迁移，也因此，名气并不如SpringFox。

Swagger3|Swagger2|注解说明
:------:|:------:|:------:
@Tag(name = “接口类描述”)|@Api|Controller类
@Operation(summary =“接口方法描述”) |@ApiOperation|Controller方法
@Parameters|@ApiImplicitParams|Controller方法
@Parameter(description=“参数描述”)|@ApiImplicitParam、@ApiParam|Controller方法上 @Parameters、Controller方法的参数
@Parameter(hidden = true)、@Operation(hidden = true)、@Hidden|@ApiIgnore|排除或隐藏API
@Schema|@ApiModel、@ApiModelProperty|DTO实体、DTO实体属性

我们这里使用的是SpringFox的Swagger3实现，SpringDoc的Swagger3实现与SpringFox有很大差别

&emsp;

## SpringBoot基本配置

Spring和SpringBoot都集成了Swagger。

首先新建一个SpringBoot项目，使用Spring Initializr，名称选择swagger，组为org.didnelpsun，工件为swagger，软件包名称为org.didnelpsun，默认Jar打包方式。选择依赖项中，Developer Tools选择Spring Boot DevTools、Lombok、Spring Configuration Processor，Web选择Spring Web，SQL选择MyBatis Framework、MySQL Driver。最后完成。将主程序类改为Application.java，将主测试类改为ApplicationTests.java。

将application.properties改为yaml文件，添加数据库连接配置：

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/data
    username: root
    password: root
```

IDEA可以下载一个名为Swagger的插件。

&emsp;

## SpringFox版本

### &emsp;开启SpringFox Swagger

然后配置Swagger，需要依赖springfox-boot-starter：

```xml
<!-- https://mvnrepository.com/artifact/io.springfox/springfox-boot-starter -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
    <version>3.0.0</version>
</dependency>
```

yaml中配置Swagger：

```yaml
# Swagger配置
swagger:
  # 开启Swagger
  enable: true
  application-name: ${spring.application.name}
  application-version: 1.0
  try-host: http://localhost:${server.port}
```

org.didnelpsun下新建一个controller包，再新建一个UserController：

```java
// UserController.java
package org.didnelpsun.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
    @RequestMapping("")
    public String index(){
        return "index";
    }
}
```

启动项目会报错：Cannot invoke "org.springframework.web.servlet.mvc.condition.PatternsRequestCondition.getPatterns()"，这是因为Springfox使用的路径匹配是基于AntPathMatcher的，而Spring Boot 2.6.0使用的是PathPatternMatcher。需要添加配置：

```yaml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant-path-matcher
```

访问<http://localhost:8080/swagger-ui/index.html#/>可以查看Swagger自动生成的默认文档。

![swagger][swagger]

最上面是Swagger信息，中间有basic-error-controller和user-controller为接口信息，最下面的Schemas为实体类信息。

### &emsp;SpringFox扫描配置

新建一个config包，下面新建一个SwaggerConfig对Swagger进行配置：

```java
// SwaggerConfig.java
package org.didnelpsun.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import java.util.ArrayList;

// 开发环境develop、测试环境test、生产环境master
// 只有开发模式和测试模式Swagger才有效
@Profile({"dev","test"})
@Configuration
public class SwaggerConfig {
    // 配置Swagger，Docket为文档插件
    @Bean
    public Docket docket(){
        // 点击Docket具体代码中查看有哪些配置可以修改
        // 首先新建一个Docket实例，传入的参数为Swagger的版本号，我们使用的是3.0版本所以传入OAS_30
        Docket docket = new Docket(DocumentationType.OAS_30);
        // 设置默认的API组的组名
        docket.groupName("group");
        // 修改Swagger头部信息，没有Setter所以只能通过构造器
        // 参数：
        // 文档标题
        // 文档介绍
        // 文档版本
        // 服务的组织的URL连接
        // 联系方式，是一个定义的实体类，有三个参数，第一个是作者名，第二个是作者网页，第三个是邮箱
        // 证件类型
        // 证件地址
        // 补充，默认为空
        docket.apiInfo(new ApiInfo("API文档", "项目Swagger文档", "0.0", "https://didnelpsun.github.io", new Contact("Didnelpsun", "https://didnelpsun.github.io", "didnelpsun@163.com"), "", "", new ArrayList<>()));
        // apis表示对哪些包进行扫描定位，RequestHandlerSelectors为请求处理选择器
        // basePackage：扫描包的类路径
        // any：扫描所有包
        // none：不扫描包
        // withClassAnnotation：通过类的注解扫描，如传入GetMapping.class会扫描所有标注@GeMapping的控制器
        // withMethodAnnotation：通过方法的注解扫描，如传入RestController.class会扫描所有标注@RestContorller的类下的控制器
        docket.select().apis(RequestHandlerSelectors.basePackage("org.didnelpsun.controller")).build();
        // paths表示过滤请求路径，PathSelectors为路径选择器
        // ant为ant风格的路径，之前SpringMVC中提到
        // /**表示所有路径都能被扫描
        docket.select().paths(PathSelectors.ant("/**"));
        return docket;
    }
}
```

此时再次访问<http://localhost:8080/swagger-ui/index.html#/user-controller>会发现只有一个user-controller了。

### &emsp;SpringFox文档分组

使用groupName方法可以对文档插件的组名进行设置，一个Docket设置一个组名，往往不同的实体需要设置不同的Docket。如操作User类的UserController中的所有方法都要放在User组中，设置一个Docket只扫描UserController并设置组名为User，其他的控制器也这样设置，这样就能对文档进行分组。

controller下新建一个AccountController：

```java
// AccountController.java
package org.didnelpsun.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/account")
public class AccountController {
    @RequestMapping("/test")
    public String test(){
        return "test";
    }
}
```

重新编写Config：

```java
// SwaggerConfig.java
package org.didnelpsun.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import java.util.ArrayList;

// 开发环境dev、测试环境test、生产环境prod
// 只有开发模式和测试模式Swagger才有效
@Profile({"dev","test"})
// 通过yaml文件注入
@ConfigurationProperties("swagger")
// 必须设置@Data为私有字段添加Setter/Getter方法，否则配置文件无法注入
@Data
@Configuration
public class SwaggerConfig {
    private String version;
    private String termsOfServiceUrl;
    private String name;
    private String url;
    private String email;
    private String license;
    private String licenseUrl;
    // 配置Swagger，Docket为文档插件
    @Bean
    public Docket userDocket(){
        // 点击Docket具体代码中查看有哪些配置可以修改
        // 首先新建一个Docket实例，传入的参数为Swagger的版本号，我们使用的是3.0版本所以传入OAS_30
        return new Docket(DocumentationType.OAS_30)
                // 设置默认的API组的组名
                .groupName("user")
                // 修改Swagger头部信息，没有Setter所以只能通过构造器
                // 参数：
                // 文档标题
                // 文档介绍
                // 文档版本
                // 服务的组织的URL连接
                // 联系方式，是一个定义的实体类，有三个参数，第一个是作者名，第二个是作者网页，第三个是邮箱
                // 证件类型
                // 证件地址
                // 补充，默认为空
                .apiInfo(new ApiInfo("API文档", "User用户类", version, termsOfServiceUrl, new Contact(name, url, email), license, licenseUrl, new ArrayList<>()))
                .select()
                // paths表示过滤请求路径，PathSelectors为路径选择器
                // ant为ant风格的路径，之前SpringMVC中提到
                // /**表示所有路径都能被扫描
                .paths(PathSelectors.ant("/user/**"))
                // apis表示对哪些包进行扫描定位，RequestHandlerSelectors为请求处理选择器
                // basePackage：扫描包的类路径
                // any：扫描所有包
                // none：不扫描包
                // withClassAnnotation：通过类的注解扫描，如传入GetMapping.class会扫描所有标注@GeMapping的控制器
                // withMethodAnnotation：通过方法的注解扫描，如传入RestController.class会扫描所有标注@RestContorller的类下的控制器
                .apis(RequestHandlerSelectors.basePackage("org.didnelpsun.controller")).build()
                ;
    }
    @Bean
    public Docket accountDocket(){
        return new Docket(DocumentationType.OAS_30)
                .groupName("account")
                .apiInfo(new ApiInfo("API文档", "Account账户类", version, termsOfServiceUrl, new Contact(name, url, email), license, licenseUrl, new ArrayList<>()))
                .select()
                .paths(PathSelectors.ant("/account/**"))
                .apis(RequestHandlerSelectors.basePackage("org.didnelpsun.controller")).build()
                ;
    }
}
```

添加Swagger的YAML配置：

```yaml
swagger:
  version: "0.0"
  termsOfServiceUrl: "https://didnelpsun.github.io"
  name: "Didnelpsun"
  url: "https://didnelpsun.github.io"
  email: "didnelpsun@163.com"
  license: ""
  licenseUrl: ""
```

这样就出现了两个组user和account，其中user只有UserController且没有/主页路径，因为被过滤了，account只有AccountController。

### &emsp;SpringFox配置生效环境

即在测试和开发环境下Swagger生效，生产模式下Swagger不生效，访问不到。

首先对SwaggerConfig添加@Profile注解表示当前配置只在测试和开发环境生效：

```java
// SwaggerConfig.java
package org.didnelpsun.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import java.util.ArrayList;

// 开发环境dev、测试环境test、生产环境prod
// 只有开发模式和测试模式Swagger才有效
@Profile({"dev","test"})
@Configuration
public class SwaggerConfig {
    // 配置Swagger，Docket为文档插件
    @Bean
    public Docket docket(){
        // 点击Docket具体代码中查看有哪些配置可以修改
        // 首先新建一个Docket实例，传入的参数为Swagger的版本号，我们使用的是3.0版本所以传入OAS_30
        return new Docket(DocumentationType.OAS_30)
                // 设置默认的API组的组名
                .groupName("user")
                // 修改Swagger头部信息，没有Setter所以只能通过构造器
                // 参数：
                // 文档标题
                // 文档介绍
                // 文档版本
                // 服务的组织的URL连接
                // 联系方式，是一个定义的实体类，有三个参数，第一个是作者名，第二个是作者网页，第三个是邮箱
                // 证件类型
                // 证件地址
                // 补充，默认为空
                .apiInfo(new ApiInfo("API文档", "项目Swagger文档", "0.0", "https://didnelpsun.github.io", new Contact("Didnelpsun", "https://didnelpsun.github.io", "didnelpsun@163.com"), "", "", new ArrayList<>()));
                // paths表示过滤请求路径，PathSelectors为路径选择器
                // ant为ant风格的路径，之前SpringMVC中提到
                // /**表示所有路径都能被扫描
                .paths(PathSelectors.ant("/user/**"))
                // apis表示对哪些包进行扫描定位，RequestHandlerSelectors为请求处理选择器
                // basePackage：扫描包的类路径
                // any：扫描所有包
                // none：不扫描包
                // withClassAnnotation：通过类的注解扫描，如传入GetMapping.class会扫描所有标注@GeMapping的控制器
                // withMethodAnnotation：通过方法的注解扫描，如传入RestController.class会扫描所有标注@RestContorller的类下的控制器
                .apis(RequestHandlerSelectors.basePackage("org.didnelpsun.controller")).build()
                ;
    }
}
```

<span style="color:orange">注意：</span>这里使用链式编程，只有这样配置才有效，如果把Docket实例单独拿出来一个个的set可能会无效，如单独配路径.paths的时候会全部匹配而不会管匹配的路径，因为条件是与操作，扫描包下所有方法和路径匹配与之后路径匹配就失效了。且最后一个必须是.build()方法，否则返回值不是Docket。

<span style="color:orange">注意：</span>此时的SwaggerConfig只对开发和测试环境有效，对生产环境无效，但是由于Swagger3是默认开启Swagger的，所以这样配置是无法在生产环境下关闭Swagger的，这样只能让生产环境下Swagger为默认扫描规则。

注解掉yaml文件中原来配置的所有Swagger内容，并添加环境配置：

```yaml
spring:
  # 环境配置
  profiles:
    active: dev
  # Swagger需要开启ant风格的路径匹配
  mvc:
    pathmatch:
      matching-strategy: ant-path-matcher
  # 数据库配置
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/data
    username: root
    password: root
---
# 不能有重复的键，所以用横线分割
# 开发环境
spring:
  config:
    activate:
      on-profile: dev
# Swagger配置
# 只在Swagger启用时生效
swagger:
  version: "0.0"
  termsOfServiceUrl: "https://didnelpsun.github.io"
  name: "Didnelpsun"
  url: "https://didnelpsun.github.io"
  email: "didnelpsun@163.com"
  license: ""
  licenseUrl: ""
---
# 生产环境
spring:
  config:
    activate:
      on-profile: prod
# 关闭Swagger视图，使用swagger.enable=false是无效的，那是Swagger2的设置方式
springfox:
  documentation:
    swagger-ui:
      enabled: false
```

### &emsp;SpringFox实体类

之前Schemas默认有ModelAndView和Model两个实体类，此时我们设置了Config后就没有了，那么以后怎么设置实体类呢？只要对应Docket扫描的控制器的方法的返回值中存在实体类，即`return user;`或`return List<User>`等，那么就会被Swagger扫描到。

如我们新建一个User类：

```java
// User.java
package org.didnelpsun.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.io.Serializable;
import java.util.Date;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable{
    private Integer id;
    private String name;
    private Date birthday;
    private String sex;
    private String address;
}
```

然后新建一个控制器方法：

```java
// UserController.java
package org.didnelpsun.controller;

import org.didnelpsun.bean.User;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class UserController {
    @RequestMapping("")
    public String index(){
        return "index";
    }
    @RequestMapping("/user")
    public User user(){
        return new User();
    }
}
```

再次访问<http://localhost:8080/swagger-ui/index.html#/>就能得到User的模型：

```txt
User{
    address string
    birthday string($date-time)
    id integer($int32)
    name string
    sex string
}
```

### &emsp;SpringFox请求类型

对于@RequestMapping标注的方法每一个都会产生GET、PUT、POST、DELETE、OPTIONS、HEAD、PATCH、TRACE几个请求方式。而我们一般只需要一个请求方式，所以我们一般都会明确指定请求方式，且开发也最好指定请求方式。

### &emsp;SpringFox注释

#### &emsp;&emsp;@ApiModel、@ApiModelProperty

可以使用@ApiModel标注实体类的介绍，一般用在请求参数无法使用@ApiImplicitParam注解进行描述的时候：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|String|类名|为模型提供备用名称
description|String|“”|提供详细的类描述
parent|Class<?> parent|Void.class|为模型提供父类以允许描述继承关系
discriminatory|String|“”|支持模型继承和多态，使用鉴别器的字段的名称，可以断言需要使用哪个子类型
subTypes|Class<?>[]|{}|从此模型继承的子类型数组
reference|String|“”|指定对应类型定义的引用，覆盖指定的任何其他元数据

@ApiModelProperty标注实体类字段的介绍：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|String|“”|属性简要说明
name|String|“”|运行覆盖属性的名称。重写属性名称
allowableValues|String|“”|限制参数可接收的值，三种方法，固定取值，固定范围
access|String|“”|过滤属性，参阅：io.swagger.core.filter.SwaggerSpecFilter
notes|String|“”|目前尚未使用
dataType|String|“”|参数的数据类型，可以是类名或原始数据类型，此值将覆盖从类属性读取的数据类型
required|boolean|false|是否为必传参数，false非必传参数；true必传参数
position|int|0|允许在模型中显示排序属性
hidden|boolean|false|隐藏模型属性，false不隐藏；true隐藏
example|String|“”|属性的示例值
readOnly|boolean|false|指定模型属性为只读，false非只读；true只读
reference|String|“”|指定对应类型定义的引用，覆盖指定的任何其他元数据
allowEmptyValue|boolean|false|允许传空值，false不允许传空值；true允许传空值

```java
// User.java
package org.didnelpsun.bean;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.io.Serializable;
import java.util.Date;

@ApiModel("用户实体类")
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable{
    @ApiModelProperty("用户ID")
    private Integer id;
    @ApiModelProperty("用户名")
    private String name;
    @ApiModelProperty("生日")
    private Date birthday;
    @ApiModelProperty("性别")
    private String sex;
    @ApiModelProperty("地址")
    private String address;
}
```

#### &emsp;&emsp;@Api、@ApiOperation、@ApiParam

可以在接口上使用@Api对控制类进行注释：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|String|“”|接口简要说明，120字符或更少
notes|String|“”|接口详细描述
tags|String[]|“”|tag 列表，可用于按自愿或任何其它限定符对操作进行逻辑分组
response|Class<?>|Void.class|接口返回类型
responseContainer|String|“”|声明包装响应的容器。有效值为 List、Set、Map，任何其它值都将被忽略
responseReference|String|“”|指定对响应类型的引用，本地/远程引用，并将覆盖任何其它指定的response()类
httpMethod|String|“”|请求方式:“GET”, “HEAD”, “POST”, “PUT”, “DELETE”, “OPTIONS” and “PATCH”，如果未指定则使用除"PATH"之外的其它所有
nickname|String|“”|第三方工具使用operationId来唯一表示此操作
produces|String|“”|采用逗号分隔的content types类型的返回数据，例如:application/json,application/xml
consumes|String|“”|采用逗号分隔的content types类型的入参数据类型，例如:application/json,application/xml
protocols|String|“”|指定协议类型：http、https、ws、wss多个协议使用逗号进行分隔
authorizations|Authorization[]|@Authorization(value = “”)|获取此操作的授权列表
hidden|boolean|false|是否隐藏操作列表中的操作
responseHeaders|ResponseHeader[]|@ResponseHeader(name = “”, response = Void.class)|指定response header信息列表
code|int|200|HTTP返回状态码
extensions|Extension[]|@Extension(properties = @ExtensionProperty(name = “”, value = “”))|可选的扩展数组

@ApiOperation对控制类方法方法进行注释，往往是HTTP方法：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|String|“”|接口方法简要说明，120字符或更少
notes|String|“”|接口方法详细描述
tags|String[]|“”|tag 列表，可用于按自愿或任何其它限定符对操作进行逻辑分组
response|Class<?>|Void.class|接口返回类型
responseContainer|String|“”|声明包装响应的容器。有效值为 List,Set,Map，任何其它值都将被忽略
responseReference|String|“”|指定对响应类型的引用，本地/远程引用，并将覆盖任何其它指定的response()类
httpMethod|String|“”|请求方式:“GET”, “HEAD”, “POST”, “PUT”, “DELETE”, “OPTIONS” and “PATCH”，如果未指定则使用除"PATH"之外的其它所有
nickname|String|“”|第三方工具使用operationId来唯一表示此操作
produces|String|“”|采用逗号分隔的content types类型的返回数据，例如：application/json,application/xml
consumes|String|“”|采用逗号分隔的content types类型的入参数据类型，例如：application/json,application/xml
protocols|String|“”|指定协议类型：http、https、ws、wss多个协议使用逗号进行分隔
authorizations|Authorization[]|@Authorization(value = “”)|获取此操作的授权列表
hidden|boolean|false|是否隐藏操作列表中的操作
responseHeaders|ResponseHeader[]|@ResponseHeader(name = “”, response = Void.class)|指定response header信息列表
code|int|200|HTTP返回状态码
extensions|Extension[]|@Extension(properties = @ExtensionProperty(name = “”, value = “”))|可选的扩展数组

@ApiParam用于方法，参数，字段说明，该注解在post请求参数时，参数名不显示：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
name|String|“”|参数名称，参数名称将从filed/method/parameter名称中派生，但你可以覆盖它，路径参数必须始终命名为它们所代表的路径部分
value|String|“”|参数简单描述
defaultValue|String|“”|描述参数默认值
allowableValues|String|“”|可接收参数值限制，有三种方式，取值列表，取值范围
required|boolean|false|是否为必传参数, false非必传；true必传
access|String|“”|参数过滤，请参阅:io.swagger.core.filter.SwaggerSpecFilter
allowMultiple|boolean|false|指定参数是否可以通过多次出现来接收多个值
hidden|boolean|false|隐藏参数列表中的参数
example|String|“”|非请求体body类型的单个参数示例
examples|Example|@Example(value = @ExampleProperty(mediaType = “”, value = “”))|参数示例，仅适用于请求体类型的请求
type|String|“”|添加覆盖检测到类型的功能
format|String|“”|添加提供自定义format格式的功能
allowEmptyValue|boolean|false|添加将格式设置为空的功能
readOnly|boolean|false|添加被指定为只读的能力
collectionFormat|String|“”|添加使用array类型覆盖collectionFormat的功能

<span style="color:orange">注意：</span>由于@Api的description属性被弃用，应该由tags代替它的功能，需要在SwaggerConfig中指定每个Docket所需要的标签，然后在控制类上引用配置的标签：

```java
// SwaggerConfig.java
package org.didnelpsun.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.service.Tag;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import java.util.ArrayList;

// 开发环境dev、测试环境test、生产环境prod
// 只有开发模式和测试模式Swagger才有效
@Profile({"dev","test"})
// 通过yaml文件注入
@ConfigurationProperties("swagger")
// 必须设置@Data为私有字段添加Setter/Getter方法，否则配置文件无法注入
@Data
@Configuration
public class SwaggerConfig {
    private String version;
    private String termsOfServiceUrl;
    private String name;
    private String url;
    private String email;
    private String license;
    private String licenseUrl;
    // 设置静态成员Tag来引用
    public static final String userTag = "UserController";
    public static final String accountTag = "AccountController";
    // 配置Swagger，Docket为文档插件
    @Bean
    public Docket userDocket(){
        // 点击Docket具体代码中查看有哪些配置可以修改
        // 首先新建一个Docket实例，传入的参数为Swagger的版本号，我们使用的是3.0版本所以传入OAS_30
        return new Docket(DocumentationType.OAS_30)
                // 设置默认的API组的组名
                .groupName("user")
                // 修改Swagger头部信息，没有Setter所以只能通过构造器
                // 参数：
                // 文档标题
                // 文档介绍
                // 文档版本
                // 服务的组织的URL连接
                // 联系方式，是一个定义的实体类，有三个参数，第一个是作者名，第二个是作者网页，第三个是邮箱
                // 证件类型
                // 证件地址
                // 补充，默认为空
                .apiInfo(new ApiInfo("API文档", "User用户类", version, termsOfServiceUrl, new Contact(name, url, email), license, licenseUrl, new ArrayList<>()))
                .select()
                // paths表示过滤请求路径，PathSelectors为路径选择器
                // ant为ant风格的路径，之前SpringMVC中提到
                // /**表示所有路径都能被扫描
                .paths(PathSelectors.ant("/user/**"))
                // apis表示对哪些包进行扫描定位，RequestHandlerSelectors为请求处理选择器
                // basePackage：扫描包的类路径
                // any：扫描所有包
                // none：不扫描包
                // withClassAnnotation：通过类的注解扫描，如传入GetMapping.class会扫描所有标注@GeMapping的控制器
                // withMethodAnnotation：通过方法的注解扫描，如传入RestController.class会扫描所有标注@RestContorller的类下的控制器
                .apis(RequestHandlerSelectors.basePackage("org.didnelpsun.controller")).build()
                // 添加标签
                // 两个string值，分别为名称和描述
                .tags(new Tag(SwaggerConfig.userTag,"用户控制类"))
                ;
    }
    @Bean
    public Docket accountDocket(){
        return new Docket(DocumentationType.OAS_30)
                .groupName("account")
                .apiInfo(new ApiInfo("API文档", "Account账户类", version, termsOfServiceUrl, new Contact(name, url, email), license, licenseUrl, new ArrayList<>()))
                .select()
                .paths(PathSelectors.ant("/account/**"))
                .apis(RequestHandlerSelectors.basePackage("org.didnelpsun.controller")).build()
                .tags(new Tag(SwaggerConfig.accountTag, "账户控制类"))
                ;
    }
}
```

然后在扫描的控制器的@Api的tags属性中引用设置的tag的name属性，就能引用配置的tag，可以直接用字符串字面量也可以在Config中定义静态成员来引用：

```java
// UserController.java
package org.didnelpsun.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.didnelpsun.bean.User;
import org.didnelpsun.config.SwaggerConfig;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import springfox.documentation.annotations.ApiIgnore;

// value的值不会显示，为这个API的说明值
// tags的值会显示在最左边的粗体，如果tags中有多个值会有多个标签组，每个标签里面有该接口的所有方法
// description的值会显示在粗体旁边的说明，但是被弃用
// 在swagger-annotations jar包中1.5.X版本以上, 注解io.swagger.annotations.API中的description被废弃了。
// 新的swagger组件中使用了新的方法来对Web api进行分组。原来使用description，默认一个Controller类中包含的方法构成一 个api分组。现在使用tag，可以更加方便的分组。
// 比如把两个Controller类里的方法划分成同一个分组。tag的key用来区分不同的分组。tag的value用做分组的描述。
@Api(tags = {SwaggerConfig.userTag}, value = "UserController")
@RestController
@RequestMapping("/")
public class UserController {
    @ApiOperation(value = "主页", notes = "主页面")
    // @ApiOperation中value是api的简要说明，在界面api链接的右侧，少于120个字符。
    // @ApiOperation中notes是api的详细说明，需要点开api链接才能看到。
    // @ApiOperation中produces用来标记api返回值的具体类型。这里是json格式，utf8编码。
    // @ApiOperation中httpMethod为接口请求方式
    @RequestMapping("")
    public String index(){
        return "index";
    }
    @ApiOperation(value = "返回新用户", notes = "返回的新用户是一个无参构造类")
    @RequestMapping("/user")
    public User user(){
        return new User();
    }
    @ApiOperation(value = "返回新用户并设置用户名", notes = "返回的新用户是含有name")
    @RequestMapping("/user/{name}")
    public User user(@PathVariable @ApiParam("用户名") String name){
        User user = new User();
        user.setName(name);
        return user;
    }
}
```

```java
// AccountController.java
package org.didnelpsun.controller;

import io.swagger.annotations.Api;
import org.didnelpsun.config.SwaggerConfig;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = {SwaggerConfig.accountTag})
@RestController()
@RequestMapping("/account")
public class AccountController {
    @RequestMapping("/test")
    public String test(){
        return "test";
    }
}
```

#### &emsp;&emsp;@ApiImplicitParam、@ApiImplicitParams

@ApiImplicitParams在控制器方法上来指定请求参数。

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|ApiImplicitParam[]||API 可用的参数列表

@ApiImplicitParam在控制器方法上对方法参数的具体说明，用在方法上@ApiImplicitParams之内，该注解在get，post请求参数时，参数名均正常显示。

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
name|String|“”|参数名称(实体类字段名称)
value|String|“”|参数简要说明
defaultValue|String|“”|描述参数的默认值
allowableValues|String|“”|限制此参数接收的值，可使用的值或值得范围
required|boolean|false|指定是否为必填参数，false非必传参数；true必传参数
access|String|“”|参数过滤，参考：io.swagger.core.filter.SwaggerSpecFilte
allowMultiple|boolean|false|指定参数是否可以通过多次出现来接收多个值
dataType|String|“”|参数的数据类型，可以使类名或原始数据类型
dataTypeClass|Class<?>|Void.class|参数的类，如果提供则覆盖dataType
paramType|String|“”|参数的请求类型，有效值为path、query、body、header、form
example|String|“”|非请求体body参数的单个请求示例
examples|Example|@Example(value = @ExampleProperty(mediaType = “”, value = “”))|参数示例，仅适用于请求体类型的BodyParameters
type|String|“”|添加覆盖检测到的类型的功能
format|String|“”|添加提供自定义格式的功能
allowEmptyValue|boolean|false|添加将format设置为空的功能
readOnly|boolean|false|添加被指定为只读的能力
collectionFormat|String|“”|添加使用array类型collectionFormat的功能

+ 单独使用的时候，表示单个请求参数。
+ 和@ApiImplicitParams组合时候，表示多个请求参数。

@ApiParam和@ApiImplicitParam的功能是相同的，@ApiParam在参数前注解，@ApiImplicitParam在方法上对参数注解。但是@ApiImplicitParam的适用范围更广。在非JAX-RS的场合（比如使用servlet提供HTTP接口），只能使用@ApiImplicitParam进行参数说明。我认为，这是因为接口并不显式展示入参的名称，所以没有地方去使用@ApiParam，只能在接口的方法声明下方写@ApiImplicitParam。

AccountController下添加一个控制器方法：

```java
@GetMapping("/{id}/{name}")
@ApiImplicitParams({
        @ApiImplicitParam(name = "id", value = "账户ID", required = true, paramType = "path", dataType = "String"),
        @ApiImplicitParam(name = "name", value = "账户名", required = true, paramType = "path", dataType = "String")
})
public String account(@PathVariable Integer id, @PathVariable String name){
    return id+name;
}
```

#### &emsp;&emsp;@ApiResponse、@ApiResponses、@ResponseHeader

我们点击Swagger的每个控制器方法的具体信息，会看到Responses中有对应的状态码和介绍信息，那么我们如何配置这些信息？

@ApiResponses用在控制器方法上，表示一组响应情况：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|ApiResponse[]||ApiResponse列表

@ApiResponse用在@ApiResponses中，描述操作的可能响应，这可用于描述 Rest API 调用中可能的成功和错误code码。此注解可以在方法或类级别应用；仅当在方法级别或抛出时未定义相同代码的@ApiResponse注解时才会解析类级别注解异常，如果响应中使用了不同的响应类，则可以通过将响应类于响应码组合使用。注意swagger不允许单个响应代码的多个响应类型。此注解不直接使用，单独使用时Swagger不会解析，应该和ApiResponses组合使用：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
code|int||响应的HTTP状态码
message|String||伴随响应的人类可读的消息
response|Class<?>|Void.class|用于描述消息有效负载的可选响应类，对应于响应消息对象的schema 字段
reference|String|“”|指定对响应类型的引用，指定的应用可以使本地引用，也可以是远程引用，将按原样使用，并将覆盖任何指定的response()类
responseHeaders|ResponseHeader[]|@ResponseHeader(name = “”, response = Void.class)|可能响应的header列表
responseContainer|String|“”|声明响应的容器，有效值为List、Set、Map，任何其他值都将被忽略

@ResponseHeader作为@ApiResponse的属性responseHeaders，作为返回数据的一部分，指定返回header信息：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
name|String|“”|响应头名
description|String|“”|响应头详细描述
response|Class<?>|Void.class|响应头返回数据类型
responseContainer|String|“”|声明包装响应的容器，有效值为List或Set，任何其他值都将被覆盖

给刚刚添加的account方法上添加：

```java
@ApiResponses({
        @ApiResponse(code = 200,message = "账户测试成功！", responseHeaders = @ResponseHeader(name = "TestHeader", description = "测试响应头部")),
        @ApiResponse(code = 400, message = "参数不完整"),
        @ApiResponse(code = 401, message = "用户未授权，请登录"),
        @ApiResponse(code = 403, message = "用户没有权限访问"),
        @ApiResponse(code = 404, message = "路径出错"),
        @ApiResponse(code = 500, message = "参数异常")
})
```

#### &emsp;&emsp;@Authorization、@AuthorizationScope

@Authorization指接口授权，不单独使用，作为@Api或@ApiOperation的属性使用，定义要在资源或操作上使用的授权方案。使用的授权方案需要首先在Swagger各级别声明。此注解不直接使用，Swagger不会解析：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|String|“”|要在此资源/操作上使用的授权方案名称。必须在资源列表的授权部分中定义名称
scopes|AuthorizationScope[]|@AuthorizationScope(scope = “”, description = “”)|授权方案为OAuth2时使用的范围

@AuthorizationScope接口授权范围使用，描述 OAuth2 授权范围，不单独使用，作为@Authorization的属性使用：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
scope|String|“”|要使用的 OAuth2 授权方案的范围。范围应事先在Swagger对象的securityDefinition部分中声明
description|String|“”|在1.5.X中使用，保留用于旧版本的支持

#### &emsp;&emsp;@ApiIgnore

@ApiIgnore用于类、方法、参数上，可以不被Swagger显示在页面上，使用比较简单，只有一个value值。

隐藏某个类还可以用@Api注解自带的hidden属性设为true（实际上这个方法不生效），隐藏某个方法还可以用@APIOperation注解自带的hidden属性设为true，隐藏某个字段还可以用@ApiModelProperty注解自带的hidden属性。

#### &emsp;&emsp;@SwaggerDefinition、@ExternalDocs

@SwaggerDefinition定义Swagger生成的UI界面时使用，在接口或类上使用，配置定义metadata level的注解。尽管他提供了很多属性，但是在绝大多数情况下可以通过配置类解决的问题都不会用@SwaggerDefinition注解：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
host|String|“”|要在生成的Swagger定义中指定的主机
basePath|String|“”|指定生成的Swagger文档定义basePath
consumes|String[]|“”|采用逗号分隔的content types类型的入参数据类型，例如：application/json,application/xml
produces|String[]|“”|采用逗号分隔的content types类型的返回数据类型，例如：application/json,application/xml
schemes|Scheme[]|Scheme.DEFAULT|API的传输协议
tags|Tag[]|@Tag(name = “”)|该属性就是对项目中所有的接口，添加分组类型描述，即在全局层面定义接口的所属分组类型，@Api的tags属性可以代替
securityDefinition|SecurityDefinition|@SecurityDefinition()|安全方案的定义
info|Info|@Info(title = “”, version = “”)|为Swagger定义常规元数据
externalDocs|ExternalDocs|@ExternalDocs(url = “”)|外部文档的地址，使用@ExternalDocs注解

@ExternalDocs使用外部文档说明的时候使用，参数，方法，属性上可使用：

属性名称|数据类型|默认值|说明
:------:|:------:|:----:|:--:
value|String|“”|目标文档的简要描述，GFM语法可用于富文本表示
url|String|“”|引用文档的URL

[Swagger的SpringFox版本：SpringBoot/swagger_springfox](https://github.com/Didnelpsun/SpringBoot/tree/master/swagger_springfox)。

&emsp;

## SpringDoc版本

相关文档在[SpringDoc官方网址](https://springdoc.org/)。

首先按照SpringBoot基本配置重新新建一个Swagger项目。

### &emsp;开启SpringDoc Swagger

然后导入springdoc-openapi-ui依赖：

```xml
<!-- https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-ui -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.6.6</version>
</dependency>
```

如果以后需要编写响应式编程就需要：

```xml
<!-- https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-webflux-ui -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-webflux-ui</artifactId>
    <version>1.6.6</version>
</dependency>
```

然后org.didnelpsun下新建controller，再新建一个UserController：

```java
// UserController.java
package org.didnelpsun.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
    @RequestMapping("/")
    public String index(){
        return "index";
    }
}
```

AccountController：

```java
// AccountController.java
package org.didnelpsun.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/account")
public class AccountController {
    @GetMapping("test/{name}")
    public String test(@PathVariable String name){
        return name;
    }
}
```

然后直接访问<http://localhost:8080/swagger-ui/index.html#/>。

访问<http://localhost:8080/v3/api-docs>可以获得OpenAPI描述。

如果想自定义Swagger UI位置可以配置：springdoc.swagger-ui.path=/swagger-ui.html。

### &emsp;SpringDoc扫描配置

config包下新建一个OpenApiConfig。如果只有一个组，可以使用OpenAPI来替代Swagger的Docket类：

```java
package org.didnelpsun.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI openAPI(){
        return new OpenAPI()
                // 设置OpenAPI基本信息
                .info(new Info()
                        .title("OpenAPI文档")
                        .description("SpringDoc版本的Swagger3")
                        .version("0.0")
                        // 设置证明
                        .license(new License()
                                .name("")
                                .url("")
                        )
                )
                // 设置外部文档信息
                .externalDocs(new ExternalDocumentation()
                        .description("作者网页")
                        .url("https://didnelpsun.github.io")
                );
    }
}
```

由于OpenAPI不支持配置扫描路径，所以需要然后在yaml配置文件中直接指定扫描包路径和扫描访问路径：

```yaml
# Swagger扫描路径
springdoc:
  packages-to-scan:
    - org.didnelpsun.controller
  paths-to-match:
    - /user/**
    - /account/**
```

这样就只会扫描/user和/account。

### &emsp;SpringDoc文档分组

如果有多个文档组，就不能使用OpenAPI，而需要使用GroupedOpenApi：

```java
package org.didnelpsun.config;

import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    // 配置User组
    @Bean
    public GroupedOpenApi userOpenApi(){
        // 使用GroupedOpenApi的静态工厂构建实例
        return GroupedOpenApi.builder()
                // 组名
                .group("user")
                // 扫描包路径
                .packagesToScan("org.didnelpsun.controller")
                // 配置匹配路径
                .pathsToMatch("/user/**")
                .pathsToMatch("/")
                .build();
    }
    // 配置Account组
    @Bean
    public GroupedOpenApi accountOpenApi(){
        return GroupedOpenApi.builder()
                .group("account")
                .packagesToScan("org.didnelpsun.controller")
                .pathsToMatch("/account/**")
                .build();
    }
}
```

并在yaml中把刚才配置的扫描路径给注释掉，不然分组会混乱。不错GroupedOpenApi没有info方法，所以这里设置不了apiinfo信息。

### &emsp;SpringDoc配置生效环境

和SpringFox配置生效环境类似，只需要在OpenApiConfig类上添加`@Profile({"dev","test"})`，然后修改YAML配置文件：

```yaml
spring:
  # 环境配置
  profiles:
    active: dev
  # 数据库配置
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/data
    username: root
    password: root
---
# 开发环境
spring:
  config:
    activate:
      on-profile: dev
---
# 生产环境
spring:
  config:
    activate:
      on-profile: prod
springdoc:
  swagger-ui:
    enabled: false
```

### &emsp;SpringDoc注释

用Swagger 3注释替换Swagger 2注释（它已经包含在springdoc-openapi-ui依赖项中）。Swagger 3注释的包是io.swagger.v3.oas.annotations：

Swagger2|Swagger3
:------:|:------:
@Api|@Tag
@ApiIgnore|@Parameter(hidden = true)或@Operation(hidden = true)或@Hidden
@ApiImplicitParam|@Parameter
@ApiImplicitParams|@Parameters
@ApiModel|@Schema
@ApiModelProperty(hidden = true)|@Schema(accessMode = READ_ONLY)
@ApiModelProperty|@Schema
@ApiOperation(value = "foo", notes = "bar")|@Operation(summary = "foo", description = "bar"）
@ApiParam|@Parameter
@ApiResponse(code = 404, message = "foo")|@ApiResponse(responseCode = "404", description = "foo")

基本使用方式不变。

[Swagger的SpringDoc版本：SpringBoot/swagger_springdoc](https://github.com/Didnelpsun/SpringBoot/tree/master/swagger_springdoc)。

&emsp;

## 测试

Swagger提供Postman的测试功能，后端程序员可以直接在Swagger上对接口进行测试。

点击每个请求接口的，出现的卡片右上角的Try it out就是测试按钮，点击：

![测试][tryitout]

可以直接在name中写入测试的参数，如填写name为test，点击Execute就是发送接口请求进行测试：

![响应][response]

Curl是一个利用URL语法在命令行下工作的文件传输工具，旁边的字符串为cURL传输的指令。

Request URL就是请求路径。

Server response就是响应接口，code为状态码，Response Body为响应主体，即服务器返回的数据，下面的Response headers就是响应头。

最后点击输入参数下面的Execute就是继续执行测试，Clear就是清除参数，Cancel就是取消测试。

&emsp;

## 文档

### &emsp;使用Swagger Editor

首先Swagger提供了一个[官方Swagger编辑器](https://github.com/swagger-api/swagger-editor/releases)，选择一个版本进行下载，使用zip格式，然后解压这个文件到一个地方。

需要安装node和npm。

还需要下载http-server：`npm install -g http-server`。

到npm全局包安装路径下，我的是D:\Nodejs\node_global，在这个目录下打开命令行，输入命令`http-server "SwaggerEditor解压文件夹路径"`，如我的是`http-server "D:\SwaggerEditor\swagger-editor-4.2.0"`。

如果不想本地安装，也可以使用[官方在线Swagger编辑器](https://editor.swagger.io/)。

将自己的Swagger文档粘贴到左边就可以了。

然后就启动了，在<http://127.0.0.1:8081>。

### &emsp;自定义Swagger文档

SpringBoot自动集成了Swagger，主要是程序会自动运行根据注解查看生成Swagger文档。如果我们在IDEA下载一个Swagger插件，那么我们右键新建，会出现一个Swagger/OpenAPI File的选项，有四个选项，以YAML或JSON编写Swagger或OpenAPI文档。IDEA会给我们一个默认Swagger文档。

其中Swagger2叫Swagger，Swagger3叫OpenAPI。

```yaml
# Swagger文档的版本，这里是固定的2.0，不能修改成别的
swagger: "2.0"
# 定义Swagger的头部信息
info:
  # 整个API文档的粗体标题
  title: API文档
  # 维护这个服务文档的组织的联系网址
  termsOfService: https://didnelpsun.github.io
  # 关于API文档的介绍，在粗体文字的下面
  description: Swagger生成的API文档
  # 文档作者联系方式
  contact:
    # 电子邮件
    email: didnelpsun@163.com
  # 证书
  license:
    name: Apache 3.0
    url: http://www.apache.org/licenses/LICENSE-2.0.html
  # API文档的版本号，在title的旁边的一个灰色气泡中
  version: 0.0.0
# 项目基础路径
host: api.didnelpsun.org
# API路径前缀
basePath: /api
# 外部文档信息
externalDocs:
  # 介绍
  description: Didnelpsun
  # 地址
  url: https://didnelpsun.github.io
# 标签组，需要下面的paths对标签进行引用
tags:
  # 标签组名
- name: User
  description: 用户处理
  # 对于该处理类的外部说明文档
  externalDocs:
    # 外部文档介绍
    description: 用户信息
    # 网布文档路径
    url: https://didnelpsun.github.io
- name: Account
  description: 账户处理
  externalDocs:
    description: 账户信息
    url: https://didnelpsun.github.io
- name: Role
  description: 角色管理
  externalDocs:
    description: 角色信息
    url: https://didnelpsun.github.io
# 允许的模式为HTTPS
schemes:
  - https
  - http
# 请求路径组，下面的每一个路径都是单独的路径
paths:
  # 请求路径
  /users:
   # 请求类型，为GET类型
    get:
      # 这个请求所在的标签组，即这个路径应该放在哪个标签组中，一个请求路径可能放在多个标签组中
      tags:
      - User
      # 对这个请求方法的总结，在不展开列表的信息上
      summary: 返回所有用户信息
      # 对这个请求方法的介绍，在展开详情的页面上
      description: 返回所有用户信息，不进行分页和其他操作
      # 这个操作的ID
      operationId: selectAllUsers
      # 返回值类型
      produces:
      # - "application/xml"
      - "application/json"
      # 响应数据
      responses:
        # 响应码
        200:
          # 响应信息
          description: OK
          # 响应实体
          schema:
            # 类型为数组
            type: array
            items:
              # 这里必须使用双引号进行转移，表示对定义实体类的引用
              # 引用后会自动根据Model给一个实例
              $ref: "#/definitions/User"
      # 该请求路径是否被废弃
      deprecated: true
  /users/{currentPage}:
    get:
      tags:
        - User
      summary: 返回对应页面的用户信息
      description: 返回所有用户信息，进行分页
      operationId: selectUsersByPage
      # 请求参数类型，默认为application/json
      consumes:
      # - "application/json"
      - integer
      # 请求参数
      parameters:
        # 参数来源方式，body请求体, header请求头, formData表单数据, query查询数据, path路径参数
      - in: path
        # 参数名
        name: currentPage
        # 参数类型
        type: integer
        # 参数介绍
        description: 当前页码数
        # 是否必须
        required: true
      responses:
        200:
          description: OK
          schema:
            type: array
            items:
              $ref: "#/definitions/Users"
      # 定义当前API的安全支持
      security:
      - DidnelpsunOAuth2:
        - read
        - write
  /account/{id}:
    get:
      tags:
        - Account
      summary: 获取账户信息
      description: 根据ID获取账户信息
      operationId: selectUser
      consumes:
      - integer
      parameters:
      - in: path
        name: id
        type: integer
        description: 账户ID
        required: true
      responses:
        200:
          description: OK
          schema:
            type: array
            items:
              $ref: "#/definitions/Account"
    put:
      tags:
        - Account
      summary: 更新账户信息
      description: 根据ID更新账户信息
      operationId: updateUser
      consumes:
      - integer
      parameters:
      - in: path
        name: id
        type: integer
        description: 账户ID
        required: true
      - in: body
        name: account
        description: 账户信息
        # 如果是直接引用就不需要添加type属性
        schema: 
          $ref: "#/definitions/Account"
        required: true
      responses:
        200:
          description: OK
          schema:
            type: boolean
            default: true
    delete:
      tags:
        - Account
      summary: 删除账户信息
      description: 根据ID删除账户信息
      operationId: deleteUser
      consumes:
      - integer
      parameters:
      - in: path
        name: id
        type: integer
        description: 账户ID
        required: true
      responses:
        200:
          description: OK
          schema:
            type: boolean
            default: true
  /account:
    post:
      tags:
        - Account
      summary: 添加账户信息
      description: 根据ID添加账户信息
      operationId: insertUser
      consumes:
      - integer
      parameters:
      - in: body
        name: account
        schema: 
          $ref: "#/definitions/Account"
        description: 账户信息
        required: true
      responses:
        200:
          description: OK
          # 返回新增账户ID
          schema:
            type: integer
  /role/{id}:
    get:
      tags:
        - Role
      summary: 获取角色信息
      description: 根据ID获取角色信息
      operationId: selectRole
      consumes:
      - integer
      parameters:
      - in: path
        name: id
        type: integer
        description: 角色ID
        required: true
      responses:
        200:
          description: OK
          schema:
            $ref: "#/definitions/Role"
# 安全定义
# 在API中使用的身份验证关键词：securityDefinitions和security
# 目前API支持的三种认证方法：
# 基本认证 - BasicAuth
# API密钥 - ApiKey
# OAuth2 公共流程
securityDefinitions:
  DidnelpsunBasicAuth:
    type: basic
  DidnelpsunApiKey:
    type: apiKey
    name: DidnelpsunApiKey
    # 在头部认证
    in: header
  DidnelpsunOAuth2:
    type: oauth2
    authorizationUrl: http://petstore.swagger.io/oauth/dialog
    flow: implicit
    scopes:
      write: 写支持
      read: 读支持
      admin: 管理支持
# 全局安全配置
security:
  - DidnelpsunBasicAuth: []
  - DidnelpsunApiKey: []
# 定义的Model实体类
definitions:
  # 实体类名称
  User: 
    # 实体类类型，允许的名称为：array, boolean, integer, number, object, string
    type: object
    # 实体类介绍
    description: 用户
    # 对象的参数
    properties:
      # 参数名
      id:
        # 参数类型
        type: integer
        # 具体的参数形式
        format: int32
        # 参数介绍
        description: 用户ID
      name:
        type: string
        description: 用户名
      birthday:
        type: string
        # 时间类型转换为String类型
        format: date-time
        description: 生日
      sex:
        type: boolean
        description: 性别
        # 默认值
        default: true
      address:
        type: string
        description: 地址
    # 定义的这个实体变为XML对象的实体名
    xml:
      name: User
  Users:
    type: object
    description: 用户列表，包含分页信息
    properties:
      users:
        type: array
        items:
          $ref: "#/definitions/User"
        description: 用户列表信息
      currentPage:
        type: integer
        format: int32
        description: 当前页面页码
      totalPages:
        type: integer
        format: int32
        description: 页面页码总数
  Account:
    type: object
    description: 账户
    properties:
      id:
        type: integer
        format: int32
        description: 账户ID
      name:
        type: string
        description: 账户名
      userid:
        type: integer
        format: int32
        description: 用户ID
      money:
        type: integer
        format: int64
        description: 账户余额
  Role:
    type: object
    description: 角色
    properties:
      id:
        type: integer
        description: 角色ID
        # 枚举值
        enum:
        - 1
        - 2
        - 3
      name:
        type: string
        description: 角色名
    xml:
      name: Role
```

[swagger]:data:image/png;base64,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CCCAAAIIIIAAAgggUPkCRM+V/x4wAwQQQAABBBBAAAEEEEAAAQQQQAABBBBAoIYJED3XsDeU20EAAQQQQAABBBBAAAEEEEAAAQQQQAABBCpfgOi58t8DZoAAAggggAACCCCAAAIIIIAAAggggAACCNQwAaLnGvaGcjsIIIAAAggggAACCCCAAAIIIIAAAggggEDlC1xSXFxc+bNgBggggAACCCCAAAIIIIAAAggggAACCCCAAAJVSeDUqVO+TIdVz77o0RYBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEDARIDo2QSFIgQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAFfBIiefdGjLQIIIIAAAggggAACCCCAAAIIIIAAAggggICJANGzCQpFCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAr4IED37okdbBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAARMBomcTFIoQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEfBEgevZFj7YIIIAAAggggAACCCCAAAIIIIAAAggggAACJgJEzyYoFCGAAAIIIIAAAggggAACCCCAAAIIIIAAAgj4IkD07IsebRFAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQRMBIieTVAoQgABBBBAAAEEEEAAAQQQQAABBBBAAAEEEPBFgOjZFz3aIoAAAggggAACCCCAAAIIIIAAAggggAACCJgIED2boFCEAAIIIIAAAggggAACCCCAAAIIIIAAAggg4IsA0bMverRFAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQMBEgejZBoQgBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEDAFwGiZ1/0aIsAAggggAACCCCAAAIIIIAAAggggAACCCBgIkD0bIJCEQIIIIAAAggggAACCCCAAAIIIIAAAggggIAvAkTPvujRFgEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQMBEgOjZBIUiBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAV8EiJ590aMtAggggAACCCCAAAIIIIAAAggggAACCCCAgIkA0bMJCkUIIIAAAggggAACCCCAAAIIIIAAAggggAACvggQPfuiR1sEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABEwGiZxMUihBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQR8ESB69kWPtggggAACCCCAAAIIIIAAAggggAACCCCAAAImAkTPJigUIYAAAggggAACCCCAAAIIIIAAAggggAACCPgiQPTsix5tEUAAAQQQQAABBBBAAAEEEEAAAQQQQAABBEwEiJ5NUChCAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQ8EWA6NkXPdoigAACCCCAAAIIIIAAAggggAACCCCAAAIImAgQPZugUIQAAggggAACCCCAAAIIIIAAAggggAACCCDgiwDRsy96tEUAAQQQQAABBBBAAAEEEEAAAQQQQAABBBAwESB6NkGhCAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQMAXAaJnX/RoiwACCCCAAAIIIIAAAggggAACCCCAAAIIIGAiQPRsgkIRAggggAACCCCAAAIIIIAAAggggAACCCCAgC8CRM++6NEWAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAwESA6NkEhSIEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABXwSInn3Roy0CCCCAAAIIIIAAAggggAACCCCAAAIIIICAiQDRswkKRQgggAACCCCAAAIIIIAAAggggAACCCCAAAK+CBA9+6JHWwQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAETAaJnExSKEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBHwRIHr2RY+2CCCAAAIIIIAAAggggAACCCCAAAIIIIAAAiYCRM8mKBQhgAACCCCAAAIIIIAAAggggAACCCCAAAII+CJA9OyLHm0RQAABBBBAAAEEEEAAAQQQQAABBBBAAAEETASInk1QKEIAAQQQQAABBBBAAAEEEEAAAQQQQAABBBDwRYDo2Rc92iKAAAIIIIAAAggggAACCCCAAAIIIIAAAgiYCBA9m6BQhAACCCCAAAIIIIAAAggggAACCCCAAAIIIOCLANGzL3q0RQABBBBAAAEEEEAAAQQQQAABBBBAAAEEEDARIHo2QaEIAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAwBcBomdf9GiLAAIIIIAAAggggAACCCCAAAIIIIAAAgggYCJA9GyCQhECCCCAAAIIIIAAAggggAACCCCAAAIIIICALwJEz77o0RYBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEDARIDo2QSFIgQQQAABBBBA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A9ziV/M16yauq9DskI/7JVDZe+4e1pu3sUvT0UYozQgQIECAAAECBAgQIECAAAECBAgcCgGrng+FunsSIECAAAECBAgQIECAAAECBAgQIECgUwsclrWeO/WMejgCBAgQIECAAAECBAgQIECAAAECBAi0X0Ct5/Yb6oEAAQIECBAgQIAAAQIECBAgQIAAAQIEOlJAwY2O1NQXAQIECBAgQIAAAQIECBAgQIAAAQIECAQB0bOvAQECBAgQIECAAAECBAgQIECAAAECBAh0sIDouYNBdUeAAAECBAgQIECAAAECBAgQIECAAAEComffAQIECBAgQIAAAQIECBAgQIAAAQIECBDoYAHRcweD6o4AAQIECBAgQIAAAQIECBAgQIAAAQIERM++AwQIECBAgAABAgQIECBAgAABAgQIECDQwQKi5w4G1R0BAgQIECBAgAABAgQIECBAgAABAgQIiJ59BwgQIECAAAECBAgQIECAAAECBAgQIECggwVEzx0MqjsCBAgQIECAAAECBAgQIECAAAECBAgQED37DhAgQIAAAQIECBAgQIAAAQIECBAgQIBABwuInjsYVHcECBAgQIAAAQIECBAgQIAAAQIECBAgIHr2HSBAgAABAgQIECBAgAABAgQIECBAgACBDhYQPXcwqO4IECBAgAABAgQIECBAgAABAgQIECBAQPTsO0CAAAECBAgQIECAAAECBAgQIECAAAECHSwgeu5gUN0RIECAAAECBAgQIECAAAECBAgQIECAgOjZd4AAAQIECBAgQIAAAQIECBAgQIAAAQIEOlhA9NzBoLojQIAAAQIECBAgQIAAAQIECBAgQIAAAdGz7wABAgQIECBAgAABAgQIECBAgAABAgQIdLCA6LmDQXVHgAABAgQIECBAgAABAgQIECBAgAABAqJn3wECBAgQIECAAAECBAgQIECAAAECBAgQ6GAB0XMHg+qOAAECBAgQIECAAAECBAgQIECAAAECBETPvgMECBAgQIAAAQIECBAgQIAAAQIECBAg0MECoucOBtUdAQIECBAgQIAAAQIECBAgQIAAAQIECIiefQcIECBAgAABAgQIECBAgAABAgQIECBAoIMFRM8dDKo7AgQIECBAgAABAgQIECBAgAABAgQIEBA9+w4QIECAAAECBAgQIECAAAECBAgQIECAQAcLiJ47GFR3BAgQ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nNnL72RIoeZGXG2j1TG0qAqd7XS/75vtwQ4BAgQIECBAgAABAgQIECBAgAABAoeJQCeLnqNhI8qGRLtnPbox+z69qG7Trcli4Q6a0a2zcnqr/XOohtHiXYKpO1X2nto/WrFs26yazJ3DSBaE5cbdxxd4uV+mTc7vpU/WVWcz9KSM9ZCBSXXmil5XxuuX81ZbL31yQ9ONcjrJ263sHlZqv/lyeEth17NaHUN51ehgGEp8NBnWLtwYj2S/75s3CB8IECBAgAABAgQIECBAgAABAgQIEOj8Aq0u2i3VR6/odc+E+uqHtiXFkZOH6FH2wNW92ljgog1P3XP8GRvHztyQaZlbfzlzLPN72CV959ZsHBu/JzB9qOq8vve0mvlmLsv8HnbJUS/O3DA28zFcm82sMz1vG7ss1O+It9yzqSOFfpafMbB+Vige3f+oYYVOp4+1MBxyao97kvcl7u9993AzpwgQIECAAAECBAgQIECAAAECBAgQ6IQCRzQ2NnbCx/JIBAgQIECAAAECBAgQIECAAAECBAgQINAOgYaGhnZcHXW2ghvtsXAtAQIECBAgQIAAAQIECBAgQIAAAQIECHSIgOi5Qxh1QoAAAQIECBAgQIAAAQIECBAgQIAAAQJNAqLnJgt7BAgQIECAAAECBAgQIECAAAECBAgQINAhAqLnDmHUCQECBAgQIECAAAECBAgQIECAAAECBAg0CYiemyzsESBAgAABAgQIECBAgAABAgQIECBAgECHCIieO4RRJwQIECBAgAABAgQIECBAgAABAgQIECDQJCB6brKwR4AAAQIECBAgQIAAAQIECBAgQIAAAQIdIiB67hBGnRAgQIAAAQIECBAgQIAAAQIECBAgQIBAk4DoucnCHgECBAgQIECAAAECBAgQIECAAAECBAh0iIDouUMYdUKAAAECBAgQIECAAAECBAgQIECAAAECTQKi5yYLewQIECBAgAABAgQIECBAgAABAgQIECDQIQKi5w5h1AkBAgQIECBAgAABAgQIECBAgAABAgQINAmInpss7BEgQIAAAQIECBAgQIAAAQIECBAgQIBAhwiInjuEUScECBAgQIAAAQIECBAgQIAAAQIECBAg0CQgem6ysEeAAAECBAgQIECAAAECBAgQIECAAAECHSIgeu4QRp0QIECAAAECBAgQIECAAAECBAgQIECAQJOA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e57YtQQIECBAgAABAgQIECBAgAABAgQIECBwgAVEzwcYWPcECBAgQIAAAQIECBAgQIAAAQIECBA4/AREz4ffnHtiAgQIECBAgAABAgQIECBAgAABAgQIHGCBTl3r+QDb6Z4AAQIECBAgQIAAAQIECBAgQIAAAQKdVUCt5846s56LAAECBAgQIECAAAECBAgQIECAAAECpSqg4EapzpxxEyBAgAABAgQIECBAgAABAgQIECBAoGgFRM9FOzUGRoAAAQIECBAgQIAAAQIECBAgQIAAgVIVED2X6swZNwECBAgQIECAAAECBAgQIECAAAECBIpWQPRctFNjYAQIECBAgAABAgQIECBAgAABAgQIEChVAdFzqc6ccRMgQIAAAQIECBAgQIAAAQIECBAgQKBoBUTPRTs1BkaAAAECBAgQIECAAAECBAgQIECAAIFSFRA9l+rMGTcBAgQIECBAgAABAgQIECBAgAABAgSKVkD0XLRTY2AECBAgQIAAAQIECBAgQIAAAQIECBAoVQHRc6nOnHETIECAAAECBAgQIECAAAECBAgQIECgaAVEz0U7NQZGgAABAgQIECBAgAABAgQIECBAgACBUhUQPZfqzBk3AQIECBAgQIAAAQIECBAgQIAAAQIEilZA9Fy0U2NgBAgQIECAAAECBAgQIECAAAECBAgQKFUB0XOpzpxxEyBAgAABAgQIECBAgAABAgQIECBAoGgFRM9FOzUGRoAAAQIECBAgQIAAAQIECBAgQIAAgVIVED2X6swZNwECBAgQIECAAAECBAgQIECAAAECBIpWQPRctFNjYAQIECBAgAABAgQIECBAgAABAgQIEChVAdFzqc6ccRMgQIAAAQIECBAgQIAAAQIECBAgQKBoBUTPRTs1BkaAAAECBAgQIECAAAECBAgQIECAAIFSFRA9l+rMGTcBAgQIECBAgAABAgQIECBAgAABAgSKVkD0XLRTY2AECBAgQIAAAQIECBAgQIAAAQIECBAoVQHRc6nOnHETIECAAAECBAgQIECAAAECBAgQIECgaAVEz0U7NQZGgAABAgQIECBAgAABAgQIECBAgACBUhUQPZfqzBk3AQIECBAgQIAAAQIECBAgQIAAAQIEilZA9Fy0U2NgBAgQIECAAAECBAgQIECAAAECBAgQKFUB0XOpzpxxEyBAgAABAgQIECBAgAABAgQIECBAoGgFRM9FOzUGRoAAAQIECBAgQIAAAQIECBAgQIAAgVIVED2X6swZNwECBAgQIECAAAECBAgQIECAAAECBIpWQPRctFNjYAQIECBAgAABAgQIECBAgAABAgQIEChVAdFzqc6ccRMgQIAAAQIECBAgQIAAAQIECBAgQKBoBUTPRTs1BkaAAAECBAgQIECAAAECBAgQIECAAIFSFRA9l+rMGTcBAgQIECBAgAABAgQIECBAgAABAgSKVkD0XLRTY2AECBAgQIAAAQIECBAgQIAAAQIECBAoVQHRc6nOnHETIECAAAECBAgQIECAAAECBAgQIECgaAVEz0U7NQZGgAABAgQIECBAgAABAgQIECBAgACBUhUQPZfqzBk3AQIECBAgQIAAAQIECBAgQIAAAQIEilZA9Fy0U2NgBAgQIECAAAECBAgQIECAAAECBAgQKFUB0XOpzpxxEyBAgAABAgQIECBAgAABAgQIECBAoGgFRM9FOzUGRoAAAQIECBAgQIAAAQIECBAgQIAAgVIVED2X6swZNwECBAgQIECAAAECBAgQIECAAAECBIpWQPRctFNjYAQIECBAgAABAgQIECBAgAABAgQIEChVAdFzqc6ccRMgQIAAAQIECBAgQIAAAQIECBAgQKBoBUTPRTs1BkaAAAECBAgQIECAAAECBAgQIECAAIFSFRA9l+rMGTcBAgQIECBAgAABAgQIECBAgAABAgSKVkD0XLRTY2AECBAgQIAAAQIECBAgQIAAAQIECBAoVQHRc6nOnHETIECAAAECBAgQIECAAAECBAgQIECgaAVEz0U7NQZGgAABAgQIECBAgAABAgQIECBAgACBUhUQPZfqzBk3AQIECBAgQIAAAQIECBAgQIAAAQIEilZA9Fy0U2NgBAgQIECAAAECBAgQIECAAAECBAgQKFUB0XOpzpxxEyBAgAABAgQIECBAgAABAgQIECBAoGgFRM9FOzUGRoAAAQIECBAgQIAAAQIECBAgQIAAgVIVED2X6swZNwECBAgQIECAAAECBAgQIECAAAECBIpWQPRctFNjYAQIECBAgAABAgQIECBAgAABAgQIEChVAdFzqc6ccRMgQIAAAQIECBAgQIAAAQIECBAgQKBoBUTPRTs1BkaAAAECBAgQIECAAAECBAgQIECAAIFSFRA9l+rMGTcBAgQIECBAgAABAgQIECBAgAABAgSKVkD0XLRTY2AECBAgQIAAAQIECBAgQIAAAQIECBAoVQHRc6nOnHETIECAAAECBAgQIECAAAECBAgQIECgaAVEz0U7NQZGgAABAgQIECBAgAABAgQIECBAgACBUhUQPZfqzBk3AQIECBAgQIAAAQIECBAgQIAAAQIEilZA9Fy0U2NgBAgQIECAAAECBAgQIECAAAECBAgQKFUB0XOpzpxxEyBAgAABAgQIECBAgAABAgQIECBAoGgFuu7atatoB2dgBAgQIECAAAECBAgQIECAAAECBAgQIHDwBY444oh23vSI//qv/2pnFy4nQIAAAQIECBAgQIAAAQIECBAgQIAAgU4m8Pbbb7fniRTcaI+eawkQIECAAAECBAgQIECAAAECBAgQIECggIDouQCKQwQIECBAgAABAgQIECBAgAABAgQIECDQHgHRc3v0XEuAAAECBAgQIECAAAECBAgQIECAAAECBQREzwVQHCJAgAABAgQIECBAgAABAgQIECBAgACB9giIntuj51oCBAgQIECAAAECBAgQIECAAAECBAgQKCAgei6A4hABAgQIECBAgAABAgQIECBAgAABAgQItEdA9NwePdcSIECAAAECBAgQIECAAAECBAgQIECAQAEB0XMBFIcIECBAgAABAgQIECBAgAABAgQIECBAoD0Couf26LmWAAECBAgQIECAAAECBAgQIECAAAECPhExtwAAIABJREFUBAoIiJ4LoDhEgAABAgQIECBAgAABAgQIECBAgAABAu0RED23R8+1BAgQIECAAAECBAgQIECAAAECBAgQIFBAQPRcAMUhAgQIECBAgAABAgQIECBAgAABAgQIEGiPgOi5PXquJUCAAAECBAgQIECAAAECBAgQIECAAIECAqLnAigOESBAgAABAgQIECBAgAABAgQIECBAgEB7BETP7dFzLQECBAgQIECAAAECBAgQIECAAAECBAgUEBA9F0BxiAABAgQIECBAgAABAgQIECBAgAABAgTaIyB6bo+eawkQIECAAAECBAgQIECAAAECBAgQIECggIDouQCKQwQIECBAgAABAgQIECBAgAABAgQIECDQHgHRc3v0XEuAAAECBAgQIECAAAECBAgQIECAAAECBQREzwVQHCJAgAABAgQIECBAgAABAgQIECBAgACB9giIntuj51oCBAgQIECAAAECBAgQIECAAAECBAgQKCAgei6A4hABAgQIECBAgAABAgQIECBAgAABAgQItEdA9NwePdcSIECAAAECBAgQIECAAAECBAgQIECAQAEB0XMBFIcIECBAgAABAgQIECBAgAABAgQIECBAoD0Couf26LmWAAECBAgQIECAAAECBAgQIECAAAECBAoIiJ4LoDhEgAABAgQIECBAgAABAgQIECBAgAABAu0RED23R8+1BAgQIECAAAECBAgQIECAAAECBAgQIFBAQPRcAMUhAgQIECBAgAABAgQIECBAgAABAgQIEGiPgOi5PXquJUCAAAECBAgQIECAAAECBAgQIECAAIECAqLnAigOESBAgAABAgQIECBAgAABAgQIECBAgEB7BETP7dFzLQECBAgQIECAAAECBAgQIECAAAECBAgUEBA9F0BxiAABAgQIECBAgAABAgQIECBAgAABAgTaIyB6bo+eawkQIECAAAECBAgQIECAAAECBAgQIECggIDouQCKQwQIECBAgAABAgQIECBAgAABAgQIECDQHgHRc3v0XEuAAAECBAgQIECAAAECBAgQIECAAAECBQREzwVQHCJAgAABAgQIECBAgAABAgQIECBAgACB9giIntuj51oCBAgQIECAAAECBAgQIECAAAECBAgQKCAgei6A4hABAgQIECBAgAABAgQIECBAgAABAgQItEdA9NwePdcSIECAAAECBAgQIECAAAECBAgQIECAQAEB0XMBFIcIECBAgAABAgQIECBAgAABAgQIECBAoD0Couf26LmWAAECBAgQIECAAAECBAgQIECAAAECBAoIiJ4LoDhEgAABAgQIECBAgAABAgQIECBAgAABAu0RED23R8+1BAgQIECAAAECBAgQIECAAAECBAgQIFBAQPRcAMUhAgQIECBAgAABAgQIECBAgAABAgQIEGiPgOi5PXquJUCAAAECBAgQIECAAAECBAgQIECAAIECAqLnAigOESBAgAABAgQIECBAgAABAgQIECBAgEB7BLq25+JDe+2mn9328emv54zh4vufuf6UnM92CRAgQIAAAQIECBAgQIAAAQIECBAgQOCQCJRo9Fw7b+JNX6s5JGJuSoAAAQIECBAgQIAAAQIECBAgQIAAAQJ7ESjN6HnDK88lufNZk74z7RN9Uo/42rce3MuzOk2A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QGCCBFg1PEGwNIsAAggggAACCCCAAAIIIIAAAggggAACCISvANFz+D57Zo4AAggggAACCCCAAAIIIIAAAggggAACCEyQANHzBMHSLAIIIIAAAggggAACCCCAAAIIIIAAAgggEL4CRM/h++yZOQIIIIAAAggggAACCCCAAAIIIIAAAgggMEECRM8TBEuzCCCAAAIIIIAAAggggAACCCCAAAIIIIBA+AoQPYfvs2fmCCCAAAIIIIAAAggggAACCCCAAAIIIIDABAkQPU8QLM0igAACCCCAAAIIIIAAAggggAACCCCAAALhK0D0HL7PnpkjgAACCCCAAAIIIIAAAggggAACCCCAAAITJED0PEGwNIsAAggggAACCCCAAAIIIIAAAggggAACCISvANFz+D57Zo4AAggggAACCCCAAAIIIIAAAggggAACCEyQANHzBMHSLAIIIIAAAggggAACCCCAAAIIIIAAAgggEL4CRM/h++yZOQIIIIAAAggggAACCCCAAAIIIIAAAgggMEECRM8TBEuzCCCAAAIIIIAAAggggAACCCCAAAIIIIBA+AoQPYfvs2fmCCCAAAIIIIAAAggggAACCCCAAAIIIIDABAkQPU8QLM0igAACCCCAAAIIIIAAAggggAACCCCAAALhK0D0HL7PnpkjgAACCCCAAAIIIIAAAggggAACCCCAAAITJED0PEGwNIsAAggggAACCCCAAAIIIIAAAggggAACCISvANFz+D57Zo4AAggggAACCCCAAAIIIIAAAggggAACCEyQANHzBMHSLAIIIIAAAggggAACCCCAAAIIIIAAAgggEL4CRM/h++yZOQIIIIAAAggggAACCCCAAAIIIIAAAgggMEECRM8TBEuzCCCAAAIIIIAAAggggAACCCCAAAIIIIBA+AoQPYfvs2fmCCCAAAIIIIAAAggggAACCCCAAAIIIIDABAkQPU8QLM0igAACCCCAAAIIIIAAAggggAACCCCAAALhK0D0HL7PnpkjgAACCCCAAAIIIIAAAggggAACCCCAAAITJED0PEGwNIsAAggggAACCCCAAAIIIIAAAggggAACCISvANFz+D57Zo4AAggggAACCCCAAAIIIIAAAggggAACCEyQANHzBMHSLAIIIIAAAggggAACCCCAAAIIIIAAAgggEL4CRM/h++yZOQIIIIAAAggg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0iF/GCR/PjljGI93Fe3jJ3YJn/WtG+NM4mPvOj6v6D+Z185KSpg1wU/cg3dWbFRg4/c5MW4ggAACCCCAAAIIIIAAAggggAACCEyAwOCg61e8xtJ6mEbPY6GiDgIIIIAAAggggAACCCCAAAIIIIAAAgggEDYCAUbPYbbhRth8LJgoAggggAACCCCAAAIIIIAAAggggAACCCAQRAGi5yDi0zUCCCCAAAIIIIAAAggggAACCCCAAAIIIBCaAkTPoflcmRUCCCCAAAIIIIAAAggggAACCCCAAAIIIBBEAaLnIOLTNQIIIIAAAggggAACCCCAAAIIIIAAAgggEJoCRM+h+VyZFQIIIIAAAggggAACCCCAAAIIIIAAAgggEEQBoucg4tM1AggggAACCCCAAAIIIIAAAggggAACCCAQmgJEz6H5XJkVAggggAACCCCAAAIIIIAAAggggAACCCAQRAGi5yDi0zUCCCCAAAIIIIAAAggggAACCCCAAAIIIBCaAkTPoflcmRUCCCCAAAIIIIAAAggggAACCCCAAAIIIBBEAaLnIOLTNQIIIIAAAggggAACCCCAAAIIIIAAAgggEJoCRM+h+VyZFQIIIIAAAggggAACCCCAAAIIIIAAAgggEEQBoucg4tM1AggggAACCCCAAAIIIIAAAggggAACCCAQmgJEz6H5XJkVAggggAACCCCAAAIIIIAAAggggAACCCAQRAGi5yDi0zUCCCCAAAIIIIAAAggggAACCCCAAAIIIBCaAkTPoflcmRUCCCCAAAIIIIAAAggggAACCCCAAAIIIBBEAaLnIOLTNQIIIIAAAggggAACCCCAAAIIIIAAAgggEJoCRM+h+VyZFQIIIIAAAggggAACCCCAAAIIIIAAAgggEEQBoucg4tM1AggggAACCCCAAAIIIIAAAggggAACCCAQmgJEz6H5XJkVAggggAACCCCAAAIIIIAAAggggAACCCAQRAGi5yDi0zUCCCCAAAIIIIAAAggggAACCCCAAAIIIBCaAkTPoflcmRUCCCCAAAIIIIAAAggggAACCCCAAAIIIBBEAaLnIOLTNQIIIIAAAggggAACCCCAAAIIIIAAAgggEJoCRM+h+VyZFQIIIIAAAggggAACCCCAAAIIIIAAAgggEEQBoucg4tM1AggggAACCCCAAAIIIIAAAggggAACCCAQmgJEz6H5XJkVAggggAACCCCAAAIIIIAAAggggAACCCAQRAGi5yDi0zUCCCCAAAIIIIAAAggggAACCCCAAAIIIBCaAkTPoflcmRUCCCCAAAIIIIAAAggggAACCCCAAAIIIBBEAaLnIOLTNQIIIIAAAggggAACCCCAAAIIIIAAAgggEJoCV0/GaV387PPJOGzGjAACCCCAAAIIIIAAAggggAACCCCAAALhJhB93bXhNmV1vpMyev7glD08nxazRgABBBBAAAEEEEAAAQQQQAABBBBAAIHJJfC9tO9OrgGP12ivcjgc49UW7SCAAAIIIIAAAggggAACCCCAAAIIIIAAAgiEhsDg4GAgE2Gv50D0qIsAAggggAACCCCAAAIIIIAAAggggAACCCBgIkD0bILCJQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAIFABIieA9GjLgIIIIAAAggggAACCCCAAAIIIIAAAggggICJANGzCQqXEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBAIRIHoORI+6CCCAAAIIIIAAAggggAACCCCAAAIIIIAAAiYCRM8mKFxCAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQCESA6DkQPeoigAACCCCAAAIIIIAAAggggAACCCCAAAIImAgQPZugcAkBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAgEAGi50D0qIsAAggggAACCCCAAAIIIIAAAggggAACCCBgIkD0bILCJQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAIFABIieA9GjLgIIIIAAAggggAACCCCAAAIIIIAAAggggICJANGzCQqXEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBAIRIHoORI+6CCCAAAIIIIAAAggggAACCCCAAAIIIIAAAiYCRM8mKFxCAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQCESA6DkQPeoigAACCCCAAAIIIIAAAggggAACCCCAAAIImAgQPZugcAkBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAgEAGi50D0qIsAAggggAACCCCAAAIIIIAAAggggAACCCBgIkD0bILCJQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAIFABIieA9GjLgIIIIAAAggggAACCCCAAAIIIIAAAggggICJANGzCQqXEEAAAQQQQAAB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dnYwO0KYEXXUggSsjCTQAllZWmnpd9+3e/W0u2BJi3T1zv7uH1fnnXvOd8/5fXeXp483TwQIECBAgAABAgQIzFpA6XnWhAIQIECAAAECBAgQIECAAAECBAgQIECAwNECSs9He3hFgAABAgQIECBAgAABAgQIECBAgAABArMWUHqeNaEABAgQIECAAAECBAgQIECAAAECBAgQIHC0gNLz0R5eESBAgAABAgQIECBAgAABAgQIECBAgMCsBRbMOkJjAfbsffYnP9n9wgsvvtTYEtyYAAECBAgQIECAAAECBAgQIECAAAECRwnMa7UWLjzzda87d2DROUddmGMv5h08eLAbt/zEjif3jTx//i8uPvvs/p4en93uxhxaMwECBAgQIECAAAECBAgQIECAAIECBcbHx/ftG9n51PDZ/WddsOQN3bvD/fv3z2bxXfmp5/i8c9Sdl/3yJYrOs8m9uQQIECBAgAABAgQIECBAgAABAgQIvOoCUbQ855zXxkdmt/5o28/vfXbOfva5Kz8vHN+zEZ93Vnd+1X8qBCRAgAABAgQIECBAgAABAgQIECBA4FURiOpl1DCjkvmqROvGIF1Zeo7vd47/adCN3NZMgAABAgQIECBAgAABAgQIECBAgMAcEYgaZlQy58hmp2+zK0vP8e8K+sjz9FzqIUCAAAECBAgQIECAAAECBAgQIEDg9BGIGmZUMufs0ZWl5zmbLRsnQIAAAQIECBAgQIAAAQIECBAgQIBAVwgoPXdFmiySAAECBAgQIECAAAECBAgQIECAAAEC3SSg9NxN2bJWAgQIECBAgAABAgQIECBAgAABAgQIdIWA0nNXpMkiCRAgQIAAAQIECBAgQIAAAQIECBAg0E0CSs/dlC1rJUCAAAECBAgQIECAAAECBAgQIECAQFcIKD13RZoskgABAgQIECBAgAABAgQIECBAgAABAt0koPTcTdmyVgIECBAgQIAAAQIECBAgQIAAAQIECHSFgNJzV6TJIgkQIECAAAECBAgQIECAAAECBAgQINBNAkrP3ZQtayVAgAABAgQIECBAgAABAgQIECBAgEBXCCg9d0WaLJIAAQIECBAgQIAAAQIECBAgQIAAgeMW2Ldv35YtW457mgmvhoDS86uhKAYBAgQIECBAgAABAgQIECBAgAABAqefwM0337xy5cpNmzadfksrf0VKz+Xn2A4JECBAgAABAgQIECBAgAABAgQIzE2BtWvX9vf3X3PNNarPp/4BUHo+9ebuSIAAAQIECBAgQIAAAQIECBAgQID/5zpJAAAgAElEQVTAqRBYvnz5vffeq/p8Kqyn3WPBtJ5iO8ZGR4Yff2zX38UG/96iC5csPqu/74xj2uzwnTfeeMdwNfTt133lX604pjkGESBAgAABAgQIECBAgAABAgQIECBwGghk9fnKK6+Mzz7Hcq6++urTYFFzYglzovQ8+rff/uqm24d2jU1J6arf+8o1l07p85IAAQIECBAgQIAAAQIECBAgQIAAgaIEVJ8bSWf5X7gxOnTLpz6/eXrdObjHDjdi7qYECBAgQIAAAQIECBAgQIAAAQIECJxSgag+b968OW7pe59PmXvxn3recfc3hkaT88xL1ly17r1vHuhtje154qHBu79TffeGgwABAgQIECBAgAABAgQIECBAgACBOSDwnve8Z+PGjVF6jiO265s3TnbOSy897966bW8a9l3+O9evXzbh2X/pmqWXrmmNn2xe8QkQIECAAAECBAgQIECAAAECBAgQOF0Estys+nxq8lF66flwa/ILnkd3PLmntWzgKNajvm5kbM/Qt//i7u888sToxJQzBtb8/n9Yf/FRM8Z2D972X756/9PVkN5Fy9b962vXnN/bMWJszw8233r7/dv3tmP09i+97B//8w+vig9a57H16x/ftKVqLn7/J69d8tBX/+z2oQz1+tXXfuKqZX2j2++89dZ7tu450Gr19A788voNH1u9eGKR1fK++Z3Bx3YOj8TVOHr7lqz8rWv/yZHg0Tey7dt//t/v7thC/7IP37Dh3f3tCU4ECBAgQIAAAQIECBAgQIAAAQIE5rqA6vMpewLmf/rTnz5lN3u1bvTkU8Pnv+H1xxTtzNfsfeB72/dXY0e2fe/Bvede8vd/ceEM9fbRoT/+9Oe+uWXXyNiRT0IfHj3r0g+tXNx68f9897uPvViFeOmZR+68b+vzE0PG9z/z6IPDb1i9cvFEwHaQb217bv9kjPEDzz3x0F9t7XnHu9+8cF4V4Onvb77//x048NMDYyM//u4933+8DvXC44M/OtCz/U9u/aunRvMbqF8aH33mkcGRN71/eZbLH/7qjX/2w2dfPFB/P/X42MjOo4KP/K8vfuor33vqqC0cmH/h5avfvLC6t4MAAQIECBAgQIAAAQIECBAgQIAAgVYrvvf5ggsuuKN9XHHFFRdeeOHJUzmOSubJW8SJRj506NCJTq3mlV56bvVfuOjJ7z24q/0h5PEXdz703Xv+8sGnehe/aenAa464Df+Pz/3hvc/k6/6LVn9o/ZWXvf2igbHn5i1Zvbyz9PziyNiS1es+fOU7zh398fY9VcyxXc/1X3H5G6tYow98+TN37qiCnLvqmn/78at/84o3Pr/lwZ2jrecfe2Rs+a++pfro8a4ffuvB4WrIgedHFr5z/W/92jsGJiO1nt/+2JOtxZf95kfe/5YFOx99qv0F1WNP/vQNH1i5uCpb73rwL59a/MGPfPTqq37j19asedcFe3700K4oqT//2Mj5VX281dp+53+9/cc/jUbfso988uMf/dCaNavfduH88QVL33JBX/Q6CBAgQIAAAQIECBAgQIAAAQIECBBIgag+P/744w8//PATTzxxUr/0eS6Xnmf4AHBhz1/fiutu+r3bvvjf7htul59b42PDP9z8xaHvXLJ+w4Yrl1TfhDE+9M3b2yXjVmvJ2ptu+GBVx41j1co12ThyXrRmw79bvzS+AWPlip8b/tjGh6sr2x+PufEd0jvu/tbW9siBNddes+r8aPatuPo3VjywcajV2rNl6/A/WjIRtz2otezqG3738igJr7r054Z/f+PW9uek+y679qbfrr6OetWbWrs+sbla0/iup59prTgvWm+95ksreie/uKPVv+qaD/3Nx/60uuPOncOtFRH7+d374lUcfQNLFvf3V0P7V65f2u5yIkCAAAECBAgQIECAAAECBAgQIECgFti0adPXvva1/v7+L3zhC3WnxqsrUH7pObz6L73qpi+9b+iev/jmPUPDB9qA4yPbvvGZL/d9acNlfa1tWx/Lb8jou3zdB46qD0+1vnBpVXeujt7zL1zcerj9Aeax9sfOR7Zv39u+csZA767BwV3tdmv3oTNbrfiujl07oqMz9OI3Lp34KPIZ51/0C62t7fG/tLyqO1fH2ecuimJ2tifOvb3zx4Yfve+vf7BjePixHftGR0aylN7aM5yxL1p6QWvoiRi9577P/8FDF1++bv0H3nlRuwJ9VBwvCBAgQIAAAQIECBAgQIAAAQIECMxpgag7x780GARRd46PP89pi5O5+TlReq4AewdWfPC6FR8Y2fE///zmzUMj7Vrz1m/d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QIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQIECBAgAABAgQIECBAgAABAgQIEGhcQOm58RRYAAECBAgQIECAAAECBAgQIECAAAECBEoTUHouLaP2Q4AAAQIECBAgQIAAAQIECBAgQIAAgcYFlJ4bT4EFECBAgAABAgQIECBAgAABAgQIECBAoDQBpefSMmo/BAgQIECAAAECBAgQIECAAAECBAgQaFxA6bnxFFgAAQIECBAgQIAAAQIECBAgQIAAAQIEShNQei4to/ZDgAABAgQIECBAgAABAgQIECBAgACBxgWUnhtPgQUQIECAAAECBAgQIECAAAECBAgQIECgNAGl59Iyaj8ECBAgQIAAAQIECBAgQIAAAQIECBBoXEDpufEUWAABAgQIECBAgAABAgQIECBAgAABAgRKE1B6Li2j9kOAAAECBAgQIECAAAECBAgQIECAAIHGBZSeG0+BBRAgQIAAAQIECBAgQIAAAQIECBAgQKA0AaXn0jJqPwQI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

[tryitout]:data:image/png;base64,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

[response]:data:image/png;base64,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
