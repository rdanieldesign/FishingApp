(function(){

	angular.module('FishingApp')

	.factory('RiverFactory', ['$http', '$routeParams', 'P_HEADERS', function($http, $routeParams, P_HEADERS){

		var riverID = $routeParams.id;
		var riverURL = 'https://api.parse.com/1/classes/rivers/';

		var getRiverData = function(){
			console.log(riverID);
			var params = '?where={"$relatedTo":{"object":[{"__type":"Pointer","className":"catches"},"key":"catches"}}';
			return $http.get(riverURL + riverID + params, P_HEADERS);
		};

		return {
			getRiverData: getRiverData
		};

	}]);

}());