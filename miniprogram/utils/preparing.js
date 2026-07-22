const portraits = require('./portraits');

const PRESET_STYLES = ['治愈奶油风', '户外电影感', '极简线稿'];

function buildPortraitSeed(record, style, index) {
  const pet = record.pet || {};
  const result = record.result || {};
  const personality = result.personality || {};
  const now = Date.now() + index;

  return {
    id: `portrait_${now}_${index}`,
    url: pet.photos && pet.photos[0] ? pet.photos[0] : '',
    template: style,
    prompt: `根据 ${pet.name || '宠物'} 的 ${result.code || 'PBTI'} 性格，生成 ${style} 风格写真`,
    petName: pet.name || '宠物',
    species: pet.species || 'dog',
    code: result.code || 'PBTI',
    personality: personality.name || '写真记录',
    createdAt: now,
    createdLabel: portraits.formatTime(now),
    source: 'preparing-local'
  };
}

function ensurePortraitSet(record) {
  const all = portraits.list();
  const petName = record && record.pet && record.pet.name ? record.pet.name : '';
  const code = record && record.result && record.result.code ? record.result.code : '';

  const existing = all.filter((item) => item.petName === petName && item.code === code);
  if (existing.length >= 3) {
    return existing.slice(0, 3);
  }

  const missing = PRESET_STYLES.filter((style) => !existing.some((item) => item.template === style));
  const created = missing.map((style, index) => {
    const item = buildPortraitSeed(record, style, index);
    portraits.save(item);
    return item;
  });

  return existing.concat(created).slice(0, 3);
}

module.exports = { ensurePortraitSet, PRESET_STYLES };
