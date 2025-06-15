const getAuthHeader = require('../../utils/getAuthHeader');
Page({
  data: {
    matchId: -1,
    matchName: '',
    matchLocation: '',
    match_date: '',
    match_status: '',
    match_date_display: ''
  },

  onLoad(options) {
    // 解码参数
    const name = decodeURIComponent(options.name);
    const location = decodeURIComponent(options.location);
    const date = decodeURIComponent(options.match_date);
    const status = decodeURIComponent(options.status);
    // 格式化日期时间
    const displayDateTime = this.formatDateTime(date);
    // 更新页面数据
    this.setData({
      matchId: options.id,
      matchName: name,
      matchLocation: location,
      match_date: date,
      match_status: status,
      match_date_display: displayDateTime,
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
      `date=${encodeURIComponent(dataset.date || '')}`
    ].join('&');

    // 跳转（确保URL正确）
    wx.navigateTo({
      url: `/pages/editMatch/editMatch?${params}`
    });
  },

  handleStartMatch(){
    this.setData({
      match_status: 'IN_PROGRESS'
    });
    const matchId = this.data.matchId;
    // 发送修改状态请求
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${matchId}`,
      method: 'PUT',
      header: getAuthHeader(),
      data: {
        status: this.data.match_status
      },
      success: res => {
        const ok = res.statusCode === 200 || (res.data && res.data.success);
        if (ok) {
          wx.showToast({ title: '比赛已开始' });
          // 跳转到记录局分页面
          wx.navigateTo({
            url: `/pages/roundRecord/roundRecord?matchId=${this.data.matchId}`
          });
        } else {
          wx.showToast({ title: res.data.error || '操作失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
});