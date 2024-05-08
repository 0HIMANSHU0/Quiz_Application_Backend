const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs/dist/bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

// User Registeration
router.post("/register", async (req, res) => {
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User Already Exists", success: false });
    }

    // Hashing the Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Create a New User
    const newUser = new User(req.body);
    await newUser.save();
    return res
      .status(200)
      .send({ message: "User Created Successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    // Check if user already exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User Doesn't Exists", success: false });
    }
    // Check Password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res
        .status(200)
        .send({ message: "Invalid Password", success: false });
    }

    // Generate Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.send({
      message: "User Logged In Successfully!",
      success: true,
      data: token,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get User Information and send it to the FrontEnd
router.post("/get-user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    res.send({
      message: "User Info Fetched Successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get All User Information
router.post("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.status(200).send({
      message: "All Users Fetched Successfully.",
      data: allUsers,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, data: error, success: false });
  }
});

// Get a Single User with User ID
router.post("/get-user-by-id", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    res.status(200).send({
      message: "User Fetched Successfully",
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});
module.exports = router;
