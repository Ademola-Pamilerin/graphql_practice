const mongoose = require("mongoose")
const Schema = mongoose.Schema


const bookSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "Author"
    }
})

const BookModel = mongoose.models.Book || mongoose.model("Book", bookSchema)
module.exports = BookModel