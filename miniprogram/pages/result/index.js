const { buildSharePayload } = require('../../utils/share');

Page({
  data: {
    record: null,
    p: null,
    dimensionRows: [],
    sharePayload: null
  },

  onShow() {
    const record = getApp().globalData.result || wx.getStorageSync('pbti_result');
    if (!record) {
      wx.redirectTo({ url: '/pages/home/index' });
      return;
    }

    const labels = ['亲密', '探索', '活力', '玩心'];
    const dimensionRows = (record.result.dimensions || []).map((value, index) => ({
      label: labels[index] || `维度 ${index + 1}`,
      value
    }));

    this.setData({
      record,
      p: record.result.personality,
      dimensionRows,
      sharePayload: buildSharePayload(record)
    });
  },

  report() {
    wx.navigateTo({ url: '/pages/preparing/index' });
  },

  adUnlock() {
    wx.showModal({
      title: '完整报告已开放',
      content: '正式上线后，这里会接入激励视频广告。用户看完即可解锁完整报告，不需要付费。',
      showCancel: false,
      success: () => this.report()
    });
  },

  saveShareCard() {
    const payload = this.data.sharePayload;
    if (!payload) return;
    wx.setStorageSync('pbti_share_card', payload.card);
    wx.navigateTo({ url: '/pages/sharecard/index' });
  },

  onShareAppMessage() {
    const payload = this.data.sharePayload;
    if (payload) {
      return {
        title: payload.title,
        path: payload.path,
        imageUrl: payload.imageUrl
      };
    }

    return {
      title: '测测你家宠物是哪种 PBTI 性格',
      path: '/pages/home/index'
    };
  }
});
