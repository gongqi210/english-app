Page({
  data: {
    title: '',
    selectedClass: '',
    deadline: '',
    classes: ['三年级一班', '三年级二班', '四年级一班', '四年级二班'],
    selectedQuestions: [
      { id: 1, typeName: '选择题', content: 'What color is the apple?' },
      { id: 2, typeName: '听力题', content: 'Listen and choose the correct picture' },
      { id: 3, typeName: '填空题', content: 'Complete the word: A___le' }
    ],
    showExplanation: true,
    showRanking: true,
    allowRetry: false
  },

  onTitleInput: function(e) {
    this.setData({ title: e.detail.value });
  },

  onClassChange: function(e) {
    const index = e.detail.value;
    this.setData({
      selectedClass: this.data.classes[index]
    });
  },

  onDateChange: function(e) {
    this.setData({ deadline: e.detail.value });
  },

  onAddQuestions: function() {
    wx.showToast({
      title: '从题库选择题目',
      icon: 'none'
    });
  },

  onRemoveQuestion: function(e) {
    const index = e.currentTarget.dataset.index;
    const questions = [...this.data.selectedQuestions];
    questions.splice(index, 1);
    this.setData({ selectedQuestions: questions });
  },

  onExplanationChange: function(e) {
    this.setData({ showExplanation: e.detail.value });
  },

  onRankingChange: function(e) {
    this.setData({ showRanking: e.detail.value });
  },

  onRetryChange: function(e) {
    this.setData({ allowRetry: e.detail.value });
  },

  onSaveDraft: function() {
    wx.showToast({
      title: '已保存草稿',
      icon: 'success'
    });
  },

  onPublish: function() {
    wx.showModal({
      title: '确认发布',
      content: '确定要发布这份作业吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '发布成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  }
});
