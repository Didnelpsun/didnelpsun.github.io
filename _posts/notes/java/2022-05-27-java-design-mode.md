---
layout: post
title:  "设计模式"
date:   2022-05-27 09:45:14 +0800
categories: notes java senior
tags: Java 高级 设计模式
excerpt: "设计模式"
---

设计原则：

+ 单一职责原则：一个类只负责一个功能。
+ 里氏替代原则：子类能拓展父类，但是不能修改父类。
+ 依赖倒置原则：面向接口编程，而不是面向具体业务逻辑。
+ 接口隔离原则：细化接口功能，彼此功能要隔离，每个接口中的功能要少。
+ 最少知道原则：（提米特法则）该对象对其他对象应该保持最少的了解。
+ 开闭原则：只支持扩展，对扩展要开放，对修改要关闭。

设计模式分类：

+ 创建型模式：简单工厂模式、工厂方法模式、抽象工厂模式、建造者模式、单例模式、原型模式。
+ 结构型模式：适配器模式、装饰器模式、代理模式、外观模式、桥接模式、组合模式、享元模式。
+ 行为型模式：策略模式、模板方法模式、观察者模式、迭代子模式、责任链模式、命令模式、备忘录模式、状态模式、访问者模式、中介者模式、解释器模式。

### 工厂模式

```java
// Factory.java
package org.didnelpsun.factory;

// 工厂接口
public interface Factory {
    void build();
}
```

```java
// AnimalFactory.java
package org.didnelpsun.factory;

// 工厂实例
public class AnimalFactory implements Factory {
    @Override
    public void build() {
        System.out.println("AnimalFactory");
    }
}
```

```java
// BallFactory.java
package org.didnelpsun.factory;

// 工厂实例
public class BallFactory implements Factory {
    @Override
    public void build() {
        System.out.println("BallFactory");
    }
}
```

### 简单工厂模式

也称为静态工厂模式。生产实例的工厂方法为静态方法，根据传入参数不同进行判断生成实例的类型。

```java
// SimpleFactory.java
package org.didnelpsun.factory;

// 简单工厂模式
public class SimpleFactory {
    public static Factory createFactory(String type) {
        if ("Animal".equals(type)) return new AnimalFactory();
        else if ("Ball".equals(type)) return new BallFactory();
        else return null;
    }
}
```

依赖一个父类实现而不是具体的子类，实现了对象的创建和对象的使用分离，将对象的创建交给专门的工厂类负责。它可以根据传入的类型去判断该创建哪个类的的对象。不用直接创建具体类了，也不用管它们是怎么实现的。明确了各自的职责和权利，有利于整个软件体系结构的优化。

但是扩展性差，违反了开闭原则（因为所有的判断都写在工厂类里，每增加一种产品，都要修改工厂类代码）。

### 工厂方法模式

为了避免简单工厂模式的缺点，工厂方法模式和简单工厂模式最大的不同在于，简单工厂模式只有一个（对于一个项目）工厂方法模式和简单工厂模式最大的不同在于，简单工厂模式只有一个（对于一个项目或者一个独立模块而言）工厂类，而工厂方法模式有一组实现了相同接口的工厂类。

+ 产品接口（Factory）：定义了产品的共用资源例如方法，提供给子类继承使用，强制子类实现。
+ 产品类（AnimalFactory、BallFactory）：继承产品接口，实现接口的方法，也可以覆盖接口的方法，从而产生各种各类的产品。
+ 工厂接口（FactoryBuilder）：定义了创建产品的方法，具体创建者必须继承该类，实现工厂方法。
+ 工厂实现类（MethodAnimalFactory、MethodBallFactory）：继承工厂接口，实现工厂方法，负责创建产品对象。

```java
// FactoryBuilder.java
package org.didnelpsun.factory;

// 构造工厂接口
public interface FactoryBuilder {
    Factory createFactory();
}
```

```java
// MethodAnimalFactory.java
package org.didnelpsun.factory;

// 工厂方法模式
public class MethodAnimalFactory implements FactoryBuilder {
    @Override
    public Factory createFactory() {
        return new AnimalFactory();
    }
}
```

```java
// MethodBallFactory.java
package org.didnelpsun.factory;

// 工厂方法模式
public class MethodBallFactory implements FactoryBuilder {
    @Override
    public Factory createFactory() {
        return new BallFactory();
    }
}
```

&emsp;|简单工厂模式|工厂方法模式
:----:|:----------:|:----------:
判断对象类型方式|方法内包含判断逻辑|调用者判断实例化工厂类型
增加新类方式|修改工厂类|添加新类继承工厂类
成员方法类型|静态方法|抽象方法

