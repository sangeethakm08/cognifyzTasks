const express = require("express");
const app = express();
const PORT = 8080;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set("view engine", "ejs");

// Home Route
app.get("/", (req, res) => {
  res.render("index");
});

// Form Submission Route
app.post("/submit", (req, res) => {
  const { name, email, number, gender, dob } = req.body;

  res.render("response", {
    name,
    email,
    number,
    gender,
    dob
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
