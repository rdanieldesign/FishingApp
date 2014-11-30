(function(){

	angular.module('FishingApp')

	.controller('Map', ['$scope', 'MapFactory', function($scope, MapFactory) {

		MapFactory.startMap();

	}]);

}());