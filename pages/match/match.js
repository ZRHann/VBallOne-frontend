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
    const {id, name, location, match_date} = e.currentTarget.dataset;
    // 编码特殊字符（防止URL解析错误）
    const encodedName = encodeURIComponent(name);
    const encodedLocation = encodeURIComponent(location);
    const encodedDate = encodeURIComponent(match_date);
    wx.navigateTo({
      url: `/pages/matchInfo/matchInfo?id=${id}&name=${encodedName}&location=${encodedLocation}&match_date=${encodedDate}`
    });
  },

  goToNewMatch() {
    wx.navigateTo({
      url: '/pages/newMatch/newMatch'
    });
  },

  goToScoreBoard(){
    wx.navigateTo({
      url: '/pages/scoreBoard/scoreBoard'
    });
  }
});
