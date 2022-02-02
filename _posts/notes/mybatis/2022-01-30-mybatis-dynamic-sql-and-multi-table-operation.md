---
layout: post
title:  "动态SQL与多表操作"
date:   2022-01-30 22:44:20 +0800
categories: notes mybatis base
tags: MyBatis 基础 动态 多表
excerpt: "SQL动态注入与多表联合"
---

使用[案例三代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo3_crud_by_proxy)。

然后在UserDAO.xml和UserDAO.java以及AppTest.java中将所有的CUD方法全部删掉，只留下查询方法，在UserDAO.xml中：

```java
// 查询所有用户
List<User> selectAllUsers();
// 查询一个用户
User selectUser(Integer id);
// 根据用户名模糊查询用户
List<User> selectUsersByName(String name);
// 根据查询条件对象Query混合模糊查询
List<User> selectUsersByQuery(Query query);
```

## 动态SQL

### if标签

此时我们可以看到上面所说的查询都是按某个条件查询的，即如果要通过id查询就使用selectUser方法，如果通过name查询就是selectUsersByName方法。

而如果我们不确定具体查询条件是什么，或者说查询条件不止是一个属性那如何查询呢？我们需要把这些条件都综合起来，即创建一个方法概括以上所有方法，传入一个User对象作为参数进行查询而不用管到底选择哪一个方法`List<User> selectUsersByCondition(User user);`。

if标签用来根据属性所给的条件判断是否出现，当真时if标签里的字符串才会出现在SQL语句中。

UserDAO.xml为：

```xml
<select id="selectUsersByCondition" parameterType="org.didnelpsun.entity.User" resultType="org.didnelpsun.entity.User">
    <!--注意SQL语句后不要加上分号，否则MyBatis会认为语句已经结束从而报错-->
    select * from user where true
    <!--在进行并操作时不能使用&而只能使用and，因为&会被识别为java关键字-->
    <!--其中test为if标签成立的条件-->
    <if test="id!=null">
        and id=#{id} 
    </if>
    <if test="name!=null">
        and name=#{name} 
    </if>
    <if test="sex!=null">
        and sex=#{sex} 
    </if>
    <if test="birthday!=null">
        and birthday=#{birthday} 
    </if>
    <if test="address!=null">
        and address=#{address} 
    </if>
</select>
```

然后定义一个测试类：

```java
// 测试条件查询
public void testSelectUsersByCondition() {
    User u = new User();
    u.setId(1);
    u.setSex("男");
    List<User> users = userDAO.selectUsersByCondition(u);
    for (User user : users) {
        System.out.println(user.toString());
    }
}
```

由于使用等号所以不能进行模糊查询。如果要使用模糊查询就要将UserDAO.xml中用like代替等号，并在测试文件中将u的name设置为%名字%。

### where标签

if标签使用比较麻烦，在条件之前需要加一个true，这时候就需要where标签来把查询条件都套上：

```xml
<select id="selectUsersByCondition" parameterType="org.didnelpsun.entity.User" resultType="org.didnelpsun.entity.User">
    <!--注意SQL语句后不要加上分号，否则MyBatis会认为语句已经结束从而报错-->
    select * from user
    <where>
        <!--在进行并操作时不能使用&而只能使用and，因为&会被识别为java关键字-->
        <if test="id!=null">
        and id=#{id} 
        </if>
        <if test="name!=null">
        and name like #{name} 
        </if>
        <if test="sex!=null">
        and sex=#{sex} 
        </if>
        <if test="birthday!=null">
        and birthday=#{birthday} 
        </if>
        <if test="address!=null">
        and address like #{address} 
        </if>
    </where>
</select>
```

### foreach标签

之前的查询都是直接将传入参数进行拼接到SQL，而当查询需要传入参数时应该如何实现？如查询id在2到4之间的用户？

这就需要用到之前基于代理进行CRUD所说的传递POJO包装对象的方式来进行联合查询。

利用之前定义的实体类Query对象：

```java
public class Query {
    private List<Integer> ids;
    
    private User user;

    public List<Integer> getIds() {
        return ids;
    }

    public void setIds(List<Integer> ids) {
        this.ids = ids;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
```

