// pages/teacher/question-bank/question-bank.js
const api = require('../../../utils/api');

Page({
  data: {
    currentFilter: 'all',
    searchKeyword: '',
    questions: [],
    loading: true,
    // 筛选选项
    filterOptions: [
      { key: 'all', name: '全部' },
      { key: 'choice', name: '选择题' },
      { key: 'fill_blank', name: '填空题' },
      { key: 'listening', name: '听力题' },
      { key: 'tracing', name: '书写题' }
    ]
  },

  onLoad: function() {
    this.loadQuestions();
  },

  onShow: function() {
    // 每次显示时刷新数据
    this.loadQuestions();
  },

  loadQuestions: function() {
    const that = this;
    that.setData({ loading: true });

    const params = {};
    if (this.data.currentFilter !== 'all') {
      params.type = this.data.currentFilter;
    }
    if (this.data.searchKeyword) {
      params.keyword = this.data.searchKeyword;
    }

    api.teacher.getQuestions(params)
      .then(data => {
        that.setData({
          questions: data || [],
          loading: false
        });
      })
      .catch(err => {
        console.error('获取题目列表失败:', err);
        that.setData({ loading: false });
        wx.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        });
      });
  },

  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch: function() {
    this.loadQuestions();
  },

  onFilterChange: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter
    });
    this.loadQuestions();
  },

  onCreateQuestion: function() {
    wx.showToast({
      title: '创建题目',
      icon: 'none'
    });
  },

  onEdit: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '编辑题目 ' + id,
      icon: 'none'
    });
  },

  onCopy: function(e) {
    const id = e.currentTarget.dataset.id;
    const that = this;

    wx.showLoading({ title: '复制中...' });

    api.teacher.copyQuestion(id)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
        that.loadQuestions();
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: err.message || '复制失败',
          icon: 'none'
        });
      });
  },

  onDelete: function(e) {
    const id = e.currentTarget.dataset.id;
    const that = this;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道题目吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });

          api.teacher.deleteQuestion(id)
            .then(() => {
              wx.hideLoading();
              wx.showToast({
                title: '已删除',
                icon: 'success'
              });
              that.loadQuestions();
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: err.message || '删除失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  onImportImage: function() {
    wx.showToast({
      title: 'OCR拍照导入',
      icon: 'none'
    });
  },

  onImportPDF: function() {
    wx.showToast({
      title: 'PDF导入',
      icon: 'none'
    });
  },

  onImportExcel: function() {
    wx.showToast({
      title: '批量导入',
      icon: 'none'
    });
  },

  onImportAI: function() {
    wx.showToast({
      title: 'AI智能导入',
      icon: 'none'
    });
  }
});
