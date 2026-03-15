// pages/principal/reports/reports.js
const api = require('../../../utils/api.js');

Page({
  data: {
    timeType: 'week',
    income: { total: '0', new: '0', renewal: 0 },
    users: { newStudent: 0, newParent: 0, active: 0 },
    trendData: [],
    chartLabels: [],
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

    api.principal.getOperationReport(this.data.timeType).then((data) => {
      if (data) {
        this.setData({
          income: data.income || { total: '0', new: '0', renewal: 0 },
          users: data.users || { newStudent: 0, newParent: 0, active: 0 },
          trendData: data.trendData || [],
          chartLabels: data.chartLabels || [],
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    }).catch((err) => {
      console.error('加载运营报表数据失败:', err);
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

  onExportReport: function() {
    wx.showLoading({ title: '导出中...' });

    api.principal.exportOperationReport(this.data.timeType).then(() => {
      wx.hideLoading();
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      });
    }).catch((err) => {
      wx.hideLoading();
      console.error('导出报表失败:', err);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    });
  },

  onViewDetail: function(e) {
    const type = e.currentTarget.dataset.type;
    wx.showToast({
      title: '查看' + (type === 'income' ? '收入' : '用户') + '详情',
      icon: 'none'
    });
    // TODO: 实现查看详情功能
    // if (type === 'income') {
    //   wx.navigateTo({
    //     url: '/pages/principal/income/income'
    //   });
    // } else {
    //   wx.navigateTo({
    //     url: '/pages/principal/user-detail/user-detail'
    //   });
    // }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
