(function(){

	angular.module('FishingApp')

	.controller('User', ['$scope', 'UserFactory', function($scope, UserFactory){

		$scope.registerUser = function(user){
			UserFactory.registerUser(user);
		};

		$scope.loginUser = function(user){
			UserFactory.loginUser(user);
		};

		$scope.logout = function(){
			UserFactory.logout();
		};

		$scope.checkUser = function(){
			UserFactory.checkUser();
		};

		UserFactory.watchFileInput();

		// UserFactory.checkUser();

	}]);

}());