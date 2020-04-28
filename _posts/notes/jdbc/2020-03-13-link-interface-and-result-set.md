---
layout: post
title:  "连接、接口与结果集"
date:   2020-03-13 15:54:21 +0800
categories: notes jdbc base
tags: jdbc 基础 连接 导入 注册 指定 创建 关闭 接口 Statement PreparedStatement CallableStatement 结果集
excerpt: "连接数据库与结果处理"
---

上个教程我们已经提过了具体的JDBC操作流程。

## 建立JDBC连接

而如果我们要建立JDBC的连接，需要以下四个流程：

1. 导入JDBC驱动： 只有拥有了驱动程序我们才可以注册驱动程序完成连接的其他步骤。
2. 注册JDBC驱动程序：这一步会导致JVM加载所需的驱动类实现到内存中，然后才可以实现JDBC请求。
3. 数据库URL指定：创建具有正确格式的地址，指向到要连接的数据库。
4. 创建连接对象：最后，代码调用DriverManager对象的`getConnection()`方法来建立实际的数据库连接。

### &emsp;1. 导入JDBC驱动

就是一个jar包，直接放到lib文件夹中就可以了。

### &emsp;2. 注册驱动程序

我们在使用驱动程序之前，必须注册你的驱动程序。注册驱动程序的本质就是将我们将要使用的数据库的驱动类文件动态的加载到内存中，然后才能进行数据库操作。比如我们使用的Mysql数据库。我们可以通过以下两种方式来注册我们的驱动程序。

#### &emsp;&emsp;2.1Class.forName()

动态加载一个类最常用的方法是使用Java的Class.forName()方法，通过使用这个方法来将数据库的驱动类动态加载到内存中，Class.forName() 方法要求JVM查找并加载指定的类到内存中；
将"com.mysql.jdbc.Driver" 当做参数传入，就是告诉JVM，去"com.mysql.jdbc"这个路径下找Driver类，将其加载到内存中。
由于JVM加载类文件时会执行其中的静态代码块，从Driver类的源码中可以看到该静态代码块执行的操作是：将mysql的driver注册到系统的DriverManager中。然后我们就可以使用。

```java
try {
    Class.forName("com.mysql.jdbc.Driver");
}
catch(ClassNotFoundException ex) { //如果不能找到这个类就报错
    System.out.println("Error: unable to load driver class!");
    System.exit(1);
}
```

#### &emsp;&emsp;2.2DriverManager.registerDriver()

```java
Driver driver = new com.mysql.jdbc.Driver();
DriverManager.registerDriver(driver);
```

这是什么意思？首先我们知道我们会导入Driver驱动器的文件，这里有一个Driver()构造方法用来构造驱动器。然后再将这个driver放到DriverManager驱动管理器的注册管理器方法中，将其注册。

我们再来看看Driver方法的源码是什么：

```java
package com.mysql.jdbc;
//首先将这个文件定义在com.mysql.jdbc包中
import java.sql.DriverManager;
import java.sql.SQLException;
//导入驱动管理器和数据库异常包
public class Driver extends NonRegisteringDriver implements java.sql.Driver {
    //这个Driver包是继承了NonRegisteringDriver类并实现了Driver接口
    public Driver() throws SQLException {
    }
    //构造方法是默认什么都不做的，但是下面会提供一个静态的处理方法
    static {
        try {
            //也就是说它会默认注册这个驱动类
            DriverManager.registerDriver(new Driver());
        }
        catch (SQLException var1) {
            throw new RuntimeException("Can't register driver!");
        }
    }
}
```

### &emsp;3. 指定数据库连接URL

当加载了驱动程序，便可以使用`DriverManager.getConnection()`方法连接到数据库了。

这里给出DriverManager.getConnection()三个重载方法：

+ getConnection(String url)
+ getConnection(String url, Properties prop)
+ getConnection(String url, String user, String password)

数据库的URL是指向数据库地址。下表列出了下来流行的 JDBC 驱动程序名和数据库的 URL。

RDBMS|JDBC驱动程序的名称|URL
:---:|:---------------:|:--
Mysql|com.mysql.jdbc.Driver|jdbc:mysql://hostname/ databaseName
Oracle|oracle.jdbc.driver.OracleDriver|jdbc:oracle:thin:@hostname:port Number:databaseName
DB2|COM.ibm.db2.jdbc.net.DB2Driver|jdbc:db2:hostname:port Number/databaseName
Sybase|com.sybase.jdbc.SybDriver|jdbc:sybase:Tds:hostname: port Number/databaseName

