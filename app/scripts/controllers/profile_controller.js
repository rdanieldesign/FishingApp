(function(){

	angular.module('FishingApp')

	.controller('Profile', ['$scope', 'UserFactory', function($scope, UserFactory){

		UserFactory.loadUser().success( function(data){
			$scope.myFish = data.results;
		});

	}])

}());