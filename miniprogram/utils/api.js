function callCloud(name, data) {
  if (!wx.cloud) {
    return Promise.reject(new Error("wx.cloud is not available"));
  }

  return wx.cloud.callFunction({
    name,
    data,
  });
}

function authorizeWithWeChat(profile) {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        callCloud("auth", {
          action: "login",
          code: loginRes.code,
          profile,
        })
          .then((res) => resolve(res.result))
          .catch(reject);
      },
      fail: reject,
    });
  });
}

function savePetProfile(payload) {
  return callCloud("pet", {
    action: "saveProfile",
    payload,
  }).then((res) => res.result);
}

function submitAssessment(payload) {
  return callCloud("report", {
    action: "submitAssessment",
    payload,
  }).then((res) => res.result);
}

function requestVisualProfile(payload) {
  return callCloud("visualProfile", {
    action: "analyze",
    payload,
  }).then((res) => res.result);
}

function requestPortraitTask(payload) {
  return callCloud("portrait", {
    action: "generate",
    payload,
  }).then((res) => res.result);
}

module.exports = {
  authorizeWithWeChat,
  savePetProfile,
  submitAssessment,
  requestVisualProfile,
  requestPortraitTask,
};
