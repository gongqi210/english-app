// pages/student/profile/profile.js
const app = getApp();
const api = require('../../../utils/api.js');

Page({
  data: {
    userInfo: {},
    membershipStatus: null,
    isLoading: true
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
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

  // 加载用户信息
  loadUserInfo() {
    if (!this.checkLogin()) return;

    api.auth.getUserInfo().then(data => {
      this.setData({
        userInfo: data,
        isLoading: false
      });
    }).catch(err => {
      console.error('获取用户信息失败:', err);
      // 使用本地存储
      const localUserInfo = wx.getStorageSync('userInfo');
      if (localUserInfo) {
        this.setData({
          userInfo: localUserInfo,
          isLoading: false
        });
      } else {
        this.setData({ isLoading: false });
      }
    });

    // 获取会员状态
    api.membership.getStatus().then(data => {
      this.setData({ membershipStatus: data });
    }).catch(err => {
      console.error('获取会员状态失败:', err);
    });
  },

  // 跳转学习报告
  goToReport() {
    wx.navigateTo({
      url: '/pages/student/report/report'
    });
  },

  // 跳转会员中心
  goToMembership() {
    wx.navigateTo({
      url: '/pages/parent/membership/membership'
    });
  },

  // 切换角色
  switchRole() {
    wx.showActionSheet({
      itemList: ['学生', '家长', '老师'],
      success: (res) => {
        const roles = ['student', 'parent', 'teacher'];
        // 退出当前账号并跳转登录页选择角色
        app.logout();
        wx.redirectTo({
          url: '/pages/auth/login/login'
        });
      }
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          wx.redirectTo({
            url: '/pages/auth/login/login'
          });
        }
      }
    });
  }
});
