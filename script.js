const apiKey = "YOUR_API_KEY";

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
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

async function getWeather(city) {
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  weatherResult.innerHTML = "";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},ID&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message);
    }

    showWeather(data);
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

function showWeather(data) {
  const icon = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  weatherResult.innerHTML = `
    <div class="bg-slate-700 p-4 rounded-xl mt-3">
      <img src="${iconUrl}" class="mx-auto">
      <h2 class="text-xl font-bold">${data.name}, ${data.sys.country}</h2>
      <p class="text-3xl font-semibold">${data.main.temp}°C</p>
      <p class="capitalize text-gray-300">${data.weather[0].description}</p>
      <p class="text-sm mt-2">Humidity: ${data.main.humidity}%</p>
      <p class="text-sm">Wind: ${data.wind.speed} m/s</p>
    </div>
  `;
}

