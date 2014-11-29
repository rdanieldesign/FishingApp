(function(){

	angular.module('FishingApp')

	.factory('SingleFactory', [ '$http', '$routeParams', 'P_HEADERS',  function($http, $routeParams, P_HEADERS){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var singleId = $routeParams.fish;

		var getSingle = function(){
			var params = '?where={"objectId":"'+ singleId + '"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var saveDraft = function(fish){
			return $http.put(catchURL + singleId, fish, P_HEADERS);
		};

		var publish = function(fish){
			fish.status = "published";
			return $http.put(catchURL + singleId, fish, P_HEADERS);
		};

		return {
			getSingle: getSingle,
			saveDraft: saveDraft,
			publish: publish
		}

	}])

}());