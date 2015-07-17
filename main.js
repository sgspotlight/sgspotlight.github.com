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

  poly = new google.maps.Polyline({editable : true });
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
    url: "http://52.68.96.210:3000/kmean",
    data: {
      schoolList : school,
      range : range,
      knum : parseInt($("#myRange").val()) 
    }
  })
  .done(function( msg ) {
    deleteMarkers( kmeanDataMakers );
    deleteMarkers( surveyDataMarkers );

    msg[2].forEach(function ( element , index ) {
      var marker = new google.maps.Marker({
          position : new google.maps.LatLng(element[0], element[1]),
          icon : 'green_dot.png',
          map : map
      });
    });

    msg[0].forEach(function ( element , index ) {
      var opacity = 1 ;
      if( msg[1][index].length < 3 ) opacity = 0.5 ;

      var contentString = '<div>'+msg[1][index].length+'</div>';
      var infowindow = new google.maps.InfoWindow({
          content: contentString
      });

      var marker = new google.maps.Marker({
          position : new google.maps.LatLng(element[0], element[1]),
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

      msg[1][index].forEach( function ( element , index ) {
        var subMarker = new google.maps.Marker({
          position : new google.maps.LatLng(element[0], element[1]),
          map : map,
          icon : 'red_dot.png'
        });
        surveyDataMarkers.push( subMarker );
        google.maps.event.addListener(marker, 'mouseover', function() {
          subMarker.setIcon('green_dot.png');
        });
        google.maps.event.addListener(marker, 'mouseout', function() {
          subMarker.setIcon('red_dot.png');
        });
      });
    });
    console.log(msg);
  });
}

//set marker array
var kmeanDataMakers=[];
var surveyDataMarkers=[];

// Deletes all markers in the array by removing references to them.
function deleteMarkers(array) {
  for (var i = 0; i < array.length; i++) {
    array[i].setMap(null);
  }
  array = [];
}

Parse.initialize("eRm640kNvozWNgmmnqAneyJLbXPWh5KwhKSkzn1B", "pPHnbrqZL4EpRwjW1mXh8S2JBzEO93coQwuTjGib");

var Station = Parse.Object.extend("SubwayStation");
var query = new Parse.Query(Station);
query.limit(1000);
query.greaterThan("Ride", 200000);
var resultArray = [];

getResult (query , function (result) {
  



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
            if(results.length == count) {
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

// a simple function to implement Parse.Query
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