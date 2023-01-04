
// ELEMENT SELECTORS
var searchBtn = document.querySelector('#searchBtn');
var searchBar = document.querySelector('#searchBar');
var selectedCity = "";
var apiKey = '99afeda6d0c563b7397dc3f6cc43fdd6';
var currentHumidityEl = document.querySelector('#current-humidity');
var currentDateEl = document.querySelector('#current-day');
var currentTimeEl = document.querySelector('#current-time');
var currentTempEl = document.querySelector('#current-temp');
var currentConditionEl = document.querySelector('#current-condition');
var currentWindEl = document.querySelector('#current-wind');
var forecast = document.querySelector('.display-weather');
var currentConditionIcon = document.querySelector('#current-icon')
var cityDisplay = document.querySelector('#city-name');
var savedCitiesEl = document.querySelector('.searched-cities')
var fiveDayEl = document.querySelector('.five-day-forecast');

// LOCAL STORAGE
var savedCities = JSON.parse(localStorage.getItem('savedCities')) ?? [];
  
  // Hides past results
  var displaySavedCities = function() {
  var existingCityButtons = savedCitiesEl.getElementsByTagName('button');
  for (i=0; i<existingCityButtons.length; i++){
    existingCityButtons[i].setAttribute('style', 'display: none')
  }

  // Populate buttons from saved storage
  for (i=0; i<savedCities.length; i++) {
    var cityButton = document.createElement('button')
    cityButton.textContent = savedCities[i].city;
    cityButton.addEventListener('click', function(event) {
      getCoordinatesApi(this.textContent);
    });
    savedCitiesEl.appendChild(cityButton);
  };
};

displaySavedCities();

// CURRENT WEATHER FETCH
function getCurrentWeatherApi(latitude, longitude, displayCity) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`)
      .then(function (response) {
        return response.json();
      })
      .then(function (currentWeather) {
        // Populate current weather data        
        currentWindEl.textContent = `Wind Speed: ${currentWeather.wind.speed.toFixed(0)} mph`;
        cityDisplay.textContent = displayCity;
        currentConditionIcon.setAttribute('src', `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`)
        currentConditionEl.textContent = currentWeather.weather[0].main;
        currentDateEl.textContent = dayjs.unix(currentWeather.dt).format('dddd, MMMM D, YYYY ');
        currentTimeEl.textContent = dayjs.unix(currentWeather.dt).format('h:mm A');
        currentHumidityEl.textContent = `Humidity: ${currentWeather.main.humidity}%`;
        currentTempEl.textContent = `Temperature: ${parseFloat(currentWeather.main.temp.toFixed(0))}°F`;
        forecast.setAttribute("style", "display: inline")
      });
      displaySavedCities();
  };

// 5-DAY FETCH
function getFiveDayApi(latitude, longitude) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
    
    .then(function (response) {
      return response.json();
    })

    .then(function (fiveDayData) {

      // Hides past results
      var existingDailyCards = fiveDayEl.getElementsByTagName('*');     
      for (i=0; i<existingDailyCards.length; i++){
        existingDailyCards[i].setAttribute('style', 'display: none')
      }

      // Get and populate five-day forecast
      for (i=0; i<fiveDayData.list.length; i++){
        var maxTemp = fiveDayData.list[i].main.temp_max.toFixed(0);
        var fullDateTime = dayjs(fiveDayData.list[i].dt_txt).toDate();
        var displayDay = dayjs(fullDateTime).format('dddd');
        var displayDate = dayjs(fullDateTime).format('MMMM D, YYYY');
        var time = dayjs(fullDateTime).format('h:mmA')
        var weatherCondition = fiveDayData.list[i].weather[0].main;
        var dailyWeatherIcon = fiveDayData.list[i].weather[0].icon;
        var dailyWind = fiveDayData.list[i].wind.speed
        var dailyHumidity = fiveDayData.list[i].main.humidity;

        // Only populate one set of data/day
        if (time === '3:00PM'){
          var dailyCard = document.createElement('div');
          var cardDay = document.createElement('h5');
          var cardDate = document.createElement('h5');
          var dailyIcon = document.createElement('img')
          var dailyCondition = document.createElement('p')
          var dailyHigh = document.createElement('p')
          var dailyHumidityEl = document.createElement('p')
          var dailyWindEl = document.createElement('p')

          dailyCard.setAttribute('class', "dailyCard")
          cardDay.textContent = displayDay;
          cardDate.textContent = displayDate;
          dailyIcon.setAttribute('src', `https://openweathermap.org/img/wn/${dailyWeatherIcon}.png`);
          dailyCondition.textContent = weatherCondition;
          dailyHigh.textContent = parseFloat(maxTemp) + '°F';
          dailyHumidityEl.textContent = `Humidity: ${dailyHumidity}%`;
          dailyWindEl.textContent = `Wind Speed: ${dailyWind}mph`;

          fiveDayEl.appendChild(dailyCard)
          dailyCard.appendChild(cardDay);
          dailyCard.appendChild(cardDate);
          dailyCard.appendChild(dailyIcon);
          dailyCard.appendChild(dailyCondition)
          dailyCard.appendChild(dailyHigh)
          dailyCard.appendChild(dailyHumidityEl)
          dailyCard.appendChild(dailyWindEl)
        };
      };
    });
};

// GEOCODE FETCH
function getCoordinatesApi(city) {
      fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
            var newCity = {
              city: data[0].name,
              lat: data[0].lat,
              lon: data[0].lon
            };
            
            // check to see if searched city is already saved before adding to list
            var index = savedCities.findIndex(object => object.city === newCity.city)
            if (index === -1){
              savedCities.push(newCity)
            };

            // Append to local storage
            localStorage.setItem('savedCities', JSON.stringify(savedCities));

            getFiveDayApi(data[0].lat, data[0].lon);
            getCurrentWeatherApi(data[0].lat, data[0].lon, data[0].name);
        });
};

// EVENT LISTENERS
searchBar.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {  
        getCoordinatesApi(event.target.value);
    }
});

searchBtn.addEventListener("click", function (event) {
      getCoordinatesApi(searchBar.value);
});