var express = require('express'),
	jade = require('jade'),
	path = require('path'),
	controllers = require('../controllers');

module.exports.init = function (app) {
	var router = express.Router();

	// ROLE : CONTROLLER

	// ANY : main
	router.get('/', user.mustBe('authorized'), controllers.main.views.home);

	// ANY : authorization
	router.get('/login', controllers.authorization.views.login);
	router.post('/login', controllers.authorization.api.login);
	router.get('/logout', user.mustBe('authorized'), controllers.authorization.api.logout);

	//operatori : licenziebi
	router.get('/operatori/licenziebi'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.views.sia);
	router.get('/operatori/licenziebi/suggestions'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.views.suggestions);
	router.get('/operatori/licenziebi/axali'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.views.axali);
	router.get('/operatori/licenziebi/:id'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.views.detail);
	router.post('/operatori/licenziebi/axali'
		, user.mustBe('role/operatori')
		, controllers.licenziebi.api.save);

	// operatori : licenziantebi
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

	//Notification Testing
	router.get('/createNotification',function(req,res,next){
		res.render('tests/newNotification');
	});
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

	// Template Compiler
	router.get('/templates/:subdir/:subsubdir/:tpl', function (req, res) {
		res.render(req.params.subdir + '/' + req.params.subsubdir + '/' + req.params.tpl
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