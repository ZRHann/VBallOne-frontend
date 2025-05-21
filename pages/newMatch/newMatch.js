const getAuthHeader = require("../../utils/getAuthHeader");
Page({
    data: {
      name: '',
      location: '',
      match_date: '',
      referee_username: ''
    },
  
    onInput(e) {
      const field = e.currentTarget.dataset.field;
      this.setData({
        [field]: e.detail.value
      });
    },
  
    createMatch() {
      const { name, location, match_date, referee_username } = this.data;
  
      if (!name || !location || !match_date || !referee_username) {
        return wx.showToast({ title: '请填写完整', icon: 'none' });
      }
  
    wx.request({
        url: 'https://vballone.zrhan.top/api/matches',
        method: 'POST',
        data: { name, location, match_date, referee_username },
        header: getAuthHeader(),
        success: res => {
          if (res.data.success) {
            wx.showToast({ title: '创建成功' });
            wx.navigateBack();
          } else {
            wx.showToast({ title: res.data.error || '失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    }
  });
  