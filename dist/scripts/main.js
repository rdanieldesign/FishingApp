(function(){

	angular.module('FishingApp', ['ngRoute', 'ngCookies'])

	.constant('P_HEADERS', {
		headers: {
			'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
			'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
			'X-Parse-Session-Token': 'pnktnjyb996sj4p156gjtp4im',
			'Content-Type': 'application/json'
		}
	})

	.constant('WEATHER', 'http://api.openweathermap.org/data/2.5/weather')
	.constant('WEATHER_KEY', '&units=imperial&APPID=480997352b669d76eb0919fd6cf75263')
	.constant('FILES', 'https://api.parse.com/1/files/')
	.constant('CATCHES', 'https://api.parse.com/1/classes/catches/')
	.constant('CURRENT_USER', 'https://api.parse.com/1/users/me/')

	.config( function($routeProvider){

		$routeProvider.when('/', {
			templateUrl: 'templates/home.html',
			controller: 'Home'
		});

		$routeProvider.when('/login', {
			templateUrl: 'templates/user.html',
			controller: 'User'
		});

		$routeProvider.when('/maps', {
			templateUrl: 'templates/map.html',
			controller: 'Map'
		});

		$routeProvider.when('/profile', {
			templateUrl: 'templates/profile.html',
			controller: 'Profile'
		});

		$routeProvider.when('/river/:id', {
			templateUrl: 'templates/river.html',
			controller: 'River'
		});

		$routeProvider.when('/draft/:fish', {
			templateUrl: 'templates/draft.html',
			controller: 'Draft'
		});

		$routeProvider.otherwise({
			templateUrl: 'templates/otherwise.html',
			controller: 'Otherwise'
		});

	})

	.run(['$rootScope', '$location', 'UserFactory', function ($rootScope, $location, UserFactory) {
		$rootScope.$on('$routeChangeStart', function() {
			UserFactory.checkUser();
		});
	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Home', ['$scope', 'CreateFactory', function($scope, CreateFactory) {

		CreateFactory.getPublished().success( function(data){
			$scope.publishedFish = data.results;
		});

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('User', ['$scope', 'UserFactory', '$rootScope', function($scope, UserFactory, $rootScope){

		$scope.registerUser = function(user){
			UserFactory.registerUser(user);
		};

		$scope.loginUser = function(user){
			UserFactory.loginUser(user);
		};

		$scope.logout = function(){
			UserFactory.logout();
		};

		UserFactory.watchFileInput();

		UserFactory.checkUser();

		$scope.user = $rootScope.currentUser;

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', 'RiverFactory', function($scope, MapFactory, RiverFactory) {

		MapFactory.startMap();

		RiverFactory.getAllRivers().success(function(data){
			$scope.rivers = data.results;
		});

		// Uncommenting the below function will create all rivers in rivers.js
		// RiverFactory.createRivers();

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Profile', ['$scope', 'UserFactory', function($scope, UserFactory){

		UserFactory.loadUserPublished().success( function(data){
			console.log(data);
			$scope.myPublished = data.results;
		});

		UserFactory.loadUserDrafts().success( function(data){
			console.log(data);
			$scope.myDrafts = data.results;
		});


	}])

}());
(function(){

	angular.module('FishingApp')

	.controller('Draft', ['$scope', 'SingleFactory', 'RiverFactory', 'CreateFactory', function($scope, SingleFactory, RiverFactory, CreateFactory){

		SingleFactory.getSingle().success( function(data){
			$scope.fish = data.results[0];
			var singleGeo = [];
			singleGeo[0] = data.results[0].geoData.latitude;
			singleGeo[1] = data.results[0].geoData.longitude;
			var river;
			RiverFactory.getAllRivers().success(function(data){
				river = RiverFactory.getClosestRiver(data, singleGeo);
				$scope.fish.river = {
					"__type": "Pointer",
					"className": "rivers",
					"objectId": river.objectId
				};
			});
			CreateFactory.getWeather(singleGeo).success(function(data){
				var weather = data;
				$scope.fish.weather = weather;
			});
		});

		$scope.saveDraft = function(fish){
			SingleFactory.saveDraft(fish);
		};

		$scope.publish = function(fish){
			SingleFactory.publish(fish);
		};

	}])

}());
(function(){

	angular.module('FishingApp')

	.controller('River', ['$scope', 'RiverFactory', 'MapFactory', function($scope, RiverFactory, MapFactory) {

		RiverFactory.getRiverData().success(function(data){
			RiverFactory.getRiverWeather(data).success(function(weather){
				var currentTemp = weather.main.temp;
				$scope.currentTemp = currentTemp;
			});
			RiverFactory.getRiverCatches().success( function(data){
				$scope.riverCatches = data.results;
			});
			$scope.river = data;
			$scope.riverProps = data.features[0].properties;
			// Initiate slider
			$('#tempSlider').noUiSlider({
				start: [20, 80],
				connect: true,
				margin: 10,
				range: {
					'min': 0,
					'max': 100
				}
			});
			$('#tempSlider').Link('upper').to($('#tempSlider_high'));
			$('#tempSlider').Link('lower').to($('#tempSlider_low'));
			$scope.low = 20;
			$scope.high = 80;
		});

		$('#tempSlider').on('slide', function(){
			$scope.low = $('#tempSlider').val()[0];
			$scope.high = $('#tempSlider').val()[1];
			$scope.$apply();
		});

		$scope.tempFilter = function (fish) {
			return fish.weather.main.temp >= $scope.low && fish.weather.main.temp <= $scope.high;
		};

		MapFactory.startRiverMap();

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('UserFactory', ['$http', 'P_HEADERS', '$cookieStore', '$rootScope', '$location', function($http, P_HEADERS, $cookieStore, $rootScope, $location){

		var userURL = 'https://api.parse.com/1/users/';
		var loginURL = 'https://api.parse.com/1/login/?';
		var currentURL = 'https://api.parse.com/1/users/me/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var filesURL = 'https://api.parse.com/1/files/';

		var currentFile;

		var watchFileInput = function(){
			// Upload new user avatar
			$('#avatarUpload').bind('change', function(e) {
				var files = e.target.files || e.dataTransfer.files;
				// Our file var now holds the selected file
				currentFile = files[0];
				console.log(currentFile);
			});
		};

		var registerUser =  function(user){
			console.log(user);

			// Upload avatar to Parse
			var currentFileURL = filesURL + currentFile.name;
			$http.post(currentFileURL, currentFile, {
				headers: {
					'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
					'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
					'Content-Type': currentFile.type
				}
			},
			{
				processData: false,
				contentType: false,
			}).success(function(data){
				console.log('Image Uploaded Successfully');
				console.log(data);
				console.log(user);
				$http.post(userURL, {
					'username': user.username,
					'password': user.password,
					'avatar': data.url,
					'name': user.name
				}, P_HEADERS).success( function(){
					console.log(user);
					loginUser(user);
				}).error( function(){
					alert('Please provide a username and password.');
				});
			}).error(function(){
					console.log('Image Upload Failed');
			});
		};

		var loginUser = function(user){
			var params = 'username='+user.username+'&password='+user.password;
			return $http.get(loginURL + params, P_HEADERS)
			.success( function(user){
				$('#loginForm')[0].reset();
				console.log(user.username + ' is logged in.');
				$cookieStore.remove('currentUser');
				$cookieStore.put('currentUser', user);
			}).error( function(){
				alert('Incorrect credentials.');
			});
		};

		logout = function () {
			$cookieStore.remove('currentUser');
			return checkUser();
		};

		var checkUser = function (user) {
			$rootScope.currentUser =  $cookieStore.get('currentUser');
			if($rootScope.currentUser === undefined){
				$location.path('/login');
			}
		};

		// Load the current user's posts
		var loadUserPublished = function(user){
			var user = $cookieStore.get('currentUser');
			var params = '?where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}, "status":"published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getRiverCatches = function(){
			var params = '?where={"$relatedTo":{"object":{"__type":"Pointer","className":"rivers","objectId":"'+ riverID +'"},"key":"catches"}}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		// Load the current user's posts
		var loadUserDrafts = function(user){
			var user = $cookieStore.get('currentUser');
			var params = '?where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}, "status":"draft"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		return {
			registerUser: registerUser,
			loginUser: loginUser,
			logout: logout,
			checkUser: checkUser,
			loadUserPublished: loadUserPublished,
			loadUserDrafts: loadUserDrafts,
			watchFileInput: watchFileInput
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', '$rootScope', '$location', '$cookieStore', 'WEATHER', 'WEATHER_KEY', 'FILES', 'CATCHES', 'CURRENT_USER', function($http, P_HEADERS, $rootScope, $location, $cookieStore, WEATHER, WEATHER_KEY, FILES, CATCHES, CURRENT_USER){

		var geo;
		var weather;

		// Get Image File and Geolocation Data on input field change
		$('#imageFile').bind('change', function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			$rootScope.file = files[0];
			// HTML5 Geolocation
			getGeo();
		});

		// HTML5 Geolocation
		var getGeo = function get_location() {
			if (Modernizr.geolocation) {
				var show_map = function(position) {
					var latitude = position.coords.latitude;
					var longitude = position.coords.longitude;
					geo = {
						"latitude": latitude,
						"longitude": longitude,
					};
					alert('Got geolocation!');
					postPic();
				};
				navigator.geolocation.getCurrentPosition(show_map);
			} else {
				alert('HTML5 Geolocation failure');
				// exifGeo();
			}
		};

		// Exif Data Backup Geolocation
		// var exifGeo = function(){
		// 	EXIF.getData(file, function() {
		// 		console.log(this);
		// 		var aLat = EXIF.getTag(this, 'GPSLatitude');
		// 		var aLong = EXIF.getTag(this, 'GPSLongitude');
		// 		if (aLat && aLong) {
		// 			var latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
		// 			var longRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';
		// 			var fLat = (aLat[0].numerator + (aLat[1].numerator/aLat[1].denominator)/60 + (aLat[2].numerator/aLat[1].denominator)/3600) * (latRef === 'N' ? 1 : -1);
		// 			var fLong = (aLong[0].numerator + (aLong[1].numerator/ aLong[1].denominator)/60 + (aLong[2].numerator/aLong[1].denominator)/3600) * (longRef === 'W' ? -1 : 1);
		// 			// Set variable geo to this images geodata
		// 			geo = {
		// 				latitude: fLat,
		// 				longitude: fLong,
		// 				latitudeRef: latRef,
		// 				longitudeRef: longRef
		// 			};
		// 			alert('EXIF geodata success');
		// 			// Start Drafting Post
		// 			postPic();
		// 		}
		// 		else {
		// 			alert('geodata failure');
		// 		}
		// 	});
		// };

		var getWeather = function(singleGeo){
			var coords = '?lat='+ singleGeo[0] +'&lon='+ singleGeo[1];
			return $http.get(WEATHER + coords + WEATHER_KEY);
		};

		// Post picture and go to drafts
		var postPic = function(){
			var currentFileURL = FILES + $rootScope.file.name;
			// Set catches' user
			var currentUser = $cookieStore.get('currentUser');
			return $http.post(currentFileURL, $rootScope.file, {
				headers: {
					'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
					'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
					'Content-Type': $rootScope.file.type
				}
			},
			{
				processData: false,
				contentType: false,
			}).
			success(function(data){
				// Set Catch Image
				var picURL = data.url;
				// Set Catch geodata
				var geoData = geo;
				// Post Catch to Server
				$http.post(CATCHES, {
					"picURL": picURL,
					"geoData": geoData,
					// "weather": weather,
					"user": {
						"__type": "Pointer",
						"className": "_User",
						"objectId": currentUser.objectId
					},
					"status": 'draft'
				}, P_HEADERS)
				.success( function(data){
					var draftId = data.objectId;
					alert('Ready to go to drafts');
					$location.path('/draft/' + draftId);
				});
			});
		};

		// Get all catches
		var getCatches = function(){
			return $http.get(CATCHES, P_HEADERS);
		};

		// Get all published catches
		var getPublished = function(){
			var params = '?where={"status":"published"}';
			return $http.get(CATCHES + params, P_HEADERS);
		};

		return {
			getCatches: getCatches,
			getPublished: getPublished,
			getWeather: getWeather
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('MapFactory', ['$http', 'P_HEADERS', '$routeParams', function($http, P_HEADERS, $routeParams){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var riverURL = 'https://api.parse.com/1/classes/rivers/';

		L.mapbox.accessToken = 'pk.eyJ1IjoicmRhbmllbGRlc2lnbiIsImEiOiJtUGNzTzVrIn0.WN9X0USkwLyWvMcAto3ZiA';


		var startMap = function(){

			var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([39.656, -97.295], 5);
			
			// Query Catches and drop marker for each
			$http.get(catchURL, P_HEADERS).success(function(data){
				_.each(data.results, function(x){
					L.marker([x.geoData.latitude, x.geoData.longitude]).addTo(map);
				});
			});

			// Get Rivers from rivers.js and populate map
			$http.get(riverURL, P_HEADERS).success(function(data){
				var rivers = data.results;
				_.each(rivers, function(river){
					var coordinates = river.features[0].geometry.coordinates;
					var options = river.features[0].properties;
					var riverLine = L.polyline(coordinates, options).bindPopup('<a href="#/river/' + river.objectId + '">' + options.title + '</a>').addTo(map);
				});
			});

			// // zoom the map to the polyline
			// map.fitBounds(riverLine.getBounds());

		};

		var startRiverMap = function(){
			var params = $routeParams.id;
			$http.get(riverURL + params, P_HEADERS).success(function(data){
				var coordinates = data.features[0].geometry.coordinates;
				var options = data.features[0].properties;
				var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446');
				var polyline = L.polyline(coordinates, options).addTo(map);
				// zoom the map to the polyline
				map.fitBounds(polyline.getBounds());
			});
		};


		return {
			startMap: startMap,
			startRiverMap: startRiverMap
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('SingleFactory', [ '$http', '$routeParams', 'P_HEADERS', '$location', function($http, $routeParams, P_HEADERS, $location){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var singleId = $routeParams.fish;

		var getSingle = function(){
			var params = '?where={"objectId":"'+ $routeParams.fish + '"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var saveDraft = function(fish){
			return $http.put(catchURL + singleId, fish, P_HEADERS)
			.success( function(){
				$location.path('/profile');
			});
		};

		var publish = function(fish){
			fish.status = "published";
			return $http.put(catchURL + singleId, fish, P_HEADERS)
			.success( function(){
				$http.put(riverURL + fish.river.objectId, {
					"catches": {
						"__op":"AddRelation",
						"objects": [{
							"__type": "Pointer",
							"className": "catches",
							"objectId": fish.objectId
						}]
					}
				}, P_HEADERS).success(function(){
					$location.path('/maps');
				});
			});
		};

		return {
			getSingle: getSingle,
			saveDraft: saveDraft,
			publish: publish
		}

	}])

}());
(function(){

	angular.module('FishingApp')

	.factory('RiverFactory', ['$http', '$routeParams', 'P_HEADERS', function($http, $routeParams, P_HEADERS){

		var riverID = $routeParams.id;
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var weatherURL = 'http://api.openweathermap.org/data/2.5/weather';
		var weatherKey = '&units=imperial&APPID=480997352b669d76eb0919fd6cf75263';

		var getRiverData = function(){
			return $http.get(riverURL + $routeParams.id, P_HEADERS);
		};

		var getRiverCatches = function(){
			var params = '?where={"$relatedTo":{"object":{"__type":"Pointer","className":"rivers","objectId":"'+ riverID +'"},"key":"catches"}}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getRiverWeather = function(river){
			var coordsArray = river.features[0].geometry.coordinates;
			var coords = coordsArray[Math.round(coordsArray.length/2)];
			var params = '?lat='+ coords[0] +'&lon='+ coords[1];
			return $http.get(weatherURL + params + weatherKey);
		};

		var getClosestRiver = function(data, geo){
			var closestRiver;
			var allRivers = data.results;
			var allCoords = [];
			_.each(allRivers, function(river){
				allCoords.push(river.features[0].geometry.coordinates);
			});
			var flattenedCoords = _.flatten(allCoords, 'shallow');
			// Haversine Formula
			var Haversine = function( lat1, lon1, lat2, lon2 ){
				// Convert Degress to Radians
				function Deg2Rad( deg ) {
					return deg * Math.PI / 180;
				}
				var R = 6372.8; // Earth Radius in Kilometers
				var dLat = Deg2Rad(lat2-lat1);
				var dLon = Deg2Rad(lon2-lon1);
				var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(Deg2Rad(lat1)) * Math.cos(Deg2Rad(lat2)) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				var d = R * c;
				// Return Distance in Kilometers
				return d;
			};

			var getDist = [];
			_.each(flattenedCoords, function(coordSet){
				getDist.push(Haversine(coordSet[0], coordSet[1], geo[0], geo[1]));
			});
			var minDist = _.min(getDist);
			var closestRiver = _.findWhere(allRivers, function(river){
				var theseCoords = river.features[0].geometry.coordinates;
				Haversine(theseCoords[0], theseCoords[1], geo[0], geo[1]) === minDist;
			});
			return closestRiver;
		};

		var getAllRivers = function(){
			return $http.get(riverURL, P_HEADERS);
		};

		var createRivers = function(river){
			_.each(rivers, function(river){
				var coordinates = river.features[0].geometry.coordinates;
				_.each(coordinates, function(coordSet){
					var lon = coordSet[0];
					var lat = coordSet[1];
					coordSet[0] = lat;
					coordSet[1] = lon;
				});
				$http.post(riverURL, river, P_HEADERS);
			});
		};

		return {
			getRiverData: getRiverData,
			getRiverCatches: getRiverCatches,
			getRiverWeather: getRiverWeather,
			getClosestRiver: getClosestRiver,
			getAllRivers: getAllRivers,
			createRivers: createRivers
		};

	}]);

}());
var rivers = [
	{
		"features": [
		{
			"geometry": {
				"coordinates": [
				[
				-84.37139511108397,
				34.987956570125824
				],
				[
				-84.36744689941405,
				34.986128262717195
				],
				[
				-84.36058044433592,
				34.986128262717195
				],
				[
				-84.35594558715819,
				34.98359669274446
				],
				[
				-84.3556022644043,
				34.9814869913057
				],
				[
				-84.35800552368164,
				34.97951788758702
				],
				[
				-84.36023712158202,
				34.97754873651821
				],
				[
				-84.35937881469727,
				34.97515756085082
				],
				[
				-84.35989379882811,
				34.973328967646175
				],
				[
				-84.36229705810547,
				34.97093766878007
				],
				[
				-84.36178207397461,
				34.959261501310166
				],
				[
				-84.35216903686523,
				34.95841737652232
				],
				[
				-84.33860778808594,
				34.95053845924085
				],
				[
				-84.3391227722168,
				34.941392337729845
				],
				[
				-84.35405731201172,
				34.937170706783924
				],
				[
				-84.35319900512695,
				34.93351178418678
				],
				[
				-84.31869506835938,
				34.910710205494546
				],
				[
				-84.31697845458984,
				34.903671401859576
				],
				[
				-84.30667877197266,
				34.90620544067929
				],
				[
				-84.29397583007812,
				34.90423452835513
				],
				[
				-84.29054260253906,
				34.90873940129966
				],
				[
				-84.2867660522461,
				34.90648699572108
				],
				[
				-84.28951263427733,
				34.90141885726193
				],
				[
				-84.29637908935547,
				34.90141885726193
				],
				[
				-84.29809570312499,
				34.89466085277602
				],
				[
				-84.2874526977539,
				34.88874714275385
				],
				[
				-84.28195953369139,
				34.88170645678332
				]
				],
				"type": "LineString"
			},
			"properties": {
				"description": "",
				"id": "marker-i2z4bic80",
				"stroke": "HSLA(210, 6%, 12%, 1)",
				"stroke-opacity": 1,
				"stroke-width": 4,
				"title": "Toccoa River",
				"click": function(){
					console.log('Hey');
				}
			},
			"type": "Feature"
		}
		],
		"id": "rdanieldesign.kb2o8446",
		"ids": [],
		"type": "FeatureCollection"
	},
	{
		"features": [
		{
			"geometry": {
				"coordinates": [
				[
				-84.752311,
				35.288927
				],
				[
				-84.746475,
				35.287806
				],
				[
				-84.73257,
				35.291309
				],
				[
				-84.725704,
				35.290608
				],
				[
				-84.722442,
				35.284163
				],
				[
				-84.724845,
				35.277296
				],
				[
				-84.731369,
				35.275474
				],
				[
				-84.744071,
				35.277016
				],
				[
				-84.751968,
				35.275755
				],
				[
				-84.752998,
				35.273092
				],
				[
				-84.750595,
				35.27127
				],
				[
				-84.746303,
				35.268467
				],
				[
				-84.741497,
				35.257254
				],
				[
				-84.735317,
				35.254871
				],
				[
				-84.729137,
				35.255291
				],
				[
				-84.72227,
				35.259356
				],
				[
				-84.713344,
				35.26258
				],
				[
				-84.707679,
				35.260478
				],
				[
				-84.702014,
				35.258375
				],
				[
				-84.697723,
				35.253469
				],
				[
				-84.698581,
				35.250105
				],
				[
				-84.700813,
				35.248843
				],
				[
				-84.708194,
				35.250245
				],
				[
				-84.711799,
				35.249684
				],
				[
				-84.712142,
				35.247721
				],
				[
				-84.710597,
				35.243516
				],
				[
				-84.706134,
				35.243656
				],
				[
				-84.704074,
				35.242394
				],
				[
				-84.704074,
				35.23945
				],
				[
				-84.706134,
				35.237487
				],
				[
				-84.713344,
				35.236225
				],
				[
				-84.715404,
				35.233841
				],
				[
				-84.715404,
				35.230476
				],
				[
				-84.712057,
				35.229004
				],
				[
				-84.707078,
				35.229214
				],
				[
				-84.696693,
				35.228583
				],
				[
				-84.683218,
				35.224377
				],
				[
				-84.670343,
				35.219328
				],
				[
				-84.661331,
				35.212596
				]
				],
				"type": "LineString"
			},
			"id": "ci34pz7kd0615bcqkpo91gzm4",
			"properties": {
				"description": "Tennessee",
				"id": "marker-i34ps1u90",
				"stroke": "HSLA(210, 6%, 12%, 1)",
				"stroke-opacity": 1,
				"stroke-width": 4,
				"title": "Hiwassee River"
			},
			"type": "Feature"
		}
		],
		"id": "rdanieldesign.kb2o8446",
		"type": "FeatureCollection"
	}
];