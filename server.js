const express = require("express")

const app = express()

app.set("view engine", "ejs")

app.get("/", function (request, response) {
  response.render("index", { name: "Emmet" })
})

app.listen(3000)
