Page({
  data: {
    // 比赛信息
    isBegin: [false,false,false,false],
    currentSet: 1,
    maxSets: 3,
    rotationA: [4,3,2,5,6,1],     // 轮次信息
    playersA: ['', '', '', '', '', ''],
    rotationB: [4,3,2,5,6,1],
    playersB: ['', '', '', '', '', ''],
    fir_serveteam: '',        // 发球方
    cur_serveteam: '',
    serveA: 1,
    serveB: 1,
    hasSavedGame: false
  },

  // 保存到本地
  saveData() {
    wx.setStorageSync('lineup', this.data);
    wx.showToast({ title: '保存成功' });
  },

  onLoad() {
    // 加载其他数据
    const saved = wx.getStorageSync('lineup');
    if (saved) this.setData(saved);
  },

  onShow() {
    // 检查是否有保存的游戏
    const hasSavedGame = wx.getStorageSync('scoreBoardData') ? true : false;
    this.setData({ hasSavedGame });
    
    // 显示保存的游戏数据（但不移除存储）
    const scoreBoardData = wx.getStorageSync('scoreBoardData');
    if (scoreBoardData) {
      this.setData({
        cur_serveteam: scoreBoardData.cur_serveteam,
        serveA: scoreBoardData.serveA,
        serveB: scoreBoardData.serveB,
        [`isBegin[${this.data.currentSet}]`]: scoreBoardData.isover ? false : true
      });
    }
  },

  // 设置发球队
  setServeTeam(e) {
    const team = e.currentTarget.dataset.team;
    this.setData({ 
      fir_serveteam: team,
      cur_serveteam: team
     });
    // 保存到本地存储
    wx.setStorageSync('currentServeTeam', team);
  },

  // 确定发球方
  handleSelectServeTeam(e) {
    const team = e.currentTarget.dataset.team;
    if (!this.data.isBegin[this.data.currentSet]){
      wx.showModal({
        title: '选择发球方',
        content: '确定'+team+'队发球？',
        confirmColor: '#ff4444',
        success: (res) => {
          if (res.confirm) {
            this.setServeTeam(e);
            wx.vibrateShort(); // 振动反馈
          }
        }
      })
    } else{
      wx.showModal({
        title: '比赛已开始',
        content: '无法修改开球方',
        confirmColor: '#ff4444',
      })
    }
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
    const fir_serveteam = this.data.fir_serveteam
    if(fir_serveteam == null){
      wx.showModal({
        title: '请选择发球方',
        confirmText: 'B队',
        confirmColor: '#4b6cff',
        cancelText: 'A队',
        cancelColor: '#ff4b4b',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              fir_serveteam: 'B',
              cur_serveteam: 'B'
            });
          }
          else {
            this.setData({
              fir_serveteam: 'A',
              cur_serveteam: 'A'
            });
          }
        }
      });
      return ;
    }
    const currentSet = this.data.currentSet
    const isBegin = this.data.isBegin[currentSet]
    if(!isBegin){
      this.setData({
        [`isBegin[${currentSet}]`]: true
      });
      wx.removeStorageSync('scoreBoardData');
      console.info(this.data.isBegin)
    }  
    wx.navigateTo({
      url: `/pages/scoreBoard/scoreBoard?set=${this.data.currentSet}`+`&cur_serveteam=${this.data.cur_serveteam}`
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