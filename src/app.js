// API endpoints
const API_BASE_URL = 'https://disease.sh/v3';
const ENDPOINTS = {
  covid: `${API_BASE_URL}/covid-19`,
  countries: `${API_BASE_URL}/covid-19/countries`,
  historical: `${API_BASE_URL}/covid-19/historical`
};

// DOM Elements
const countrySearch = document.getElementById('countrySearch');
const diseaseFilter = document.getElementById('diseaseFilter');
const countriesGrid = document.getElementById('countriesGrid');
const modal = document.getElementById('countryModal');
const modalClose = document.querySelector('.close');
const globalChart = document.getElementById('globalChart');
const countryChart = document.getElementById('countryChart');

let countries = [];
let globalData = null;
let currentDisease = 'all';

// Initialize charts
let globalChartInstance = null;
let countryChartInstance = null;

// Fetch initial data
async function initialize() {
  try {
    const [countriesData, globalStats] = await Promise.all([
      fetch(ENDPOINTS.countries).then(res => res.json()),
      fetch(`${ENDPOINTS.covid}/all`).then(res => res.json())
    ]);

    countries = countriesData;
    globalData = globalStats;

    updateGlobalStats();
    renderCountries(countries);
    initializeGlobalChart();
  } catch (error) {
    console.error('Error fetching initial data:', error);
    showError('Failed to load initial data. Please try again later.');
  }
}

// Update global statistics
function updateGlobalStats() {
  const globalNumbers = document.getElementById('globalNumbers');
  globalNumbers.innerHTML = `
    <div class="stat">
      <h3>Total Cases</h3>
      <p>${formatNumber(globalData.cases)}</p>
    </div>
    <div class="stat">
      <h3>Total Deaths</h3>
      <p>${formatNumber(globalData.deaths)}</p>
    </div>
    <div class="stat">
      <h3>Total Recovered</h3>
      <p>${formatNumber(globalData.recovered)}</p>
    </div>
  `;
}

// Render country cards
function renderCountries(countriesData) {
  countriesGrid.innerHTML = '';
  countriesData.forEach(country => {
    const card = document.createElement('div');
    card.className = 'country-card';
    card.innerHTML = `
      <h3>${country.country}</h3>
      <p>Cases: ${formatNumber(country.cases)}</p>
      <p>Deaths: ${formatNumber(country.deaths)}</p>
      <p>Recovered: ${formatNumber(country.recovered)}</p>
    `;
    card.addEventListener('click', () => showCountryDetails(country));
    countriesGrid.appendChild(card);
  });
}

// Initialize global chart
function initializeGlobalChart() {
  const ctx = globalChart.getContext('2d');
  if (globalChartInstance) {
    globalChartInstance.destroy();
  }

  globalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Cases', 'Deaths', 'Recovered'],
      datasets: [{
        label: 'Global Statistics',
        data: [globalData.cases, globalData.deaths, globalData.recovered],
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Show country details in modal
async function showCountryDetails(country) {
  try {
    const historicalData = await fetch(`${ENDPOINTS.historical}/${country.country}`).then(res => res.json());
    
    document.getElementById('modalCountryName').textContent = country.country;
    document.getElementById('modalStats').innerHTML = `
      <div class="stat">
        <h3>Total Cases</h3>
        <p>${formatNumber(country.cases)}</p>
      </div>
      <div class="stat">
        <h3>Total Deaths</h3>
        <p>${formatNumber(country.deaths)}</p>
      </div>
      <div class="stat">
        <h3>Total Recovered</h3>
        <p>${formatNumber(country.recovered)}</p>
      </div>
    `;

    updateCountryChart(historicalData);
    modal.style.display = 'block';
  } catch (error) {
    console.error('Error fetching country details:', error);
    showError('Failed to load country details. Please try again later.');
  }
}

// Update country-specific chart
function updateCountryChart(historicalData) {
  const ctx = countryChart.getContext('2d');
  if (countryChartInstance) {
    countryChartInstance.destroy();
  }

  const dates = Object.keys(historicalData.timeline.cases);
  const cases = Object.values(historicalData.timeline.cases);
  const deaths = Object.values(historicalData.timeline.deaths);

  countryChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Cases',
          data: cases,
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: false
        },
        {
          label: 'Deaths',
          data: deaths,
          borderColor: 'rgba(255, 99, 132, 1)',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Event Listeners
countrySearch.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredCountries = countries.filter(country => 
    country.country.toLowerCase().includes(searchTerm)
  );
  renderCountries(filteredCountries);
});

diseaseFilter.addEventListener('change', (e) => {
  currentDisease = e.target.value;
  // In a real application, you would fetch data for different diseases here
  // For now, we'll just show a message
  if (currentDisease !== 'covid19') {
    showMessage('Data for other diseases will be integrated soon.');
  }
});

modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Utility functions
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

function showError(message) {
  // Implement error display logic
  alert(message);
}

function showMessage(message) {
  // Implement message display logic
  alert(message);
}

// Initialize the application
initialize();