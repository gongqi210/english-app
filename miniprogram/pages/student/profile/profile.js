// pages/student/profile/profile.js
const app = getApp();

Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.mockData.currentUser
    });
  },

  // 跳转学习报告
  goToReport() {
    wx.navigateTo({
      url: '/pages/student/report/report'
    });
  },

  // 切换角色
  switchRole() {
    wx.showActionSheet({
      itemList: ['学生', '家长', '老师'],
      success: (res) => {
        const roles = ['student', 'parent', 'teacher'];
        wx.showToast({
          title: '切换成功',
          icon: 'success'
        });
      }
    });
  }
});
