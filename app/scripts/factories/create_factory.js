(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', '$rootScope', function($http, P_HEADERS, $rootScope){

		var filesURL = 'https://api.parse.com/1/files/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';

		var file;
		var geo;

		// Get Image File and Geolocation Data
		$('#imageFile').bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			file = files[0];
			// Geolocation EXIF data
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
				}
				else {
					console.log('geodata failure');
				}
			});
		});

		var getCatches = function(){
			return $http.get(catchURL, P_HEADERS);
		};

		var postCatch = function(fish){
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
			})
			.success( function(data){
				// Set Catch Image
				fish.picURL = data.url;
				// Set Catch geodata
				fish.geoData = geo;
				// Post Catch to Server
				$http.post(catchURL, fish, P_HEADERS)
				.success( function(){
					console.log('done');
				});
			})
			.error( function(data) {
				var obj = jQuery.parseJSON(data);
				alert(obj.error);
			});

		};

		return {
			postCatch: postCatch,
			getCatches: getCatches
		}

	}]);

}());