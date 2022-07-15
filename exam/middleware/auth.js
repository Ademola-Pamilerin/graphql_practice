const jwt = require("jsonwebtoken");
const TokenModel = require("../model/token");
const studentModel = require("../model/user");
const teacherModel = require("../model/teacher");
const adminModel = require("../model/admin");
const generate = require("../util/generate");

const Auth = async (req, res, next) => {
  try {
    const authorization = req.get("Authorization");
    const refreshToken = req.get("Refresh_Token");
    if (!authorization || !refreshToken) {
      const error = new Error("UnAuthorised");
      error.status = 422;
      req.authErr = error;
      req.isAuth = false;
      throw error
    }
    req.isAuth = false;
    const token = authorization.replace("Bearer ", "");
     jwt.verify(token, process.env.JWT_SECRET, async (err, val) => {
      if (err) {
        if (err.message === "jwt expired") {
          if (!refreshToken) {
            const error = new Error("Please login to continue");
            error.status = 500;
            req.authErr = error;
            req.isAuth = false;
            throw error
          }
          const token_Id = await TokenModel.findOne({ refreshToken, token }).select("user").select("type");
          if (!token_Id) {
            const error = new Error("Please login to continue");
            error.status = 500;
            req.authErr = error;
            req.isAuth = false;
            throw error
          }
          let user;
          if (token_Id.type === "Admin") {
            user = await adminModel.findOne({ _id: token_Id.user, token: token_Id._id });
          } else if (token_Id.type === "Teacher") {
            user = await teacherModel.findOne({ _id: token_Id.user, token: token_Id._id });
          } else {
            user = await studentModel.findOne({ _id: token_Id.user, token: token_Id._id });
          }

          if (!user) {
            const error = new Error("Please login to continue");
            error.status = 500;
            req.authErr = error;
            req.isAuth = false;
            throw error
          }
          const new_token = jwt.sign({ user: user._id, _id: user._id, type: user.type }, process.env.JWT_SECRET, {
            expiresIn: "2hr"
          })
          const refresh_Tok = await generate(230)
          const result = await TokenModel.findByIdAndUpdate(user._doc.token, { token: new_token, refreshToken: refresh_Tok });
          req.token = new_token
          req.authErr = null;
          req.type = user.accountType;
          req.isAuth = true;
          req.user = user;
          return next();
        } else if (err.message === "jwt malformed") {
          const error = new Error("Please login to continue");
          error.status = 400;
          req.isAuth = false;
          req.authErr = error;
          throw error
        } else {
          const error = new Error("Please login to continue");
          error.status = 400;
          req.isAuth = false;
          req.authErr = error;
          throw error
        }
      }

      const { email, type, _id } = val;
      let user;
      if (type === "Admin") {
        user = await adminModel.findOne({ _id, email });
      } else if (type === "Teacher") {
        user = await teacherModel.findOne({ _id, email });
      } else {
        user = await studentModel.findOne({ _id, email });
      }

      if (!user) {
        const error = new Error("Please login to continue");
        error.status = 400;
        req.isAuth = false;
        req.authErr = error;
        throw error
      }

      req.type = val.type;
      req.authErr = null;
      req.user = user;
      req.isAuth = true;
      next();
    });
  } catch (error) {
    const errordata = new Error(error.message);
    errordata.status = 400;
    req.isAuth = false;
    req.authErr = errordata;
    return next();
    // throw error.message
  }
};
module.exports = Auth;
