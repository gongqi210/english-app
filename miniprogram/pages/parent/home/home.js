// pages/parent/home/home.js
const api = require('../../../utils/api.js');

Page({
  data: {
    userInfo: {
      name: '小明妈妈',
      avatar: 'https://picsum.photos/100/100?random=20'
    },
    children: [],
    selectedChildId: null,
    currentChild: null,
    settings: {
      studyReminder: true,
      weeklyReport: true,
      homeworkNotify: true
    },
    loading: true
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    const that = this;
    that.setData({ loading: true });

    // 获取用户信息
    api.auth.getUserInfo().then(userInfo => {
      if (userInfo) {
        that.setData({ userInfo });
      }
    }).catch(err => {
      console.error('获取用户信息失败:', err);
    });

    // 获取子女列表
    api.parent.getChildren().then(children => {
      that.setData({
        children: children,
        selectedChildId: children.length > 0 ? children[0].id : null,
        currentChild: children.length > 0 ? children[0] : null,
        loading: false
      });
    }).catch(err => {
      console.error('获取子女列表失败:', err);
      that.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });

    // 获取通知设置
    api.parent.updateSettings({}).then(() => {
      // 设置默认值
    }).catch(err => {
      console.error('获取设置失败:', err);
    });
  },

  // 选择孩子
  onSelectChild: function(e) {
    const childId = e.currentTarget.dataset.id;
    const child = this.data.children.find(c => c.id === childId);
    this.setData({
      selectedChildId: childId,
      currentChild: child
    });
    wx.showToast({
      title: '已切换到 ' + child.name,
      icon: 'none'
    });
  },

  // 添加孩子
  onAddChild: function() {
    wx.showModal({
      title: '添加孩子',
      content: '请输入孩子姓名',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          // TODO: 调用API添加孩子
          const newChild = {
            id: this.data.children.length + 1,
            name: res.content,
            avatar: 'https://picsum.photos/100/100?random=' + Math.floor(Math.random() * 100),
            className: '未分配',
            todayStudyTime: '0分钟',
            status: 'pending',
            stats: {
              weeklyBooks: 0,
              weeklyChange: 0,
              readingCount: 0,
              readingChange: 0,
              avgScore: 0,
              scoreChange: 0
            }
          };
          this.setData({
            children: [...this.data.children, newChild]
          });
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看孩子作业
  onViewHomework: function() {
    wx.navigateTo({
      url: '/pages/parent/homework/homework'
    });
  },

  // 查看学习详情
  onViewDetail: function() {
    wx.navigateTo({
      url: '/pages/student/report/report'
    });
  },

  // 会员中心
  onMembership: function() {
    wx.navigateTo({
      url: '/pages/parent/membership/membership'
    });
  },

  // 切换学习提醒
  onStudyReminderChange: function(e) {
    const value = e.detail.value;
    this.setData({
      'settings.studyReminder': value
    });
    // 调用API更新设置
    api.parent.updateSettings({ studyReminder: value }).then(() => {
      wx.showToast({
        title: value ? '已开启' : '已关闭',
        icon: 'none'
      });
    }).catch(err => {
      console.error('更新设置失败:', err);
      // 回滚状态
      this.setData({
        'settings.studyReminder': !value
      });
    });
  },

  // 切换周报推送
  onWeeklyReportChange: function(e) {
    const value = e.detail.value;
    this.setData({
      'settings.weeklyReport': value
    });
    // 调用API更新设置
    api.parent.updateSettings({ weeklyReport: value }).then(() => {
      wx.showToast({
        title: value ? '已开启' : '已关闭',
        icon: 'none'
      });
    }).catch(err => {
      console.error('更新设置失败:', err);
      this.setData({
        'settings.weeklyReport': !value
      });
    });
  },

  // 切换作业通知
  onHomeworkNotifyChange: function(e) {
    const value = e.detail.value;
    this.setData({
      'settings.homeworkNotify': value
    });
    // 调用API更新设置
    api.parent.updateSettings({ homeworkNotify: value }).then(() => {
      wx.showToast({
        title: value ? '已开启' : '已关闭',
        icon: 'none'
      });
    }).catch(err => {
      console.error('更新设置失败:', err);
      this.setData({
        'settings.homeworkNotify': !value
      });
    });
  },

  // 刷新数据
  onRefresh: function() {
    wx.showLoading({ title: '加载中...' });
    this.loadData();
    wx.hideLoading();
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
    });
  },

  // 点击孩子卡片
  onChildTap: function(e) {
    const childId = e.currentTarget.dataset.id;
    this.onSelectChild(e);
  }
});
