const api = require('../../utils/api');
const { ensurePortraitSet, PRESET_STYLES } = require('../../utils/preparing');

Page({
  data: {
    record: null,
    steps: [
      { key: 'visual', title: '爱宠鉴定中', detail: '整理照片与外观线索', status: 'pending' },
      { key: 'report', title: '完整报告准备中', detail: '生成 10 章节报告内容', status: 'pending' },
      { key: 'portraits', title: '写真资产准备中', detail: '准备 3 张可复用写真', status: 'pending' }
    ],
    progress: 0,
    loading: true
  },

  onLoad() {
    const record = getApp().globalData.result || wx.getStorageSync('pbti_result');
    if (!record) {
      wx.redirectTo({ url: '/pages/home/index' });
      return;
    }

    this.setData({ record });
    this.runPipeline(record);
  },

  updateStep(key, status, detail) {
    const steps = this.data.steps.map((item) => (
      item.key === key ? { ...item, status, detail: detail || item.detail } : item
    ));
    const completed = steps.filter((item) => item.status === 'done').length;
    this.setData({
      steps,
      progress: Math.round((completed / steps.length) * 100)
    });
  },

  async tryVisualAnalysis(record) {
    const pet = record.pet || {};
    const imageUrl = (pet.remotePhotos && pet.remotePhotos[0]) || (pet.photos && pet.photos[0]);
    if (!api.isReady() || !api.hasRemotePetId(pet) || !api.isRemoteUrl(imageUrl)) {
      return {
        mode: 'fallback',
        detail: imageUrl
          ? '已读取照片，当前先使用本地爱宠鉴定说明'
          : '未上传照片，已使用无图说明方案'
      };
    }

    try {
      const res = await api.analyzeVisualProfile(pet.id, imageUrl);
      const summary = res && res.profile && res.profile.summary ? res.profile.summary : '已完成云端视觉识别';
      return {
        mode: 'cloud',
        detail: summary
      };
    } catch (_) {
      return {
        mode: 'fallback',
        detail: '云端识别暂不可用，已回退到本地爱宠鉴定说明'
      };
    }
  },

  async runPipeline(record) {
    this.updateStep('visual', 'active', '正在读取已上传照片');
    const visual = await this.tryVisualAnalysis(record);
    this.updateStep('visual', 'done', visual.detail);

    this.updateStep('report', 'active', '正在生成完整报告章节');
    setTimeout(() => {
      this.updateStep('report', 'done', '10 章节报告内容已准备完成');
      this.updateStep('portraits', 'active', '正在准备写真资产');

      setTimeout(() => {
        const seeded = ensurePortraitSet(record);
        this.updateStep('portraits', 'done', `已准备 ${seeded.length || PRESET_STYLES.length} 张可复用写真`);
        this.setData({ loading: false, progress: 100 });

        setTimeout(() => {
          wx.redirectTo({ url: '/pages/report/index' });
        }, 500);
      }, 500);
    }, 500);
  }
});
