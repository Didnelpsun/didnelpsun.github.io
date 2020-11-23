---
layout: post
title:  "Schema"
date:   2020-11-05 19:10:00 +0800
categories: notes xml base
tags: XML 基础 xml Schema XSD
excerpt: "XML中使用Schema"
---

Schema即XML Schema或XML Schema Definition（XSD），可以代替DTD且具有明显的优势。

## Schema概述

XSD文档一般以单独的.xsd扩展名文件形式存在。简单例子如下：

```xsd
<!--test.xsd-->
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLShema">
    <xs:element name="school">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="name" type="xs:string">
                <xs:element name="major" type="xs:string" minOccurs="1" maxOccurs="unbounded">
            <xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
```

XSD文件本身也是一个XML文件，所以该文件必须是一个根元素Schema，Schema的命名空间为<http://www.w3.org/2001/XMLShema>，别名一般为xs，其中xs命名空间中第一个根元素为schema元素，下面的所有XSD元素都是从属于xs命名空间中的。

约束表明：`<xs:element>`定义一个元素，该元素的name属性定义了该元素的名称，所以第三行的定义表明这里定义了一个名为school的元素；`xs:complexType`定义了元素类型，它是element元素的子元素，所以这个元素指明school元素的类型，表示这个元素是一个复杂类型元素，即这个元素中包含子元素、属性又或者全部都包含，school元素中包含了两个element元素表明school元素中包含两个子元素，分别是name属性定义的name和major元素；这两个元素被`<xs:sequence>`表明子元素名称是有序的，name在前，major在后；`<xs:element name="name" type="xs:string">`元素中的type属性表明name元素的类型，属性值为xs:string表明name元素的内容为字符串类型；`<xs:element name="major" type="xs:string" minOccurs="1" maxOccurs="unbounded">`中minOccurs属性表明出现的最小次数，maxOccurs属性表明出现的最大次数，unbounded表示不限制。

这个XSD文件不涉及命名空间，所以这定义的内容不属于任何命名空间。当前XSD文件定义了school元素，包含name和major两个有序子元素，name元素必须且只出现一次，而major元素至少出现一次。

对应约束的XML文件为：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<school xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="test.xsd">
    <name>信息管理学院</name>
    <major>管理科学与工程</major>
    <major>大数据应用与管理</major>
</school>
```

school元素包含两个属性：

1. xsi:noNamespaceSchemaLocation="test.xsd"属性：表示XML文件引用了XSD文件test.xsd作为其语义约束，因为XML文件没有涉及到命名空间，所以使用xsi:noNamespaceSchemaLocation属性来引入，而属性值为被引入的test.xsd的URI。引入XSD文件后，若标记不属于任何命名空间时，语义受到XSD文件约束。
2. xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"：因为XML引入Schema文件使用的属性xsi:noNamespaceSchemaLocation属于命名空间http://www.w3.org/2001/XMLSchema-instance，所以XML文件加入了对该命名空间的声明。

&emsp;

## 引入Schema

通过上面的例子上可以知道当XML引入XSD时，根据XML文档的元素是否属于某个特定的命名空间来选择两种方式引入XSD：

+ 不属于任何命名空间，通过xsi:noNamespaceSchemaLocation引入。
+ 属于某个命名空间，通过xsi:schemaLocation引入。

当不属于任何命名空间时，我们可以通过上面的例子得到，这个属性值是且只能是一个Schema文件的URI。

而如果被引入的Schema文件需要约束XML文件中属于某个特定的命名空间元素，Schema文件使用`targetNamespace`属性来指明命名空间URI，XML文件则使用xsi:schemaLocation属性引入，<span style="color:aqua">格式：</span>`xsi:schemaLocation="XSD文件路径..."`，如果多个文件路径，则中间使用空格分隔。

```xsd
<!--target.xsd-->
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
targetNamespace="https://didnelpsun.github.io/xml" xmlns:d="https://didnelpsun.github.io/xml">
    <xs:element name="collage">
        <xs:complexType>
            <xs:sequence>
                <xs:element ref="d:name"></xs:element>
                <xs:element ref="d:major" minOccurs="1" maxOccurs="unbounded"></xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
    <xs:element name="name" type="xs:string"/>
    <xs:element name="major" type="xs:string"/>
