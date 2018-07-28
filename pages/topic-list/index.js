var app = getApp()
Page({
  data: {
    skipIndex:0,
  },
  tapContents: function (e) {
    wx.navigateTo({
      url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    
    that.getTopicList(that.data.skipIndex);
  },

  getTopicList: function (skipIndex) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBillList',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '3',
        skip: skipIndex,
        take: 10
      },
      success: function (res) {
        var content = [];
        if (res.data.state == 1) {
          for (var i = 0; i < res.data.obj.length; i++) {
            content.push(res.data.obj[i]);
          }
        }
        that.setData({
          contents: content
        });
      }
    })
  }

})