import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherDisplay.css';
import Loader from './Loader';

const weatherIcons = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '🌨️',
  Mist: '🌫️',
  Smoke: '🌫️',
  Haze: '🌫️',
  Dust: '🌫️',
  Fog: '🌫️',
  Sand: '🌫️',
  Ash: '🌫️',
  Squall: '💨',
  Tornado: '🌪️'
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

const convertTemp = (celsius, unit) => {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9/5) + 32);
  }
  return Math.round(celsius);
};

const getAirQualityText = (aqi) => {
  switch(aqi) {
    case 1: return { level: 'Good', color: '#4caf50' };
    case 2: return { level: 'Fair', color: '#8bc34a' };
    case 3: return { level: 'Moderate', color: '#ffc107' };
    case 4: return { level: 'Poor', color: '#ff9800' };
    case 5: return { level: 'Very Poor', color: '#f44336' };
    default: return { level: 'Unknown', color: '#9e9e9e' };
  }
};

const getAirQualityDescription = (aqi) => {
  switch(aqi) {
    case 1: return "Air quality is excellent. Perfect for outdoor activities.";
    case 2: return "Air quality is good. Suitable for outdoor activities.";
    case 3: return "Air quality is acceptable. Sensitive individuals should limit outdoor exposure.";
    case 4: return "Air quality is poor. Reduce outdoor activities.";
    case 5: return "Air quality is very poor. Avoid outdoor activities.";
    default: return "Air quality information unavailable.";
  }
};

const getPollutantInfo = (pollutant, value) => {
  const info = {
    pm2_5: {
      name: "PM2.5",
      description: "Fine particulate matter that can penetrate deep into the lungs",
      unit: "µg/m³",
      threshold: 10 // WHO guideline
    },
    pm10: {
      name: "PM10",
      description: "Coarse particulate matter",
      unit: "µg/m³",
      threshold: 20 // WHO guideline
    },
    no2: {
      name: "NO₂",
      description: "Nitrogen dioxide from vehicle emissions",
      unit: "µg/m³",
      threshold: 40 // WHO guideline
    },
    o3: {
      name: "O₃",
      description: "Ground-level ozone",
      unit: "µg/m³",
      threshold: 100 // WHO guideline
    }
  };
  
  return {
    ...info[pollutant],
    value: value.toFixed(1),
    status: value > info[pollutant].threshold ? "Above" : "Below" + " WHO guideline"
  };
};

const WeatherDisplay = ({ location, coordinates, unit, theme }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'YOUR_API_KEY';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let weatherResponse, forecastResponse, airQualityResponse;
        if (coordinates) {
          weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${API_KEY}`
          );
          forecastResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${API_KEY}`
          );
          airQualityResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${API_KEY}`
          );
        } else if (location) {
          const geoResponse = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`
          );
          
          if (geoResponse.data.length === 0) {
            throw new Error('Location not found');
          }
          
          const { lat, lon } = geoResponse.data[0];
          weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
          );
          forecastResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
          );
          airQualityResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
          );
        } else {
          throw new Error('No location or coordinates provided');
        }

        setWeatherData(weatherResponse.data);
        setForecastData(forecastResponse.data);
        setAirQualityData(airQualityResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
        setError(err.response ? err.response.data.message : err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [location, coordinates, API_KEY]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!weatherData) return <div className="loading">No weather data available</div>;

  const timeOfDay = getTimeOfDay();
  const weatherMain = weatherData.weather[0].main;
  const temp = convertTemp(weatherData.main.temp, unit);
  const feelsLike = convertTemp(weatherData.main.feels_like, unit);
  const weatherIcon = weatherIcons[weatherMain] || '🌡️';

  // Get daily forecast (one entry per day)
  const dailyForecast = forecastData?.list.filter((item, index) => index % 8 === 0).slice(0, 5);

  return (
    <div className={`weather-display ${weatherMain.toLowerCase()} ${timeOfDay}`}>
      <div className="weather-header">
        <h1 className="location-name">{weatherData.name}, {weatherData.sys.country}</h1>
        <div className="main-temp">
          {temp}°{unit.toUpperCase()}
        </div>
        <div className="weather-icon">
          {weatherIcon}
        </div>
        <div className="weather-description">
          {weatherData.weather[0].description}
        </div>
      </div>

      <div className="weather-info">
        <div className="info-card">
          <span>Feels Like</span>
          <strong>{feelsLike}°{unit.toUpperCase()}</strong>
        </div>
        <div className="info-card">
          <span>Humidity</span>
          <strong>{weatherData.main.humidity}%</strong>
        </div>
        <div className="info-card">
          <span>Wind Speed</span>
          <strong>{weatherData.wind.speed} m/s</strong>
        </div>
        <div className="info-card">
          <span>Pressure</span>
          <strong>{weatherData.main.pressure} hPa</strong>
        </div>
      </div>

      {airQualityData && (
        <div className="air-quality-section">
          <h3>Air Quality</h3>
          <div className="air-quality-info">
            <div 
              className="aqi-indicator"
              style={{ 
                backgroundColor: getAirQualityText(airQualityData.list[0].main.aqi).color,
                color: '#fff'
              }}
              title={getAirQualityDescription(airQualityData.list[0].main.aqi)}
            >
              {getAirQualityText(airQualityData.list[0].main.aqi).level}
            </div>
            <div className="pollutants">
              {Object.entries(airQualityData.list[0].components)
                .filter(([key]) => ['pm2_5', 'pm10', 'no2', 'o3'].includes(key))
                .map(([key, value]) => {
                  const pollutantInfo = getPollutantInfo(key, value);
                  return (
                    <div 
                      key={key} 
                      className="pollutant"
                      title={`${pollutantInfo.description}. ${pollutantInfo.status}`}
                    >
                      <span>{pollutantInfo.name}</span>
                      <strong>{pollutantInfo.value} {pollutantInfo.unit}</strong>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {dailyForecast && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-container">
            {dailyForecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <div className="forecast-date">
                  {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="forecast-icon">
                  {weatherIcons[day.weather[0].main]}
                </div>
                <div className="forecast-temp">
                  {convertTemp(day.main.temp, unit)}°{unit.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
