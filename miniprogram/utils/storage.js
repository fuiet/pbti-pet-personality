const SESSION_KEY = "pbti-mini-session";
const TEST_CONTEXT_KEY = "pbti-mini-test-context";
const DRAFT_KEY = "pbti-mini-current-pet";
const RESULT_KEY = "pbti-mini-latest-result";
const PORTRAIT_TASK_KEY = "pbti-mini-portrait-task";

function getStorage(key) {
  try {
    return wx.getStorageSync(key);
  } catch (error) {
    return null;
  }
}

function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    return null;
  }
  return value;
}

function loadSession() {
  return getStorage(SESSION_KEY);
}

function saveSession(session) {
  return setStorage(SESSION_KEY, session);
}

function loadPetDraft() {
  return getStorage(DRAFT_KEY);
}

function savePetDraft(draft) {
  return setStorage(DRAFT_KEY, draft);
}

function loadTestContext() {
  return getStorage(TEST_CONTEXT_KEY);
}

function saveTestContext(context) {
  return setStorage(TEST_CONTEXT_KEY, context);
}

function loadLatestResult() {
  return getStorage(RESULT_KEY);
}

function saveLatestResult(result) {
  return setStorage(RESULT_KEY, result);
}

function removeLatestResult() {
  try {
    wx.removeStorageSync(RESULT_KEY);
  } catch (error) {
    return false;
  }
  return true;
}

function loadPortraitTask() {
  return getStorage(PORTRAIT_TASK_KEY);
}

function savePortraitTask(task) {
  return setStorage(PORTRAIT_TASK_KEY, task);
}

function removePortraitTask() {
  try {
    wx.removeStorageSync(PORTRAIT_TASK_KEY);
  } catch (error) {
    return false;
  }
  return true;
}

module.exports = {
  loadSession,
  saveSession,
  loadPetDraft,
  savePetDraft,
  loadTestContext,
  saveTestContext,
  loadLatestResult,
  saveLatestResult,
  removeLatestResult,
  loadPortraitTask,
  savePortraitTask,
  removePortraitTask,
};
