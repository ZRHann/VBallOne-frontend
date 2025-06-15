const getAuthHeader = require('../../utils/getAuthHeader');
Page({
  data: {
    matchId: -1,
    matchName: '',
    matchLocation: '',
    match_date: '',
    match_status: '',
    match_date_display: '',
    referee: ''
  },

  onLoad(options) {
    // 解码参数
    const name = decodeURIComponent(options.name);
    const location = decodeURIComponent(options.location);
    const date = decodeURIComponent(options.match_date);
    const status = decodeURIComponent(options.status);
    // 格式化日期时间
    const displayDateTime = this.formatDateTime(date);
    const referee = decodeURIComponent(options.referee);
    // 更新页面数据
    this.setData({
      matchId: options.id,
      matchName: name,
      matchLocation: location,
      match_date: date,
      match_status: status,
      match_date_display: displayDateTime,
      referee: referee
    });
  },

  /**
   * 将 ISO 日期字符串格式化为 "YYYY-MM-DD HH:mm"
   * @param {string} isoStr
   * @returns {string}
   */
  formatDateTime(isoStr) {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return isoStr;
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
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
      `date=${encodeURIComponent(dataset.date || '')}`,
      `referee=${encodeURIComponent(dataset.referee || '')}`
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
      header: getAuthHeader(),
      date:{
        status: this.data.match_status
      }
    })
    wx.navigateTo({
      url: `/pages/roundRecord/roundRecord?matchId=${this.data.matchId}`
    });
  }
});