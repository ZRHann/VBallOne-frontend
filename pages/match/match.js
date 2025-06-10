Page({
  data: {
    matches: [],
    searchKeyword: '', // 搜索关键词

  },

  onLoad() {
    this.getMatches();
    const session = wx.getStorageSync('session') || {};
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
        this.setData({ 
          matches: res.data
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
        this.setData({ 
          matches: res.data,
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
    const {id, name, location, match_date, status} = e.currentTarget.dataset;
    // 编码特殊字符（防止URL解析错误）
    const encodedName = encodeURIComponent(name);
    const encodedLocation = encodeURIComponent(location);
    const encodedDate = encodeURIComponent(match_date);
    const encodeStatus = encodeURIComponent(status);
    wx.navigateTo({
      url: `/pages/matchInfo/matchInfo?id=${id}&name=${encodedName}&location=${encodedLocation}&match_date=${encodedDate}&status=${encodeStatus}`
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
  }
});
