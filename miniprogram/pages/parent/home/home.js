// pages/parent/home/home.js
Page({
  data: {
    userInfo: {
      name: '小明妈妈',
      avatar: 'https://picsum.photos/100/100?random=20'
    },
    children: [
      {
        id: 1,
        name: '小明',
        avatar: 'https://picsum.photos/100/100?random=21',
        className: '三年级一班',
        todayStudyTime: '30分钟',
        status: 'completed',
        stats: {
          weeklyBooks: 12,
          weeklyChange: 20,
          readingCount: 45,
          readingChange: 15,
          avgScore: 88,
          scoreChange: 3
        }
      }
    ],
    selectedChildId: 1,
    settings: {
      studyReminder: true,
      weeklyReport: true,
      homeworkNotify: true
    }
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    // 模拟加载数据
    this.setData({
      currentChild: this.data.children[0]
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
    this.setData({
      'settings.studyReminder': e.detail.value
    });
    wx.showToast({
      title: e.detail.value ? '已开启' : '已关闭',
      icon: 'none'
    });
  },

  // 切换周报推送
  onWeeklyReportChange: function(e) {
    this.setData({
      'settings.weeklyReport': e.detail.value
    });
    wx.showToast({
      title: e.detail.value ? '已开启' : '已关闭',
      icon: 'none'
    });
  },

  // 切换作业通知
  onHomeworkNotifyChange: function(e) {
    this.setData({
      'settings.homeworkNotify': e.detail.value
    });
    wx.showToast({
      title: e.detail.value ? '已开启' : '已关闭',
      icon: 'none'
    });
  },

  // 刷新数据
  onRefresh: function() {
    wx.showLoading({ title: '加载中...' });
    setTimeout(() => {
      this.loadData();
      wx.hideLoading();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 点击孩子卡片
  onChildTap: function(e) {
    const childId = e.currentTarget.dataset.id;
    this.onSelectChild(e);
  }
});
