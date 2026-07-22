const api = require('../../utils/api');
const { makeQuestions, calculate, personalities } = require('../../utils/data');
const history = require('../../utils/history');

Page({
  data: {
    questions: [],
    index: 0,
    answers: [],
    selected: '',
    progress: 0,
    currentQuestion: null,
    optionTags: ['A', 'B', 'C']
  },

  onLoad() {
    const pet = getApp().globalData.pet || wx.getStorageSync('pbti_pet') || { species: 'dog', name: '宠物' };
    this.pet = pet;
    const questions = makeQuestions(pet.species);
    this.setData({ questions });
    this.syncView(0, '');
  },

  answer(e) {
    const value = e.currentTarget.dataset.value;
    const answers = [...this.data.answers];
    answers[this.data.index] = value;
    this.setData({ answers, selected: value });
    setTimeout(() => this.next(), 180);
  },

  async saveRecord(record) {
    const pet = this.pet || {};
    if (!api.isReady() || !api.hasRemotePetId(pet)) {
      return record;
    }

    try {
      const personality = personalities[record.result.code] || record.result.personality || {};
      const res = await api.saveQuizResult({
        petId: pet.id,
        code: record.result.code,
        personalityName: personality.name || '',
        personalityTitle: personality.en || '',
        personalityDesc: personality.desc || '',
        traits: Array.isArray(personality.traits) ? personality.traits : [],
        fit: record.result.fit,
        dimensions: record.result.dimensions,
        answers: record.answers
      });

      if (res && res.record && res.record.pbtiId) {
        return Object.assign({}, record, {
          id: res.record.pbtiId,
          remote: true,
          pet: res.record.pet || record.pet
        });
      }
    } catch (_) {
      // 云端保存失败时回退本地记录。
    }

    return record;
  },

  async next() {
    if (!this.data.answers[this.data.index]) return;

    if (this.data.index === 27) {
      const result = calculate(this.data.answers);
      let record = {
        id: `r_${Date.now()}`,
        pet: this.pet,
        result,
        answers: this.data.answers,
        createdAt: Date.now()
      };

      record = await this.saveRecord(record);
      getApp().globalData.result = record;
      wx.setStorageSync('pbti_result', record);
      history.save(record);
      wx.redirectTo({ url: '/pages/result/index' });
      return;
    }

    const nextIndex = this.data.index + 1;
    this.syncView(nextIndex, this.data.answers[nextIndex] || '');
  },

  prev() {
    if (!this.data.index) return;
    const prevIndex = this.data.index - 1;
    this.syncView(prevIndex, this.data.answers[prevIndex] || '');
  },

  syncView(index, selected) {
    this.setData({
      index,
      selected,
      progress: Math.round(((index + 1) / 28) * 100),
      currentQuestion: this.data.questions[index] || null
    });
  }
});
