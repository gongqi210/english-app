// pages/student/book-read/book-read.js
const app = getApp();
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    bookId: '',
    book: {},
    currentPage: 1,
    totalPages: 10,
    pages: [],
    isPlaying: false,
    isRecording: false,
    playbackSpeed: 1,
    showSpeedMenu: false,
    progress: 0,
    currentTime: '0:00',
    duration: '1:30'
  },

  onLoad(options) {
    const { id, page } = options;
    this.setData({
      bookId: id,
      currentPage: parseInt(page) || 1
    });
    this.loadBookData(id);
    this.initRecorder();
    this.initAudio();
  },

  onUnload() {
    innerAudioContext.stop();
    recorderManager.stop();
  },

  loadBookData(id) {
    const books = app.globalData.mockData.books;
    const book = books.find(b => b.id === id);

    // 生成模拟页面数据
    const pages = [];
    for (let i = 1; i <= 10; i++) {
      pages.push({
        pageNo: i,
        sentences: [
          { text: 'It is only with the heart that one can see rightly;', phonetic: '/wɪð/' },
          { text: 'what is essential is invisible to the eye.', phonetic: '/aɪ/'}
        ]
      });
    }

    this.setData({
      book: book || {},
      totalPages: 10,
      pages
    });
  },

  initRecorder() {
    recorderManager.onStop((res) => {
      this.handleRecordComplete(res.tempFilePath);
    });

    recorderManager.onError((res) => {
      wx.showToast({ title: '录音失败', icon: 'none' });
    });
  },

  initAudio() {
    innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false, progress: 100 });
    });

    innerAudioContext.onTimeUpdate(() => {
      const progress = (innerAudioContext.currentTime / innerAudioContext.duration) * 100;
      this.setData({
        progress,
        currentTime: this.formatTime(innerAudioContext.currentTime)
      });
    });
  },

  // 格式化时间
  formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  },

  // 页面切换
  onPageChange(e) {
    const current = e.detail.current + 1;
    this.setData({ currentPage: current });
  },

  // 上一页
  prevPage() {
    if (this.data.currentPage > 1) {
      this.setData({ currentPage: this.data.currentPage - 1 });
    }
  },

  // 下一页
  nextPage() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({ currentPage: this.data.currentPage + 1 });
    }
  },

  // 跳转指定页
  goToPage(e) {
    const page = e.currentTarget.dataset.page;
    this.setData({ currentPage: page });
  },

  // 播放/暂停
  togglePlay() {
    this.setData({ isPlaying: !this.data.isPlaying });
  },

  // 拖动进度条
  onSeek(e) {
    const value = e.detail.value;
    const seekTime = (value / 100) * innerAudioContext.duration;
    innerAudioContext.seek(seekTime);
  },

  // 切换语速菜单
  toggleSpeedMenu() {
    this.setData({ showSpeedMenu: !this.data.showSpeedMenu });
  },

  // 设置语速
  setSpeed(e) {
    const speed = parseFloat(e.currentTarget.dataset.speed);
    this.setData({
      playbackSpeed: speed,
      showSpeedMenu: false
    });
    innerAudioContext.playbackRate = speed;
  },

  // 开始录音
  startRecord() {
    this.setData({ isRecording: true });
    recorderManager.start({
      format: 'm4a',
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000
    });
    wx.vibrateShort();
  },

  // 停止录音
  stopRecord() {
    this.setData({ isRecording: false });
    recorderManager.stop();
  },

  // 录音完成
  handleRecordComplete(filePath) {
    wx.showLoading({ title: '评分中...' });

    // 模拟评分延迟
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: `/pages/student/reading/reading?bookId=${this.data.bookId}&page=${this.data.currentPage}`
      });
    }, 2000);
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
