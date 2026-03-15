Page({
  data: {
    institution: {
      name: 'XX外国语学校',
      logo: '',
      themeColor: '#4A90D9'
    },
    colorOptions: [
      '#4A90D9',
      '#7ED321',
      '#F5A623',
      '#9B59B6',
      '#E91E63',
      '#00BCD4'
    ]
  },

  onLoad: function() {
    this.loadInstitution();
  },

  loadInstitution: function() {
    // 加载机构信息
  },

  onNameInput: function(e) {
    this.setData({
      'institution.name': e.detail.value
    });
  },

  onUploadLogo: function() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({
          'institution.logo': res.tempFilePaths[0]
        });
      }
    });
  },

  onColorSelect: function(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      'institution.themeColor': color
    });
  },

  onCustomColor: function(e) {
    this.setData({
      'institution.themeColor': e.detail.value
    });
  },

  onSave: function() {
    wx.showLoading({ title: '保存中...' });
    // 保存机构设置
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }, 1000);
  }
});
