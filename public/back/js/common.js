/**
 * Created by tong on 2018/6/25.
 */
//实现进度条功能(给ajax秦秋)

//开启进度条
//NProgress.start();
//
//setTimeout(function () {
//  //关闭进度条
//    NProgress.done();
//},500);


//ajax全局事件
//ajaxComplete() 完成时调用
//ajaxError()   失败时调用
//ajaxSuccess() 成功时调用
//ajaxSend()    发送前

//ajaxStart(); 第一个ajax发送时调用
//ajaxStop(); 所有的ajax请求都完成时调用
$(document).ajaxStart(function () {
    NProgress.start();
});

//所有的ajax请求完成时
$(document).ajaxStop(function () {
    setTimeout(function () {
        //关闭进度条
        NProgress.done();
    },500);
});