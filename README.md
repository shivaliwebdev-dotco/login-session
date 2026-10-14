
# SecureGate — Login and Session Management System

## Project Overview

SecureGate is a web-based authentication application built using HTML, CSS, JavaScript, Node.js and Express.

It allows users to register, log in, access a protected dashboard and log out securely.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- bcryptjs
- express-session

## Features

1. User registration
2. Email validation
3. Password length validation
4. Password hashing using bcrypt
5. User login authentication
6. Session creation and management
7. Protected dashboard API
8. User profile display
9. Logout and session destruction
10. Responsive dark glassmorphism UI
11. Password visibility toggle
12. Error and success messages

## Project Structure

```text
project-3-login-session/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── dashboard.html
└── README.md
```

## Installation

### Step 1: Open the backend folder

```bash
cd backend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Start the server

```bash
npm start
```

### Step 4: Open the application

Visit:

http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new account |
| POST | /api/auth/login | Authenticate a user |
| GET | /api/auth/me | Check the current session |
| GET | /api/dashboard | Access protected dashboard data |
| POST | /api/auth/logout | Destroy the current session |

## How It Works

1. A user registers with their name, email and password.
2. The server validates the submitted information.
3. bcrypt hashes the password before it is stored.
4. During login, the submitted password is compared with the stored hash.
5. Express creates a session for an authenticated user.
6. The dashboard API checks the session before returning private data.
7. Logging out destroys the session.

## Storage

This demonstration uses an in-memory JavaScript array instead of a database. User accounts and sessions are not persistent and may disappear when the server restarts.

The default Express session store is also intended for development, not production.

## Important Security Note

This project is for learning and demonstration purposes. Before production use, configure a strong secret through an environment variable, use HTTPS, add CSRF protection and rate limiting, and use persistent user and session storage.
