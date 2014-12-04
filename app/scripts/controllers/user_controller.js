(function(){

	angular.module('FishingApp')

	.controller('User', ['$scope', 'UserFactory', '$rootScope', function($scope, UserFactory, $rootScope){

		$scope.user = $rootScope.currentUser;
		console.log($scope.user);

		if($scope.user){
			$scope.signedIn = true;
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

		UserFactory.checkUser();

	}]);

}());