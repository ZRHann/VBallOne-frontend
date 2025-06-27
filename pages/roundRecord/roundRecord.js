import getAuthHeader from "../../utils/getAuthHeader";

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
    isSubstitutionOpenB: false,
    pauseA: [],
    pauseB: []
  },

  // 保存到本地
  saveData() {
    wx.setStorageSync('lineup', this.data);
    this.syncStorageToServer();
    wx.showToast({ title: '保存成功' });
  },

  // --------- 新增: 需同步到后端的本地 Storage Key 列表 ---------
  storageKeysToSync() {
    // 固定的几个 key
    const baseKeys = ['lineup', 'substitutionRecordsA', 'substitutionRecordsB', 'scoreBoardData', 'currentServeTeam'];
    // 动态局数据 key，例如 set1、set2...
    const setKeys = [];
    for (let i = 1; i <= this.data.maxSets; i++) {
      setKeys.push(`set${i}`);
    }
    return baseKeys.concat(setKeys);
  },

  // --------- 退出页面时: 将指定 Storage 写回后端 ---------
  syncStorageToServer() {
    const roundRecordData = {};
    const keys = this.storageKeysToSync();

    keys.forEach((key) => {
      const value = wx.getStorageSync(key);
      if (value !== undefined && value !== '') {
        roundRecordData[key] = value;
      }
    });
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${this.data.matchId}`,
      method: 'PUT',
      header: getAuthHeader(),
      data: { roundRecordData: roundRecordData },
    });
  },

  // --------- 进入页面时: 从后端拉取 Storage 并写入本地 ---------
  loadStorageFromServer() {
    wx.request({
      url: `https://vballone.zrhan.top/api/matches/${this.data.matchId}`,
      method: 'GET',
      header: getAuthHeader(),
      success: (res) => {
        const roundRecordData = res.data.roundRecordData;
        const scoreBoardData = res.data.scoreBoardData;
        if (roundRecordData) {
          Object.keys(roundRecordData).forEach((key) => {
            wx.setStorageSync(key, roundRecordData[key]);
          });
        }
        if(scoreBoardData) {
          wx.setStorageSync('scoreBoardData', scoreBoardData);
        }

        const saved = wx.getStorageSync('lineup');
        if (saved) this.setData(saved);
        const savedRecordsA = wx.getStorageSync('substitutionRecordsA');
        const savedRecordsB = wx.getStorageSync('substitutionRecordsB');
        if (savedRecordsA) this.setData({substitutionRecordsA: savedRecordsA});
        if (savedRecordsB) this.setData({substitutionRecordsB: savedRecordsB});

        if (scoreBoardData) {
          this.setData({
            cur_serveteam: scoreBoardData.cur_serveteam,
            serveA: scoreBoardData.serveA,
            serveB: scoreBoardData.serveB,
            pauseA: scoreBoardData.timeoutLogsA,
            pauseB: scoreBoardData.timeoutLogsB
          });
        }
      },
    });
  },

  onLoad(options) {
    // 加载其他数据
    const matchId = decodeURIComponent(options.matchId);
    this.setData({
      matchId: matchId
    });
    this.loadStorageFromServer();
    setTimeout(() => {
      this.loadStorageFromServer();
    }, 1000);
  },

  onShow() {
    // 显示保存的游戏数据（但不移除存储）
    this.loadStorageFromServer();
  },

  // 切换换人记录展开状态
  toggleSubstitutionList: function(e) {
    const team = e.currentTarget.dataset.currentTeam;
    const key = `isSubstitutionOpen${team}`;
    this.setData({
      [key]: !this.data[key]
    });
  },

  // 添加换人记录
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

  // 隐藏换人表单
  hideAddForm(){
    const currentTeam =this.data.currentTeam;
    const key = `isFormShow${currentTeam}`;
    this.setData({
      [key]: false
    });
  },

  // 换下的队员
  outChange: function(e){
    const index = e.detail.value;
    const currentTeam = this.data.currentTeam;
    const players = currentTeam == 'A' ? this.data.cur_playersA : this.data.cur_playersB;
    this.setData({
      outPlayer: players[index],
      changeIndex: index,
    });
  },

  // 换上场的队员
  inChange(e){
    const inPlayer = e.detail.value;
    this.setData({inPlayer: inPlayer});
  },

  // 添加换人日志
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
          this.syncStorageToServer();
          this.reset();
          this.setData({ currentSet: set });
          this.saveData();
          this.syncStorageToServer();
        }
      }
    })
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

  // 打开翻分板
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
    this.saveData();
    wx.navigateTo({
      url: `/pages/scoreBoard/scoreBoard?set=${this.data.currentSet}`+`&fir_serveteam=${this.data.fir_serveteam}&cur_serveteam=${this.data.cur_serveteam}&matchId=${this.data.matchId}`
    });
  },

  // 返回
  navigateBack() {
    this.syncStorageToServer();
    wx.removeStorageSync('scoreBoardData');
    wx.removeStorageSync('lineup');
    wx.removeStorageSync('currentServeTeam');
    wx.removeStorageSync('substitutionRecordsA');
    wx.removeStorageSync('substitutionRecordsB');
    wx.navigateBack({
      delta: 1 // 返回上一页
    })
    wx.vibrateShort({ type: 'light' }) // 可选震动反馈
  },

  // 重置当前局
  reset() {
    this.setData({
      fir_playersA: ['','','','','',''],
      fir_playersB: ['','','','','',''],
      cur_playersA: ['','','','','',''],
      cur_playersB: ['','','','','',''],
      fir_serveteam: '',        
      cur_serveteam: '',
      serveA: 1,
      serveB: 1,
      isFormShowA: false,
      isFormShowB: false,
      substitutionRecordsA:[],
      substitutionRecordsB:[],
      outPlayer: -1,
      inPlayer: -1,
      currentTeam: '',
      changeIndex: -1,
      isSubstitutionOpenA: false,
      isSubstitutionOpenB: false,
      pauseA: [],
      pauseB: []
    });
  },

  onUnload() {
    // this.syncStorageToServer();
  }
})