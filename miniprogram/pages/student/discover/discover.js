// pages/student/discover/discover.js
const app = getApp();

Page({
  data: {
    books: [],
    filteredBooks: [],
    searchKeyword: '',
    currentCategory: 'all',
    currentSort: 'popular',
    currentLevel: '',
    currentLevelText: '全部级别',
    selectedLevel: '',
    selectedAge: '',
    showFilterModal: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadBooks();
  },

  loadBooks() {
    const books = app.globalData.mockData.books.map(book => ({
      ...book,
      levelIndex: parseInt(book.level.replace('L', ''))
    }));

    this.setData({
      books,
      filteredBooks: books
    });
  },

  // 搜索
  handleSearch(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    this.filterBooks();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchKeyword: '' });
    this.filterBooks();
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    this.filterBooks();
  },

  // 选择排序
  selectSort(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({ currentSort: sort });
    this.filterBooks();
  },

  // 显示筛选
  showFilter() {
    this.setData({ showFilterModal: true });
  },

  // 隐藏筛选
  hideFilter() {
    this.setData({ showFilterModal: false });
  },

  // 选择难度级别
  selectLevel(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({ selectedLevel: level });
  },

  // 选择年龄
  selectAge(e) {
    const age = e.currentTarget.dataset.age;
    this.setData({ selectedAge: age });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      selectedLevel: '',
      selectedAge: ''
    });
  },

  // 确认筛选
  confirmFilter() {
    const { selectedLevel, selectedAge } = this.setData;

    let levelText = '全部级别';
    if (selectedLevel) {
      const levelMap = { '1': 'L1 入门', '2': 'L2 基础', '3': 'L3 进阶', '4': 'L4 高级' };
      levelText = levelMap[selectedLevel];
    }

    this.setData({
      currentLevel: this.data.selectedLevel,
      currentLevelText: levelText,
      showFilterModal: false
    });

    this.filterBooks();
  },

  // 显示难度筛选
  showLevelFilter() {
    this.showFilter();
  },

  // 筛选书籍
  filterBooks() {
    let books = [...this.data.books];
    const { searchKeyword, currentCategory, currentSort, currentLevel, selectedAge } = this.data;

    // 搜索过滤
    if (searchKeyword) {
      books = books.filter(book =>
        book.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        book.subtitle.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 分类过滤
    if (currentCategory !== 'all') {
      const categoryMap = {
        'story': ['故事', '经典'],
        'animal': ['动物'],
        'nature': ['自然'],
        'knowledge': ['知识', '认知'],
        'emotion': ['情感']
      };
      const categoryTags = categoryMap[currentCategory];
      books = books.filter(book =>
        book.tags.some(tag => categoryTags.includes(tag))
      );
    }

    // 难度过滤
    if (currentLevel) {
      books = books.filter(book => book.levelIndex === parseInt(currentLevel));
    }

    // 年龄过滤
    if (selectedAge) {
      books = books.filter(book => book.ageRange === selectedAge);
    }

    // 排序
    if (currentSort === 'rating') {
      books.sort((a, b) => b.rating - a.rating);
    } else if (currentSort === 'new') {
      books.sort((a, b) => b.id - a.id);
    }
    // popular 使用默认顺序

    this.setData({ filteredBooks: books, page: 1, hasMore: true });
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore) return;

    wx.showToast({
      title: '没有更多了',
      icon: 'none'
    });
  },

  // 跳转绘本详情
  goToBookDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/student/book-detail/book-detail?id=${id}`
    });
  }
});
