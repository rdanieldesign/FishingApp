(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', '$rootScope', '$location', '$cookieStore', 'WEATHER', 'WEATHER_KEY', 'FILES', 'CATCHES', 'CURRENT_USER', function($http, P_HEADERS, $rootScope, $location, $cookieStore, WEATHER, WEATHER_KEY, FILES, CATCHES, CURRENT_USER){

		var geo;
		var weather;

		// Get Image File and Geolocation Data on input field change
		$('#imageFile').bind('change', function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			$rootScope.file = files[0];
			// HTML5 Geolocation
			$rootScope.$broadcast("loader_show");
			getGeo();
		});

		// HTML5 Geolocation
		var getGeo = function get_location() {
			if (Modernizr.geolocation) {
				var show_map = function(position) {
					var latitude = position.coords.latitude;
					var longitude = position.coords.longitude;
					geo = {
						"latitude": latitude,
						"longitude": longitude,
					};
					alert('Got geolocation!');
					$rootScope.$broadcast("loader_hide");
					postPic();
				};
				navigator.geolocation.getCurrentPosition(show_map);
			} else {
				alert('HTML5 Geolocation failure');
				// exifGeo();
			}
		};

		// Exif Data Backup Geolocation
		// var exifGeo = function(){
		// 	EXIF.getData(file, function() {
		// 		console.log(this);
		// 		var aLat = EXIF.getTag(this, 'GPSLatitude');
		// 		var aLong = EXIF.getTag(this, 'GPSLongitude');
		// 		if (aLat && aLong) {
		// 			var latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
		// 			var longRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';
		// 			var fLat = (aLat[0].numerator + (aLat[1].numerator/aLat[1].denominator)/60 + (aLat[2].numerator/aLat[1].denominator)/3600) * (latRef === 'N' ? 1 : -1);
		// 			var fLong = (aLong[0].numerator + (aLong[1].numerator/ aLong[1].denominator)/60 + (aLong[2].numerator/aLong[1].denominator)/3600) * (longRef === 'W' ? -1 : 1);
		// 			// Set variable geo to this images geodata
		// 			geo = {
		// 				latitude: fLat,
		// 				longitude: fLong,
		// 				latitudeRef: latRef,
		// 				longitudeRef: longRef
		// 			};
		// 			alert('EXIF geodata success');
		// 			// Start Drafting Post
		// 			postPic();
		// 		}
		// 		else {
		// 			alert('geodata failure');
		// 		}
		// 	});
		// };

		// With Weather API
		var getWeather = function(singleGeo){
			var coords = '?lat='+ singleGeo[0] +'&lon='+ singleGeo[1];
			return $http.get(WEATHER + coords + WEATHER_KEY);
		};

		// With NSGS
		var getConditions = function(singleGeo){
			// Get the closest recorded conditions
			var closest = _.min($rootScope.nsgs, function(river){
				var riverGeo = river[0].sourceInfo.geoLocation.geogLocation;
				return $rootScope.haversine(riverGeo.latitude, riverGeo.longitude, singleGeo[0], singleGeo[1]);
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



		// Post picture and go to drafts
		var postPic = function(){
			var currentFileURL = FILES + $rootScope.file.name;
			// Set catches' user
			var currentUser = $cookieStore.get('currentUser');
			$http.post(currentFileURL, $rootScope.file, {
				headers: {
					'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
					'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
					'Content-Type': $rootScope.file.type
				}
			},
			{
				processData: false,
				contentType: false,
			}).
			success(function(data){
				// Set Catch Image
				var picURL = data.url;
				// Set Catch geodata
				var geoData = geo;
				// Post Catch to Server
				$http.post(CATCHES, {
					"picURL": picURL,
					"geoData": geoData,
					"user": {
						"__type": "Pointer",
						"className": "_User",
						"objectId": currentUser.objectId
					},
					"status": 'draft'
				}, P_HEADERS)
				.success( function(data){
					console.log(data);
					var draftId = data.objectId;
					alert('Ready to go to drafts');
					$location.path('/draft/' + draftId);
				});
			});
		};

		// Get all catches
		var getCatches = function(){
			return $http.get(CATCHES, P_HEADERS);
		};

		// Get all published catches
		var getPublished = function(){
			var params = '?include=user&where={"status":"published"}';
			return $http.get(CATCHES + params, P_HEADERS);
		};

		// Haversine Formula
		var haversine = function( lat1, lon1, lat2, lon2 ){
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

		return {
			getCatches: getCatches,
			getPublished: getPublished,
			getWeather: getWeather,
			getConditions: getConditions,
			haversine: haversine
		}

	}]);

}());