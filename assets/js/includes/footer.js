window.addEventListener("load",function(){
    const back = document.getElementsByClassName('backtotop')[0];
    back.onclick=function(){
        let intervalId = setInterval(function () {
            document.body.scrollTop -= 10;
            if(document.body.scrollTop == 0)
                clearInterval(intervalId);
        }, 10)
    }
});