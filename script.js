let tempChart = null;
const apiKey = "c77825cfb5c0fe2da389d1bd64f9dbcd";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    error.textContent = "Masukkan nama kota dulu";
    error.classList.remove("hidden");
    return;
  }

  getWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// ================= WEATHER =================

function showWeather(data) {
  const icon = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  weatherResult.innerHTML = `
    <div id="weatherCard"
      class="fade-enter bg-white/10 backdrop-blur-md p-5 rounded-2xl mt-4 shadow-xl">

      <h2 class="text-lg font-semibold">
        ${data.name}, ${data.sys.country}
      </h2>

      <div class="flex items-center justify-center gap-3 mt-2">
        <img src="${iconUrl}" class="w-16 h-16">
        <p class="text-5xl font-bold">
          ${Math.round(data.main.temp)}°C
        </p>
      </div>

      <p class="capitalize text-gray-300 mt-2 text-sm">
        ${data.weather[0].description}
      </p>

      <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div class="bg-white/5 p-3 rounded-xl">
          <p class="text-gray-400">Humidity</p>
          <p class="font-semibold text-lg">
            ${data.main.humidity}%
          </p>
        </div>

        <div class="bg-white/5 p-3 rounded-xl">
          <p class="text-gray-400">Wind</p>
          <p class="font-semibold text-lg">
            ${data.wind.speed} m/s
          </p>
        </div>
      </div>
    </div>
  `;

  // Trigger animation
  setTimeout(() => {
    const card = document.getElementById("weatherCard");
    if (card) {
      card.classList.add("fade-enter-active");
    }
  }, 50);
}

// ================= FORECAST =================

function showForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00"),
  );

  dailyData.slice(0, 5).forEach((day) => {
    const date = new Date(day.dt_txt);
    const dayName = date.toLocaleDateString("id-ID", {
      weekday: "short",
    });

    const icon = day.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

    forecastContainer.innerHTML += `
      <div class="fade-enter bg-white/10 hover:bg-white/20
        p-3 rounded-xl text-center">
        <p class="font-medium">${dayName}</p>
        <img src="${iconUrl}" class="mx-auto w-10 h-10">
        <p class="font-semibold mt-1">
          ${Math.round(day.main.temp)}°C
        </p>
      </div>
    `;
  });

  // Trigger animation forecast
  setTimeout(() => {
    forecastContainer.querySelectorAll(".fade-enter").forEach((el) => {
      el.classList.add("fade-enter-active");
    });
  }, 50);
}

// ================= Render Temperature Chart =================

function renderTemperatureChart(data) {
  const canvas = document.getElementById("tempChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00"),
  );

  const labels = dailyData.slice(0, 5).map((day) => {
    const date = new Date(day.dt_txt);
    return date.toLocaleDateString("id-ID", { weekday: "short" });
  });

  const temperatures = dailyData
    .slice(0, 5)
    .map((day) => Math.round(day.main.temp));

  if (tempChart) {
    tempChart.destroy();
  }

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Suhu (°C)",
          data: temperatures,
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "white",
          },
        },
        y: {
          ticks: {
            color: "white",
          },
        },
      },
    },
  });
}

// ================= BACKGROUND =================

function changeBackground(weatherMain) {
  const bgLayer = document.getElementById("bgLayer");

  let gradientClass = "";

  if (weatherMain === "Clear") {
    gradientClass =
      "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500";
  } else if (weatherMain === "Clouds") {
    gradientClass = "bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900";
  } else if (weatherMain === "Rain") {
    gradientClass = "bg-gradient-to-br from-blue-700 via-indigo-800 to-black";
  } else if (weatherMain === "Thunderstorm") {
    gradientClass = "bg-gradient-to-br from-purple-800 via-purple-900 to-black";
  } else {
    gradientClass = "bg-gradient-to-br from-slate-600 via-slate-800 to-black";
  }

  bgLayer.className = `fixed inset-0 -z-10 transition-all duration-700 ${gradientClass}`;
}

// ================= API =================

async function getWeather(city) {
  if (tempChart) {
    tempChart.destroy();
    tempChart = null;
  }

  loading.classList.remove("hidden");
  error.classList.add("hidden");
  weatherResult.innerHTML = "";
  document.getElementById("forecast").innerHTML = "";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},ID&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showWeather(data);
    changeBackground(data.weather[0].main);

    localStorage.setItem("lastCity", city);

    await getForecast(city);
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

async function getForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},ID&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showForecast(data);
    renderTemperatureChart(data);
  } catch (err) {
    console.log("Forecast error:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      () => {
        const lastCity = localStorage.getItem("lastCity");
        if (lastCity) {
          cityInput.value = lastCity;
          getWeather(lastCity);
        }
      },
    );
  } else {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      cityInput.value = lastCity;
      getWeather(lastCity);
    }
  }
});

async function getWeatherByCoords(lat, lon) {
  if (tempChart) {
    tempChart.destroy();
    tempChart = null;
  }

  loading.classList.remove("hidden");
  error.classList.add("hidden");
  weatherResult.innerHTML = "";
  document.getElementById("forecast").innerHTML = "";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showWeather(data);
    changeBackground(data.weather[0].main);

    localStorage.setItem("lastCity", data.name);

    await getForecastByCoords(lat, lon);
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

async function getForecastByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showForecast(data);
    renderTemperatureChart(data);
  } catch (err) {
    console.log("Forecast error:", err.message);
  }
}
document.getElementById("detectBtn").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoords(latitude, longitude);
    },
    () => {
      alert("Lokasi tidak diizinkan");
    },
  );
});
