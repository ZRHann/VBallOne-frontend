// pages/editMatch/editMatch.js
const getAuthHeader = require("../../utils/getAuthHeader");
Page({
  data: {
    id: '',          // 比赛ID
    name: '',        // 比赛名称
    location: '',    // 比赛地点
    date: '',        // YYYY-MM-DD
    time: '',        // HH:MM
    isSaving: false, // 保存状态
    currentDate: '' // 最小可选日期
  },

  onLoad(options) {
    // 接收参数并解码
    if (!options.id) {
      wx.showToast({ title: '未接收到比赛ID', icon: 'none' });
      wx.navigateBack();
      return;
    }
    // 解析传入的日期字符串（可能为 ISO 格式或仅日期）
    const rawDateStr = decodeURIComponent(options.date || '');
    let datePart = '';
    let timePart = '';
    if (rawDateStr.includes('T')) {
      const [d, t] = rawDateStr.split('T');
      datePart = d;
      // t 形如 HH:MM:SSZ
      timePart = t ? t.substring(0,5) : '';
    } else if (rawDateStr) {
      datePart = rawDateStr;
    }

    this.setData({
      id: options.id,
      name: decodeURIComponent(options.name),
      location: decodeURIComponent(options.location),
      date: datePart,
      time: timePart
    });
  },

  // 输入处理
  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },
  onLocationInput(e) {
    this.setData({ location: e.detail.value });
  },

  // picker 回调
  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },

  // 保存逻辑
  async handleSave() {
    if (!this.validateForm()) return;

    this.setData({ isSaving: true });
    
    try {
      const res = await wx.request({
        url: `https://vballone.zrhan.top/api/matches/${this.data.id}`,
        method: 'PUT',
        header: getAuthHeader(),
        data: {
          name: this.data.name,
          location: this.data.location,
          match_date: `${this.data.date}T${this.data.time || '00:00'}:00Z` // ISO格式
        }
      });

      if (res.statusCode === 200) {
        wx.showToast({ title: '修改成功' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ isSaving: false });
    }
  },

  // 表单验证
  validateForm() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '名称不能为空', icon: 'none' });
      return false;
    }
    if (!this.data.date) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return false;
    }
    if (!this.data.time) {
      wx.showToast({ title: '请选择时间', icon: 'none' });
      return false;
    }
    return true;
  }
});