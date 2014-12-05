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

	.run(['$rootScope', '$location', 'UserFactory', 'RiverFactory', 'CreateFactory', function ($rootScope, $location, UserFactory, RiverFactory, CreateFactory) {
		$rootScope.$on('$routeChangeStart', function() {
			UserFactory.checkUser();
		});
		$rootScope.haversine = CreateFactory.haversine;
		RiverFactory.getNSGS();
	}]);

}());