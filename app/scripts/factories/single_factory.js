(function(){

	angular.module('FishingApp')

	.factory('SingleFactory', [ '$http', '$routeParams', 'P_HEADERS', '$location', function($http, $routeParams, P_HEADERS, $location){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var singleId = $routeParams.fish;

		var getSingle = function(){
			var params = '?where={"objectId":"'+ $routeParams.fish + '"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var saveDraft = function(fish){
			$http.put(catchURL + $routeParams.fish, fish, P_HEADERS)
			.success( function(){
				$location.path('/profile');
			});
		};

		var publish = function(fish){
			fish.status = "published";
			$http.put(catchURL + $routeParams.fish, fish, P_HEADERS)
			.success( function(){
				$http.put(riverURL + fish.river.objectId, {
					"catches": {
						"__op":"AddRelation",
						"objects": [{
							"__type": "Pointer",
							"className": "catches",
							"objectId": fish.objectId
						}]
					}
				}, P_HEADERS).success(function(){
					$location.path('/maps');
				});
			});
		};

		return {
			getSingle: getSingle,
			saveDraft: saveDraft,
			publish: publish
		}

	}])

}());