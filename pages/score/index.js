var app = getApp()
Page({
  data: {
    score: 0,//积分
    score_sign_continuous: 0,//连续签到次数
    ci: 0, //今天是否已签到 0-未签到 1-已签到
  },

  onShow() {
    
  },
  //签到按钮
  scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + "/MyBill.asmx/GetMyUserScore",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        UserId: app.globalData.userInfo.Id,
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            score: res.data.Score,
            score_sign_continuous: res.data.SignDay,
            ci: 1,
          });
        } else {
          wx.showModal({
            title: "提示",
            content: "无法登录，请重试",
            showCancel: false
          });
          return;
        }
      }
    });
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }

    var rules = [];
    for(var i = 0; i < 7;i++){
      var rule = {};
      if(i < 3){
        rule.score = 1;
      }else if(i < 6){
        rule.score = 2;
      }else if(i == 6){
        rule.score = 6;
      }
      rule.continuous = i+1;
      rules.push(rule);
    }
  
    that.setData({
      score: app.globalData.userInfo.Score,
      score_sign_continuous: app.globalData.userInfo.SignDay,
      ci: app.globalData.userInfo.IsSign,
      rules: rules
    });
    
  },

  score: function () {
    wx.navigateTo({
      url: "/pages/newcoupons/index"
    })
  },
  home: function () {
    wx.switchTab({
      url: '../index/index'
    })
  }

})