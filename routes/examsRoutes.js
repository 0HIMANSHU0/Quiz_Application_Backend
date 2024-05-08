const express = require("express");
const router = express.Router();
const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const csv = require("csvtojson");

// Add Exam
router.post("/add", authMiddleware, async (req, res) => {
  try {
    // Check if Exam already exists
    const examExists = await Exam.findOne({ name: req.body.name });
    if (examExists) {
      return res
        .status(200)
        .send({ message: "Subject Already Exists", success: false });
    }
    req.body.questions = [];
    const newExam = await Exam(req.body);
    await newExam.save();
    res
      .status(200)
      .send({ message: "Subject Added Successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get All Exams
router.post("/get-all-exams", authMiddleware, async (req, res) => {
  try {
    const exams = await Exam.find({});
    res.status(200).send({
      message: "Subjects Fetched Successfully",
      data: exams,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get a Single Exam with Exam ID
router.post("/get-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.body.examId).populate("questions");
    res.status(200).send({
      message: "Subject Fetched Successfully",
      data: exam,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Edit Exam by Id
router.post("/edit-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(req.body.examId, req.body);
    res.status(200).send({
      message: "Subject Edited Successfully",
      data: updatedExam,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Delete Exam by Id
router.post("/delete-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const data = await Exam.findByIdAndDelete(req.body.examId);
    res.status(200).send({
      message: "Subject Deleted Successfully",
      data: data,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Add Questions to Exam
router.post("/add-question-to-exam", authMiddleware, async (req, res) => {
  try {
    // Add question to questions collections
    const newQuestion = new Question(req.body);
    const question = await newQuestion.save();

    // Add questions to the Exam
    const exam = await Exam.findById(req.body.exam);
    exam.questions.push(question._id);

    await exam.save();
    res
      .status(200)
      .send({ message: "Question Added Successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Edit question in a Exam
router.post("/edit-question-in-exam", authMiddleware, async (req, res) => {
  try {
    // Edit question in question Collections
    await Question.findByIdAndUpdate(req.body.questionId, req.body);
    res
      .status(200)
      .send({ message: "Question Edited Successfully", success: true });
  } catch (error) {
    res.status(500).send({ message: error.message, success: false });
  }
});

// delete question in a Exam
router.post("/delete-question-in-exam", authMiddleware, async (req, res) => {
  try {
    // delete question in question Collections
    await Question.findByIdAndDelete(req.body.questionId);

    // Delete qustion in exam
    const exam = await Exam.findById(req.body.examId);
    exam.questions = exam.questions.filter((question) => {
      return question._id != req.body.questionId;
    });
    await exam.save();
    res
      .status(200)
      .send({ message: "Question Delete Successfully", success: true });
  } catch (error) {
    res.status(500).send({ message: error.message, success: false });
  }
});

// Get all question
router.post("/get-all-question", async (req, res) => {
  try {

    const search = req.query.text || ""; 

    // console.log("The serach in the query is:", search)

    const questions = await Question.find({
      name: { $regex: search, $options: "i" } 
    }).populate("exam");

    res.status(200).send({
      message: "All questions fetched successfully.",
      data: questions,
      success: true,
    });
  } catch (error) {
    res.status(500).send({ message: error.message, success: false });
  }
});

// import Question from CSV to the database
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
});

// const upload = multer({ dest: "uploads/" });

router.post(
  "/upload-questions",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      // Check if a file is uploaded
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No file uploaded", success: false });
      }

      // Process your CSV file here
      const jsonArray = await csv().fromFile(req.file.path);

      // Transform options into key-value pairs
      const formattedArray = jsonArray.map((question) => {
        const formattedOptions = {};

        // Check if the 'options' field is present and non-empty
        if (question.options && question.options.trim() !== "") {
          const optionsArray = question.options.split(", ");

          optionsArray.forEach((option) => {
            const [key, value] = option.split(":").map((part) => part.trim());

            // Check if both key and value are present
            if (key && value) {
              formattedOptions[key] = value;
            }
          });
        }

        return {
          name: question.name,
          level: question.level,
          options: formattedOptions,
          correctOption: question.correctOption,
          exam: req.body.exam, // Assuming exam ID is sent in the request body
        };
      });

      // Save each formatted question into the database
      const savedQuestions = await Promise.all(
        formattedArray.map(async (formattedQuestion) => {
          const newQuestion = new Question(formattedQuestion);
          return await newQuestion.save();
        })
      );

      // Add saved questions to the Exam
      const examId = req.body.exam; // Assuming exam ID is sent in the request body
      // console.log(examId);
      const exam = await Exam.findById(examId);

      // Initialize questions field if it doesn't exist
      if (!exam.questions) {
        exam.questions = [];
      }

      savedQuestions.forEach((question) => {
        exam.questions.push(question._id);
      });

      await exam.save();

      // Send a success response
      res.status(200).send({
        message: "Questions Imported Successfully",
        data: savedQuestions,
        success: true,
      });
    } catch (error) {
      // console.error("Error during CSV processing:", error);
      res
        .status(500)
        .send({ message: "Internal Server Error", success: false });
    }
  }
);
module.exports = router;
