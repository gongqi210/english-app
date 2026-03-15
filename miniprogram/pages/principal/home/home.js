// pages/principal/home/home.js
const api = require('../../../utils/api.js');

Page({
  data: {
    rankingType: 'score',
    stats: {
      totalStudents: 0,
      todayHomework: 0,
      avgScore: 0,
      activeRate: 0
    },
    classRankings: [],
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

    // 并行加载统计数据和排名数据
    Promise.all([
      api.principal.getDashboardStats(),
      api.principal.getClassRankings(this.data.rankingType)
    ]).then(([stats, rankings]) => {
      this.setData({
        stats: stats || {
          totalStudents: 0,
          todayHomework: 0,
          avgScore: 0,
          activeRate: 0
        },
        classRankings: rankings?.[this.data.rankingType] || rankings || [],
        loading: false
      });
    }).catch((err) => {
      console.error('加载数据失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    });
  },

  onRankingTypeChange: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ rankingType: type, loading: true });

    // 根据类型获取排名数据
    api.principal.getClassRankings(type).then((rankings) => {
      this.setData({
        classRankings: rankings?.[type] || rankings || [],
        loading: false
      });
    }).catch((err) => {
      console.error('加载排名数据失败:', err);
      this.setData({ loading: false });
    });
  },

  onNavigate: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
