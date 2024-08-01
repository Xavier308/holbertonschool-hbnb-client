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
          <div>
              <h3>${place.description}</h3>
              <p><strong>Price:</strong> $${place.price_per_night}/night</p>
              <p><strong>Location:</strong> ${place.city_name}, ${place.country_name}</p>
          </div>
          <a href="place.html?id=${place.id}" class="details-button">View Details</a>
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

function getPlaceIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function checkAuthenticationForPlaceDetails() {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const loginButton = document.querySelector('.login-button');
  const logoutButton = document.querySelector('.logout-button');

  if (!token) {
      addReviewSection.style.display = 'none';
      loginButton.style.display = 'inline-block';
      logoutButton.style.display = 'none';
  } else {
      addReviewSection.style.display = 'block';
      loginButton.style.display = 'none';
      logoutButton.style.display = 'inline-block';
      const placeId = getPlaceIdFromURL();
      fetchPlaceDetails(token, placeId);
  }
}

async function fetchPlaceDetails(token, placeId) {
  try {
      const response = await fetch(`http://localhost:5000/places/${placeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch place details');
      const place = await response.json();
      displayPlaceDetails(place);
  } catch (error) {
      console.error('Error:', error);
      displayErrorMessage('Failed to load place details. Please try again later.');
  }
}

function displayPlaceDetails(place) {
  const placeDetailsSection = document.getElementById('place-details');
  placeDetailsSection.innerHTML = `
      <h1 class="place-name">${place.description}</h1>
      <div class="place-card">
          <p><strong>Host:</strong> ${place.host_name}</p>
          <p><strong>Location:</strong> ${place.city_name}, ${place.country_name}</p>
          <p><strong>Price per night:</strong> $${place.price_per_night}</p>
          <p><strong>Number of rooms:</strong> ${place.number_of_rooms}</p>
          <p><strong>Number of bathrooms:</strong> ${place.number_of_bathrooms}</p>
          <p><strong>Max guests:</strong> ${place.max_guests}</p>
          <h3>Amenities:</h3>
          <ul class="amenities-list">
              ${place.amenities.map(amenity => `<li>${amenity}</li>`).join('')}
          </ul>
      </div>
  `;

  displayReviews(place.reviews);
}

function displayReviews(reviews) {
  const reviewsSection = document.getElementById('reviews');
  reviewsSection.innerHTML = '<h3>Reviews</h3>';
  
  if (reviews.length === 0) {
      reviewsSection.innerHTML += '<p>No reviews yet.</p>';
  } else {
      const reviewsHTML = reviews.map(review => `
          <div class="review-card">
              <p class="reviewer-name">${review.user_name}</p>
              <p class="rating">Rating: ${review.rating}/5</p>
              <p>${review.comment}</p>
          </div>
      `).join('');
      reviewsSection.innerHTML += reviewsHTML;
  }
}

// function to handle the review submission
function handleReviewSubmission(event) {
  event.preventDefault();
  const rating = document.getElementById('rating').value;
  const review = document.getElementById('review').value;
  const placeId = getPlaceIdFromURL();
  const token = getCookie('token');

  // Send this data to the API
  console.log(`Submitting review for place ${placeId}: Rating ${rating}, Review: ${review}`);
  
  // Change this later
  const newReview = {
      user_name: 'You',
      rating: rating,
      comment: review
  };

  const reviewsSection = document.getElementById('reviews');
  const newReviewHTML = `
      <div class="review-card">
          <p class="reviewer-name">${newReview.user_name}</p>
          <p class="rating">Rating: ${newReview.rating}/5</p>
          <p>${newReview.comment}</p>
      </div>
  `;
  reviewsSection.innerHTML += newReviewHTML;

  // Clear the form
  document.getElementById('review-form').reset();
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
  } else if (document.getElementById('place-details')) {
      // We're on the place details page
      checkAuthenticationForPlaceDetails();
      const logoutButton = document.querySelector('.logout-button');
      if (logoutButton) {
          logoutButton.addEventListener('click', () => {
              document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.reload();
          });
      }
      // Add event listener for review submission
      const reviewForm = document.getElementById('review-form');
      if (reviewForm) {
          reviewForm.addEventListener('submit', handleReviewSubmission);
      }
  } else {
      // We're on the index page
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