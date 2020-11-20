---
layout: post
title: "依赖注入（上）"
date: 2020-03-23 17:17:09 +0800
categories: notes spring base
tags: Spring 基础 xml 构造器 constructor-arg ref type value index 设值函数 property p-namespace 内部类 list set map properties null
excerpt: "代码依赖注入"
---

我们在创建Spring Bean的时候就已经使用过了依赖注入的概念，但是我们一直都没有仔细的系统的去讲。

依赖注入分为两种大的方式，一种是基于注释，一种是基于代码。具体细分一共有三种：

+ 注释
+ 构造函数
+ 设值函数

可注入的数据类型：

+ 基本数据类型与String
+ 其他Bean实例类型
+ 复杂类型/集合类型

每个基于应用程序的Java都有几个对象，这些对象一起工作来呈现出终端用户所看到的工作的应用程序。当编写一个复杂的Java应用程序时，应用程序类应该尽可能独立于其他Java类来增加这些类重用的可能性，并且在做单元测试时，测试独立于其他类的独立性。依赖注入（或有时称为布线）有助于把这些类粘合在一起，同时保持他们独立。

但是显然这些依赖都是应该比较固定的，如果是变化很大的数据，不同用户的注册相关信息之类的，那么依赖注入会造成很大的时间开销，所以是不适合的。

```java
//新建一个Didnelpsun类
public class Didnelpsun{
    //拥有一个私有变量，类型为blog，代表为博客类
    private Blog DidBlog;
    public Didnelpsun(){
        //构造函数中新建一个blog类来赋值给Didnelpsun属性
        DidBlog = new Blog();
    }
}
//这是基本的实现，那么我们如果使用依赖注入的方式来实现呢？
public class Didnelpsun{
    private Blog DidBlog;
    public Didnelpsun(Blog DidBlog){
        this.DidBlog = DidBlog;
    }
}
```

为了控制反转和依赖注入，我们将初始化一个Blog类的的过程从构造函数中移除，而将这个功能交给传入的参数，构造方法不关心这个类是如何构造的。在控制反转中这个类将由容器构造并赋值给这个属性。这就是依赖注入。

我们可能会奇怪构造函数中第一个的DidBlog为什么没有指明this，是因为DidBlog这个属性在第一个构造方法中是独有的，而第二个构造方法中参数和类属性重名了，所以必须指明this，虽然我们也可以不重名，但是并不推荐这样使用，因为并不直观。

