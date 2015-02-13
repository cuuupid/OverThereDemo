/*
 * OverThere
 * Copyright Pending
 * Written by Priansh Shah, Andrew Jones, and Lucas Ochoa for the Connected Challenge Hack A Team online hackathon

TIME REMAINING: ~2 Weeks
Task List (prioritized): (mark which ones you are on currently with your Initials in brackets)
1. add textual reviews option [ps]
2. Maps API to display a map [ANDREW] {hopefully done by 2/9}
4. Directions shown in a list to a location {hopefully done by 2/8}
10. Prepare a portfolio for final submission in two weeks {done by 2/14 at latest} {DAVID}
11. Call A Cab feature!!! (allows us to compete with yelp) {hopefully done by 2/14}
<ROYALTY FROM UBER>
8. Split code into multiple files {hopefully done by deadline}
9. Target audience and client base expansion {can be done after deadline}
*/

var UI = require('ui');
var ajax = require("ajax"); 
var Settings = require("settings");
var lat = 0; 
var long = 0; 

var locList = [];

var errorHandler;
var main = new UI.Card({
		title : 'OverThere',
		subtitle : 'Downloading nearby locations...',
		body : 'The first iteration of this assembly only supports nearby restaurants.'
	});

main.show();

var cat = ""; 

var resultsJson;

var categories = [{
		title : "Reset",
		subtitle : "If the app has stopped working"
	}, {
		title : "Favorites"
	}, {
		title : "ATM",
		subtitle : "atm"
	}, {
		title : "Bakery",
		subtitle : "bakery"
	}, {
		title : "Bank",
		subtitle : "bank"
	}, {
		title : "Bar",
		subtitle : "bar"
	}, {
		title : "Club",
		subtitle : "club"
	}, {
		title : "Beauty",
		subtitle : "beauty_salon"
	}, {
		title : "Book Store",
		subtitle : "book_store"
	}, {
		title : "Library",
		subtitle : "library"
	}, {
		title : "Cafe",
		subtitle : "cafe"
	}, {
		title : "Recreation",
		subtitle : "campground"
	}, {
		title : "Car Dealer",
		subtitle : "car_dealer"
	}, {
		title : "Car Repair",
		subtitle : "car_repair"
	}, {
		title : "Car Wash",
		subtitle : "car_wash"
	}, {
		title : "Casino",
		subtitle : "casino"
	}, {
		title : "Clothing",
		subtitle : "clothing_store"
	}, {
		title : "General Store",
		subtitle : "convenience_store"
	}, {
		title : "Delivery",
		subtitle : "meal_delivery"
	}, {
		title : "Takeout",
		subtitle : "meal_takeaway"
	}, {
		title : "Restaurant/Dining",
		subtitle : "restaurant"
	}, {
		title : "Fire Station",
		subtitle : "fire_station"
	}, {
		title : "Police Station",
		subtitle : "police"
	}, {
		title : "Hospital",
		subtitle : "hospital"
	}, {
		title : "Bank",
		subtitle : "bank"
	}, {
		title : "City Hall",
		subtitle : "city_hall"
	}, {
		title : "Embassy",
		subtitle : "embassy"
	}, {
		title : "Courthouse",
		subtitle : "courthouse"
	}, {
		title : "Post Office",
		subtitle : "post_office"
	}, {
		title : "Lawyer",
		subtitle : "lawyer"
	}, {
		title : "Doctor",
		subtitle : "doctor"
	}, {
		title : "Dentist",
		subtitle : "dentist"
	}, {
		title : "Health",
		subtitle : "health"
	}, {
		title : "Insurance",
		subtitle : "insurance_agency"
	}, {
		title : "Hotels",
		subtitle : "lodging"
	}, {
		title : "Schools",
		subtitle : "school"
	}
];

var catList = new UI.Menu({
		sections : [{
				title : 'Choose a category:',
				items : categories
			}
		]
	});

catList.show();
main.hide();
catList.show();
var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8"; //url

var locationOptions = {
	enableHighAccuracy : true,
	maximumAge : 10000,
	timeout : 10000
};

function addToUrl(x) {
	url += "&&" + x; 
	console.log('URL is now: ' + url); 
}
var errorPage = new UI.Card({
		title : "Error" + errorHandler,
		subtitle : "There was an error processing your request.",
		body : "Please try again. If the problem persists please contact us at hellopriansh@gmail.com with the error # in the subject."
	});

function setLatLong(pos) {
	lat = pos.coords.latitude;
	console.log('Lat:' + pos.coords.latitude);
	long = pos.coords.longitude;
	addToUrl("location=" + lat + "," + long + "");
	if (lat !== null && long !== null && lat !== undefined && long !== undefined) {
		rankBy("distance", true);
		errorPage.hide();
	} else {
		navigator.geolocation.getCurrentPosition(setLatLong, locationError, locationOptions);
		errorHandler = 555;
		errorPage.show();
		errorPage.title = "Error 555";
		errorPage.hide();
		errorPage.show();
	}
}