然后定义这个DAO并传入query：`ist<User> selectUsersInIDs(Query query);`。

再在XML中利用foreach标签定义取值范围。

foreach标签用于遍历集合，其属性为：

+ collection：代表要遍历的集合元素，注意不用带#{}来引用Java代码。
+ open：代表语句的开始部分。
+ close：代表语句的结束部分。
+ item：代表遍历集合的每个元素所生成的变量名，即遍历到的当前这个元素就用item代指。
+ sperator：代表分隔符。

```xml
<!--根据Query中的id集合查询User-->
<select id="selectUsersInIDs" parameterType="org.didnelpsun.entity.Query" resultType="org.didnelpsun.entity.User">
    select * from user 
    <where>
        <!--传入的是POJO对象，所以ids就是query.ids-->
        <!--当ids不为空就开始查询-->
        <if test="ids!=null and ids.size()>0">
            <!--遍历对象为ids，开始语句为and id in(，最后以)结尾，遍历变量定义为id，用逗号分隔每个id-->
            <foreach collection="ids" open="and id in (" close=")" item="id" separator=",">
                #{id}
            </foreach>
        </if>
    </where>
</select>
```

此时SQL语句就被拼接为`select * from user where true and id in ( id列表 )`。

最后定义一个测试方法：

```java
// 测试ID范围查询
public void testSelectUsersInIDs(){
    Query query = new Query();
    List<Integer> list = new ArrayList<Integer>();
    list.add(1);
    list.add(2);
    query.setIds(list);
    List<User> users = userDAO.selectUsersInIDs(query);
    for (User user : users) {
        System.out.println(user.toString());
    }
}
```

### sql标签与include标签

由于我们之前使用select标签查询都是用`select * from user`开头，所以我们可以使用sql标签将这个SQL语句定义为常量，然后使用include标签来引用sql标签定义的SQL语句：

```xml
<sql id="select">
    select * from user
</sql>

<select id="selectAllUsers" resultType="org.didnelpsun.entity.User">
    <include refid="select"></include>
</select>
```

由于SQL语句是拼接上的，所以之前所有的地方都可以替换。

[案例六动态SQL语句代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo6_dynamic_sql)。

## 多表操作

表的关系：

+ 一对多。
+ 多对一。
+ 一对一。
+ 多对多。

### 一对一查询

一对一和一对多使用账户的例子，一个用户可以有多个账户，而一个账户只能属于一个用户。

步骤：

1. 建立用户表与账户表：需要使用外键来保持一对多关系。
2. 建立用户实体类与账户实体类：需要属性体现一对多关系。
3. 建立用户与账户的配置关系。
4. 实现配置：查询用户可以获取名下账户信息，查询账户可以获取对应用户信息。

#### 定义Account类

使用[案例六动态SQL语句代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo6_dynamic_sql)。

首先在UserDAO.xml与UserDAO.xml中将除了`selectAllUsers`和`selectUser`两个方法外的其他所有方法都删除，在UserDAO.xml将sql和include标签内容改成一般的SQL语句，然后将测试类中对应的测试方法都删除，再将实体类中将Query实体类删除。

然后在entity文件夹下新建一个Account实体类：

```java
package org.didnelpsun.entity;

import java.io.Serializable;

public class Account implements Serializable {
    private Integer id;
    private Integer userid;
    private Float money;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserid() {
        return userid;
    }

    public void setUserid(Integer userid) {
        this.userid = userid;
    }

    public Float getMoney() {
        return money;
    }

    public void setMoney(Float money) {
        this.money = money;
    }

    @Override
    public String toString() {
        return "Account{" + "id=" + id + ", userid=" + userid + ", money=" + money + '}';
    }
}
```

根据实体类向数据库增加一个Account表，id为主键，userid为外键。

然后定义对应的AccountDAO.java中的相关方法：

```java
package org.didnelpsun.dao;

import org.didnelpsun.entity.Account;

import java.util.List;

public interface AccountDAO {
    // 查询所有账户
    List<Account> selectAllAccounts();
    // 查询一个账户
    Account selectAccount(Integer id);
}
```

