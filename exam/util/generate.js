const crypto = require("crypto");

const generate = (value) => {
  const val = crypto.randomBytes(value);
  const cryptoVal = val.toString("hex");
  return cryptoVal;
};
module.exports = generate;
