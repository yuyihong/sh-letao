/**
 * Created by tong on 2018/6/25.
 */
/*
 * 1. 进行表单校验配置
 *    校验要求:
 *        (1) 用户名不能为空, 长度为2-6位
 *        (2) 密码不能为空, 长度为6-12位
 * */
$(function () {
  //1.表单校验初始化
  $("#form").bootstrapValidator({
    //配置图标
    //指定校验时的图标显示，默认是bootstrap风格
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',//校验成功
      invalid: 'glyphicon glyphicon-remove',//校验失败
      validating: 'glyphicon glyphicon-refresh'//校验中
    },
    //指定校验字段
    fields: {
      username: {
        //配置校验规则
        validators: {
          //配置非空校验
          notEmpty : {
            message:"用户名不能为空"
          },
          //配置长度校验
          stringLength : {
            min : 2,
            max : 6,
            message:"用户名长度必须在2-6位"
          },

          callback: {
            message:"用户名不存在"
          }
        }
      },
      password : {
        //配置校验规则
        validators: {
          //配置非空校验
          notEmpty : {
            message:"密码不能为空"
          },
          //配置长度校验
          stringLength : {
            min : 6,
            max : 12,
            message:"密码长度必须在6-12位"
          },
          //专门用于响应回调的校验规则
          callback: {
            message:"密码错误"
          }
        }
      }
    }
  });



  //2.需要注册表单校验成功事件
  $("#form").on("success.form.bv",function(e){
    //阻止默认表单提交
    e.preventDefault();

    //通过ajax请求
    $.ajax({
      type:"post",
      url:"/employee/employeeLogin",
      //表单序列化,快速收集表单提交内容
      data:$('#form').serialize(),
      dataType:"json",
      success:function (info) {
        console.log(info);
        if (info.success) {
          location.href = "index.html";
        }
        if(info.error == "1000") {
          //alert("密码错误!");
          $("#form").data("bootstrapValidator").updateStatus("username","INVALID","callback")

        }
        if(info.error == "1001") {
          //alert("密码错误!");
          $("#form").data("bootstrapValidator").updateStatus("password","INVALID","callback")

        }
      }
    })
  })


  //重置:属性选择器(jq)
  $("[type='reset']").click(function () {

    $("#form").data("bootstrapValidator").resetForm();

  })




})