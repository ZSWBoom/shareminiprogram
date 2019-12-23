const app = getApp();
const db = wx.cloud.database();

/**
 * 刷新页面数据
 */
function refreshPageData(page, callback) {
  wx.cloud.callFunction({
    name: 'getActivityDataList'
  }).then(res => {
    var list = res.result.data
    var activities = parseData(list);
      page.setData({
        planActivities: activities
      });
  }).catch(err => {
    console.error(err);
  })
}

function handleSignUpActivity(page, callback) {
  wx.cloud.callFunction({
    name: 'getUserSignUpActivity',
    data: {
      openId: app.globalData.openid
    }
  }).then(res => {
    var arr = res.result.data
    page.setData({
      signUpActivity: arr
    })
  }).catch(err => {
    console.error(err);
  })
}

function handleTitle(data) {
  data.forEach(value => {
    if (value.type == 'activity') { // 分享
      var newTitle1 = value.title;
      var newTitle2 = value.title;
      if (newTitle1.length >= 11) {
        newTitle1 = newTitle1.substring(0, 10)
        value.titlelong = newTitle1 + "...";
      } else {
        value.titlelong = newTitle1;
      }
      if (newTitle2.length >= 8) {
        newTitle2 = newTitle2.substring(0, 7)
        value.title = newTitle2 + "...";
      }
    } 
  });
}

function parseData(data) {
  handleTitle(data)
  var activities = [];
  var attends = [];
  data.forEach(value => {
    console.log("parseData:"+ value.title)
    if (value.type == 'activity') { // 分享
      if (!value.is_done) {
        activities.push(value);
      }
    } else if (value.type == 'attend') { // 参与记录
      attends.push(value);
    }
  });

  var i = 0;
  var j = 0;
  for (i = 0; i < attends.length; i++) {
    for (j = 0; j < activities.length; j++) {
      if (attends[i].activity_id == activities[j]._id) {
        if (!activities[j].attends) {
          activities[j].attends = [];
        }
        activities[j].attends.push(attends[i]);
        break;
      }
    }
  }
  return activities.reverse();
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    signUpActivity: [],
    planActivities: []
  },

  /**
   * 扫二维码签到
   */
  register: function () {
    wx.scanCode({
      success: res => {
        var activityId = res.result;
        var flag = -1;
        this.data.signUpActivity.forEach(value => {
          if (value.activity_id == activityId) {
            wx.cloud.callFunction({
              name: 'isAttendActivity',
              data: {
                activityId: value.activity_id,
                openId: app.globalData.openid
              }
            }).then(res => {
              var commentArr = res.result.data
              if (commentArr.length > 0) {
                wx.showModal({
                  title: '提示',
                  content: '您已签到',
                  showCancel: false,
                })
              } else {
                db.collection('activity').add({
                  data: {
                    activity_id: activityId,
                    type: "attend"
                  },
                  success(res) {
                    wx.showToast({
                      title: "签到成功"
                    })
                  }
                });
              }
            }).catch(err => {
              console.error(err);
            })
            flag = 0;
          }
        })

        if (flag == -1) {
          wx.showModal({
            title: '提示',
            content: '请先报名',
            showCancel: false,
          })
        }
      }
    });
  },

  itemOnclick: function(e) {
    var activity = e.currentTarget.dataset.item;
    app.globalData.selectedTodoActivity = activity;
    //点击计划分享列表项，跳转到详情
    wx.navigateTo({
      url: `../activity_detail/activity_detail?activityId=${activity._id}&isDone=0`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    refreshPageData(this);
    handleSignUpActivity(this);
  },

  onShow: function (){
    refreshPageData(this);
    handleSignUpActivity(this);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
    refreshPageData(this, {
      onFinish: () => {
        wx.stopPullDownRefresh();
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }


})