import getAuthHeader from "../../utils/getAuthHeader";

Page({
  data: {
    matchId: -1,
    canvasImage: null,
    sets: [
      { title: "第一局：", teamA: "A队", teamB: "B队" },
      { title: "第二局：", teamA: "B队", teamB: "A队" },
      { title: "第三局：", teamA: "B队", teamB: "A队" }
    ],
    lastScoreA: 0,
    lastScoreB: 0,
    playersA: [],
    playersB: [],
    rotation: [4,3,2,5,6,1],
    scoreA:[],
    scoreB:[],
    timeoutsA: [],
    timeoutsB: [],
    substitution: [
      {  teamA: {outPlayer: 1, inPlayer: 12}, teamB: {outPlayer: 1, inPlayer: 12} },
      {  teamA: {outPlayer: 1, inPlayer: 12}, teamB: {outPlayer: 1, inPlayer: 12} },
      {  teamA: {outPlayer: 1, inPlayer: 12}, teamB: {outPlayer: 1, inPlayer: 12} },
    ]
  },

  onLoad(options){
    const matchId = decodeURIComponent(options.matchId);
    this.setData({
      matchId: matchId
    });
    this.getData();
    this.generateScoreSheet();
  },

  getData(){
    const matchId = this.data.matchId;
    const savedData = wx.getStorageSync('scoreBoardData');
    const lineup = wx. getStorageSync('lineup');
    console.info(savedData);
    if (savedData) {
      this.setData({
        // 确保数组存在
        scoreA: savedData.scoreA || [],
        scoreB: savedData.scoreB || [],
        lastScoreA: savedData.lastScoreA || 0,
        lastScoreB: savedData.lastScoreB || 0,
        timeoutsA: savedData.timeoutLogsA || [],
        timeoutsB: savedData.timeoutLogsB || []
      });
    }
    if (lineup) {
      this.setData({
        playersA: lineup.fir_playersA,
        playersB: lineup.fir_playersB,
      });
    }
    
  },

  generateScoreSheet() {
    const ctx = wx.createCanvasContext('scoreSheetCanvas');
    const padding = 10;
    const colWidth =60;
    let yPos = 30;
    
    // 设置全局样式
    ctx.setFillStyle('#000000');
    ctx.setStrokeStyle('#000000');
    ctx.setLineWidth(1);
    ctx.setFontSize(12);
    
    // 1. 绘制表头
    ctx.setFontSize(16);
    ctx.setTextAlign('center');
    ctx.fillText('排球比赛记分表', 150, yPos);
    yPos += 30;
    
    // 2. 绘制三局比赛数据
    this.data.sets.forEach((set, setIndex) => {
      // 局标题
      ctx.setFontSize(14);
      ctx.fillText(set.title, 120, yPos + 15);
      ctx.fillText(this.data.lastScoreA, 160, yPos + 15);
      ctx.fillText(":", 180, yPos + 15);
      ctx.fillText(this.data.lastScoreB, 200, yPos + 15);
      yPos += 30;
      
      // 队伍行
      ctx.setTextAlign('center');
      ctx.fillText('比赛队伍', padding + colWidth/2, yPos + 20);
      ctx.fillText(set.teamA, padding + colWidth + colWidth, yPos + 20);
      ctx.fillText(set.teamB, padding + colWidth*3 + colWidth, yPos + 20);
      
      // 绘制单元格边框
      ctx.strokeRect(padding , yPos, colWidth, 30);
      ctx.strokeRect(padding + colWidth, yPos, colWidth*2, 30);
      ctx.strokeRect(padding + colWidth*3, yPos, colWidth*2, 30);
      yPos += 30;
      
      // 3. 首轮位置 (2x3 网格)
      ctx.fillText('首轮位置', padding + colWidth/2, yPos + 30);
      
      // 左侧队伍站位
      this.drawPositionGrid(ctx, padding + colWidth, yPos, this.data.playersA);
      
      // 右侧队伍站位
      this.drawPositionGrid(ctx, padding + colWidth*3, yPos, this.data.playersB);
      
      // 绘制单元格边框
      ctx.strokeRect(padding, yPos, colWidth, 50);
      ctx.strokeRect(padding + colWidth, yPos, colWidth*2, 50);
      ctx.strokeRect(padding + colWidth*3, yPos, colWidth*2, 50);
      yPos += 50;
      
      // 4. 得分记录
      ctx.setTextAlign('center');
      ctx.fillText('得分', padding + colWidth/2, yPos + 80);
      
      // 左侧队伍得分
      this.drawPointGrid(ctx, padding + colWidth, yPos, this.data.scoreA, this.data.scoreB);
      
      // 绘制单元格边框
      ctx.strokeRect(padding, yPos, colWidth, 200);
      ctx.strokeRect(padding + colWidth, yPos, colWidth*4, 200);
      yPos += 200;
      
      // 5. 暂停记录
      ctx.setTextAlign('center');
      ctx.fillText('暂停', padding + colWidth/2, yPos + 35);
      
      this.drawPauseGrid(ctx, padding + colWidth, yPos,this.data.timeoutsA);
      this.drawPauseGrid(ctx, padding + colWidth*3, yPos,this.data.timeoutsB);
      
      // 绘制单元格边框
      ctx.strokeRect(padding, yPos, colWidth, 60);
      ctx.strokeRect(padding + colWidth, yPos, colWidth*2, 60);
      ctx.strokeRect(padding + colWidth*3, yPos, colWidth*2, 60);
      yPos += 60;
      
      // 6. 换人记录
      ctx.setTextAlign('center');
      ctx.fillText('换人', padding + colWidth/2, yPos + 70);
      
      this.drawchangeGrid(ctx, padding + colWidth, yPos,this.data.substitution[setIndex].teamA);
      this.drawchangeGrid(ctx, padding + colWidth*3, yPos,this.data.substitution[setIndex].teamB);
      
      // 绘制单元格边框
      ctx.strokeRect(padding, yPos, colWidth, 180);
      ctx.strokeRect(padding + colWidth, yPos, colWidth*2, 180);
      ctx.strokeRect(padding + colWidth*3, yPos, colWidth*2,180);
      yPos += 220; // 添加额外间距
    });
    
  },
  
  // 绘制站位网格 (2x3)
  drawPositionGrid(ctx, x, y, positions) {
    const cellWidth = 40;
    const cellHeight = 25;
    
    // 绘制网格线
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.strokeRect(
          x + col * cellWidth, 
          y + row * cellHeight, 
          cellWidth, 
          cellHeight
        );
        
        // 填充位置编号
        const index = row * 3 + col;
        if (index < positions.length) {
          const pos = this.data.rotation[index];
          ctx.setTextAlign('center');
          ctx.fillText(
            positions[pos-1], 
            x + col * cellWidth + cellWidth/2, 
            y + row * cellHeight + cellHeight/2 + 5
          );
        }
      }
    }
  },
  
  drawPointGrid(ctx, x, y, pointA, pointB) {
    const cellWidth = 20;
    const cellHeight = 18;
    let indexA = 0;
    let indexB = 0;
    
    // 绘制网格线
    for (let z =0 ; z <5 ; z ++){
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 12; col++) {
          ctx.strokeRect(
            x + col * cellWidth, 
            y + row * cellHeight + 40*z, 
            cellWidth, 
            cellHeight
          );
          
          // 填充位置编号
          if (row == 0){
            if (indexA < pointA.length) {
              ctx.setTextAlign('center');
              ctx.fillText(
                pointA[indexA] == 0 ? " " : pointA[indexA++] , 
                x + col * cellWidth + cellWidth/2, 
                y + row * cellHeight + cellHeight/2 + 8 + 40*z
              );
            }
          }
          else{
            if (indexB < pointB.length) {
              ctx.setTextAlign('center');
              ctx.fillText(
                pointB[indexB] == 0 ? " " : pointB[indexB++] ,
                x + col * cellWidth + cellWidth/2, 
                y + row * cellHeight + cellHeight/2 + 8 + 40*z
              );
            }
          }
          
        }
      }
    }
  },

  drawPauseGrid(ctx, x, y, timeouts) {
    const cellHeight = 30; // 每行高度
    const cellWidth = 120;  // 每列宽度
    
    // 3. 绘制数据行
    for (let i = 0; i < 2; i++) {
      const rowY = y  + cellHeight * i;
      
      // 绘制暂停标识列
      ctx.strokeRect(x, rowY, cellWidth, cellHeight);
      if (i < timeouts.length) {
        ctx.fillText(timeouts[i].id , x + cellWidth/6, rowY + cellHeight/2 + 5);
        ctx.fillText(timeouts[i].scoreA , x + cellWidth/2, rowY + cellHeight/2 + 5);
        ctx.fillText(':' , x + cellWidth/2+20, rowY + cellHeight/2 + 5);
        ctx.fillText(timeouts[i].scoreB, x + cellWidth-20, rowY + cellHeight/2 + 5);
      }
    }
  },

  drawPauseGrid(ctx, x, y, timeouts) {
    const cellHeight = 30; // 每行高度
    const cellWidth = 120;  // 每列宽度
    
    // 3. 绘制数据行
    for (let i = 0; i < 2; i++) {
      const rowY = y  + cellHeight * i;
      
      // 绘制暂停标识列
      ctx.strokeRect(x, rowY, cellWidth, cellHeight);
      if (i < timeouts.length) {
        ctx.fillText(timeouts[i].id , x + cellWidth/6, rowY + cellHeight/2 + 5);
        ctx.fillText(timeouts[i].scoreA , x + cellWidth/2, rowY + cellHeight/2 + 5);
        ctx.fillText(':' , x + cellWidth/2+20, rowY + cellHeight/2 + 5);
        ctx.fillText(timeouts[i].scoreB, x + cellWidth-20, rowY + cellHeight/2 + 5);
      }
    }
  },

  drawchangeGrid(ctx, x, y, substitution) {
    const cellHeight = 30; // 每行高度
    const cellWidth = 120;  // 每列宽度
    
    // 3. 绘制数据行
    for (let i = 0; i < 6; i++) {
      const rowY = y  + cellHeight * i;
      
      // 绘制暂停标识列
      ctx.strokeRect(x, rowY, cellWidth, cellHeight);
      if (i < substitution.length) {
        ctx.fillText(substitution[i].outPlayer , x + cellWidth/6, rowY + cellHeight/2 + 5);
        ctx.fillText('↓' , x + cellWidth/2, rowY + cellHeight/2 + 5);
        ctx.fillText(substitution[i].inPlayer , x + cellWidth/2+20, rowY + cellHeight/2 + 5);
        ctx.fillText('↑', x + cellWidth-20, rowY + cellHeight/2 + 5);
      }
    }
  }
      
      
});