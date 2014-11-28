(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', function($http, P_HEADERS){

		var filesURL = 'https://api.parse.com/1/files/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';

		var file;
		var geo;

		$('#imageFile').bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			file = files[0];

			EXIF.getData(file, function() {
				console.log(this);
				var aLat = EXIF.getTag(this, 'GPSLatitude');
				var aLong = EXIF.getTag(this, 'GPSLongitude');
				if (aLat && aLong) {
					var latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
					var longRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';
					var fLat = (aLat[0].numerator + aLat[1].numerator/aLat[1].denominator + aLat[2].numerator/aLat[1].denominator) * (latRef === 'N' ? 1 : -1);
					var fLong = (aLong[0].numerator + aLong[1].numerator/ aLong[1].denominator + aLong[2].numerator/aLong[1].denominator) * (longRef === 'W' ? -1 : 1);

					geo = {
						latitude: fLat,
						longitude: fLong,
						latitudeRef: latRef,
						longitudeRef: longRef
					};
				}
				else {
					console.log('failure');
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
				fish.picURL = data.url;
				fish.geoData = geo;
				$http.post(catchURL, fish, P_HEADERS)
				.success( function(){
					console.log(geo);
				});
			})
			.error( function(data) {
				var obj = jQuery.parseJSON(data);
				alert(obj.error);
			});;

		};

		return {
			postCatch: postCatch,
			getCatches: getCatches
		}

	}]);

}());