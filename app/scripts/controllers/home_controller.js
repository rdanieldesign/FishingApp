(function(){

	angular.module('FishingApp')

	.controller('Home', ['$scope', function($scope) {

		$scope.getImage = function(fish) {
			console.log(fish);
		};

	}]);

}());