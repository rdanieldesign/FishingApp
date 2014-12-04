(function(){

	angular.module('FishingApp')

	.factory('RiverFactory', ['$http', '$routeParams', 'P_HEADERS', 'NSGS', '$rootScope', function($http, $routeParams, P_HEADERS, NSGS, $rootScope){

		var riverID = $routeParams.id;
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var weatherURL = 'http://api.openweathermap.org/data/2.5/weather';
		var weatherKey = '&units=imperial&APPID=480997352b669d76eb0919fd6cf75263';

		var getRiverData = function(){
			return $http.get(riverURL + $routeParams.id, P_HEADERS);
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
			var getDist = [];
			_.each(flattenedCoords, function(coordSet){
				getDist.push($rootScope.haversine(coordSet[0], coordSet[1], geo[0], geo[1]));
			});
			var minDist = _.min(getDist);
			var closestRiver = _.findWhere(allRivers, function(river){
				var theseCoords = river.features[0].geometry.coordinates;
				$rootScope.haversine(theseCoords[0], theseCoords[1], geo[0], geo[1]) === minDist;
			});
			return closestRiver;
		};

		var getAllRivers = function(){
			return $http.get(riverURL, P_HEADERS);
		};

		var createRivers = function(river){
			_.each(rivers, function(river){
				var coordinates = river.features[0].geometry.coordinates;
				_.each(coordinates, function(coordSet){
					var lon = coordSet[0];
					var lat = coordSet[1];
					coordSet[0] = lat;
					coordSet[1] = lon;
				});
				$http.post(riverURL, river, P_HEADERS);
			});
		};

		var getRiverConditions = function(singleRiver){
			var allCoords = singleRiver.features[0].geometry.coordinates;
			var coords = allCoords[Math.round(allCoords.length/2)];
			// Get the closest recorded conditions
			var closest = _.min($rootScope.nsgs, function(river){
				var riverGeo = river[0].sourceInfo.geoLocation.geogLocation;
				return $rootScope.haversine(riverGeo.latitude, riverGeo.longitude, coords[0], coords[1]);
			});
			// Store closest info in object
			var info = {};
			_.each(closest, function(condition){
				if(condition.variable.oid == 45807197){
					info.discharge = condition;
				}
				else if(condition.variable.oid == 45807202){
					info.gageHeight = condition;
				}
				else if(condition.variable.oid == 45807042){
					info.waterTemp = condition;
				}
				else if(condition.variable.oid == 45807073){
					info.airTemp = condition;
				}
			});
			return info;
		};

		var getNSGS = function(){
			$http.get(NSGS).success(function(data){
				var array = data.value.timeSeries;
				var grouped = _.groupBy(array, function(x){
					return x.sourceInfo.siteName;
				});
				$rootScope.nsgs = grouped;
			});
		};

		return {
			getRiverData: getRiverData,
			getRiverCatches: getRiverCatches,
			getRiverWeather: getRiverWeather,
			getClosestRiver: getClosestRiver,
			getAllRivers: getAllRivers,
			createRivers: createRivers,
			getRiverConditions: getRiverConditions,
			getNSGS: getNSGS
		};

	}]);

}());