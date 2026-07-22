function list() {
  return wx.getStorageSync('pbti_history') || [];
}

function save(record) {
  const all = list();
  all.unshift(record);
  wx.setStorageSync('pbti_history', all.slice(0, 30));
}

function replace(records) {
  wx.setStorageSync('pbti_history', Array.isArray(records) ? records.slice(0, 30) : []);
}

function normalizeRemoteRecord(item) {
  if (!item || !item.pet || !item.pbtiId) return null;

  const report = item.report || {};
  const scores = item.scores || {};
  const dimensions = Array.isArray(report.dimensions)
    ? report.dimensions
    : Array.isArray(scores.dimensions)
    ? scores.dimensions
    : [scores.attachment || 50, scores.exploration || 50, scores.vitality || 50, scores.playfulness || 50];

  return {
    id: item.pbtiId,
    pet: {
      id: item.pet.id,
      name: item.pet.name,
      species: item.pet.species,
      breed: item.pet.breed || '',
      age: item.pet.age || '',
      gender: item.pet.gender || '',
      photos: Array.isArray(item.pet.photo_urls) ? item.pet.photo_urls.slice(0, 3) : (item.pet.photo_url ? [item.pet.photo_url] : []),
      remotePhotos: Array.isArray(item.pet.photo_urls) ? item.pet.photo_urls.slice(0, 3) : []
    },
    result: {
      code: item.personalityType,
      fit: Number(report.fit || scores.fit || 0),
      dimensions,
      personality: {
        name: report.personalityName || item.personalityType,
        title: report.personalityTitle || '',
        desc: report.summary || '',
        traits: Array.isArray(report.traits) ? report.traits : []
      }
    },
    answers: Array.isArray(report.answers) ? report.answers : [],
    createdAt: item.createdAt,
    remote: true
  };
}

module.exports = {
  save,
  all: list,
  replace,
  normalizeRemoteRecord
};
