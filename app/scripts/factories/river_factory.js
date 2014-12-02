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

		var getClosestRiver = function(data, geo){
			var closestRiver;
			var allRivers = data.results;
			var allCoords = [];
			_.each(allRivers, function(river){
				allCoords.push(river.features[0].geometry.coordinates);
			});
			var flattenedCoords = _.flatten(allCoords, 'shallow');
			// Haversine Formula
			var Haversine = function( lat1, lon1, lat2, lon2 ){
				// Convert Degress to Radians
				function Deg2Rad( deg ) {
					return deg * Math.PI / 180;
				}
				var R = 6372.8; // Earth Radius in Kilometers
				var dLat = Deg2Rad(lat2-lat1);
				var dLon = Deg2Rad(lon2-lon1);
				var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(Deg2Rad(lat1)) * Math.cos(Deg2Rad(lat2)) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				var d = R * c;
				// Return Distance in Kilometers
				return d;
			};

			var getDist = [];
			_.each(flattenedCoords, function(coordSet){
				getDist.push(Haversine(coordSet[0], coordSet[1], geo[0], geo[1]));
			});
			var minDist = _.min(getDist);
			var closestRiver = _.findWhere(allRivers, function(river){
				var theseCoords = river.features[0].geometry.coordinates;
				Haversine(theseCoords[0], theseCoords[1], geo[0], geo[1]) === minDist;
			});
			return closestRiver;
		};

		var getAllRivers = function(){
			return $http.get(riverURL, P_HEADERS);
		};

		return {
			getRiverData: getRiverData,
			getRiverCatches: getRiverCatches,
			getRiverWeather: getRiverWeather,
			getClosestRiver: getClosestRiver,
			getAllRivers: getAllRivers
		};

	}]);

}());