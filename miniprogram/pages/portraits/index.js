const cloud = require('../../utils/cloud');

Page({
  data: {
    generating: false,
    result: null
  },

  generate() {
    if (this.data.generating) return;
    this.setData({ generating: true });

    cloud.callFunction('generatePortrait', {
      mode: 'create',
      petType: 'cat',
      prompt: '云开发测试'
    }).then((res) => {
      this.setData({
        generating: false,
        result: res.result || null
      });
      wx.showToast({ title: '已调用云函数', icon: 'none' });
    }).catch((error) => {
      this.setData({ generating: false });
      wx.showModal({
        title: '云开发调用失败',
        content: error instanceof Error ? error.message : '请检查云函数是否已部署。',
        showCancel: false
      });
    });
  }
});
