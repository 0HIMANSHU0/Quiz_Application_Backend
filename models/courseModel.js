const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exams",
      required: true,
    },
  ],
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "questions",
    },
  ],
  level: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: Date, // Exam scheduled date and time
    // required: true,
  },
  totalMarks: {
    type: Number, // Total marks for the course
    required: true,
  },
  passingMarks: {
    type: Number, // Passing marks for the course
    required: true,
  },
  numberOfQuestions: {
    type: Number, // Add this field for the number of questions
    required: true,
  },
});

const Course = mongoose.model("courses", courseSchema);
module.exports = Course;
