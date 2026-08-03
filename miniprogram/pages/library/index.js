const { listPortraitAssets } = require("../../utils/cloud");

Page({
  data: {
    portraitAssets: [],
  },

  onShow() {
    this.loadAssets();
  },

  loadAssets() {
    listPortraitAssets()
      .then((res) => {
        this.setData({
          portraitAssets: res?.assets || [],
        });
      })
      .catch(() => {
        this.setData({ portraitAssets: [] });
      });
  },

  previewPortrait(e) {
    const current = e.currentTarget.dataset.url;
    if (!current) return;
    wx.previewImage({
      current,
      urls: this.data.portraitAssets.map((item) => item.imageUrl).filter(Boolean),
    });
  },

  openPortraitStudio() {
    wx.switchTab({ url: "/pages/portraits/index" });
  },
});
