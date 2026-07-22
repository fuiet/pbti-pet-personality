App({
  globalData: {
    userInfo: null,
    lastPortrait: null,
  },

  onLaunch() {
    if (typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.init === 'function') {
      wx.cloud.init({
        env: 'cloud1-d4grkzmi3cc25adce',
        traceUser: true
      });
    }
  }
});