### &emsp;4. 创建连接对象

使用上面提到的DriverManager.getConnection()方法来创建一个连接对象那个，一般是使用第三种重载方法，传递数据库URL，用户名和密码。

```java
String URL = "jdbc:mysql://localhost/jdbc";
String USER = "root";
String PASS = "root"
Connection conn = DriverManager.getConnection(URL, USER, PASS);
```

我们也可以使用将用户名和密码放在一起的URL：

```java
String URL = "jdbc:mysql://localhost/jdbc?user=root&password=root";
//Mysql URL 的参数设置详细可以查阅相关资料
Connection conn = DriverManager.getConnection(URL);
```

同理我们也可以将用户名和密码合在一起，但是我们就需要使用工具类来配合了。

```java
import java.util.*;
String URL = "jdbc:mysql://localhost/EXAMPLE";
Properties pro = new Properties();
//Properties 对象，保存一组关键字-值对
pro.put( "user", "root" );
pro.put( "password", "root" );
Connection conn = DriverManager.getConnection(URL, pro);
```

### &emsp;5. 关闭连接

直接使用`连接名.close()`就可以了，如`conn.close();`。

&emsp;

## JDBC接口

通过使用JDBC Statement, CallableStatement和 PreparedStatement接口定义的方法和属性，使可以使用SQL或PL/SQL命令和从数据库接收数据。它们还定义了许多方法，帮助消除Java和数据库之间数据类型的差异。

接口|应用场景
:--:|:------
Statement|当在运行时使用静态 SQL 语句时（Statement 接口不能接收参数）
CallableStatement|当要访问数据库中的存储过程时（CallableStatement 对象的接口还可以接收运行时输入参数）
PreparedStatement|当计划多次使用 SQL 语句时（PreparedStatement 接口接收在运行时输入参数）

### &emsp;Statement

这个接口是我们最常用的，我们一般都是使用静态SQL语句来获取信息。如果我们要使用它，那么我们首先应该创建一个Statement对象，需要使用到Connection对象的`createStatement()`方法：

```java
//创建并首先赋值为null
Statement stmt = null;
try{
   stmt = conn.createStatement( );
    ...
}
catch(SQLException e) {
    ...
}
finally {
    //操作完就关闭数据库
    stmt.close()
    //最后关闭连接
    conn.close()
}
```

创建完我们就可以使用它来实现SQL语句了，如上一个教程中的完整代码例子中就使用到了executeQuery()来进行SEELCT查询：

方法|说明
:--:|:--
boolean execute(String SQL)|如果ResultSet对象可以被检索返回布尔值true，否则返回false。使用这个方法来执行SQL DDL语句，或当需要使用真正的动态SQL
int executeUpdate(String SQL)|用于执行INSERT、UPDATE或 DELETE语句以及SQLDDL（数据定义语言）语句。返回值是一个整数，指示受影响的行数（即更新计数）
ResultSet executeQuery(String SQL)|返回ResultSet对象。用于产生单个结果集的语句，例如SELECT语句

### &emsp;PreparedStatement

PreparedStatement接口扩展了Statement接口，有利于高效地执行多次使用的SQL语句。我们先来创建一个PreparedStatement 对象。Statement为一条 SQL 语句生成执行计划。如果要执行两条SQL语句，会生成两个执行计划。一万个查询就生成一万个执行计划！

```sql
select colume from table where colume=1;
select colume from table where colume=2;
```

PreparedStatement 用于使用绑定变量重用执行计划：`select colume from table where colume=:x;`，通过 set 不同数据，只需要生成一次执行计划，并且可以重用。

```java
PreparedStatement pstmt = null;
try {
    //？用来占位，后面将会填充对应的参数值
    String SQL = "Update Students SET age = ? WHERE id = ?";
    pstmt = conn.prepareStatement(SQL);
    ...
}
/*
setXXX() 方法将值绑定到参数，其中 XXX 表示希望绑定到输入参数值的 Java 数据类型。如果忘了提供值，将收到一个 SQLException。
*/
catch (SQLException e) {
   . . .
}
finally {
//同理，我们需要关闭 PreparedStatement 对象
   pstmt.close();
}
```

