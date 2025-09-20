// დაინსტალურებული ბიბლიოთეკების ჩატვირთვა
const express = require("express") // Express - ვებ სერვერის ბიბლიოთეკა
const mongoose = require("mongoose") // Mongoose - მონაცემთა ბაზასთან მუშაობის ბიბლიოთეკა

// პოსტის სქემა, განსაზღვრავს მონაცემთა სტრუქტურას
const postSchema = mongoose.Schema({
  name: { type: String, required: true, minLength: 4, unique: true }, // ტექსტის ტიპი, სავალდებულო და უნიკალური
  text: { type: String, required: true, minLength: 20 }, // ტექსტის ტიპი, სავალდებულო
  liked: { type: Boolean, required: true, default: false } // Boolean ტიპი (კი ან არა), სავალდებულო, ნაგულისხმევად false
})

// მოდელის შექმნა სქემის მიხედვით
const Post = mongoose.model("Post", postSchema)

// აპლიკაციის ობიექტის შექმნა
const app = express()

// EJS შაბლონების გამოყენება
app.set("view engine", "ejs")

// სტატიკური ფაილების (სურათები, CSS, JS) შეინახება public ფოლდერში
app.use(express.static("public"))

// ფორმის მონაცემების წასაკითხად
app.use(express.urlencoded({ extended: true }))

// მთავარი გვერდი, ყველა პოსტის ჩვენება
app.get("/", async function (request, response) {
  const allPosts = await Post.find() // ყველა პოსტის წამოღება ბაზიდან

  console.log(allPosts) // კონსოლში ყველა პოსტის გამოჩენა

  // index შაბლონის გამოჩენა და post მნიშვნელობის გადაცემა
  response.render("index", { posts: allPosts })
})

// ახალი პოსტის შექმნის გვერდი
app.get("/posts/create", function (request, response) {
  // create-post შაბლონის გამოჩენა
  response.render("create-post")
})

// ახალი პოსტის შენახვა ბაზაში (გვერდი არ არის)
app.post("/posts/create", async function (request, response) {
  // ფორმის მონაცემები, რაც მომხმარებელმა შეავსო input ველებში
  const newPostValues = request.body

  const newPost = await Post.create({
    name: newPostValues.title, // სათაური (.title არის input ველის name ატრიბუტი)
    text: newPostValues.text // ტექსტი (.text არის input ველის name ატრიბუტი)
  })

  // გადამისამართება ახალი პოსტის გვერდზე
  response.redirect(`/posts/${newPost.id}`)
})

// კონკრეტული პოსტის გვერდი
app.get("/posts/:postId", async function (request, response) {
  const postId = request.params.postId // პოსტის უნიკალური ID, რასაც URL-ში იწერება

  console.log("User visited post", postId)

  let foundPost = await Post.findById(postId) // პოსტის მოძებნა ID-ით

  // post შაბლონის გამოჩენა და მოძებნილი post მნიშვნელობის გადაცემა
  response.render("post", { post: foundPost })
})

// კონკრეტული პოსტის წაშლის მისამართი
app.post("/posts/:postId/delete", async function (request, response) {
  const postId = request.params.postId // პოსტის უნიკალური ID, რასაც URL-ში იწერება

  // const foundPost = await Post.findById(postId)

  // foundPost.deleteOne()

  // await Post.deleteOne({ _id: postId })

  await Post.findByIdAndDelete(postId)

  response.redirect("/")
})

// მონაცემთა ბაზასთან დაკავშირება
mongoose.connect("mongodb://localhost:27017/bloggy")

// სერვერის გაშვება 3000 პორტზე (localhost:3000)
app.listen(3000)
