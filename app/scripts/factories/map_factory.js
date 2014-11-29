(function(){

	angular.module('FishingApp')

	.factory('MapFactory', ['$http', 'P_HEADERS', function($http, P_HEADERS){

		var catchURL = 'https://api.parse.com/1/classes/catches/';

		L.mapbox.accessToken = 'pk.eyJ1IjoicmRhbmllbGRlc2lnbiIsImEiOiJtUGNzTzVrIn0.WN9X0USkwLyWvMcAto3ZiA';

		var startMap = function(){

			var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([39.656, -97.295], 5);

			// Query Catches and drop marker for each
			$http.get(catchURL, P_HEADERS).success(function(data){
				_.each(data.results, function(x){
					console.log(x.geoData.latitude);
					console.log(x.geoData.longitude);
					L.marker([x.geoData.latitude, x.geoData.longitude]).addTo(map);
				});
			});

		}


		return {
			startMap: startMap
		}

	}]);

}());