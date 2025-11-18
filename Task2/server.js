const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

// temporary storage
let submissions = [];

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/submit", (req, res) => {
  const { name, email, number, gender, dob } = req.body;

  let errors = {};

  // server-side validation
  if (!name || name.length < 3) errors.name = "Invalid name.";
  if (!email || !email.includes("@")) errors.email = "Invalid email.";
  if (!number || number.length < 10) errors.number = "Invalid phone.";
  if (!gender) errors.gender = "Gender required.";
  if (!dob) errors.dob = "DOB required.";

  if (Object.keys(errors).length > 0) {
    return res.render("index", { errors });
  }

  submissions.push({ name, email, number, gender, dob });

  res.render("response", { name, email, number, gender, dob });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
