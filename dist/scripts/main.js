(function(){

	Parse.initialize("gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y", "FdBpCFiTvqFGasWQJSZGVFq2hDpz3K5RAZsutX9g");

	window.App = {};
	
	angular.module('FishingApp', ['ngRoute'])

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

		$routeProvider.otherwise({
			templateUrl: 'templates/otherwise.html',
			controller: 'Otherwise'
		});

	});

}());
(function(){

	angular.module('FishingApp')

	.controller('Home', ['$scope', 'CreateFactory', function($scope, CreateFactory) {

		CreateFactory.getCatches().success( function(data){
			$scope.allFish = data.results;
		});

		$scope.postCatch = function(fish) {
			CreateFactory.postCatch(fish);
		};

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
			UserFactory.loginUser(user).success( function(user){
				$('#loginForm')[0].reset();
				console.log(user.username + ' is logged in.');
				App.user = user;
			}).error( function(){
				alert('Incorrect credentials.');
			});
		};

		$scope.checkUser = function(user){
			UserFactory.checkUser(user);
		};

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('UserFactory', ['$http', 'P_HEADERS', function($http, P_HEADERS){

		var userURL = 'https://api.parse.com/1/users/';
		var loginURL = 'https://api.parse.com/1/login/?';
		var currentURL = 'https://api.parse.com/1/users/me/';

		var registerUser =  function(user){
			return $http.post(userURL, user, P_HEADERS, {
				'username': user.username,
				'password': user.password
			});
		};

		var loginUser = function(user){
			var params = 'username='+user.username+'&password='+user.password;
			return $http.get(loginURL + params, P_HEADERS)
		};

		var checkUser = function(user){
			return $http.get(currentURL, P_HEADERS)
			.success( function(data){
				console.log(data);
			})
			.error( function(data){
				console.log(data);
			});
		};

		return {
			registerUser: registerUser,
			loginUser: loginUser,
		}

	}]);

}());
(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', function($http, P_HEADERS){

		var filesURL = 'https://api.parse.com/1/files/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';

		var file;

		$('#imageFile').bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			file = files[0];
		});

		var getCatches = function(){
			return $http.get(catchURL, P_HEADERS);
		};

		var postCatch = function(fish){

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
			})
			.success( function(data){
				fish.picURL = data.url;
				$http.post(catchURL, fish, P_HEADERS)
				.success( function(){
					console.log('catch added');
				});
			})
			.error( function(data) {
				var obj = jQuery.parseJSON(data);
				alert(obj.error);
			});;

		};

		return {
			postCatch: postCatch,
			getCatches: getCatches
		}

	}]);

}());