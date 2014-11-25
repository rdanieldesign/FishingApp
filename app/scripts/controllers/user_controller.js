(function(){

	angular.module('FishingApp')

	.controller('User', ['$scope', 'FIREBASE', '$firebaseAuth', function($scope, FIREBASE, $firebaseAuth){

		var userURL = new Firebase(FIREBASE);
		$scope.userAuth = $firebaseAuth(userURL);
		
		$scope.loginUser = function(user){
			$scope.userAuth.$authWithPassword({
					email: user.email,
					password: user.password
			}).then( function(){
				$('#loginForm')[0].reset();
			}).catch( function(error){
				alert(error.message);
			});
		};

		$scope.registerUser =  function(user){
			console.log(user);
			$scope.userAuth.$createUser(user.email, user.password)
				.then( function(){
					$scope.loginUser(user);
				}).catch(function(error){
					console.log('Error', error);
				});
		};

		$scope.checkUser = function(){
			var authData = $scope.userAuth.$getAuth();
			if(authData){
				console.log('User logged in as', authData.password.email)
			}
			else {
				console.log('Nobody logged in');
			}
		};

	}]);

}());