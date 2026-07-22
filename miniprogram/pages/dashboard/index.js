const history = require('../../utils/history');
const portraits = require('../../utils/portraits');

Page({
  data: {
    history: [],
    petCount: 0,
    portraitCount: 0,
    latestPet: null
  },

  onShow() {
    const records = history.all();
    const pets = records.map((item) => item.pet).filter(Boolean);
    const latestPet = pets[0] || null;

    this.setData({
      history: records.slice(0, 5),
      petCount: pets.length,
      portraitCount: portraits.list().length,
      latestPet
    });
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/create/index' });
  },

  goTypes() {
    wx.navigateTo({ url: '/pages/types/index' });
  },

  goAccount() {
    wx.switchTab({ url: '/pages/account/index' });
  },

  openReport(e) {
    const record = this.data.history[e.currentTarget.dataset.i];
    if (!record) return;
    wx.setStorageSync('pbti_result', record);
    getApp().globalData.result = record;
    wx.navigateTo({ url: '/pages/result/index' });
  }
});
