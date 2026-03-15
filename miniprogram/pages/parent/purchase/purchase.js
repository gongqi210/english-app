// pages/parent/purchase/purchase.js
const api = require('../../../utils/api.js');

Page({
  data: {
    selectedPackage: 2,
    selectedPayment: 'wechat',
    showPayModal: false,
    packages: [],
    currentOrderId: null,
    loading: true
  },

  onLoad: function(options) {
    this.loadPackages();
    if (options.id) {
      this.setData({ selectedPackage: parseInt(options.id) });
    }
  },

  loadPackages: function() {
    const that = this;

    api.parent.getMembershipLevels().then(packages => {
      that.setData({
        packages: packages,
        loading: false
      });
    }).catch(err => {
      console.error('获取套餐列表失败:', err);
      that.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });
  },

  get currentPackage() {
    return this.data.packages.find(p => p.id === this.data.selectedPackage);
  },

  onSelectPackage: function(e) {
    const packageId = e.currentTarget.dataset.id;
    this.setData({ selectedPackage: packageId });
  },

  onSelectPayment: function(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ selectedPayment: method });
  },

  onPay: function() {
    const selectedPackage = this.currentPackage;
    if (!selectedPackage) {
      wx.showToast({
        title: '请选择套餐',
        icon: 'none'
      });
      return;
    }
    this.setData({ showPayModal: true });
  },

  onCloseModal: function() {
    this.setData({ showPayModal: false });
  },

  onConfirmPay: function() {
    const that = this;
    const selectedPackage = this.currentPackage;
    const paymentMethod = this.data.selectedPayment;

    wx.showLoading({ title: '创建订单...' });

    // 创建订单
    api.parent.createOrder(selectedPackage.id, paymentMethod).then(order => {
      that.setData({ currentOrderId: order.id });
      wx.hideLoading();

      // 调用支付（这里模拟支付流程，实际需要调用微信支付API）
      wx.showLoading({ title: '支付中...' });

      // 模拟支付成功
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        });

        // 跳转到支付结果页
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/common/payment-result/payment-result?status=success&orderId=' + order.id
          });
        }, 1500);
      }, 2000);
    }).catch(err => {
      wx.hideLoading();
      console.error('创建订单失败:', err);
      wx.showToast({
        title: err.message || '创建订单失败',
        icon: 'none'
      });
    });
  }
});
