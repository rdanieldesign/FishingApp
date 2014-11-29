(function(){

	angular.module('FishingApp')

	.controller('Profile', ['$scope', 'UserFactory', function($scope, UserFactory){

		UserFactory.loadUserPublished().success( function(data){
			$scope.myPublished = data.results;
		});

		UserFactory.loadUserDrafts().success( function(data){
			$scope.myDrafts = data.results;
		});


	}])

}());