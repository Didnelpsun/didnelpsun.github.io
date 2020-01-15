window.addEventListener("load", function(){
    let header = document.getElementsByClassName("header")[0];
    if(document.body.clientWidth < document.body.clientHeight )
        header.style.height="75px";
    else
        header.style.height="10vh";
    let caidan = document.getElementsByClassName("caidan")[0];
    let moremessage = document.getElementsByClassName("moremessage")[0];
    moremessage.onclick=function(){
        caidan.style.display=caidan.style.display=="flex"?"none":"flex";
    }
    moremessage.onmouseleave=function(){
        caidan.style.display="none";
    }
});