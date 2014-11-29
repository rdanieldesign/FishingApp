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
				console.log('Welcome back ' + user.username);
			} else {
				console.log('No User Logged In');
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
			// Geolocation EXIF data
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
					console.log('geodata success');

					postPic();

				}
				else {
					console.log('geodata failure');
				}
			});
		});

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
				var author = currentUser.objectId;
				// Post Catch to Server
				$http.post(catchURL, {
					picURL: picURL,
					geoData: geoData,
					author: author,
					status: 'draft'
				}, P_HEADERS)
				.success( function(data){
					var draftId = data.objectId;
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

		L.mapbox.accessToken = 'pk.eyJ1IjoicmRhbmllbGRlc2lnbiIsImEiOiJtUGNzTzVrIn0.WN9X0USkwLyWvMcAto3ZiA';

		var startMap = function(){

			var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([39.656, -97.295], 5);

			// Query Catches and drop marker for each
			$http.get(catchURL, P_HEADERS).success(function(data){
				_.each(data.results, function(x){
					console.log(x.geoData.latitude);
					console.log(x.geoData.longitude);
					L.marker([x.geoData.latitude, x.geoData.longitude]).addTo(map);
				});
			});

		}


		return {
			startMap: startMap
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('SingleFactory', [ '$http', '$routeParams', 'P_HEADERS', '$location', function($http, $routeParams, P_HEADERS, $location){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
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
				$location.path('/maps');
			});
		};

		return {
			getSingle: getSingle,
			saveDraft: saveDraft,
			publish: publish
		}

	}])

}());