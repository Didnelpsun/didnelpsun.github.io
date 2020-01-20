window.addEventListener("load", function () {
    let show = document.getElementsByClassName("show")[0]; //样式修改
    let showimage = document.getElementsByClassName("showimage")[0];
    let showcover = document.getElementsByClassName("showcover")[0];
    if (window.screen.width < window.screen.height) {
        show.style.height = showcover.style.height = showimage.style.height = "55vw";
    }
    else {
        show.style.height = showcover.style.height = showimage.style.height = "90vh";
    } //
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

    images = [
        {
            "name": "chrysanthemum",
            "smurl": "https://i.loli.net/2020/01/15/WFLbUqanmdS7Q1i.png",
            "imgurl": "https://i.ibb.co/kMsysZY/chrysanthemum.png"
        },
        {
            "name": "maple",
            "smurl": "https://i.loli.net/2020/01/15/Id95DUwb8J7HhMn.png",
            "imgurl": "https://i.ibb.co/GHWT4qK/maple.png"
        },
        {
            "name": "sky",
            "imgurl": "https://i.ibb.co/487wPNk/sky.png"
        },
        {
            "name": "blackcloud",
            "imgurl": "https://i.ibb.co/G7Sbmvj/blackcloud.png"
        },
        {
            "name": "forest",
            "imgurl": "https://i.ibb.co/H2FdmnP/forest.png"
        },
        {
            "name": "starsky",
            "imgurl": "https://i.ibb.co/r6DJGF2/starsky.png"
        },
        {
            "name": "train",
            "imgurl": "https://i.ibb.co/vcvfRW0/train.png"
        },
        {
            "name": "city",
            "imgurl": "https://i.ibb.co/nnDxdRx/city.png"
        },
    ]

    let changebuttonleft = document.getElementsByClassName("changebutton left")[0];
    let changebuttonright = document.getElementsByClassName("changebutton right")[0];
    i = 0;
    changebuttonleft.onclick = function () {
        i--;
        if (!images[i])
            i = images["length"] - 1;
        if (images[i]["imgurl"])
            showimage.style.backgroundImage = "url(" + images[i]["imgurl"] + ")";
        else if (images[i]["smurl"])
            showimage.style.backgroundImage = "url(" + images[i]["smurl"] + ")";
    }
    changebuttonright.onclick = function () {
        i++;
        if (!images[i])
            i = 0;
        if (images[i]["imgurl"])
            showimage.style.backgroundImage = "url(" + images[i]["imgurl"] + ")";
        else if (images[i]["smurl"])
            showimage.style.backgroundImage = "url(" + images[i]["smurl"] + ")";
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