// routes/questionRoutes.js
const express = require("express");
const router = express.Router();
const {
  postQuestion, getAllQuestions, getQuestionById, postAnswer, getMyQuestions,
} = require("../controllers/questionController");
const { protect } = require("../middleware/authMiddleware");
const { checkQuestionLimit } = require("../middleware/questionLimitMiddleware");

router.get("/", protect, getAllQuestions);
router.get("/my-questions", protect, getMyQuestions);
router.post("/", protect, checkQuestionLimit, postQuestion);
router.get("/:id", protect, getQuestionById);
router.post("/:id/answer", protect, postAnswer);

module.exports = router;
