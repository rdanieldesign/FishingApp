(function(){

	angular.module('FishingApp')

	.controller('River', ['$scope', 'RiverFactory', function($scope, RiverFactory) {

		RiverFactory.getRiverData().success( function(data){
			console.log(data);
			$scope.river = data;
			$scope.riverProps = data.features[0].properties;
		});

	}]);

}());