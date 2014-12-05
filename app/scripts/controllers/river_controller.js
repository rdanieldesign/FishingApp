(function(){

	angular.module('FishingApp')

	.controller('River', ['$scope', 'RiverFactory', 'MapFactory', '$rootScope', function($scope, RiverFactory, MapFactory, $rootScope) {

		RiverFactory.getRiverData().success(function(data){
			$scope.river = data;
			$scope.riverProps = data.features[0].properties;

			RiverFactory.getNSGS().then(function(){
				console.log($rootScope.nsgs);
				RiverFactory.getRiverConditions(data).then(function(results){
					$scope.currentInfo = results;
					console.log($scope.currentInfo);
					$scope.tempFilter = function (fish) {
						return fish.weather.main.temp >= $scope.low && fish.weather.main.temp <= $scope.high;
					};
					// console.log($scope.currentInfo.discharge.values[0].value[0].value);
				});
			});
			// RiverFactory.getRiverWeather(data).success(function(weather){
			// 	var currentTemp = weather.main.temp;
			// 	$scope.currentTemp = currentTemp;
			// });

			RiverFactory.getRiverCatches().success( function(data){
				console.log(data);
				$scope.riverCatches = data.results;
				// console.log($scope.riverCatches);
			});

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

		MapFactory.startRiverMap();

	}]);

}());