定义对应的AccountDAO.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="org.didnelpsun.dao.AccountDAO">
    <!--查询所有账户-->
    <select id="selectAllAccounts" resultType="org.didnelpsun.entity.Account">
        select * from account
    </select>
    <!--查询一个账户-->
    <select id="selectAccount" parameterType="Integer" resultType="org.didnelpsun.entity.Account">
        select * from account where id=#{id};
    </select>
</mapper>
```

在SqlMapConfig.xml的mappers标签中加入映射`<mapper resource="org/didnelpsun/dao/AccountDAO.xml"/>`。

编写测试类：

```java
package org.didnelpsun;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.didnelpsun.dao.AccountDAO;
import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.Account;
import org.didnelpsun.entity.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class AppTest {
    private InputStream in;
    private SqlSession session;
    private UserDAO userDAO;
    private AccountDAO accountDAO;

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
        accountDAO = session.getMapper(AccountDAO.class);
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
        testSelectAllAccounts();
    }

    // 测试查询所有用户
    public void testSelectAllUsers() {
        List<User> users = userDAO.selectAllUsers();
        for (User user : users) {
            System.out.println(user.toString());
        }
    }

    // 测试查询用户
    public void testSelectUser() {
        User user = userDAO.selectUser(1);
        System.out.println(user.toString());
    }

    // 测试查询所有账户
    public void testSelectAllAccounts(){
        List<Account> accounts = accountDAO.selectAllAccounts();
        for (Account account : accounts) {
            System.out.println(account.toString());
        }
    }

    // 测试查询账户
    public void testSelectAccount() {
        Account account = accountDAO.selectAccount(1);
        System.out.println(account.toString());
    }
}
```

我们定义一个方法，根据Account的id查询账户信息并获取对应的userid查询用户信息。这是一对一的查询，SQL语句是`select account.id as accountid, account.money, user.* from account, user where user.id = account.userid;;`。

这时候我们有两种解决方法。

#### AccountUser类

是定义一个AccountUser实体类继承Account类从而在Account的基础上多定义User相关属性：

```java
package org.didnelpsun.entity;

import java.util.Date;

public class AccountUser extends Account {
    private String name;
    private String sex;
    private Date birthday;
    private String address;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public String toString() {
        return super.toString() + "AccountUser{" + "name='" + name + '\'' + ", sex='" + sex + '\'' + ", birthday=" + birthday + ", address='" + address + '\'' + '}';
    }
}
```

然后在AccountDAO.java中定义一个获取方法`List<AccountUser> selectAllAccountUsers();`，并在AccountDAO.xml中配置：

```xml
<!--查询所有账户与用户信息-->
<select id="selectAllAccountUsers" resultType="org.didnelpsun.entity.AccountUser">
    select account.* , user.name, user.sex, user.birthday, user.address from account, user where user.id = account.userid;
</select>
```

定义一个测试方法：

```java
// 测试查询账户与用户
public void testSelectAllAccountUsers(){
    List<AccountUser> accountUsers = accountDAO.selectAllAccountUsers();
    for (Account accountUser : accountUsers) {
        System.out.println(accountUser.toString());
    }
}
```

#### Account类引用

上面的重新定义一个实体类的方法并不方便，而且在联合查询的时候注重的是两个表之间的关系，而不是单纯的复制到一起，假如对其外键userid进行改动AccountUser类的数据影响不大，只是数值变化，但是实际上会影响两个表的数据的映射。

所以最好是在Account类中引用其所属的User类，Account中定义`private User user;`，然后生成其对应的getter与setter。重新重写其`toString()`方法。

```java
@Override
public String toString() {
    return "Account{" + "id=" + id + ", userid=" + userid + ", money=" + money + ", user=" + user.toString() + '}';
}
```

重写对应的AccountDAO.java中就是`List<Account> selectAllAccountUsers();`这个方法。

然后定义对应的XML文件，使用resultMap进行映射：

```xml
<resultMap id="accountUserMap" type="org.didnelpsun.entity.Account">
    <id property="id" column="id"/>
    <result property="userid" column="userid"/>
    <result property="money" column="money" />
    <!--一对一配置User的映射，使用association标签表示引用-->
    <!--property是对应的表名，column是匹配字段名，javaType为封装成的类型-->
    <association property="user" column="userid" javaType="org.didnelpsun.entity.User">
        <!--将表格中的userid填充到对应user的id中-->
        <!--如果column写的是id则其默认是account的id而不是user的id-->
        <id property="id" column="userid"/>
        <result property="name" column="name"/>
        <result property="sex" column="sex"/>
        <result property="birthday" column="birthday"/>
        <result property="address" column="address"/>
    </association>
