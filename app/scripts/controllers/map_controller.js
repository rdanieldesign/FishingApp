(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', 'RiverFactory', '$rootScope', function($scope, MapFactory, RiverFactory, $rootScope) {

		MapFactory.startMap();

		$scope.rivers = _.pairs($rootScope.nsgs);
		console.log($scope.rivers);

		// Uncommenting the below function will create all rivers in rivers.js
		// RiverFactory.createRivers();

	}]);

}());