---
layout: post
title: "基本应用"
date: 2022-04-16 12:00:02 +0800
categories: notes nginx base
tags: Nginx 基础
excerpt: "基本应用"
---

## 域名解析

### &emsp;多用户多层级域名

即对于一个域名下的用户如何申请自己独有的域名？而不是直接的号码？比如Github为每个用户都提供了博客的二级域名服务，如<https://github.com/>，我申请了我自己的名为Didnelpsun的博客，Github就免费给我派发一个<https://didnelpsun.github.io/>专属地址。我这个地址是属于github的，所以我访问这个网址时浏览器会去Github服务器访问资源。

这个多级域名如何实现呢？按照原始的默认情况是加入一个域名就新建一个映射关系，这是非常麻烦的，而且映射表会非常庞大，且难以维护和管理。

此时Nginx就是使用反向代理解决。即访问<https://didnelpsun.github.io/>时使用泛解析，将所有带*.github.io的请求都解析到一台Github专门的Nginx服务器上。那么此时这个服务器使用反向代理来判断这个请求域名是一级还是多级，把这个请求转发到一台负责业务的如Java服务器上，这个服务器将这个请求URL拆解为ID，连接数据库进行查询相关信息，把数据返回给Nginx，然后Nginx再把内容返回给用户。

### &emsp;短网址

即使用一个较短的但是杂乱无序的请求网址，如<https://test.org/r4tgeft4t>跳转到一个真实的且较长的网址，如<https://test.org/test/long/index.html>。

会有一个短网址服务系统，里面有一个数据库，当接收到真实网址请求后，服务系统会根据这个请求生成一个唯一标识字符串，可以使用UUID，作为短网址，然后把唯一标识字符串和真实网址请求一起保存到数据库中，返回给用户这个短网址。

所以在使用短网址请求时也跟多用户多层级域名一样使用反向代理，Nginx请求短网址服务器，让短网址服务器在数据库中查询短网址对应的真实网址再返回给用户。

### &emsp;httpdns

DNS一般走UDP协议，而HttpDNS走的是HTTP协议。

HttpDNS必须有HttpDNS的单独唯一标识符IP，所以HttpDNS不适合网页，而使用CS结构的服务，如手机的App。App会在软件中预埋这个HttpDNS的IP。App发送这个IP向系统，系统查询数据库，然后把IP地址返回给用户。

&emsp;

## 动静分离

### &emsp;原理

动静分离是指在web服务器架构中，将静态页面与动态页面或者静态内容接口和动态内容接口分开不同系统访问的架构设计方法，进而提升整个服务访问性能和可维护性。

即由于请求时使用反向代理一定会经过Nginx代理器再到Tomcat服务器，所以静态资源这种不会发生改变的资源可以直接放到Nginx上，这样就不用再转发访问到Tomcat了，从而降低了访问压力。

### &emsp;配置

#### &emsp;&emsp;反向代理配置

首先配置两个虚拟服务端口，90端口为服务运行端口，85端口为反向代理端口。

```conf
worker_processes  1;
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    server {
        listen       85;
        server_name  localhost;
        location / {
            proxy_pass http://localhost:90;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root   html;
        }
    }
    server {
        listen       90;
        server_name  test;
        location / {
            root   html/test;
            index  test.html test.htm;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root   html/test;
        }
    }
}
```

访问<http://localhost:85/>可以看到打出了test。

我们这里不要认为90端口是Nginx服务，而是认为它是普通服务，因为这是用Nginx模拟的普通服务。

#### &emsp;&emsp;多location

90端口指定了资源test.html的访问路径，如果我们想将90端口的test.html静态资源移动到Nginx服务器上。（实际上已经在Nginx上了，但是我们模拟时不要认为它在服务器上）

如果我们将90端口对应路径的资源删掉，则85端口必然访问不到这个页面。我们想转移这个资源，但是不能转移到85反向代理端口这里，因为使用了proxy_pass所以一切85端口的请求都会被替换，根本无法通过85端口访问其下面的静态资源。

直接在监控端口服务指定多个location，将原本应用程序的静态资源访问路径覆盖掉：

```conf
worker_processes  1;
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    server {
        listen       85;
        server_name  localhost;
        location / {
            proxy_pass http://localhost:90;
        }
        location /index {
            # 注意这里不能是root，因为root会默认拼接
            alias   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root   html;
        }
    }
    server {
        listen       90;
        server_name  test;
        location / {
            root   html/test;
            index  test.html test.htm;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root   html/test;
        }
    }
}
```

