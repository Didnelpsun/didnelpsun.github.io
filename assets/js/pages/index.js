// document.write('<link href="../includes/header.js"></link>')
window.addEventListener("load",function(){
    let showspace = document.getElementsByClassName("showspace")[0];
    let show = document.getElementsByClassName("show")[0];
    let showimage = document.getElementsByClassName("showimage")[0];
    let showcover = document.getElementsByClassName("showcover")[0];
    if(document.body.clientWidth < document.body.clientHeight ){
        showspace.style.height="75px";
        show.style.height="55vw";
        showimage.style.height="55vw";
        showcover.style.height="55vw";
    }
    else{
        showspace.style.height="10vh";
        show.style.height="90vh";
        showimage.style.height="90vh";
        showcover.style.height="90vh";
    }
});