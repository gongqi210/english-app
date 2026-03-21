// pages/teacher/homework-create/homework-create.js
const api = require('../../../utils/api');

Page({
  data: {
    title: '',
    selectedClassId: '',
    selectedClassName: '',
    deadline: '',
    classes: [],
    selectedQuestions: [
      { id: 1, typeName: '选择题', content: 'What color is the apple?' },
      { id: 2, typeName: '听力题', content: 'Listen and choose the correct picture' },
      { id: 3, typeName: '填空题', content: 'Complete the word: A___le' }
    ],
    showExplanation: true,
    showRanking: true,
    allowRetry: false,
    loading: false
  },

  onLoad: function() {
    this.loadClasses();
    this.setStatusBarHeight();
  },

  setStatusBarHeight: function() {
    const app = getApp();
    this.setData({
      statusBarHeight: app.globalData.systemInfo ? app.globalData.systemInfo.statusBarHeight : 20
    });
  },

  loadClasses: function() {
    const that = this;

    api.teacher.getClasses()
      .then(data => {
        const classes = data || [];
        that.setData({
          classes: classes
        });
      })
      .catch(err => {
        console.error('获取班级列表失败:', err);
        wx.showToast({
          title: err.message || '加载班级失败',
          icon: 'none'
        });
      });
  },

  onTitleInput: function(e) {
    this.setData({ title: e.detail.value });
  },

  onClassChange: function(e) {
    const index = e.detail.value;
    const classes = this.data.classes;
    if (classes[index]) {
      this.setData({
        selectedClassId: classes[index].id,
        selectedClassName: classes[index].name
      });
    }
  },

  onDateChange: function(e) {
    this.setData({ deadline: e.detail.value });
  },

  onAddQuestions: function() {
    wx.navigateTo({
      url: '/pages/teacher/question-bank/question-bank?mode=select'
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

  validateForm: function() {
    if (!this.data.title) {
      wx.showToast({
        title: '请输入作业标题',
        icon: 'none'
      });
      return false;
    }
    if (!this.data.selectedClassId) {
      wx.showToast({
        title: '请选择班级',
        icon: 'none'
      });
      return false;
    }
    if (!this.data.deadline) {
      wx.showToast({
        title: '请选择截止时间',
        icon: 'none'
      });
      return false;
    }
    if (this.data.selectedQuestions.length === 0) {
      wx.showToast({
        title: '请添加题目',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  onSaveDraft: function() {
    const that = this;

    if (!this.data.title) {
      wx.showToast({
        title: '请输入作业标题',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    const draftData = {
      title: this.data.title,
      classId: this.data.selectedClassId,
      deadline: this.data.deadline,
      questionIds: this.data.selectedQuestions.map(q => q.id),
      showExplanation: this.data.showExplanation,
      showRanking: this.data.showRanking,
      allowRetry: this.data.allowRetry
    };

    api.teacher.saveHomeworkDraft(draftData)
      .then(() => {
        that.setData({ loading: false });
        wx.showToast({
          title: '已保存草稿',
          icon: 'success'
        });
      })
      .catch(err => {
        that.setData({ loading: false });
        wx.showToast({
          title: err.message || '保存失败',
          icon: 'none'
        });
      });
  },

  onPublish: function() {
    const that = this;

    if (!this.validateForm()) {
      return;
    }

    wx.showModal({
      title: '确认发布',
      content: '确定要发布这份作业吗？',
      success: (res) => {
        if (res.confirm) {
          that.setData({ loading: true });

          const homeworkData = {
            title: that.data.title,
            classId: that.data.selectedClassId,
            deadline: that.data.deadline,
            questionIds: that.data.selectedQuestions.map(q => q.id),
            showExplanation: that.data.showExplanation,
            showRanking: that.data.showRanking,
            allowRetry: that.data.allowRetry
          };

          api.teacher.createHomework(homeworkData)
            .then(() => {
              that.setData({ loading: false });
              wx.showToast({
                title: '发布成功',
                icon: 'success'
              });
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            })
            .catch(err => {
              that.setData({ loading: false });
              wx.showToast({
                title: err.message || '发布失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  onBack: function() {
    wx.navigateBack({ delta: 1 });
  }
});
