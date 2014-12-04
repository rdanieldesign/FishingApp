(function(){

	angular.module('FishingApp')

	.factory('UserFactory', ['$http', 'P_HEADERS', '$cookieStore', '$rootScope', '$location', '$routeParams', function($http, P_HEADERS, $cookieStore, $rootScope, $location, $routeParams){

		var userURL = 'https://api.parse.com/1/users/';
		var loginURL = 'https://api.parse.com/1/login/?';
		var currentURL = 'https://api.parse.com/1/users/me/';
		var catchURL = 'https://api.parse.com/1/classes/catches/';
		var filesURL = 'https://api.parse.com/1/files/';

		var currentFile;

		var watchFileInput = function(){
			// Upload new user avatar
			$('#avatarUpload').bind('change', function(e) {
				var files = e.target.files || e.dataTransfer.files;
				// Our file var now holds the selected file
				currentFile = files[0];
				console.log(currentFile);
			});
		};

		var registerUser =  function(user){
			return $http.post(userURL, {
				'username': user.username,
				'password': user.password
				// 'avatar': data.url,
				// 'name': user.name
			}, P_HEADERS);
		};

		var updateUser = function(user){
			var currentFileURL = filesURL + currentFile.name;
			// Set catches' user
			var currentUser = $cookieStore.get('currentUser');
			console.log(currentUser);
			return $http.post(currentFileURL, currentFile, {
				headers: {
					'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
					'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
					'Content-Type': currentFile.type
				}
			},
			{
				processData: false,
				contentType: false,
			}).
			success(function(data){
				// Set Catch Image
				var picURL = data.url;
				$http.put(userURL + currentUser.objectId, {
					"avatar": picURL,
					"name": user.name
				}, {
					headers: {
					'X-Parse-Application-Id': 'gKGgerF26AzUsTMhhm9xFnbrvZWoajQHbFeu9B3y',
					'X-Parse-REST-API-Key': 'SVkllrVLa4WQeWhEHAe8CAWbp60zAfuOF0Nu3fHn',
					'X-Parse-Session-Token': currentUser.sessionToken,
					'Content-Type': 'application/json'
					}
				}).success(function(){
					$cookieStore.remove('currentUser');
					$cookieStore.put('currentUser', user);
					$location.path('/');
				});
			});
		};

		var newUser = function(user){
			var params = 'username='+user.username+'&password='+user.password;
			return $http.get(loginURL + params, P_HEADERS)
			.success( function(user){
				$cookieStore.remove('currentUser');
				$cookieStore.put('currentUser', user);
				$location.path('/me/' + user.objectId);
			});
		};

		var loginUser = function(user){
			var params = 'username='+user.username+'&password='+user.password;
			$http.get(loginURL + params, P_HEADERS)
			.success( function(user){
				$cookieStore.remove('currentUser');
				$cookieStore.put('currentUser', user);
				$location.path('/');
			}).error( function(){
				alert('Incorrect credentials.');
			});
		};

		logout = function () {
			$cookieStore.remove('currentUser');
			return checkUser();
		};



		var checkUser = function (user) {
			$rootScope.currentUser =  $cookieStore.get('currentUser');
			if($rootScope.currentUser === undefined){
				$location.path('/login');
			}
		};

		// Load the current user's posts
		var loadUserPublished = function(){
			var user = $cookieStore.get('currentUser');
			var params = '?where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}, "status":"published"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		var getRiverCatches = function(){
			var params = '?where={"$relatedTo":{"object":{"__type":"Pointer","className":"rivers","objectId":"'+ riverID +'"},"key":"catches"}}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		// Load the current user's posts
		var loadUserDrafts = function(user){
			var user = $cookieStore.get('currentUser');
			var params = '?where={"user":{"__type":"Pointer","className":"_User","objectId":"'+ user.objectId +'"}, "status":"draft"}';
			return $http.get(catchURL + params, P_HEADERS);
		};

		return {
			registerUser: registerUser,
			loginUser: loginUser,
			logout: logout,
			checkUser: checkUser,
			loadUserPublished: loadUserPublished,
			loadUserDrafts: loadUserDrafts,
			watchFileInput: watchFileInput,
			newUser: newUser,
			updateUser: updateUser
		}

	}]);

}());