+ 具有很强的的扩展性、弹性和可维护性。扩展时只要添加一个工厂类继承工厂接口，而无须修改原有的工厂代码，因此维护性也好。解决了简单工厂对修改开放的问题。
+ 使用了依赖倒置原则，依赖抽象而不是具体，使用（客户）和实现（具体类）松耦合。
+ 客户只需要知道所需产品的具体工厂，而无须知道具体工厂的创建产品的过程，甚至不需要知道具体产品的类名。
+ 一个具体产品对应一个类，当具体产品过多时会使系统类的数目过多，增加系统复杂度。
+ 每增加一个产品时，都需要一个产品类和一个产品工厂类，使得类的个数成倍增加，导致系统类数目过多，复杂性增加。

#### 抽象工厂模式

即工厂的工厂。抽象工厂能生产多个不同类型的产品，而简单工厂和工厂方法都只能生产出一种产品。实际上是工厂方法的进一步抽象。

已知AnimalFactory和BallFactory都是实现Factory接口的类，所以可以定义一个综合的抽象接口AbstractFactory，使用Factory接口，然后这种接口实现的具体类AbstractFactoryImpl中Factory接口的实现类AnimalFactory和BallFactory实例化。

```java
// AbstractFactory.java
package org.didnelpsun.factory;

// 抽象工厂模式接口
public interface AbstractFactory {
    // 创建动物
    Factory createAnimal();
    // 创建球类
    Factory createBall();
}
```

```java
// AbstractFactoryImpl.java
package org.didnelpsun.factory;

// 抽象工厂模式
public class AbstractFactoryImpl implements AbstractFactory {
    @Override
    public Factory createAnimal() {
        return new AnimalFactory();
    }

    @Override
    public Factory createBall() {
        return new BallFactory();
    }
}
```

### 单例模式

一个类只有一个实例，且需要一个全局访问方法。

使用单例模式的类：Runtime类（饿汉式）、Console类（双检锁懒汉式）、Collection类（内部类懒汉式）、Comparators类（枚举类）。

创建父类：

```java
// Singleton.java
package org.didnelpsun.singleton;

// 单例模式
public class Singleton {
    // 静态成员变量实例
    private static Singleton INSTANCE;

    // 构造方法设为保护
    protected Singleton() {

    }

    // 获取实例方法
    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

#### 饿汉式

通过在类中定义一个私有静态常量INSTANCE来赋值一个单例实例，并设置对应的方法来获取这个实例。在初始化就创建了这个实例，所以是饿汉式。

```java
// HungrySingleton.java
package org.didnelpsun.singleton;

// 饿汉式单例模式
public class HungrySingleton extends Singleton {
    // 饿汉式直接定义一个实例作为静态变量
    private static final Singleton INSTANCE = new HungrySingleton();

    // 将构造方法设为私有从而禁止外部构造
    private HungrySingleton() {
    }

