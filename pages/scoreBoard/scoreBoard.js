// scoreBoard.js
Page({
  data: {
    scoreA: 0,
    scoreB: 0,
    startY: 0,       // 改为记录 Y 轴起始位置
    currentTeam: null,
    isSliding: false,
  hintDirection: ''
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
    wx.vibrateShort()
  },

  navigateBack() {
    wx.navigateBack({
      delta: 1 // 返回上一页
    })
    wx.vibrateShort({ type: 'light' }) // 可选震动反馈
  }
})