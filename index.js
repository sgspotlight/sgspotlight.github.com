
var map;
var parseResult= [];
var currentMarker;
$("#delete").attr("disabled", "disabled");

google.maps.event.addDomListener(window, 'load', initialize);


function initialize() {

/*
var center;

if(localStorage["lastCenters"]) {
  center = localStorage["lastCenters"];
}
else {
  center =  {lat: 37, lng: 128};
}
*/


//initialize map
  var mapOptions = {
    zoom: 11,
    center: {lat: 37.327706, lng: 126.788952}
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  currentMarker = new google.maps.Marker({
    position: {lat: 0, lng: 0},
    map: map
  });;

  //get points
  Parse.initialize("czNaN1uVy4did4pCOpcQE7n4jRO1m4NtyIvKBJ6A", "LdZqjsNA8noZ2RPwX4R9H2MyPbbKsBobJu8h79On");

  var WikiPoint = Parse.Object.extend("WikiPoint");
  var query = new Parse.Query(WikiPoint);
  query.limit(1000);
  query.equalTo("disabled",false);
  query.find({
    success: function(results) {
      console.log("Successfully retrieved " + results.length + " scores.");
      // Do something with the returned Parse.Object values
      parseResult = results;
      results.forEach(function(element, index){
        console.log(element);
        var marker = new google.maps.Marker({
          position: {lat: element.attributes.location.latitude , lng: element.attributes.location.longitude},
          map: map,
          title: element.get("name")
        });
        google.maps.event.addListener(marker, 'click', function(event) {
          $("#status").val(index);
          $("#point-name").val(element.attributes.name);
          $("#point-description").val(element.attributes.description);
          $("#latitude").val(element.attributes.location.latitude);
          $("#longitude").val(element.attributes.location.longitude);
          $("#delete").removeAttr("disabled");
        });
      });
    },
    error: function(error) {
      alert("데이터를 불러오지 못했습니다. 관리자에게 문의하세요");
    }
  });

  google.maps.event.addListener(map, 'click', function(event) {
    currentMarker.setPosition(event.latLng);
    $("#status").val("new");
    $("#point-name").val("");
    $("#point-description").val("");
    $("#latitude").val(event.latLng.lat());
    $("#longitude").val(event.latLng.lng());
    $("#delete").attr("disabled", "disabled");
  });
}

function saveInfo(){

  if($("#status").val() == "new"){
    var WikiPoint = Parse.Object.extend("WikiPoint");
    var wikipoint = new WikiPoint();

    wikipoint.set("disabled", false);
    wikipoint.set("name", $("#point-name").val());
    wikipoint.set("description",$("#point-description").val());
    var point = new Parse.GeoPoint({latitude: parseFloat($("#latitude").val()), longitude: parseFloat($("#longitude").val())});
    wikipoint.set("location",point);

    wikipoint.save({
      success: function(results) {
        alert("저장되었습니다.");
        location.reload();
      },
      error: function(error) {
        alert("저장에 실패했습니다. 다시 시도해주세요");
      }
    });
  } 
  else {
    var wikipoint = parseResult[parseInt($("#status").val())];
    wikipoint.set("name", $("#point-name").val());
    wikipoint.set("description",$("#point-description").val());

    wikipoint.save({
      success: function(results) {
        alert("수정되었습니다.");
        location.reload();
      },
      error: function(error) {
        alert("저장에 실패했습니다. 다시 시도해주세요");
      }
    });
  }

}

function deleteInfo(){
    var wikipoint = parseResult[parseInt($("#status").val())];
    wikipoint.set("disabled", true);

    wikipoint.save({
      success: function(results) {
        alert("삭제되었습니다.");
        location.reload();
      },
      error: function(error) {
        alert("삭제 실패했습니다. 다시 시도해주세요");
      }
    });
}
