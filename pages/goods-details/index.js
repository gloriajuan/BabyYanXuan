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
    GoodId:'',
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
    isNormSeleced: true,
    isColorSelected: true,
    selectedNorm: {},
    selectedColor: null,
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

    that.data.GoodId = e.id;

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
    // 获取购物车数据
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/GetCartNumber',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        UserId: app.globalData.userInfo.Id
      },
      success: function (res){
        if(res.data.state == 1){
          that.setData({
            shopNum: res.data.CartNumber
          });
        }
      }
    })
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/GetMyGoods',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        GoodId: e.id
      },
      success: function (res) {

        if(res.data.state == 1){
          that.data.goodsDetail = res.data.obj;

          that.setData({
            goodsDetail: that.data.goodsDetail,
            selectSizePrice: that.data.goodsDetail.OriginalPrice
          });

          wx.request({
            url: app.globalData.urls + '/MyGoods.asmx/GetMyGoodsNorm',
            method: "POST",
            header: {
              "content-type": "application/x-www-form-urlencoded"
            },
            data: {
              GoodId: e.id
            },
            success: function (res) {

              if (res.data.state == 1) {
                that.data.goodsDetail.arrNormInfo = res.data.obj.norm;
                if (that.data.goodsDetail.arrNormInfo && that.data.goodsDetail.arrNormInfo.length > 0){
                  that.data.goodsDetail.hasNormal = false;
                }
                that.data.goodsDetail.arrColor = res.data.obj.color;
                if (that.data.goodsDetail.arrColor && that.data.goodsDetail.arrColor.length > 0) {
                  that.data.isColorSelected = false;
                }else{
                  that.data.goodsDetail.arrColor = null;
                }

                that.setData({
                  goodsDetail: that.data.goodsDetail,
                  hasMoreSelect: true,
                  selectSizePrice: that.data.goodsDetail.OriginalPrice
                });
                
              }
            }
          })

        }

        WxParse.wxParse('article', 'html', res.data.obj.Detail, that, 5);
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
  normalTap: function (e) {
    var that = this;
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.arrNormInfo;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.arrNormInfo[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.arrNormInfo[e.currentTarget.dataset.propertychildindex].active = true;
    that.data.isNormSeleced = true;

    var normInfo = that.data.goodsDetail.arrNormInfo[e.currentTarget.dataset.propertychildindex];
    that.data.selectedNorm = normInfo;
    that.data.selectSizePrice = normInfo.NowPrice;
    that.data.buyNumMax = normInfo.Number;
    if (that.data.buyNumber > that.data.buyNumMax){
      that.data.buyNumber = that.data.buyNumMax;
    }

    that.setData({
      goodsDetail: that.data.goodsDetail,
      buyNumber: that.data.buyNumber,
      selectSizePrice: that.data.selectSizePrice
    });

  },

  /**
     * 选择颜色
     * @param {Object} e
     */
  colorTap: function (e) {
    var that = this;
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.arrColor;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.arrColor[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.arrColor[e.currentTarget.dataset.propertychildindex].active = true;
    that.data.isColorSelected = true;

    var colorInfo = that.data.goodsDetail.arrColor[e.currentTarget.dataset.propertychildindex];
    that.data.selectedColor = colorInfo;
   
    that.setData({
      goodsDetail: that.data.goodsDetail,
    });

  },

  /**
  * 加入购物车
  */
  addShopCar: function () {
    if (this.data.goodsDetail.arrNormInfo) {
      
      if (!this.data.isNormSeleced || !this.data.selectedNorm) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
        this.bindGuiGeTap();
        return;
      }
    }

    if (this.data.goodsDetail.arrColor) {

      if (!this.data.isColorSelected || !this.data.selectedColor) {
        wx.showModal({
          title: '提示',
          content: '请选择颜色！',
          showCancel: false
        })
        this.bindGuiGeTap();
        return;
      }
      
    }

    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      this.bindGuiGeTap();
      return;
    }

    var norm = this.data.goodsDetail.arrNormInfo[0];

    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/AddMyCart',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        UserId: app.globalData.userInfo.Id,
        BusinessId: this.data.goodsDetail.BusinessId,
        GoodsId: this.data.GoodId,
        FirstNormId: this.data.selectedNorm.FirstNormId,
        FirstNormName: this.data.selectedNorm.NormName,
        SecondNormId: this.data.selectedColor == null ? 0 : this.data.selectedColor.SecondNormId,
        SecondNormName: this.data.selectedColor == null ? '' : this.data.selectedColor.ColorName,
        Number: this.data.buyNumber
      },
      success: function (res) {

        if (res.data.state == 1) {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
          })
        }else{
          wx.showToast({
            title: '加入购物车失败',
            icon: 'fail',
            duration: 2000
          })
        }
      }
    })
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
