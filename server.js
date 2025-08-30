const express = require("express")

const app = express()

app.set("view engine", "ejs")

const blogPosts = [
  {
    name: "First Post",
    text: "This is the first post",
    liked: true
  },
  {
    name: "Second Post",
    text: "This is the second post",
    liked: false
  },
  {
    name: "Third Post",
    text: "This is the third post",
    liked: true
  }
]

app.get("/", function (request, response) {
  response.render("index", {
    posts: blogPosts
  })
})

app.listen(3000)
