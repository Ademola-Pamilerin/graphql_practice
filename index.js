require("dotenv").config();
const express = require("express");
const cors = require("cors")
// const http = require("http");
// const Schema = require("./graphql/schema/index");
// const resolver = require("./graphql/resolver/resolver");
const mongoose = require("mongoose");
// const Auth = require("./middleware/auth");

const app = express();
const { graphqlHTTP } = require("express-graphql");
const SchemaValue = require("./schema/ìndex")
// app.use(Auth);


app.use(cors())
// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: Schema,
//     rootValue: resolver,
//     graphiql: true,
//     customFormatErrorFn: (err) => {
//       if (!err.originalError) {
//         return err;
//       } else {
//         if (err.message === "getaddrinfo ENOTFOUND api.sendgrid.com") {
//           err.message = "Unable to send Mail";
//         }
//         return {
//           message: err.message,
//           data: err.originalError.data,
//           status: err.originalError.status,
//         };
//       }
//     },
//     catch: (reason) => {
//       // console.log(reason);
//     },
//   })
// );



app.use("/graphql", graphqlHTTP({
  schema: SchemaValue,
  graphiql: true
}))

mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(result => {
})
mongoose.connection.once("open", () => {
  console.log("Started Connection")
})

app.listen(4000, (error) => {
  if (!error) {
    console.log("running")
  }
  else {
    console.log(error)
  }
})

// mongoose
//   .connect(process.env.MONGODB_CONNECTION_STRING)
//   .then((result) => {
//     const server = http
//       .createServer(app)
//       .listen(process.env.PORT || 5000, (err) => {
//         if (err) {
//         }
//         console.log("started App on port", process.env.port || 5000);
//       });
//     const io = require("./socket").init(server);
//     io.on("connection", (socker) => {
//       console.log("Client connected");
//     });
//   })
//   .catch((err) => {
//     // console.log(err);
//   });
