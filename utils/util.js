/**
 * 该方法可防止按钮被快速重复点击
 * 需要在页面的data对象中增加isBtnClicked
 */
function buttonClicked(page, callback, delay) {
  if (!page.data.isBtnClicked) {
    page.setData({
      isBtnClicked: true
    });

    if (!delay) {
      delay = 1500;
    }

    setTimeout(function() {
      page.setData({
        isBtnClicked: false
      })
    }, delay);

    if (callback) {
      callback();
    }
  }
}

module.exports = {
  buttonClicked: buttonClicked
}