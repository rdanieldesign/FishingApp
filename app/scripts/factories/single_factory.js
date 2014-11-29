(function(){

	angular.module('FishingApp')

	.factory('SingleFactory', [ '$http', '$routeParams', 'P_HEADERS',  function($http, $routeParams, P_HEADERS){

		var catchURL = 'https://api.parse.com/1/classes/catches/';

		var getSingle = function(){
			var singleId = $routeParams.fish;
			var params = '?where={"objectId":"'+ singleId + '"}';
			return $http.get(catchURL + params, P_HEADERS);
		}

		return {
			getSingle: getSingle
		}

	}])

}());