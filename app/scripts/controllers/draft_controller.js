(function(){

	angular.module('FishingApp')

	.controller('Draft', ['$scope', 'SingleFactory', 'RiverFactory', 'CreateFactory', function($scope, SingleFactory, RiverFactory, CreateFactory){

		SingleFactory.getSingle().success( function(data){
			$scope.fish = data.results[0];
			var singleGeo = [];
			singleGeo[0] = data.results[0].geoData.latitude;
			singleGeo[1] = data.results[0].geoData.longitude;
			// RiverFactory.getAllRivers().success(function(data){
				var river = RiverFactory.getClosestRiver(data, singleGeo);
				$scope.fish.river = {
					"__type": "Pointer",
					"className": "rivers",
					"objectId": river.objectId
				};
			// });
			CreateFactory.getWeather(singleGeo).success(function(data){
				var weather = data;
				$scope.fish.weather = weather;
			});
			// Get current conditions
			var conditions = CreateFactory.getConditions(singleGeo);
			$scope.fish.conditions = conditions;
		});

		$scope.saveDraft = function(fish){
			SingleFactory.saveDraft(fish);
		};

		$scope.publish = function(fish){
			SingleFactory.publish(fish);
		};

	}])

}());