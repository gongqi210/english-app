// miniprogram/utils/api.js
const app = getApp();

// API基础路径
// 开发环境：后端运行在局域网本机，前端从其他设备通过局域网 IP 访问
// 生产环境：替换为服务器域名
const API_BASE = 'http://192.168.8.143:8080';

// 统一的请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');

    const defaultOptions = {
      url: API_BASE + options.url,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      timeout: 15000,
      ...options
    };

    wx.request({
      ...defaultOptions,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else if (res.data.code === 401) {
            // Token过期或未登录
            handleUnauthorized();
            reject({ message: '请重新登录', code: 401 });
          } else {
            reject({ message: res.data.message || '请求失败', code: res.data.code });
          }
        } else if (res.statusCode === 401) {
          handleUnauthorized();
          reject({ message: '请重新登录', code: 401 });
        } else {
          reject({ message: '网络错误', statusCode: res.statusCode });
        }
      },
      fail: (err) => {
        // 网络请求失败，使用mock数据（开发阶段）
        console.warn('API请求失败，使用mock数据:', err);
        if (options.mockData) {
          resolve(options.mockData);
        } else {
          reject({ message: '网络请求失败' });
        }
      }
    });
  });
};

// 处理未授权情况
const handleUnauthorized = () => {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  app.globalData.token = null;
  app.globalData.userInfo = null;

  wx.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none'
  });

  setTimeout(() => {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
  }, 1500);
};

// 检查登录状态
const checkLogin = () => {
  const token = wx.getStorageSync('token');
  if (!token) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  }
  return true;
};

// ==================== 认证模块 API ====================
const authAPI = {
  // 获取用户信息
  getUserInfo: () => {
    return request({
      url: '/api/auth/info',
      method: 'GET',
      mockData: app.globalData.mockData.currentUser
    });
  },

  // 微信登录
  wechatLogin: (code) => {
    return request({
      url: '/api/auth/wechat',
      method: 'POST',
      data: { code }
    });
  },

  // 手机号密码登录
  login: (phone, password, role) => {
    return request({
      url: '/api/auth/login',
      method: 'POST',
      data: { phone, password, role }
    });
  },

  // 退出登录
  logout: () => {
    return request({
      url: '/api/auth/logout',
      method: 'POST'
    });
  }
};

// ==================== 会员模块 API ====================
const membershipAPI = {
  // 获取会员等级列表
  getLevels: () => {
    return request({
      url: '/api/membership/levels',
      method: 'GET',
      mockData: [
        { id: 1, name: '免费用户', price: 0, features: ['每日1本绘本', '基础练习'] },
        { id: 2, name: '月度会员', price: 29, features: ['无限绘本', 'AI对话', '专属客服'] },
        { id: 3, name: '年度会员', price: 299, features: ['所有权益', '线下活动', '专属勋章'] }
      ]
    });
  },

  // 获取会员状态
  getStatus: () => {
    return request({
      url: '/api/membership/status',
      method: 'GET',
      mockData: {
        isMember: true,
        level: 2,
        expireTime: '2025-12-31',
        remainingDays: 180
      }
    });
  }
};

// ==================== 绘本模块 API ====================
const bookAPI = {
  // 获取绘本列表
  getList: (params = {}) => {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    return request({
      url: `/api/books?${queryString}`,
      method: 'GET',
      mockData: app.globalData.mockData.books
    });
  },

  // 获取绘本详情
  getDetail: (id) => {
    return request({
      url: `/api/books/${id}`,
      method: 'GET',
      mockData: app.globalData.mockData.books.find(b => b.id === id)
    });
  },

  // 获取推荐绘本
  getRecommend: () => {
    return request({
      url: '/api/books/recommend',
      method: 'GET',
      mockData: app.globalData.mockData.books.slice(0, 4)
    });
  },

  // 获取最近学习
  getRecent: () => {
    return request({
      url: '/api/books/recent',
      method: 'GET',
      mockData: app.globalData.mockData.recentBooks
    });
  },

  // 记录阅读进度
  updateProgress: (bookId, page) => {
    return request({
      url: `/api/books/${bookId}/progress`,
      method: 'POST',
      data: { page }
    });
  }
};

