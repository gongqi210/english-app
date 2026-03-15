// pages/principal/campus/campus.js
Page({
  data: {
    campuses: [
      {
        id: 1,
        name: '总校区',
        status: 'active',
        statusText: '运营中',
        studentCount: 286,
        teacherCount: 15,
        classCount: 12,
        address: '北京市朝阳区',
        phone: '010-12345678'
      },
      {
        id: 2,
        name: '南城分校',
        status: 'active',
        statusText: '运营中',
        studentCount: 156,
        teacherCount: 8,
        classCount: 6,
        address: '北京市海淀区',
        phone: '010-87654321'
      },
      {
        id: 3,
        name: '城北分校',
        status: 'pending',
        statusText: '筹建中',
        studentCount: 0,
        teacherCount: 3,
        classCount: 0,
        address: '北京市西城区',
        phone: '010-11112222'
      }
    ],
    showModal: false,
    modalType: '',
    editingCampus: null,
    formData: {
      name: '',
      address: '',
      phone: ''
    }
  },

  onLoad: function() {
    this.loadData();
  },

  loadData: function() {
    // 模拟加载数据
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
  },

  onDeleteCampus: function(e) {
    const campusId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该校区吗？',
      success: (res) => {
        if (res.confirm) {
          const campuses = this.data.campuses.filter(c => c.id !== campusId);
          this.setData({ campuses });
          wx.showToast({ title: '删除成功', icon: 'success' });
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
      const newCampus = {
        id: this.data.campuses.length + 1,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        status: 'pending',
        statusText: '筹建中',
        studentCount: 0,
        teacherCount: 0,
        classCount: 0
      };
      this.setData({ campuses: [...this.data.campuses, newCampus] });
    } else if (modalType === 'edit' && editingCampus) {
      const campuses = this.data.campuses.map(c => {
        if (c.id === editingCampus.id) {
          return { ...c, name: formData.name, address: formData.address, phone: formData.phone };
        }
        return c;
      });
      this.setData({ campuses });
    }
    this.setData({ showModal: false });
    wx.showToast({ title: modalType === 'add' ? '添加成功' : '保存成功', icon: 'success' });
  },

  onToggleStatus: function(e) {
    const campusId = e.currentTarget.dataset.id;
    const campuses = this.data.campuses.map(c => {
      if (c.id === campusId) {
        const newStatus = c.status === 'active' ? 'inactive' : 'active';
        return { ...c, status: newStatus, statusText: newStatus === 'active' ? '运营中' : '已停用' };
      }
      return c;
    });
    this.setData({ campuses });
  }
});
