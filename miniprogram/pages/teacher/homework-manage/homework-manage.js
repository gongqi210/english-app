// pages/teacher/homework-manage/homework-manage.js
const api = require('../../../utils/api');

Page({
  data: {
    status: 'all',
    currentTime: '',
    stats: {
      assigned: 0,
      submitRate: 0,
      completeRate: 0,
      avgScore: 0
    },
    homeworkList: [],
    loading: true,

    // 反馈功能
    showFeedbackModal: false,
    showPreviewModal: false,
    selectedHomeworkId: null,
    selectedStudent: null,
    studentList: [],
    aiFeedback: '',
    teacherFeedback: '',
    sendToParent: true,
    sendToStudent: false,
    feedbackLoading: false
  },

  onLoad: function(options) {
    this.setCurrentTime();
    this.loadData();

    // 如果有传入作业ID，自动打开反馈
    if (options.id) {
      this.setData({ selectedHomeworkId: options.id });
    }
  },

  onShow: function() {
    // 每次显示时刷新数据
    this.loadData();
  },

  setCurrentTime: function() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      currentTime: `${hours}:${minutes}`
    });
  },

  loadData: function() {
    const that = this;
    that.setData({ loading: true });

    const params = {};
    if (this.data.status !== 'all') {
      params.status = this.data.status;
    }

    api.teacher.getHomeworkList(params)
      .then(data => {
        that.setData({
          homeworkList: data || [],
          loading: false
        });
        // 获取统计信息
        return api.teacher.getHomeworkStats();
      })
      .then(stats => {
        if (stats) {
          that.setData({ stats });
        }
      })
      .catch(err => {
        console.error('获取作业列表失败:', err);
        that.setData({ loading: false });
        wx.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        });
      });
  },

  onFilterChange: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ status });
    this.loadData();
  },

  onViewStats: function(e) {
    wx.showToast({
      title: '查看统计',
      icon: 'none'
    });
  },

  onViewList: function(e) {
    const homeworkId = e.currentTarget.dataset.id;
    this.loadStudentList(homeworkId);
  },

  loadStudentList: function(homeworkId) {
    const that = this;

    api.teacher.getStudentSubmissions(homeworkId)
      .then(data => {
        that.setData({
          studentList: data || []
        });
        wx.showToast({
          title: '已加载学生名单',
          icon: 'success'
        });
      })
      .catch(err => {
        wx.showToast({
          title: err.message || '加载学生列表失败',
          icon: 'none'
        });
      });
  },

  onEdit: function(e) {
    wx.showToast({
      title: '编辑作业',
      icon: 'none'
    });
  },

  // ========== 反馈功能 ==========
  onFeedback: function(e) {
    const homeworkId = e.currentTarget.dataset.id;
    this.setData({
      showFeedbackModal: true,
      selectedHomeworkId: homeworkId,
      selectedStudent: null,
      aiFeedback: '',
      teacherFeedback: '',
      feedbackLoading: true
    });

    // 加载学生列表
    this.loadStudentListForFeedback(homeworkId);
  },

  loadStudentListForFeedback: function(homeworkId) {
    const that = this;

    api.teacher.getStudentSubmissions(homeworkId)
      .then(data => {
        that.setData({
          studentList: data || [],
          feedbackLoading: false
        });
      })
      .catch(err => {
        that.setData({ feedbackLoading: false });
        wx.showToast({
          title: err.message || '加载学生列表失败',
          icon: 'none'
        });
      });
  },

  onCloseFeedback: function() {
    this.setData({
      showFeedbackModal: false
    });
  },

  onSelectStudent: function(e) {
    const studentId = e.currentTarget.dataset.id;
    const student = this.data.studentList.find(s => s.id === studentId);

    this.setData({
      selectedStudent: studentId
    });

    // 根据选择的学生生成AI反馈
    this.generateAIFeedback(this.data.selectedHomeworkId, studentId);
  },

  generateAIFeedback: function(homeworkId, studentId) {
    const that = this;
    that.setData({ feedbackLoading: true });

    api.teacher.generateAIFeedback(homeworkId, studentId)
      .then(data => {
        that.setData({
          aiFeedback: data.feedback || '',
          teacherFeedback: data.feedback || '',
          feedbackLoading: false
        });
      })
      .catch(err => {
        // 使用本地默认反馈作为降级
        const defaultFeedback = `【作业反馈】

小朋友本次作业完成情况良好！

✅ 表现优秀：
- 书写工整，正确率高
- 听力理解能力强

💪 需要加强：
- 单词拼写还需练习
- 建议每天复习10个单词

🌟 总体评价：
继续加油，期待下一次的进步！`;

        that.setData({
          aiFeedback: defaultFeedback,
          teacherFeedback: defaultFeedback,
          feedbackLoading: false
        });

        wx.showToast({
          title: '使用默认反馈',
          icon: 'none'
        });
      });
  },

  onAIFeedbackInput: function(e) {
    this.setData({
      aiFeedback: e.detail.value
    });
  },

  onTeacherFeedbackInput: function(e) {
    this.setData({
      teacherFeedback: e.detail.value
    });
  },

  onRegenerateAI: function() {
    const homeworkId = this.data.selectedHomeworkId;
    const studentId = this.data.selectedStudent;

    wx.showLoading({ title: 'AI生成中...' });

    this.generateAIFeedback(homeworkId, studentId);

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '重新生成完成',
        icon: 'success'
      });
    }, 1500);
  },

  onToggleParent: function() {
    this.setData({
      sendToParent: !this.data.sendToParent
    });
  },

  onToggleStudent: function() {
    this.setData({
      sendToStudent: !this.data.sendToStudent
    });
  },

  onPreviewFeedback: function() {
    if (!this.data.teacherFeedback && !this.data.aiFeedback) {
      wx.showToast({
        title: '请先生成反馈内容',
        icon: 'none'
      });
      return;
    }
    this.setData({
      showPreviewModal: true
    });
  },

  onClosePreview: function() {
    this.setData({
      showPreviewModal: false
    });
  },

  onSendFeedback: function() {
    const that = this;

    if (!this.data.selectedStudent) {
      wx.showToast({
        title: '请选择学生',
        icon: 'none'
      });
      return;
    }

    if (!this.data.sendToParent && !this.data.sendToStudent) {
      wx.showToast({
        title: '请选择发送对象',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认发送',
      content: '确定要发送反馈给家长和学生吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '发送中...' });

          const feedbackData = {
            aiFeedback: that.data.aiFeedback,
            teacherFeedback: that.data.teacherFeedback,
            sendToParent: that.data.sendToParent,
            sendToStudent: that.data.sendToStudent
          };

          api.teacher.sendFeedback(that.data.selectedHomeworkId, that.data.selectedStudent, feedbackData)
            .then(() => {
              wx.hideLoading();
              wx.showToast({
                title: '发送成功',
                icon: 'success'
              });
              that.setData({
                showFeedbackModal: false
              });
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: err.message || '发送失败',
                icon: 'none'
              });
            });
        }
      }
    });
  }
});
