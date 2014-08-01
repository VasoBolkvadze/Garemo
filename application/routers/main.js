var express = require('express'),
	user = require('../core/user');

module.exports = (function () {
	var router = express.Router();
	router.get('/'
		, user.mustBe('authorized')
		, function (req, res, next) {
			res.render('home');
		});
	return router;
})();