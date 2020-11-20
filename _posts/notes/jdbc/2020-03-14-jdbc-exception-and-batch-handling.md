---
layout: post
title: "异常与批量处理"
date: 2020-03-14 21:23:05 +0800
categories: notes jdbc base
tags: JDBC 基础 异常 批量 addBatch executeBatch clearBatch
excerpt: "异常处理与批量处理"
---

## 异常处理

异常处理，顾名思义可以处理在受控制的方式下的异常情况。当程序在运行的过程中并没有按照我们的预期情况执行，将会引发异常。当程序异常的时候，当前执行的程序就会立即停止，并且重定向到最近的适用的catch子句中，如果没有适用的catch子句存在，那么程序结束。

JDBC的异常处理非常类似于Java Exception处理。JDBC最常见的异常处理的是java.sql.SQLException。

方法|描述
:---|:--
getErrorCode()|获取此 SQLException 对象的特定于供应商的异常代码
getMessage()|获取驱动程序处理的错误的JDBC驱动程序的错误消息，或获取数据库错误的Oracle错误代码和消息。
getNextException()|通过 setNextException(SQLException ex) 获取链接到此 SQLException 对象的异常，即获取异常链中的下一个Exception对象。
getSQLState()|获取此 SQLException 对象的 SQLState。对于 JDBC 驱动程序的错误，没有有用的信息从该方法返回。对于一个数据库错误，则返回五位 XOPEN SQLSTATE 代码。这种方法可以返回 null
iterator()|返回在链接的 SQLExceptions 上进行迭代的迭代器
printStackTrace()|打印当前异常或可抛出的异常，并将其追溯到标准错误流。
printStackTrace(PrintStream s)|将此throwable及其回溯打印到指定的打印流。
printStackTrace(PrintWriter w)|打印这个throwable，它是回溯到指定的打印器(PrintWriter)。
setNextException(SQLException ex)|将 SQLException 对象添加到链接的末尾

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
            String sql = "Insert into Students values('ben','reen',11)";
            stmt.executeUpdate(sql);
            //插入
            conn.commit();
            //清理环境
            stmt.close();
            conn.close();
        }catch(SQLException se){
            // JDBC 操作错误
            System.out.println("Error code: "+se.getErrorCode()+" Error state: "+se.getSQLState());
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

![result1][result1]

&emsp;

## 批处理

批处理允许将相关的SQL语句组合成一个批处理和一个调用数据库提交。批处理和JDBC事务是一致的。

当一次发送多个SQL语句到数据库，可以减少通信开销的数额，从而提高了性能。不过JDBC驱动程序不需要支持此功能。应该使用`DatabaseMetaData.supportsBatchUpdates()`方法来确定目标数据库支持批量更新处理。如果你的JDBC驱动程序支持此功能的方法返回 true。

DatabaseMetaData接口是描述有关数据库的整体综合信息，由于DatabaseMetaData是接口，所以没有构造方法，故不能使用new来创建DatabaseMetaData对象，但是可以通过Connection的getMetaData()方法创建。例如：`DatabaseMetaData md=con.getMetaData();`。

那么如何进行批处理操作：

+ 使用`createStatement()`等方法创建一个Statement，PerparedStatement，CallableStatement对象
+ 设置使用自动提交为false
+ 添加任意多个SQL语句到批量处理，使用`addBatch()`方法
+ 使用`executeBatch()`方法，将返回一个整数数组，数组中的每个元素代表了各自的更新语句的更新计数
+ 最后，提交使用`commit()`方法的所有更改
+ 就像将批处理语句添加到处理中一样，可以使用`clearBatch()`方法删除它们。此方法将删除所有使用addBatch()方法添加的语句。 但是，无法指定选择某个要删除的语句。

### &emsp;使用Statement对象

步骤：

+ 使用createStatement()方法创建Statement对象。
+ 使用setAutoCommit()将自动提交设置为false。
+ 使用addBatch()方法在创建的Statement对象上添加SQL语句到批处理中。
+ 在创建的Statement对象上使用executeBatch()方法执行所有SQL语句。
+ 最后，使用commit()方法提交所有更改。

```java
// 创建 statement 对象
Statement stmt = conn.createStatement();
// 关闭自动提交
conn.setAutoCommit(false);
// 创建 SQL 语句
String SQL = "INSERT INTO Students (id, name, age) VALUES(6,'Mike', 21)";
// 将 SQL 语句添加到批处理中
stmt.addBatch(SQL);
// 创建更多的 SQL 语句
String SQL = "INSERT INTO Students (id, name, age) VALUES(7, 'Angle', 23)";
// 将 SQL 语句添加到 批处理中
stmt.addBatch(SQL);
// 创建整数数组记录更新情况
int[] count = stmt.executeBatch();
//提交更改
conn.commit();
```

### &emsp;使用PrepareStatement对象

当然我们也可以使用prepareStatement对象进行批处理操作，SQL语句依然可以使用占位符。

步骤：

+ 使用占位符创建SQL语句。
+ 使用prepareStatement()方法创建PrepareStatement对象。
+ 使用setAutoCommit()将自动提交设置为false。
+ 使用addBatch()方法在创建的Statement对象上添加SQL语句到批处理中。
+ 在创建的Statement对象上使用executeBatch()方法执行所有SQL语句。
+ 最后，使用commit()方法提交所有更改。

```java
// 创建 SQL 语句
String SQL = "INSERT INTO Employees (id, name, age) VALUES(?, ?, ?)";
// 创建 PrepareStatement 对象
PreparedStatemen pstmt = conn.prepareStatement(SQL);
//关闭自动连接
conn.setAutoCommit(false);
// 绑定参数
pstmt.setInt( 1, 8 );
pstmt.setString( 2, "Cindy" );
pstmt.setInt( 3, 17 );
// 添入批处理
pstmt.addBatch();
// 绑定参数
pstmt.setInt( 1, 9 );
pstmt.setString( 2, "Jeff" );
pstmt.setInt( 3, 22 );
// 添入批处理
pstmt.addBatch();
//创建数组记录更改
int[] count = pstmt.executeBatch();
//提交更改
conn.commit();
```

最后总的一个测试代码：

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
        PreparedStatement pstmt = null;
        try{
            //注册 JDBC 驱动程序
            Class.forName("com.mysql.jdbc.Driver");
            //打开连接
            System.out.println("Connecting to database...");
            conn = DriverManager.getConnection(DB_URL,USER,PASS);
            conn.setAutoCommit(false);
            //检查是否支持批处理
            DatabaseMetaData md=conn.getMetaData();
            if(md.supportsBatchUpdates()){
                System.out.println("Your database support batch update");
                System.out.println("Creating statement...");
                //准备sql语句
                String sql = "DELETE FROM Students WHERE id = ?;";
                //准备查询
                pstmt = conn.prepareStatement(sql);
                //传入参数
                pstmt.setInt(1,1);
                pstmt.addBatch();
                pstmt.setInt(1,2);
                pstmt.addBatch();
                int count[]= pstmt.executeBatch();
                int i = 0;
                //打印更新数据
                while(i<count.length){
                    System.out.println("第"+(i+1)+"次操作共更新"+count[i]+"次。");
                    i++;
                }
                conn.commit();
            }
            else
                System.out.println("Your database isn't support batch update, your update operation is failure...");
            //清理环境
            pstmt.close();
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
                if(pstmt!=null)
                    pstmt.close();
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

[result1]:data:image/png;base64,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

[result2]:data:image/png;base64,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