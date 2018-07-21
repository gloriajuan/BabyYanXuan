//index.js
//获取应用实例
var app = getApp()
Page({
  data: {},
  onLoad: function (e) {

    var that = this;
    var orderId = e.id;
   
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/GetOrderInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        OrderGroup: orderId
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.state != 1) {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        var arrExpressInfo = JSON.parse(res.data.obj.ExpressInfo);
        var orderInfo = res.data.obj;
        orderInfo.arrExpressInfo = arrExpressInfo;

        var province = orderInfo.AddressProvince == null ? "" : orderInfo.AddressProvince;
        var city = orderInfo.AddressCity == null ? "" : orderInfo.AddressCity;
        var area = orderInfo.AddressArea == null ? "" : orderInfo.AddressArea;
        var detail = orderInfo.AddressAdd == null ? "" : orderInfo.AddressAdd;

        orderInfo.Address = province + city + area + detail;

        that.setData({
          orderDetail: orderInfo
        });
      }
    });
  },

  onShow: function () {
    var that = this;
  }
})
