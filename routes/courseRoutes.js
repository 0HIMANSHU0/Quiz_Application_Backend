const express = require("express");
const router = express.Router();
const Course = require("../models/courseModel");
const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Add Course
router.post("/add-course", authMiddleware, async (req, res) => {
  try {
    // Check if Course already exists
    const courseExists = await Course.findOne({ name: req.body.name });
    if (courseExists) {
      return res
        .status(200)
        .send({ message: "Course Already Exists", success: false });
    }

    // Create a new course without populating exams and questions
    const newCourse = new Course(req.body);

    // Add Exams to Course
    const selectedExamIds = req.body.exams;
    // console.log("The selected exam Ids(Requested):", selectedExamIds);

    const exams = await Exam.find({ _id: { $in: selectedExamIds } }).populate({
      path: "questions",
      populate: { path: "options" },
    });

    const selectedLevel = req.body.level;

    // Populate the exams field in the new course with actual exam documents
    newCourse.exams = exams.map((exam) => exam._id);


    // Calculate the total number of questions for the selected exams and level
    const totalQuestionsSelected = exams.reduce(
      (total, exam) =>
      total +
      exam.questions.filter((question) => question.level === selectedLevel)
      .length,
      0
    );

    // Checking if the Number of Questions Exceeds the Total Available Questions
    if (req.body.numberOfQuestions > totalQuestionsSelected) {
      return res.status(200).send({
        message: "Number of questions exceeds the total available questions",
        success: false,
      });
    }

    // Filter question IDs by the selected exams and difficulty level
    const questionIds = exams.reduce((allQuestions, exam) => {
      if (exam.questions && Array.isArray(exam.questions)) {
        const filteredQuestions = exam.questions
          .filter((question) => question.level === selectedLevel)
          .map((question) => question._id);

        return allQuestions.concat(filteredQuestions);
      } else {
        return allQuestions;
      }
    }, []);

    // Randomly select questions based on proportion to the total number of questions
    const totalAvailableQuestions = questionIds.length;
    const selectedCount = Math.min(
      req.body.numberOfQuestions,
      totalAvailableQuestions
    );

    const randomlySelectedIndices = [];
    while (randomlySelectedIndices.length < selectedCount) {
      const randomIndex = Math.floor(Math.random() * totalAvailableQuestions);
      // console.log("RandomIndex: ", randomIndex);
      if (!randomlySelectedIndices.includes(randomIndex)) {
        randomlySelectedIndices.push(randomIndex);
      }
    }

    const randomlySelectedQuestions = randomlySelectedIndices.map(
      (index) => questionIds[index]
    );

    // console.log(randomlySelectedQuestions);

    // Logging the filtered questionIds
    // console.log("Filtered Question IDs:", randomlySelectedQuestions);

    // Check if there are questions of the specified level
    if (randomlySelectedQuestions.length === 0) {
      return res.status(200).send({
        message: `No questions found for the selected level: ${selectedLevel}`,
        success: false,
      });
    }

    // Populate the questions field in the new course with actual question documents
    newCourse.questions = await Question.find({
      _id: { $in: randomlySelectedQuestions },
    }).populate("options");

    // Save the new course to the database
    const savedCourse = await newCourse.save();

    // Now, fetch the course again to apply population
    const populatedCourse = await Course.findById(savedCourse._id)
      .populate("exams")
      .populate("questions");

    res.status(200).send({
      message: "Course Added Successfully",
      data: populatedCourse,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get All Course
router.post("/get-all-course", authMiddleware, async (req, res) => {
  try {
    // Fetch the course again to apply population
    const populatedCourse = await Course.find({})
      .populate("exams")
      .populate("questions");
    // console.log(populatedCourse)
    res.status(200).send({
      message: "All Courses Fetched Successfully.",
      data: populatedCourse,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Get a Single Course with Id
router.post("/get-course-by-id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId)
      .populate("exams")
      .populate("questions");
    res.status(200).send({
      message: "Course Fetched Successfully",
      data: course,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Delete Course with Id
router.post("/delete-course-by-id", authMiddleware, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.body.courseId);
    res
      .status(200)
      .send({ message: "Course Deleted Successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Edit Course with Id
router.post("/edit-course-by-id", authMiddleware, async(req,res)=>{
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.body.courseId, req.body);
    res.status(200).send({message: "Course Updated Successfully", data: updatedCourse, success: true})
  } catch (error) {
    res.status(500).send({message: error.message, data: error, success: false})
  }
})
module.exports = router;
