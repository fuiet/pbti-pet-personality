const { getQuestions } = require("../../utils/questions");
const { calculatePBTI } = require("../../utils/pbti");
const { loadTestContext, saveLatestResult } = require("../../utils/storage");
const { saveTestRecord } = require("../../utils/cloud");

Page({
  data: {
    testContext: null,
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    answers: {},
    progressText: "",
    progressPercent: 0,
    transitionClass: "enter",
  },

  onLoad() {
    const testContext = getApp().globalData.currentTestContext || loadTestContext() || { species: "cat" };
    const questions = getQuestions(testContext.species);
    this.setData({
      testContext,
      questions,
      currentQuestion: questions[0],
      progressText: `1 / ${questions.length}`,
      progressPercent: Math.round(100 / questions.length),
    });
  },

  animateToQuestion(nextIndex) {
    const nextQuestion = this.data.questions[nextIndex];
    this.setData({ transitionClass: "leave" });

    setTimeout(() => {
      this.setData({
        currentIndex: nextIndex,
        currentQuestion: nextQuestion,
        progressText: `${nextIndex + 1} / ${this.data.questions.length}`,
        progressPercent: Math.round(((nextIndex + 1) / this.data.questions.length) * 100),
        transitionClass: "enter",
      });
    }, 120);
  },

  chooseOption(event) {
    const answer = event.currentTarget.dataset.value;
    const questionId = this.data.currentQuestion.id;
    const answers = {
      ...this.data.answers,
      [questionId]: answer,
    };

    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      const answerList = this.data.questions.map((question) => answers[question.id]);
      const result = calculatePBTI(answerList);
      const payload = {
        testContext: this.data.testContext,
        answers,
        result,
      };

      saveLatestResult(payload);
      getApp().globalData.latestResult = payload;
      saveTestRecord(payload)
        .then((res) => {
          if (res?.payload) {
            getApp().globalData.latestResult = res.payload;
            saveLatestResult(res.payload);
          }
        })
        .catch(() => {})
        .finally(() => {
          wx.redirectTo({ url: "/pages/result/index" });
        });
      return;
    }

    this.setData({ answers });
    this.animateToQuestion(nextIndex);
  },

  previousQuestion() {
    if (this.data.currentIndex === 0) {
      wx.navigateBack();
      return;
    }

    this.animateToQuestion(this.data.currentIndex - 1);
  },

  skipToUpload() {
    wx.navigateBack({ delta: 1 });
  },
});
