function bottomNavbarCtrl($scope, $socket, authorizedUser) {
	$scope.unreadItemIds = [];
	$scope.unreadItemsCount = 0;
	$scope.openPopup = function () {
		$socket.emit('userSeenUnreadNotifications'
			, $scope.unreadItemIds
			, function () {
				$scope.unreadItemsCount = 0;
				$scope.unreadItemIds = [];
			});
	};
	$socket.on('initialNotifications', function (data) {
		$scope.unreadItemsCount = data.unreadItemsCount;
		data.items
			.forEach(function (item) {
				if (item.unread)
					$scope.unreadItemIds.push(item.id);
			});
	});
	$socket.on('newNotifications', function (data) {
		$scope.unreadItemsCount = data.count;
		data.items
			.forEach(function (item) {
				if (item.unread)
					$scope.unreadItemIds.push(item.id);
			});
	});
}