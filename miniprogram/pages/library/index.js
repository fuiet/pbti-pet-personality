const portraits = require('../../utils/portraits');
const api = require('../../utils/api');

Page({
  data: {
    items: [],
    source: 'local',
    deleting: false,
    deleteTarget: null
  },

  async onShow() {
    const pet = getApp().globalData.pet || wx.getStorageSync('pbti_pet') || null;
    const localItems = portraits.list();
    this.setData({ items: localItems, source: 'local' });

    if (!api.isReady() || !pet || !pet.id || String(pet.id).startsWith('pet_')) {
      return;
    }

    try {
      const res = await api.listPortraits(pet.id);
      const remoteItems = Array.isArray(res && res.portraits)
        ? res.portraits.map((item) => ({
            id: item.id,
            url: item.image_url,
            template: item.style_name,
            prompt: '云端已生成写真',
            petName: res.petName || pet.name || '宠物',
            species: pet.species || 'dog',
            code: 'PBTI',
            personality: '云端写真',
            createdAt: item.created_at || Date.now(),
            createdLabel: item.created_at ? String(item.created_at).replace('T', ' ').slice(0, 16) : '',
            source: 'cloud'
          }))
        : [];

      if (remoteItems.length) {
        this.setData({ items: remoteItems, source: 'cloud' });
      }
    } catch (_) {
      this.setData({ items: localItems, source: 'local' });
    }
  },

  preview(e) {
    const current = e.currentTarget.dataset.url;
    const urls = this.data.items.map((item) => item.url);
    wx.previewImage({ current, urls });
  },

  remove(e) {
    const index = e.currentTarget.dataset.i;
    const item = this.data.items[index];
    if (!item || this.data.deleting) return;

    wx.showModal({
      title: '删除写真',
      content: `确定要删除 ${item.petName} 的这张写真吗？`,
      confirmText: '删除',
      success: async (res) => {
        if (!res.confirm) return;
        this.setData({ deleting: true, deleteTarget: item.id });
        try {
          if (api.isReady() && !String(item.id).startsWith('portrait_')) {
            await api.deleteItem({ action: 'portrait', portraitId: item.id });
          }

          const nextItems = this.data.items.filter((portrait) => portrait.id !== item.id);
          portraits.replace(nextItems);
          this.setData({ items: nextItems });
          wx.showToast({ title: '已删除', icon: 'success' });
        } catch (error) {
          wx.showToast({ title: error instanceof Error ? error.message : '删除失败', icon: 'none' });
        } finally {
          this.setData({ deleting: false, deleteTarget: null });
        }
      }
    });
  }
});
