const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  email: {
    type: "String",
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "Admin",
  },
  token: {
    type: Schema.Types.ObjectId,
    ref: "Token",
  },
});

module.exports = mongoose.model("Admin", adminSchema);
