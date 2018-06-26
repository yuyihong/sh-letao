/**
 * Created by tong on 2018/6/26.
 */
$(function () {
    var currentPage = 1;//当前页
    var pageSize = 5;//每页显示多少条

    var currentId;
    var isDelete;

    render();
    function render() {
      $.ajax({
        type:"get",
        url:"/user/queryUser",
        data:{
          page:currentPage,
          pageSize:pageSize
        },
        dataType:"json",
        success:function (info) {
          console.log(info);
          var htmlStr = template("tpl",info);
          $('tbody').html(htmlStr);

          //分页初始化
          $("#paginator").bootstrapPaginator({
            bootstrapMajorVersion:3,//需要定义版本号,在结构中使用ul
            currentPage:info.page,//当前页
            totalPages:Math.ceil(info.total / info.size),//总共多少页
            onPageClicked(a,b,c,page) {
              console.log(page);//为按钮绑定点击事件 page:当前点击的按钮值
              //更新当前页
              currentPage = page;
              //重新渲染页面
              render();
            }
          })
        }

      })
    }


  //1.原生js获取：document.getElementById("a").dataset.test。
  //2.jq attr()获取
  //    $("#a").attr("data-test")。
  //3.jq data()获取
  //    $("#a").data("test")。
  //当然，这个时候三种方法取出来的值都是一样的，全是“123”。
  //再看赋值，其实也是最容易迷糊的一个。



  //启用禁用按钮,点击按钮,弹出模态框,(复用,用的是同一个模态框)
  //通过事件委托来注册点击事件,效率更高,事件只需要注册一次
  $('tbody').on("click",".btn",function () {
    //让模态框显示
    $('#userModal').modal("show");
    //点击时候,将当前选中的用户 id 记录在全局 currentId中
    currentId = $(this).parent().data("id");
    //点击禁用按钮,让用户变成禁用状态,让idDelete变成0 =>将来传给后台就传0
    isDelete = $(this).hasClass("btn-danger")?0:1;
  })

  //3. 点击确定按钮,需要根据 id 和 isDelete 发送ajax 请求,修改用户状态
  $("#submitBtn").click(function () {
    console.log("currentId" + currentId);
    console.log("isDelete"+ isDelete);

    $.ajax({
      type:"post",
      url:"/user/updateUser",
      data:{
        id:currentId,
        isDelete:isDelete
      },
      dataType:"json",
      success:function (info) {
        console.log(info);
        //1-关闭模态框
        $("#userModal").modal("hide");
        //2-重新渲染数据
        render();
      }
    })

  })



})