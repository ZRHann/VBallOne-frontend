const getAuthHeader = require("../../utils/getAuthHeader");
Page({
    data: {
      name: '',
      location: '',
      date: '',          // YYYY-MM-DD
      time: '',          // HH:MM
      referee_username: ''
    },
    
    onLoad() {  
      this.fetchCurrentUser();
    },

    // 处理输入
    onInput(e) {
      const field = e.currentTarget.dataset.field;
      this.setData({
        [field]: e.detail.value
      });
    },

    // 获取创建人账号信息
    fetchCurrentUser() {
      wx.request({
        url: 'https://vballone.zrhan.top/api/users/me',
        method: 'GET',
        header: getAuthHeader(),
        success: res => {
          if (res.data.success && res.data.user) {
            this.setData({ referee_username: res.data.user.username });
          }
        }
      });
    },
    
    // 创建比赛
    createMatch() {
      const { name, location, date, time, referee_username } = this.data;
  
      if (!name || !location || !date || !time || !referee_username) {
        return wx.showToast({ title: '请填写完整', icon: 'none' });
      }
  
    wx.request({
        url: 'https://vballone.zrhan.top/api/matches',
        method: 'POST',
        data: { 
          name, 
          location, 
          match_date: `${date}T${time}:00Z`, 
          referee_username 
        },
        header: getAuthHeader(),
        success: res => {
          if (res.data.success) {
            wx.showToast({ title: '创建成功' });
            setTimeout(() => {
              wx.navigateBack();
            }, 1200);
          } else {
            wx.showToast({ title: res.data.error || '失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    },
  
    // picker 回调
    onDateChange(e) {
      this.setData({ date: e.detail.value });
    },
    onTimeChange(e) {
      this.setData({ time: e.detail.value });
    }
  });
  