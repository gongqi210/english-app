// pages/parent/homework/homework.js
Page({
  data: {
    currentChild: {
      id: 1,
      name: '小明',
      avatar: 'https://picsum.photos/100/100?random=21',
      className: '三年级一班'
    },
    todayHomework: {
      id: 1,
      title: 'Unit 3 单词练习',
      deadline: '今天 18:00',
      questionCount: 10,
      duration: 15
    },
    completedHomework: [
      { id: 1, title: 'Unit 2 句子跟读', score: 95, stars: 5, date: '3月14日', timeSpent: '8分钟' },
      { id: 2, title: 'Unit 1 字母认知', score: 88, stars: 4, date: '3月13日', timeSpent: '12分钟' },
      { id: 3, title: 'Unit 0 入门测试', score: 92, stars: 5, date: '3月12日', timeSpent: '10分钟' }
    ],
    weeklyStats: {
      total: 8,
      completed: 6,
      avgScore: 88,
      totalTime: 120
    },
    trendData: [
      { day: '周一', score: 85 },
      { day: '周二', score: 80 },
      { day: '周三', score: 90 },
      { day: '周四', score: 88 },
      { day: '周五', score: 92 },
      { day: '周六', score: 95 },
      { day: '周日', score: 88 }
    ],
    showAllHomework: false
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    // 模拟加载数据
  },

  // 提醒孩子做作业
  onRemind: function() {
    wx.showModal({
      title: '提醒孩子',
      content: '确定要提醒孩子做作业吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已发送提醒',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看作业详情
  onViewDetail: function(e) {
    const homeworkId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '作业详情',
      content: '查看作业详情功能开发中...',
      showCancel: false
    });
  },

  // 重新完成
  onRetry: function(e) {
    wx.showToast({
      title: '跳转到作业',
      icon: 'none'
    });
  },

  // 查看更多历史作业
  onShowAllHomework: function() {
    this.setData({
      showAllHomework: true
    });
  },

  // 隐藏历史作业
  onHideAllHomework: function() {
    this.setData({
      showAllHomework: false
    });
  },

  // 查看学习报告
  onViewReport: function() {
    wx.navigateTo({
      url: '/pages/student/report/report'
    });
  },

  // 联系老师
  onContactTeacher: function() {
    wx.showModal({
      title: '联系老师',
      content: '确定要联系班主任吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '正在连接...',
            icon: 'none'
          });
        }
      }
    });
  }
});
