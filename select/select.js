// This example adds a user-editable rectangle to the map.
// When the user changes the bounds of the rectangle,
// an info window pops up displaying the new bounds.

var map;
var poly;

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(37.550965, 126.925331),
    zoom: 13
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var polyOptions = {
    strokeColor: '#000000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  };
  poly = new google.maps.Polyline(polyOptions);
  poly.setMap(map);

  // Add a listener for the click event
  google.maps.event.addListener(map, 'click', addLatLng);
}

google.maps.event.addDomListener(window, 'load', initialize);

function addLatLng(event) {
  poly.getPath().push(event.latLng);
}

function clearPath() {
  poly.getPath().clear()
}
function buttonClick(){
  var school = [];
  $("input:checkbox:checked").each(function (index) {  
    school.push($(this).val());
  });
  
  var range = [];
  poly.getPath().j.forEach(function (element) {
    var array = [parseFloat(element.A), parseFloat(element.F)];
    range.push( array );
  });

  $.ajax({
    method: "GET",
    url: "http://52.68.96.210:3000/select",
    data: {
      schoolList : school,
      range : range,
      knum : parseInt($("#myRange").val()) 
    }
  })
  .done(function( msg ) {
    deleteMarkers( kmeanDataMakers );
    deleteMarkers( surveyDataMarkers );
    console.log(msg);

    msg.forEach( function (element, index) {

      var opacity = 1 ;
      if( element.points.length < 3 ) opacity = 0.5 ;
      var contentString = '<div>'+element.points.length+'</div>';
      var infowindow = new google.maps.InfoWindow({
          content: contentString
      });

      var marker = new google.maps.Marker({
          position : new google.maps.LatLng(element.centroid[0], element.centroid[1]),
          opacity : opacity,
          map : map
      });

      kmeanDataMakers.push( marker );
      google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(map,marker);
      });
      google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close();
      });

      element.points.forEach( function ( el , i ) {
        var subMarker = new google.maps.Marker({
          position : new google.maps.LatLng(el[0], el[1]),
          map : map,
          icon : '/red_dot.png'
        });
        surveyDataMarkers.push( subMarker );
        google.maps.event.addListener(marker, 'mouseover', function() {
          subMarker.setIcon('/green_dot.png');
        });
        google.maps.event.addListener(marker, 'mouseout', function() {
          subMarker.setIcon('/red_dot.png');
        });
      });
    });
  });
}

//set marker array
var kmeanDataMakers=[];
var surveyDataMarkers=[];

var listArray = [];


function addToList ( name, lat, lng) {
  listArray.push({'name': name , 'lat': lat , 'lng': lng});
  var str = '';
  listArray.forEach( function (element){
      str += '<li class="list-group-item">'+element.name+'</li>';
  });
  $(".list-group").html(str);
}

function saveToParse () {
  var seedStations = Parse.Object.extend("seedStation");
  listArray.forEach( function (element){
    var seedStation = new seedStations();
    var point = new Parse.GeoPoint({latitude: element.lat, longitude: element.lng});
    seedStation.save({
      Name : element.name,
      Location : point
    }, {
      success: function(result) {
        console.log('success');
      },
      error: function(result, error) {
        console.log(error);
      }
    });
  });
  //listArray = [];
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers(array) {
  for (var i = 0; i < array.length; i++) {
    array[i].setMap(null);
  }
  array = [];
}

Parse.initialize("eRm640kNvozWNgmmnqAneyJLbXPWh5KwhKSkzn1B", "pPHnbrqZL4EpRwjW1mXh8S2JBzEO93coQwuTjGib");

var subwayStation = Parse.Object.extend("SubwayStation");
var query = new Parse.Query(subwayStation);
query.limit(1000);
query.greaterThan("Ride", 200000);
var resultArray = [];

retrieveObjects(query, function (err, result) {
  result.forEach( function ( element ) {
    var stationMarker = new google.maps.Marker({
      position : new google.maps.LatLng(element.attributes.newLatitude , element.attributes.newLongitude),
      map : map,
      icon : '/station_icon.png'
    });
    google.maps.event.addListener(stationMarker, 'click', function() {
      addToList( element.attributes.Name+"역", element.attributes.newLatitude , element.attributes.newLongitude );
    });
  });
});

var busStation = Parse.Object.extend("newSeedStation");
var query1 = new Parse.Query(busStation);
//query1.greaterThan("Total", 3);

getResult (query1 , function (err , result) {
  console.log(result);
  result.forEach( function ( element ) {
    
    var busStationMarker = new google.maps.Marker({
      position : new google.maps.LatLng(element.attributes.location.latitude, element.attributes.location.longitude),
      map : map,
      icon : '/busStation-icon.png'
    });
    var contentString = '<div>'+element.attributes.name+'</div>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    google.maps.event.addListener(busStationMarker , 'mouseover', function() {
      infowindow.open(map,busStationMarker );
    });
    google.maps.event.addListener(busStationMarker , 'mouseout', function() {
      infowindow.close();
    });
    google.maps.event.addListener(busStationMarker, 'click', function() {
      addToList( element.attributes.name, element.attributes.location.latitude, element.attributes.location.longitude );
    });

  });
});

function getResult(query, callback){
  query.count({
    success: function(count) {
      // The count request succeeded. Show the count
      var results = [];
      var skipCount = parseInt(count/1000, 10);
      for (var i = 0; i <= skipCount; i++) {
        query.skip(i*1000);
        query.limit(1000);
        retrieveObjects(query, function (error, result) {
          if (error) {
            console.log('Error: ' + error.message);
          }
          else {
            result.forEach(function (el) {
              results.push(el);
            });
            if(results.length > 9000) {
              callback(null, results)
            }
          }
        });
      }
    },
    error: function(error) {
      callback(error,null);
    }
  });
}


function retrieveObjects (query, callback) {
  query.find({
    success: function (result) {
      callback(null, result);
    },
    error: function (error) {
      callback(error, null);
    }
  })
}