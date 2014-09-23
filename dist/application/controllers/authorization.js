var	user = require('../core/user'),
	passport = require('passport');

module.exports.declare = function (router) {
	router.get('/login', function (req, res, next) {
		res.render('login', { message: req.flash('loginMessage') });
	});
	router.post('/login', function (req, res, next) {
		passport.authenticate('local-login', {
			successRedirect: '/',
			failureRedirect: '/login',
			failureFlash: true
		})(req, res, next);
	});
	router.get('/logout'
		, user.mustBe('authorized')
		, function (req, res, next) {
			req.logout();
			res.redirect('/');
		});
};