(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', 'RiverFactory', function($scope, MapFactory, RiverFactory) {

		MapFactory.startMap();

	}]);

}());