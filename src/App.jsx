
import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (city.trim() === "") {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setSearchedCity("");

    try {
      // To find city co-ordinates 
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city.trim()
        )}&count=1&language=en&format=json`
      );

      const data = response.data;

      if (!data.results || data.results.length === 0) {
        setError("City not found. Please try another city.");
        return;
      }

      const cityData = data.results[0];

      // To fetch curr weather
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${cityData.latitude}&longitude=${cityData.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      setSearchedCity(
        `${cityData.name}${cityData.country ? `, ${cityData.country}` : ""}`
      );

      setWeather(weatherResponse.data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch weather. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
    if ([71, 73, 75, 77].includes(code)) return "Snowfall";
    if ([80, 81, 82].includes(code)) return "Rain showers";
    if ([85, 86].includes(code)) return "Snow showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Weather unavailable";
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if ([1, 2].includes(code)) return "🌤️";
    if (code === 3) return "☁️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌡️";
  };

  return (
    <main className="app">
      <div className="container">
        <header className="app-header">
          <span className="header-icon">🌦️</span>
          <h1>Weather App</h1>
          <p>Discover the weather in your city</p>
        </header>

        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="City name"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {loading && (
          <p className="status-message">Fetching weather information...</p>
        )}

        {error && <p className="error-message">{error}</p>}

        {weather?.current && (
          <section className="weather-info" aria-live="polite">
            <div className="location">
              <span>📍</span>
              <h2>{searchedCity}</h2>
            </div>

            <div className="main-weather">
              <span className="weather-icon">
                {getWeatherIcon(weather.current.weather_code)}
              </span>

              <h3>{getWeatherDescription(weather.current.weather_code)}</h3>

              <p className="temperature">
                {Math.round(weather.current.temperature_2m)}°
                <span>C</span>
              </p>

              <p className="feels-like">
                Feels like {weather.current.apparent_temperature}°C
              </p>
            </div>

            <div className="weather-details">
              <div className="weather-card">
                <span className="detail-icon">💧</span>
                <p>Humidity</p>
                <h3>{weather.current.relative_humidity_2m}%</h3>
              </div>

              <div className="weather-card">
                <span className="detail-icon">💨</span>
                <p>Wind speed</p>
                <h3>{weather.current.wind_speed_10m} km/h</h3>
              </div>
            </div>

            <p className="updated-time">
              Local time: {weather.current.time.replace("T", " ")}
            </p>
          </section>
        )}

        {/* <footer>
          <p>Weather data provided by Open-Meteo</p>
        </footer> */}
      </div>
    </main>
  );
}

export default App;