const express = require("express"),
  bodyParser = require("body-parser"),
  expressSanitizer = require("express-sanitizer"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override");
app = express();

// App config
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost/restful_blog_app", {
  useNewUrlParser: true
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// Mongoose model config
const blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//   title: "Test Blog",
//   image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
//   body: "This is a cat."
// });

// RESTful Routes

// INDEX - Lists all blogs
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, foundBlogs) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { blogs: foundBlogs });
    }
  });
});

// NEW - Shows a from to create a new blog

app.get("/blogs/new", function(req, res) {
  res.render("new");
});

// CREATE - Create a new dog then redirect somewhere

app.post("/blogs", function(req, res) {
  // create blog
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      // redirect to INDEX
      res.redirect("/blogs");
    }
  });
});

// SHOW - show one blog post

app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});

// EDIT - edit an existing blog

app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

// UPDATE - update a blog from EDIT

app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findOneAndUpdate({ _id: req.params.id }, req.body.blog, function(
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DELETE - delete a blog post

app.delete("/blogs/:id", function(req, res) {
  // res.send("DELETE ROUTE");
  Blog.findOneAndDelete({ _id: req.params.id }, function(err) {
    if (err) {
      res.send("Could not find blog");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.listen(3000, function() {
  console.log("Server connected");
});
