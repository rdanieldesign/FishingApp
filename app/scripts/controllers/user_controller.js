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