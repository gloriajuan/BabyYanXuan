//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    mainPagetypeId:-1,
    memuPageTypeId:-1,
    pageTitle:"分类商品",
    skipIndex:0,
    goods:[],
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function (e) {
    wx.showLoading();
    var that = this;
    var pageType = e.type;
    that.data.mainPagetypeId = pageType;
    that.data.memuPageTypeId = e.id;

    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    
    that.data.skipIndex = 0;
    if (pageType != -1) {
      //特惠
      that.getGoodsListFromMain(that.data.skipIndex);

      if(pageType == 2){
        that.setData({
          pageTitle: "特惠"
        });
      }else if(pageType == 4){
        that.setData({
          pageTitle: "人气推荐"
        });
      }
      
    } else{
      that.getGoodsListFromMenu(that.data.skipIndex);
    }
  },

  loadMoreData: function(){
    that.data.skipIndex += 10;

    that.getGoodsListFromMain(that.data.skipIndex);
  },

  getGoodsListFromMain: function (skipIndex) {
    var that = this;

    wx.request({
      url: app.globalData.urls + "/MyBill.asmx/GetMyBillList",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: that.data.mainPagetypeId,
        skip: skipIndex,
        take: 10
      },
      success: function (res) {
        wx.hideLoading();

        if (res.data.state == 1) {
          for (var i = 0; i < res.data.obj.length; i++) {
            that.data.goods.push(res.data.obj[i]);
          }
          var hasGoods = false;
          if (that.data.goods.length > 0) hasGoods = true;
          that.setData({
            goods: that.data.goods,
            loadingMoreHidden: hasGoods
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        that.setData({
          loadingMoreHidden: false
        })
      }
    })
  },

  getGoodsListFromMenu: function(skipIndex){
    var that = this;

    wx.request({
      url: app.globalData.urls + '/mybill.asmx/GetTypeGoodsList',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        SecondTypeId: that.data.memuPageTypeId,
        skip: skipIndex,
        take: 10
      },
      success: function (res) {
        wx.hideLoading();

        for (var i = 0; i < res.data.obj.length; i++) {
          that.data.goods.push(res.data.obj[i]);
        }

        var hasGoods = false;
        if (that.data.goods.length > 0) hasGoods = true;
        that.setData({
          goods: that.data.goods,
          loadingMoreHidden: hasGoods
        });
      },
      fail: function (res) {
        wx.hideLoading();
        that.setData({
          loadingMoreHidden: false
        })
      }
    })
  }

})


