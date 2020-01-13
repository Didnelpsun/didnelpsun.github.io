window.addEventListener("load",function(){
    const back = document.getElementsByClassName('backtotop')[0];
    back.onmouseover=function(){
        this.style.cursor='hand';
    }
    back.onclick=function(){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
});