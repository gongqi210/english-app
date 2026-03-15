const api = require('../../../utils/api.js');

Page({
  data: {
    homeworkId: null,
    levelId: 1,
    levelName: '单词认知',
    currentLevel: 1,
    timeElapsed: '00:00',
    timer: null,
    seconds: 0,

    questions: [],

    currentQuestion: 0,
    progress: 0,
    currentQ: {},

    // 答题状态
    selectedAnswer: '',
    inputAnswer: '',
    isCorrect: false,
    showResult: false,
    canSubmit: false,

    // 录音状态
    isRecording: false,
    showReadingScore: false,
    readingScore: 0,

    // 听力播放状态
    isPlaying: false,

    // 匹配题状态
    matchedPairs: [],
    matchedLeft: null,
    selectedRight: null,

    // 键盘
    keyboardRows: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ],

    // 结果统计
    correctCount: 0,
    showResultModal: false,
    grade: 'A+',
    starCount: 5,

    // 加载状态
    isLoading: true
  },

  onLoad: function(options) {
    const { homeworkId, levelId } = options;
    this.setData({
      homeworkId,
      levelId: parseInt(levelId) || 1
    });

    this.loadQuestions();
    this.startTimer();
  },

  onUnload: function() {
    this.stopTimer();
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return false;
    }
    return true;
  },

  // 加载题目数据
  loadQuestions: function() {
    if (!this.checkLogin()) return;

    const { homeworkId, levelId } = this.data;

    api.challenge.getQuestions(homeworkId, levelId).then(questions => {
      if (questions && questions.length > 0) {
        this.setData({
          questions,
          currentQ: questions[0],
          progress: (1 / questions.length) * 100,
          isLoading: false
        });
      } else {
        // 使用默认题目数据
        this.setDefaultQuestions();
      }
    }).catch(err => {
      console.error('获取题目失败:', err);
      this.setDefaultQuestions();
    });
  },

  // 设置默认题目
  setDefaultQuestions: function() {
    const defaultQuestions = [
      {
        id: 1,
        type: 'choice',
        question: 'What color is the apple?',
        imageUrl: 'https://picsum.photos/300/200?random=101',
        options: [
          { key: 'A', value: 'Red' },
          { key: 'B', value: 'Blue' },
          { key: 'C', value: 'Yellow' },
          { key: 'D', value: 'Green' }
        ],
        correctKey: 'A',
        explanation: 'An apple can be red, green, or yellow. This one is red.',
        isHintShown: false
      },
      {
        id: 2,
        type: 'listening',
        question: 'Listen and choose the correct picture:',
        audioUrl: '/assets/audio/apple.mp3',
        imageOptions: [
          { id: 'A', url: 'https://picsum.photos/200/200?random=102' },
          { id: 'B', url: 'https://picsum.photos/200/200?random=103' },
          { id: 'C', url: 'https://picsum.photos/200/200?random=104' }
        ],
        correctId: 'A',
        explanation: 'The audio says "Apple", so we choose the apple.',
        isHintShown: false
      },
      {
        id: 3,
        type: 'fill_blank',
        question: 'Complete the word: A___le',
        hint: 'Fill in the missing letter',
        keyboard: 'letter',
        blanks: [
          { filled: true, value: '' },
          { filled: false, maxLength: 1 },
          { filled: true, value: '' },
          { filled: true, value: '' },
          { filled: true, value: '' }
        ],
        correctAnswer: 'p',
        explanation: 'The word is "Apple", so we need letter "p".',
        isHintShown: false
      },
      {
        id: 4,
        type: 'tracing',
        target: 'A',
        explanation: 'Great job tracing the letter A!',
        isHintShown: false
      },
      {
        id: 5,
        type: 'reading',
        sentence: 'I love my family.',
        referenceAudio: '/assets/audio/family.mp3',
        isHintShown: false
      }
    ];

    this.setData({
      questions: defaultQuestions,
      currentQ: defaultQuestions[0],
      progress: (1 / defaultQuestions.length) * 100,
      isLoading: false
    });
  },

  // 计时器
  startTimer: function() {
    const timer = setInterval(() => {
      const s = this.data.seconds + 1;
      const min = Math.floor(s / 60);
      const sec = s % 60;
      this.setData({
        seconds: s,
        timeElapsed: `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      });
    }, 1000);

    this.setData({ timer });
  },

  stopTimer: function() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  onExit: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出本次作业吗？',
      success: (res) => {
        if (res.confirm) {
          this.stopTimer();
          wx.navigateBack();
        }
      }
    });
  },

  // ========== 选择题 ==========
  selectOption: function(e) {
    if (this.data.showResult) return;
    const key = e.currentTarget.dataset.key;
    this.setData({
      selectedAnswer: key,
      canSubmit: true
    });
  },

  // ========== 听力题 - 图片选择 ==========
  selectImageOption: function(e) {
    if (this.data.showResult) return;
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedAnswer: id,
      canSubmit: true
    });
  },

  playAudio: function() {
    this.setData({ isPlaying: true });
    // 实际项目中播放音频
    setTimeout(() => {
      this.setData({ isPlaying: false });
    }, 2000);
  },

  // ========== 填空题 ==========
  handleFillInput: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const { blanks } = this.data.currentQ;
    blanks[index].value = value;
    blanks[index].filled = !!value;
    this.setData({
      'currentQ.blanks': blanks,
      canSubmit: blanks.every(b => b.filled)
    });
  },

  onKeyPress: function(e) {
    const key = e.currentTarget.dataset.key;
    if (key === '⌫') {
      // 删除
      this.deleteChar();
    } else {
      // 输入字符
      this.inputChar(key);
    }
  },

  inputChar: function(char) {
    const { blanks } = this.data.currentQ;
    const emptyIndex = blanks.findIndex(b => !b.filled);
    if (emptyIndex !== -1) {
      blanks[emptyIndex].value = char;
      blanks[emptyIndex].filled = true;
      this.setData({
        'currentQ.blanks': blanks,
        canSubmit: blanks.every(b => b.filled)
      });
    }
  },

  deleteChar: function() {
    const { blanks } = this.data.currentQ;
    // 从后往前找第一个有值的
    for (let i = blanks.length - 1; i >= 0; i--) {
      if (blanks[i].filled) {
        blanks[i].value = '';
        blanks[i].filled = false;
        break;
      }
    }
    this.setData({
      'currentQ.blanks': blanks,
      canSubmit: blanks.every(b => b.filled)
    });
  },

  // ========== 手写/描红题 ==========
  clearCanvas: function() {
    const ctx = wx.createCanvasContext('writingCanvas');
    ctx.clearRect(0, 0, 700, 400);
    ctx.draw();
  },

  submitTracing: function() {
    // 提交书写结果，进行识别
    this.setData({
      showResult: true,
      isCorrect: true,
      correctCount: this.data.correctCount + 1,
      canSubmit: false
    });
  },

  onTouchStart: function(e) {
    // 开始书写
  },

  onTouchMove: function(e) {
    // 书写移动
  },

  onTouchEnd: function(e) {
    // 书写结束
  },

  // ========== 跟读题 ==========
  toggleRecording: function() {
    if (this.data.isRecording) {
      // 结束录音
      this.setData({ isRecording: false });
      // 模拟评分
      setTimeout(() => {
        this.setData({
          showReadingScore: true,
          readingScore: Math.floor(Math.random() * 3) + 3, // 3-5分
          canSubmit: true
        });
      }, 500);
    } else {
      // 开始录音
      this.setData({ isRecording: true });
    }
  },

  playReference: function() {
    wx.showToast({ title: '播放原声...', icon: 'none' });
  },

  // ========== 连线题 ==========
  onMatchingSelect: function(e) {
    const { id, side, value } = e.currentTarget.dataset;
    if (side === 'left') {
      this.setData({
        matchedLeft: id
      });
    } else {
      this.setData({
        selectedRight: id
      });
    }
  },

  confirmMatch: function() {
    const { matchedLeft, selectedRight, currentQ } = this.data;
    const correctPair = currentQ.correctPairs.find(p => p.left === matchedLeft);
    const isCorrect = correctPair && correctPair.right === selectedRight;

    this.setData({
      matchedPairs: [...this.data.matchedPairs, { left: matchedLeft, right: selectedRight, correct: isCorrect }],
      matchedLeft: null,
      selectedRight: null,
      canSubmit: true
    });
  },

  // ========== 提交答案 ==========
  submitAnswer: function() {
    const { currentQ, selectedAnswer, correctCount } = this.data;
    let isCorrect = false;

    switch (currentQ.type) {
      case 'choice':
        isCorrect = selectedAnswer === currentQ.correctKey;
        break;
      case 'listening':
        isCorrect = selectedAnswer === currentQ.correctId;
        break;
      case 'fill_blank':
        const answer = currentQ.blanks.map(b => b.value).join('');
        isCorrect = answer.toLowerCase() === currentQ.correctAnswer.toLowerCase();
        break;
      case 'tracing':
      case 'handwriting':
      case 'reading':
        isCorrect = true; // 这些类型先默认正确
        break;
    }

    this.setData({
      showResult: true,
      isCorrect: isCorrect,
      correctCount: isCorrect ? correctCount + 1 : correctCount,
      canSubmit: false
    });
  },

  // 显示提示
  showHint: function() {
    this.setData({
      'currentQ.isHintShown': true
    });
    wx.showToast({ title: '提示已显示', icon: 'none' });
  },

  // 下一题
  nextQuestion: function() {
    const { currentQuestion, questions } = this.data;

    if (currentQuestion < questions.length - 1) {
      const nextQ = questions[currentQuestion + 1];
      this.setData({
        currentQuestion: currentQuestion + 1,
        progress: ((currentQuestion + 2) / questions.length) * 100,
        currentQ: nextQ,
        selectedAnswer: '',
        showResult: false,
        canSubmit: false,
        isRecording: false,
        showReadingScore: false,
        matchedLeft: null,
        selectedRight: null
      });
    } else {
      // 完成测验，显示结果
      this.calculateResult();
    }
  },

  calculateResult: function() {
    const { correctCount, questions, seconds } = this.data;
    const total = questions.length;
    const score = Math.round((correctCount / total) * 100);

    // 计算等级和星星
    let grade, starCount;
    if (score >= 90) {
      grade = 'A+';
      starCount = 5;
    } else if (score >= 80) {
      grade = 'A';
      starCount = 4;
    } else if (score >= 70) {
      grade = 'B';
      starCount = 3;
    } else if (score >= 60) {
      grade = 'C';
      starCount = 2;
    } else {
      grade = 'D';
      starCount = 1;
    }

    this.setData({
      grade,
      starCount,
      showResultModal: true
    });
  },

  // 再做一遍
  retryHomework: function() {
    this.setData({
      currentQuestion: 0,
      progress: 20,
      selectedAnswer: '',
      showResult: false,
      correctCount: 0,
      showResultModal: false,
      seconds: 0,
      timeElapsed: '00:00'
    });
    this.loadQuestions();
  },

  // 完成作业
  finishHomework: function() {
    this.stopTimer();
    wx.navigateBack();
  }
});
