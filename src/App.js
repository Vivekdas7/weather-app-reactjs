import React, { useState, useEffect } from 'react';
import './App.css';
import WeatherDisplay from './components/WeatherDisplay';
import './components/WeatherDisplay.css';
import { FaSearch, FaMapMarkerAlt, FaMoon, FaSun } from 'react-icons/fa';

function App() {
  const [query, setQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [unit, setUnit] = useState('celsius');
  const [theme, setTheme] = useState('light');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    // Get user's current location when the app loads
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Could not get your location. Showing default location.');
          setSearchLocation('New York'); // Fallback to default city
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser. Showing default location.');
      setSearchLocation('New York'); // Fallback to default city
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }
  }, []);

  const handleSearch = (evt) => {
    if (evt.key === "Enter" && query.trim()) {
      const searchTerm = query.trim();
      setSearchLocation(searchTerm);
      setCoordinates(null);
      setQuery('');
      
      // Add to recent searches
      const updatedSearches = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
  }

  const handleRecentSearch = (location) => {
    setSearchLocation(location);
    setCoordinates(null);
    setQuery('');
    setShowRecent(false);
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setSearchLocation('');
        },
        (error) => {
          setLocationError('Could not get your location. Please try searching for a city.');
        }
      );
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  }

  return (
    <div className={`app-wrap ${theme}`}>
      <div className="app-container">
        <header className="App-header">
          <div className="header-top">
            <h1>Weather Forecast</h1>
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </div>

          <div className="search-section">
            <div className="search-container">
              <input 
                type="text"
                className="search-box"
                placeholder="Search for a city..."
                onChange={e => {
                  setQuery(e.target.value);
                  setShowRecent(e.target.value === '');
                }}
                value={query}
                onKeyPress={handleSearch}
                onFocus={() => setShowRecent(query === '')}
              />
              <button className="search-icon" onClick={() => handleSearch({ key: 'Enter' })}>
                <FaSearch />
              </button>
              <button className="location-icon" onClick={getCurrentLocation}>
                <FaMapMarkerAlt />
              </button>
            </div>

            {showRecent && recentSearches.length > 0 && (
              <div className="recent-searches">
                <h3>Recent Searches</h3>
                <ul>
                  {recentSearches.map((location, index) => (
                    <li key={index} onClick={() => handleRecentSearch(location)}>
                      {location}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {locationError && (
            <div className="location-error">
              {locationError}
            </div>
          )}
        </header>

        <main>
          <WeatherDisplay 
            location={searchLocation} 
            coordinates={coordinates}
            unit={unit}
            theme={theme}
          />
        </main>

        <footer className="app-footer">
          <div className="unit-toggle">
            <button 
              className={unit === 'celsius' ? 'active' : ''} 
              onClick={() => setUnit('celsius')}
            >
              °C
            </button>
            <button 
              className={unit === 'fahrenheit' ? 'active' : ''} 
              onClick={() => setUnit('fahrenheit')}
            >
              °F
            </button>
          </div>
          <p className="footer-text">
            Made with ❤️ by Vivek
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
