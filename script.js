const API_KEY = process.env.WEATHER_API_KEY;
const themeToggle = document.getElementById("theme-toggle");
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const widgetBody = document.getElementById("widget-body");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dawn-theme");
  document.body.classList.toggle("moon-theme");
  updateThemeIcon();
});

function updateThemeIcon() {
  const isDark = document.body.classList.contains("moon-theme");
  themeToggle.innerHTML = isDark
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    const tabName = btn.getAttribute("data-tab");
    document
      .querySelector(`.tab-content[data-tab="${tabName}"]`)
      .classList.add("active");
  });
});

searchBtn.addEventListener("click", searchWeather);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWeather();
});

async function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  try {
    widgetBody.innerHTML = `
            <div class="loading" style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--pine); margin-bottom: 15px;"></i>
                <p>Loading weather data...</p>
            </div>
        `;

    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await forecastResponse.json();

    if (currentData.cod === 200 && forecastData.cod === "200") {
      displayWeather(currentData);
      updateForecastTab(forecastData);
      updateDetailsTab(currentData);
    } else {
      showError("City not found. Try another location.");
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    showError("Failed to fetch weather data");
  }
}

function displayWeather(data) {
  widgetBody.innerHTML = `
        <div class="weather-display" style="display: flex;">
            <div class="current-weather">
                <div class="location">
                    <h2>${data.name} <span class="country-badge">${
    data.sys.country
  }</span></h2>
                    <p>${new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}</p>
                </div>
                <div class="temp">${Math.round(data.main.temp)}</div>
                <img class="weather-icon" src="https://openweathermap.org/img/wn/${
                  data.weather[0].icon
                }@2x.png" alt="${data.weather[0].description}">
            </div>
            
            <div class="weather-stats">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-wind"></i></div>
                    <div>
                        <div class="stat-value">${Math.round(
                          data.wind.speed * 3.6
                        )} km/h</div>
                        <div class="stat-label">Wind</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-tint"></i></div>
                    <div>
                        <div class="stat-value">${data.main.humidity}%</div>
                        <div class="stat-label">Humidity</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-temperature-high"></i></div>
                    <div>
                        <div class="stat-value">${Math.round(
                          data.main.feels_like
                        )}°</div>
                        <div class="stat-label">Feels Like</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-compress-alt"></i></div>
                    <div>
                        <div class="stat-value">${data.main.pressure} hPa</div>
                        <div class="stat-label">Pressure</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateForecastTab(forecastData) {
  const forecastContent = document.querySelector(
    '.tab-content[data-tab="forecast"]'
  );
  const dailyForecasts = getDailyForecasts(forecastData.list);

  let forecastHTML = '<div class="forecast-container">';

  dailyForecasts.forEach((day) => {
    forecastHTML += `
            <div class="forecast-day">
                <p class="day">${day.day}</p>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${
                  day.icon
                }.png" alt="${day.description}">
                <p class="forecast-temp">${Math.round(day.temp)}°</p>
            </div>
        `;
  });

  forecastHTML += "</div>";
  forecastContent.innerHTML = forecastHTML;
}

function updateDetailsTab(data) {
  const detailsContent = document.querySelector(
    '.tab-content[data-tab="details"]'
  );

  detailsContent.innerHTML = `
        <div class="detail-card">
            <div class="detail-row sunrise-icon">
                <div class="detail-icon">
                    <i class="fas fa-sunrise"></i>
                    <span class="detail-label">Sunrise</span>
                </div>
                <span class="detail-value">${new Date(
                  data.sys.sunrise * 1000
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
            </div>
            
            <div class="detail-row sunset-icon">
                <div class="detail-icon">
                    <i class="fas fa-sunset"></i>
                    <span class="detail-label">Sunset</span>
                </div>
                <span class="detail-value">${new Date(
                  data.sys.sunset * 1000
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
            </div>
            
            <div class="detail-row visibility-icon">
                <div class="detail-icon">
                    <i class="fas fa-eye"></i>
                    <span class="detail-label">Visibility</span>
                </div>
                <span class="detail-value">${(data.visibility / 1000).toFixed(
                  1
                )} km</span>
            </div>
            
            <div class="detail-row cloudiness-icon">
                <div class="detail-icon">
                    <i class="fas fa-cloud"></i>
                    <span class="detail-label">Cloudiness</span>
                </div>
                <span class="detail-value">${data.clouds.all}%</span>
            </div>
        </div>
    `;
}

function getDailyForecasts(forecastList) {
  const dailyForecasts = [];
  const daysAdded = new Set();
  const today = new Date().toLocaleDateString();

  for (const forecast of forecastList) {
    const forecastDate = new Date(forecast.dt * 1000);
    const dayName = forecastDate.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const dateStr = forecastDate.toLocaleDateString();

    if (
      dateStr !== today &&
      !daysAdded.has(dayName) &&
      forecast.dt_txt.includes("12:00:00")
    ) {
      daysAdded.add(dayName);
      dailyForecasts.push({
        day: dayName,
        temp: forecast.main.temp,
        icon: forecast.weather[0].icon,
        description: forecast.weather[0].description,
      });

      if (dailyForecasts.length === 5) break;
    }
  }

  return dailyForecasts;
}

function showError(message) {
  widgetBody.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 20px;">
            <i class="fas fa-exclamation-triangle" style="color: var(--love); font-size: 2rem; margin-bottom: 10px;"></i>
            <p>${message}</p>
        </div>
    `;

  document.querySelector('.tab-content[data-tab="details"]').innerHTML = `
        <div class="placeholder">
            <i class="fas fa-info-circle"></i>
            <p>Weather details will appear here</p>
        </div>
    `;
  document.querySelector('.tab-content[data-tab="forecast"]').innerHTML = `
        <div class="placeholder">
            <i class="fas fa-calendar-alt"></i>
            <p>5-day forecast will appear here</p>
        </div>
    `;
}