```java
//Jdbc.java：
package jdbc;
import java.sql.*;
public class Jdbc {
    // JDBC 驱动器的名称和数据库地址
    static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";
    static final String DB_URL = "jdbc:mysql://localhost/jdbc";
    static final String USER = "root";
    static final String PASS = "root";
    public static void main(String[] args) {
        Connection conn = null;
        PreparedStatement stmt = null;
        try{
            //注册 JDBC 驱动器
            Class.forName("com.mysql.jdbc.Driver");
            //打开连接
            System.out.println("Connecting to database...");
            conn = DriverManager.getConnection(DB_URL,USER,PASS);
            //执行查询
            System.out.println("Creating statement...");
            //这里我们要更改一个同学的年龄，参数待定
            String sql = "UPDATE Students set age=? WHERE id=?";
            stmt = conn.prepareStatement(sql);
            //将值绑定到参数，参数从左至右序号为 1，2...
            stmt.setInt(1, 22);  // 绑定 age 的值（序号为 1)，填充参数索引从1开始
            stmt.setInt(2, 1); // 绑定 ID 的值
            //setInt和getInt等来自java.lang.reflect.Field.setInt(Object obj, int value)方法的声明。
            //public void setInt(Object obj, int value) throws IllegalArgumentException, IllegalAccessException
            //即SQL语句被填充为UPDATE Students set age=22 WHERE id=1
            // 更新 ID 为 1 的同学的年龄，因为之前就已经绑定了sql语句，所以这里就不用加sql了
            int rows = stmt.executeUpdate();
            System.out.println("被影响的行数 : " + rows );
            // 查询所有记录，并显示。
            sql = "SELECT id, name, age FROM Students";
            ResultSet rs = stmt.executeQuery(sql);
            //处理结果集
            while(rs.next()){//如果结果集下一个值不为空
                //检索
                int id  = rs.getInt("id");//获取对象中属性名为id的属性
                int age = rs.getInt("age");
                String name = rs.getString("name");
                //显示
                System.out.print("ID: " + id);
                System.out.print(", Age: " + age);
                System.out.print(", Name: " + name);
                System.out.println();
            }
            //清理
            rs.close();
            stmt.close();
            conn.close();
        }catch(SQLException se){
            se.printStackTrace();
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            try{
                if(stmt!=null)
                    stmt.close();
            }catch(SQLException se2){
            }
            try{
                if(conn!=null)
                    conn.close();
            }catch(SQLException se){
                se.printStackTrace();
            }
        }
        System.out.println("Goodbye!");
    }
}
```

编译运行：

![result1][result1]

### &emsp;CallableStatement

CallableStatement对象为所有的DBMS提供了一种以标准形式调用存储过程的方法。存储过程储存在数据库中。对储存过程的调用是CallableStatement对象所含的内容。三种类型的参数有：IN，OUT和 INOUT。PreparedStatement对象只使用IN参数。CallableStatement对象可以使用所有三个：

参数|描述
:--:|:--
IN|它的值是在创建 SQL 语句时未知的参数，将IN参数传给CallableStatement对象是通过setXXX() 方法完成的
OUT|其值由它返回的SQL语句提供的参数。从OUT参数的getXXX()方法检索值
INOUT|同时提供输入和输出值的参数，绑定的setXXX()方法的变量，并使用getXXX()方法检索值

调用存储过程的语法：

+ 调用存储过程：{call 存储过程名 (?,?...)}
+ 返回结果参数的过程：{?=call 存储过程 (?,?...)}
+ 不带参数的存储过程：{call 存储过程名}

CallableStatement对象是使用Connection方法prepareCall创建的：

```java
CallableStatement cstmt = null;
try {
   String SQL = "{call getEXAMPLEName (?, ?)}";
   cstmt = conn.prepareCall (SQL);
   ...
}
catch (SQLException e) {
   ...
}
finally {
   cstmt.close();
}
```

