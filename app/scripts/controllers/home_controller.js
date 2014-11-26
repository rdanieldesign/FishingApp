(function(){

	angular.module('FishingApp')

	.controller('Home', ['$scope', 'CreateFactory', function($scope, CreateFactory) {

		$scope.getImage = function(fish) {
			CreateFactory.getImage(fish);
		};

	}]);

}());