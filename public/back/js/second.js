/**
 * Created by tong on 2018/6/26.
 */
$(function () {
    var currentPage = 1;
  var pageSize = 5;

  render();
  function render() {
    $.ajax({
      type:"get",
      url:"/category/querySecondCategoryPaging",
      data:{
        page:currentPage,
        pageSize:pageSize
      },
      dataTye:"json",
      success:function (info) {
        console.log(info);
        //组装数据和模板
        var htmlStr = template("tpl",info);
        //渲染在页面中
        $('tbody').html(htmlStr);


        //分页初始化
        $("#paginator").bootstrapPaginator({
          //指定版本号,我们这里用的是bootstrap3,所以要有个结构
          bootstrapMajorVersion:3,
          //指定当前页
          currentPage:info.page,
          //指定总的页数
          totalPages:Math.ceil(info.total/info.size),
          //设置点击事件
          onPageClicked:function(a,b,c,page) {
            //更新当前页面
            currentPage = page;
            //重新渲染
            render();
          }
        })
      }
    });
  }


  //2.点击添加分类按钮,显示模态框
  $("#addBtn").click(function () {
      $('#addModal').modal("show");


    //发送ajax请求,获取下拉菜单的数据,进行渲染下拉菜单
    $.ajax({
      type:"get",
      url:"/category/queryTopCategoryPaging",
      data:{
        page:1,
        pageSize:100
      },
      dataTye:"json",
      success:function (info) {
        console.log(info);
        //获取到对应的json字符串
        var htmlStr = template('dropdownTpl',info);
        //将其渲染到下拉菜单中
        $(".dropdown-menu").html(htmlStr);
      }
    })
  })

  //3.给dropdown-menu 注册点击事件(时间委托),让模板里的a可以被点击
  $(".dropdown-menu").on("click","a",function () {
      //获取选中的文本,设置个给上面按钮中的内容
    var txt = $(this).text();
    $("#dropdownTxt").text(txt);

    //获取 id,设置name = "categoryId" 的 input框
    var id = $(this).data("id");
    $([name="categoryId"]).val(id);

    //用户选择一级分类后,需将name = "categoryId" input框的校验状态设置成Valid
    //参数1:字段名,参数2:设置成上面状态,参数3:回调(配置提示信息)
    //BootstrapValidator在用户输入内容的时候，会做校验，当调用bootstrap的插件的方法可以手动会改变字段值的状态。可以使用updateStatus(field, status, validatorName)方法更新字段的状态
    //var validator = $("#form").data('bootstrapValidator');  //获取表单校验实例
    $("#form").data("bootstrapValidator").updateStatus("categoryId","VALID");
  });
  
  //4.进行jquery-fileupload 实例化,里面是配置图片上传后的回调函数
  $("#fileupload").fileupload({
    //返回的数据类型格式
    dataType:"json",

    //图片上传完成的回调函数
    //e：事件对象
    //data：图片上传后的对象，通过e.result.picAddr可以获取上传后的图片地址
    done:function (e, data) {
      console.log(data.result.picAddr);//上传后得到的地址
      var picUrl = data.result.picAddr;

      //设置图片地址给图片
      $("#imgBox img").attr("src",picUrl);

      //将图片地址存在 name = "brandLogo" 的 input 框中
      $([name="brandLogo"]).val(picUrl);

      //手动将表单校验状态重置成VALID
      $("#form").data("bootstrapValidator").updateStatus("brandLogo","VALID");
    }
  });

  //5.通过表单校验插件实现表单校验功能
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
      categoryId: {
        validators:{
          notEmpty: {
            message: "请选择一级分类"
          }
        }
      },

      brandLogo: {
        validators:{
          notEmpty: {
            message: "请上传图片"
          }
        }
      },
    }
  })

  //6.注册表单校验成功事件,阻止默认提交,通过ajax提交
  $("#form").on("success.form.bv",function (e) {
      e.preventDefault();

    //通过ajax提交
    $.ajax({
      type:"post",
      url:"/category/addSecondCategory",
      data:$("#form").serialize(),
      dataTye:"json",
      success:function (info) {
        console.log(info);
        //console.log(1);
        if(info.success) {
          //添加成功
          //关闭模态框
          $("#addModal").modal("hide");
          //重置表单内容
          $("#form").data("bootstrapValidator").resetForm(true);

          //重新渲染第一页
          currentPage = 1;
          render();
          //由于下拉框和图片不是表单,所以需要手动重置
          $("#dropdownTxt").text("请选择一级分类");
          $("#imgBox img").attr("src","images/none.png");
        }
      }
    })
  })
})