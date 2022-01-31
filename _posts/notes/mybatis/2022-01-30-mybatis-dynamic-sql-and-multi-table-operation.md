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

这里使用账户的例子，一个用户可以有多个账户，而一个账户只能属于一个用户。

步骤：

1. 建立用户表与账户表：需要使用外键来保持一对多关系。
2. 建立用户实体类与账户实体类：需要属性体现一对多关系。
3. 建立用户与账户的配置关系。
4. 实现配置：查询用户可以获取名下账户信息，查询账户可以获取对应用户信息。
