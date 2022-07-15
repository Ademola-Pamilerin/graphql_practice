const graphql = require("graphql")
const _ = require("lodash")
const AuthorModel = require("../model/author_model")
const BookModel = require("../model/book_model")


const dummy_data = [
    { name: "The Avengers", genre: "Action", id: "avanger_1", author_Id: "author_1" },
    { name: "Thor Ragnarok", genre: "Sci-fic", id: "avanger_2", author_Id: "author_2" },
    { name: "The Amazing Spiderman", genre: "Fantasy", id: "avanger_3", author_Id: "author_3" },
    { name: "Running Away", genre: "Fantasy", id: "avanger_4", author_Id: "author_1" },
    { name: "A man Called God", genre: "Fantasy", id: "avanger_5", author_Id: "author_2" },
    { name: "Power Ranger", genre: "Sci-fic", id: "avanger_6", author_Id: "author_3" }
]

const dummyAuthor = [
    { name: "Theo Avengers", age: 69, id: "author_1" },
    { name: "Ghanis Ragnarok", age: 66, id: "author_2" },
    { name: "Thenasis Spiderman", age: 22, id: "author_3" }
]



const {
    GraphQLNonNull,
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt
} = graphql

const BookType = new GraphQLObjectType({
    name: "Book",
    fields: () => ({
        id: {
            type: GraphQLID
        },
        name: {
            type: GraphQLString
        },
        genre: {
            type: GraphQLString
        },
        author: {
            type: AuthorType,
            resolve: async (parent, args) => {
                const { author } = parent
                const result = await AuthorModel.findById(author)
                return result
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: "Author",
    fields: () => ({
        id: {
            type: GraphQLID
        },
        name: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: async (parent, args) => {
                const { id } = parent
                const books = await BookModel.find({ author: id });
                return books
            }
        }
    })
})




const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        book: {
            type: BookType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: async (parent, args) => {
                const { id } = args
                const result = await BookModel.findOne({ _id: id })
                return result
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: async (parent, args) => {
                const { id } = args
                const result = await AuthorModel.findOne({ _id: id })
                return result
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: async (parent, args) => {
                const books = await BookModel.find()
                return books
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve: async (parent, args) => {
                const result = await AuthorModel.find()
                return result
            }
        }
    }
})


const RootMutation = new GraphQLObjectType({
    name: "RootMutation",
    fields: {
        createBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                author: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                const { name, genre, author } = args
                const Book = new BookModel({ name, genre, author })
                const updated = await AuthorModel.findById(author)
                updated.books.push(Book._id)
                await Book.save()
                await updated.save()
                return Book
            }
        },
        createAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
            },
            resolve: async (parent, args) => {
                const { age, name } = args
                const Author = new AuthorModel({ age, name })
                await Author.save()
                return Author
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
})