如果访问<http://localhost:85/>则会跳到test，这是被反向代理到90端口程序，如果访问<http://localhost:85/index/>就会跳到index，这是已经动静分离了，访问的静态资源为Nginx下的资源。

可以使用正则规则来给多个路径匹配规则。

### &emsp;URLRewrite

可以对路径进行重写，让路径变得干净整洁。

rewrite和location的功能有点相像，都能实现跳转，主要区别在于rewrite常用于同一域名内更改获取资源的路径，而location是对一类路径做控制访问和反向代理，可以proxy_pass到其他服务器。

Nginx提供的全局变量或自己设置的变量，结合正则表达式和标志位实现url重写以及重定向。

rewrite只能放在server{},location{},if{}中，并且只能对域名后边的除去传递的参数外的字符串起作用。

Rewrite主要的功能就是实现URL的重写，Nginx的Rewrite规则采用Pcre，perl兼容正则表达式的语法规则匹配，如果需要Nginx的Rewrite功能，在编译Nginx之前，需要编译安装PCRE库。

通过Rewrite规则，可以实现规范的URL、根据变量来做URL转向及选择配置。

指令|默认值|使用范围|作用
:--:|:----:|:------:|:--:
break|none|if,server,location|完成当前的规则集，不再处理rewrite指令，需要和last加以区分
if ( condition ) { … }|none|server,location|用于检测一个条件是否符合，符合则执行大括号内的语句。不支持嵌套，不支持多个条件&&或处理
return|none|server,if,location|用于结束规则的执行和返回状态码给客户端。状态码的值可以是：204,400,402,406,408,410,411,413,416以及500~504，另外非标准状态码444，表示以不发送任何的Header头来结束连接。
rewrite regex replacement flag||server,location,if|该指令根据表达式来重定向URI，或者修改字符串。指令根据配置文件中的顺序来执行。注意重写表达式只对相对路径有效。该指令根据表达式来重定向URI，或者修改字符串。指令根据配置文件中的顺序来执行。注意重写表达式只对相对路径有效。
uninitialized_variable_warn on/off|on|http,server,location,if|该指令用于开启和关闭未初始化变量的警告信息，默认值为开启。
set variable value|none||该指令用于定义一个变量，并且给变量进行赋值。变量的值可以是文本、一个变量或者变量和文本的联合，文本需要用引号引起来。

