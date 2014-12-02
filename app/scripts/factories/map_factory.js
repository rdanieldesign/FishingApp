(function(){

	angular.module('FishingApp')

	.factory('MapFactory', ['$http', 'P_HEADERS', '$routeParams', function($http, P_HEADERS, $routeParams){

		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var riverURL = 'https://api.parse.com/1/classes/rivers/';

		L.mapbox.accessToken = 'pk.eyJ1IjoicmRhbmllbGRlc2lnbiIsImEiOiJtUGNzTzVrIn0.WN9X0USkwLyWvMcAto3ZiA';


		var startMap = function(){

			var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([39.656, -97.295], 5);
			
			// Query Catches and drop marker for each
			$http.get(catchURL, P_HEADERS).success(function(data){
				_.each(data.results, function(x){
					L.marker([x.geoData.latitude, x.geoData.longitude]).addTo(map);
				});
			});

			// Get Rivers from rivers.js and populate map
			$http.get(riverURL, P_HEADERS).success(function(data){
				var rivers = data.results;
				_.each(rivers, function(river){
					var coordinates = river.features[0].geometry.coordinates;
					var options = river.features[0].properties;
					var riverLine = L.polyline(coordinates, options).bindPopup('<a href="#/river/' + river.objectId + '">' + options.title + '</a>').addTo(map);
				});
			});

			// // zoom the map to the polyline
			// map.fitBounds(riverLine.getBounds());

		};

		var startRiverMap = function(){
			var params = $routeParams.id;
			$http.get(riverURL + params, P_HEADERS).success(function(data){
				var coordinates = data.features[0].geometry.coordinates;
				var options = data.features[0].properties;
				var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446');
				var polyline = L.polyline(coordinates, options).addTo(map);
				// zoom the map to the polyline
				map.fitBounds(polyline.getBounds());
			});
		};


		return {
			startMap: startMap,
			startRiverMap: startRiverMap
		}

	}]);

}());