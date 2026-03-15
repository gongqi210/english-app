Page({
  data: {
    status: 'all',
    currentTime: '',
    stats: {
      assigned: 12,
      submitRate: 95,
      completeRate: 88,
      avgScore: 86
    },
    homeworkList: [
      {
        id: 1,
        title: 'Unit 3 单词练习',
        status: 'ongoing',
        statusText: '进行中',
        dateRange: '3月15日 - 3月18日',
        className: '三年级一班',
        studentCount: 30,
        submitRate: 93,
        submitted: 28,
        avgScore: 86,
        excellentCount: 12,
        needsImprovement: 3
      },
      {
        id: 2,
        title: 'Unit 2 句子跟读',
        status: 'finished',
        statusText: '已结束',
        dateRange: '3月10日 - 3月14日',
        className: '三年级一班',
        studentCount: 30,
        submitRate: 100,
        submitted: 30,
        avgScore: 92,
        excellentCount: 20,
        needsImprovement: 1
      },
      {
        id: 3,
        title: 'Unit 1 字母认知',
        status: 'finished',
        statusText: '已结束',
        dateRange: '3月5日 - 3月9日',
        className: '三年级二班',
        studentCount: 28,
        submitRate: 96,
        submitted: 27,
        avgScore: 89,
        excellentCount: 15,
        needsImprovement: 2
      }
    ],

    // 反馈功能
    showFeedbackModal: false,
    showPreviewModal: false,
    selectedHomeworkId: null,
    selectedStudent: null,
    studentList: [
      { id: 1, name: '小明', avatar: 'https://picsum.photos/200/200?random=401', score: 95 },
      { id: 2, name: '小红', avatar: 'https://picsum.photos/200/200?random=401', score: 88 },
      { id: 3, name: '小刚', avatar: 'https://picsum.photos/200/200?random=401', score: 72 },
      { id: 4, name: '小丽', avatar: 'https://picsum.photos/200/200?random=401', score: 90 }
    ],
    aiFeedback: '',
    teacherFeedback: '',
    sendToParent: true,
    sendToStudent: false
  },

  onLoad: function() {
    this.loadData();
    this.setCurrentTime();
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
    // 模拟加载数据
  },

  onFilterChange: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ status });
  },

  onViewStats: function(e) {
    wx.showToast({
      title: '查看统计',
      icon: 'none'
    });
  },

  onViewList: function(e) {
    wx.showToast({
      title: '查看名单',
      icon: 'none'
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
      teacherFeedback: ''
    });
    // 生成AI反馈
    this.generateAIFeedback();
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
    this.generateAIFeedback(student);
  },

  generateAIFeedback: function(student) {
    // 模拟AI生成反馈
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

    const studentFeedbacks = {
      1: `【小明作业反馈】

本次作业表现优秀！🎉

✅ 得分：95分
- 选择题：全对
- 听力题：95分
- 书写题：95分

💡 建议：
保持目前的学习状态，可以尝试挑战更高难度的题目。继续加油！`,

      2: `【小红作业反馈】

本次作业表现良好！👍

✅ 得分：88分
- 选择题：全对
- 听力题：90分
- 书写题：80分（书写需加强）

💡 建议：
- 书写要更加工整
- 注意字母大小写规范
- 坚持每天练习15分钟

继续努力！`,

      3: `【小刚作业反馈】

本次作业需要加油！💪

✅ 得分：72分
- 选择题：80分
- 听力题：75分
- 书写题：65分

💡 建议：
- 需要加强基础词汇记忆
- 建议每天额外练习20分钟
- 可以从简单的字母开始复习
- 建议家长多陪伴指导

老师相信你可以进步的！`,

      4: `【小丽作业反馈】

本次作业表现很棒！🌟

✅ 得分：90分
- 选择题：95分
- 听力题：90分
- 书写题：85分

💡 建议：
- 整体表现优秀
- 书写可以更美观
- 可以尝试跟读更多绘本

继续保持！`
    };

    const feedback = student ? studentFeedbacks[student.id] : defaultFeedback;
    this.setData({
      aiFeedback: feedback,
      teacherFeedback: feedback
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
    wx.showLoading({ title: 'AI生成中...' });
    setTimeout(() => {
      this.generateAIFeedback();
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
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '发送成功',
              icon: 'success'
            });
            this.setData({
              showFeedbackModal: false
            });
          }, 1000);
        }
      }
    });
  }
});
