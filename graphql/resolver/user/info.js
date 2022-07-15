const TeacherModel = require("../../../model/teacher");
const AdminModel = require("../../../model/admin");
const jwt = require("jsonwebtoken");
const generate = require("../../../util/generate");
const TokenModel = require("../../../model/token");
const studentModel = require("../../../model/user")
const { sendMail } = require("../../../util/mail");
const validator = require("validator")
const bcrypt = require("bcrypt")

module.exports={
    getInfo:async(args,req)=>{
        if(!(req.token || req.isAuth)){
            const error=new Error("UnAuthorize user")
            error.status=500;
            throw error;
        }
        const Authorization=req.get("Authorization")
        if(!Authorization){
            const error=new Error("User not found, please try again later")
            error.status=500;
            throw error;
        }
        const token=Authorization.replace("Bearer ","");
        return jwt.verify(req.token,process.env.JWT_SECRET,async(error,payload)=>{
            if(error){
                const error=new Error("User not found, please try again later")
                error.status=500;
                throw error;
            }
            const {type,_id:id}=payload
            let user;
            if(type==="Student"){
                user= await studentModel.findOne({verified:true,_id:id})
            }else if(type==="Teacher"){
                user= await TeacherModel.findOne({verified:true,_id:id})
            }else{
                user= await AdminModel.findOne({_id:id})
            }
            if(!user){
                const error=new Error("User not found, please try again later")
                error.status=500;
                throw error;
            }
            return user._doc
        })
    },
    fetchUnverified: async (args, req) => {
        if (!req.isAuth) {
            throw new Error("UnAuthorised")
        }
        if (
            !(
                req.type === "Teacher" ||
                req.type === "Admin" ||
                req.user.isClassTeacher
            )
        ) {
            const error = new Error("UnAuthorised");
            error.status = 500;
            throw error;
        }
        if (req.type === "Teacher") {
            if (req.user.verified !== true || req.user.mailVerfied !== true) {
                const error = new Error("Account has not been fully verified");
                error.status = 500;
                throw error;
            }
        }
        let students;
        if (req.type === "Teacher") {
            students = await studentModel.find({
                class: req.user.class,
                mailVerfied: true,
                verified: false,
            });
        } else {
            students = await studentModel.find({
                mailVerfied: true,
                verified: false,
            });
        }
        return students;
    },
}