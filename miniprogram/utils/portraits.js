function list() {
  return wx.getStorageSync('pbti_portraits') || [];
}

function save(item) {
  const all = list();
  all.unshift(item);
  wx.setStorageSync('pbti_portraits', all.slice(0, 30));
  return all[0];
}

function replace(items) {
  const next = Array.isArray(items) ? items : [];
  wx.setStorageSync('pbti_portraits', next.slice(0, 30));
  return list();
}

function formatTime(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

module.exports = { list, save, replace, formatTime };
