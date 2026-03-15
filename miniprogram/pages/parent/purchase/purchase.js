// pages/parent/purchase/purchase.js
Page({
  data: {
    selectedPackage: 2,
    selectedPayment: 'wechat',
    showPayModal: false,
    packages: [
      {
        id: 1,
        name: '月度会员',
        price: 29,
        unit: '月',
        originalPrice: 39,
        features: ['全部绘本无限读', 'AI跟读评分', '作业无限量']
      },
      {
        id: 2,
        name: '季度会员',
        price: 79,
        unit: '季',
        originalPrice: 99,
        popular: true,
        features: ['全部绘本无限读', 'AI跟读评分', '作业无限量', '赠送10次外教课']
      },
      {
        id: 3,
        name: '年度会员',
        price: 299,
        unit: '年',
        originalPrice: 399,
        features: ['全部绘本无限读', 'AI跟读评分', '作业无限量', '赠送50次外教课', '专属学习规划']
      }
    ]
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ selectedPackage: parseInt(options.id) });
    }
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
    this.setData({ showPayModal: true });
  },

  onCloseModal: function() {
    this.setData({ showPayModal: false });
  },

  onConfirmPay: function() {
    wx.showLoading({ title: '支付中...' });

    // 模拟微信支付
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      });

      // 跳转到支付结果页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/common/payment-result/payment-result?status=success&orderId=' + Date.now()
        });
      }, 1500);
    }, 2000);
  }
});
