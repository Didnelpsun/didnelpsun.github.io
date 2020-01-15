// document.write('<link href="../includes/header.js"></link>')
window.addEventListener("load",function(){
    let show = document.getElementsByClassName("show")[0];
    let showimage = document.getElementsByClassName("showimage")[0];
    let showcover = document.getElementsByClassName("showcover")[0];
    if(document.body.clientWidth < document.body.clientHeight ){
        show.style.height=showcover.style.height=showimage.style.height="55vw";
    }
    else{
        show.style.height=showcover.style.height=showimage.style.height="90vh";
    }
});