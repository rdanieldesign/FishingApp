(function(){

	angular.module('FishingApp')

	.factory('RiverFactory', ['$http', '$routeParams', 'P_HEADERS', function($http, $routeParams, P_HEADERS){

		var riverID = $routeParams.id;
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var weatherURL = 'http://api.openweathermap.org/data/2.5/weather';
		var weatherKey = '&units=imperial&APPID=480997352b669d76eb0919fd6cf75263';

		var getRiverData = function(){
			return $http.get(riverURL + riverID, P_HEADERS);
		};

		var getRiverCatches = function(){
			var params = '?where={"$relatedTo":{"object":{"__type":"Pointer","className":"rivers","objectId":"'+ riverID +'"},"key":"catches"}}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getRiverWeather = function(river){
			var coordsArray = river.features[0].geometry.coordinates;
			var coords = coordsArray[Math.round(coordsArray.length/2)];
			var params = '?lat='+ coords[0] +'&lon='+ coords[1];
			return $http.get(weatherURL + params + weatherKey);
		};

		return {
			getRiverData: getRiverData,
			getRiverCatches: getRiverCatches,
			getRiverWeather: getRiverWeather
		};

	}]);

}());