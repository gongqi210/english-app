const api = require('../../../utils/api.js');

Page({
  data: {
    currentTab: 0,
    unreadCount: 0,
    pendingCount: 0,
    completedCount: 0,
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
    homeworkList: [],
    isLoading: true
  },

  onLoad: function(options) {
    this.loadHomeworkList();
  },

  onShow: function() {
    this.loadHomeworkList();
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

  // 加载作业列表
  loadHomeworkList: function() {
    if (!this.checkLogin()) return;

    this.setData({ isLoading: true });

    const tab = this.data.currentTab;
    const statusMap = ['all', 'pending', 'completed'];
    const status = statusMap[tab];

    api.homework.getList(status).then(list => {
      this.setData({
        homeworkList: list,
        isLoading: false
      });
      this.updateCounts(list);
    }).catch(err => {
      console.error('获取作业列表失败:', err);
      this.setData({ isLoading: false });
    });
  },

  // 更新统计数量
  updateCounts: function(list) {
    const allList = list;
    const pendingList = allList.filter(item => !item.completed);
    const completedList = allList.filter(item => item.completed);

    this.setData({
      unreadCount: pendingList.length,
      pendingCount: pendingList.length,
      completedCount: completedList.length
    });
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
    wx.switchTab({
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
