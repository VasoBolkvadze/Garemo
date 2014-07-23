var garemoApp = angular.module('garemoApp',[
	'ui.bootstrap',
	'ui.tinymce',
	'nsPopover'
]);


garemoApp.directive('fileUpload', function () {
	return {
		scope: true,
		link: function (scope, el, attrs) {
			el.bind('change', function (event) {
				var files = event.target.files;
				for (var i = 0;i<files.length;i++) {
					scope.$emit("fileSelected", { file: files[i], inputName:attrs.name });
				}
			});
		}
	};
});
garemoApp.factory('$socket', function ($rootScope) {
	var socket = io();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				console.log('socket on '+eventName);
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});