Page({
  data: {
    // 比赛信息
    matchId: -1,
    isBegin: [false,false,false,false],
    currentSet: 1,
    maxSets: 3,
    rotationA: [4,3,2,5,6,1],     // 轮次信息
    fir_playersA: ['', '', '', '', '', ''],
    cur_playersA: ['', '', '', '', '', ''],
    rotationB: [4,3,2,5,6,1],
    fir_playersB: ['', '', '', '', '', ''],
    cur_playersB: ['', '', '', '', '', ''],
    fir_serveteam: '',        // 发球方
    cur_serveteam: '',
    serveA: 1,
    serveB: 1,
    hasSavedGame: false,
    isFormShowA: false,
    isFormShowB: false,
    substitutionRecordsA:[],
    substitutionRecordsB:[],
    outPlayer: -1,
    inPlayer: -1,
    currentTeam: '',
    changeIndex: -1,
    isSubstitutionOpenA: false,
    isSubstitutionOpenB: false
  },

  // 保存到本地
  saveData() {
    wx.setStorageSync('lineup', this.data);
    wx.showToast({ title: '保存成功' });
  },

  onLoad(options) {
    // 加载其他数据
    const saved = wx.getStorageSync('lineup');
    const matchId = decodeURIComponent(options.matchId);
    this.setData({
      matchId: matchId
    });
    if (saved) this.setData(saved);
    const savedRecordsA = wx.getStorageSync('substitutionRecordsA');
    const savedRecordsB = wx.getStorageSync('substitutionRecordsB');
    if (savedRecordsA) this.setData({substitutionRecordsA: savedRecordsA});
    if (savedRecordsB) this.setData({substitutionRecordsB: savedRecordsB});
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

  // 切换换人记录展开状态
  toggleSubstitutionList: function(e) {
    const currentTeam = e.currentTarget.dataset.currentTeam;
    const key = `isSubstitutionOpen${currentTeam}`;
    this.setData({
      currentTeam: currentTeam,
      [key]: !this.data[key]
    });
  },

  showAddForm: function(e){
    const currentTeam = e.currentTarget.dataset.currentTeam;
    const key =  `isFormShow${currentTeam}`;
    const substitutionRecords = `substitutionRecords${currentTeam}`;
    if(this.data[substitutionRecords].length == 6){
      wx.showToast({
        title: `换人次数已满`,
        icon: 'error',
        duration: 2000
      });
      return ;
    }
    this.setData({
      currentTeam: currentTeam,
      [key]: true,
      outPlayer: null,
      inPlayer: null,
    });
  },

  hideAddForm(){
    const currentTeam =this.data.currentTeam;
    const key = `isFormShow${currentTeam}`;
    this.setData({
      [key]: false
    });
  },

  outChange: function(e){
    const index = e.detail.value;
    const currentTeam = this.data.currentTeam;
    const players = currentTeam == 'A' ? this.data.cur_playersA : this.data.cur_playersB;
    this.setData({
      outPlayer: players[index],
      changeIndex: index,
    });
  },

  inChange(e){
    const inPlayer = e.detail.value;
    this.setData({inPlayer: inPlayer});
  },

  addSubstitution(){
    const { outPlayer, inPlayer, changeIndex} =this.data;

    if(outPlayer == null || inPlayer == null){
      wx.showToast ({
        title: '请填写完整信息',
        icon: 'error'
      });
      return ;
    }

    if (outPlayer === inPlayer) {
      wx.showToast({ title: '换下和换上球员不能相同', icon: 'error' });
      return;
    }
    const newRecord={
      outPlayer,
      inPlayer
    };
    const key = `substitutionRecords${this.data.currentTeam}`;
    const isFormShow = `isFormShow${this.data.currentTeam}`;
    this.setData({
      [key]: [...this.data[key], newRecord],
      [isFormShow]:false,
      [`cur_players${this.data.currentTeam}[${changeIndex}]`]: inPlayer
    });

    if(this.data.currentTeam == 'A')wx.setStorageSync('substitutionRecordsA', this.data.substitutionRecordsA);
    else wx.setStorageSync('substitutionRecordsB', this.data.substitutionRecordsB);
  },

  // 删除记录
  deleteRecord: function(e) {
    const index = e.currentTarget.dataset.index;
    const currentTeam = e.currentTarget.dataset.currentTeam;
    const key = `substitutionRecords${currentTeam}`;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条换人记录吗？',
      success: (res) => {
        if (res.confirm) {
          const newRecords = [...this.data[key]];
          newRecords.splice(index, 1);
          this.setData({ [key]: newRecords });
          wx.setStorageSync(key, newRecords);
        }
      }
    });
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
    const matchId = this.data.matchId
    wx.showModal({
      title: '确定切换？',
      content: '确定切换？',
      complete: (res) => {
        if (res.cancel) {
          return ;
        }
        if (res.confirm) {
          wx.request({
            url: `https://vballone.zrhan.top/api/matches/${matchId}/sets`,
            method: 'POST',
            data:{
              round: this.data.currentSet,
              fir_playersA: this.data.fir_playersA,
              fir_playersB: this.data.fir_playersB,
              fir_serveteam: this.data.fir_serveteam,
              substitutionRecordsA: this.data.substitutionRecordsA,
              substitutionRecordsB: this.data.substitutionRecordsB
            }
          })
          this.reset();
          this.setData({ currentSet: set });
          this.loadSetData(set);
        }
      }
    })
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
      [`fir_players${team}[${index}]`]: value.replace(/[^0-9]/g, ''), // 只允许数字输入
      [`cur_players${team}[${index}]`]: value.replace(/[^0-9]/g, '')
    });
  },

  startGame(){
    const fir_serveteam = this.data.fir_serveteam
    if(fir_serveteam == ''){
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
    }  
    wx.navigateTo({
      url: `/pages/scoreBoard/scoreBoard?set=${this.data.currentSet}`+`&cur_serveteam=${this.data.cur_serveteam}&matchId=${this.data.matchId}`
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
    this.setData({
      [`teamA.players`]: ['','','','','',''],
      [`teamB.players`]: ['','','','','','']
    });
  }
})