使用CallableStatement对象就像使用PreparedStatement对象一样。 在执行语句之前，必须将值绑定到所有参数，否则将抛出一个SQLException异常。
如果有IN参数，只需遵循适用于PreparedStatement对象的相同规则和技术; 使用与绑定的Java数据类型相对应的setXXX()方法。
使用OUT和INOUT参数时，必须使用一个额外的CallableStatement对象方法registerOutParameter()。 registerOutParameter()方法将JDBC数据类型绑定到存储过程并返回预期数据类型。
当调用存储过程，可以使用适当的getXXX()方法从OUT参数中检索该值。 此方法将检索到的SQL类型的值转换为对应的Java数据类型。

&emsp;

## 结果集

结果集通常是通过执行查询数据库的语句生成，表示数据库查询结果的数据表。ResultSet 对象具有指向其当前数据行的光标。最初，光标被置于第一行之前。next 方法将光标移动到下一行；因为该方法在 ResultSet 对象没有下一行时返回 false，所以可以在 while 循环中使用它来迭代结果集。光标可以方便我们对结果集进行遍历。默认的 ResultSet 对象不可更新，仅有一个向前移动的光标。因此，只能迭代它一次，并且只能按从第一行到最后一行的顺序进行。

ResultSet 接口的方法可分为三类：

+ 导航方法：用于移动光标
+ 获取方法：用于查看当前行的光标所指向的列中的数据
+ 更新方法：用于更新当前行的列中的数据

JDBC提供下列连接方法来创建不同接口所需的ResultSet语句：

+ createStatement(int RSType, int RSConcurrency);
+ prepareStatement(String SQL, int RSType, int RSConcurrency);
+ prepareCall(String sql, int RSType, int RSConcurrency);

RSType表示ResultSet对象的类型，RSConcurrency是ResultSet常量，用于指定一个结果集是否为只读或可更新。

ResultSet的类型，如果不指定ResultSet类型，将自动获得一个是TYPE_FORWARD_ONLY：

类型|描述
:--:|:--
ResultSet.TYPE_FORWARD_ONLY|游标只能向前移动的结果集
ResultSet.TYPE_SCROLL_INSENSITIVE|游标可以向前和向后滚动，但不及时更新，就是如果数据库里的数据修改过，并不在ResultSet中反应出来
ResultSet.TYPE_SCROLL_SENSITIVE|游标可以向前和向后滚动，并及时跟踪数据库的更新，以便更改 ResultSet 中的数据

并发性的 ResultSet，如果不指定任何并发类型，将自动获得一个为 CONCUR_READ_ONLY

并发|描述
:--:|:--
ResultSet.CONCUR_READ_ONLY|创建结果集只读。这是默认的
ResultSet.CONCUR_UPDATABLE|创建一个可更新的结果集

如：

```java
try {
   Statement stmt = conn.createStatement(
                            ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_UPDATABLE);
}
catch(Exception ex) {
    ...
}
finally {
    ...
}
```

### &emsp;导航方法

方法|说明
:---|:--
public void beforeFirst() throws SQLException|将光标移动到正好位于第一行之前
public void afterLast() throws SQLException|将光标移动到刚刚结束的最后一行
public boolean first() throws SQLException|将光标移动到第一行
public void last() throws SQLException|将光标移动到最后一行
public boolean absolute(int row) throws SQLException|将光标移动到指定的行
public boolean relative(int row) throws SQLException|从它目前所指向向前或向后移动光标行的给定数量
public boolean previous() throws SQLException|将光标移动到上一行。上一行关闭的结果集此方法返回 false
public boolean next() throws SQLException|将光标移动到下一行。如果没有更多的行结果集中的此方法返回 false
public int getRow() throws SQLException|返回的行号，该光标指向的行
public void moveToInsertRow() throws SQLException|将光标移动到一个特殊的行，可以用来插入新行插入到数据库中的结果集。当前光标位置被记住
public void moveToCurrentRow() throws SQLException|移动光标返回到当前行，如果光标在当前插入行，否则，这个方法不执行任何操作

我们只改变try中的代码看看：

