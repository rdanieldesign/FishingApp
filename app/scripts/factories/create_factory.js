(function(){

	angular.module('FishingApp')

	.factory('CreateFactory', ['$http', 'P_HEADERS', function($http, P_HEADERS){

		var filesURL = 'https://api.parse.com/1/files/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';

		var file;

		$('#imageFile').bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			// Our file var now holds the selected file
			file = files[0];
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
				$http.post(catchURL, fish, P_HEADERS)
				.success( function(){
					console.log('catch added');
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