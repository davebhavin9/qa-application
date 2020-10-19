module.exports = app => {
    const questions = require("../controllers/question-controller");
    const answers = require("../controllers/answer-controllers");

    const router = require("express").Router();


      app.use('/v1', router.get("/questions", questions.getAllQuestions));
      app.use('/v1', router.post("/question", questions.create));
      app.use('/v1', router.get("/user/:id", questions.getUserById));
      app.use('/v1', router.get("/question/:question_id", questions.getQuestion));
      app.use('/v1', router.delete("/question/:question_id", questions.deleteQuestion));
      app.use('/v1', router.put("/question/:question_id", questions.updateQuestion));
      app.use('/v1', router.post("/question/:question_id/answer", answers.create));
      app.use('/v1', router.get("/question/:question_id/answer/:answer_id", answers.getAnswer));
      app.use('/v1', router.put("/question/:question_id/answer/:answer_id", answers.updateAnswer));
      app.use('/v1', router.delete("/question/:question_id/answer/:answer_id", answers.deleteAnswer));
};