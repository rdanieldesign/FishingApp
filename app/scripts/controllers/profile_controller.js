(function(){

	angular.module('FishingApp')

	.controller('Profile', ['$scope', '$rootScope', 'UserFactory', 'MapFactory', '$location', function($scope, $rootScope, UserFactory, MapFactory, $location){

		UserFactory.getThisUser().success( function(data){
			MapFactory.userMap(data);
			$scope.user = data;
		});

		UserFactory.loadUserPublished().success( function(data){
			$scope.myPublished = data.results;
		});

		UserFactory.loadUserDrafts().success( function(data){
			$scope.myDrafts = data.results;
		});

		// Map Filtering
		$scope.$watch('filteredCatches', function() {
			MapFactory.updateMap($scope.filteredCatches);
		}, true);


		// Edit draft
		$scope.editDraft = function(draft){
			var draftId = draft.objectId;
			$location.path('/draft/' + draftId);
		};

		// Filters
		$scope.riverFilter = function(fish) {
			if(fish.riverName && $scope.riverSwitch){
				return fish.riverName;
			} else {
				return fish;
			}
		};

		$scope.setRiver = function(river){
			if($scope.riverSwitch){
				$scope.riverFilter =  river;
			} else {
				return;
			}
		};

		$scope.tempFilter = function(fish) {
			if(fish.weather && $scope.tempSwitch){
				return Number(fish.weather.main.temp) >= $scope.airLow && Number(fish.weather.main.temp) <= $scope.airHigh;
			} else {
				return fish;
			}
		};

		$scope.levelFilter = function(fish) {
			if(fish.conditions.gageHeight && $scope.levelSwitch){
				return Number(fish.conditions.gageHeight.values[0].value[0].value) >= $scope.levelLow && Number(fish.conditions.gageHeight.values[0].value[0].value) <= $scope.levelHigh;
			} else {
				return fish;
			}
		};

		$scope.waterFilter = function(fish) {
			if(fish.conditions.waterTemp && $scope.waterSwitch){
				return Number(fish.conditions.waterTemp.values[0].value[0].value) >= $scope.waterLow && Number(fish.conditions.waterTemp.values[0].value[0].value) <= $scope.waterHigh;
			} else {
				return fish;
			}
		};

		$scope.flowFilter = function(fish) {
			if(fish.conditions.discharge && $scope.flowSwitch){
				return Number(fish.conditions.discharge.values[0].value[0].value) >= $scope.flowLow && Number(fish.conditions.discharge.values[0].value[0].value) <= $scope.flowHigh;
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
			margin: 1,
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

		// Initiate Water Temp slider
		$('#waterSlider').noUiSlider({
			start: [0, 100],
			connect: true,
			margin: 5,
			range: {
				'min': 0,
				'max': 100
			}
		})
		.Link('upper').to($('#waterSlider_high'))
		.Link('lower').to($('#waterSlider_low'))
		.on('slide', function(){
			$scope.waterLow = $('#waterSlider').val()[0];
			$scope.waterHigh = $('#waterSlider').val()[1];
			$scope.$apply();
		});

		// Initiate Flow slider
		$('#flowSlider').noUiSlider({
			start: [0, 1000],
			connect: true,
			margin: 5,
			range: {
				'min': 0,
				'max': 1000
			}
		})
		.Link('upper').to($('#flowSlider_high'))
		.Link('lower').to($('#flowSlider_low'))
		.on('slide', function(){
			$scope.flowLow = $('#flowSlider').val()[0];
			$scope.flowHigh = $('#flowSlider').val()[1];
			$scope.$apply();
		});

		$scope.airLow = 20;
		$scope.airHigh = 80;
		$scope.levelLow = 0;
		$scope.levelHigh = 100;
		$scope.waterLow = 0;
		$scope.waterHigh = 100;
		$scope.flowLow = 0;
		$scope.flowHigh = 1000;


	}])

}());