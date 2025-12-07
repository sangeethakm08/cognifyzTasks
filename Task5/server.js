const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

// In-memory data store (simulating database)
let usersDatabase = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    occupation: "Software Engineer",
    country: "USA",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    occupation: "Data Scientist",
    country: "UK",
    createdAt: new Date().toISOString()
  }
];

let nextId = 3;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ============================================
// RESTful API Endpoints - CRUD Operations
// ============================================

// GET /api/users - Get all users
app.get("/api/users", (req, res) => {
  try {
    res.json({
      success: true,
      data: usersDatabase,
      count: usersDatabase.length,
      message: "Users retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message
    });
  }
});

// GET /api/users/:id - Get single user by ID
app.get("/api/users/:id", (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = usersDatabase.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    res.json({
      success: true,
      data: user,
      message: "User retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error: error.message
    });
  }
});

// POST /api/users - Create new user
app.post("/api/users", (req, res) => {
  try {
    const { name, email, phone, occupation, country } = req.body;

    // Validation
    if (!name || !email || !phone || !occupation || !country) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, phone, occupation, country"
      });
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Check if email already exists
    const emailExists = usersDatabase.some(u => u.email === email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Create new user
    const newUser = {
      id: nextId++,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      occupation: occupation.trim(),
      country: country.trim(),
      createdAt: new Date().toISOString()
    };

    usersDatabase.push(newUser);

    res.status(201).json({
      success: true,
      data: newUser,
      message: "User created successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message
    });
  }
});

// PUT /api/users/:id - Update user by ID
app.put("/api/users/:id", (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, phone, occupation, country } = req.body;

    const userIndex = usersDatabase.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Validation
    if (!name || !email || !phone || !occupation || !country) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Check if email exists for another user
    const emailExists = usersDatabase.some(
      (u, index) => u.email === email && index !== userIndex
    );
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists for another user"
      });
    }

    // Update user
    const updatedUser = {
      ...usersDatabase[userIndex],
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      occupation: occupation.trim(),
      country: country.trim(),
      updatedAt: new Date().toISOString()
    };

    usersDatabase[userIndex] = updatedUser;

    res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user by ID
app.delete("/api/users/:id", (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userIndex = usersDatabase.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    const deletedUser = usersDatabase.splice(userIndex, 1)[0];

    res.json({
      success: true,
      data: deletedUser,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
});

// GET /api/users/search/:query - Search users
app.get("/api/users/search/:query", (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const filteredUsers = usersDatabase.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.occupation.toLowerCase().includes(query) ||
      user.country.toLowerCase().includes(query)
    );

    res.json({
      success: true,
      data: filteredUsers,
      count: filteredUsers.length,
      message: `Found ${filteredUsers.length} user(s) matching "${query}"`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message
    });
  }
});

// ============================================
// View Routes
// ============================================

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/users`);
});

