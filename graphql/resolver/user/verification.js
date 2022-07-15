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
    verifyStudent: async (args, req) => {
        let id = args.id;
        if (req.user_type === "Student") {
            const error = new Error("Unauthorize");
            error.status = 500;
            throw error;
        } else {
            let student = await studentModel.findByOne({ _id: id });
            if (!student) {
                const error = new Error("Account not found");
                error.status = 500;
                throw error;
            }
            if (!student.mailVerfied) {
                const error = new Error("Email Address has not been verified");
                error.status = 500;
                throw error;
            }
            student = await studentModel.findByIdAndUpdate(
                { _id: student._id } ,
                { verified: true }
            );
            const Teacher = await TeacherModel.findOne({ isClassTeacher: true, class: student.class, verified })
            if (Teacher) {
                Teacher.students = [...Teacher.students, student._id]
            }
        }
        await student.save();
        await Teacher.save();
        return "Updated ";
    },
    verifyTeacher: async (args, req) => {
        let id = args.id;
        let teacher;
        if (req.type !== "Admin") {
            const error = new Error("Unauthorized");
            error.status = 500;
            throw error
        } else {
            teacher = await TeacherModel.findOne({ _id: id });
            if (!teacher) {
                const error = new Error("Account not found");
                error.status = 500;
                throw error
            }
            if (!teacher.mailVerfied) {
                const error = new Error("Account has not been verified");
                error.status = 500;
                throw new error
            }
            const students = await studentModel
                .find({
                    class: teacher.class,
                    mailVerfied: true,
                    verified: true,
                })
                .select("_id");
            teacher = await TeacherModel.findByIdAndUpdate(
                { _id: teacher._id },
                { verified: true, students }
            );
        }
        await teacher.save();
        return "Updated ";
    },
    verifyResetPasswordMail: async (args, req) => {
        const Authorization = req.get("Verification")
        if (!Authorization) {
            const error = new Error("Invalid Request, please try again later")
            error.status = 422;
            throw error
        }
        const token = Authorization.split("|")[0]
        const req_id = Authorization.split("|")[1]
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
            let user;
            if (type === "Student") {
                user = await studentModel.findById(id)
                user.mailVerfied = true
            } else if (type === "Admin") {
                user = await AdminModel.findById(id)
            } else {
                user = await TeacherModel.findById(id)
                user.mailVerfied = true
            }
            if (!user) {
                throw new Error("Invalid Link, Try again later")
            }
            if (req_id !== id) {
                throw new Error("Please Try again later")
            }
            await user.save()
            return "Ademola"
        })
    },
}