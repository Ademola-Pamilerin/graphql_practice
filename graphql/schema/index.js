const { buildSchema } = require("graphql");

const Schema = buildSchema(`

    input Subject {
        name:String!
        class:String!
    }
    type TeacherSub{
        name:String!
        class:String!
    }
    input Input {
        firstname:String!
        lastname:String!
        email:String!
        admNo:String!
        stdClass:String!
    }

    input TeacherSignUp{
        firstname:String!
        lastname:String!
        email:String!
        isClassTeacher: Boolean
        teachClass:String
    }


   type User{
    name:String!
    token:String!
    _id:String!
    refreshToken:String!
   }
    type Teacher{
        name:String!
        token:String!
        _id:String!
        refreshToken:String!
    }
    input Admin {
        email:String!
        password:String!
    }
    type AdminData{
        email:String!
        token:String!
        refreshToken:String!
        _id:String
    }
    input login{
        email:String!
        password:String!
    }
    input password {
        confirm_password:String!
        password:String!
    }
  type rootMutation{
        createStudent(data:Input!):User!
        createTeacher(data:TeacherSignUp!):Teacher!
        createAdmin(data:Admin!):AdminData!
  }    
  type unverifiedStd {
      _id:String!
  }
  type rootQuery{
    verify:String
    verifyStudent(id:String!):String
    verifyTeacher(id:String!):String
    teacherLogin(data:login!):Teacher!
    studentLogin(data:login!):User!
    adminLogin(data:login!):AdminData!
    setPassword(data:password):String
    fetchUnverified:[unverifiedStd]!
    GetMailForResetPassword(email:String!):String
    verifyResetPasswordMail:String!
    getInfo:User!
}


  schema{
        query:rootQuery
        mutation:rootMutation
  }
`);
module.exports = Schema;
