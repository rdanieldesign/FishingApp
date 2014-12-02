(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', 'RiverFactory', function($scope, MapFactory, RiverFactory) {

		MapFactory.startMap();

		RiverFactory.getAllRivers().success(function(data){
			$scope.rivers = data.results;
		});

		// $scope.search.on('change', function(){
		// 	$scope.$apply();
		// });

	}]);

}());