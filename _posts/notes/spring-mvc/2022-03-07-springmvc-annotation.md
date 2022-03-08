---
layout: post
title: "注解配置SpringMVC"
date: 2022-03-07 15:46:09 +0800
categories: notes springmvc base
tags: SpringMVC 基础 注解
excerpt: "注解配置SpringMVC"
---

使用[案例四数据处理：SpringMVC/demo4_data_process](https://github.com/Didnelpsun/SpringMVC/tree/master/demo4_data_process)的代码。

可以使用配置类和注解替代web.xml和SpringMVC.xml文件的功能。删掉web.xml和SpringMVC.xml。

## 初始化类

创建初始化类，可以替代web.xml。

在Servlet3.0环境中，容器会在类路径中查找实现javax.servlet.ServletContainerinitializer接口的类，如果找到的话就用它来配置Servlet容器。

SpringMVC提供了这个接口的实现，名为SpringServletContainerInitializer，这个类又会查找实现WebApplicationInitializer的类并将配置的任务交给它们来完成。Spring3.2引入了一个便利的WebApplicationInitializer基础实现，名为AbstractAnnotationConfigDispatcherServletInitializer，当我们的类扩展了AbstractAnnotationConfigDispatcherServletInitializer并将其部署到Servlet3.0容器的时候，容器会自动发现它，并用它来配置Servlet上下文。

### &emsp;新建相关配置文件

在controller同级目录下新建一个config文件夹来保存配置，然后新建一个InitConfig.java文件继承AbstractAnnotationConfigDispatcherServletInitializer来替代web.xml，其中需要其他配置文件。

由于需要Spring的配置文件，所以新建一个SpringConfig：

```java
// SpringConfig.java
package org.didnelpsun.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringConfig {
}
```

需要SpringMVC的配置文件，所以新建一个WebConfig：

```java
// WebConfig.java
package org.didnelpsun.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {
}
```

### &emsp;

最后InitConfig为：

```java
// InitConfig.java
package org.didnelpsun.config;

import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.filter.HiddenHttpMethodFilter;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

import javax.servlet.Filter;

// Web工程的初始化类，用来代替web.xml
public class InitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override
    // 获取根配置，即Spring的配置类，在SSM整合时需要使用
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }
    @Override
    // 获取SpringMVC的配置类
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{WebConfig.class};
    }
    // 获取Servlet的映射路径，即web.xml中的DispatcherServlet的映射配置。
    // url-pattern由于是根路径，所以是"/"
    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
    // 定义过滤器
    @Override
    protected Filter[] getServletFilters() {
        // 字符编码过滤器
        CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
        // 设置字符编码
        characterEncodingFilter.setEncoding("UTF-8");
        // 设置强转响应与请求编码
        characterEncodingFilter.setForceRequestEncoding(true);
        characterEncodingFilter.setForceResponseEncoding(true);
        // 请求类型转换过滤器
        HiddenHttpMethodFilter hiddenHttpMethodFilter = new HiddenHttpMethodFilter();
        return new Filter[]{characterEncodingFilter, hiddenHttpMethodFilter};
    }
}
```

&emsp;

## SpringMVC配置

这里定义的是WebConfig类，可以替代SpringMVC.xml的作用。

配置类主要的工作有：扫描组件、视图解析器、视图控制器view-controller、静态资源处理default-servlet-handler、mvc注解驱动、文件上传解析器、拦截器、异常处理器。

WebConfig配置类可以继承WebMvcConfigurer接口来重新对应的配置方法。

如果编译部署更新不即使可以将项目目录的target文件夹删掉重新编译。

```java
// WebConfig.java
package org.didnelpsun.config;

import org.didnelpsun.interceptor.PageInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.handler.SimpleMappingExceptionResolver;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

import java.util.List;
import java.util.Properties;

// 替代SpringMVC.xml
@Configuration
// 扫描组件
@ComponentScan("org.didnelpsun.controller")
// 开启SpringMVC的注解驱动
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    // 配置视图解析器
    // ViewResolverRegistry为视图解析器注册器
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.jsp("/WEB-INF/pages/",".jsp");
    }
//    @Bean
//    // 使用内置视图解析器
//    protected InternalResourceViewResolver configureViewResolvers() {
//        // 第一个是前缀，第二个是后缀
//        return new InternalResourceViewResolver("/WEB-INF/views/",".jsp");
//    }
    // 配置默认Servlet处理，开启静态资源访问
    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        // 开启DefaultServlet使用
        configurer.enable();
    }
    // 添加view-controller
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }
    // 添加拦截器
    // InterceptorRegistry为拦截器注册器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 对所有路径进行拦截，并对主页面排除
        registry.addInterceptor(new PageInterceptor()).addPathPatterns("/**").excludePathPatterns("/");
    }
    // 添加文件上传解析器
    @Bean
    public MultipartResolver multipartResolver(){
        CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
        multipartResolver.setDefaultEncoding("UTF-8");
        return multipartResolver;
    }
    // 添加异常处理器
    @Override
    public void configureHandlerExceptionResolvers(List<HandlerExceptionResolver> resolvers) {
        SimpleMappingExceptionResolver exceptionResolver = new SimpleMappingExceptionResolver();
        // 设置异常映射
        Properties properties = new Properties();
        properties.setProperty("java.lang.ArithmeticException", "error");
        exceptionResolver.setExceptionMappings(properties);
        // 获取异常返回的数据
        exceptionResolver.setExceptionAttribute("exception");
        resolvers.add(exceptionResolver);
    }
}
```

[案例五注解配置：SpringMVC/demo5_annotation](https://github.com/Didnelpsun/SpringMVC/tree/master/demo5_annotation)。
