var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

module.exports.init = function () {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function (id, done) {
		findUserById(id, function (err, user) {
			done(err, user);
		});
	});
	passport.use('local-login', new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req, username, password, done) {
			process.nextTick(function () {
				findUserByUsername(username, function (err, user) {
					if (err)
						return done(err);
					if (!user)
						return done(null, false, req.flash('loginMessage', 'მომხმარებელი არ მოიძებნა'));
					if (user.password != password)
						return done(null, false, req.flash('loginMessage', 'პაროლი არასწორია!'));
					else
						return done(null, user);
				});
			});
		}));
};

function findUserByUsername(username, done) {
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		if (user.username == username)
			return done(null, user);
	}
	return done(null, null);
}
function findUserById(id, done) {
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		if (user.id == id)
			return done(null, user);
	}
	return done(null, null);
}

var users = [
	{
		id: 1,
		username: 'v@b',
		password: '1',
		role: 'admin',
		menu: [
			{
				heading: 'ლიცენზიები',
				url: undefined,
				children: [
					{
						heading: 'სია',
						url: '/admin/licenziebi'
					},
					{
						heading: 'ახალი',
						url: '/admin/licenziebi/axali'
					}
				]
			},
			{
				heading: 'ათვისების გეგმები',
				url: '/admin/atvisebisGegmebi',
				children: []
			}
		]
	},
	{
		id: 2,
		username: 'm@q',
		password: '1',
		role: 'licenzianti',
		menu: [
			{
				heading: 'ჩემი ლიცენზიები',
				url: '/licenzianti/licenziebi',
				children: []
			},
			{
				heading: 'ლიცენზიის გააქტიურება',
				url: '/licenzianti/licenziisGaaktiureba',
				children: []
			}
		]
	}
];