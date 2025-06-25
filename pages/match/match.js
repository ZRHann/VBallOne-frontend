Page({
  data: {
    matches: [],
    searchKeyword: '', // 搜索关键词
    isEdit: false,
    currentTarget: {}
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

  onLoad(options) {
    this.getMatches();
    const session = wx.getStorageSync('session') || {};

    if(options){
      const isEdit = options.isEdit;
      this.setData({isEdit: isEdit});
      if(isEdit){
        this.goBackToDetailFromEdit();
      }
    }
  },

  /**
   * 页面每次可见时都会触发，包括 navigateBack 返回
   */
  onShow() {
    if (this.data.searchKeyword.trim()) {
      this.onSearch();
    } else {
      this.getMatches();
    }
  },

  getMatches() {
    wx.request({
      url: 'https://vballone.zrhan.top/api/matches',
      method: 'GET',
      data:{
        page: 1,
        size: 10
      },
      success: res => {
        const processed = res.data.map(item => ({
          ...item,
          match_date_display: this.formatDateTime(item.match_date)
        }));
        this.setData({ 
          matches: processed
        });
      },
      fail: err => {
        wx.showToast({ title: '获取失败', icon: 'error' });
      }
    });
  },

  onSearchInput: function(e){
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
  },

  onSearch(){
    const keyword = this.data.searchKeyword.trim().toLowerCase();
    if(keyword == ''){
      this.getMatches();
      return ;
    }

    wx.request({
      url: 'https://vballone.zrhan.top/api/matches/search',
      method: 'GET',
      data: { 
        q: this.data.searchKeyword,
      },
      success: res => {
        const processed = res.data.map(item => ({
          ...item,
          match_date_display: this.formatDateTime(item.match_date)
        }));
        this.setData({ 
          matches: processed,
        });
        if(this.data.matches.length == 0){
          wx.showToast({
            title: '没有匹配的比赛',
            icon: "error",
            duration: 2000
          });
        }
        return ;
      },
      fail: err => {
        wx.showToast({ title: '获取失败', icon: 'error' });
      },
    })

    const filtered = this.data.matches.filter(item => item.name.toLowerCase().includes(keyword) || item.location.toLowerCase().includes(keyword)
    );
    this.setData({ matches: filtered});
  },

  clearSearch(){
    console.info(1);
    this.setData({
      searchKeyword: ''
    });
    this.getMatches();
    wx.hideKeyboard();
  },

  goToDetail(e) {
    const {id, name, location, match_date, status, referee} = e.currentTarget.dataset;
    this.setData({currentTarget: e.currentTarget});
    // 编码特殊字符（防止URL解析错误）
    const encodedName = encodeURIComponent(name);
    const encodedLocation = encodeURIComponent(location);
    const encodedDate = encodeURIComponent(match_date);
    const encodeStatus = encodeURIComponent(status);
    const encodeReferee = encodeURIComponent(referee);
    wx.navigateTo({
      url: `/pages/matchInfo/matchInfo?id=${id}&name=${encodedName}&location=${encodedLocation}&match_date=${encodedDate}&status=${encodeStatus}&referee=${encodeReferee}`
    });
  },

  goBackToDetailFromEdit(){
    const {id, name, location, match_date, status, referee} = this.data.currentTarget.dataset;
    this.setData({
      isEdit: false
    });
    // 编码特殊字符（防止URL解析错误）
    const encodedName = encodeURIComponent(name);
    const encodedLocation = encodeURIComponent(location);
    const encodedDate = encodeURIComponent(match_date);
    const encodeStatus = encodeURIComponent(status);
    const encodeReferee = encodeURIComponent(referee);
    wx.navigateTo({
      url: `/pages/matchInfo/matchInfo?id=${id}&name=${encodedName}&location=${encodedLocation}&match_date=${encodedDate}&status=${encodeStatus}&referee=${encodeReferee}`
    });
  },

  goToNewMatch() {
    const session = wx.getStorageSync('session');
    if (session.username) {
      wx.navigateTo({
        url: '/pages/newMatch/newMatch'
      });
    }
    else{
      wx.navigateTo({
        url: '/pages/login/login',
      })
      wx.showToast({
        title: "请先登录",
        icon: "error",
        duration: 1000
      });
    }
  },

  goToScoreBoard(){
    wx.navigateTo({
      url: '/pages/roundRecord/roundRecord'
    });
  },

  onPullDownRefresh() {
    this.getMatches();
    wx.stopPullDownRefresh();
  }
});
