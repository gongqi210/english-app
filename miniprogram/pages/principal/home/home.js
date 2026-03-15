Page({
  data: {
    rankingType: 'score',
    stats: {
      totalStudents: 286,
      todayHomework: 45,
      avgScore: 87.5,
      activeRate: 92
    },
    classRankings: [
      { id: 1, name: '三年级一班', teacher: '李老师', value: '92分' },
      { id: 2, name: '三年级二班', teacher: '王老师', value: '89分' },
      { id: 3, name: '四年级一班', teacher: '张老师', value: '88分' },
      { id: 4, name: '四年级二班', teacher: '赵老师', value: '85分' },
      { id: 5, name: '五年级一班', teacher: '刘老师', value: '82分' }
    ]
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    // 加载数据
  },

  onRankingTypeChange: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ rankingType: type });

    // 根据类型更新排名数据
    if (type === 'score') {
      this.setData({
        classRankings: [
          { id: 1, name: '三年级一班', teacher: '李老师', value: '92分' },
          { id: 2, name: '三年级二班', teacher: '王老师', value: '89分' },
          { id: 3, name: '四年级一班', teacher: '张老师', value: '88分' },
          { id: 4, name: '四年级二班', teacher: '赵老师', value: '85分' },
          { id: 5, name: '五年级一班', teacher: '刘老师', value: '82分' }
        ]
      });
    } else if (type === 'completion') {
      this.setData({
        classRankings: [
          { id: 1, name: '三年级一班', teacher: '李老师', value: '98%' },
          { id: 2, name: '四年级一班', teacher: '张老师', value: '95%' },
          { id: 3, name: '三年级二班', teacher: '王老师', value: '92%' },
          { id: 4, name: '四年级二班', teacher: '赵老师', value: '88%' },
          { id: 5, name: '五年级一班', teacher: '刘老师', value: '85%' }
        ]
      });
    } else if (type === 'activity') {
      this.setData({
        classRankings: [
          { id: 1, name: '三年级二班', teacher: '王老师', value: '95%' },
          { id: 2, name: '三年级一班', teacher: '李老师', value: '92%' },
          { id: 3, name: '四年级一班', teacher: '张老师', value: '90%' },
          { id: 4, name: '五年级一班', teacher: '刘老师', value: '88%' },
          { id: 5, name: '四年级二班', teacher: '赵老师', value: '85%' }
        ]
      });
    }
  },

  onNavigate: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
