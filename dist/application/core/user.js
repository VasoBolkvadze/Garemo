module.exports =  {
	mustBe: function (role) {
		if (role == 'authorized') {
			return function (req, res, next) {
				if (req.isAuthenticated()) {
					return next();
				}
				res.redirect('/login');
			}
		} else {
			return function (req, res, next) {
				if (!req.isAuthenticated()) {
					res.redirect('/login');
					return;
				}
				if (req.user.roleId === ('role/' + role))
					next();
				else
					res.render('error', {message: 'access denied!', error: {}});
			}
		}
	}
};