[参考](https://blog.csdn.net/qq_41475058/article/details/89516051)。

如修改：

```conf
location / {
    proxy_pass http://localhost:90;
    # 第一个路径是输入路径，第二个路径是转发路径，两个路径都可以使用正则
    # 由于使用了proxy_pass，所以这里指定的URL是90端口的而不是85端口的
    # 所以/index转发到的是90端口的/index/路径，这里是没有的，所以会404
    # rewrite /i /index break;
    # 此时会转发到test页面
    rewrite /i / break;
}
```

此时访问<http://localhost:85/i>会转发到90端口的test页面。

&emsp;

## 防盗链

### &emsp;概念

如果访问一个网页，那么首先服务器会返回网页本身，由于网页需要CSS文件、JS文件以及相关图片，所以网页还需要第二次第三次等请求。所以第一次请求时Request Header中没有Referer信息，而后面几次头部就有Referer信息，表示引用了之前的页面的请求。这是浏览器为用户执行的。

即一个应用的请求访问服务器资源，那么应该是被允许的，且由这个请求所需要引用的其他请求也是应该被允许的，如果是其他服务器引用了这个资源，那么其他服务的请求应该不被允许，一个服务器里的资源应该仅能被自己服务的请求所使用，所以为了防止资源被盗用就有了防盗链技术。

对于一些不敏感的资源，那么将资源暴露出去能增加搜索权重吸引流量，而对于敏感资源不希望被非法盗用，则此时需要使用防盗链。

### &emsp;使用

可以在Nginx中配置使用防盗链技术。可以在任意location下配置，表示哪种情况允许访问：

+ none：Referer头域不存在。
+ blocked：Referer头域的值被防火墙或者代理服务器删除或伪装。这种情况该头域的值不以“http://”产或“https://”开头。
+ server_names：设置一个或多个URL，检测Referer头域的值是否是这些URL中的某一个。可以以IP的形式也可以主机名的形式。

```conf
valid_referers 允许值;
# if和(之间必须有空格
if ($invalid_referer){
    return 403;
}
```

且必须放在root上，否则逻辑就是页面获取到了再禁止，禁止访问就无效了。

```conf
worker_processes  1;
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    server {
        listen       85;
        server_name  localhost;
        location / {
            proxy_pass http://localhost:90;
            # 由于使用了proxy_pass，所以这里指定的URL是90端口的而不是85端口的
            # 所以/index转发到的是90端口的/index/路径，这里是没有的，所以会404
            # rewrite /i /index break;
            # 此时会转发到test页面
            rewrite /i / break;
        }
        location /index {
            # 注意这里不能是root，因为root会默认拼接
            alias   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root   html;
        }
    }
    server {
        listen       90;
        server_name  test;
        location / {
            valid_referers 127.0.0.2;
            if ($invalid_referer){
                return 403;
            }
            root   html/test;
            index  test.html test.htm;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root   html/test;
        }
    }
}
```

此时访问就会返回403，因为只允许Referer的127.0.0.2访问，其他都不允许访问。

### &emsp;配置错误响应

此时访问会返回403页面，这个页面是浏览器自带的，而如果我们要自己定义这个错误处理应该如何做？

在html下复制50x.html重命名为403.html：

```html
<!DOCTYPE html>
<html>
<head>
<title>Error</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>403</h1>
<p><em>Forbidden</em></p>
</body>
</html>
```

然后配置：

```conf
worker_processes  1;
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    server {
        listen       85;
        server_name  localhost;
        location / {
            proxy_pass http://localhost:90;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root    html;
        }
    }
    server {
        listen       90;
        server_name  test;
        location / {
            valid_referers 127.0.0.2;
            if ($invalid_referer){
                return 403;
            }
            root   html/test;
            index  test.html test.htm;
        }
        # 必须放在被代理处
        error_page 403 /403.html;
        location = /403.html {
            root    html;
        }
        error_page   500 502 503 504  /50x.html; 
        location = /50x.html {
            root   html/test;
        }
    }
}
```

也可以使用rewrite隐藏403.html地址。

&emsp;

## 高可用

高可用使用Keepalived实现。

### &emsp;工作原理

#### &emsp;&emsp;基本逻辑

即为Nginx服务提供备份。此时不能再使用Nginx服务器为其他Nginx服务器提供反向代理了，因为一定会出现单点故障问题，所以此时就需要使用Keepalived。

Keepalived的功能是观测Nginx服务，如果一台宕机了立刻换另一台备份机提供服务，多个服务器之间是主备关系而不是主从关系。

Keepalived不会直接修改可用IP暴露给外界引用，而是直接向外界给出一个虚拟IP的VIP给外界，这样外界就可以一直使用这个VIP而不用关心服务器内部的Nginx服务器变动，由Keepalived监督Nginx服务器，将VIP绑定到可用的Nginx服务器IP上，VIP是不固定的。

#### &emsp;&emsp;层级逻辑

是一个类似于layer3,4&7交换机制的软件，也就是我们平时说的第3层、第4层和第7层交换。工作在IP/TCP协议栈的IP层，TCP层，及应用层，原理分别如下：

+ Layer3：Keepalived使用Layer3的方式工作式时，Keepalived会定期向服务器群中的服务器发送一个ICMP的数据包（即我们平时用的Ping程序），如果发现某台服务的IP地址没有激活，Keepalived便报告这台服务器失效，并将它从服务器群中剔除，这种情况的典型例子是某台服务器被非法关机。Layer3的方式是以服务器的IP地址是否有效作为服务器工作正常与否的标准。
+ Layer4:如果您理解了Layer3的方式，Layer4就容易了。Layer4主要以TCP端口的状态来决定服务器工作正常与否。如web server的服务端口一般是80，如果Keepalived检测到80端口没有启动，则Keepalived将把这台服务器从服务器群中剔除。
+ Layer7：Layer7就是工作在具体的应用层了，比Layer3、Layer4要复杂一点，在网络上占用的带宽也要大一些。Keepalived将根据用户的设定检查服务器程序的运行是否正常，如果与用户的设定不相符，则Keepalived将把服务器从服务器群中剔除。
