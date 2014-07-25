function axaliLicenziaCtrl($scope, $modal, $http) {
	var onHttpError = function (data, status) {
		alert("მოხდა შეცდომა მონაცემების გაცვლისას!");
		console.log('status:' + status);
		console.log(data);
	};
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
	attachmentNames.forEach(function (attName) {
		$scope[attName] = [];
	});
	$scope.licenzia = emptyLicenzia;
	$scope.carmoqmnisSafudzvlebi = null;
	$scope.gauqmebisSafudzvlebi = null;
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
	$scope.open = function () {
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
		licenzia.carmoqmnisSafudzveli = carmoqmnisSafudzvlebi
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
		licenzia.gauqmebisSafudzveli = gauqmebisSafudzvlebi
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
			url: "/operatori/licenziebi/axali",
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
				attachments: attachmentNames
					.map(function (attName) {
						return {
							name: attName,
							files: $scope[attName]
						};
					})
			}
		}).success(function (data, status, headers, config) {
			if (data.success)
				window.location = data.redirectUrl;
			else
				onHttpError(data, status);
		}).error(onHttpError);
	};
	$http.get('/api/operatori/get/carmoqmnisDaGauqmebisSafudzvlebi')
		.success(function (data) {
			$scope.gauqmebisSafudzvlebi = data.gauqmebisSafudzvlebi;
			$scope.carmoqmnisSafudzvlebi = data.carmoqmnisSafudzvlebi;
		})
		.error(onHttpError);
}

var emptyLicenzia = {
	licenziantisMonacemebi: {
		dasaxeleba: null,
		pid: null,
		faktMisamarti: null,
		iurMisamarti: null,
		tel: null,
		mail: null
	},
	carmomadgeneli: {
		pid: null,
		saxeli: null,
		gvari: null,
		tel: null,
		mail: null
	},
	informaciaObiektisShesaxeb: {
		resursebi: [
			{
				dasaxeleba: null,
				raodenoba: null,
				uom: null,
				gamokenebisSfero: null
			}
		],
		regioni: null,
		municipaliteti: null,
		dasaxlebuliPunkti: null,
		fartobiUom: null,
		fartobi: null
	},
	informaciaLicenziisShesaxeb: {
		nomeri: null,
		gacemisTarigi: null,
		brdzanebisNomeri: null,
		brdzanebisTarigi: null,
		moqmedebisVada: null,
		salicenzioPirobebi: null,
		statusi: {
			mnishvneloba: null,
			safudzveli: null
		}
	},
	damatebitiInformacia: {
		regulirebisGadamxdeli: 'კი',
		a: {mnishvneloba: null, uom: ''},
		b: {mnishvneloba: null, uom: ''},
		c1: {mnishvneloba: null, uom: ''},
		c2: {mnishvneloba: null, uom: ''},
		p: {mnishvneloba: null, uom: ''}
	},
	carmoqmnisSafudzveli: null,
	gauqmebisSafudzveli: null
};