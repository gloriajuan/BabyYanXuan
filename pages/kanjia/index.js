//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    id: null,//商品id
    share: 0,
    userID: 0,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    wxlogin: true,
    kanjiashare: true,//发起砍价 or 邀请好友砍价弹窗
    helpkanjiashare: true,//受邀砍价弹窗
    victorykanjia: true, //砍价成功弹窗
    postershow: true, //生成海报弹窗

    x: 0,
    y: 0,
    hidden: true,
    OriPrice: 0, //原价
    curPricese: 0,//当前价
    onPrice: 0,//已砍
    getPrice: 0,//还差
  },

  //砍价弹窗
  kanjiashow: function () {
    this.setData({
      kanjiashare: false
    })
  },
  closevictory: function () {
    this.setData({
      victorykanjia: true
    })
  },
  //发起砍价 or 邀请好友砍价弹窗
  getshare: function () {
    this.setData({
      kanjiashare: false
    })
  },
  //关闭发起砍价 or 关闭邀请好友砍价弹窗
  closeShare: function () {
    this.setData({
      kanjiashare: true,
    })
  },
  //关闭受邀砍价弹窗
  closeHelp: function () {
    this.setData({
      helpkanjiashare: true,
    })
  },
  //生成海报弹窗
  showposter: function () {
    this.setData({
      kanjiashare: true,
      postershow: false,
    });
  },
  closecode: function () {
    this.setData({
      postershow: true,
    });
  },
  //保存海报并关闭弹窗
  saveposter: function () {
    var that = this;
    console.log(that.data.codeimg)
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
      postershow: true,
    })
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
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
      }
    }, 1000)
  },
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    var timestamp = Date.parse(new Date()) / 1000;
    //判断用户是否登录
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
      }
    }, 1000)
    //首页顶部Logo
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'toplogo'
      },
      success: function (res) {
        if (res.data.code == 0 && app.globalData.system != 'key') {
          that.setData({
            toplogo: res.data.data[0].picUrl,
            topname: wx.getStorageSync('mallName')
          });
        }
      }
    })
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
          that.data.id = dict.i;
          that.data.kjId = dict.k;
          that.data.joiner = dict.j;
          that.data.share = dict.s;
        }
      }
      if (dict.s == 1) {
        setTimeout(function () {
          that.setData({
            helpkanjiashare: false
          })
        }, 800
        )
      }
    }
    if (!e.scene) { //链接进入
      that.data.id = e.id;
      that.data.kjId = e.kjId;
      that.data.joiner = e.joiner;
      that.data.share = e.share;
      if (e.share == 1) {
        setTimeout(function () {
          that.setData({
            helpkanjiashare: false
          })
        }, 800
        )
      }
    }
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/list',
      success: function (res) {
        for (var i = 0; i < res.data.data.result.length; i++) {
          if (res.data.data.result[i].goodsId == that.data.id) {
            that.setData({
              //EndTime: res.data.data.result[i].dateEnd,
              OriPrice: res.data.data.result[i].originalPrice,
            });
            var enddate = res.data.data.result[i].dateEnd;
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
    })
    wx.request({
      url: app.globalData.urls + '/shop/goods/detail',
      data: {
        id: that.data.id
      },
      success: function (res) {
        that.setData({
          goodsDetail: res.data.data,
        });
      }
    })
    wx.request({
      url: app.globalData.urls + '/qrcode/wxa/unlimit',
      data: {
        scene: "k=" + that.data.kjId + ",j=" + that.data.joiner + ",i=" + that.data.id + ",s=1",
        page: "pages/kanjia/index"
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
    })
    setTimeout(function () {//延迟执行，否则会获取不到正确的砍价金额
      that.setData({ userID: app.globalData.uid });//用户ID
      that.getKanjiaInfo(that.data.kjId, that.data.joiner);
      that.getKanjiaInfoMyHelp(that.data.kjId, that.data.joiner);
    }, 300)
  },
  //下拉刷新砍价人数
  onPullDownRefresh: function () {
    var that = this;
    var kjId = that.data.kjId;
    var joiner = that.data.joiner;

    that.getKanjiaInfo(kjId, joiner);
    wx.stopPullDownRefresh();
  },
  getgoods: function () {
    var that = this;
    wx.navigateTo({
      url: "/pages/kanjia-goods/index?id=" + that.data.id
    })
  },
  getkanjia: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/join',
      data: {
        kjid: that.data.kjId,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.navigateTo({
            url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId
          })
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
  onShareAppMessage: function () {
    var that = this;
    that.setData({
      kanjiashare: true
    });
    return {
      title: "我发现一件好货，来帮我砍价吧～",
      path: "/pages/kanjia/index?kjId=" + that.data.kjId + "&joiner=" + that.data.joiner + "&id=" + that.data.id + "&share=1",
      success: function (res) {
        // 转发成功
        that.setData({
          kanjiashare: true
        });
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getKanjiaInfo: function (kjid, joiner) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/info',
      data: {
        kjid: kjid,
        joiner: joiner,
      },
      success: function (res) {
        var shareId = that.data.share;
        if (res.data.code == 0 && app.globalData.system != 'key') {
          that.setData({
            kjcurPrice: res.data.data.kanjiaInfo.curPrice
          });
        }
        if (res.data.data.kanjiaInfo.helpNumber == 0 && shareId != 1) {
          setTimeout(function () {
            that.setData({
              kanjiashare: false
            });
          }, 800
          )
        }
        if (res.data.code == 0) {   //
          var getPrice = (res.data.data.kanjiaInfo.curPrice - res.data.data.kanjiaInfo.minPrice).toFixed(2) //计算还差结果保留2位小数
          that.setData({
            kanjiaInfo: res.data.data,
            curPricese: res.data.data.kanjiaInfo.curPrice,
            minPricese: res.data.data.kanjiaInfo.minPrice,
            getPrice: getPrice
          });
          var onPrice = (that.data.OriPrice - that.data.curPricese).toFixed(2)  //计算已砍结果保留2位小数
          that.setData({
            onPrice: onPrice,
          });
        }
      }
    })
  },
  getKanjiaInfoMyHelp: function (kjid, joiner) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/myHelp',
      data: {
        kjid: kjid,
        joinerUser: joiner,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0 && app.globalData.system != 'key') {
          that.setData({
            kanjiaInfoMyHelp: res.data.data
          });
        }
      }
    })
  },
  helpKanjia: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/help',
      data: {
        kjid: that.data.kjId,
        joinerUser: that.data.joiner,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code != 0 && app.globalData.system != 'key') {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        that.setData({
          mykanjiaInfo: res.data.data,
          helpkanjiashare: true,
          victorykanjia: false
        });
        that.getKanjiaInfo(that.data.kjId, that.data.joiner);
        that.getKanjiaInfoMyHelp(that.data.kjId, that.data.joiner);
      }
    })
  },
  gopay: function () {
    var id = this.data.id;
    var buykjInfo = this.buliduBuykjInfo();
    wx.setStorage({
      key: "buykjInfo",
      data: buykjInfo
    })

    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buykj"
    })
  },
  buliduBuykjInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.kjid = this.data.kjId;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.kanjiaInfo.kanjiaInfo.curPrice//this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = 1//this.data.buyNumber;
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
  }
})
