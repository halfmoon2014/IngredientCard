jQuery(function () {});
var params = {
    zoomVal: 1,
    left: 0,
    top: 0,
    currentX: 0,
    currentY: 0,
    flag: false
};

function bbimg(o) {
    var o = o.getElementsByTagName("img")[0];
    params.zoomVal += event.wheelDelta / 1200;
    if (params.zoomVal >= 0.2) {
        o.style.transform = "scale(" + params.zoomVal + ")";
    } else {
        var amplifyValue = jQuery("#dragImg").css("transform").replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1').split(',')[0]
        params.zoomVal = parseFloat(amplifyValue);
        o.style.transform = "scale(" + params.zoomVal + ")";
        return false;
    }
}

function amplify(index) {
    var index = index;
    var amplifyValue = jQuery("#dragImg").css("transform").replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1').split(',')[0];
    if (index == 1 && amplifyValue) {
        var biger = parseFloat(amplifyValue) + 0.1;
        jQuery("#dragImg").css({
            "transform": "scale(" + biger + ")"
        });
    } else if (index == 2 && amplifyValue) {
        var biger = parseFloat(amplifyValue) - 0.1;
        console.log(biger)
        jQuery("#dragImg").css({
            "transform": "scale(" + biger + ")"
        });
    } else if (index == 1) {
        jQuery("#dragImg").css({
            "transform": "scale(1.1)"
        });
    } else if (index == 2) {
        jQuery("#dragImg").css({
            "transform": "scale(0.9)"
        });
    }
}