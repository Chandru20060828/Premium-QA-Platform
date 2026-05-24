// =============================================
// controllers/questionController.js
// Handles question CRUD operations
// =============================================

const Question = require("../models/Question");
const User = require("../models/User");
const moment = require("moment-timezone");

/**
 * @route   POST /api/questions
 * @desc    Post a new question
 * @access  Private
 * @middleware checkQuestionLimit (applied in route)
 */
const postQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ success: false, message: "Title and body are required" });
    }

    // Create the question
    const question = await Question.create({
      user: req.user._id,
      title,
      body,
      tags: tags || [],
    });

    // Increment user's daily question count
    const user = await User.findById(req.user._id);
    user.dailyQuestionCount += 1;
    user.lastQuestionDate = new Date();
    await user.save();

    // Recalculate remaining after posting
    const { plan, limit, remaining } = req.questionLimit;
    const newRemaining =
      remaining === "Unlimited" ? "Unlimited" : remaining - 1;

    res.status(201).json({
      success: true,
      message: "Question posted successfully!",
      question: {
        id: question._id,
        title: question.title,
        body: question.body,
        tags: question.tags,
        createdAt: question.createdAt,
      },
      quotaInfo: {
        plan,
        limit,
        used: user.dailyQuestionCount,
        remaining: newRemaining,
      },
    });
  } catch (error) {
    console.error("Post question error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route   GET /api/questions
 * @desc    Get all questions (paginated)
 * @access  Private
 */
const getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .populate("user", "name subscription") // Include user info
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments();

    res.json({
      success: true,
      questions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route   GET /api/questions/:id
 * @desc    Get single question by ID
 * @access  Private
 */
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("user", "name subscription")
      .populate("answers.user", "name");

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Increment views
    question.views += 1;
    await question.save();

    res.json({ success: true, question });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route   POST /api/questions/:id/answer
 * @desc    Post an answer to a question
 * @access  Private
 */
const postAnswer = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) {
      return res
        .status(400)
        .json({ success: false, message: "Answer body is required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    question.answers.push({ user: req.user._id, body });
    await question.save();

    res.status(201).json({ success: true, message: "Answer posted!" });
  } catch (error) {
    console.error("Post answer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route   GET /api/questions/my-questions
 * @desc    Get questions posted by logged-in user
 * @access  Private
 */
const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, questions });
  } catch (error) {
    console.error("My questions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  postQuestion,
  getAllQuestions,
  getQuestionById,
  postAnswer,
  getMyQuestions,
};
