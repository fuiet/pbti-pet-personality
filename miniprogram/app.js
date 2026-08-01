const { APP_CONFIG } = require("./utils/constants");
const { loadSession, saveSession } = require("./utils/storage");
const { loginWithCloud } = require("./utils/cloud");

App({
  globalData: {
    ready: false,
    session: null,
    userProfile: null,
    currentTestContext: null,
    latestResult: null,
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: APP_CONFIG.cloudEnv,
        traceUser: true,
      });
    }

    const session = loadSession();
    if (session) {
      this.globalData.session = session;
    }

    if (!this.globalData.session && wx.cloud) {
      loginWithCloud()
        .then((sessionResult) => {
          this.setSession(sessionResult);
        })
        .catch(() => {});
    }

    this.globalData.ready = true;
  },

  setSession(session) {
    this.globalData.session = session;
    saveSession(session);
  },
});
