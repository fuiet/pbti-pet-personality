const { heroImages } = require("../../utils/imageAssets");
const { loadLatestResult, removeLatestResult } = require("../../utils/storage");
const { getLatestTestRecord, deleteLatestTestRecord } = require("../../utils/cloud");

function buildChapters(payload) {
  const species = payload?.testContext?.species || "cat";
  const personality = payload?.result?.personality || { name: "Unknown", traits: [] };

  return [
    {
      title: "1. Pet identification",
      body: `This report uses the three uploaded photos for visual identification. The default reference is ${species === "dog" ? "dog" : "cat"} traits, not bloodline, health, or legal judgment.`,
    },
    {
      title: "2. Personality tags",
      body: `The closest match is ${personality.name}. Core traits include ${personality.traits.join(" / ")}.`,
    },
    {
      title: "3. Attachment vs independence",
      body: "This section explains whether the pet prefers company or enjoys being alone more.",
    },
    {
      title: "4. Exploration vs stability",
      body: "This section describes how it responds to new environments, toys, and routes.",
    },
    {
      title: "5. Energy and calmness",
      body: "This section describes excitement, activity rhythm, and emotional swings.",
    },
    {
      title: "6. Playfulness and guarding",
      body: "This section describes whether it acts more like a playmate or an observant guardian.",
    },
    {
      title: "7. Interaction advice",
      body: "This section expands into daily interaction, training style, and soothing suggestions.",
    },
    {
      title: "8. Love language",
      body: "This section explains the interaction style that makes the pet feel the safest and most loved.",
    },
    {
      title: "9. Portrait style guide",
      body: "This section connects the PBTI type to AI portrait prompt directions and theme choices.",
    },
    {
      title: "10. Important note",
      body: "This service offers reference-only observation and identification. It does not replace veterinary diagnosis or legal judgment.",
    },
  ];
}

Page({
  data: {
    heroImages,
    payload: null,
    chapters: [],
  },

  onShow() {
    const applyPayload = (payload) => {
      if (!payload) {
        wx.redirectTo({ url: "/pages/home/index" });
        return;
      }

      this.setData({
        payload,
        chapters: buildChapters(payload),
      });
    };

    getLatestTestRecord()
      .then((res) => {
        if (res?.latest) {
          const payload = {
            testContext: res.latest.testContext,
            answers: res.latest.answers,
            result: res.latest.result,
            testId: res.latest.id,
          };
          getApp().globalData.latestResult = payload;
          removeLatestResult();
          applyPayload(payload);
          return;
        }

        applyPayload(getApp().globalData.latestResult || loadLatestResult());
      })
      .catch(() => {
        applyPayload(getApp().globalData.latestResult || loadLatestResult());
      });
  },

  deleteReport() {
    wx.showModal({
      title: "Delete this report?",
      content: "After deletion, the cloud and local test record will be cleared and cannot be restored directly.",
      confirmText: "Delete",
      confirmColor: "#ef4444",
      success: (res) => {
        if (!res.confirm) return;

        const testId = this.data.payload?.testId;
        const finish = () => {
          removeLatestResult();
          getApp().globalData.latestResult = null;
          wx.showToast({ title: "Deleted", icon: "success" });
          wx.redirectTo({ url: "/pages/account/index" });
        };

        if (!testId) {
          finish();
          return;
        }

        deleteLatestTestRecord(testId)
          .catch(() => {})
          .finally(() => {
            finish();
          });
      },
    });
  },

  onShareAppMessage() {
    const personality = this.data.payload?.result?.personality;
    return {
      title: personality ? `${personality.name} test report` : "PBTI Pet Test Report",
      path: "/pages/home/index",
      imageUrl: "/logo.jpg",
    };
  },
});
