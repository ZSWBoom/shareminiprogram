const app = getApp();
const db = wx.cloud.database();

/**
 * 刷新页面数据
 */
function refreshPageData(page) {
  wx.cloud.callFunction({
    name: 'getActivityDataList'
  }).then(res => {
    console.log(res)
    var list = res.result.data
    var activities = parseData(list);
    console.log(activities)
    page.setData({
      activities: activities
    });
  }).catch(err => {
    console.error(err);
  })

  // db.collection('activity').get({
  //   success: res => {
  //     var activities = parseData(res.data);
  //     page.setData({
  //       activities: activities
  //     });
  //   }
  // });
}

function handleTitle(data) {
  data.forEach(value => {
    if (value.type == 'activity') { // 分享
      var newTitle1 = value.title;
      var newTitle2 = value.title;
      if (newTitle1.length >= 8) {
        newTitle1 = newTitle1.substring(0, 7)
        value.titlelong = newTitle1 + "...";
      } else {
        value.titlelong = newTitle1;
      }
      if (newTitle2.length >= 6) {
        newTitle2 = newTitle2.substring(0, 5)
        value.title = newTitle2 + "...";
      }
    }
  });
}

function parseData(data) {
  handleTitle(data);
  var activities = [];
  var attends = [];
  data.forEach(value => {
    if (value.type == 'activity') { // 分享
      activities.push(value);
    } else if (value.type == 'attend') { // 参与记录
      attends.push(value);
    }
  });

  var attendActivity = [];

  var i = 0;
  var j = 0;
  console.log(attends)
  for (i = 0; i < attends.length; i++) {
    if (attends[i]._openid == app.globalData.openid) { // 我参与的
      for (j = 0; j < activities.length; j++) {
        if (attends[i].activity_id == activities[j]._id) {
          activities[j].attends = attends[i];
          attendActivity.push(activities[j]);
          break;
        }
      }
    }
  }
  return attendActivity.reverse();
}

Page({

  data: {
    activities: []
  },

  /**
   * 去评价
   */
  gotoGrade: function(e) {
    var activity = e.currentTarget.dataset.item;
    app.globalData.selectedTodoActivity = activity;

    //点击计划分享列表项，跳转到详情
    wx.navigateTo({
      url: `../activity_detail/activity_detail?activityId=${activity._id}&isDone=1`,
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    refreshPageData(this);
  }
})