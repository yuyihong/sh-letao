/**
 * Created by tong on 2018/6/26.
 */

$(function () {
  //1.一进入页面,先发送ajax请求,请求数据,进行页面渲染
   var currentPage = 1; //当前页
   var pageSize = 2; //每页多少条


    render();
   function render() {
     $.ajax({
       type:"get",
       url:"/category/queryTopCategoryPaging",
       data:{
         page:currentPage,
         pageSize:pageSize
       },
       dataType:"json",
       success:function (info) {
         //console.log(info);
         //将模板与数据进行组装
         var htmlStr = template("tpl",info);
         //将数据渲染到页面中
         $('tbody').html(htmlStr);

         //分页初始化
         $("#paginator").bootstrapPaginator({
           //指定版本号
           bootstrapMajorVersion:3,
           //指定当前页面
           currentPage:info.page,
           //指定总的页数
           totalPages:Math.ceil(info.total / info.size),
           //为按钮绑定点击事件page,当前点击的按钮值
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

  //2.点击添加分类按钮,显示添加分类模态框
  $("#addBtn").click(function () {
      //显示模态框
    $("#addModal").modal("show");
  })

  //3.通过表单校验插件,实现表单校验
  $("#form").bootstrapValidator({
    //配置图标
    feedbackIcons:{
      valid: 'glyphicon glyphicon-ok',   // 校验成功
      invalid: 'glyphicon glyphicon-remove', // 校验失败
      validating: 'glyphicon glyphicon-refresh'  // 校验中
    },
    //配置字段
    fields: {
      categoryName:{
        //配置校验规则
        validators:{
          //非空校验
          notEmpty: {
            message : "一级分类名称不能为空"
          }
        }
      }
    }
  });

  //4.注册表单校验成功事件(事件委托),阻止默认成功的提交,通过ajax进行提交
  //当表单校验成功时，会触发success.form.bv事件，此时会提交表单，这时候，通常我们需要禁止表单的自动提交，使用ajax进行表单的提交。
  $("#form").on("success.form.bv",function (e) {
      e.preventDefault();
    console.log($("#form").serialize());
    $.ajax({
      type:"post",
      url:"/category/addTopCategory",
      data:$("#form").serialize(),//表单序列化会获取form里面有nane属性的表单值,拼成键=值&键=值,categoryName=%E4%BD%A0%E5%A5%BD
      dataType:"json",
      success:function (info) {
        console.log(info);
        if (info.success) {
          //添加模态框
          //1-关闭模态框
          $("#addModal").modal("hide");
          //2-重新渲染页面,把添加的内容渲染到第一页最合适
          currentPage = 1;
          render();

          //3-重置模态框的表单,传 true 不仅重置校验状态,还重置内容
          $("#form").data("bootstrapValidator").resetForm(true);
        }
      }
    })
  })
})