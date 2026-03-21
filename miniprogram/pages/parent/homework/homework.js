// pages/parent/homework/homework.js
const api = require('../../../utils/api.js');

Page({
  data: {
    currentChild: {
      id: 1,
      name: '小明',
      avatar: 'https://picsum.photos/100/100?random=21',
      className: '三年级一班'
    },
    todayHomework: null,
    completedHomework: [],
    weeklyStats: {
      total: 0,
      completed: 0,
      avgScore: 0,
      totalTime: 0
    },
    trendData: [],
    showAllHomework: false,
    loading: true
  },

  onLoad: function(options) {
    // 如果传递了childId，使用传递的childId
    if (options.childId) {
      this.setData({
        'currentChild.id': parseInt(options.childId)
      });
    }
    this.loadData();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadData();
  },

  loadData: function() {
    const that = this;
    const childId = this.data.currentChild.id;

    that.setData({ loading: true });

    // 获取孩子作业列表
    api.parent.getChildHomework(childId).then(data => {
      that.setData({
        todayHomework: data.todayHomework,
        completedHomework: data.completedHomework || [],
        weeklyStats: data.weeklyStats || {
          total: 0,
          completed: 0,
          avgScore: 0,
          totalTime: 0
        },
        trendData: data.trendData || [],
        loading: false
      });
    }).catch(err => {
      console.error('获取作业列表失败:', err);
      that.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });
  },

  // 提醒孩子做作业
  onRemind: function() {
    const childId = this.data.currentChild.id;
    const homeworkId = this.data.todayHomework ? this.data.todayHomework.id : null;

    if (!homeworkId) {
      wx.showToast({
        title: '暂无作业',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '提醒孩子',
      content: '确定要提醒孩子做作业吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '发送中...' });
          api.parent.remindHomework(childId, homeworkId).then(() => {
            wx.hideLoading();
            wx.showToast({
              title: '已发送提醒',
              icon: 'success'
            });
          }).catch(err => {
            wx.hideLoading();
            console.error('发送提醒失败:', err);
            wx.showToast({
              title: '发送失败',
              icon: 'none'
            });
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
  },

  onBack: function() {
    wx.navigateBack({ delta: 1 });
  }
});
