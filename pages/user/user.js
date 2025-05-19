Page({
  data: {
    isLoggedIn: false,
    username: '',
    role: '',
    avatarUrl: ''
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const session = wx.getStorageSync('session');
    if (session) {
      this.setData({
        isLoggedIn: true,
        username: session.username,
        role: session.role,
        avatarUrl: session.avatarUrl
      });
    } else {
      this.setData({
        isLoggedIn: false,
        username: '',
        role: '',
        avatarUrl: ''
      });
    }
  },

  // 跳转登录页
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 处理退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('session');
          this.checkLoginStatus();
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  onShow() {
    const isGuest = getApp().globalData.isGuest
    if (isGuest) {
      this.setData({
        isLoggedIn: false,
        showGuestTips: true  // 新增数据字段
      })
    } else {
      this.checkLoginStatus()
    }
  }
});