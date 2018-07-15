var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data: {
    statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType: 1,
    tabClass: ["", "", "", "", ""]
  },

  statusTap: function (e) {
    var obj = e;
    var count = 0;
    for (var key in obj) {
      count++;
    }
    if (count == 0) {
      var curType = 1;
    } else {
      var curType = e.currentTarget.dataset.index+1;
    }
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  orderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.siteInfo.url + app.siteInfo.subDomain + '/order/close',
            data: {
              token: app.globalData.token,
              orderId: orderId
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  toPayTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wxpay.wxpay(app, money, orderId, "/pages/index/index");
  },
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    var currentType = e.currentType;
    this.data.currentType = currentType;
    this.setData({
      currentType: currentType
    });
    // this.statusTap(e);
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderStatistics: function () {
    var that = this;
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/order/statistics',
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
  onShow: function (e) {
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      
    };
    postData.Status = that.data.currentType;
    postData.UserId = app.globalData.userInfo.Id;
    postData.skip = 0;
    postData.take = 10;
    // this.getOrderStatistics();
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/GetOrderList',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: postData,
      success: (res) => {
        wx.hideLoading();
        if (res.data.state == 1) {
          that.setData({
            orderList: res.data.obj,
            // logisticsMap: res.data.data.logisticsMap,
            // goodsMap: res.data.data.goodsMap
          });
        } else {
          this.setData({
            orderList: null,
            // logisticsMap: {},
            // goodsMap: {}
          });
        }
      }
    })

  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

  }
})