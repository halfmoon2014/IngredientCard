$(function () {

    var current_tab; //0=配料卡 1=总审核 2=接收检查
    var firstLoadMx = true; //是否第一次加载明细（明细只加载一次）
    var _yphh = utils.getUrlParam("yphh"), //样品货号
        _show = utils.getUrlParam("show"), //0显示配料卡-有图； 1显示配料卡-无图； 2显示总审核
        _bm = utils.getUrlParam("bm"), //sp=商品中心 js=技术部
        _copyyphh = utils.getUrlParam("copyyphh"); //复制样号参数
    _copyyphh = _copyyphh == null ? "" : _copyyphh;

    var inputChange = false; //表格的输入框值是否有改变，用于未保存时切换树提示有数据未保存
    var curImg; //当前显示的图片URL
    var dtable = $("#data_table"), //表格
        ftable = $("#fixed_table"); //固定列表格
    var _tm = ""; //当前扫描的条码

    var Ealt = new Eject(); //alert弹框对象

    var chdmArr = []; //当前扫描的材料信息

    var isReplace = false, //当前扫描材料是否是替换
        replaceOrd = 0, //当前要替换的表格行的序号
        initialRec = 0; //原始加载的表格行数，为复制保存做判断

    // 图片放大缩小拖拽
    //获取相关CSS属性
    var getCss = function (o, key) {
        return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key];
    };

    //拖拽的实现
    var startDrag = function (bar, target, callback) {
        if (getCss(target, "left") !== "auto") {
            params.left = getCss(target, "left");
        }
        if (getCss(target, "top") !== "auto") {
            params.top = getCss(target, "top");
        }
        //o是移动对象
        bar.onmousedown = function (event) {
            params.flag = true;
            if (!event) {
                event = window.event;
                //防止IE文字选中
                bar.onselectstart = function () {
                    return false;
                }
            }
            var e = event;
            params.currentX = e.clientX;
            params.currentY = e.clientY;
        };
        document.onmouseup = function () {
            params.flag = false;
            if (getCss(target, "left") !== "auto") {
                params.left = getCss(target, "left");
            }
            if (getCss(target, "top") !== "auto") {
                params.top = getCss(target, "top");
            }
        };
        document.onmousemove = function (event) {
            var e = event ? event : window.event;

            if (params.flag) {
                var nowX = e.clientX,
                    nowY = e.clientY;
                var disX = nowX - params.currentX,
                    disY = nowY - params.currentY;
                target.style.left = parseInt(params.left) + disX + "px";
                target.style.top = parseInt(params.top) + disY + "px";

                if (typeof callback == "function") {
                    callback((parseInt(params.left) || 0) + disX, (parseInt(params.top) || 0) + disY);
                }

                if (event.preventDefault) {
                    event.preventDefault();
                }
                return false;
            }

        }
    };

    startDrag(document.getElementById("dragImg"), document.getElementById("dragImg"))

    $("#dragImg").hover(function () {
        jQuery(document.body).css({
            "overflow-x": "hidden",
            "overflow-y": "hidden"
        });
    }, function () {
        jQuery(document.body).css({
            "overflow-x": "auto",
            "overflow-y": "auto"
        });
    });



    template.helper('formatNumber', function (s, n) {
        if (s == null)
            s = 0;
        return utils.formatNumber(s, n);
    });

    template.helper('getUrlParam', function (str) {
        return utils.getUrlParam(str);
    });


    template.helper('indexOf', function (obj, str) {
        if (obj.indexOf(str) == -1) {
            return false
        } else
            return true
    });


    template.helper('getCopyYphh', function () {
        return _copyyphh;
    });

    template.helper('isReplace', function () {
        return isReplace;
    });

    //阻止右击时系统默认的弹出框
    document.oncontextmenu = function (e) {
        e.preventDefault();
    };

    // 展开或收起大图
    $(".display-bar").click(function () {
        var state = $(this).attr("data-state");
        if (state == "open") {
            hideLeftImg();
        } else {
            showLeftImg();
        }
    });


    //图片tab切换(实样、成品)
    $("#img-tab").on("click", "li", function () {
        $("#img-tab li").removeClass("select-img");
        $(this).addClass("select-img");
        if ($(this).attr("data-id") == 0) {
            $("#dragImg").attr("src", curImg);
        } else
            $("#dragImg").attr("src", "");
    });


    // 显示左侧大图 以及 表格实样列
    function showLeftImg() {
        $(".display-bar").find(".fa").attr("class", "fa fa-angle-double-left");
        $(".big-img-area").css("width", "450px");
        $(".display-bar").attr("data-state", "open");
        //$(".sy-td").show();
    }


    // 隐藏左侧大图 以及 表格实样列
    function hideLeftImg() {
        $(".display-bar").find(".fa").attr("class", "fa fa-angle-double-right");
        $(".big-img-area").css("width", "15px");
        $(".display-bar").attr("data-state", "fold");
        //$(".sy-td").hide();
    }


    // 顶部tab切換
    $(".tab").unbind("click").on("click", "li", function () {
        if (isUpdate()) {
            var val = $(this).attr("data-val");
            $(".tab li").removeClass("selected-this");
            $(this).addClass("selected-this");

            switch (val) {
                case "0":
                    current_tab = 0;
                    $("#check-filter").hide();
                    $("#card-filter").show();
                    //issave = 0 不显示按钮， =1显示按钮
                    if (utils.getUrlParam("issave") == "0") {
                        $("#saveBtn").hide();
                        $("#importFan").hide();
                    } else {
                        $("#saveBtn").show();
                        $("#importFan").show();
                    }
                    if (utils.getUrlParam("issaveforshl") == "0") {
                        $("#importShBtn").hide();
                    } else {
                        $("#importShBtn").show();
                    }
                    $("#data_table").removeClass("checked-table");
                    $("#table-content").show();
                    $("#pdf-content").hide();
                    loadMainForm();
                    loadTableData();
                    break;

                case "1":
                    current_tab = 1;
                    $("#card-filter").hide();
                    $("#check-filter").show();
                    $("#saveBtn").hide();
                    $("#importFan").hide();
                    $("#importShBtn").hide();
                    $("#data_table").removeClass("checked-table");
                    $("#table-content").show();
                    $("#pdf-content").hide();
                    loadMainForm();
                    loadTableData();
                    break;

                case "2":
                    current_tab = 2;
                    $("#check-filter").hide();
                    $("#card-filter").show();
                    $("#saveBtn").hide();
                    $("#importFan").hide();
                    $("#importShBtn").hide();
                    $("#data_table").addClass("checked-table");
                    $("#table-content").show();
                    $("#pdf-content").hide();
                    loadMainForm();
                    loadTableData();
                    break;

                case "3":
                    current_tab = 3;
                    $("#saveBtn").hide();
                    $("#importFan").hide();
                    $("#importShBtn").hide();
                    $("#table-content").hide();
                    $("#pdf-content").show();
                    break;

                default:
                    break;
            }
        } else {
            Ealt.Ealert({
                title: '温馨提示',
                message: "检查到有数据更新，并且未保存。请先保存，以免数据丢失！"
            })
        }

    });



    // 加载明细面板
    function loadMxData() {
        $(".load-txt").text("加载明细中..");
        $(".loading").show();
        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getFabricZhml&source=pc",
            data: JSON.stringify({

            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    $("#mx-list").html(template("tpl_mx", msg));
                    $(".loading").fadeOut(200);

                    firstLoadMx = false;

                } else {
                    $(".load-txt").text(msg.errmsg);
                    firstLoadMx = true;
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);
                firstLoadMx = true;

            }
        }); //end AJAX  
    }


    // 关闭弹出层
    $(".pup-head #pup-close").click(function () {
        $(".pop-up").hide();
    });




    // 加载主表信息
    function loadMainForm() {
        // $(".load-txt").text("加载主表信息中..");
        // $(".loading").show();
        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getBomMainTainZbxx&source=pc",
            data: JSON.stringify({
                "yphh": _yphh,
                "copyyphh": _copyyphh,
                "bm": _bm
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    var info = msg.data;
                    if (info != null && JSON.stringify(info) != "{}") {
                        $(".m-yyh").val(info.yphh);
                        $(".m-ypmc").val(info.ypmc);
                        $(".m-hh").val(info.sphh);
                        $(".m-bhks").val(info.jsbbh);
                        $(".m-bhks").attr("data-id", info.bhks);
                        // $(".m-tsgy").val(info.tsgy);
                        $(".m-fzgj").val(info.yfcb_fzgj);
                        $(".m-sxfy").val(info.yfcl_sx);
                        $(".m-jgbl").val(info.yfcb_jgbl);
                        $(".m-mlcb").val(info.yfcb_ml);
                        $(".m-flcb").val(info.yfcb_qt);
                        $(".m-yf").val(info.yfcl_zb);
                        $(".m-bzwcb").val(info.yfcb_bzw);
                        $(".m-ysfy").val(info.yfcb_jg);
                        $(".m-zcbj").val(info.yfcb_hj);
                        $(".m-sl").val(info.yfcb_sd);
                        $(".m-bz").val(info.yfcb_bz);
                        $(".m-xdff").val(info.xdff);

                        if (info.tsgyList.length != 0) {
                            var html = "<li data-txt=''>请选择</li>";
                            var tsgyArr = info.tsgyList;
                            for (var i = 0; i < tsgyArr.length; i++) {
                                html += "<li data-txt='" + tsgyArr[i].gymc + "'>" + tsgyArr[i].gymc + "</li>";
                            }
                            $("#m-tsgy-ul").html(html);
                            $("#m-tsgy-ul li[data-txt='" + info.tsgy + "']").click();
                        }
                    }

                    //$(".loading").fadeOut(200);

                } else {
                    if (_copyyphh == null || _copyyphh == "") {
                        $(".load-txt").text(msg.errmsg);
                    }
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);


            }
        }); //end AJAX  
    }



    // 版号及款式或领型输入框事件
    function bhksEvent() {
        // 版号及款式或领型回车事件
        $("#i-bhks").keypress(function (evt) {　　
            evt = (evt) ? evt : ((window.event) ? window.event : "");　　
            var key = evt.keyCode ? evt.keyCode : evt.which;　　
            if (key == 13) {　　
                $("#s-bh").val($("#i-bhks").val());
                loadBhksData($("#i-bhks").val());
                $("#bhks-pup").show();
                return false;　　
            }
        });

        //版号及款式或领型右击事件
        document.getElementById("i-bhks").onmouseup = function (oEvent) {
            if (!oEvent) oEvent = window.event;
            if (oEvent.button == 2) {
                $("#s-bh").val($("#i-bhks").val());
                loadBhksData($("#i-bhks").val());
                $("#bhks-pup").show();
            }
        }


        // 点击弹出面板的材料编号或者材料名称
        $("#bh-table").on("click", "a", function () {
            var tr = $(this).parent("td").parent("tr");
            var clmc = tr.find(".clmc-link").text();
            $("#i-bhks").val(clmc);
            $("#i-bhks").attr("data-id", tr.attr("data-id"));

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
            $("#i-bhks").val("");
            $("#i-bhks").attr("data-id", 0)
            $("#bhks-pup").hide();
        });
    }


    // 加载款号版式
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


    //初始化表格FixedTable
    $(".fixed-table-box").fixedTable();
    // 配料卡表格固定列高度初始化，使动态插入数据的时候固定类跟随垂直滚动条滚动
    $("#l-ftable-wrapper").css("height", $(".fixed-table_body-wraper").height() - 20);


    // 加载表格数据
    function loadTableData() {
        inputChange = false;
        $("#saveBtn").removeClass("disabledClick");
        $(".loading").show();
        $(".load-txt").text("正在计算查询相关数据...");

        $("#data_table tbody").html("");
        $("#fixed_table tbody").html("");


        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getOrderByZlmxidForOne&source=pc&yphh=" + _yphh + "&bm=" + _bm + "&copyyphh=" + _copyyphh,
            data: JSON.stringify({

            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    if (msg.data != null) {
                        if (msg.data.bom.length != 0) {
                            initialRec = msg.data.bom.length;
                            $("#data_table tbody").html(template("main_tr", msg.data));
                            $("#fixed_table tbody").html(template("fixed_tr", msg.data));

                            for (var i = 0; i < msg.data.bom.length; i++) {
                                $("#data_table .json-td").eq(i).find("input").val(JSON.stringify(msg.data.bom[i]));
                            }

                            if (utils.getUrlParam("issave") == "0" || current_tab != "0") {
                                $(".cz-td").hide();
                            } else {
                                $(".cz-td").show();
                            }
                            calRecords();
                            calTextareaH();
                        }
                    } else {
                        $.message({
                            message: '暂无数据',
                            type: 'warning'
                        });
                    }


                    $(".fixed-table-box").fixedTable();

                    // 总审核、配料卡无图状态、接收检查 不显示实样单元格
                    // _show = 0配料卡有图 =1配料卡无图 =2总审核 =3接收检查
                    //current_tab = 0配料卡 =1总审核 = 2接收检查

                    switch (_show) {
                        case "0":
                            if (current_tab == 0) {
                                showLeftImg();
                            } else {
                                hideLeftImg();
                            }
                            break;

                        case "1":
                            hideLeftImg();
                            break;

                        case "2":
                            hideLeftImg();
                            break;

                        case "3":
                            hideLeftImg();
                            break;
                        default:
                            break;
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




    //科学计数法转换
    function getFullNum(num) {
        //处理非数字
        if (isNaN(num)) {
            return parseFloat(num);
            //return num;
        };

        //处理不需要转换的数字
        var str = '' + num;
        if (!/e/i.test(str)) {
            return parseFloat(num);
            //return num;
        };

        return (num).toFixed(18).replace(/\.?0+$/, "");
    }


    // --------------------公式计算--------------------

    // 输入研发单价，计算材料成本（材料成本 = 研发单价*（换算值 + 损耗））
    $("#data_table").on("change", ".yfdj-td input", function () {
        var tr = $(this).parent().parent().parent();
        var hsz = tr.find(".hsz-td .table-cell").text();
        var sh = tr.find(".sh-td .table-cell").text();
        if (hsz != null && hsz != undefined && hsz != "") {
            hsz = parseFloat(hsz);
        } else
            hsz = 0;

        if (sh != null && sh != undefined && sh != "") {
            sh = parseFloat(sh);
        } else
            sh = 0;

        var yfdj = $(this).val();
        var clcb = yfdj * (parseFloat(hsz) + parseFloat(sh));
        tr.find(".clcb-td .table-cell").text(utils.formatNumber(clcb, 3));
        calSumclcb();

        inputChange = true;

    });



    //输入样品单耗，计算【换算值】 【损耗】 【标准单耗】 【采购成本】 【材料成本】

    // 标准单耗 = 样品单耗
    // 换算值= 样品单耗 / 换算比例
    // 损耗 = 损耗率 * 换算值
    // 采购成本 = 采购单价 * （换算值 + 损耗）
    // 材料成本 = 研发单价 * （换算值 + 损耗）

    $("#data_table").on("change", ".ypdh-td input", function () {
        var tr = $(this).parent().parent().parent();
        var hsbl = tr.attr("data-hsbl"); //换算比例
        var cgdj = tr.find(".cgdj-td .table-cell").text(); //采购单价
        var shl = tr.find(".shl-td input").val(); //损耗率
        shl = shl == "" ? 0 : parseFloat(shl);

        var yfdj = tr.find(".yfdj-td input").val(); //研发单价

        // 计算值
        var bzdh = utils.formatNumber($(this).val(), 3); //标准单耗
        var hsz = utils.formatNumber(getFullNum($(this).val() / hsbl), 6) //换算值
        var sh = utils.formatNumber(getFullNum(shl * hsz), 6); //损耗
        var cgcb = utils.formatNumber(cgdj * (parseFloat(hsz) + parseFloat(sh)), 3); //采购成本        
        var clcb = utils.formatNumber(yfdj * (parseFloat(hsz) + parseFloat(sh)), 3); //材料成本
        // console.log("损耗：" + sh + "换算值：" + hsz + "换算比例：" + hsbl);
        // console.log(shl * hsz);
        // console.log("损耗率"+ tr.find(".shl-td input").val());
        // 填值
        tr.find(".bzdh-td .table-cell").text(bzdh);
        tr.find(".hsz-td .table-cell").text(hsz);
        tr.find(".sh-td .table-cell").text(sh);
        tr.find(".cgcb-td .table-cell").text(cgcb);
        tr.find(".clcb-td .table-cell").text(clcb);

        calSumclcb();
        calSumdh();

        inputChange = true;
    });


    // 输入损耗率，计算【损耗】 【采购成本】 【材料成本】

    // 损耗 = 损耗率 * 换算值
    // 采购成本 = 采购单价 * （换算值 + 损耗）
    // 材料成本 = 研发单价 * （换算值 + 损耗）
    $("#data_table").on("change", ".shl-td input", function () {
        var tr = $(this).parent().parent().parent();
        var hsz = tr.find(".hsz-td .table-cell").text();
        if (hsz != null && hsz != undefined && hsz != "") {
            hsz = parseFloat(tr.find(".hsz-td .table-cell").text());
        } else
            hsz = 0;

        var cgdj = tr.find(".cgdj-td .table-cell").text(); //采购单价
        var yfdj = tr.find(".yfdj-td input").val(); //研发单价

        // 计算值
        var sh = $(this).val() * hsz; //损耗
        var cgcb = utils.formatNumber(cgdj * (parseFloat(hsz) + parseFloat(sh)), 3); //采购成本
        var clcb = utils.formatNumber(yfdj * (parseFloat(hsz) + parseFloat(sh)), 3); //材料成本

        tr.find(".sh-td .table-cell").text(utils.formatNumber(sh, 6));
        tr.find(".cgcb-td .table-cell").text(cgcb);
        tr.find(".clcb-td .table-cell").text(clcb);

        calSumclcb();

        inputChange = true;

    });





    // 点击实样图 左侧大图显示
    $("#data_table").on("click", ".sy-td", function () {
        curImg = $(this).find("img").attr("src");
        $("#dragImg").attr("src", $(this).find("img").attr("src"));
        $("#img-clbh").text($(this).attr("data-clbh"));
        $("#img-clmc").text($(this).attr("data-clmc"));
        $("#img-cf").text($(this).attr("data-cf"));
        $("#img-kz").text($(this).attr("data-kz"));
        $("#img-fk").text($(this).attr("data-fk"));
        $("#img-kcsl").text($(this).attr("data-kcsl"));
        $("#img-sjsjy").text($(this).attr("data-sjsjy"));
        $("#img-jszdyj").text($(this).attr("data-jszdyj"));

        $("#show3d").attr("href", "http://192.168.35.137/http/public/index.php?s=/oa/material/index&name=" + $(this).attr("data-bjid"));
        $("#btn-cldetail").attr("href", "http://webt.lilang.com:9002/webproject/oa/project/mflpicture/chdmtable.html?chdm=" + $(this).attr("data-clbh"));
    });



    // 扫材料
    $("#scanCl").keypress(function (evt) {　　
        evt = (evt) ? evt : ((window.event) ? window.event : "");　　
        var key = evt.keyCode ? evt.keyCode : evt.which;　　
        if (key == 13) {　
            _tm = $(this).val();
            loadClData(_tm);
            return false;　　
        }
    });


    // 判断页面数据是否有更新，用来切换树时提示用户未保存
    function isUpdate() {
        if (inputChange) {
            return false
        }
        for (var i = 0; i < $("#data_table tr").length; i++) {
            var isNew = $("#data_table tr").eq(i).attr("data-isNew");
            if (isNew == "1") {
                return false
            }
        }
        return true;
    }


    // 保存按钮
    $("#saveBtn").click(function () {
        saveData();
    });


    // 保存检查
    function checkSave() {
        for (var i = 0; i < $("#data_table tbody tr").length; i++) {
            var row = $("#data_table tbody tr[status !='del']").eq(i);
            var bbmc = row.find(".lb-td .table-cell").text();
            var ypdh = row.find(".ypdh-td .table-cell input").val();
            if (_bm == "sp" && ypdh == "" && bbmc != "面料" && bbmc != "里料" && bbmc.indexOf("印花") == -1 && bbmc.indexOf("绣花") == -1) {
                Ealt.Ealert({
                    title: '提示',
                    message: "请检查样品单耗是否填写！【除面料、里料、印花、绣花之外，其他大类样品单耗必填！】"
                })
                return false;
            }
            if (row.find(".sh-td .table-cell").text().indexOf("NaN.undefined") != -1) {
                $.message({
                    message: '损耗栏出现非法值 [NaN.undefined]，请重新填写样品单耗！',
                    type: 'error'
                });
                return false;
            }
        }

        return true;
    }


    // 监听表格行输入框值是否修改
    $("#data_table").on("change", "input", function () {
        $(this).parent().parent().parent().attr("data-isEdit", "1");
    });
    $("#data_table").on("change", "textarea", function () {
        $(this).parent().parent().parent().attr("data-isEdit", "1");
    })




    // 构造保存提交信息
    function postData() {
        var postData = {
            "zb": {},
            "mx": []
        }
        // 主表信息
        postData.zb = {
            "bm": utils.getUrlParam("bm"),
            "yphh": _yphh,
            "ypzlbh": utils.getUrlParam("ypzlbh"),
            "userid": utils.getUrlParam("userid"),
            "yfcb_sd": $(".m-sl").val(), //税率
            //"yfcb_bzw": $(".m-bzwcb").val(), //包装物成本
            // "tsgy": $(".m-tsgy").val(),
            "tsgy": $("#m-tsgy-ul").find(".select-this").attr("data-txt"),
            "sphh": $(".m-hh").val(), //货号
            "yfcl_sx": $(".m-sxfy").val(), //水洗费用
            "yphh": $(".m-yyh").val(), //样衣号
            "yfcb_jg": $(".m-ysfy").val(), //预缩费用
            "yfcb_ml": $(".m-mlcb").val(), //面料成本
            "bhks": $(".m-bhks").attr("data-id"), //版号及款式id
            "yfcl_zb": $(".m-yf").val(), //运费
            "yfcb_hj": $(".m-zcbj").val(), //总成本价
            "ypmc": $(".m-ypmc").val(), //样品名称
            "yfcb_fzgj": $(".m-fzgj").val(), //缝制工价
            "yfcb_qt": $(".m-flcb").val(), //辅料成本
            "yfcb_jgbl": $(".m-jgbl").val(), //加工倍率
            "yfcb_bz": $(".m-bz").val(), //备注，隐藏字段
            "xdff": $(".m-xdff").val() //洗涤方式
        };
        // 表格信息
        if (_copyyphh == null || _copyyphh == "") {
            for (var i = 0; i < $("#data_table tbody tr").length; i++) {
                var row = $("#data_table tbody tr").eq(i);
                var chdm = row.find(".clbh-td .table-cell a").text();
                var cmfj = row.find(".cmfj-td").attr("data-id");
                var yfcwdj = row.find(".yfdj-td input").val();
                var cfbl = row.find(".cfbl-td .table-cell").text();
                var fk = row.find(".bjfk-td .table-cell").text();
                var sybw = row.find(".sybw-td textarea").val();
                var hsz = row.find(".hsz-td .table-cell").text();
                var yfcwsh = row.find(".sh-td .table-cell").text();
                var dw = row.find(".hsh-td .table-cell").text();
                var chmc = row.find(".clmc-td .table-cell").text();
                var yfdw = row.find(".hsq-td .table-cell").text();
                var ys = row.find(".ys-td .table-cell").text();
                var id = row.attr("data-id");
                var ord = row.attr("data-lb");
                var kez = row.find(".bjkz-td .table-cell").text();
                var ypdh = row.find(".ypdh-td .table-cell input").val();
                var dhdj = row.find(".cgdj-td .table-cell").text();
                var jfk = row.find(".sjfk-td .table-cell").text();
                var yphh = _yphh;
                var sjkez = row.find(".sjkz-td .table-cell").text();
                var bzdh = row.find(".bzdh-td .table-cell").text();
                var zhmlid = row.attr("data-zhmlid");
                var zhml = row.find(".mx-td .table-cell").text();
                var bbmc = row.find(".lb-td .table-cell").text();
                var tp = row.find(".sy-td img").attr("src");
                var lydjlx = row.attr("data-bm");
                var yfcwshbl = row.find(".shl-td input").val();
                var yfcwdj = row.find(".yfdj-td .table-cell input").val();
                var dj = row.attr("data-dj");
                var hsbl = row.attr("data-hsbl");
                var status = row.attr("status");
                var sjlx = row.attr("data-sjlx");
                var xh = row.attr("data-xh");
                // var ssl = row.find(".ssl-td .table-cell").text();
                var isnew = row.attr("data-isNew");
                var isedit = row.attr("data-isEdit");

                postData.mx.push({
                    "chdm": chdm,
                    "cmfj": cmfj,
                    "yfcwdj": yfcwdj,
                    "cfbl": cfbl,
                    "fk": fk,
                    "sybw": sybw,
                    "hsz": hsz,
                    "yfcwsh": yfcwsh,
                    "dw": dw,
                    "chmc": chmc,
                    "yfdw": yfdw,
                    "ys": ys,
                    "id": id,
                    "ord": ord,
                    "kez": kez,
                    "ypdh": ypdh,
                    "dhdj": dhdj,
                    "jfk": jfk,
                    "sjkez": sjkez,
                    "bzdh": bzdh,
                    "zhmlid": zhmlid,
                    "zhml": zhml,
                    "bbmc": bbmc,
                    "tp": tp,
                    "yfcwshbl": yfcwshbl,
                    "lydjlx": lydjlx,
                    "yfcwdj": yfcwdj,
                    "dj": dj,
                    "hsbl": hsbl,
                    "status": status,
                    "sjlx": sjlx,
                    "xh": xh,
                    // "ssl": ssl,
                    "isnew": isnew,
                    "isedit": isedit
                })
            }
        } else {
            //当copyyphh参数有值时，只保存已确认的表格行数据
            for (var i = 0; i < $("#data_table tbody tr[data-sure='1']").length; i++) {
                var row = $("#data_table tbody tr[data-sure='1']").eq(i);
                var chdm = row.find(".clbh-td .table-cell a").text();
                var cmfj = row.find(".cmfj-td").attr("data-id");
                var yfcwdj = row.find(".yfdj-td input").val();
                var cfbl = row.find(".cfbl-td .table-cell").text();
                var fk = row.find(".bjfk-td .table-cell").text();
                var sybw = row.find(".sybw-td textarea").val();
                var hsz = row.find(".hsz-td .table-cell").text();
                var yfcwsh = row.find(".sh-td .table-cell").text();
                var dw = row.find(".hsh-td .table-cell").text();
                var chmc = row.find(".clmc-td .table-cell").text();
                var yfdw = row.find(".hsq-td .table-cell").text();
                var ys = row.find(".ys-td .table-cell").text();
                var id = row.attr("data-id");
                var ord = row.attr("data-lb");
                var kez = row.find(".bjkz-td .table-cell").text();
                var ypdh = row.find(".ypdh-td .table-cell input").val();
                var dhdj = row.find(".cgdj-td .table-cell").text();
                var jfk = row.find(".sjfk-td .table-cell").text();
                var yphh = _yphh;
                var sjkez = row.find(".sjkz-td .table-cell").text();
                var bzdh = row.find(".bzdh-td .table-cell").text();
                var zhmlid = row.attr("data-zhmlid");
                var zhml = row.find(".mx-td .table-cell").text();
                var bbmc = row.find(".lb-td .table-cell").text();
                var tp = row.find(".sy-td img").attr("src");
                var lydjlx = row.attr("data-bm");
                var yfcwshbl = row.find(".shl-td input").val();
                var yfcwdj = row.find(".yfdj-td .table-cell input").val();
                var dj = row.attr("data-dj");
                var hsbl = row.attr("data-hsbl");
                var status = row.attr("status");
                var sjlx = row.attr("data-sjlx");
                var xh = row.attr("data-xh");
                // var ssl = row.find(".ssl-td .table-cell").text();
                var isnew = row.attr("data-isNew");
                var isedit = row.attr("data-isEdit");

                postData.mx.push({
                    "chdm": chdm,
                    "cmfj": cmfj,
                    "yfcwdj": yfcwdj,
                    "cfbl": cfbl,
                    "fk": fk,
                    "sybw": sybw,
                    "hsz": hsz,
                    "yfcwsh": yfcwsh,
                    "dw": dw,
                    "chmc": chmc,
                    "yfdw": yfdw,
                    "ys": ys,
                    "id": id,
                    "ord": ord,
                    "kez": kez,
                    "ypdh": ypdh,
                    "dhdj": dhdj,
                    "jfk": jfk,
                    "sjkez": sjkez,
                    "bzdh": bzdh,
                    "zhmlid": zhmlid,
                    "zhml": zhml,
                    "bbmc": bbmc,
                    "tp": tp,
                    "yfcwshbl": yfcwshbl,
                    "lydjlx": lydjlx,
                    "yfcwdj": yfcwdj,
                    "dj": dj,
                    "hsbl": hsbl,
                    "status": status,
                    "sjlx": sjlx,
                    "xh": xh,
                    // "ssl": ssl,
                    "isnew": isnew,
                    "isedit": isedit
                })
            }
        }

        //console.log(JSON.stringify(postData));
        return postData;
    }


    // 配料卡保存接口
    function saveData() {
        if (checkSave()) {
            //_copyyphh复制样号有值时，点保存返回表单页面
            if (_copyyphh != "" && _copyyphh != null) {
                //复制配料卡保存时，已确认的个数必须和原表格的总记录数一致！
                if ($("#data_table tbody tr[data-sure='1']").length != initialRec) {
                    Ealt.Ealert({
                        title: '提示',
                        message: "当前已确认个数【" + $("#data_table tbody tr[data-sure='1']").length + "】和复制前个数【" + initialRec + "】不一致！请检查！"
                    })
                } else {
                    window.parent.document.getElementById("bom").value = JSON.stringify(postData());
                    $(window.parent.document.getElementById("plk-pup")).hide();
                }

            } else {

                //调用父层iframe的saveDataCheck(jsonObj)进行判断，如果返回true才调用保存接口
                if (window.parent.saveDataCheck(postData())) {

                    $("#saveBtn").addClass("disabledClick");
                    $(".loading").show();
                    $(".load-txt").text("正在保存...");

                    $.ajax({
                        type: "POST",
                        timeout: 300 * 1000,
                        contentType: "application/json",
                        url: api + "?action=saveZlmxidInfoByZlmxid&source=pc",
                        data: JSON.stringify(postData()),
                        success: function (msg) {
                            if (msg.errcode == "0") {

                                $(".loading").fadeOut(200);
                                setTimeout(function () {
                                    $.message('保存成功！');
                                    setTimeout(function () {
                                        _copyyphh = "";
                                        loadMainForm();
                                        loadTableData();
                                    }, 2000);
                                }, 200);

                                inputChange = false;

                            } else {
                                //$(".load-txt").text(msg.errmsg);
                                $("#saveBtn").removeClass("disabledClick");
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
                            $("#saveBtn").removeClass("disabledClick");
                            $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

                        }
                    }); //end AJAX  
                }
            }

        }
    }


    //表格行【已确认/未确认】按钮（当URL有参数copyyphh时才会显示此按钮）
    $("#data_table").on("click", ".qr-btn", function () {
        var issure = $(this).attr("data-sure");
        var tr = $(this).parent(".table-cell").parent(".cz-td").parent("tr");
        switch (issure) {
            case "0":
                $(this).attr("data-sure", "1");
                $(this).text("已确认");
                tr.attr("data-sure", "1");
                tr.css("background-color", "#fff");
                break;
            case "1":
                $(this).attr("data-sure", "0");
                $(this).text("确认");
                tr.attr("data-sure", "0");
                tr.css("background-color", "#faf5d6");
                break;
            default:
                break;
        }
    });


    //表格行【替换/已替换】按钮（当URL有参数copyyphh时才会显示此按钮）
    $("#data_table").on("click", ".replace-btn", function () {
        var tr = $(this).parent(".table-cell").parent(".cz-td").parent("tr");
        tr.attr("data-sure", "0");
        tr.find("td:not(.cz-td) .table-cell").text("");
        tr.css("background-color", "#faf5d6");
        tr.attr("data-sure", "0");
        tr.find(".qr-btn").text("确认");
        tr.find(".qr-btn").attr("data-sure", "0");

        $("#scanCl").val("").focus();
        isReplace = true;
        replaceOrd = tr.index();
    });


    // 表格行【删除】按钮
    $("#data_table").on("click", ".del-btn", function () {
        var row = $(this).parent().parent().parent("tr");
        var sjlx = row.attr("data-sjlx");
        var lydjlx = row.attr("data-bm");
        var bm = utils.getUrlParam("bm");
        // 商品中心
        if (bm == "sp") {
            if (row.attr("data-isNew") == 1) {
                Ealt.Econfirm({
                    title: '提示',
                    message: '确定删除该材料吗?',
                    define: function () {
                        row.remove();
                        calRecords();
                    },
                    cancel: function () {

                    }
                })
            } else {
                if (sjlx != "1" && sjlx != "2" && lydjlx == "1") {
                    Ealt.Econfirm({
                        title: '提示',
                        message: '确定删除该材料吗?',
                        define: function () {
                            row.hide();
                            row.attr("status", "del");
                            calRecords();
                        },
                        cancel: function () {

                        }
                    })
                } else {
                    Ealt.Ealert({
                        title: '提示',
                        message: "不能删除该材料！【该材料可能不是本部门维护的，或者数据类型不支持】"
                    })
                }
            }
        } else {

            if (row.attr("data-isNew") == 1) {
                Ealt.Econfirm({
                    title: '提示',
                    message: '确定删除该材料吗?',
                    define: function () {
                        row.remove();
                        calRecords();
                    },
                    cancel: function () {

                    }
                })
            } else {
                if (sjlx != "1" && sjlx != "2" && lydjlx != "1") {
                    Ealt.Econfirm({
                        title: '提示',
                        message: '确定删除该材料吗?',
                        define: function () {
                            row.hide();
                            row.attr("status", "del");
                            calRecords();
                        },
                        cancel: function () {

                        }
                    })
                } else {
                    Ealt.Ealert({
                        title: '提示',
                        message: "不能删除该材料！【该材料可能不是本部门维护的，或者数据类型不支持】"
                    })
                }

            }
        }

    });


    // 按刷退时聚焦到扫描框
    $("#delCheck").change(function () {
        if ($("#delCheck").attr("checked") == "checked") {
            $("#scanCl").focus()
        }
    })



    // 扫多个材料递归回调
    function add(i, obj) {
        //console.warn("add-->", i, obj[i].zhmlid, obj[i].zhmlid == null);
        $("#dragImg").attr("src", obj[i].tp);
        $("#img-clbh").text(obj[i].chdm);
        $("#img-clmc").text(obj[i].chmc);
        $("#img-cf").text(obj[i].cfbl);
        $("#img-kz").text(obj[i].kez);
        $("#img-fk").text(obj[i].fk);
        $("#img-kcsl").text(obj[i].kcsl);
        if (obj[i].hasOwnProperty("sjsjy")) {
            $("#img-sjsjy").text(obj[i].sjsjy);
        }
        if (obj[i].hasOwnProperty("jszdyj")) {
            $("#img-jszdyj").text(obj[i].jszdyj);
        }

        $("#show3d").attr("href", "http://192.168.35.137/http/public/index.php?s=/oa/material/index&name=" + obj[i].bjid);
        $("#btn-cldetail").attr("href", "http://webt.lilang.com:9002/webproject/oa/project/mflpicture/chdmtable.html?chdm=" + obj[i].chdm);

        // 当明细Id为空时，弹出面板选择明细
        if (obj[i].zhmlid == null) {
            $("#scanCl").blur();
            if (firstLoadMx) {
                loadMxData();
            }
            $("#mx-pup .clbh span").text(obj[i].chdm);
            $("#mx-pup").show();

            // 点击明细项
            $("#mx-list").unbind("click").on("click", "li", function () {

                obj[i].zhmlid = $(this).attr("data-mxid");
                obj[i].ord = $(this).attr("data-ord");
                obj[i].bbmc = $(this).attr("data-bbmc");
                obj[i].zhml = $(this).attr("data-zhml");
                $(".pop-up").hide();

                //insertRow(obj[i]);
                insertRowNoSort(obj[i]);

                if (i < obj.length - 1) {
                    add(++i, obj);
                }

            });
        } else {

            //insertRow(obj[i]);
            insertRowNoSort(obj[i]);
            if (i < obj.length - 1) {
                add(++i, obj);
            }
        }

    }



    // 扫材料加载材料数据
    function loadClData(val) {
        $(".load-txt").text("加载材料数据中...");
        $(".loading").show();
        if (_yphh == null || _yphh == "") {
            var url = api + "?action=getOneFabricInfo&source=pc&yphh=" + _copyyphh;
        } else {
            var url = api + "?action=getOneFabricInfo&source=pc&yphh=" + _yphh
        }

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: url,
            data: JSON.stringify({
                "tm": val
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    if (msg.data != null && msg.data.length != 0) {
                        // 刷退材料时只能删除同个部门录入的数据，或者新刷的材料（data-isNew="1"),新增的材料直接删除，保存过的数据添加'status':'del'标识
                        if ($("#delCheck").attr("checked") == "checked") {
                            if (Object.prototype.toString.call(msg.data) == '[object Array]') {
                                $(".load-txt").text("查找数据中...");
                                var current_bm = utils.getUrlParam("bm");
                                var del_bh = msg.data[0].chdm;
                                var delRows = dtable.find("tr[data-chdm='" + del_bh + "']"),
                                    f_delRows = ftable.find("tr[data-chdm='" + del_bh + "']");

                                if (delRows.length != 0) {
                                    // 当部门为商品中心时，只能删除lydjlx == 1的表格行
                                    if (current_bm == "sp") {
                                        for (var i = 0; i < delRows.length; i++) {
                                            var sjlx = $(delRows[i]).attr("data-sjlx");
                                            if ($(delRows[i]).attr("data-isNew") == 1) {
                                                $(delRows[i]).remove();
                                                setTimeout(function () {
                                                    $.message('刷退成功！');
                                                    calRecords();
                                                }, 200);
                                            } else {
                                                if ($(delRows[i]).attr("data-bm") == "1" && sjlx != "1" && sjlx != "2") {
                                                    $(delRows[i]).hide();
                                                    $(delRows[i]).attr("status", "del");
                                                    setTimeout(function () {
                                                        $.message('刷退成功！');
                                                        calRecords();
                                                    }, 200);
                                                } else {
                                                    setTimeout(function () {
                                                        $.message({
                                                            message: '不能删除该材料！【该材料不是当前部门录入的或者数据类型不支持】',
                                                            type: 'warning'
                                                        });
                                                    }, 200);
                                                }
                                            }
                                        }

                                        // 当部门为技术部时，只能删除lydjlx != 1的表格行
                                    } else {

                                        for (var i = 0; i < delRows.length; i++) {
                                            var sjlx = $(delRows[i]).attr("data-sjlx");
                                            var bm = $(delRows[i]).attr("data-bm");
                                            if ($(delRows[i]).attr("data-isNew") == 1) {
                                                $(delRows[i]).remove();
                                                setTimeout(function () {
                                                    $.message('刷退成功！');
                                                    calRecords();
                                                }, 200);
                                            } else {
                                                if (sjlx != "1" && sjlx != "2" && bm != "1") {
                                                    $(delRows[i]).hide();
                                                    $(delRows[i]).attr("status", "del");
                                                    setTimeout(function () {
                                                        $.message('刷退成功！');
                                                        calRecords();
                                                    }, 200);
                                                } else {
                                                    setTimeout(function () {
                                                        $.message({
                                                            message: '不能删除该材料！【该材料不是当前部门录入的或者数据类型不支持】',
                                                            type: 'warning'
                                                        });
                                                    }, 200);
                                                }
                                            }
                                        }
                                    }
                                    $(".loading").fadeOut(200);

                                } else {
                                    $(".loading").fadeOut(200);
                                    setTimeout(function () {
                                        $.message({
                                            message: '没有找到相应材料！',
                                            type: 'warning'
                                        });
                                    }, 200);
                                }

                            } else {
                                $(".loading").fadeOut(200);
                                setTimeout(function () {
                                    $.message({
                                        message: '该材料不支持刷退！',
                                        type: 'warning'
                                    });
                                }, 200);
                            }
                            $("#scanCl").val("");
                        } else {
                            // 配料卡模块时才插入数据行，接收检查时，不插入数据行
                            if (current_tab == 0) {

                                //msg.data.push(JSON.parse(JSON.stringify(msg.data[0])));
                                //如果返回的obj是数组，则直接插入数据或选择大类和明细类型后插入数据；
                                if (Object.prototype.toString.call(msg.data) == '[object Array]') {
                                    if (msg.data.length != 0) {

                                        $(".load-txt").text("添加材料中...");

                                        chdmArr = msg.data;
                                        add(0, chdmArr);

                                        $(".loading").fadeOut(200);

                                    } else {
                                        $.message({
                                            message: '该材料数据为空！',
                                            type: 'warning'
                                        });
                                    }
                                    //如果返回的obj是JSON对象，则弹出图片选择层，选择图片后再插入数据
                                } else {
                                    $("#imgchoose-pup").show();
                                    $("#pupsh-input").val("请选择");
                                    $("#pupgg-input").val("请选择");
                                    var shhtml = "<li>请选择</li>";
                                    var gghtml = "<li>请选择</li>";
                                    for (var i = 0; i < msg.data.sh.length; i++) {
                                        shhtml += "<li>" + msg.data.sh[i] + "</li>"
                                    }
                                    $("#pupsh-sel").html(shhtml);

                                    for (var i = 0; i < msg.data.gg.length; i++) {
                                        gghtml += "<li>" + msg.data.gg[i] + "</li>"
                                    }
                                    $("#pupgg-sel").html(gghtml);

                                    loadImg();
                                }

                            } else {

                                //接收检查模块暂时隐藏
                                $(".load-txt").text("检查对应数据中...");
                                var check_bh = msg.data[0].chdm;
                                var delRows = dtable.find("tr[data-chdm='" + check_bh + "']"),
                                    f_delRows = ftable.find("tr[data-chdm='" + check_bh + "']");

                                if (delRows.length != 0) {
                                    if ($(delRows).eq(0).find("td[isChecked!=1]").length != 0) {
                                        $(delRows).eq(0).find("td[isChecked!=1]").css("background-color", "#fff");
                                        $(delRows).eq(0).find("td").attr("isChecked", "1");
                                        $(".loading").fadeOut(200);
                                        setTimeout(function () {
                                            $.message('检查成功！');
                                        }, 200);
                                    } else {
                                        $(".loading").fadeOut(200);
                                        setTimeout(function () {
                                            Ealt.Ealert({
                                                title: '提示',
                                                message: "剩余未检查的数据中没有找到相应材料：" + check_bh
                                            })
                                            //alert("剩余未检查的数据中没有找到相应材料：" + check_bh);
                                        }, 200);
                                    }

                                } else {

                                    $(".loading").fadeOut(200);
                                    setTimeout(function () {
                                        //alert("没有找到相应材料：" + check_bh);
                                        Ealt.Ealert({
                                            title: '提示',
                                            message: "没有找到相应材料：" + check_bh
                                        })
                                    }, 200);
                                }

                            }


                            $("#scanCl").val("");

                        }
                    } else {
                        $(".loading").fadeOut(200);
                        setTimeout(function () {
                            $.message({
                                message: '该材料暂无数据',
                                type: 'warning'
                            });
                        }, 200);
                    }

                } else {
                    $(".load-txt").text("【温馨提示：请检查输入法！必须为英文状态】" + msg.errmsg);
                    $("#scanCl").val("");
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);
                $("#scanCl").val("");

            }
        }); //end AJAX  

    }


    // 动态插入数据（不排序直接插到表格第一行）
    function insertRowNoSort(data) {
        var row = "";
        row = template("scan_main_tr", data);
        if (isReplace) {
            // 如果是最后一个材料
            if (replaceOrd == $("#data_table tr[status !='del']").length - 1) {
                dtable.find("tbody tr").eq(replaceOrd).remove();
                dtable.find("tbody").append(row);
            } else {
                dtable.find("tbody tr").eq(replaceOrd).remove();
                dtable.find("tbody tr").eq(replaceOrd).before(row);
            }
            calTextareaH();

            $(".loading").fadeOut(200);
            setTimeout(function () {
                $.message('替换成功！');
                $("#scanCl").focus();
                isReplace = false;
                calRecords();
            }, 200);
        } else {
            dtable.find("tbody").prepend(row);
            calTextareaH();

            $(".loading").fadeOut(200);
            setTimeout(function () {
                $.message('添加成功！');
                $("#scanCl").focus();
                calRecords();
            }, 200);
        }


    }


    //动态插入数据（先按部门类型排序，再按大类排序，再按明细排序）
    function insertRow(data) {

        var ldx = data.ord; //大类排序id
        var mx = data.zhml; //明细内容
        //部门类型（是技术部或者商品中心）
        if (utils.getUrlParam("bm") == "sp") {
            var group = "1";
        } else {
            var group = "-1";
        }

        var data1 = "";
        var data2 = "";
        data1 = template("scan_main_tr", data);
        data2 = template("scan_fixed_tr", data);


        var rows = dtable.find("tr");
        var idx = -1,
            direction = -1;

        // 表格为空的时候
        if (rows.length == 0) {
            dtable.find("tbody").append(data1);
            setTimeout(function () {
                $.message('添加成功！');
                $("#scanCl").focus();
                calRecords();
            }, 200);
            return;
        }

        //先处理相等的情况
        if (dtable.find("tr[data-lb='" + ldx + "'][bmlx='" + group + "'][status!='del']").length > 0) {
            rows = dtable.find("tr[data-lb='" + ldx + "'][bmlx='" + group + "'][status!='del']");

            for (var i = 0; i < rows.length; i++) {
                var _row = $(rows[i]);

                var _mx = _row.find("td:nth-child(3) .table-cell").html();
                if (_mx == mx) {
                    idx = i;
                    direction = 1;
                }
            } //end for

            if (idx > -1 && direction > -1) {
                _row = $(rows[idx]);

                if (direction == 0) {
                    _row.before(data1);

                } else {
                    _row.after(data1);

                }
                setTimeout(function () {
                    $.message('添加成功！');
                    $("#scanCl").focus();
                    calRecords();
                }, 200);

                return;
            }

            $(rows[rows.length - 1]).after(data1);

            setTimeout(function () {
                $.message('添加成功！');
                $("#scanCl").focus();
                calRecords();
            }, 200);

            return;
        }

        for (var i = 0; i < rows.length; i++) {
            if (rows[i].getAttribute("bmlx") != group) continue;
            if (ldx < Number(rows[i].getAttribute("data-lb"))) {
                idx = i;
                direction = 0;
                break;
            } else {
                idx = i;
                direction = 1;
            }
        } //end for

        if (idx > -1 && direction > -1) {
            _row = $(rows[idx]);

            if (direction == 0) {
                _row.before(data1);

            } else {
                _row.after(data1);

            }

            setTimeout(function () {
                $.message('添加成功！');
                $("#scanCl").focus();
                calRecords();
            }, 200);

            return;
        }

        $(rows[rows.length - 1]).after(data1);


        setTimeout(function () {
            $.message('添加成功！');
            $("#scanCl").focus();
            calRecords();
        }, 200);

        //console.log(rows)
    }



    // 确定添加按钮——材料选择弹出层(选择材料图片后添加)
    $("#addClBtn").click(function () {
        var selectImg = $(".climglist .selected-img");
        if (selectImg.length == 0) {
            $.message({
                message: '请至少选择一种材料！',
                type: 'warning'
            });
        } else {
            $("#imgchoose-pup").hide();
            $(".loading").show();
            $(".load-txt").text("正在添加材料...");
            var row = "";
            for (var i = 0; i < selectImg.length; i++) {
                var data = JSON.parse(selectImg.eq(i).find("input").val());
                row += template("scan_main_tr", data);
            }

            dtable.find("tbody").prepend(row);
            calTextareaH();
            calRecords();
            $(".loading").fadeOut(200);
            setTimeout(function () {
                $.message('添加成功！');
            }, 200);
        }
    });



    // 查询按钮——材料选择弹出层 
    $("#imgSearchBtn").click(function () {
        loadImg();
    });



    // 加载材料图片
    function loadImg() {
        $(".loading").show();
        $(".load-txt").text("正在加载图片...");
        $(".climglist").html("");
        $(".selected-imgnum span").text("0");
        var sh = $("#pupsh-input").val() == "请选择" ? "" : $("#pupsh-input").val();
        var gg = $("#pupgg-input").val() == "请选择" ? "" : $("#pupgg-input").val();

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getFabricInfoXL&source=pc&yphh=" + _yphh,
            data: JSON.stringify({
                "tm": _tm,
                "gg": gg,
                "sh": sh
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    if (msg.data.length != 0 && msg.data != null) {
                        $(".climglist").html(template("tpl_imglist", msg));
                        for (var i = 0; i < msg.data.length; i++) {
                            $(".pup-img-item").eq(i).find("input").val(JSON.stringify(msg.data[i]));
                        }
                        $(".loading").fadeOut(200);

                    } else {
                        $(".loading").fadeOut(200);
                        setTimeout(function () {
                            $.message({
                                message: '暂无数据',
                                type: 'warning'
                            });

                        }, 200)
                    }

                } else {
                    $(".load-txt").text(msg.errmsg);
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX  
    }


    //材料图片弹出层选择
    $(".climglist").on("click", ".pup-img-item", function () {
        if ($(this).hasClass("selected-img")) {
            $(this).removeClass("selected-img");
        } else {
            $(this).addClass("selected-img");
        }
        $(".selected-imgnum span").text($(".climglist .selected-img").length);
    })



    // 导入损耗率（计算 损耗=换算值*损耗率  采购成本=采购单价*（换算值+损耗） 材料成本=研发单价*（换算值+损耗） 数据类型sjlx == 1 || sjlx == 2是外贴的、指定采购所以不能更改损耗）
    $("#importShBtn").click(function () {
        importShl();
    });

    function importShl() {

        $(".loading").show();
        $(".load-txt").text("正在导入损耗率...");

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getChlbShblListByYphh&source=pc",
            data: JSON.stringify({
                yphh: _yphh
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    if (msg.data.length != 0 && msg.data != null) {
                        var alltr = [];
                        for (var i = 0; i < msg.data.length; i++) {
                            var xjchlbid = msg.data[i].xjchlbid;
                            var shbl = msg.data[i].shbl;
                            var matchTr = $("#data_table").find("tr[data-xjchlbid='" + xjchlbid + "']");
                            if (matchTr.size() != 0) {
                                alltr.push(matchTr);

                                for (var j = 0; j < matchTr.length; j++) {
                                    $(matchTr[j]).find(".shl-td input").val(shbl); //导入损耗率
                                    var sjlx = $(matchTr[j]).attr("data-sjlx"); //数据类型

                                    // 计算公式
                                    var hsz = $(matchTr[j]).find(".hsz-td .table-cell").text(); //换算值
                                    hsz = hsz == "" ? 0 : parseFloat(hsz);
                                    var cgdj = $(matchTr[j]).find(".cgdj-td .table-cell").text(); //采购单价
                                    var yfdj = $(matchTr[j]).find(".yfdj-td input").val(); //研发单价
                                    var sh = parseFloat(utils.formatNumber(hsz * shbl, 6)); //损耗
                                    var cgcb = utils.formatNumber(cgdj * (parseFloat(hsz) + parseFloat(sh)), 3); //采购成本
                                    var clcb = utils.formatNumber(yfdj * (parseFloat(hsz) + parseFloat(sh)), 3); //材料成本

                                    if (sjlx != "1" && sjlx != "2") {
                                        $(matchTr[j]).find(".sh-td .table-cell").text(sh);
                                        $(matchTr[j]).find(".cgcb-td .table-cell").text(cgcb);
                                        $(matchTr[j]).find(".clcb-td .table-cell").text(clcb);

                                        calSumclcb();
                                    }

                                }
                            }
                        }

                        $(".loading").fadeOut(200);
                        if (alltr.length != 0) {
                            setTimeout(function () {
                                $.message('成功导入损耗率！');
                            }, 200)
                        } else {
                            setTimeout(function () {
                                $.message({
                                    message: '没有可匹配的材料可以导入对应损耗率',
                                    type: 'warning'
                                });

                            }, 200)
                        }

                    } else {
                        $(".loading").fadeOut(200);
                        setTimeout(function () {
                            $.message({
                                message: '获取材料类别损耗比例列表，查询记录为空',
                                type: 'warning'
                            });

                        }, 200)
                    }

                } else {
                    $(".load-txt").text(msg.errmsg);
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX  
    }


    // 导入方案
    $("#importFan").click(function () {
        $("#fan-pup").show();
        $(".load-txt").text("加载方案中...");
        $(".loading").show();

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=getPkgSchemeByYphh&source=pc",
            data: JSON.stringify({
                yphh: _yphh
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    if (msg.data.length != 0 && msg.data != null) {
                        $("#fan-table tbody").html(template("tpl_fan", msg));
                    } else {
                        $("#fan-table tbody").html('<tr><td colspan="2">暂无数据</td></tr>');
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

    });



    // 选择并保存方案
    $("#fan-table").on("click", ".fan-link", function () {
        $("#fan-pup").hide();
        $(".load-txt").text("方案保存中...");
        $(".loading").show();

        $.ajax({
            type: "POST",
            timeout: 150 * 1000,
            contentType: "application/json",
            url: api + "?action=savePkgScChdmInfo&source=pc",
            data: JSON.stringify({
                yphh: _yphh,
                faid: $(this).attr("data-faid")
            }),
            success: function (msg) {
                if (msg.errcode == "0") {
                    $(".loading").fadeOut(200);
                    setTimeout(function () {
                        $.message({
                            message: '方案保存成功',
                            type: 'success'
                        });
                        loadMainForm();
                        loadTableData();
                    }, 200);

                } else {
                    $(".load-txt").text(msg.errmsg);
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);

            }
        }); //end AJAX  
    });



    // 点击报价查看
    $("#data_table").on("click", ".bj-td a", function () {
        var chdm = $(this).parent().parent().parent().attr("data-chdm");
        window.parent.cxbj(chdm);
    });


    // 点击尺码分解
    $("#data_table").on("click", ".cmfj-td a", function () {
        var id = $(this).parent().parent().parent().attr("data-id");
        var obj = $(this)[0];
        window.parent.cmfj(id, obj);
    });


    // 点击大类
    $("#data_table").on("click", ".lb-td .link", function () {
        var obj = JSON.parse($(this).parent().siblings(".json-td").find("input").val());
        window.parent.flink('dl', obj);
    });


    // 计算表格行的记录数
    function calRecords() {
        var len = $("#data_table tr[status !='del']").length;
        var sjslen = $("#data_table tr[bmlx ='1'][status !='del']").length;
        $("#table-records").text(len);
        $("#sjs-records").text(sjslen);
        $("#jsb-records").text(len - sjslen);

        calSumclcb();
        calSumdh();
    }


    // 计算总材料成本
    function calSumclcb() {
        var len = $("#data_table tr[status !='del']").length;
        var sum_clcb = 0;
        for (var i = 0; i < len; i++) {
            var clcb = $("#data_table tr[status !='del']").eq(i).find(".clcb-td .table-cell").text();
            clcb = clcb == "" ? 0 : clcb;
            sum_clcb += parseFloat(clcb);
        }
        $("#total-clcb").text(utils.formatNumber(sum_clcb, 3));
    }


    // 计算单耗汇总
    function calSumdh() {
        var len = $("#data_table tr[status !='del']").length;
        var sum_dh = 0;
        for (var i = 0; i < len; i++) {
            var dh = $("#data_table tr[status !='del']").eq(i).find(".ypdh-td input").val();

            dh = dh == "" ? 0 : dh == undefined ? 0 : dh;
            sum_dh += parseFloat(dh);
        }
        $("#total-dh").text(utils.formatNumber(sum_dh, 3));
    }

    // 点击loading框，loading框消失
    $(".loading").on("click", function () {
        $(this).hide();
    })


    // 右击研发单价，出现功能选择菜单
    $("#data_table").on("mousedown", ".yfdj-td", function (e) {
        var leftedge = e.clientX;
        var topedge = e.clientY;
        var tr = $(this).parent();
        var clbh = tr.find(".clbh-td a").text();
        var hsz = tr.find(".hsz-td .table-cell").text();
        var sh = tr.find(".sh-td .table-cell").text();
        var trdata = {
            "clbh": clbh,
            "hsz": hsz,
            "sh": sh
        }

        if (e.which == 3) {
            $("#rclick-menu").css({
                "top": topedge,
                "left": leftedge
            });
            $("#rclick-menu").show();

            refreshYfdjEvt(trdata, $(this));
        }

    });


    // 右键表格行菜单，点击对应功能
    function refreshYfdjEvt(trdata, obj) {

        // 刷新研发单价, 计算材料成本（材料成本 = 研发单价 * （换算值 + 损耗））
        $("#addYfdj").unbind().click(function () {
            $("#rclick-menu").hide();

            $(".load-txt").text("正在刷新研发单价...");
            $(".loading").show();

            $.ajax({
                type: "POST",
                timeout: 150 * 1000,
                contentType: "application/json",
                url: api + "?action=getOneFabricInfo&source=pc&yphh=" + _yphh,
                data: JSON.stringify({
                    "tm": "chdm:" + trdata.clbh
                }),
                success: function (msg) {
                    if (msg.errcode == "0") {
                        if (msg.data != null && msg.data.length != 0) {
                            var clcb = msg.data[0].yfcwdj * (parseFloat(trdata.hsz) + parseFloat(trdata.sh));
                            obj.find("input").val(msg.data[0].yfcwdj);
                            obj.parent().find(".clcb-td .table-cell").text(utils.formatNumber(clcb, 3));
                            calSumclcb();

                            $.message({
                                message: '研发单价刷新成功',
                                type: 'success'
                            });
                        } else
                            $.message({
                                message: "返回数据为空！",
                                type: 'warning'
                            });

                    } else {
                        $.message({
                            message: msg.errmsg,
                            type: 'error'
                        });
                    }
                    $(".loading").fadeOut(200);

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $(".load-txt").text(XMLHttpRequest.status + " | " + textStatus);


                }
            }); //end AJAX  
        })
    }


    $(".page").mousedown(function (e) {
        //右键为3, 左键为1
        if (e.which == 1) {
            $("#rclick-menu").hide();
        }
    })


    // ie下时动态计算表格中文本域的高度
    function calTextareaH() {
        var trArr = $("#data_table tr[data-adjustH != 1]");

        for (var i = 0; i < trArr.length; i++) {
            var tdHeight = $(trArr[i]).height();
            $(trArr[i]).find(".sybw-td .table-cell").css("height", tdHeight);
        }
    }


    // 表格排序
    //th添加属性：data-type="string" [num数字排序，string字符串排序]，th添加属性data-colindex="第几列"
    function sortTable() {
        var tbody = document.querySelector('#data_table').tBodies[0];
        var th = document.querySelector('.fixed-table_header').tHead.rows[0].cells;
        var th1 = document.querySelector('.fixed-table_header').tHead.rows[1].cells;
        var td = tbody.rows;
        for (var i = 0; i < th.length; i++) {
            th[i].flag = 1;
            th[i].onclick = function () {
                // sort(this.getAttribute('data-type'), this.flag, this.cellIndex);
                sort(this.getAttribute('data-type'), this.flag, this.getAttribute('data-colindex'));
                this.flag = -this.flag;
            };
        };

        for (var i = 0; i < th1.length; i++) {
            th1[i].flag = 1;
            th1[i].onclick = function () {
                sort(this.getAttribute('data-type'), this.flag, this.getAttribute('data-colindex'));
                this.flag = -this.flag;
            };
        };


        function sort(str, flag, n) {
            var arr = []; //存放DOM
            for (var i = 0; i < td.length; i++) {
                arr.push(td[i]);
            };

            //排序
            arr.sort(function (a, b) {
                if (a.cells[n].querySelector("input") != null) {
                    return method(str, a.cells[n].querySelector("input").value, b.cells[n].querySelector("input").value) * flag;
                } else if (a.cells[n].querySelector("a") != null) {
                    return method(str, a.cells[n].querySelector("a").innerHTML, b.cells[n].querySelector("a").innerHTML) * flag;
                } else {
                    return method(str, a.cells[n].querySelector(".table-cell").innerHTML, b.cells[n].querySelector(".table-cell").innerHTML) * flag;

                }
            });
            //添加
            for (var i = 0; i < arr.length; i++) {
                tbody.appendChild(arr[i]);
            };
        };
        //排序方法
        function method(str, a, b) {
            switch (str) {
                case 'num': //数字排序
                    return a - b;
                    break;
                case 'string': //字符串排序
                    return a.localeCompare(b);
                    break;
                default: //日期排序，IE8下'2012-12-12'这种格式无法设置时间，替换成'/'
                    return new Date(a.split('-').join('/')).getTime() - new Date(b.split('-').join('/')).getTime();
            };
        };
    }

    sortTable();

    // 初始化页面
    function init() {

        // 初始化下拉框
        for (var i = 0; i < $(".filter .select-menu").length; i++) {
            selectMenu(i);
        }


        bhksEvent();
        var btnTitle = utils.getUrlParam("btnTitle");
        if (btnTitle != null && btnTitle != undefined && btnTitle != "") {
            $("#saveBtn").text(btnTitle);
        }
        if (utils.getUrlParam("bm") == "sp") {
            $(".head-bm span").text("商品中心");
        } else {
            $(".head-bm span").text("技术部");
        }

        // 显示配料卡有图
        if (_show == "0") {
            $("#tab_plk").click();

            // 显示配料卡无图
        } else if (_show == "1") {
            $("#tab_plk").click();

            // 显示总审核
        } else if (_show == "2") {
            $("#tab_zsh").click();

            // 显示接收检查
        } else {
            $("#tab_check").click();
        }

        //loadTableData();
    }

    init();

});


// 调用：onkeydown="keyDown(event)"
// 键盘方向键操作输入框聚焦
var inputs = document.getElementById("data_table").getElementsByClassName("can-edit");

function keyDown(event) {
    var focus = document.activeElement;
    if (!document.getElementById("data_table").contains(focus)) return;
    var event = window.event || event;
    var key = event.keyCode;
    //var col = $("#data_table tr").eq(0).find(".can-edit").length;

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i] === focus) break;
    }


    switch (key) {
        case 38:
            var col = $(inputs[i - 1]).parent().parent().parent().find(".can-edit").length;
            if (i - col >= 0) inputs[i - col].focus();
            break;

        case 40:
            var col = $(inputs[i]).parent().parent().parent().find(".can-edit").length;
            if (i + col < inputs.length) inputs[i + col].focus();

            break;
    }
}