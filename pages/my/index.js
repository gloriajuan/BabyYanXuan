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
    this.getUserApiInfo();
    this.getUserAmount();
    this.checkScoreSign();
    this.getInfo();
  },
  onShow() {
    this.getUserApiInfo();
    this.getUserAmount();
    this.checkScoreSign();
    this.getInfo();
    //更新订单状态
    var that = this;
    wx.request({
      url: app.globalData.urls + '/order/statistics',
      data: { token: app.globalData.token },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          var tabClass = that.data.tabClass;
          if (res.data.data.count_id_no_pay > 0) {
            tabClass[0] = "red-dot"
          } else {
            tabClass[0] = ""
          }
          if (res.data.data.count_id_no_transfer > 0) {
            tabClass[1] = "red-dot"
          } else {
            tabClass[1] = ""
          }
          if (res.data.data.count_id_no_confirm > 0) {
            tabClass[2] = "red-dot"
          } else {
            tabClass[2] = ""
          }
          if (res.data.data.count_id_no_reputation > 0) {
            tabClass[3] = "red-dot"
          } else {
            tabClass[3] = ""
          }
          if (res.data.data.count_id_success > 0) {
            //tabClass[4] = "red-dot"
          } else {
            //tabClass[4] = ""
          }

          that.setData({
            tabClass: tabClass,
          });
        }
      }
    })
  },	
  getUserApiInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/detail',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            apiUserInfoMap: res.data.data
          });
        }
      }
    })
  },
  getUserAmount: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/amount',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            balance: res.data.data.balance,
            freeze: res.data.data.freeze,
            score: res.data.data.score
          });
        }
      }
    })
  },
  getInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/config/get-value',
      data: {
        key: "mallinfo"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            getInfo: res.data.data.value
          });
        }
      }
    })
  },
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/today-signed',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            score_sign_continuous: res.data.data.continuous
          });
        }
      }
    })
  },
  scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/sign',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getUserAmount();
          that.checkScoreSign();
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
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