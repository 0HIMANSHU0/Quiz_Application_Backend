const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    programs: {
      type: Object,
      required: true,
    },
    person:{
      type: String, 
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "universities",
    },
    address: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const College = mongoose.model("colleges", collegeSchema);
module.exports = College;
