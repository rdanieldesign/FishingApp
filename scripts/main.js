(function(){

	angular.module('FishingApp', ['ngRoute', 'ngCookies', 'angularMoment', 'ngStorage'])

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
	.constant('NSGS', 'http://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&stateCd=ga&parameterCd=00065,00060,00020,00010&siteType=ST')

	.config( function($routeProvider){

		$routeProvider.when('/', {
			templateUrl: 'templates/home.html',
			controller: 'Home'
		});

		$routeProvider.when('/login', {
			templateUrl: 'templates/login.html',
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

		$routeProvider.when('/me/:id', {
			templateUrl: 'templates/me.html',
			controller: 'Me'
		});

		$routeProvider.when('/user/:id', {
			templateUrl: 'templates/user.html',
			controller: 'Single'
		});

		$routeProvider.otherwise({
			templateUrl: 'templates/otherwise.html',
			controller: 'Otherwise'
		});

	})

	.run(['$rootScope', '$location', 'UserFactory', 'RiverFactory', 'CreateFactory', '$localStorage', function ($rootScope, $location, UserFactory, RiverFactory, CreateFactory, $localStorage) {
		$rootScope.$on('$routeChangeStart', function() {
			UserFactory.checkUser();
		});
		$rootScope.$storage = $localStorage;
		$rootScope.haversine = CreateFactory.haversine;
		RiverFactory.getNSGS().then(function(data){
			$localStorage.$reset();
			$rootScope.$storage.nsgs = data;
		});
		// Watch for photo uploads
		// Get Image File and Geolocation Data on input field change
		$('#imageFile').bind('change', function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			$rootScope.file = files[0];
			// HTML5 Geolocation
			$rootScope.$broadcast("loader_show");
			CreateFactory.getGeo();
		});
	}])

	.directive("loader", function ($rootScope) {
		return function ($scope, element, attrs) {
			$scope.$on("loader_show", function () {
				return element.show();
			});
			return $scope.$on("loader_hide", function () {
				return element.hide();
			});
		};
	})

	.directive("scroll", function ($window) {
		return function($scope, element, attrs) {
			var lastScrollTop = 0;
			$(window).scroll(function(event){
				if($(this).scrollTop() > 100){
					var st = $(this).scrollTop();
					if (st > lastScrollTop){
						$('nav').addClass('reducedNav');
						$('.main').addClass('reducedMain');
					} else if(st < lastScrollTop - 5){
						$('nav').removeClass('reducedNav');
						$('.main').removeClass('reducedMain');
					}
					lastScrollTop = st;
				};
			});
		};
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

	.controller('User', ['$scope', 'UserFactory', '$rootScope', '$cookieStore', function($scope, UserFactory, $rootScope, $cookieStore){

		var loggedIn = $cookieStore.get('currentUser');
		if(loggedIn){
			UserFactory.getCurrentUser(loggedIn).success(function(data){
				$rootScope.currentUser = data;
				$scope.user = $rootScope.currentUser;
				$scope.signedIn = true;
			});
		}
		else {
			$scope.signedIn = false;
		};

		$scope.newUser = null;

		$scope.registerUser = function(user){
			UserFactory.registerUser(user).success( function(){
				UserFactory.newUser(user);
			}).error( function(){
				alert('Please provide a username and password.');
			});
		};

		$scope.loginUser = function(user){
			UserFactory.loginUser(user);
		};

		$scope.logout = function(){
			$scope.signedIn = false;
			UserFactory.logout();
		};

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', 'RiverFactory', '$rootScope', function($scope, MapFactory, RiverFactory, $rootScope) {

		MapFactory.startMap();

		$scope.rivers = _.pairs($rootScope.nsgs);

		// Uncommenting the below function will create all rivers in rivers.js
		// RiverFactory.createRivers();

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Profile', ['$scope', '$rootScope', 'UserFactory', 'MapFactory', '$location', '$q', function($scope, $rootScope, UserFactory, MapFactory, $location, $q){

		UserFactory.getThisUser().success( function(data){
			MapFactory.userMap(data);
			$scope.user = data;
		});

		UserFactory.loadUserPublished().success( function(data){
			$scope.myPublished = data.results;
		});

		UserFactory.loadUserDrafts().success( function(data){
			$scope.myDrafts = data.results;
		});

		// Map Filtering
		$scope.$watch('filteredCatches', function() {
			MapFactory.updateMap($scope.filteredCatches);
		}, true);


		// Edit draft
		$scope.editDraft = function(draft){
			var draftId = draft.objectId;
			$location.path('/draft/' + draftId);
		};


		$scope.setRiver = function(river){
		  return $q(function(resolve){
				if($scope.riverSwitch){
					$scope.riverSearch.riverName = river;
					resolve($scope.riverSearch.riverName);
				} else {
					return;
				};
			}).then(function(){
				$scope.searching = false;
			});
		};

		$scope.tempFilter = function(fish) {
			if(fish.weather && $scope.tempSwitch){
				return Number(fish.weather.main.temp) >= $scope.airLow && Number(fish.weather.main.temp) <= $scope.airHigh;
			} else {
				return fish;
			}
		};

		$scope.levelFilter = function(fish) {
			if(fish.conditions.gageHeight && $scope.levelSwitch){
				return Number(fish.conditions.gageHeight.values[0].value[0].value) >= $scope.levelLow && Number(fish.conditions.gageHeight.values[0].value[0].value) <= $scope.levelHigh;
			} else {
				return fish;
			}
		};

		$scope.waterFilter = function(fish) {
			if(fish.conditions.waterTemp && $scope.waterSwitch){
				return Number(fish.conditions.waterTemp.values[0].value[0].value) >= $scope.waterLow && Number(fish.conditions.waterTemp.values[0].value[0].value) <= $scope.waterHigh;
			} else {
				return fish;
			}
		};

		$scope.flowFilter = function(fish) {
			if(fish.conditions.discharge && $scope.flowSwitch){
				return Number(fish.conditions.discharge.values[0].value[0].value) >= $scope.flowLow && Number(fish.conditions.discharge.values[0].value[0].value) <= $scope.flowHigh;
			} else {
				return fish;
			}
		};

		// Initiate Temp slider
		$('#tempSlider').noUiSlider({
			start: [20, 80],
			connect: true,
			margin: 10,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#tempSlider_high'))
		.Link('lower').to($('#tempSlider_low'))
		.on('slide', function(){
			$scope.airLow = $('#tempSlider').val()[0];
			$scope.airHigh = $('#tempSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Level slider
		$('#levelSlider').noUiSlider({
			start: [0, 100],
			connect: true,
			margin: 1,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#levelSlider_high'))
		.Link('lower').to($('#levelSlider_low'))
		.on('slide', function(){
			$scope.levelLow = $('#levelSlider').val()[0];
			$scope.levelHigh = $('#levelSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Water Temp slider
		$('#waterSlider').noUiSlider({
			start: [0, 100],
			connect: true,
			margin: 5,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#waterSlider_high'))
		.Link('lower').to($('#waterSlider_low'))
		.on('slide', function(){
			$scope.waterLow = $('#waterSlider').val()[0];
			$scope.waterHigh = $('#waterSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Flow slider
		$('#flowSlider').noUiSlider({
			start: [0, 1000],
			connect: true,
			margin: 5,
			range: {
				'min': 0,
				'max': 1000
			}
		})
		.Link('upper').to($('#flowSlider_high'))
		.Link('lower').to($('#flowSlider_low'))
		.on('slide', function(){
			$scope.flowLow = $('#flowSlider').val()[0];
			$scope.flowHigh = $('#flowSlider').val()[1];
			$scope.$apply();
		});

		$scope.airLow = 20;
		$scope.airHigh = 80;
		$scope.levelLow = 0;
		$scope.levelHigh = 100;
		$scope.waterLow = 0;
		$scope.waterHigh = 100;
		$scope.flowLow = 0;
		$scope.flowHigh = 1000;


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
			// Get Closest River
			var river = RiverFactory.getClosestRiver(singleGeo);
			$scope.fish.details = river;
			$scope.fish.riverId = river[0].sourceInfo.siteCode[0].value;
			$scope.fish.riverName = river[0].sourceInfo.siteName;
			//Get weather
			CreateFactory.getWeather(singleGeo).success(function(data){
				var weather = data;
				$scope.fish.weather = weather;
			});
			// Get current conditions
			RiverFactory.getRiverConditions(river).then(function(results){
				$scope.fish.conditions = results;
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

	.controller('River', ['$scope', 'RiverFactory', 'MapFactory', '$rootScope', function($scope, RiverFactory, MapFactory, $rootScope) {

		RiverFactory.getRiverData().then(function(data){
			$scope.river = data;
			// Conditions
			RiverFactory.getRiverConditions(data[1]).then(function(results){
				$scope.currentInfo = results;
				if(results.discharge){
					$scope.waterFlow = results.discharge.values[0].value[0].value;
				};
				if(results.gageHeight){
					$scope.waterLevel = results.gageHeight.values[0].value[0].value;
				};
				if(results.waterTemp){
					$scope.waterTemp = (((Number(results.waterTemp.values[0].value[0].value))*9)/5)+32;
				};
				if(results.airTemp){
					$scope.currentTemp = results.airTemp.values[0].value[0].value;
				};
			});
			// Weather
			if(!$scope.currentTemp){
				RiverFactory.getRiverWeather(data).success(function(weather){
					$scope.currentTemp = weather.main.temp;
				});
			};
		});

		RiverFactory.getRiverCatches().success( function(data){
			$scope.riverCatches = data.results;
		});

		$scope.tempFilter = function(fish) {
			if(fish.weather && $scope.tempSwitch){
				return Number(fish.weather.main.temp) >= $scope.airLow && Number(fish.weather.main.temp) <= $scope.airHigh;
			} else {
				return fish;
			}
		};

		$scope.levelFilter = function(fish) {
			if(fish.conditions.gageHeight && $scope.levelSwitch){
				return Number(fish.conditions.gageHeight.values[0].value[0].value) >= $scope.levelLow && Number(fish.conditions.gageHeight.values[0].value[0].value) <= $scope.levelHigh;
			} else {
				return fish;
			}
		};

		$scope.waterFilter = function(fish) {
			if(fish.conditions.waterTemp && $scope.waterSwitch){
				return Number(fish.conditions.waterTemp.values[0].value[0].value) >= $scope.waterLow && Number(fish.conditions.waterTemp.values[0].value[0].value) <= $scope.waterHigh;
			} else {
				return fish;
			}
		};

		$scope.flowFilter = function(fish) {
			if(fish.conditions.discharge && $scope.flowSwitch){
				return Number(fish.conditions.discharge.values[0].value[0].value) >= $scope.flowLow && Number(fish.conditions.discharge.values[0].value[0].value) <= $scope.flowHigh;
			} else {
				return fish;
			}
		};

		// Initiate Temp slider
		$('#tempSlider').noUiSlider({
			start: [20, 80],
			connect: true,
			margin: 10,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#tempSlider_high'))
		.Link('lower').to($('#tempSlider_low'))
		.on('slide', function(){
			$scope.airLow = $('#tempSlider').val()[0];
			$scope.airHigh = $('#tempSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Level slider
		$('#levelSlider').noUiSlider({
			start: [0, 100],
			connect: true,
			margin: 1,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#levelSlider_high'))
		.Link('lower').to($('#levelSlider_low'))
		.on('slide', function(){
			$scope.levelLow = $('#levelSlider').val()[0];
			$scope.levelHigh = $('#levelSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Water Temp slider
		$('#waterSlider').noUiSlider({
			start: [0, 100],
			connect: true,
			margin: 5,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#waterSlider_high'))
		.Link('lower').to($('#waterSlider_low'))
		.on('slide', function(){
			$scope.waterLow = $('#waterSlider').val()[0];
			$scope.waterHigh = $('#waterSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Flow slider
		$('#flowSlider').noUiSlider({
			start: [0, 1000],
			connect: true,
			margin: 5,
			range: {
				'min': 0,
				'max': 1000
			}
		})
		.Link('upper').to($('#flowSlider_high'))
		.Link('lower').to($('#flowSlider_low'))
		.on('slide', function(){
			$scope.flowLow = $('#flowSlider').val()[0];
			$scope.flowHigh = $('#flowSlider').val()[1];
			$scope.$apply();
		});

		$scope.airLow = 20;
		$scope.airHigh = 80;
		$scope.levelLow = 0;
		$scope.levelHigh = 100;
		$scope.waterLow = 0;
		$scope.waterHigh = 100;
		$scope.flowLow = 0;
		$scope.flowHigh = 1000;

		MapFactory.startRiverMap();

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Me', ['$scope', 'UserFactory', function($scope, UserFactory){

		$scope.updateUser = function(user){
			UserFactory.updateUser(user);
		};

		UserFactory.watchFileInput();

	}]);

}());
(function(){

	angular.module('FishingApp')

	.controller('Single', ['$scope', 'UserFactory', function($scope, UserFactory){

		UserFactory.getSingleCatches().success(function(data){
			$scope.allCatches = data.results;
		});

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('UserFactory', ['$http', 'P_HEADERS', '$cookieStore', '$rootScope', '$location', '$routeParams', function($http, P_HEADERS, $cookieStore, $rootScope, $location, $routeParams){

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
			});
		};

		var registerUser =  function(user){
			return $http.post(userURL, {
				'username': user.username,
				'password': user.password
			}, P_HEADERS);
		};

		var updateUser = function(userName){
			var currentFileURL = currentFile ? filesURL + currentFile.name : null;
			var user = userName || '';
			if(currentFileURL){
				return $http.post(currentFileURL, currentFile, {
					headers: {
						'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
						'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
						'Content-Type': currentFile.type
					}
				},
				{
					processData: false,
					contentType: false,
				}).success( function(data){
					_postData(data, user);
				});
			} else {
				return _postData({}, user)
			}
		};

		var _postData = function(data, userName){
			var currentUser = $cookieStore.get('currentUser');
			var picURL = data ? data.url : '';
			var postObj = {
				avatar: picURL,
				name: userName
			};
			$http.put(userURL + currentUser.objectId, postObj, {
				headers: {
				'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
				'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
				'X-Parse-Session-Token': currentUser.sessionToken,
				'Content-Type': 'application/json'
				}
			}).success(function(){
				$location.path('/');
			});
		};

		var newUser = function(user){
			var params = 'username='+user.username+'&password='+user.password;
			return $http.get(loginURL + params, P_HEADERS)
			.success( function(user){
				$cookieStore.remove('currentUser');
				$cookieStore.put('currentUser', user);
				$location.path('/me/' + user.objectId);
			});
		};

		var loginUser = function(user){
			var params = 'username='+user.username+'&password='+user.password;
			$http.get(loginURL + params, P_HEADERS)
			.success( function(user){
				$cookieStore.remove('currentUser');
				$cookieStore.put('currentUser', user);
				$location.path('/');
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
				alert('Please log in or register.');
			}
		};

		var getCurrentUser = function(user){
			var params = user.objectId;
			return $http.get(userURL + params, P_HEADERS);
		};

		var getThisUser = function(){
			var user = $cookieStore.get('currentUser');
			var params = user.objectId
			return $http.get(userURL + params, P_HEADERS);
		};

		// Load the current user's posts
		var loadUserPublished = function(){
			var user = $cookieStore.get('currentUser');
			var params = '?include=river&where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}, "status":"published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getRiverCatches = function(){
			var params = '?where={"$relatedTo":{"object":{"__type":"Pointer","className":"rivers","objectId":"'+ riverID +'"},"key":"catches"}}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		// Load the current user's posts
		var loadUserDrafts = function(user){
			var user = $cookieStore.get('currentUser');
			var params = '?include=river&where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}, "status":"draft"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getSingleCatches = function(){
			var params = '?include=user&where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ $routeParams.id +'"}, "status":"published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		return {
			registerUser: registerUser,
			loginUser: loginUser,
			logout: logout,
			checkUser: checkUser,
			loadUserPublished: loadUserPublished,
			loadUserDrafts: loadUserDrafts,
			watchFileInput: watchFileInput,
			newUser: newUser,
			updateUser: updateUser,
			getCurrentUser: getCurrentUser,
			getSingleCatches: getSingleCatches,
			getThisUser: getThisUser
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', '$rootScope', '$location', '$cookieStore', 'WEATHER', 'WEATHER_KEY', 'FILES', 'CATCHES', 'CURRENT_USER', function($http, P_HEADERS, $rootScope, $location, $cookieStore, WEATHER, WEATHER_KEY, FILES, CATCHES, CURRENT_USER){

		var geo;
		var weather;

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
					$rootScope.$broadcast("loader_hide");
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

		// With Weather API
		var getWeather = function(singleGeo){
			var coords = '?lat='+ singleGeo[0] +'&lon='+ singleGeo[1];
			return $http.get(WEATHER + coords + WEATHER_KEY);
		};

		// With NSGS
		var getConditions = function(singleGeo){
			// Get the closest recorded conditions
			var closest = _.min($rootScope.nsgs, function(river){
				var riverGeo = river[0].sourceInfo.geoLocation.geogLocation;
				return $rootScope.haversine(riverGeo.latitude, riverGeo.longitude, singleGeo[0], singleGeo[1]);
			});
			// Store closest info in object
			var info = {};
			_.each(closest, function(condition){
				if(condition.variable.oid == 45807197){
					info.discharge = condition;
				}
				else if(condition.variable.oid == 45807202){
					info.gageHeight = condition;
				}
				else if(condition.variable.oid == 45807042){
					info.waterTemp = condition;
				}
				else if(condition.variable.oid == 45807073){
					info.airTemp = condition;
				}
			});
			return info;
		};



		// Post picture and go to drafts
		var postPic = function(){
			var currentFileURL = FILES + $rootScope.file.name;
			// Set catches' user
			var currentUser = $cookieStore.get('currentUser');
			$http.post(currentFileURL, $rootScope.file, {
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
					"user": {
						"__type": "Pointer",
						"className": "_User",
						"objectId": currentUser.objectId
					},
					"status": 'draft'
				}, P_HEADERS)
				.success( function(data){
					var draftId = data.objectId;
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
			var params = '?include=user&where={"status":"published"}';
			return $http.get(CATCHES + params, P_HEADERS);
		};

		// Haversine Formula
		var haversine = function( lat1, lon1, lat2, lon2 ){
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

		return {
			getCatches: getCatches,
			getPublished: getPublished,
			getWeather: getWeather,
			getConditions: getConditions,
			haversine: haversine,
			getGeo: getGeo
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('MapFactory', ['$http', '$rootScope', 'P_HEADERS', '$routeParams', function($http, $rootScope, P_HEADERS, $routeParams){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var riverURL = 'https://api.parse.com/1/classes/rivers/';

		L.mapbox.accessToken = 'pk.eyJ1IjoicmRhbmllbGRlc2lnbiIsImEiOiJtUGNzTzVrIn0.WN9X0USkwLyWvMcAto3ZiA';


		var startMap = function(){

			$rootScope.map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([39.656, -97.295], 5);

			// // Query Catches and drop marker for each
			// $http.get(catchURL, P_HEADERS).success(function(data){
			// 	_.each(data.results, function(x){
			// 		L.marker([x.geoData.latitude, x.geoData.longitude]).addTo($rootScope.map);
			// 	});
			// });

			// Get Rivers from rivers.js and populate map
			// $http.get(riverURL, P_HEADERS).success(function(data){
			// 	var rivers = data.results;
			// 	_.each(rivers, function(river){
			// 		var coordinates = river.features[0].geometry.coordinates;
			// 		var options = river.features[0].properties;
			// 		var riverLine = L.polyline(coordinates, options).bindPopup('<a href="#/river/' + river.objectId + '">' + options.title + '</a>').addTo($rootScope.map);
			// 	});
			// });

			// // zoom the map to the polyline
			// map.fitBounds(riverLine.getBounds());

		};

		var userMap = function(user){
			$rootScope.map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([32.986, -82.782], 7);
			var markers = [];
			// Query Catches and drop marker for each
			var params = '?where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}}';
			$http.get(catchURL + params, P_HEADERS).success(function(data){
				_.each(data.results, function(x){
					markers.push(L.marker([x.geoData.latitude, x.geoData.longitude]).bindPopup('<img src="' + x.picURL + '" style="width: 120px;">'));
				});
				$rootScope.group = L.layerGroup(markers);
				$rootScope.group.addTo($rootScope.map);
			});
		};

		var updateMap = function(catches){
			if($rootScope.map && $rootScope.group){
				var map = $rootScope.map;
				map.removeLayer($rootScope.group);
				var markers = [];
				_.each(catches, function(x){
					markers.push(L.marker([x.geoData.latitude, x.geoData.longitude]).bindPopup('<img src="' + x.picURL + '" style="width: 120px;">'));
				});
				$rootScope.group = L.layerGroup(markers);
				$rootScope.group.addTo(map);
			};
		};

		var startRiverMap = function(){
			var params = $routeParams.id;
			var data = _.pairs($rootScope.$storage.nsgs);
			var singleRiver = _.find(data, function(x){
				return x[1][0].sourceInfo.siteCode[0].value === $routeParams.id;
			});
			var coords = singleRiver[1][0].sourceInfo.geoLocation.geogLocation;
			var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446').setView([coords.latitude, coords.longitude], 12);
			var riverCoords = L.marker([coords.latitude, coords.longitude]).addTo(map);;
		};


		return {
			startMap: startMap,
			startRiverMap: startRiverMap,
			userMap: userMap,
			updateMap: updateMap
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
			$http.put(catchURL + $routeParams.fish, fish, P_HEADERS)
			.success( function(){
				$location.path('/profile');
			});
		};

		var publish = function(fish){
			fish.status = "published";
			$http.put(catchURL + $routeParams.fish, fish, P_HEADERS).success(function(){
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
(function(){

	angular.module('FishingApp')

	.factory('RiverFactory', ['$http', '$routeParams', 'P_HEADERS', 'NSGS', '$rootScope', '$q', function($http, $routeParams, P_HEADERS, NSGS, $rootScope, $q){

		var riverID = $routeParams.id;
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var weatherURL = 'http://api.openweathermap.org/data/2.5/weather';
		var weatherKey = '&units=imperial&APPID=480997352b669d76eb0919fd6cf75263';

		var getRiverData = function(){
			return $q(function(resolve){
				var data = _.pairs($rootScope.$storage.nsgs);
				var singleRiver = _.find(data, function(x){
					return x[1][0].sourceInfo.siteCode[0].value === $routeParams.id;
				});
				resolve(singleRiver);
			});
		};

		var getRiverCatches = function(){
			var params = '?include=user&where={"riverId": "' + $routeParams.id + '", "status": "published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getRiverWeather = function(river){
			var coords = river[1][0].sourceInfo.geoLocation.geogLocation;
			var params = '?lat='+ coords.latitude +'&lon='+ coords.longitude;
			return $http.get(weatherURL + params + weatherKey);
		};

		var getClosestRiver = function(geo){
			var allRivers = $rootScope.nsgs;
			return _.min(allRivers, function(river){
				var riverGeo = river[0].sourceInfo.geoLocation.geogLocation;
				return $rootScope.haversine(riverGeo.latitude, riverGeo.longitude, geo[0], geo[1]);
			});
		};

		var getAllRivers = function(){
			// return $http.get(riverURL, P_HEADERS);
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

		var getRiverConditions = function(singleRiver){
			var info = {};
			return $q(function(resolve){
			_.each(singleRiver, function(condition){
				if(condition.variable.oid == 45807197){
					info.discharge = condition;
				}
				else if(condition.variable.oid == 45807202){
					info.gageHeight = condition;
				}
				else if(condition.variable.oid == 45807042){
					info.waterTemp = condition;
				}
				else if(condition.variable.oid == 45807073){
					info.airTemp = condition;
				}
			});
			resolve(info);
		});
	};

		var getNSGS = function(){
			return $q(function(resolve){
				$http.get(NSGS).success(function(data){
					var array = data.value.timeSeries;
					var grouped = _.groupBy(array, function(x){
						return x.sourceInfo.siteName;
					});
					$rootScope.nsgs = grouped;
					resolve($rootScope.nsgs);
				});
			})
		};

		return {
			getRiverData: getRiverData,
			getRiverCatches: getRiverCatches,
			getRiverWeather: getRiverWeather,
			getClosestRiver: getClosestRiver,
			getAllRivers: getAllRivers,
			createRivers: createRivers,
			getRiverConditions: getRiverConditions,
			getNSGS: getNSGS
		};

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('httpInterceptor', function ($q, $rootScope, $log) {

		var numLoadings = 0;

		return {
			request: function (config) {

				numLoadings++;

				// Show loader
				$rootScope.$broadcast("loader_show");
				return config || $q.when(config)

			},
			response: function (response) {

				if ((--numLoadings) === 0) {
					// Hide loader
					$rootScope.$broadcast("loader_hide");
				}

				return response || $q.when(response);

			},
			responseError: function (response) {

				if (!(--numLoadings)) {
					// Hide loader
					$rootScope.$broadcast("loader_hide");
				}

				return $q.reject(response);
			}
		};
	})

	.config(function ($httpProvider) {
		$httpProvider.interceptors.push('httpInterceptor');
	});

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