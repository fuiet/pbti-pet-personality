const { SPECIES_OPTIONS, GENDER_OPTIONS, CAT_BREED_OPTIONS, DOG_BREED_OPTIONS, AGE_OPTIONS } = require("../../utils/constants");
const { heroImages } = require("../../utils/imageAssets");
const { loadPetDraft, savePetDraft, loadTestContext, saveTestContext } = require("../../utils/storage");

function buildInitialDraft() {
  return {
    name: "",
    species: "cat",
    breed: "",
    age: "",
    gender: "",
  };
}

Page({
  data: {
    heroImages,
    speciesOptions: SPECIES_OPTIONS,
    genderOptions: GENDER_OPTIONS,
    ageOptions: AGE_OPTIONS,
    breedOptions: CAT_BREED_OPTIONS,
    profile: buildInitialDraft(),
    submitDisabled: true,
  },

  onShow() {
    const savedProfile = loadPetDraft();
    const testContext = loadTestContext();
    const profile = {
      ...buildInitialDraft(),
      ...(testContext || {}),
      ...(savedProfile || {}),
    };

    this.setData({
      profile,
      breedOptions: profile.species === "dog" ? DOG_BREED_OPTIONS : CAT_BREED_OPTIONS,
      submitDisabled: !profile.name.trim(),
    });
  },

  updateProfileField(field, value) {
    const nextProfile = {
      ...this.data.profile,
      [field]: value,
    };

    this.setData({
      profile: nextProfile,
      submitDisabled: !nextProfile.name.trim(),
    });

    savePetDraft(nextProfile);
  },

  onNameInput(event) {
    this.updateProfileField("name", event.detail.value.trimStart());
  },

  selectSpecies(event) {
    const species = event.currentTarget.dataset.value;
    const nextBreedOptions = species === "dog" ? DOG_BREED_OPTIONS : CAT_BREED_OPTIONS;
    const currentBreed = this.data.profile.breed;
    const nextBreed = nextBreedOptions.includes(currentBreed) ? currentBreed : "";
    const nextProfile = {
      ...this.data.profile,
      species,
      breed: nextBreed,
    };

    this.setData({
      profile: nextProfile,
      breedOptions: nextBreedOptions,
      submitDisabled: !nextProfile.name.trim(),
    });

    savePetDraft(nextProfile);
  },

  onBreedChange(event) {
    const index = Number(event.detail.value);
    const breed = this.data.breedOptions[index] || "";
    this.updateProfileField("breed", breed);
  },

  onAgeChange(event) {
    const index = Number(event.detail.value);
    const age = this.data.ageOptions[index] || "";
    this.updateProfileField("age", age);
  },

  selectGender(event) {
    const gender = event.currentTarget.dataset.value;
    this.updateProfileField("gender", gender);
  },

  goNext() {
    const profile = {
      ...this.data.profile,
      name: this.data.profile.name.trim(),
    };

    if (!profile.name) {
      wx.showToast({ title: "请先填写宠物名字", icon: "none" });
      return;
    }

    const currentTestContext = loadTestContext() || {};
    const nextTestContext = {
      ...currentTestContext,
      ...profile,
    };

    savePetDraft(profile);
    saveTestContext(nextTestContext);
    getApp().globalData.currentTestContext = nextTestContext;
    wx.navigateTo({ url: "/pages/upload/index" });
  },
});
