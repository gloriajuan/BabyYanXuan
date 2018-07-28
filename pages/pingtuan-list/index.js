var app = getApp();
Page({
  data: {
    pics: {}
  },
  onLoad: function (e) {
    var that = this;

    var type = e.id;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + "/MyBill.asmx/GetMyBillList",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '2'
      },
      success: function (res) {
        if (res.data.state == 1) {
          
          that.setData({
            ptgoods: ptgoods
          });
        }
      },
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  }
})