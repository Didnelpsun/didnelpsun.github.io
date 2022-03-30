---
layout: post
title:  "ActiveMQ高可用"
date:   2022-03-30 21:33:10 +0800
categories: notes mq activemq
tags: MQ ActiveMQ 高可用
excerpt: "ActiveMQ高可用"
---

## 传输协议

### &emsp;协议配置

ActiveMQ的传输URL默认为tcp://127.0.0.1:61616，即默认是使用TCP协议的。

ActiveMQ支持的client-broker通讯协议有：TCP、NIO、UDP、SSL、HTTP、HTTPS、VM。

修改方式是修改/conf/activemq.xml的transportConnectors标签：

```xml
<transportConnectors>
    <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
    <transportConnector name="openwire" uri="tcp://0.0.0.0:61616?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="stomp" uri="stomp://0.0.0.0:61613?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="mqtt" uri="mqtt://0.0.0.0:1883?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="ws" uri="ws://0.0.0.0:61614?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
</transportConnectors>
```

URI描述信息的头部都是采用协议名称表示ActiveMQ天然支持这些协议不需要其他配置，如描述amqp协议的监听端口时，采用的URI描述格式为amqp开头，而唯独在进行openwire协议描述时，URI头却采用的tcp开头。这是为什么？

查看[官方传输配置](https://activemq.apache.org/configuring-transports)。

### &emsp;基本支持协议

+ OpenWire协议：为Broker默认协议，是Apache自己定义的一种跨语言协议，允许从多种不同语言和平台对ActiveMQ进行本机访问，支持TCP、SSL、NIO、UDP、VM等传输方式，默认使用TCP，直接配置这些连接，是4.x版本以后默认的传输协议。速度较慢。
+ AMQP协议：即Advanced Message Queuing Protocol，一个提供统一消息服务的应用层标准的高级消息队列协议，是应用层协议的一个开放标准，为面向消息的中间件设计。基于此协议的客户端与消息中间件可传递消息，并不受客户端/中间件不同产品，不同开发语言等条件的限制。速度较快。
+ MQTT协议：即Message Queuing Telemetry Transport，消息队列遥测传输，是IBM开发的一个即时通讯协议，偏硬件部分，有可能成为物联网的重要组成部分。该协议支持所有平台，几乎可以把所有联网物品和外部连接起来，被用来当做传感器和致动器（比如通过Twitter让房屋联网）的通信协议。速度最快。
+ STOMP协议：即Streaming Text Orientated Message Protocol，是流文本定向消息协议，是一种为MOM面向消息的中间件设计的简单文本协议。速度最慢。
+ SSL协议：即Secure Sockets Layer Protocol，安全套接字协议，为网络通信提供安全及数据完整性的一种安全协议。其拓展协议TLS与SSL在传输层与应用层之间对网络连接进行加密。
+ WS协议：即WebSocket Protocol，是HTML5一种新的协议。它实现了浏览器与服务器全双工通信。和HTTP一样是一种应用层协议，都是基于TCP传输的，WebSocket本身和Socket并没有多大关系，更不能等同。
+ UDP协议：即User Datagram Protocol，用户数据报协议，性能比TCP协议更好，但是不具备可靠性。
+ HTTP协议：即Hyper Text Transfer Protocol，超文本传输协议。
+ VM：本身不是协议，当客户端和代理在同一个Java虚拟机中运行时,他们之间需要通信，但不想占用网络通道，而是直接通信，可以使用该方式。

#### &emsp;&emsp;TCP协议

端口号为61616，在网络传输数据前，必须要序列化数据，消息是通过一个叫wire protocol的协议来序列化成字节流。默认情况下ActiveMQ把wire protocol叫做OpenWire，它的目的是促使网络上的效率和数据快速交互。

+ TCP协议传输可靠性高，稳定性强。
+ 高效性，字节流方式传递，效率很高。
+ 有效性、可用性，应用广泛，支持任何平台。

TCP连接的URI形式：tcp://hostname:port?key=value&key=value

[TCP协议配置](https://activemq.apache.org/tcp-transport-reference)。

#### &emsp;&emsp;NIO协议

ActiveMQ默认使用BIO连接，如果有大量的客户端，或者瓶颈在网络传输上，可以考虑使用NIO。

NIO协议和TCP协议类似，但NIO协议更侧重于底层的访问操作。它允许开发人员对同一资源可有更多的客户端调用和服务端有更多的负载。

适合使用NIO协议的场景：

1. 可能有大量的客户端去连接到Broker上，一般情况下，大量的客户端去连接Broker是被操作系统的线程所限制的。因此，NIO的实现比TCP需要更少的线程去运行，所以建议使用NIO协议。
2. 可能对于Broker有一个很迟钝的网络传输，NIO比TCP提供更好的性能。

NIO连接的URI形式：nio://hostname:port?key=value&key=value。

[NIO协议配置](https://activemq.apache.org/nio-transport-reference)。

### &emsp;NIO使用

首先修改ActiveMQ的配置文件conf/activemq.xml，在transportConnectors标签中添加`<transportConnector name="nio" uri="nio://0.0.0.0:61618?trace=true&amp;maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>`。