//login.js
//获取应用实例
var app = getApp();
function countdown(that) {
  var second = that.data.second;
  var home = that.data.home;
  if (home == 0) {
    if (second == 0) {
      wx.switchTab({
        url: '../index/index'
      })
    }
  }
  var time = setTimeout(function () {
    that.setData({
      second: second - 1
    });
    countdown(that);
  }
    , 1000)

}
Page({
  data: {
    second: 6,
    home: 0
  },

  home: function () {
    this.setData({
      home: 1
    });
    wx.switchTab({
      url: '../index/index'
    })
  },
  tapBanner: function (e) {
    return;
    if (e.currentTarget.dataset.id != 0) {
      this.setData({
        home: 1
      });
      wx.redirectTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id + '&share=1'
      })
    }
  },
  onLoad: function () {
    var that = this;
    countdown(that);
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetLoginPageInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
      },
      success: function (res) {
        if (res.data.state == 1) {
          
          that.setData({
            lauchUp: res.data.obj
          });
        }
      }
    })

  }
});