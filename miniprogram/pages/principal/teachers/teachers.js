// pages/principal/teachers/teachers.js
const api = require('../../../utils/api.js');

Page({
  data: {
    totalCount: 0,
    activeCount: 0,
    classCount: 0,
    teachers: [],
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
    this.setData({ loading: true });

    // 并行加载教师列表和统计数据
    Promise.all([
      api.principal.getTeachers(),
      api.principal.getTeacherStats()
    ]).then(([teachers, stats]) => {
      this.setData({
        teachers: teachers || [],
        totalCount: stats?.totalCount || 0,
        activeCount: stats?.activeCount || 0,
        classCount: stats?.classCount || 0,
        loading: false
      });
    }).catch((err) => {
      console.error('加载教师数据失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    });
  },

  onMessage: function(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '发送消息',
      icon: 'none'
    });
    // TODO: 实现发送消息功能
    // wx.navigateTo({
    //   url: `/pages/common/chat/chat?teacherId=${teacherId}`
    // });
  },

  onEdit: function(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '编辑老师',
      icon: 'none'
    });
    // TODO: 实现编辑老师功能
    // wx.navigateTo({
    //   url: `/pages/principal/teacher-edit/teacher-edit?id=${teacherId}`
    // });
  },

  onAddTeacher: function() {
    wx.showToast({
      title: '添加老师',
      icon: 'none'
    });
    // TODO: 实现添加老师功能
    // wx.navigateTo({
    //   url: '/pages/principal/teacher-add/teacher-add'
    // });
  },

  // 删除教师
  onDeleteTeacher: function(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该教师吗？',
      success: (res) => {
        if (res.confirm) {
          api.principal.deleteTeacher(teacherId).then(() => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.loadData();
          }).catch((err) => {
            console.error('删除教师失败:', err);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
