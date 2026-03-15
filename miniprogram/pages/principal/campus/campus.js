// pages/principal/campus/campus.js
const api = require('../../../utils/api.js');

Page({
  data: {
    campuses: [],
    showModal: false,
    modalType: '',
    editingCampus: null,
    formData: {
      name: '',
      address: '',
      phone: ''
    },
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

    api.principal.getCampuses().then((campuses) => {
      this.setData({
        campuses: campuses || [],
        loading: false
      });
    }).catch((err) => {
      console.error('加载校区数据失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    });
  },

  onAddCampus: function() {
    this.setData({
      showModal: true,
      modalType: 'add',
      editingCampus: null,
      formData: { name: '', address: '', phone: '' }
    });
  },

  onEditCampus: function(e) {
    const campusId = e.currentTarget.dataset.id;
    const campus = this.data.campuses.find(c => c.id === campusId);
    if (campus) {
      this.setData({
        showModal: true,
        modalType: 'edit',
        editingCampus: campus,
        formData: {
          name: campus.name,
          address: campus.address,
          phone: campus.phone
        }
      });
    }
  },

  onDeleteCampus: function(e) {
    const campusId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该校区吗？',
      success: (res) => {
        if (res.confirm) {
          api.principal.deleteCampus(campusId).then(() => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.loadData();
          }).catch((err) => {
            console.error('删除校区失败:', err);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  onCloseModal: function() {
    this.setData({ showModal: false });
  },

  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onSaveCampus: function() {
    const { formData, modalType, editingCampus } = this.data;

    if (!formData.name) {
      wx.showToast({ title: '请输入校区名称', icon: 'none' });
      return;
    }

    if (modalType === 'add') {
      api.principal.addCampus(formData).then(() => {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
        this.setData({ showModal: false });
        this.loadData();
      }).catch((err) => {
        console.error('添加校区失败:', err);
        wx.showToast({
          title: '添加失败',
          icon: 'none'
        });
      });
    } else if (modalType === 'edit' && editingCampus) {
      api.principal.updateCampus(editingCampus.id, formData).then(() => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        this.setData({ showModal: false });
        this.loadData();
      }).catch((err) => {
        console.error('更新校区失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      });
    }
  },

  onToggleStatus: function(e) {
    const campusId = e.currentTarget.dataset.id;
    const campus = this.data.campuses.find(c => c.id === campusId);

    if (!campus) return;

    // 先更新本地状态，优化用户体验
    const campuses = this.data.campuses.map(c => {
      if (c.id === campusId) {
        const newStatus = c.status === 'active' ? 'inactive' : 'active';
        return { ...c, status: newStatus, statusText: newStatus === 'active' ? '运营中' : '已停用' };
      }
      return c;
    });
    this.setData({ campuses });

    // 调用API
    api.principal.toggleCampusStatus(campusId).then(() => {
      wx.showToast({
        title: '状态更新成功',
        icon: 'success'
      });
    }).catch((err) => {
      console.error('更新校区状态失败:', err);
      // 失败时恢复原状态
      this.loadData();
      wx.showToast({
        title: '状态更新失败',
        icon: 'none'
      });
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
