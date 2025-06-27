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
    this.getMatches();
  },

  // 刷新信息显示
  onShow(){
    this.getMatches();
  },

  // 网络请求获取比赛信息
  getMatches() {
    const matchId = this.data.matchId
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${matchId}`,
      method: 'GET',
      success: res => {
        const match_date_display = this.formatDateTime(res.data.match_date);
        this.setData({
          matchName: res.data.name,
          matchLocation: res.data.location,
          match_date: res.data.match_date,
          match_date_display: match_date_display,
          referee: res.data.referee
        });
      },
      fail: err => {
        wx.showToast({ title: '获取失败', icon: 'error' });
      }
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
    const y = date.getUTCFullYear();
    const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = date.getUTCDate().toString().padStart(2, '0');
    const hh = date.getUTCHours().toString().padStart(2, '0');
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  },

  // 新增编辑处理方法
  handleEditMatch(e) {
    const session = wx.getStorageSync('session');
    const username = session.username;
    if(username != this.data.referee ){
      wx.showToast({
        title: '没有权限',
        icon: 'none'
      });
      return ;
    }
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

  // 查看比赛结果
  handleview(){
    if (this.data.match_status == 'FINISHED'){
      wx.navigateTo({
        url: `/pages/viewMatchResults/viewMatchResults?matchId=${this.data.matchId}`
      });
    }
    else{
      wx.showToast({
        title: '比赛未结束',
        icon: 'none'
      })
    }
    
  },
  
  // 处理结束比赛
  handleover(){
    const session = wx.getStorageSync('session');
    const username = session.username;
    if(username != this.data.referee ){
      wx.showToast({
        title: '没有权限',
        icon: 'none'
      });
      return ;
    }
    this.setData({
      match_status: 'FINISHED'
    });
    const matchId = this.data.matchId;
    // 编码特殊字符（防止URL解析错误）
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${matchId}`,
      method: 'PUT',
      header: getAuthHeader(),
      data:{
        status: this.data.match_status
      }
    })
    wx.navigateTo({
      url: `/pages/viewMatchResults/viewMatchResults?matchId=${this.data.matchId}`
    });
  },

  // 处理开始比赛
  handleStartMatch(){
    const session = wx.getStorageSync('session');
    const username = session.username;
    if(username != this.data.referee ){
      wx.showToast({
        title: '没有权限',
        icon: 'none'
      });
      return ;
    }

    this.setData({
      match_status: 'IN_PROGRESS'
    });
    const matchId = this.data.matchId;
    // 编码特殊字符（防止URL解析错误）
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${matchId}`,
      method: 'PUT',
      header: getAuthHeader(),
      data:{
        status: this.data.match_status
      }
    })
    wx.navigateTo({
      url: `/pages/roundRecord/roundRecord?matchId=${this.data.matchId}`
    });
  }
});