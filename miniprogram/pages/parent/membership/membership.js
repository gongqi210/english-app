// pages/parent/membership/membership.js
const api = require('../../../utils/api.js');

Page({
  data: {
    currentMember: null,
    allBenefits: [
      { id: 1, name: '绘本阅读', icon: '📚', desc: '500+原版绘本', unlocked: true },
      { id: 2, name: 'AI评分', icon: '🤖', desc: '智能跟读打分', unlocked: true },
      { id: 3, name: '作业无限', icon: '✏️', desc: '每日作业无限', unlocked: true },
      { id: 4, name: '学习报告', icon: '📊', desc: '详细数据分析', unlocked: true },
      { id: 5, name: '1对1外教', icon: '👨‍🏫', desc: '在线外教课', unlocked: false },
      { id: 6, name: '家长课堂', icon: '👨‍👩‍👧', desc: '家长指导课', unlocked: false }
    ],
    packages: [],
    loading: true
  },

  onLoad: function() {
    this.loadMemberData();
  },

  loadMemberData: function() {
    const that = this;

    // 获取会员状态
    api.parent.getMembershipStatus().then(status => {
      const member = {
        name: '我',
        level: status.levelName || '免费用户',
        levelText: status.levelName || '免费用户',
        expireDate: status.expireTime || '未开通',
        daysLeft: status.remainingDays || 0,
        benefits: status.isMember ? [
          '无限绘本阅读',
          'AI智能评分',
          '作业无限量',
          '学习报告'
        ] : [
          '每日1本绘本',
          '基础练习'
        ]
      };
      that.setData({ currentMember: member });
    }).catch(err => {
      console.error('获取会员状态失败:', err);
    });

    // 获取会员等级列表
    api.parent.getMembershipLevels().then(packages => {
      that.setData({
        packages: packages,
        loading: false
      });
    }).catch(err => {
      console.error('获取会员等级列表失败:', err);
      that.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });
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
  },

  onBack: function() {
    wx.navigateBack({ delta: 1 });
  }
});
