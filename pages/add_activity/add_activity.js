const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util.js");

/**
 * 校验数据是否正确
 */
function checkParamValidate(param, images) {
  var errorMsg;
  if (!param.title) {
    errorMsg = '请填写标题';
  } else if (!param.ps) {
    errorMsg = '请填写简述';
  } else if (!param.sdate) {
    errorMsg = '请选择开始日期';
  } else if (!param.stime) {
    errorMsg = '请选择开始时间';
  } else if (!param.place) {
    errorMsg = '请填写分享地点';
  }else if(images.length == 0){
    errorMsg = '请上传封面';
  }

  if (errorMsg) {
    wx.showToast({
      title: errorMsg,
      icon: "none"
    })
    return false;
  }
  return true;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBtnClicked: false,
    sdate: "",
    stime: "",
    fileID: "",
    images: [],
    fileIds: []
  },

  bindSDateChange(e) {
    this.setData({
      sdate: e.detail.value
    })
  },

  bindSTimeChange(e) {
    this.setData({
      stime: e.detail.value
    })
  },

//choose image
  choosePic() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log("tempFilePaths:" + tempFilePaths)
        this.setData({
          images : this.data.images.concat(tempFilePaths)
        })
      }
    })
  },

//Save file
downloadFile() {
  wx.cloud.downloadFile({
    fileID: 'a7xzcb'
  }).then(res => {
    // get temp file path
    console.log(res.tempFilePath)
    wx.saveImageToPhotosAlbum({
      filePath: res.tempFilePath,
      success(res) {
        //
       }
    })
  }).catch(error => {
    // handle error
  })
},

  finishCreate: function(e){
    util.buttonClicked(this, () => {
      var param = e.detail.value;
      var userInfo = app.globalData.userInfo
      if (checkParamValidate(param, this.data.images)) {

wx.showLoading({
  title: '请稍候',
})
    let promiseArr= [];
    for(let i= 0 ; i<this.data.images.length; i++){
      promiseArr.push(new Promise((reslove, reject) =>{
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item);
        // 将图片上传至云存储空间
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix,
          filePath: item,
          success: res => {
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            })
            reslove();
          },
          fail: console.err
        })
      }));
    }

    Promise.all(promiseArr).then(res =>{
      var param = e.detail.value;
      var userInfo = app.globalData.userInfo
      console.log(this.data.fileID)
      db.collection('activity').add({
        data: {
          title: param.title,
          ps: param.ps,
          start_date: param.sdate,
          start_time: param.stime,
          place: param.place,
          author_name: userInfo.nickName,
          img: this.data.fileIds[0],
          is_done: false,
          type: "activity"
        }
      }).then(res=> {
        wx.hideLoading();
        wx.showToast({
          title: '新建成功',
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500);
      }).catch(err =>{
        wx.hideLoading();
        wx.showToast({
          title: '新建失败',
        })
      })
    })
      }
    });
  },


  // /**
  //  * 上传封面
  //  */
  // uploadPic() {
  //   var timestamp = Date.parse(new Date());
  //   timestamp = timestamp / 1000;
  //   var picName = timestamp + '.png';

  //   wx.chooseImage({
  //     success: chooseResult => {
  //       // 将图片上传至云存储空间
  //       wx.cloud.uploadFile({
  //         cloudPath: picName,
  //         filePath: chooseResult.tempFilePaths[0],
  //         success: res => {
  //           this.setData({
  //             fileID: res.fileID
  //           })
  //         },
  //       })
  //     },
  //   })
  // },

  // /**
  //  * 提交分享
  //  */
  // formSubmit: function(e) {
  //   util.buttonClicked(this, () => {
  //     var param = e.detail.value;
  //     var userInfo = app.globalData.userInfo

  //     if (checkParamValidate(param)) {
  //       console.log(this.data.fileID)
  //       db.collection('activity').add({
  //         data: {
  //           title: param.title,
  //           ps: param.ps,
  //           start_date: param.sdate,
  //           start_time: param.stime,
  //           place: param.place,
  //           author_name: userInfo.nickName,
  //           img: this.data.fileID,
  //           is_done: false,
  //           type: "activity"
  //         },
  //         success(res) {
  //           wx.showToast({
  //             title: "添加成功"
  //           })
  //           setTimeout(() => {
  //             wx.navigateBack({
  //               delta: 1
  //             })
  //           }, 1500);
  //         }
  //       })
  //     }
  //   });
  // }



})