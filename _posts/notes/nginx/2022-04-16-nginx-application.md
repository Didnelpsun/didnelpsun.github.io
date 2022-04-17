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

### &emsp;安装配置

#### &emsp;&emsp;基本安装

打开[Keepalived下载网址](https://www.keepalived.org/download.html)，下载tar.gz文件。到对应目录解压`tar xzf keepalived-2.2.7.tar.gz`，指定目录进行安装`./configure --prefix=/usr/lib/keepalived --sysconf=/etc`，前一个是默认安装目录，后一个是系统配置文件目录。

如果报错：*** WARNING - this build will not support IPVS with IPv6. Please install libnl/libnl-3 dev libraries to support IPv6 with IPVS.表示需要相关依赖。`sudo apt install libnl-3-dev`。

```txt
sudo apt-get install libssl-dev 
sudo apt-get install openssl 
sudo apt-get install libpopt-dev 
sudo apt-get install libnl-3-dev
sudo apt-get install libnl-genl-3-dev
```

最后到对应的安装目录，如/usr/lib/keepalived 下运行`make && make install`。

当然也可以直接运行`sudo apt install keepalived`，直接安装etc目录下。

#### &emsp;&emsp;控制

+ 使用`keepalived -v`进行检查。
+ 使用`sudo service keepalived [start | stop | reload | restart ]`进行控制。
+ 使用`ps -ef | grep keepalived`查看是否启动。
+ 用-f参数指定配置文件的位置。

`ps -ef | grep keepalived`查看时，keepalived正常运行后，会启动3个进程，其中一个是父进程，负责监控其子进程。一个是vrrp子进程，另外一个是checkers子进程。

#### &emsp;&emsp;配置自启动

编辑/etc/rc.local文件：`sudo vim /etc/rc.local`或`sudo gedit /etc/rc.local`。

添加：

```local
#!/bin/sh -e
# 对于服务类，一定要以&结尾,表示不要等待运行结果
service keepalived start &

# 文档最后一定要以exit 0结尾，表示文档结束
exit 0
```

#### &emsp;&emsp;配置文件

```txt
cd /etc/keepalived
cp keepalived.conf keepalived.conf.bak
vim keepalived.conf
```

```conf
! Configuration File for keepalived

# 全局定义块
global_defs {
    # 服务器宕机后发送邮件提醒的地址
    notification_email {
        acassen@firewall.loc
        failover@firewall.loc
        sysadmin@firewall.loc
    }
    notification_email_from Alexandre.Cassen@firewall.loc
    # SMTP邮件服务端口
    smtp_server 192.168.200.1
    # 连接保持市场
    smtp_connect_timeout 30
    # 负载均衡标识，在局域网内应该是唯一的。一般为主机名。
    router_id LVS_DEVEL
    # 所有报文都检查比较消耗性能，此配置为如果收到的报文和上一个报文是同一个路由器则跳过检查报文中的源地址
    # vrrp_skip_check_adv_addr
    # 严格遵守VRRP协议,不允许状况：1.没有VIP地址；2.配置了单播邻居；3.在VRRP版本2中有IPv6地址
    # vrrp_strict
    # ARP报文发送延迟
    # vrrp_garp_interval 0
    # 消息发送延迟
    # vrrp_gna_interval 0         
    # 指定组播IP地址，默认值：224.0.0.18，范围：224.0.0.0到239.255.255.255 
    # vrrp_mcast_group4 224.0.0.18
    # 避免生成iptables input链，规则：sip any 拒绝 dip any
    # yum安装需要加此参数，添加此参数
    # vrrp_iptables                
}

# 脚本定义块，chk_http_port为脚本名
# vrrp_script chk_http_port {
#     # 检测心跳执行的脚本地址
#     script "/usr/local/src/nginx_check.sh"
#     # 检测脚本执行间隔，单位：秒
#     interval 4
#     # 超时时间
#     timeout 4
#     # 权重
#     # 此值为负数，表示fall（脚本返回值为非0）时，会将此值与本节点权重相加可以降低本节点权重，
#     # 如果是正数，表示rise（脚本返回值为0）成功后，会将此值与本节点权重相加可以提高本节点权重，通常使用负值较多
#     weight 2
#     # 脚本几次失败转换为失败，建议设为2以上
#     fall <INTEGER>
#     # 脚本连续监测成功后，把服务器从失败标记为成功的次数
#     rise <INTEGER>
#     # 执行监测脚本的用户或组
#     user USERNAME [GROUPNAME]
#     # 设置默认标记为失败状态，监测成功之后再转换为成功状态
#     init_fail
# }

# VRRP实例定义块
# VRRP为虚拟路由冗余协议
# 解决局域网中配置静态网关出现单点失效现象的路由协议
# VI_1为实例名称
vrrp_instance VI_1 {
    # 指定keepalived的角色，MASTER为主，BACKUP为备
    # 该值无法决定身份，最终还是通过比较priority
    state MASTER
    # 当前进行vrrp通讯的网络接口卡（当前ubuntu的网卡），如：ens32,eth0,bond0,br0，使用ip addr查看
    interface eth0
    # 指定VRRP实例ID（虚拟路由编号），范围是0-255，同一组虚拟路由器的vrid必须一致
    virtual_router_id 51
    # 优先级，数值越大，获取处理请求的优先级越高, 优先级高的将成为MASTER，范围：1-254
    priority 100
    # 指定发送VRRP通告的间隔，默认为1s（vrrp组播周期秒数）
    advert_int 1
    # 设置验证类型和密码，MASTER和BACKUP必须使用相同的密码才能正常通信
    authentication {
        # 指定认证方式。PASS简单密码认证（推荐）,AH:IPSEC认证（不推荐）。
        auth_type PASS
        # 指定认证所使用的密码。最多8位
        auth_pass 1111
    }
    # 调用检测脚本
    # track_script {
    #     chk_http_port
    # }
    # 定义虚拟ip（VIP），可多设，每行一个
    virtual_ipaddress {
        # 不指定网卡，默认为eth0,注意：不指定/prefix,默认为/32
        192.168.200.16
        192.168.200.17
        192.168.200.18
        # 指定VIP的子网、网卡、label
        # 192.168.200.19/24 dev eth2 label eth2:1  
    }
}

# 虚拟服务器定义块
# 可以不用
# 定义虚拟主机IP地址及其端口
virtual_server 192.168.200.100 443 {
    # 检查后端服务器的时间间隔
    delay_loop 6
    # 定义调度方法，可选rr|wrr|lc|wlc|lblc|sh|dh，默认轮训
    lb_algo rr
    # 集群的类型,注意要大写，可选NAT|DR|TUN
    lb_kind NAT
    # 子网掩码
    nat_mask 255.255.255.0
    # 持久连接时长，LVS在多少时间内没有与后端服务进行数据传输，就会断开
    persistence_timeout 50
    # 协议
    protocol TCP

    # RS的IP和PORT
    real_server 192.168.201.100 443 {
        # 权重
        weight 1
        # RS上线通知脚本
        # notify_up <STRING>
        # RS下线通知脚本
        # notify_down <STRING>
        # 定义当前主机的健康状态
        # 检测方法：HTTP_GET|SSL_GET|TCP_CHECK|SMTP_CHECK|MISC_CHECK
        SSL_GET {
            url {
                # 定义要监控的URL
                path /
                digest ff20ad2481f97b1754ef3e12ecd3a9cc
                # 判断上述检测机制为健康状态的响应码，一般为200
                # status_code 200
            }
            url {
                path /mrtg/
                digest 9b3a0c85a887a256d6939da88aabd8cd
            }
            # 客户端请求的超时时长, 相当于haproxy的timeout server，多久连接不上就报错
            connect_timeout 3
            # 重试次数
            nb_get_retry 3
            # 重试之前的延迟时长
            delay_before_retry 3
            # 向当前RS哪个IP地址发起健康状态检测请求
            # connect_ip <IP ADDRESS>
            # 向当前RS的哪个PORT发起健康状态检测请求
            # connect_port <PORT>
            # 向当前RS发出健康状态检测请求时使用的源地址
            # bindto <IP ADDRESS>
            # 向当前RS发出健康状态检测请求时使用的源端口
            # bind_port <PORT>
        }
        # 应用层检测：HTTP_GET、SSL_GET（Nginx、Tomcat）,可以使用url指定和后面的参数
        # 传输层检测：TCP_CHECK（Redis、MySQL），只能使用后面的参数不能使用url
    }
}

virtual_server 10.10.10.2 1358 {
    delay_loop 6
    lb_algo rr 
    lb_kind NAT
    persistence_timeout 50
    protocol TCP

    # 所有RS故障时，备用服务器地址（报错服务器）
    sorry_server 192.168.200.200 1358

    real_server 192.168.200.2 1358 {
        weight 1
        HTTP_GET {
            url { 
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url { 
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url { 
              path /testurl3/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            connect_timeout 3
            nb_get_retry 3
            delay_before_retry 3
        }
    }

    real_server 192.168.200.3 1358 {
        weight 1
        HTTP_GET {
            url { 
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334c
            }
            url { 
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334c
            }
            connect_timeout 3
            nb_get_retry 3
            delay_before_retry 3
        }
    }
}

virtual_server 10.10.10.3 1358 {
    delay_loop 3
    lb_algo rr 
    lb_kind NAT
    nat_mask 255.255.255.0
    persistence_timeout 50
    protocol TCP

    real_server 192.168.200.4 1358 {
        weight 1
        HTTP_GET {
            url { 
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url { 
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url { 
              path /testurl3/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            connect_timeout 3
            nb_get_retry 3
            delay_before_retry 3
        }
    }

    real_server 192.168.200.5 1358 {
        weight 1
        HTTP_GET {
            url { 
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url { 
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url { 
              path /testurl3/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            connect_timeout 3
            nb_get_retry 3
            delay_before_retry 3
        }
    }
}
```

如果要在主机上ping VIP，是ping不通的，因为会在防火墙生成一条规则（不允许任何主机访问本主机），可以在全局配置加上"vrrp_iptables"，防火墙就不会生成该规则，便可以ping通。此方式是为了达到实验效果，生产环境不适合开启。

### &emsp;脚本

Keepalived本质是观测Keepalived进程而不是观测Nginx进程，所以如果此时Nginx进程宕机了而Keepalived进程没有宕机，这Keepalived进程是不会察觉到变化的，所以就需要一个脚本并运行它，当Nginx宕机后让Keepalived也宕机，从而能转移VIP。

所以从这里也能看出Keepalived能关联其他很多服务器，只要编写脚本查看对应进程是否存在，如果不存在就杀死并转移VIP，就能做到维护服务器的高可用性。

```sh
#!/bin/bash
A=`ps -C nginx --no-header | wc -l`
if [ $A -eq 0 ];then
    /usr/local/nginx-1.18.0/sbin/nginx
    sleep 4
    if [ `ps -C nginx --no-header | wc -l` -eq 0 ];then
        killall keepalived
    fi
fi
```

&emsp;

## 安全证书

### &emsp;http协议安全性

由于http协议是高层应用层的协议，其底层实现是非常复杂的，而注定在高层使用时是较简单的，所以http协议是默认没有安全性保证的。所以为了保证安全性就必须对消息进行加密。

如果是两端都都消息进行同一种方式进行加密和解密，则是对称加密算法，这种加密算法两端必须一致，需要提前协调，且必须能被获取和读懂。可以添加加密因子如密码让另一端用加密因子对消息解密，但是还需要对加密因子加密。所以对称加密算法必然是不安全的。

对于此采用了非对称加密算法，在客户端使用公钥，在服务端使用私钥：

1. 服务端本身具有自己的私钥，生成公钥后发送给客户端。
2. 客户端使用公钥和加密算法将明文加密为密文。
3. 客户端将密文传输给服务端。
4. 服务端使用私钥和加密算法将密文解密为明文。
5. 服务端将请求的资源用私钥和加密算法将明文加密为密文。
6. 服务端将密文传输给客户端。
7. 客户端使用公钥和加密算法将密文解密为明文。

必须满足下面要求：

1. 公钥加密私钥能解密。
2. 私钥加密公钥能解密。
3. 公钥加密公钥不能解密。
4. 私钥不能在网络传递。

但是此时非对称加密也是不安全的，因为存在中间人攻击，即攻击者有一个不透明的反向代理服务器，直接拦截了客户端和服务端的请求，此时代理服务器具有一个虚假的私钥，将密文进行解密，然后进行篡改，重新加密为密文传输给服务端，服务端返回密文后代理服务器又使用公钥对返回密文进行解密进行篡改，重新用自己的私钥加密，返回给客户端。

### &emsp;https原理

可以引入第三方，不在网络传递，且在服务端和客户端都存在，用来校验传递的数据是否被篡改。这个第三方就是CA机构。

1. 服务端生成自己的公钥后不先发送给网络，先将公钥、域名、IP、服务端信息等发送给CA机构，让CA进行认证，判断这个服务端是否正常，为站点所有者。
2. 判断方式是CA向服务端传递一个随机字符，让其放在该站点的指定位置，服务端操作完成后返回给CA确认消息，CA访问服务端对应站点路径查看是否满足要求，如果CA发现其满足CA的要求，就表示服务端具有操作该站点的权限，证明为站点所有者。
3. CA认证成功后再对服务端上传的公钥利用CA机构自己的私钥和加密算法进行非对称的加密包装，生成了CA证书。
4. 服务端拿到CA证书后不再传输给客户端公钥，而是直接传递CA证书。
5. 客户端内置CA机构的公钥，或直接下载，就可以对CA证书进行查看。在传输请求时将明文利用CA证书与加密算法加密发送给服务端。
6. 如果存在拦截者拦截到CA证书，则因为CA证书是用私钥解密，所以可以直接用公钥解密，但是此时拦截者没有CA机构的私钥，所以无法伪造CA证书，只能通过自己的私钥进行加密伪造为密文。但是此时客户端收到密文后无法使用CA的公钥解开，所以客户端就能判断密文被篡改了。

### &emsp;证书签名

#### &emsp;&emsp;证书自签名

可以利用OpenSSL进行自签名，由于是自己给自己认证，所以只在内网有效。

#### &emsp;&emsp;在线证书

即在线证书申请。
