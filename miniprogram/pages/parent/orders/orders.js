// pages/parent/orders/orders.js
Page({
  data: {
    currentTab: 'all',
    orders: [
      {
        id: 1,
        orderNo: '2024031512345678',
        productName: '季度会员',
        productDesc: '3个月会员权益 + 10次外教课',
        amount: 79,
        status: 'paid',
        statusText: '已完成',
        createTime: '2024-03-15 14:30'
      },
      {
        id: 2,
        orderNo: '2024031012345678',
        productName: '年度会员',
        productDesc: '12个月会员权益 + 50次外教课',
        amount: 299,
        status: 'paid',
        statusText: '已完成',
        createTime: '2024-03-10 09:15'
      },
      {
        id: 3,
        orderNo: '2024030512345678',
        productName: '月度会员',
        productDesc: '1个月会员权益',
        amount: 29,
        status: 'refund',
        statusText: '已退款',
        createTime: '2024-03-05 16:20'
      }
    ]
  },

  onLoad: function() {
    this.filterOrders();
  },

  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.filterOrders();
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
          wx.showToast({
            title: '退款申请已提交',
            icon: 'success'
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
