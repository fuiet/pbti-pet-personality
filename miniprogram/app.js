const api = require('./utils/api');

App({
  globalData: {
    user: null,
    pet: null,
    result: null
  },

  onLaunch() {
    this.globalData.user = wx.getStorageSync('pbti_user') || null;
    this.globalData.pet = wx.getStorageSync('pbti_pet') || null;
    this.globalData.result = wx.getStorageSync('pbti_result') || null;
  },

  saveUser(user) {
    this.globalData.user = user;
    wx.setStorageSync('pbti_user', user);
    return user;
  },

  login() {
    return new Promise((resolve) => {
      wx.login({
        success: async ({ code }) => {
          if (!code) {
            resolve(this.saveUser({
              id: `guest_${Date.now()}`,
              nickname: '微信用户',
              loggedAt: Date.now(),
              mock: true
            }));
            return;
          }

          if (api.isReady()) {
            try {
              const response = await api.request('/api/wechat/login', {
                method: 'POST',
                data: { code }
              });

              if (response && response.user) {
                resolve(this.saveUser({
                  id: response.user.id,
                  nickname: response.user.nickname || '微信用户',
                  loggedAt: Date.now(),
                  sessionToken: response.session && response.session.token ? response.session.token : '',
                  sessionExpiresAt: response.session && response.session.expiresAt ? response.session.expiresAt : '',
                  mock: Boolean(response.mock)
                }));
                return;
              }
            } catch (_) {
              // 继续走本地演示会话
            }
          }

          resolve(this.saveUser({
            id: code || `guest_${Date.now()}`,
            nickname: '微信用户',
            loggedAt: Date.now(),
            mock: true
          }));
        },
        fail: () => resolve(null)
      });
    });
  }
});
