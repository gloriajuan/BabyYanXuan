App({
  onLaunch: function () {
    var that = this;
    that.urls();
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.search("iPhone X") != -1) {
          that.globalData.iphone = true;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/config/get-value",
      data: {
        key: "mallName"
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync("mallName", res.data.data.value);
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/score/send/rule",
      data: {
        code: "goodReputation"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.order_reputation_score = res.data.data[0].score;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/config/get-value",
      data: {
        key: "recharge_amount_min"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.recharge_amount_min = res.data.data.value;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/shop/goods/kanjia/list",
      data: {},
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.kanjiaList = res.data.data.result;
        }
      }
    });
    that.login();
  },
  siteInfo: require("config.js"),
  login: function () {
    var that = this;
    var token = that.globalData.token;
    if (token) {
      wx.request({
        url: that.globalData.urls + "/user/check-token",
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.code != 0) {
            that.globalData.token = null;
            that.login();
          }
        }
      });
      return;
    }
    wx.login({
      success: function (res) {
        wx.request({
          url: that.globalData.urls + "/user/wxapp/login",
          data: {
            code: res.code
          },
          success: function (res) {
            if (res.data.code == 1e4) {
              that.globalData.usinfo = 0;
              return;
            }
            if (res.data.code != 0) {
              wx.hideLoading();
              wx.showModal({
                title: "提示",
                content: "无法登录，请重试",
                showCancel: false
              });
              return;
            }
            that.globalData.token = res.data.data.token;
            that.globalData.uid = res.data.data.uid;
          }
        });
      }
    });
  },
  urls: function () {
    var that = this;
    that.globalData.urls = that.siteInfo.url + that.siteInfo.subDomain;
    that.globalData.share = that.siteInfo.shareProfile;
  },
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: that.globalData.urls + "/template-msg/put",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        token: that.globalData.token,
        type: 0,
        module: "order",
        business_id: orderId,
        trigger: trigger,
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      }
    });
  },
  sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: that.globalData.urls + "/template-msg/put",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        token: that.globalData.token,
        type: 0,
        module: "immediately",
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      }
    });
  },
  globalData: {
    userInfo: null,
    Urls: {}
  }
});