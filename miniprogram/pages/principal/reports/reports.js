// pages/principal/reports/reports.js
Page({
  data: {
    timeType: 'week',
    income: { total: '128,500', new: '15,800', renewal: 85 },
    users: { newStudent: 45, newParent: 38, active: 92 },
    trendData: [60, 75, 65, 80, 90, 85, 95],
    chartLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    // 根据时间类型加载不同数据
    const timeType = this.data.timeType;
    let data = {};

    if (timeType === 'week') {
      data = {
        trendData: [60, 75, 65, 80, 90, 85, 95],
        chartLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        income: { total: '128,500', new: '15,800', renewal: 85 },
        users: { newStudent: 45, newParent: 38, active: 92 }
      };
    } else if (timeType === 'month') {
      data = {
        trendData: [65, 72, 78, 82, 75, 88, 92, 85, 90, 95],
        chartLabels: ['第1周', '第2周', '第3周', '第4周'],
        income: { total: '520,000', new: '68,000', renewal: 88 },
        users: { newStudent: 186, newParent: 152, active: 88 }
      };
    } else {
      data = {
        trendData: [45, 52, 65, 72, 78, 85, 92],
        chartLabels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
        income: { total: '2,850,000', new: '380,000', renewal: 92 },
        users: { newStudent: 856, newParent: 720, active: 95 }
      };
    }

    this.setData(data);
  },

  onTimeChange: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ timeType: type });
    this.loadData();
  },

  onExportReport: function() {
    wx.showLoading({ title: '导出中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      });
    }, 1500);
  },

  onViewDetail: function(e) {
    const type = e.currentTarget.dataset.type;
    wx.showToast({
      title: '查看' + (type === 'income' ? '收入' : '用户') + '详情',
      icon: 'none'
    });
  }
});
