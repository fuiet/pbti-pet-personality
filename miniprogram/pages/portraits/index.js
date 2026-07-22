const api = require('../../utils/api');
const portraits = require('../../utils/portraits');

const FREE_TEMPLATES = [
  {
    id: 'gallery-masterpiece-cat',
    name: '名画展厅',
    hint: '古典布景、博物馆名画感',
    title: { en: 'Museum Masterpiece', zh: '名画展厅' },
    subtitle: { en: 'A classical portrait staged like a museum painting.', zh: '像博物馆名画一样的古典布景写真。' },
    previewImage: '/images/personalities/cats/01-explorer-cat.webp',
    basePrompt: 'Recreate the selected museum-style portrait template with the same classical room setting, framed painting backdrop, head scarf styling, rich textile surface, and old-master atmosphere. Replace the example pet completely with the user\'s real pet while preserving the composition and art-historical mood.'
  },
  {
    id: 'blue-plush-room',
    name: '蓝色玩偶房',
    hint: '蓝色空间、玩偶房间感',
    title: { en: 'Blue Plush Room', zh: '蓝色玩偶房' },
    subtitle: { en: 'A saturated blue toy room with plush costume styling.', zh: '蓝色玩偶房间与软萌造型感。' },
    previewImage: '/images/personalities/cats/09-sunny-cat.webp',
    basePrompt: 'Recreate the selected blue toy-room template with the same monochrome blue environment, plush nest bed, playful hood styling, collectible-room structure, and polished toy-display composition. Replace the example pet with the user\'s real pet.'
  },
  {
    id: 'paper-bag-head',
    name: '纸袋头像',
    hint: '荒诞有趣、头像风格',
    title: { en: 'Paper Bag Portrait', zh: '纸袋头像' },
    subtitle: { en: 'A quirky studio concept with a cutout paper-bag mask.', zh: '带有荒诞趣味的纸袋棚拍造型。' },
    previewImage: '/images/personalities/cats/11-player-cat.webp',
    basePrompt: 'Recreate the selected quirky studio template with the same pastel pink background, oversized paper-bag mask prop with a face cutout, simple cream outfit, and centered absurd-fashion composition. Replace the original pet with the user\'s real pet while preserving the deadpan humor.'
  },
  {
    id: 'pink-plush-room',
    name: '粉色软绵房',
    hint: '甜感、软绵、收藏感',
    title: { en: 'Pink Plush Room', zh: '粉色软绵房' },
    subtitle: { en: 'A sweet pink room built from plush props and soft shapes.', zh: '软绵粉色房间与玩偶收集感。' },
    previewImage: '/images/personalities/cats/07-companion-cat.webp',
    basePrompt: 'Recreate the selected dreamy pink-room template with the same plush bed, pastel character-room styling, oversized soft props, and highly curated cute composition. Replace the example pet with the user\'s real pet while preserving the room\'s soft collectible atmosphere.'
  }
];

