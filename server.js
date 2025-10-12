// დაინსტალურებული ბიბლიოთეკების ჩატვირთვა
const express = require("express") // Express - ვებ სერვერის ბიბლიოთეკა
const mongoose = require("mongoose") // Mongoose - მონაცემთა ბაზასთან მუშაობის ბიბლიოთეკა

const dotenv = require("dotenv") // Dotenv - გარემოს ცვლადების ჩატვირთვის ბიბლიოთეკა
dotenv.config() // .env ფაილიდან გარემოს ცვლადების ჩატვირთვა

const bcrypt = require("bcrypt")

const session = require("express-session")
const MongoStore = require("connect-mongo")

// პოსტის სქემა, განსაზღვრავს მონაცემთა სტრუქტურას
const postSchema = mongoose.Schema({
  name: { type: String, required: true, minLength: 4, unique: true }, // ტექსტის ტიპი, სავალდებულო და უნიკალური
  text: { type: String, required: true, minLength: 20 }, // ტექსტის ტიპი, სავალდებულო
  liked: { type: Boolean, required: true, default: false }, // Boolean ტიპი (კი ან არა), სავალდებულო, ნაგულისხმევად false
  views: { type: Number, required: true, default: 0 }, // რიცხვის ტიპი, სავალდებულო, ნაგულისხმევად 0
  author: { type: String, required: false }
})

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

// მოდელის შექმნა სქემის მიხედვით
const Post = mongoose.model("Post", postSchema)
const User = mongoose.model("User", userSchema)

// აპლიკაციის ობიექტის შექმნა
const app = express()

// EJS შაბლონების გამოყენება
app.set("view engine", "ejs")

// სტატიკური ფაილების (სურათები, CSS, JS) შეინახება public ფოლდერში
app.use(express.static("public"))

// ფორმის მონაცემების წასაკითხად
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: "yourSecretKey", // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL, // MongoDB connection string
      collectionName: "sessions", // Collection to store sessions
      stringify: false
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
)

app.use(function (request, response, next) {
  response.locals.username = request.session.username
  next()
})

// მთავარი გვერდი, ყველა პოსტის ჩვენება
app.get("/", async function (request, response) {
  const allPosts = await Post.find() // ყველა პოსტის წამოღება ბაზიდან

  // console.log(request.session.username) // კონსოლში ყველა პოსტის გამოჩენა

  // index შაბლონის გამოჩენა და post მნიშვნელობის გადაცემა
  response.render("index", {
    posts: allPosts
  })
})

// ახალი პოსტის შექმნის გვერდი
app.get("/posts/create", function (request, response) {
  if (request.session.username === undefined) {
    return response.redirect("/login")
  }

  // create-post შაბლონის გამოჩენა
  response.render("create-post")
})

// ახალი პოსტის შენახვა ბაზაში (გვერდი არ არის)
app.post("/posts/create", async function (request, response) {
  // ფორმის მონაცემები, რაც მომხმარებელმა შეავსო input ველებში
  const newPostValues = request.body

  if (request.session.username === undefined) {
    return response.redirect("/login")
  }

  const newPost = await Post.create({
    name: newPostValues.title, // სათაური (.title არის input ველის name ატრიბუტი)
    text: newPostValues.text, // ტექსტი (.text არის input ველის name ატრიბუტი)
    author: request.session.username
  })

  // გადამისამართება ახალი პოსტის გვერდზე
  response.redirect(`/posts/${newPost.id}`)
})

// კონკრეტული პოსტის გვერდი
app.get("/posts/:postId", async function (request, response) {
  const postId = request.params.postId // პოსტის უნიკალური ID, რასაც URL-ში იწერება

  console.log("User visited post", postId)

  let foundPost = await Post.findById(postId) // პოსტის მოძებნა ID-ით

  foundPost.views = foundPost.views + 1

  await foundPost.save()

  // post შაბლონის გამოჩენა და მოძებნილი post მნიშვნელობის გადაცემა
  response.render("post", { post: foundPost })
})