    // 通过方法获取静态实例
    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

#### 懒汉式

将INSTANCE赋值为null，在创建对象时添加一个判断，只在未创建时才创建对象。

```java
// LazySingleton.java
package org.didnelpsun.singleton;

// 懒汉式单例模式
public class LazySingleton extends Singleton {
    // 懒汉式首先定义静态变量
    private static Singleton INSTANCE = new LazySingleton();

    // 将构造方法设为私有从而禁止外部构造
    private LazySingleton() {
    }

    public static Singleton getInstance() {
        // 如果没有才实例化
        if (INSTANCE == null) {
            INSTANCE = new LazySingleton();
        }
        return INSTANCE;
    }
}
```

#### 双检锁

在多线程时懒汉式会出现问题，多个线程查看INSTANCE是否为空时发现为空，此时可能多个线程同时创建多个INSTANCE，从而导致单例模式失败。

如果想在多线程环境中进行保护，在创建实例对象的方法上添加synchronized关键字进行加锁，而不在成员上添加。

```java
// CheckSingleton.java
package org.didnelpsun.singleton;

// 双检锁式单例模式
public class CheckSingleton extends Singleton {
    // 懒汉式首先定义静态变量
    private static Singleton INSTANCE = new CheckSingleton();

    // 将构造方法设为私有从而禁止外部构造
    private CheckSingleton() {
    }

    public static synchronized Singleton getInstance() {
        // 如果没有才实例化
        if (INSTANCE == null) {
            INSTANCE = new CheckSingleton();
        }
        return INSTANCE;
    }
}
```

此时对整个方法加锁，要获取实例时就会查看是否有锁，保证了执行获取实例方法的互斥，但是效率会下降。尝试使用同步代码块来解决，而不是对整个方法加锁：

```java
// CheckSingleton.java
package org.didnelpsun.singleton;

// 双检锁式单例模式
public class CheckSingleton extends Singleton {
    // 懒汉式首先定义静态变量
    private static Singleton INSTANCE = new CheckSingleton();

    // 将构造方法设为私有从而禁止外部构造
    private CheckSingleton() {
    }

    public static Singleton getInstance() {
        // 如果没有才实例化
        if (INSTANCE == null) {
            synchronized (Singleton.class) {
                INSTANCE = new CheckSingleton();
            }
        }
        return INSTANCE;
    }
}
```

发现加锁失败，因为创建实例和实例方法不是一体化，所以可能多个进程同时进入获取实例方法等待，然后等一个进程创建实例后释放锁其他进程获得锁重新创建。

所以解决方法是在同步代码块中再次检查是否赋值，如果有多个进程同时进入获取实例方法并有一个进程得到锁了，则其他进程直接去获取这个进程赋值的实例而不是自己重新创建。这就是双检锁：

```java
// CheckSingleton.java
package org.didnelpsun.singleton;

// 双检锁式单例模式
public class CheckSingleton extends Singleton {
    // 懒汉式首先定义静态变量
    private static volatile Singleton INSTANCE = new CheckSingleton();

    // 将构造方法设为私有从而禁止外部构造
    private CheckSingleton() {
    }

    public static Singleton getInstance() {
        // 如果没有才实例化
        if (INSTANCE == null) {
            synchronized (Singleton.class) {
                if (INSTANCE == null) INSTANCE = new CheckSingleton();
            }
        }
        return INSTANCE;
    }
}
```

成员上需要添加volatile来设置屏障防止指令重排。

#### 内部类

可以在静态内部类中将INSTANCE赋值一个实例。

```java
// InnerSingleton.java
package org.didnelpsun.singleton;

// 内部类式单例模式
public class InnerSingleton extends Singleton {
    // 将构造方法设为私有从而禁止外部构造
    private InnerSingleton() {
    }

    // 声明一个静态内部类，中声明一个静态实例
    private static class Inner {
        // Inner类可以调用InnerSingleton类的构造方法为自己成员赋值
        // 定义实例成员
        private final static InnerSingleton INSTANCE = new InnerSingleton();
    }

    // 通过方法获取静态实例
    public static Singleton getInstance() {
        // 返回内部类的成员
        return Inner.INSTANCE;
    }
}
```

内部类本质是一个懒汉式，加载User时UserHolder是不会初始化的，这是因为外部类加载时内部类不会随之加载，只需要获取实例getInstance时调用内部类才会加载。

由于虚拟机JVM默认每个类只加载一次，所以创建时只会运行一次，是线程安全的。

#### 破坏单例

破坏单例对象的方式：

+ 反射。通过实例反射类，再根据类实例化实例。通过在构造方法中INSTANCE常量判断是否存在实例。
+ 反序列化。将实例序列化为字节数组，再将序列化二进制结果反序列化为新的实例。重写readResolve方法返回INSTANCE常量。
+ unsafe对象。通过JDK1.8以后的unsafe包的实例化方法。无法预防。

```java
public static void reflect() {
    try {
        // 获取类
        Class<Singleton> singletonClass = Singleton.class;
        // 获取构造方法
        Constructor<Singleton> constructor = singletonClass.getDeclaredConstructor();
        // 利用反射构建实例
        // 直接绕过Singleton构造方法的protected权限限制
        Singleton singleton1 = constructor.newInstance();
        Singleton singleton2 = constructor.newInstance();
        System.out.println(singleton1.hashCode());
        System.out.println(singleton2.hashCode());
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

#### 枚举类

通过枚举类可以将实例全部变为常量式，从而实现单例模式。

在枚举类中只定义一个变量，从而实现饿汉式的枚举类单例。

```java
// EnumSingleton.java
package org.didnelpsun.singleton;

// 枚举式单例模式
public enum EnumSingleton {
    // 实例常量
    INSTANCE;
    // 获取常量方法
    public static EnumSingleton getInstance() {
        return INSTANCE;
    }
}
```

+ 反射无法无法破坏枚举类单例，因为枚举类没有无参构造方法，只有两个参数的构造方法，第一个参数为枚举名，第二个为序号，所以反射时会报错。
+ 反序列化无法破坏枚举类单例，因为反序列化时会特殊处理，直接返回实例而不会返回默认的字节数组。
+ unsafe可以破坏枚举类单例，所以unsafe类不开放给程序使用。

### 代理模式

用来增强目标对象的方法，帮助处理其非核心业务的其他功能。

实现方式：

+ 静态代理：直接新建代理类添加代理方法。
+ JDK代理：通过接口的proxy.newInstance返回代理对象。目标对象必须实现相关接口。
+ Cglib代理：通过继承子类的关系实现代理，不需要实现接口。

### 模板模式

发父类中定义模板模式接口，在子类中实现。

如JdbcTemplate类的refresh方法中定义了初始化过程。

### 观察者模式

也称为监听器模式。本质是对象的一对多依赖关系。

如Spring、SpringBoot的监听器的设计。

### 装饰器模式

动态增强目标对象的方法，不改变其结构。

比如MyBatis的缓存模块。

### 策略模式

将相关方法放在一个类中的模式。核心为一系列的算法。

### 适配器模式

让接口不匹配的不同实例能共同使用。

MyBatis中的日志框架。
