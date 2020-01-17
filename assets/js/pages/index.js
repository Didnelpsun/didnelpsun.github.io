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
    let images;
    // let url = "../../../data/images.json"
    // let request = new XMLHttpRequest();
    // request.open("get", url);
    // request.send(null);
    // request.onload = function () {
    //     if (request.status == 200) {
    //         request.timeout = 8000;
    //         images = JSON.parse(request.responseText);
    //         // console.log(images);
    //     }
    // }

    images=[
        {
            "name": "chrysanthemum",
            "url": "https://i.loli.net/2020/01/15/WFLbUqanmdS7Q1i.png"
        },
        {
            "name": "bk1",
            "url": "https://i.loli.net/2020/01/15/Id95DUwb8J7HhMn.png"
        },
        {
            "name": "bk2",
            "url": "https://i.loli.net/2020/01/15/Yfx1EX43Lzau57q.png"
        },
        {
            "name": "bk3",
            "url": "https://i.loli.net/2020/01/15/LQD7biJd6FXE2ov.png"
        },
        {
            "name": "bk4",
            "url": "https://i.loli.net/2020/01/15/1qViZK5ov3CXdJs.png"
        },
        {
            "name": "bk5",
            "url": "https://i.loli.net/2020/01/15/bVenAfU7xWRzsuY.png"
        }
    ]
    
    let changebuttonleft = document.getElementsByClassName("changebutton left")[0];
    let changebuttonright = document.getElementsByClassName("changebutton right")[0];
    i = 0;
    changebuttonleft.onclick = function () {
        i--;
        if (!images[i])
            i = images["length"] - 1;
        showimage.style.backgroundImage = "url(" + images[i]["url"] + ")";
    }
    changebuttonright.onclick = function () {
        i++;
        if (!images[i])
            i = 0;
        showimage.style.backgroundImage = "url(" + images[i]["url"] + ")";
    }
    const button1 = document.getElementsByTagName('button')[0];
    const button2 = document.getElementsByTagName('button')[1];
    const button3 = document.getElementsByTagName('button')[2];
    button1.onclick = function () {
        window.location.href = '/emotion'
    }
    button2.onclick = function () {
        window.location.href = '/notes'
    }
    button3.onclick = function () {
        window.location.href = '/share'
    }
});