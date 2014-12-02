(function(){

	angular.module('FishingApp')

	.controller('River', ['$scope', 'RiverFactory', 'MapFactory', function($scope, RiverFactory, MapFactory) {

		RiverFactory.getRiverData().success(function(data){
			RiverFactory.getRiverWeather(data).success(function(weather){
				var currentTemp = weather.main.temp;
				$scope.currentTemp = currentTemp;
			});
			RiverFactory.getRiverCatches().success( function(data){
				$scope.riverCatches = data.results;
			});
			$scope.river = data;
			$scope.riverProps = data.features[0].properties;
			// Initiate slider
			$('#tempSlider').noUiSlider({
				start: [20, 80],
				connect: true,
				margin: 10,
				range: {
					'min': 0,
					'max': 100
				}
			});
			$('#tempSlider').Link('upper').to($('#tempSlider_high'));
			$('#tempSlider').Link('lower').to($('#tempSlider_low'));
			$scope.low = 20;
			$scope.high = 80;
		});

		$('#tempSlider').on('slide', function(){
			$scope.low = $('#tempSlider').val()[0];
			$scope.high = $('#tempSlider').val()[1];
			$scope.$apply();
		});

		$scope.tempFilter = function (fish) {
			return fish.weather.main.temp >= $scope.low && fish.weather.main.temp <= $scope.high;
		};

		MapFactory.startRiverMap();

	}]);

}());