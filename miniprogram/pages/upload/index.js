const { APP_CONFIG } = require("../../utils/constants");
const { heroImages } = require("../../utils/imageAssets");
const { saveTestContext, loadTestContext } = require("../../utils/storage");
const { uploadToCloud, saveFileRecord } = require("../../utils/cloud");

Page({
  data: {
    heroImages,
    testContext: {
      species: "cat",
    },
    photoSlots: [
      { key: "front", label: "正面照", path: "", uploading: false, cloudFileId: "" },
      { key: "left", label: "左侧照", path: "", uploading: false, cloudFileId: "" },
      { key: "right", label: "右侧照", path: "", uploading: false, cloudFileId: "" },
    ],
    uploadProgress: 0,
  },

  onShow() {
    const testContext = getApp().globalData.currentTestContext || loadTestContext();
    if (!testContext) return;

    const mergedSlots = (testContext.photoSlots || this.data.photoSlots).map((slot, index) => (
      slot.path ? slot : this.data.photoSlots[index]
    ));

    this.setData({
      testContext: {
        species: "cat",
        ...testContext,
      },
      photoSlots: mergedSlots,
      uploadProgress: this.getUploadProgress(mergedSlots),
    });
  },

  getUploadProgress(photoSlots) {
    const total = photoSlots.length || 1;
    const done = photoSlots.filter((slot) => Boolean(slot.path)).length;
    return Math.round((done / total) * 100);
  },

  selectSpecies(event) {
    const species = event.currentTarget.dataset.value;
    this.setData({
      "testContext.species": species,
    });
  },

  pickImage(event) {
    const slotKey = event.currentTarget.dataset.key;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        const path = res.tempFiles[0].tempFilePath;
        const previewSlots = this.data.photoSlots.map((slot) => (
          slot.key === slotKey ? { ...slot, path, uploading: true } : slot
        ));
        this.setData({ photoSlots: previewSlots });

        try {
          const cloudPath = `tests/${Date.now()}-${slotKey}-${Math.random().toString(36).slice(2, 8)}.jpg`;
          const uploadRes = await uploadToCloud(path, cloudPath);

          const updatedSlots = this.data.photoSlots.map((slot) => (
            slot.key === slotKey
              ? { ...slot, path, cloudFileId: uploadRes.fileID, uploading: false }
              : slot
          ));

          this.setData({
            photoSlots: updatedSlots,
            uploadProgress: this.getUploadProgress(updatedSlots),
          });

          saveFileRecord({
            kind: "test-photo",
            fileId: uploadRes.fileID,
            cloudPath,
            testId: getApp().globalData.latestResult?.testId || "",
          }).catch(() => {
            console.warn("test photo record sync failed");
          });
        } catch (error) {
          const revertedSlots = this.data.photoSlots.map((slot) => (
            slot.key === slotKey ? { ...slot, uploading: false } : slot
          ));
          this.setData({ photoSlots: revertedSlots });
          wx.showToast({ title: "上传失败，请重试", icon: "none" });
        }
      },
    });
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.path;
    const urls = this.data.photoSlots.filter((slot) => slot.path).map((slot) => slot.path);
    if (!current) return;

    wx.previewImage({
      current,
      urls,
    });
  },

  resetPhotos() {
    const cleared = this.data.photoSlots.map((slot) => ({ ...slot, path: "", cloudFileId: "", uploading: false }));
    this.setData({
      photoSlots: cleared,
      uploadProgress: 0,
    });
  },

  nextStep() {
    const completed = this.data.photoSlots.every((slot) => Boolean(slot.path));
    if (!completed) {
      wx.showToast({ title: "请上传三张引导照片", icon: "none" });
      return;
    }

    const testContext = {
      ...(this.data.testContext || {}),
      photoSlots: this.data.photoSlots,
      photoCount: APP_CONFIG.maxPetPhotos,
    };

    saveTestContext(testContext);
    getApp().globalData.currentTestContext = testContext;
    wx.navigateTo({ url: "/pages/quiz/index" });
  },
});
