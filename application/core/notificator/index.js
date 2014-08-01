var helpers = require('../../utils/helpers'),
	debug = require('debug')('notificator'),
	uuid = require('node-uuid');

var instance = null;

function Notificator(io) {
	debug('init');
	instance = this;
	var me = this;
	var registry;
	this.registry = registry = new Dictionary();
	this.onlineSockets = [];

	io.on('connection', function (socket) {
		socket.on('userConnected', function (username) {
			socket.username = username;
			me.onlineSockets.push(socket);
			var userPage;
			if (!registry.exists(username)) {
				userPage = new UserPage(username);
				userPage.goOnline();
				registry.add(username, userPage);
			}
			else {
				userPage = registry.get(username);
				userPage.goOnline();
				setTimeout(function () {
					socket.emit('initialNotifications', {
							unreadItemsCount: userPage.getUnreadsCount(),
							items: userPage.getInitialList()
						}
						, function (ids) {
							userPage.markUnsentsAsSent(ids);
						});
				}, 100);
			}
			debug('user connected.', username);
			debug('active sockets.', me.onlineSockets.map(function (sckt) {
				return sckt.username;
			}));
		});
		socket.on('disconnect', function () {
			if (registry.exists(socket.username)) {
				var userPage = registry.get(socket.username);
				userPage.goOffline();
			}
			var i = me.onlineSockets.indexOf(socket);
			me.onlineSockets.splice(i, 1);
			debug('user disconnected.', socket.username);
			debug('active sockets.', me.onlineSockets.map(function (sckt) {
				return sckt.username;
			}));
		});
		socket.on('userSeenUnreadNotifications', function (ids, cb) {
			var userPage = registry.get(socket.username);
			ids.forEach(function (id) {
				userPage.markNotificationAsRead(id);
			});
			setTimeout(function () {
				socket.emit('notificationsBecomeRead', ids);
				cb();
			}, 2000);
		});
	});

	setInterval(function () {
			me.onlineSockets
				.forEach(function (socket) {
					if (me.registry.exists(socket.username)) {
						var userPage = me.registry.get(socket.username);
						if (userPage.hasItemsThatCanBeSent()) {
							var items = userPage.getUnsentsThatAreReadyForSending();
							socket.emit('newNotifications', {
									count: userPage.getUnreadsCount(),
									items: items
								}
								, function (ids) {
									userPage.markUnsentsAsSent(ids);
								});
						}
					}
				});
		}
		, 1000);
}

module.exports.Notificator = Notificator;

module.exports.registerNotification = function (recipient, sendOn, msg) {
	var notification = new Notification(recipient, sendOn, msg);
	debug('registering new notification:', notification);
	var userPage;
	if (!instance.registry.exists(recipient)) {
		userPage = new UserPage(recipient);
		userPage.goOffline();
		instance.registry.add(recipient, userPage);
	} else {
		userPage = instance.registry.get(recipient);
	}
	userPage.addNotification(notification);
	debug('new notification registered', userPage.notifications);
};


function UserPage(username) {
	var me = this;
	this.online = false;
	this.username = username;
	this.notifications = [];
	this.addNotification = function (not) {
		me.notifications.push(not);
	};
	this.markUnsentsAsSent = function (ids) {
		ids.forEach(function (id) {
			var n = me.getNotificationById(id);
			n.markAsSent();
		});
	};
	this.markNotificationAsRead = function (id) {
		var not = me.getNotificationById(id);
		if (not)
			not.markAsRead();
	};
	this.getNotificationById = function (id) {
		for (var i = 0; i < me.notifications.length; i++) {
			var not = me.notifications[i];
			if (not.id == id)
				return not;
		}
		return null;
	};
	//2014-07-23T04:10:20+04:00
	this.hasItemsThatCanBeSent = function () {
		for (var i = 0; i < me.notifications.length; i++) {
			var n = me.notifications[i];
			debug('hasItemsThatCanBeSent: result is',!n.wasSent && n.readyToSend());
			debug('wasSent is',n.wasSent);
			if (!n.wasSent && n.readyToSend())
				return true;
		}
		return false;
	};
	this.getUnsentsThatAreReadyForSending = function () {
		return me.notifications
			.filter(function (n) {
				return !n.wasSent && n.readyToSend();
			}).map(function (n) {
				return {
					id: n.id,
					message: n.message,
					unread: n.unread,
					when: n.dateCreated.timeSince()
				};
			});
	};
	this.getUnreadsCount = function () {
		return me.notifications
			.filter(function (n) {
				return n.unread && n.readyToSend();
			}).length;
	};

	this.getInitialList = function () {
		var last10Seen = me.notifications
			.slice()
			.reverse()
			.filter(function (n) {
				return !n.unread;
			})
			.slice(0, 10)
			.reverse()
			.map(function (n) {
				return {
					id: n.id,
					message: n.message,
					unread: n.unread,
					when: n.dateCreated.timeSince()
				};
			});
		var unreads = me.notifications
			.slice()
			.reverse()
			.filter(function (n) {
				return n.unread && n.readyToSend();
			})
			.reverse()
			.map(function (n) {
				return {
					id: n.id,
					message: n.message,
					unread: n.unread,
					when: n.dateCreated.timeSince()
				};
			});
		return last10Seen.concat(unreads);
	};
	this.goOnline = function () {
		me.online = true;
	};
	this.goOffline = function () {
		me.online = false;
	};
}


//Notification
function Notification(recipient, sendOn, msg) {
	var me = this;
	this.id = uuid.v4();
	this.recipient = recipient;
	this.message = msg;
	var parsedSendOn = Date.parse(sendOn);
	this.sendOn = isNaN(parsedSendOn) ? sendOn : new Date(parsedSendOn);
	this.unread = true;
	this.dateCreated = new Date();
	this.wasSent = false;
	this.markAsSent = function () {
		me.wasSent = true;
	};
	this.markAsRead = function () {
		me.unread = false;
	};
	this.readyToSend = function () {
		debug('checking notification ready to send');
		var now = new Date();
		debug('current date is ',now);
		debug('sendOn is type of ',Object.prototype.toString.call(me.sendOn) === "[object Date]" ? 'date' : 'xz');
		debug('sendOn is less than now ',me.sendOn < now);
		if (Object.prototype.toString.call(me.sendOn) === "[object Date]")
			return me.sendOn < now;
		else
			return me.sendOn === 'instantly';
	};
}
//Dictionary
function Dictionary() {
	var me = this;
	this.data = {};
	this.exists = function (key) {
		return me.get(key) != null;
	};
	this.add = function (key, val) {
		me.data[key] = val;
	};
	this.get = function (key) {
		return me.data[key];
	};
	this.toArray = function () {
		var results = [];
		for (var key in me.data) {
			if (me.data.hasOwnProperty(key)) {
				var result = {};
				result.key = key;
				var value = me.data[key];
				for (var k in value) {
					if (value.hasOwnProperty(k))
						result[k] = value[k];
				}
				results.push(result);
			}
		}
		return results;
	};
}