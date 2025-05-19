// app.js
App({
  globalData: {
    isGuest: false
  },

  onLaunch() {
    const isGuest = wx.getStorageSync('isGuest')
    if (!isGuest && !wx.getStorageSync('session')) {
      wx.reLaunch({ url: '/pages/login/login' })
    }
    this.globalData.isGuest = isGuest
  }
})
