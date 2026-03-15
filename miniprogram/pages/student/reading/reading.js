// pages/student/reading/reading.js
Page({
  data: {
    bookTitle: 'The Little Prince',
    currentSentence: 'It is only with the heart that one can see rightly.',
    score: {
      total: 88,
      pronunciation: 88,
      fluency: 82,
      intonation: 80,
      completeness: 92
    },
    problemWords: [
      { word: 'invisible', phonetic: '/ɪnˈvɪzəbl/', problem: '发音偏快', score: 75 },
      { word: 'essential', phonetic: '/ɪˈsenʃl/', problem: '发音清晰', score: 85 },
      { word: 'heart', phonetic: '/hɑːt/', problem: '发音正确', score: 95 }
    ],
    isRecording: false,
    recordingTime: 0,
    timer: null
  },

  onLoad(options) {
    if (options.title) {
      this.setData({ bookTitle: options.title });
    }
  },

  // 播放正确发音
  playCorrectSound(e) {
    const word = e.currentTarget.dataset.word;
    wx.showToast({ title: `播放: ${word}`, icon: 'none' });
  },

  // 开始录音
  startRecording() {
    this.setData({ isRecording: true, recordingTime: 0 });
    const timer = setInterval(() => {
      this.setData({ recordingTime: this.data.recordingTime + 1 });
    }, 1000);
    this.setData({ timer });
    wx.showToast({ title: '开始录音', icon: 'none' });
  },

  // 停止录音
  stopRecording() {
    const { timer } = this.data;
    if (timer) {
      clearInterval(timer);
    }
    this.setData({ isRecording: false });
    wx.showToast({ title: '录音完成', icon: 'success' });

    // 模拟评分
    setTimeout(() => {
      this.setData({
        score: {
          total: Math.floor(Math.random() * 20) + 75,
          pronunciation: Math.floor(Math.random() * 20) + 75,
          fluency: Math.floor(Math.random() * 20) + 75,
          intonation: Math.floor(Math.random() * 20) + 75,
          completeness: Math.floor(Math.random() * 20) + 75
        }
      });
    }, 1500);
  },

  // 切换录音状态
  toggleRecording() {
    if (this.data.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },

  // 再次跟读
  tryAgain() {
    wx.navigateBack();
  },

  // 开始测验
  startQuiz() {
    wx.navigateTo({
      url: '/pages/student/quiz/quiz'
    });
  },

  // 练习单词
  practiceWord(e) {
    const word = e.currentTarget.dataset.word;
    wx.showModal({
      title: '练习单词',
      content: `请跟读: ${word}`,
      editable: true,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '发音不错!', icon: 'success' });
        }
      }
    });
  },

  // 查看全部分数
  viewAllScores() {
    wx.showModal({
      title: '详细评分',
      content: `总分: ${this.data.score.total}\n发音: ${this.data.score.pronunciation}\n流畅度: ${this.data.score.fluency}\n语调: ${this.data.score.intonation}\n完整度: ${this.data.score.completeness}`,
      showCancel: false
    });
  }
});