function locationError(err) {
	console.log('location error (' + err.code + '): ' + err.message);
} 


console.log("got before selection candidate");

function addToFavorites(x, y) {
	console.log("Adding to favorites, " + x);
	var favList = JSON.parse(Settings.data('favorites'));
	console.log("Parsed favorites to get " + JSON.stringify(favList));
	favList[0] = {
		title : x,
		subtitle : y
	};
	favList.unshift({
		title : "Clear"
	});
	Settings.data('favorites', JSON.stringify(favList));
	var successFav = new UI.Card({
			title : "Success",
			subtitle : "Favorited",
			body : "You have successfully favorited " + x,
			scrollable : true
		});
	successFav.show();
}

function makeFavorites() {
	var favoritesMenu = new UI.Menu({
			sections : [{
					title : "Favorites",
					items : JSON.parse(Settings.data('favorites'))
				}
			]
		});
	favoritesMenu.show();
	favoritesMenu.on('select', function (e) {
		if ((JSON.parse(Settings.data('favorites')))[e.itemIndex].title == "Clear") {
			Settings.data('favorites', null);
			favoritesMenu.hide();
		} else {
			var descriptCard = new UI.Card({
					title : (JSON.parse(Settings.data('favorites')))[e.itemIndex].title,
					body : (JSON.parse(Settings.data('favorites')))[e.itemIndex].subtitle
				});
			descriptCard.show();
		}
	});
}

function getRating(x, placeTitle, placeSubtitle) {
	var detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8&placeid=";
	detailsUrl += x;
	console.log(detailsUrl);
	ajax({
		url : detailsUrl,
		type : 'json'
	},
		function (data) {
		console.log("THE RATING IS " + data.result.rating);
		var rating = data.result.rating;
		if (rating === undefined || rating === null || rating <= 0) {
			rating = getAverageRating(x, placeTitle, placeSubtitle);
		} else {
			rating = rating.toFixed(2);
			var information = new UI.Card({
					title : placeTitle,
					subtitle : rating + "/5",
					body : placeSubtitle,
					scrollable : true
				});
			console.log("info shown");
			information.show();
		}
	},
		function (error) {
		console.log('The ajax request failed: ' + error);
	});
}

function getAverageRating(x, placeTitle, placeSubtitle) {
	var detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8&placeid=";
	detailsUrl += x;
	console.log(detailsUrl);
	ajax({
		url : detailsUrl,
		type : 'json'
	},
		function (data) {
		var sum = 0;
		if (data.result.reviews !== undefined) {
			for (var i = 0; i < data.result.reviews.length; i++)
				sum += data.result.reviews[i].aspects[0].rating;
			if (data.result.reviews.length > 0) {
				sum /= data.result.reviews.length;
				sum = sum.toFixed(2);
				sum = "" + sum + "/5";
			} else {
				sum = "No Rating";
			}
		} else {
			sum = "No Rating";
		}
		console.log("THE RATING AVERAGE IS " + sum);
		var information = new UI.Card({
				title : placeTitle,
				subtitle : sum,
				body : placeSubtitle,
				scrollable : true
			});
		console.log("info shown");
		information.show();
	},
		function (error) {
		console.log('The ajax request failed: ' + error);
	});
}

function getReviews(x, placeTitle, placeSubtitle) {
	var reviewsUrl = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8&placeid=";
	reviewsUrl += x;
	console.log(reviewsUrl);
	ajax({
		url : reviewsUrl,
		type : 'json'
	},
		function (data) {
		var reviewData = [];
		var tempReview = "";
		if (data.result.reviews !== undefined) {
			for (var i = 0; i < data.result.reviews.length; i++) {
				tempReview = data.result.reviews[i].text;
				if (tempReview.length >= 1003) {
					tempReview = tempReview.substring(0, 1001) + "...";
				}
				reviewData.unshift(tempReview);
				console.log(reviewData[i]);
			}
		}
		var processedReviews = [];
		processedReviews.unshift({
			title : "No other reviews"
		});

		for (var j = 0; j < reviewData.length; j++) {
			processedReviews.unshift({
				title : reviewData[j],
				subtitle : data.result.reviews[j].aspects[0].rating + "/5"
			});
			console.log(reviewData[j]);
			console.log(processedReviews[j].title);
		}
		var reviewsMenu = new UI.Menu({
				sections : [{
						title : "Reviews",
						items : processedReviews
					}
				]
			});
		reviewsMenu.show();
		reviewsMenu.on('select', function (event) {
			var review = reviewData[reviewData.length -1- event.itemIndex];
			console.log(review);
			var subtitle = processedReviews[processedReviews.length -2 - event.itemIndex].subtitle;
			console.log(subtitle);
			var reviewCard = new UI.Card({
					title : subtitle,
					body : review,
					scrollable : true
				});
			reviewCard.show();
		});
	},
		function (error) {
		console.log('The ajax request failed: ' + error);
	});
}

