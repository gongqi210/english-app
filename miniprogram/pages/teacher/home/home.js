// pages/teacher/home/home.js
Page({
  data: {
    userInfo: {
      name: '李老师',
      role: '英语老师',
      avatar: 'https://picsum.photos/100/100?random=30'
    },
    stats: {
      classCount: 3,
      studentCount: 45,
      bookCount: 28,
      todayHomework: 5,
      pendingReview: 3
    },
    todayTasks: [
      { id: 1, title: 'Unit 4 单词练习', type: 'homework', status: 'pending', deadline: '今天 18:00' },
      { id: 2, title: '审核学生绘本', type: 'review', status: 'pending', count: 3 },
      { id: 3, title: '上传新绘本', type: 'upload', status: 'pending' }
    ],
    recentHomework: [
      { id: 1, title: 'Unit 3 单词练习', className: '三年级一班', submitRate: 85, avgScore: 88 },
      { id: 2, title: 'Unit 2 句子跟读', className: '三年级二班', submitRate: 100, avgScore: 92 }
    ]
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    // 模拟加载数据
    this.setData({
      currentTime: this.getCurrentTime()
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
      url: '/pages/teacher/homework-manage/homework-manage'
    });
  },

  // 刷新数据
  onRefresh: function() {
    wx.showLoading({ title: '刷新中...' });
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
