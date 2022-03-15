---
layout: post
title:  "注解开发"
date:   2022-02-05 23:35:04 +0800
categories: notes mybatis base
tags: MyBatis 基础 注解
excerpt: "注解开发"
---

之前的XML文件主要有两个，一个是resources文件夹中的SqlMapConfig.xml用来配置MyBatis整体，一个是resources下面的DAO文件夹下的与实体类DAO操作的Java文件对应的DAO.xml。

这里的注解开发是指将实体类DAO的XML文件变成注解，保留SqlMapConfig.xml。

XML方式多用于复杂的联表，注释方式多用于简单的单表。所以XML方式更常用，因为对于复杂的情况注释方式配置会非常麻烦。

## 改造构建

使用[案例一XML创建方式代码：MyBatis/demo1_build_xml](https://github.com/Didnelpsun/MyBatis/tree/main/demo1_build_xml)。

不用编写DAO.xml文件与编写DAO配置，直接将java/resources下的org.didnelpsun.dao文件夹删除。

然后更改UserDAO，给对应方法加上注解，里面是SQL语句：

```java
public interface UserDAO {
    // 查询所有用户
    @Select("select * from user")
    List<User> selectAllUsers();
}
```

然后对SqlMapConfig.xml更改对应的DAO的mapper的resource属性，使用class属性指定被注解的dao全限定类名：

```xml
<mappers>
    <!--XML方式用resource属性，且字符串指向文件路径，用斜线分割-->
    <!--注解方式用class属性，且字符串指向全限定类名，用点分割-->
    <!--class是对应dao的全限定类名-->
    <!-- <mapper class="org.didnelpsun.dao.UserDAO"/> -->
    <!--直接将实体类DAO的包全部导入-->
    <package name="org.didnelpsun.dao"/>
</mappers>
```

最后结果是一样的。

所以注解是什么意思呢？就是DAO实现方式的简化。若是我们自己写selectAllUsers方法，就必须接受一个SessionFactory然后对这个Session进行处理，并进行对应的操作，而使用注解或XML就直接写一个SQL语句就可以了，其他的对应的Session维护代码由MyBatis自动完成。

在注释下根据包名org.didnelpsun.dao、DAO接口名UserDAO、DAO方法名selectAllUsers就能合成这个方法的全限定类名org.didnelpsun.dao.UserDAO.selectAllUsers，从而得到DAO操作方法名可以用来调用。然后是Select注释，将SQL语句获取并执行得到结果集。最后根据接口文件方法的返回值类型标识就决定了结果集封装对象的类型。

[案例八注解方式构建代码：MyBatis/demo8_annotation_build](https://github.com/Didnelpsun/MyBatis/tree/main/demo8_annotation_build)。

<span style="color:orange">注意：</span>当resources文件夹下存在对应的DAO的XML文件，此时你配置使用的方式是注解也会报错。即若是使用注解方式，则不能存在DAO的XML配置文件。

&emsp;

## 单表操作

### &emsp;基本CRUD

继续在上面的代码上添加。

使用代理DAO的方式。如上面所使用的@Select注释，CRUD操作还有@Insert、@Update、@Delete一共四种注释。

直接将对应的DAO接口文件复制过来，然后添加上原来XML配置文件中对应的SQL语句：

```java
// 插入用户
@Insert("insert into user(name,sex,birthday,address) values (#{name},#{sex},#{birthday},#{address})")
void insertUser(User user);
// 更新用户
@Update("update user set name=#{name},sex=#{sex},birthday=#{birthday},address=#{address} where id=#{id}")
void updateUser(User user);
// 删除用户
@Delete("delete from user where id=#{id}")
void deleteUser(Integer id);
// 查询一个用户
@Select("select * from user where id=#{id}")
User selectUser(Integer id);
// 根据用户名模糊查询用户
@Select("select * from user where name like #{name}")
List<User> selectUsersByName(String name);
// 获取用户总数
@Select("select count(id) from user")
Integer getUsersSum();
```

最后直接将[案例三使用代理CRUD代码：MyBatis/demo3_crud_by_proxy](https://github.com/Didnelpsun/MyBatis/tree/main/demo3_crud_by_proxy)的测试文件粘过来直接就可以用了。

[案例八单表操作代码：MyBatis/demo8_annotation_single](https://github.com/Didnelpsun/MyBatis/tree/main/demo8_annotation_single)。

### &emsp;自增ID处理

在XML配置方式中已经给出了如何获取插入时自增ID的获取方式，那么注解如何处理？在插入方法上添加`@Options(useGenerateKey = true, keyProperty=自增ID名)`。

注意此时传入的参数一定是一个实体类，里面必须包含keyProperty，否则找不到赋值的属性。

### &emsp;别名设置

当Java代码与数据库列名不一致时，XML方式使用resultMap属性，注解方式使用@Results注解。

其中@Results注解下包含一个id属性，表明这个别名配置的id，一个value属性，value对象包含多个@Result注解，每个@Result注解包含：

+ id属性：默认为false，若设置为true，则表明这个属性列为数据列id，等价于XML方式的id标签。
+ column属性：数据库列名，代表指向的数据库数据。
+ property属性：Java对象名，指向封装的Java成员名。

这样设置了别名配对后其他方法就可以直接使用@ResultMap注解来调用这个配置到其他方法。@ResultMap属性包含一个value属性，指向一个字符串列表，表明引用的多个@Result配置。

```java
@CRUD("SQL语句")
@Results(id="配置一ID", value={
    @Result(id=true, column="id", property="userid"),
    @Result(id=false, column="name", property="username"),
    @Result(column="sex", property="usersex")
})
// DAO方法1

@CRUD("SQL语句")
@ResultMap(value={"配置一ID", "配置二ID",...})
// 当配置只有一个时value属性可以省略
@ResultMap("配置一ID")
// DAO方法二
```

&emsp;

## 多表操作

使用[案例六用户与账户代码：MyBatis/demo6_user_and_account](https://github.com/Didnelpsun/MyBatis/tree/main/demo6_user_and_account)。

将java/resources下的org.didnelpsun.dao文件夹删除。修改SqlMapConfig.xml的mappers为`<package name="org.didnelpsun.dao"/>`。

将对应DAO文件中简单的选择方法即一对一的方法添加上注释。

### &emsp;多对一关系

MyBatis中没有多对一，只有一对一关系。所以Account对User虽然是多对一但是可以简化为一对一的关系。

在AccountDAO中，Account对应一个User。使用@Results注释配置对应关系，其中id、userid和money都直接用上面的@Result注释配置，column和property属性不用改变，而对应的user成员是多对一的关系，查询Account对应的User也需要使用@Result注释：

+ property属性：所要多对一关系查询的成员对象名。
+ column属性：多对一关系查询所需要的主键。
+ one属性：关系查询的方式，one=@One(配置)，表明查询的关系类型是多对一（MyBatis认为是一对一），配置包括：
  + select属性：能实现对应查询的方法的全限定类名。
  + fetchType属性：加载类型，包括FetchType.EAGER为立即加载、FetchType.LAZY为懒加载、FetchType.DEFAULT为默认选择一种。

```java
// 查询所有账户并包括对应用户信息
@Select("select * from account")
@Results(value = {
        @Result(id=true, column = "id", property = "id"),
        @Result(column = "userid", property = "userid"),
        @Result(column = "money", property = "money"),
        @Result(property = "user", column = "userid", one=@One(
                select="org.didnelpsun.dao.UserDAO.selectUser", fetchType= FetchType.EAGER
        ))
})
List<Account> selectAllAccountUsers();
```

其配置的意思是selectAllAccountUsers使用的SQL语句是`select * from account`，这里只查出所有的账户，然后用@Results注解配置对应的结果封装，其中id、userid、money三个属性配置等于无效，不用管但是要写，主要是配置user成员，property属性表示包装的成员为user，one属性表示这个成员要再查询一次，查询的关系是一对一，select属性表示查询要调用的方法的全限定类名为org.didnelpsun.dao.UserDAO.selectUser，而column属性表示调用方法传入参数为之前查询到的userid，从而整个方法调用为`org.didnelpsun.dao.UserDAO.selectUser(userid)`，最后fetchType表示当查询完account后是否立即查询user。

### &emsp;一对多关系

在UserDAO中，一个User对应多个Account。同理对于User的accounts成员也使用@Result注解，但是由于是一对多关系，所以不再使用one属性而是使用many属性，并赋值给注解@Many，其格式与@One注解一样。

由于需要一个根据userid查询accounts的方法，所以定义一个：

```java
// 根据用户id查询所有账户
@Select("select * from account where userid = #{userid}")
List<Account> selectAllAccountsByUserID(Integer userid);
```

然后定义DAO方法：

```java
// 查询所有用户
@Select("select * from user")
@Results(value = {
        @Result(id = true, column = "id", property = "id"),
        @Result(column = "name", property = "name"),
        @Result(column = "sex", property = "sex"),
        @Result(column = "birthday", property = "birthday"),
        @Result(property = "accounts", column = "id", many = @Many(
                select = "org.didnelpsun.dao.AccountDAO.selectAllAccountsByUserID", fetchType = FetchType.LAZY
        ))
})
List<User> selectAllUsers();
```

思想也是一样，重点仍是最后的accounts成员的获取。调用方法为`org.didnelpsun.dao.AccountDAO.selectAllAccountsByUserID(id)`，由于是一对多，所以使用懒加载。

<span style="color:orange">注意：</span>这里将many改成one也不会报错，但是底层实现不同，one处理的方法较简单但是对于一对多时效率低。

&emsp;

## 加载配置

### &emsp;一级缓存

使用注解方式一级缓存是默认开启的。

### &emsp;二级缓存

二级缓存使用步骤：

1. 让MyBatis框架支持二级缓存，在SqlMapConfig.xml中设置settings标签。cacheEnabled：全局开启或关闭配置文件中所有映射器已经配置的任何缓存。（这个和XML方式一样）
2. 在需要缓存的DAO文件的DAO接口上添加`@CacheNamespace(blocking = true)`注解。

```java
@CacheNamespace(blocking = true)
public interface UserDAO {
}
```

[案例八注释多表操作代码：MyBatis/demo8_annotation_multi](https://github.com/Didnelpsun/MyBatis/tree/main/demo8_annotation_multi)。
