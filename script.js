
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const messageBox = document.getElementById("messageBox");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

// Display a message to the user
function showMessage(message, type = "error") {
  messageBox.textContent = message;
  messageBox.className = `message-box show ${type}`;
}

// Clear the displayed message
function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message-box";
}

// Switch between login and registration forms
function showForm(formType) {
  clearMessage();

  const isLogin = formType === "login";

  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);

  loginTab.classList.toggle("active", isLogin);
  registerTab.classList.toggle("active", !isLogin);

  loginTab.setAttribute("aria-selected", String(isLogin));
  registerTab.setAttribute("aria-selected", String(!isLogin));

  formTitle.textContent = isLogin
    ? "Welcome back"
    : "Create your account";

  formSubtitle.textContent = isLogin
    ? "Enter your details to sign in."
    : "Join SecureGate and protect your account.";

  // Hide any password that was previously revealed
  document.querySelectorAll(".password-toggle").forEach((button) => {
    const input = document.getElementById(button.dataset.target);

    input.type = "password";
    button.textContent = "Show";
    button.setAttribute("aria-label", "Show password");
  });
}

loginTab.addEventListener("click", () => {
  showForm("login");
});

registerTab.addEventListener("click", () => {
  showForm("register");
});

document.getElementById("switchToRegister").addEventListener("click", () => {
  showForm("register");
});

document.getElementById("switchToLogin").addEventListener("click", () => {
  showForm("login");
});

// Show or hide passwords
document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);

    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";
    button.textContent = isHidden ? "Hide" : "Show";

    button.setAttribute(
      "aria-label",
      isHidden ? "Hide password" : "Show password"
    );
  });
});

// Send a request to the backend
async function sendRequest(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

// Disable a button while a request is processing
function setButtonLoading(button, loading, loadingText, originalText) {
  button.disabled = loading;
  button.innerHTML = loading ? loadingText : originalText;
}

// Login form submission
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const originalText = "Sign In <span>→</span>";

  setButtonLoading(
    loginButton,
    true,
    "Signing in...",
    originalText
  );

  try {
    const result = await sendRequest("/api/auth/login", {
      email,
      password
    });

    showMessage(result.message, "success");

    window.setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 400);
  } catch (error) {
    showMessage(error.message);
  } finally {
    setButtonLoading(
      loginButton,
      false,
      "",
      originalText
    );
  }
});

// Registration form submission
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  if (name.length < 2) {
    showMessage("Name must contain at least 2 characters.");
    return;
  }

  if (password.length < 8) {
    showMessage("Password must be at least 8 characters long.");
    return;
  }

  const originalText = "Create Account <span>→</span>";

  setButtonLoading(
    registerButton,
    true,
    "Creating account...",
    originalText
  );

  try {
    const result = await sendRequest("/api/auth/register", {
      name,
      email,
      password
    });

    showMessage(result.message, "success");

    window.setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 400);
  } catch (error) {
    showMessage(error.message);
  } finally {
    setButtonLoading(
      registerButton,
      false,
      "",
      originalText
    );
  }
});

// If the user is already logged in, send them to the dashboard
async function checkExistingSession() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "same-origin"
    });

    if (response.ok) {
      window.location.replace("/dashboard.html");
    }
  } catch (error) {
    console.error("Unable to check the current session:", error);
  }
}

checkExistingSession();
