const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

const userSubmissionsDatabase = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home route
app.get("/", (req, res) => {
  res.render("index", {
    submissionErrors: null,
    submittedData: null
  });
});

// Process form submission
app.post("/process-form", (req, res) => {
  const collectedFormData = {
    userNameField: (req.body.name || "").trim(),
    userEmailField: (req.body.email || "").trim(),
    userPhoneField: (req.body.phone || "").trim(),
    userPasswordField: req.body.password || "",
    userPasswordConfirmField: req.body.confirmPassword || "",
    userDOBField: req.body.dob || "",
    userGenderField: (req.body.gender || "").trim(),
    userCountryField: (req.body.country || "").trim(),
    userOccupationField: (req.body.occupation || "").trim(),
    userMessageField: (req.body.message || "").trim()
  };

  const validationResult = validateFormSubmission(collectedFormData);

  if (!validationResult.isSubmissionValid) {
    return res.render("index", {
      submissionErrors: validationResult.errorCollection,
      submittedData: collectedFormData
    });
  }

  const newSubmissionRecord = {
    name: collectedFormData.userNameField || "",
    email: collectedFormData.userEmailField || "",
    phone: collectedFormData.userPhoneField || "",
    password: collectedFormData.userPasswordField || "",
    dob: collectedFormData.userDOBField || "",
    gender: collectedFormData.userGenderField || "",
    country: collectedFormData.userCountryField || "",
    occupation: collectedFormData.userOccupationField || "",
    message: collectedFormData.userMessageField || "",
    submissionTime: new Date().toISOString()
  };

  console.log("Submission Record:", newSubmissionRecord);
  userSubmissionsDatabase.push(newSubmissionRecord);

  res.render("response", newSubmissionRecord);
});

// API endpoint for real-time validation
app.post("/api/validate", (req, res) => {
  const { field, value } = req.body;
  const validationResult = validateField(field, value);
  res.json(validationResult);
});

function validateFormSubmission(data) {
  const errorCollection = {};
  let isSubmissionValid = true;

  // Name validation
  if (!data.userNameField || data.userNameField.length < 2) {
    errorCollection.name = "Name must contain at least 2 characters.";
    isSubmissionValid = false;
  } else if (!/^[a-zA-Z\s]+$/.test(data.userNameField)) {
    errorCollection.name = "Name can only contain letters and spaces.";
    isSubmissionValid = false;
  }

  // Email validation
  const emailValidationPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.userEmailField || !emailValidationPattern.test(data.userEmailField)) {
    errorCollection.email = "Please enter a valid email address.";
    isSubmissionValid = false;
  }

  // Phone validation
  const phoneDigitsOnly = data.userPhoneField.replace(/\D/g, "");
  if (!data.userPhoneField || phoneDigitsOnly.length < 10) {
    errorCollection.phone = "Phone number must contain at least 10 digits.";
    isSubmissionValid = false;
  }

  // Password strength validation
  const passwordStrength = checkPasswordStrength(data.userPasswordField);
  if (!data.userPasswordField || data.userPasswordField.length < 8) {
    errorCollection.password = "Password must be at least 8 characters long.";
    isSubmissionValid = false;
  } else if (passwordStrength.score < 3) {
    errorCollection.password = "Password is too weak. Please use a stronger password.";
    isSubmissionValid = false;
  }

  // Password match validation
  if (data.userPasswordField !== data.userPasswordConfirmField) {
    errorCollection.confirmPassword = "Passwords do not match.";
    isSubmissionValid = false;
  }

  // Date of birth validation
  if (!data.userDOBField) {
    errorCollection.dob = "Date of birth is required.";
    isSubmissionValid = false;
  } else {
    const dob = new Date(data.userDOBField);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18) {
      errorCollection.dob = "You must be at least 18 years old.";
      isSubmissionValid = false;
    }
  }

  // Gender validation
  if (!data.userGenderField) {
    errorCollection.gender = "Gender is required.";
    isSubmissionValid = false;
  }

  // Country validation
  if (!data.userCountryField) {
    errorCollection.country = "Please select your country.";
    isSubmissionValid = false;
  }

  // Occupation validation
  if (!data.userOccupationField) {
    errorCollection.occupation = "Please select your occupation.";
    isSubmissionValid = false;
  }

  // Message validation
  if (!data.userMessageField || data.userMessageField.length < 10) {
    errorCollection.message = "Message must contain at least 10 characters.";
    isSubmissionValid = false;
  }

  return {
    isSubmissionValid: isSubmissionValid,
    errorCollection: errorCollection
  };
}

function validateField(field, value) {
  const result = { isValid: true, message: "" };

  switch (field) {
    case "name":
      if (!value || value.length < 2) {
        result.isValid = false;
        result.message = "Name must contain at least 2 characters.";
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        result.isValid = false;
        result.message = "Name can only contain letters and spaces.";
      }
      break;

    case "email":
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!value || !emailPattern.test(value)) {
        result.isValid = false;
        result.message = "Please enter a valid email address.";
      }
      break;

    case "phone":
      const phoneDigits = value.replace(/\D/g, "");
      if (!value || phoneDigits.length < 10) {
        result.isValid = false;
        result.message = "Phone number must contain at least 10 digits.";
      }
      break;

    case "password":
      if (!value || value.length < 8) {
        result.isValid = false;
        result.message = "Password must be at least 8 characters long.";
      } else {
        const strength = checkPasswordStrength(value);
        if (strength.score < 3) {
          result.isValid = false;
          result.message = "Password is too weak.";
        }
      }
      break;
  }

  return result;
}

function checkPasswordStrength(password) {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add numbers");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push("Add special characters");

  let strength = "weak";
  if (score >= 5) strength = "strong";
  else if (score >= 3) strength = "medium";

  return { score, strength, feedback };
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

