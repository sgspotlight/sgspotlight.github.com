
google.maps.event.addDomListener(window, 'load', initialize);

var map;
var stationArray = [];
var stationMarkerArray = [];
var selectedStationArray = [];

var pathArray = [];

var pointArray = [];
var kmeanPoint =[];
var rawPoint = [];

function initialize() {
  $.get("../file/Station.json",function(data){
    stationArray = data.results;
  });
  $.get("../file/Survey.json",function(data){
    data.results.forEach(function(element){
      if(!element.homeLocation){
        var arr = {
          "school" : element.WorkDetail,
          "latitude" : element.HomeLatitude,
          "longitude" : element.HomeLongitude
        };
        pointArray.push(arr);
      } else {
        var arr = {
          "school" : element.WorkDetail,
          "latitude" : element.homeLocation.latitude,
          "longitude" : element.homeLocation.longitude
        };
        pointArray.push(arr);
      }
    });
  });

  var mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng(37.350,127.1141)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addListener(map, 'dragend', function() {
    if(map.getZoom() < 13) return;
    stationViewProcess();
    surveyViewProcess();
  });
}

function stationViewProcess(){
  stationMarkerArray.forEach(function(element){
    element.setMap(null);
  });
  stationMarkerArray = [];

  console.log("event fired!")
  var northEast = map.getBounds().getNorthEast();
  var southWest = map.getBounds().getSouthWest();

  var viewStationArray = [];
  stationArray.forEach(function(element){
    var a = element.location.latitude - northEast.lat();
    var b = element.location.latitude - southWest.lat();
    var c = element.location.longitude - northEast.lng();
    var d = element.location.longitude - southWest.lng();
    if( a*b < 0 && c*d < 0) viewStationArray.push(element);
  });

  viewStationArray.forEach(function(element){
    var img;
    var redLineNum = 0 ;
    element.passRoute.forEach(function(el){
      if(el.type == "redLine") redLineNum ++;
    });
    if(redLineNum > 2) img = "http://joohyuck.github.io/image/busStation_icon_red_big.png";
    else img = "http://joohyuck.github.io/image/busStation-icon.png";
    var contentString = '<div>';
    contentString +='<h4>'+element.stationName+'</h4>';
    contentString += '</div>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    var marker = new google.maps.Marker({
        position : new google.maps.LatLng(element.location.latitude, element.location.longitude),
        icon : img,
        map : map
    });
    stationMarkerArray.push(marker);
    google.maps.event.addListener(marker, 'mouseover', function() {
      infowindow.open(map,marker);
    });
    google.maps.event.addListener(marker, 'mouseout', function() {
      infowindow.close();
    });
    google.maps.event.addListener(marker, 'click', function() {
      selectedStationArray.push(element);
      displayStation(selectedStationArray);
    });
  });
}

function displayStation(inputArray){
  var str = "";
  inputArray.forEach(function(element, index){
    str += '<li id="'+element.objectId+'">';
    str += '  <div class="ui left labeled icon input">';
    str += '    <div class="ui dropdown label">';
    str += '      <div class="text">S</div>';
    str += '      <i class="dropdown icon"></i>';
    str += '      <div class="menu">';
    str += '        <div class="item">S</div>';
    str += '        <div class="item">E</div>';
    str += '      </div>';
    str += '    </div>';
    str += '    <input type="text" value="'+element.stationName+'">';
    str += '    <i class="remove circle link icon"></i>';
    str += '  </div>';
    str += '  <div class="ui input mini">';
    str += '    <input type="time" class="time">';
    str += '  </div>';
    str += '</li>';
  });
  $(".station-list").html(str);
  $('.ui.dropdown').dropdown();
  inputArray.forEach(function(element, index){
    $("#"+element.objectId+" .link.icon").bind("click", function() {
      selectedStationArray.splice(index,1);
      displayStation(selectedStationArray);
    });
  });
}

