//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    flag: true,
    indicatorDots: true,
    autoplay: true,
    interval: 6000,
    duration: 800,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: "0",
    loadingMoreHidden: true,
    hasNoCoupons: true,
    coupons: [],
    searchInput: '',
    wxlogin: true,
    hovercoupons: true,
    iphone: false
  },

  //事件处理函数
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  toTopic: function (e) {
    wx.navigateTo({
      url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  kanjiaTap: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/pingtuan-list/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  tapSales: function () {
    //去特惠列表
    wx.navigateTo({
      url: "/pages/menu-list/index?type=2"
    })
  },
  tapTopic: function (){
    //去专题列表
    wx.navigateTo({
      url: "/pages/topic-list/index?type=2"
    })
  },
  tapRecommend: function(){
    //去人气推荐列表
    wx.navigateTo({
      url: "/pages/menu-list/index?type=4"
    })    
  },
  signInToGetIntergal: function () {
    //去签到界面
    wx.navigateTo({
      url: "/pages/score/index?id="
    }) 
  },
  goToRedBag: function () {
    //红包
    var that = this;
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetRedPackTimeInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        UserId: app.globalData.userInfo.Id
      },
      success: function (res) {
        if (res.data.state == 1) {
          var value1 = res.data.Value1;
          wx.showModal({
            title: '提示',
            content: value1,
            showCancel: false
          })
        }else{
          wx.showToast({
            title: '服务器忙，请稍后再试!',
            icon: 'fail',
            duration: 2000
          })
        }
      }
    })
  },
  tapButton: function(e){
    var that = this;
    //四个按钮事件
    var buttonType = e.currentTarget.dataset.id;
    switch(buttonType){
      case 1:
        //签到
        that.signInToGetIntergal();
        break;
      case 2:
        //红包
        that.goToRedBag();
        break;
      case 3:
        //热卖
        that.tapRecommend();
        break;
      case 4:
        //专题
        that.tapTopic();
        break;
    }
  },
  //弹窗优惠券关闭按钮
  hide: function () {
    this.setData({ hovercoupons: true })
  },
  //用户自主领取优惠券
  newCoupon: function (e) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,//优惠券id
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功领取',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            flag: true
          })
        }
      }
    })
  },
  login: function () {
    var that = this;
    wx.login({
      success: function (res) {
        wx.request({
          url: app.globalData.urls + "/MyBill.asmx/GetWxOpenId",
          method: "POST",
          header: {
            "content-type": "application/x-www-form-urlencoded"
          },
          data: {
            appid: 'wxa4138ba5e260a760',
            secret: '82da0d7ca8fb21234319d3de058743a7',
            js_code: res.code
          },
          success: function (res) {
            if (res.data.state == 1) {
              app.globalData.usinfo = 0;
              app.globalData.openId = JSON.parse(res.data.JsonStr).openid;
              app.globalData.unionId = JSON.parse(res.data.JsonStr).unionid;

              that.getAuthuriseInfo();
              return;
            }else if (res.data.state == 0) {
              wx.hideLoading();
              wx.showModal({
                title: "提示",
                content: "无法登录，请重试",
                showCancel: false
              });
              return;
            }
          }
        });
      }
    });
  },
  getAuthuriseInfo: function () {
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              //调用我们的getUserInfo接口
              that.saveUserInfo(res.userInfo);
            }
          })

          app.globalData.hasAuthorized = true;

          that.setData({
            wxLogin: app.globalData.hasAuthorized
          });

        } else {
          //未授权
          // wx.authorize({
          //   scope: '',
          // })

          app.globalData.hasAuthorized = false;

          that.setData({
            wxLogin: app.globalData.hasAuthorized
          });
        }
      }
    })
  },

  saveUserInfo: function (userInfo) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/MyUserInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        OpenId: app.globalData.openId,
        UnionId: app.globalData.unionId,
        UserName: userInfo.nickName,
        HeadImgUrl: userInfo.avatarUrl
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.state == 1) {
          var Id = res.data.obj.Id;
          userInfo.Id = Id;
          userInfo.CartNumber = res.data.obj.CartNumber;
          userInfo.Score = res.data.obj.Score;
          userInfo.SignDay = res.data.obj.SignDay;
          userInfo.IsSign = res.data.obj.IsSign;
          app.globalData.userInfo = userInfo;
        }
      },
      fail: function(res){
        wx.hideLoading();
      }
    })
  },

  userlogin: function (e) {
    var that = this;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    var userInfo = e.detail.userInfo;

    var openId = app.globalData.openId;

    if(null == openId){
      return;
    }

    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/MyUserInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        OpenId: openId,
        UserName: userInfo.nickName,
        HeadImgUrl:userInfo.avatarUrl
      },
      success: function (res) {
        if (res.data.state == 1) {
          var Id = res.data.obj.Id;
          userInfo.Id = Id;
          userInfo.CartNumber = res.data.obj.CartNumber;
          userInfo.Score = res.data.obj.Score;
          userInfo.SignDay = res.data.obj.SignDay;
          app.globalData.userInfo = userInfo;
          that.setData({
              userInfo:userInfo
          });
        }
      }
    })
  },
  onShow: function () {
  },
  onLoad: function () {
    var that = this;

    // wx.showLoading();

    that.login();
    // checkAuthetication();

    if (app.globalData.iphone==true){
      that.setData({iphone:true})
    }
    //首页幻灯片
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '1'
      },
      success: function (res) {
        if (res.data.state == 1) {
            that.setData({
              banners: res.data.obj
            });
        }
      }
    })
    //获取4个button
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetTopButtonInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            sales: res.data.obj
          });
        }
      }
    })
    //获取特惠商品信息
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '2'
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            toptuan: res.data.obj
          });
        }
      }
    })
    //获取精选专题信息
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '3'
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            toptopics: res.data.obj
          });
        }
      }
    })
    //获取推荐商品信息
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '4'
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            topgoods: res.data.obj
          });
        }
      }
    })

    //新用户领取优惠券
    setTimeout(function () {
      wx.request({
        url: app.globalData.urls + '/banner/list',
        data: {
          key: 'mallName',
          type: 'newcoupons'
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.request({//识别用户是否可以领取优惠券
              url: app.globalData.urls + '/discounts/fetch',
              data: {
                id: res.data.data[0].businessId,//优惠券id
                token: app.globalData.token,
                detect: true
              },
              success: function (res) {
                if (res.data.code == 0) {
                  that.setData({ flag: false })
                }
              }
            });
            that.setData({
              newcoupons: res.data.data[0]
            });
          }
        }
      })
    }, 500
    )
  },
  hoverNewcoupons: function () {
    this.setData({ hovercoupons: false })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '—' + app.globalData.share,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onPageScroll: function (t) {
    if (this.data.iphone == true && t.scrollTop >= 280) {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "scrollTop",
        naviphone: "iphneTop"
      })
    }
    if (t.scrollTop >= 280) {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "scrollTop"
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "",
        naviphone: ""
      })
    }
  }
})