function resetApp() {
	url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8";
	catList.show();
	console.log("reset");
} 

catList.on('select', function (event) {
	resetApp();
	console.log("Selected item");
	if (categories[event.itemIndex].title == "Reset") {
		resetApp();
	} else if (categories[event.itemIndex].title == "Favorites") {
		if (Settings.data('favorites') !== null && Settings.data('favorites') !== undefined && Settings.data('favorites') != "None") {
			makeFavorites();
		} else {
			var noFavorites = new UI.Card({
					title : "Oops!",
					subtitle : "No favorites",
					body : "If you believe this is an error please contact the app developer."
				});
			noFavorites.show();
		}
	} else {
		cat = categories[event.itemIndex].subtitle;
		console.log(cat);
		console.log(categories[event.itemIndex].subtitle);
		navigator.geolocation.getCurrentPosition(setLatLong, locationError, locationOptions);
		console.log("began nav");
	}
});


console.log("SKIPPED OVER?!");


function rankBy(rank, open) {
	addToUrl("rankby=" + rank);
	addToUrl("types=" + cat);
	if (open) {
		addToUrl("opennow");
	}

	ajax
	({
		url : "" + url + "",
		type : 'json'
	},
		function (json) {
		locList = [];
		var index = 0;
		for (var i = 0; i < json.results.length; i++) {
			locList.unshift({
				title : "x",
				subtitle : "x"
			});
			console.log(locList[index].title);
			index++;
		}
		for (var j = 0; j < locList.length; j++) {
			locList[j].title = json.results[j].name;
			locList[j].subtitle = json.results[j].vicinity;
			locList[j].value = json.results[j].place_id;
			console.log(locList[j].title + " " + locList[j].subtitle);
			index++;
		}

		locList.unshift({
			title : "Reset",
			subtitle : "If the results are blatantly wrong"
		});

		console.log(locList[0] + " " + locList[1]);

		resultsJson = new UI.Menu({
				sections : [{
						title : 'Results',
						items : locList
					}
				]
			});

		resultsJson.show();


		resultsJson.on('select', function (event) {
			var resultHandler = [{
					title : "An error has occurred"
				}
			];
			if (locList[event.itemIndex].title == "Reset") {
				resetApp();
				console.log("reset");
			}
			else {
				resultHandler[0].title = "Favorite";
				// resultHandler.unshift({title:"Transportation"});
				//  resultHandler.unshift({title:"Directions"});
				resultHandler.unshift({
					title : "Reviews"
				});
				resultHandler.unshift({
					title : "Information"
				});
				var placeTitle = locList[event.itemIndex].title;
				var placeSubtitle = locList[event.itemIndex].subtitle;
				var place = locList[event.itemIndex].value;
				console.log("THE PLACE ID IS " + place);
				var resultInfo = new UI.Menu({
						sections : [{
								title : placeTitle,
								items : resultHandler
							}
						]
					});
				resultsJson.hide();
				resultInfo.show();
				resultInfo.on('select', function (event) {

					if (resultHandler[event.itemIndex].title == "Information") {
						console.log("Information was clicked");
						getRating(place, placeTitle, placeSubtitle);

					}

					if (resultHandler[event.itemIndex].title == "Favorite") {
						console.log("Favoriting location " + placeTitle);
						console.log(Settings.data('favorites'));
						if (Settings.data('favorites') !== null && Settings.data('favorites') !== undefined && Settings.data('favorites') != "None") {
							addToFavorites(placeTitle, placeSubtitle);
							console.log(JSON.stringify(Settings.data('favorites')));
						} else {
							Settings.data('favorites', JSON.stringify([{
											title : "Clear"
										}, {
											title : placeTitle,
											subtitle : placeSubtitle
										}
									]));
							console.log(JSON.stringify(Settings.data('favorites')));
							var successFav = new UI.Card({
									title : "Success",
									subtitle : "Favorited",
									body : "You have successfully favorited " + placeTitle,
									scrollable : true
								});
							successFav.show();
						}
					}

					if (resultHandler[event.itemIndex].title == "Transportation") {
						console.log("Cars clicked");
						var uberUrl = "https://www.api.uber.com/v1/products?";
						ajax({
							url : uberUrl + "latitude=" + lat + "&longitude=" + long,
							type : 'json',
							headers : {
								'Authorization' : "Token serverLolMyServer"
							},
							async : false
						},
							function (data) {
							var cars = [];
							for (var i = 0; i < data.products.length; i++) {
								console.log(data.products[i].display_name);
								cars.unshift(data.products[i].display_name);
							}
						},
							function (error) {
							console.log("AJAX Failed because of error: " + error);
						});
					}
					if (resultHandler[event.itemIndex].title == "Reviews") {
						console.log("Getting Reviews");
						getReviews(place, placeTitle, placeSubtitle);

					}
				});

			}

			console.log("RESULTS CLICK HANDLER ON");

		});
	},
		function (error) {
		console.log('Ajax failed: ' + error);
	});

	console.log("almost to the end"); 
}