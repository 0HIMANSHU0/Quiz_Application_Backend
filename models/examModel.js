const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: {
    type:[mongoose.Schema.Types.ObjectId],
    ref: "questions",
    required: true,
  },
}, {
  timestamps: true,
});

const Exam = mongoose.model("exams", examSchema);
module.exports = Exam;
