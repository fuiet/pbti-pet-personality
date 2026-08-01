function callCloud(name, data) {
  if (!wx.cloud) {
    return Promise.reject(new Error("wx.cloud is not available"));
  }

  return wx.cloud.callFunction({
    name,
    data,
  });
}

function loginWithCloud() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        callCloud("auth", {
          code: loginRes.code,
        })
          .then((res) => resolve(res.result))
          .catch(reject);
      },
      fail: reject,
    });
  });
}

function uploadToCloud(filePath, fileName) {
  if (!wx.cloud) {
    return Promise.reject(new Error("wx.cloud is not available"));
  }

  return wx.cloud.uploadFile({
    cloudPath: fileName,
    filePath,
  });
}

function saveTestRecord(payload) {
  return callCloud("test", {
    action: "save",
    payload,
  }).then((res) => res.result);
}

function getLatestTestRecord() {
  return callCloud("test", {
    action: "latest",
  }).then((res) => res.result);
}

function deleteLatestTestRecord(testId) {
  return callCloud("test", {
    action: "delete",
    testId,
  }).then((res) => res.result);
}

function getUserProfile() {
  return callCloud("user", {
    action: "get",
  }).then((res) => res.result);
}

function saveUserProfile(payload) {
  return callCloud("user", {
    action: "upsert",
    payload,
  }).then((res) => res.result);
}

function saveFileRecord(payload) {
  return callCloud("storage", {
    action: "save",
    payload,
  }).then((res) => res.result);
}

function listFileRecords() {
  return callCloud("storage", {
    action: "list",
  }).then((res) => res.result);
}

function generatePortrait(payload) {
  return callCloud("portrait", {
    action: "generate",
    payload,
  }).then((res) => res.result);
}

function getPortraitStatus(taskId) {
  return callCloud("portrait", {
    action: "status",
    taskId,
  }).then((res) => res.result);
}

function listPortraitAssets() {
  return callCloud("portrait", {
    action: "listMine",
  }).then((res) => res.result);
}

module.exports = {
  callCloud,
  loginWithCloud,
  uploadToCloud,
  saveTestRecord,
  getLatestTestRecord,
  deleteLatestTestRecord,
  getUserProfile,
  saveUserProfile,
  saveFileRecord,
  listFileRecords,
  generatePortrait,
  getPortraitStatus,
  listPortraitAssets,
};
