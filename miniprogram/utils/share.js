function buildSharePayload(record) {
  const petName = record && record.pet && record.pet.name ? record.pet.name : '宠物';
  const result = record && record.result ? record.result : {};
  const personality = result.personality || {};
  const dimensions = result.dimensions || [50, 50, 50, 50];
  const traits = personality.traits || [];
  const imageUrl = record && record.pet && record.pet.photos && record.pet.photos[0] ? record.pet.photos[0] : '';

  const summary = `${petName} 是「${result.code || 'PBTI'} · ${personality.name || '性格类型'}」：${personality.desc || '有自己稳定而独特的行为节奏。'}`;
  const dimensionRows = [
    { label: '亲密', value: dimensions[0] || 0 },
    { label: '探索', value: dimensions[1] || 0 },
    { label: '活力', value: dimensions[2] || 0 },
    { label: '玩心', value: dimensions[3] || 0 }
  ];

  return {
    title: `${petName} 的 PBTI 性格是 ${personality.name || '未知类型'}`,
    path: '/pages/home/index',
    imageUrl,
    card: {
      petName,
      code: result.code || 'PBTI',
      personalityName: personality.name || '性格类型',
      personalityTitle: personality.title || '',
      summary,
      traits: traits.slice(0, 3),
      fit: result.fit || 0,
      dimensions: dimensionRows,
      imageUrl
    }
  };
}

module.exports = { buildSharePayload };
