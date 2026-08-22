import { getGalokCity, normalizeCitySlug } from "./cities.config.js";

const WEATHER_CURRENT = "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m";
const CACHE_TTL = 10 * 60 * 1000;
const cityCache = new Map();
const weatherCovers = new Map([
  ["beijing", {
    src: "/assets/be-a-viewer/weather/beijing/cover.webp",
    alt: "Beijing palace walls in clear sunlight on aged paper"
  }]
]);

const weatherLabels = new Map([
  [0, "CLEAR"],
  [1, "MAINLY CLEAR"],
  [2, "PARTLY CLOUDY"],
  [3, "OVERCAST"],
  [45, "FOG"],
  [48, "RIME FOG"],
  [51, "LIGHT DRIZZLE"],
  [53, "DRIZZLE"],
  [55, "DENSE DRIZZLE"],
  [56, "FREEZING DRIZZLE"],
  [57, "FREEZING DRIZZLE"],
  [61, "LIGHT RAIN"],
  [63, "RAIN"],
  [65, "HEAVY RAIN"],
  [66, "FREEZING RAIN"],
  [67, "FREEZING RAIN"],
  [71, "LIGHT SNOW"],
  [73, "SNOW"],
  [75, "HEAVY SNOW"],
  [77, "SNOW GRAINS"],
  [80, "RAIN SHOWERS"],
  [81, "RAIN SHOWERS"],
  [82, "HEAVY SHOWERS"],
  [85, "SNOW SHOWERS"],
  [86, "HEAVY SNOW SHOWERS"],
  [95, "THUNDERSTORM"],
  [96, "STORM / HAIL"],
  [99, "STORM / HAIL"]
]);

function coordinate(value, positive, negative) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

function formatClock(value) {
  if (!value || !value.includes("T")) return "—";
  return value.split("T")[1].slice(0, 5);
}

