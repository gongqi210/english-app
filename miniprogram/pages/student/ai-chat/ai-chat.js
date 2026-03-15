// pages/student/ai-chat/ai-chat.js
const app = getApp();

Page({
  data: {
    messages: [
      { id: 1, role: 'ai', content: "Hello! I'm your English learning assistant. Let's practice English together! What would you like to learn today?" }
    ],
    inputValue: '',
    isTyping: false,
    userInfo: {},
    quickReplies: [
      'Can you help me practice pronunciation?',
      'I want to learn new words',
      'Tell me a story',
      'Let us have a conversation'
    ],
    suggestedTopics: [
      { id: 1, title: 'Daily Conversation', icon: '💬' },
      { id: 2, title: 'Vocabulary', icon: '📝' },
      { id: 3, title: 'Grammar', icon: '📖' },
      { id: 4, title: 'Pronunciation', icon: '🎤' }
    ]
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.mockData.currentUser || { name: '小明' }
    });
  },

  handleInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  sendMessage() {
    const { inputValue, messages } = this.data;
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];

    this.setData({
      messages: newMessages,
      inputValue: '',
      isTyping: true
    });

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = this.generateAIResponse(inputValue);
      this.setData({
        messages: [...this.data.messages, aiResponse],
        isTyping: false
      });
    }, 1500);
  },

  generateAIResponse(input) {
    const responses = {
      default: [
        "Great! Let's practice more. Can you repeat after me?",
        "Excellent! You're making good progress. Keep it up!",
        "That's very good! Do you want to try something more challenging?",
        "Well done! Remember, practice makes perfect."
      ],
      pronunciation: [
        "Let's practice pronunciation! Please repeat after me: The quick brown fox jumps over the lazy dog.",
        "Good try! Listen carefully to my pronunciation and try again.",
        "Your pronunciation is improving! Keep practicing every day."
      ],
      vocabulary: [
        "Great choice! Let me teach you some new words. 'Adventure' means 冒险 - an exciting experience.",
        "Learning new words is important! Let's learn 5 new words related to this topic.",
        "Excellent! The more words you know, the better you can express yourself."
      ],
      story: [
        "Once upon a time, there was a little prince who lived on a tiny planet...",
        "Let me tell you an interesting English story. Once upon a time in a magical forest...",
        "Great choice! Here's a short story in English for you..."
      ]
    };

    let key = 'default';
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('pronunciation') || lowerInput.includes('发音') || lowerInput.includes('读')) {
      key = 'pronunciation';
    } else if (lowerInput.includes('word') || lowerInput.includes('词汇') || lowerInput.includes('单词')) {
      key = 'vocabulary';
    } else if (lowerInput.includes('story') || lowerInput.includes('故事')) {
      key = 'story';
    }

    const options = responses[key];
    const randomResponse = options[Math.floor(Math.random() * options.length)];
    return { id: Date.now() + 1, role: 'ai', content: randomResponse };
  },

  // 快捷回复
  onQuickReply(e) {
    const reply = e.currentTarget.dataset.reply;
    this.setData({ inputValue: reply });
    this.sendMessage();
  },

  // 主题选择
  onTopicSelect(e) {
    const topicId = e.currentTarget.dataset.id;
    const topics = {
      1: 'Great! Let us start a daily conversation. How was your day today?',
      2: 'Excellent choice! Let us learn some new vocabulary. What topic are you interested in?',
      3: 'Good! Grammar is important. Which grammar point would you like to practice?',
      4: "Let's practice pronunciation! Please listen carefully and repeat after me."
    };
    const message = topics[topicId];
    this.setData({ inputValue: message });
    this.sendMessage();
  },

  startVoice() {
    wx.showModal({
      title: '语音输入',
      content: '语音输入功能开发中，是否继续使用键盘输入？',
      success: (res) => {
        if (!res.confirm) {
          this.setData({ inputValue: '' });
        }
      }
    });
  },

  // 清空对话
  clearChat() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空所有对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            messages: [
              { id: 1, role: 'ai', content: "Hello! I'm your English learning assistant. Let's practice English together!" }
            ]
          });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
