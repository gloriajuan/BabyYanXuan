//index.js
//获取应用实例
var app = getApp();

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
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false,
    shopCarInfo: {},
    shopType: "addShopCar",
    selectptPrice: 0,
    wxlogin: true,
    sharebox: true,
    sharecode: true
  },

  onLoad: function (e) {
    var that = this;
    if (!e.id) { //扫码进入
      var scene = decodeURIComponent(e.scene);
      if (scene.length > 0 && scene != undefined) {
        var scarr = scene.split(',');
        var dilist = [];
        for (var i = 0; i < scarr.length; i++) {
          dilist.push(scarr[i].split('='))
        }
        if (dilist.length > 0) {
          var dict = {};
          for (var j = 0; j < dilist.length; j++) {
            dict[dilist[j][0]] = dilist[j][1]
          }
          var ptid = dict.i;
          var ktid = dict.u;
          var gdid = dict.g;
          that.setData({
            ptid: dict.i,
            ktid: dict.u,
            gdid: dict.g,
            userId: app.globalData.uid
          })
        }
      }
    }
    if (!e.scene) { //链接进入
      var ptid = e.id;
      var ktid = e.uid;
      var gdid = e.gid;
      that.setData({
        ptid: e.id,
        ktid: e.uid,
        gdid: e.gid,
        userId: app.globalData.uid
      })
    }
    if (e.share) { that.setData({ share: e.share }); }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    //首页顶部Logo
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
    wx.request({
      url: app.globalData.urls + '/shop/goods/detail',
      data: {
        id: gdid
      },
      success: function (res) {
        var selectSizeTemp = "";
        if (res.data.data.properties) {
          for (var i = 0; i < res.data.data.properties.length; i++) {
            selectSizeTemp = selectSizeTemp + " " + res.data.data.properties[i].name;
          }
          that.setData({
            hasMoreSelect: true,
            selectSize: that.data.selectSize + selectSizeTemp,
            selectSizePrice: res.data.data.basicInfo.minPrice,
            selectptPrice: res.data.data.basicInfo.pingtuanPrice
          });
        }
        that.data.goodsDetail = res.data.data;
        that.setData({
          goodsDetail: res.data.data,
          selectSizePrice: res.data.data.basicInfo.minPrice,
          buyNumMax: res.data.data.basicInfo.stores,
          buyNumber: (res.data.data.basicInfo.stores > 0) ? 1 : 0,
          selectptPrice: res.data.data.basicInfo.pingtuanPrice
        });
      }
    });
    wx.request({
      url: app.globalData.urls + '/qrcode/wxa/unlimit',
      data: {
        scene: "i=" + that.data.ptid + ",u=" + that.data.ktid + ",g=" + that.data.gdid,
        page: "pages/pingtuan/index",
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.downloadFile({
            url: res.data.data,
            success: function (res) {
              that.setData({
                codeimg: res.tempFilePath
              });
            }
          })
        }
      }
    });
    that.goPingtuanSet();
    that.goPingtuanJoiner();
    that.goPingtuanList();
  },
  goPingtuanSet: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/set',
      data: {
        goodsId: that.data.gdid
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            ptuanSet: res.data.data
          });
        }
      }
    });
  },
  goPingtuanJoiner: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/joiner',
      data: {
        tuanId: that.data.ptid
      },
      success: function (res) {
        if (res.data.code == 0) {
          var ptuaninfo = res.data.data;
          ptuaninfo.sort().reverse();
          that.setData({
            ptuaninfo: res.data.data
          });
        }
        for (var i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].uidHelp == that.data.userId) {
            that.setData({
              ptuaninfoUs: res.data.data[i]
            });
          }
        }
      }
    });
  },
  goPingtuanList: function () {
    var that = this;
    var ktid = that.data.ktid;
    var timestamp = Date.parse(new Date()) / 1000;
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/list',
      data: {
        goodsId: that.data.gdid
      },
      success: function (res) {
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (ktid == res.data.data[i].uid) {
              that.setData({
                pingList: res.data.data[i]
              });
              var enddate = res.data.data[i].dateEnd;
              enddate = enddate.replace(/-/g, '/');
              var times = Date.parse(new Date(enddate)) / 1000;
              var ptime = times - timestamp;
              var interval = setInterval(function () {
                var second = ptime;
                var day = Math.floor(second / 3600 / 24);
                var dayStr = day.toString();
                if (dayStr.length == 1) dayStr = '0' + dayStr;
                var hr = Math.floor((second - day * 3600 * 24) / 3600);
                var hrStr = hr.toString();
                if (hrStr.length == 1) hrStr = '0' + hrStr;
                var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
                var minStr = min.toString();
                if (minStr.length == 1) minStr = '0' + minStr;
                var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
                var secStr = sec.toString();
                if (secStr.length == 1) secStr = '0' + secStr;
                that.setData({
                  countDownDay: dayStr,
                  countDownHour: hrStr,
                  countDownMinute: minStr,
                  countDownSecond: secStr,
                });
                ptime--;
                if (ptime < 0) {
                  clearInterval(interval);
                  that.setData({
                    countDownDay: '00',
                    countDownHour: '00',
                    countDownMinute: '00',
                    countDownSecond: '00',
                  });
                }
              }.bind(that), 1000);
            }
          }
        }
      }
    })
  },
  goPingtuan: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/set',
      data: {
        goodsId: that.data.goodsDetail.basicInfo.id,
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            pingtuan: res.data.data
          });
        }
      }
    })
  },
  goPingList: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/pingtuan/list',
      data: {
        goodsId: that.data.goodsDetail.basicInfo.id,
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            pingList: res.data.data
          });

        }
      }
    })
  },
  pingtuan: function () {
    var that = this;
    setTimeout(function () {
      wx.hideLoading();
      that.setData({
        shopType: "pingtuan"
      });
      that.bindGuiGeTap();
    }, 1000);
    wx.showLoading({
      title: '准备拼团中...',
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
        url: app.globalData.urls + '/shop/goods/price',
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
	  * 一键开团
	  */
  buyPingtuan: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
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
    //组建立即购买信息
    var buyNowInfo = this.bulidupingTuanInfo();
    // 写入本地存储
    wx.setStorage({
      key: "PingTuanInfo",
      data: buyNowInfo
    })
    this.closePopupTap();
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyPT"
    })
  },
	/**
	 * 组建拼团购买信息
	 */
  bulidupingTuanInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pingtuanId = this.data.ptid;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; //规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectptPrice;
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
    var that = this;
    that.setData({
      sharebox: true
    })
    return {
      title: '快来和我一起拼：' + that.data.goodsDetail.basicInfo.name,
      path: '/pages/pingtuan/index?id=' + that.data.ptid + '&uid=' + that.data.ktid + '&gid=' + that.data.gdid + '&share=1',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  getshare: function () {
    this.setData({
      sharebox: false
    })
  },
  closeshare: function () {
    this.setData({
      sharebox: true,
      sharecode: true
    })
  },
  getcode: function () {
    this.setData({
      sharecode: false,
      sharebox: true
    })
  },
  savecode: function () {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.codeimg,
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
    that.setData({
      sharecode: true,
    })
  },
  goodsTap: function () {
    var gdid = this.data.gdid;
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + gdid
    })
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
      }
      that.goPingtuanSet();
      that.goPingtuanJoiner();
      that.goPingtuanList();
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
