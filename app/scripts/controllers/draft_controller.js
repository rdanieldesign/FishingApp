(function(){

	angular.module('FishingApp')

	.controller('Draft', ['$scope', 'SingleFactory', 'RiverFactory', 'CreateFactory', function($scope, SingleFactory, RiverFactory, CreateFactory){

		SingleFactory.getSingle().success( function(data){
			$scope.fish = data.results[0];
			var singleGeo = [];
			singleGeo[0] = data.results[0].geoData.latitude;
			singleGeo[1] = data.results[0].geoData.longitude;
			// Get Closest River
			var river = RiverFactory.getClosestRiver(singleGeo);
			$scope.fish.details = river;
			$scope.fish.riverId = river[0].sourceInfo.siteCode[0].value;
			$scope.fish.riverName = river[0].sourceInfo.siteName;
			//Get weather
			CreateFactory.getWeather(singleGeo).success(function(data){
				var weather = data;
				$scope.fish.weather = weather;
			});
			// Get current conditions
			RiverFactory.getRiverConditions(river).then(function(results){
				$scope.fish.conditions = results;
			});
		});

		$scope.saveDraft = function(fish){
			SingleFactory.saveDraft(fish);
		};

		$scope.publish = function(fish){
			SingleFactory.publish(fish);
		};

	}])

}());