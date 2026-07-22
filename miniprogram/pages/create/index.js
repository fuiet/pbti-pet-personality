const api = require('../../utils/api');

Page({
  data: {
    species: 'dog',
    name: '',
    breed: '',
    age: '',
    gender: ''
  },

  chooseSpecies(e) {
    this.setData({ species: e.currentTarget.dataset.value });
  },

  field(e) {
    this.setData({ [e.currentTarget.dataset.key]: e.detail.value });
  },

  chooseGender(e) {
    this.setData({ gender: e.currentTarget.dataset.value });
  },

  async next() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请填写宠物名字', icon: 'none' });
      return;
    }

    let pet = {
      ...this.data,
      id: `pet_${Date.now()}`,
      photos: [],
      remotePhotos: []
    };

    if (api.isReady()) {
      try {
        const res = await api.createPetProfile({
          name: this.data.name.trim(),
          species: this.data.species,
          breed: this.data.breed.trim(),
          age: this.data.age.trim(),
          gender: this.data.gender
        });

        if (res && res.pet && res.pet.id) {
          pet = Object.assign({}, pet, res.pet, {
            photos: [],
            remotePhotos: Array.isArray(res.pet.photo_urls) ? res.pet.photo_urls.slice(0, 3) : []
          });
        }
      } catch (_) {
        // 后端不可用时继续保留本地档案，保证流程不中断。
      }
    }

    getApp().globalData.pet = pet;
    wx.setStorageSync('pbti_pet', pet);
    wx.navigateTo({ url: '/pages/upload/index' });
  }
});
