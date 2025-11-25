const express = require("express");
const path = require("path");

const webServer = express();
const PORT = 8080;

const registeredUsers = [];

webServer.use(express.urlencoded({ extended: true }));
webServer.set("view engine", "ejs");
webServer.set("views", path.join(__dirname, "views"));

webServer.get("/", (req, res) => {
  res.render("index", { serverErrors: {} });
});

webServer.post("/submit", (req, res) => {
  const userData = {
    userName: (req.body.name || "").trim(),
    userEmail: (req.body.email || "").trim(),
    userPhone: (req.body.number || "").trim(),
    userGender: (req.body.gender || "").trim(),
    userDOB: req.body.dob || "",
    userPass: req.body.password || "",
    userPassConfirm: req.body.confirmPassword || ""
  };

  const validationStatus = validateUserInput(userData);

  if (!validationStatus.isValid) {
    return res.render("index", { serverErrors: validationStatus.errorList });
  }

  const newUserRecord = {
    name: userData.userName,
    email: userData.userEmail,
    number: userData.userPhone,
    gender: userData.userGender,
    dob: userData.userDOB,
    password: userData.userPass
  };

  registeredUsers.push(newUserRecord);

  res.render("response", newUserRecord);
});

function validateUserInput(data) {
  const errorList = {};
  let isValid = true;

  if (!data.userName || data.userName.length < 3) {
    errorList.name = "Name is required.";
    isValid = false;
  }

  const validEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.userEmail || !validEmailRegex.test(data.userEmail)) {
    errorList.email = "Please enter a valid email address.";
    isValid = false;
  }

  const phoneDigits = data.userPhone.replace(/\D/g, "");
  if (!data.userPhone || phoneDigits.length < 10) {
    errorList.number = "Phone number must have at least 10 digits.";
    isValid = false;
  }

  if (!data.userGender || data.userGender.length === 0) {
    errorList.gender = "Please provide your gender.";
    isValid = false;
  }

  if (!data.userDOB || data.userDOB.length === 0) {
    errorList.dob = "Date of birth is required.";
    isValid = false;
  }

  if (!data.userPass || data.userPass.length < 6) {
    errorList.password = "Password must be at least 6 characters.";
    isValid = false;
  }

  if (data.userPass !== data.userPassConfirm) {
    errorList.confirmPassword = "Password and confirmation do not match.";
    isValid = false;
  }

  return {
    isValid: isValid,
    errorList: errorList
  };
}

// Initialize server
webServer.listen(PORT, () => {
  console.log(`Access the application at: http://localhost:${PORT}`);
});
