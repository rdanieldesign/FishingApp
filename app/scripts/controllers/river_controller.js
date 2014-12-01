(function(){

	angular.module('FishingApp')

	.controller('River', ['$scope', 'RiverFactory', 'MapFactory', function($scope, RiverFactory, MapFactory) {

		RiverFactory.getRiverData().success( function(data){
			$scope.river = data;
			$scope.riverProps = data.features[0].properties;
			$('#tempSlider').noUiSlider({
				start: [20, 80],
				connect: true,
				margin: 10,
				range: {
					'min': 0,
					'max': 120
				}
			});
			$('#tempSlider').Link('upper').to($('#tempSlider_high'));
			$('#tempSlider').Link('lower').to($('#tempSlider_low'));
			var temp = $('#tempSlider').val();
			console.log(temp);
		});

		RiverFactory.getRiverCatches().success( function(data){
			$scope.riverCatches = data.results;
		});

		MapFactory.startRiverMap();

	}]);

}());