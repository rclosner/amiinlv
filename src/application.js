var guj     = require("geojson-utils"),
    geocode = require("./geocode"),
    config  = require("../config");

var json = {},
    map,
    latitude,
    longitude,
    marker;

//--------------------
// MAP VARIABLES
//--------------------

var MAP_ATTRIBUTION = "©2012 Nokia <a href=\"http://here.net/services/terms\">Terms of Use</a>"
var TILE_LAYER_URL  = "https://maps.nlp.nokia.com/maptiler/v2/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?lg=eng&token=61YWYROufLu_f8ylE0vn0Q&app_id=qIWDkliFCtLntLma2e6O"

/**
 * Initializes the application and sets
 * event listeners
 */

function init () {
  $("#input-target").on("click", onGetCurrentLocation);
  $("#input-go").on("click", onGo);
  $("#location-form").on("submit", onSubmit);
  $(document).keydown(function (e) {
    if (e.which == 27 && e.ctrlKey == false && e.metaKey == false) reset();
  });
  $('#input-location').focus();

  createMap();
}

/**
 * Resets the application to its initial state
 */

function reset () {
  $("#input-location").val("")
  $('#marker').animate( {opacity: 0, top: '0'}, 0);
  $('#alert').hide();
  $('#answer').fadeOut(150, function() {
    $('#question').fadeIn(150);
    $('#input-location').focus();
  });

  map.removeLayer(marker);
  setMapView(config.latitude, config.longitude, config.initialZoom);
}

/**
 * Renders the answer and drops the pin on the map
 */

function render (answer) {
  marker = L.marker([latitude, longitude]).addTo(map);
  $('#question').fadeOut(250, function() {
    $('#answer').fadeIn(250);
  });
  $("#answer h1").html(answer)
  setMapView(latitude, longitude, config.finalZoom);
}

/**
 * Initializes the map and renders the geojson layer
 */

function createMap () {
  map = L.map("map", {
    dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false
  });

  L.tileLayer(TILE_LAYER_URL, {
    attribution: MAP_ATTRIBUTION,
    maxZoom: 23
  }).addTo(map);

  var style = {
    color: "#F11",
    weight: 5,
    opacity: 0.1
  }

  L.geoJson(json, {
    style: style
  }).addTo(map);

  map.setView([config.latitude, config.longitude], config.initialZoom);
}

/**
 * Sets the map view
 * @param {String} [latitude] the latitude
 * @param {String} [longitude] the longitude
 * @param {Integer} [zoom] the zoom level
 */

function setMapView (lat, lng, zoom) {
  map.setView([lat, lng], zoom);
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
  render("Yes");
}

/**
 * Displays an answer that specifies that the location
 * is not within the limits
 */

function onOutsideLimits () {
  render("No");
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
          latitude = position.coords.latitude, longitude = position.coords.longitude;
          checkWithinLimits(latitude, longitude);
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
      latitude = result.lat, longitude = result.lng
      checkWithinLimits(latitude, longitude);
    }
  });
}

/**
 * Retrieves the region.json file and initializes
 * the application
 */ 

jQuery(document).ready(function () {
  $.getJSON(config.fileName, function (data) {
    json = data;
    init();
  });
});

