Page({
  data: {
    totalCount: 15,
    activeCount: 14,
    classCount: 12,
    teachers: [
      { id: 1, name: '李老师', role: '班主任', className: '三年级一班', studentCount: 30, homeworkCount: 45, rating: 4.8, avatar: 'https://picsum.photos/200/200?random=301' },
      { id: 2, name: '王老师', role: '班主任', className: '三年级二班', studentCount: 28, homeworkCount: 42, rating: 4.7, avatar: 'https://picsum.photos/200/200?random=301' },
      { id: 3, name: '张老师', role: '任课老师', className: '四年级', studentCount: 56, homeworkCount: 38, rating: 4.9, avatar: 'https://picsum.photos/200/200?random=301' },
      { id: 4, name: '赵老师', role: '班主任', className: '四年级二班', studentCount: 32, homeworkCount: 40, rating: 4.6, avatar: 'https://picsum.photos/200/200?random=301' }
    ]
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    // 加载教师数据
  },

  onMessage: function(e) {
    wx.showToast({ title: '发送消息', icon: 'none' });
  },

  onEdit: function(e) {
    wx.showToast({ title: '编辑老师', icon: 'none' });
  },

  onAddTeacher: function() {
    wx.showToast({ title: '添加老师', icon: 'none' });
  }
});