```java
package jdbc;

import java.sql.*;

public class Jdbc {
    // JDBC 驱动器名称 和数据库地址
    static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";
    //数据库的名称为 test
    static final String DB_URL = "jdbc:mysql://localhost/test";
    // 数据库用户和密码
    static final String USER = "root";
    static final String PASS = "root";

    public static void main(String[] args) {
        Connection conn = null;
        Statement stmt = null;
        try{
            //注册 JDBC 驱动程序
            Class.forName("com.mysql.jdbc.Driver");
            //打开连接
            System.out.println("Connecting to database...");
            conn = DriverManager.getConnection(DB_URL,USER,PASS);
            System.out.println("Creating statement...");
            //创建所需的 ResultSet，双向，只读
            stmt = conn.createStatement(
                    ResultSet.TYPE_SCROLL_INSENSITIVE,
                    ResultSet.CONCUR_READ_ONLY);
            String sql;
            sql = "SELECT id, name, age FROM Students";
            ResultSet rs = stmt.executeQuery(sql);
            // 将光标移到最后一行
            System.out.println("Moving cursor to the last...");
            rs.last();

            //处理结果集
            System.out.println("Displaying record...");
            int id  = rs.getInt("id");
            int age = rs.getInt("age");
            String name = rs.getString("name");


            //显示
            System.out.print("ID: " + id);
            System.out.print(", Age: " + age);
            System.out.print(", Name: " + name);
            System.out.println();

            // 将光标移到第一行
            System.out.println("Moving cursor to the first row...");
            rs.first();

            System.out.println("Displaying record...");
            id  = rs.getInt("id");
            age = rs.getInt("age");
            name = rs.getString("name");


            //显示
            System.out.print("ID: " + id);
            System.out.print(", Age: " + age);
            System.out.print(", Name: " + name);

            //将光标移至下一行
            System.out.println("Moving cursor to the next row...");
            rs.next();


            System.out.println("Displaying record...");
            id  = rs.getInt("id");
            age = rs.getInt("age");
            name = rs.getString("name");

            // 显示
            System.out.print("ID: " + id);
            System.out.print(", Age: " + age);
            System.out.print(", Name: " + name);

            rs.close();
            stmt.close();
            conn.close();
        }catch(SQLException se){
            se.printStackTrace();
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            try{
                if(stmt!=null)
                    stmt.close();
            }catch(SQLException se2){
            }
            try{
                if(conn!=null)
                    conn.close();
            }catch(SQLException se){
                se.printStackTrace();
            }
        }
        System.out.println("Goodbye!");
    }
}
```

![result2][result2]

<span style="color:orange">注意：</span>这时候会报一个错：Establishing SSL connection without server's identity verification is not recommended. According to MySQL 5.5.45+, 5.6.26+ and 5.7.6+ requirements SSL connection must be established by default if explicit option isn't set. For compliance with existing applications not using SSL the verifyServerCertificate property is set to 'false'. You need either to explicitly disable SSL by setting useSSL=false, or set useSSL=true and provide truststore for server certificate verification.

翻译如：请注意:不建议在没有服务器身份验证的情况下建立SSL连接。根据MySQL 5.5.45+、5.6.26+和5.7.6+的要求，如果不设置显式选项，则必须建立默认的SSL连接。您需要通过设置useSSL=false显式地禁用SSL，或者设置useSSL=true并为服务器证书验证提供信任存储

解决方法：将DB_URL改为jdbc:mysql://localhost/jdbc?useUnicode=true&characterEncoding=utf-8&useSSL=false，就不会报错了。

### &emsp;获取方法

方法|说明
:---|:--
public int getInt(String columnName) throws SQLException|当前行中名为 ColumnName 列的值
public int getInt(int columnIndex) throws SQLException|当前行中指定列的索引的值。列索引从 1 开始，意味着一个行的第一列是 1，行的第二列是 2，依此类推

以及getString()等方法。使用方式基本一致，只是数据类型不一样。我们在用到getInt()时可能会想到之前使用过的setInt()方法，那么setInt方法能用来更新数据吗？这是不行的，因为setInt被改变的数据应该为对象，而不是集合值。

### &emsp;更新方法

方法|说明
:---|:--
public void updateString(int columnIndex, String s) throws SQLException|指定列中的字符串更改为 s 的值
public void updateString(String columnName, String s) throws SQLException|类似于前面的方法，不同之处在于由它的名称，而不是它的索引指定的列
public void updateRow()|通过更新数据库中相应的行更新当前行
public void deleteRow()|从数据库中删除当前行
public void refreshRow()|刷新在结果集的数据，以反映最新变化在数据库中
public void cancelRowUpdates()|取消所做的当前行的任何更新
public void insertRow()|插入一行到数据库中。当光标指向插入行此方法只能被调用

