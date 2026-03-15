// pages/teacher/home/home.js
const api = require('../../../utils/api');

Page({
  data: {
    userInfo: {
      name: '李老师',
      role: '英语老师',
      avatar: 'https://picsum.photos/100/100?random=30'
    },
    stats: {
      classCount: 0,
      studentCount: 0,
      bookCount: 0,
      todayHomework: 0,
      pendingReview: 0
    },
    todayTasks: [],
    recentHomework: [],
    loading: true
  },

  onLoad: function() {
    this.loadData();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadData();
  },

  loadData: function() {
    const that = this;
    that.setData({ loading: true });

    // 调用工作台API
    api.teacher.getDashboard()
      .then(data => {
        that.setData({
          stats: data.stats || {},
          todayTasks: data.todayTasks || [],
          recentHomework: data.recentHomework || [],
          loading: false,
          currentTime: that.getCurrentTime()
        });
      })
      .catch(err => {
        console.error('获取工作台数据失败:', err);
        that.setData({ loading: false });
        wx.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        });
      });
  },

  getCurrentTime: function() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  // 跳转到题库管理
  onQuestionBank: function() {
    wx.navigateTo({
      url: '/pages/teacher/question-bank/question-bank'
    });
  },

  // 跳转到作业创建
  onHomeworkCreate: function() {
    wx.navigateTo({
      url: '/pages/teacher/homework-create/homework-create'
    });
  },

  // 跳转到作业管理
  onHomeworkManage: function() {
    wx.navigateTo({
      url: '/pages/teacher/homework-manage/homework-manage'
    });
  },

  // 跳转到绘本上传（发现页面）
  onBookUpload: function() {
    wx.switchTab({
      url: '/pages/student/discover/discover'
    });
  },

  // 跳转到班级管理
  onClassManage: function() {
    wx.showToast({
      title: '班级管理功能开发中',
      icon: 'none'
    });
  },

  // 跳转到班级数据
  onClassData: function() {
    wx.showToast({
      title: '班级数据功能开发中',
      icon: 'none'
    });
  },

  // 内容审核
  onContentReview: function() {
    wx.showToast({
      title: '审核功能开发中',
      icon: 'none'
    });
  },

  // 查看作业详情
  onHomeworkDetail: function(e) {
    const homeworkId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/teacher/homework-manage/homework-manage?id=' + homeworkId
    });
  },

  // 刷新数据
  onRefresh: function() {
    wx.showLoading({ title: '刷新中...' });
    this.loadData();
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 快捷操作 - 创建作业
  onQuickCreateHomework: function() {
    this.onHomeworkCreate();
  },

  // 快捷操作 - 审核内容
  onQuickReview: function() {
    this.onContentReview();
  }
});
