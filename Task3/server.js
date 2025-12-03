const express = require("express");
const path = require("path");

const application = express();
const PORT_NUMBER = 8080;

const userSubmissionsDatabase = [];

application.use(express.urlencoded({ extended: true }));
application.use(express.static(path.join(__dirname, "public")));
application.set("view engine", "ejs");
application.set("views", path.join(__dirname, "views"));

application.get("/", (requestObject, responseObject) => {
  responseObject.render("index", { 
    submissionErrors: null,
    submittedData: null 
  });
});

application.post("/process-form", (requestObject, responseObject) => {
  // Extract and clean form data
  const collectedFormData = {
    userNameField: (requestObject.body.name || "").trim(),
    userEmailField: (requestObject.body.email || "").trim(),
    userPhoneField: (requestObject.body.phone || "").trim(),
    userGenderField: (requestObject.body.gender || "").trim(),
    userDOBField: requestObject.body.dob || "",
    userPasswordField: requestObject.body.password || "",
    userPasswordConfirmField: requestObject.body.confirmPassword || "",
    userMessageField: (requestObject.body.message || "").trim(),
    selectedCountry: requestObject.body.country || "",
    userOccupationField: (requestObject.body.occupation || "").trim()
  };

  const validationResult = validateFormSubmission(collectedFormData);

  if (!validationResult.isSubmissionValid) {
    return responseObject.render("index", { 
      submissionErrors: validationResult.errorCollection,
      submittedData: collectedFormData
    });
  }

  const newSubmissionRecord = {
    name: collectedFormData.userNameField || "",
    email: collectedFormData.userEmailField || "",
    phone: collectedFormData.userPhoneField || "",
    gender: collectedFormData.userGenderField || "",
    dob: collectedFormData.userDOBField || "",
    password: collectedFormData.userPasswordField || "",
    message: collectedFormData.userMessageField || "",
    country: collectedFormData.selectedCountry || "",
    occupation: collectedFormData.userOccupationField || "",
    submissionTime: new Date().toISOString()
  };

  console.log("Submission Record:", newSubmissionRecord);

  userSubmissionsDatabase.push(newSubmissionRecord);

  responseObject.render("response", newSubmissionRecord);
});

function validateFormSubmission(data) {
  const errorCollection = {};
  let isSubmissionValid = true;

  if (!data.userNameField || data.userNameField.length < 2) {
    errorCollection.name = "Name must contain at least 2 characters.";
    isSubmissionValid = false;
  }

  const emailValidationPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.userEmailField || !emailValidationPattern.test(data.userEmailField)) {
    errorCollection.email = "Please enter a valid email address.";
    isSubmissionValid = false;
  }

  const phoneDigitsOnly = data.userPhoneField.replace(/\D/g, "");
  if (!data.userPhoneField || phoneDigitsOnly.length < 10) {
    errorCollection.phone = "Phone number must contain at least 10 digits.";
    isSubmissionValid = false;
  }

  if (!data.userGenderField || data.userGenderField.length === 0) {
    errorCollection.gender = "Gender is required.";
    isSubmissionValid = false;
  }

  if (!data.userDOBField || data.userDOBField.length === 0) {
    errorCollection.dob = "Date of birth is required.";
    isSubmissionValid = false;
  }

  if (!data.userPasswordField || data.userPasswordField.length < 6) {
    errorCollection.password = "Password must be at least 6 characters.";
    isSubmissionValid = false;
  }

  if (data.userPasswordField !== data.userPasswordConfirmField) {
    errorCollection.confirmPassword = "Passwords do not match.";
    isSubmissionValid = false;
  }

  if (!data.userMessageField || data.userMessageField.length < 10) {
    errorCollection.message = "Message must contain at least 10 characters.";
    isSubmissionValid = false;
  }

  if (!data.selectedCountry) {
    errorCollection.country = "Please select your country.";
    isSubmissionValid = false;
  }

  if (!data.userOccupationField || data.userOccupationField.length === 0) {
    errorCollection.occupation = "Please select your occupation.";
    isSubmissionValid = false;
  }

  return {
    isSubmissionValid: isSubmissionValid,
    errorCollection: errorCollection
  };
}

application.listen(PORT_NUMBER, () => {
  console.log(`Server is running on http://localhost:${PORT_NUMBER}`);
});

