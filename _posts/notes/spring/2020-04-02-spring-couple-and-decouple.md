---
layout: post
title: "耦合与解耦"
date: 2020-04-09 23:30:21 +0800
categories: notes spring senior
tags: spring 高级 耦合 解耦 配置 容器
excerpt: "高级入门与耦合概念"
---

通过之前基础的学习我们已经对于Spring框架有了基本的了解，然而之前对于Spring框架的了解不过是其中的一小部分罢了。在前面我们基本上就只讲了Spring的介绍和以Context为主的核心容器（对于其他几个核心容器的用法基本上没有谈到），然后就是如何使用这个容器，基本上就是通过XML进行实例化装配或者使用注释装配，还讲了一点生命周期的概念，最后IoC的部分讲完了再增加一点事务处理的概念。

接下来我们将不从实用的角度而从系统学习的角度进入Spring的进一步探索。

我们如果学过开发软件等相关知识就应该了解到耦合这个概念，对于一个良好的系统，我们当然希望模块内高耦合，模块间低耦合。解耦虽然不是Spring的独有概念，但是也是Spring得以存在的一个重要原有，Spring负责对低耦合模块的连接。所以我们将抛却Spring框架而去实验耦合本身。

耦合就是指程序间的依赖关系，包括：

+ 方法之间的依赖
+ 类之间的依赖
+ 类包之间的依赖

## 类解耦

其实类包也是类依赖的一种，对于类之间的依赖我们之前也已经谈过了，具有多种解决方案，一种是XML实例化依赖对象与被依赖对象，加上dependson、或者ref属性，由Spring去实例化识别与装配，一种是使用@Autowire或者@DependsOn注解去让Spring自动处理，一种是使用@Configuration来写配置类，在配置类里处理对应的依赖关系。但是这里我们将不讨论如何处理依赖，而是将解耦，也就是降低依赖对于程序模块的影响。

解耦就是降低程序间的依赖关系。开发时应该做到，编译时不依赖，运行时少依赖。那么具体如何理解呢？

就比如我们想引用一个Jar包，也就是依赖，如果我们使用的是这种方法来进行依赖：对应的处理方法(new '依赖Jar包类的地址');，那么这个意思就是我们这个处理方法需要一个依赖类，new就是实例化该类，而地址就是对应的Jar包类的路由，正常的流程是首先程序编译，根据这个路由找到这个类包，从中取出这个类，通过new实例化，最后再放到方法中。这就说明我们依赖的引入是在编译的时候产生的。如果它找不到这个类就会编译失败。

而如果我们使用`Class.forName('依赖Jar包类的地址')`的方式来引入，那么它在编译的时候这个地址将是一个字符串，而不会被引入依赖，如果这个依赖类不存在，也只会抛出异常，而不是编译错误。

那么我们如何去解决这个编译时的依赖问题呢？

首先我们应该使用[反射]({% post_url notes/java/2020-05-02-java-reflection %})来创建对象，而不是使用new关键字和import来引入依赖创建对象。如果使用反射，则会抛出异常而非编译错误。

第二步，通过读取配置文件来获取我们创建对象的权限类名。因为我们在反射中传入的值是字符串，所以这个内容将被写死，也就是说如果我们想要以后更改依赖的类就必须重新写这个路由字符串了。所以如果我们使用的是配置文件，那么我们如果要修改依赖类就直接在配置文件中修改就行了，而不用去更改对应的运行代码。

&emsp;

## 创建配置文件与使用

