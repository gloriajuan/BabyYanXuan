//index.js
//获取应用实例
var app = getApp()
Page({
  data: {

  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function (e) {
    wx.showLoading();
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/mybill.asmx/GetTypeGoodsList',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        SecondTypeId: e.id
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        if (res.data.state != 1 || res.data.obj.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
        for (var i = 0; i < res.data.obj.length; i++) {
          goods.push(res.data.obj[i]);
        }
        that.setData({
          goods: goods,
        });
      }
    })
  }

})
