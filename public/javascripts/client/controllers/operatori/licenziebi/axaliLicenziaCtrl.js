function axaliLicenziaCtrl($scope, $modal, $http) {
	//local functions
	var onHttpError = function (response, status) {
		alert("მოხდა შეცდომა მონაცემების გაცვლისას!");
		console.log('status:' + status);
		console.log(response);
	};
	var extractActiveSafudzveli = function (safudzvlebi) {
		return safudzvlebi
			.reduce(function (m, v) {
				if (v.active) {
					m.title = v.title;
					m.name = v.name;
					v.data.forEach(function (field) {
						if (field.type != 'file')
							m[field.name] = field.value;
					});
				}
				return m;
			}, {})
	};
	//scope variables
	$scope.attachmentPropertyNames = null;
	$scope.licenzia = null;
	$scope.carmoqmnisSafudzvlebi = null;
	$scope.gauqmebisSafudzvlebi = null;
	//scope functions
	$scope.addResursi = function () {
		$scope.licenzia
			.informaciaObiektisShesaxeb
			.resursebi
			.push({dasaxeleba: null, raodenoba: null, uom: null, gamokenebisSfero: null});
	};
	$scope.removeResursi = function (res) {
		var i = $scope.licenzia
			.informaciaObiektisShesaxeb
			.resursebi
			.indexOf(res);
		$scope.licenzia
			.informaciaObiektisShesaxeb
			.resursebi
			.splice(i, 1);
	};
	$scope.$on("fileSelected", function (event, args) {
		$scope.$apply(function () {
			$scope[args.inputName].push(args.file);
		});
	});
	$scope.openCarmomadgeneliDialog = function () {
		var modalInstance = $modal.open({
			templateUrl: '/templates/operatori/licenziebi/carmomadgeneli.jade',
			controller: 'carmomadgeneliCtrl',
			resolve: {
				carmomadgeneli: function () {
					return $scope.licenzia.carmomadgeneli;
				}
			}
		});
		modalInstance
			.result
			.then(function (carmomadgeneli) {
				$scope.licenzia.carmomadgeneli = carmomadgeneli;
			});
	};
	$scope.submit = function () {
		var licenzia = angular.copy($scope.licenzia);
		licenzia.carmoqmnisSafudzveli = extractActiveSafudzveli($scope.carmoqmnisSafudzvlebi);
		licenzia.gauqmebisSafudzveli = extractActiveSafudzveli($scope.gauqmebisSafudzvlebi);
		$http({
			method: 'POST',
			url: '/operatori/api/licenziebi/create',
			headers: { 'Content-Type': undefined },
			transformRequest: function (data) {
				var formData = new FormData();
				formData.append("model", angular.toJson(data.model));
				data.attachments.forEach(function (att) {
					for (var i = 0; i < att.files.length; i++) {
						formData.append(att.name + '_' + i, att.files[i]);
					}
				});
				return formData;
			},
			data: {
				model: licenzia,
				attachments: $scope.attachmentPropertyNames
					.map(function (propertyName) {
						return {
							name: propertyName,
							files: $scope[propertyName]
						};
					})
			}
		}).success(function (response, status) {
			if (response.success)
				window.location = response.redirectUrl;
			else
				onHttpError(response, status);
		}).error(onHttpError);
	};
	//data request
	$http.get('/operatori/api/licenziebi/getSourceData/forAxaliLicenziaCtrl')
		.success(function (response, status) {
			if (response.success) {
				$scope.licenzia = response.data.emptyLicenzia;
				$scope.gauqmebisSafudzvlebi = response.data.gauqmebisSafudzvlebi;
				$scope.carmoqmnisSafudzvlebi = response.data.carmoqmnisSafudzvlebi;
				$scope.attachmentPropertyNames = response.data.attachmentPropertyNames;
				$scope.attachmentPropertyNames
					.forEach(function (propertyName) {
						$scope[propertyName] = [];
					});
			}
			else
				onHttpError(response, status);
		})
		.error(onHttpError);
}
