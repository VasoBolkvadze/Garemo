var user = require('../core/user');

module.exports.declare = function (router) {
	router.get('/'
		, user.mustBe('authorized')
		, function (req, res, next) {
			res.render('home');
		});
};