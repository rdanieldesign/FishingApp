(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', 'RiverFactory', function($scope, MapFactory, RiverFactory) {

		MapFactory.startMap();

		RiverFactory.getAllRivers().success(function(data){
			$scope.rivers = data.results;
		});

		// Uncommenting the below function will create all rivers in rivers.js
		// RiverFactory.createRivers();

	}]);

}());