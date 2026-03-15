// pages/student/book-detail/book-detail.js
const app = getApp();

Page({
  data: {
    book: {},
    isExpanded: false,
    ratingData: [
      { star: 5, percent: 80 },
      { star: 4, percent: 15 },
      { star: 3, percent: 3 },
      { star: 2, percent: 1 },
      { star: 1, percent: 1 }
    ]
  },

  onLoad(options) {
    const id = options.id;
    this.loadBookDetail(id);
  },

  loadBookDetail(id) {
    const books = app.globalData.mockData.books;
    const book = books.find(b => b.id === id);

    if (book) {
      this.setData({
        book: {
          ...book,
          levelIndex: parseInt(book.level.replace('L', ''))
        }
      });
    }
  },

  // 展开/收起简介
  toggleExpand() {
    this.setData({
      isExpanded: !this.data.isExpanded
    });
  },

  // 开始学习
  startReading() {
    const { book } = this.data;
    wx.navigateTo({
      url: `/pages/student/book-read/book-read?id=${book.id}&page=1`
    });
  }
});
