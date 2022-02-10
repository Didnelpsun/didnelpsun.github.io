---
layout: post
title:  "延迟加载与缓存管理"
date:   2022-02-03 11:26:53 +0800
categories: notes mybatis base
tags: MyBatis 基础 加载 缓存
excerpt: "延迟加载与缓存管理"
---

## 延迟加载

只在需要时查询，否则不查询。一对多和多对多使用延迟加载（懒加载），一对一和多对一使用立即加载。

使用[案例六用户与账户代码：MyBatis/demo6_user_and_account](https://github.com/Didnelpsun/MyBatis/tree/main/demo6_user_and_account)。把实体类AccountUser删掉。

### &emsp;Assocation

一对一方式，一个账户对应一个用户。

查看AccountDAO中的selectAllAccountUsers方法，可以判断这个方法是立刻加载数据的，将Account以及下面的User数据全部一次性查出来，那么如何实现延迟加载？

先在select标签中更改SQL语句只要求查询所有的Account，不管其下面的User成员，然后在Map中重新配置User。

association标签的select属性指定查询当前对象的方法，即根据当前Account的信息查询对应User成员的方法，即在UserDAO中根据ID查询用户的DAO配置，即select指定调用根据唯一标识查询对应User的方法的全限定类名，即为org.didnelpsun.dao.UserDAO.selectUser。column属性指定根据查询出来的结果集的哪个列值进行下一步的查询（对应SQL语句），如查询时令column=userid，那么会调用`selectAccount(userid)`。

原来的配置下由于查询时是根据SQL语句的，而SQL语句将User和Account一起查询出来，所以就是立即查询。而此刻SQL语句没有查询User只有查询Account，所以先根据SQL语句查询出Account，对应Map封装到`List<Account>`中，而Map的association标签又通过select属性调用org.didnelpsun.dao.UserDAO.selectUser这个方法，根据当前封装Account对象的属性userid查询对应的User结果集再封装到这个对象的成员user中，最后才完成了当前Account对象的封装。

```xml
<resultMap id="accountUserMap" type="org.didnelpsun.entity.Account">
    <id property="id" column="id"/>
    <result property="userid" column="userid"/>
    <result property="money" column="money" />
    <association property="user" column="userid" javaType="org.didnelpsun.entity.User" select="org.didnelpsun.dao.UserDAO.selectUser" />
</resultMap>
<select id="selectAllAccountUsers" resultMap="accountUserMap">
    select account.* from account;
</select>
```

此时发现还不能延迟加载，因为延迟加载需要打开全局延迟加载开关，即在MyBatis的配置文件SqlMapConfig.xml的configuration标签下的settings标签下添加setting标签并写上配置的name：

+ lazyLoadingEnabled属性：延迟加载的全局开关，若开启则所有关联对象都会延迟加载。待定关联关系可以通过设置fetchType属性来覆盖该项的开关状态。选择true。
+ aggressiveLazyLoading：当开启时任何方法的调用都会加载该对应的所有属性，否则每个属性都会按需加载。选择false。

注意配置的子标签有顺序。settings标签是Configuration标签的第二个子标签。

```xml
<!--配置延迟加载-->
<settings>
    <setting name="lazyLoadingEnabled" value="true"/>
    <setting name="aggressiveLazyLoading" value="false"/>
</settings>
```

这个就相当于子查询。如果我们不使用Account的user成员那么就不会查询这个属性。

### &emsp;Collection

多对多方式，一个用户对应多个账户，基本上思路是一致的，也是使用association标签。

查询所有用户，然后每一个用户还需要根据用户的id查询用户所有的账户，所以我们还需要在AccountDAO中定义一个根据用户ID查询账户方法`selectAllAccountsByUserID(Integer userid)`：

```xml
<select id="selectAllAccountsByUserID" parameterType="Integer" resultType="org.didnelpsun.entity.Account">
    select * from account where userid = #{userid}
</select>
```

然后重新定义UserDAO的selectAllUsers方法：

```xml
<!--由于需要联合查询，所以需要定义resultMap-->
<resultMap id="userMap" type="org.didnelpsun.entity.User">
    <!--由于id名重复，所以这里起个别名-->
    <id property="id" column="uid" />
    <result property="name" column="name" />
    <result property="birthday" column="birthday" />
    <result property="sex" column="sex" />
    <result property="address" column="address" />
    <!--配置User对象中accounts集合的映射-->
    <!--collection代表集合，propertys为User属性对象的名称，ofType为对象类型-->
    <collection property="accounts" ofType="org.didnelpsun.entity.Account" select="org.didnelpsun.dao.AccountDAO.selectAllAccountsByUserID" column="uid">
    </collection>
</resultMap>
<!--使用左外连接，保存左边的数据-->
<!--由于要设置一个别名，所以不能使用*，而必须把所有要查询的属性名全部列出来-->
<select id="selectAllUsers" resultMap="userMap">
    select user.id as uid, name, sex, birthday, address from user
</select>
```

[案例七延迟加载代码：MyBatis/demo7_delayed_loading](https://github.com/Didnelpsun/MyBatis/tree/main/demo7_delayed_loading)。

&emsp;

## 缓存管理

使用缓存可以减少和数据库的交互次数，提高执行效率。经常查询、不经常改变且数据时效性低的数据适用缓存。

### &emsp;一级缓存

指SqlSession对象的缓存，即执行查询后其结果会同时存入SqlSession的一块区域中。其结构是一个Map。当再次查询时MyBatis会先去查询缓存是否存在。

当SqlSession对象消失时一级缓存也会消失。

#### &emsp;清除一级缓存

使用[案例三使用代理CRUD代码：MyBatis/demo3_crud_by_proxy](https://github.com/Didnelpsun/MyBatis/tree/main/demo3_crud_by_proxy)。

更改测试代码：

```java
public void Test() {
    User user1 = userDAO.selectUser(1);
    User user1C = userDAO.selectUser(1);
    System.out.println(user1 == user1C);
}
```

输出结果：true。所以证明在一级缓存下user1和user1C是一样的东西。

然后尝试关闭SqlSession再打开重新获取user1看看：

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
    private InputStream in;
    private SqlSession session;
    private UserDAO userDAO;
    private SqlSessionFactory factory;

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
        factory = new SqlSessionFactoryBuilder().build(in);
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
        testFirstCache();
    }

    // 测试一级缓存
    public void testFirstCache() {
        User user1 = userDAO.selectUser(1);
        User user1C = userDAO.selectUser(1);
        System.out.println(user1 == user1C);
        session.close();
        session = factory.openSession();
        // 重新获取userDAO
        userDAO = session.getMapper(UserDAO.class);
        user1C = userDAO.selectUser(1);
//        session.clearCache();
        System.out.println(user1 == user1C);
    }
}
```

这时就是false了。表明一级缓存没有了。

除了close关闭可以清除缓存外还有一个`clearCache()`方法专门用来清除缓存。

#### &emsp;一级缓存同步

更新对一级缓存有什么作用呢？

```java
// 测试一级缓存同步
public void testCacheClear() {
    User user1 = userDAO.selectUser(1);
    System.out.println(user1);
    // 更新用户数据
    user1.setSex("女");
    userDAO.updateUser(user1);
    User user1C = userDAO.selectUser(1);
    System.out.println(user1C);
    System.out.println(user1 == user1C);
}
```

返回结果为false。且会发现进行了两次SQL查询。

当调用SqlSession的修改，添加，删除，提交，关闭方法时，就会清空一级缓存。

### &emsp;二级缓存

指SqlSessionFactory对象的缓存，由同一个SqlSessionFactory对象创建的SqlSession共享其缓存。

二级缓存使用步骤：

1. 让MyBatis框架支持二级缓存，在SqlMapConfig.xml中设置settings标签。cacheEnabled：全局开启或关闭配置文件中所有映射器已经配置的任何缓存。
2. 让当前的映射文件支持二级缓存，在UserDAO.xml中设置。直接在mapper标签中写上cache标签表明开启二级缓存。
3. 让当前的操作支持二级缓存，在select标签中设置。将对应需要二级缓存的方法如selectUser的标签的userCache属性设置为true。

重新定义一个测试文件，将SqlSession和UserDAO从公共的变成每个方法手动获取和释放：

```java
// AppTest2.java
package org.didnelpsun;

//import static org.junit.Assert.assertTrue;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class AppTest2 {
    private InputStream in;
    private SqlSessionFactory factory;

    // 测试之前执行
    @Before
    public void init() {
        // 1.读取配置文件
        in = null;
        try {
            in = Resources.getResourceAsStream("SqlMapConfig.xml");
            factory = new SqlSessionFactoryBuilder().build(in);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 测试之后执行
    @After
    public void destroy() throws Exception {
        // 6.释放资源
        assert in != null;
        in.close();
    }

    @Test
    public void Test() {
        testSecondCache();
    }

    public void testSecondCache(){
        SqlSession session1 = factory.openSession();
        UserDAO userDAO1 = session1.getMapper(UserDAO.class);
        User user1 = userDAO1.selectUser(1);
        System.out.println(user1);
        session1.close();
        // 关闭session1的一级缓存
        SqlSession session2 = factory.openSession();
        UserDAO userDAO2 = session2.getMapper(UserDAO.class);
        User user2 = userDAO2.selectUser(1);
        System.out.println(user2);
        session2.close();
        System.out.println(user1 == user2);
    }
}
```

这时你会发现SQL语句只会调用一次，第二次查询时会访问二级缓存。

但是最后打印的是false而不是true，这是因为二级缓存存放的内容是数据（类似JSON格式）而不是User对象。所以当访问时会把二级缓存的数据填充到User对象中，由于这里调用`session.close()`一级缓存关闭了所以会按正常流程新建一个User对象，所以最后是false。

[案例七缓存管理代码：MyBatis/demo7_cache_management](https://github.com/Didnelpsun/MyBatis/tree/main/demo7_cache_management)。
