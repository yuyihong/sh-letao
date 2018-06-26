/**
 * Created by tong on 2018/6/26.
 */
$(function () {
    var currentPage = 1;//当前页
    var pageSize = 5;//每页显示多少条

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






})