const { heroImages } = require("../../utils/imageAssets");
const { loadLatestResult, saveLatestResult } = require("../../utils/storage");
const { getLatestTestRecord } = require("../../utils/cloud");

function buildShareSummary(payload) {
  const personality = payload?.result?.personality;
  const code = payload?.result?.code;
  if (!personality || !code) return "";
  return `${personality.name} · ${code}`;
}

Page({
  data: {
    heroImages,
    payload: null,
    previewChapters: [],
    shareSummary: "",
    scoreHighlights: [],
  },

  onShow() {
    const applyPayload = (payload) => {
      if (!payload) {
        wx.redirectTo({ url: "/pages/home/index" });
        return;
      }

      saveLatestResult(payload);
      getApp().globalData.latestResult = payload;
      this.setData({
        payload,
        previewChapters: [
          "1. Pet identification overview",
          "2. Personality portrait",
          "3. Family interaction advice",
        ],
        shareSummary: buildShareSummary(payload),
        scoreHighlights: [
          { label: "28", text: "behavior questions" },
          { label: "12", text: "personality types" },
          { label: "10", text: "report chapters" },
        ],
      });
    };

    getLatestTestRecord()
      .then((res) => {
        if (res?.latest) {
          applyPayload({
            testContext: res.latest.testContext,
            answers: res.latest.answers,
            result: res.latest.result,
            testId: res.latest.id,
          });
          return;
        }

        applyPayload(getApp().globalData.latestResult || loadLatestResult());
      })
      .catch(() => {
        applyPayload(getApp().globalData.latestResult || loadLatestResult());
      });
  },

  unlockReport() {
    wx.navigateTo({ url: "/pages/report/index" });
  },

  openPortraits() {
    wx.navigateTo({ url: "/pages/portraits/index" });
  },

  backToUpload() {
    wx.navigateBack({ delta: 1 });
  },

  restartTest() {
    wx.redirectTo({ url: "/pages/upload/index" });
  },

  saveShareImage() {
    wx.showToast({
      title: "Share poster ready",
      icon: "none",
    });
  },

  onShareAppMessage() {
    const personality = this.data.payload?.result?.personality;
    return {
      title: personality ? `My pet is ${personality.name}` : "PBTI Pet Personality Test",
      path: "/pages/home/index",
      imageUrl: "/logo.jpg",
    };
  },
});
