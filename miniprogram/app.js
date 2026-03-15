// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    userRole: 'student', // student, parent, teacher, principal
    // 模拟数据
    mockData: {
      books: [
        {
          id: '1',
          title: 'The Little Prince',
          subtitle: '小王子 · 英文原版',
          cover: 'https://picsum.photos/300/420?random=1',
          level: 'L3',
          ageRange: '6-8',
          rating: 4.8,
          tags: ['经典', '故事', '情感'],
          pageCount: 10,
          duration: 15,
          wordCount: 120,
          description: '这是一个关于小王子离开自己的星球，寻找真正友谊和爱情的故事...'
        },
        {
          id: '2',
          title: 'Brown Bear',
          subtitle: '棕色的熊',
          cover: 'https://picsum.photos/300/420?random=2',
          level: 'L1',
          ageRange: '3-5',
          rating: 4.9,
          tags: ['动物', '认知', '入门'],
          pageCount: 8,
          duration: 8,
          wordCount: 50,
          description: '一本可爱的动物认知绘本，帮助孩子认识各种动物和颜色...'
        },
        {
          id: '3',
          title: 'The Very Hungry Caterpillar',
          subtitle: '好饿的毛毛虫',
          cover: 'https://picsum.photos/300/420?random=3',
          level: 'L2',
          ageRange: '3-6',
          rating: 4.7,
          tags: ['故事', '动物', '数字'],
          pageCount: 12,
          duration: 10,
          wordCount: 80,
          description: '讲述一只小毛毛虫变成蝴蝶的奇妙旅程...'
        },
        {
          id: '4',
          title: 'Where the Wild Things Are',
          subtitle: '野兽国',
          cover: 'https://picsum.photos/300/420?random=4',
          level: 'L3',
          ageRange: '4-7',
          rating: 4.6,
          tags: ['冒险', '想象', '经典'],
          pageCount: 10,
          duration: 12,
          wordCount: 100,
          description: '一个小男孩的冒险故事，进入野兽国成为国王...'
        },
        {
          id: '5',
          title: 'Goodnight Moon',
          subtitle: '晚安月亮',
          cover: 'https://picsum.photos/300/420?random=5',
          level: 'L1',
          ageRange: '2-5',
          rating: 4.8,
          tags: ['睡前', '温馨', '晚安'],
          pageCount: 6,
          duration: 5,
          wordCount: 30,
          description: '一本温馨的睡前绘本，小兔子向房间里的每一样东西道晚安...'
        },
        {
          id: '6',
          title: 'Charlotte\'s Web',
          subtitle: '夏洛特的网',
          cover: 'https://picsum.photos/300/420?random=6',
          level: 'L4',
          ageRange: '8-12',
          rating: 4.9,
          tags: ['经典', '友谊', '成长'],
          pageCount: 20,
          duration: 25,
          wordCount: 200,
          description: '关于小猪威尔伯和蜘蛛夏洛特的感人故事...'
        }
      ],
      currentUser: {
        id: 'u1',
        nickname: '小明',
        avatar: 'https://picsum.photos/200/200?random=10',
        role: 'student',
        age: 7,
        totalBooks: 12,
        totalReadings: 45,
        totalTime: 360,
        streak: 5,
        points: 1250,
        level: 5,
        badges: [
          { id: 1, name: '连续学习', icon: '🔥', count: 5 },
          { id: 2, name: '读满10本', icon: '📚', count: 10 },
          { id: 3, name: '发音达人', icon: '⭐', count: 3 }
        ]
      },
      recentBooks: [
        { id: '1', progress: 80, lastPage: 8 },
        { id: '3', progress: 50, lastPage: 6 }
      ],
      weekStats: [
        { day: '周一', score: 82 },
        { day: '周二', score: 85 },
        { day: '周三', score: 78 },
        { day: '周四', score: 88 },
        { day: '周五', score: 90 },
        { day: '周六', score: 85 },
        { day: '周日', score: 88 }
      ]
    }
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = wx.getStorageSync('userInfo');
    }
  },

  login(userInfo, token) {
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
  },

  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.token = null;
    this.globalData.userInfo = null;
  },

  // 显示加载中
  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true });
  },

  // 隐藏加载
  hideLoading() {
    wx.hideLoading();
  },

  // 显示Toast
  showToast(title, icon = 'success') {
    wx.showToast({ title, icon });
  },

  // 显示模态框
  showModal(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        showCancel: false,
        success: () => resolve()
      });
    });
  }
});
