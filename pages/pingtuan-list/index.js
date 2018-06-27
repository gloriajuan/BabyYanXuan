var app = getApp();
Page({
  data: {
    pics: {}
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/shop/goods/list',
      success: function (res) {
        if (res.data.code == 0) {
          var ptgoods = [];
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].pingtuan == true) {
              ptgoods.push(res.data.data[i]);
              that.getgoods(res.data.data[i].id);
            }
          }
          that.setData({
            ptgoods: ptgoods
          });
        }
      },
    })
  },
  getgoods: function (id) {
    var that = this
    var pics = that.data.pics
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/set',
      data: {
        goodsId: id
      },
      success: function (res) {
        if (res.data.code == 0) {
          pics[id] = res.data.data
          that.setData({
            pics: pics,
          });
        }
      }
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  }
})