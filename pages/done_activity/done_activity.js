const db = wx.cloud.database();
const app = getApp();

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
  //     callback.onFinish();
  //   }
  // });
}

function parseData(data) {
  handleTitle(data);
  var activities = [];
  var attends = [];
  data.forEach(value => {
    if (value.type == 'activity') { // 分享
      if (value.is_done) {
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

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activities: []
  },
  
  itemOnclick: function (e) {
    var activity = e.currentTarget.dataset.item;
    app.globalData.selectedTodoActivity = activity;
    //点击计划分享列表项，跳转到详情
    wx.navigateTo({
      url: `../activity_detail/activity_detail?activityId=${activity._id}&isDone=1`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    refreshPageData(this);
  },

  onShow: function () {
    refreshPageData(this);
  },

  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
    refreshPageData(this, {
      onFinish: () => {
        wx.stopPullDownRefresh();
      }
    })
  }
})