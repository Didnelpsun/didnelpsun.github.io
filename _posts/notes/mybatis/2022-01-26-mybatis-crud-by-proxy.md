---
layout: post
title:  "代理CRUD操作"
date:   2022-01-26 16:08:33 +0800
categories: notes mybatis base
tags: MyBatis 基础 代理 CRUD
excerpt: "基于代理DAO进行CRUD"
---

使用[案例一XML创建方式代码：MyBatis/demo1_build_xml](https://github.com/Didnelpsun/MyBatis/tree/main/demo1_build_xml)。

## CRUD基本流程

以查询所有为例，即调用SelectList方法：

1. SqlSessionFactoryBuilder接受SqlMapConfig.xml文件流，构建出SqlSessionFactory对象。
2. SqlSessionFactory读取SqlMapConfig.xml读取SqlMapConfig.xml中连接数据库和mapper映射信息，用来生产出真正操作数据库的SqlSession对象。
3. SqlSession对象的两个作用：无论哪个分支，除了连接数据库信息，还需要得到SQL语句：
   + 生成接口代理对象。
   + 定义通用CRUD方法。
4. SqlSessionImpl对象是SqlSession所实现的接口，有两种使用方式：
   + getMapper方法：①先用SqlSessionFactory读取的数据库连接信息创建Connection对象。②通过JDK代理模式创建出代理对象作为getMapper方法返回值。主要工作是创建代理时第三个参数处理类中得到SQL语句。③执行对应CRUD操作。
   + CRUD方法（selectList、selectOne、Insert等）：①用SqlSessionFactory读取的数据库连接信息创建出JDBC的Connection对象。②直接得到SQL语句，使用JDBC的Connection对象进行CRUD操作。
5. 封装结果集。无论是使用代理对象还是通用CRUD方法，都要对返回的数据库结果集进行封装，变成Java对象返回给调用者，所以必须知道调用者所需要的返回类型。

&emsp;

## 基本CRUD操作

CRUD操作如果是使用XML来实现基本上都是只用修改两个文件，一个是UserDAO.xml，其类似于一个申明文件，表明对User实体类的DAO操作方法的列表，另外一个是UserDAO.xml，用来具体实现对User类的增删改查，这里就是用来写SQL语句的。

最后在测试文件中通过UserDAO代理对象调用这些方法来执行SQL操作。

### &emsp;插入

在UserDAO的接口中：

```java
// 插入用户
void insertUser(User user);
```

表明插入的是一个User对象。

在UserDAO.xml中：

```xml
<!--插入用户-->
<insert id="insertUser" parameterType="org.didnelpsun.entity.User">
   insert into user(name,sex,birthday,address) values (#{name},#{sex},#{birthday},#{address});
</insert>
```

其中parameterType代表的就是方法中传入的参数的类型，要标明其类的全限定类名。

参数以#{value}的形式来引入SQL语句。如#{name}与parameterType="org.didnelpsun.entity.User"结合后编译就变成了org.didnelpsun.entity.User.name。

### &emsp;更新

在UserDAO的接口中：

```java
// 更新用户
void updateUser(User user);
```

在UserDAO.xml中：

```xml
<!--更新用户-->
<update id="updateUser" parameterType="org.didnelpsun.entity.User">
        update user set name=#{name},sex=#{sex},birthday=#{birthday},address=#{address} where id=#{id};
</update>
```

### &emsp;删除

在UserDAO的接口中：

```java
// 删除用户
void deleteUser(Integer id);
```

直接传入用户的ID就可以了。

在UserDAO.xml中：

```xml
<!--删除用户-->
<delete id="deleteUser" parameterType="Integer">
   <!--由于只有一个参数，所以这个参数就是个占位符，叫什么都可以-->
   delete from user where id=#{id};
</delete>
```

首先对于parameterType="Integer"，这个参数可以是INT，INTEGER，int，也可以是java.lang.integer。这里的具体名称无所谓。

然后是对于只有一个值类型的参数，如String、Char这种，而不是对象的，SQL语句中参数名可以为任何值，如id，uid等，只起到占位符的作用。因为如果参数是对象类型，则SQL语句的参数是默认以parameterType所指向的值为基础的，如#{name}就是org.didnelpsun.entity.User.name，而指向的如果是值类型，则参数就直接指向java.lang.integer包装类这种或直接int，其下面不包含对象的成员，所以就默认指向的是这个类型本身。

### &emsp;查询

#### &emsp;&emsp;简单查询

在UserDAO的接口中：

```java
// 查询一个用户
User selectUser(Integer id);
```

在UserDAO.xml中：

```xml
<!--查询一个用户-->
<select id="selectUser" parameterType="Integer" resultType="org.didnelpsun.entity.User">
   select * from user where id=#{id};
</select>
```

通过上面的CRUD基本操作，可以进一步深入了解MyBatis的基本结构。最核心的还是DAO文件。在测试程序中调用DAO中的方法，然后根据DAO的Java文件中的方法在XML中找到对应的配置，将参数传入，通过对应的SQL语句获取结果集，然后根据resultType属性封装成Java对象返回给DAO，最后返回给测试程序进行处理。

#### &emsp;&emsp;聚合函数

可以直接使用聚合函数。

在UserDAO的接口中：

```java
// 获取用户总数
Integer getUsersSum();
```

在UserDAO.xml中：

```xml
<!--获取用户总数，即记录总条数-->
<select id="getUsersSum" resultType="Integer">
   select count(id) from user;
</select>
```

#### &emsp;&emsp;模糊查询

在UserDAO的接口中：

```java
// 根据用户名模糊查询用户
List<User> selectUsersByName(String name);
```

在UserDAO.xml中：

```xml
<!--根据名称模糊查询用户-->
<select id="selectUsersByName" parameterType="String" resultType="org.didnelpsun.entity.User">
   <!--这里不能使用百分号来模糊查询，必须在测试代码中写-->
   <!--这种方式参数是以PreparedStatement占位参数的形式变成SQL语句，即进行预处理，所以更推荐-->
   select * from user where name like #{name}
   <!--如果是模糊查询也可以使用下面的方式，不过里面的参数固定为 ${value} -->
   <!-- select * from user where name like '${value}'; -->
   <!--这种方式参数是以Statement拼接字符串的形式变成SQL语句-->
</select>
```

所以不建议使用下面的引号方式编写SQL语句。直接将在测试时将模糊字符串传入，如`List<User> users = userDAO.selectUsersByName("%黄%");`。

### &emsp;测试

最后的测试文件为：

```java
// AppTest.java
package org.didnelpsun;

//import static org.junit.Assert.assertTrue;
import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class AppTest {
    // 这些成员都是公共的所以提取出来
    private InputStream in;
    private SqlSession session;
    private UserDAO userDAO;

    // 测试之前执行
    @Before
    public void init() {
        // 1.读取配置文件
        in = null;
        try {
            in = Resources.getResourceAsStream("SqlMapConfig.xml");
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 2.创建SqlSessionFactory工厂
        // SqlSessionFactory不能new
        SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(in);
        // 3.使用工厂生产SqlSession对象
        session = factory.openSession();
        // 4.使用SqlSession创建DAO接口的代理对象
        userDAO = session.getMapper(UserDAO.class);
    }

    // 测试之后执行
    @After
    public void destroy() throws Exception {
        // 提交事务，否则事务会回滚
        session.commit();
        // 6.释放资源
        session.close();
        assert in != null;
        in.close();
    }

    @Test
    public void Test() {

        // 5.使用代理对象执行方法
        // testInsertUser();
        // testSelectAllUsers();
        // testDeleteUser();
        // System.out.println("更新后：");
        // testSelectAllUsers();
        // testSelectUsersByName();
        testGetUsersSum();
    }

    // 测试查询所有用户
    public void testSelectAllUsers() {
        List<User> users = userDAO.selectAllUsers();
        for (User user : users) {
            System.out.println(user.toString());
        }
    }

    // 测试插入用户
    public void testInsertUser() {
        Calendar c = Calendar.getInstance();
        c.set(2000, 2, 14);
        Date d = new Date();
        d = c.getTime();
        User user = new User("蓝新煜", "男", d, "福建省福州市");
        userDAO.insertUser(user);
    }

    // 测试更新用户
    public void testUpdateUser() {
        Calendar c = Calendar.getInstance();
        c.set(1998, 8, 21);
        Date d = new Date();
        d = c.getTime();
        User user = new User(2, "黄桓康", "男", d, "湖北省鄂州市");
        userDAO.updateUser(user);
    }

    // 测试删除用户
    public void testDeleteUser() {
        userDAO.deleteUser(3);
    }

    // 测试查询用户
    public void testSelectUser() {
        User user = userDAO.selectUser(1);
        System.out.println(user.toString());
    }

    // 测试根据名称查询用户
    public void testSelectUsersByName() {
        List<User> users = userDAO.selectUsersByName("%黄%");
        for (User user : users) {
            System.out.println(user.toString());
        }
    }

    // 测试获取用户总数
    public void testGetUsersSum() {
        System.out.println("用户总数为：" + userDAO.getUsersSum());
    }
}
```

&emsp;

## 输入类型

即xml标签中的parameterType属性。

### &emsp;简单类型

即Java基本类型。如之前所说整形可以是INT也可以是Interger。

### &emsp;传递POJO对象

之前一般使用的都是POJO对象。使用OGNL表达式解析对象字段的值，#{}或者使用${}中的值为POJO属性名称。

POJO（Plain Ordinary Java Object）简单的Java对象，没有使用Entity Beans的普通Java对象，实际就是普通JavaBeans，是为了避免和EJB混淆所创造的简称。

POJO不担当任何特殊的角色，也不实现任何特殊的Java框架的接口如，EJB，JDBC等等。如我们现在定义的UserDAO就是POJO，其只起到数据库持久层的作用，不进行其他特色功能。

而OGNL表达式即Object Graphic Navigation Language，通过对象的取值方式来获取数据，实际上将getter省略了，如类中`user.getName()`，而OGNL表达式为`user.name`，虽然name属性值仍是私有，看着方法将name属性变成public的，但是OGNL默认就调用getter方法。

### &emsp;传递POJO包装对象

主要用于联级查询。

定义一个Query类：

```java
// Query.java
package org.didnelpsun.entity;

public class Query {
    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
```

在UserDAO的接口中：

```java
// 根据查询条件对象Query混合模糊查询
List<User> selectUsersByQuery(Query query);
```

在UserDAO.xml中：

```xml
<!--根据Query对象模糊查询用户-->
<select id="selectUsersByQuery" parameterType="org.didnelpsun.entity.Query" resultType="org.didnelpsun.entity.User">
   select * from user where name like #{user.username};
</select>
```

主要针对多个表联合查询，由于select标签传入的参数只能有一个对象，所以可以将多个表的公共键即多个查询条件合并为一个类来进行查询。

&emsp;

## 输出类型

封装时要求实体类的属性与数据库的列名保持一致。

### &emsp;基本类型

如int等。

### &emsp;POJO对象

如之前使用的User对象。

### &emsp;POJO列表

这里返回封装的目标是一个类，在实际返回时由于可能返回多个值所以可以返回List泛型即POJO列表。

### &emsp;自增ID处理

#### &emsp&emsp;插入后自动生成主键获取

在进行插入操作时，如果一条记录的主键是由数据库自动生成的话，那我们基本上是不能直接插入这个属性的，那么我们插入记录后如何获取这个记录所自动生成的主键呢？

使用SQL语句插入时：`insert into 表名(属性列) values (属性值); select last_insert_id();`。

而在MyBatis需要在XML配置中：

```xml
<insert id="DAO处理类方法名" parameterType="参数名">
   插入语句
   <!--配置插入操作后获取插入数据的ID-->
   <selectKey keyProperty="ID对应实体类属性名" keyColumn="ID对应表列名" resultType="返回的ID类型" order="AFTER">
    select last_insert_id();
   </selectKey>
</insert>
```

#### &emsp&emsp;自增ID注入

也可以不用多写SQL语句，MyBatis已经提供属性来获取这个自增的ID：

```xml
<insert id="DAO处理类方法名" parameterType="参数名" useGenerateKeys="true" keyProperty="自增的ID名">
    插入语句
</insert>
```

这样插入后MyBatis会自动获取数据库返回的自增ID赋值给传入的类的实例中。

### &emsp;Java属性与数据库列名关系

对于Windows的SQL数据库而言是不区分大小写的，而对于Linux的SQL数据库是严格区分大小写的，所以数据库列名与用来封装的Java实体类的属性名必须完全一样。

有两种处理方法：

1. SQL语句中使用as：数据库列名 as 实体类属性名。
2. 配置列名与属性名的对应关系：

```xml
<!--配置Map-->
<!--id属性的标识符可以任意-->
<resultMap id="标识符" type="实体类名">
   <!--主键字段的对应-->
   <id property="实体类属性名" column="数据库列名"></id>
   <!--非主键字段的对应-->
   <!--必须严格大小写-->
   <result property="实体类属性名" column="数据库列名"></result>
</resultMap>
<!--需要配置对应关系的标签，如select标签-->
<!--不需要parameterType属性-->
<select id="DAO方法名" resultMap="对应resultMap的标识符">
</select>
```

[案例三使用代理CRUD代码：MyBatis/demo3_crud_by_proxy](https://github.com/Didnelpsun/MyBatis/tree/main/demo3_crud_by_proxy)。
