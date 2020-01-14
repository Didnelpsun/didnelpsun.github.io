window.addEventListener("load", function(){
    let header = document.getElementsByClassName("header")[0];
    if(document.body.clientWidth < document.body.clientHeight )
        header.style.height="75px";
    else
        header.style.height="10vh";
    let words = document.getElementsByClassName("wordchange");
    let i = 0;
    while (words[i]){
        let word = words[i]
        word.onmouseover=function(){
            word.style.color='#fff'
        }
        word.onmouseleave=function(){
            word.style.color='#999'
        }
        i++;
    }
    let caidan = document.getElementsByClassName("caidan")[0];
    words[1].onclick=function(){
        caidan.style.display=caidan.style.display=="flex"?"none":"flex";
    }
    let moremessage = this.document.getElementsByClassName("moremessage")[0];
    moremessage.onmouseover=function(){
        this.style.cursor='hand'
    }
    moremessage.onmouseleave=function(){
        caidan.style.display="none";
    }
});