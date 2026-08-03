const { loadLatestResult, saveLatestResult } = require("../../utils/storage");
const { getLatestTestRecord, getUserProfile, listPortraitAssets } = require("../../utils/cloud");

Page({
  data: {
    latestResult: null,
    userName: "微信用户",
    userAvatar: "/logo.jpg",
    portraitAssets: [],
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && typeof tabBar.setData === "function") {
      tabBar.setData({ selected: 2 });
    }

    getUserProfile()
      .then((res) => {
        const profile = res?.user;
        if (!profile) return;
        this.setData({
          userName: profile.nickName || "微信用户",
          userAvatar: profile.avatarUrl || "/logo.jpg",
        });
      })
      .catch(() => {});

    getLatestTestRecord()
      .then((res) => {
        if (res?.latest) {
          const latestResult = {
            testContext: res.latest.testContext,
            answers: res.latest.answers,
            result: res.latest.result,
            testId: res.latest.id,
          };
          saveLatestResult(latestResult);
          getApp().globalData.latestResult = latestResult;
          this.setData({ latestResult });
          return;
        }
        this.setData({ latestResult: loadLatestResult() });
      })
      .catch(() => {
        this.setData({ latestResult: loadLatestResult() });
      });

    this.refreshPortraitAssets();
  },

  refreshPortraitAssets() {
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

  openReport() {
    wx.navigateTo({ url: "/pages/report/index" });
  },

  openPortraitStudio() {
    wx.switchTab({ url: "/pages/portraits/index" });
  },

  openPortraitLibrary() {
    wx.navigateTo({ url: "/pages/library/index" });
  },
});
