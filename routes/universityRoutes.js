const express = require("express");
const router = express.Router();
const Univeristy = require("../models/universityModel");
const authMiddleware = require("../middlewares/authMiddleware");
const University = require("../models/universityModel");
const College = require("../models/collegeModel");

// Add University
router.post("/add-university", authMiddleware, async (req, res) => {
  try {
    // Check if University already Exists
    const universityExists = await University.findOne({ name: req.body.name });
    if (universityExists) {
      return res.status(200).send({
        message: `${universityExists.name} is already exists`,
        success: false,
      });
    }
    req.body.colleges = [];
    const newUniversity = await University(req.body);
    await newUniversity.save();
    res.status(200).send({
      message: "University added Successfully",
      data: newUniversity,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get all Universities
router.post("/get-all-university", authMiddleware, async (req, res) => {
  try {
    const response = await University.find({}).populate("colleges");
    res.status(200).send({
      message: "All Universites Information Fetched Successfully",
      data: response,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get Single University By Id
router.post("/get-university-by-id", authMiddleware, async (req, res) => {
  try {
    const university = await Univeristy.findById(
      req.body.universityId
    ).populate("colleges");
    res.status(200).send({
      message: "University Fetched Successfully",
      data: university,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Edit University By Id
router.post("/edit-university-by-id", authMiddleware, async (req, res) => {
  try {
    const updatedUniversity = await University.findByIdAndUpdate(
      req.body.universityId,
      req.body
    );
    res.status(200).send({
      message: "University Updated Successfully",
      data: updatedUniversity,
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

// Delete University By Id
router.post("/delete-university-by-Id", authMiddleware, async (req, res) => {
  try {
    await University.findByIdAndDelete(req.body.universityId);
    res.status(200).send({
      message: "University Deleted Successfully",
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

// Add College to the University
router.post("/add-college-to-university", authMiddleware, async (req, res) => {
  try {
    // Add College to the College Collection
    // console.log(req.body);
    const newCollege = new College(req.body);
    const college = await newCollege.save();

    // Add College to the University Collection
    const university = await University.findById(req.body.university);
    university.colleges.push(college._id);

    await university.save();
    res.status(200).send({
      message: "College Added to University Successfully.",
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

// Edit College in the Selected University
router.post("/edit-college-in-university", authMiddleware, async (req, res) => {
  try {
    const updatedCollege = await College.findByIdAndUpdate(
      req.body.collegeId,
      req.body
    );
    res
      .status(200)
      .send({
        message: "College Updated Successfully",
        data: updatedCollege,
        success: true,
      });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Delete College in the University
router.post("/delete-college-in-university", authMiddleware, async (req, res) => {
  try {
    // Delete the College by its ID
    await College.findByIdAndDelete(req.body.collegeId);

    // Delete the College from the University
    const university = await University.findById(req.body.universityId);
    // console.log(university.colleges);

    // Use filter with a return statement
    university.colleges = university.colleges.filter((college) => {
      return college._id != req.body.collegeId;
    });

    await university.save();
    res.status(200).send({ message: "College Deleted Successfully", success: true });
  } catch (error) {
    res.status(500).send({ message: error.message, data: error, success: false });
  }
});

module.exports = router;
