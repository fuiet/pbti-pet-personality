const { heroImages, personalityImages } = require("../../utils/imageAssets");

Page({
  data: {
    heroImages,
    personalityCards: [
      { index: "01", name: "探索家", code: "IEVP", image: personalityImages.IEVP },
      { index: "02", name: "守护者", code: "ASVG", image: personalityImages.ASVG },
      { index: "03", name: "梦想家", code: "ISCP", image: personalityImages.ISCP },
      { index: "04", name: "独行侠", code: "IEVG", image: personalityImages.IEVG },
      { index: "05", name: "学者", code: "IECG", image: personalityImages.IECG },
      { index: "06", name: "领袖", code: "AEVG", image: personalityImages.AEVG },
      { index: "07", name: "陪伴者", code: "ASCP", image: personalityImages.ASCP },
      { index: "08", name: "治愈者", code: "ASCG", image: personalityImages.ASCG },
      { index: "09", name: "小太阳", code: "AEVP", image: personalityImages.AEVP },
      { index: "10", name: "哨兵", code: "ISCG", image: personalityImages.ISCG },
      { index: "11", name: "玩伴", code: "AECP", image: personalityImages.AECP },
      { index: "12", name: "贵族", code: "ISVG", image: personalityImages.ISVG },
    ],
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar) tabBar.setData({ selected: 0 });
  },

  goCreate() {
    wx.navigateTo({ url: "/pages/create/index" });
  },
});
