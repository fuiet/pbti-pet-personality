const api = require('../../utils/api');

Page({
  data: {
    photos: [],
    remotePhotos: [],
    uploading: false,
    uploadMode: 'local',
    uploadMessage: '当前仅保存在本地，后续可接入云端分析',
    slots: [{ label: '正面' }, { label: '左侧' }, { label: '右侧' }]
  },

  onShow() {
    const pet = getApp().globalData.pet || wx.getStorageSync('pbti_pet') || {};
    const hasRemotePhotos = Array.isArray(pet.remotePhotos) && pet.remotePhotos.length > 0;
    this.setData({
      photos: Array.isArray(pet.photos) ? pet.photos.slice(0, 3) : [],
      remotePhotos: hasRemotePhotos ? pet.remotePhotos.slice(0, 3) : [],
      uploadMode: hasRemotePhotos ? 'cloud' : 'local',
      uploadMessage: hasRemotePhotos
        ? '已存在云端照片地址，可继续用于识别与写真'
        : '当前仅保存在本地，后续可接入云端分析'
    });
  },

  choose() {
    wx.chooseMedia({
      count: 3 - this.data.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const photos = [
          ...this.data.photos,
          ...res.tempFiles.map((x) => x.tempFilePath)
        ].slice(0, 3);

        this.setData({
          photos,
          remotePhotos: [],
          uploadMode: 'local',
          uploadMessage: '已更新本地照片，正在判断是否可同步到云端'
        });

        const pet = getApp().globalData.pet || wx.getStorageSync('pbti_pet') || {};
        pet.photos = photos;
        pet.remotePhotos = [];
        wx.setStorageSync('pbti_pet', pet);
        getApp().globalData.pet = pet;

        await this.tryUploadPhotos(pet, photos);
      }
    });
  },

  async tryUploadPhotos(pet, photos) {
    if (!api.isReady() || !api.hasRemotePetId(pet)) {
      this.setData({
        uploadMode: 'local',
        uploadMessage: '当前宠物档案还不是云端记录，暂时仅保存在本地'
      });
      return;
    }

    this.setData({
      uploading: true,
      uploadMode: 'syncing',
      uploadMessage: '正在尝试同步照片到云端'
    });

    try {
      const res = await api.uploadPetPhotos(pet, photos);
      const remotePhotos = Array.isArray(res && res.photoUrls) ? res.photoUrls.slice(0, 3) : [];
      pet.remotePhotos = remotePhotos;
      wx.setStorageSync('pbti_pet', pet);
      getApp().globalData.pet = pet;
      this.setData({
        remotePhotos,
        uploading: false,
        uploadMode: remotePhotos.length ? 'cloud' : 'local',
        uploadMessage: remotePhotos.length
          ? '照片已同步到云端，可用于识别与写真生成'
          : '上传接口已调用，但尚未返回可用云端地址'
      });
    } catch (_) {
      this.setData({
        uploading: false,
        uploadMode: 'local',
        uploadMessage: '云端上传暂不可用，当前先保留本地照片'
      });
    }
  },

  remove(e) {
    const photos = [...this.data.photos];
    photos.splice(e.currentTarget.dataset.index, 1);
    const remotePhotos = [...this.data.remotePhotos];
    remotePhotos.splice(e.currentTarget.dataset.index, 1);
    this.setData({ photos, remotePhotos });

    const pet = getApp().globalData.pet || wx.getStorageSync('pbti_pet') || {};
    pet.photos = photos;
    pet.remotePhotos = remotePhotos;
    wx.setStorageSync('pbti_pet', pet);
    getApp().globalData.pet = pet;
  },

  next() {
    const pet = getApp().globalData.pet || wx.getStorageSync('pbti_pet') || {};
    pet.photos = this.data.photos;
    pet.remotePhotos = this.data.remotePhotos;
    wx.setStorageSync('pbti_pet', pet);
    getApp().globalData.pet = pet;
    wx.navigateTo({ url: '/pages/quiz/index' });
  }
});
