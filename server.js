const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Session configuration
app.use(
  session({
    name: "securegate.sid",
    secret: process.env.SESSION_SECRET || "securegate-demo-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000
    }
  })
);

// Temporary in-memory user storage.
// User accounts disappear when the server restarts.
const users = [];

let nextUserId = 1;

// Register a new account
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    const existingUser = users.find(
      (user) => user.email === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: nextUserId++,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Automatically log in after successful registration
    req.session.userId = newUser.id;

    req.session.save((error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Account created, but the session could not start."
        });
      }

      res.status(201).json({
        success: true,
        message: "Account created successfully!",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      });
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong during registration."
    });
  }
});

// Log in to an existing account
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
      (item) => item.email === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Regenerate session after login
    req.session.regenerate((error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Unable to create a login session."
        });
      }

      req.session.userId = user.id;

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            success: false,
            message: "Unable to save your login session."
          });
        }

        res.json({
          success: true,
          message: "Login successful!",
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong during login."
    });
  }
});

// Check the current login session
app.get("/api/auth/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "You are not logged in."
    });
  }

  const user = users.find(
    (item) => item.id === req.session.userId
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Your account is no longer available."
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

// Protected dashboard API
app.get("/api/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in to access the dashboard."
    });
  }

  const user = users.find(
    (item) => item.id === req.session.userId
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User account not found."
    });
  }

  res.json({
    success: true,
    message: "Welcome to your secure dashboard!",
    stats: {
      accountStatus: "Active",
      securityStatus: "Password protected",
      sessionStatus: "Authenticated"
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

// Log out and destroy the session
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to log out. Please try again."
      });
    }

    res.clearCookie("securegate.sid", {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    });

    res.json({
      success: true,
      message: "You have been logged out successfully."
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SecureGate server running at http://localhost:${PORT}`);
});
