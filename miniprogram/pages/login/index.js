const api = require('../../utils/api');

Page({
  data: {
    user: null,
    loading: false,
    message: ''
  },

  async onShow() {
    const user = getApp().globalData.user || wx.getStorageSync('pbti_user') || null;
    this.setData({ user });
  },

  async doLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true, message: '' });
    try {
      const user = await getApp().login();
      this.setData({
        user,
        message: user && user.mock
          ? '当前使用的是本地演示会话。若要连接真实后端，请先配置接口域名。'
          : '微信登录已完成。'
      });
    } catch (error) {
      this.setData({ message: error instanceof Error ? error.message : '登录失败，请稍后再试。' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async rebindSession() {
    if (this.data.loading || !api.isReady()) return;
    this.setData({ loading: true, message: '' });
    try {
      const user = await getApp().login();
      this.setData({ user, message: '会话已重新绑定。' });
    } catch (error) {
      this.setData({ message: error instanceof Error ? error.message : '绑定失败，请稍后再试。' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
