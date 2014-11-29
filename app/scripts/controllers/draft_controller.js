(function(){

	angular.module('FishingApp')

	.controller('Draft', ['$scope', 'SingleFactory', function($scope, SingleFactory){

		SingleFactory.getSingle().success( function(data){
			console.log(data);
			$scope.fish = data.results[0];
		});

	}])

}());