(function(){

	angular.module('FishingApp')

	.controller('River', ['$scope', 'RiverFactory', 'MapFactory', '$rootScope', function($scope, RiverFactory, MapFactory, $rootScope) {

		RiverFactory.getRiverData().success(function(data){

			$scope.river = data;
			$scope.riverProps = data.features[0].properties;
			var airTemperature;

			RiverFactory.getNSGS().then(function(){
				RiverFactory.getRiverConditions(data).then(function(results){
					$scope.currentInfo = results;
					$scope.waterFlow = results.discharge.values[0].value[0].value;
					$scope.waterLevel = results.gageHeight.values[0].value[0].value;
					if(results.airTemp){
						airTemperature = results.airTemp.values[0].value[0].value;
					};
				});
			});

			RiverFactory.getRiverWeather(data).success(function(weather){
				if(!airTemperature){
					airTemperature = weather.main.temp;
					$scope.currentTemp = airTemperature;
				};
			});
		});

		RiverFactory.getRiverCatches().success( function(data){
			$scope.riverCatches = data.results;
			console.log($scope.riverCatches);
		});

		$scope.tempFilter = function (fish) {
			if(fish.weather && $scope.tempSwitch){
				return fish.weather.main.temp >= $scope.airLow && fish.weather.main.temp <= $scope.airHigh;
			} else {
				return fish;
			}
		};

		$scope.levelFilter = function (fish) {
			if(fish.conditions.gageHeight && $scope.levelSwitch){
				return fish.conditions.gageHeight.values[0].value[0].value >= $scope.levelLow && fish.conditions.gageHeight.values[0].value[0].value <= $scope.levelHigh;
			} else {
				return fish;
			}
		};

		// Initiate Temp slider
		$('#tempSlider').noUiSlider({
			start: [20, 80],
			connect: true,
			margin: 10,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#tempSlider_high'))
		.Link('lower').to($('#tempSlider_low'))
		.on('slide', function(){
			$scope.airLow = $('#tempSlider').val()[0];
			$scope.airHigh = $('#tempSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Level slider
		$('#levelSlider').noUiSlider({
			start: [0, 100],
			connect: true,
			margin: 10,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#levelSlider_high'))
		.Link('lower').to($('#levelSlider_low'))
		.on('slide', function(){
			$scope.levelLow = $('#levelSlider').val()[0];
			$scope.levelHigh = $('#levelSlider').val()[1];
			$scope.$apply();
		});

		$scope.airLow = 20;
		$scope.airHigh = 80;
		$scope.levelLow = 0;
		$scope.levelHigh = 100;

		MapFactory.startRiverMap();

	}]);

}());