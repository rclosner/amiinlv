var guj  = require("geojson-utils")
var json = {}

var GOOGLE_MAPS_URL = "http://maps.googleapis.com/maps/api/geocode/json";

/**
 * Geocodes an address by querying the Google
 * Maps API.
 * @param {String} [address] the address
 * @param {Function} [callback] the callback function
 */

function geocode (address, callback) {
  var params = {
    address: address,
    sensor:  false
  }

  var url = GOOGLE_MAPS_URL + "?" + $.param(params);

  $.ajax(url, { success: callback });
}

/**
 * Initializes the application and sets
 * event listeners
 */

function init () {
  $("#input-target").on("click", onGetCurrentLocation);
  $("#input-go").on("click", onGo);
  $("#location-form").on("submit", onSubmit);
}

/**
 * Resets the application to its initial state
 */

function reset () {

}

/**
 * Renders the answer and drops the pin on the map
 */

function render (answer) {
  $('#marker').css('display', 'block');
  $('#marker').animate({ opacity: 0 }, 0);
  $('#marker').animate( {opacity: 1, top: '200'}, 250);
  $('#question').fadeOut(250, function() {
    $('#answer').fadeIn(250);
  });
}


/**
 * Checks to see whether a latitude and longitude
 * fall within the limits provided in region.json
 * @param {String} [latitude] the latitude
 * @param {String} [longitude] the longitude
 */

function checkWithinLimits (latitude, longitude) {
  var point   = { type: "Point", coordinates: [ longitude, latitude ] };
  var polygon = json.features[0].geometry;
  var withinLimits = guj.pointInPolygon(point, polygon);

  if (withinLimits) {
    onWithinLimits()
  } else {
    onOutsideLimits();
  }
}

/**
 * Displays an answer that specifies that the location
 * is within the limits
 */

function onWithinLimits () {
  render();
}

/**
 * Displays an answer that specifies that the location
 * is not within the limits
 */

function onOutsideLimits () {
  render();
}

/**
 * Gets the current location, and checks whether
 * it is within the limits
 */

function onGetCurrentLocation () {
  geocodeByCurrentLocation();
  return false;
}

/**
 * Submits the form, geocodes the address, and checks
 * whether it is within the limits
 */

function onGo () {
  var $input = $("#input-location"), address = $input.val();
  geocodeByAddress(address);
  return false;
}

/**
 * Submits the form, geocodes the address, and checks
 * whether it is within the limits
 */

function onSubmit (e) {
  e.preventDefault();
  var $input = $("#input-location"), address = $input.val();
  geocodeByAddress(address);
  return false;
}

/**
 * Gets the current location and checks whether it is
 * within the limits
 */

function geocodeByCurrentLocation () {
  var geolocator = window.navigator.geolocation;

  if (geolocator) {

    geolocator.getCurrentPosition(
        function (position) {
          checkWithinLimits(position.coords.latitude, position.coords.longitude);
        },
        function () {
          alert("Error getting current position");
        }
        );

  } else {
    alert("Browser does not support geolocation");
  }
}

/**
 * Geocodes an address
 */ 

function geocodeByAddress (address) {
  geocode(address, function (res) {
    if (res && res.results.length > 0) {
      var result = res.results[0].geometry.location;
      checkWithinLimits(result.lat, result.lng);
    }
  });
}

/**
 * Retrieves the region.json file and initializes
 * the application
 */ 

jQuery(document).ready(function () {
  $.getJSON("data/region.geojson", function (data) {
    json = data;
    init();
  });
});

