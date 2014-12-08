(function(){

	angular.module('FishingApp')

	.factory('RiverFactory', ['$http', '$routeParams', 'P_HEADERS', 'NSGS', '$rootScope', '$q', function($http, $routeParams, P_HEADERS, NSGS, $rootScope, $q){

		var riverID = $routeParams.id;
		var riverURL = 'https://api.parse.com/1/classes/rivers/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var weatherURL = 'http://api.openweathermap.org/data/2.5/weather';
		var weatherKey = '&units=imperial&APPID=480997352b669d76eb0919fd6cf75263';

		var getRiverData = function(){
			return $q(function(resolve){
				var data = _.pairs($rootScope.nsgs);
				var singleRiver = _.find(data, function(x){
					return x[1][0].sourceInfo.siteCode[0].value === $routeParams.id;
				});
				resolve(singleRiver);
			});
		};

		var getRiverCatches = function(){
			var params = '?include=user&where={"riverId": "' + $routeParams.id + '", "status": "published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getRiverWeather = function(river){
			var coords = river[1][0].sourceInfo.geoLocation.geogLocation;
			var params = '?lat='+ coords[0] +'&lon='+ coords[1];
			return $http.get(weatherURL + params + weatherKey);
		};

		var getClosestRiver = function(data, geo){
			var closestRiver;
			var allRivers = _.pairs($rootScope.nsgs);
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
			// return $http.get(riverURL, P_HEADERS);
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
			var info = {};
			return $q(function(resolve){
			_.each(singleRiver[1], function(condition){
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

			resolve(info);
		});
	};

		var getNSGS = function(){
			return $q(function(resolve){
				$http.get(NSGS).success(function(data){
					var array = data.value.timeSeries;
					var grouped = _.groupBy(array, function(x){
						return x.sourceInfo.siteName;
					});
					$rootScope.nsgs = grouped;
					resolve($rootScope.nsgs);
					console.log($rootScope.nsgs);
					console.log(_.pairs($rootScope.nsgs));
				});
			})
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