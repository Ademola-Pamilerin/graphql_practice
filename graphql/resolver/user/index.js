const auths = require("./auth")
const resets = require("./resetter")
const verifications = require("./verification")
const infos=require("./info")
const jwt=require("jsonwebtoken")


module.exports = {
  ...auths,
  ...resets,
  ...verifications,
...infos
};
