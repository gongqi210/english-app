// pages/auth/login/login.js
const app = getApp();

Page({
  data: {
    phone: '',
    password: '',
    currentRole: 'student'
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

    // 模拟微信登录
    setTimeout(() => {
      const mockUser = app.globalData.mockData.currentUser;
      const token = 'mock_token_' + Date.now();

      app.login(mockUser, token);
      wx.hideLoading();
      this.redirectToHome();
    }, 1000);
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

    wx.showLoading({ title: '登录中...' });

    // 模拟登录
    setTimeout(() => {
      const mockUser = {
        ...app.globalData.mockData.currentUser,
        role: currentRole
      };
      const token = 'mock_token_' + Date.now();

      app.login(mockUser, token);
      wx.hideLoading();
      this.redirectToHome();
    }, 1000);
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
