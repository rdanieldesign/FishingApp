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
		var loadUser = function(user){
			var user = $cookieStore.get('currentUser');
			var params = 'where={"author":"'+ user.objectId + '"}';
			return $http.get(catchURL + '?' + params, P_HEADERS);
		};

		return {
			registerUser: registerUser,
			loginUser: loginUser,
			checkUser: checkUser,
			loadUser: loadUser
		}

	}]);

}());