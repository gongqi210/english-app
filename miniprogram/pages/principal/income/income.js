// pages/principal/income/income.js
const api = require('../../../utils/api.js');

Page({
  data: {
    timeType: 'day',
    currentDate: '',
    overview: {
      total: '0',
      change: 0,
      orderCount: 0,
      avgPrice: 0
    },
    trendData: [],
    composition: [],
    details: [],
    loading: true
  },

  onLoad: function() {
    // 设置当前日期
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    this.setData({ currentDate });
    this.loadData();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadData();
  },

  loadData: function() {
    this.setData({ loading: true });

    api.principal.getIncomeReport(this.data.timeType, this.data.currentDate).then((data) => {
      if (data) {
        this.setData({
          overview: data.overview || { total: '0', change: 0, orderCount: 0, avgPrice: 0 },
          trendData: data.trendData || [],
          composition: data.composition || [],
          details: data.details || [],
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    }).catch((err) => {
      console.error('加载收入报表数据失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    });
  },

  onTimeChange: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ timeType: type });
    this.loadData();
  },

  onDateChange: function(e) {
    const date = e.detail.value;
    this.setData({ currentDate: date });
    this.loadData();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
