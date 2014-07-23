var passport = require('passport'),
	cfg = require('../../config'),
	store = require('nodeRaven')(cfg.dbUrl),
	LocalStrategy = require('passport-local').Strategy;

module.exports.init = function () {
	passport.serializeUser(function (user, done) {
		done(null, user['@metadata']['@id']);
	});
	passport.deserializeUser(function (id, done) {
		store.load('Licenzireba'
			, id
			, function(err,user){
				user = clearMetadataExtractId(user);
				store.load('Licenzireba'
					, user.roleId
					, function (err, role) {
						if (!err) {
							user.role = clearMetadataExtractId(role);
							done(null, user);
						} else
							done(err);
					});
			});
	});
	passport.use('local-login', new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req, username, password, done) {
			findUserByUsername(username, function (err, user) {
				if (err)
					return done(err);
				if (!user)
					return done(null, false, req.flash('loginMessage', 'მომხმარებელი არ მოიძებნა'));
				if (user.password != password)
					return done(null, false, req.flash('loginMessage', 'პაროლი არასწორია!'));
				else {
					done(null, user);
				}
			});
		}));
};

function findUserByUsername(username, done) {
	store.load('Licenzireba'
		, 'momxmarebeli/' + username
		, function (err, user) {
			if (!err) {
				done(null, user);
			}
			else if (err.message == '404') {
				done(null, null);
			}
			else
				done(err);
		});
}
function clearMetadataExtractId(doc){
	doc.id = doc['@metadata']['@id'];
	delete doc['@metadata'];
	return doc;
}