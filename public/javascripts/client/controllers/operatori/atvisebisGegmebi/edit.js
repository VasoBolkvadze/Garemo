function editCtrl($scope, $http) {
	var onHttpError = function (response, status) {
		alert("მოხდა შეცდომა მონაცემების გაცვლისას!");
		console.log('status:' + status);
		console.log(response);
	};
	var atvisebisGegmisId = $('[name="atvisebisGegmisId"]').val();
	$scope.atvisebisGegma = null;

	$scope.submit = function () {
		var url = '/operatori/atvisebisGegmebi/' + atvisebisGegmisId + '/korektireba';
		$http({
			method: 'POST',
			url: url,
			data: $scope.atvisebisGegma
		})
		.success(function (response, status) {
			if (response.success)
				window.location = response.redirectUrl;
			else
				onHttpError(response, status);
		})
		.error(onHttpError);
	};

	$http.get('/operatori/api/atvisebisGegmebi/' + atvisebisGegmisId)
		.success(function (response, status) {
			if (response.success)
				$scope.atvisebisGegma = response.data;
			else
				onHttpError(response, status);
		})
		.error(onHttpError);
}