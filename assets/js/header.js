window.onload=function(){
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
}