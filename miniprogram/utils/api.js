const config = require('../config.example');

function normalizedBaseUrl() {
  const base = config && typeof config.apiBaseUrl === 'string' ? config.apiBaseUrl.trim() : '';
  if (!base || base.includes('你的已备案接口域名')) {
    return '';
  }
  return base.replace(/\/+$/, '');
}

function getSessionToken() {
  const user = wx.getStorageSync('pbti_user') || null;
  return user && user.sessionToken ? user.sessionToken : '';
}

function buildHeaders(extra) {
  const sessionToken = getSessionToken();
  return Object.assign(
    { 'content-type': 'application/json' },
    sessionToken ? { 'X-PBTI-Session': sessionToken } : {},
    extra || {}
  );
}

function isReady() {
  return /^https?:\/\//.test(normalizedBaseUrl());
}

function isRemoteUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

function hasRemotePetId(pet) {
  return Boolean(pet && pet.id && !String(pet.id).startsWith('pet_'));
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const baseUrl = normalizedBaseUrl();
    if (!baseUrl) {
      reject(new Error('未配置小程序后端接口域名'));
      return;
    }

    wx.request({
      url: `${baseUrl}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header: buildHeaders(options.header),
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }

        const message = res.data && res.data.error ? res.data.error : `请求失败：${res.statusCode}`;
        reject(new Error(message));
      },
      fail: (err) => reject(err)
    });
  });
}

function createPetProfile(payload) {
  return request('/api/miniprogram/pets', {
    method: 'POST',
    data: payload
  });
}

function saveQuizResult(payload) {
  return request('/api/miniprogram/results', {
    method: 'POST',
    data: payload
  });
}

function listQuizResults() {
  return request('/api/miniprogram/results');
}

function deleteItem(payload) {
  return request('/api/account/delete', {
    method: 'POST',
    data: payload
  });
}

function uploadPetPhotos(pet, filePaths) {
  return new Promise((resolve, reject) => {
    const baseUrl = normalizedBaseUrl();
    const uploadPath = config && config.upload && config.upload.petPhotosPath;
    if (!baseUrl || !uploadPath) {
      reject(new Error('未配置宠物照片上传接口'));
      return;
    }

    if (!Array.isArray(filePaths) || !filePaths.length) {
      reject(new Error('没有可上传的照片'));
      return;
    }

    const uploaded = [];
    let cursor = 0;

    const next = () => {
      if (cursor >= filePaths.length) {
        resolve({ photoUrls: uploaded });
        return;
      }

      const filePath = filePaths[cursor];
      wx.uploadFile({
        url: `${baseUrl}${uploadPath}`,
        filePath,
        name: 'file',
        header: getSessionToken() ? { 'X-PBTI-Session': getSessionToken() } : {},
        formData: {
          petId: pet && pet.id ? pet.id : '',
          species: pet && pet.species ? pet.species : '',
          name: pet && pet.name ? pet.name : '',
          index: String(cursor)
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data || '{}');
            if (res.statusCode >= 200 && res.statusCode < 300 && data && data.url) {
              uploaded.push(data.url);
              cursor += 1;
              next();
              return;
            }
            reject(new Error(data && data.error ? data.error : '上传照片失败'));
          } catch (_) {
            reject(new Error('上传照片返回格式无效'));
          }
        },
        fail: (err) => reject(err)
      });
    };

    next();
  });
}

function listPortraits(petId) {
  return request(`/api/portraits?petId=${encodeURIComponent(petId)}`);
}

function analyzeVisualProfile(petId, imageUrl) {
  return request('/api/visual-profile', {
    method: 'POST',
    data: { petId, imageUrl }
  });
}

function generatePortrait(payload) {
  return request('/api/portraits', {
    method: 'POST',
    data: payload
  });
}

module.exports = {
  isReady,
  isRemoteUrl,
  hasRemotePetId,
  request,
  createPetProfile,
  saveQuizResult,
  listQuizResults,
  deleteItem,
  uploadPetPhotos,
  listPortraits,
  analyzeVisualProfile,
  generatePortrait
};
