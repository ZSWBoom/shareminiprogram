// pages/activity_detail/activity_detail.js
const app = getApp();
const db = wx.cloud.database();

function isSignUp(page, callback) {
  wx.cloud.callFunction({
    name: 'getSignUpDataList',
    data: {
      activityId: page.data.activityId
    }
  }).then(res => {
    console.log("+++++++++++++++++++++")
    console.log(res.result.data)
    var arr = res.result.data
    var result = 0;
    if (arr.length > 0) {
      var count = arr.length
      page.setData({
        signUpCount: count
      })
      arr.forEach(value => {
        if (value._openid == app.globalData.openid) {
          page.setData({
            haveSignUp: 1
          })
          result = 1;
        }
      });
  }


    if (result == 0) {
      page.setData({
        haveSignUp: -1
      })
    }
  }).catch(err => {
    console.error(err);
  })

  // db.collection('activity').where({
  //   activity_id: page.data.activityId,
  //   type: 'signup',
  // }).get({
  //  success(res) {
      // console.log(res)
      // var arr = res.data
      // if (arr.length > 0) {
      //   var count = arr.length
      //   page.setData({
      //     signUpCount: count
      //   })
      //   arr.forEach(value =>{
      //     if (value._openid == app.globalData.openid){
      //       page.setData({
      //         haveSignUp: true
      //       })
      //     }
      //   });
      // } else {
      //   page.setData({
      //     haveSignUp: false
      //   })
      // }
  //   }, fail(res) {
  //     console.log(">>>>>>>" + res)
  //   }
  // })
}

function isAttendActicity(page, callback){
  wx.cloud.callFunction({
    name: 'isAttendActivity',
    data: {
      activityId: page.data.activityId,
      openId: app.globalData.openid
    }
  }).then(res => {
    console.log(res)
    var commentArr = res.result.data
    if (commentArr.length > 0) {
      page.setData({
        canComment: true
      })
    } else {
      page.setData({
        canComment: false
      })
    }
  }).catch(err => {
    console.error(err);
  })

//   db.collection('activity').where({
//     activity_id: page.data.activityId,
//     type: 'attend',
//     _openid: app.globalData.openid
//   }).get({
//     success(res){
//       console.log(res)
//       var commentArr = res.data
//       if (commentArr.length > 0){
//         page.setData({
//           canComment:true
//         })
//       }else {
//         page.setData({
//           canComment: false
//         })
//       }
//   }, fail(res){
//     console.log(">>>>>>>"+ res)
//   }
// })
}

function handleHaveComment(page, callback) {
  wx.cloud.callFunction({
    name: 'isComment',
    data: {
      activityId: page.data.activityId,
      openId: app.globalData.openid
    }
  }).then(res => {
    var arr = res.result.data
    if (arr.length > 0) {
      page.setData({
        haveComment: true
      })
    } else {
      page.setData({
        haveComment: false
      })
    }
  }).catch(err => {
    console.error(err);
  })
}


function getCommentList(page, callback) {
  wx.cloud.callFunction({
    name: 'getCommentDataList',
  }).then(res => {
    var list = res.result.data;
    var entity = parseData(page, list);
    var score = calculateScroe(page, entity);
    page.setData({
      commentEntity: entity,
      resultScore: score.toFixed(2)
    });
    wx.hideLoading();
  }).catch(err => {
    console.error(err);
  })
}

function setCommitBtnDisable(page, disable) {
  if (!disable) {
    page.setData({
      disabled: false,  
      btnText: "提交评价"    
    });
  } else {
    page.setData({
      disabled: true,
      btnText: "请稍候"
    });
  }
}

function parseData(page, data) {
  var currComment = [];
  data.forEach(value => {
    console.log("id:" + value.activityId)
    if (value.activityId == page.data.activityId) {
      currComment.push(value);
    }
  });
  return currComment;
}

function calculateScroe(page, data) {
  if(data.length>0){
    var sum = 0;
    data.forEach(value => {
      console.log(sum)
      sum = sum + value.score
    });
    return sum/data.length;
  }else {
    return -1;
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false,
    btnText: "提交评价",  
    activityId:null,
    haveSignUp:0,
    haveComment: false,
    canComment: false,
    activity: null,
    content: '', // 评价的内容
    score: 5, // 评价的分数
    movieId: -1,
    commentEntity:[],
    resultScore: -1,
    isDone: 0,
    signUpCount: 0,
  },

  signup: function() {
    if (this.data.haveSignUp == 1){
      wx.showModal({
        title: '提示',
        content: '您已报名',
        showCancel: false,
      })
      return;
    }
    // 插入数据
    this.setData({
      haveSignUp: 1
    })
    db.collection('activity').add({
      data: {
        activity_id: this.data.activityId,
        type: "signup"
      },
      success(res) {
        wx.showToast({
          title: "报名成功"
        })
      }
    });
    isSignUp(this)
  },

submit: function(){
  if (this.data.disabled){
    return
  }
  if(!this.data.canComment){
    wx.showModal({
      title: '提示',
      content: '未参加该会议，无法评论',
      showCancel: false,
    })
    return;
  }
  if(this.data.haveComment){
    wx.showModal({
      title: '提示',
      content: '您已对该会议作出评论',
      showCancel: false,
    })
    return;
  } 

  if(this.data.content == ''){
    wx.showModal({
      title: '提示',
      content: '请输入评论内容',
      showCancel: false,
    })
    return;
  }
  wx.showLoading({
    title: '请稍候',
  })
  setCommitBtnDisable(this, true)
  // 插入数据
  db.collection('comment').add({
    data: {
      content: this.data.content,
      score: this.data.score,
      activityId: this.data.activityId,
    }
  }).then(res => {
    this.setData({
      haveComment: true
    })
    getCommentList(this);
    wx.hideLoading();
    wx.showToast({
      title: '评价成功',
    })
    setCommitBtnDisable(this, false)
    this.setData({
      content: ""
    });
  }).catch(err => {
    wx.hideLoading();
    wx.showToast({
      title: '评价失败',
    })
    setCommitBtnDisable(this, false)
    this.setData({
      content: ""
    });
  })
},

  refresh:function(){
    wx.showLoading({
      title: '加载中',
    })
    isSignUp(this);
    isAttendActicity(this);
    handleHaveComment(this);
    getCommentList(this);
  },

  onContentChange: function (event) {
    this.setData({
      content: event.detail
    });
  },

  onScoreChange: function (event) {
    this.setData({
      score: event.detail
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      activityId: options.activityId,
      isDone: options.isDone
    });
    this.setData({
      activity: app.globalData.selectedTodoActivity
    })
    isSignUp(this);
    isAttendActicity(this);
    handleHaveComment(this);
    getCommentList(this);
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})