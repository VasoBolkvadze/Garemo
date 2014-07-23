function homeCtrl($scope, $http) {
	var counter = 1;
	$scope.data = {
		'for':'vaso',
		sendWhen:'instantly',
		message:'Hello Sir.'
	};
	$scope.response = null;
	$scope.create = function () {
		$scope.data.message += ' '+counter;
		counter++;
		$http.post('/createNotification', $scope.data)
			.success(function (data, status) {
				console.log('createNotification Callback');
				$scope.response = 'status:' + status + ' data:' + JSON.stringify(data);
			})
			.error(function (data, status) {
				$scope.response = 'status:' + status + ' data:' + JSON.stringify(data);
			});
	};
}