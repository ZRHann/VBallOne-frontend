Page({
  data: {
    matches: []
  },

  onLoad() {
    wx.request({
      url: 'https://vballone.zrhan.top/api/matches',
      method: 'GET',
      success: res => {
        this.setData({ matches: res.data });
      },
      fail: err => {
        wx.showToast({ title: '获取失败', icon: 'none' });
      }
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goToNewMatch() {
    wx.navigateTo({
      url: '/pages/newMatch/newMatch'
    });
  }
});
