var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    topid:0,
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function (e) {
    var that = this;
    that.data.topid = e.id;

    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    var topictitle = that.data.topictitle;
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetSpecialInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        id: e.id
      },
      success: function (res) {
        if (res.data.state == 1) {
          var topics = {};
          topics.author = res.data.AuthorName;
          topics.title = res.data.Title;
          topics.avatar = res.data.AuthorImg;
          topics.content = res.data.Content;

          that.setData({
            topics: topics,
          });
          var goods = [];
          for (var i = 0; i < res.data.obj.length; i++) {
            goods.push(res.data.obj[i]);
            that.setData({
              goods: goods,
              topid: e.id
            });
          }
          WxParse.wxParse('article', 'html', res.data.Content, that, 5);
          
        }
      }
    })

  },
  onShareAppMessage: function (e) {
    return {
      title: this.data.topictitle,
      path: 'pages/topic/index?id=' + this.data.topid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


})