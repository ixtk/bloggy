const express = require("express")
const crypto = require("crypto")
const mongoose = require("mongoose")

const postSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  liked: { type: Boolean, required: true, default: false }
})

const Post = mongoose.model("Post", postSchema)

const app = express()

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

app.get("/", async function (request, response) {
  const allPosts = await Post.find()

  console.log(allPosts)

  response.render("index", { posts: allPosts })
})

app.get("/posts/create", function (request, response) {
  response.render("create-post")
})

app.post("/posts/create", async function (request, response) {
  // title, text
  const newPostValues = request.body

  const newPost = await Post.create({
    name: newPostValues.title,
    text: newPostValues.text,
    liked: false
  })

  response.redirect(`/posts/${newPost.id}`)
})

// /posts/abc
// /posts/late-night-code
app.get("/posts/:postId", async function (request, response) {
  const postId = request.params.postId // 1, 2, 3, a2f9d1c49823

  console.log("User visited post", postId)

  let foundPost = await Post.findById(postId)

  response.render("post", { post: foundPost })
})

// app.get("*", function (request, response) {
//   response.send("<h1>Page not found</h1>")
// })

/*
app.get("/posts/1", function (request, response) {
  response.render("post", { post: blogPosts[0] })
})

app.get("/posts/2", function (request, response) {
  response.render("post", { post: blogPosts[1] })
})

app.get("/posts/3", function (request, response) {
  response.render("post", { post: blogPosts[2] })
})
*/

mongoose.connect("mongodb://localhost:27017/bloggy")

// localhost:3000
app.listen(3000)
