const express = require("express")
// const blogPosts = require('./posts.json')

const app = express()

// /posts/7c38b4e289fa
const blogPosts = [
  {
    id: "a2f9d1c49823",
    name: "Coffee Morning",
    text: "Tried a new café downtown today, best cappuccino I’ve had in months.",
    liked: true
  },
  {
    id: "7c38b4e289fa",
    name: "Late Night Code",
    text: "Finally fixed that stubborn bug after three hours… victory tastes sweet.",
    liked: false
  },
  {
    id: "f4b82a7a1e39",
    name: "Sunday Hike",
    text: "Went hiking on the Pine Ridge trail. The view from the top was unreal.",
    liked: true
  }
]

app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/", function (request, response) {
  response.render("index", { posts: blogPosts })
})

app.get("/posts/create", function (request, response) {
  response.render("create-post")
})

// /posts/7c38b4e289fa
// /posts/late-night-code
app.get("/posts/:postId", function (request, response) {
  const postId = request.params.postId // 1, 2, 3, a2f9d1c49823

  console.log("User visited post", postId)

  let foundPost = null

  for (let post of blogPosts) {
    if (post.id === postId) {
      foundPost = post
    }
  }

  response.render("post", { post: foundPost })
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
