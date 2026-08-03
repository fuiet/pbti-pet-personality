const APP_CONFIG = {
  cloudEnv: "cloud1-d4grkzmi3cc25adce",
  appName: "PBTI Pet",
  adUnitIds: {
    banner: "adunit-banner-placeholder",
    rewardReport: "adunit-reward-report-placeholder",
    rewardPortrait: "adunit-reward-portrait-placeholder",
  },
  freeReportPreviewChapters: 3,
  maxPetPhotos: 3,
};

const SPECIES_OPTIONS = [
  { label: "猫咪", value: "cat" },
  { label: "狗狗", value: "dog" },
];

const GENDER_OPTIONS = [
  { label: "未填写", value: "" },
  { label: "公", value: "male" },
  { label: "母", value: "female" },
];

const AGE_OPTIONS = [
  "6 个月以内",
  "6-12 个月",
  "1 岁",
  "2 岁",
  "3 岁",
  "4 岁",
  "5 岁",
  "6-8 岁",
  "9-11 岁",
  "12 岁以上",
];

const CAT_BREED_OPTIONS = [
  "不确定 / 混血",
  "英短",
  "美短",
  "布偶",
  "缅因",
  "暹罗",
  "波斯",
  "斯芬克斯",
  "苏格兰折耳",
  "俄罗斯蓝猫",
  "挪威森林猫",
  "中华田园猫",
];

const DOG_BREED_OPTIONS = [
  "不确定 / 混血",
  "金毛",
  "拉布拉多",
  "柯基",
  "柴犬",
  "边牧",
  "贵宾",
  "比熊",
  "法斗",
  "萨摩耶",
  "哈士奇",
  "中华田园犬",
];

module.exports = {
  APP_CONFIG,
  SPECIES_OPTIONS,
  GENDER_OPTIONS,
  AGE_OPTIONS,
  CAT_BREED_OPTIONS,
  DOG_BREED_OPTIONS,
};
