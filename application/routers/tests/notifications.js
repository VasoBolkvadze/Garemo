var express = require('express'),
	notificator = require('../../core/notificator');

module.exports = (function () {
	var router = express.Router();
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
	return router;
})();