---
layout: post
title: "耦合与解耦"
date: 2020-04-02 23:10:21 +0800
categories: notes spring senior
tags: Spring 高级 耦合 解耦 配置 容器
excerpt: "耦合概念"
---

通过之前基础的学习我们已经对于Spring框架有了基本的了解，然而之前对于Spring框架的了解不过是其中的一小部分罢了。在前面我们基本上就只讲了Spring的介绍和以Context为主的核心容器（对于其他几个核心容器的用法基本上没有谈到），然后就是如何使用这个容器，基本上就是通过XML进行实例化装配或者使用注释装配，还讲了一点生命周期的概念，最后IoC的部分讲完了再增加一点事务处理的概念。

接下来我们将不从实用的角度而从系统学习的角度进入Spring的进一步探索。Spring的主要功能就是解耦。

## 耦合

我们如果学过开发软件等相关知识就应该了解到耦合这个概念，对于一个良好的系统，我们当然希望模块内高耦合，模块间低耦合。解耦虽然不是Spring的独有概念，但是也是Spring得以存在的一个重要原有，Spring负责对低耦合模块的连接。所以我们将抛却Spring框架而去实验耦合本身。

耦合就是指程序间的依赖关系，包括：

+ 方法之间的依赖
+ 类之间的依赖
+ 类包之间的依赖

1. 内容耦合。当一个模块直接修改或操作另一个模块的数据时，或一个模块不通过正常入口而转入另一个模块时，这样的耦合被称为内容耦合。内容耦合是最高程度的耦合，应该避免使用。
2. 公共耦合。两个或两个以上的模块共同引用一个全局数据项，这种耦合被称为公共耦合。在具有大量公共"合的结构中，确定究竟是哪个模块给全局变量赋了一个特定的值是十分困难的。
3. 外部耦合。一组模块都访问同一全局简单变量而不是同一全局数据结构，而且不是通过参数表传递该全局变量的信息，则称之为外部耦合。
4. 控制耦合。一个模块通过接口向另一个模块传递一个控制信号，接受信号的模块根据信号值而进行适当的动作，这种耦合被称为控制耦合。
5. 标记耦合。若一个模块A通过接口向两个模块B和C传递一个公共参数，那么称模块B和C之间存在一个标记耦合。
6. 数据耦合。模块之间通过参数来传递数据，那么被称为数据耦合。数据耦合是最低的一种耦合形式，系统中一般都存在这种类型的耦合，因为为了完成一些有意义的功能，往往需要将某些模块的输出数据作为另一些模块的输入数据。
7. 非直接耦合。两个模块之间没有直接关系，它们之间的联系完全是通过主模块的控制和调用来实现的。

&emsp;

## Java解耦

### &emsp;解耦的过程

其实类包也是类依赖的一种，对于类之间的依赖我们之前也已经谈过了，具有多种解决方案，一种是XML实例化依赖对象与被依赖对象，加上depends-on、或者ref属性，由Spring去实例化识别与装配，一种是使用@Autowire或者@DependsOn注解去让Spring自动处理，一种是使用@Configuration来写配置类，在配置类里处理对应的依赖关系。但是这里我们将不讨论如何处理依赖，而是将解耦，也就是降低依赖对于程序模块的影响。

解耦就是降低程序间的依赖关系。开发时应该做到，编译时不依赖，运行时少依赖。那么具体如何理解呢？

就比如我们想引用一个Jar包，也就是依赖，如果我们使用的是这种方法来进行依赖：对应的处理方法就是new 依赖Jar包类的地址;，那么这个意思就是我们这个处理方法需要一个依赖类，new就是实例化该类，而地址就是对应的Jar包类的路由，正常的流程是首先程序编译，根据这个路由找到这个类包，从中取出这个类，通过new实例化，最后再放到方法中。这就说明我们依赖的引入是在编译的时候产生的。如果它找不到这个类就会编译失败。

而如果我们使用`Class.forName('依赖Jar包类的地址')`的方式来引入，那么它在编译的时候这个地址将是一个字符串，而不会被引入依赖，如果这个依赖类不存在，也只会抛出异常，而不是编译错误。

那么我们如何去解决这个编译时的依赖问题呢？

