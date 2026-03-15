Page({
  data: {
    currentFilter: 'all',
    searchKeyword: '',
    questions: [
      {
        id: 1,
        type: 'choice',
        typeName: '选择题',
        content: 'What color is the apple?',
        options: [
          { key: 'A', value: 'Red' },
          { key: 'B', value: 'Blue' },
          { key: 'C', value: 'Yellow' },
          { key: 'D', value: 'Green' }
        ],
        correctKey: 'A',
        difficulty: 2,
        knowledgePoint: '颜色',
        usageCount: 25
      },
      {
        id: 2,
        type: 'fill_blank',
        typeName: '填空题',
        content: 'Apple 的中文意思是：___',
        difficulty: 1,
        knowledgePoint: '词汇',
        usageCount: 18
      },
      {
        id: 3,
        type: 'listening',
        typeName: '听力题',
        content: 'Listen and choose: What do you hear?',
        difficulty: 2,
        knowledgePoint: '听力理解',
        usageCount: 12
      },
      {
        id: 4,
        type: 'tracing',
        typeName: '书写题',
        content: '请描写字母 Aa',
        difficulty: 1,
        knowledgePoint: '字母',
        usageCount: 30
      }
    ]
  },

  onLoad: function() {
    this.loadQuestions();
  },

  loadQuestions: function() {
    // 模拟API加载
  },

  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onFilterChange: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter
    });
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
    wx.showToast({
      title: '复制题目',
      icon: 'success'
    });
  },

  onDelete: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道题目吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已删除',
            icon: 'success'
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
