var express = require('express'),
	jade = require('jade'),
	path = require('path'),
	controllers = require('../controllers');

module.exports.init = function (app) {
	var router = express.Router();

	// ROLE : CONTROLLER

	// ANY : main
	router.get('/', user.mustBe('authorized'), controller('main').action('views>home'));

	// ANY : authorization
	router.get('/login'
		, controller('authorization').action('views>login'));
	router.post('/login'
		, controller('authorization').action('api>login'));
	router.get('/logout'
		, user.mustBe('authorized'), controller('authorization').action('api>logout'));

	//operatori : licenziebi
	router.get('/operatori/licenziebi'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>sia'));

	router.get('/operatori/licenziebi/suggestions'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>suggestions'));

	router.get('/operatori/licenziebi/axali'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>axali'));

	router.get('/operatori/licenziebi/:id'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>detail'));

	router.get('/operatori/licenziebi/:id/korektireba'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>edit'));

	//TODO: '/operatori/licenziebi/axali' gaxdes '/api/operatori/licenziebi/axali'
	router.post('/operatori/licenziebi/axali'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>save'));

	router.post('/api/operatori/licenziebi/:id/update'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>update'));

	router.get('/api/operatori/licenziebi/byId/:id'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>licenziaById'));

	router.get('/api/operatori/get/carmoqmnisDaGauqmebisSafudzvlebi'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>getCarmoqmnisDaGauqmebisSafudzvlebi'));

	// operatori : licenziantebi
	router.get('/operatori/licenziantebi/angarishebi'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('views>angarishebisSia'));

	router.get('/operatori/licenziantebi/angarishebi/suggestions'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('views>angarishebisSiaSuggestions'));

	router.get('/operatori/licenziantebi/angarishebi/:pid'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('views>angarishiDetail'));

	router.post('/operatori/licenziantebi/angarishebi/:pid/generatePassword'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('api>generatePassword'));

	//operatori: atvisebis gegmebi
	router.get('/operatori/atvisebisGegmebi/:id'
		, user.mustBe('operatori')
		, controller('operatori/atvisebisGegmebi').action('views>detail'));

	//licenzianti : licenziebi
	router.get('/licenzianti/licenziebi'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>sia'));
	router.get('/licenzianti/licenziebi/gaaktiureba'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>gaaktiureba'));
	router.get('/licenzianti/licenziebi/:id'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>detail'));
	router.get('/licenzianti/licenziebi/:id/atvisebisGegma'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>atvisebisGegma'));
	router.post('/licenzianti/licenziebi/:id/atvisebisGegma'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('api>atvisebisGegmisCardgena'));
	router.post('/licenzianti/licenziebi/:id/gaaktiureba'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('api>gaaktiureba'));

	//Notification Testing
	router.get('/createNotification', function (req, res, next) {
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
	router.get('/templates/:subdir/:tpl', function (req, res) {
		res.render(req.params.subdir + '/' + req.params.tpl
			, {}
			, function (err, html) {
				res.send(html);
			});
	});

	app.use(router);
};

var controller = function (name) {
	var accessStr = '';
	var segments = name.split('/');
	segments.forEach(function (part) {
		accessStr+=part + '.';
	});
	accessStr = accessStr.substring(0,accessStr.length-1);
	return new CtrlWrapper(controllers.byString(accessStr));
};

function CtrlWrapper(ctrl) {
	var me = this;
	this.ctrl = ctrl;
	this.action = function (name) {
		var segments = name.split('>');
		for (var i = 0; i < segments.length; i++) {
			var sg = segments[i];
			me.ctrl = me.ctrl[sg];
		}
		return me.ctrl;
	};
}

var user = {
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