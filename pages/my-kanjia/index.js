const app = getApp()

Page({
  data: {
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    kjgoods: [],
    kjhelp: [],
    pics: {},
    helps: {}
  },

  onLoad() {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/list',
      success: function (res) {
        if (res.data.code == 0 && res.data.data.result.length > 0) {
          var kanjiaid = []
          var goodsid = []
          for (var i = 0; i < res.data.data.result.length; i++) {
            kanjiaid.push(res.data.data.result[i].id);
            goodsid.push(res.data.data.result[i].goodsId)
            that.getgoods(res.data.data.result[i].goodsId)
          }
          that.mykanjia(kanjiaid)
          that.kjhelp(kanjiaid)
        }
      }
    })
  },
  mykanjia: function (e) {
    var that = this;
    var kjgoods = [];
    for (var i = 0; i < e.length; i++) {
      var id = e[i]
      wx.request({
        url: app.globalData.urls + '/shop/goods/kanjia/my',
        data: {
          kjid: id,
          token: app.globalData.token
        },
        success: function (res) {

          if (res.data.code == 0) {
            kjgoods.push(res.data.data)
            that.setData({
              kjgoods: kjgoods
            });
          }
        }
      })
    }
  },
  kjhelp: function (e) {
    var that = this;
    for (var i = 0; i < e.length; i++) {
      var id = e[i]
      wx.request({
        url: app.globalData.urls + '/shop/goods/kanjia/myHelp',
        data: {
          kjid: id,
          token: app.globalData.token,
          joinerUser: app.globalData.uid
        },
        success: function (res) {
          if (res.data.code == 0) {
            that.gethelpkj(id)
            that.gethelpid(res.data.data.goodsId)
          }
        }
      });
    }
  },
  gethelpkj: function (id) {
    var that = this
    var kjhelp = [];
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/info',
      data: {
        kjid: id,
        joiner: app.globalData.uid
      },
      success: function (res) {
        if (res.data.code == 0) {
          kjhelp.push(res.data.data.kanjiaInfo)
          that.setData({
            kjhelp: kjhelp
          });
        }
      }
    })
  },
  getgoods: function (id) {
    var that = this;
    var pics = that.data.pics;
    wx.request({
      url: app.globalData.urls + '/shop/goods/detail',
      data: {
        id: id
      },
      success: function (res) {
        if (res.data.code == 0) {
          pics[id] = res.data.data.basicInfo
          that.setData({
            pics: pics,
          });
        }
      }
    })
  },
  gethelpid: function (id) {

    var that = this;
    var helps = that.data.helps;
    wx.request({
      url: app.globalData.urls + '/shop/goods/detail',
      data: {
        id: id
      },
      success: function (res) {
        if (res.data.code == 0) {
          helps[id] = res.data.data.basicInfo
          that.setData({
            helps: helps,
          });
        }
      }
    })
  },
  gokj: function (e) {
    var id = e.currentTarget.dataset.id
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/join',
      data: {
        kjid: id,
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
  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  }

})