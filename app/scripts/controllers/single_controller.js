(function(){

	angular.module('FishingApp')

	.controller('Single', ['$scope', 'UserFactory', function($scope, UserFactory){

		UserFactory.getSingleCatches().success(function(data){
			$scope.allCatches = data.results;
		});

	}]);

}());