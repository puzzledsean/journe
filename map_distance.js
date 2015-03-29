var map;
var geocoder;
var bounds = new google.maps.LatLngBounds();
var markersArray = [];

var url = window.location
var query = window.location.search.substring(1)
var string = JSON.stringify(query)
var stringArray = string.split("&")
valueArray = []
for (index in stringArray) {
  string = stringArray[index]
  var value = string.substring(string.indexOf("=") + 1)
  if (index == 2) {
    value = value.substring(0, value.length - 1)
  }
  valueArray[index] = value
}

var genre = JSON.stringify(valueArray[0])
var start = JSON.stringify(valueArray[1])
var dest = JSON.stringify(valueArray[2])

var globalPlaylistID;

  create_playlist("testing");



var origin1 = start
var destinationA = dest

var destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000';
var originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';

function initialize() {
  var opts = {
    center: new google.maps.LatLng(71.05, 42.36),
    zoom: 2
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), opts);
  geocoder = new google.maps.Geocoder();
}

function calculateDistances() {
  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [origin1],
      destinations: [destinationA],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, callback);
  display_dictionary(genre);
}

function callback(response, status) {
  if (status != google.maps.DistanceMatrixStatus.OK) {
    alert('Error was: ' + status);
  } else {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    var outputDiv = document.getElementById('outputDiv');
    var timeDiv = document.getElementById('time-display');
    var hiddenDiv = document.getElementById('time');
    outputDiv.innerHTML = '';
    deleteOverlays();

    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      addMarker(origins[i], false);
      for (var j = 0; j < results.length; j++) {
        addMarker(destinations[j], true);
        outputDiv.innerHTML += origins[i] + ' to ' + destinations[j]
            + ': ' + results[j].distance.text + ' in '
            + results[j].duration.text + '<br>';
        timeDiv.innerHTML = 'Travel time: ' + results[j].duration.text
        hiddenDiv.value = convertToMS(results[j].duration.text)
        hiddenDiv.innerHTML = hiddenDiv.value;
      }
    }
  }
}

function addMarker(location, isDestination) {
  var icon;
  if (isDestination) {
    icon = destinationIcon;
  } else {
    icon = originIcon;
  }
  geocoder.geocode({'address': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      bounds.extend(results[0].geometry.location);
      map.fitBounds(bounds);
      var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        icon: icon
      });
      markersArray.push(marker);
    } else {
      alert('Geocode was not successful for the following reason: '
        + status);
    }
  });
}

function convertToMS(timeString) {
  var stringArray = timeString.split(" ")
  var seconds = 0;
  var onHours = false
  if (stringArray.length == 4) {
    onHours = true;
  }
  for (index in stringArray) {
    var num = parseInt(stringArray[index])
    if (!isNaN(num) && onHours) {
      seconds = num * 3600;
      onHours = false;
    }
    else if (!isNaN(num)) {
      seconds = seconds + num * 60;
    }
  }
  return seconds * 1000;
}
function create_playlist(playlistName){
  console.log('about to call ajax');
  $.ajax('https://api.spotify.com/v1/users/1266376302/playlists', {
    method: 'POST',
    data: JSON.stringify({
      'name': playlistName,
      'public': false
    }),
    dataType: 'json',
    contentType: "application/json",
    headers: {
      'Authorization': 'Bearer BQBcBX9017yBrjZY9ZWXEX8Q-9vO-hZSsurVhVDAZMxrLZN0PV9fO4mz0bQwCmI-2SHyjuElj3FbhP0-0wwb34veIk94LbNOUa4n-hUvSBkMyKq_E9UlnMmqv2R3I8elzziLmub72GAprraGaugt2MOKjnmtefwsD-Dli9UpDtyiF14S4BvP55qrpBOhalX02wwvciee4v-8haakuJkcVdTEQ7GYkW07idQ',
      'Content-Type': 'application/json'
    },
    success: function(r) {
      console.log('create playlist response', r);
      console.log('this playlistID is ' + r.id);
      globalPlaylistID = r.id;
    },
    error: function(r) {
      console.log('we failed');
    }
  });console.log('we made the json call');
}

function add_track(playlistID, trackName){
  var trackID = trackName;

  console.log('about to call ajax a second time');
  $.ajax("https://api.spotify.com/v1/users/1266376302/playlists/" + playlistID + "/tracks?position=0&uris=spotify%3Atrack%3A" + trackName, {
    method: 'POST',
    dataType: 'json',
    contentType: "application/json",
    headers: {
      'Authorization': 'Bearer BQBcBX9017yBrjZY9ZWXEX8Q-9vO-hZSsurVhVDAZMxrLZN0PV9fO4mz0bQwCmI-2SHyjuElj3FbhP0-0wwb34veIk94LbNOUa4n-hUvSBkMyKq_E9UlnMmqv2R3I8elzziLmub72GAprraGaugt2MOKjnmtefwsD-Dli9UpDtyiF14S4BvP55qrpBOhalX02wwvciee4v-8haakuJkcVdTEQ7GYkW07idQ',
      'Content-Type': 'application/json'
    },
    success: function(r) {
      console.log('create track response', r);
    },
    error: function(r) {
      console.log('we failed');
    }
  });console.log('we added the track call');
}

function display_dictionary(genre){
    var myjson;
    var blah = genre;
    
    $.getJSON("https://api.spotify.com/v1/search?query=track%3A%22" + blah + "%22&offset=0&limit=50&type=track", function(json){
        myjson = json;
        console.log(myjson);

    counter = 0;
    songsAdded = 0;
    iteration = 0;
    tripLength = document.getElementById('time').innerText;
    for(i = 0; i <50; i++){
        current = Math.floor(Math.random() * 49);
        if(counter + myjson.tracks.items[current].duration_ms > tripLength){
            ;
        }
        else{
          console.log('adding track to playlistId, ' + globalPlaylistID);
          add_track(globalPlaylistID, myjson.tracks.items[current].id);
          console.log('current song is ' + myjson.tracks.items[current].id);
            counter += myjson.tracks.items[current].duration_ms;
            songsAdded++;
            iteration = i;
        }
    }
    console.log("the total song times add up to " + counter + " having added " + songsAdded + " songs and having gone through " + iteration + " songs when the length of the trip is " + tripLength);
    });
}



function deleteOverlays() {
  for (var i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray = [];
}

google.maps.event.addDomListener(window, 'load', initialize);
