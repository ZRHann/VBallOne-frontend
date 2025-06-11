// scoreBoard.js
Page({
  data: {
    matchId: -1,
    scoreList:[],
    scoreA: [],
    scoreB: [],
    set: 3,
    isExchange: false,
    startY: 0,       // 改为记录 Y 轴起始位置
    pauseChanceA: 2,
    pauseChanceB: 2,
    currentTeam: null,   // 积分操作
    isSliding: false,
    showTeamSelect: false,
    selectedTeam: null,
    showPause: false,   // 暂停操作
    countdown: 0,
    timer: null,
    timeoutLogsA: [] ,
    timeoutLogsB: [],
    isToolbarExpanded: false, // 新增工具栏状态
    hintDirection: '',
    cur_serveteam: '',
    serveA: 1,
    serveB: 1,
    isover: false
  },

  onLoad(options) {
    const setFromUrl = options.set ? parseInt(options.set) : 1;
    const cur_serveteam = options.cur_serveteam || 'A';
    const matchId = options.matchId;
    const savedData = wx.getStorageSync('scoreBoardData');
    if (savedData) {
      this.setData({
        ...savedData,
        // 确保数组存在
        scoreList: savedData.scoreList || [],
        scoreA: savedData.scoreA || [],
        scoreB: savedData.scoreB || [],
        set: setFromUrl
      });
    }
    if(options){
      this.setData({
        set: setFromUrl,
        cur_serveteam: cur_serveteam,
        matchId: matchId
      })
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

    let team = this.data.currentTeam
    const isIncrement = deltaY < 0 // 上滑加分，下滑减分

    if(!this.data.isover){
      // 更新分数
      if(this.data.isExchange) team = (this.data.currentTeam === 'A') ? 'B':'A'
      this.updateScore(team, isIncrement);

      const scoreA = this.data.scoreA.length
      const scoreB = this.data.scoreB.length
      let winscore = this.data.set == 3 ? 15 : 25
      // 结束比赛
      if((scoreA >= winscore || scoreB >=winscore) && Math.abs(scoreA-scoreB)>=2){
        this.setData({
          isover: true
        })
        wx.showModal({
          title: `第${this.data.set}局结束`,
          content:(scoreA>scoreB)? 'A队获胜':'B队获胜',
        })
        wx.request({
          url:  `https://vballone.zrhan.top/api/matches/${this.data.matchId}/sets`,
          method:'POST',
          data:{
            round: this.data.set,
            //scoreList: this.data.scoreList,
            scoreA: this.data.scoreA.length,
            scoreB: this.data.scoreB.length,
            //timeoutLogsA: this.data.timeoutLogsA,
            //timeoutLogsB: this.data.timeoutLogsB
          }
        })
      }
    } 
  },

  // 分数更新方法
  updateScore(team, isIncrement) {
    const field = `score${team}`;
    const last_serveteam = this.data.cur_serveteam;
    
    if (isIncrement) {
      // 加分
      
      // 记录得分
      this.data.scoreList.push(team);
      this.data[field].push(this.data.scoreList.length - 1);
    } else {
        // 撤销该队最后一次得分
        if (this.data[field].length > 0) {
          const lastIndex = this.data[field].pop();
          if (lastIndex != this.data.scoreList.length-1 && this.data.cur_serveteam ==team)  ;
          this.data.scoreList.splice(lastIndex, 1);
          console.info(lastIndex);

          // 更新所有后续索引
          for (let otherTeam of ['A', 'B']) {
            const otherField = `score${otherTeam}`;
            for (let i = 0; i < this.data[otherField].length; i++) {
              if (this.data[otherField][i] > lastIndex) {
                this.data[otherField][i] -= 1;
              }
            }
          }
        }
    }
    // 使用数组长度作为实际分数
    const scoreA = this.data.scoreA.length;
    const scoreB = this.data.scoreB.length;
    this.setData({
      scoreList: [...this.data.scoreList],
      [field]: [...this.data[field]],
      isExchange: (scoreA >= 8 || scoreB >= 8) && this.data.set === 3,
      serveA: (team != last_serveteam) && (team === 'A') ? (this.data.serveA % 6) +1 : this.data.serveA,
      serveB: (team != last_serveteam) && (team === 'B') ? (this.data.serveB % 6) +1 : this.data.serveB ,
      cur_serveteam: team,
    });
    wx.vibrateShort({type: 'light'});
  },

  // 切换工具栏状态
  toggleToolbar() {
    this.setData({
      isToolbarExpanded: !this.data.isToolbarExpanded
    })
    wx.vibrateShort({ type: 'light' })
  },

  // 点击暂停按钮
  handleShowTeamSelect() {
    if (!this.data.isover){
      this.setData({ showTeamSelect: true })
    }
    else {
      wx.showToast({
        title: '该局比赛已结束',
        icon: 'none',
        duration: 2000
      })
    }
    
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
      scoreA: this.data.scoreA.length,
      scoreB: this.data.scoreB.length
    } ;
    const key = `timeoutLogs${team}`;
    this.setData({ [key]: [...this.data[key], newRecord] });
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
    scoreList: this.data.scoreList,
    scoreA: this.data.scoreA,
    scoreB: this.data.scoreB,
    pauseChanceA: this.data.pauseChanceA,
    pauseChanceB: this.data.pauseChanceB,
    timeoutLogsA: this.data.timeoutLogsA,
    timeoutLogsB: this.data.timeoutLogsB,
    set: this.data.set,
    isExchange: this.data.isExchange,
    cur_serveteam: this.data.cur_serveteam,
    serveA: this.data.serveA,
    serveB: this.data.serveB,
    isover: this.data.isover
  };
    wx.setStorageSync('scoreBoardData', saveData);
    wx.navigateBack();
  },

  navigateBack() {
    this.viewRound()
    return

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