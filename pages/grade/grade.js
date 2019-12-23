const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    attendId: ""
  },

  formSubmit: function(e) {
    var param = e.detail.value;

    db.collection('activity').doc(this.data.attendId).update({
      data: {
        score: param.score,
        feedback: param.feedback
      },
      success: res => {
        wx.showToast({
          title: '评价完成！',
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var attendId = options.id;
    this.setData({
      attendId: attendId
    })
  }
})