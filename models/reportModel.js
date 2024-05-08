const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    result: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("reports", reportSchema);
module.exports = Report;
