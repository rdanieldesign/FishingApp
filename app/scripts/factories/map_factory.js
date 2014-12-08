(function(){

	angular.module('FishingApp')

	.factory('MapFactory', ['$http', '$rootScope', 'P_HEADERS', '$routeParams', function($http, $rootScope, P_HEADERS, $routeParams){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var riverURL = 'https://api.parse.com/1/classes/rivers/';

		L.mapbox.accessToken = 'pk.eyJ1IjoicmRhbmllbGRlc2lnbiIsImEiOiJtUGNzTzVrIn0.WN9X0USkwLyWvMcAto3ZiA';


		var startMap = function(){

			$rootScope.map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([39.656, -97.295], 5);

			// // Query Catches and drop marker for each
			// $http.get(catchURL, P_HEADERS).success(function(data){
			// 	_.each(data.results, function(x){
			// 		L.marker([x.geoData.latitude, x.geoData.longitude]).addTo($rootScope.map);
			// 	});
			// });

			// Get Rivers from rivers.js and populate map
			// $http.get(riverURL, P_HEADERS).success(function(data){
			// 	var rivers = data.results;
			// 	_.each(rivers, function(river){
			// 		var coordinates = river.features[0].geometry.coordinates;
			// 		var options = river.features[0].properties;
			// 		var riverLine = L.polyline(coordinates, options).bindPopup('<a href="#/river/' + river.objectId + '">' + options.title + '</a>').addTo($rootScope.map);
			// 	});
			// });

			// // zoom the map to the polyline
			// map.fitBounds(riverLine.getBounds());

		};

		var userMap = function(user){
			$rootScope.map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([32.986, -82.782], 7);
			var markers = [];
			// Query Catches and drop marker for each
			var params = '?where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}}';
			$http.get(catchURL + params, P_HEADERS).success(function(data){
				_.each(data.results, function(x){
					markers.push(L.marker([x.geoData.latitude, x.geoData.longitude]).bindPopup('<img src="' + x.picURL + '" style="width: 120px;">'));
				});
				$rootScope.group = L.layerGroup(markers);
				$rootScope.group.addTo($rootScope.map);
			});
		};

		var updateMap = function(catches){
			if($rootScope.map && $rootScope.group){
				var map = $rootScope.map;
				map.removeLayer($rootScope.group);
				var markers = [];
				_.each(catches, function(x){
					markers.push(L.marker([x.geoData.latitude, x.geoData.longitude]).bindPopup('<img src="' + x.picURL + '" style="width: 120px;">'));
				});
				$rootScope.group = L.layerGroup(markers);
				$rootScope.group.addTo(map);
			};
		};

		var startRiverMap = function(){
			var params = $routeParams.id;
			var data = _.pairs($rootScope.nsgs);
			var singleRiver = _.find(data, function(x){
				return x[1][0].sourceInfo.siteCode[0].value === $routeParams.id;
			});
			var coords = singleRiver[1][0].sourceInfo.geoLocation.geogLocation;
			var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446').setView([coords.latitude, coords.longitude], 12);
			var riverCoords = L.marker([coords.latitude, coords.longitude]).addTo(map);;
		};


		return {
			startMap: startMap,
			startRiverMap: startRiverMap,
			userMap: userMap,
			updateMap: updateMap
		}

	}]);

}());