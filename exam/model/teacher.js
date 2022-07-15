const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teacherSchema = new Schema(
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
    },
    isClassTeacher: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      min: 8,
      max: 20,
    },
    accountType: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      default: "Teacher",
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    token: {
      type: Schema.Types.ObjectId,
      ref: "Token",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Teacher", teacherSchema);
