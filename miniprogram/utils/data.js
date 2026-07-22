const personalities = {
  IEVP: { name: '探索家', en: 'Explorer', title: '好奇的开路者', desc: '喜欢用嗅闻、观察和行动探索新空间。', traits: ['好奇', '机敏', '冒险'] },
  ASVG: { name: '守护者', en: 'Guardian', title: '稳定的守护伙伴', desc: '重视熟悉的人与生活秩序，会用陪伴和观察表达关心。', traits: ['忠诚', '稳定', '守护'] },
  ISCP: { name: '梦想家', en: 'Dreamer', title: '柔软的舒适追寻者', desc: '偏爱安静、安全和低压力的生活节奏。', traits: ['温柔', '安静', '松弛'] },
  IEVG: { name: '独行侠', en: 'Maverick', title: '独立的探索者', desc: '大胆、自由，喜欢保留选择权和行动空间。', traits: ['独立', '大胆', '自主'] },
  IECG: { name: '学者', en: 'Scholar', title: '深思熟虑的观察者', desc: '习惯先观察再行动，擅长发现环境里的细微规律。', traits: ['观察', '耐心', '审慎'] },
  AEVG: { name: '领袖', en: 'Leader', title: '自信的引导者', desc: '表达直接、行动果断，也喜欢清晰稳定的规则。', traits: ['自信', '果断', '鲜明'] },
  ASCP: { name: '陪伴者', en: 'Companion', title: '温暖的日常伙伴', desc: '看重共同生活的仪式感，愿意频繁参与家人的活动。', traits: ['亲密', '温暖', '合群'] },
  ASCG: { name: '治愈者', en: 'Healer', title: '温柔的安定力量', desc: '敏感而平和，常用细小而持续的信任信号建立关系。', traits: ['治愈', '敏感', '信任'] },
  AEVP: { name: '小太阳', en: 'Sunny', title: '快乐的社交火花', desc: '热情、活泼，喜欢在互动和游戏中获得能量。', traits: ['阳光', '社交', '活力'] },
  ISCG: { name: '哨兵', en: 'Sentinel', title: '警觉的秩序观察者', desc: '善于追踪环境变化，重视熟悉路线和稳定节奏。', traits: ['警觉', '耐心', '细致'] },
  AECP: { name: '玩家', en: 'Player', title: '互动游戏发起者', desc: '精力旺盛，擅长把移动、玩具和关注变成游戏。', traits: ['好玩', '互动', '机灵'] },
  ISVG: { name: '贵族', en: 'Noble', title: '从容的独立灵魂', desc: '边界清晰、气质沉稳，更喜欢有分寸的亲密。', traits: ['从容', '独立', '优雅'] }
};

const questionGroups = {
  cat: {
    A: [
      '你回家时，它通常会怎么反应？',
      '你换到另一个房间时，它更常见的反应是？',
      '安静休息时，它更喜欢怎样靠近你？',
      '你呼唤它名字时，它通常会？',
      '短暂独处后，它通常会？',
      '它对身体接触的偏好更接近哪一种？',
      '家人聚在一起时，它更常见的状态是？'
    ],
    E: [
      '面对新物品时，它通常会？',
      '进入陌生空间时，它通常会？',
      '家中布局变化时，它更可能？',
      '面对新玩具时，它会？',
      '听到陌生声音时，它会？',
      '日常路线变化时，它更常见的反应是？',
      '受惊之后，它通常多久恢复？'
    ],
    V: [
      '饭前兴奋时，它通常会？',
      '主动玩耍时，它一般会？',
      '想要东西时，它更常怎么表达？',
      '突然有动静时，它通常会？',
      '它的情绪信号通常是？',
      '见到喜欢的人时，它会？',
      '受到挫折时，它会？'
    ],
    P: [
      '在家活动时，它更喜欢？',
      '门窗打开时，它通常会？',
      '玩具被藏起来时，它会？',
      '快速物体经过时，它更可能？',
      '客人到来时，它更关注什么？',
      '你发起游戏时，它通常会？',
      '面对领地变化时，它更可能？'
    ]
  },
  dog: {
    A: [
      '你回家时，它通常会怎么反应？',
      '你换到另一个房间时，它更常见的反应是？',
      '安静休息时，它更喜欢待在哪里？',
      '你呼唤它名字时，它通常会？',
      '短暂独处后，它通常会？',
      '它主动寻求接触的频率更接近哪一种？',
      '家人聚在一起时，它更常见的状态是？'
    ],
    E: [
      '到新的户外区域时，它通常会？',
      '面对陌生人时，它通常会？',
      '更换散步路线时，它更可能？',
      '面对新物品时，它会？',
      '家中布局变化时，它会？',
      '听到陌生声音时，它会？',
      '受惊之后，它通常多久恢复？'
    ],
    V: [
      '见到熟人兴奋时，它通常会？',
      '主动玩耍时，它一般会？',
      '想要东西时，它更常怎么表达？',
      '突然有动静时，它通常会？',
      '它的情绪信号通常是？',
      '等待散步或吃饭时，它会？',
      '受到挫折时，它会？'
    ],
    P: [
      '在家时，它更关注什么？',
      '有人经过门外时，它通常会？',
      '拿到玩具时，它通常会？',
      '家人走动时，它通常会？',
      '遇到陌生动物时，它更可能？',
      '面对嗅闻游戏时，它通常会？',
      '出现异常情况时，它更常怎么做？'
    ]
  }
};

