const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    email: {
      required: true,
      unique: true,
      type: String,
      minlength: 4,
      trim: true,
    },
    mailVerfied: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    classTeacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
    admNo: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      min: 8,
      max: 20,
    },
    token: {
      type: Schema.Types.ObjectId,
      ref: "Token",
    },
    accountType: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      default: "Student",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", userSchema);
