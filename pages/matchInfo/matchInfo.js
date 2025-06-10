Page({
  data: {
    matchId: -1,
    matchName: '',
    matchLocation: '',
    match_date: '',
    match_status: ''
  },

  onLoad(options) {
    // 解码参数
    const name = decodeURIComponent(options.name);
    const location = decodeURIComponent(options.location);
    const date = decodeURIComponent(options.match_date);
    const status = decodeURIComponent(options.status);
    // 更新页面数据
    this.setData({
      matchId: options.id,
      matchName: name,
      matchLocation: location,
      match_date: date,
      match_status: status,
    });
  },

  // 新增编辑处理方法
  handleEditMatch(e) {
    // 权限验证
    const dataset = e.currentTarget.dataset;
    // 手动拼接参数
    const params = [
      `id=${encodeURIComponent(dataset.id)}`,
      `name=${encodeURIComponent(dataset.name || '')}`,
      `location=${encodeURIComponent(dataset.location || '')}`,
      `date=${encodeURIComponent(dataset.date || '')}`
    ].join('&');

    // 跳转（确保URL正确）
    wx.navigateTo({
      url: `/pages/editMatch/editMatch?${params}`
    });
  },

  handleStartMatch(){
    // 需要添加权限认证
    this.setData({
      match_status: 'IN_PROGRESS'
    });
    const matchId = this.data.matchId;
    // 编码特殊字符（防止URL解析错误）
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${matchId}`,
      method: 'PUT',
      date:{
        status: this.data.match_status
      }
    })
    wx.navigateTo({
      url: `/pages/roundRecord/roundRecord?matchId=${this.data.matchId}`
    });
  }
});