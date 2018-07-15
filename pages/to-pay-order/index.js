//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，

    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
  },
  onShow: function () {
    //console.log(this.data.orderType)
    var that = this;
    var shopList = [];
    if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      shopList = app.globalData.buyShopCartList;
    }
    that.setData({
      goodsList: shopList,
    });
    //计算商品金额
    var price = 0;
    for (var i = 0; i < that.data.goodsList.length; i++) {
      var curItem = that.data.goodsList[i];
      price += curItem.Number * curItem.Price;
    }
    that.setData({
      allGoodsPrice: price
    });
    that.initShippingAddress();
  },

  onLoad: function (e) {
    //console.log(e)
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  createOrder: function (e) {
    if (!this.data.curAddressData) {
      wx.hideLoading();
      wx.showModal({
        title: '错误',
        content: '请先设置您的收货地址！',
        showCancel: false
      })
      return;
    }
    var strJson="";
    var orderParams = new Object();
    var item=[];
    wx.showLoading();
    var that = this;
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }
    orderParams.addressId = that.data.curAddressData.Id;
    orderParams.expressFee = that.data.yunPrice;
    orderParams.couponId = 0;
    orderParams.message = remark;
    for (var i = 0; i < that.data.goodsList.length; i++) {
      var curItem = that.data.goodsList[i];
      var shopgood = new Object();
      shopgood.cartId = curItem.Id;
        item.push(shopgood);
    }
    orderParams.item = item;
    strJson = JSON.stringify(orderParams);
    console.log("订单====" + strJson);
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/SetOrderInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        strJson: strJson
      },
      success: (res) => {
        if (res.data.state == 1) {
          console.log("下单返回====" + JSON.stringify(res.data));
          wx.redirectTo({
            url: "/pages/order-list/index"
          });
        }
      }
    })
    
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/GetMyAddress',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        UserId: app.globalData.userInfo.Id
      },
      success: (res) => {
        if (res.data.state == 1) {
          var indexAddress = -1;
          for (var i = 0; i < res.data.obj.length; i++) {
            var curItem = res.data.obj[i];
            if (curItem.IsDefault == 1) {
              indexAddress = i;
              break;
            }
          }
          if (indexAddress == -1) {
            that.setData({
              curAddressData: null
            });
          } else {
            that.setData({
              curAddressData: res.data.obj[indexAddress]
            });
          }
        }
        that.processYunfei();
      }
    })
  },
  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var count = 0;
    for (var i = 0; i < goodsList.length; i++) {
      var curItem = goodsList[i];
      count += curItem.Number;
    }
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/GetExpressPrice',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        CityName: that.data.curAddressData.AddressCity,
        count: count
      },
      success: (res) => {
        if (res.data.state == 1) {
          that.setData({
            yunPrice: res.data.ExpressFee
          });
          that.setData({
            allGoodsAndYunPrice: (res.data.ExpressFee + that.data.allGoodsPrice)
          });
        }
      }
    })
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/discounts/my',
      data: {
        token: app.globalData.token,
        status: 0
      },
      success: function (res) {
        if (res.data.code == 0) {
          var coupons = res.data.data.filter(entity => {
            return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
          });
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})