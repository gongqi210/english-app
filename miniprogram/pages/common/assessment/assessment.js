Page({
  data: {
    status: 'testing',
    progress: 60,
    currentQuestion: 2,
    totalQuestions: 5,
    isRecording: false,
    selectedAnswer: null,
    currentQ: {
      type: 'choice',
      question: 'Listen and choose: What do you see?',
      imageUrl: 'https://picsum.photos/300/200?random=201',
      options: [
        { image: 'https://picsum.photos/200/200?random=202' },
        { image: 'https://picsum.photos/200/200?random=203' },
        { image: 'https://picsum.photos/200/200?random=204' },
        { image: 'https://picsum.photos/200/200?random=205' }
      ]
    },
    abilities: [
      { name: '听力理解', score: 85, desc: '掌握基础听力技能' },
      { name: '词汇量', score: 90, desc: '掌握150+词汇' },
      { name: '口语表达', score: 70, desc: '需加强练习' },
      { name: '阅读理解', score: 75, desc: '基础扎实' }
    ]
  },

  onLoad: function() {
    this.loadQuestions();
  },

  loadQuestions: function() {
    // 加载测评题目
  },

  onBack: function() {
    wx.navigateBack();
  },

  onSelectOption: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedAnswer: index });
  },

  toggleRecording: function() {
    if (this.data.isRecording) {
      this.setData({ isRecording: false });
      // 模拟评分
      setTimeout(() => {
        wx.showToast({ title: '评分完成', icon: 'success' });
      }, 500);
    } else {
      this.setData({ isRecording: true });
    }
  },

  onNextQuestion: function() {
    const { currentQuestion, totalQuestions } = this.data;

    if (currentQuestion < totalQuestions - 1) {
      this.setData({
        currentQuestion: currentQuestion + 1,
        progress: ((currentQuestion + 2) / totalQuestions) * 100,
        selectedAnswer: null
      });
    } else {
      // 完成测评，显示报告
      this.setData({
        status: 'report'
      });
    }
  }
});
