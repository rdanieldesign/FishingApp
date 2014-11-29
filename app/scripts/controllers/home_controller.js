(function(){

	angular.module('FishingApp')

	.controller('Home', ['$scope', 'CreateFactory', function($scope, CreateFactory) {

		CreateFactory.getPublished().success( function(data){
			$scope.publishedFish = data.results;
		});

		$scope.postCatch = function(fish) {
			CreateFactory.postCatch(fish);
		};

	}]);

}());