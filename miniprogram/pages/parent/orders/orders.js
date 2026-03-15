// pages/parent/orders/orders.js
const api = require('../../../utils/api.js');

Page({
  data: {
    currentTab: 'all',
    orders: [],
    filteredOrders: [],
    loading: true
  },

  onLoad: function() {
    this.loadOrders();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadOrders();
  },

  loadOrders: function() {
    const that = this;
    const currentTab = this.data.currentTab;

    that.setData({ loading: true });

    api.parent.getOrders(currentTab).then(orders => {
      that.setData({
        orders: orders,
        filteredOrders: orders,
        loading: false
      });
    }).catch(err => {
      console.error('获取订单列表失败:', err);
      that.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });
  },

  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadOrders();
  },

  filterOrders: function() {
    const { currentTab, orders } = this.data;
    let filtered = orders;

    if (currentTab === 'paid') {
      filtered = orders.filter(o => o.status === 'paid');
    } else if (currentTab === 'pending') {
      filtered = orders.filter(o => o.status === 'pending');
    } else if (currentTab === 'refund') {
      filtered = orders.filter(o => o.status === 'refund');
    }

    this.setData({ filteredOrders: filtered });
  },

  onRefund: function(e) {
    const orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '申请中...' });
          api.parent.refundOrder(orderId).then(() => {
            wx.hideLoading();
            wx.showToast({
              title: '退款申请已提交',
              icon: 'success'
            });
            // 刷新订单列表
            this.loadOrders();
          }).catch(err => {
            wx.hideLoading();
            console.error('申请退款失败:', err);
            wx.showToast({
              title: err.message || '申请失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  onPay: function(e) {
    wx.navigateTo({
      url: '/pages/parent/purchase/purchase'
    });
  }
});
