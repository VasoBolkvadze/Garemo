function editLicenziaCtrl($scope, $http, $modal) {
	//local variables
	var licenziisId = $('[name="licenziisId"]').val();
	//local functions
	var onHttpError = function (response) {
		alert('მოხდა შეცდომა!');
		console.log('status:' + response.data.status);
		console.log(response.data);
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
	$scope.gauqmebisSafudzvlebi = null;
	$scope.carmoqmnisSafudzvlebi = null;
	//scope functions
	$scope.removeFromArray = function (array, item) {
		var i = array.indexOf(item);
		array.splice(i, 1);
	};
	$scope.$on("fileSelected", function (event, args) {
		$scope.$apply(function () {
			$scope[args.inputName].push(args.file);
		});
	});
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
			url: '/operatori/api/licenziebi/' + licenziisId + '/update',
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
		}).success(function (data, status) {
			if (data.success)
				window.location = data.redirectUrl;
			else
				onHttpError({data: data, status: status});
		}).error(function (data, status) {
			onHttpError({data: data, status: status})
		});
	};
	//data request
	$http.get('/operatori/api/licenziebi/' + licenziisId)
		.then(function (response) {
			$scope.licenzia = response.data;
			return $http.get('/operatori/api/licenziebi/getSourceData/forEditLicenziaCtrl');
		}, onHttpError)
		.then(function (response) {
			$scope.gauqmebisSafudzvlebi = response.data.gauqmebisSafudzvlebi;
			$scope.carmoqmnisSafudzvlebi = response.data.carmoqmnisSafudzvlebi;
			response.data
				.gauqmebisSafudzvlebi
				.forEach(function (gauSaf) {
					if (gauSaf.name == $scope.licenzia.gauqmebisSafudzveli.name) {
						gauSaf.active = true;
						for (var i = 0; i < gauSaf.data.length; i++) {
							var dataItem = gauSaf.data[i];
							dataItem.value = $scope.licenzia.gauqmebisSafudzveli[dataItem.name];
						}
					}
				});
			response.data
				.carmoqmnisSafudzvlebi
				.forEach(function (carSaf) {
					if (carSaf.name == $scope.licenzia.carmoqmnisSafudzveli.name) {
						carSaf.active = true;
						for (var i = 0; i < carSaf.data.length; i++) {
							var dataItem = carSaf.data[i];
							if (dataItem.type != 'file')
								dataItem.value = $scope.licenzia.carmoqmnisSafudzveli[dataItem.name];
							else {
								dataItem.value = $scope.licenzia.carmoqmnisSafudzveli[dataItem.name.split('/')[1]]
							}
						}
					}
				});
			$scope.attachmentPropertyNames = response.data.attachmentPropertyNames;
			$scope.attachmentPropertyNames.forEach(function (propertyName) {
				$scope[propertyName] = [];
			});
		}, onHttpError);
}