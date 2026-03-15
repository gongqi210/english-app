// pages/student/home/home.js
const app = getApp();
const api = require('../../../utils/api.js');

Page({
  data: {
    userInfo: {},
    greeting: '',
    recentBooks: [],
    recommendBooks: [],
    calendarDays: [],
    homeworkCount: 0,
    isLoading: true
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    this.setGreeting();
    // 每次显示页面时刷新数据
    this.loadUserInfo();
    this.loadHomeworkCount();
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

  // 初始化数据
  initData() {
    if (!this.checkLogin()) return;

    this.loadUserInfo();
    this.loadRecommendBooks();
    this.loadRecentBooks();
    this.loadHomeworkCount();
    this.generateCalendar();
    this.setGreeting();
  },

  // 加载用户信息
  loadUserInfo() {
    api.auth.getUserInfo().then(data => {
      this.setData({ userInfo: data });
    }).catch(err => {
      console.error('获取用户信息失败:', err);
      // 使用本地存储的用户信息
      const localUserInfo = wx.getStorageSync('userInfo');
      if (localUserInfo) {
        this.setData({ userInfo: localUserInfo });
      }
    });
  },

  // 加载推荐书籍
  loadRecommendBooks() {
    api.book.getRecommend().then(books => {
      const recommendBooks = books.map(book => ({
        ...book,
        levelIndex: parseInt(book.level.replace('L', ''))
      }));
      this.setData({ recommendBooks, isLoading: false });
    }).catch(err => {
      console.error('获取推荐书籍失败:', err);
      this.setData({ isLoading: false });
    });
  },

  // 加载最近学习
  loadRecentBooks() {
    api.book.getRecent().then(recentBooks => {
      const books = app.globalData.mockData.books;
      const recentWithDetails = recentBooks.map(item => {
        const book = books.find(b => b.id === item.id);
        return {
          ...item,
          title: book ? book.title : '',
          cover: book ? book.cover : ''
        };
      });
      this.setData({ recentBooks: recentWithDetails });
    }).catch(err => {
      console.error('获取最近学习失败:', err);
    });
  },

  // 加载作业数量
  loadHomeworkCount() {
    api.homework.getList('pending').then(list => {
      const pendingList = list.filter(item => !item.completed);
      this.setData({ homeworkCount: pendingList.length });
    }).catch(err => {
      console.error('获取作业数量失败:', err);
    });
  },

  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 6) {
      greeting = '夜深了';
    } else if (hour < 9) {
      greeting = '早上好';
    } else if (hour < 12) {
      greeting = '上午好';
    } else if (hour < 14) {
      greeting = '中午好';
    } else if (hour < 18) {
      greeting = '下午好';
    } else if (hour < 22) {
      greeting = '晚上好';
    } else {
      greeting = '夜深了';
    }

    this.setData({ greeting });
  },

  generateCalendar() {
    const days = [];
    const today = new Date().getDate();

    for (let i = 1; i <= 31; i++) {
      let status = 'future';
      if (i < today) {
        status = i % 3 === 0 ? 'checked' : '';
      } else if (i === today) {
        status = 'today';
      }

      days.push({
        day: i,
        status: status
      });
    }

    this.setData({ calendarDays: days });
  },

  // 获取书籍封面
  getBookCover(id) {
    const book = app.globalData.mockData.books.find(b => b.id === id);
    return book ? book.cover : '';
  },

  // 获取书籍标题
  getBookTitle(id) {
    const book = app.globalData.mockData.books.find(b => b.id === id);
    return book ? book.title : '';
  },

  // 继续学习
  continueLearning() {
    const recentBooks = this.data.recentBooks;
    if (recentBooks.length > 0) {
      this.goToBook({ currentTarget: { dataset: { id: recentBooks[0].id } } });
    } else {
      this.goToDiscover();
    }
  },

  // 跳转绘本详情
  goToBookDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/student/book-detail/book-detail?id=${id}`
    });
  },

  // 跳转绘本
  goToBook(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/student/book-detail/book-detail?id=${id}`
    });
  },

  // 跳转发现页
  goToDiscover() {
    wx.switchTab({
      url: '/pages/student/discover/discover'
    });
  },

  // 跳转个人中心
  goToProfile() {
    wx.switchTab({
      url: '/pages/student/profile/profile'
    });
  },

  // 跳转AI对话
  goToAIChat() {
    wx.navigateTo({
      url: '/pages/student/ai-chat/ai-chat'
    });
  },

  // 跳转作业中心
  goToHomework() {
    wx.navigateTo({
      url: '/pages/student/homework/homework'
    });
  }
});
