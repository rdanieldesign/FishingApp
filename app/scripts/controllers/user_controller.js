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