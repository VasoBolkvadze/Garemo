var passport = require('passport');

module.exports.views = {
	login: function(req, res) {
		res.render('login', { message: req.flash('loginMessage') });
	}
};

module.exports.api = {
	login: passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login',
		failureFlash : true
	}),
	logout: function(req, res) {
		req.logout();
		res.redirect('/');
	}
};