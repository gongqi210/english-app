// pages/student/home/home.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    greeting: '',
    recentBooks: [],
    recommendBooks: [],
    calendarDays: [],
    homeworkCount: 2  // 待完成作业数量
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    this.setGreeting();
  },

  initData() {
    const userInfo = app.globalData.mockData.currentUser;
    const books = app.globalData.mockData.books;
    const recentBooks = app.globalData.mockData.recentBooks;

    // 模拟最近学习的书籍详情
    const recentWithDetails = recentBooks.map(item => {
      const book = books.find(b => b.id === item.id);
      return {
        ...item,
        title: book ? book.title : '',
        cover: book ? book.cover : ''
      };
    });

    // 推荐书籍
    const recommendBooks = books.slice(0, 4).map(book => ({
      ...book,
      levelIndex: parseInt(book.level.replace('L', ''))
    }));

    // 生成日历数据
    const calendarDays = this.generateCalendar();

    this.setData({
      userInfo,
      recentBooks: recentWithDetails,
      recommendBooks,
      calendarDays
    });

    this.setGreeting();
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
    const today = 15; // 假设今天是15号

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

    return days;
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
      this.goToBook(e, recentBooks[0].id);
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