首先还是利用[Spring项目模板文件：spring/spring](https://github.com/Didnelpsun/notes/tree/master/spring/spring)来构建示例项目。

## 构造函数注入

### &emsp;传入依赖类（constructor-arg标签与ref属性）

<span style="color:aqua">格式：</span>`<constructor-arg ref="依赖值"/>`

首先我们还是按照构造一个User类，然后User类调用HelloWorld类的思路来举例子：

```java
//User.java
package org.didnelpsun.test;

public class User {
    private HelloWorld helloWorld;
    public User(HelloWorld helloWorld){
        this.helloWorld = helloWorld;
        System.out.println("Start building User class...");
    }
    public void SayHello(){
        helloWorld.SayHello();
    }
}
```

我们来分析一下这个例子。首先我们主要的类是User类，它有一个私有属性是HelloWorld类型的。然后我们使用User的构造器来初始化这个类，它按照依赖注入的概念不在构造函数中创建类，而是使用一个参数引入，然后把参数赋值给类的属性，再打印。User类还有一个方法SayHello，这个方法是调用HelloWrold类的方法。

```java
//HelloWorld.java
package org.didnelpsun.test;

public class HelloWorld {
    public HelloWorld(){
        System.out.println("Start building HelloWorld class");
    }
    public void SayHello(){
        System.out.println("Hello,World!");
    }
}
```

然后再看HelloWorld类，它也有一个只打印的构造方法和一个SayHello方法。

```java
//App.java
package org.didnelpsun;
import org.didnelpsun.test.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App
{
    private static ApplicationContext welcomeContext;
    public static void main(String args[]){
        welcomeContext = new ClassPathXmlApplicationContext("SpringBeans.xml");
        User Didnelpsun = (User) welcomeContext.getBean("Didnelpsun");
        Didnelpsun.SayHello();
    }
}
```

主类就是获取一个名为Didnelpsun的实例，这个实例对应的是User类实例化的，然后调用它的SayHello方法。这里我们要关注到一个细节，虽然User类中的构造器中需要传入一个依赖的类HelloWorld，但是在主类中它并没有表现出传入这个参数。

如在开头所说的，在之前的案例中，如果要传入实例的值，如String类型的打印需要的字符串，需要在xml的property属性标签中配置，那依赖注入是否也是如此呢？

```xml
<bean id="HelloWorld" class="org.didnelpsun.test.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.test.User">
    <constructor-arg ref="HelloWorld"/>
</bean>
```

我们可以在这里看出细节，在xml中首先定义一个HelloWorld的实例，也就是说已经实例化一个名为HelloWorld的HelloWorld类实例了，并把它放在实例池中，然后实例化名为Didnelpsun的User类，因为User类需要传入依赖的HelloWorld类，所以使用<span style="color:orange">\<constructor-arg/>标签</span>，并使用<span style="color:orange">ref</span>属性确定依赖类的实例名，来自动注入依赖的实例，也就是从实例池中取出实例化好了的实例。包括实例化以及注入依赖实例，这些都是在Spring容器中自动完成的，这就是依赖注入，也是一种控制反转。

![result1][result1]

### &emsp;多依赖多类传入

如果我们的参数也多个类的依赖或者一种类多个值的依赖，为了不让参数类型混淆，那么我们建议将对应的参数按照传参顺序来配置。

如果我们要将Didnelpusn类依赖扩展为两个类，一个是HelloWorld，一个是HelloWorld2。不修改App.java。HelloWorld2基本上与HelloWorld一致，只是打印的内容不同。

```xml
<bean id="HelloWorld" class="org.didnelpsun.test.HelloWorld"/>
<bean id="HelloWorld2" class="org.didnelpsun.test.HelloWorld2"/>
<bean id="Didnelpsun" class="org.didnelpsun.test.User">
    <constructor-arg ref="HelloWorld2" />
    <constructor-arg ref="HelloWorld"/>
</bean>
```

```java
public User(HelloWorld helloWorld, HelloWorld2 helloWorld2){
    this.helloWorld = helloWorld;
    this.helloWorld2 = helloWorld2;
    System.out.println("Start building User class...");
}
```

![result2][result2]

所以证明如果不是一个类的参数，那么传参就没有问题。而如果是同一个类，但是内容不同，那么必然需要按传参顺序来传参，如原来的简单属性的传入如String和int类型。也就是以下的传参类型。

### &emsp;固定类型传入（type和value属性）

如果你要传入的依赖类不是类，而是一个包装类，也就是根据基础值而包装好的类，如Integer类等，那么你要如何去实例化这个类呢？显然这是很麻烦且不合理的使用，而type会让你像传入对应的值一样方便。如果你使用type属性显式的指定了构造函数参数的类型，容器也可以使用与简单类型匹配的类型。记住仅支持简单的类型！

```java
//User.java
package org.didnelpsun.test;

public class User {
    private HelloWorld helloWorld;
    private String words;
    private Integer age;
    private String password;
    public User(HelloWorld helloWorld, String words, String password, Integer age){
        this.helloWorld = helloWorld;
        this.words = words;
        this.password = password;
        this.age = age;
        System.out.println("Start building User class...");
    }
    public void SayHello(){
        helloWorld.SayHello();
        System.out.println("age:"+age+" password:"+password+" want to say:"+words);
    }
}
```

我们可以使用type来指定传入参数的类型，然后value代表的是值。这个值必须是和传入的参数的顺序是一致的。

```xml
<bean id="HelloWorld" class="org.didnelpsun.test.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.test.User">
    <constructor-arg ref="HelloWorld"/>
    <constructor-arg type="java.lang.String" value="Hello!"/>
    <constructor-arg type="java.lang.String" value="password!"/>
    <constructor-arg type="java.lang.Integer" value="19" />
</bean>
```

![result3][result3]

如果我们将相同String类型的数据互换：

![result4][result4]

证明如果是相同类型的值的依赖会按照传参的配置顺序来确定。

### &emsp;根据索引传参（index属性）

因为type属性当传入更多相同类型的参数时会按照传值顺序来赋值，这样会比较不方便，所以干脆直接用索引的形式来传入参数。

可以将xml配置文件改成这样：

```xml
<bean id="Didnelpsun" class="org.didnelpsun.test.User">
    <constructor-arg index="0" ref="HelloWorld"/>
    <constructor-arg index="1" value="Hello!"/>
    <constructor-arg index="2" value="password!"/>
    <constructor-arg index="3" value="19" />
</bean>
```

按照参数定义的索引来传入参数，从0开始，对于基本类使用value属性来注入，而对于自定义的依赖类则使用ref属性来注入。

## 设值函数注入

这也是之前我们最经常使用的setter方法。当容器调用一个无参的构造函数或一个无参的静态factory方法来初始化你的bean后，通过容器在你的bean上调用设值函数，基于设值函数的DI就完成了。具体的还可以看看[Java的Setter和Getter方法]({% post_url notes/java/2020-03-25-java-setter-and-getter %})。

### &emsp;设置值与依赖（property标签与value、ref属性）

<span style="color:aqua">格式：</span>`<property name="类属性名" ref="依赖实例名"/>` / `<property name="类属性名" value="简单值"/>`

这种设值方式我们之前已经使用过许多次了，我们将原来的构造函数改成设值函数：

```java
//User.java
package org.didnelpsun.test;

public class User {
    private HelloWorld helloWorld;
    private String words;
    private Integer age;
    private String password;
    public void setHelloWorld(HelloWorld helloWorld){
        this.helloWorld = helloWorld;
    }
    public void setWords(String words){
        this.words = words;
    }
    public void setAge(Integer age){
        this.age = age;
    }
    public void setPassword(String password){
        this.password = password;
    }
    public void SayHello(){
        helloWorld.SayHello();
        System.out.println("age:"+age+" password:"+password+" want to say:"+words);
    }
}
```

```xml
<bean id="HelloWorld" class="org.didnelpsun.test.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.test.User">
    <property name="helloWorld" ref="HelloWorld"/>
    <property name="words" value="Hello!"/>
    <property name="age" value="19"/>
    <property name="password" value="password!"/>
</bean>
```

![result3][result3]

我们还要强调一遍，使用ref属性，表示引用，而这个属性值为要引用的bean的id，而不是类名。但是这时候的name属性，也就是引用的名字，就应该是依赖类的名字的首字母小写后的驼峰式名字，如果不是这样它将无法找到识别。

### &emsp;p-namespace配置

因为写property标签与value、ref属性会比较麻烦，所以这里有简单的方法，<span style="color:aqua">格式：</span>

```xml
<bean id = "实例名" class = "依赖类"
    p:依赖类名-ref="依赖实例"
    p:参数名="值"
    ...
/>
```

如果你要使用这个还需要在xml文件中的beans标签中加上这个配置：`xmlns:p="http://www.springframework.org/schema/p"`

```xml
<bean id="HelloWorld" class="org.didnelpsun.test.HelloWorld"/>
<bean id="Didnelpsun" class="org.didnelpsun.test.User"
    p:helloWorld-ref = "HelloWorld"
    p:words="Hello!"
    p:age="19"
    p:password="password!"
    >
</bean>
```

记住因为是简化的使用，所以命名是比较讲究的，如果是传入依赖类，那么使用方式必须是p:类参数名-ref="实例名"，如果后面不加ref，或者类定义时的参数名不对，都是会报错的。而传入参数主要还是讲究p后面对应的也是定义时的参数名。

### &emsp;内部类传入

在此之前，我们是使用ref属性来传入一个实例的依赖实例，而如果我们不使用这个属性呢？我们可以直接使用property属性来传入依赖类，并使用参数的形式传入实例。

```xml
<property name="helloWorld">
    <bean id="HelloWorld" class="org.didnelpsun.test.HelloWorld"/>
</property>
```

结果是一样的，而我们只是将bean的实例传入来代替了ref属性。参数的name属性代表定义时传入的参数名。也就是说之前是实例化了一个实例，而这个实例和需要这个依赖的实例是同级的，而这时则不是同级的，当要传入的时候再在这个内部创建一个实例传入。

&emsp;

构造器注入和设值函数注入相比，我觉得设值函数的注入更方便。首先设值函数可以在应用程序中重新调用这个函数重新配置实例的属性，而构造器则不行，而且构造器的参数传入必须要按照顺序，而设值函数则只用写出相关的属性名就可以了。虽然设值函数的注入要写许多设值函数，代码量多，但是运用会更灵活，对于不使用的数据可以不用设值。

但是如果一个对象必须配置一个属性，设值函数的注入则不能满足约束，所以就必须使用构造函数来强制要求必须传入某个属性。综上，如果一个对象必须需要某个属性，就使用构造函数配置，其他则使用设值函数配置。

&emsp;

## 注入多值

如果想传入多个值，如List、Set、Map和Properties。那么我们也可以完成，如我们之前已经在表格中显示过的\<list>、\<set>、\<map>、\<props>元素。我们可以直接在xml中定义相关数值，<span style="color:aqua">格式：</span>

```xml
<property name="addressList">
    <list>
        <value>UK</value>
        <value>France</value>
        <value>USA</value>
        <value>China</value>
    </list>
</property>
<property name="addressSet">
    <set>
        <value>UK</value>
        <value>France</value>
        <value>USA</value>
        <value>China</value>
    </set>
</property>
<property name="addressMap">
    <map>
        <entry key="1" value="UK"/>
        <entry key="2" value="France"/>
        <entry key="3" value="USA"/>
        <entry key="4">
            <value>China</value>
        </entry>
    </map>
</property>
<property name="addressProp">
    <props>
        <prop key="one">UK</prop>
        <prop key="two">France</prop>
        <prop key="three">USA</prop>
        <prop key="four">China</prop>
    </props>
</property>
```

元素|描述
:--:|:--
\<list>|它有助于连接数据，如注入一列值，允许重复。
\<set>|它有助于连接一组值，但不能重复。
\<map>|它可以用来注入名称-值对的集合，其中名称和值可以是任何类型。
\<props>|它可以用来注入名称-值对的集合，其中名称和值都是字符串类型。

同时注意，如果是数据结构类型一致，那么不同的子标签可以呼唤，如值集合类型\<list>、\<array>、\<set>三个标签可以互换，也就是说如果如set类型的参数，你可以使用上面这三个子标签来传入对应值，而不是只能使用\<set>。同理键值对类型\<map>和\<props>标签也是如此。

&emsp;

## 空值与null

一般的情况下，如果你没有传入参数，它会默认传入null值。如果你使用的字符串，那么它会打印null，这看起来很不舒服，所以我们可以将空值传入，也就是将value赋值为""。这样它会传入空字符串。

而在某种情况下我们要传入null值怎么办？我们可以使用\<null/>来解决：`<property name = "参数名"><null/></property>`

[xml配置下的依赖注入：spring/dixml](https://github.com/Didnelpsun/notes/tree/master/spring/dixml)

[result1]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASgAAABQCAIAAAAlY39WAAALuklEQVR4Ae1dy3mrOhDm3O/uzzKmhrMIXZgq8lGCd64hO0rwd6twuiBV2FmeDu7MCL0ACfFySPKziIVG89AvDRopZvzrz58/Wfj6/ft3mAgKEAACMxH4ZyYf2IAAEFiAwL9x3r9//8YbgAoEgMAMBLDizQANLEBgKQJwvKUIgh8IzEAAjjcDNLAAgaUIwPGWIgh+IDADATjeDNDAAgSWIjByqrlU/EP4i6qussvp0szRxszF7fr6er1ZdqlUt01U8IDqQYFW9KeWIv2KkB5pcrIZ3HD2oKseJevaAoAkx8vL87nMjXpvLq4AgBEshdUF+uKT7qiHJ2oopiQxPLaRjMeH+0RgS586T48BmyL9ipAGBHHVoM6lozfdjIB1CdWP1NUzZ9zxGMqCbHydtaD0FO6tokV/PbNWF7ieaetK+rjfsqcBkbf7x0AtqnwERvd4RVFkt+vb9/Q6HwvcAYGHITC64vFzrSiPxbW7hXLjz6qulcXeZknWyrYnLoHqj/fX1/uRllIh0yJB0scFRlFx2JU8bt2JfLxbxzzLEFXREh1GrjHPJKe+I5Ao1OO3w7ntcObRHctbDR65rZvy4Vjiq5oixGnrWaiHkle28kBr3o3Jz++8Tc75/t5yDnIxTcHRmwCOwkDR7Rc1McgHmuvqoCG6wdCnq0t3WbXzxPn4RkgdHaOORzovh7oS1/L0083p2pvaRjyZUDSn00UquBPn6m7PP4has4DTTfytqgqixQUayYOFojrTbD3RUHDflbzBhraS29Md22Yrx0qCLG2vWBNdHnNUIDFWrYXMdCzzRo5ztECJ5JnCYX33ITdkFbWtvfr2cEgLVBbyXV2lSfSk2RttlNprsMDzOfMOo54OeZZnz7k6n+JHtULG7lB6XFTRnwBW50CJRZQB5AeamyrffFMdL5Cy0OylmcZmDO28IqSeutFQkzh4vpxO/DwjtOraPWfpyTMV7LBqcrKExhTbBtaHb+/vtFegoVt02dkqcTEHyFtcBTvMxXZsgg5rIaMhSwNzc88NPM0bzd1ELNSo8MjQZS3Kn59zZ2uwGI2coh2aAUbB7fofTQRSkmXKw8jHiqfrtVF1LSARrrbF1AkwE3k2xJuKrfqRD4/FDI9hikyvCMmwc2F0xTOtyRZa4eS581K+e6fvpo1bkJauO3m+pweNOJRgl3WFssxe5x8EK4gkEeIu6x4dMBAlPSbk0cSzK2veltjNHc/zc126PfagdwlpZf+4xISYDASpKw7FR3NqmrJ4yu6H3DQ2BVFiuNrOTZwAc5FnOD5mABqevfTAe+Uwolbdco+SI6Qe0OmOp1h5fSpVZN+T5VSI3Rm7qsKZ13uHvH3RGdcVlflzaT3BNmy06+IC6asIcfTLrDdPA767vZvHz3NRNM0la7KmolIql9MuqbgE+ckP4bHZa5YKbujH3RGS38+UUNPlUM9kJ3LkGR5YXs3kL2jP5QqJliMCo3yayMpMrOUKk2Bft5r5yVGHQED8hLo+HZopjYVQ0EZ+Yi4T0s0VydHqJLxHFKlY1Q5gXr5QtM0hccbOkJcl+R37G/0tjsf2/wsRrhF9IfJM5NlSMTkkN1ifMntlmzQsIUIShtEVrztdxaXN048Dxf+uz2e90SeqBKHd2sv1Vh2GLezWdlm9bXy3sdwzRKW2QLakZufLE6BUJ0NMeL0ez9oMr2OKW68UERLvduigSCI57uz7S4rAQbOlkg2sre1Sp80Ic8UobFVmQiFPYKRfERKbQwGLOcrpmqcXI3IN9s82Uh7jGu5C1Iwg8sOyVG0Lh4299RSVgzGzHngToDsF3dkrq6HdQRlppC1C6lv4K576oc+AmlUR4JnmffNJRs/7Vsqq+iBsJwhMDTV3YvZ3MUN2T25n5GxQryEuAeXvhQBWvM8eTy+6ImO6kdxn2wf9myAAx9sEVggFAnEEEGrG8QEVCGyCABxvE1ghFAjEEYDjxfEBFQhsggAcbxNYIRQIxBGA48XxARUIbIIAHG8TWCEUCMQRgOPF8QEVCGyCABxvE1ghFAjEEYDjxfEBFQhsggAcbxNYIRQIxBEYfS0ozr4Lau8b/lOskq9Kui93MLPz/cn4VycHVA8KnGLRN2mbjOE36e/EbiQ5XudFI28uDky9iSZ0mq8usCM/5ZZ6eKJ2YkpK+we36b86xDUqz9eDTQmr2zmGYcMfQxl3PHlyEYrm5dLHGPYoLe38WE/d6gLXMw2S9oPA6B6P0zrIi/z7sRmWAIEvj8DoiidZS5DQ1h1oiQFsBScckcupp2XPzZ5ClEcmtPW3Br4tjpHeq3/KxBlJZv2MB93dssam++ma4fNEjI+QuvJ3fz/qeIQKEtraYZSxD6RVbYNMnlOWQZeIseIG5KbcYHlCWy249xlOq+obz3derluqmJhktj2Gon5N2oiQoo3TxfZA2V3FaKhJFvN8QUJbGbqZaVWZl1BsF0FOmGVyPnDuOa6Qa0pCW8UR+DuY943TSji7Bil6De3Sk5hleLfpYgOw7Kh6dMUzttKoIKEt/zSAyShpoFlSkBRpKya0FQ8fzrjKPh7NdWsy2qVmGd5tutglI/IY3nTHU/Ygoe0W40LBZ63k2nUxoqefDKnjAeohSRI4nPQyribJj6juk1h15uR77Lfo1LBNZSTZcdh4m3S816+Ojv3fpoSabi+Q0HYPCW05NtV5dWl01C8V6HjVHS4vrerauW5pcd1Tulh+egV+2WMeyQVy9fLoiscnAYWjVp5HzgOum/wTCW0FLC9BqgNftzgzoS0vXFVts7Q6C5ksKMMZV2nsQrluu3Yl3rcSrSFcIWn7vXnjodGdMeumi/XTzXvdmEfyRKx3gyxj62E5RxLPTyS0nYPcF+eZGmp+8e7uzXxzuKkNQ0JbjcQ3/8SK99kD7MVkZIwTNX62adC/HQJwvO2whWQgEEQAoWYQGhCAwHYIwPG2wxaSgUAQATheEBoQgMB2CMDxtsMWkoFAEAE4XhAaEIDAdgjA8bbDFpKBQBABOF4QGhCAwHYIwPG2wxaSgUAQATheEBoQgMB2CMDxtsMWkoFAEIHR14KCnCME5yuI3W8fRkgjQh9FTraQG3ovF9gsJG6yo0fZDT1fBoGxFY/e7qr9F/JortXn0r7wFegqeRtfQ9MvQgoIi1QPmsOV3luEEQFDpCUWOvkThkSjDggwAmOOt3uUQvO8nx5h912BgT8IgS/veD9orNDVb4TA4j0e73J0aojuZm4OTl7mApNIICyJV7aSk3/dmFP9foC8XnpveYICyXLKMjsjhavbZVLSpuYLmwgKEOghkOR4vGXyONucKzKnTXZXvvMSpHosSTcypcl9VXpUFuilyIrLkOx12XMuKT8yFYKOCCQNE1O4+l0O/awJ4tz4UIGatsdrzxrktMQ5LhlNkDoRX5Us62LOYzgrzk1yIcQE6U1eUTxdr43XfFygXVLTUrgmJLSF08VGC7QWgaQVL4CWLDG5zTAlzRYGXv60tXFkwIS2miwpDsVHc2qasnjK7ofcyDEFadoVqL2WiOSDlLA3fkkMu25C27hCUL8rAkscjzFZY1vnYuunYOO723vKTH8uiqa50H6rqajkSJwr0BFhi74X23qvRJC4Bng03AABhcCSU821E6SqZP6VOavJy5cyl58TMKPFu83OvxHZGfKyJL/j6U5/i+ORzlr4ShCoGib/ZSU6kyxvEI2tVoKYOFBvW6AEBLJFKx7vkDI6UaktkHoFlFMNXa3OZhJI3IROSY1AzaIFyc97FAVv5K43J6su0fViRK7Brtu8CXlUoJHsFiLGN7QFrSsVXnP331/OB5cVZSCQhMCXyzImTmHPRJI6iUZAYG8ILAk1P6Evck4pKfs/QTlUAoHVEFgUaq5mRZIgFQDK4aMfZSZxoxEQ2BMCXy7U3BN4sAUIzEXgi4Wac7sJPiCwLwTgePsaD1jzQxCA4/2QgUY394UAHG9f4wFrfggCcLwfMtDo5r4QgOPtazxgzQ9BAI73QwYa3dwXAv8Dzu9JkaE9DGoAAAAASUVORK5CYII=

[result2]:data:image/png;base64,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

[result3]:data:image/png;base64,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

[result4]:data:image/png;base64,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
