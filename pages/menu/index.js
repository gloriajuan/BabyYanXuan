//index.js
var app = getApp()
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 8000,
    duration: 800,
    swiperCurrent: 0,
    selectCurrent: 0,
    activeCategoryId: 0,
    loadingMoreHidden: true,
    search: true,
    nonehidden: true,
    searchidden: true
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  levelClick: function (e) {
    wx.navigateTo({
      url: "/pages/menu-list/index?id=" + e.currentTarget.dataset.id
    })
  },
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  search: function(e){
    var that = this
    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/SearchGoodsInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        Title: e.detail.value
      },
      success: function (res) {
        if (res.data.state == 1) {
          var searchs = [];
          for (var i = 0; i < res.data.obj.length; i++) {
            searchs.push(res.data.obj[i]);
          }
          that.setData({
            searchs: searchs,
            searchidden: false,
            nonehidden: true
          });
        }else{
          that.setData({
            searchidden: true,
            nonehidden: false
          });
        }
      }
    })
    
  },
  searchfocus: function(){
    this.setData({
      search: false,
      searchinput: true
    })
  },
  searchclose: function(){
    this.setData({
      search: true,
      searchinput: false
    })
  },
  onLoad: function () {
    wx.showLoading();
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.search('iPhone X') != -1) {
          that.setData({
            iphone: "iphoneTop",
            iponesc: "iphonesearch"
          });
        }
      }
    })
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyFirstType',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        var categories = [{ Id: 0, Name: "所有分类" }];
        if (res.data.state == 1) {
          wx.hideLoading();
          for (var i = 0; i < res.data.obj.length; i++) {
            if (res.data.obj[i].PId == 0) {
              categories.push(res.data.obj[i]);

              wx.request({
                url: app.globalData.urls + '/MyBill.asmx/GetMyFirstTypeBill',
                method: "POST",
                header: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                data: {
                  FirstTypeId: res.data.obj[i].Id
                },
                success: function (res) {
                  if (res.data.state == 0) {
                    var banner = {};
                    banner.ImgUrl = "http://myadm.holdcity.com/GoodsImg/20180624/201806242245158606.jpg";
                    banner.Id=1;

                    var arrbanners = [];
                    arrbanners.push(banner);

                    that.setData({
                      banners: arrbanners//res.data.obj
                    });
                  }
                }
              })
            }
          }
        }//
        that.setData({
          categories: categories,
          activeCategoryId: 0
        });
        that.getGoodsList(0);
      }
    })
  },
  getGoodsList: function (categoryId) {
    // if (categoryId == 0) {
    //   categoryId = "";
    // }
    var that = this;
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMySecondType',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data:{
        FirstTypeId:categoryId
      },
      success: function (res) {
        var categorieslist = [];
        if (res.data.state == 1) {
          for (var i = 0; i < res.data.obj.length; i++) {
            if (categoryId != 0) {
              if (res.data.obj[i].PId == categoryId) {
                categorieslist.push(res.data.obj[i]);
              }
            } else {
              categorieslist.push(res.data.obj[i]);
              // if (res.data.data[i].PId != 0) {
              //   categorieslist.push(res.data.obj[i]);
              // }
            }
          }
        }//
        that.setData({
          categorieslist: categorieslist,
        });
      }
    })
  },
  toDetailsTap: function (e){
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
    this.setData({
      search: true,
      searchinput: false
    })
  }

})