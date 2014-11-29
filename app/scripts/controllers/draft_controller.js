(function(){

	angular.module('FishingApp')

	.controller('Draft', ['$scope', 'SingleFactory', function($scope, SingleFactory){

		SingleFactory.getSingle().success( function(data){
			console.log(data);
			$scope.fish = data.results[0];
		});

		$scope.saveDraft = function(fish){
			SingleFactory.saveDraft(fish).success( function(){
				console.log('success');
			});
		};

		$scope.publish = function(fish){
			SingleFactory.publish(fish);
		};

	}])

}());