var express = require('express'),
	jade = require('jade'),
	path = require('path'),
	controllers = require('../controllers');

module.exports.init = function (app) {
	var router = express.Router();
	router.get('/login', controllers.authorization.views.login);
	router.post('/login', controllers.authorization.api.login);
	router.get('/logout', user.mustBe('authorized'), controllers.authorization.api.logout);
	router.get('/', user.mustBe('authorized'), controllers.main.views.home);

	router.get('/operatori/licenziebi'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.sia);
	router.get('/operatori/licenziebi/suggestions'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.suggestions);
	router.get('/operatori/licenziebi/axali'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.axali);
	router.post('/operatori/licenziebi/axali'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.save);

	router.get('/operatori/licenziantebi/angarishebi'
		, user.mustBe('role/operatori')
		, controllers.licenziantebi.views.angarishebisSia);
	router.get('/operatori/licenziantebi/angarishebi/suggestions'
		, user.mustBe('role/operatori')
		, controllers.licenziantebi.views.angarishebisSiaSuggestions);
	router.get('/operatori/licenziantebi/angarishebi/:pid'
		, user.mustBe('role/operatori')
		, controllers.licenziantebi.views.angarishiDetail);
	router.post('/operatori/licenziantebi/angarishebi/:pid/generatePassword'
		, user.mustBe('role/operatori')
		, controllers.licenziantebi.api.generatePassword);

	router.post('/createNotification', function (req, res, next) {
		var notificator = require('../notificator');
		var debug = require('debug')('createNotification');
		var recipient = req.body['for'];
		var sendOn = req.body.sendWhen;
		var msg = req.body.message;
		debug(req.body);
		notificator.registerNotification(recipient, sendOn, msg);
		res.end();
	});

	router.get('/templates/:subdir/:tpl', function (req, res) {
		res.render(req.params.subdir + '/' + req.params.tpl
			, {}
			, function (err, html) {
				res.send(html);
			});
	});
	app.use(router);
};


var user = {
	mustBe: function (roleId) {
		if (roleId == 'authorized') {
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
				if (req.user.roleId === roleId)
					next();
				else
					res.render('error', {message: 'access denied!', error: {}});
			}
		}
	}
};