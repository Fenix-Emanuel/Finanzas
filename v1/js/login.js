const loginForm = document.getElementById("auth-form");
const authMessage = document.getElementById("auth-message");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const validUser = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!validUser) {
    authMessage.textContent = "Invalid email or password.";
    authMessage.style.color = "#f87171";
    return;
  }

  localStorage.setItem("loggedUser", JSON.stringify(validUser));

  window.location.href = "index.html";
});