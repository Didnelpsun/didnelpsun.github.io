window.addEventListener("load", function(){
    //样式
    let header = document.getElementsByClassName("header")[0];
    let space = document.getElementsByClassName("space")[0];
    if(window.screen.width < window.screen.height){
        header.style.height=space.style.height="75px";
    }
    else{
        header.style.height=space.style.height="10vh";
    }

    //逻辑
    let know = document.getElementsByClassName("moremessage")[0];
    know.onclick = function(){
        document.documentElement.scrollTop=document.body.scrollHeight;
    }
});