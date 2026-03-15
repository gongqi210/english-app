// pages/principal/income/income.js
Page({
  data: {
    timeType: 'day',
    currentDate: '2024-03-15',
    overview: {
      total: '12,850',
      change: 15,
      orderCount: 156,
      avgPrice: 82
    },
    trendData: [
      { label: '周一', value: 1200, percent: 60 },
      { label: '周二', value: 1500, percent: 75 },
      { label: '周三', value: 1800, percent: 90 },
      { label: '周四', value: 1400, percent: 70 },
      { label: '周五', value: 2100, percent: 100 },
      { label: '周六', value: 1950, percent: 95 },
      { label: '周日', value: 1650, percent: 80 }
    ],
    composition: [
      { id: 1, name: '会员订阅', icon: '💎', amount: '8,500', percent: 66 },
      { id: 2, name: '课时购买', icon: '⏰', amount: '3,200', percent: 25 },
      { id: 3, name: '绘本销售', icon: '📚', amount: '1,150', percent: 9 }
    ],
    details: [
      { id: 1, title: '季度会员', desc: '小明家长', amount: 79, icon: '💎', time: '14:30' },
      { id: 2, title: '年度会员', desc: '小红家长', amount: 299, icon: '💎', time: '13:15' },
      { id: 3, title: '10课时包', desc: '小刚家长', icon: '⏰', amount: 299, time: '11:20' },
      { id: 4, title: '月度会员', desc: '小丽家长', amount: 29, icon: '💎', time: '10:05' },
      { id: 5, title: '绘本套装', desc: '小小明家长', amount: 99, icon: '📚', time: '09:30' }
    ]
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    const timeType = this.data.timeType;
    let data = {};

    if (timeType === 'day') {
      data = {
        overview: { total: '12,850', change: 15, orderCount: 156, avgPrice: 82 },
        trendData: [
          { label: '周一', value: 1200, percent: 60 },
          { label: '周二', value: 1500, percent: 75 },
          { label: '周三', value: 1800, percent: 90 },
          { label: '周四', value: 1400, percent: 70 },
          { label: '周五', value: 2100, percent: 100 },
          { label: '周六', value: 1950, percent: 95 },
          { label: '周日', value: 1650, percent: 80 }
        ]
      };
    } else if (timeType === 'week') {
      data = {
        overview: { total: '89,600', change: 12, orderCount: 892, avgPrice: 100 },
        trendData: [
          { label: '第1周', value: 21000, percent: 85 },
          { label: '第2周', value: 24500, percent: 100 },
          { label: '第3周', value: 19800, percent: 80 },
          { label: '第4周', value: 24300, percent: 99 }
        ]
      };
    } else if (timeType === 'month') {
      data = {
        overview: { total: '385,200', change: 18, orderCount: 3560, avgPrice: 108 },
        trendData: [
          { label: '第1周', value: 85000, percent: 80 },
          { label: '第2周', value: 98000, percent: 92 },
          { label: '第3周', value: 105000, percent: 100 },
          { label: '第4周', value: 97200, percent: 92 }
        ]
      };
    } else {
      data = {
        overview: { total: '2,156,800', change: 25, orderCount: 18650, avgPrice: 116 },
        trendData: [
          { label: '1月', value: 156000, percent: 70 },
          { label: '2月', value: 189000, percent: 85 },
          { label: '3月', value: 245000, percent: 100 }
        ]
      };
    }

    this.setData(data);
  },

  onTimeChange: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ timeType: type });
    this.loadData();
  },

  onDateChange: function(e) {
    this.setData({ currentDate: e.detail.value });
    this.loadData();
  }
});
