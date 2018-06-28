/**
 * Created by tong on 2018/6/28.
 */
$(function () {
    var currentPage = 1;
    var pageSize = 2;
    //定义一个数组,专门用于存储所有的上传的图片地址
    var picArr = [];

    //1.一进入页面进行一次渲染
    render();
    function render() {
        $.ajax({
            type:"get",
            url:"/product/queryProductDetailList",
            data:{
                page:currentPage,
                pageSize:pageSize
            },
            //如果后台设置了响应头,设置了 content-type:application/json
            //前端可以不用设置dataType,jquery会自动按照 json格式解析数据
            dataType:"json",
            success:function (info) {
                console.log(info);
                var htmlStr = template("productTpl",info);
                $("tbody").html(htmlStr);

                //分页初始化
                $("#paginator").bootstrapPaginator({
                    bootstrapMajorVersion: 3,
                    currentPage:info.page,
                    totalPages:Math.ceil(info.total / info.size),

                    //控件的大小
                    size:"mini",

                    //配置每个按钮的显示文字
                    //每个按钮,在初始化时都会调用这个方法,根据返回值进行设置文本
                    //type:点击按钮的功能类型page,就是普通按钮,next,prev,last,first
                    //page:点击该按钮,跳转到哪一页
                    //current:表示当前第几页
                    itemTexts:function (type, page, current) {
                        //console.log(arguments);
                    switch (type) {
                        case "first":
                            return "首页";
                        case "prev":
                            return "上一页";
                        case "next":
                            return "下一页";
                        case "last":
                            return "尾页";
                        case "page":
                            return page;
                        }
                    },

                    //配置每个按钮的title
                    //每个按钮都会调用这个方法,将方法的返回值,作为title的内容
                    tooltipTitles:function (type, page, current) {
                        switch (type) {
                            case "first":
                                return "首页";
                            case "prev":
                                return "上一页";
                            case "next":
                                return "下一页";
                            case "last":
                                return "尾页";
                            case  "page":
                                return  "前往" + page + "页";
                        }
                    },
                    //使用bootstrap提示框
                    useBootstrapTooltip:true,

                    onPageClicked:function (a,b,c,page) {
                        //更新当前页
                        currentPage = page;
                        //重新渲染
                        render();
                    }
                })
            }
        })
    }

  //2.点击添加商品按钮显示模态框
    $("#addBtn").click(function () {
        $("#addModal").modal("show");

        //请求所有的二级分类数据,进行渲染下拉菜单
        $.ajax({
            type:"get",
            //用分页接口模拟
            url:"/category/querySecondCategoryPaging",
            data:{
                page: 1,
                pageSize:100
            },
            dataType:"json",
            success:function (info) {
                console.log(info);
                var htmlStr = template("dropdownTpl",info);
                //渲染到下拉菜单中
                $(".dropdown-menu").html(htmlStr);
            }
        })
    })

    //3.通过委托事件,给每个a添加点击事件
    $(".dropdown-menu").on("click","a",function () {
        //获取设置文本
        var txt = $(this).text();
        $("#dropdownTxt").text(txt);

        //将id设置到隐藏域中
        var id = $(this).data("id");
        $('[name="brandId"]').val(id);

        //手动重置隐藏域的状态
        $("#form").data("bootstrapValidator").updateStatus("brandId","VALID");
    })

    //4.进行图片上传初始化
    //文件上传说明
    //上传三张图片,将来服务器端一旦存好一张,就会响应一张
    //将来每次响应一次,就会调用一次 done 方法,这样用户体验是最好的
    //jquery-fileupload 对文件的上传提交进行了封装,每次选择完图片后,就会向接口发送请求上传图片
    $("#fileupload").fileupload({
        //配置返回的数据类型
        dataType:"json",
        //e：事件对象
        //data：图片上传后的对象，通过data.result.picAddr可以获取上传后的图片地址
        done:function (e, data) {
            console.log(data.result);
            var picUrl = data.result.picAddr;
            //每次上传成功,将图片地址和图片名称的对象,推到picArr 数组的最前面,和图片结构同步
            picArr.unshift(data.result);

            //根据图片地址进行图片预览
            $("#imgBox").prepend('<img src=" '+picUrl+'"width="100" height="100">');

            //如果长度大于 3,就应该删除
            if (picArr.length > 3) {
                //图片数组要删除最后一个,(最早添加的那个)
                picArr.pop();
                //图片结构也要删除最后一个图片
                //console.log(picArr.length);
                //img:last-of-type 找到最后一个 img类型的标签,让他自杀
                $('#imgBox img:last-of-type').remove();
            }


            //如果picArr数组长度等于3,就说明当前用户已经上传满了3张图片
            //需要手动重置图片校验状态 为成功VALID状态
            if(picArr.length === 3 ) {
                $('#form').data("bootstrapValidator").updateStatus("picStatus","VALID");
            }
            console.log(picArr);
        }
    });

    //5.通过表单校验插件,实现表单校验
    $("#form").bootstrapValidator({
        //1-指定不校验的类型,默认为[":disabled",":hidden",":not(:visible)"],可以不设置
        //默认不校验 隐藏域的input,我们需要重置,exclued为[],恢复对隐藏域的校验
        excluded:[],
        //配置图标
        //2. 指定校验时的图标显示，默认是bootstrap风格
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },

        //配置字段
        //3. 指定校验字段
        fields: {
            //校验用户名，对应name表单的name属性
            //categoryId 用户选择一级分类id
            //brandname  用户输入二级分类名称
            //brandLogo  上传图片地址
            brandId: {
                validators:{
                    notEmpty: {
                        message: "请选择二级分类"
                    }
                }
            },
            proName: {
                validators:{
                    notEmpty: {
                        message: "请输入商品名称"
                    }
                }
            },
            proDesc: {
                validators:{
                    notEmpty: {
                        message: "请输入商品描述"
                    }
                }
            },
            // 要求: 商品库存要求是 必须是非零开头的数字
            // 1 11 121
            /*
             * [1-9]  可以出现 1-9 中的任意一个
             * [^0]   除了0都可以出现, 包括字母
             *
             * \d     数字 [0-9]
             *  + 可以出现 一次 或 多次
             *  * 可以出现 0次 或 的多次
             *  ? 可以出现 0次 或 1次
             *  {n} 可以先 n 次
             * */
            num: {
                validators:{
                    notEmpty: {
                        message: "请输入商品库存"
                    },
                    regexp: {
                        regexp: /^[1-9]\d*$/,
                        message: '商品库存必须是非零开头的数字'
                    }
                }
            },
            // 尺码校验需求: 必须是 xx-xx 的格式, xx 表示数字
            size: {
                validators:{
                    notEmpty: {
                        message: "请输入商品尺码"
                    },
                    regexp: {
                        regexp: /^\d{2}-\d{2}$/,
                        message: '商品尺码必须是xx-xx的格式,例如 32-40'
                    }
                }
            },
            oldPrice: {
                validators:{
                    notEmpty: {
                        message: "请输入商品原价"
                    }
                }
            },
            price: {
                validators:{
                    notEmpty: {
                        message: "请输入商品现价"
                    }
                }
            },
            picStatus: {
                validators:{
                    notEmpty: {
                        message: "请上传3张图片"
                    }
                }
            }
        }
    })

    //6.注册表单校验成功事件,阻止默认的提交,通过ajax提交
    $("#form").on("success.form.bv",function (e) {
        e.preventDefault();

        console.log($("#form").serialize());
        var paramsStr = $("#form").serialize();//获取表单的数据
        //还需要拼接上图片的地址和名称
        // &picAddr1=xx&picName1=xx
        // &picAddr2=xx&picName2=xx
        // &picAddr3=xx&picName3=xx
        //paramsStr += "&picAddr1="+ picArr[0].picAddr + "&picName1" + picArr[0].picName;
        //paramsStr += "&picAddr2="+ picArr[1].picAddr + "&picName2" + picArr[1].picName;
        //paramsStr += "&picAddr3="+ picArr[2].picAddr + "&picName3" + picArr[2].picName;
        paramsStr  = paramsStr + "&picAddr1="+ picArr[0].picAddr + "&picName1=" + picArr[0].picName;
        paramsStr = paramsStr + "&picAddr2="+ picArr[1].picAddr + "&picName2=" + picArr[1].picName;
        paramsStr = paramsStr + "&picAddr3="+ picArr[2].picAddr + "&picName3=" + picArr[2].picName;
        console.log(paramsStr);

        $.ajax({
            type:"post",
            url:"/product/addProduct",
            data:paramsStr,
            dataType:"json",
            success:function (info) {
                console.log(info);
                if (info.success) {
                    //隐藏模态框
                    $("#addModal").modal("hide");
                    //重置表单内容
                    $("#form").data("bootstrapValidator").resetForm(true);
                    //重新渲染第一页
                    render();

                    //手动重置文本
                    $("#dropdownTxt").text("请输入二级分类");

                    //手动重置图片,找到所有的图片,让所有的图片自杀
                    $("#imgBox img").remove();

                }
            }
        })
    })


})