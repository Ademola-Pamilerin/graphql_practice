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
    createStudent: async (args, req) => {
        const { firstname, lastname, email, admNo, stdClass } = args.data;

        let AccountFound = await studentModel.findOne({ email, admNo }) ||
            await TeacherModel.findOne({ email }) ||
            await AdminModel.findOne({ email });
        if (AccountFound) {
            const error = new Error(
                "Account already exist with this Email, please choose a new one"
            );
            error.status = 500;
            throw error;
        }
        if (
            validator.isEmpty(firstname) ||
            validator.isEmpty(lastname) ||
            validator.isEmpty(email) ||
            validator.isEmpty(admNo)
        ) {
            const error = new Error("All fields are required");
            error.status = 500;
            throw error;
        }
        if (!validator.isLength(firstname, { min: 3, max: 20 })) {
            const error = new Error("First Name field too short");
            error.status = 500;
            throw error;
        }
        if (!validator.isLength(lastname, { min: 3, max: 20 })) {
            const error = new Error("Last Name field too short");
            error.status = 500;
            throw error;
        }
        if (!validator.isLength(email, { min: 5 })) {
            const error = new Error("Email not a valid mail");
            error.status = 500;
            throw error;
        }
        if (!validator.isEmail(email)) {
            console.log(validator.isEmail(email));
            const error = new Error("Email Fields is not a valid Email Address");
            error.status = 500;
            throw error;
        }
        if (!validator.isLength(admNo, { min: 3, max: 20 })) {
            const error = new Error("Admission Number field too short");
            error.status = 500;
            throw error;
        }
        const user = new studentModel({
            firstname,
            lastname,
            email,
            admNo,
            class: stdClass,
        });
        const token = jwt.sign(
            { email, _id: user._id, type: "Student" },
            process.env.JWT_SECRET,
            {
                expiresIn: "2hr",
            }
        );
        const refreshToken = generate(200);
        const tokData = new TokenModel({
            token,
            refreshToken,
            user: user._id.toString(),
            type: "Student"
        });
        user.token = tokData._id;
        await tokData.save();
        await user.save();
        return {
            name: firstname + " " + lastname,
            token,
            refreshToken,
            _id: user._id,
        };
    },
    createTeacher: async (args, req) => {
        const { firstname, lastname, email, isClassTeacher, teachClass } =
            args.data;

        let AccountFound = await studentModel.findOne({ email }) ||
            await TeacherModel.findOne({ email }) ||
            await AdminModel.findOne({ email });
        if (AccountFound) {
            const error = new Error(
                "Account already exist with this Email, please choose a new one"
            );
            error.status = 500;
            throw error;
        }
        if (
            validator.isEmpty(firstname) ||
            validator.isEmpty(lastname) ||
            validator.isEmpty(email)
        ) {
            const error = new Error("All fields are required");
            error.status = 500;
            throw error;
        }
        if (!validator.isLength(firstname, { min: 3, max: 20 })) {
            const error = new Error("First Name field too short");
            error.status = 500;
            throw error;
        }
        if (!validator.isLength(lastname, { min: 3, max: 20 })) {
            const error = new Error("Last Name field too short");
            error.status = 500;
            throw error;
        }
        if (!validator.isLength(email, { min: 3, max: 20 })) {
            const error = new Error("Email not a valid mail");
            error.status = 500;
            throw error;
        }
        if (!validator.isEmail(email)) {
            const error = new Error("Email Fields is not a valid Email Address");
            error.status = 500;
            throw error;
        }
        const Teacher = new TeacherModel({
            firstname,
            lastname,
            email,
            isClassTeacher,
            class: teachClass,
        });
        const token = jwt.sign(
            { email, _id: Teacher._id, type: "Teacher" },
            process.env.JWT_SECRET,
            {
                expiresIn: "2hr",
            }
        );
        const refreshToken = generate(230);
        const tokData = new TokenModel({
            refreshToken,
            token,
            user: Teacher._id,
            type: "Teacher"
        });
        Teacher.token = tokData._id;
        // await sendMail(email, token, Teacher._id);
        await tokData.save();
        await Teacher.save();
        return {
            name: firstname + " " + lastname,
            token,
            _id: Teacher._id,
            refreshToken,
        };
    },
    createAdmin: async (args, req) => {
        const { email, password } = args.data;
        let AccountFound = await studentModel.findOne({ email }) ||
            await TeacherModel.findOne({ email }) ||
            await AdminModel.findOne({ email });
        if (AccountFound) {
            const error = new Error(
                "Account already exist with this Email, please choose a new one"
            );
            error.status = 500;
            throw error;
        }
        let user;
        user =
            (await studentModel.findOne({ email })) ||
            (await TeacherModel.findOne({ email })) ||
            (await AdminModel.findOne({ email }));
        if (user) {
            const error = new Error(
                "Account with Email already exist, create a new one email"
            );
            error.status = 500;
            throw error;
        }
        const strong = validator.isStrongPassword(password);
        if (!strong) {
            const error = new Error("Password must be a strong password");
            error.status = 500;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        user = new AdminModel({ email, password: hashedPassword });
        const token = jwt.sign(
            { type: "Admin", _id: user._id, email: email },
            process.env.JWT_SECRET,
            {
                expiresIn: "2hr",
            }
        );
        const refreshToken = generate(250);
        const tokData = new TokenModel({ refreshToken, token, user: user._id, type: "Admin" });
        user.token = tokData._id;
        await tokData.save();
        await user.save();
        return {
            token,
            refreshToken,
            email,
            _id: user._id,
        };
    },
    studentLogin: async (args, req) => {
        const { email, password } = args.data;
        let user = await studentModel.findOne({ email: email });
        if (!user) {
            const error = new Error("Invalid username or password");
            error.status = 500;
            throw error;
        }
        if (!user.mailVerfied) {
            const error = new Error("Account not verified");
            error.status = 500;
            throw error;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid username or password");
            error.status = 500;
            throw error;
        }
        const token = jwt.sign(
            { _id: user._id, email, type: "Student" },
            process.env.JWT_SECRET,
            {
                expiresIn: "2hr",
            }
        );
        const refreshToken = generate(200);
        const tokData = await TokenModel.findOneAndUpdate(
            { user: user._id },
            { token, refreshToken }
        );
        await tokData.save();
        return {
            token,
            refreshToken,
            name: user.firstname + "" + user.lastname,
            _id: user._id,
        };
    },
    teacherLogin: async (args, req) => {
        const { email, password } = args.data;
        let user = await TeacherModel.findOne({ email: email });
        if (!user) {
            const error = new Error("Invalid username or password");
            error.status = 500;
            throw error;
        }
        if (!user.mailVerfied) {
            const error = new Error("Account not verified");
            error.status = 500;
            throw error;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid username or password");
            error.status = 500;
            throw error;
        }
        const token = jwt.sign(
            { _id: user._id, email, type: "Teacher" },
            process.env.JWT_SECRET,
            {
                expiresIn: "2hr",
            }
        );
        const refreshToken = generate(200);
        const tokData = await TokenModel.findOneAndUpdate(
            { user: user._id },
            { token, refreshToken }
        );
        await tokData.save();
        return {
            token,
            refreshToken,
            name: user.firstname + "" + user.lastname,
            _id: user._id,
        };
    },
    adminLogin: async (args, req) => {
        const { email, password } = args.data;
        let user = await AdminModel.findOne({ email: email });
        if (!user) {
            const error = new Error("Invalid username or password");
            error.status = 500;
            throw error;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid username or password");
            error.status = 500;
            throw error;
        }
        const token = jwt.sign(
            { _id: user._id, email, type: "Admin" },
            process.env.JWT_SECRET,
            {
                expiresIn: "2hr",
            }
        );
        const refreshToken = generate(200);
        const tokData = await TokenModel.findOneAndUpdate(
            { user: user._id },
            { token, refreshToken }
        );
        await tokData.save();
        return {
            token,
            refreshToken,
            _id: user._id,
            email,
        };
    },
}