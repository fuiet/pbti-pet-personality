const api = require('../../utils/api');
const history = require('../../utils/history');
const portraits = require('../../utils/portraits');

Page({
  data: {
    user: null,
    pet: null,
    history: [],
    portraits: [],
    portraitCount: 0,
    historySource: 'local',
    deleting: false
  },

  async onShow() {
    let user = getApp().globalData.user;
    if (!user) user = await getApp().login();

    const localHistory = history.all();
    const localPortraits = portraits.list();
    this.setData({
      user,
      pet: getApp().globalData.pet || wx.getStorageSync('pbti_pet'),
      history: localHistory,
      portraits: localPortraits,
      portraitCount: localPortraits.length,
      historySource: 'local'
    });

    if (!api.isReady()) return;

    try {
      const res = await api.listQuizResults();
      const remoteHistory = Array.isArray(res && res.records)
        ? res.records.map((item) => history.normalizeRemoteRecord(item)).filter(Boolean)
        : [];

      if (remoteHistory.length) {
        history.replace(remoteHistory);
        this.setData({
          history: remoteHistory,
          historySource: 'cloud'
        });
      }
    } catch (_) {
      // 云端历史读取失败时保留本地记录。
    }
  },

  open(e) {
    const record = this.data.history[e.currentTarget.dataset.i];
    if (!record) return;
    wx.setStorageSync('pbti_result', record);
    getApp().globalData.result = record;
    wx.navigateTo({ url: '/pages/result/index' });
  },

  previewPortrait(e) {
    const index = e.currentTarget.dataset.i;
    const item = this.data.portraits[index];
    if (!item) return;
    wx.previewImage({ current: item.url, urls: this.data.portraits.map((portrait) => portrait.url) });
  },

  newTest() {
    wx.navigateTo({ url: '/pages/create/index' });
  },

  openDashboard() {
    wx.navigateTo({ url: '/pages/dashboard/index' });
  },

  openLogin() {
    wx.navigateTo({ url: '/pages/login/index' });
  },

  openPortraitStudio() {
    wx.switchTab({ url: '/pages/portraits/index' });
  },

  removeRecord(e) {
    const record = this.data.history[e.currentTarget.dataset.i];
    if (!record || this.data.deleting) return;

    wx.showModal({
      title: '删除报告',
      content: `确定要删除 ${record.pet.name} 的这份报告吗？`,
      confirmText: '删除',
      success: async (res) => {
        if (!res.confirm) return;
        this.setData({ deleting: true });
        try {
          await api.deleteItem({ action: 'report', recordId: record.id });
          const next = this.data.history.filter((item) => item.id !== record.id);
          history.replace(next);
          this.setData({ history: next });
        } catch (error) {
          wx.showToast({ title: error instanceof Error ? error.message : '删除失败', icon: 'none' });
        } finally {
          this.setData({ deleting: false });
        }
      }
    });
  },

  removePet() {
    const pet = this.data.pet;
    if (!pet || this.data.deleting) return;

    wx.showModal({
      title: '删除宠物档案',
      content: `确定要删除 ${pet.name} 的档案吗？这会连同相关报告和写真一起清理。`,
      confirmText: '删除',
      success: async (res) => {
        if (!res.confirm) return;
        this.setData({ deleting: true });
        try {
          await api.deleteItem({ action: 'pet', petId: pet.id });
          wx.removeStorageSync('pbti_pet');
          getApp().globalData.pet = null;
          history.replace([]);
          wx.removeStorageSync('pbti_result');
          this.setData({
            pet: null,
            history: [],
            portraits: [],
            portraitCount: 0
          });
        } catch (error) {
          wx.showToast({ title: error instanceof Error ? error.message : '删除失败', icon: 'none' });
        } finally {
          this.setData({ deleting: false });
        }
      }
    });
  }
});