我们还是选取那个[Spring模板文件](https://github.com/Didnelpsun/notes/tree/master/spring/spring)，已知我们除了包含main方法的App类已经有了HelloWorld类和User类，他们都在test文件夹中。我们会将这些包和文件全部删除，然后重新定义。首先建立一个Common的包，用来存放常用的类包。然后在Common文件夹下新建两个文件：

```java
//User.java
package org.didnelpsun.Common;

public class User {
    private String username;
    private String password;
    private UserMessage message;
    public void setUsername(String username) {
        this.username = username;
    }
    public String getUsername() {
        return username;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPassword() {
        return password;
    }
    public void setMessage(UserMessage message) {
        this.message = message;
    }
    public UserMessage getMessage() {
        return message;
    }
}
```

User.java保存的是User用户类，具有三个属性和对应的setter和getter方法。

```java
//UserMessage.java
package org.didnelpsun.Common;

public class UserMessage {
    private String id;
    private String sex;
    private String telephone;
    private Integer age;
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
    public void setTelephone(String telephone){
        this.telephone = telephone;
    }
    public String getTelephone() {
        return telephone;
    }
    public void setAge(Integer age){
        this.age = age;
    }
    public Integer getAge() {
        return age;
    }
}
```

UserMessage.java保存的类是User类属性的细节。

因为我们没有连接数据库，所以不需要DAO层的DAO类，直接定义一个Factory包保存实例化工厂，然后新建一个UserFactory的类，用来实例化User类，作为其工厂方法：

```java
//UserFactory.java
package org.didnelpsun.Factory;

import org.didnelpsun.Common.User;
import org.didnelpsun.Common.UserMessage;

public class UserFactory {
    //为了方便，所以返回实例的getUserFactory方法直接使用static作为静态方法，就不用实例化UserFactory了
    public static User getUserFactory(String username, String password, UserMessage userMessage){
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setMessage(userMessage);
        return user;
    }
    //重构方法
    public static User getUserFactory(String username, String password, String id,String sex,String telephone,Integer age){
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        UserMessage usermessage = new UserMessage();
        usermessage.setId(id);
        usermessage.setSex(sex);
        usermessage.setTelephone(telephone);
        usermessage.setAge(age);
        user.setMessage(usermessage);
        return user;
    }
    public static String[] getUserMessage(User user){
        String username = user.getUsername();
        String password = user.getPassword();
        UserMessage message = user.getMessage();
        String id = message.getId();
        String sex = message.getSex();
        String telephone = message.getTelephone();
        Integer age = message.getAge();
        String[] userMessage = {username,password,id,sex,telephone,age.toString()};
        return userMessage;
    }
}
```

这里有两个getUserFactory方法用来根据不同参数创建User实例，还有一个getUserMessage返回对应的属性参数。然后我们再定义一个Service包，用来包含业务层的类，再定义一个Register类，用来注册对应的用户：

```java
//Register.java
package org.didnelpsun.Service;

import org.didnelpsun.Common.User;
import org.didnelpsun.Factory.UserFactory;

public class Register {
    public static void registerUser(User user){
        if(user.getUsername()!=null && user.getPassword()!=null){
            System.out.println("注册成功！\n");
            String[] mes = UserFactory.getUserMessage(user);
            System.out.println("注册信息：\n");
            for(int i = 0; i < mes.length ; i++){
                System.out.println(mes[i]+" ");
            }
        }
    }
}
```

如果我们没有工厂模式来实例化，那么我们需要使用：

```xml
<bean id="User" class="org.didnelpsun.Common.User">
    <property name="username" value="Didnelpsun"/>
    <property name="password" value="didnelpsun"/>
</bean>
```

来实例化每一个User实例，但是我们使用了UserFactory来工厂化产生实例，所以我们不会在xml文件中配置这个User实例，而是直接使用Java代码来构建实例。然后编写App.java文件：

```java
//App.java
package org.didnelpsun;
//项目入口

import org.didnelpsun.Common.User;
import org.didnelpsun.Factory.UserFactory;
import org.didnelpsun.Service.Register;

public class App
{
    public static void main(String args[]){
        //利用工厂模式来构造一个Didnelpsun的User实例
        User Didnelpsun = UserFactory.getUserFactory("Didnelpsun","0824",
                "1234","man","13566444",20);
        //注册这个用户
        Register.registerUser(Didnelpsun);
    }
}
```

结果为：

![user类的结果][userResult]

<span style="color:orange">注意：</span>在这个案例中我们是没有使用到Spring框架的。因为我们要展示的是解耦这个概念而非Spring的具体使用。

### &emsp;使用配置文件

我们的实例化是在App.java的主函数中执行的，如果我们想在运行前就以配置的模式来导入数据来进行实例化，我们可以采取配置文件来配置。

我们也可以来创建配置文件引入对应的依赖类，如我们的UserFactory类中我们可以使用配置文件来导入依赖的User和UserMessage类。流程应该是首先建立配置文件，内容是唯一标识=全限定类名（即key=value），然后读取配置文件配置内容，反射创建对象。如果你不熟悉Java三层架构可以康康[这个]({% post_url notes/java/2020-02-24-java-three-tier-architecture %})。

我们的文件格式可以是xml格式，和Spring配置一致，也可以是properties格式。我们这里使用的是proerties格式文件。Spring工程的配置文件应该都放在resources文件夹下，和SpringBean.xml一样，所以我们在resources文件夹下新建一个Factory.properties文件。首先我们明白什么是properties文件的格式，其实就是等号：

```properties
# Factory.properties
# 定义两个依赖类，分别为User和UserMessage
User= org.didnelpsun.Common.User
UserMessage = org.didnelpsun.Common.UserMessage
```

并重新定义UserFactory.java：

```java
//UserFactory.java
package org.didnelpsun.Factory;

//只在这里用到了Spring框架的函数
import org.springframework.beans.factory.BeanFactory;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class UserFactory {
    //使用properties格式的配置文件，所以使用到了java.util.properties的包
    private static Properties props;
    //因为是配置文件的导入，所以需要使用静态代码块来优先导入
    static {
        try {
            //实例化一个配置文件对象
            props = new Properties();
            //获取配置文件流对象
            //这里无法使用FileInputStream对象来创建数据流对象
            //因为这个配置文件不应该是绝对路径，后期可能会更改根路径，所以应该是相对路径
            //BeanFactory是Spring容器，class代表对应的实例化类，
            //getClassLoader就是找到对应的工程中包含Class的Java源文件夹，getResourceAsStream就是找到配置文件夹并以流形式传入，参数为对应的配置文件地址
            InputStream inStream = BeanFactory.class.getClassLoader().getResourceAsStream("Factory.properties");
            //使用load方法导入对应的配置文件
            props.load(inStream);
        }
        catch (IOException e) {
            System.out.println("初始化异常");
            e.printStackTrace();
            //可以使用下面的初始化异常
//            throw new ExceptionInInitializerError("初始化异常");
        }
    }
    //为了方便，所以返回实例的getUserFactory方法直接使用static作为静态方法，就不用实例化UserFactory了
    public static Object getUserFactory(){
        //因为我们没有直接导入User和UserMessage类，所以对应的返回值类型以及就无法使用User和UserMessage了
        //所以将原来的类型改为Object类型，做泛型处理
        //同时，user返回值将变为Object类型
        Object user = null;
        try{
            String UserPath = props.getProperty("User");
            user = Class.forName(UserPath).newInstance();
            //反射后这些私有方法都将失效，如果要设置就必须不能在反射的地方调用私有方法
//            user.setUsername(username);
//            user.setPassword(password);
//            user.setMessage(userMessage);
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return user;
    }
    //同理下面另一个方法也因为无法调用私有方法而无法setter或者getter
}
```

```java
//Register.java
package org.didnelpsun.Service;

import org.didnelpsun.Common.User;

public class Register {
    public static void registerUser(User user){
        if(user.getUsername()!=null && user.getPassword()!=null){
            System.out.println("注册成功！\n");
        }
    }
}
```

```java
//App.java
package org.didnelpsun;
//项目入口

import org.didnelpsun.Common.User;
import org.didnelpsun.Factory.UserFactory;
import org.didnelpsun.Service.Register;

public class App
{
    public static void main(String args[]){
        //利用工厂模式来构造一个Didnelpsun的User实例
        User Didnelpsun = (User) UserFactory.getUserFactory();
        //注册这个用户
        Didnelpsun.setUsername("Didnelpsun");
        Didnelpsun.setPassword("0824");
        Register.registerUser(Didnelpsun);
    }
}
```

这样会得到注册成功的信息，不过从上面你会发现解耦虽然的确能增加独立性，但是也存在很多除了性能的其他问题。首先如果你要依赖的类不多，那么解耦其实是不实惠的。然后解耦出来的类不应该是无关的，最好应该是同一父类的子类，或者实现了同一接口，因为如果像上面的例子一样User和UserMessage类不是同一父类子类，那么他们的私有方法就都无法使用，所以最后在工厂方法中返回值只能是Object，setter和getter都无法使用。第三是反射最大的优势就是根据传入的字符串来实例化，这个字符串最好是可变的，像我上面写的`String UserPath = props.getProperty("User");`这样就失去了反射的优势。

### &emsp;重新举例

知道了以上几点，我们重新定义几个类。按照[反射]({% post_url notes/java/2020-05-02-java-reflection %})中水果实例的逻辑来进行演示。首先在Common中定义一个接口Fruit：

```java
//Fruit.java
package org.didnelpsun.Common;

public interface Fruit {
    //定义水果价格属性
    public Integer price = 0;
    //定义对应的setter和getter方法
    public void setPrice(Integer price);
    public Integer getPrice();
    //定义一个tag方法返回对应的水果名
    public static String tag() {
        return null;
    }
}
```

定义几个水果类：

```java
//Apple.java
package org.didnelpsun.Common;

public class Apple implements Fruit {
    //默认价格
    private Integer price = 5;
    @Override
    public void setPrice(Integer price) {
        this.price = price;
    }
    @Override
    public Integer getPrice() {
        return price;
    }
    @Override
    public String tag() {
        return "Apple";
    }
}
```

```java
//Banana.java
package org.didnelpsun.Common;

public class Banana implements Fruit {
    //默认价格
    private Integer price = 8;
    @Override
    public void setPrice(Integer price) {
        this.price = price;
    }
    @Override
    public Integer getPrice() {
        return price;
    }
    @Override
    public String tag() {
        return "Banana";
    }
}
```

```java
//Melon.java
package org.didnelpsun.Common;

public class Melon implements Fruit {
    //默认价格
    private Integer price = 12;
    @Override
    public void setPrice(Integer price) {
        this.price = price;
    }
    @Override
    public Integer getPrice() {
        return price;
    }
    @Override
    public String tag() {
        return "Melon";
    }
}
```

然后在Factory中定义一个FruitFactory用来实例化水果类：

```java
//FruitFactory.java
package org.didnelpsun.Factory;

import org.didnelpsun.Common.Fruit;
import org.springframework.beans.factory.BeanFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class FruitFactory {
    //使用properties格式的配置文件，所以使用到了java.util.properties的包
    private static Properties props;
    //因为是配置文件的导入，所以需要使用静态代码块来优先导入
    static {
        try {
            //实例化一个配置文件对象
            props = new Properties();
            //获取配置文件流对象
            //这里无法使用FileInputStream对象来创建数据流对象
            //因为这个配置文件不应该是绝对路径，后期可能会更改根路径，所以应该是相对路径
            //BeanFactory是Spring容器，class代表对应的实例化类，
            //getClassLoader就是找到对应的工程中包含Class的Java源文件夹，getResourceAsStream就是找到配置文件夹并以流形式传入，参数为对应的配置文件地址
            InputStream inStream = BeanFactory.class.getClassLoader().getResourceAsStream("Factory.properties");
            //使用load方法导入对应的配置文件
            props.load(inStream);
        }
        catch (IOException e) {
            System.out.println("初始化异常");
            e.printStackTrace();
            //可以使用下面的初始化异常
//            throw new ExceptionInInitializerError("初始化异常");
        }
    }
    public static Fruit getFruitFactory(String fruitName){
        Fruit fruit = null;
        try{
            String fruitPath = props.getProperty(fruitName);
            fruit = (Fruit) Class.forName(fruitPath).newInstance();
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return fruit;
    }
}
```

然后在properties文件中加上配置：

```properties
# Factory.properties
Apple = org.didnelpsun.Common.Apple
Banana = org.didnelpsun.Common.Banana
Melon = org.didnelpsun.Common.Melon
```

```java
//App.java
package org.didnelpsun;
//项目入口

import org.didnelpsun.Common.Fruit;
import org.didnelpsun.Factory.FruitFactory;

public class App
{
    public static void main(String args[]){
        Fruit apple = (Fruit) FruitFactory.getFruitFactory("Apple");
        System.out.println(apple.tag());
    }
}
```

运行就能得到这个打印：![apple输出][apple]。

重新更改一下主函数方法体：

```java
Fruit apple = (Fruit) FruitFactory.getFruitFactory("Apple");
System.out.println(apple);
apple = (Fruit) FruitFactory.getFruitFactory("Apple");
System.out.println(apple);
Fruit melon = (Fruit) FruitFactory.getFruitFactory("Melon");
System.out.println(melon);
melon = (Fruit) FruitFactory.getFruitFactory("Melon");
System.out.println(melon);
Fruit banana = (Fruit) FruitFactory.getFruitFactory("Banana");
System.out.println(banana);
banana = (Fruit) FruitFactory.getFruitFactory("Banana");
System.out.println(banana);
```

会得到以下结果：

![fruit的打印][fruitprint]

### &emsp;引入容器

因为FruitFactory采用newInstance的方法，所以是多例模式，每次调用都是新建一个实例，如果后面不使用将会被回收，那么我们就需要一个东西来保存这些实例。这个用来保存实例的东西就是容器。我们现在使用Map接口来保存这些实例（Map类似JS中的对象，都是键值对的形式）：

```java
//FruitFactory.java
package org.didnelpsun.Factory;

import org.didnelpsun.Common.Fruit;
import org.springframework.beans.factory.BeanFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class FruitFactory {
    //使用properties格式的配置文件，所以使用到了java.util.properties的包
    private static Properties props;
    //新建一个Map对象，作为保存实例的容器
    private static Map<String,Object> beans;

    //因为是配置文件的导入，所以需要使用静态代码块来优先导入
    static {
        try {
            //实例化一个配置文件对象
            props = new Properties();
            //获取配置文件流对象
            //这里无法使用FileInputStream对象来创建数据流对象
            //因为这个配置文件不应该是绝对路径，后期可能会更改根路径，所以应该是相对路径
            //BeanFactory是Spring容器，class代表对应的实例化类，
            //getClassLoader就是找到对应的工程中包含Class的Java源文件夹，getResourceAsStream就是找到配置文件夹并以流形式传入，参数为对应的配置文件地址
            InputStream inStream = BeanFactory.class.getClassLoader().getResourceAsStream("Factory.properties");
            //使用load方法导入对应的配置文件
            props.load(inStream);
            //开始实例化容器，赋值为一个Hash类型的Map容器，因为不清楚实例类型，所以全部按照Object作泛型处理
            beans = new HashMap<String, Object>();
            //取出所有配置文件中的keys值，这个值是一个枚举值
            Enumeration<Object> keys = props.keys();
            while(keys.hasMoreElements()){
                //取出key值
                String key = keys.nextElement().toString();
                //根据key取出value的路径
                String beanPath = props.getProperty(key);
                Object value = Class.forName(beanPath).newInstance();
                //将对应的key和实例放到Map容器中
                beans.put(key,value);
            }
        }
        catch (IOException | ClassNotFoundException | IllegalAccessException | InstantiationException e) {
            System.out.println("初始化异常");
            e.printStackTrace();
            //可以使用下面的初始化异常
//            throw new ExceptionInInitializerError("初始化异常");
        }
    }
    public static Fruit getFruitFactory(String fruitName){
        //直接根据传入的名字来找到容器中的实例并返回
        return (Fruit) beans.get(fruitName);
    }
}
```

所以这时候的打印结果是：

![fruit打印结果][fruitprint2]

所以现在我们看到了，如果是同一个实例名，那就是一个实例，因为我们在使用配置文件时就根据配置文件流来实例化，并将实例放入容器中，如果我们是传入实例名，那么就在容器中找这个实例，一个实例名只会有一个实例在容器中，这就实现了单例模式。

同时因为是把所有的实例都放在一个容器里，所以在一个时间段一定有一个实例被使用，所以这个容器就不会被销毁，所以这容器里的其他实例也都不会被销毁。

下面的get将不会再起到反射实例化的作用而只起到了取出实例的作用，这种实现方法就是饿汉模式。

[耦合项目案例：spring/couple](https://github.com/Didnelpsun/notes/tree/master/spring/couple)

[userResult]:data:image/png;base64,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

[apple]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAUCAIAAABEXSnwAAABiElEQVRIDe2WwbGDIBCGyZvXQ0INHkIXsQxKyI0avFmCZWAXpAqSLt6uK7LwlDCTScZDuIju8vu5+8N4aJpG7Gn87AkGWb5Azzry+yzhhbjSvVa03g3XwVVJ5UAk4m3XWV8lUEgCiiuEUbKQlYUyDymlvLVOns8yS/zUbQqEPLebdU62l7nYnwIJ70laNvF0XnjnhFZKwGUaUPTLvRtP5r8lCqHwio0rmYOCzGK8QlQftI4DFLhjUrI1WoAnYIC7lA5okFIIMYFkCkvAVySHgsdofwYUeYR43H1GFD/C2zHFLYQSjOUGLTqp0JNEMLYMK/IY5q0FTvJty7q2iIXJ8QS2X9+IhRCtxgQpTd8GMbzO9liAqEO671mSLBBhDTdGIRRXxLLGZzgLQMiT5kCfzWqN0EBwUM1flMgVQjzPjdYbUFk7LGcg4knekXUNNkUoHoAnOBshvo0ErQ6fjAevMGZRBNoQOtT8fqA07Im1w78Q4jWpn7NdVr/onZm7A6pq2TsrkmvvrkJ/5nfNlasc9zAAAAAASUVORK5CYII=

[fruitprint]:data:image/png;base64,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

[fruitprint2]:data:image/png;base64,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
