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
  { label: "Cat", value: "cat" },
  { label: "Dog", value: "dog" },
];

const GENDER_OPTIONS = [
  { label: "Unknown", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

module.exports = {
  APP_CONFIG,
  SPECIES_OPTIONS,
  GENDER_OPTIONS,
};
