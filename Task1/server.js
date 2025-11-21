const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/submit", (req, res) => {
  const { name, email, number, gender, dob } = req.body;

  res.render("response", {
    name,email,number,gender,dob
  });
});

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
