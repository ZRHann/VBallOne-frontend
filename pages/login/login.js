// pages/login/login.js
Page({
  data: {
    username: '',
    password: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },
  // 登录处理
  handleLogin() {
    wx.request({
      url: 'https://vballone.zrhan.top/api/login',
      method: 'POST',
      data: {
        username: this.data.username,
        password: this.data.password
      },
      success: (res) => {
        if (res.data.success) {
          wx.setStorageSync('session', {
            username: res.data.username,
            role: res.data.role,
            avatarUrl: res.data.avatarUrl,
            token: res.data.token
          });
          wx.navigateBack();
        } else {
          wx.showToast({ title: res.data.error, icon: 'none' });
        }
      }
    });
  },

  enterGuestMode() {
    // 设置游客标识
    wx.setStorageSync('isGuest', true)
    
    // 跳转到首页（根据实际页面调整）
    wx.switchTab({
      url: '/pages/match/match'
    })
    
  }
});