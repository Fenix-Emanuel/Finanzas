import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authButton = document.getElementById("auth-button");
const authMessage = document.getElementById("auth-message");

const toggleAuthButton = document.getElementById("toggle-auth");
const toggleText = document.getElementById("toggle-text");
const formSubtitle = document.getElementById("form-subtitle");

let isLoginMode = true;

toggleAuthButton.addEventListener("click", () => {
  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    formSubtitle.textContent = "Welcome back";
    authButton.textContent = "Login";
    toggleText.textContent = "Don't have an account?";
    toggleAuthButton.textContent = "Create account";
  } else {
    formSubtitle.textContent = "Create your account";
    authButton.textContent = "Register";
    toggleText.textContent = "Already have an account?";
    toggleAuthButton.textContent = "Login";
  }

  authMessage.textContent = "";
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  authMessage.textContent = "";
  authButton.textContent = "Loading...";
  authButton.disabled = true;

  try {
    if (isLoginMode) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }

    window.location.href = "./index.html";

  } catch (error) {
    authMessage.textContent = getErrorMessage(error.code);
  } finally {
    authButton.textContent = isLoginMode ? "Login" : "Register";
    authButton.disabled = false;
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./index.html";
  }
});

function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered.";

    case "auth/invalid-email":
      return "Please enter a valid email.";

    case "auth/weak-password":
      return "Password should be at least 6 characters.";

    case "auth/invalid-credential":
      return "Invalid email or password.";

    default:
      return "Something went wrong. Please try again.";
  }
}