const app = getApp();

Page({

  data: {
    activity: null,
    average_score: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var activtiy = app.globalData.selectedMyActivity;
    var average_score = 0;

    if (activtiy.attends) {
      var totalScore = 0;
      activtiy.attends.forEach(value => {
        totalScore += parseInt(value.score);
      })
      average_score = totalScore / activtiy.attends.length;
    }

    this.setData({
      activity: activtiy,
      average_score: average_score
    })
  }
})