</resultMap>
<select id="selectAllAccountUsers" resultMap="accountUserMap">
    select account.*, user.* from account, user where user.id = account.userid;
</select>
```

### 一对多查询

即查询一个用户下对应的所有账户，这个就是一对多。

#### 重写User类

根据上面的做法我们先在原来的User类中增加对Account的引用：

```java
private List<Account> accounts;

public List<Account> getAccounts() {
    return accounts;
}

    public void setAccounts(List<Account> accounts) {
    this.accounts = accounts;
}
```

#### 重写UserDAO

不用更改UserDAO.java，直接更改UserDAO.xml的具体实现：

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
    <collection property="accounts" ofType="org.didnelpsun.entity.Account">
        <id property="id" column="id" />
        <result property="userid" column="userid" />
        <result property="money" column="money" />
    </collection>
</resultMap>
<!--使用左外连接，保存左边的数据-->
<!--由于要设置一个别名，所以不能使用*，而必须把所有要查询的属性名全部列出来-->
<select id="selectAllUsers" resultMap="userMap">
    select user.id as uid, name, sex, birthday, address, account.id, account.userid, account.money from user left outer join account on user.id = account.userid;
</select>
```

重写Account的`toString()`方法，因为我们这里没有设置user属性所以会报错：

```java
public String toString() {
    return "Account{" + "id=" + id + ", userid=" + userid + ", money=" + money + '}';
}
```

编写测试类：

```java
// 测试查询所有用户
public void testSelectAllUsers() {
    List<User> users = userDAO.selectAllUsers();
    for (User user : users) {
        System.out.println(user.toString());
        for (Account account : user.getAccounts()){
            System.out.println(account.toString());
        }
    }
}
```

我们可以看到使用了collection标签后MyBatis就自动将同样userid的记录合并到一起了，而如果我们直接使用SQL语句查询会发现它们是分开的。

[案例六用户与账户代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo6_user_and_account)。

### 多对多查询

步骤：

1. 建立用户表和角色表两张表。需要使用中间表，包含各自的主键，在中间表中是外键。
2. 建立用户和角色两个实体类。各自包含对方的一个集合引用来体现多对多关系。
3. 建立角色和用户的两个配置文件。

#### 定义Role类

根据定义Account类的操作一样，使用[案例六动态SQL语句代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo6_dynamic_sql)。在UserDAO.xml与UserDAO.xml中将除了`selectAllUsers`和`selectUser`两个方法外的其他所有方法都删除，在UserDAO.xml将sql和include标签内容改成一般的SQL语句，然后将测试类中对应的测试方法都删除，再将实体类中将Query实体类删除。

新建Role实体类：

```java
package org.didnelpsun.entity;

import java.io.Serializable;
import java.util.List;

public class Role implements Serializable {
    private Integer id;
    private String name;
    private String description;
    private List<User> users;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    @Override
    public String toString() {
        return "Role{" + "id=" + id + ", name='" + name + '\'' + ", description='" + description + '\'' + '}';
    }
}
```

在数据库新建对应的role表，其中id为主键。然后建立user_role表为中间表，有userid和roleid两列，其中userid和roleid既是主键也是外键。

然后新建一个接口RoleDAO.java，定义一个获取方法`List<Role> selectAllRoles();`，并在RoleDAO.xml中配置：

```xml
<select id="selectAllRoles" resultType="org.didnelpsun.entity.Role">
    select * from role
</select>
```

在SqlMapConfig.xml中加上`<mapper resource="org/didnelpsun/dao/RoleDAO.xml"/>`。

定义测试：