// ==================== 作业模块 API ====================
const homeworkAPI = {
  // 获取作业列表
  getList: (status = 'all') => {
    return request({
      url: `/api/homework?status=${status}`,
      method: 'GET',
      mockData: app.globalData.mockData.homeworkList || [
        { id: 1, title: 'Unit 3 单词练习', deadline: '今天 18:00', questionCount: 5, duration: 15, progress: 40, completed: false, score: 0 },
        { id: 2, title: 'Unit 2 句子跟读', deadline: '今天 18:00', questionCount: 3, duration: 10, progress: 100, completed: true, score: 95 },
        { id: 3, title: 'Unit 1 字母认知', deadline: '昨天', questionCount: 4, duration: 8, progress: 100, completed: true, score: 88 }
      ]
    });
  },

  // 获取作业详情
  getDetail: (id) => {
    return request({
      url: `/api/homework/${id}`,
      method: 'GET',
      mockData: {
        id,
        title: 'Unit 3 单词练习',
        deadline: '今天 18:00',
        questions: []
      }
    });
  },

  // 提交作业
  submit: (id, answers) => {
    return request({
      url: `/api/homework/${id}/submit`,
      method: 'POST',
      data: { answers }
    });
  }
};

// ==================== 学习统计 API ====================
const statsAPI = {
  // 获取用户统计
  getUserStats: () => {
    return request({
      url: '/api/stats/user',
      method: 'GET',
      mockData: {
        totalBooks: 12,
        totalReadings: 45,
        totalTime: 360,
        streak: 5,
        points: 1250,
        level: 5,
        weekStats: app.globalData.mockData.weekStats
      }
    });
  },

  // 获取学习报告
  getReport: (id) => {
    return request({
      url: `/api/stats/report/${id}`,
      method: 'GET',
      mockData: {
        score: 85,
        timeSpent: '12分30秒',
        correctRate: 85,
        questionDetails: []
      }
    });
  }
};

// ==================== AI对话 API ====================
const chatAPI = {
  // 发送消息
  sendMessage: (message, history = []) => {
    return request({
      url: '/api/chat/message',
      method: 'POST',
      data: { message, history }
    });
  },

  // 获取快捷回复
  getQuickReplies: () => {
    return request({
      url: '/api/chat/quick-replies',
      method: 'GET',
      mockData: [
        'Can you help me practice pronunciation?',
        'I want to learn new words',
        'Tell me a story',
        'Let us have a conversation'
      ]
    });
  }
};

// ==================== 挑战模块 API ====================
const challengeAPI = {
  // 获取挑战关卡
  getLevels: (homeworkId) => {
    return request({
      url: `/api/challenge/${homeworkId}/levels`,
      method: 'GET',
      mockData: [
        { id: 1, name: '字母认知', icon: '🐻', x: 175, y: 100, status: 'completed' },
        { id: 2, name: '单词拼写', icon: '🦊', x: 575, y: 200, status: 'completed' },
        { id: 3, name: '听力训练', icon: '🦁', x: 175, y: 300, status: 'current' },
        { id: 4, name: '句子跟读', icon: '🐰', x: 575, y: 400, status: 'locked' },
        { id: 5, name: '综合测验', icon: '👑', x: 375, y: 500, status: 'locked' }
      ]
    });
  },

  // 获取题目
  getQuestions: (homeworkId, levelId) => {
    return request({
      url: `/api/challenge/${homeworkId}/level/${levelId}/questions`,
      method: 'GET',
      mockData: []
    });
  }
};

