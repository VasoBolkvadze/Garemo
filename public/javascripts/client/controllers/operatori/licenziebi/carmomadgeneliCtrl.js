function carmomadgeneliCtrl($scope, $modalInstance,carmomadgeneli) {
	$scope.carmomadgeneli = carmomadgeneli;
	$scope.ok = function () {
		$modalInstance.close($scope.carmomadgeneli);
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}