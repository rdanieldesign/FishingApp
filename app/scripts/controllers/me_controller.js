(function(){

	angular.module('FishingApp')

	.controller('Me', ['$scope', 'UserFactory', function($scope, UserFactory){

		$scope.updateUser = function(user){
			UserFactory.updateUser(user);
		};

		UserFactory.watchFileInput();

	}]);

}());