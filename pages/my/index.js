const app = getApp()
var wxpay = require('../../utils/pay.js')
Page({
	data: {
    balance:0,
    freeze:0,
    score:0,
    score_sign_continuous:0,

    tabClass: ["", "", "", "", ""]
  },
  goorderlist (e){
    var id = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "/pages/order-list/index?currentType=" + id
    })
  },
  onLoad: function () {
   
  },
  onShow() {
    that.setData({
      score: app.globalData.userInfo.Score,
    });
  },	
  
  relogin:function(){
    var that = this;
    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        app.globalData.token = null;
        app.login();
        wx.showModal({
          title: '提示',
          content: '重新登陆成功',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              that.onShow();
            }
          }
        })
      },
      fail(res){
        //console.log(res);
        wx.openSetting({});
      }
    })
  },
  address: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  withdraw: function () {
    wx.navigateTo({
      url: "/pages/withdraw/index"
    })
  }, 
  score: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  }, 
  mykanjia: function () {
    wx.navigateTo({
      url: "/pages/my-kanjia/index"
    })
  },
  mycoupons: function () {
    wx.navigateTo({
      url: "/pages/mycoupons/index"
    })
  },
  favlist: function () {
    wx.navigateTo({
      url: "/pages/fav-list/index"
    })
  },
})