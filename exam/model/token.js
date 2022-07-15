const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Student", "Teacher", "Admin"],
    default: "Teacher",
  }
});

module.exports = mongoose.model("Token", TokenSchema);
