Page({
  data: {
    matchId: '',
    matchName: '',
    matchLocation: '',
    match_date: '',
    statusMapping: {
      pending: '未开始',
      ongoing: '进行中',
      completed: '已结束'
    }
  },

  onLoad(options) {
    // 解码参数
    const name = decodeURIComponent(options.name);
    const location = decodeURIComponent(options.location);
    const date = decodeURIComponent(options.match_date);
    // 更新页面数据
    this.setData({
      matchId: options.id,
      matchName: name,
      matchLocation: location,
      match_date: date
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
    wx.navigateTo({
      url: `/pages/roundRecord/roundRecord`
    });
  }
});