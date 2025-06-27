// scoreBoard.js
import getAuthHeader from "../../utils/getAuthHeader";

Page({
  data: {
    matchId: -1,
    scoreA: [],
    scoreB: [],
    lastScoreA: 0,
    lastScoreB: 0,
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
    fir_serveteam: '',
    cur_serveteam: '',
    serveA: 1,
    serveB: 1,
    isover: false
  },

  onLoad(options) {
    const setFromUrl = options.set ? parseInt(options.set) : 1;
    const cur_serveteam = options.cur_serveteam || 'A';
    const fir_serveteam = options.fir_serveteam;
    const matchId = options.matchId;
    if(options){
      this.setData({
        set: setFromUrl,
        cur_serveteam: cur_serveteam,
        fir_serveteam: fir_serveteam,
        matchId: matchId
      })
    }
    this.loadBoardDataFromServer();
    
    
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

      const scoreA = this.data.lastScoreA
      const scoreB = this.data.lastScoreB
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
          url:  `https://vballone.zrhan.top/api/matches/${this.data.matchId}`,
          method:'PUT',
          header: getAuthHeader(),
          data:{
            round: this.data.set,
            scoreA: this.data.lastScoreA,
            scoreB: this.data.lastScoreB,
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
    const lastscore = `lastScore${team}`;
    let newscore = this.data[lastscore];
    const other = team == 'A'? 'scoreB' : 'scoreA';
    const last_serveteam = this.data.cur_serveteam;
    const scoreA = this.data.lastScoreA;
    const scoreB = this.data.lastScoreB;
    let lastindex = this.data[field].length-1;
    let serveA = this.data.serveA;
    let serveB = this.data.serveB;

    if (isIncrement) {
      // 加分
      // 记录得分
      this.data[field].push(this.data[lastscore]+1);
      this.data[other].push(0);
      newscore = newscore + 1;
      if(team !=last_serveteam ){
        serveA = team == 'A' ? (this.data.serveA % 6) +1 : serveA;
        serveB = team == 'B' ? (this.data.serveB % 6) +1 : serveB;
      }
      if(this.data.scoreA[lastindex] == 0){
        serveA = team == 'A' ? (this.data.serveA + 4)%6 +1  : this.data.serveA
        serveB = team == 'B' ? (this.data.serveB + 4)%6 +1  : this.data.serveB
      }
    } else {
        // 撤销该队最后一次得分
        if(this.data.scoreA.length == 0){ 
          return ;
        }
        if (this.data[field][lastindex] != 0) {
          this.data[field].pop();
          this.data[other].pop();
          newscore = newscore - 1;
        }
        else{
          if (this.data[other][lastindex] != 0){
            wx.showModal({
              title: '',
              content: '请根据得分顺序撤销得分',
            });
            return ;
          }
          else {
            return ;
          }
        }
    }
    if (this.data.scoreA.length == 0) {
      serveA = 1;
      serveB = 1;
    }

    this.setData({
      [field]: [...this.data[field]],
      [other]: [...this.data[other]],
      [lastscore]: newscore,
      isExchange: (scoreA >= 7 || scoreB >= 7) && this.data.set === 3,
      serveA: serveA,
      serveB: serveB,
      cur_serveteam: this.data.scoreA[lastindex] == 0 ? (this.data.scoreB[lastindex] == 0 ? fir_serveteam : 'B' ): 'A' , 
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
      const newLog = {
        id: 3-this.data[key] == 1 ? '1st': '2nd',
        scoreA: this.data.scoreA.length,
        scoreB: this.data.scoreB.length
      };
      const Logteam = `timeoutLogs${team}`;
      const existlog = this.data[Logteam] || [];
      this.setData({ 
        selectedTeam: team,
        showTeamSelect: false,
        showPause: true,
        countdown: 30,
        [key]: this.data[key] - 1,
        [Logteam]: [...existlog, newLog]
      });
      this.startCountdown();
    }
  },

  // 取消暂停
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

  // 查看轮次
  viewRound() {
  // 保存当前数据
  const saveData = {
    scoreA: this.data.scoreA,
    scoreB: this.data.scoreB,
    lastScoreA: this.data.lastScoreA,
    lastScoreB: this.data.lastScoreB,
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

  // 返回
  navigateBack() {
    this.viewRound()
    this.saveBoardDataToServer();
    return
  },

  // 页面卸载时清理
  onUnload() {
    this.clearTimer();
  },

  // 从服务器加载数据
  loadBoardDataFromServer(){
    const matchId = this.data.matchId;
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${matchId}`,
      method: 'GET',
      header: getAuthHeader(),
      success: (res) => {
        const scoreBoardData = res.data.scoreBoardData;
        console.info(res.data);
        if (scoreBoardData.set == this.data.set) {
          wx.setStorageSync('scoreBoardData', scoreBoardData);
          const savedData = wx.getStorageSync('scoreBoardData');
          if (savedData) {
            this.setData({
              // 确保数组存在
              scoreA: savedData.scoreA || [],
              scoreB: savedData.scoreB || [],
              timeoutLogsA: savedData.timeoutLogsA || [],
              timeoutLogsB: savedData.timeoutLogsB || [],
              lastScoreA: savedData.lastScoreA || 0,
              lastScoreB: savedData.lastScoreB || 0,
              isExchange: savedData.isExchange || false,
              pauseChanceA: savedData.pauseChanceA || 2,
              pauseChanceB: savedData.pauseChanceB || 2,
              fir_serveteam: savedData.fir_serveteam || '',
              cur_serveteam: savedData.cur_serveteam || '',
              serveA: savedData.serveA || 1,
              serveB: savedData.serveB || 1,
              isover: savedData.isover || false
            });
          }
        }
      }
    })
  },

  saveBoardDataToServer(){
    const matchId = this.data.matchId;
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${matchId}`,
      method: 'PUT',
      header: getAuthHeader(),
      data: {
        scoreBoardData: wx.getStorageSync('scoreBoardData')
      }
    })
  }
})