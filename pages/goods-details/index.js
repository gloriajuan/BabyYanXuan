//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    autoplay: true,
    interval: 10000,
    duration: 500,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择规格：",
    selectSizePrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    favicon: 0,
    selectptPrice: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    wxlogin: true,
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (e) {
    var that = this;

    that.setData({
      wxLogin: app.globalData.hasAuthorized
    });
    
    if (e.inviter_id) {
      wx.setStorage({
        key: 'inviter_id_' + e.id,
        data: e.inviter_id
      })
    }
    if (e.share) { that.setData({ share: e.share }); }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'toplogo'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            toplogo: res.data.data[0].picUrl,
            topname: wx.getStorageSync('mallName')
          });
        }
      }
    })
    this.getfav(e);
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/GetMyGoods',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        // GoodId: e.id,
        GoodId:'17'
      },
      success: function (res) {

        if(res.data.state == 1){
          that.data.goodsDetail = res.data.obj;
        }
        
        WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
      }
    })
    this.reputation(e.id);
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  pingtuan: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/open',
      data: {
        token: app.globalData.token,
        goodsId: that.data.goodsDetail.basicInfo.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            pingtuanOpenId: res.data.data.id,
            shopType: "pingtuan"
          });
          that.bindGuiGeTap();
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
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function (e) {
    var that = this;
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].childsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ",";
          propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":" + childs[j].name + "  ";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    if (canSubmit) {
      wx.request({
        url: app.siteInfo.url + app.siteInfo.subDomain + '/shop/goods/price',
        data: {
          goodsId: that.data.goodsDetail.basicInfo.id,
          propertyChildIds: propertyChildIds
        },
        success: function (res) {

          that.setData({
            selectSizePrice: res.data.data.price,
            propertyChildIds: propertyChildIds,
            propertyChildNames: propertyChildNames,
            buyNumMax: res.data.data.stores,
            buyNumber: (res.data.data.stores > 0) ? 1 : 0,
            selectptPrice: res.data.data.pingtuanPrice
          });
        }
      })
    }

    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })

  },
  /**
  * 加入购物车
  */
  addShopCar: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();

    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },
	/**
	  * 立即购买
	  */
  buyNow: function () {
    var that = this;
    if (that.data.goodsDetail.properties && !that.data.canSubmit) {
      wx.hideLoading();
      if (!that.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      that.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (that.data.buyNumber < 1) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    setTimeout(function () {
      wx.hideLoading();
      //组建立即购买信息
      var buyNowInfo = that.buliduBuyNowInfo();
      // 写入本地存储
      wx.setStorage({
        key: "buyNowInfo",
        data: buyNowInfo
      })
      that.closePopupTap();

      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    }, 1000);
    wx.showLoading({
      title: '商品准备中...',
    })

  },
  /**
	  * 一键开团
	  */
  buyPingtuan: function () {
    var that = this;
    if (that.data.goodsDetail.properties && !that.data.canSubmit) {
      wx.hideLoading();
      if (!that.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      that.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (that.data.buyNumber < 1) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    setTimeout(function () {
      wx.hideLoading();
      //组建立即购买信息
      var buyNowInfo = that.bulidupingTuanInfo();
      // 写入本地存储
      wx.setStorage({
        key: "PingTuanInfo",
        data: buyNowInfo
      })
      that.closePopupTap();
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyPT"
      })
    }, 1000);
    wx.showLoading({
      title: '准备拼团中...',
    })
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
	/**
	 * 组建立即购买信息
	 */
  buliduBuyNowInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  bulidupingTuanInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pingtuanId = this.data.pingtuanOpenId;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectptPrice;
    //this.data.goodsDetail.basicInfo.pingtuanPrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + app.globalData.uid + '&share=1',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  reputation: function (goodsId) {
    var that = this;
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/shop/goods/reputation',
      data: {
        goodsId: goodsId
      },
      success: function (res) {
        if (res.data.code == 0) {
          //console.log(res.data.data);
          that.setData({
            reputation: res.data.data
          });
        }
      }
    })
  },
  getfav: function (e) {
    //console.log(e)
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/fav/list',
      data: {
        //nameLike: this.data.goodsDetail.basicInfo.name,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0 && res.data.data.length) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].goodsId == parseInt(e.id)) {
              that.setData({
                favicon: 1
              });
              break;
            }
          }
        }
      }
    })
  },
  fav: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/fav/add',
      data: {
        goodsId: this.data.goodsDetail.basicInfo.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            image: '../../images/active.png',
            duration: 2000
          })
          that.setData({
            favicon: 1
          });
        }
      }
    })
  },
  del: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/fav/delete',
      data: {
        goodsId: this.data.goodsDetail.basicInfo.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '取消收藏',
            icon: 'success',
            image: '../../images/error.png',
            duration: 2000
          })
          that.setData({
            favicon: 0
          });
        }
      }
    })
  },
  getVideoSrc: function (videoId) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/media/video/detail',
      data: {
        videoId: videoId
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            videoMp4Src: res.data.data.fdMp4
          });
        }
      }
    })
  },
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },
  addPingTuan: function (e) {
    var id = e.currentTarget.dataset.id;
    var pid = e.currentTarget.dataset.uid;
    wx.navigateTo({
      url: "/pages/pingtuan/index?id=" + id + "&uid=" + pid + "&gid=" + this.data.goodsDetail.basicInfo.id
    })
  },
  goPingtuanTap: function () {
    wx.navigateTo({
      url: "/pages/pingtuan/index?id=" + this.data.ptuanCt + "&uid=" + app.globalData.uid + "&gid=" + this.data.goodsDetail.basicInfo.id
    })
  },
  onPullDownRefresh: function (e) {
    var that = this;
    that.goPingtuan();
    that.goPingList();
    wx.stopPullDownRefresh();
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (!app.globalData.hasAuthorized) {
        that.setData({
          wxlogin: false
        })
      }
      that.goPingtuan();
      that.goPingList();
    }, 1000)
  },
  userlogin: function (e) {
    var that = this;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    wx.login({
      success: function (wxs) {
        wx.request({
          url: app.globalData.urls + '/user/wxapp/register/complex',
          data: {
            code: wxs.code,
            encryptedData: encryptedData,
            iv: iv
          },
          success: function (res) {
            if (res.data.code != 0) {
              wx.showModal({
                title: '温馨提示',
                content: '需要您的授权，才能正常使用哦～',
                showCancel: false,
                success: function (res) { }
              })
            } else {
              that.setData({ wxlogin: true })
              app.login();
              wx.showToast({
                title: '授权成功',
                duration: 2000
              })
              app.globalData.usinfo = 1;
            }
          }
        })
      }
    })
  },
})
