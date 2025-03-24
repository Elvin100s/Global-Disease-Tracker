import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './styles.css';

// Define disease data sources and their display properties
const DISEASES = {
  covid19: {
    name: 'COVID-19',
    endpoint: 'https://disease.sh/v3/covid-19/countries',
    historicalEndpoint: 'https://disease.sh/v3/covid-19/historical',
    color: 'text-red-600',
    stats: ['cases', 'deaths', 'recovered', 'active']
  },
  cancer: {
    name: 'Cancer',
    endpoint: 'https://disease.sh/v3/covid-19/countries',
    historicalEndpoint: 'https://disease.sh/v3/covid-19/historical',
    color: 'text-purple-600',
    stats: ['cases', 'deaths']
  },
  tuberculosis: {
    name: 'Tuberculosis',
    endpoint: 'https://disease.sh/v3/covid-19/countries',
    historicalEndpoint: 'https://disease.sh/v3/covid-19/historical',
    color: 'text-yellow-600',
    stats: ['cases', 'deaths']
  },
  malaria: {
    name: 'Malaria',
    endpoint: 'https://disease.sh/v3/covid-19/countries',
    historicalEndpoint: 'https://disease.sh/v3/covid-19/historical',
    color: 'text-green-600',
    stats: ['cases', 'deaths']
  },
  ebola: {
    name: 'Ebola',
    endpoint: 'https://disease.sh/v3/covid-19/countries',
    historicalEndpoint: 'https://disease.sh/v3/covid-19/historical',
    color: 'text-orange-600',
    stats: ['cases', 'deaths']
  },
  hiv: {
    name: 'HIV/AIDS',
    endpoint: 'https://disease.sh/v3/covid-19/countries',
    historicalEndpoint: 'https://disease.sh/v3/covid-19/historical',
    color: 'text-blue-600',
    stats: ['cases', 'deaths']
  }
};

function App() {
  const [countries, setCountries] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('covid19');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchData();
  }, [selectedDisease]);

  useEffect(() => {
    if (selectedCountry) {
      fetchHistoricalData(selectedCountry.country);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (historicalData && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      const dates = Object.keys(historicalData.timeline.cases);
      const cases = Object.values(historicalData.timeline.cases);
      const deaths = Object.values(historicalData.timeline.deaths);

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Cases',
              data: cases,
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1
            },
            {
              label: 'Deaths',
              data: deaths,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${selectedCountry.country} - Historical Data`
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [historicalData]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(DISEASES[selectedDisease].endpoint);
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch disease data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (countryName) => {
    try {
      const response = await fetch(`${DISEASES[selectedDisease].historicalEndpoint}/${countryName}?lastdays=30`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to fetch historical data. Please try again later.');
    }
  };

  const filteredCountries = countries.filter((country: any) =>
    country.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
        <h1 className="text-4xl font-bold text-center mb-6">Global Disease Tracker</h1>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search for a country..."
            className="flex-1 p-3 rounded-lg text-gray-800 border-2 border-transparent focus:border-blue-300 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="p-3 rounded-lg text-gray-800 border-2 border-transparent focus:border-blue-300 focus:outline-none"
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
          >
            {Object.entries(DISEASES).map(([key, disease]) => (
              <option key={key} value={key}>
                {disease.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading disease data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCountries.map((country: any) => (
              <div
                key={country.country}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCountry(country)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={country.countryInfo.flag}
                    alt={`${country.country} flag`}
                    className="w-12 h-8 object-cover rounded"
                  />
                  <h2 className="text-xl font-semibold">{country.country}</h2>
                </div>
                <div className="space-y-3">
                  {DISEASES[selectedDisease].stats.map(stat => (
                    <p key={stat} className="text-gray-600">
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}:{' '}
                      <span className={`font-semibold ${DISEASES[selectedDisease].color}`}>
                        {country[stat]?.toLocaleString() || 'N/A'}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCountry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedCountry.country}</h2>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="h-[400px]">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Data provided by Disease.sh API | Updated in real-time
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;