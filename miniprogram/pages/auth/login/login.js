// pages/auth/login/login.js
const app = getApp();
const api = require('../../../utils/api.js');

Page({
  data: {
    phone: '',
    password: '',
    currentRole: 'student',
    isLoading: false
  },

  onLoad() {
    // 检查是否已登录
    if (app.globalData.token) {
      this.redirectToHome();
    }
  },

  // 手机号输入
  handlePhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  // 密码输入
  handlePasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  // 切换角色
  switchRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ currentRole: role });
  },

  // 微信登录
  handleWechatLogin() {
    wx.showLoading({ title: '登录中...' });

    // 获取微信登录code
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用微信登录API
          api.auth.wechatLogin(res.code).then(data => {
            app.login(data.user, data.token);
            wx.hideLoading();
            this.redirectToHome();
          }).catch(err => {
            console.error('微信登录失败:', err);
            wx.hideLoading();
            // 使用mock数据作为后备
            this.mockLogin();
          });
        } else {
          wx.hideLoading();
          this.mockLogin();
        }
      },
      fail: () => {
        wx.hideLoading();
        this.mockLogin();
      }
    });
  },

  // 账号密码登录
  handlePasswordLogin() {
    const { phone, password, currentRole } = this.data;

    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    this.setData({ isLoading: true });
    wx.showLoading({ title: '登录中...' });

    // 调用登录API
    api.auth.login(phone, password, currentRole).then(data => {
      app.login(data.user, data.token);
      wx.hideLoading();
      this.setData({ isLoading: false });
      this.redirectToHome();
    }).catch(err => {
      console.error('登录失败:', err);
      wx.hideLoading();
      this.setData({ isLoading: false });
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none'
      });
    });
  },

  // Mock登录（开发阶段使用）
  mockLogin() {
    const { currentRole } = this.data;
    const mockUser = {
      ...app.globalData.mockData.currentUser,
      role: currentRole
    };
    const token = 'mock_token_' + Date.now();

    app.login(mockUser, token);
    this.redirectToHome();
  },

  // 跳转到首页
  redirectToHome() {
    const { currentRole } = this.data;
    let url = '/pages/student/home/home';

    if (currentRole === 'parent') {
      url = '/pages/parent/home/home';
    } else if (currentRole === 'teacher') {
      url = '/pages/teacher/home/home';
    } else if (currentRole === 'principal') {
      url = '/pages/principal/home/home';
    }

    // 学生端使用 switchTab，其他角色使用 navigateTo
    if (currentRole === 'student') {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({ url });
    }
  }
});
