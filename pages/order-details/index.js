var app = getApp();
Page({
    data:{
      orderId:0,
        goodsList:[],
        yunPrice:"0.00"
    },
    onLoad:function(e){
      var that = this;
      var orderId = e.id;
      if (e.share) { that.setData({ share: e.share }); }
      if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
      this.data.orderId = orderId;
      this.setData({
        orderId: orderId
      });
    },
    onShow : function () {
      var that = this
      
      wx.request({
        url: app.globalData.urls + '/MyGoods.asmx/GetOrderInfo',
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          OrderGroup: that.data.orderId
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data.state != 1) {
            wx.showModal({
              title: '错误',
              content: res.data.msg,
              showCancel: false
            })
            return;
          }
          var arrExpressInfo = JSON.parse(res.data.obj.ExpressInfo);
          var orderInfo = res.data.obj;
          orderInfo.id = that.data.orderId;
          orderInfo.arrExpressInfo = arrExpressInfo;

          var province = orderInfo.AddressProvince == null ? "" : orderInfo.AddressProvince;
          var city = orderInfo.AddressCity == null ? "" : orderInfo.AddressCity;
          var area = orderInfo.AddressArea == null ? "" : orderInfo.AddressArea;
          var detail = orderInfo.AddressAdd == null ? "" : orderInfo.AddressAdd;

          orderInfo.Address =  province + city + area + detail;

          that.setData({
            orderDetail: orderInfo
          });
        }
      })
    },
    wuliuDetailsTap:function(e){
      var orderId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: "/pages/wuliu/index?id=" + orderId
      })
    },
    confirmBtnTap:function(e){
      let that = this;
      let orderId = this.data.orderId;
      let formId = e.detail.formId;
      wx.showModal({
          title: '确认您已收到商品？',
          content: '',
          success: function(res) {
            if (res.confirm) {
              wx.showLoading();
              wx.request({
                url: app.globalData.urls + '/order/delivery',
                data: {
                  token: app.globalData.token,
                  orderId: orderId
                },
                success: (res) => {
                  if (res.data.code == 0) {
                    that.onShow();
                    // 模板消息，提醒用户进行评价
                    let postJsonString = {};
                    postJsonString.keyword1 = { value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177' }
                    let keywords2 = '您已确认收货，期待您的再次光临！';
                    if (app.globalData.order_reputation_score) {
                      keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score +'积分奖励。';
                    }
                    postJsonString.keyword2 = { value: keywords2, color: '#173177' }
                    app.sendTempleMsgImmediately(app.siteInfo.assessorderkey , formId,
                      '/pages/order-details/index?id=' + orderId, JSON.stringify(postJsonString)) + '&share=1';
                  }
                }
              })
            }
          }
      })
    },
    submitReputation: function (e) {
      let that = this;
      let formId = e.detail.formId;
      let postJsonString = {};
      postJsonString.token = app.globalData.token;
      postJsonString.orderId = this.data.orderId;
      let reputations = [];
      let i = 0;
      while (e.detail.value["orderGoodsId" + i]) {
        let orderGoodsId = e.detail.value["orderGoodsId" + i];
        let goodReputation = e.detail.value["goodReputation" + i];
        let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

        let reputations_json = {};
        reputations_json.id = orderGoodsId;
        reputations_json.reputation = goodReputation;
        reputations_json.remark = goodReputationRemark;

        reputations.push(reputations_json);
        i++;
      }
      postJsonString.reputations = reputations;
      wx.showLoading();
      wx.request({
        url: app.globalData.urls + '/order/reputation',
        data: {
          postJsonString: postJsonString
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data.code == 0) {
            that.onShow();
            // 模板消息，通知用户已评价
            let postJsonString = {};
            postJsonString.keyword1 = { value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177' }
            let keywords2 = '感谢您的评价，期待您的再次光临！';
            if (app.globalData.order_reputation_score) {
              keywords2 += app.globalData.order_reputation_score + '积分奖励已发放至您的账户。';
            }
            postJsonString.keyword2 = { value: keywords2, color: '#173177' }
            app.sendTempleMsgImmediately(app.siteInfo.successorderkey , formId,
              '/pages/order-details/index?id=' + that.data.orderId, JSON.stringify(postJsonString)) + '&share=1';
          }
        }
      })
    }
})