// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
  }
});

// Function to handle the login form submission
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
      const response = await loginUser(email, password);
      if (response.ok) {
          const data = await response.json();
          setTokenCookie(data.access_token);
          window.location.href = 'index.html';
      } else {
          const errorData = await response.json();
          displayErrorMessage(errorData.msg || 'Login failed. Please try again.');
      }
  } catch (error) {
      console.error('Login error:', error);
      displayErrorMessage('An unexpected error occurred. Please try again later.');
  }
}

// Function to send login request to the API
async function loginUser(email, password) {
  return fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  });
}

// Function to set the JWT token in a cookie
function setTokenCookie(token) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // Token expires in 7 days
  document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/`;
}

// Function to display error messages
function displayErrorMessage(message) {
  const errorElement = document.getElementById('login-error');
  if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
  } else {
      alert(message);
  }
}