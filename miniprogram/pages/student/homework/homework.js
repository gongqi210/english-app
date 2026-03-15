Page({
  data: {
    currentTab: 0,
    unreadCount: 3,
    pendingCount: 3,
    completedCount: 5,
    stars: [
      { x: 10, y: 20, delay: 0 },
      { x: 30, y: 10, delay: 0.3 },
      { x: 50, y: 25, delay: 0.6 },
      { x: 70, y: 15, delay: 0.9 },
      { x: 90, y: 30, delay: 1.2 },
      { x: 20, y: 40, delay: 0.2 },
      { x: 40, y: 35, delay: 0.5 },
      { x: 60, y: 45, delay: 0.8 },
      { x: 80, y: 38, delay: 1.1 },
    ],
    homeworkList: [
      {
        id: 1,
        title: 'Unit 3 单词练习',
        deadline: '今天 18:00',
        questionCount: 5,
        duration: 15,
        progress: 40,
        completed: false,
        score: 0,
        timeSpent: ''
      },
      {
        id: 2,
        title: 'Unit 2 句子跟读',
        deadline: '今天 18:00',
        questionCount: 3,
        duration: 10,
        progress: 100,
        completed: true,
        score: 95,
        timeSpent: '8分32秒'
      },
      {
        id: 3,
        title: 'Unit 1 字母认知',
        deadline: '昨天',
        questionCount: 4,
        duration: 8,
        progress: 100,
        completed: true,
        score: 88,
        timeSpent: '6分15秒'
      }
    ]
  },

  onLoad: function(options) {
    this.loadHomeworkList();
  },

  onShow: function() {
    this.loadHomeworkList();
  },

  loadHomeworkList: function() {
    // 模拟加载作业列表
    const tab = this.data.currentTab;
    // 这里应该是API调用
  },

  onTabChange: function(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    this.setData({ currentTab: tab });
    this.loadHomeworkList();
  },

  onNotificationTap: function() {
    wx.showToast({
      title: '通知中心',
      icon: 'none'
    });
  },

  onProfileTap: function() {
    wx.navigateTo({
      url: '/pages/student/profile/profile'
    });
  },

  onHomeworkTap: function(e) {
    const id = e.currentTarget.dataset.id;
    // 查看作业详情
  },

  onStartHomework: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/student/challenge/challenge?id=${id}`
    });
  },

  onRetry: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/student/challenge/challenge?id=${id}&retry=1`
    });
  },

  onViewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/student/report/report?id=${id}`
    });
  }
});
