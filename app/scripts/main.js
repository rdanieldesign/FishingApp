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

	.constant('WEATHER', {
		headers: {
			'x-api-key': 'APPID=480997352b669d76eb0919fd6cf75263'
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