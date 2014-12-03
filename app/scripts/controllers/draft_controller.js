(function(){

	angular.module('FishingApp')

	.controller('Draft', ['$scope', 'SingleFactory', 'RiverFactory', function($scope, SingleFactory, RiverFactory){

		SingleFactory.getSingle().success( function(data){
			$scope.fish = data.results[0];
			var singleGeo = [];
			singleGeo[0] = data.results[0].geoData.latitude;
			singleGeo[1] = data.results[0].geoData.longitude;
			var river;
			RiverFactory.getAllRivers().success(function(data){
				river = RiverFactory.getClosestRiver(data, singleGeo);
				$scope.fish.river = {
					"__type": "Pointer",
					"className": "rivers",
					"objectId": river.objectId
				};
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