const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    person: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    colleges: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "colleges",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const University = mongoose.model("universities", universitySchema);
module.exports = University;
