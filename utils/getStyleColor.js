Change = function (pValue) {
    return pValue.replace(/[^\u0000-\u00FF]/g, function ($0) { return escape($0).replace(/(%u)(\w{4})/gi, "&#x$2;") });
}
getColor = function (colorNum) {
    switch (colorNum) {
        case 0:
            return "#fa0101";
        case 1:
            return "#fa4d01";
        case 2:
            return "#fa7c01";
        case 3:
            return "#faab01";
        case 4:
            return "#fad401";
        case 5:
            return "#ebfa01";
        case 6:
            return "#b1fa01";
        case 7:
            return "#82fa01";
        case 8:
            return "#59fa01";
        case 9:
            return "#01fa9f";
        case 10:
            return "#01f7fa";
        case 11:
            return "#01c2fa";
        case 12:
            return "#019ffa";
        case 13:
            return "#016afa";
        case 14:
            return "#0124fa";
        case 15:
            return "#6501fa";
        case 16:
            return "#9901fa";
        case 17:
            return "#e501fa";
        case 18:
            return "#fa01c2";
        case 19:
            return "#fa017c";
    }
}

getStyleColor = function (firstWord) { //引入相关字符串
    firstWord = Change(firstWord[0]);  //提取第一个字符，并利用change函数转成utf-8编码
    if (firstWord.length == 1) //如果转换后的结果是只有一个字符，就代表它是英文字母
        colorNum = (firstWord.charCodeAt() - 64) % 20; //使用charCodeAt函数将其变为ASCII编码，并模20变成数字
    else //如果不是，就代表转换前是汉字或者其他字符
        colorNum = (firstWord.replace(/[^0-9]/ig, "")) % 20; //就提取其中的数字，再模20
    return getColor(colorNum);
}