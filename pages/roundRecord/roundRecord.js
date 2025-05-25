Page({
  data: {
    // 比赛信息
    currentSet: 1,
    maxSets: 3,
    
    // 队伍信息
    teamA: {
      rotation: [1, 2, 3, 4, 5, 6],  // 轮次位置
      players: ['', '', '', '', '', ''] // 对应位置球员
    },
    teamB: {
      rotation: [1, 2, 3, 4, 5, 6],
      players: ['', '', '', '', '', '']
    }
  },

  // 初始化方法
  initRotation() {
    // 可从缓存加载已有数据
    const saved = wx.getStorageSync('lineup');
    if (saved) this.setData(saved);
  },

  // 保存到本地
  saveData() {
    wx.setStorageSync('lineup', this.data);
    wx.showToast({ title: '保存成功' });
  },

  onLoad() {
    this.initRotation();
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
      [`${team}.players[${index}]`]: value.replace(/[^0-9]/g, '') // 只允许数字输入
    });
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
})