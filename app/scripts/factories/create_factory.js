(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', function($http){

		var filesURL = 'https://api.parse.com/1/files/';

		var file;

		$('#imageFile').bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			file = files[0];
		});


		var getImage = function(fish){

			var currentFileURL = filesURL + file.name;
			console.log(currentFileURL);

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
				console.log(data);
				open(data.url)
			})
			.error( function(data) {
				var obj = jQuery.parseJSON(data);
				alert(obj.error);
			});

			// open(file.name, true))
		};

		return {
			getImage: getImage
		}

	}]);

}());