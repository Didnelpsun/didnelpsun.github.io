// document.write('<link href="../includes/header.js"></link>')
window.addEventListener("load", function () {
    let show = document.getElementsByClassName("show")[0];
    let showimage = document.getElementsByClassName("showimage")[0];
    let showcover = document.getElementsByClassName("showcover")[0];
    if (document.body.clientWidth < document.body.clientHeight) {
        show.style.height = showcover.style.height = showimage.style.height = "55vw";
    }
    else {
        show.style.height = showcover.style.height = showimage.style.height = "90vh";
    }
    let bk = new Array();
    bk[0] = "https://i.loli.net/2020/01/15/WFLbUqanmdS7Q1i.png";
    bk[1] = "https://i.loli.net/2020/01/15/Id95DUwb8J7HhMn.png";
    bk[2] = "https://i.loli.net/2020/01/15/Yfx1EX43Lzau57q.png";
    bk[3] = "https://i.loli.net/2020/01/15/LQD7biJd6FXE2ov.png";
    bk[4] = "https://i.loli.net/2020/01/15/1qViZK5ov3CXdJs.png";
    bk[5] = "https://i.loli.net/2020/01/15/bVenAfU7xWRzsuY.png";
    let changebuttonleft = document.getElementsByClassName("changebutton left")[0];
    let changebuttonright = document.getElementsByClassName("changebutton right")[0];
    let i = 0;
    changebuttonleft.onclick = function () {
        if (bk[--i])
            showimage.style.backgroundImage = "url("+bk[i]+")";
        else {
            showimage.style.backgroundImage = "url("+bk[bk.length - 1]+")";
            i = bk.length - 1;
        }
    }
    changebuttonright.onclick = function () {
        if (bk[++i])
            showimage.style.backgroundImage = "url("+bk[i]+")";
        else {
            showimage.style.backgroundImage = "url("+bk[0]+")";
            i = 0;
        }
    }
    const button1 = document.getElementsByTagName('button')[0];
    const button2 = document.getElementsByTagName('button')[1];
    const button3 = document.getElementsByTagName('button')[2];
    button1.onclick=function(){
        window.location.href='/emotion'
    }
    button2.onclick=function(){
        window.location.href='/notes'
    }
    button3.onclick=function(){
        window.location.href='/share'
    }
});