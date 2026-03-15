const api = require('../../../utils/api.js');

Page({
  data: {
    score: 0,
    mapScrollTop: 0,
    unlockedLevel: 1,
    currentHomework: {
      title: 'Unit 3 单词练习',
      questionCount: 5,
      duration: 15
    },
    stars: [
      { x: 5, y: 10, size: 4, delay: 0 },
      { x: 15, y: 25, size: 3, delay: 0.5 },
      { x: 25, y: 8, size: 5, delay: 1 },
      { x: 35, y: 30, size: 3, delay: 1.5 },
      { x: 45, y: 15, size: 4, delay: 0.3 },
      { x: 55, y: 5, size: 3, delay: 0.8 },
      { x: 65, y: 28, size: 5, delay: 1.2 },
      { x: 75, y: 12, size: 3, delay: 1.8 },
      { x: 85, y: 22, size: 4, delay: 0.6 },
      { x: 95, y: 8, size: 3, delay: 1.1 },
      { x: 10, y: 45, size: 4, delay: 0.4 },
      { x: 20, y: 55, size: 3, delay: 0.9 },
      { x: 30, y: 48, size: 5, delay: 1.4 },
      { x: 40, y: 58, size: 3, delay: 1.9 },
      { x: 50, y: 42, size: 4, delay: 0.2 },
      { x: 60, y: 52, size: 3, delay: 0.7 },
      { x: 70, y: 45, size: 5, delay: 1.3 },
      { x: 80, y: 55, size: 3, delay: 1.7 },
      { x: 90, y: 48, size: 4, delay: 0.1 },
      { x: 8, y: 70, size: 3, delay: 0.6 },
      { x: 18, y: 82, size: 4, delay: 1.1 },
      { x: 28, y: 75, size: 3, delay: 1.6 },
      { x: 38, y: 88, size: 5, delay: 2.1 },
      { x: 48, y: 72, size: 3, delay: 0.4 },
      { x: 58, y: 85, size: 4, delay: 0.9 },
      { x: 68, y: 78, size: 3, delay: 1.4 },
      { x: 78, y: 90, size: 5, delay: 1.9 },
      { x: 88, y: 75, size: 3, delay: 2.4 },
      { x: 12, y: 95, size: 4, delay: 0.3 },
      { x: 22, y: 88, size: 3, delay: 0.8 },
    ],
    levels: [],
    isLoading: true
  },

  onLoad: function(options) {
    const homeworkId = options.id;
    const retry = options.retry;
    // 加载作业关卡数据
    this.loadLevelData(homeworkId, retry);
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

  loadLevelData: function(id, retry) {
    if (!this.checkLogin()) return;

    // 获取用户积分
    api.stats.getUserStats().then(stats => {
      this.setData({ score: stats.points || 0 });
    }).catch(err => {
      console.error('获取用户积分失败:', err);
    });

    // 获取关卡数据
    api.challenge.getLevels(id).then(levels => {
      if (retry) {
        // 重做模式，重置进度
        levels = levels.map((level, index) => ({
          ...level,
          status: index === 0 ? 'current' : 'locked'
        }));
      }

      // 计算已解锁关卡
      const unlockedLevel = levels.filter(l => l.status !== 'locked').length;

      this.setData({
        levels,
        unlockedLevel,
        isLoading: false
      });
    }).catch(err => {
      console.error('获取关卡数据失败:', err);
      // 使用默认数据
      this.setDefaultLevels(retry);
    });
  },

  // 设置默认关卡数据
  setDefaultLevels: function(retry) {
    const defaultLevels = [
      { id: 1, name: '字母认知', icon: '🐻', x: 175, y: 100, status: 'completed' },
      { id: 2, name: '单词拼写', icon: '🦊', x: 575, y: 200, status: 'completed' },
      { id: 3, name: '听力训练', icon: '🦁', x: 175, y: 300, status: 'current' },
      { id: 4, name: '句子跟读', icon: '🐰', x: 575, y: 400, status: 'locked' },
      { id: 5, name: '综合测验', icon: '👑', x: 375, y: 500, status: 'locked' }
    ];

    let levels = defaultLevels;
    if (retry) {
      levels = defaultLevels.map((level, index) => ({
        ...level,
        status: index === 0 ? 'current' : 'locked'
      }));
    }

    this.setData({
      levels,
      unlockedLevel: retry ? 1 : 2,
      isLoading: false
    });
  },

  onBack: function() {
    wx.navigateBack();
  },

  onLevelTap: function(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;

    if (status === 'locked') {
      wx.showToast({
        title: '完成上一关解锁',
        icon: 'none'
      });
      return;
    }

    if (status === 'completed') {
      wx.showModal({
        title: '提示',
        content: '已完成此关卡，是否重新挑战？',
        success: (res) => {
          if (res.confirm) {
            this.startLevel(id);
          }
        }
      });
      return;
    }

    this.startLevel(id);
  },

  startLevel: function(levelId) {
    wx.navigateTo({
      url: `/pages/student/quiz/quiz?homeworkId=${this.options.id}&levelId=${levelId}`
    });
  },

  onStartChallenge: function() {
    // 找到当前关卡
    const currentLevel = this.data.levels.find(level => level.status === 'current');
    if (currentLevel) {
      this.startLevel(currentLevel.id);
    }
  }
});
