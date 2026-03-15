// pages/principal/finance/finance.js
const api = require('../../../utils/api.js');

Page({
  data: {
    currentPeriod: 'month',
    finance: {
      income: '0',
      incomeChange: 0,
      expense: '0',
      expenseChange: 0,
      profit: '0',
      profitChange: 0
    },
    trend: {
      incomePercent: 0,
      expensePercent: 0,
      labels: []
    },
    expenses: [],
    loading: true
  },

  onLoad: function() {
    this.loadData();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadData();
  },

  loadData: function() {
    this.setData({ loading: true });

    api.principal.getFinanceReport(this.data.currentPeriod).then((data) => {
      if (data) {
        this.setData({
          finance: data.finance || {
            income: '0',
            incomeChange: 0,
            expense: '0',
            expenseChange: 0,
            profit: '0',
            profitChange: 0
          },
          trend: data.trend || { incomePercent: 0, expensePercent: 0, labels: [] },
          expenses: data.expenses || [],
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    }).catch((err) => {
      console.error('加载财务报表数据失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    });
  },

  onPeriodChange: function(e) {
    const period = e.currentTarget.dataset.period;
    this.setData({ currentPeriod: period });
    this.loadData();
  },

  onExport: function() {
    wx.showLoading({ title: '导出中...' });

    api.principal.exportFinanceReport(this.data.currentPeriod).then(() => {
      wx.hideLoading();
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      });
    }).catch((err) => {
      wx.hideLoading();
      console.error('导出财务报表失败:', err);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
