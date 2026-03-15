// pages/principal/finance/finance.js
Page({
  data: {
    currentPeriod: 'month',
    finance: {
      income: '385,200',
      incomeChange: 18,
      expense: '156,800',
      expenseChange: 8,
      profit: '228,400',
      profitChange: 25
    },
    trend: {
      incomePercent: 75,
      expensePercent: 45,
      labels: ['1月', '2月', '3月']
    },
    expenses: [
      { id: 1, name: '教师工资', desc: '25名教师薪酬', amount: '95,000', icon: '👨‍🏫' },
      { id: 2, name: '房租水电', desc: '3个校区场地费用', amount: '28,000', icon: '🏫' },
      { id: 3, name: '市场推广', desc: '广告投放、活动费用', amount: '18,500', icon: '📢' },
      { id: 4, name: '技术维护', desc: '系统维护、服务器', amount: '8,800', icon: '🔧' },
      { id: 5, name: '教材采购', desc: '绘本、教材采购', amount: '6,500', icon: '📚' }
    ]
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    const period = this.data.currentPeriod;
    let data = {};

    if (period === 'month') {
      data = {
        finance: {
          income: '385,200',
          incomeChange: 18,
          expense: '156,800',
          expenseChange: 8,
          profit: '228,400',
          profitChange: 25
        },
        trend: { incomePercent: 75, expensePercent: 45, labels: ['1月', '2月', '3月'] }
      };
    } else if (period === 'quarter') {
      data = {
        finance: {
          income: '1,156,800',
          incomeChange: 22,
          expense: '468,500',
          expenseChange: 12,
          profit: '688,300',
          profitChange: 30
        },
        trend: { incomePercent: 85, expensePercent: 55, labels: ['Q1', 'Q2', 'Q3'] }
      };
    } else {
      data = {
        finance: {
          income: '4,528,600',
          incomeChange: 35,
          expense: '1,856,200',
          expenseChange: 15,
          profit: '2,672,400',
          profitChange: 48
        },
        trend: { incomePercent: 95, expensePercent: 60, labels: ['2022', '2023', '2024'] }
      };
    }

    this.setData(data);
  },

  onPeriodChange: function(e) {
    const period = e.currentTarget.dataset.period;
    this.setData({ currentPeriod: period });
    this.loadData();
  },

  onExport: function() {
    wx.showLoading({ title: '导出中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      });
    }, 1500);
  }
});
