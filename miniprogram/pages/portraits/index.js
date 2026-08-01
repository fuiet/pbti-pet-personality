const { portraitTemplates } = require("../../utils/imageAssets");
const { uploadToCloud, generatePortrait } = require("../../utils/cloud");
const { savePortraitTask } = require("../../utils/storage");

function compressImage(filePath) {
  return new Promise((resolve) => {
    wx.compressImage({
      src: filePath,
      quality: 40,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(filePath),
    });
  });
}

function hasUploadedFiles(photoSlots) {
  return photoSlots.some((slot) => slot.fileId);
}

Page({
  data: {
    selectedTemplate: 0,
    templatesExpanded: false,
    promptText: "",
    previewTitle: "准备好创造一张写卡",
    previewDesc: "先选择模板，再上传宠物照片并补充提示词，生成完成后会自动保存到我的页里的写真库。",
    templateList: portraitTemplates,
    photoSlots: [
      { key: "front", label: "正面照", hint: "最重要，建议清晰正脸", path: "", fileId: "", uploading: false },
      { key: "left", label: "左侧照", hint: "补全轮廓和侧脸特征", path: "", fileId: "", uploading: false },
      { key: "right", label: "右侧照", hint: "补全另一侧细节", path: "", fileId: "", uploading: false },
    ],
    uploadProgress: 0,
    generating: false,
    portraitTaskId: "",
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && typeof tabBar.setData === "function") tabBar.setData({ selected: 1 });
  },

  toggleTemplates() {
    this.setData({ templatesExpanded: !this.data.templatesExpanded });
  },

  selectTemplate(e) {
    const selectedTemplate = Number(e.currentTarget.dataset.index);
    const item = this.data.templateList[selectedTemplate];
    this.setData({
      selectedTemplate,
      previewTitle: item.name,
      previewDesc: item.desc,
      templatesExpanded: false,
    });
  },

  getUploadProgress(photoSlots) {
    const done = photoSlots.filter((slot) => slot.path).length;
    return Math.round((done / (photoSlots.length || 1)) * 100);
  },

  async pickPhoto(e) {
    const slotKey = e.currentTarget.dataset.key;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        const localPath = res.tempFiles[0].tempFilePath;
        this.setData({
          photoSlots: this.data.photoSlots.map((slot) =>
            slot.key === slotKey ? { ...slot, path: localPath, fileId: "", uploading: true } : slot
          ),
        });

        try {
          const uploadPath = await compressImage(localPath);
          const cloudPath = `portrait/${slotKey}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
          const uploadRes = await uploadToCloud(uploadPath, cloudPath);
          const updated = this.data.photoSlots.map((slot) =>
            slot.key === slotKey
              ? { ...slot, path: localPath, fileId: uploadRes.fileID, uploading: false }
              : slot
          );
          this.setData({ photoSlots: updated, uploadProgress: this.getUploadProgress(updated) });
        } catch (error) {
          this.setData({
            photoSlots: this.data.photoSlots.map((slot) =>
              slot.key === slotKey ? { ...slot, uploading: false } : slot
            ),
          });
          wx.showToast({ title: "上传失败，请重试", icon: "none" });
        }
      },
    });
  },

  previewImage(e) {
    const current = e.currentTarget.dataset.path;
    if (!current) return;
    wx.previewImage({
      current,
      urls: this.data.photoSlots.filter((slot) => slot.path).map((slot) => slot.path),
    });
  },

  optimizePrompt() {
    const template = this.data.templateList[this.data.selectedTemplate];
    this.setData({
      promptText: `${this.data.promptText || "自然、清晰、适合分享"}，参考模板“${template.name}”，突出毛发质感和表情。`,
    });
    wx.showToast({ title: "已优化提示词", icon: "none" });
  },

  bindPromptInput(e) {
    this.setData({ promptText: e.detail.value });
  },

  async showComingSoon() {
    if (!hasUploadedFiles(this.data.photoSlots)) {
      wx.showToast({ title: "请先上传宠物照片", icon: "none" });
      return;
    }

    const selected = this.data.photoSlots.filter((slot) => slot.fileId);
    this.setData({ generating: true, portraitTaskId: "" });
    wx.showLoading({ title: "正在提交生成任务" });

    try {
      const res = await generatePortrait({
        templateName: this.data.templateList[this.data.selectedTemplate]?.name || "宠物写真",
        promptText: this.data.promptText,
        photoSlots: selected.map((slot) => ({
          key: slot.key,
          fileId: slot.fileId,
        })),
      });

      const taskId = res.taskId || "";
      this.setData({ portraitTaskId: taskId, generating: false });
      savePortraitTask({
        taskId,
        templateName: this.data.templateList[this.data.selectedTemplate]?.name || "宠物写真",
        promptText: this.data.promptText,
        createdAt: Date.now(),
        status: "PENDING",
      });

      wx.hideLoading();
      wx.showToast({ title: "已提交，去我的页查看写真库", icon: "none", duration: 2000 });
      setTimeout(() => {
        wx.switchTab({ url: "/pages/account/index" });
      }, 600);
    } catch (error) {
      wx.hideLoading();
      this.setData({ generating: false });
      wx.showToast({ title: error?.message || "生成失败，请重试", icon: "none" });
    }
  },
});