```java
package org.didnelpsun;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.didnelpsun.dao.RoleDAO;
import org.didnelpsun.dao.UserDAO;
import org.didnelpsun.entity.Role;
import org.didnelpsun.entity.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class AppTest {
    private InputStream in;
    private SqlSession session;
    private UserDAO userDAO;
    private RoleDAO roleDAO;

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
        roleDAO = session.getMapper(RoleDAO.class);
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
        testSelectAllRoles();
    }

    // 测试查询所有用户
    public void testSelectAllUsers() {
        List<User> users = userDAO.selectAllUsers();
        for (User user : users) {
            System.out.println(user.toString());
        }
    }

    // 测试查询用户
    public void testSelectUser() {
        User user = userDAO.selectUser(1);
        System.out.println(user.toString());
    }

    // 测试查询所有角色
    public void testSelectAllRoles() {
        List<Role> roles = roleDAO.selectAllRoles();
        for (Role role : roles) {
            System.out.println(role.toString());
        }
    }
}
```

#### 查询角色赋予用户

即根据roleid左外连接查询role表，再根据user_role表的roleid对应的userid左外连接查询user表。SQL语句是`select role.*, user.id as uid, user.name as uname, user.sex, user.birthday, user.address from role left outer join user_role on role.id = user_role.roleid left outer join user on user.id = user_role.userid`，其中给user的id和name起别名。

给定RoleDAO.java一个`List<Role> selectAllRoleUsers();`，由于Role.users是一个集合，所以再次使用collection标签，在XML中定义：

```xml
<resultMap id="roleMap" type="org.didnelpsun.entity.Role">
    <id property="id" column="id" />
    <result property="name" column="name" />
    <result property="description" column="description" />
    <collection property="users" ofType="org.didnelpsun.entity.User">
        <id property="id" column="uid" />
        <result property="name" column="uname" />
        <result property="sex" column="sex" />
        <result property="birthday" column="birthday" />
        <result property="address" column="address" />
    </collection>
</resultMap>
<select id="selectAllRoleUsers"  resultMap="roleMap">
    select role.*, user.id as uid, user.name as uname, user.sex, user.birthday, user.address from role left outer join user_role on role.id = user_role.roleid left outer join user on user.id = user_role.userid
</select>
```

测试：

```java
// 测试查询所有角色与用户
public void testSelectAllRoleUsers() {
    List<Role> roles = roleDAO.selectAllRoleUsers();
    for (Role role : roles) {
        System.out.println(role.toString());
        for(User user: role.getUsers()){
            System.out.println(user.toString());
        }
    }
}
```

#### 查询用户所属角色

SQL语句类似，只不过左连接的先是user再是user_role，最后是role。可以按照左连接改一遍，也可以直接改成右连接：`select user.id as uid, user.name as uname, user.sex, user.birthday, user.address, role.* from role right outer join user_role on role.id = user_role.roleid right outer join user on user.id = user_role.userid`。

在User类上增加`private List<Role> roles;`并定义setter和getter。

在UserDAO.java中增加`List<User> selectAllUserRoles();`并在XML中配置：

```xml
<resultMap id="userMap" type="org.didnelpsun.entity.User">
    <id property="id" column="uid" />
    <result property="name" column="uname" />
    <result property="sex" column="sex" />
    <result property="birthday" column="birthday" />
    <result property="address" column="address" />
    <collection property="roles" ofType="org.didnelpsun.entity.Role">
        <id property="id" column="id" />
        <result property="name" column="name" />
        <result property="description" column="description" />
    </collection>
</resultMap>
<select id="selectAllUserRoles"  resultMap="userMap">
    select user.id as uid, user.name as uname, user.sex, user.birthday, user.address, role.* from role right outer join user_role on role.id = user_role.roleid right outer join user on user.id = user_role.userid
</select>
```

测试方法：

```java
// 测试查询所有用户与角色
public void testSelectAllUserRoles() {
    List<User> users = userDAO.selectAllUserRoles();
    for (User user : users) {
        System.out.println(user.toString());
        for(Role role: user.getRoles()){
            System.out.println(role.toString());
        }
    }
}
```

[案例六用户与角色代码](https://github.com/Didnelpsun/MyBatis/tree/main/demo6_user_and_role)。
