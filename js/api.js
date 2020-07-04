(function (doc, win) {
    if (window.location.href.indexOf('http://192.168.35.231') >= 0) {
        var api = "../../../service/HttpRequestSkill.ashx"; //测试路径

    } else
        var api = "../../../service/HttpRequestSkill.jsp"; //正式路径


    win.api = api;
})(document, window)