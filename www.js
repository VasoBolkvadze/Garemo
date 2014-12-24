var debug = require('debug')('www'),
    jsananda = require('jsananda'),
	socket = require('socket.io'),
	notificator = require('./application/core/notificator'),
	app = require('./application');

var server = app.listen(app.get('port'), function () {
	debug('Express server listening on port ' + server.address().port);
});

var io = socket.listen(server);
notificator.Notificator(io);