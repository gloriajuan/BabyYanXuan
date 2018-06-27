//index.js
var app = getApp();
Page({
  data: {
    kanjialist:[],
    goodsid:[],
    pics:{}
  },

  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/list',
      success: function (res) {
        var goodsid=[];
        var kanjialist=[];
        if (res.data.code==0){
        for (var i = 0; i < res.data.data.result.length; i++) {
          goodsid.push(res.data.data.result[i].goodsId)
          that.getgoods(res.data.data.result[i].goodsId)
        }
        kanjialist = res.data.data.result
        }
        that.setData({
          kanjialist: kanjialist,
          goodsid: goodsid
        });
      },
    })
  },
  //这里是跳转砍价商品详情页
  gokj: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/kanjia-goods/index?id=" + id

    })
  },
  /* 这里是跳转砍价详情页
  gokj:function(e){
    var id = e.currentTarget.dataset.id
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/shop/goods/kanjia/join',
      data: {
        kjid: id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.navigateTo({
            url: "/pages/kanjia/index?kjId="+res.data.data.kjId+"&joiner="+res.data.data.uid+"&id="+ res.data.data.goodsId

          })
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
  */
  getgoods:function(id){
    var that=this
    var pics = that.data.pics
    wx.request({
      url: app.globalData.urls + '/shop/goods/detail',
      data: {
        id: id
      },
      success: function (res) {
        if (res.data.code==0) {
          pics[id] = res.data.data.basicInfo
          that.setData({
            pics: pics,
          });
        }
      }
    })
  }

})