// pages/student/report/report.js
const app = getApp();

Page({
  data: {
    userInfo: {
      name: '小明',
      avatar: 'https://picsum.photos/100/100?random=1',
      level: 5,
      totalPoints: 2580,
      continuousDays: 12
    },
    weekStats: [],
    weakWords: [],
    achievements: [
      { id: 1, name: '学习达人', icon: '🏆', desc: '连续学习7天' },
      { id: 2, name: '发音标准', icon: '🎤', desc: '获得10次高分' },
      { id: 3, name: '阅读小能手', icon: '📚', desc: '阅读20本绘本' }
    ],
    radarData: {
      listening: 85,
      speaking: 72,
      reading: 88,
      writing: 65,
      vocabulary: 90
    },
    monthlyProgress: [
      { month: '1月', score: 75 },
      { month: '2月', score: 78 },
      { month: '3月', score: 85 }
    ]
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    // 模拟加载数据
    this.setData({
      weekStats: [
        { day: '周一', time: 30, score: 85 },
        { day: '周二', time: 25, score: 80 },
        { day: '周三', time: 40, score: 88 },
        { day: '周四', time: 35, score: 82 },
        { day: '周五', time: 45, score: 90 },
        { day: '周六', time: 60, score: 92 },
        { day: '周日', time: 50, score: 88 }
      ],
      weakWords: [
        { word: 'invisible', phonetic: '/ɪnˈvɪzəbl/', wrongCount: 3 },
        { word: 'essential', phonetic: '/ɪˈsenʃl/', wrongCount: 2 },
        { word: 'prince', phonetic: '/prɪns/', wrongCount: 1 },
        { word: 'universe', phonetic: '/ˈjuːnɪvɜːs/', wrongCount: 1 }
      ]
    });
  },

  // 练习单词
  practiceWord(e) {
    const word = e.currentTarget.dataset.word;
    wx.showToast({ title: `开始练习: ${word}`, icon: 'none' });
  },

  // 查看更多成就
  viewAllAchievements() {
    wx.showToast({ title: '查看全部成就', icon: 'none' });
  },

  // 分享报告
  shareReport() {
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  // 刷新数据
  onRefresh() {
    wx.showLoading({ title: '刷新中...' });
    setTimeout(() => {
      this.loadData();
      wx.hideLoading();
      wx.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/student/home/home'
    });
  }
});
