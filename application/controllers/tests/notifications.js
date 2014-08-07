var notificator = require('../../core/notificator');

module.exports = function (router) {
	router.get('/createNotification', function (req, res, next) {
		res.render('tests/newNotification');
	});
	router.post('/createNotification', function (req, res, next) {
		var recipient = req.body['for'];
		var sendOn = req.body.sendWhen;
		var msg = req.body.message;
		notificator.registerNotification(recipient, sendOn, msg);
		res.end();
	});
};