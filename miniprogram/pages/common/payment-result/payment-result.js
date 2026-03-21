// pages/common/payment-result/payment-result.js
Page({
  data: {
    status: 'success',
    orderInfo: {
      packageName: '季度会员',
      amount: 79,
      orderNo: ''
    }
  },

  onLoad: function(options) {
    const { status, orderId, amount, packageName } = options;

    this.setData({
      status: status || 'success',
      orderInfo: {
        packageName: packageName || '季度会员',
        amount: amount || 79,
        orderNo: orderId || '2024031512345678'
      }
    });
  },

  onViewMembership: function() {
    wx.navigateTo({
      url: '/pages/parent/membership/membership'
    });
  },

  onRetry: function() {
    wx.navigateBack();
  },

  onGoHome: function() {
    wx.switchTab({
      url: '/pages/student/home/home'
    });
  },

  onBack: function() {
    wx.navigateBack({ delta: 1 });
  }
});
