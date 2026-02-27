let tempChart = null;
const apiKey = "c77825cfb5c0fe2da389d1bd64f9dbcd"; // ganti denngan API key kamu sendiri dari OpenWeatherMap

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

// ================= Save History =================
function saveSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

  history = history.filter((item) => item.toLowerCase() !== city.toLowerCase());

  history.unshift(city);

  if (history.length > 5) {
    history.pop();
  }

  localStorage.setItem("weatherHistory", JSON.stringify(history));

  renderSearchHistory();
}

// ================= Render History UI =================
function renderSearchHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const container = document.getElementById("searchHistory");

  container.innerHTML = "";

  history.forEach((city) => {
    const button = document.createElement("button");
    button.textContent = city;
    button.className =
      "bg-white/10 hover:bg-white/20 w-fit px-4 py-2 rounded-lg font-semibold mb-2 transition";

    button.addEventListener("click", () => {
      getWeather(city);
    });

    container.appendChild(button);
  });
}

// ================= WEATHER =================

function showWeather(data) {
  const iconUrl = getWeatherImage(data.weather[0].main);

  weatherResult.innerHTML = `
  <div id="weatherCard"
    class="fade-enter bg-white/10 backdrop-blur-md p-6 rounded-2xl mt-4 shadow-2xl">

    <h2 class="text-xl font-semibold text-center mb-4">
      ${data.name}, ${data.sys.country}
    </h2>

    <div class="flex flex-col items-center justify-center gap-2">

      <img src="${iconUrl}" 
        class="w-24 h-24 drop-shadow-lg">

      <p class="text-6xl font-bold leading-none">
        ${Math.round(data.main.temp)}°C
      </p>

      <p class="capitalize text-gray-300 text-sm">
        ${data.weather[0].description}
      </p>

    </div>

    <div class="grid grid-cols-2 gap-4 mt-6 text-sm">

      <div class="bg-white/5 p-4 rounded-xl text-center">
        <p class="text-gray-400">Humidity</p>
        <p class="font-semibold text-xl">
          ${data.main.humidity}%
        </p>
      </div>

      <div class="bg-white/5 p-4 rounded-xl text-center">
        <p class="text-gray-400">Wind</p>
        <p class="font-semibold text-xl">
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

function getWeatherImage(weatherMain) {
  const images = {
    Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    Rain: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
    Thunderstorm: "https://cdn-icons-png.flaticon.com/512/1146/1146860.png",
    Drizzle: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
    Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
  };

  return images[weatherMain] || images["Clouds"];
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

    const iconUrl = getWeatherImage(day.weather[0].main);

    forecastContainer.innerHTML += `
      <div class="fade-enter bg-white/10 hover:bg-white/20
        p-3 rounded-xl text-center">
        <p class="font-medium">${dayName}</p>
        <img src="${iconUrl}" class="mx-auto w-12 h-12 drop-shadow-md">
        <p class="font-semibold mt-1">
          ${Math.round(day.main.temp)}°C
        </p>
      </div>
    `;
  });

  setTimeout(() => {
    forecastContainer.querySelectorAll(".fade-enter").forEach((el) => {
      el.classList.add("fade-enter-active");
    });
  }, 50);
}

function getChartGradient(ctx, weatherMain) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);

  if (weatherMain === "Clear") {
    gradient.addColorStop(0, "rgba(255, 200, 0, 0.6)");
    gradient.addColorStop(1, "rgba(255, 140, 0, 0)");
  } else if (weatherMain === "Clouds") {
    gradient.addColorStop(0, "rgba(180, 180, 180, 0.5)");
    gradient.addColorStop(1, "rgba(100, 100, 100, 0)");
  } else if (weatherMain === "Rain") {
    gradient.addColorStop(0, "rgba(0, 150, 255, 0.5)");
    gradient.addColorStop(1, "rgba(0, 50, 120, 0)");
  } else if (weatherMain === "Thunderstorm") {
    gradient.addColorStop(0, "rgba(150, 0, 255, 0.5)");
    gradient.addColorStop(1, "rgba(50, 0, 80, 0)");
  } else {
    gradient.addColorStop(0, "rgba(120, 120, 120, 0.5)");
    gradient.addColorStop(1, "rgba(60, 60, 60, 0)");
  }

  return gradient;
}

function getChartBorderColor(weatherMain) {
  if (weatherMain === "Clear") {
    return "#f97316";
  } else if (weatherMain === "Clouds") {
    return "#9ca3af";
  } else if (weatherMain === "Rain") {
    return "#3b82f6";
  } else if (weatherMain === "Thunderstorm") {
    return "#8b5cf6";
  } else {
    return "#cbd5e1";
  }
}

// ================= Render Temperature Chart =================

function renderTemperatureChart(data, weatherMain) {
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

  const gradient = getChartGradient(ctx, weatherMain);

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Suhu (°C)",
          data: temperatures,
          borderColor: getChartBorderColor(weatherMain),
          backgroundColor: gradient,
          fill: true,
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: {
          labels: {
            color: "white",
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { display: false },
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.1)" },
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
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    const weatherMain = data.weather[0].main;

    saveSearchHistory(city);
    showWeather(data);
    changeBackground(weatherMain);

    localStorage.setItem("lastCity", city);

    await getForecast(city, weatherMain);
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

async function getForecast(city, weatherMain) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showForecast(data);
    renderTemperatureChart(data, weatherMain);
  } catch (err) {
    console.log("Forecast error:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSearchHistory();

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

    const weatherMain = data.weather[0].main;

    showWeather(data);
    changeBackground(weatherMain);

    localStorage.setItem("lastCity", data.name);

    await getForecastByCoords(lat, lon, weatherMain);
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

async function getForecastByCoords(lat, lon, weatherMain) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showForecast(data);
    renderTemperatureChart(data, weatherMain);
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
