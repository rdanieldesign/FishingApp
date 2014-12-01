(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', '$rootScope', '$location', '$cookieStore', function($http, P_HEADERS, $rootScope, $location, $cookieStore){

		var filesURL = 'https://api.parse.com/1/files/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var currentURL = 'https://api.parse.com/1/users/me/';


		var file;
		var geo;

		// Get Image File and Geolocation Data
		$('#imageFile').bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			file = files[0];

			// HTML5 Geolocation
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
					postPic();
				};
				navigator.geolocation.getCurrentPosition(show_map);
			} else {
				alert('HTML5 Geolocation failure');
				exifGeo();
			}
		};

		// Exif Data Backup Geolocation
		var exifGeo = function(){
			EXIF.getData(file, function() {
				console.log(this);
				var aLat = EXIF.getTag(this, 'GPSLatitude');
				var aLong = EXIF.getTag(this, 'GPSLongitude');
				if (aLat && aLong) {
					var latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
					var longRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';
					var fLat = (aLat[0].numerator + (aLat[1].numerator/aLat[1].denominator)/60 + (aLat[2].numerator/aLat[1].denominator)/3600) * (latRef === 'N' ? 1 : -1);
					var fLong = (aLong[0].numerator + (aLong[1].numerator/ aLong[1].denominator)/60 + (aLong[2].numerator/aLong[1].denominator)/3600) * (longRef === 'W' ? -1 : 1);
					// Set variable geo to this images geodata
					geo = {
						latitude: fLat,
						longitude: fLong,
						latitudeRef: latRef,
						longitudeRef: longRef
					};
					alert('EXIF geodata success');
					// Start Drafting Post
					postPic();
				}
				else {
					alert('geodata failure');
				}
			});
		};

		// Post picture and go to drafts
		var postPic = function(){
			var currentFileURL = filesURL + file.name;
			return $http.post(currentFileURL, file, {
				headers: {
					'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
					'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
					'Content-Type': file.type
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
				// Set catches' user
				var currentUser = $cookieStore.get('currentUser');
				// Post Catch to Server
				$http.post(catchURL, {
					"picURL": picURL,
					"geoData": geoData,
					"user": {
						"__type": "Pointer",
						"className": "_User",
						"objectId": currentUser.objectId
					},
					"river": {
						"__type": "Pointer",
						"className": "rivers",
						"objectId": "nYPd56jbab"
					},
					status: 'draft'
				}, P_HEADERS)
				.success( function(data){
					var draftId = data.objectId;
					alert('Ready to go to drafts');
					$location.path('/draft/' + draftId);
				});
			});
		};

		// Get all catches
		var getCatches = function(){
			return $http.get(catchURL, P_HEADERS);
		};

		// Get all published catches
		var getPublished = function(){
			var params = '?where={"status":"published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		return {
			getCatches: getCatches,
			getPublished: getPublished
		}

	}]);

}());