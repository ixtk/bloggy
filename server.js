const express = require("express")
const blogPosts = require('./posts.json')

const app = express()

app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/", function (request, response) {
  response.render("index", { posts: blogPosts })
})

app.get("/posts/:postId", function (request, response) {
  const postId = request.params.postId

  console.log('User visited post', postId)

  response.render("post", { post: blogPosts[postId - 1] })
})

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

// localhost:3000
app.listen(3000)
