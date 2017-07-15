$("#welcome-modal").modal("show");
$("#lets-go").on("click", function(event) {

  $("#welcome-modal").modal("hide");
  $("#initial-form").modal("show");
});   

var map;
var infowindow;
var markerlat = 0;
var markerlng = 0;
var keyword = "park";
var radiusValue = 50000;
var checkedValue="";

//ajax for movie data for specific chosen location 
function movieDisplay (theaterLat, theaterLng){
  //console.log("theaterlat:" +theaterLat);
   //console.log("theaterlng:" +theaterLng);
  $("#movie").animate({width:'toggle'},350);
  var currentdate = moment().format('YYYY-MM-DD');
  var queryURL = "https://data.tmsapi.com/v1.1/movies/showings?startDate="+ currentdate+"&lat=" + theaterLat + "&lng=" + theaterLng + "&radius=1&units=km&imageSize=Sm&imageText=true&api_key=6wyda8gpyrx5hr3uqbb33yxh";
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
      console.log(response);
      var movies = [];
      for (i = 0; i < response.length; i++) {
        if (response[i].ratings) {
          movies.push({
            title: response[i].title,
            rating: response[i].ratings[0].code,
            showtimes: response[i].showtimes.map(function(v){
            return moment(v.dateTime).format('LT');
            })
          });
        } 
      }
      movies.forEach(function(movie){
        console.log(movie.title);
        console.log("Rated " + movie.rating);
        console.log("Showing at: " + movie.showtimes);
        var newDiv = $("<div class='movieDiv'>");
        newDiv.append($("<p><bold>Title:</bold> " + movie.title + "</p>"));
        newDiv.append($("<p><bold>Rating:</bold> " + movie.rating + "</p>"));
        newDiv.append($("<p><bold>Showing at:</bold> " + movie.showtimes + "</p>"));
        console.log("newDiv: " + newDiv);
        $("#movieListings").append(newDiv);
      });
  });
}

function loadMap() {
  initMap(35.9940, -78.8986, keyword);
}

// creating popup 
function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    $("#movieListings").empty();
    markerlat=JSON.stringify(marker.getPosition().lat());
    markerlng=JSON.stringify(marker.getPosition().lng());

    console.log("theaterSelected:" + markerlat);
    console.log(markerlng);
              //magic happens here!!!
    infowindow.setContent(place.name);
    infowindow.open(map, this);

    movieDisplay(markerlat, markerlng);

  });
}

// Place markers on map
function placeMarkers(results, status) {            
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {




      createMarker(results[i]);

      console.log("restaurant:" +results[i].name+""+ results[i].rating+ ""+ results[i].opening_hours);
    }
  }
}

// Display map with search results
function initMap(lat, lng, keyword) { // use lat and lng 
  var latLngObj = {lat: lat, lng: lng};
  console.log("lat1: " + lat);
  console.log("lng2: " + lng);
  console.log("keyword initmap function:" + keyword);  
  map = new google.maps.Map(document.getElementById('map'), {
    center: latLngObj,
    zoom: 10
  });

  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: latLngObj ,
    radius: radiusValue,
    keyword: [keyword]
  }, placeMarkers);
}

// Get lat and lng to pass to movie API
function getlocation(address, keyword){
  console.log("getlocation: " + address + keyword);
  axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
    params:{
      address:address,
      key:'AIzaSyBO59mo6rMe4ChzmBqEQ8gz9QmWjg_X38c'
    }
  }).then(function(response){
    // Log full response
    console.log(response);

    var addressComponents = response.data.results[0].address_components;
    var addressComponentsOutput = '<ul class="list-group">';
    
    var lat = response.data.results[0].geometry.location.lat;
    var lng = response.data.results[0].geometry.location.lng;

    console.log("latt: " + lat)

    console.log("lngg: " + lng)
    initMap(lat, lng, keyword);

    
  }).catch(function(error){
    console.log(error);
  });
}

// Click event for initial form submit
$("#sumbitbtn").on("click", function(event) {
  event.preventDefault();
  $("#initial-form").modal("hide");
  var zipCode = $("#zipCodeInput").val().trim();
  console.log("zipcode:" + zipCode);    
  keyword = "movie_theater";
  console.log("keyword set: " + keyword);
  getlocation(zipCode, keyword);
});

// Click event for food form submit
$("#food-sumbit").on("click", function(event) {
  event.preventDefault();
  $("#food-form").modal("hide");
  foodInput();

});

// Get values of checked food choices and put markers on the map   
function foodInput() {
  var checkedValue = null; 
  var inputElements = document.getElementsByClassName('messageCheckbox');
  for(var i=0; inputElements[i]; ++i){
    if(inputElements[i].checked){
      checkedValue = inputElements[i].value;
      console.log("checkvalue: " +checkedValue + " markerlat: " + markerlat  + " markerlng: "+ markerlng );
      initMap(markerlat, markerlng, checkedValue);
    }
  }
}

// Get Radius
$(".dropdown-item").on("click", function() {
  var radiusMiles = parseInt($(this).attr('value'));
  radiusValue =  (radiusMiles * 1609.344);
  var buttonText = $(this).text();
  console.log("Radius: " + radiusMiles + " miles, " + radiusValue + " meters");
  $("#radius").text(buttonText);
});

// Click event for theater submit
$("#theaterSubmit").on("click", function(event) {
  event.preventDefault();
  $("#food-form").modal("show");
});