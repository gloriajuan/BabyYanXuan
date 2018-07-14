var app = getApp();
function wxpay(app, money, orderId, redirectUrl) {
  let remark = "在线充值";
  let nextAction = {};
  if (orderId != 0) {
    remark = "支付订单 ：" + orderId;
    nextAction = { type: 0, id: orderId };
  }
  wx.request({
    url: app.globalData.urls + '/MyWxPay.asmx/GetWxPayUnifiedorder',
    method: 'POST',
    header: {
      "content-type": "application/x-www-form-urlencoded"
    },
    data: {
    },
    success: function(res){
      if (res.data.state == 1){
        // 发起支付
        wx.requestPayment({
          timeStamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.package,
          signType: "MD5",
          paySign: res.data.paySign,
          fail:function (aaa) {
            wx.showToast({title: '支付失败'})
          },
          success:function () {
            wx.showToast({title: '支付成功'})
            wx.reLaunch({
              url: redirectUrl
            });
          }
        })
      } else {
        wx.showToast({ title: '服务器忙' + res.data.state + res.data.message})
      }
    }
  })
}

module.exports = {
  wxpay: wxpay
}