function getRoute(){
  var arr = [];
  selectedStationArray.forEach(function(element){
    arr.push({"latitude" : element.location.latitude , "longitude" : element.location.longitude});
  });

  $.post( "http://localhost:3000/tmap", 
    { 
      array : arr
    })
  .done(function( data ) {
    displayRoute(data);
  });
}

function displayRoute(inputArray){
  var flightPlanCoordinates = [];
  pathArray = [];
  inputArray.forEach(function(el){
    flightPlanCoordinates.push({lat:el[1],lng:el[0]});
    pathArray.push([parseFloat(el[1]), parseFloat(el[0])]);
  });

  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: "red",
    strokeOpacity: 1.0,
    strokeWeight: 4
  });
  google.maps.event.addListener(flightPath, 'click', function() {
    flightPath.setMap(null);
  });
  flightPath.setMap(map);
}

function surveyViewProcess(){
  var northEast = map.getBounds().getNorthEast();
  var southWest = map.getBounds().getSouthWest();

  var queryArray = [];
  pointArray.forEach(function(el){
    var a = el.latitude - map.getBounds().getNorthEast().lat();
    var b = el.latitude - map.getBounds().getSouthWest().lat();
    var c = el.longitude - map.getBounds().getNorthEast().lng();
    var d = el.longitude - map.getBounds().getSouthWest().lng();
    var school = [];
    $("input:checkbox:checked").each(function (index) {  
      school.push($(this).val());
    });
    var e = school.indexOf(el.school);
    var storeArr = [parseFloat(el.latitude) ,parseFloat(el.longitude)];
    if( a*b < 0 && c*d < 0 && e != -1 ) queryArray.push(storeArr);
  });

  $.post( "http://localhost:3000/kmean", { array : queryArray , num : $("#myRange").val() , filter : $("#filter").val()})
  .done(function( data ) {
    kmeanPoint.forEach(function(element){
      element.setMap(null);
    });
    rawPoint.forEach(function(element){
      element.setMap(null);
    });
    kmeanPoint = [];
    rawPoint = [];

    data.forEach(function(el){
      var marker = new google.maps.Marker({
          position : new google.maps.LatLng(el.centroid[0] ,el.centroid[1]),
          map : map
      });
      kmeanPoint.push(marker);
      el.points.forEach(function(eel){
        var marker = new google.maps.Marker({
            position : new google.maps.LatLng(eel[0] ,eel[1]),
            icon : "../image/red_dot.png",
            map : map
        });
        rawPoint.push(marker);
      });
    });
  });
}


function saveRoute(){

Parse.initialize("eRm640kNvozWNgmmnqAneyJLbXPWh5KwhKSkzn1B", "pPHnbrqZL4EpRwjW1mXh8S2JBzEO93coQwuTjGib");

var Route = Parse.Object.extend("Route");
var route = new Route();

var stations = [];
$.each(selectedStationArray, function(index, value){
  var obj = {
    'type' : $("#"+value.objectId+" .text").html(),
    'order' : index + 1,
    'time' : $("#"+value.objectId+" .time").val(),
    'stationId' : value.stationId,
    'stationName' : value.stationName,
    'location' : value.location,
    "adressDongmyun": value.adressDongmyun,
    "adressSido": value.adressSido,
    "adressSigungu": value.adressSigungu,
  }
  stations.push(obj);
});

route.set('title',$('#title').val() );
route.set('departure', $('#departure').val() );
route.set('price', parseInt($('#price').val()));
route.set('alliancePrice', parseInt($('#alliancePrice').val()));

route.set('stations', stations);
route.set('path', pathArray);
route.set('minimum', 55);
route.set('onFunding', true );
route.set('onGoing',false );
route.set('share', 0 );
route.set('onGoing',false );
route.set('onGoing',false );

route.save(null, {
  success: function(route) {
    // Execute any logic that should take place after the object is saved.
    alert('New object created with objectId: ' + route.id);
  },
  error: function(route, error) {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    alert('Failed to create new object, with error code: ' + error.message);
  }
});

}

