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

	});

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

	.controller('User', ['$scope', 'UserFactory', function($scope, UserFactory){

		$scope.registerUser = function(user){
			UserFactory.registerUser(user).success( function(){
				$scope.loginUser(user);
				$('#loginForm')[0].reset();
			}).error( function(){
				alert('Please provide a username and password.');
			});
		};

		$scope.loginUser = function(user){
			UserFactory.loginUser(user);
		};

		$scope.checkUser = function(){
			UserFactory.checkUser();
		};

		UserFactory.checkUser();

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', function($scope, MapFactory) {

		MapFactory.startMap();

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Profile', ['$scope', 'UserFactory', function($scope, UserFactory){

		UserFactory.loadUserPublished().success( function(data){
			$scope.myPublished = data.results;
		});

		UserFactory.loadUserDrafts().success( function(data){
			$scope.myDrafts = data.results;
		});


	}])

}());
(function(){

	angular.module('FishingApp')

	.controller('Draft', ['$scope', 'SingleFactory', function($scope, SingleFactory){

		SingleFactory.getSingle().success( function(data){
			console.log(data);
			$scope.fish = data.results[0];
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

	.controller('River', ['$scope', 'RiverFactory', function($scope, RiverFactory) {

		RiverFactory.getRiverData().success( function(data){
			console.log(data);
			$scope.river = data;
			$scope.riverProps = data.features[0].properties;
		});

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('UserFactory', ['$http', 'P_HEADERS', '$cookieStore',  function($http, P_HEADERS, $cookieStore){

		var userURL = 'https://api.parse.com/1/users/';
		var loginURL = 'https://api.parse.com/1/login/?';
		var currentURL = 'https://api.parse.com/1/users/me/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';

		var registerUser =  function(user){
			return $http.post(userURL, user, P_HEADERS, {
				'username': user.username,
				'password': user.password
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

		var checkUser = function (user) {
			var user = $cookieStore.get('currentUser');
			if(user !== undefined) {
				alert('Welcome back ' + user.username);
			} else {
				alert('No User Logged In');
			}
		};

		// Load the current user's posts
		var loadUserPublished = function(user){
			var user = $cookieStore.get('currentUser');
			var params = 'where={"author":"'+ user.objectId + '", "status":"published"}';
			return $http.get(catchURL + '?' + params, P_HEADERS);
		};

		// Load the current user's posts
		var loadUserDrafts = function(user){
			var user = $cookieStore.get('currentUser');
			var params = 'where={"author":"'+ user.objectId + '", "status":"draft"}';
			return $http.get(catchURL + '?' + params, P_HEADERS);
		};

		return {
			registerUser: registerUser,
			loginUser: loginUser,
			checkUser: checkUser,
			loadUserPublished: loadUserPublished,
			loadUserDrafts: loadUserDrafts
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', '$rootScope', '$location', '$cookieStore', function($http, P_HEADERS, $rootScope, $location, $cookieStore){

		var filesURL = 'https://api.parse.com/1/files/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var currentURL = 'https://api.parse.com/1/users/me/';


		var file;
		var geo;

		// Get Image File and Geolocation Data
		$('#imageFile').bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			file = files[0];

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
					postPic();
				};
				navigator.geolocation.getCurrentPosition(show_map);
			} else {
				alert('HTML5 Geolocation failure');
				exifGeo();
			}
		};

		// Exif Data Backup Geolocation
		var exifGeo = function(){
			EXIF.getData(file, function() {
				console.log(this);
				var aLat = EXIF.getTag(this, 'GPSLatitude');
				var aLong = EXIF.getTag(this, 'GPSLongitude');
				if (aLat && aLong) {
					var latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
					var longRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';
					var fLat = (aLat[0].numerator + (aLat[1].numerator/aLat[1].denominator)/60 + (aLat[2].numerator/aLat[1].denominator)/3600) * (latRef === 'N' ? 1 : -1);
					var fLong = (aLong[0].numerator + (aLong[1].numerator/ aLong[1].denominator)/60 + (aLong[2].numerator/aLong[1].denominator)/3600) * (longRef === 'W' ? -1 : 1);
					// Set variable geo to this images geodata
					geo = {
						latitude: fLat,
						longitude: fLong,
						latitudeRef: latRef,
						longitudeRef: longRef
					};
					alert('EXIF geodata success');
					// Start Drafting Post
					postPic();
				}
				else {
					alert('geodata failure');
				}
			});
		};

		// Post picture and go to drafts
		var postPic = function(){
			var currentFileURL = filesURL + file.name;
			return $http.post(currentFileURL, file, {
				headers: {
					'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
					'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
					'Content-Type': file.type
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
				// Set catches' user
				var currentUser = $cookieStore.get('currentUser');
				// Post Catch to Server
				$http.post(catchURL, {
					"picURL": picURL,
					"geoData": geoData,
					"user": {
						"__type": "Pointer",
						"className": "_User",
						"objectId": currentUser.objectId
					},
					"river": {
						"__type": "Pointer",
						"className": "rivers",
						"objectId": "nYPd56jbab"
					},
					status: 'draft'
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
			return $http.get(catchURL, P_HEADERS);
		};

		// Get all published catches
		var getPublished = function(){
			var params = '?where={"status":"published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		return {
			getCatches: getCatches,
			getPublished: getPublished
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('MapFactory', ['$http', 'P_HEADERS', function($http, P_HEADERS){

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


		return {
			startMap: startMap
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
			var params = '?where={"objectId":"'+ singleId + '"}';
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

		var getRiverData = function(){
			console.log(riverID);
			var params = '?where={"$relatedTo":{"object":[{"__type":"Pointer","className":"catches"},"key":"catches"}}';
			return $http.get(riverURL + riverID + params, P_HEADERS);
		};

		return {
			getRiverData: getRiverData
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