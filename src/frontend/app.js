// Weather API key constant 
const API_KEY = '60fa2ce1eec5093490a95f79444d6ff3';

document.getElementById('get-score-button').addEventListener('click', async () => {

  //event handlers to get all the required classes we are changing in the page 
  const zip = document.getElementById('zip-input').value;
  const errorMessage = document.getElementById('error-message');
  const resultsLocation = document.getElementById('results-location');
  const temperatureElement = document.getElementById('temperature');
  const humidityElement = document.getElementById('humidity');
  const weatherDescriptionElement = document.getElementById('weather-description');
  const precipitationElement = document.getElementById('precipitation');
  const visibilityElement = document.getElementById('visibility');
  const windElement = document.getElementById('wind');
  const rideabilityElement = document.getElementById('rideability-score');

  //incase no zip code is entered 
  if (!zip) {
    errorMessage.textContent = 'Please enter a zip code.';
    return;
  }

  errorMessage.textContent = '';

  // this part should lowkey be in the back end sooner than later


  try {
    // Fetch latitude and longitude
    const geocodeResponse = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${API_KEY}`);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeResponse.ok) {
      errorMessage.textContent = 'Error converting zip code into lat and long. ';
      return;
    }

    const { lat, lon, name } = geocodeData;

    // Fetch weather data based off lat and long 
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`);
    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      errorMessage.textContent = 'Error fetching weather data..';
      return;
    }

    // Log the entire API response to the console
    console.log('Weather API Response:', weatherData);


    // Extract data we gaf about 
    const temperature = weatherData.current.temp;
    const humidity = weatherData.current.humidity;
    const weatherDescription = weatherData.current.weather[0].description;
    const precipitation = weatherData.current.rain ? weatherData.current.rain['1h'] : (weatherData.current.snow ? weatherData.current.snow['1h'] : 0);
    const visibility = weatherData.current.visibility / 1000; // Convert visibility from meters to kilometers
    const wind = weatherData.current.wind_speed;

    // Calculate rideability score
    const rideabilityScore = calculateRideabilityScore(temperature, visibility, weatherData.current.snow, precipitation, wind);

    //Store data locally 
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    const searchEntry = {
      zip,
      location: name,
      temperature,
      humidity,
      weatherDescription,
      precipitation,
      visibility,
      wind,
      rideabilityScore
    };
    recentSearches.push(searchEntry);
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

    

    console.log('Recent Searches:', recentSearches);

    // Update the page 
    resultsLocation.textContent = name || 'unknown';
    temperatureElement.textContent = temperature;
    humidityElement.textContent = humidity;
    weatherDescriptionElement.textContent = weatherDescription;
    precipitationElement.textContent = precipitation;
    visibilityElement.textContent = visibility;
    windElement.textContent = wind;
    rideabilityElement.textContent = rideabilityScore;

    // Navigate to results view
    showResults();

  } catch (error) {
    errorMessage.textContent = 'Error fetching all the data. .';
  }
});

//This part will eventually have scientific backing but for now we shall just use psuedo science 
function calculateRideabilityScore(temperature, visibility, isSnow, precipitation, wind) {
  let score = 10;

  // Subtract points based on precipitation
  if (isSnow) {
    score -= 8;
  } else if (precipitation > 0) {
    score -= 3;
  }

  // Subtract points based on visibility
  if (visibility < 2) {
    score -= 5;
  } else if (visibility < 5) {
    score -= 2;
  } else if (visibility < 10) {
    score -= 1;
  }

  // Adjust points based on temperature
  if (temperature < 0) {
    score -= 2;
  } else if (temperature > 30) {
    score -= 2;
  } else if (temperature < 5 || temperature > 25) {
    score -= 1;
  }

  // Adjust points based on wind speed
  if (wind > 5) {
    score -= 1;
  } else if (wind > 10) {
    score -= 2;
  }

  return score;
}

//might be a more optimal way to do this? 
function showHome() {
  document.getElementById('home-view').style.display = 'block';
  document.getElementById('recents-view').style.display = 'none';
  document.getElementById('results-view').style.display = 'none';
  document.getElementById('about-view').style.display = 'none';
}

function showRecents() {
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('recents-view').style.display = 'block';
  document.getElementById('results-view').style.display = 'none';
  document.getElementById('about-view').style.display = 'none';
}

function showResults() {
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('recents-view').style.display = 'none';
  document.getElementById('results-view').style.display = 'block';
  document.getElementById('about-view').style.display = 'none';
}

function showAbout() {
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('recents-view').style.display = 'none';
  document.getElementById('results-view').style.display = 'none';
  document.getElementById('about-view').style.display = 'block';
}



