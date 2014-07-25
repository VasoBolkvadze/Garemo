function atvisebisGegmaCtrl($scope, $http) {
	var handleHttpError = function (data, status) {
		alert('მოხდა შეცდომა მონაცემების გაცვლისას!');
		console.log('status:' + status);
		console.log(data);
	};
	$scope.atvisebisGegmaColumns = [];
	$scope.gegmaItems = [
		{celi: '', odenoba: 0}
	];
	$scope.addAtvisebisGegmaColumn = function () {
		$scope.atvisebisGegmaColumns.push({});
	};
	$scope.addGegmaItem = function () {
		$scope.gegmaItems.push({celi: '', odenoba: 0});
	};
	$scope.removeGegmaItem = function (gi) {
		var i = $scope.gegmaItems.indexOf(gi);
		$scope.gegmaItems.splice(i, 1);
	};
	$scope.submit = function () {
		$http.post('', {chanacerebi: $scope.gegmaItems})
			.success(function (data, status) {
				if(data.success)
					window.location = data.redirectUrl;
				else
					handleHttpError(data,status);
			})
			.error(handleHttpError);
	}
}