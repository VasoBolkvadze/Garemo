function editLicenziaCtrl($scope, $http, $modal) {
	var attachmentNames = [
		'licenziantisMonacemebi/mibmuliFailebi',
		'informaciaLicenziisShesaxeb/mibmuliFailebi',
		'damatebitiInformacia/ruqa',
		'damatebitiInformacia/atvisebisGegma',
		'damatebitiInformacia/geoSainformacioPaketi',
		'carmoqmnisSafudzveli/mibmuliFailebi',
		'gauqmebisSafudzveli/mibmuliFailebi',
		'informaciaLicenziisShesaxeb/statusi/safudzveli'
	];
	$scope.licenzia = null;
	$scope.gauqmebisSafudzvlebi = [];
	$scope.carmoqmnisSafudzvlebi = [];
	var onHttpError = function (response) {
		alert('მოხდა შეცდომა!');
		console.log('status:' + response.data.status);
		console.log(response.data);
	};
	attachmentNames.forEach(function (attName) {
		$scope[attName] = [];
	});
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
	var licenziisId = $('[name="licenziisId"]').val();
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
		licenzia.carmoqmnisSafudzveli = $scope.carmoqmnisSafudzvlebi
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
			}
			, {});
		licenzia.gauqmebisSafudzveli = $scope.gauqmebisSafudzvlebi
			.reduce(function (m, v) {
				if (v.active) {
					m.title = v.title;
					m.name = v.name;
					v.data
						.forEach(function (field) {
							if (field.type != 'file')
								m[field.name] = field.value;
						});
				}
				return m;
			}
			, {});
		$http({
			method: 'POST',
			url: "/api/operatori/licenziebi/"+licenziisId+"/update",
			headers: { 'Content-Type': undefined },
			transformRequest: function (data) {
				var formData = new FormData();
				formData.append("model", angular.toJson(data.model));
				data.attachments.forEach(function (att) {
					if (!att.files.length)
						formData.append(att.name + '_' + 0, 'EMPTY');
					for (var i = 0; i < att.files.length; i++) {
						formData.append(att.name + '_' + i, att.files[i]);
					}
				});
				return formData;
			},
			data: {
				model: licenzia,
				attachments: attachmentNames
					.map(function (attName) {
						return {
							name: attName,
							files: $scope[attName]
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
	$http.get('/api/operatori/licenziebi/byId/' + licenziisId)
		.then(function (response) {
			$scope.licenzia = response.data;
			return $http.get('/api/operatori/get/carmoqmnisDaGauqmebisSafudzvlebi');
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
		}, onHttpError);
}