// pages/parent/membership/membership.js
Page({
  data: {
    currentMember: {
      name: '小明',
      level: 'silver',
      levelText: '白银会员',
      expireDate: '2024-12-31',
      daysLeft: 280,
      benefits: [
        '无限绘本阅读',
        'AI智能评分',
        '作业无限量',
        '学习报告'
      ]
    },
    allBenefits: [
      { id: 1, name: '绘本阅读', icon: '📚', desc: '500+原版绘本', unlocked: true },
      { id: 2, name: 'AI评分', icon: '🤖', desc: '智能跟读打分', unlocked: true },
      { id: 3, name: '作业无限', icon: '✏️', desc: '每日作业无限', unlocked: true },
      { id: 4, name: '学习报告', icon: '📊', desc: '详细数据分析', unlocked: true },
      { id: 5, name: '1对1外教', icon: '👨‍🏫', desc: '在线外教课', unlocked: false },
      { id: 6, name: '家长课堂', icon: '👨‍👩‍👧', desc: '家长指导课', unlocked: false }
    ],
    packages: [
      {
        id: 1,
        name: '月度会员',
        price: 29,
        unit: '月',
        originalPrice: 39,
        popular: false,
        features: [
          '全部绘本无限读',
          'AI跟读评分',
          '作业无限量',
          '学习报告'
        ]
      },
      {
        id: 2,
        name: '季度会员',
        price: 79,
        unit: '季',
        originalPrice: 99,
        popular: true,
        features: [
          '全部绘本无限读',
          'AI跟读评分',
          '作业无限量',
          '学习报告',
          '赠送10次外教课'
        ]
      },
      {
        id: 3,
        name: '年度会员',
        price: 299,
        unit: '年',
        originalPrice: 399,
        popular: false,
        features: [
          '全部绘本无限读',
          'AI跟读评分',
          '作业无限量',
          '学习报告',
          '赠送50次外教课',
          '专属学习规划',
          '家长课堂'
        ]
      }
    ]
  },

  onLoad: function() {
    this.loadMemberData();
  },

  loadMemberData: function() {
    // 模拟加载会员数据
  },

  // 续费
  onRenew: function() {
    wx.navigateTo({
      url: '/pages/parent/purchase/purchase'
    });
  },

  // 购买套餐
  onBuyPackage: function(e) {
    const packageId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/parent/purchase/purchase?id=' + packageId
    });
  },

  // 查看订单
  onViewOrders: function() {
    wx.navigateTo({
      url: '/pages/parent/orders/orders'
    });
  }
});
