Page({
  data: {
    isLoading: false
  },

  handleRegister(e) {
    const { username, password, confirmPassword, email } = e.detail.value;

    // 前端验证
    if (!this.validateForm(username, password, confirmPassword, email)) return;

    this.setData({ isLoading: true });
    
    wx.request({
      url: 'https://vballone.zrhan.top/api/register',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { username, password, email },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({ 
            title: '注册成功', 
            icon: 'success',
            complete: () => {
              setTimeout(() => {
                wx.navigateBack(); // 返回登录页
              }, 1500);
            }
          });
        } else {
          wx.showToast({ title: res.data.error || '注册失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 表单验证
  validateForm(username, password, confirmPassword, email) {
    const usernameRegex = /^[a-zA-Z0-9]{4,16}$/;
    const passwordRegex = /^.{6,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!usernameRegex.test(username)) {
      wx.showToast({ title: '用户名需为4-16位字母/数字', icon: 'none' });
      return false;
    }

    if (!passwordRegex.test(password)) {
      wx.showToast({ title: '密码至少需要6位', icon: 'none' });
      return false;
    }

    if (password !== confirmPassword) {
      wx.showToast({ title: '两次输入密码不一致', icon: 'none' });
      return false;
    }

    if (!emailRegex.test(email)) {
      wx.showToast({ title: '请输入有效邮箱地址', icon: 'none' });
      return false;
    }

    return true;
  }
});