// ==================== 家长端 API ====================
const parentAPI = {
  // 获取子女列表
  getChildren: () => {
    return request({
      url: '/api/parent/children',
      method: 'GET',
      mockData: [
        {
          id: 1,
          name: '小明',
          avatar: 'https://picsum.photos/100/100?random=21',
          className: '三年级一班',
          todayStudyTime: '30分钟',
          status: 'completed',
          stats: {
            weeklyBooks: 12,
            weeklyChange: 20,
            readingCount: 45,
            readingChange: 15,
            avgScore: 88,
            scoreChange: 3
          }
        }
      ]
    });
  },

  // 获取孩子学习统计
  getChildStats: (childId) => {
    return request({
      url: `/api/parent/children/${childId}/stats`,
      method: 'GET',
      mockData: {
        weeklyBooks: 12,
        weeklyChange: 20,
        readingCount: 45,
        readingChange: 15,
        avgScore: 88,
        scoreChange: 3,
        todayStudyTime: '30分钟',
        status: 'completed'
      }
    });
  },

  // 获取孩子作业列表
  getChildHomework: (childId, status = 'all') => {
    return request({
      url: `/api/parent/children/${childId}/homework?status=${status}`,
      method: 'GET',
      mockData: {
        todayHomework: {
          id: 1,
          title: 'Unit 3 单词练习',
          deadline: '今天 18:00',
          questionCount: 10,
          duration: 15
        },
        pendingHomework: [
          { id: 1, title: 'Unit 3 单词练习', deadline: '今天 18:00', questionCount: 5, duration: 15, progress: 40, completed: false, score: 0 }
        ],
        completedHomework: [
          { id: 2, title: 'Unit 2 句子跟读', score: 95, stars: 5, date: '3月14日', timeSpent: '8分钟' },
          { id: 3, title: 'Unit 1 字母认知', score: 88, stars: 4, date: '3月13日', timeSpent: '12分钟' },
          { id: 4, title: 'Unit 0 入门测试', score: 92, stars: 5, date: '3月12日', timeSpent: '10分钟' }
        ],
        weeklyStats: {
          total: 8,
          completed: 6,
          avgScore: 88,
          totalTime: 120
        },
        trendData: [
          { day: '周一', score: 85 },
          { day: '周二', score: 80 },
          { day: '周三', score: 90 },
          { day: '周四', score: 88 },
          { day: '周五', score: 92 },
          { day: '周六', score: 95 },
          { day: '周日', score: 88 }
        ]
      }
    });
  },

  // 获取订单列表
  getOrders: (status = 'all') => {
    return request({
      url: `/api/parent/orders?status=${status}`,
      method: 'GET',
      mockData: [
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
    });
  },

  // 创建订单
  createOrder: (packageId, paymentMethod = 'wechat') => {
    return request({
      url: '/api/parent/orders',
      method: 'POST',
      data: { packageId, paymentMethod }
    });
  },

  // 支付订单
  payOrder: (orderId, paymentMethod = 'wechat') => {
    return request({
      url: `/api/parent/orders/${orderId}/pay`,
      method: 'POST',
      data: { paymentMethod }
    });
  },

  // 申请退款
  refundOrder: (orderId) => {
    return request({
      url: `/api/parent/orders/${orderId}/refund`,
      method: 'POST'
    });
  },

  // 获取会员状态（家长端）
  getMembershipStatus: () => {
    return request({
      url: '/api/parent/membership/status',
      method: 'GET',
      mockData: {
        isMember: true,
        level: 2,
        levelName: '白银会员',
        expireTime: '2024-12-31',
        remainingDays: 280
      }
    });
  },

  // 获取会员等级列表（家长端）
  getMembershipLevels: () => {
    return request({
      url: '/api/parent/membership/levels',
      method: 'GET',
      mockData: [
        {
          id: 1,
          name: '月度会员',
          price: 29,
          unit: '月',
          originalPrice: 39,
          popular: false,
          features: ['全部绘本无限读', 'AI跟读评分', '作业无限量', '学习报告']
        },
        {
          id: 2,
          name: '季度会员',
          price: 79,
          unit: '季',
          originalPrice: 99,
          popular: true,
          features: ['全部绘本无限读', 'AI跟读评分', '作业无限量', '学习报告', '赠送10次外教课']
        },
        {
          id: 3,
          name: '年度会员',
          price: 299,
          unit: '年',
          originalPrice: 399,
          popular: false,
          features: ['全部绘本无限读', 'AI跟读评分', '作业无限量', '学习报告', '赠送50次外教课', '专属学习规划', '家长课堂']
        }
      ]
    });
  },

  // 提醒孩子做作业
  remindHomework: (childId, homeworkId) => {
    return request({
      url: `/api/parent/children/${childId}/homework/${homeworkId}/remind`,
      method: 'POST'
    });
  },

  // 更新通知设置
  updateSettings: (settings) => {
    return request({
      url: '/api/parent/settings',
      method: 'PUT',
      data: settings
    });
  }
};

// ==================== 老师端 API ====================
const teacherAPI = {
  // 获取工作台数据
  getDashboard: () => {
    return request({
      url: '/api/teacher/dashboard',
      method: 'GET',
      mockData: {
        stats: {
          classCount: 3,
          studentCount: 45,
          bookCount: 28,
          todayHomework: 5,
          pendingReview: 3
        },
        todayTasks: [
          { id: 1, title: 'Unit 4 单词练习', type: 'homework', status: 'pending', deadline: '今天 18:00' },
          { id: 2, title: '审核学生绘本', type: 'review', status: 'pending', count: 3 },
          { id: 3, title: '上传新绘本', type: 'upload', status: 'pending' }
        ],
        recentHomework: [
          { id: 1, title: 'Unit 3 单词练习', className: '三年级一班', submitRate: 85, avgScore: 88 },
          { id: 2, title: 'Unit 2 句子跟读', className: '三年级二班', submitRate: 100, avgScore: 92 }
        ]
      }
    });
  },

  // 获取班级列表
  getClasses: () => {
    return request({
      url: '/api/teacher/classes',
      method: 'GET',
      mockData: [
        { id: 1, name: '三年级一班', studentCount: 30 },
        { id: 2, name: '三年级二班', studentCount: 28 },
        { id: 3, name: '四年级一班', studentCount: 25 },
        { id: 4, name: '四年级二班', studentCount: 27 }
      ]
    });
  },

  // ========== 题库管理 API ==========
  // 获取题目列表
  getQuestions: (params = {}) => {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    return request({
      url: `/api/teacher/questions?${queryString}`,
      method: 'GET',
      mockData: [
        {
          id: 1,
          type: 'choice',
          typeName: '选择题',
          content: 'What color is the apple?',
          options: [
            { key: 'A', value: 'Red' },
            { key: 'B', value: 'Blue' },
            { key: 'C', value: 'Yellow' },
            { key: 'D', value: 'Green' }
          ],
          correctKey: 'A',
          difficulty: 2,
          knowledgePoint: '颜色',
          usageCount: 25
        },
        {
          id: 2,
          type: 'fill_blank',
          typeName: '填空题',
          content: 'Apple 的中文意思是：___',
          difficulty: 1,
          knowledgePoint: '词汇',
          usageCount: 18
        },
        {
          id: 3,
          type: 'listening',
          typeName: '听力题',
          content: 'Listen and choose: What do you hear?',
          difficulty: 2,
          knowledgePoint: '听力理解',
          usageCount: 12
        },
        {
          id: 4,
          type: 'tracing',
          typeName: '书写题',
          content: '请描写字母 Aa',
          difficulty: 1,
          knowledgePoint: '字母',
          usageCount: 30
        }
      ]
    });
  },

  // 创建题目
  createQuestion: (questionData) => {
    return request({
      url: '/api/teacher/questions',
      method: 'POST',
      data: questionData
    });
  },

  // 更新题目
  updateQuestion: (id, questionData) => {
    return request({
      url: `/api/teacher/questions/${id}`,
      method: 'PUT',
      data: questionData
    });
  },

  // 删除题目
  deleteQuestion: (id) => {
    return request({
      url: `/api/teacher/questions/${id}`,
      method: 'DELETE'
    });
  },

  // 复制题目
  copyQuestion: (id) => {
    return request({
      url: `/api/teacher/questions/${id}/copy`,
      method: 'POST'
    });
  },

  // 批量导入题目
  importQuestions: (data) => {
    return request({
      url: '/api/teacher/questions/import',
      method: 'POST',
      data: data
    });
  },

  // ========== 作业管理 API ==========
  // 获取作业列表
  getHomeworkList: (params = {}) => {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    return request({
      url: `/api/teacher/homework?${queryString}`,
      method: 'GET',
      mockData: [
        {
          id: 1,
          title: 'Unit 3 单词练习',
          status: 'ongoing',
          statusText: '进行中',
          dateRange: '3月15日 - 3月18日',
          className: '三年级一班',
          studentCount: 30,
          submitRate: 93,
          submitted: 28,
          avgScore: 86,
          excellentCount: 12,
          needsImprovement: 3
        },
        {
          id: 2,
          title: 'Unit 2 句子跟读',
          status: 'finished',
          statusText: '已结束',
          dateRange: '3月10日 - 3月14日',
          className: '三年级一班',
          studentCount: 30,
          submitRate: 100,
          submitted: 30,
          avgScore: 92,
          excellentCount: 20,
          needsImprovement: 1
        },
        {
          id: 3,
          title: 'Unit 1 字母认知',
          status: 'finished',
          statusText: '已结束',
          dateRange: '3月5日 - 3月9日',
          className: '三年级二班',
          studentCount: 28,
          submitRate: 96,
          submitted: 27,
          avgScore: 89,
          excellentCount: 15,
          needsImprovement: 2
        }
      ]
    });
  },

  // 获取作业统计（不传 homeworkId 时返回老师汇总统计）
  getHomeworkStats: (homeworkId) => {
    const url = homeworkId
      ? `/api/teacher/homework/${homeworkId}/stats`
      : `/api/teacher/homework/stats`;
    return request({
      url,
      method: 'GET',
      mockData: {
        assigned: 12,
        submitRate: 95,
        completeRate: 88,
        avgScore: 86
      }
    });
  },

  // 获取作业详情
  getHomeworkDetail: (homeworkId) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}`,
      method: 'GET',
      mockData: {
        id: homeworkId,
        title: 'Unit 3 单词练习',
        className: '三年级一班',
        deadline: '今天 18:00',
        questions: []
      }
    });
  },

  // 创建作业
  createHomework: (homeworkData) => {
    return request({
      url: '/api/teacher/homework',
      method: 'POST',
      data: homeworkData
    });
  },

  // 更新作业
  updateHomework: (homeworkId, homeworkData) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}`,
      method: 'PUT',
      data: homeworkData
    });
  },

  // 删除作业
  deleteHomework: (homeworkId) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}`,
      method: 'DELETE'
    });
  },

  // 发布作业
  publishHomework: (homeworkId) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}/publish`,
      method: 'POST'
    });
  },

  // 保存草稿
  saveHomeworkDraft: (homeworkData) => {
    return request({
      url: '/api/teacher/homework/draft',
      method: 'POST',
      data: homeworkData
    });
  },

  // ========== 学生提交管理 API ==========
  // 获取学生提交列表
  getStudentSubmissions: (homeworkId) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}/submissions`,
      method: 'GET',
      mockData: [
        { id: 1, name: '小明', avatar: 'https://picsum.photos/200/200?random=401', score: 95, status: 'submitted' },
        { id: 2, name: '小红', avatar: 'https://picsum.photos/200/200?random=401', score: 88, status: 'submitted' },
        { id: 3, name: '小刚', avatar: 'https://picsum.photos/200/200?random=401', score: 72, status: 'submitted' },
        { id: 4, name: '小丽', avatar: 'https://picsum.photos/200/200?random=401', score: 90, status: 'submitted' }
      ]
    });
  },

  // 获取学生提交详情
  getSubmissionDetail: (homeworkId, studentId) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}/submissions/${studentId}`,
      method: 'GET',
      mockData: {
        studentId,
        studentName: '小明',
        score: 95,
        answers: [],
        submitTime: '2024-03-15 17:30'
      }
    });
  },

  // 批改作业
  gradeHomework: (homeworkId, studentId, score, feedback) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}/submissions/${studentId}/grade`,
      method: 'POST',
      data: { score, feedback }
    });
  },

  // ========== AI反馈 API ==========
  // 生成AI反馈
  generateAIFeedback: (homeworkId, studentId) => {
    return request({
      url: '/api/teacher/feedback/ai-generate',
      method: 'POST',
      data: { homeworkId, studentId }
    });
  },

  // 发送反馈
  sendFeedback: (homeworkId, studentId, feedbackData) => {
    return request({
      url: `/api/teacher/homework/${homeworkId}/feedback`,
      method: 'POST',
      data: { studentId, ...feedbackData }
    });
  }
};

// ==================== 校长端 API ====================
const principalAPI = {
  // ========== 首页数据看板 API ==========
  // 获取首页统计数据
  getDashboardStats: () => {
    return request({
      url: '/api/principal/dashboard/stats',
      method: 'GET',
      mockData: {
        totalStudents: 286,
        todayHomework: 45,
        avgScore: 87.5,
        activeRate: 92
      }
    });
  },

  // 获取班级排名
  getClassRankings: (type = 'score') => {
    return request({
      url: `/api/principal/dashboard/rankings?type=${type}`,
      method: 'GET',
      mockData: {
        score: [
          { id: 1, name: '三年级一班', teacher: '李老师', value: '92分' },
          { id: 2, name: '三年级二班', teacher: '王老师', value: '89分' },
          { id: 3, name: '四年级一班', teacher: '张老师', value: '88分' },
          { id: 4, name: '四年级二班', teacher: '赵老师', value: '85分' },
          { id: 5, name: '五年级一班', teacher: '刘老师', value: '82分' }
        ],
        completion: [
          { id: 1, name: '三年级一班', teacher: '李老师', value: '98%' },
          { id: 2, name: '四年级一班', teacher: '张老师', value: '95%' },
          { id: 3, name: '三年级二班', teacher: '王老师', value: '92%' },
          { id: 4, name: '四年级二班', teacher: '赵老师', value: '88%' },
          { id: 5, name: '五年级一班', teacher: '刘老师', value: '85%' }
        ],
        activity: [
          { id: 1, name: '三年级二班', teacher: '王老师', value: '95%' },
          { id: 2, name: '三年级一班', teacher: '李老师', value: '92%' },
          { id: 3, name: '四年级一班', teacher: '张老师', value: '90%' },
          { id: 4, name: '五年级一班', teacher: '刘老师', value: '88%' },
          { id: 5, name: '四年级二班', teacher: '赵老师', value: '85%' }
        ]
      }
    });
  },

  // ========== 教师管理 API ==========
  // 获取教师列表
  getTeachers: () => {
    return request({
      url: '/api/principal/teachers',
      method: 'GET',
      mockData: [
        { id: 1, name: '李老师', role: '班主任', className: '三年级一班', studentCount: 30, homeworkCount: 45, rating: 4.8, avatar: 'https://picsum.photos/200/200?random=301' },
        { id: 2, name: '王老师', role: '班主任', className: '三年级二班', studentCount: 28, homeworkCount: 42, rating: 4.7, avatar: 'https://picsum.photos/200/200?random=301' },
        { id: 3, name: '张老师', role: '任课老师', className: '四年级', studentCount: 56, homeworkCount: 38, rating: 4.9, avatar: 'https://picsum.photos/200/200?random=301' },
        { id: 4, name: '赵老师', role: '班主任', className: '四年级二班', studentCount: 32, homeworkCount: 40, rating: 4.6, avatar: 'https://picsum.photos/200/200?random=301' }
      ]
    });
  },

  // 获取教师统计
  getTeacherStats: () => {
    return request({
      url: '/api/principal/teachers/stats',
      method: 'GET',
      mockData: {
        totalCount: 15,
        activeCount: 14,
        classCount: 12
      }
    });
  },

  // 添加教师
  addTeacher: (teacherData) => {
    return request({
      url: '/api/principal/teachers',
      method: 'POST',
      data: teacherData
    });
  },

  // 更新教师信息
  updateTeacher: (id, teacherData) => {
    return request({
      url: `/api/principal/teachers/${id}`,
      method: 'PUT',
      data: teacherData
    });
  },

  // 删除教师
  deleteTeacher: (id) => {
    return request({
      url: `/api/principal/teachers/${id}`,
      method: 'DELETE'
    });
  },

  // ========== 校区管理 API ==========
  // 获取校区列表
  getCampuses: () => {
    return request({
      url: '/api/principal/campuses',
      method: 'GET',
      mockData: [
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
      ]
    });
  },

  // 添加校区
  addCampus: (campusData) => {
    return request({
      url: '/api/principal/campuses',
      method: 'POST',
      data: campusData
    });
  },

  // 更新校区信息
  updateCampus: (id, campusData) => {
    return request({
      url: `/api/principal/campuses/${id}`,
      method: 'PUT',
      data: campusData
    });
  },

  // 删除校区
  deleteCampus: (id) => {
    return request({
      url: `/api/principal/campuses/${id}`,
      method: 'DELETE'
    });
  },

  // 切换校区状态
  toggleCampusStatus: (id) => {
    return request({
      url: `/api/principal/campuses/${id}/toggle-status`,
      method: 'POST'
    });
  },

  // ========== 运营报表 API ==========
  // 获取运营报表数据
  getOperationReport: (timeType = 'week') => {
    return request({
      url: `/api/principal/reports/operation?timeType=${timeType}`,
      method: 'GET',
      mockData: {
        week: {
          trendData: [60, 75, 65, 80, 90, 85, 95],
          chartLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          income: { total: '128,500', new: '15,800', renewal: 85 },
          users: { newStudent: 45, newParent: 38, active: 92 }
        },
        month: {
          trendData: [65, 72, 78, 82, 75, 88, 92, 85, 90, 95],
          chartLabels: ['第1周', '第2周', '第3周', '第4周'],
          income: { total: '520,000', new: '68,000', renewal: 88 },
          users: { newStudent: 186, newParent: 152, active: 88 }
        },
        year: {
          trendData: [45, 52, 65, 72, 78, 85, 92],
          chartLabels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
          income: { total: '2,850,000', new: '380,000', renewal: 92 },
          users: { newStudent: 856, newParent: 720, active: 95 }
        }
      }[timeType]
    });
  },

  // 导出运营报表
  exportOperationReport: (timeType) => {
    return request({
      url: '/api/principal/reports/operation/export',
      method: 'POST',
      data: { timeType }
    });
  },

  // ========== 收入报表 API ==========
  // 获取收入报表数据
  getIncomeReport: (timeType = 'day', date = '') => {
    const queryString = date ? `?timeType=${timeType}&date=${date}` : `?timeType=${timeType}`;
    return request({
      url: `/api/principal/reports/income${queryString}`,
      method: 'GET',
      mockData: {
        day: {
          overview: { total: '12,850', change: 15, orderCount: 156, avgPrice: 82 },
          trendData: [
            { label: '周一', value: 1200, percent: 60 },
            { label: '周二', value: 1500, percent: 75 },
            { label: '周三', value: 1800, percent: 90 },
            { label: '周四', value: 1400, percent: 70 },
            { label: '周五', value: 2100, percent: 100 },
            { label: '周六', value: 1950, percent: 95 },
            { label: '周日', value: 1650, percent: 80 }
          ],
          composition: [
            { id: 1, name: '会员订阅', icon: 'diamond', amount: '8,500', percent: 66 },
            { id: 2, name: '课时购买', icon: 'clock', amount: '3,200', percent: 25 },
            { id: 3, name: '绘本销售', icon: 'book', amount: '1,150', percent: 9 }
          ],
          details: [
            { id: 1, title: '季度会员', desc: '小明家长', amount: 79, icon: 'diamond', time: '14:30' },
            { id: 2, title: '年度会员', desc: '小红家长', amount: 299, icon: 'diamond', time: '13:15' },
            { id: 3, title: '10课时包', desc: '小刚家长', icon: 'clock', amount: 299, time: '11:20' },
            { id: 4, title: '月度会员', desc: '小丽家长', amount: 29, icon: 'diamond', time: '10:05' },
            { id: 5, title: '绘本套装', desc: '小小明家长', amount: 99, icon: 'book', time: '09:30' }
          ]
        },
        week: {
          overview: { total: '89,600', change: 12, orderCount: 892, avgPrice: 100 },
          trendData: [
            { label: '第1周', value: 21000, percent: 85 },
            { label: '第2周', value: 24500, percent: 100 },
            { label: '第3周', value: 19800, percent: 80 },
            { label: '第4周', value: 24300, percent: 99 }
          ]
        },
        month: {
          overview: { total: '385,200', change: 18, orderCount: 3560, avgPrice: 108 },
          trendData: [
            { label: '第1周', value: 85000, percent: 80 },
            { label: '第2周', value: 98000, percent: 92 },
            { label: '第3周', value: 105000, percent: 100 },
            { label: '第4周', value: 97200, percent: 92 }
          ]
        },
        year: {
          overview: { total: '2,156,800', change: 25, orderCount: 18650, avgPrice: 116 },
          trendData: [
            { label: '1月', value: 156000, percent: 70 },
            { label: '2月', value: 189000, percent: 85 },
            { label: '3月', value: 245000, percent: 100 }
          ]
        }
      }[timeType]
    });
  },

  // ========== 财务报表 API ==========
  // 获取财务报表数据
  getFinanceReport: (period = 'month') => {
    return request({
      url: `/api/principal/reports/finance?period=${period}`,
      method: 'GET',
      mockData: {
        month: {
          finance: {
            income: '385,200',
            incomeChange: 18,
            expense: '156,800',
            expenseChange: 8,
            profit: '228,400',
            profitChange: 25
          },
          trend: { incomePercent: 75, expensePercent: 45, labels: ['1月', '2月', '3月'] },
          expenses: [
            { id: 1, name: '教师工资', desc: '25名教师薪酬', amount: '95,000', icon: 'teacher' },
            { id: 2, name: '房租水电', desc: '3个校区场地费用', amount: '28,000', icon: 'home' },
            { id: 3, name: '市场推广', desc: '广告投放、活动费用', amount: '18,500', icon: 'promotion' },
            { id: 4, name: '技术维护', desc: '系统维护、服务器', amount: '8,800', icon: 'tech' },
            { id: 5, name: '教材采购', desc: '绘本、教材采购', amount: '6,500', icon: 'book' }
          ]
        },
        quarter: {
          finance: {
            income: '1,156,800',
            incomeChange: 22,
            expense: '468,500',
            expenseChange: 12,
            profit: '688,300',
            profitChange: 30
          },
          trend: { incomePercent: 85, expensePercent: 55, labels: ['Q1', 'Q2', 'Q3'] }
        },
        year: {
          finance: {
            income: '4,528,600',
            incomeChange: 35,
            expense: '1,856,200',
            expenseChange: 15,
            profit: '2,672,400',
            profitChange: 48
          },
          trend: { incomePercent: 95, expensePercent: 60, labels: ['2022', '2023', '2024'] }
        }
      }[period]
    });
  },

  // 导出财务报表
  exportFinanceReport: (period) => {
    return request({
      url: '/api/principal/reports/finance/export',
      method: 'POST',
      data: { period }
    });
  }
};

module.exports = {
  // 基础方法
  request,
  checkLogin,

  // API模块
  auth: authAPI,
  membership: membershipAPI,
  book: bookAPI,
  homework: homeworkAPI,
  stats: statsAPI,
  chat: chatAPI,
  challenge: challengeAPI,
  parent: parentAPI,
  teacher: teacherAPI,
  principal: principalAPI
};
