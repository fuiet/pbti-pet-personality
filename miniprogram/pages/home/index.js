Page({
  data: {
    heroImage: '/images/hero-pets.png',
    logoImage: '/images/pbti-logo-transparent.png',
    types: [
      { code: 'IEVP', name: '探索家', image: '/images/personalities/cats/01-explorer-cat.webp' },
      { code: 'ASVG', name: '守护者', image: '/images/personalities/cats/02-guardian-cat.webp' },
      { code: 'ISCP', name: '梦想家', image: '/images/personalities/cats/03-dreamer-cat.webp' },
      { code: 'IEVG', name: '独行侠', image: '/images/personalities/cats/04-maverick-cat.webp' },
      { code: 'IECG', name: '学者', image: '/images/personalities/cats/05-scholar-cat.webp' },
      { code: 'AEVG', name: '领袖', image: '/images/personalities/cats/06-leader-cat.webp' },
      { code: 'ASCP', name: '陪伴者', image: '/images/personalities/cats/07-companion-cat.webp' },
      { code: 'ASCG', name: '治愈者', image: '/images/personalities/cats/08-healer-cat.webp' },
      { code: 'AEVP', name: '小太阳', image: '/images/personalities/cats/09-sunny-cat.webp' },
      { code: 'ISCG', name: '哨兵', image: '/images/personalities/cats/10-sentinel-cat.webp' },
      { code: 'AECP', name: '玩家', image: '/images/personalities/cats/11-player-cat.webp' },
      { code: 'ISVG', name: '贵族', image: '/images/personalities/cats/12-noble-cat.webp' }
    ]
  },

  start() {
    wx.navigateTo({ url: '/pages/create/index' });
  },

  openTypes() {
    wx.navigateTo({ url: '/pages/types/index' });
  },

  openAbout() {
    wx.navigateTo({ url: '/pages/about/index' });
  },

  onShareAppMessage() {
    return {
      title: '测测你家宠物是哪种 PBTI 性格',
      path: '/pages/home/index'
    };
  }
});
