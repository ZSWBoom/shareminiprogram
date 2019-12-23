const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBtnClicked: false
  },

  /**
   * 提交意见
   */
  formSubmit: function(e) {
    util.buttonClicked(this, () => {
      var param = e.detail.value;
      app.globalData.key = param.content;
      const db = wx.cloud.database();
      db.collection('feedback').add({
        data: {
          content: param.content
        },
        success(res) {
          wx.showToast({
            title: "感谢您的反馈"
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500);
        }
      })
    }, 2000)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  }
})