Page({
  data: {
    mode: 'create',
    petType: 'cat',
    petPhoto: '',
    ownerPhoto: '',
    title: '',
    prompt: '',
    templateOpen: false,
    template: FREE_TEMPLATES[0].id,
    templates: FREE_TEMPLATES,
    selectedTemplate: FREE_TEMPLATES[0],
    generating: false,
    source: 'local',
    generatedPreview: ''
  },

  onShow() {
    this.setData({
      ownerPhoto: '',
      title: '',
      prompt: '',
      templateOpen: false,
      template: FREE_TEMPLATES[0].id,
      selectedTemplate: FREE_TEMPLATES[0],
      petType: 'cat',
      petPhoto: '',
      generatedPreview: '',
      source: 'local'
    });
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode });
  },

  choosePetPhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => this.setData({ petPhoto: res.tempFiles[0].tempFilePath })
    });
  },

  chooseOwnerPhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => this.setData({ ownerPhoto: res.tempFiles[0].tempFilePath })
    });
  },

  inputPrompt(e) {
    this.setData({ prompt: e.detail.value });
  },

  inputTitle(e) {
    this.setData({ title: e.detail.value });
  },

  toggleTemplates() {
    this.setData({ templateOpen: !this.data.templateOpen });
  },

  chooseTemplate(e) {
    const v = e.currentTarget.dataset.v;
    const selectedTemplate = FREE_TEMPLATES.find((item) => item.id === v) || FREE_TEMPLATES[0];
    this.setData({ template: v, selectedTemplate, templateOpen: false });
  },

  switchPetType(e) {
    this.setData({ petType: e.currentTarget.dataset.v });
  },

  buildLocalItem() {
    const now = Date.now();
    const isDuo = this.data.mode === 'duo';
    const title = this.data.title || (isDuo ? '合照创作' : this.data.selectedTemplate.name);

    return {
      id: `portrait_${now}`,
      url: isDuo ? (this.data.ownerPhoto || this.data.petPhoto) : this.data.petPhoto,
      template: isDuo ? '合照模式' : this.data.selectedTemplate.name,
      prompt: this.data.prompt || '未补充描述',
      petName: title,
      species: this.data.petType || 'dog',
      code: this.data.mode === 'duo' ? 'DUO' : 'CREATE',
      personality: isDuo ? '合照写真' : '独立创作',
      createdAt: now,
      createdLabel: portraits.formatTime(now),
      source: 'local',
      mode: this.data.mode
    };
  },

  async uploadSourcePhotos(petRecord) {
    const photoPaths = this.data.mode === 'duo'
      ? [this.data.petPhoto, this.data.ownerPhoto].filter(Boolean)
      : [this.data.petPhoto].filter(Boolean);
    const uploaded = await api.uploadPetPhotos(petRecord, photoPaths);
    return Array.isArray(uploaded && uploaded.photoUrls) ? uploaded.photoUrls.filter(Boolean) : [];
  },

  async generateRemotePortrait() {
    if (!api.isReady()) {
      throw new Error('后端接口未配置');
    }

    const createPayload = {
      name: this.data.title.trim() || this.data.selectedTemplate.name,
      species: this.data.petType,
      breed: '',
      age: '',
      gender: ''
    };

    const petRecord = await api.createPetProfile(createPayload);
    const uploadedPhotoUrls = await this.uploadSourcePhotos(petRecord);
    if (!uploadedPhotoUrls.length) {
      throw new Error('图片上传失败');
    }

    const templateId = this.data.mode === 'duo' ? 'owner-cozy-duo' : this.data.selectedTemplate.id;
    const petPhotos = [uploadedPhotoUrls[0]];
    const ownerPhotos = this.data.mode === 'duo' && uploadedPhotoUrls[1] ? [uploadedPhotoUrls[1]] : [];
    const response = await api.generatePortrait({
      petId: petRecord.id,
      petPhotos,
      ownerPhotos,
      petSpecies: this.data.petType,
      petName: this.data.title.trim() || this.data.selectedTemplate.name,
      templateId,
      customPrompt: this.data.prompt.trim()
    });

    if (!response || !response.portrait || !response.portrait.image_url) {
      throw new Error('后端没有返回生成结果');
    }

    return {
      id: response.portrait.id,
      url: response.portrait.image_url,
      template: response.style && response.style.name ? response.style.name : (this.data.mode === 'duo' ? '合照模式' : this.data.selectedTemplate.name),
      prompt: this.data.prompt || '已调用后端图片模型生成',
      petName: this.data.title.trim() || this.data.selectedTemplate.name,
      species: this.data.petType || 'dog',
      code: this.data.mode === 'duo' ? 'DUO' : 'CREATE',
      personality: this.data.mode === 'duo' ? '合照写真' : '独立创作',
      createdAt: Date.now(),
      createdLabel: portraits.formatTime(Date.now()),
      source: 'cloud',
      mode: this.data.mode
    };
  },

  async generate() {
    const title = this.data.title.trim();
    if (!title && this.data.mode === 'create') {
      wx.showToast({ title: '请先填写作品标题', icon: 'none' });
      return;
    }

    if (!this.data.petPhoto) {
      wx.showToast({ title: '请先添加图片', icon: 'none' });
      return;
    }

    if (this.data.mode === 'duo' && !this.data.ownerPhoto) {
      wx.showToast({ title: '请先添加主人的照片', icon: 'none' });
      return;
    }

    if (this.data.generating) return;
    this.setData({ generating: true });

    try {
      const item = await this.generateRemotePortrait();
      portraits.save(item);
      getApp().globalData.lastPortrait = item;
      this.setData({
        generating: false,
        source: 'cloud',
        generatedPreview: item.url
      });
      wx.showModal({
        title: '写真已生成',
        content: '已调用后端图片模型生成，并保存到作品库。',
        confirmText: '查看作品库',
        cancelText: '继续留在这里',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/library/index' });
          }
        }
      });
    } catch (error) {
      const item = this.buildLocalItem();
      portraits.save(item);
      getApp().globalData.lastPortrait = item;
      this.setData({
        generating: false,
        source: 'local',
        generatedPreview: item.url
      });
      wx.showModal({
        title: '已保存本地创作',
        content: error instanceof Error ? `${error.message}，已先保存为本地作品。` : '后端生成失败，已先保存为本地作品。',
        confirmText: '查看作品库',
        cancelText: '继续留在这里',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/library/index' });
          }
        }
      });
    }
  },

  library() {
    wx.navigateTo({ url: '/pages/library/index' });
  }
});
