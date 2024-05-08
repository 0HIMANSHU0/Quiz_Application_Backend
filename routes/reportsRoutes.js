const express = require("express");
const router = express.Router();
const Report = require("../models/reportModel");
// const Exam = require("../models/examModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Add Reports
router.post("/add-report", authMiddleware, async (req, res) => {
  try {
    const newReport = new Report(req.body);
    await newReport.save();
    res.status(200).send({
      message: "Report Added Successfully",
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get All Reports
router.post("/get-all-reports", authMiddleware, async (req, res) => {
  try {
    // Use req.query to get the search parameter
    const search = req.query.search || "";

    // Find the user(s) based on the provided user name
    const users = await User.find({ name: { $regex: search, $options: "i" } });

    // Extract user IDs from the found users
    const userIds = users.map(user => user._id);

    // Use the user IDs to find all reports associated with those users
    const allReports = await Report.find({ user: { $in: userIds } })
      .populate("course")
      .populate("user")
      .sort({ createdAt: -1 });
    res.status(200).send({
      message: "All Reports by the Admin Fetched Successfully",
      data: allReports,
      success: true,
    });
  } catch (error) {
    res.status(500).send({ message: error.message, success: false });
  }
});

// Get All Reports by User
router.post("/get-all-reports-by-user", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.body.userId })
      .populate("course")
      .populate("user")
      .sort({ createdAt: -1 });
    res.status(200).send({
      message: "All User Reports Fetched Successfully",
      data: reports,
      success: true,
    });
  } catch (error) {
    res.status(500).send({ message: error.message, success: false });
  }
});

module.exports = router;

// const { examName, userName} = req.body;

// const exams = await Course.find({
//   name: {
//     $regex: examName,
//   },
// });
// const matchedExamIds = exams.map((exam) => exam._id);
// const users = await User.find({
//   name: {
//     $regex: userName,
//   },
// });

// const matchedUserIds = users.map((user) => user._id);
