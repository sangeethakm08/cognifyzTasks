const express = require("express");
const path = require("path");

const webServer = express();
const SERVER_PORT = 8080;

// Temporary storage array for user registrations
const registeredUsers = [];

// Configure Express middleware
webServer.use(express.urlencoded({ extended: true }));
webServer.set("view engine", "ejs");
webServer.set("views", path.join(__dirname, "views"));

// Home route - display registration form
webServer.get("/", (request, response) => {
  response.render("index", { serverErrors: {} });
});

// Handle form submission
webServer.post("/submit", (request, response) => {
  // Extract and sanitize input data
  const userData = {
    userName: (request.body.name || "").trim(),
    userEmail: (request.body.email || "").trim(),
    userPhone: (request.body.number || "").trim(),
    userGender: (request.body.gender || "").trim(),
    userDOB: request.body.dob || "",
    userPass: request.body.password || "",
    userPassConfirm: request.body.confirmPassword || ""
  };

  // Run validation checks
  const validationStatus = validateUserInput(userData);

  // If validation failed, return form with error messages
  if (!validationStatus.isValid) {
    return response.render("index", { serverErrors: validationStatus.errorList });
  }

  // Create user record object
  const newUserRecord = {
    name: userData.userName,
    email: userData.userEmail,
    number: userData.userPhone,
    gender: userData.userGender,
    dob: userData.userDOB,
    password: userData.userPass
  };

  // Store user registration
  registeredUsers.push(newUserRecord);

  // Display success page
  response.render("response", newUserRecord);
});

// Validation function with comprehensive checks
function validateUserInput(data) {
  const errorList = {};
  let isValid = true;

  // Check name field
  if (!data.userName || data.userName.length < 3) {
    errorList.name = "Name must be at least 3 characters.";
    isValid = false;
  }

  // Check email field with regex pattern
  const validEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.userEmail || !validEmailRegex.test(data.userEmail)) {
    errorList.email = "Please enter a valid email address.";
    isValid = false;
  }

  // Check phone number field
  const phoneDigits = data.userPhone.replace(/\D/g, "");
  if (!data.userPhone || phoneDigits.length < 10) {
    errorList.number = "Phone number must have at least 10 digits.";
    isValid = false;
  }

  // Check gender field
  if (!data.userGender || data.userGender.length === 0) {
    errorList.gender = "Please provide your gender.";
    isValid = false;
  }

  // Check date of birth field
  if (!data.userDOB || data.userDOB.length === 0) {
    errorList.dob = "Date of birth is required.";
    isValid = false;
  }

  // Check password field
  if (!data.userPass || data.userPass.length < 6) {
    errorList.password = "Password must be at least 6 characters.";
    isValid = false;
  }

  // Check password confirmation match
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
webServer.listen(SERVER_PORT, () => {
  console.log(`Server started successfully on port ${SERVER_PORT}`);
  console.log(`Access the application at: http://localhost:${SERVER_PORT}`);
});