const optionTexts = [
  ['主动靠近、很快参与、信号明显', '先观察一下，再决定要不要行动', '更喜欢保持距离或继续自己的事'],
  ['立刻探索、积极接触、适应很快', '先闻一闻、看一看，再慢慢接近', '谨慎观察，更依赖熟悉环境'],
  ['兴奋明显、动作和声音都很大', '会回应，但整体比较克制', '表现安静，更多用细微信号表达'],
  ['把它变成游戏并主动参与', '会参与，但更看当下状态', '保持警觉，持续观察环境']
];

const dimensionGroups = [['A', 'I'], ['E', 'S'], ['V', 'C'], ['P', 'G']];

function makeQuestions(species) {
  const source = questionGroups[species] || questionGroups.dog;
  const keys = ['A', 'E', 'V', 'P'];

  return keys.flatMap((key, groupIndex) => {
    return source[key].map((question, index) => ({
      id: groupIndex * 7 + index + 1,
      dimension: dimensionGroups[groupIndex].join('/'),
      question,
      options: [
        { text: optionTexts[groupIndex][0], value: dimensionGroups[groupIndex][0] },
        { text: optionTexts[groupIndex][1], value: index % 2 ? dimensionGroups[groupIndex][1] : dimensionGroups[groupIndex][0] },
        { text: optionTexts[groupIndex][2], value: dimensionGroups[groupIndex][1] }
      ]
    }));
  });
}

const prototypes = [
  ['IEVP', [48, 88, 62, 72]],
  ['ASVG', [72, 34, 42, 18]],
  ['ISCP', [44, 28, 24, 46]],
  ['IEVG', [24, 82, 68, 58]],
  ['IECG', [36, 42, 30, 36]],
  ['AEVG', [58, 70, 76, 24]],
  ['ASCP', [90, 42, 48, 62]],
  ['ASCG', [78, 30, 26, 34]],
  ['AEVP', [86, 70, 86, 78]],
  ['ISCG', [46, 24, 34, 12]],
  ['AECP', [64, 66, 82, 90]],
  ['ISVG', [22, 38, 22, 20]]
];

function calculate(answers) {
  const counter = { A: 0, I: 0, E: 0, S: 0, V: 0, C: 0, P: 0, G: 0 };
  answers.forEach((value) => {
    counter[value] += 1;
  });

  const pct = (a, b) => Math.round((100 * a) / Math.max(1, a + b));
  const dimensions = [
    pct(counter.A, counter.I),
    pct(counter.E, counter.S),
    pct(counter.V, counter.C),
    pct(counter.P, counter.G)
  ];

  const ranked = prototypes
    .map(([code, points]) => ({
      code,
      d: Math.sqrt(points.reduce((sum, point, index) => sum + (point - dimensions[index]) ** 2, 0) / 4)
    }))
    .sort((a, b) => a.d - b.d);

  return {
    code: ranked[0].code,
    personality: personalities[ranked[0].code],
    dimensions,
    fit: Math.max(0, Math.round(100 - ranked[0].d)),
    createdAt: Date.now()
  };
}

module.exports = { personalities, makeQuestions, calculate };
