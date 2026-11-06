const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!fullName || !email || !password || !confirmPassword) {
    showMessage("Please complete all fields.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.some(user => user.email === email);

  if (userExists) {
    showMessage("This email is already registered.", "error");
    return;
  }

  const newUser = {
    id: Date.now(),
    fullName,
    email,
    password
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showMessage("Account created successfully. Redirecting...", "success");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
});

function showMessage(message, type) {
  registerMessage.textContent = message;
  registerMessage.className = `auth-message ${type}`;
}