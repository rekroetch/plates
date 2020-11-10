
// Google map API key
// var APIKey = "AIzaSyC680UklKEr_A2g5vrcu9R1x1ziJir4GBU";

// Function to determine user current location
if (navigator.geolocation) { //check if geolocation is available
    navigator.geolocation.getCurrentPosition(function (currentPosition) {
        console.log(currentPosition);
        var currentLat = currentPosition.coords.latitude;
        console.log("user current lat " + currentLat);
        var currentLon = currentPosition.coords.longitude;
        console.log("user current lon " + currentLon);

        // var map = L.map("map").setView([0, 0], 1);
        var map = L.map('map', {
            center: [currentLat, currentLon],
            zoom: 11
        });
        L.tileLayer("https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=1cDoXwZ3HkYYDyqg9QkZ", {
            attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        }).addTo(map);

        // Add marker for user current location
        markerUser = L.marker([currentLat, currentLon]).addTo(map);

        // function openRouteMap() {
        //     var APIKey = "5b3ce3597851110001cf624823016920625e4e46933015e7a19f69e6";
        //     var queryURL = "https://api.openrouteservice.org/v2/directions/driving-car?api_key=" + APIKey + "&start=8.681495,49.41461" + "&end=8.687872,49.420318";

        //     $.ajax({
        //         url: queryURL,
        //         method: "GET"
        //       }).then(function(response) {
        //         console.log(response);
        //       });

        // }
        // openRouteMap();
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var cityInput = document.querySelector('.cityInput')
        var cuisineInput = document.querySelector('.cuisineInput')
        var zomatoAPI = 'c61ed7f7b90c2b61c273faede7a9d47c'

        var restArray = []

        // when search button is clicked
        $('.searchBtn').on('click', function (event) {
            event.preventDefault()
            var citySearch = cityInput.value
            var cuisineSearch = cuisineInput.value
            var capitalCuisineSearch = cuisineSearch.charAt(0).toUpperCase() + cuisineSearch.slice(1)

            var cityUrl = "https://developers.zomato.com/api/v2.1/cities?q=" + citySearch

            // gets users city
            $.ajax({
                url: cityUrl,
                method: 'GET',
                headers: {
                    "user-key": zomatoAPI
                }
            }).then(function (cityResponse) {
                console.log(cityResponse)
                console.log(cityResponse.location_suggestions[0].id)
                var cityId = cityResponse.location_suggestions[0].id

                var cuisineUrl = "https://developers.zomato.com/api/v2.1/cuisines?city_id=" + cityId

                // gets cuisine id
                $.ajax({
                    url: cuisineUrl,
                    method: 'GET',
                    headers: {
                        "user-key": zomatoAPI
                    }
                }).then(function (cuisineResponse) {
                    console.log(cuisineResponse)

                    for (var i = 0; i < cuisineResponse.cuisines.length; i++) {
                        if (cuisineResponse.cuisines[i].cuisine.cuisine_name === capitalCuisineSearch) {
                            var cuisineId = cuisineResponse.cuisines[i].cuisine.cuisine_id
                            console.log(cuisineId)
                        }
                    }

                    var searchUrl = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city&count=5"  + "&lat=" + currentLat + "&lon=" + currentLon + "&cuisines=" + cuisineId

                    // combines city and cuisine id for restaurant search
                    $.ajax({
                        url: searchUrl,
                        method: 'GET',
                        headers: {
                            "user-key": zomatoAPI
                        }
                    }).then(function (searchResponse) {
                        console.log(searchResponse)

                        $('.results').empty()

                        // gets info from response to put on each card
                        for (var i = 0; i < searchResponse.restaurants.length; i++) {
                            console.log(searchResponse.restaurants[i].restaurant.name)
                            restArray.push(searchResponse.restaurants[i])

                            var restName = "<div class='restName'>" + searchResponse.restaurants[i].restaurant.name + "</div>"
                            var restAddress = "<div>Address: " + searchResponse.restaurants[i].restaurant.location.address + "</div>"
                            var restRating = "<div>Rating: " + searchResponse.restaurants[i].restaurant.user_rating.aggregate_rating + "</div>"
                            var restPhone = "<div>Phone: " + searchResponse.restaurants[i].restaurant.phone_numbers + "</div><hr>"


                            var eachresult = $('<div class="card restaurant">')
                            eachresult.attr("data-restaurantName", searchResponse.restaurants[i].restaurant.name)
                            $(eachresult).append(restName, restAddress, restRating, restPhone)
                            $('.results').append(eachresult)


                            console.log(restArray)

                            // Map start here
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // Pinpoint the restaurant locations on the map (end point or point B) (now in console)
                            var APIMapKey = "5b3ce3597851110001cf624823016920625e4e46933015e7a19f69e6";

                            var address = searchResponse.restaurants[i].restaurant.location.address;
                            var queryLocalityURL = "https://api.openrouteservice.org/geocode/search?api_key=" + APIMapKey + "&text=" + address;

                            $.ajax({
                                url: queryLocalityURL,
                                method: "GET"
                            }).then(function (localityResponse) {
                                // console.log(localityResponse);
                            });

                            // Direction from start point, user current location (or point A) to end point, restaurant address (or point B) 
                            // Doesn't work yet
                            // Get user current location (point A)
                            var startLat = currentLat;
                            var startLon = currentLon;

                            // Get coordinates (lat and lon) of restaurant from Zomato (point B)
                            var endLat = searchResponse.restaurants[i].restaurant.location.latitude;
                            console.log("restaurant lat " + endLat);
                            var endLon = searchResponse.restaurants[i].restaurant.location.longitude;
                            console.log("restaurant lon " + endLon);

                            var queryDirectionURL = "https://api.openrouteservice.org/v2/directions/driving-car?api_key=" + APIMapKey + "&start=" + startLat + "," + startLon + "&end=" + endLat + "," + endLon;

                            $.ajax({
                                url: queryDirectionURL,
                                method: "GET"
                            }).then(function (directionResponse) {
                                // console.log(directionResponse);
                            });

                            // Marker color is changed thanks to an open source project from https://awesomeopensource.com/project/pointhi/leaflet-color-markers
                            var redIcon = new L.Icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                              });
                            markerRestaurant = L.marker([endLat, endLon], {icon: redIcon}).addTo(map);
                        }

                        // click event for each result card
                        $('.restaurant').on('click', function (event) {
                            event.stopPropagation()
                            console.log($(this).data("restaurantname"))

                            for (var i = 0; i < restArray.length; i++) {

                                if ($(this).data("restaurantname") === restArray[i].restaurant.name) {
                                    // gets error, not sure if its possible to do --> photos
                                   console.log(restArray[i].restaurant.photos_url)
                                   var photos = restArray[i].restaurant.photos_url
                                   var photosEl = $('<img>')
                                   photosEl.attr('src', photos)
                                   $(this).append(photosEl)

                                    // ugly --> link to menu
                                   console.log(restArray[i].restaurant.menu_url)
                                   var menu = $('<div>' + restArray[i].restaurant.menu_url + '</div>' )  
                                   $(this).append(menu)




                                }

                            }

                            


                            
                           

                        })
                    })

                })

            })
        })
    });
} else {
    console.log("Can't determine your location");
}


