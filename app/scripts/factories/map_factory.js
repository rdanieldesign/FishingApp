(function(){

	angular.module('FishingApp')

	.factory('MapFactory', ['$rootScope', '$http', 'P_HEADERS',  function($rootScope, $http, P_HEADERS){

		L.mapbox.accessToken = 'pk.eyJ1IjoicmRhbmllbGRlc2lnbiIsImEiOiJtUGNzTzVrIn0.WN9X0USkwLyWvMcAto3ZiA';

		var startMap = function(){

			var map = L.mapbox.map('map', 'rdanieldesign.kb2o8446')
			.setView([40, -74.50], 9);

		}


		return {
			startMap: startMap
		}

	}]);

}());