(function(){

	angular.module('FishingApp')

	.factory('RiverFactory', ['$http', '$routeParams', 'P_HEADERS', function($http, $routeParams, P_HEADERS){

		var riverID = $routeParams.id;
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';

		var getRiverData = function(){
			var params = '?&where={"$relatedTo":{"object":{"__type":"Relation","className":"rivers","objectId":"'+ riverID +'"},"key":"catches"}}';
			return $http.get(riverURL + riverID + params, P_HEADERS);
		};

		var getRiverCatches = function(){
			var params = '?where={"$relatedTo":{"object":{"__type":"Pointer","className":"rivers","objectId":"'+ riverID +'"},"key":"catches"}}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		return {
			getRiverData: getRiverData,
			getRiverCatches: getRiverCatches
		};

	}]);

}());