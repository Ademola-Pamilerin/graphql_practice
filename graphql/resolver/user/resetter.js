const TeacherModel = require("../../../model/teacher");
const AdminModel = require("../../../model/admin");
const jwt = require("jsonwebtoken");
const generate = require("../../../util/generate");
const TokenModel = require("../../../model/token");
const studentModel = require("../../../model/user")
const { sendMail } = require("../../../util/mail");
const validator = require("validator")
const bcrypt = require("bcrypt")




module.exports = {
    GetMailForResetPassword: async (args, req) => {
        const email = args.email;
        const isEmail = validator.isEmail(email);
        if (!isEmail) {
            const error = new Error("Email Address is not a valid Email Address");
            error.status = 422;
            throw error;
        }
        let user =
            await studentModel.findOne({ email }) ||
            await TeacherModel.findOne({ email }) ||
            await AdminModel.findOne({ email });
        if (!user) {
            const error = new Error("Account not found");
            error.status = 405;
            throw error;
        }
        const payload = {
            _id: user._id,
            email: user.email,
            type: user.type
        };
        const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1hr",
        });
        const refreshToken = generate(200);
        const tokenSave = await TokenModel.findOneAndUpdate(
            { user: user._id },
            { token: generatedToken, refreshToken }
        );
        await tokenSave.save();
        await user.save();
        //   await SendMail.sendMail(user.email, newToken, user._id);
        return "A mail has been sent to you";
    },

    setPassword: async (args, req) => {
        const verification = req.get("Verification")
        const token = verification.split("|")[0]
        const id = verification.split("|")[1]
        return jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                if (err.message === "jwt expired") {
                    const error = new Error("Link Expired, Go to forgotten password");
                    error.status = 500;
                    throw error
                } else {
                    const error = new Error("Invalid Link, Please try again later");
                    error.status = 400;
                    throw error
                }
            }
            const { type, _id: id } = payload
            const { password, confirm_password } = args.data
            if (!(password === confirm_password)) {
                const error = new Error("Password must be same");
                error.status = 400;
                throw error
            }
            if (!validator.isStrongPassword(password)) {
                const error = new Error("Password must contain special character, A capital Letter and a number");
                error.status = 400;
                throw error
            }
            let user;
            if (type === "Student") {
                user = await studentModel.findById(id)
            } else if (type === "Teacher") {
                user = await TeacherModel.findById(id)
            } else {
                user = await AdminModel.findById(id)
            }
            if (!user) {
                const error = new Error("User not found");
                error.status = 400;
                throw error
            }
            const hashedPassword = await bcrypt.hash(password, 6)
            if (type === "Student") {
                user = await studentModel.findByIdAndUpdate(id, { password: hashedPassword })
            } else if (type === "Teacher") {
                user = await TeacherModel.findByIdAndUpdate(id, { password: hashedPassword })
            } else {
                user = await AdminModel.findByIdAndUpdate(id, { password: hashedPassword })
            }
            return "Updated"
        })
    },
}