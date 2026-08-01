Component({
  data: {
    selected: 0,
    list: [
      { pagePath: "/pages/home/index", text: "首页" },
      { pagePath: "/pages/portraits/index", text: "AI写真" },
      { pagePath: "/pages/account/index", text: "我的" },
    ],
  },

  attached() {
    this.syncSelected();
  },

  pageLifetimes: {
    show() {
      this.syncSelected();
    },
  },

  methods: {
    syncSelected() {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      const route = current ? `/${current.route}` : "";
      const selected = this.data.list.findIndex((item) => item.pagePath === route);
      this.setData({ selected: selected < 0 ? 0 : selected });
    },

    switchTab(event) {
      const { index } = event.currentTarget.dataset;
      const item = this.data.list[index];
      if (!item) return;
      wx.switchTab({ url: item.pagePath });
    },
  },
});
