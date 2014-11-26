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