当然还有许多类似的方法，如updateDouble()，与updateString()方法类似。

```java
Statement stmt = conn.createStatement(
                           ResultSet.TYPE_SCROLL_INSENSITIVE,
                           ResultSet.CONCUR_UPDATABLE);

String sql = "SELECT id, name, age FROM Students";
ResultSet rs = stmt.executeQuery(sql);

//结果集中插入新行
rs.moveToInsertRow();
rs.updateInt("id",5);
rs.updateString("name","John");
rs.updateInt("age",21);
//更新数据库
rs.insertRow();
```

### &emsp;结果集的使用

我们在使用结果集的时候必须关注到一点就是JDBC中只能存在一个ResultSet对象，也就是说如果一个ResultSet对象未使用或者关闭就不能开启另一个ResultSet，会报错：java.sql.SQLException:Operation not allowed after ResultSet closed。

且一个ResultSet对象只能使用一次，也就是说一旦这个对象被遍历完了，那么它会自动被关闭，不能再次使用， 必须再创建一次。

比如：

```java
package jdbc;
import java.sql.*;
public class Jdbc {
    // JDBC 驱动器名称 和数据库地址
    static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";
    //数据库的名称为 EXAMPLE
    static final String DB_URL = "jdbc:mysql://localhost/jdbc?useUnicode=true&characterEncoding=utf-8&useSSL=false";
    //  数据库用户和密码
    static final String USER = "root";
    static final String PASS = "root";
    public static void main(String[] args) {
        //连接和状态都赋值为null
        Connection conn = null;
        Statement stmt = null;
        try{
            //注册 JDBC 驱动程序
            Class.forName("com.mysql.jdbc.Driver");
            //打开连接
            System.out.println("Connecting to database...");
            conn = DriverManager.getConnection(DB_URL,USER,PASS);
            conn.setAutoCommit(false);
            //执行查询
            System.out.println("Creating statement...");
            stmt = conn.createStatement();
            String sql = "SELECT ID,name,age from Students";
            ResultSet rs = stmt.executeQuery(sql);
            //插入
            System.out.println("Data1...");
            while(rs.next()){
                int id = rs.getInt("id");
                String name = rs.getString("name");
                int age = rs.getInt("age");
                System.out.println("ID: "+id+", age: "+age+", name: "+name);
            }
            Savepoint savepoint1 = conn.setSavepoint("Savepoint1");
            String SQL = "INSERT INTO Students " +
                    "VALUES (6, 21, 'Ben')";
            stmt.executeUpdate(SQL);
            //回滚
            conn.rollback(savepoint1);
            System.out.println("After rollback,Data2...");
            rs.beforeFirst();
            while(rs.next()){
                int id = rs.getInt("id");
                String name = rs.getString("name");
                int age = rs.getInt("age");
                System.out.println("ID: "+id+", age: "+age+", name: "+name);
            }
            Savepoint savepoint2 = conn.setSavepoint("Savepoint2");
            String SQL1 = "INSERT INTO Students " +
                    "VALUES (7, 18, 'King')";
            stmt.executeUpdate(SQL1);
            // 如果没有问题将提交
            System.out.println("Without rollback,Data3...");
            rs.beforeFirst();
            while(rs.next()){
                int id = rs.getInt("id");
                String name = rs.getString("name");
                int age = rs.getInt("age");
                System.out.println("ID: "+id+", age: "+age+", name: "+name);
            }
            conn.commit();
            //清理环境
            stmt.close();
            conn.close();
        }catch(SQLException se){
            // JDBC 操作错误
            se.printStackTrace();
            try{
                if(conn!=null)
                    conn.rollback();
            }catch(SQLException se2){
                se2.printStackTrace();
            }
        }catch(Exception e){
            // Class.forName 错误
            e.printStackTrace();
        }finally{
            //这里一般用来关闭资源的
            try{
                if(stmt!=null)
                    stmt.close();
            }catch(SQLException se2){
            }
            try{
                if(conn!=null)
                    conn.close();
            }catch(SQLException se){
                se.printStackTrace();
            }
        }
        System.out.println("Goodbye!");
    }
}
```

这个代码运行就会报错。

[result1]:data:image/png;base64,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

[result2]:data:image/png;base64,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
