const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    correctOption: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exams",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
    },
  },
  {
    timestamps: true,
  }
);
const Question = mongoose.model("questions", questionSchema);
module.exports = Question;