</xs:schema>
```

```xml
<!--test.xml-->
<?xml version="1.0" encoding="UTF-8">
<tar:collage xmlns:tar="https://didnelpsun.github.io/xml" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="https://didnelpsun.github.io/xml target.xsd">
    <tar:name>信息管理学院</tar:name>
    <tar:major>管理科学与工程</tar:major>
    <tar:major>大数据应用与管理</tar:major>
</tar:collage>
```

该XML文档使用了target.xsd作为XML文档的语义约束，而target.xsd文档中的元素又都属于命名空间https://didnelpsun.github.io/xml，所以需要使用xsi:schemaLocation="https://didnelpsun.github.io/xml target.xsd"来引入Schema文件，同时还需要再引入该命名空间：xmlns:tar="https://didnelpsun.github.io/xml"`，前缀为tar，对应的标签全都是以tar开头。

&emsp;

## 语法结构

扩展名为xsd，以xml格式编写，基本的<span style="color:aqua">格式：</span>

```xsd
<?xml version="1.0" encoding="编码格式">
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    ...
</xs:schema>
```

XSD的根元素必须是`<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">`制定所使用的命名空间。

除此之外还可以为根元素指定两个属性：

+ elementFormDefault：可以是qualified和unqualified，指定XML文档使用该Schema文档中定义的局部元素时是否必须使用命名空间限定。
+ attributeFormmDefault：该属性值可以是qualified和unqualified，指定XML文档使用该Schema文档中定义的局部属性时是否必须使用命名空间限定。

### &emsp;元素

XSD中定义的元素用于约束XML文件中的元素定义，<span style="color:aqua">格式：</span>

```xsd
<!--一般用于定义简单元素-->
<element name="元素名称" type="元素类型" [default="默认值"] [minOccurs="最少出现的次数"] [maxOccurs="最多出现的次数"]/>
<!--一般用于定义复杂元素-->
<element name="元素名称" [default="默认值"] [minOccurs="最少出现的次数"] [maxOccurs="最多出现的次数"]>
    元素类型
<element/>
<!--不用于定义元素而是用来引用元素，一般用于复杂元素的子元素定义-->
<element ref="引用元素名称" [default="默认值"] [minOccurs="最少出现的次数"] [maxOccurs="最多出现的次数"]/>
```

minOccurs最小出现值默认为1，为0就代表这个元素是可选的，如果大于0则强制出现，如果没有与maxOccurs属性同时出现，这个属性就只能为0或1。

maxOccurs最小出现值默认为1，为unbounded就代表这个元素是可以出现任意次数的，如果没有与minOccurs属性同时出现，这个属性就不能为0。

```xsd
<!--target.xsd-->
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified" attributeFormDefault="unqualified">
    <!--用第二种语法定义复杂元素-->
    <xs:element name="collage">
        <xs:complexType>
            <xs:sequence>
                <!--用第一种语法定义简单元素-->
                <xs:element name="name" type="xs:string" default="信息管理学院"></xs:element>
                <!--用第三种语法引用下面定义的元素major-->
                <xs:element ref="major" minOccurs="1" maxOccurs="unbounded"></xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
    <!--第一种语法定义简单元素-->
    <xs:element name="major" type="xs:string"/>
</xs:schema>
```

元素还分为全局元素和局部元素两种，直接定义在schema元素下的元素就是全局元素，这里是collage和major，他们可以被任意引用，而定义在元素内部的元素就是局部元素，如name元素，不能被除collage元素以外的元素引用。

还可以使用元素组，将多个元素及其约束组合到一起，使用时作为一个整体，能更好地复用<span style="color:aqua">格式：</span>

```xsd
<xs:group name="元素组名称">
    元素与约束
</xs:group>
```

引用<span style="color:aqua">格式：</span>`<xs:group ref="元素组名称" />`。