首先我们应该使用[反射]({% post_url notes/java/2020-05-02-java-reflection %})来创建对象，而不是使用new关键字和import来引入依赖创建对象。如果使用反射，则会抛出异常而非编译错误。

第二步，通过读取配置文件来获取我们创建对象的全限定类名。因为我们在反射中传入的值是字符串，所以这个内容将被写死，也就是说如果我们想要以后更改依赖的类就必须重新写这个路由字符串了。所以如果我们使用的是配置文件，那么我们如果要修改依赖类就直接在配置文件中修改就行了，而不用去更改对应的运行代码。

### &emsp;工厂方法

我们还是选取[标准Spring项目XML模板：Spring/basic_xml](https://github.com/Didnelpsun/Spring/tree/master/basic_xml)，已知我们除了包含main方法的App类已经有了HelloWorld类，他们都在entity文件夹中，删除所有实体类，并把SpringBean.xml中所有的Bean配置全部删掉，定义以下的几个实例类：

```java
// User.java
package org.didnelpsun.entity;

public class User {
    private String name;
    private String password;
    private Message message;
    public User(){
        System.out.println("UserClass");
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPassword() {
        return password;
    }
    public void setMessage(Message message) {
        this.message = message;
    }
    public Message getMessage() {
        return message;
    }
    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", password='" + password + '\'' +
                ", message=" + message +
                '}';
    }
}
```

User.java保存的是User用户类，具有三个属性和对应的Setter和Getter方法。

```java
// Message.java
package org.didnelpsun.entity;

public class Message {
    private String id;
    private String sex;
    private String phone;
    private Integer age;
    public Message(){
        System.out.println("MessageClass");
    }
    public void setId(String id){
        this.id = id;
    }
    public String getId() {
        return id;
    }
    public void setSex(String sex){
        this.sex = sex;
    }
    public String getSex() {
        return sex;
    }
    public void setPhone(String phone){
        this.phone = phone;
    }
    public String getPhone() {
        return phone;
    }
    public void setAge(Integer age){
        this.age = age;
    }
    public Integer getAge() {
        return age;
    }

    @Override
    public String toString() {
        return "Message{" +
                "id='" + id + '\'' +
                ", sex='" + sex + '\'' +
                ", phone='" + phone + '\'' +
                ", age=" + age +
                '}';
    }
}
```

Message.java保存的类是User类属性成员message的细节。

因为我们没有连接数据库，所以不需要DAO层的DAO类，直接在entity同级定义一个factory包保存实例化工厂，然后新建一个UserFactory的类，用来实例化User类，作为其工厂方法：

```java
// UserFactory.java
package org.didnelpsun.factory;

import org.didnelpsun.entity.User;
import org.didnelpsun.entity.Message;

public class UserFactory {
    public UserFactory(){
        System.out.println("UserFactoryClass");
    }
    // 为了方便，所以返回实例的getUserFactory方法直接使用static作为静态方法，就不用实例化UserFactory了
    // 即静态实例工厂模式
    public static User getUserFactory(String name, String password, Message message){
        User user = new User();
        user.setName(name);
        user.setPassword(password);
        user.setMessage(message);
        return user;
    }
    // 重构方法
    public static User getUserFactory(String name, String password, String id,String sex,String telephone,Integer age){
        User user = new User();
        user.setName(name);
        user.setPassword(password);
        Message message = new Message();
        message.setId(id);
        message.setSex(sex);
        message.setPhone(telephone);
        message.setAge(age);
        user.setMessage(message);
        return user;
    }
    public static String[] getUserMessage(User user){
        String name = user.getName();
        String password = user.getPassword();
        Message message = user.getMessage();
        String id = message.getId();
        String sex = message.getSex();
        String telephone = message.getPhone();
        Integer age = message.getAge();
        return new String[]{name,password,id,sex,telephone,age.toString()};
    }
}
```

这里有两个静态工厂getUserFactory方法用来根据不同参数创建User实例，还有一个getUserMessage返回对应的属性参数。然后我们再在entity同级定义一个service包，用来包含业务层的类，再定义一个Register类，用来注册对应的用户：

```java
// Register.java
package org.didnelpsun.service;

import org.didnelpsun.entity.User;
import org.didnelpsun.factory.UserFactory;

public class Register {
    public Register(){
        System.out.println("RegisterClass");
    }
    public static void registerUser(User user){
        if(user.getName()!=null && user.getPassword()!=null){
            System.out.println("注册成功！\n");
            String[] userMessage = UserFactory.getUserMessage(user);
            System.out.println("注册信息：\n");
            for (String message : userMessage) {
                System.out.println(message + " ");
            }
        }
    }
}
```

如果我们没有工厂模式来实例化，那么我们需要使用：

```xml
<bean id="User" class="org.didnelpsun.entity.User">
    <property name="name" value="Didnelpsun"/>
    <property name="password" value="didnelpsun"/>
</bean>
```

然后编写App.java文件：

```java
// App.java
package org.didnelpsun;
//项目入口

import org.didnelpsun.entity.User;
import org.didnelpsun.factory.UserFactory;
import org.didnelpsun.service.Register;

public class App
{
    public static void main(String args[]){
        //利用工厂模式来构造一个Didnelpsun的User实例
        User Didnelpsun = UserFactory.getUserFactory("Didnelpsun","0824", "1234","man","13566444",20);
        //注册这个用户
        Register.registerUser(Didnelpsun);
    }
}
```

结果为：

![user类的结果][userResult]

<span style="color:orange">注意：</span>在这个案例中我们是没有使用到Spring框架的。因为我们目前要展示的是解耦这个概念而非Spring的具体使用。

### &emsp;使用配置文件

我们的实例化是在App.java的主函数中执行的，（即`User Didnelpsun = UserFactory.getUserFactory();`这行代码）如果我们想在运行前就以配置的模式来导入数据来进行实例化，我们可以采取配置文件来配置。

我们也可以来创建配置文件引入对应的依赖类，如我们的UserFactory类中我们可以使用配置文件来导入依赖的User和Message类。流程应该是首先建立配置文件，内容是唯一标识=全限定类名（即key=value），然后读取配置文件配置内容，反射创建对象。如果你不熟悉Java三层架构可以康康[这个]({% post_url notes/java/2020-02-24-java-three-tier-architecture %})。

我们的文件格式可以是XML格式，和Spring配置一致，也可以是properties格式。我们这里使用的是proerties格式文件。Spring工程的配置文件应该都放在resources文件夹下，和SpringBean.xml一样，所以我们在resources文件夹下新建一个Factory.properties文件：

```properties
# Factory.properties
# 定义两个依赖类，分别为User和Message
User= org.didnelpsun.entity.User
Message = org.didnelpsun.entity.Message
```

并重新定义UserFactory.java，把User和Message依赖全部删掉：

```java
// UserFactory.java
package org.didnelpsun.factory;

// 只在这里用到了Spring框架的函数
import org.springframework.beans.factory.BeanFactory;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class UserFactory {
    // 使用properties格式的配置文件，所以使用到了java.util.properties的包
    private static Properties props;
    // 因为是配置文件的导入，所以需要使用静态代码块来优先导入
    static {
        try {
            // 实例化一个配置文件对象
            props = new Properties();
            // 获取配置文件流对象
            // 这里无法使用FileInputStream对象来创建数据流对象
            // 因为这个配置文件不应该是绝对路径，后期可能会更改根路径，所以应该是相对路径
            // BeanFactory是Spring容器，class代表对应的实例化类，
            // getClassLoader就是找到对应的工程中包含Class的Java源文件夹，getResourceAsStream就是找到配置文件夹并以流形式传入，参数为对应的配置文件地址
            InputStream inStream = BeanFactory.class.getClassLoader().getResourceAsStream("Factory.properties");
            // 使用load方法导入对应的配置文件
            props.load(inStream);
        }
        catch (IOException e) {
            System.out.println("初始化异常");
            e.printStackTrace();
            // 可以使用下面的初始化异常
//            throw new ExceptionInInitializerError("初始化异常");
        }
    }
    // 为了方便，所以返回实例的getUserFactory方法直接使用static作为静态方法，就不用实例化UserFactory了
    public static Object getUserFactory(){
        // 因为我们没有直接导入User和Message类，所以对应的返回值类型以及就无法使用User和Message了
        // 所以将原来的类型改为Object类型，做泛型处理
        // 同时，user返回值将变为Object类型
        try{
            String userPath = props.getProperty("User");
            // Class.forName即通过全限定类名获取对应的类
            // getDeclaredConstructor根据他的参数对该类的构造函数进行搜索并返回对应的构造函数，没有参数就返回该类的无参构造函数，
            // 然后再通过newInstance进行实例化。且返回的是Object类型
            return Class.forName(userPath).getDeclaredConstructor().newInstance();
            // 反射后这些私有方法都将失效，如果要设置就必须不能在反射的地方调用私有方法
//            user.setName(name);
//            user.setPassword(password);
//            user.setMessage(userMessage);
        }
        catch (Exception e){
            e.printStackTrace();
            return new Object();
        }
    }
    // 同理下面另一个方法也因为没有User和Message依赖而无法Setter或者Getter
}
```

修改Register.java：

```java
public static void registerUser(User user){
    if(user.getName()!=null && user.getPassword()!=null){
        System.out.println("注册成功！\n");
    }
}
```

```java
// App.java
package org.didnelpsun;
// 项目入口

import org.didnelpsun.entity.User;
import org.didnelpsun.factory.UserFactory;
import org.didnelpsun.service.Register;

public class App
{
    public static void main(String args[]){
        //利用工厂模式来构造一个Didnelpsun的User实例
        User Didnelpsun = (User) UserFactory.getUserFactory();
        //注册这个用户
        Didnelpsun.setName("Didnelpsun");
        Didnelpsun.setPassword("0824");
        Register.registerUser(Didnelpsun);
    }
}
```

这样会得到注册成功的信息，不过从上面你会发现解耦虽然的确能增加独立性，但是也存在很多除了性能的其他问题。首先如果你要依赖的类不多，那么解耦其实是不实惠的。然后解耦出来的类不应该是无关的，最好应该是同一父类的子类，或者实现了同一接口，因为如果像上面的例子一样User和Message类不是同一父类子类，那么他们的私有方法就都无法使用，所以最后在工厂方法中返回值只能是Object，Setter和Getter都无法使用。第三是反射最大的优势就是根据传入的字符串来实例化，这个字符串最好是可变的，像我上面写的`String UserPath = props.getProperty("User");`这样就失去了反射的优势。

### &emsp;传入参数创建实例

所以我们下一个的目的就是将`String UserPath = props.getProperty("User");`中的User字符串变成变量，从而不被写死。所以对于该类对其他类的依赖都可以通过这种传入参数的方式来完成解耦，虽然这样会降低很多效率。

对于Message类是独立的类，所以不用解耦。而对于User类由于依赖Message类所以可以解耦：

```java
// User.java
package org.didnelpsun.entity;

import org.springframework.beans.factory.BeanFactory;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.util.Properties;

public class User {
    private String name;
    private String password;
    // 由于Message没有引用所以直接使用Object
    private Object message;
    public User(){
        System.out.println("UserClass");
        this.name = "";
        this.password = "";
        // 由于是实例化所以不能用静态方式
        try {
            // 定义对应配置文件
            Properties props = new Properties();
            InputStream inStream = BeanFactory.class.getClassLoader().getResourceAsStream("Factory.properties");
            props.load(inStream);
            String messagePath = props.getProperty("Message");
            this.message = Class.forName(messagePath).getDeclaredConstructor().newInstance();
        }
        catch (IOException e) {
            System.out.println("初始化异常");
            e.printStackTrace();
        } catch (ClassNotFoundException | InvocationTargetException | InstantiationException | IllegalAccessException | NoSuchMethodException e) {
            e.printStackTrace();
        }
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPassword() {
        return password;
    }
    public void setMessage(Object message) {
        this.message = message;
    }
    public Object getMessage() {
        return message;
    }
    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", password='" + password + '\'' +
                ", message=" + message +
                '}';
    }
}
```

最后在factory下新建一个ObjectFactory用来生成所有的Object Bean：

```java
// ObjectFactory.java
package org.didnelpsun.factory;

// 只在这里用到了Spring框架的函数
import org.springframework.beans.factory.BeanFactory;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ObjectFactory {
    // 使用properties格式的配置文件，所以使用到了java.util.properties的包
    private static Properties props;
    // 因为是配置文件的导入，所以需要使用静态代码块来优先导入
    static {
        try {
            // 实例化一个配置文件对象
            props = new Properties();
            // 获取配置文件流对象
            // 这里无法使用FileInputStream对象来创建数据流对象
            // 因为这个配置文件不应该是绝对路径，后期可能会更改根路径，所以应该是相对路径
            // BeanFactory是Spring容器，class代表对应的实例化类，
            // getClassLoader就是找到对应的工程中包含Class的Java源文件夹，getResourceAsStream就是找到配置文件夹并以流形式传入，参数为对应的配置文件地址
            InputStream inStream = BeanFactory.class.getClassLoader().getResourceAsStream("Factory.properties");
            // 使用load方法导入对应的配置文件
            props.load(inStream);
        }
        catch (IOException e) {
            System.out.println("初始化异常");
            e.printStackTrace();
            // 可以使用下面的初始化异常
//            throw new ExceptionInInitializerError("初始化异常");
        }
    }
    public static Object getObjectFactory(String beanName){
        try{
            String path = props.getProperty(beanName);
            // Class.forName即通过全限定类名获取对应的类
            // getDeclaredConstructor根据他的参数对该类的构造函数进行搜索并返回对应的构造函数，没有参数就返回该类的无参构造函数，
            // 然后再通过newInstance进行实例化。且返回的是Object类型
            return Class.forName(path).getDeclaredConstructor().newInstance();
        }
        catch (Exception e){
            e.printStackTrace();
            return new Object();
        }
    }
}
```

最后主函数：

```java
// App.java
package org.didnelpsun;
// 项目入口

import org.didnelpsun.entity.Message;
import org.didnelpsun.entity.User;
import org.didnelpsun.factory.ObjectFactory;
import org.didnelpsun.service.Register;

public class App
{
    public static void main(String args[]){
        User Didnelpsun = (User) ObjectFactory.getObjectFactory("User");
        //注册这个用户
        Didnelpsun.setName("Didnelpsun");
        Didnelpsun.setPassword("0824");
        Message message = (Message) ObjectFactory.getObjectFactory("Message");
        message.setAge(19);
        message.setSex("男");
        Didnelpsun.setMessage(message);
        Register.registerUser(Didnelpsun);
        System.out.println(Didnelpsun);
    }
}
```

### &emsp;引入Map容器

由于此时都是基本的Java程序，没有使用Spring，所以这些实例由用户统一管理。每次调用都是新建一个实例，如果后面不使用将会被回收，那么我们就需要一个东西来保存这些实例。这个用来保存实例的东西就是容器。我们在ObjectFactory中使用Map接口来保存这些实例（Map类似JS中的对象，都是键值对的形式）：

```java
// ObjectFactory.java
package org.didnelpsun.factory;

// 只在这里用到了Spring框架的函数
import org.springframework.beans.factory.BeanFactory;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class ObjectFactory {
    //新建一个Map对象，作为保存所有类实例的容器
    private static Map<String,Object> beans;
    // 因为是配置文件的导入，所以需要使用静态代码块来优先导入
    static {
        try {
            // 实例化一个配置文件对象
            // 使用properties格式的配置文件，所以使用到了java.util.properties的包
            Properties props = new Properties();
            // 获取配置文件流对象
            // 这里无法使用FileInputStream对象来创建数据流对象
            // 因为这个配置文件不应该是绝对路径，后期可能会更改根路径，所以应该是相对路径
            // BeanFactory是Spring容器，class代表对应的实例化类，
            // getClassLoader就是找到对应的工程中包含Class的Java源文件夹，getResourceAsStream就是找到配置文件夹并以流形式传入，参数为对应的配置文件地址
            InputStream inStream = BeanFactory.class.getClassLoader().getResourceAsStream("Factory.properties");
            // 使用load方法导入对应的配置文件
            props.load(inStream);
            //开始实例化容器，赋值为一个Hash类型的Map容器，因为不清楚实例类型，所以全部按照Object作泛型处理
            beans = new HashMap<String, Object>();
            // 取出所有配置文件中的keys值，这个值是一个枚举值
            Enumeration<Object> keys = props.keys();
            while(keys.hasMoreElements()){
                //取出key值
                String key = keys.nextElement().toString();
                //根据key取出value的路径
                String beanPath = props.getProperty(key);
                Object value = Class.forName(beanPath).getDeclaredConstructor().newInstance();
                //将对应的key和实例放到Map容器中
                beans.put(key,value);
            }
        }
        catch (IOException e) {
            System.out.println("初始化异常");
            e.printStackTrace();
            // 可以使用下面的初始化异常
//            throw new ExceptionInInitializerError("初始化异常");
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException | InvocationTargetException | NoSuchMethodException e) {
            e.printStackTrace();
        }
    }
    public static Object getObjectFactory(String beanName){
        // 直接在容器中获取对应的Bean，每一个类只有一个Bean
        return beans.get(beanName);
    }
}
```

然后主函数：

```java
// App.java
package org.didnelpsun;
// 项目入口

import org.didnelpsun.entity.Message;
import org.didnelpsun.entity.User;
import org.didnelpsun.factory.ObjectFactory;
import org.didnelpsun.service.Register;

public class App
{
    public static void main(String args[]){
        User Didnelpsun = (User) ObjectFactory.getObjectFactory("User");
        //注册这个用户
        Didnelpsun.setName("Didnelpsun");
        Didnelpsun.setPassword("0824");
        Message message = (Message) ObjectFactory.getObjectFactory("Message");
        message.setAge(19);
        message.setSex("男");
        Didnelpsun.setMessage(message);
        Register.registerUser(Didnelpsun);
        System.out.println(Didnelpsun);
        User test = (User) ObjectFactory.getObjectFactory("User");
        test.setName("test");
        System.out.println(test);
    }
}
```

所以现在我们看到了，如果是同一个实例名，那就是一个实例，因为我们在使用配置文件时就根据配置文件流来实例化，并将实例放入容器中，如果我们是传入实例名，那么就在容器中找这个实例，一个实例名只会有一个实例在容器中，这就实现了单例模式。

同时因为是把所有的实例都放在一个容器里，所以在一个时间段一定有一个实例被使用，所以这个容器就不会被销毁，所以这容器里的其他实例也都不会被销毁。

下面的beans.get将不会再起到反射实例化的作用而只起到了取出实例的作用，这种实现方法就是饿汉模式。

&emsp;

## Spring解耦

### &emsp;引入Spring容器

之前说到的控制反转的概念（IoC）。在上面案例的体现是不使用new来创建对象，而是使用UserFactory的getUserFactory方法来获取，我们将实例化的职能让渡给了工厂方法，而不是App.java我们自己来创建。而Spring的功能就是这种代理的集合，可以降低程序耦合，之前说的IoC容器（即四个核心容器）就是案例中我们自定义的Map容器的扩展。

所以IoC最终的目的就是降低耦合。

对于之前的用户的案例或者是注册的案例，你都可以使用Spring来替换配置。这些都是不会继续详细演示的，因为如果你学好了前面的部分，是十分简单的。

同时也可以直接利用[生命周期]({% post_url notes/java/2020-03-20-spring-life-cycle %})的property注解方式的`@PropertySource(properties配置文件路径字符串)`和`@Value(SpEL表达式)`来替代读取properties配置文件。当出现多个数据源就在方法的参数中使用`@Qualifier(数据源名)`来指定数据源。

### &emsp;获取实例

根据上次的例子：首先你不会再使用Factory类了，而是使用Spring的XML配置文件或注解来实例化。

可以使用<span style="color:yellow">类名 实例名 = context.getBean("xml配置文件中bean的id名", 类名.class);</span>的方式来获得实例。

Spring对于实例之间依赖的创建就是通过解耦的方式完成。

这也是我们最开始就讲过的。

[案例八解耦：Spring/demo8_decouple](https://github.com/Didnelpsun/Spring/tree/master/demo8_decouple)。

[userResult]:data:image/png;base64,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
