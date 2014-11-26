(function(){

	angular.module('FishingApp')

	.controller('Home', ['$scope', 'CreateFactory', function($scope, CreateFactory) {

		CreateFactory.getCatches().success( function(data){
			$scope.allFish = data.results;
		});

		$scope.postCatch = function(fish) {
			CreateFactory.postCatch(fish);
		};

	}]);

}());