const TYPES = [
  { code: 'IEVP', name: '探索家', tone: '好奇勇敢，第一时间去摸索新声音和新气味。', trait: '好奇、爱冒险、独立', care: '给它安全的新鲜感、轮换玩具和小范围探索机会。', catImage: '/images/personalities/cats/01-explorer-cat.webp', dogImage: '/images/personalities/dogs/01-explorer-dog.png' },
  { code: 'ASVG', name: '守护者', tone: '稳定忠诚，特别在意家庭环境的安全变化。', trait: '忠诚、守护、稳定', care: '保持作息规律，给它一个能安心观察变化的位置。', catImage: '/images/personalities/cats/02-guardian-cat.webp', dogImage: '/images/personalities/dogs/02-guardian-dog.png' },
  { code: 'ISCP', name: '梦想家', tone: '温柔细腻，在安静舒适的环境里最自在。', trait: '温柔、安静、享受舒适', care: '准备舒适休息区，用低压力的方式亲近它。', catImage: '/images/personalities/cats/03-dreamer-cat.webp', dogImage: '/images/personalities/dogs/03-dreamer-dog.png' },
  { code: 'IEVG', name: '独行侠', tone: '独立大胆，总能用自己的方式表达个性。', trait: '大胆、主见强、活跃', care: '提供选择和丰富活动，用清晰边界建立安全感。', catImage: '/images/personalities/cats/04-maverick-cat.webp', dogImage: '/images/personalities/dogs/04-maverick-dog.png' },
  { code: 'IECG', name: '学者', tone: '善于观察，冷静聪明，行动前会先看清局势。', trait: '聪明、敏锐、善思考', care: '安排益智游戏和耐心引导，给它足够的观察时间。', catImage: '/images/personalities/cats/05-scholar-cat.webp', dogImage: '/images/personalities/dogs/05-scholar-dog.png' },
  { code: 'AEVG', name: '领袖', tone: '自信外向，对自己想要什么表达得很明确。', trait: '自信、表达强、果断', care: '用游戏、任务和正向规则引导它释放精力。', catImage: '/images/personalities/cats/06-leader-cat.webp', dogImage: '/images/personalities/dogs/06-leader-dog.png' },
  { code: 'ASCP', name: '陪伴者', tone: '温暖亲人，熟悉且稳定的陪伴最能让它安心。', trait: '亲昵、黏人、温暖', care: '建立固定互动仪式，让陪伴变得简单稳定。', catImage: '/images/personalities/cats/07-companion-cat.webp', dogImage: '/images/personalities/dogs/07-companion-dog.png' },
  { code: 'ASCG', name: '治愈者', tone: '敏感柔和，常常能给身边的人带来安定感。', trait: '体贴、敏感、值得信任', care: '保护安静时间，用稳定的信号鼓励它建立自信。', catImage: '/images/personalities/cats/08-healer-cat.webp', dogImage: '/images/personalities/dogs/08-healer-dog.png' },
  { code: 'AEVP', name: '小太阳', tone: '开朗合群，很擅长把普通日常变成快乐时刻。', trait: '爱玩、合群、乐观', care: '给它足够的游戏、夸奖和互动，让热情被看见。', catImage: '/images/personalities/cats/09-sunny-cat.webp', dogImage: '/images/personalities/dogs/09-sunny-dog.png' },
  { code: 'ISCG', name: '哨兵', tone: '警觉耐心，能察觉环境里非常细微的变化。', trait: '警觉、耐心、敏锐', care: '允许它先观察，不要催促社交，保持环境信号稳定。', catImage: '/images/personalities/cats/10-sentinel-cat.webp', dogImage: '/images/personalities/dogs/10-sentinel-dog.png' },
  { code: 'AECP', name: '玩家', tone: '爱互动也爱捣蛋，常常把注意力变成一场游戏。', trait: '有趣、互动强、会撒娇', care: '用短游戏、玩具轮换和趣味训练持续满足它的好奇心。', catImage: '/images/personalities/cats/11-player-cat.webp', dogImage: '/images/personalities/dogs/11-player-dog.png' },
  { code: 'ISVG', name: '贵族', tone: '沉静优雅，安静自信，也很重视自己的空间。', trait: '优雅、从容、独立', care: '尊重边界，把亲近变成邀请，而不是要求。', catImage: '/images/personalities/cats/12-noble-cat.webp', dogImage: '/images/personalities/dogs/12-noble-dog.png' }
];

Page({
  data: {
    species: 'cat',
    types: TYPES
  },

  switchSpecies(e) {
    const species = e.currentTarget.dataset.species;
    if (species === 'cat' || species === 'dog') {
      this.setData({ species });
    }
  },

  start() {
    wx.navigateTo({ url: '/pages/create/index' });
  },

  onShareAppMessage() {
    return {
      title: '查看 12 种 PBTI 宠物性格',
      path: '/pages/types/index'
    };
  }
});
