// scoreBoard.js
Page({
  data: {
    scoreA: 0,
    scoreB: 0,
    startY: 0,       // 改为记录 Y 轴起始位置
    pauseChanceA: 2,
    pauseChanceB: 2,
    currentTeam: null,
    isSliding: false,
    showTeamSelect: false,
    selectedTeam: null,
    showPause: false,
    countdown: 0,
    timer: null,
    timeoutLogs: '' ,
    isToolbarExpanded: false, // 新增工具栏状态
    hintDirection: ''
  },

  onLoad() {
    // 加载保存的游戏数据
    const savedData = wx.getStorageSync('scoreBoardData');
    if (savedData) {
      this.setData(savedData);
    }
  },

  // 触摸开始
  handleTouchStart(e) {
    this.setData({
      startY: e.touches[0].pageY, // 记录 Y 轴坐标
      currentTeam: e.currentTarget.dataset.team
    })
    wx.vibrateShort({ type: 'light' })
  },

  // 触摸移动（空方法，仅用于阻止默认滚动）
  handleTouchMove(e) {
    const deltaY = e.touches[0].pageY - this.data.startY
    if (Math.abs(deltaY) > 30) {
      this.setData({
        isSliding: true,
        hintDirection: deltaY < 0 ? 'up' : 'down'
      })
    }
  },

  // 触摸结束
  handleTouchEnd(e) {
    const endY = e.changedTouches[0].pageY
    const deltaY = endY - this.data.startY
    const threshold = 60 // 垂直滑动阈值
    this.setData({ isSliding: false })
    // 滑动距离不足时忽略
    if (Math.abs(deltaY) < threshold) return

    const team = this.data.currentTeam
    const isIncrement = deltaY < 0 // 上滑加分，下滑减分

    // 更新分数
    if (team === 'A') {
      this.updateScore('A', isIncrement)
    } else {
      this.updateScore('B', isIncrement)
    }
  },

  // 分数更新方法
  updateScore(team, isIncrement) {
    const field = `score${team}`
    let newScore = this.data[field]

    if (isIncrement) {
      newScore += 1
    } else {
      newScore = Math.max(0, newScore - 1)
    }

    this.setData({
      [field]: newScore
    })
    wx.vibrateShort({type: 'light'})
  },

  // 切换工具栏状态
  toggleToolbar() {
    this.setData({
      isToolbarExpanded: !this.data.isToolbarExpanded
    })
    wx.vibrateShort({ type: 'light' })
  },

  exchangePlace(e) {
    const temp = this.data['scoreA']
    this.setData({
      scoreA: this.data['scoreB'],
      scoreB: temp
    })
  },

  // 点击暂停按钮
  handleShowTeamSelect() {
    this.setData({ showTeamSelect: true })
  },

  handleCloseTeamSelect() {
    this.setData({ showTeamSelect: false });
  },

  // 选择队伍
  handleTeamSelect(e) {
    const team = e.currentTarget.dataset.team;
    const key = `pauseChance${team}`;
    // 检查该队暂停次数
    if (this.data[key] <= 0) {
      wx.showToast({
        title: `${team}队暂停次数已用完`,
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data[key] > 0){
      this.setData({ 
        selectedTeam: team,
        showTeamSelect: false,
        showPause: true,
        countdown: 30,
        [key]: this.data[key] - 1
      });
      this.startCountdown();
      this.logTimeout(team);
    }
  },

  // 记录暂停历史
  logTimeout(team) {
    const newLog = {
      time: new Date().toLocaleTimeString(),
      team: team,
      duration: 30
    };
    this.setData({
      timeoutLogs: [...this.data.timeoutLogs, newLog]
    });
  },

  handleCancelPause() {
    wx.showModal({
      title: '提前结束暂停',
      content: '确定要结束暂停吗？',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.clearTimer();
          wx.vibrateShort(); // 振动反馈
        }
      }
    })
  },

  // 开始倒计时
  startCountdown() {
    this.data.timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        this.clearTimer();
        return;
      }
      this.setData({ countdown: this.data.countdown - 1 });
    }, 1000);
  },

  // 清除定时器
  clearTimer() {
    clearInterval(this.data.timer);
    this.setData({ 
      showPause: false,
      countdown: 0,
      selectedTeam: null  // 重置选择
    });
    this.data.timer = null;
  },

  viewRound() {
    // 保存当前数据
    const saveData = {
      scoreA: this.data.scoreA,
      scoreB: this.data.scoreB,
      pauseChanceA: this.data.pauseChanceA,
      pauseChanceB: this.data.pauseChanceB,
      timeoutLogs: this.data.timeoutLogs
    };
    wx.setStorageSync('scoreBoardData', saveData);
    
    wx.navigateBack();
  },


  navigateBack() {
    wx.navigateBack({
      delta: 1 // 返回上一页
    })
    wx.vibrateShort({ type: 'light' }) // 可选震动反馈
  },

  // 页面卸载时清理
  onUnload() {
    this.clearTimer();
  }
})