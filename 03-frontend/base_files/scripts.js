// Shared utility functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function displayErrorMessage(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  document.body.appendChild(errorElement);
}

// Login functionality
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
      const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
      });
      if (response.ok) {
          const data = await response.json();
          document.cookie = `token=${data.access_token}; path=/`;
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

// Index page functionality
let allPlaces = [];

function checkAuthentication() {
  const token = getCookie('token');
  const loginButton = document.querySelector('.login-button');
  const logoutButton = document.querySelector('.logout-button');
  if (!token) {
      loginButton.style.display = 'inline-block';
      logoutButton.style.display = 'none';
  } else {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'inline-block';
      fetchPlaces(token);
  }
}

async function fetchPlaces(token) {
  try {
      const response = await fetch('http://localhost:5000/places', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch places');
      allPlaces = await response.json();
      displayPlaces(allPlaces);
  } catch (error) {
      console.error('Error:', error);
      displayErrorMessage('Failed to load places. Please try again later.');
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';
  places.forEach(place => {
      const placeCard = document.createElement('div');
      placeCard.className = 'place-card';
      placeCard.innerHTML = `
          <h3>${place.description}</h3>
          <p>Price per night: $${place.price_per_night}</p>
          <p>Location: ${place.city_name}, ${place.country_name}</p>
          <button onclick="viewDetails('${place.id}')">View Details</button>
      `;
      placesList.appendChild(placeCard);
  });
}

function filterPlaces() {
  const selectedCountry = document.getElementById('country-filter').value;
  const filteredPlaces = selectedCountry === 'All' ? allPlaces : 
      allPlaces.filter(place => place.country_name === selectedCountry);
  displayPlaces(filteredPlaces);
}

function viewDetails(placeId) {
  window.location.href = `place.html?id=${placeId}`;
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
  } else {
      checkAuthentication();
      const countryFilter = document.getElementById('country-filter');
      if (countryFilter) {
          countryFilter.addEventListener('change', filterPlaces);
      }
      const logoutButton = document.querySelector('.logout-button');
      if (logoutButton) {
          logoutButton.addEventListener('click', () => {
              document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.reload();
          });
      }
  }
});