const express = require("express")

const app = express()

app.set("view engine", "ejs")

const blogPosts = [
  {
    id: 1,
    name: "First Post",
    text: "This is the first post",
    liked: true
  },
  {
    id: 2,
    name: "Second Post",
    text: "This is the second post",
    liked: false
  },
  {
    id: 3,
    name: "Third Post",
    text: "This is the third post",
    liked: true
  }
]

app.get("/", function (request, response) {
  response.render("index", { posts: blogPosts })
})

app.get("/posts/1", function (request, response) {
  response.render("post", { post: blogPosts[0] })
})

app.get("/posts/2", function (request, response) {
  response.render("post", { post: blogPosts[1] })
})

app.get("/posts/3", function (request, response) {
  response.render("post", { post: blogPosts[2] })
})

// localhost:3000
app.listen(3000)