function formatNumber(value, suffix = "", digits = 0) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}${suffix}`;
}

function aqiLabel(value) {
  if (!Number.isFinite(value)) return "NO READING";
  if (value <= 50) return "GOOD";
  if (value <= 100) return "MODERATE";
  if (value <= 150) return "SENSITIVE GROUPS";
  if (value <= 200) return "UNHEALTHY";
  if (value <= 300) return "VERY UNHEALTHY";
  return "HAZARDOUS";
}

async function requestCityConditions(city, signal) {
  const cached = cityCache.get(city.slug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    current: WEATHER_CURRENT,
    daily: "sunset",
    timezone: "auto",
    forecast_days: "1"
  }).toString();

  const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  airUrl.search = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    current: "us_aqi",
    timezone: "auto"
  }).toString();

  const [weatherResult, airResult] = await Promise.allSettled([
    fetch(weatherUrl, { signal }),
    fetch(airUrl, { signal })
  ]);

  if (weatherResult.status !== "fulfilled" || !weatherResult.value.ok) throw new Error("Live city data unavailable");

  const weather = await weatherResult.value.json();
  const air = airResult.status === "fulfilled" && airResult.value.ok ? await airResult.value.json() : {};
  const data = {
    time: weather.current?.time,
    temperature: weather.current?.temperature_2m,
    apparent: weather.current?.apparent_temperature,
    humidity: weather.current?.relative_humidity_2m,
    weatherCode: weather.current?.weather_code,
    wind: weather.current?.wind_speed_10m,
    sunset: weather.daily?.sunset?.[0],
    aqi: air.current?.us_aqi
  };

  cityCache.set(city.slug, { timestamp: Date.now(), data });
  return data;
}

class GalokCityWeather extends HTMLElement {
  static observedAttributes = ["data-city"];

  connectedCallback() {
    this.renderShell();
    this.loadCity();
    window.clearInterval(this.refreshTimer);
    this.refreshTimer = window.setInterval(() => {
      if (!document.hidden) this.loadCity();
    }, CACHE_TTL);
  }

  disconnectedCallback() {
    this.requestController?.abort();
    window.clearInterval(this.refreshTimer);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-city" && oldValue !== newValue && this.isConnected) this.loadCity();
  }

  renderShell() {
    if (this.querySelector(".city-weather")) return;
    if (!this.hasAttribute("role")) this.setAttribute("role", "region");
    this.innerHTML = `
      <section class="city-weather" data-state="loading">
        <figure class="city-weather__cover" data-weather-cover hidden aria-hidden="true">
          <img data-weather-cover-image alt="" decoding="async">
        </figure>
        <header class="city-weather__masthead">
          <p data-weather-section>${this.dataset.index ? `${this.dataset.index} / ` : ""}LIVE CITY FIELD</p>
          <div class="city-weather__place">
            <h2 data-weather-city>BEIJING</h2>
            <p data-weather-coordinates>39.9042° N / 116.4074° E</p>
          </div>
          <div class="city-weather__updated">
            <span>LOCAL READING</span>
            <time data-weather-time>—</time>
          </div>
        </header>
        <div class="city-weather__reading">
          <div class="city-weather__temperature"><output data-weather-temperature>--</output><span class="city-weather__unit">°C / NOW</span></div>
          <div class="city-weather__condition"><p class="city-weather__status" data-weather-status aria-live="polite">READING CURRENT CONDITIONS</p><h3 data-weather-condition>FIELD DATA</h3></div>
        </div>
        <dl class="city-weather__metrics">
          <div class="city-weather__metric"><dt>Feels like</dt><dd data-weather-apparent>—</dd><small>°C / apparent</small></div>
          <div class="city-weather__metric"><dt>Humidity</dt><dd data-weather-humidity>—</dd><small>relative / %</small></div>
          <div class="city-weather__metric"><dt>Wind</dt><dd data-weather-wind>—</dd><small>km/h / 10 m</small></div>
          <div class="city-weather__metric"><dt>Sunset</dt><dd data-weather-sunset>—</dd><small>local time</small></div>
          <div class="city-weather__metric"><dt>Air quality</dt><dd data-weather-aqi>—</dd><small data-weather-aqi-label>US AQI / current</small></div>
        </dl>
        <footer class="city-weather__source"><span>CURRENT MODEL CONDITIONS · AUTO UPDATED</span><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">DATA / OPEN-METEO ↗</a></footer>
      </section>
    `;
  }

  async loadCity() {
    const city = getGalokCity(this.dataset.city || "beijing");
    const root = this.querySelector(".city-weather");
    if (!root) return;

    this.requestController?.abort();
    this.requestController = new AbortController();
    const requestController = this.requestController;
    const timeout = window.setTimeout(() => requestController.abort(), 12000);

    root.dataset.state = "loading";
    const cover = weatherCovers.get(city.slug);
    const coverImage = root.querySelector("[data-weather-cover-image]");
    if (cover) {
      root.dataset.cover = city.slug;
      coverImage.src = cover.src;
      coverImage.alt = cover.alt;
      coverImage.parentElement.hidden = false;
    } else {
      delete root.dataset.cover;
      coverImage.removeAttribute("src");
      coverImage.alt = "";
      coverImage.parentElement.hidden = true;
    }
    root.querySelector("[data-weather-city]").textContent = city.name;
    root.querySelector("[data-weather-coordinates]").textContent = `${coordinate(city.latitude, "N", "S")} / ${coordinate(city.longitude, "E", "W")}`;
    root.querySelector("[data-weather-status]").textContent = "READING CURRENT CONDITIONS";

    try {
      const data = await requestCityConditions(city, requestController.signal);
      if (requestController !== this.requestController) return;
      root.querySelector("[data-weather-time]").textContent = formatClock(data.time);
      root.querySelector("[data-weather-temperature]").textContent = formatNumber(data.temperature);
      root.querySelector("[data-weather-condition]").textContent = weatherLabels.get(data.weatherCode) || "CURRENT CONDITIONS";
      root.querySelector("[data-weather-apparent]").textContent = formatNumber(data.apparent, "°");
      root.querySelector("[data-weather-humidity]").textContent = formatNumber(data.humidity, "%");
      root.querySelector("[data-weather-wind]").textContent = formatNumber(data.wind);
      root.querySelector("[data-weather-sunset]").textContent = formatClock(data.sunset);
      root.querySelector("[data-weather-aqi]").textContent = formatNumber(data.aqi);
      root.querySelector("[data-weather-aqi-label]").textContent = `US AQI / ${aqiLabel(data.aqi)}`;
      root.querySelector("[data-weather-status]").textContent = "CURRENT MODEL / LIVE";
      root.dataset.state = "ready";
    } catch (error) {
      if (error.name === "AbortError" && requestController !== this.requestController) return;
      root.querySelector("[data-weather-time]").textContent = "—";
      root.querySelector("[data-weather-condition]").textContent = "DATA PAUSED";
      root.querySelector("[data-weather-status]").textContent = "FIELD DATA TEMPORARILY UNAVAILABLE";
      root.dataset.state = "error";
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

if (!customElements.get("galok-city-weather")) customElements.define("galok-city-weather", GalokCityWeather);

const liveWeather = document.querySelector("galok-city-weather[data-live-city]");
if (liveWeather) {
  window.addEventListener("galok:citychange", (event) => {
    const city = normalizeCitySlug(event.detail?.city || "");
    if (city) liveWeather.dataset.city = city;
  });
}
