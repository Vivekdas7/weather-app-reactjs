import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="weather-loader">
        <div className="cloud front">
          <span className="left-front"></span>
          <span className="right-front"></span>
        </div>
        <span className="sun sunshine"></span>
        <span className="sun"></span>
        <div className="cloud back">
          <span className="left-back"></span>
          <span className="right-back"></span>
        </div>
      </div>

      <div className="rain-container">
        <span className="drop"></span>
        <span className="drop"></span>
        <span className="drop"></span>
        <span className="drop"></span>
        <span className="drop"></span>
      </div>

      <div className="text">Loading weather data...</div>
    </div>
  );
};

export default Loader;
