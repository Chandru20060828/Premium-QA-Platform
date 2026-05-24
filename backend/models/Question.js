// =============================================
// models/Question.js - Question Schema
// =============================================

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // Reference to user who asked the question
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Question title is required"],
      trim: true,
      minlength: 10,
      maxlength: 200,
    },

    body: {
      type: String,
      required: [true, "Question body is required"],
      trim: true,
      minlength: 20,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Answers for this question
    answers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        body: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
