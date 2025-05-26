Page({
  data: {
    // 比赛信息
    currentSet: 1,
    maxSets: 3,
    rotationA: [4,3,2,5,6,1],
    playersA: ['', '', '', '', '', ''],
    rotationB: [4,3,2,5,6,1],
    playersB: ['', '', '', '', '', ''],
    serveteam: null,
    serveA: 1,
    serveB: 1
  },

  // 保存到本地
  saveData() {
    wx.setStorageSync('lineup', this.data);
    wx.showToast({ title: '保存成功' });
  },

  onLoad() {
    const saved = wx.getStorageSync('lineup');
    if (saved) this.setData(saved);
    const savedTeam = wx.getStorageSync('currentServeTeam');
    if (savedTeam) this.setData({ serveTeam: savedTeam });
  },

  // 设置发球队
  setServeTeam(e) {
    const team = e.currentTarget.dataset.team;
    this.setData({ serveteam: team });
    
    // 保存到本地存储
    wx.setStorageSync('currentServeTeam', team);
  },

  // 局数切换
  changeSet(e) {
    const set = parseInt(e.detail.value) + 1;
    this.setData({ currentSet: set });
    this.loadSetData(set);
  },

  // 加载对应局数据
  loadSetData(set) {
    const key = `set${set}`;
    const saved = wx.getStorageSync(key);
    if (saved) this.setData(saved);
  },

  // 输入绑定
  bindInput(e) {
    const { team, index } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`players${team}[${index}]`]: value.replace(/[^0-9]/g, '') // 只允许数字输入
    });
  },

  startGame(){
    wx.navigateTo({
      url: '/pages/scoreBoard/scoreBoard'
    });
  },

  navigateBack() {
    wx.navigateBack({
      delta: 1 // 返回上一页
    })
    wx.vibrateShort({ type: 'light' }) // 可选震动反馈
  },

  // 重置当前局
  reset() {
    wx.showModal({
      title: '确认重置？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            [`teamA.players`]: ['','','','','',''],
            [`teamB.players`]: ['','','','','','']
          });
        }
      }
    })
  }
})