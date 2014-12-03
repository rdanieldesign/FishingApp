(function(){

	angular.module('FishingApp')

	.controller('User', ['$scope', 'UserFactory', '$rootScope', function($scope, UserFactory, $rootScope){

		$scope.registerUser = function(user){
			UserFactory.registerUser(user);
		};

		$scope.loginUser = function(user){
			UserFactory.loginUser(user);
		};

		$scope.logout = function(){
			UserFactory.logout();
		};

		UserFactory.watchFileInput();

		UserFactory.checkUser();

		$scope.user = $rootScope.currentUser;

	}]);

}());