// კონკრეტული პოსტის წაშლის მისამართი
app.post("/posts/:postId/delete", async function (request, response) {
  const postId = request.params.postId // პოსტის უნიკალური ID, რასაც URL-ში იწერება

  if (request.session.username === undefined) {
    return response.redirect("/login")
  }

  // const foundPost = await Post.findById(postId)

  // foundPost.deleteOne()

  // await Post.deleteOne({ _id: postId })

  await Post.findByIdAndDelete(postId)

  response.redirect("/")
})

// კონკრეტული პოსტის მოწონების მისამართი
app.post("/posts/:postId/like", async function (request, response) {
  const postId = request.params.postId // პოსტის უნიკალური ID, რასაც URL-ში იწერება

  const post = await Post.findById(postId) // პოსტის მოძებნა ID-ით

  post.liked = !post.liked

  await post.save()

  response.redirect(`/posts/${postId}`)
})

// კონკრეტული პოსტის დარედაქტირების მისამართი
app.get("/posts/:postId/edit", async function (request, response) {
  const postId = request.params.postId // პოსტის უნიკალური ID, რასაც URL-ში იწერება

  if (request.session.username === undefined) {
    return response.redirect("/login")
  }

  const foundPost = await Post.findById(postId)

  response.render("edit-post", {
    name: foundPost.name,
    text: foundPost.text,
    postId: foundPost.id
  })
})

/*

// შემოკლებული ვერსია
app.post("/posts/:postId/edit", async (req, res) => {
  await Post.findByIdAndUpdate(req.params.postId, req.body)
  res.redirect("/posts/" + req.params.postId)
})
*/

app.post("/posts/:postId/edit", async function (request, response) {
  // ფორმის მონაცემები, რაც მომხმარებელმა შეავსო input ველებში
  const postId = request.params.postId
  const editPostValues = request.body

  if (request.session.username === undefined) {
    return response.redirect("/login")
  }

  const post = await Post.findById(postId)

  if (post.author === request.session.username) {
    post.name = editPostValues.title
    post.text = editPostValues.text
    await post.save()
  } else {
    return res.send("ამ მოქმედების უფლება არ გაქვთ")
  }

  // გადამისამართება ახალი პოსტის გვერდზე
  response.redirect(`/posts/${postId}`)
})

app.get("/login", async function (request, response) {
  response.render("login")
})

app.get("/register", async function (request, response) {
  response.render("register")
})

app.post("/register", async function (request, response) {
  const password = request.body.password
  const username = request.body.username
  const confirmPassword = request.body.confirmPassword
  const hashedPassword = await bcrypt.hash(password, 10)

  if (password !== confirmPassword) {
    return response.send("პაროლები ერთმანეთს არ ემთხვევა")
  }

  const newUser = await User.create({
    password: hashedPassword,
    username: username
  })

  console.log(newUser)

  response.redirect("/")
})

app.post("/login", async function (request, response) {
  const password = request.body.password // tomatoma
  const username = request.body.username

  // is user registered with the username
  const user = await User.findOne({ username: username })

  if (user === null) {
    return response.send("მომხმარებელი არ მოიძებნა")
  }

  // tomatoma / $2b$10$s2bAO9zQzTevAUnCZ/9ue.BFMbfPg1PmSj.H25S54AhLc3kyoQvby"
  if (await bcrypt.compare(password, user.password)) {
    console.log("Login successfull")

    request.session.username = user.username

    return response.redirect("/")
  } else {
    return response.send("პაროლი არასწორია")
  }
})

app.get("/logout", async function (request, response) {
  request.session.destroy()
  response.redirect("/")
})

// მონაცემთა ბაზასთან დაკავშირება
mongoose.connect(process.env.MONGODB_URL)

app.listen(process.env.PORT)
