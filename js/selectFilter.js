
function selectMenu(index) {
    $(".select-menu-input").eq(index).val($(".select-this").eq(index).html()); //在输入框中自动填充第一个选项的值
    $(".select-menu-div").eq(index).on("click", function (e) {
        e.stopPropagation();
        if ($(".select-menu-ul").eq(index).css("display") === "block") {
            $(".select-menu-ul").eq(index).hide();
            $(".select-menu-div").eq(index).find("i").removeClass("select-menu-i");
            $(".select-menu-ul").eq(index).animate({
                marginTop: "50px",
                opacity: "0"
            }, "fast");
        } else {
            $(".select-menu-ul").eq(index).show();
            $(".select-menu-div").eq(index).find("i").addClass("select-menu-i");
            $(".select-menu-ul").eq(index).animate({
                marginTop: "5px",
                opacity: "1"
            }, "fast");
        }
        for (var i = 0; i < $(".select-menu-ul").length; i++) {
            if (i !== index && $(".select-menu-ul").eq(i).css("display") === "block") {
                $(".select-menu-ul").eq(i).hide();
                $(".select-menu-div").eq(i).find("i").removeClass("select-menu-i");
                $(".select-menu-ul").eq(i).animate({
                    marginTop: "50px",
                    opacity: "0"
                }, "fast");
            }
        }

    });
    $(".select-menu-ul").eq(index).on("click", "li", function () { //给下拉选项绑定点击事件
        $(".select-menu-input").eq(index).val($(this).html()); //把被点击的选项的值填入输入框中
        $(".select-menu-div").eq(index).click();
        $(this).siblings(".select-this").removeClass("select-this");
        $(this).addClass("select-this");
    });
    $("body").on("click", function (event) {
        event.stopPropagation();
        if ($(".select-menu-ul").eq(index).css("display") === "block") {
            // console.log(1);
            $(".select-menu-ul").eq(index).hide();
            $(".select-menu-div").eq(index).find("i").removeClass("select-menu-i");
            $(".select-menu-ul").eq(index).animate({
                marginTop: "50px",
                opacity: "0"
            }, "fast");

        }

    });

}