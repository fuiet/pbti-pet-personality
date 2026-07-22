function scoreText(score, high, low) {
  if (score === undefined || score === null) return `在 ${high} 与 ${low} 之间较为均衡`;
  if (score >= 68) return `明显偏向${high}`;
  if (score >= 56) return `较偏向${high}`;
  if (score <= 32) return `明显偏向${low}`;
  if (score <= 44) return `较偏向${low}`;
  return `在 ${high} 与 ${low} 之间较为均衡`;
}

function buildAppearance(pet) {
  const hasPhotos = pet && pet.photos && pet.photos.length;
  if (!hasPhotos) {
    return {
      summary: '目前没有上传三视图照片，因此“爱宠鉴定”只保留说明，不输出外观判断。',
      details: [
        { label: '识别状态', value: '未提供照片' },
        { label: '说明', value: '补充正面、左侧、右侧照片后，可接入正式视觉识别服务。' }
      ]
    };
  }

  const speciesText = pet.species === 'cat' ? '猫咪' : '狗狗';
  return {
    summary: `已检测到 ${pet.photos.length} 张 ${speciesText} 照片。当前小程序版本先保留照片数量、主体类型与使用说明；后续可继续接入网站同源的视觉识别能力，补充毛色、体态、面部特征与品种倾向判断。`,
    details: [
      { label: '主体类型', value: speciesText },
      { label: '照片数量', value: `${pet.photos.length} 张` },
      { label: '当前能力', value: '用于档案、报告封面与后续 AI 写真入口' },
      { label: '后续可扩展', value: '毛色、脸型、姿态、品种倾向与识别说明' }
    ]
  };
}

function buildRecommendations(name, dimensions) {
  const basis = [
    `亲近方式 ${dimensions[0]}%`,
    `适应变化 ${dimensions[1]}%`,
    `情绪表达 ${dimensions[2]}%`,
    `玩心守护 ${dimensions[3]}%`
  ];

  return [
    {
      title: '安排亲近与独处空间',
      detail: `${name}${dimensions[0] >= 50 ? '通常会主动寻求陪伴，也需要稳定回应。请在回应靠近的同时，为它保留随时能安静休息的空间。' : '更重视自己的节奏。请把亲近当成邀请而不是要求，允许它在舒服的时候再靠近。'}`,
      basis: `依据：${basis[0]}`
    },
    {
      title: '建立容易理解的生活节奏',
      detail: `${name}${dimensions[1] >= 50 ? '对新鲜变化有接受度，可以逐步轮换路线、玩具和互动方式。' : '更依赖熟悉感。调整作息、环境或活动时，一次只改一项，并给它观察与适应时间。'}`,
      basis: `依据：${basis[1]}`
    },
    {
      title: '把活动强度和能量匹配起来',
      detail: `${name}${dimensions[2] >= 50 ? '情绪和兴奋度表达较明显，活动后要安排安静恢复。' : '表达偏克制，互动时要主动留意眼神、耳位、尾巴与身体距离这些细小信号。'}`,
      basis: `依据：${basis[2]}`
    },
    {
      title: '让互动更像共同练习',
      detail: `${name}${dimensions[3] >= 50 ? '很适合短时、高质量、可以成功结束的游戏。' : '更适合目标清晰、节奏稳定、可预判的互动方式，用奖励代替催促会更有效。'}`,
      basis: `依据：${basis[3]}`
    },
    {
      title: '观察长期变化并及时求助',
      detail: '持续关注食欲、睡眠、活动、排泄、梳理、叫声和社交变化。若身体或行为突然改变、持续异常，或明显影响生活，请尽快联系专业宠医。',
      basis: '依据：PBTI 反映性格倾向，不替代健康判断'
    }
  ];
}

function generatePetReport(record) {
  const pet = record.pet || {};
  const result = record.result || {};
  const personality = result.personality || {};
  const dimensions = result.dimensions || [50, 50, 50, 50];
  const name = pet.name || '宠物';

  const attachment = scoreText(dimensions[0], '亲近陪伴', '自主空间');
  const exploration = scoreText(dimensions[1], '探索新鲜事物', '熟悉稳定的节奏');
  const vitality = scoreText(dimensions[2], '积极外放', '冷静克制');
  const playfulness = scoreText(dimensions[3], '玩耍互动', '观察与守护');
  const appearance = buildAppearance(pet);
  const recommendations = buildRecommendations(name, dimensions);

  return {
    summary: `${name} 是一位“${personality.name || '性格类型'}”型伙伴。它${personality.desc || '有自己稳定而独特的行为节奏'}，在亲近方式、适应变化、情绪表达和玩心守护上，都呈现出鲜明偏好。`,
    dimensionNarrative: [
      `亲近方式：${attachment}。`,
      `适应变化：${exploration}。`,
      `情绪表达：${vitality}。`,
      `玩心守护：${playfulness}。`
    ],
    loveLanguage: [
      {
        title: '它表达信任的方式',
        body: `${name}${dimensions[0] >= 50 ? '更容易通过主动靠近、停留在你身边、参与共同活动来表达信任。' : '更容易通过愿意在附近放松、接受你的存在、在需要时再主动靠近来表达信任。'}真正重要的是长期反复出现的选择，而不是某一次特别黏人或特别冷淡。`
      },
      {
        title: '它喜欢怎样被关注',
        body: `${name}${dimensions[2] >= 50 ? '通常会用比较明显的动作、声音和参与感回应关注。' : '更适合低压、温和、节奏可控的关注方式。'}当它转头、离开、僵住、躲开或过度兴奋时，都说明互动强度该调整了。`
      },
      {
        title: '建立专属的爱意词典',
        body: '迎接你、靠近休息、轻轻跟随、把玩具叼来、安静陪伴、慢慢放松身体，都是可能的爱意表达。把它反复选择的接触方式、休息位置、游戏和日常仪式记下来，会更容易读懂它。'
      }
    ],
    relationship: [
      {
        title: '用可预期的日常建立安全感',
        body: `让 ${name} 能够大致预判吃饭、散步或如厕、玩耍、休息和安静独处的时间。稳定不等于僵化，而是让变化发生得更清楚、更温和。`
      },
      {
        title: '尊重选择，也尊重拒绝',
        body: '用邀请代替强迫，为每次互动保留退出通道，并鼓励它主动靠近与配合。尊重暂停不会削弱感情，反而会让它知道自己的表达是安全且有效的。'
      },
      {
        title: '把配合变成共同练习',
        body: `${name}${dimensions[3] >= 50 ? '更适合短而有趣、容易成功的互动任务。' : '更适合清晰、稳定、不过度刺激的配合练习。'}突然变化往往是在传递环境、舒适度、学习历史或健康方面的信息。`
      }
    ],
    appearance,
    recommendations,
    actions: recommendations.slice(0, 3),
    methodology: 'PBTI 小程序通过 28 道主人观察题，把行为线索整理为四个自定义维度：亲近陪伴 / 自主空间、探索新鲜 / 熟悉稳定、积极外放 / 冷静克制、玩耍互动 / 观察守护。结果用于帮助主人建立更好的日常观察与相处方式。',
    fitIndex: `原型匹配指数：${result.fit || 0}/100。该数值表示与当前 PBTI 原型的相似程度，不代表医学诊断或统计置信度。`
  };
}

module.exports = { generatePetReport };
