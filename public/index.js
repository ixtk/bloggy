console.log("Hello World!")

const postContainer = document.querySelector(".blog-container")
const button = document.querySelector(".view-btn")

button.addEventListener('click', function() {
  postContainer.classList.toggle('grid-view')
})
