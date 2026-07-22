let initialized = false;

function ensureCloud() {
  if (initialized) return true;
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.init !== 'function') return false;
  wx.cloud.init({
    env: 'cloud1-d4grkzmi3cc25adce',
    traceUser: true
  });
  initialized = true;
  return true;
}

function callFunction(name, data) {
  if (!ensureCloud()) {
    return Promise.reject(new Error('当前环境未启用云开发'));
  }
  return wx.cloud.callFunction({ name, data });
}

module.exports = {
  ensureCloud,
  callFunction
};
