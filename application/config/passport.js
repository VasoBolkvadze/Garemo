var passport = require('passport'),
	cfg = require('../../config'),
	store = require('noderaven')(cfg.db.url),
	LocalStrategy = require('passport-local').Strategy;

module.exports.init = function () {
	passport.serializeUser(function (user, done) {
		done(null, user['@metadata']['@id']);
	});
	passport.deserializeUser(function (id, done) {
		store.load(cfg.db.name
			, id
			, function(err1,user){
				if(err1) return done(err1);
				user = clearMetadataExtractId(user);
				store.load(cfg.db.name
					, user.roleId
					, function (err2, role) {
						if(err2) return done(err2);
						user.role = clearMetadataExtractId(role);
						done(null, user);
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
	store.load(cfg.db.name
		, 'momxmarebeli/'+username
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