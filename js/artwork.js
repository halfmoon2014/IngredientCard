$(function () {


    var _show = utils.getUrlParam("show"), //0显示表单，1显示平面图
        _zlmxid = utils.getUrlParam("zlmxid"), //指令编号，请求接口提交的参数
        _ypzlbh = utils.getUrlParam("ypzlbh"), //样衣编号，后期可能会用
        _userid = utils.getUrlParam("userid"),
        _tzid = utils.getUrlParam("tzid");



    //阻止右击时系统默认的弹出框
    document.oncontextmenu = function (e) {
        e.preventDefault();
    };


    // 初始化下拉框
    for (var i = 0; i < $(".filter .select-menu").length; i++) {
        selectMenu(i);
    }


    // 款号输入框事件
    function khEvent() {

        // 款号回车事件
        $("#kh").keypress(function (evt) {　　
            evt = (evt) ? evt : ((window.event) ? window.event : "");　　
            var key = evt.keyCode ? evt.keyCode : evt.which;　　
            if (key == 13) {　　
                $("#s-kh").val($("#kh").val());
                loadZlkhData($("#kh").val());
                $("#kh-pup").show();
                return false;　　
            }
        });

        //款号右击事件
        document.getElementById("kh").onmouseup = function (oEvent) {
            if (!oEvent) oEvent = window.event;
            if (oEvent.button == 2) {
                $("#s-kh").val($("#kh").val());
                loadZlkhData($("#kh").val());
                $("#kh-pup").show();
            }
        }


        // 点击弹出面板的款号或者指令编号
        $("#kh-table").on("click", "a", function () {
            var tr = $(this).parent("td").parent("tr");

            // 如果勾选复制，则弹出配料卡页面
            if ($("#copy-check").attr("checked") == "checked") {
                var copyyphh = tr.attr("data-yphh");
                var url = "./Card.html?show=1&bm=sp&issave=1&yphh=&userid=" + _userid + "&tzid=" + _tzid + "&ypzlbh=" + _ypzlbh + "&copyyphh=" + copyyphh + "&issaveforshl=0&btnTitle=save&isyfcwdj=0";
                $("#plk_iframe").attr("src", url);
                $("#plk-pup").show();

            }
            var kh = tr.find(".kh-link").text();
            var zlbh = tr.find(".zlbh-link").text();
            var xzzlmxid = tr.attr("data-xzzlmxid");
            var xjsplbid = tr.attr("data-xjsplbid");
            var kfbx = tr.attr("data-kfbx");
            var bh = tr.attr("data-bh");
            var bhid = tr.attr("data-bhid");
            var yrkz = tr.attr("data-yrkz");
            var bzdw = tr.attr("data-bzdw");
            var ipzt = tr.attr("data-ipzt");
            var style = tr.attr("data-style");
            var gysm = tr.attr("data-gysm");
            var gysmmc = tr.attr("data-gysmmc");


            $("#kh").val(kh);
            $("#kh").attr("data-xzzlmxid", xzzlmxid);
            //$("#zlbh").val(zlbh);
            $("#ejpl li[data-dm='" + xjsplbid + "']").click();
            $("#kfbx li[data-dm='" + kfbx + "']").click();
            $("#bh").val(bh);
            $("#bh").attr("data-bhid", bhid);
            $("#yrkz").val(yrkz);
            $("#wzss li[data-dm='" + bzdw + "']").click();
            $("#ipzt li[data-dm='" + ipzt + "']").click();
            $("#sx li[data-dm='" + style + "']").click();
            $("#gysm").attr("data-gysm", gysm);
            $("#gysm").val(gysmmc);


            $("#kh-pup").hide();

        });


        // 弹出面板款号回车事件
        $("#s-kh").keypress(function (evt) {　　
            evt = (evt) ? evt : ((window.event) ? window.event : "");　　
            var key = evt.keyCode ? evt.keyCode : evt.which;　　
            if (key == 13) {　　
                loadZlkhData($("#s-kh").val());
                return false;　　
            }
        });


        // 款号弹出面板查询按钮
        $("#khSearchBtn").click(function () {
            loadZlkhData($("#s-kh").val());
        });


        // 关闭选择款号弹出层
        $("#kh-pup #pup-close").click(function () {
            $("#kh-pup").hide();
            $("#kh").val("");
            $("#kh").attr("data-xzzlmxid", 0);
            $("#ejpl-input").val("");
            $("#ejpl li").removeClass("select-this");
            $("#ejpl-input").attr("data-xjsplbid", 0);
        });


        // 关闭配料卡iframe弹出层
        $("#plk-pup #pup-close").click(function () {
            $("#plk-pup").hide();
        });
    }


    var isBhOrGy = 0; //0=版号及款式选择； 1=工艺说明
    // 版号及款式或领型输入框事件
    function bhksEvent() {
        // 版号及款式或领型回车事件
        $("#bh").keypress(function (evt) {　　
            evt = (evt) ? evt : ((window.event) ? window.event : "");　　
            var key = evt.keyCode ? evt.keyCode : evt.which;　　
            if (key == 13) {　　
                isBhOrGy = 0;
                $("#s-bh").val($("#bh").val());
                loadBhksData($("#bh").val());
                $("#bhks-pup").show();
                return false;　　
            }
        });

        //版号及款式或领型右击事件
        document.getElementById("bh").onmouseup = function (oEvent) {
            if (!oEvent) oEvent = window.event;
            if (oEvent.button == 2) {
                isBhOrGy = 0;
                $("#s-bh").val($("#bh").val());
                loadBhksData($("#bh").val());
                $("#bhks-pup").show();
            }
        }


        // 点击弹出面板的材料编号或者材料名称
        $("#bh-table").on("click", "a", function () {
            var tr = $(this).parent("td").parent("tr");
            var clmc = tr.find(".clmc-link").text();
            if (isBhOrGy == 0) {
                $("#bh").val(clmc);
                $("#bh").attr("data-bhid", tr.attr("data-id"));
            } else {
                $("#gysm").val(clmc);
                $("#gysm").attr("data-gysm", tr.attr("data-id"))
            }


            $("#bhks-pup").hide();
        });


        // 弹出面板版号款式回车事件
        $("#s-bh").keypress(function (evt) {　　
            evt = (evt) ? evt : ((window.event) ? window.event : "");　　
            var key = evt.keyCode ? evt.keyCode : evt.which;　　
            if (key == 13) {　　
                loadBhksData($("#s-bh").val());

                return false;　　
            }
        });


        // 版号款式弹出面板查询按钮
        $("#bhSearchBtn").click(function () {
            loadBhksData($("#s-bh").val());
        });


        // 关闭选择版号及款式或领型弹出层
        $("#bhks-pup #pup-close").click(function () {
            if (isBhOrGy == 0) {
                $("#bh").val("");
                $("#bh").attr("data-bhid", 0)
            } else {
                $("#gysm").val("");
                $("#gysm").attr("data-gysm", 0)
            }

            $("#bhks-pup").hide();
        });
    }


    // 工艺说明输入框事件
    function gysmEvent() {

        // 工艺说明回车事件
        $("#gysm").keypress(function (evt) {　　
            evt = (evt) ? evt : ((window.event) ? window.event : "");　　
            var key = evt.keyCode ? evt.keyCode : evt.which;　　
            if (key == 13) {　　
                isBhOrGy = 1;
                $("#s-bh").val($("#gysm").val());
                loadBhksData($("#gysm").val());
                $("#bhks-pup").show();
                return false;　　
            }
        });

        //工艺说明右击事件
        document.getElementById("gysm").onmouseup = function (oEvent) {
            if (!oEvent) oEvent = window.event;
            if (oEvent.button == 2) {
                isBhOrGy = 1;
                $("#s-bh").val($("#gysm").val());
                loadBhksData($("#gysm").val());
                $("#bhks-pup").show();
            }
        }

    }



    // 加载表单数据
    function loadFormData() {
        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getZlmxidInfoByZlmxid&source=pc",
            data: JSON.stringify({
                zlmxid: _zlmxid
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    _ypzlbh = msg.data[0][0].ypzlbh;
                    $("#zlbh").val(msg.data[0][0].ypzlbh);
                    $("#ypbh").val(msg.data[0][0].ypbh);
                    if (msg.data[1].length != 0) {
                        var html = "";
                        var ejpl = msg.data[1];
                        for (var i = 0; i < ejpl.length; i++) {
                            html += "<li data-dm='" + ejpl[i].dm + "'>" + ejpl[i].mc + "</li>";
                        }
                        $("#ejpl").html(html);
                        $("#ejpl li[data-dm='" + msg.data[0][0].xjsplbid + "']").click();
                        defaultErpl = $("#ejpl-input").val();
                        firstPlClick = false;
                    }

                    $("#bh").val(msg.data[0][0].bh);
                    $("#bh").attr("data-bhid", msg.data[0][0].bhid);

                    $("#kh").val(msg.data[0][0].ypkh);
                    $("#yrkz").val(msg.data[0][0].yrkz);

                    if (msg.data[4].length != 0) {
                        var html = "";
                        var wzss = msg.data[4];
                        for (var i = 0; i < wzss.length; i++) {
                            html += "<li data-dm='" + wzss[i].dm + "'>" + wzss[i].mc + "</li>";
                        }
                        $("#wzss").html(html);
                        $("#wzss li[data-dm='" + msg.data[0][0].bzdw + "']").click();
                    }

                    if (msg.data[2].length != 0) {
                        var html = "";
                        var kfbx = msg.data[2];
                        for (var i = 0; i < kfbx.length; i++) {
                            html += "<li data-dm='" + kfbx[i].dm + "'>" + kfbx[i].mc + "</li>";
                        }
                        $("#kfbx").html(html);
                        $("#kfbx li[data-dm='" + msg.data[0][0].kfbx + "']").click();
                    }

                    if (msg.data[3].length != 0) {
                        var html = "";
                        var sx = msg.data[3];
                        for (var i = 0; i < sx.length; i++) {
                            html += "<li data-dm='" + sx[i].DM + "'>" + sx[i].mc + "</li>";
                        }
                        $("#sx").html(html);
                        $("#sx li[data-dm='" + msg.data[0][0].style + "']").click();
                    }

                    if (msg.data[5].length != 0) {
                        var html = "";
                        html += "<li data-dm=''>无</li>";
                        var ipzt = msg.data[5];
                        for (var i = 0; i < ipzt.length; i++) {
                            html += "<li data-dm='" + ipzt[i].dm + "'>" + ipzt[i].mc + "</li>";
                        }
                        $("#ipzt").html(html);
                        $("#ipzt li[data-dm='" + msg.data[0][0].ipzt + "']").click();
                    }

                    $("#gysm").val(msg.data[0][0].gysmmc);
                    $("#gysm").attr("data-gysm", msg.data[0][0].gysm);

                    $("#cjkh").val(msg.data[0][0].cjkh);

                    $("#cjsh").val(msg.data[0][0].cjsh);

                    $(".loading").fadeOut(200);

                } else {

                    $(".load-txt").text(msg.errmsg);

                }


            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX  
    }


    // 上下装切换
    $("#print-tab").on("click", "li", function () {
        $("#print-tab li").removeClass("select");
        $(this).addClass("select");
        var tab = $(this).attr("data-val");
        switch (tab) {
            case "0":
                loadImgData(0);
                break;
            case "1":
                loadImgData(1);
                break;
            case "2":
                loadImgData(2);
                break;
            default:
                break;
        }

    });


    // 加载平面图数据
    function loadImgData(isxz) {
        $(".loading").show();
        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getZlmxidAndmlbyzlmxid&source=pc",
            data: JSON.stringify({
                zlmxid: _zlmxid,
                isxz: isxz
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    var main_info = msg.data[0][0], //主表信息
                        zml = msg.data[1], //主面料
                        csml = msg.data[2], //插色面料
                        zzpj = msg.data[3], //针织配件
                        lb = msg.data[4], //里布
                        yxh = msg.data[5], //印绣花
                        qt = msg.data[6], //其他信息，辅料编号
                        size = msg.data[7], //尺码信息表
                        db = msg.data[8]; //袋布

                    if (zml.length == 0 && csml.length == 0 && zzpj.length == 0 && lb.length == 0 && yxh.length == 0 && qt.length == 0 && db.length == 0) {
                        setTimeout(function () {
                            $.message({
                                message: '该品类没有下装',
                                type: 'info'
                            });
                        }, 200)

                    }

                    $("#floor-page .title").text(main_info.title);
                    $("#floor-page .checkbox_item[data-dm='" + main_info.style + "']").attr("checked", "checked");
                    $("#f_ejmc").text(main_info.xjsplbmc);
                    $("#f_yh").text(main_info.ypbh);
                    $("#f_zldh").text(main_info.ypzlbh);
                    main_info.bhdm = main_info.bhdm == null ? "" : main_info.bhdm;
                    main_info.bh = main_info.bh == null ? "" : main_info.bh;
                    $("#tb-bx").text("版型：" + main_info.bhdm + main_info.bh);
                    $("#designer").text(main_info.sjs);
                    if (main_info.xmjl != null) {
                        $("#xmjl").text(main_info.xmjl);
                    }
                    if (main_info.fzj != null) {
                        $("#fzj").text(main_info.fzj);
                    }
                    if (main_info.zjsp != null) {
                        $("#sjzj").text(main_info.zjsp);
                    }

                    $(".qr-code").attr("src", main_info.barcode);

                    if (main_info.picsrc != null) {
                        if (isxz == 0) {
                            $(".img-area img").attr("src", main_info.picsrc.split("|")[0]);
                        } else {
                            $(".img-area img").attr("src", main_info.picsrc.split("|")[1]);
                        }
                    }

                    // if (main_info.bh != null) {
                    //     $("#f_bhks span").text(main_info.bh);
                    //     $("#f_bhks").show();
                    // }

                    if (main_info.gysmmc != null) {
                        $("#f_ggsm span").text(main_info.gysmmc);
                        $("#f_ggsm").show();
                    }
                    if (main_info.wzmc != null && main_info.wzmc != "无") {
                        $("#f_wzss span").text(main_info.wzmc);
                        $("#f_wzss").show();
                    }

                    $(".ml-tb-wrap").css("top", $(".com-wrap").height() + "px");

                    // 主面料
                    if (zml.length != 0) {
                        $("#ml-table .info-td").html(template("tpl_zml", msg));
                        $(".ml-tb-wrap").show();
                    } else {
                        $(".ml-tb-wrap").hide();
                    }

                    // 针织配件
                    if (zzpj.length != 0) {
                        $("#zzpj-tr .info-td").html(template("tpl_zzpj", msg));
                        $("#zzpj-tr").show();
                    } else {
                        $("#zzpj-tr").hide();
                    }

                    // 袋布
                    if (db.length != 0) {
                        $("#db-tr .info-td").html(template("tpl_db", msg));
                        $("#db-tr").show();
                    } else {
                        $("#db-tr").hide();
                    }

                    var cslb_bot = $(".bot-tb-wrap").height() + 1;
                    var cslb_top = $(".com-wrap").height() + $(".ml-tb-wrap").height();
                    $(".cslb-tab-wrap").css("top", cslb_top + "px");
                    $(".cslb-tab-wrap").css("bottom", cslb_bot + "px");

                    // 插色面料
                    if (csml.length != 0) {
                        $("#csml-tr .info-td").html(template("tpl_csml", msg));
                        $("#csml-tr").show();
                    } else {
                        $("#csml-tr").hide();
                    }

                    // 里布
                    if (lb.length != 0) {
                        $("#lb-tr .info-td").html(template("tpl_lb", msg));
                        $("#lb-tr").show();
                    } else {
                        $("#lb-tr").hide();
                    }


                    if (yxh.length != 0) {
                        $("#yxhbh").text(yxh[0].chdm);
                    }

                    if (qt.length != 0) {
                        var html = "";
                        for (var i = 0; i < qt.length; i++) {
                            html += "<span>" + qt[i].mc + "：" + qt[i].chdm + "</span>";
                        }
                        $("#flbh").html(html);
                    }

                    if (size.length != 0) {
                        $("#size-table").html(template("tpl_size", msg));
                    }


                    $(".loading").fadeOut(200);

                } else {

                    $(".load-txt").text(msg.errmsg);

                }


            },
            error: function (XMLHttpRequest, statusText, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + statusText);

            }
        }); //end AJAX 
    }




    // 加载指令款号信息
    function loadZlkhData(val) {
        $(".loading").show();

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getBomInsKhXz&source=pc",
            data: JSON.stringify({
                zlmxid: _zlmxid,
                ypkh: val
            }),
            success: function (msg) {
                if (msg.errcode == "0") {

                    if (msg.data.length != 0 && msg.data != null) {
                        $("#kh-table tbody").html(template("tpl_khpup", msg));
                    } else {
                        $("#kh-table tbody").html('<tr><td colspan="3">暂无数据</td></tr>');
                    }
                    $(".loading").fadeOut(200);

                } else {

                    $(".load-txt").text(msg.errmsg);

                }


            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX  
    }



    // 加载款号版式/工艺说明信息
    function loadBhksData(val) {
        $(".loading").show();

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getTplPastXz&source=pc",
            data: JSON.stringify({
                dm: val
            }),
            success: function (msg) {
                if (msg.errcode == "0") {

                    if (msg.data.length != 0 && msg.data != null) {
                        $("#bh-table tbody").html(template("tpl_bhks", msg));

                    } else {
                        $("#bh-table tbody").html('<tr><td colspan="2">暂无数据</td></tr>');
                    }
                    $(".loading").fadeOut(200);

                } else {

                    $(".load-txt").text(msg.errmsg);

                }


            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX  
    }


    // 二级品类改变
    var firstPlClick = true;
    var defaultErpl = $("#ejpl-input").val();
    $("#ejpl").on("click", "li", function () {
        if ($("#ejpl-input").val() != defaultErpl && !firstPlClick) {
            defaultErpl = $("#ejpl .select-this").text();
            var xjsplbid = $("#ejpl .select-this").attr("data-dm");
            loadKfbx(xjsplbid);
        }
    });


    // 二级品类修改加载开发版型
    function loadKfbx(xjsplbid) {
        $(".loading").show();
        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getZlmxidBxByZlmxid&source=pc",
            data: JSON.stringify({
                zlmxid: _zlmxid,
                xjsplbid: xjsplbid
            }),
            success: function (msg) {
                if (msg.errcode == "0") {

                    if (msg.data[0].length != 0 && msg.data[0] != null) {
                        var html = "";

                        for (var i = 0; i < msg.data[0].length; i++) {
                            html += "<li data-dm='" + msg.data[0][i].dm + "'>" + msg.data[0][i].mc + "</li>";
                        }
                        $("#kfbx").html(html);
                        $("#kfbx-input").val("");

                    }
                    $(".loading").fadeOut(200);

                } else {

                    $(".load-txt").text(msg.errmsg);

                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX 

    }




    var Ealt = new Eject();

    // 表单保存按鈕
    $("#saveBtn").click(function () {

        //二级品类有选项，但是没有选择要提示
        if ($("#ejpl li").length > 1) {
            if ($("#ejpl .select-this").attr("data-dm") == "0") {
                Ealt.Ealert({
                    title: '提示',
                    message: "请选择二级品类"
                })
                return;
            }
        }

        var isCopy = $("#copy-check").attr("checked");
        isCopy = isCopy == undefined ? 0 : 1;
        // 如果选择复制
        if (isCopy == 1) {
            Ealt.Econfirm({
                title: '提示',
                message: '确定【复制】保存吗?',
                define: function () {
                    saveData();
                },
                cancel: function () {

                }
            })
        } else {
            saveData();
            //console.log(postData());
        }

    });


    // 构造表单提交数据
    function postData() {
        var jsCheck = $("#js-check").attr("checked");
        jsCheck = jsCheck == undefined ? 0 : 1;
        var isCopy = $("#copy-check").attr("checked");
        isCopy = isCopy == undefined ? 0 : 1;
        var xjsplbid;
        if ($("#ejpl").find(".select-this").length == 0) {
            xjsplbid = 0
        } else {
            xjsplbid = $("#ejpl").find(".select-this").attr("data-dm");
        }


        var postData = {
            "zlmxid": _zlmxid,
            "xjsplbid": xjsplbid,
            "xzzlmxid": $("#kh").attr("data-xzzlmxid"),
            "bhid": $("#bh").attr("data-bhid"),
            "ypkh": $("#kh").val(),
            "jsCheck": jsCheck,
            "yrkz": $("#yrkz").val(),
            "bzdw": $("#wzss").find(".select-this").attr("data-dm"),
            "kfbx": $("#kfbx").find(".select-this").attr("data-dm"),
            "style": $("#sx").find(".select-this").attr("data-dm"),
            "gysm": $("#gysm").attr("data-gysm"),
            "isfz": isCopy,
            "userid": utils.getUrlParam("userid"),
            "tzid": utils.getUrlParam("tzid"),
            "ipzt": $("#ipzt").find(".select-this").attr("data-dm"),
        };
        if ($("#bom").val() != "") {
            postData.bom = JSON.parse($("#bom").val());
        }
        //console.log(postData);
        return postData;
    }


    // 保存接口
    function saveData() {
        $(".load-txt").text("正在保存...");
        $(".loading").show();

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=saveProdDevInsXx&source=pc",
            data: JSON.stringify(postData()),
            success: function (msg) {
                if (msg.errcode == "0") {
                    $(".loading").fadeOut(200);
                    setTimeout(function () {
                        $.message('保存成功！');
                        $("#ypbh").val(msg.data);
                        window.parent.saveSuccess({
                            "yphh": msg.data
                        })
                    }, 200);

                } else {

                    $(".loading").fadeOut(200);
                    setTimeout(function () {
                        Ealt.Ealert({
                            title: '提示',
                            message: msg.errmsg
                        })
                    }, 200);

                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX  
    }


    function init() {
        // show=0显示表单， show=1显示平面图
        if (_show == 0) {

            $("#form-page").show();
            var btnTitle = utils.getUrlParam("btnTitle");
            if (btnTitle != null && btnTitle != undefined && btnTitle != "") {
                $("#saveBtn").text(btnTitle);
            }
            if (utils.getUrlParam("issave") == "0") {
                $("#saveBtn").hide();
            } else {
                $("#saveBtn").show();
            }
            loadFormData();

        } else {

            $("#floor-page").show();
            loadImgData(0);
        }

    }

    init();
    khEvent();
    bhksEvent();
    gysmEvent();

    // 打印
    $(" #print-btn").click(function () {
        window.print();
    })

})