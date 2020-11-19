---
layout: post
title:  "基本操作"
date:   2020-11-19 10:37:49 +0800
categories: notes lunix base
tags: Lunix 基础 lunix Ubuntu 操作
excerpt: "基本操作（Ubuntu）"
---

因为Ubuntu上许多操作都不像Windows那样图形化，而必须采用命令行的方式来进行使用，所以就必须记住一些基本的命令。

## 为文件夹创建快捷方式

```bash
sudo ln -sT 源目标文件夹地址 目标文件夹地址
```

其中源目标文件夹地址必须完全存在，而目标文件夹地址的最后一个必须不存在而让系统创建。比如`sudo ln -sT /media/didnelpsun/新加卷/桌面/语音转换 /home/didnelpsun/桌面/语音转换`。

<span style="color:orange">注意：</span>你最好使用ctrl+l复制对应文件夹路径，比如Ubuntu中如果安装时采用中文，那么对应的如桌面的等文件夹的路径就是中文，而不会像是Win10那样实际上是英文。

&emsp;

## 重新装载磁盘

我安装了Win10系统和Ubuntu系统两个系统，所以说我有两个以上的盘，实际上是三个，作为系统盘，默认C盘和安装Ubuntu的盘是无法被对方的系统所访问的，但是以外的盘却能被访问。

我想删除一个副本文件：`sudo rm ~$博客格式文档.docx`，但是它会报错：`rm: 无法删除'~$博客格式文档.docx': 只读文件系统`，实际上是因为这个新加卷是我Win10所使用的D盘，虽然Ubuntu可以访问，但是不能被它所修改。

我们可以先使用df命令，linux中df命令的功能是用来检查linux服务器的文件系统的磁盘空间占用情况。可以利用该命令来获取硬盘被占用了多少空间，目前还剩下多少空间等信息。

基本参数为：

-a 全部文件系统列表

-h 方便阅读方式显示

-H 等于“-h”，但是计算式，1K=1000，而不是1K=1024

-i 显示inode信息

-k 区块为1024字节

-l 只显示本地文件系统

-m 区块为1048576字节

--no-sync 忽略 sync 命令

-P 输出格式为POSIX

--sync 在取得磁盘信息前，先执行sync命令

-T 文件系统类型

```shell
didnelpsun@Didnelpsun:~$ df -h
文件系统         容量  已用  可用 已用% 挂载点
udev             7.7G     0  7.7G    0% /dev
tmpfs            1.6G  2.1M  1.6G    1% /run
/dev/nvme0n1p9    28G   18G   11G   64% /
tmpfs            7.8G  335M  7.4G    5% /dev/shm
tmpfs            5.0M     0  5.0M    0% /run/lock
tmpfs            7.8G     0  7.8G    0% /sys/fs/cgroup
/dev/loop1        55M   55M     0  100% /snap/core18/1880
/dev/loop2        56M   56M     0  100% /snap/core18/1932
/dev/loop3       9.2M  9.2M     0  100% /snap/canonical-livepatch/95
/dev/loop4       218M  218M     0  100% /snap/gnome-3-34-1804/60
/dev/loop0        98M   98M     0  100% /snap/core/10185
/dev/loop5        63M   63M     0  100% /snap/gtk-common-themes/1506
/dev/loop6       256M  256M     0  100% /snap/gnome-3-34-1804/36
/dev/loop7        31M   31M     0  100% /snap/snapd/9721
/dev/loop8        30M   30M     0  100% /snap/snapd/8542
/dev/nvme0n1p10   47G   11G   37G   22% /home
/dev/loop9        50M   50M     0  100% /snap/snap-store/467
/dev/nvme0n1p8   1.9G   79M  1.7G    5% /boot
/dev/nvme0n1p1   256M   37M  220M   15% /boot/efi
/dev/loop10       51M   51M     0  100% /snap/snap-store/481
tmpfs            1.6G   20K  1.6G    1% /run/user/125
tmpfs            1.6G   52K  1.6G    1% /run/user/1000
/dev/sda1        466G  262G  205G   57% /media/didnelpsun/Elements
/dev/nvme0n1p4   258G   30G  228G   12% /media/didnelpsun/新加卷
```

然后采用更改磁盘权限的`sudo mount -o remount,rw 挂载点`命令，该命令重新挂载为已经挂载了的文件系统（以读写权限挂载），需要注意的是，挂载点必须是一个已经存在的目录，这个目录可以不为空。一般用于此目录下的文件为ro权限，需要临时变更为可修改权限。

参数：

-o <选项> 指定挂载文件系统时的选项，有些也可写到在 /etc/fstab 中。常用的有：

defaults 使用所有选项的默认值（auto、nouser、rw、suid）
auto/noauto 允许/不允许以 –a选项进行安装
dev/nodev 对/不对文件系统上的特殊设备进行解释
exec/noexec 允许/不允许执行二进制代码
suid/nosuid 确认/不确认suid和sgid位
user/nouser 允许/不允许一般用户挂载
codepage=XXX 代码页
iocharset=XXX 字符集
ro 以只读方式挂载
rw 以读写方式挂载
remount 重新安装已经安装了的文件系统
loop 挂载“回旋设备”以及“ISO镜像文件”

我们所需要使用的就是最后一个新加卷，所以采用命令`sudo mount -o remount,rw /media/didnelpsun/新加卷`重新装载新加卷就可以删除了。重新运行删除命令没有报错，且之前灰色的修改选项也已经变黑。

<span style="color:red">警告：</span>你会发现，你推出Ubuntu后登入Windows后再回到Ubuntu，之前更改的权限又不能写入了，是因为Windows强制关机后 必须正常关机 否则有磁盘保护。你需要在Win10的命令行中输入`powercfg -h off`。
