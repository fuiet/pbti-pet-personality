const { generatePetReport } = require('../../utils/report');
const { buildSharePayload } = require('../../utils/share');

Page({
  data: {
    r: null,
    report: null,
    sharePayload: null
  },

  onLoad() {
    const r = getApp().globalData.result || wx.getStorageSync('pbti_result');
    if (!r) return;

    this.setData({
      r,
      report: generatePetReport(r),
      sharePayload: buildSharePayload(r)
    });
  },

  portraits() {
    wx.switchTab({ url: '/pages/portraits/index' });
  },

  saveShareCard() {
    if (!this.data.sharePayload) return;
    wx.setStorageSync('pbti_share_card', this.data.sharePayload.card);
    wx.navigateTo({ url: '/pages/sharecard/index' });
  },

  onShareAppMessage() {
    const payload = this.data.sharePayload;
    if (payload) {
      return {
        title: `${payload.card.petName} 的 PBTI 完整报告`,
        path: payload.path,
        imageUrl: payload.imageUrl
      };
    }

    return {
      title: 'PBTI 完整报告',
      path: '/pages/home/index'
    };
  }
});
