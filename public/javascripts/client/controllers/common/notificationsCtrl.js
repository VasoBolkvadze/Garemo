function notificationsCtrl($scope, $socket, $sce) {
	$scope.items = [];
	$socket.on('initialNotifications', function (data, cb) {
		data.items.forEach(function (item) {
			$scope.items.unshift(item);
		});
		cb(data.items.map(function(n){return n.id;}));
	});
	$socket.on('newNotifications', function (data, cb) {
		data.items.forEach(function (item) {
			$scope.items.unshift(item);
		});
		cb(data.items.map(function(n){return n.id;}));
	});
	$socket.on('notificationsBecomeRead', function (ids) {
		ids.forEach(function (id) {
			var item = itemById(id, $scope.items);
			item.unread = false;
		});
	});
	$scope.renderMessage = function (htmlInjectedMessasge) {
		return $sce.trustAsHtml(htmlInjectedMessasge);
	};
}

function itemById(id, items) {
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.id == id)
			return item;
	}
	return null;
}