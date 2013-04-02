var guj  = require("geojson-utils")
var json = {}

//------------------------
// GOOGLE GEOCODE FUNCTION
//------------------------

var GOOGLE_MAPS_URL = "http://maps.googleapis.com/maps/api/geocode/json";

function geocode (address, callback) {
  var params = {
    address: address,
    sensor:  false
  }

  var url = GOOGLE_MAPS_URL + "?" + $.param(params);

  $.ajax(url, { success: callback });
}

//------------------------
// INITIALIZE
//------------------------

function init () {
  $("#input-target").on("click", onGetCurrentLocation);
  $("#input-go").on("click", onGo);
  $("#location-form").on("submit", onSubmit);
}

function reset () {

}

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

function answer (msg) {
  $('#marker').css('display', 'block');
  $('#marker').animate({ opacity: 0 }, 0);
  $('#marker').animate( {opacity: 1, top: '200'}, 250);
  $('#question').fadeOut(250, function() {
    $('#answer').fadeIn(250);
  });
}

function onWithinLimits () {
  answer();
}

function onOutsideLimits () {
  answer();
}

function onGetCurrentLocation () {
  geocodeByCurrentLocation();
  return false;
}

function onGo (e) {
  var $input = $("#input-location"), address = $input.val();
  geocodeByAddress(address);
  return false;
}

function onSubmit (e) {
  e.preventDefault();
  var $input = $("#input-location"), address = $input.val();
  geocodeByAddress(address);
  return false;
}

//----------------------------
// GEOCODE BY CURRENT LOCATION
//----------------------------

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

//------------------------
// GEOCODE BY ADDRESS
//------------------------

function geocodeByAddress (address) {
  geocode(address, function (res) {
    if (res && res.results.length > 0) {
      var result = res.results[0].geometry.location;
      checkWithinLimits(result.lat, result.lng);
    }
  });
}

$.getJSON("data/region.geojson", function (data) {
  json = data;
  init();
});
